import { ErrorRequestHandler, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError, isAppError } from '../utils/appError';

const { JsonWebTokenError, TokenExpiredError } = jwt;

const normalizeError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  // Multer errors (file uploads)
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new AppError(413, `File size exceeds ${env.MAX_UPLOAD_FILE_SIZE_MB}MB limit`);
    }
    return new AppError(400, `Upload error: ${error.message}`);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return new AppError(400, 'Validation failed', {
      details: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Mongoose validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map(e => ({
      path: e.path,
      message: e.message
    }));
    return new AppError(400, 'Database validation failed', { details });
  }

  // Mongoose cast errors (invalid IDs)
  if (error instanceof mongoose.Error.CastError) {
    return new AppError(400, `Invalid ${error.path}: ${error.value}`);
  }

  // Mongoose duplicate key errors
  if ((error as any)?.code === 11000) {
    const field = Object.keys((error as any).keyPattern || {})[0] || 'field';
    return new AppError(409, `Duplicate value for ${field}`);
  }

  // JWT errors
  if (error instanceof TokenExpiredError) {
    return new AppError(401, 'Session expired. Please login again.');
  }

  if (error instanceof JsonWebTokenError) {
    return new AppError(401, 'Invalid authentication token.');
  }

  // Syntax errors (e.g. malformed JSON in request body)
  if (error instanceof SyntaxError && 'body' in error) {
    return new AppError(400, 'Malformed JSON payload');
  }

  // Handle errors that looks like CORS issues
  if (error instanceof Error && error.message.toLowerCase().includes('cors')) {
    return new AppError(403, 'CORS access denied');
  }

  // Default internal server error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return new AppError(500, message, {
    details: env.IS_PRODUCTION ? undefined : error,
    expose: false,
  });
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const normalizedError = normalizeError(error);

  // Structured logging for errors
  if (normalizedError.statusCode >= 500) {
    console.error('💥 [CRITICAL ERROR]:', {
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
    });
  } else if (!env.IS_PRODUCTION) {
    console.warn(`⚠️ [CLIENT ERROR ${normalizedError.statusCode}]: ${req.method} ${req.originalUrl} - ${normalizedError.message}`);
  }

  res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.expose || !env.IS_PRODUCTION ? normalizedError.message : 'Internal server error',
    ...(env.IS_PRODUCTION ? {} : { 
      details: normalizedError.details ?? (error instanceof Error ? error.stack : error),
      type: error?.constructor?.name 
    }),
  });
};

