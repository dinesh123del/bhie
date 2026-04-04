import { Worker, Job } from 'bullmq';
import { isRedisConnected } from '../config/redisClient.js';

export function initPaymentWorker() {
  if (!isRedisConnected()) {
    console.warn('⚠️ Redis not connected; skipping Payment Worker init');
    return;
  }

  const worker = new Worker('payment-processing', async (job: Job) => {
    const { paymentId, amount, userId } = job.data;
    console.log(`[Payment Worker] Processing payment ${paymentId} for user ${userId} - amount: ${amount}`);
    
    // Complex payment processing/calculation goes here...
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[Payment Worker] Validated and completed payment ${paymentId}`);
    return { success: true, paymentId };
  }, {
    connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
    concurrency: 2 // Process up to 2 payments concurrently
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ [Payment Worker] Job ${job?.id} failed with error:`, err);
  });

  worker.on('completed', (job) => {
    console.log(`✅ [Payment Worker] Job ${job.id} completed successfully`);
  });

  return worker;
}
