import express, { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { searchImageIntelligence } from '../services/imageIntelligenceService.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';

const router = express.Router();

router.use(authenticateToken);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = requireUser(req);
    const q = String(req.query.q || '').trim();

    if (!q) {
      throw new AppError(400, 'Search query is required');
    }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 30)));
    const type = req.query.type ? String(req.query.type) : undefined;
    const dateFrom = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : undefined;
    const dateTo = req.query.dateTo ? new Date(String(req.query.dateTo)) : undefined;

    const ranked = await searchImageIntelligence({
      userId: user.userId,
      query: q,
      limit,
      filters: {
        type: type && isDetectedType(type) ? type : undefined,
        dateFrom: dateFrom && !Number.isNaN(dateFrom.getTime()) ? dateFrom : undefined,
        dateTo: dateTo && !Number.isNaN(dateTo.getTime()) ? dateTo : undefined,
      },
    });

    res.json({
      query: q,
      count: ranked.length,
      results: ranked.map((entry) => ({
        relevance: entry.relevance,
        id: entry.item._id,
        imageUrl: entry.item.imageUrl,
        originalName: entry.item.originalName,
        extractedText: entry.item.extractedText,
        detectedType: entry.item.detectedType,
        detectedObjects: entry.item.detectedObjects,
        tags: entry.item.tags,
        confidenceScore: entry.item.confidenceScore,
        structuredData: entry.item.structuredData,
        processingStatus: entry.item.processingStatus,
        createdAt: entry.item.createdAt,
      })),
    });
  })
);

function isDetectedType(value: string): value is 'invoice' | 'material' | 'product' | 'document' | 'unknown' {
  return ['invoice', 'material', 'product', 'document', 'unknown'].includes(value);
}

export default router;
