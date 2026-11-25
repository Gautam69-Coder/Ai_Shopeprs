import crypto from 'crypto';
import * as shopperService from '../services/shopperService.js';
import { Shopper } from '../models/Shopper.js';
import {
  generateShopperRequestSchema,
  saveShoppersRequestSchema,
} from '../validators/shopperValidator.js';

/**
 * POST /api/shoppers/generate
 * Generates synthetic shopper profiles for a given target audience and saves them to MongoDB
 */
export const generateShoppersHandler = async (req, res, next) => {
  try {
    const parsedBody = generateShopperRequestSchema.safeParse(req.body);
    if (!parsedBody.success) {
      const issues = parsedBody.error.issues || parsedBody.error.errors || [];
      const errorMessages = issues.map((e) => `${e.path.join('.') || 'field'}: ${e.message}`);
      return res.status(400).json({
        error: {
          message: 'Invalid request data',
          details: errorMessages,
          statusCode: 400,
        },
      });
    }

    const { targetAudience, count, country, additionalCharacteristics } = parsedBody.data;

    const result = await shopperService.generateShoppers({
      targetAudience,
      count,
      country,
      additionalCharacteristics,
    });

    res.status(201).json({
      success: true,
      message: `Generated and saved ${result.count} synthetic shopper profile(s) to MongoDB`,
      ...result,
    });
  } catch (error) {
    console.error('[ShopperController Error]', error);
    next(error);
  }
};

/**
 * POST /api/shoppers
 * Directly saves one or more shopper profiles to MongoDB
 */
export const saveShoppersHandler = async (req, res, next) => {
  try {
    let body = req.body;
    // Normalize single shopper object to array if needed
    if (!body.shoppers && body.name) {
      body = {
        targetAudience: body.targetAudience || 'Custom Shopper',
        country: body.country || '',
        additionalCharacteristics: body.additionalCharacteristics || '',
        batchId: body.batchId,
        shoppers: [body],
      };
    }

    const parsedBody = saveShoppersRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      const issues = parsedBody.error.issues || parsedBody.error.errors || [];
      const errorMessages = issues.map((e) => `${e.path.join('.') || 'field'}: ${e.message}`);
      return res.status(400).json({
        error: {
          message: 'Validation failed for shopper profile(s)',
          details: errorMessages,
          statusCode: 400,
        },
      });
    }

    const { targetAudience, country, additionalCharacteristics, shoppers } = parsedBody.data;
    const batchId = parsedBody.data.batchId || crypto.randomUUID();

    const shopperDocs = shoppers.map((s) => ({
      ...s,
      batchId,
      targetAudience,
      country: country || '',
      additionalCharacteristics: additionalCharacteristics || '',
    }));

    const savedShoppers = await Shopper.insertMany(shopperDocs);

    res.status(201).json({
      success: true,
      message: `Successfully saved ${savedShoppers.length} shopper profile(s) to MongoDB`,
      batchId,
      count: savedShoppers.length,
      shoppers: savedShoppers,
    });
  } catch (error) {
    console.error('[ShopperController Error]', error);
    next(error);
  }
};

/**
 * GET /api/shoppers
 * Retrieves synthetic shopper profiles, with optional batchId filter
 */
export const getShoppersHandler = async (req, res, next) => {
  try {
    const { batchId } = req.query;
    const shoppers = await shopperService.getShoppers({ batchId });

    res.status(200).json({
      success: true,
      count: shoppers.length,
      shoppers,
    });
  } catch (error) {
    console.error('[ShopperController Error]', error);
    next(error);
  }
};

/**
 * GET /api/shoppers/batches
 * Retrieves distinct generation batches with summary metadata
 */
export const getBatchesHandler = async (req, res, next) => {
  try {
    const batches = await shopperService.getBatches();

    res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    console.error('[ShopperController Error]', error);
    next(error);
  }
};
