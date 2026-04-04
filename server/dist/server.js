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
import { ensureUploadDir } from './utils/uploads.js';
import apiRouter from './routes/apiRouter.js';
import { disconnectRedis } from './config/redisClient.js';
import logger from './utils/logger.js';
const app = express();
// --- Configuration & Global Security ---
app.disable('x-powered-by'); // Already disabled but good for clarity
app.set('trust proxy', env.IS_PRODUCTION ? 1 : 0);
// Global Middlewares
app.use(helmet({
    contentSecurityPolicy: env.IS_PRODUCTION ? undefined : false, // Disable CSP in dev for easier testing
}));
app.use(compression());
app.use(cookieParser());
app.use(morgan(env.IS_PRODUCTION ? 'combined' : 'dev'));
// CORS Configuration
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://bhie-frontend.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
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
// NoSQL Injection Protection (Manual Sanitization)
app.use((req, _res, next) => {
    const sanitize = (obj) => {
        if (obj instanceof Object) {
            for (const key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                }
                else {
                    sanitize(obj[key]);
                }
            }
        }
    };
    sanitize(req.body);
    sanitize(req.params);
    sanitize(req.query);
    next();
});
// --- Structured Routes ---
// Handled by apiRouter under /api
app.get("/", (req, res) => {
    res.send("Backend is LIVE 🚀");
});
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
// Global Rate Limiting
const apiLimiter = rateLimit({
    windowMs: env.REQUEST_RATE_LIMIT_WINDOW_MS,
    max: env.IS_PRODUCTION ? env.REQUEST_RATE_LIMIT_MAX : env.REQUEST_RATE_LIMIT_MAX * 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
});
// Original routes
app.use('/api', apiLimiter, apiRouter);
// --- Global Error Handler ---
app.use(notFoundHandler);
app.use(errorHandler);
// --- Server Lifecycle ---
let server = null;
async function startServer() {
    const PORT = process.env.PORT || 5000;
    return new Promise((resolve) => {
        server = app.listen(PORT, () => {
            console.log(`🚀 Dashboard LIVE on PORT ${PORT}`);
            resolve();
        });
    });
}
async function init() {
    try {
        logger.info('🏗️  Starting BHIE Integration Engine...');
        await ensureUploadDir();
        logger.info('🔌 Connecting to infrastructure...');
        // Connect to MongoDB (optional for hard fix)
        try {
            await connectDB();
        }
        catch (err) {
            console.warn('⚠️ MongoDB connection failed, but starting app anyway');
        }
        await startServer();
    }
    catch (error) {
        logger.error('❌ Fatal: BHIE startup failed:', error);
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
