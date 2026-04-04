import './config/env.js'; // Ensure env is loaded first
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createDefaultAdmin } from './utils/createDefaultAdmin.js';
import { ensureUploadDir, uploadDir } from './utils/uploads.js';
import apiRouter from './routes/apiRouter.js';
import { SubscriptionManager } from './utils/subscriptionManager.js';
import { connectRedis, disconnectRedis, isRedisConnected } from './config/redisClient.js';
import logger from './utils/logger.js';
const app = express();
// --- Configuration & Middleware ---
app.disable('x-powered-by');
app.set('trust proxy', env.IS_PRODUCTION ? 1 : 0);
// Global Rate Limiting
const apiLimiter = rateLimit({
    windowMs: env.REQUEST_RATE_LIMIT_WINDOW_MS,
    max: env.IS_PRODUCTION ? env.REQUEST_RATE_LIMIT_MAX : env.REQUEST_RATE_LIMIT_MAX * 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
});
// CORS Configuration as per requirements
const corsOptions = {
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    optionsSuccessStatus: 204,
};
// Security and Optimization
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(morgan(env.IS_PRODUCTION ? 'combined' : 'dev', { skip: (req) => req.path === '/api/health' }));
app.use(cookieParser());
// Body Parsers (with Webhook exception)
const jsonParser = express.json({ limit: env.BODY_LIMIT });
const urlEncodedParser = express.urlencoded({ extended: true, limit: env.BODY_LIMIT });
app.use((req, res, next) => {
    if (req.originalUrl.includes('/webhook'))
        return next();
    jsonParser(req, res, next);
});
app.use(urlEncodedParser);
// Static Files
app.use('/uploads', express.static(uploadDir, {
    fallthrough: false,
    maxAge: env.IS_PRODUCTION ? '1d' : 0,
}));
// --- Routes ---
app.get('/', (_req, res) => {
    res.json({
        status: 'OK',
        message: 'BHIE API running securely',
        environment: env.NODE_ENV,
        version: '1.0.0'
    });
});
// Centralized API Routes (includes /auth, /ai, /analytics etc.)
app.use('/api', apiLimiter, apiRouter);
// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);
// --- Server Lifecycle ---
import { initSocket } from './socket/socketManager.js';
let server = null;
async function startServer() {
    const port = env.PORT;
    return new Promise((resolve) => {
        server = app.listen(port, '0.0.0.0', () => {
            if (server)
                initSocket(server);
            logger.info(`🚀 BHIE Engine initialised successfully`);
            logger.info(`📡 URL: http://localhost:${port}`);
            logger.info(`🌍 Env: ${env.NODE_ENV}`);
            resolve();
        });
    });
}
async function init() {
    try {
        logger.info('🏗️  Starting BHIE Integration Engine...');
        await ensureUploadDir();
        logger.info('🔌 Connecting to infrastructure...');
        // Connect to MongoDB (required)
        await connectDB();
        // Connect to Redis (optional — gracefully degrades)
        await connectRedis();
        logger.info('⚙️  Configuring BHIE services...');
        await createDefaultAdmin();
        SubscriptionManager.startExpiryChecker();
        // Initialize workers only if Redis is available
        if (isRedisConnected()) {
            try {
                const { initUploadWorker } = await import('./workers/uploadWorker.js');
                initUploadWorker();
                const { initEventWorker } = await import('./workers/eventWorker.js');
                initEventWorker();
                const { initPaymentWorker } = await import('./workers/paymentWorker.js');
                initPaymentWorker();
                // Start automated task engines
                const { getActionGenerationQueue } = await import('./config/queues.js');
                const actionQueue = getActionGenerationQueue();
                await actionQueue.add('daily_audit', {}, {
                    repeat: { pattern: '0 6 * * *' } // Every day at 6 AM
                });
                console.log('✅ Background workers initialized');
            }
            catch (workerError) {
                console.warn('⚠️ Background workers could not be initialized:', workerError);
            }
        }
        else {
            console.warn('⚠️ Redis unavailable — background workers disabled');
        }
        // Initialize standalone cron engine (works without Redis)
        const { startCronJobs } = await import('./jobs/cron.js');
        startCronJobs();
        await startServer();
    }
    catch (error) {
        logger.error('❌ Fatal: BHIE startup failed:', error);
        process.exit(1);
    }
}
// Global process handlers
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received. Closing connections...`);
    if (server) {
        server.close(async () => {
            await disconnectRedis();
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
