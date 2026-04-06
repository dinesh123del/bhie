import express, { Response } from 'express';
import path from 'path';
import { runAgents, validateBusinessData } from '../agents/orchestrator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { redisClient } from '../config/redisClient.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { AIAnalysisResponse } from '../types/ai.js';
import { AIEngine } from '../utils/aiEngine.js';
import { AppError } from '../utils/appError.js';
import { AuthRequest } from '../types/index.js';
import { requireUser } from '../utils/request.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { env } from '../config/env.js';

const router = express.Router();

router.get(
  '/health',
  asyncHandler(async (_req, res: Response) => {
    // Basic connectivity check
    res.json({
      status: 'healthy',
      engine: 'multi-provider',
      timestamp: new Date().toISOString()
    });
  })
);

router.post(
  '/analyze',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const authUser = requireUser(req);
    const { businessData, provider } = req.body;

    if (!validateBusinessData(businessData)) {
      throw new AppError(400, 'Invalid business data.');
    }

    const user = await User.findById(authUser.userId);
    if (!user) throw new AppError(404, 'User not found');

    // Company is optional — the form collects all required numbers directly
    // so we don't block analysis when it hasn't been set up yet.
    await Company.findOne({ userId: authUser.userId });

    const analysisResult = await runAgents(businessData, provider);

    if (analysisResult.status === 'error') {
      throw new AppError(500, analysisResult.message);
    }

    res.json(analysisResult);
  })
);


import multer from 'multer';
import { processDocument } from '../services/documentIntelligenceService.js';
import { ensureUploadDir, uploadDir, cleanupFiles } from '../utils/uploads.js';

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `bill-${Date.now()}${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_FILE_SIZE_BYTES || 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `bill-${Date.now()}${ext}`;
    file.originalname = safeName;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(new AppError(415, 'Unsupported file type. Upload images or PDF.'));
      return;
    }
    cb(null, true);
  }
});

router.post(
  '/scan-bill',
  authenticateToken,
  aiLimiter,
  upload.single('bill'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) throw new AppError(400, 'No bill image uploaded');

    try {
      const result = await processDocument(req.file.path);
      res.json({
        success: true,
        data: {
          items: result.items,
          totalAmount: result.amount,
          date: result.date,
          confidence: result.confidence,
          rawText: result.rawText,
          exactText: result.exactText,
          businessName: result.businessName,
          gstNumber: result.gstNumber,
          gstDetails: result.gstDetails,
          integrityScore: result.integrityScore,
          missingFields: result.missingFields,
          isUnclear: result.isUnclear
        }
      });
    } finally {
      if (req.file) await cleanupFiles([req.file]);
    }
  })
);

router.get('/history', authenticateToken, (_req, res: Response) => {
  res.json({ history: [], message: 'History feature coming soon' });
});

router.post(
  '/predict',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { records = [] } = req.body;
    
    if (!Array.isArray(records)) {
      throw new AppError(400, 'Records must be an array');
    }

    const totalRecords = records.length;
    
    if (totalRecords === 0) {
      return res.json({
        healthScore: 0,
        riskLevel: 'low',
        suggestions: ['Start uploading bills and receipts to see your health score.'],
        metrics: {
          totalRecords: 0,
          draftCount: 0,
          activeCount: 0,
          archivedCount: 0,
          completionRate: 0,
          riskFactors: []
        },
        timestamp: new Date().toISOString()
      });
    }

    const draftCount = records.filter(r => r.status === 'draft').length;
    const activeCount = records.filter(r => r.status === 'active' || !r.status).length;
    const archivedCount = records.filter(r => r.status === 'archived' || r.status === 'completed').length;
    
    const completionRate = Math.round((activeCount / totalRecords) * 100);
    
    // Calculate Health Score (Simple logic for now)
    let healthScore = completionRate;
    const riskFactors: string[] = [];

    if (draftCount > totalRecords * 0.3) {
      healthScore -= 15;
      riskFactors.push('High percentage of incomplete draft records');
    }
    
    if (totalRecords < 5) {
      healthScore -= 10;
      riskFactors.push('Limited data points for accurate forecasting');
    }

    healthScore = Math.max(0, Math.min(100, healthScore));

    const riskLevel = healthScore > 80 ? 'low' : healthScore > 50 ? 'medium' : 'high';

    res.json({
      healthScore,
      riskLevel,
      suggestions: [
        healthScore > 80 ? 'Your record health is excellent. Maintain this consistency.' : 
        healthScore > 50 ? 'Address pending draft records to improve system accuracy.' :
        'Urgent: Multiple incomplete records detected. System visibility is currently limited.'
      ],
      metrics: {
        totalRecords,
        draftCount,
        activeCount,
        archivedCount,
        completionRate,
        riskFactors
      },
      timestamp: new Date().toISOString()
    });
  })
);

router.post(
  '/translate',
  authenticateToken,
  aiLimiter,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      throw new AppError(400, 'Text and targetLanguage are required');
    }

    // SECURITY: Sanitize inputs to prevent prompt injection
    const sanitizedText = String(text).slice(0, 500).replace(/[\r\n]+/g, ' ');
    const sanitizedLang = String(targetLanguage).slice(0, 30).replace(/[^a-zA-Z\s-]/g, '');

    if (!sanitizedLang) {
      throw new AppError(400, 'Invalid target language');
    }

    const prompt = `Translate the following interface text to ${sanitizedLang}. 
    Return ONLY a JSON object with a single key "translation".
    
    Text: "${sanitizedText}"`;

    const aiResponse = await AIEngine.generateCompletion(prompt, { 
      preferredProvider: 'openai' // OpenAI is better for short translations
    });

    try {
      const parsed = JSON.parse(aiResponse.content);
      res.json({ translation: parsed.translation || aiResponse.content });
    } catch (e) {
      res.json({ translation: aiResponse.content });
    }
  })
);

export default router;

