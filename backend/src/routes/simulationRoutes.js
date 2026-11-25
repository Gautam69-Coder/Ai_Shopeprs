import { Router } from 'express';
import {
  runSimulationHandler,
  getSimulationsHandler,
  getSimulationByIdHandler,
  deleteAllSimulationsHandler,
} from '../controllers/simulationController.js';
import {
  evaluateSimulationHandler,
  getEvaluationHandler,
} from '../controllers/evaluationController.js';
import { llmRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Simulation execution, fetching, and bulk deletion
router.post('/run', llmRateLimiter, runSimulationHandler);
router.get('/', getSimulationsHandler);
router.get('/:id', getSimulationByIdHandler);
router.delete('/', deleteAllSimulationsHandler);

// Phase 4: Classification & Evaluation endpoints
router.post('/:id/evaluate', llmRateLimiter, evaluateSimulationHandler);
router.get('/:id/evaluation', getEvaluationHandler);

export default router;
