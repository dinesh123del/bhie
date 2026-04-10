import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
const router = express.Router();
// Apply authentication to all routes
router.use(authenticateToken);
// Get real-time business metrics
router.get('/metrics', asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    // Get real-time intelligence instance (would be injected via DI in production)
    const { realTimeIntelligence } = req.app.locals;
    if (!realTimeIntelligence) {
        return res.status(503).json({ error: 'Real-time intelligence system not available' });
    }
    const metrics = await realTimeIntelligence.getBusinessMetrics(businessId || userId);
    res.json({
        success: true,
        data: metrics,
        timestamp: new Date()
    });
}));
// Get alert history
router.get('/alerts', asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const userId = req.user?.userId;
    const limit = Number(req.query.limit) || 50;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const { realTimeIntelligence } = req.app.locals;
    if (!realTimeIntelligence) {
        return res.status(503).json({ error: 'Real-time intelligence system not available' });
    }
    const alerts = await realTimeIntelligence.getAlertHistory(businessId || userId, limit);
    res.json({
        success: true,
        data: alerts,
        count: alerts.length
    });
}));
// Get event history
router.get('/events', asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const userId = req.user?.userId;
    const limit = Number(req.query.limit) || 100;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const { realTimeIntelligence } = req.app.locals;
    if (!realTimeIntelligence) {
        return res.status(503).json({ error: 'Real-time intelligence system not available' });
    }
    const events = await realTimeIntelligence.getEventHistory(businessId || userId, limit);
    res.json({
        success: true,
        data: events,
        count: events.length
    });
}));
// Publish a custom event
router.post('/events', asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    const { type, data, severity = 'medium', priority = 2 } = req.body;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    if (!type || !data) {
        return res.status(400).json({ error: 'Event type and data are required' });
    }
    const { realTimeIntelligence } = req.app.locals;
    if (!realTimeIntelligence) {
        return res.status(503).json({ error: 'Real-time intelligence system not available' });
    }
    await realTimeIntelligence.publishEvent({
        type,
        userId,
        businessId: userId,
        data,
        severity,
        priority
    });
    res.json({
        success: true,
        message: 'Event published successfully'
    });
}));
export default router;
