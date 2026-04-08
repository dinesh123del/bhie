import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get available autonomous agents
router.get('/available', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { autonomousAgents } = req.app.locals;
  
  if (!autonomousAgents) {
    return res.status(503).json({ error: 'Autonomous agents system not available' });
  }

  const agents = await autonomousAgents.getActiveAgents();
  
  res.json({
    success: true,
    data: agents,
    count: agents.length
  });
}));

// Get business context for AI agents
router.get('/context/:businessId?', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { businessId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { autonomousAgents } = req.app.locals;
  
  if (!autonomousAgents) {
    return res.status(503).json({ error: 'Autonomous agents system not available' });
  }

  const context = await autonomousAgents.getBusinessContext(businessId || userId);
  
  res.json({
    success: true,
    data: context
  });
}));

// Get task history for autonomous agents
router.get('/tasks/:businessId?', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { businessId } = req.params;
  const userId = req.user?.userId;
  const limit = Number(req.query.limit) || 50;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { autonomousAgents } = req.app.locals;
  
  if (!autonomousAgents) {
    return res.status(503).json({ error: 'Autonomous agents system not available' });
  }

  const tasks = await autonomousAgents.getTaskHistory(businessId || userId, limit);
  
  res.json({
    success: true,
    data: tasks,
    count: tasks.length
  });
}));

// Manually trigger a specific agent
router.post('/trigger/:agentName/:businessId?', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { agentName, businessId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { autonomousAgents } = req.app.locals;
  
  if (!autonomousAgents) {
    return res.status(503).json({ error: 'Autonomous agents system not available' });
  }

  try {
    await autonomousAgents.triggerAgentManually(agentName, businessId || userId);
    
    res.json({
      success: true,
      message: `Agent ${agentName} triggered successfully`,
      agentName,
      businessId: businessId || userId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger agent'
    });
  }
}));

// Get agent capabilities and descriptions
router.get('/capabilities', asyncHandler(async (req: AuthRequest, res: Response) => {
  const capabilities = [
    {
      name: 'financial-health-analyzer',
      description: 'Analyzes financial health and provides strategic recommendations',
      triggers: ['metrics-update', 'alert', 'transaction'],
      category: 'analysis',
      frequency: 'real-time'
    },
    {
      name: 'growth-opportunity-scout',
      description: 'Identifies growth opportunities and expansion possibilities',
      triggers: ['metrics-update', 'prediction'],
      category: 'strategy',
      frequency: 'hourly'
    },
    {
      name: 'risk-detection-agent',
      description: 'Detects potential business risks and threats',
      triggers: ['alert', 'metrics-update', 'prediction'],
      category: 'risk',
      frequency: 'real-time'
    },
    {
      name: 'cost-optimization-agent',
      description: 'Analyzes expenses and suggests cost-saving measures',
      triggers: ['transaction', 'metrics-update'],
      category: 'optimization',
      frequency: 'daily'
    },
    {
      name: 'customer-insights-agent',
      description: 'Analyzes customer behavior and provides insights',
      triggers: ['transaction', 'metrics-update'],
      category: 'analytics',
      frequency: 'daily'
    },
    {
      name: 'automation-agent',
      description: 'Identifies opportunities for business process automation',
      triggers: ['transaction', 'metrics-update'],
      category: 'automation',
      frequency: 'weekly'
    }
  ];
  
  res.json({
    success: true,
    data: capabilities,
    count: capabilities.length
  });
}));

// Get agent performance metrics
router.get('/performance/:businessId?', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { businessId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { autonomousAgents } = req.app.locals;
  
  if (!autonomousAgents) {
    return res.status(503).json({ error: 'Autonomous agents system not available' });
  }

  const tasks = await autonomousAgents.getTaskHistory(businessId || userId, 100);
  
  // Calculate performance metrics
  const completed = tasks.filter(t => t.status === 'completed').length;
  const failed = tasks.filter(t => t.status === 'failed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const processing = tasks.filter(t => t.status === 'processing').length;
  
  const successRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
  
  // Agent-specific performance
  const agentPerformance = tasks.reduce((acc, task) => {
    const agentType = task.data?.trigger || 'unknown';
    if (!acc[agentType]) {
      acc[agentType] = { total: 0, completed: 0, failed: 0 };
    }
    acc[agentType].total++;
    if (task.status === 'completed') acc[agentType].completed++;
    if (task.status === 'failed') acc[agentType].failed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number; failed: number }>);

  res.json({
    success: true,
    data: {
      summary: {
        total: tasks.length,
        completed,
        failed,
        pending,
        processing,
        successRate: Math.round(successRate * 100) / 100
      },
      agentPerformance,
      lastUpdated: new Date()
    }
  });
}));

export default router;
