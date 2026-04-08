import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createReferral,
  getReferralStats,
  validateReferralCode,
  convertReferral,
  getSocialShares,
} from '../controllers/referralController.js';

const router = Router();

// Protected routes (require authentication)
router.post('/create', authenticateToken, createReferral);
router.get('/stats', authenticateToken, getReferralStats);
router.get('/social-shares', authenticateToken, getSocialShares);

// Public routes
router.get('/validate/:code', validateReferralCode);
router.post('/convert', convertReferral);

export default router;
