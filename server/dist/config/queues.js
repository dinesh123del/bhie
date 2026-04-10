import { Queue } from 'bullmq';
import { isRedisConnected } from './redisClient.js';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = {
    url: REDIS_URL,
};
// --- Lazy queue factory ---
// Queues are only created when Redis is actually available.
// This prevents BullMQ from crashing at import time.
let _eventProcessingQueue = null;
let _aiProcessingQueue = null;
let _actionGenerationQueue = null;
let _paymentProcessingQueue = null;
const createQueueSafe = (name, opts) => {
    try {
        return new Queue(name, opts);
    }
    catch {
        console.warn(`⚠️ Queue "${name}" could not be created (Redis unavailable)`);
        return null;
    }
};
// Dummy queue that silently drops jobs when Redis is unavailable
const dummyQueue = {
    add: async () => ({ id: 'noop' }),
    close: async () => { },
};
export const getEventProcessingQueue = () => {
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
export const getAiProcessingQueue = () => {
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
export const getActionGenerationQueue = () => {
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
export const getPaymentProcessingQueue = () => {
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
export const eventProcessingQueue = new Proxy({}, {
    get: (_target, prop) => getEventProcessingQueue()[prop],
});
export const aiProcessingQueue = new Proxy({}, {
    get: (_target, prop) => getAiProcessingQueue()[prop],
});
export const actionGenerationQueue = new Proxy({}, {
    get: (_target, prop) => getActionGenerationQueue()[prop],
});
export const paymentProcessingQueue = new Proxy({}, {
    get: (_target, prop) => getPaymentProcessingQueue()[prop],
});
export default {
    eventProcessingQueue,
    aiProcessingQueue,
    actionGenerationQueue,
    paymentProcessingQueue,
};
