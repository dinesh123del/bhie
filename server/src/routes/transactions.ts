import { Router } from 'express';
import { recordsController } from '../controllers/recordsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Alias for manual transaction creation
router.post('/manual', recordsController.create);

export default router;