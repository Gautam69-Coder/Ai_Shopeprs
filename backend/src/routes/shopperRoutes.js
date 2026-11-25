import { Router } from 'express';
import {
  generateShoppersHandler,
  saveShoppersHandler,
  getShoppersHandler,
  getBatchesHandler,
} from '../controllers/shopperController.js';
import { llmRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Generation & Direct Save endpoints
// Phase 6: LLM rate limiter guards the generation endpoint
router.post('/generate', llmRateLimiter, generateShoppersHandler);
router.post('/', saveShoppersHandler);

// Retrieval endpoints
router.get('/', getShoppersHandler);
router.get('/batches', getBatchesHandler);

export default router;
