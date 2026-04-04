import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All subscription routes require authentication
router.use(authenticateToken);

router.get('/status', subscriptionController.getStatus);
router.post('/subscribe', subscriptionController.subscribe);
router.post('/cancel', subscriptionController.cancel);

export default router;