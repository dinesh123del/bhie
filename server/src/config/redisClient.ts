import { createClient } from 'redis';
import { env } from './env.js';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('ready', () => {
  if (!env.IS_PRODUCTION) console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

let isConnected = false;

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) return;
  try {
    await redisClient.connect();
    isConnected = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Redis connection failed';
    console.error('❌ Redis', message);
    throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) return;
  await redisClient.quit();
  isConnected = false;
  if (!env.IS_PRODUCTION) console.log('✅ Redis disconnected');
};

export default redisClient;

