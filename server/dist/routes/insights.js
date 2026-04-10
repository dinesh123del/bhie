import { Router } from 'express';
import { insightsController } from '../controllers/insightsController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.use(authenticateToken);
router.get('/', insightsController.getInsights);
router.get('/predictions', insightsController.getPredictions);
export default router;
