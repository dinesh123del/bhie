import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Insight from '../models/Insight';
import { IntelligenceEngine } from '../services/intelligenceEngine';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/asyncHandler';

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