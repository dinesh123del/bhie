import express, { Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redisClient.js';
import { env } from '../config/env.js';
import { AIEngine } from '../utils/aiEngine.js';
import { asyncHandler } from '../middleware/asyncHandler.js';


const router = express.Router();

interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: {
    nodeEnv: string;
    missingCriticalReady: boolean;
    missingVars: string[];
  };
  services: {
    database: { status: 'up' | 'down'; latency?: number };
    redis: { status: 'up' | 'down' };
    ai: {
      openai: 'active' | 'inactive';
      claude: 'active' | 'inactive';
      blackbox: 'active' | 'inactive';
    };
  };
}

router.get(
  '/report',
  asyncHandler(async (_req, res: Response) => {
    const start = Date.now();
    const missingVars: string[] = [];

    // 1. Env Var Check
    const criticalVars = ['MONGO_URI', 'JWT_SECRET', 'OPENAI_API_KEY'];
    criticalVars.forEach(v => {
      if (!(env as any)[v]) missingVars.push(v);
    });

    // 2. Database Check
    let dbStatus: 'up' | 'down' = 'down';
    try {
      if (mongoose.connection.readyState === 1) dbStatus = 'up';
    } catch {}

    // 3. Redis Check
    let redisStatus: 'up' | 'down' = 'down';
    try {
      if (redisClient.isReady) redisStatus = 'up';
    } catch {}

    // 4. Build Report
    const report: HealthReport = {
      status: dbStatus === 'up' && missingVars.length === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: env.NODE_ENV,
        missingCriticalReady: missingVars.length === 0,
        missingVars
      },
      services: {
        database: { status: dbStatus, latency: Date.now() - start },
        redis: { status: redisStatus },
        ai: {
          openai: env.OPENAI_API_KEY ? 'active' : 'inactive',
          claude: env.CLAUDE_API_KEY ? 'active' : 'inactive',
          blackbox: env.BLACKBOX_API_KEY ? 'active' : 'inactive'
        }
      }
    };

    if (dbStatus === 'down') report.status = 'unhealthy';

    res.json(report);
  })
);

export default router;
