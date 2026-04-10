import mongoose from 'mongoose';
import { AppError } from './appError.js';
export const requireUser = (req) => {
    if (!req.user?.userId) {
        throw new AppError(401, 'Unauthorized');
    }
    return req.user;
};
export const assertObjectId = (value, label) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new AppError(400, `Invalid ${label}`);
    }
};
