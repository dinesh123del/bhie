import { Router } from 'express';
import { recordsController } from '../controllers/recordsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Alias for manual transaction creation
router.post('/manual', recordsController.create);

export default router;