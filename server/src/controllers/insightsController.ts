import { Response } from 'express';
import mongoose from 'mongoose';
import Insight from '../models/Insight.js';
import { IntelligenceEngine } from '../services/intelligenceEngine.js';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const insightsController = {
  getInsights: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Generate fresh insights
    await IntelligenceEngine.generateInsights(new mongoose.Types.ObjectId(userId));

    const insights = await Insight.find({ userId }).sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      data: insights,
    });
  }),

  getPredictions: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const predictions = await IntelligenceEngine.getPredictions(new mongoose.Types.ObjectId(userId));

    res.json({
      success: true,
      data: predictions,
    });
  }),
};