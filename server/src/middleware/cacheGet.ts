import { RequestHandler } from 'express';
import { redisClient } from '../config/redisClient.js';
import { AuthRequest } from '../types';

export const cacheGet: RequestHandler = async (req, res, next) => {
  if (req.method !== 'GET') return next();

  const userId = (req as AuthRequest).user?.userId;
  if (!userId) return next();

  const cacheKey = `cache:${req.path.replace(/\//g, ':')}:${userId}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached !== null) {
      return res.json(JSON.parse(cached as string));
    }
  } catch (error) {
    console.error('Cache get error:', error);
  }

  next();
};

