import { Simulation } from '../models/Simulation.js';
import { executeChatCompletion } from './groqClient.js';
import {
  shopperClassificationSchema,
  cohortSynthesisSchema,
} from '../validators/evaluationValidator.js';

/**
 * Classifies an individual shopper's purchase intention into Definitely Yes / Maybe / No
 */
const classifyShopperReaction = async ({ response, product }) => {
  const systemPrompt = `You are an expert consumer research and behavioral purchase intent analyst.
Analyze the qualitative feedback of this consumer persona and classify their purchase decision into strictly one of three categories:
- "Definitely Yes": High purchase likelihood. The product directly solves their problem, fits their budget/income, and attractions heavily outweigh concerns.
- "Maybe": Conditional or hesitant interest. Likes features but is stalled by price, routine, habit inertia, or specific doubts.
- "No": Low purchase likelihood. Rejection due to high relative price, lack of necessity, competing alternatives, or strong objections.

CRITICAL RULES:
1. "decision": Strictly one of: "Definitely Yes", "Maybe", "No".
2. "confidenceScore": Integer 0 to 100 representing how definitive this persona's verdict is.
3. "primaryPurchaseDriver": Concise 2-4 word theme describing what attracted them most.
4. "primaryObjectionCategory": Concise 2-4 word theme describing their chief blocker.
5. "keyPositiveReason": One concise sentence capturing why they would consider buying.
6. "keyConcernReason": One concise sentence capturing why they might hold back or reject.

Respond ONLY with valid JSON matching:
{
  "decision": "Definitely Yes",
  "confidenceScore": 85,
  "primaryPurchaseDriver": "Theme",
  "primaryObjectionCategory": "Theme",
  "keyPositiveReason": "Sentence...",
  "keyConcernReason": "Sentence..."
}`;

  const userPrompt = `Shopper Persona:
- Name: ${response.shopperName} (${response.shopperAge} yrs, ${response.shopperOccupation} in ${response.shopperCity})
- Monthly Income: ₹${response.shopperIncome} | Price Sensitivity: ${response.priceSensitivity}

Product Pitch:
- Name: ${product.name} (Category: ${product.category})
- Price: ₹${product.price}

Qualitative Reaction Provided by Persona:
- Consideration: "${response.consideration}"
- Quote: "${response.reactionQuote}"
- Attractions: ${response.attractions.join('; ')}
- Concerns: ${response.concerns.join('; ')}
- Price Feedback: "${response.willingnessToPayFeedback || 'N/A'}"

Provide your structured classification decision.`;

  const { content: rawJson } = await executeChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error(`[EvaluationService] JSON parse error for shopper ${response.shopperName}:`, rawJson);
    throw new Error(`Invalid JSON in classification for ${response.shopperName}: ${err.message}`);
  }

  const validated = shopperClassificationSchema.safeParse(parsed);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    console.error(`[EvaluationService] Validation error for ${response.shopperName}:`, issues);
    throw new Error(`Classification schema mismatch for ${response.shopperName}: ${issues}`);
  }

  return validated.data;
};

/**
 * Synthesizes overall cohort-level evaluation insights
 */
