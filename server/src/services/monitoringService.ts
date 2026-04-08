import { Request, Response } from 'express';
import os from 'os';
import mongoose from 'mongoose';
import { isRedisConnected } from '../config/redisClient.js';
import logger from '../utils/logger.js';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: 'up' | 'down'; responseTime: number };
    redis: { status: 'up' | 'down'; responseTime?: number };
    memory: { status: 'up' | 'down'; usage: number; limit: number };
    cpu: { status: 'up' | 'down'; load: number[] };
  };
  metrics?: {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

class MonitoringService {
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private readonly maxResponseTimeHistory = 100;

  /**
   * Track API request metrics
   */
  trackRequest(duration: number, statusCode: number): void {
    this.requestCount++;
    
    if (statusCode >= 400) {
      this.errorCount++;
    }
    
    this.responseTimes.push(duration);
    
    // Keep only recent history
    if (this.responseTimes.length > this.maxResponseTimeHistory) {
      this.responseTimes.shift();
    }
  }

  /**
   * Get current health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await this.runHealthChecks();
    
    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const downServices = Object.values(checks).filter(c => c.status === 'down').length;
    
    if (downServices >= 2) {
      status = 'unhealthy';
    } else if (downServices === 1) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
      metrics: this.getMetrics(),
    };
  }

  /**
   * Run individual health checks
   */
  private async runHealthChecks(): Promise<HealthStatus['checks']> {
    const [dbCheck, redisCheck, memoryCheck, cpuCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
      this.checkCPU(),
    ]);

    return {
      database: dbCheck,
      redis: redisCheck,
      memory: memoryCheck,
      cpu: cpuCheck,
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<{ status: 'up' | 'down'; responseTime: number }> {
    const start = Date.now();
    try {
      await mongoose.connection.db?.admin().ping();
      return { status: 'up', responseTime: Date.now() - start };
    } catch (error) {
      logger.error('Database health check failed', error);
      return { status: 'down', responseTime: Date.now() - start };
    }
  }

  /**
   * Check Redis connectivity
   */
  private async checkRedis(): Promise<{ status: 'up' | 'down'; responseTime?: number }> {
    const start = Date.now();
    try {
      if (isRedisConnected()) {
        return { status: 'up', responseTime: Date.now() - start };
      }
      return { status: 'down', responseTime: Date.now() - start };
    } catch (error) {
      logger.error('Redis health check failed', error);
      return { status: 'down', responseTime: Date.now() - start };
    }
  }

  /**
   * Check memory usage
   */
  private checkMemory(): { status: 'up' | 'down'; usage: number; limit: number } {
    const used = process.memoryUsage();
    const total = os.totalmem();
    const usagePercent = (used.heapUsed / total) * 100;
    const limit = 90; // 90% threshold
    
    return {
      status: usagePercent > limit ? 'down' : 'up',
      usage: Math.round(usagePercent * 100) / 100,
      limit,
    };
  }

  /**
   * Check CPU load
   */
  private checkCPU(): { status: 'up' | 'down'; load: number[] } {
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    const threshold = cpuCount * 0.8; // 80% of CPU capacity
    
    return {
      status: loadAvg[0] > threshold ? 'down' : 'up',
      load: loadAvg.map(l => Math.round(l * 100) / 100),
    };
  }

  /**
   * Get current metrics
   */
  private getMetrics() {
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    const errorRate = this.requestCount > 0
      ? (this.errorCount / this.requestCount) * 100
      : 0;

    return {
      totalRequests: this.requestCount,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    };
  }

  /**
   * Get readiness status for Kubernetes/Docker
   */
  async getReadinessStatus(): Promise<{ ready: boolean; reason?: string }> {
    const checks = await this.runHealthChecks();
    
    if (checks.database.status === 'down') {
      return { ready: false, reason: 'Database unavailable' };
    }
    
    if (checks.memory.status === 'down') {
      return { ready: false, reason: 'Memory usage too high' };
    }
    
    return { ready: true };
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService;
