import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import User from '../models/User.js';
export const authenticateToken = async (req, res, next) => {
    // BANK-GRADE SECURITY: Prioritize secure cookie, fallback to header for mobile
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : undefined);
    if (!token) {
        next(new AppError(401, 'Access token required'));
        return;
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (!decoded.userId) {
            throw new AppError(403, 'Invalid token payload');
        }
        // Security Hardening: Verify user exists and is active
        const user = await User.findById(decoded.userId).select('isActive role');
        if (!user) {
            throw new AppError(401, 'User no longer exists');
        }
        if (!user.isActive) {
            throw new AppError(403, 'Account is deactivated');
        }
        req.user = {
            userId: decoded.userId,
            id: decoded.userId,
            role: user.role || 'user',
        };
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError(401, 'Token expired'));
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError(401, 'Invalid token signature'));
        }
        next(error);
    }
};
export const requireRole = (roles) => {
    const roleGuard = (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            next(new AppError(403, 'Insufficient permissions'));
            return;
        }
        next();
    };
    return roleGuard;
};
