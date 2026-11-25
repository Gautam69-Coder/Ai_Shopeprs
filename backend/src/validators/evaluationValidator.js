import { z } from 'zod';

/**
 * Schema for an individual shopper's AI purchase decision classification
 */
export const shopperClassificationSchema = z.object({
  decision: z.enum(['Definitely Yes', 'Maybe', 'No'], {
    errorMap: () => ({ message: 'Decision must strictly be Definitely Yes, Maybe, or No' }),
  }),
  confidenceScore: z
    .number()
    .int()
    .min(0, 'Confidence score must be at least 0')
    .max(100, 'Confidence score cannot exceed 100'),
  primaryPurchaseDriver: z
    .string()
    .trim()
    .min(2, 'Primary purchase driver must not be empty'),
  primaryObjectionCategory: z
    .string()
    .trim()
    .min(2, 'Primary objection category must not be empty'),
  keyPositiveReason: z
    .string()
    .trim()
    .min(5, 'Key positive reason must be at least 5 characters'),
  keyConcernReason: z
    .string()
    .trim()
    .min(5, 'Key concern reason must be at least 5 characters'),
});

/**
 * Schema for cohort-level executive synthesis
 */
export const cohortSynthesisSchema = z.object({
  topDrivers: z
    .array(z.string().trim().min(2))
    .min(1, 'At least one top driver is required')
    .max(5),
  commonObjections: z
    .array(z.string().trim().min(2))
    .min(1, 'At least one common objection is required')
    .max(5),
  recommendations: z
    .array(z.string().trim().min(2))
    .min(1, 'At least one product recommendation is required')
    .max(5),
  executiveSummary: z
    .string()
    .trim()
    .min(10, 'Executive summary must be at least 10 characters'),
});
