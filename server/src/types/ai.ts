import {  } from 'mongoose';

/**
 * Business Data for AI Analysis
 */
export interface BusinessData {
  revenue: number;
  expenses: number;
  customerCount: number;
  previousRevenue?: number;
  growthRate?: number;
  industry?: string;
  location?: string;
  employees?: number;
}

/**
 * Financial Agent Output
 */
export interface FinancialInsights {
  profitMargin: string;
  expenseRatio: string;
  profitTrend: 'positive' | 'negative' | 'stable';
  keyFindings: string[];
  risks: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Market Agent Output
 */
export interface MarketInsights {
  demandLevel: string;
  competitionIntensity: string;
  marketTrend: string;
  opportunities: string[];
  threats: string[];
}

/**
 * Prediction Agent Output
 */
export interface Predictions {
  forecast3Month: {
    revenue: string;
    changePercent: string;
    confidence: string;
  };
  forecast6Month: {
    revenue: string;
    changePercent: string;
    confidence: string;
  };
  forecast12Month: {
    revenue: string;
    changePercent: string;
    confidence: string;  
  };
  growthTrajectory: string;
  overallTrend: string;
}

/**
 * Strategy Agent Output
 */
export interface Strategies {
  executiveSummary: string;
  strategicPriority: 'high' | 'medium' | 'low';
  timeToImplement: string;
  estimatedROI: string;
  strategies: Array<{
    rank: number;
    title: string;
    description: string;
    actionPlan: string;
    expectedImpact: string;
    impactPercent: string;
    timeline: string;
    resourcesNeeded: string[];
    riskLevel: 'low' | 'medium' | 'high';
    successMetrics: string[];
    confidence: string;
  }>;
  immediateActions: string[];
  riskMitigation: string[];
  nextReviewDate: string;
}

/**
 * Complete AI Analysis Response (Orchestrator)
 */
export interface AIAnalysisResponse {
  timestamp: string;
  businessData: BusinessData;
  analysis: {
    financial: FinancialInsights;
    market: MarketInsights;
    predictions: Predictions;
    strategies: Strategies;
  };
  status: 'complete' | 'error';
  message: string;
  analysisId?: string;
}

/**
 * AI Analysis Request
 */
export interface AIAnalysisRequest {
  businessData?: Partial<BusinessData>;
  companyId?: string;
}

export interface AIHealthResponse {
  status: 'healthy' | 'unhealthy';
  smartEngineConnected: boolean;
  agentsReady: boolean;
}

/**
 * SMART Recommendations Output
 */
export interface Recommendation {
  type: 'critical' | 'warning' | 'suggestion';
  message: string;
}

export interface PredictionsWithRecommendations {
  trend: 'up' | 'down' | 'stable';
  predictedRevenue: number;
  predictedExpenses: number;
  predictedProfit: number;
  insights: string[];
  recommendations: Recommendation[];
  advisor?: {
    summary: string;
    advice: string;
  };
}


