/**
 * app.ts — Express Application Factory
 * ─────────────────────────────────────
 * All middleware, parsers, CORS, routes, and error handlers are configured here.
 * The HTTP server lifecycle (listen, shutdown) lives in server.ts.
 *
 * This separation enables:
 *   1. Supertest/integration testing against `app` without spinning up a port.
 *   2. Cleaner separation of concerns (boot vs. config).
 */
import crypto from 'crypto';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { apiLimiter, authRateLimiter } from './middleware/rateLimiters.js';
import { csrfProtection } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// ── Configuration & Global Security ─────────────────────────────────
app.disable('x-powered-by');
app.set('trust proxy', env.IS_PRODUCTION ? 1 : 0);
// ── Security Headers (Helmet) ───────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: env.IS_PRODUCTION ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://*.googleapis.com", "https://accounts.google.com", "https://*.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.googleusercontent.com", "https://*.razorpay.com", "https://images.unsplash.com", "https://*.unsplash.com"],
            connectSrc: ["'self'", "https://*.razorpay.com", "https://*.googleapis.com", "https://accounts.google.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
            mediaSrc: ["'self'", "https://*.mixkit.co", "https://assets.mixkit.co", "blob:"],
            objectSrc: ["'none'"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://accounts.google.com", "https://*.google.com"],
            upgradeInsecureRequests: [],
        },
    } : false,
    strictTransportSecurity: env.IS_PRODUCTION ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    } : false,
    referrerPolicy: { policy: 'same-origin' },
    frameguard: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
}));
// ── Standard Middleware ─────────────────────────────────────────────
// ── Early Health Routes (bypass heavy middleware) ───────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", mode: env.NODE_ENV });
});
app.get("/api/debug-ping", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        isProduction: env.IS_PRODUCTION
    });
});
// ── Standard Middleware ─────────────────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(morgan(env.IS_PRODUCTION ? 'combined' : 'dev'));
// ── CORS ────────────────────────────────────────────────────────────
const allowedOrigins = [
    env.CLIENT_URL,
    ...(env.CLIENT_URLS || []),
    "http://localhost:5001",
    "http://127.0.0.1:5001",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:5179",
    "http://localhost:5180",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://bizplus.ai",
    "https://app.bizplus.ai",
    "https://www.bizplus.ai",
    "https://bhie-frontend.vercel.app",
    "https://bhie-zeta.vercel.app",
    "https://client-phi-woad.vercel.app",
    "https://dinesh123del-bhie.vercel.app",
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins in development
        if (!env.IS_PRODUCTION)
            return callback(null, true);
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        // Check exact matches
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Allow Vercel preview deployments
        if (origin.match(/^https:\/\/bhie[\w-]*\.vercel\.app$/))
            return callback(null, true);
        if (origin.match(/^https:\/\/biz-plus[\w-]*\.vercel\.app$/))
            return callback(null, true);
        if (origin.match(/^https:\/\/client[\w-]*\.vercel\.app$/))
            return callback(null, true);
        if (origin.match(/^https:\/\/dinesh123del-bhie[\w-]*\.vercel\.app$/))
            return callback(null, true);
        if (origin.match(/^https:\/\/[\w-]+\.bizplus\.ai$/))
            return callback(null, true);
        callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    exposedHeaders: ['set-cookie', 'x-xsrf-token'],
}));
// ── Body Parsers ────────────────────────────────────────────────────
app.use(express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
        if (req.originalUrl?.includes('/webhook')) {
            req.rawBody = buf;
        }
    },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// ── Webhook Routes (mount BEFORE security middleware) ────────────────
import whatsappRoutes from './routes/whatsapp.js';
app.use('/webhook/whatsapp', whatsappRoutes);
import whatsappPaymentWebhook from './routes/whatsapp-payment-webhook.js';
app.use('/webhook/whatsapp-payment', whatsappPaymentWebhook);
// ── Security Middleware ─────────────────────────────────────────────
app.use(mongoSanitize());
app.use(hpp());
app.use(csrfProtection);
// ── CSRF Token Cookie Initializer ───────────────────────────────────
app.use((req, res, next) => {
    if (!req.cookies?.['XSRF-TOKEN']) {
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false,
            secure: env.IS_PRODUCTION,
            sameSite: 'lax',
            path: '/',
        });
    }
    next();
});
// ── Root Route ──────────────────────────────────────────────────────
app.get("/", (_req, res) => {
    if (env.IS_PRODUCTION) {
        const indexPath = path.join(__dirname, '../../client/dist/index.html');
        res.sendFile(indexPath);
    }
    else {
        res.redirect(env.CLIENT_URL || 'http://localhost:5173');
    }
});
// ── API Routes (Standard) ───────────────────────────────────────────
import apiRouter from './routes/apiRouter.js';
app.use('/api', apiLimiter, apiRouter);
import subscriptionsRouter from './routes/subscriptions.js';
import { authenticateToken } from './middleware/auth.js';
app.use('/api/subscriptions', authenticateToken, subscriptionsRouter);
import adminWhatsAppAnalytics from './routes/admin-whatsapp-analytics.js';
app.use('/api/admin/whatsapp', adminWhatsAppAnalytics);
import partnerApiRoutes from './routes/partner-api.js';
app.use('/api/partner/v2', partnerApiRoutes);
import languageRoutes from './routes/language.js';
app.use('/api/language', languageRoutes);
import voiceTestRoutes from './routes/voice-test.js';
app.use('/api/voice-test', voiceTestRoutes);
import referralRoutes from './routes/referralRoutes.js';
app.use('/api/referrals', referralRoutes);
import usageRoutes from './routes/usageRoutes.js';
app.use('/api/usage', usageRoutes);
import sentinelRoutes from './routes/sentinel.js';
app.use('/api/sentinel', sentinelRoutes);
// ── Static Serve & App Catch-All ───────────────────────────────────
if (env.IS_PRODUCTION) {
    const clientBuildPath = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientBuildPath));
    // SPA Catch-all: ONLY for non-API routes
    app.get(/^(?!\/api).*$/, (_req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}
// ── Error Handlers ──────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
export { authRateLimiter };
