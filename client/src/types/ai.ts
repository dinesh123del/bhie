/**
 * AI Analysis Type Definitions
 */

export interface BusinessData {
  revenue: number;
  expenses: number;
  customerCount: number;
  previousRevenue?: number;
  category?: string;
  marketPosition?: string;
}

export interface FinancialInsights {
  profitMargin: string;
  expenseRatio: string;
  profitTrend: 'positive' | 'negative' | 'stable';
  keyFindings: string[];
  risks: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface MarketInsights {
  demandLevel: 'high' | 'medium' | 'low';
  competitionIntensity: 'high' | 'medium' | 'low';
  marketTrend: 'growing' | 'stable' | 'declining';
  marketGaps: string[];
  opportunities: string[];
  threats: string[];
  customerRetention: 'strong' | 'moderate' | 'weak';
  marketRecommendations: string[];
  marketScore: string;
}

export interface Forecast {
  revenue: string;
  changePercent: string;
  confidence: string;
}

export interface PredictiveInsights {
  forecast3Month: Forecast;
  forecast6Month: Forecast;
  forecast12Month: Forecast;
  growthTrajectory: 'accelerating' | 'stable' | 'declining';
  profitForecast: string;
  forecastingFactors: string[];
  riskFactors: string[];
  overallTrend: 'positive' | 'neutral' | 'negative';
  predictiveInsights: string[];
}

export interface Strategy {
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
}

export interface StrategicRecommendations {
  executiveSummary: string;
  strategicPriority: 'high' | 'medium' | 'low';
  timeToImplement: string;
  estimatedROI: string;
  strategies: Strategy[];
  immediateActions: string[];
  riskMitigation: string[];
  nextReviewDate: string;
}

export interface AnalysisData {
  financial: FinancialInsights;
  market: MarketInsights;
  predictions: PredictiveInsights;
  strategies: StrategicRecommendations;
}

export interface AnalysisResult {
  timestamp: string;
  businessData: BusinessData;
  analysis: AnalysisData;
  status: 'complete' | 'error';
  message: string;
  analysisId?: string;
}

export interface AIErrorResponse {
  status: 'error';
  message: string;
  error?: string;
}

export interface AIHealthCheck {
  status: 'healthy';
  service: string;
  agents: string[];
  openaiConfigured: boolean;
}
