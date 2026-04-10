import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getUsageStats, getUsageHistory, getBillingSummary, purchaseCredits, checkUsageLimit, } from '../controllers/usageController.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// Get usage stats
router.get('/stats', getUsageStats);
// Get usage history
router.get('/history', getUsageHistory);
// Get billing summary for current period
router.get('/billing', getBillingSummary);
// Check if can use specific resource
router.get('/check/:type/:amount?', checkUsageLimit);
// Purchase additional credits
router.post('/purchase', purchaseCredits);
export default router;
