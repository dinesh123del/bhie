import './config/env.js'; // Ensure env is loaded first
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { Server } from 'http';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/appError.js';
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

// 1. Secure CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = env.CLIENT_URLS.length > 0 ? env.CLIENT_URLS : ['http://localhost:5173', 'http://127.0.0.1:5173'];
    
    if (env.IS_PRODUCTION) {
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    } else {
        callback(null, true);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Body Parser
app.use(express.json());

// --- Structured Routes ---
import authRoutes from './routes/auth.js';
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is LIVE 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Original routes
app.use('/api', apiLimiter, apiRouter);

// --- Global Error Handler ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Server Lifecycle ---
let server: any = null;

async function startServer(): Promise<void> {
  const PORT = process.env.PORT || 5000;
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
        console.log(`🚀 Dashboard LIVE on PORT ${PORT}`);
        resolve();
    });
  });
}

async function init(): Promise<void> {
  try {
    logger.info('🏗️  Starting BHIE Integration Engine...');
    
    await ensureUploadDir();
    
    logger.info('🔌 Connecting to infrastructure...');
    
    // Connect to MongoDB (optional for hard fix)
    try {
      await connectDB();
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed, but starting app anyway');
    }
    
    await startServer();
  } catch (error) {
    logger.error('❌ Fatal: BHIE startup failed:', error);
  }
}


// Global process handlers
const gracefulShutdown = async (signal: string) => {
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
  } else {
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
