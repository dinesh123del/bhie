import { RequestHandler } from 'express';
import { AppError } from '../utils/appError';
import User from '../models/User';

export const checkAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      next(new AppError(404, 'User not found'));
      return;
    }

    if (user.role !== 'admin') {
      next(new AppError(403, 'Admin access required'));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkSubscription: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      next(new AppError(404, 'User not found'));
      return;
    }

    // Refresh subscription status
    await user.refreshSubscriptionStatus();

    if (!user.hasPremiumAccess()) {
      next(new AppError(403, 'Premium subscription required'));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalSubscription: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      next();
      return;
    }

    const user = await User.findById(req.user.userId);
    if (user) {
      await user.refreshSubscriptionStatus();
      req.user.plan = user.getEffectivePlan();
      req.user.hasPremium = user.hasPremiumAccess();
    }

    next();
  } catch (error) {
    next();
  }
};