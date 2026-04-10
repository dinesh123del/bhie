import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
// Extremely strict rate limiter for AI operations to prevent API abuse
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: env.IS_PRODUCTION ? 30 : 100, // Limit each IP to 30 requests per hour in prod
    message: {
        success: false,
        message: 'Too many deep intelligence analysis requests. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Stricter limiter for Data Science file uploads
export const dsUploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: env.IS_PRODUCTION ? 15 : 50, // Limit each IP to 15 file analyses per hour
    message: {
        success: false,
        message: 'Data Science upload limit reached. To preserve system stability, try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Standard API Rate Limiter
export const apiLimiter = rateLimit({
    windowMs: env.REQUEST_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 mins default
    max: env.IS_PRODUCTION ? (env.REQUEST_RATE_LIMIT_MAX || 150) : 1500, // Safe default limits
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Authentication Rate Limiter (Brute-force protection)
export const authRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: env.IS_PRODUCTION ? 10 : 100, // Limit each IP to 10 login/register attempts per hour in prod
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
