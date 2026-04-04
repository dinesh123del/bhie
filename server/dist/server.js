import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { AppError } from './utils/appError';
import { createDefaultAdmin } from './utils/createDefaultAdmin';
import { ensureUploadDir, uploadDir } from './utils/uploads';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';
import companyRoutes from './routes/company';
import paymentRoutes from './routes/payments';
import recordRoutes from './routes/records';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';
import searchRoutes from './routes/search';
import uploadRoutes from './routes/upload';
import alertsRoutes from './routes/alerts';
import insightsRoutes from './routes/insights';
import transactionsRoutes from './routes/transactions';
import subscriptionRoutes from './routes/subscription';
import './workers/uploadWorker'; // Start the upload worker
import { SubscriptionManager } from './utils/subscriptionManager';
import { connectRedis, disconnectRedis } from './config/redisClient.js';
const app = express();
const DEFAULT_PORT = env.PORT;
const devOriginPatterns = [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
    /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/,
];
const jsonParser = express.json({ limit: env.BODY_LIMIT });
const urlEncodedParser = express.urlencoded({ extended: true, limit: env.BODY_LIMIT });
const apiLimiter = rateLimit({
    windowMs: env.REQUEST_RATE_LIMIT_WINDOW_MS,
    max: env.IS_PRODUCTION ? env.REQUEST_RATE_LIMIT_MAX : env.REQUEST_RATE_LIMIT_MAX * 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        message: 'Too many requests. Please try again later.',
    },
});
const authLimiter = rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        message: 'Too many authentication attempts. Please try again later.',
    },
});
const isAllowedOrigin = (origin) => {
    if (!origin) {
        return true;
    }
    if (env.CLIENT_URLS.includes(origin)) {
        return true;
    }
    if (!env.IS_PRODUCTION) {
        return devOriginPatterns.some((pattern) => pattern.test(origin));
    }
    return false;
};
const corsOptions = {
    origin(origin, callback) {
        if (!origin || env.CLIENT_URLS.includes(origin) || isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new AppError(403, `CORS blocked for origin: ${origin || 'unknown'}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
};
app.disable('x-powered-by');
app.set('trust proxy', env.IS_PRODUCTION ? 1 : 0);
app.use(morgan(env.IS_PRODUCTION ? 'combined' : 'dev', {
    skip: (req) => req.path === '/api/health',
}));
app.use(helmet({
    crossOriginResourcePolicy: {
        policy: 'cross-origin',
    },
}));
app.use(compression());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use('/api', apiLimiter);
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook' || req.originalUrl === '/api/payment/webhook') {
        next();
        return;
    }
    jsonParser(req, res, next);
});
app.use(urlEncodedParser);
app.use('/uploads', express.static(uploadDir, {
    fallthrough: false,
    index: false,
    maxAge: env.IS_PRODUCTION ? '1d' : 0,
}));
app.get('/', (_req, res) => {
    res.json({
        status: 'OK',
        message: 'BHIE API running',
        environment: env.NODE_ENV,
    });
});
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'OK',
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
app.get('/api/test', (_req, res) => {
    res.json({
        message: 'Backend test successful - Phase 3 complete!',
        mongodbStatus: 'check /api/health for connection',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/server-info', (req, res) => {
    res.json({
        port: activePort,
        url: `${req.protocol}://${req.get('host')}`,
        api: `${req.protocol}://${req.get('host')}/api`,
    });
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
let server = null;
let activePort = DEFAULT_PORT;
async function startServer() {
    activePort = DEFAULT_PORT;
    return new Promise((resolve, reject) => {
        server = app.listen(activePort, '0.0.0.0', () => {
            if (!env.IS_PRODUCTION)
                console.log(`🚀 BHIE backend running on port ${activePort}`);
            if (!env.IS_PRODUCTION)
                console.log(`📦 Upload directory: ${path.relative(process.cwd(), uploadDir)}`);
            resolve();
        });
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                reject(new AppError(500, `Port ${activePort} is already in use. Stop the existing process or update PORT in server/.env.`));
                return;
            }
            reject(error);
        });
    });
}
async function init() {
    try {
        await ensureUploadDir();
        await connectDB();
        await connectRedis();
        await createDefaultAdmin();
        SubscriptionManager.startExpiryChecker(); // Start subscription expiry checker
        await startServer();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown startup error';
        console.error('❌ Startup failed:', message);
        process.exit(1);
    }
}
void init();
async function shutdown(signal) {
    console.log(`\n🛑 ${signal} received`);
    if (server) {
        server.close(async () => {
            await disconnectRedis();
            await disconnectDB();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
        return;
    }
    await disconnectRedis();
    await disconnectDB();
    process.exit(0);
}
process.on('SIGINT', () => {
    void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled rejection:', reason);
    process.exit(1);
});
export default app;
