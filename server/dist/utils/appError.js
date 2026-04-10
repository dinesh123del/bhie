export class AppError extends Error {
    constructor(statusCode, message, options) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.details = options?.details;
        this.expose = options?.expose ?? statusCode < 500;
    }
}
export const isAppError = (error) => error instanceof AppError;
