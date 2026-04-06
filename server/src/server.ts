import './config/env.js'; // Ensure env is loaded first
import crypto from 'crypto';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { Server } from 'http';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiters.js';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { csrfProtection } from './middleware/csrf.js';
import { AppError } from './utils/appError.js';
import { createDefaultAdmin } from './utils/createDefaultAdmin.js';
import { ensureUploadDir, uploadDir } from './utils/uploads.js';
import apiRouter from './routes/apiRouter.js';
import { SubscriptionManager } from './utils/subscriptionManager.js';
import { connectRedis, disconnectRedis, isRedisConnected } from './config/redisClient.js';
import { initEventWorker } from './workers/eventWorker.js';
import { initUploadWorker } from './workers/uploadWorker.js';
import { startCronJobs } from './jobs/cron.js';
import logger from './utils/logger.js';

const app = express();

// --- Configuration & Global Security ---
app.disable('x-powered-by'); 
app.set('trust proxy', env.IS_PRODUCTION ? 1 : 0);

// Global Middlewares
// BANK-GRADE SECURITY: Strict Helmet Policy
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
  "https://bhie-frontend.vercel.app",
  "https://client-phi-woad.vercel.app",
  "https://dinesh123del-bhie.vercel.app",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Vercel preview URL for this project
    // Only allow known Vercel deployment patterns (tightened from wildcard)
    if (origin.match(/^https:\/\/finly[\w-]*\.vercel\.app$/)) return callback(null, true);
    if (origin.match(/^https:\/\/bhie[\w-]*\.vercel\.app$/)) return callback(null, true);
    if (origin.match(/^https:\/\/client[\w-]*\.vercel\.app$/)) return callback(null, true);
    if (origin.match(/^https:\/\/dinesh123del-finly[\w-]*\.vercel\.app$/)) return callback(null, true);
    if (origin.match(/^https:\/\/dinesh123del-bhie[\w-]*\.vercel\.app$/)) return callback(null, true);
    // Allow localtunnel URLs only in development
    if (!env.IS_PRODUCTION && origin.endsWith('.loca.lt')) return callback(null, true);
    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  exposedHeaders: ['set-cookie', 'x-xsrf-token']
}));

// Body Parser with Safety Limits & Verification
app.use(express.json({
  limit: '10mb', // Protect against large payload DoS
  verify: (req: any, _res, buf) => {
    if (req.originalUrl?.includes('/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// TOP-LEVEL SECURITY: NoSQL Injection & Parameter Pollution Protection
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// BANK-GRADE SECURITY: Anti-CSRF
app.use(csrfProtection);

// CSRF Token Initializer for the Frontend (Cookie-based sync)
app.use((req, res, next) => {
  // If the XSRF-TOKEN cookie is missing, set it (e.g. from a random source or session-bound)
  // Our custom middleware will check this cookie matches the X-XSRF-TOKEN header
  if (!req.cookies?.['XSRF-TOKEN']) {
    // SECURITY: Use cryptographically secure random bytes (NOT Math.random)
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

// Removed root text response so frontend serves on /
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/debug-ping", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), message: "Server is alive and updated!" });
});

// Global Rate Limiting is now imported from rateLimiters.js

// Original routes
app.use('/api', apiLimiter, apiRouter);

// Serve Static Frontend (SPA Catch-all)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
let server: any = null;

async function startServer(): Promise<void> {
  const PORT = env.PORT || 5000; 
  return new Promise((resolve, reject) => {
    server = app.listen(PORT, () => {
        logger.info(`🚀 Finly Dashboard LIVE on PORT ${PORT}`);
        resolve();
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use. Please run 'bash kill-port.sh' to clear it.`);
      }
      reject(err);
    });
  });
}

async function init(): Promise<void> {
  try {
    logger.info('🏗️  Starting Finly Integration Engine...');
    
    await ensureUploadDir();
    
    logger.info('🔌 Connecting to infrastructure...');
    
    // Connect to MongoDB
    try {
      await connectDB();
    } catch (err) {
      logger.warn('⚠️ MongoDB connection failed, but starting app anyway');
    }
    
    // Redis connection is required for workers
    await connectRedis();

    // Start background workers and cron jobs
    if (isRedisConnected()) {
      initEventWorker();
      initUploadWorker();
      logger.info('✅ Background workers initialized');
    } else {
      logger.warn('⚠️ Redis NOT connected. Workers will not start.');
    }
    
    startCronJobs();
    logger.info('⏰ Background cron engine initialized');

    await createDefaultAdmin();
    await startServer();
    
    logger.info('🚀 Finly Engine initialised successfully');
  } catch (error) {
    logger.error('❌ Fatal: Finly startup failed:', error);
    process.exit(1);
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
