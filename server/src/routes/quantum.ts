import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get quantum capabilities
router.get('/capabilities', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quantumArchitecture } = req.app.locals;
  
  if (!quantumArchitecture) {
    return res.status(503).json({ error: 'Quantum architecture not available' });
  }

  const capabilities = await quantumArchitecture.getQuantumCapabilities();
  
  res.json({
    success: true,
    data: capabilities
  });
}));

// Optimize investment portfolio using quantum computing
router.post('/optimize/portfolio', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { assets, constraints } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!assets || !Array.isArray(assets) || assets.length === 0) {
    return res.status(400).json({ error: 'Assets array is required' });
  }

  const { quantumArchitecture } = req.app.locals;
  
  if (!quantumArchitecture) {
    return res.status(503).json({ error: 'Quantum architecture not available' });
  }

  try {
    const defaultConstraints = {
      riskPenalty: 0.5,
      correlationPenalty: 0.3,
      cityConstraint: 1000,
      positionConstraint: 1000,
      ...constraints
    };

    const optimization = await quantumArchitecture.optimizePortfolio(assets, defaultConstraints);
    
    res.json({
      success: true,
      data: optimization,
      type: 'portfolio-optimization',
      computedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Quantum portfolio optimization failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Quantum optimization failed'
    });
  }
}));

// Optimize delivery routes using quantum computing
router.post('/optimize/routes', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { locations, constraints } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!locations || !Array.isArray(locations) || locations.length < 2) {
    return res.status(400).json({ error: 'At least 2 locations are required' });
  }

  const { quantumArchitecture } = req.app.locals;
  
  if (!quantumArchitecture) {
    return res.status(503).json({ error: 'Quantum architecture not available' });
  }

  try {
    const defaultConstraints = {
      cityConstraint: 1000,
      positionConstraint: 1000,
      distanceWeight: 1.0,
      ...constraints
    };

    const optimization = await quantumArchitecture.optimizeRoutes(locations, defaultConstraints);
    
    res.json({
      success: true,
      data: optimization,
      type: 'route-optimization',
      computedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Quantum route optimization failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Quantum optimization failed'
    });
  }
}));

// Optimize resource scheduling using quantum computing
router.post('/optimize/schedule', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { tasks, resources } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Tasks array is required' });
  }

  if (!resources || !Array.isArray(resources) || resources.length === 0) {
    return res.status(400).json({ error: 'Resources array is required' });
  }

  const { quantumArchitecture } = req.app.locals;
  
  if (!quantumArchitecture) {
    return res.status(503).json({ error: 'Quantum architecture not available' });
  }

  try {
    const optimization = await quantumArchitecture.optimizeSchedule(tasks, resources);
    
    res.json({
      success: true,
      data: optimization,
      type: 'schedule-optimization',
      computedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Quantum schedule optimization failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Quantum optimization failed'
    });
  }
}));

// Quantum machine learning prediction
router.post('/ml/predict', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { features, labels } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!features || !Array.isArray(features) || features.length === 0) {
    return res.status(400).json({ error: 'Features array is required' });
  }

  if (!labels || !Array.isArray(labels) || labels.length === 0) {
    return res.status(400).json({ error: 'Labels array is required' });
  }

  const { quantumArchitecture } = req.app.locals;
  
  if (!quantumArchitecture) {
    return res.status(503).json({ error: 'Quantum architecture not available' });
  }

  try {
    const prediction = await quantumArchitecture.quantumMLPredict(features, labels);
    
    res.json({
      success: true,
      data: prediction,
      type: 'quantum-ml-prediction',
      computedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Quantum ML prediction failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Quantum ML prediction failed'
    });
  }
}));

// Generate quantum cryptographic keys
router.post('/crypto/keys', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { quantumArchitecture } = req.app.locals;
  
  if (!quantumArchitecture) {
    return res.status(503).json({ error: 'Quantum architecture not available' });
  }

  try {
    const keys = await quantumArchitecture.generateQuantumKeys();
    
    res.json({
      success: true,
      data: keys,
      type: 'quantum-key-generation',
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Quantum key generation failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Quantum key generation failed'
    });
  }
}));

// Get quantum system statistics
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quantumArchitecture } = req.app.locals;
  
  if (!quantumArchitecture) {
    return res.status(503).json({ error: 'Quantum architecture not available' });
  }

  const stats = await quantumArchitecture.getQuantumStats();
  
  res.json({
    success: true,
    data: stats
  });
}));

// Batch quantum optimization for multiple problems
router.post('/optimize/batch', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { optimizations } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!optimizations || !Array.isArray(optimizations) || optimizations.length === 0) {
    return res.status(400).json({ error: 'Optimizations array is required' });
  }

  const { quantumArchitecture } = req.app.locals;
  
  if (!quantumArchitecture) {
    return res.status(503).json({ error: 'Quantum architecture not available' });
  }

  try {
    const results = [];
    
    for (const opt of optimizations) {
      let result;
      
      switch (opt.type) {
        case 'portfolio':
          result = await quantumArchitecture.optimizePortfolio(opt.assets, opt.constraints);
          break;
        case 'routes':
          result = await quantumArchitecture.optimizeRoutes(opt.locations, opt.constraints);
          break;
        case 'schedule':
          result = await quantumArchitecture.optimizeSchedule(opt.tasks, opt.resources);
          break;
        default:
          throw new Error(`Unknown optimization type: ${opt.type}`);
      }
      
      results.push({
        id: opt.id,
        type: opt.type,
        result,
        computedAt: new Date()
      });
    }
    
    res.json({
      success: true,
      data: results,
      type: 'batch-quantum-optimization',
      computedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Batch quantum optimization failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Batch quantum optimization failed'
    });
  }
}));

export default router;
