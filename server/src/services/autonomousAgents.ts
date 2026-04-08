import { EventEmitter } from 'events';
import OpenAI from 'openai';
import Record from '../models/Record.js';
import Business from '../models/Business.js';
import User from '../models/User.js';
import { RealTimeIntelligence } from './realTimeIntelligence.js';
import { AIInsights } from './ai-insights.js';
import { CacheService } from './cacheService.js';

interface AgentTask {
  id: string;
  type: 'analysis' | 'prediction' | 'recommendation' | 'automation' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  businessId: string;
  userId: string;
  data: any;
  createdAt: Date;
  scheduledFor?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface BusinessContext {
  businessId: string;
  userId: string;
  industry?: string;
  size: 'small' | 'medium' | 'large';
  metrics: {
    revenue: number;
    expenses: number;
    profit: number;
    growth: number;
    transactions: number;
    healthScore: number;
  };
  recentEvents: any[];
  alerts: any[];
}

interface AgentCapability {
  name: string;
  description: string;
  triggers: string[];
  execute: (context: BusinessContext) => Promise<any>;
}

export class AutonomousAgents extends EventEmitter {
  private openai: OpenAI;
  private realTimeIntelligence: RealTimeIntelligence;
  private agents: Map<string, AgentCapability> = new Map();
  private taskQueue: AgentTask[] = [];
  private isProcessing: boolean = false;
  private businessContexts: Map<string, BusinessContext> = new Map();

  constructor(openai: OpenAI, realTimeIntelligence: RealTimeIntelligence) {
    super();
    this.openai = openai;
    this.realTimeIntelligence = realTimeIntelligence;
    this.initializeAgents();
    this.startTaskProcessor();
    this.setupEventListeners();
  }

  private initializeAgents() {
    // Financial Health Agent
    this.registerAgent({
      name: 'financial-health-analyzer',
      description: 'Analyzes financial health and provides strategic recommendations',
      triggers: ['metrics-update', 'alert', 'transaction'],
      execute: async (context) => await this.analyzeFinancialHealth(context)
    });

    // Growth Opportunity Agent
    this.registerAgent({
      name: 'growth-opportunity-scout',
      description: 'Identifies growth opportunities and expansion possibilities',
      triggers: ['metrics-update', 'prediction'],
      execute: async (context) => await this.identifyGrowthOpportunities(context)
    });

    // Risk Detection Agent
    this.registerAgent({
      name: 'risk-detection-agent',
      description: 'Detects potential business risks and threats',
      triggers: ['alert', 'metrics-update', 'prediction'],
      execute: async (context) => await this.detectBusinessRisks(context)
    });

    // Cost Optimization Agent
    this.registerAgent({
      name: 'cost-optimization-agent',
      description: 'Analyzes expenses and suggests cost-saving measures',
      triggers: ['transaction', 'metrics-update'],
      execute: async (context) => await this.optimizeCosts(context)
    });

    // Customer Insights Agent
    this.registerAgent({
      name: 'customer-insights-agent',
      description: 'Analyzes customer behavior and provides insights',
      triggers: ['transaction', 'metrics-update'],
      execute: async (context) => await this.generateCustomerInsights(context)
    });

    // Automation Agent
    this.registerAgent({
      name: 'automation-agent',
      description: 'Identifies opportunities for business process automation',
      triggers: ['transaction', 'metrics-update'],
      execute: async (context) => await this.identifyAutomationOpportunities(context)
    });
  }

  private registerAgent(capability: AgentCapability) {
    this.agents.set(capability.name, capability);
  }

  private setupEventListeners() {
    this.realTimeIntelligence.on('metrics-update', async (data) => {
      await this.updateBusinessContext(data.businessId);
      await this.triggerRelevantAgents('metrics-update', data.businessId);
    });

    this.realTimeIntelligence.on('alert', async (alert) => {
      await this.updateBusinessContext(alert.businessId);
      await this.triggerRelevantAgents('alert', alert.businessId);
    });

    this.realTimeIntelligence.on('predictions-update', async (data) => {
      await this.updateBusinessContext(data.businessId);
      await this.triggerRelevantAgents('prediction', data.businessId);
    });
  }

  private async updateBusinessContext(businessId: string) {
    try {
      const business = await Business.findById(businessId);
      const metrics = await this.realTimeIntelligence.getBusinessMetrics(businessId);
      const alerts = await this.realTimeIntelligence.getAlertHistory(businessId, 10);
      const events = await this.realTimeIntelligence.getEventHistory(businessId, 20);

      if (business && metrics) {
        const context: BusinessContext = {
          businessId,
          userId: business.userId.toString(),
          industry: (business as any).industry || 'General',
          size: this.determineBusinessSize(metrics),
          metrics: {
            ...metrics,
            growth: metrics.growthRate || 0
          },
          recentEvents: events,
          alerts
        };

        this.businessContexts.set(businessId, context);
        await CacheService.set(`context:${businessId}`, context, 600); // Cache for 10 minutes
      }
    } catch (error) {
      console.error(`❌ Error updating context for business ${businessId}:`, error);
    }
  }

