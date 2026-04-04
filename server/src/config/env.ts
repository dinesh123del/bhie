import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5001),
    MONGO_URI: z.string().trim().min(1).optional(),
    MONGODB_URI: z.string().trim().min(1).optional(),
    REDIS_URL: z.string().trim().min(1).default('redis://localhost:6379'),
    JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
    JWT_EXPIRES_IN: z.string().default('24h'),
    CLIENT_URL: z.string().url().optional(),
    FRONTEND_URL: z.string().trim().min(1).optional(),
    OPENAI_API_KEY: z.string().trim().min(1).optional(),
    CLAUDE_API_KEY: z.string().trim().min(1).optional(),
    BLACKBOX_API_KEY: z.string().trim().min(1).optional(),
    OPENAI_VISION_MODEL: z.string().default('gpt-4o-mini'),

    GOOGLE_CLIENT_ID: z.string().trim().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().trim().min(1).optional(),
    RAZORPAY_KEY_ID: z.string().trim().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().trim().min(1).optional(),
    REQUEST_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    REQUEST_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
    BODY_LIMIT: z.string().default('2mb'),
    UPLOAD_DIR: z.string().trim().min(1).default('uploads'),
    MAX_UPLOAD_FILE_SIZE_MB: z.coerce.number().positive().default(10),
    IMAGE_PROCESSING_CONCURRENCY: z.coerce.number().int().positive().default(2),
    SEED_DEFAULT_ADMIN: z.enum(['true', 'false']).default('false'),
    ADMIN_SEED_EMAIL: z.string().email().optional(),
    ADMIN_SEED_PASSWORD: z.string().min(12).optional(),
  })
  .superRefine((data, ctx) => {
    const legacyFrontendUrls = (data.FRONTEND_URL || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!data.MONGO_URI && !data.MONGODB_URI) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MONGO_URI'],
        message: 'Either MONGO_URI or MONGODB_URI is required',
      });
    }

    if (data.NODE_ENV === 'production') {
      if (!data.CLIENT_URL && legacyFrontendUrls.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CLIENT_URL'],
          message: 'CLIENT_URL or FRONTEND_URL is required in production',
        });
      }
      
      if (!data.MONGO_URI && !data.MONGODB_URI) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['MONGO_URI'],
          message: 'Database connection URI is required for production',
        });
      }
    }

    for (const [index, origin] of legacyFrontendUrls.entries()) {
      try {
        new URL(origin);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FRONTEND_URL', index],
          message: `Invalid url: ${origin}`,
        });
      }
    }

    if (data.SEED_DEFAULT_ADMIN === 'true') {
      if (!data.ADMIN_SEED_EMAIL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ADMIN_SEED_EMAIL'],
          message: 'ADMIN_SEED_EMAIL is required when SEED_DEFAULT_ADMIN=true',
        });
      }

      if (!data.ADMIN_SEED_PASSWORD) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ADMIN_SEED_PASSWORD'],
          message: 'ADMIN_SEED_PASSWORD is required when SEED_DEFAULT_ADMIN=true',
        });
      }
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `- ${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  
  console.error('❌ Invalid environment configuration:');
  console.error(issues);
  process.exit(1);
}

const envValues = parsedEnv.data;
const legacyFrontendUrls = (envValues.FRONTEND_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const clientUrls = [...new Set([envValues.CLIENT_URL, ...legacyFrontendUrls].filter(Boolean))];

export const env = {
  ...envValues,
  MONGO_URI: envValues.MONGO_URI ?? envValues.MONGODB_URI!,
  CLIENT_URL: clientUrls[0] ?? 'http://localhost:5173',
  CLIENT_URLS: clientUrls,
  IS_PRODUCTION: envValues.NODE_ENV === 'production',
  MAX_UPLOAD_FILE_SIZE_BYTES: Math.floor(envValues.MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024),
  SHOULD_SEED_DEFAULT_ADMIN: envValues.SEED_DEFAULT_ADMIN === 'true',
} as const;

export type AppEnv = typeof env;

