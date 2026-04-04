import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import { AuthenticatedUser } from '../types';

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    next(new AppError(401, 'Access token required'));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as Partial<AuthenticatedUser> & {
      userId?: string;
      role?: AuthenticatedUser['role'];
    };

    if (!decoded.userId) {
      throw new AppError(403, 'Invalid token');
    }

    req.user = {
      userId: decoded.userId,
      id: decoded.userId,
      role: decoded.role || 'user',
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: string[]) => {
  const roleGuard: RequestHandler = (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }
    next();
  };
  return roleGuard;
};
