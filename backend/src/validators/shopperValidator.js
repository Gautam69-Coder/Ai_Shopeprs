import { z } from 'zod';

/**
 * Schema for incoming user request to generate shoppers via LLM
 */
export const generateShopperRequestSchema = z.object({
  targetAudience: z
    .string({ required_error: 'Target audience description is required' })
    .trim()
    .min(3, 'Target audience must be at least 3 characters long')
    .max(1000, 'Target audience description cannot exceed 1000 characters'),
  count: z
    .number({ required_error: 'Count is required' })
    .int('Count must be an integer')
    .min(1, 'Number of shoppers must be at least 1')
    .max(20, 'Number of shoppers cannot exceed 20')
    .default(5),
  country: z
    .string()
    .trim()
    .max(100, 'Country name cannot exceed 100 characters')
    .optional()
    .default(''),
  additionalCharacteristics: z
    .string()
    .trim()
    .max(1000, 'Additional characteristics cannot exceed 1000 characters')
    .optional()
    .default(''),
});

/**
 * Schema for an individual synthetic shopper profile
 */
export const shopperProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  age: z
    .number()
    .int('Age must be an integer')
    .min(18, 'Age must be between 18 and 75')
    .max(75, 'Age must be between 18 and 75'),
  city: z.string().trim().min(1, 'City cannot be empty'),
  occupation: z.string().trim().min(1, 'Occupation cannot be empty'),
  monthly_income: z
    .number()
    .min(0, 'Monthly income must be a non-negative number'),
  interests: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one interest is required'),
  shopping_preferences: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one shopping preference is required'),
  price_sensitivity: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Price sensitivity must be low, medium, or high' }),
  }),
  personality_traits: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one personality trait is required'),
  bio: z.string().trim().min(1, 'Bio cannot be empty'),
});

/**
 * Schema for LLM JSON root object containing an array of shoppers
 */
export const shopperLlmResponseSchema = z.object({
  shoppers: z
    .array(shopperProfileSchema)
    .min(1, 'LLM response must contain at least one shopper profile'),
});

/**
 * Schema for direct POST /api/shoppers request to save custom profiles to MongoDB
 */
export const saveShoppersRequestSchema = z.object({
  targetAudience: z.string().trim().min(3).default('Custom Cohort'),
  country: z.string().trim().optional().default(''),
  additionalCharacteristics: z.string().trim().optional().default(''),
  batchId: z.string().trim().optional(),
  shoppers: z
    .array(shopperProfileSchema)
    .min(1, 'At least one shopper profile is required in shoppers array'),
});
