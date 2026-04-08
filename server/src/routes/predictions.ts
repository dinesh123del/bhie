import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get business prediction
router.get('/business/:businessId?', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { businessId } = req.params;
  const { months = 12 } = req.query;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { neuralPredictionEngine } = req.app.locals;
  
  if (!neuralPredictionEngine) {
    return res.status(503).json({ error: 'Neural prediction engine not available' });
  }

  try {
    const prediction = await neuralPredictionEngine.predictBusinessFuture(
      businessId || userId, 
      Number(months)
    );
    
    res.json({
      success: true,
      data: prediction,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Prediction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Prediction failed'
    });
  }
}));

// Train business-specific model
router.post('/train/:businessId?', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { businessId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { neuralPredictionEngine } = req.app.locals;
  
  if (!neuralPredictionEngine) {
    return res.status(503).json({ error: 'Neural prediction engine not available' });
  }

  // Start training in background
  neuralPredictionEngine.trainBusinessModel(businessId || userId)
    .then(() => {
      console.log(`✅ Training completed for business: ${businessId || userId}`);
    })
    .catch((error) => {
      console.error(`❌ Training failed for business: ${businessId || userId}`, error);
    });
  
  res.json({
    success: true,
    message: 'Neural network training started',
    businessId: businessId || userId
  });
}));

// Get model statistics
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { neuralPredictionEngine } = req.app.locals;
  
  if (!neuralPredictionEngine) {
    return res.status(503).json({ error: 'Neural prediction engine not available' });
  }

  const stats = await neuralPredictionEngine.getModelStats();
  
  res.json({
    success: true,
    data: stats
  });
}));

// Train global model (admin only)
router.post('/train-global', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId || userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { neuralPredictionEngine } = req.app.locals;
  
  if (!neuralPredictionEngine) {
    return res.status(503).json({ error: 'Neural prediction engine not available' });
  }

  // Start global model training in background
  neuralPredictionEngine.trainGlobalModel()
    .then(() => {
      console.log('✅ Global model training completed');
    })
    .catch((error) => {
      console.error('❌ Global model training failed:', error);
    });
  
  res.json({
    success: true,
    message: 'Global neural network training started'
  });
}));

export default router;
