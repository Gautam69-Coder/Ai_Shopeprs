import { Simulation } from '../models/Simulation.js';
import { Shopper } from '../models/Shopper.js';
import { executeChatCompletion } from './groqClient.js';
import { shopperEvaluationResponseSchema } from '../validators/simulationValidator.js';
import { evaluateSimulation } from './evaluationService.js';
import { RELIABILITY_CONFIG } from '../config/reliability.js';

// Neutral fallback for a shopper whose evaluation failed permanently
const buildFallbackResponse = (shopper) => ({
  shopperId: shopper._id,
  shopperName: shopper.name,
  shopperAge: shopper.age,
  shopperCity: shopper.city,
  shopperOccupation: shopper.occupation,
  shopperIncome: shopper.monthly_income,
  priceSensitivity: shopper.price_sensitivity,
  consideration: 'Persona assessment temporarily unavailable.',
  attractions: ['Evaluation pending'],
  concerns: ['Assessment incomplete'],
  reactionQuote: 'I need more time to review this product.',
  willingnessToPayFeedback: 'Price evaluation pending.',
});

/**
 * Evaluates a product from the perspective of an individual synthetic shopper persona.
 * Returns both the validated response and per-call usage telemetry.
 */
const evaluateShopperPersona = async ({ shopper, product }) => {
  const systemPrompt = `You are a consumer market simulation engine.
You must adopt and completely embody this fictional consumer persona:
- Name: ${shopper.name}
- Age: ${shopper.age} years old
- City: ${shopper.city}
- Occupation: ${shopper.occupation}
- Monthly Income: ₹${shopper.monthly_income}
- Price Sensitivity: ${shopper.price_sensitivity} (low/medium/high)
- Personal Interests: ${shopper.interests.join(', ')}
- Shopping Preferences: ${shopper.shopping_preferences.join(', ')}
- Personality Traits: ${shopper.personality_traits.join(', ')}
- Lifestyle Bio: "${shopper.bio}"

You will be presented with a product proposition. You must react authentically in character.
Consider your income vs the product price, your specific daily habits, and your personality traits.

RESPONSE REQUIREMENTS:
1. "consideration": A concise 1-2 sentence assessment of whether and why you would consider buying this product.
2. "attractions": An array of 2-3 specific features, benefits, or messaging angles that genuinely appeal to you.
3. "concerns": An array of 2-3 specific reservations, hesitations, or deal-breakers (price, lack of utility, competing habits, skepticism).
4. "reactionQuote": A natural, first-person statement in your voice expressing your immediate raw thought.
5. "willingnessToPayFeedback": A realistic assessment of whether the price (₹${product.price}) feels fair, a bargain, or overpriced for your budget.

OUTPUT FORMAT: Return ONLY a valid JSON object matching:
{
  "consideration": "...",
  "attractions": ["...", "..."],
  "concerns": ["...", "..."],
  "reactionQuote": "...",
  "willingnessToPayFeedback": "..."
}`;

  const userPrompt = `Evaluate this product proposition:
Product Name: ${product.name}
Category: ${product.category}
Price: ₹${product.price} (${product.currency || 'INR'})
Description & Features:
${product.description}
${product.adCopy ? `\nMarketing Pitch / Ad Copy:\n"${product.adCopy}"` : ''}

Provide your structured consumer evaluation in valid JSON.`;

  const { content: rawJson, usage } = await executeChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error(`[SimulationEngine] Failed to parse JSON for shopper ${shopper.name}:`, rawJson);
    throw new Error(`Invalid JSON received for shopper ${shopper.name}: ${err.message}`);
  }

  const validated = shopperEvaluationResponseSchema.safeParse(parsed);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    console.error(`[SimulationEngine] Schema validation failed for shopper ${shopper.name}:`, issues);
    throw new Error(`Evaluation schema mismatch for ${shopper.name}: ${issues}`);
  }

  return {
    response: {
      shopperId: shopper._id,
      shopperName: shopper.name,
      shopperOccupation: shopper.occupation,
      shopperCity: shopper.city,
      shopperAge: shopper.age,
      shopperIncome: shopper.monthly_income,
      priceSensitivity: shopper.price_sensitivity,
      ...validated.data,
    },
    usage,
  };
};

/**
 * Runs a product simulation across all synthetic shoppers in a batch cohort.
 * Phase 6 upgrades:
 *  - Configurable concurrency (RELIABILITY_CONFIG.maxConcurrentLlmCalls)
 *  - Inter-batch delay to reduce API burst load
 *  - Partial failure tolerance via Promise.allSettled + neutral fallback
 *  - Per-simulation token / cost telemetry persisted to MongoDB
 *
 * @param {Object} params
 * @param {string} params.batchId - The batch ID of shoppers to evaluate against
 * @param {Object} params.product - Product details
 * @returns {Promise<Object>} The saved simulation document with all evaluations
 */