  private determineBusinessSize(metrics: any): 'small' | 'medium' | 'large' {
    if (metrics.revenue > 1000000) return 'large'; // > ₹10L/month
    if (metrics.revenue > 100000) return 'medium';  // > ₹1L/month
    return 'small';
  }

  private async triggerRelevantAgents(trigger: string, businessId: string) {
    const context = this.businessContexts.get(businessId);
    if (!context) return;

    for (const [name, agent] of this.agents) {
      if (agent.triggers.includes(trigger)) {
        this.queueTask({
          id: `${name}-${Date.now()}`,
          type: 'analysis',
          priority: this.determineTaskPriority(trigger, context),
          businessId,
          userId: context.userId,
          data: { trigger, context },
          createdAt: new Date(),
          status: 'pending'
        });
      }
    }
  }

  private determineTaskPriority(trigger: string, context: BusinessContext): 'low' | 'medium' | 'high' | 'critical' {
    if (trigger === 'alert' && context.alerts.some(a => a.severity === 'critical')) {
      return 'critical';
    }
    if (context.metrics.healthScore < 30) {
      return 'high';
    }
    if (trigger === 'alert') {
      return 'medium';
    }
    return 'low';
  }

  private queueTask(task: AgentTask) {
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    if (!this.isProcessing) {
      this.processTasks();
    }
  }

  private async startTaskProcessor() {
    setInterval(() => {
      if (!this.isProcessing && this.taskQueue.length > 0) {
        this.processTasks();
      }
    }, 5000); // Process every 5 seconds
  }

  private async processTasks() {
    if (this.isProcessing || this.taskQueue.length === 0) return;

    this.isProcessing = true;
    
    try {
      while (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift()!;
        
        // Check if task is scheduled for future
        if (task.scheduledFor && task.scheduledFor > new Date()) {
          this.taskQueue.push(task); // Put back at the end
          break;
        }

        await this.executeTask(task);
      }
    } catch (error) {
      console.error('❌ Error processing tasks:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeTask(task: AgentTask) {
    try {
      task.status = 'processing';
      this.emit('task-updated', task);

      const agent = this.agents.get(task.data.trigger);
      if (!agent) {
        throw new Error(`Agent not found for trigger: ${task.data.trigger}`);
      }

      const result = await agent.execute(task.data.context);
      
      task.status = 'completed';
      task.result = result;
      
      // Publish result to real-time clients
      await this.realTimeIntelligence.publishEvent({
        type: 'insight',
        userId: task.userId,
        businessId: task.businessId,
        data: {
          agent: agent.name,
          result,
          task: task.id
        },
        severity: 'medium',
        priority: 2
      });

      this.emit('task-completed', task);

    } catch (error) {
      console.error(`❌ Task execution failed: ${task.id}`, error);
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('task-failed', task);
    }
  }

  // Agent Implementations

  private async analyzeFinancialHealth(context: BusinessContext) {
    const prompt = `
      Review this business's financial performance:
      
      Business Metrics:
      - Revenue: ₹${context.metrics.revenue.toLocaleString('en-IN')}
      - Expenses: ₹${context.metrics.expenses.toLocaleString('en-IN')}
      - Profit: ₹${context.metrics.profit.toLocaleString('en-IN')}
      - Growth Rate: ${context.metrics.growth.toFixed(1)}%
      - Health Score: ${context.metrics.healthScore}/100
      - Transactions: ${context.metrics.transactions}
      
      Recent Alerts: ${context.alerts.length}
      
      Provide:
      1. Overall financial health assessment (Excellent/Good/Fair/Poor/Critical)
      2. Key strengths and weaknesses
      3. 3-5 specific actionable recommendations
      4. Risk level (Low/Medium/High/Critical)
      5. 30-day action plan
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an experienced business advisor providing practical insights. Be specific, actionable, and concise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    return {
      type: 'financial-health-analysis',
      analysis: completion.choices[0].message.content,
      timestamp: new Date(),
      confidence: 0.85
    };
  }

  private async identifyGrowthOpportunities(context: BusinessContext) {
    const prompt = `
      As a business growth strategist, identify growth opportunities for this business:
      
      Current Performance:
      - Revenue: ₹${context.metrics.revenue.toLocaleString('en-IN')}
      - Growth Rate: ${context.metrics.growth.toFixed(1)}%
      - Transactions: ${context.metrics.transactions}
      - Industry: ${context.industry || 'General'}
      
      Identify:
      1. Top 3 growth opportunities with revenue potential
      2. Market expansion possibilities
      3. Product/service optimization ideas
      4. Customer acquisition strategies
      5. Partnership opportunities
      
      Be specific and provide estimated impact.
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a growth strategist identifying actionable business opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8
    });

    return {
      type: 'growth-opportunities',
      opportunities: completion.choices[0].message.content,
      timestamp: new Date(),
      confidence: 0.75
    };
  }

