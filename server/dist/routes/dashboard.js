import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';
import { cacheGet } from '../middleware/cacheGet.js';
const router = express.Router();
router.use(authenticateToken);
router.use(cacheGet);
router.get('/', dashboardController.getDashboard);
export default router;
