import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) {
        next(new AppError(401, 'Access token required'));
        return;
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (!decoded.userId) {
            throw new AppError(403, 'Invalid token');
        }
        req.user = {
            userId: decoded.userId,
            id: decoded.userId,
            role: decoded.role || 'user',
        };
        next();
    }
    catch (error) {
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