const synthesizeCohortEvaluation = async ({ product, classifiedResponses }) => {
  const total = classifiedResponses.length;
  let definitelyYes = 0;
  let maybe = 0;
  let no = 0;

  classifiedResponses.forEach((r) => {
    const dec = r.classification?.decision;
    if (dec === 'Definitely Yes') definitelyYes++;
    else if (dec === 'Maybe') maybe++;
    else if (dec === 'No') no++;
  });

  // Calculate weighted intent score: 100 for Yes, 50 for Maybe, 0 for No
  const intentScore = total > 0 ? Math.round(((definitelyYes * 100 + maybe * 50) / (total * 100)) * 100) : 0;

  const driversList = classifiedResponses.map((r) => r.classification?.primaryPurchaseDriver).filter(Boolean);
  const objectionsList = classifiedResponses.map((r) => r.classification?.primaryObjectionCategory).filter(Boolean);

  const systemPrompt = `You are a senior product strategy consultant.
Synthesize the consumer reception across a synthetic shopper cohort and provide high-impact business takeaways.

REQUIREMENTS:
1. "topDrivers": Array of 3 distinct positive themes that won consumers over.
2. "commonObjections": Array of 3 primary barriers or hesitations observed.
3. "recommendations": Array of 3 actionable, concrete product/pricing/messaging improvements for the business to convert the "Maybe" and "No" shoppers.
4. "executiveSummary": A 2-3 sentence executive verdict on market viability and positioning.

Return ONLY valid JSON matching:
{
  "topDrivers": ["Driver 1", "Driver 2", "Driver 3"],
  "commonObjections": ["Objection 1", "Objection 2", "Objection 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "executiveSummary": "..."
}`;

  const userPrompt = `Product: ${product.name} (Category: ${product.category}, Price: ₹${product.price})
Cohort Evaluation Breakdown across ${total} shoppers:
- Definitely Yes: ${definitelyYes} (${total > 0 ? Math.round((definitelyYes / total) * 100) : 0}%)
- Maybe: ${maybe} (${total > 0 ? Math.round((maybe / total) * 100) : 0}%)
- No: ${no} (${total > 0 ? Math.round((no / total) * 100) : 0}%)
- Net Purchase Intent Index: ${intentScore}/100

Observed Drivers: ${driversList.join(', ')}
Observed Objections: ${objectionsList.join(', ')}

Provide your executive synthesis and recommendations.`;

  const { content: rawJson } = await executeChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
  });

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('[EvaluationService] Cohort synthesis parse error:', rawJson);
    throw new Error(`Invalid JSON in cohort synthesis: ${err.message}`);
  }

  const validated = cohortSynthesisSchema.safeParse(parsed);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Cohort synthesis schema mismatch: ${issues}`);
  }

  return {
    evaluatedAt: new Date(),
    intentBreakdown: {
      definitelyYes,
      maybe,
      no,
      intentScore,
    },
    ...validated.data,
  };
};

/**
 * Runs evaluation and classification on a saved simulation document
 * 
 * @param {string} simulationId - MongoDB ID of simulation to evaluate
 * @returns {Promise<Object>} The updated and persisted simulation with classifications
 */
export const evaluateSimulation = async (simulationId) => {
  console.log(`[EvaluationService] Loading simulation ${simulationId}...`);
  const simulation = await Simulation.findById(simulationId);

  if (!simulation) {
    throw new Error(`Simulation with ID ${simulationId} not found.`);
  }

  if (!simulation.responses || simulation.responses.length === 0) {
    throw new Error(`Simulation ${simulationId} has no responses to evaluate.`);
  }

  console.log(`[EvaluationService] Classifying decisions for ${simulation.responses.length} response(s)...`);

  // Classify responses in chunks of 3 for controlled concurrency
  const chunkSize = 3;
  const classifiedResponses = [];

  for (let i = 0; i < simulation.responses.length; i += chunkSize) {
    const chunk = simulation.responses.slice(i, i + chunkSize);
    const chunkClassifications = await Promise.all(
      chunk.map(async (resp) => {
        const classification = await classifyShopperReaction({
          response: resp,
          product: simulation.product,
        });
        const respObj = resp.toObject ? resp.toObject() : resp;
        return {
          ...respObj,
          classification,
        };
      })
    );
    classifiedResponses.push(...chunkClassifications);
  }

  console.log(`[EvaluationService] Synthesizing cohort-level evaluation...`);
  const evaluationSummary = await synthesizeCohortEvaluation({
    product: simulation.product,
    classifiedResponses,
  });

  // Update MongoDB document
  simulation.responses = classifiedResponses;
  simulation.evaluationSummary = evaluationSummary;
  const updatedSimulation = await simulation.save();

  console.log(`[EvaluationService] Simulation ${simulationId} successfully evaluated and persisted.`);
  return updatedSimulation;
};
