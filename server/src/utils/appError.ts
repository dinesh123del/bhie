export class AppError extends Error {
  statusCode: number;
  details?: unknown;
  expose: boolean;

  constructor(statusCode: number, message: string, options?: { details?: unknown; expose?: boolean }) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = options?.details;
    this.expose = options?.expose ?? statusCode < 500;
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;
