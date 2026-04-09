import './config/env.js'; // Ensure env is loaded first
import crypto from 'crypto';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import OpenAI from 'openai';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiters.js';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { startCronJobs } from './jobs/cron.js';
import logger from './utils/logger.js';
import RealTimeIntelligence from './services/realTimeIntelligence.js';
import AutonomousAgents from './services/autonomousAgents.js';
import NeuralPredictionEngine from './services/neuralPredictionEngine.js';
import QuantumArchitecture from './services/quantumArchitecture.js';
const app = express();
// --- Configuration & Global Security ---
app.disable('x-powered-by');
app.set('trust proxy', env.IS_PRODUCTION ? 1 : 0);
// Global Middlewares
// Security headers via Helmet
app.use(helmet({
    contentSecurityPolicy: env.IS_PRODUCTION ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://*.googleapis.com", "https://accounts.google.com", "https://*.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.googleusercontent.com", "https://*.razorpay.com", "https://images.unsplash.com", "https://*.unsplash.com"],
            connectSrc: ["'self'", "https://*.razorpay.com", "https://api.openai.com", "https://api.anthropic.com", "https://*.googleapis.com", "https://accounts.google.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
            mediaSrc: ["'self'", "https://*.mixkit.co", "https://assets.mixkit.co", "blob:"],
            objectSrc: ["'none'"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://accounts.google.com", "https://*.google.com"],
            upgradeInsecureRequests: [],
        },
    } : false, // Disable CSP in dev for easier testing
    // HSTS: Force HTTPS for 1 year with subdomains
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
app.use(compression());
app.use(cookieParser());
app.use(morgan(env.IS_PRODUCTION ? 'combined' : 'dev'));
// CORS Configuration
const allowedOrigins = [
    env.CLIENT_URL,
    ...(env.CLIENT_URLS || []),
    "http://localhost:5001",
    "http://127.0.0.1:5001",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://bizplus.ai",
    "https://app.bizplus.ai",
    "https://www.bizplus.ai",
    "https://bhie-frontend.vercel.app",
    "https://client-phi-woad.vercel.app",
    "https://dinesh123del-bhie.vercel.app",
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        // Allow exact matches
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Allow any Vercel preview URL for this project
        if (origin.match(/^https:\/\/bhie[\w-]*\.vercel\.app$/))
            return callback(null, true);
        if (origin.match(/^https:\/\/biz-plus[\w-]*\.vercel\.app$/))
            return callback(null, true);
        if (origin.match(/^https:\/\/client[\w-]*\.vercel\.app$/))
            return callback(null, true);
        if (origin.match(/^https:\/\/dinesh123del-bhie[\w-]*\.vercel\.app$/))
            return callback(null, true);
        // Allow bizplus.ai subdomains
        if (origin.match(/^https:\/\/[\w-]+\.bizplus\.ai$/))
            return callback(null, true);
        // Allow localtunnel URLs only in development
        if (!env.IS_PRODUCTION && origin.endsWith('.loca.lt'))
            return callback(null, true);
        callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    exposedHeaders: ['set-cookie', 'x-xsrf-token']
}));
// Body Parser with Safety Limits & Verification
app.use(express.json({
    limit: '10mb', // Protect against large payload DoS
    verify: (req, _res, buf) => {
        if (req.originalUrl?.includes('/webhook')) {
            req.rawBody = buf;
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// NEW: WhatsApp Business Bot Webhooks (mount before security middleware for query params)
import whatsappRoutes from './routes/whatsapp.js';
app.use('/webhook/whatsapp', whatsappRoutes);
// NEW: WhatsApp Payment Webhook for Razorpay
import whatsappPaymentWebhook from './routes/whatsapp-payment-webhook.js';
app.use('/webhook/whatsapp-payment', whatsappPaymentWebhook);
// Security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution
// CSRF protection (temporarily disabled - custom XSRF-TOKEN cookie protection active)
// app.use(csrfProtection);
// CSRF Token Initializer for the Frontend (Cookie-based sync)
app.use((req, res, next) => {
    // If the XSRF-TOKEN cookie is missing, set it (e.g. from a random source or session-bound)
    // Our custom middleware will check this cookie matches the X-XSRF-TOKEN header
    if (!req.cookies?.['XSRF-TOKEN']) {
        // Use cryptographically secure random bytes
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false, // Must be readable by the client to send back in header
            secure: env.IS_PRODUCTION,
            sameSite: 'lax',
            path: '/'
        });
    }
    next();
});
// --- Structured Routes ---
// Handled by apiRouter under /api
// Root route - redirect to frontend in development, serve SPA in production
app.get("/", (req, res) => {
    if (env.IS_PRODUCTION) {
        // In production, the frontend static files are served, so this won't be reached
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    }
    else {
        // In development, redirect to the frontend dev server
        res.redirect(env.CLIENT_URL || 'http://localhost:5173');
    }
});
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.get("/api/debug-ping", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), message: "Server is alive and updated!" });
});
// Rate limiting handled in middleware/rateLimiters.js
// Original routes
import apiRouter from './routes/apiRouter.js';
app.use('/api', apiLimiter, apiRouter);
// NEW: Admin WhatsApp Analytics APIs
import adminWhatsAppAnalytics from './routes/admin-whatsapp-analytics.js';
app.use('/api/admin/whatsapp', adminWhatsAppAnalytics);
// NEW: Partner API v2 for Banks, Accountants, Fintechs
import partnerApiRoutes from './routes/partner-api.js';
app.use('/api/partner/v2', partnerApiRoutes);
// NEW: Language Detection and Translation API
import languageRoutes from './routes/language.js';
app.use('/api/language', languageRoutes);
// NEW: Voice Input Testing API
import voiceTestRoutes from './routes/voice-test.js';
app.use('/api/voice-test', voiceTestRoutes);
// NEW: Referral System API
import referralRoutes from './routes/referralRoutes.js';
app.use('/api/referrals', referralRoutes);
// NEW: Usage-Based Billing API
import usageRoutes from './routes/usageRoutes.js';
app.use('/api/usage', usageRoutes);
// Serve Static Frontend (SPA Catch-all)
if (env.IS_PRODUCTION) {
    const clientBuildPath = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}
