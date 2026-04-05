import mongoose from 'mongoose';
import { AuthRequest, AuthenticatedUser } from '../types/index.js';
import { AppError } from './appError.js';

export const requireUser = (req: AuthRequest): AuthenticatedUser => {
  if (!req.user?.userId) {
    throw new AppError(401, 'Unauthorized');
  }

  return req.user;
};

export const assertObjectId = (value: string, label: string): void => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(400, `Invalid ${label}`);
  }
};
