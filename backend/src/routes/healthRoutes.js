import { Router } from 'express';
import { getWelcome, getHealth } from '../controllers/healthController.js';

const router = Router();

router.get('/', getWelcome);
router.get('/api/health', getHealth);

export default router;
