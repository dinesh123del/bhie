import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { z } from 'zod';
import { env } from '../config/env';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { AppError } from '../utils/appError';
import { requireUser } from '../utils/request';
const router = express.Router();
const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password too short'),
});
const registerSchema = z.object({
    name: z.string().trim().min(1, 'Name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
const googleOAuthEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
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
                        role: 'customer',
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
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError(401, 'Invalid credentials');
    }
    if ('refreshSubscriptionStatus' in user && typeof user.refreshSubscriptionStatus === 'function') {
        await user.refreshSubscriptionStatus();
    }
    const token = generateToken(user._id.toString(), user.role);
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
            recordCount: user.recordCount,
        },
    });
}));
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError(409, 'User already exists');
    }
    const user = await User.create({
        name,
        email,
        password,
        role: 'customer',
    });
    const token = generateToken(user._id.toString(), user.role);
    res.status(201).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: ('getEffectivePlan' in user && typeof user.getEffectivePlan === 'function') ? user.getEffectivePlan() : user.plan,
            subscriptionStatus: user.isActive ? 'active' : 'inactive',
            expiryDate: user.planExpiry?.toISOString() || null,
            recordCount: user.recordCount,
        },
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
        const redirectUrl = new URL('/login', env.CLIENT_URL);
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('from', 'google');
        res.redirect(redirectUrl.toString());
    })(req, res, next);
});
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
            recordCount: user.recordCount,
        },
    });
}));
router.post('/logout', (_req, res) => {
    res.json({ message: 'Logged out successfully' });
});
export default router;
