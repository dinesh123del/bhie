import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth';
import { cacheGet } from '../middleware/cacheGet';

const router = express.Router();

router.use(authenticateToken);

router.use(cacheGet);
router.get('/', dashboardController.getDashboard);

export default router;
