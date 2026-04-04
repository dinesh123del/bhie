import Record from '../models/Record.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../types';
import { Response } from 'express';
import { AppError } from '../utils/appError';
import { assertObjectId, requireUser } from '../utils/request';

export const recordsController = {
  getRecent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit || 5)));

    const records = await Record.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name');

    res.json(records);
  }),

  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);

    const records = await Record.find({ userId: user.userId }).populate('userId', 'name email');
    res.json(records);
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const authUser = requireUser(req);
    const user = await User.findById(authUser.userId);

    if (user && typeof user.refreshSubscriptionStatus === 'function') {
      await user.refreshSubscriptionStatus();
    }

    if (!user || typeof user.canCreateRecord !== 'function' || !user.canCreateRecord()) {
      throw new AppError(403, 'Record limit reached. Upgrade your plan.');
    }

    const record = await Record.create({
      ...req.body,
      userId: authUser.userId,
    });

    // Generate alert for new record
    await import('../utils/generateAlerts.js').then(({ generateAlerts }) => 
      generateAlerts({
        userId: authUser.userId,
        action: 'record',
        record: {
          type: req.body.type as 'income' | 'expense',
          amount: req.body.amount as number,
          category: req.body.category as string,
          title: req.body.title as string
        }
      })
    );

    if (typeof user.incrementUsageCount === 'function') {
      await user.incrementUsageCount();
    }

    res.status(201).json(record);
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    assertObjectId(req.params.id, 'record ID');

    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, userId: user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      throw new AppError(404, 'Record not found or access denied');
    }

    res.json(record);
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    assertObjectId(req.params.id, 'record ID');

    const account = await User.findById(user.userId);
    const record = await Record.findOneAndDelete({
      _id: req.params.id,
      userId: user.userId,
    });

    if (!record) {
      throw new AppError(404, 'Record not found or access denied');
    }

    if (account && typeof account.decrementUsageCount === 'function') {
      await account.decrementUsageCount();
    }

    res.json({ message: 'Record deleted' });
  }),
};
