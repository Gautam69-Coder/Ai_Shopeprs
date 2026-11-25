import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import shopperRoutes from './shopperRoutes.js';
import simulationRoutes from './simulationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

// Mount health and welcome routes
router.use('/', healthRoutes);

// Mount synthetic shopper routes
router.use('/api/shoppers', shopperRoutes);

// Mount simulation engine routes
router.use('/api/simulations', simulationRoutes);

// Mount analytics & cross-tabulation routes
router.use('/api/analytics', analyticsRoutes);

export default router;
