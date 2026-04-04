import express from 'express';
import { runAgents, validateBusinessData } from '../agents/orchestrator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';
const router = express.Router();
router.get('/health', asyncHandler(async (_req, res) => {
    // Basic connectivity check
    res.json({
        status: 'healthy',
        engine: 'multi-provider',
        timestamp: new Date().toISOString()
    });
}));
router.post('/analyze', authenticateToken, asyncHandler(async (req, res) => {
    const authUser = requireUser(req);
    const { businessData, provider } = req.body;
    if (!validateBusinessData(businessData)) {
        throw new AppError(400, 'Invalid business data.');
    }
    const user = await User.findById(authUser.userId);
    if (!user)
        throw new AppError(404, 'User not found');
    const company = await Company.findOne({ userId: authUser.userId });
    if (!company)
        throw new AppError(404, 'Company not found');
    const analysisResult = await runAgents(businessData, provider);
    if (analysisResult.status === 'error') {
        throw new AppError(500, analysisResult.message);
    }
    res.json(analysisResult);
}));
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
const upload = multer({ storage });
router.post('/scan-bill', authenticateToken, upload.single('bill'), asyncHandler(async (req, res) => {
    if (!req.file)
        throw new AppError(400, 'No bill image uploaded');
    try {
        const result = await processDocument(req.file.path);
        res.json({
            success: true,
            data: {
                items: result.items,
                totalAmount: result.amount,
                date: result.date,
                confidence: result.confidence,
                rawText: result.rawText
            }
        });
    }
    finally {
        if (req.file)
            await cleanupFiles([req.file]);
    }
}));
router.get('/history', authenticateToken, (_req, res) => {
    res.json({ history: [], message: 'History feature coming soon' });
});
export default router;