export const runSimulation = async ({ batchId, product }) => {
  console.log(`[SimulationEngine] Fetching shoppers for cohort batch ${batchId}...`);
  const shoppers = await Shopper.find({ batchId });

  if (!shoppers || shoppers.length === 0) {
    throw new Error(`No synthetic shoppers found for cohort batch ID: ${batchId}`);
  }

  console.log(`[SimulationEngine] Simulating product reactions across ${shoppers.length} shopper(s)...`);

  const { maxConcurrentLlmCalls, interBatchDelayMs } = RELIABILITY_CONFIG;
  const results = [];

  // Per-simulation telemetry accumulator
  const simTelemetry = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
    durationMs: 0,
    retriesCount: 0,
  };

  const simStart = Date.now();

  for (let i = 0; i < shoppers.length; i += maxConcurrentLlmCalls) {
    const chunk = shoppers.slice(i, i + maxConcurrentLlmCalls);
    const chunkIndex = Math.floor(i / maxConcurrentLlmCalls) + 1;
    console.log(`[SimulationEngine] Processing chunk ${chunkIndex} (${chunk.length} shopper(s))...`);

    // Partial-failure tolerant: rejected promises become fallback entries
    const settled = await Promise.allSettled(
      chunk.map((shopper) => evaluateShopperPersona({ shopper, product }))
    );

    for (let idx = 0; idx < settled.length; idx++) {
      const outcome = settled[idx];
      const shopper = chunk[idx];

      if (outcome.status === 'fulfilled') {
        const { response, usage } = outcome.value;
        results.push(response);

        // Accumulate telemetry
        simTelemetry.promptTokens += usage.promptTokens;
        simTelemetry.completionTokens += usage.completionTokens;
        simTelemetry.totalTokens += usage.totalTokens;
        simTelemetry.estimatedCostUsd += usage.estimatedCostUsd;
        simTelemetry.retriesCount += usage.retryCount;
      } else {
        console.warn(
          `[SimulationEngine] Partial failure for shopper "${shopper.name}": ${outcome.reason?.message}. Using neutral fallback.`
        );
        results.push(buildFallbackResponse(shopper));
      }
    }

    // Inter-batch delay (skip after the last chunk)
    if (i + maxConcurrentLlmCalls < shoppers.length) {
      await new Promise((r) => setTimeout(r, interBatchDelayMs));
    }
  }

  simTelemetry.durationMs = Date.now() - simStart;

  console.log(`[SimulationEngine] All evaluations gathered. Persisting simulation to MongoDB...`);

  const simulationDoc = new Simulation({
    batchId,
    product: {
      name: product.name,
      category: product.category,
      price: product.price,
      currency: product.currency || 'INR',
      description: product.description,
      adCopy: product.adCopy || '',
    },
    shopperCount: results.length,
    status: 'completed',
    responses: results,
    telemetry: simTelemetry,
  });

  const savedSimulation = await simulationDoc.save();
  console.log(`[SimulationEngine] Simulation ${savedSimulation._id} saved. Tokens: ${simTelemetry.totalTokens} | Cost: $${simTelemetry.estimatedCostUsd.toFixed(6)}`);

  // Phase 4: Automatically run AI classification & cohort synthesis
  try {
    console.log(`[SimulationEngine] Running Phase 4 AI classification pipeline for ${savedSimulation._id}...`);
    const evaluated = await evaluateSimulation(savedSimulation._id);
    return evaluated;
  } catch (evalErr) {
    console.warn(`[SimulationEngine] Auto-evaluation warning: ${evalErr.message}. Returning raw simulation.`);
    return savedSimulation;
  }
};

/**
 * Retrieves all saved simulation runs
 */
export const getSimulations = async () => {
  const simulations = await Simulation.find()
    .select('batchId product shopperCount status evaluationSummary telemetry createdAt updatedAt')
    .sort({ createdAt: -1 })
    .limit(30);
  return simulations;
};

/**
 * Deletes all simulation runs from MongoDB
 */
export const deleteAllSimulations = async () => {
  const result = await Simulation.deleteMany({});
  return { deletedCount: result.deletedCount };
};

/**
 * Retrieves a single simulation with full nested responses
 */
export const getSimulationById = async (id) => {
  const simulation = await Simulation.findById(id);
  if (!simulation) {
    throw new Error(`Simulation with ID ${id} not found.`);
  }
  return simulation;
};
