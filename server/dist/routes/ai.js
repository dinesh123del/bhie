import express from 'express';
import { runAgents, validateBusinessData } from '../agents/orchestrator.js';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth.js';
import { redisClient } from '../config/redisClient';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { checkOpenAIHealth } from '../utils/openai.js';
import { AppError } from '../utils/appError';
import { requireUser } from '../utils/request';
const router = express.Router();
const extractBusinessData = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return undefined;
    }
    if ('businessData' in payload) {
        return payload.businessData;
    }
    return payload;
};
router.get('/health', asyncHandler(async (_req, res) => {
    const openaiHealth = await checkOpenAIHealth();
    const health = {
        status: openaiHealth ? 'healthy' : 'unhealthy',
        openaiConnected: openaiHealth,
        agentsReady: true,
    };
    res.json(health);
}));
router.post('/analyze', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const businessData = extractBusinessData(req.body);
    if (!validateBusinessData(businessData)) {
        throw new AppError(400, 'Invalid business data. Requires revenue, expenses, customerCount.');
    }
    const user = await User.findById(authUser.userId).select('plan subscriptionStatus expiryDate');
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    if (typeof user.refreshSubscriptionStatus === 'function') {
        await user.refreshSubscriptionStatus();
    }
    if (typeof user.hasPremiumAccess !== 'function' || !user.hasPremiumAccess()) {
        throw new AppError(403, 'AI analysis is available on Pro and Enterprise plans only.');
    }
    const company = await Company.findOne({ userId: authUser.userId });
    if (!company) {
        throw new AppError(404, 'Company profile not found. Complete company setup first.');
    }
    const fullData = {
        ...company.toObject(),
        revenue: businessData.revenue ?? company.revenue,
        expenses: businessData.expenses ?? company.expenses,
        customerCount: businessData.customerCount ?? company.employees,
        industry: businessData.industry ?? company.industry,
        growthRate: businessData.growthRate ?? company.growthRate,
    };
    const analysisResult = (await runAgents(fullData));
    if (analysisResult.status === 'error') {
        throw new AppError(500, analysisResult.message);
    }
    company.insights = [
        ...analysisResult.analysis.financial.recommendations.slice(0, 2),
        ...analysisResult.analysis.strategies.immediateActions.slice(0, 2),
        ...analysisResult.analysis.financial.keyFindings.slice(0, 1),
    ].slice(0, 5);
    await company.save();
    analysisResult.analysisId = `${Date.now()}-${authUser.userId}`;
    const responseData = analysisResult;
    res.json(responseData);
    const cacheKey = `cache:ai:insights:${authUser.userId}`;
    redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 60 }).catch(console.error);
}));
router.get('/history', authenticateToken, (_req, res) => {
    res.json({ history: [], message: 'History feature coming soon' });
});
export default router;
