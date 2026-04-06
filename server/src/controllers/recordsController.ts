import Record from '../models/Record.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/index.js';
import { Response } from 'express';
import { AppError } from '../utils/appError.js';
import { assertObjectId, requireUser } from '../utils/request.js';
import { CacheService } from '../services/cacheService.js';
import AnalysisService from '../services/AnalysisService.js';

export const recordsController = {
  getRecent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit || 5)));
    const query = user.role === 'admin' ? {} : { userId: user.userId };

    const records = await Record.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name');

    res.json(records);
  }),

  getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const query: globalThis.Record<string, unknown> = 
      user.role === 'admin' ? {} : { userId: user.userId };

    const records = await Record.find(query).populate('userId', 'name email');
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

    // 10-YEAR FEATURE: Autonomous AI Analysis (runs in background, does NOT block the response)
    AnalysisService.analyzeNewRecord(record.toObject()).then(async (analysis) => {
      try {
        await Record.findByIdAndUpdate(record._id, {
          ai_analysis: {
            confidence_score: analysis.confidence,
            anomalies_detected: analysis.anomaly,
            recommendation: analysis.recommendation,
            prediction_impact: 0,
          },
        });
        console.log(`🧠 AI analysis complete for record ${record._id}`);
      } catch (err) {
        console.warn('⚠️ AI analysis save failed (non-critical):', err);
      }
    }).catch((err) => {
      console.warn('⚠️ Background analysis failed (non-critical):', err);
    });

    CacheService.invalidateUserCache(authUser.userId).catch(console.error);

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

    CacheService.invalidateUserCache(user.userId).catch(console.error);

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

    CacheService.invalidateUserCache(user.userId).catch(console.error);

    res.json({ message: 'Record deleted' });
  }),
};
