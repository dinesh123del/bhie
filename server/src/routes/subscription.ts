import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middleware/auth.js';

import { sensitiveLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All subscription routes require authentication
router.use(authenticateToken);

router.get('/status', subscriptionController.getStatus);
router.post('/create', sensitiveLimiter, subscriptionController.create);
router.post('/direct-upgrade', subscriptionController.directUpgrade);
router.post('/verify', sensitiveLimiter, subscriptionController.verify);
router.post('/cancel', subscriptionController.cancel);

export default router;