import { Queue } from 'bullmq';
import { isRedisConnected } from './redisClient.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = {
  url: REDIS_URL,
};

// --- Lazy queue factory ---
// Queues are only created when Redis is actually available.
// This prevents BullMQ from crashing at import time.

let _eventProcessingQueue: Queue | null = null;
let _aiProcessingQueue: Queue | null = null;
let _actionGenerationQueue: Queue | null = null;
let _paymentProcessingQueue: Queue | null = null;

const createQueueSafe = (name: string, opts: any): Queue | null => {
  try {
    return new Queue(name, opts);
  } catch (error) {
    console.warn(`⚠️ Queue "${name}" could not be created (Redis unavailable)`);
    return null;
  }
};

// Dummy queue that silently drops jobs when Redis is unavailable
const dummyQueue = {
  add: async () => ({ id: 'noop' }),
  close: async () => {},
} as unknown as Queue;

export const getEventProcessingQueue = (): Queue => {
  if (!_eventProcessingQueue && isRedisConnected()) {
    _eventProcessingQueue = createQueueSafe('event-processing', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    });
  }
  return _eventProcessingQueue || dummyQueue;
};

export const getAiProcessingQueue = (): Queue => {
  if (!_aiProcessingQueue && isRedisConnected()) {
    _aiProcessingQueue = createQueueSafe('ai-processing', {
      connection,
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 5000 },
        removeOnComplete: true,
      },
    });
  }
  return _aiProcessingQueue || dummyQueue;
};

export const getActionGenerationQueue = (): Queue => {
  if (!_actionGenerationQueue && isRedisConnected()) {
    _actionGenerationQueue = createQueueSafe('action-generation', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
      },
    });
  }
  return _actionGenerationQueue || dummyQueue;
};

export const getPaymentProcessingQueue = (): Queue => {
  if (!_paymentProcessingQueue && isRedisConnected()) {
    _paymentProcessingQueue = createQueueSafe('payment-processing', {
      connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    });
  }
  return _paymentProcessingQueue || dummyQueue;
};

// Legacy named exports for backward compat
export const eventProcessingQueue = new Proxy({} as Queue, {
  get: (_target, prop) => (getEventProcessingQueue() as any)[prop],
});

export const aiProcessingQueue = new Proxy({} as Queue, {
  get: (_target, prop) => (getAiProcessingQueue() as any)[prop],
});

export const actionGenerationQueue = new Proxy({} as Queue, {
  get: (_target, prop) => (getActionGenerationQueue() as any)[prop],
});

export const paymentProcessingQueue = new Proxy({} as Queue, {
  get: (_target, prop) => (getPaymentProcessingQueue() as any)[prop],
});

export default {
  eventProcessingQueue,
  aiProcessingQueue,
  actionGenerationQueue,
  paymentProcessingQueue,
};
