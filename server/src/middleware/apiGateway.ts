import { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { AuthRequest } from '../types/index.js';

// Track API usage per organization
const usageStore = new Map<string, {
  requests: number;
  lastReset: number;
}>();

/**
 * API Gateway Middleware
 * Centralized request handling for SaaS API management
 */
export class ApiGateway {
  // Rate limiting configurations per plan
  static rateLimits = {
    free: { windowMs: 15 * 60 * 1000, max: 100 },
    starter: { windowMs: 15 * 60 * 1000, max: 500 },
    growth: { windowMs: 15 * 60 * 1000, max: 2000 },
    enterprise: { windowMs: 15 * 60 * 1000, max: 10000 },
  };

  /**
   * Create rate limiter based on organization plan
   */
  static createRateLimiter(): RequestHandler {
    return async (req: AuthRequest, res, next) => {
      const plan = req.organization?.plan || 'free';
      const limits = this.rateLimits[plan as keyof typeof this.rateLimits] || this.rateLimits.free;
      
      const limiter = rateLimit({
        windowMs: limits.windowMs,
        max: limits.max,
        message: {
          success: false,
          message: `API rate limit exceeded. Your plan allows ${limits.max} requests per ${limits.windowMs / 60000} minutes.`,
          upgrade: true,
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req: any) => {
          // Use organization ID + user ID for unique key
          const orgId = req.organization?.id || 'personal';
          const userId = req.user?.userId || req.ip;
          return `${orgId}:${userId}`;
        },
        handler: (req, res, _next, options) => {
          logger.warn(`Rate limit exceeded: ${req.method} ${req.path}`, {
            organizationId: (req as any).organization?.id,
            userId: (req as any).user?.userId,
            plan,
          });
          
          res.status(429).json({
            success: false,
            message: options.message,
            retryAfter: Math.ceil(limits.windowMs / 1000),
          });
        },
      });
      
      return limiter(req, res, next);
    };
  }

  /**
   * Request logging and analytics
   */
  static requestLogger(): RequestHandler {
    return (req: AuthRequest, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          organizationId: req.organization?.id,
          userId: req.user?.userId,
          userAgent: req.get('user-agent')?.substring(0, 100),
          ip: req.ip,
        };
        
        // Log slow requests
        if (duration > 1000) {
          logger.warn('Slow request detected', logData);
        }
        
        // Track API usage
        if (req.organization) {
          this.trackUsage(req.organization.id, req.method, req.path);
        }
        
        logger.info('API Request', logData);
      });
      
      next();
    };
  }

  /**
   * Track API usage for billing and analytics
   */
  private static trackUsage(orgId: string, method: string, path: string): void {
    const now = Date.now();
    const key = `${orgId}:${new Date().toISOString().split('T')[0]}`;
    
    const current = usageStore.get(key);
    if (current) {
      current.requests++;
    } else {
      usageStore.set(key, { requests: 1, lastReset: now });
    }
    
    // Clean up old entries (keep last 30 days)
    if (Math.random() < 0.01) { // 1% chance to cleanup
      this.cleanupUsageStore();
    }
  }

  private static cleanupUsageStore(): void {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const [key, value] of usageStore.entries()) {
      if (value.lastReset < thirtyDaysAgo) {
        usageStore.delete(key);
      }
    }
  }

  /**
   * CORS validation for API requests
   */
  static validateOrigin(): RequestHandler {
    return (req, res, next) => {
      // Skip for health checks
      if (req.path === '/health' || req.path === '/api/health') {
        return next();
      }
      
      const origin = req.headers.origin;
      
      // In development, allow all
      if (!env.IS_PRODUCTION) {
        return next();
      }
      
      // Allow same-origin requests
      if (!origin) {
        return next();
      }
      
      // Validate against allowed domains
      const allowedDomains = env.CLIENT_URLS || [];
      const isAllowed = allowedDomains.some(domain => 
        origin === domain || origin.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        logger.warn(`Invalid origin: ${origin}`);
        return res.status(403).json({
          success: false,
          message: 'Origin not allowed',
        });
      }
      
      next();
    };
  }

  /**
   * Request size validation
   */
  static validateRequestSize(): RequestHandler {
    return (req, res, next) => {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      const maxSize = env.MAX_UPLOAD_FILE_SIZE_BYTES || 10 * 1024 * 1024; // 10MB default
      
      if (contentLength > maxSize) {
        return res.status(413).json({
          success: false,
          message: `Request entity too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
        });
      }
      
      next();
    };
  }

  /**
   * API versioning middleware
   */
  static version(version: string): RequestHandler {
    return (req: AuthRequest, res, next) => {
      req.apiVersion = version;
      next();
    };
  }

  /**
   * Request validation middleware
   */
  static validateRequest(schema: any): RequestHandler {
    return (req, res, next) => {
      try {
        if (schema.body) {
          schema.body.parse(req.body);
        }
        if (schema.query) {
          schema.query.parse(req.query);
        }
        if (schema.params) {
          schema.params.parse(req.params);
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

// Extend Express Request to include API version
declare global {
  namespace Express {
    interface Request {
      apiVersion?: string;
    }
  }
}

export default ApiGateway;
