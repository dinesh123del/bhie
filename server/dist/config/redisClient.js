import { createClient } from 'redis';
import { env } from './env.js';
let redisClient = null;
let isConnected = false;
/**
 * Create and return the Redis client (lazy init).
 * Returns null when Redis is unavailable so the rest of the app can degrade gracefully.
 */
const getOrCreateClient = () => {
    if (redisClient)
        return redisClient;
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        redisClient.on('ready', () => {
            if (!env.IS_PRODUCTION)
                console.log('✅ Redis connected');
        });
        redisClient.on('error', (err) => {
            // Suppress noisy reconnect errors — only log once
            if (isConnected) {
                console.error('❌ Redis connection lost:', err.message);
                isConnected = false;
            }
        });
        return redisClient;
    }
    catch {
        return null;
    }
};
export const connectRedis = async () => {
    try {
        const client = getOrCreateClient();
        if (!client) {
            console.warn('⚠️ Redis: Client could not be created — running without cache');
            return;
        }
        if (client.isOpen)
            return;
        await client.connect();
        isConnected = true;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Redis connection failed';
        console.warn(`⚠️ Redis unavailable (${message}) — running without cache`);
        // Do NOT throw — let the app start without Redis
    }
};
export const disconnectRedis = async () => {
    try {
        if (redisClient?.isOpen) {
            await redisClient.quit();
            isConnected = false;
            if (!env.IS_PRODUCTION)
                console.log('✅ Redis disconnected');
        }
    }
    catch {
        // Swallow disconnect errors
    }
};
export const isRedisConnected = () => isConnected;
export { redisClient };
export default redisClient;
