import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Standard API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: env.REQUEST_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: env.REQUEST_RATE_LIMIT_MAX || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * BANK-GRADE SECURITY: Sensitive operation limiter (Auth, Payments)
 * Strictly limits attempts to block brute-force attacks.
 */
export const sensitiveLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: 5, // Bank-grade strictness: 5 attempts max per window
  message: {
    success: false,
    message: 'Too many consecutive attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
