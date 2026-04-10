import { AppError } from '../utils/appError.js';
import User from '../models/User.js';
export const checkAdmin = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const checkSubscription = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const checkLimit = async (req, res, next) => {
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
        if (user.role === 'admin') {
            return next(); // admin bypasses all limits
        }
        // Refresh subscription status
        await user.refreshSubscriptionStatus();
        if (user.hasPremiumAccess()) {
            return next(); // Premium users bypass limits
        }
        // Free users: limit 5 + 1 grace = block at 6
        if (user.usageCount >= 6) {
            return next(new AppError(403, "You've reached your free limit", {
                details: { limitReached: true }
            }));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
export const optionalSubscription = async (req, res, next) => {
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
    }
    catch {
        next();
    }
};
