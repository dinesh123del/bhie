import { RequestHandler } from 'express';
import { CacheService } from '../services/cacheService.js';
import { AuthRequest } from '../types/index.js';

export const cacheGet: RequestHandler = async (req, res, next) => {
  if (req.method !== 'GET') return next();

  const userId = (req as AuthRequest).user?.userId;
  if (!userId) return next();

  const cacheKey = CacheService.generateKey(req.baseUrl + req.path, userId);

  try {
    const cached = await CacheService.get(cacheKey);
    if (cached !== null) {
      return res.json(cached);
    }
  } catch (error) {
    console.error('Cache get middleware error:', error);
  }

  next();
};

