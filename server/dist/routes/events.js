import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import Event from '../models/Event.js';
import { eventProcessingQueue } from '../config/queues.js';
import { requireUser } from '../utils/request.js';
import { AppError } from '../utils/appError.js';
import Company from '../models/Company.js';
const router = express.Router();
/**
 * Common ingestion logic
 */
const ingestEvent = async (userId, type, source, data, confidence = 1) => {
    const company = await Company.findOne({ userId });
    if (!company)
        throw new AppError(404, 'Business profile not found');
    const event = await Event.create({
        businessId: company._id,
        type,
        source,
        data,
        confidence,
        status: confidence >= 0.8 ? 'confirmed' : 'pending',
    });
    // Push to high-speed processing queue
    await eventProcessingQueue.add(`${type}_${event._id}`, {
        eventId: event._id,
        businessId: company._id,
        type,
        source,
        data,
    });
    return event;
};
// --- Ingestion APIs ---
// 1. Manual User Input (Quick Sale/Expense)
router.post('/manual', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const { type, amount, category, items, note } = req.body;
    if (!['payment_received', 'expense_added'].includes(type)) {
        throw new AppError(400, 'Invalid manual event type');
    }
    const event = await ingestEvent(authUser.userId, type, 'manual', {
        amount: Number(amount),
        category: category || 'general',
        items: items || [],
        note,
    });
    res.status(201).json({ success: true, event });
}));
// 2. WhatsApp Data (AI Message Parsing)
router.post('/whatsapp', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const { message, sender } = req.body;
    // Initially mark as low confidence "pending" for AI parsing
    const event = await ingestEvent(authUser.userId, 'payment_received', 'whatsapp', {
        rawMessage: message,
        sender,
    }, 0.5); // 0.5 triggers AI parsing
    res.status(202).json({ success: true, message: 'Message queued for parsing', eventId: event._id });
}));
// 3. Payment Webhooks
router.post('/payment-webhook', asyncHandler(async (req, res) => {
    const { businessId, amount, status, provider } = req.body;
    if (!businessId || status !== 'captured') {
        res.status(400).json({ success: false });
        return;
    }
    // Ingest without authenticating since webhooks are server-to-server
    const event = await Event.create({
        businessId,
        type: 'payment_received',
        source: 'webhook',
        data: { amount, provider, status },
        confidence: 1,
        status: 'confirmed',
    });
    await eventProcessingQueue.add(`webhook_${event._id}`, {
        eventId: event._id,
        businessId,
        type: 'payment_received',
        source: 'webhook',
        data: { amount, provider },
    });
    res.json({ success: true });
}));
export default router;
