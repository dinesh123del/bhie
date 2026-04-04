import { Queue, Worker, QueueEvents } from 'bullmq';
import { env } from '../config/env.js';

const connection = {
  url: env.REDIS_URL,
};

// --- Queue Definitions ---

// 1. Initial event ingestion and normalization
export const eventProcessingQueue = new Queue('event-processing', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  }
});

// 2. High-latency AI processing
export const aiProcessingQueue = new Queue('ai-processing', { 
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: true,
  }
});

// 3. Daily action generation logic
export const actionGenerationQueue = new Queue('action-generation', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
  }
});

export default {
  eventProcessingQueue,
  aiProcessingQueue,
  actionGenerationQueue,
};
