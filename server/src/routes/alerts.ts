import { Router } from 'express';
import { alertsController } from '../controllers/alertsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// GET /api/alerts - Get recent alerts
router.get('/', alertsController.getAlerts);

// POST /api/alerts/mark-read/:id - Mark single alert read
router.post('/mark-read/:id', alertsController.markAlertRead);

// POST /api/alerts/mark-all-read - Mark all unread as read
router.post('/mark-all-read', alertsController.markAllRead);

export default router;

