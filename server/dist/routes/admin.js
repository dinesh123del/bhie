import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { checkAdmin } from '../middleware/subscription';
const router = Router();
// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(checkAdmin);
// User management
router.get('/users', adminController.getUsers);
router.patch('/user/:id/plan', adminController.updateUserPlan);
router.patch('/user/:id/status', adminController.updateUserStatus);
router.post('/user/:id/reset-password', adminController.resetUserPassword);
// Statistics
router.get('/stats', adminController.getStats);
export default router;
