import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js';
const router = express.Router();
const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
const registerSchema = z.object({
    name: z.string().trim().min(1, 'Name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
const googleOAuthEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
if (googleOAuthEnabled) {
    passport.use(new GoogleStrategy({
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user && profile.emails?.[0]?.value) {
                const email = profile.emails[0].value;
                user = await User.findOne({ email });
                if (user) {
                    user.googleId = profile.id;
                    await user.save();
                }
                else {
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        googleId: profile.id,
                        role: 'user',
                        plan: 'free',
                    });
                }
            }
            if (!user) {
                done(new AppError(400, 'No email provided by Google'));
                return;
            }
            done(null, {
                userId: user._id.toString(),
                id: user._id.toString(),
                role: user.role,
            });
        }
        catch (error) {
            done(error);
        }
    }));
}
passport.serializeUser((user, done) => {
    done(null, user.userId);
});
passport.deserializeUser(async (userId, done) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            done(null, false);
            return;
        }
        done(null, {
            userId: user._id.toString(),
            id: user._id.toString(),
            role: user.role,
        });
    }
    catch (error) {
        done(error);
    }
});
const generateToken = (userId, role) => {
    const signOptions = {
        expiresIn: env.JWT_EXPIRES_IN,
    };
    return jwt.sign({ userId, role }, env.JWT_SECRET, signOptions);
};
router.post('/login', sensitiveLimiter, asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError(401, 'Invalid credentials');
    }
    if ('refreshSubscriptionStatus' in user && typeof user.refreshSubscriptionStatus === 'function') {
        await user.refreshSubscriptionStatus();
    }
    const token = generateToken(user._id.toString(), user.role);
    // BANK-GRADE SECURITY: Set httpOnly cookie
    setAuthCookie(res, token);
    res.json({
        token, // Still returning token for mobile app compatibility
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: typeof user.getEffectivePlan === 'function' ? user.getEffectivePlan() : user.plan,
            isActive: user.isActive,
            expiryDate: user.planExpiry?.toISOString() || null,
            usageCount: user.usageCount,
        },
    });
}));
router.post('/register', sensitiveLimiter, asyncHandler(async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError(400, 'User already exists');
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString(), user.role);
    // BANK-GRADE SECURITY: Set httpOnly cookie
    setAuthCookie(res, token);
    res.status(201).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan,
            isActive: user.isActive,
            usageCount: user.usageCount,
        }
    });
}));
router.get('/google', (req, res, next) => {
    if (!googleOAuthEnabled) {
        next(new AppError(503, 'Google OAuth is not configured'));
        return;
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
router.get('/google/callback', (req, res, next) => {
    if (!googleOAuthEnabled) {
        next(new AppError(503, 'Google OAuth is not configured'));
        return;
    }
    passport.authenticate('google', { session: false }, (error, user) => {
        if (error) {
            next(error);
            return;
        }
        if (!user) {
            next(new AppError(401, 'Authentication failed'));
            return;
        }
        const token = generateToken(user.userId, user.role);
        // Set cookie for browser sessions
        setAuthCookie(res, token);
        // REDACTED: No longer passing token in URL for security
        const redirectUrl = new URL('/dashboard', env.CLIENT_URL);
        redirectUrl.searchParams.set('from', 'google');
        res.redirect(redirectUrl.toString());
    })(req, res, next);
});
router.post('/google', sensitiveLimiter, asyncHandler(async (req, res) => {
    const { token: googleToken } = req.body;
    if (!googleToken) {
        throw new AppError(400, 'Google token is required');
    }
    const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new AppError(400, 'Invalid Google Token Payload');
    }
    let user = await User.findOne({ email: payload.email });
    if (user) {
        if (!user.googleId) {
            user.googleId = payload.sub;
        }
        if (payload.picture) {
            user.profilePic = payload.picture;
        }
        await user.save();
        if ('refreshSubscriptionStatus' in user && typeof user.refreshSubscriptionStatus === 'function') {
            await user.refreshSubscriptionStatus();
        }
    }
    else {
        user = await User.create({
            name: payload.name || 'Google User',
            email: payload.email,
            googleId: payload.sub,
            profilePic: payload.picture,
            role: 'user',
            plan: 'free',
            isActive: true,
            usageCount: 0,
        });
    }
    const token = generateToken(user._id.toString(), user.role);
    // Set cookie for browser sessions
    setAuthCookie(res, token);
    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: typeof user.getEffectivePlan === 'function' ? user.getEffectivePlan() : user.plan,
            isActive: user.isActive,
            expiryDate: user.planExpiry?.toISOString() || null,
            usageCount: user.usageCount,
            profilePic: user.profilePic,
        },
    });
}));
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const user = await User.findById(authUser.userId).select('-password');
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    if (typeof user.refreshSubscriptionStatus === 'function') {
        await user.refreshSubscriptionStatus();
    }
    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: typeof user.getEffectivePlan === 'function' ? user.getEffectivePlan() : user.plan,
            subscriptionStatus: user.isActive ? 'active' : 'inactive',
            expiryDate: user.planExpiry?.toISOString() || null,
            usageCount: user.usageCount,
            profilePic: user.profilePic,
        },
    });
}));
router.patch('/me', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const user = await User.findById(authUser.userId);
    if (!user)
        throw new AppError(404, 'User not found');
    // Validate update fields
    const updateSchema = z.object({
        name: z.string().trim().min(1, 'Name required').optional(),
        email: z.string().email('Invalid email').optional(),
        password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    });
    const validated = updateSchema.parse(req.body);
    if (validated.name)
        user.name = validated.name;
    if (validated.email && validated.email !== user.email) {
        const existing = await User.findOne({ email: validated.email });
        if (existing)
            throw new AppError(400, 'Email already in use');
        user.email = validated.email;
    }
    if (validated.password)
        user.password = validated.password;
    await user.save();
    res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: typeof user.getEffectivePlan === 'function' ? user.getEffectivePlan() : user.plan,
            subscriptionStatus: user.isActive ? 'active' : 'inactive',
            expiryDate: user.planExpiry?.toISOString() || null,
            usageCount: user.usageCount,
            profilePic: user.profilePic,
        },
    });
}));
router.post('/logout', (_req, res) => {
    clearAuthCookie(res);
    res.json({ message: 'Logged out successfully' });
});
/**
 * BANK-GRADE SECURITY: CSRF Protection Endpoint
 * Returns a CSRF token for the frontend to use in subsequent requests.
 */
router.get('/csrf-token', (req, res) => {
    // Use cryptographically secure random bytes
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
        httpOnly: false, // Accessible by JS for CSRF headers
        secure: env.IS_PRODUCTION,
        sameSite: 'lax',
        path: '/',
    });
    res.json({ csrfToken: token });
});
export default router;
