import { env } from '../config/env.js';
/**
 * BANK-GRADE SECURITY: Sets a highly secure, httpOnly, sameSite, and secure cookie.
 * This prevents XSS from stealing the session token.
 *
 * NOTE: In production the frontend (Vercel) and backend (Render) live on
 * different origins, so we MUST use sameSite='none' + secure=true to allow
 * the cookie to travel cross-origin. 'strict' would silently block it.
 */
export const setAuthCookie = (res, token) => {
    const isSecure = env.IS_PRODUCTION;
    res.cookie('token', token, {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: isSecure, // Only sends over HTTPS in production
        sameSite: isSecure ? 'none' : 'lax', // 'none' required for cross-origin cookie delivery
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
};
/**
 * BANK-GRADE SECURITY: Clears the auth cookie.
 */
export const clearAuthCookie = (res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: env.IS_PRODUCTION,
        sameSite: env.IS_PRODUCTION ? 'none' : 'lax',
        path: '/',
    });
};
