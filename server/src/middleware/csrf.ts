import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { env } from '../config/env.js';

/**
 * BANK-GRADE SECURITY: Anti-CSRF Middleware
 * This middleware verifies that requests originated from the trusted frontend.
 * It checks for the presence and validity of the XSRF-TOKEN.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Allow safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF check for mobile apps (identified by lack of 'Origin' or specific User-Agent/Secret)
  // or requests that provide a valid Bearer token in the header (since those aren't vulnerable to CSRF)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  const csrfTokenFromCookie = req.cookies?.['XSRF-TOKEN'];
  const csrfTokenFromHeader = req.headers['x-xsrf-token'];

  if (!csrfTokenFromCookie || csrfTokenFromCookie !== csrfTokenFromHeader) {
    // If in dev, we might want to log this but allow it to simplify initial testing
    if (!env.IS_PRODUCTION && !csrfTokenFromHeader) {
       console.warn('⚠️ Missing CSRF token in development');
       return next();
    }
    
    return next(new AppError(403, 'CSRF token mismatch or missing. Access denied.'));
  }

  next();
};