// --- Global Error Handler ---
app.use(notFoundHandler);
app.use(errorHandler);
// --- Server Lifecycle ---
let server = null;
let realTimeIntelligence = null;
let autonomousAgents = null;
let neuralPredictionEngine = null;
let quantumArchitecture = null;
async function startServer() {
    const PORT = env.PORT || 5000;
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, () => {
            logger.info(`🚀 Biz Plus Dashboard LIVE on PORT ${PORT}`);
            // Initialize Next-Level Intelligence Systems
            initializeIntelligenceSystems();
            resolve();
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${PORT} is already in use. Please run 'bash kill-port.sh' to clear it.`);
            }
            else {
                logger.error('❌ Server failed to start:', err);
            }
            reject(err);
        });
    });
}
async function initializeIntelligenceSystems() {
    try {
        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: env.OPENAI_API_KEY,
        });
        if (!env.OPENAI_API_KEY) {
            logger.warn('⚠️ OpenAI API key not found. AI features will be limited.');
            return;
        }
        // Initialize Real-Time Intelligence
        realTimeIntelligence = new RealTimeIntelligence(server);
        logger.info('📊 Real-time business monitoring initialized');
        // Initialize Business Analysis Tools
        autonomousAgents = new AutonomousAgents(openai, realTimeIntelligence);
        logger.info('🔍 Business analysis tools initialized');
        // Initialize Neural Prediction Engine
        neuralPredictionEngine = new NeuralPredictionEngine();
        logger.info('🧠 Neural prediction engine initialized');
        // Initialize Quantum Architecture
        quantumArchitecture = new QuantumArchitecture();
        logger.info('⚛️ Quantum computing architecture initialized');
        // Make systems available to routes via app.locals
        app.locals.realTimeIntelligence = realTimeIntelligence;
        app.locals.autonomousAgents = autonomousAgents;
        app.locals.neuralPredictionEngine = neuralPredictionEngine;
        app.locals.quantumArchitecture = quantumArchitecture;
        // Start monitoring business metrics
        logger.info('📈 Business insights engine started');
        // Start neural network training in background
        setTimeout(async () => {
            if (neuralPredictionEngine) {
                await neuralPredictionEngine.trainGlobalModel();
                logger.info('🎯 Global neural network training completed');
            }
        }, 30000); // Start after 30 seconds
        // Emit system ready event
        setTimeout(() => {
            logger.info('✨ Advanced business analytics with neural prediction fully operational');
        }, 2000);
    }
    catch (error) {
        logger.error('❌ Failed to initialize intelligence systems:', error);
    }
}
async function init() {
    try {
        logger.info('🏗️  Starting Biz Plus Integration Engine...');
        // await ensureUploadDir(); // Temporarily stubbed to fix startup - uploads dir will be created on first upload
        logger.info('🔌 Connecting to infrastructure...');
        // Connect to MongoDB
        try {
            await connectDB();
        }
        catch {
            logger.warn('⚠️ MongoDB connection failed, but starting app anyway');
        }
        // Redis connection is required for workers
        // await connectRedis(); // Redis optional - stubbed for startup
        // Start background workers and cron jobs
        // if (isRedisConnected()) { ... } // Workers stubbed - core app starts without Redis
        startCronJobs();
        logger.info('⏰ Background cron engine initialized');
        // await createDefaultAdmin(); // Run manually if needed: utils/createDefaultAdmin.ts
        await startServer();
        logger.info('🚀 Biz Plus Engine initialised successfully');
    }
    catch (error) {
        logger.error('❌ Fatal: Biz Plus startup failed:', error);
        process.exit(1);
    }
}
// Global process handlers
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received. Closing connections...`);
    if (server) {
        server.close(async () => {
            await disconnectDB();
            console.log('✅ Shutdown complete. Bye!');
            process.exit(0);
        });
        setTimeout(() => {
            console.error('⚠️ Could not close connections in time, forceful exit.');
            process.exit(1);
        }, 10000).unref();
    }
    else {
        process.exit(0);
    }
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
    process.exit(1);
});
// Launch
void init();
export default app;
