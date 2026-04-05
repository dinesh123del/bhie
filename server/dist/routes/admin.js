import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkAdmin } from '../middleware/subscription.js';
const router = Router();
// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(checkAdmin);
// User management
router.get('/users', adminController.getUsers);
router.patch('/user/:id/plan', adminController.updateUserPlan);
router.patch('/user/:id/status', adminController.updateUserStatus);
router.post('/user/:id/reset-password', adminController.resetUserPassword);
// Settings
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);
// Statistics
router.get('/stats', adminController.getStats);
export default router;
