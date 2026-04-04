import { Worker, Job } from 'bullmq';
import { env } from '../config/env.js';
import Event from '../models/Event.js';
import BusinessRecord from '../models/Record.js';
import DailySummary from '../models/DailySummary.js';
import { OCRService } from '../services/ocrService.js';
import { aiProcessingQueue } from '../config/queues.js';

const connection = { url: env.REDIS_URL };

/**
 * Event Processing Worker
 * Handles normalization, validation, and read model updates
 */
export const eventWorker = new Worker('event-processing', async (job: Job) => {
  const { eventId, businessId, type, data, source } = job.data;
  console.log(`👷 Worker: Processing event ${eventId} (${type})`);

  try {
    const event = await Event.findById(eventId);
    if (!event) return;

    // 1. If confidence is low, route to AI processing first
    if (event.confidence < 0.8) {
      await aiProcessingQueue.add(`ai_${eventId}`, { eventId, businessId, type, data, source });
      return;
    }

    // 2. Update Read Models (CQRS)
    if (type === 'payment_received' || type === 'expense_added') {
      // Update Transactions/Records
      await BusinessRecord.create({
        userId: businessId, // Assuming businessId maps to userId here for simplicity in this schema
        type: type === 'payment_received' ? 'income' : 'expense',
        amount: data.amount,
        category: data.category || 'general',
        date: data.date || new Date(),
        description: data.note || `Event ${source}: ${type}`,
        status: 'completed',
        metadata: { eventId }
      });

      // Update Daily Summary
      const date = new Date(data.date || new Date());
      date.setHours(0, 0, 0, 0);

      await DailySummary.findOneAndUpdate(
        { businessId, date },
        { 
          $inc: { 
            totalRevenue: type === 'payment_received' ? data.amount : 0,
            totalExpenses: type === 'expense_added' ? data.amount : 0,
            totalOrders: type === 'payment_received' ? 1 : 0
          }
        },
        { upsert: true, new: true }
      );
    }

    event.status = 'confirmed';
    event.processedAt = new Date();
    await event.save();

    // 3. Real-time Dashboard Update
    const { emitToBusiness } = await import('../socket/socketManager.js');
    emitToBusiness(String(businessId), 'dashboard_update', {
      type: 'EVENT_PROCESSED',
      eventId,
      businessId,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Worker: Event ${eventId} confirmed and processed`);

  } catch (error) {
    console.error(`❌ Worker Error [Event]:`, error);
    throw error;
  }
}, { connection });

/**
 * AI Processing Worker
 * Handles complex parsing (OCR, NLP, Multi-Source extraction)
 */
export const aiWorker = new Worker('ai-processing', async (job: Job) => {
  const { eventId, businessId, type, data, source } = job.data;
  console.log(`🤖 AI-Worker: Processing event ${eventId}`);

  try {
    const event = await Event.findById(eventId);
    if (!event) return;

    let processedData = { ...data };
    let confidence = event.confidence;

    if (source === 'ocr' && data.filePath) {
      const extracted = await OCRService.processDocument(data.filePath);
      processedData = { ...extracted };
      confidence = extracted.confidence;
    } else if (source === 'whatsapp' && data.rawMessage) {
      // Simulate/Implement AI Message Parser
      const prompt = `Parse this business message: "${data.rawMessage}". Extract amount, type (income/expense), and category. Response JSON.`;
      const aiResponse = await (await import('../utils/aiEngine.js')).AIEngine.generateCompletion(prompt);
      const parsed = JSON.parse(aiResponse.content);
      processedData = { ...parsed };
      confidence = parsed.confidence || 0.85;
    }

    event.data = processedData;
    event.confidence = confidence;
    event.status = confidence >= 0.8 ? 'confirmed' : 'pending';
    await event.save();

    // If now confirmed, push back to event worker for read model updates
    if (event.status === 'confirmed') {
      const { eventProcessingQueue } = await import('../config/queues.js');
      await eventProcessingQueue.add(`reprocess_${eventId}`, {
        eventId, businessId, type, data: processedData, source
      });
    }

  } catch (error) {
    console.error(`❌ AI-Worker Error:`, error);
    throw error;
  }
}, { connection });
