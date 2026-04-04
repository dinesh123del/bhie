import express from 'express';
import { runAgents, validateBusinessData } from '../agents/orchestrator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';
const router = express.Router();
router.get('/health', asyncHandler(async (_req, res) => {
    // Basic connectivity check
    res.json({
        status: 'healthy',
        engine: 'multi-provider',
        timestamp: new Date().toISOString()
    });
}));
router.post('/analyze', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const { businessData, provider } = req.body;
    if (!validateBusinessData(businessData)) {
        throw new AppError(400, 'Invalid business data.');
    }
    const user = await User.findById(authUser.userId);
    if (!user)
        throw new AppError(404, 'User not found');
    const company = await Company.findOne({ userId: authUser.userId });
    if (!company)
        throw new AppError(404, 'Company not found');
    const analysisResult = await runAgents(businessData, provider);
    if (analysisResult.status === 'error') {
        throw new AppError(500, analysisResult.message);
    }
    res.json(analysisResult);
}));
router.get('/history', authenticateToken, (_req, res) => {
    res.json({ history: [], message: 'History feature coming soon' });
});
export default router;
