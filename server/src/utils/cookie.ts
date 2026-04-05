import { Response } from 'express';
import { env } from '../config/env.js';

/**
 * BANK-GRADE SECURITY: Sets a highly secure, httpOnly, sameSite, and secure cookie.
 * This prevents XSS from stealing the session token.
 */
export const setAuthCookie = (res: Response, token: string) => {
  const isSecure = env.IS_PRODUCTION;
  
  res.cookie('token', token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: isSecure, // Only sends over HTTPS in production
    sameSite: isSecure ? 'none' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

/**
 * BANK-GRADE SECURITY: Clears the auth cookie.
 */
export const clearAuthCookie = (res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: env.IS_PRODUCTION ? 'none' : 'lax',
    path: '/',
  });
};
