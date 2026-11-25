import { Router } from 'express';
import {
  getOverviewHandler,
  getSimulationAnalyticsHandler,
  compareSimulationsHandler,
} from '../controllers/analyticsController.js';

const router = Router();

// GET /api/analytics/overview - Platform-wide KPI benchmarks
router.get('/overview', getOverviewHandler);

// GET /api/analytics/compare?ids=id1,id2 - Side-by-side A/B simulation comparison
router.get('/compare', compareSimulationsHandler);

// GET /api/analytics/simulations/:id - Deep demographic cross-tabs for a simulation
router.get('/simulations/:id', getSimulationAnalyticsHandler);

export default router;
