import { z } from 'zod';

/**
 * Validation schema for launching a simulation run
 */
export const runSimulationRequestSchema = z.object({
  batchId: z
    .string({ required_error: 'Batch ID is required' })
    .trim()
    .min(1, 'Batch ID cannot be empty'),
  product: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(150, 'Product name cannot exceed 150 characters'),
    category: z
      .string({ required_error: 'Product category is required' })
      .trim()
      .min(2, 'Category must be at least 2 characters')
      .max(80, 'Category cannot exceed 80 characters'),
    price: z
      .number({ required_error: 'Product price is required' })
      .min(0, 'Price must be a non-negative number'),
    currency: z.string().trim().default('INR'),
    description: z
      .string({ required_error: 'Product description is required' })
      .trim()
      .min(10, 'Product description must be at least 10 characters')
      .max(3000, 'Product description cannot exceed 3000 characters'),
    adCopy: z
      .string()
      .trim()
      .max(1000, 'Advertisement copy cannot exceed 1000 characters')
      .optional()
      .default(''),
  }),
});

/**
 * Schema for an individual shopper's structured evaluation produced by LLM
 */
export const shopperEvaluationResponseSchema = z.object({
  consideration: z
    .string({ required_error: 'Consideration summary is required' })
    .trim()
    .min(2, 'Consideration must not be empty'),
  attractions: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one attraction/positive point is required'),
  concerns: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one concern/objection point is required'),
  reactionQuote: z
    .string({ required_error: 'Verbatim reaction quote is required' })
    .trim()
    .min(5, 'Reaction quote must be at least 5 characters'),
  willingnessToPayFeedback: z
    .string()
    .trim()
    .optional()
    .default(''),
});