  private async detectBusinessRisks(context: BusinessContext) {
    const risks = [];

    // Financial risks
    if (context.metrics.profit < 0) {
      risks.push({
        type: 'financial',
        severity: 'critical',
        description: 'Operating at loss',
        impact: 'High',
        mitigation: 'Immediate cost reduction and revenue focus'
      });
    }

    if (context.metrics.growthRate < -10) {
      risks.push({
        type: 'growth',
        severity: 'high',
        description: 'Rapid revenue decline',
        impact: 'High',
        mitigation: 'Investigate customer churn and market changes'
      });
    }

    if (context.metrics.healthScore < 30) {
      risks.push({
        type: 'operational',
        severity: 'high',
        description: 'Poor business health',
        impact: 'Medium',
        mitigation: 'Comprehensive business review required'
      });
    }

    // AI-powered risk analysis
    const prompt = `
      Analyze potential business risks based on:
      - Health Score: ${context.metrics.healthScore}/100
      - Recent Alerts: ${context.alerts.length}
      - Growth Trend: ${context.metrics.growth.toFixed(1)}%
      
      Identify 3-5 potential risks not mentioned above, with severity and mitigation strategies.
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a risk management expert identifying business threats."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.7
    });

    return {
      type: 'risk-analysis',
      risks,
      aiAnalysis: completion.choices[0].message.content,
      timestamp: new Date(),
      confidence: 0.80
    };
  }

  private async optimizeCosts(context: BusinessContext) {
    // Get recent expenses for analysis
    const recentExpenses = await Record.find({
      userId: context.businessId,
      type: 'expense',
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ amount: -1 }).limit(20);

    const prompt = `
      Analyze these recent expenses and suggest cost optimization:
      
      Top Expenses: ${recentExpenses.map(e => `₹${e.amount} - ${e.category}`).join(', ')}
      Total Monthly Expenses: ₹${context.metrics.expenses.toLocaleString('en-IN')}
      
      Provide:
      1. Top 3 cost-saving opportunities
      2. Categories with potential reduction
      3. Specific actions to reduce costs by 10-20%
      4. Long-term cost optimization strategies
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a cost optimization expert providing actionable savings recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 700,
      temperature: 0.7
    });

    return {
      type: 'cost-optimization',
      recommendations: completion.choices[0].message.content,
      potentialSavings: context.metrics.expenses * 0.15, // Estimated 15% savings
      timestamp: new Date(),
      confidence: 0.70
    };
  }

  private async generateCustomerInsights(context: BusinessContext) {
    const recentTransactions = await Record.find({
      userId: context.businessId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 }).limit(50);

    const prompt = `
      Analyze customer behavior from these transactions:
      
      Recent Transactions: ${recentTransactions.length} in last 30 days
      Average Transaction Value: ₹${context.metrics.revenue / context.metrics.transactions}
      Total Revenue: ₹${context.metrics.revenue.toLocaleString('en-IN')}
      
      Provide insights on:
      1. Customer spending patterns
      2. Peak purchasing times
      3. Customer retention opportunities
      4. Upselling/cross-selling potential
      5. Customer satisfaction indicators
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a customer analytics expert providing behavioral insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 700,
      temperature: 0.7
    });

    return {
      type: 'customer-insights',
      insights: completion.choices[0].message.content,
      timestamp: new Date(),
      confidence: 0.75
    };
  }

  private async identifyAutomationOpportunities(context: BusinessContext) {
    const prompt = `
      Identify automation opportunities for this business:
      
      Business Profile:
      - Size: ${context.size}
      - Industry: ${context.industry || 'General'}
      - Monthly Transactions: ${context.metrics.transactions}
      - Revenue: ₹${context.metrics.revenue.toLocaleString('en-IN')}
      
      Suggest:
      1. Repetitive tasks to automate
      2. Workflow optimizations
      3. Tools/software recommendations
      4. Time and cost savings estimates
      5. Implementation priority (High/Medium/Low)
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a business process automation expert."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.7
    });

    return {
      type: 'automation-opportunities',
      recommendations: completion.choices[0].message.content,
      timestamp: new Date(),
      confidence: 0.70
    };
  }

  // Public API methods

  async getTaskHistory(businessId: string, limit: number = 50): Promise<AgentTask[]> {
    return this.taskQueue
      .filter(task => task.businessId === businessId)
      .slice(-limit);
  }

  async getActiveAgents(): Promise<string[]> {
    return Array.from(this.agents.keys());
  }

  async triggerAgentManually(agentName: string, businessId: string): Promise<void> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    const context = this.businessContexts.get(businessId);
    if (!context) {
      await this.updateBusinessContext(businessId);
    }

    this.queueTask({
      id: `manual-${agentName}-${Date.now()}`,
      type: 'analysis',
      priority: 'medium',
      businessId,
      userId: context?.userId || businessId,
      data: { trigger: 'manual', context: this.businessContexts.get(businessId) },
      createdAt: new Date(),
      status: 'pending'
    });
  }

  async getBusinessContext(businessId: string): Promise<BusinessContext | null> {
    return this.businessContexts.get(businessId) || null;
  }
}

export default AutonomousAgents;
