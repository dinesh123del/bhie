import { Worker } from 'bullmq';
import { isRedisConnected } from '../config/redisClient.js';
let eventWorkerInstance = null;
let aiWorkerInstance = null;
export const initEventWorker = () => {
    if (!isRedisConnected()) {
        console.warn('⚠️ Event worker skipped (Redis unavailable)');
        return null;
    }
    const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };
    try {
        eventWorkerInstance = new Worker('event-processing', async (job) => {
            const { eventId, businessId, type, data, source } = job.data;
            console.log(`👷 Worker: Processing event ${eventId} (${type})`);
            try {
                const Event = (await import('../models/Event.js')).default;
                const BusinessRecord = (await import('../models/Record.js')).default;
                const DailySummary = (await import('../models/DailySummary.js')).default;
                const { aiProcessingQueue } = await import('../config/queues.js');
                const event = await Event.findById(eventId);
                if (!event)
                    return;
                if (event.confidence < 0.8) {
                    await aiProcessingQueue.add(`ai_${eventId}`, { eventId, businessId, type, data, source });
                    return;
                }
                if (type === 'payment_received' || type === 'expense_added') {
                    await BusinessRecord.create({
                        userId: businessId,
                        type: type === 'payment_received' ? 'income' : 'expense',
                        amount: data.amount,
                        category: data.category || 'general',
                        date: data.date || new Date(),
                        description: data.note || `Event ${source}: ${type}`,
                        status: 'completed',
                        metadata: { eventId }
                    });
                    const date = new Date(data.date || new Date());
                    date.setHours(0, 0, 0, 0);
                    await DailySummary.findOneAndUpdate({ businessId, date }, {
                        $inc: {
                            totalRevenue: type === 'payment_received' ? data.amount : 0,
                            totalExpenses: type === 'expense_added' ? data.amount : 0,
                            totalOrders: type === 'payment_received' ? 1 : 0
                        }
                    }, { upsert: true, new: true });
                }
                event.status = 'confirmed';
                event.processedAt = new Date();
                await event.save();
                try {
                    const { emitToBusiness } = await import('../socket/socketManager.js');
                    emitToBusiness(String(businessId), 'dashboard_update', {
                        type: 'EVENT_PROCESSED',
                        eventId,
                        businessId,
                        timestamp: new Date().toISOString()
                    });
                }
                catch {
                    // Socket emission is best-effort
                }
                console.log(`✅ Worker: Event ${eventId} confirmed and processed`);
            }
            catch (error) {
                console.error(`❌ Worker Error [Event]:`, error);
                throw error;
            }
        }, { connection });
        console.log('✅ Event worker initialized');
    }
    catch (error) {
        console.warn('⚠️ Event worker could not be initialized:', error);
    }
    // AI Processing Worker
    try {
        aiWorkerInstance = new Worker('ai-processing', async (job) => {
            const { eventId, businessId, type, data, source } = job.data;
            console.log(`🤖 AI-Worker: Processing event ${eventId}`);
            try {
                const Event = (await import('../models/Event.js')).default;
                const event = await Event.findById(eventId);
                if (!event)
                    return;
                let processedData = { ...data };
                let confidence = event.confidence;
                if (source === 'ocr' && data.filePath) {
                    const { OCRService } = await import('../services/ocrService.js');
                    const extracted = await OCRService.processDocument(data.filePath);
                    processedData = { ...extracted };
                    confidence = extracted.confidence;
                }
                else if (source === 'whatsapp' && data.rawMessage) {
                    const prompt = `Parse this business message: "${data.rawMessage}". Extract amount, type (income/expense), and category. Response JSON.`;
                    const { AIEngine } = await import('../utils/aiEngine.js');
                    const aiResponse = await AIEngine.generateCompletion(prompt);
                    const parsed = JSON.parse(aiResponse.content);
                    processedData = { ...parsed };
                    confidence = parsed.confidence || 0.85;
                }
                event.data = processedData;
                event.confidence = confidence;
                event.status = confidence >= 0.8 ? 'confirmed' : 'pending';
                await event.save();
                if (event.status === 'confirmed') {
                    const { eventProcessingQueue } = await import('../config/queues.js');
                    await eventProcessingQueue.add(`reprocess_${eventId}`, {
                        eventId, businessId, type, data: processedData, source
                    });
                }
            }
            catch (error) {
                console.error(`❌ AI-Worker Error:`, error);
                throw error;
            }
        }, { connection });
        console.log('✅ AI worker initialized');
    }
    catch (error) {
        console.warn('⚠️ AI worker could not be initialized:', error);
    }
    return { eventWorkerInstance, aiWorkerInstance };
};
export { eventWorkerInstance as eventWorker, aiWorkerInstance as aiWorker };
