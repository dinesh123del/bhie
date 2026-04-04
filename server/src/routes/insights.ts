import { Router } from 'express';
import { insightsController } from '../controllers/insightsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', insightsController.getInsights);
router.get('/predictions', insightsController.getPredictions);

export default router;