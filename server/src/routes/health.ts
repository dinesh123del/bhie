import express, { Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redisClient.js';
import { env } from '../config/env.js';
import { monitoringService } from '../services/monitoringService.js';
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
    smartEngine: {
      status: 'active' | 'inactive';
      provider: string;
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
    } catch {
      dbStatus = 'down';
    }

    // 3. Redis Check
    let redisStatus: 'up' | 'down' = 'down';
    try {
      if (redisClient.isReady) redisStatus = 'up';
    } catch {
      redisStatus = 'down';
    }

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
        smartEngine: {
          status: (env.OPENAI_API_KEY || env.CLAUDE_API_KEY || env.BLACKBOX_API_KEY) ? 'active' : 'inactive',
          provider: env.OPENAI_API_KEY ? 'openai' : env.CLAUDE_API_KEY ? 'claude' : env.BLACKBOX_API_KEY ? 'blackbox' : 'none'
        }
      }
    };

    if (dbStatus === 'down') report.status = 'unhealthy';

    res.json(report);
  })
);

/**
 * @route   GET /system/health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * @route   GET /system/health/ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/ready', asyncHandler(async (_req, res) => {
  const status = await monitoringService.getReadinessStatus();
  
  if (status.ready) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready', reason: status.reason });
  }
}));

/**
 * @route   GET /system/health/detailed
 * @desc    Detailed health status with metrics
 * @access  Private (Admin only)
 */
router.get('/detailed', asyncHandler(async (_req, res) => {
  const status = await monitoringService.getHealthStatus();
  res.json(status);
}));

/**
 * @route   GET /system/health/metrics
 * @desc    Prometheus-style metrics
 * @access  Private
 */
router.get('/metrics', asyncHandler(async (_req, res) => {
  const status = await monitoringService.getHealthStatus();
  const metrics = status.metrics || { totalRequests: 0, errorRate: 0, avgResponseTime: 0 };
  
  const prometheusMetrics = [
    '# HELP bhie_requests_total Total number of requests',
    '# TYPE bhie_requests_total counter',
    `bhie_requests_total ${metrics.totalRequests}`,
    '',
    '# HELP bhie_error_rate Error rate percentage',
    '# TYPE bhie_error_rate gauge',
    `bhie_error_rate ${metrics.errorRate}`,
    '',
    '# HELP bhie_response_time_average Average response time in ms',
    '# TYPE bhie_response_time_average gauge',
    `bhie_response_time_average ${metrics.avgResponseTime}`,
    '',
    '# HELP bhie_uptime_seconds Process uptime in seconds',
    '# TYPE bhie_uptime_seconds gauge',
    `bhie_uptime_seconds ${status.uptime}`,
  ].join('\n');
  
  res.set('Content-Type', 'text/plain');
  res.send(prometheusMetrics);
}));

export default router;
