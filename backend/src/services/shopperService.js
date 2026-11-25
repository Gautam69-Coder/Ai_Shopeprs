import crypto from 'crypto';
import { Shopper } from '../models/Shopper.js';
import { executeChatCompletion } from './groqClient.js';
import { shopperLlmResponseSchema } from '../validators/shopperValidator.js';

/**
 * Constructs the system prompt for synthetic shopper generation
 */
const buildSystemPrompt = () => {
  return `You are an expert consumer research psychologist and synthetic consumer persona modeler.
Your task is to generate realistic, diverse, and nuanced synthetic shopper profiles based on a user's target audience description.

CRITICAL INSTRUCTIONS & RULES:
1. Every name must be fictional and culturally appropriate for the target region.
2. Age MUST be an integer between 18 and 75.
3. Monthly income MUST be a realistic non-negative number (in the local currency context, e.g., INR for India, USD for US).
4. Price sensitivity MUST strictly be one of: "low", "medium", or "high".
5. "interests", "shopping_preferences", and "personality_traits" MUST each be non-empty arrays of descriptive strings.
6. "bio" MUST be a vivid 2-3 sentence overview of this fictional shopper's daily life, spending mentality, and decision drivers.
7. DIVERSITY: Create genuinely distinct individuals across ages, occupations, income levels, and personalities. Do not merely create slight variations of the same persona.
8. AVOID STEREOTYPES: Ground profiles in realistic consumer behaviors rather than clichéd tropes.
9. FICTIONAL ONLY: Do not base personas on real individuals.
10. OUTPUT FORMAT: Respond ONLY with a valid JSON object matching this exact structure:
{
  "shoppers": [
    {
      "name": "Fictional Name",
      "age": 28,
      "city": "City Name",
      "occupation": "Job Title",
      "monthly_income": 45000,
      "interests": ["interest 1", "interest 2"],
      "shopping_preferences": ["preference 1", "preference 2"],
      "price_sensitivity": "medium",
      "personality_traits": ["trait 1", "trait 2"],
      "bio": "Concise bio describing the shopper..."
    }
  ]
}`;
};

/**
 * Constructs the user prompt for the LLM request
 */
const buildUserPrompt = ({ targetAudience, count, country, additionalCharacteristics }) => {
  let prompt = `Please generate exactly ${count} diverse synthetic shopper profile(s) for the following audience:

Target Audience:
"${targetAudience}"`;

  if (country) {
    prompt += `\n\nTarget Country/Region: ${country}`;
  }

  if (additionalCharacteristics) {
    prompt += `\n\nAdditional Characteristics & Constraints:\n"${additionalCharacteristics}"`;
  }

  prompt += `\n\nRemember to return exactly ${count} diverse profiles inside the "shoppers" JSON array.`;
  return prompt;
};

/**
 * Generates synthetic shopper profiles using Groq LLM, validates them, and persists to MongoDB.
 * 
 * @param {Object} params
 * @param {string} params.targetAudience
 * @param {number} params.count
 * @param {string} [params.country]
 * @param {string} [params.additionalCharacteristics]
 * @returns {Promise<Object>} Generation result including batchId and saved shopper documents
 */
export const generateShoppers = async ({
  targetAudience,
  count = 5,
  country = '',
  additionalCharacteristics = '',
}) => {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt({ targetAudience, count, country, additionalCharacteristics });

  // 1. Request structured JSON from Groq LLM
  console.log(`[ShopperService] Requesting ${count} profiles from Groq LLM...`);
  const { content: rawResponse } = await executeChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.75,
  });

  // 2. Parse JSON response
  let parsedJson;
  try {
    parsedJson = JSON.parse(rawResponse);
  } catch (err) {
    console.error('[ShopperService] JSON parse error on LLM output:', rawResponse);
    throw new Error(`LLM output was not valid JSON: ${err.message}`);
  }

  // 3. Validate with Zod schema
  const validation = shopperLlmResponseSchema.safeParse(parsedJson);
  if (!validation.success) {
    const errorDetails = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error('[ShopperService] Profile validation failed:', errorDetails);
    throw new Error(`Generated profiles failed schema validation: ${errorDetails}`);
  }

  const validatedShoppers = validation.data.shoppers;

  if (validatedShoppers.length === 0) {
    throw new Error('LLM returned an empty array of shopper profiles.');
  }

  // 4. Assign unique batch ID and audience metadata
  const batchId = crypto.randomUUID();
  const shopperDocs = validatedShoppers.slice(0, count).map((shopper) => ({
    ...shopper,
    batchId,
    targetAudience,
    country: country || '',
    additionalCharacteristics: additionalCharacteristics || '',
  }));

  // 5. Persist profiles in MongoDB
  console.log(`[ShopperService] Saving ${shopperDocs.length} profiles to MongoDB (Batch ID: ${batchId})...`);
  const savedShoppers = await Shopper.insertMany(shopperDocs);
  console.log(`[ShopperService] Successfully saved ${savedShoppers.length} profiles.`);

  return {
    batchId,
    count: savedShoppers.length,
    targetAudience,
    country: country || '',
    additionalCharacteristics: additionalCharacteristics || '',
    createdAt: new Date().toISOString(),
    shoppers: savedShoppers,
  };
};

/**
 * Retrieves shoppers from MongoDB, optionally filtered by batch ID
 */
export const getShoppers = async ({ batchId } = {}) => {
  const query = batchId ? { batchId } : {};
  const shoppers = await Shopper.find(query).sort({ createdAt: -1 }).limit(100);
  return shoppers;
};

/**
 * Retrieves distinct generation batches with metadata
 */
export const getBatches = async () => {
  const batches = await Shopper.aggregate([
    {
      $group: {
        _id: '$batchId',
        batchId: { $first: '$batchId' },
        targetAudience: { $first: '$targetAudience' },
        country: { $first: '$country' },
        count: { $sum: 1 },
        createdAt: { $first: '$createdAt' },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return batches;
};
