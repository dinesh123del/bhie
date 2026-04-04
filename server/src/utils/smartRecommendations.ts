// Inline round and clamp functions

export interface Recommendation {
  type: 'critical' | 'warning' | 'suggestion';
  message: string;
}

export { getBusinessAdvisorExplanation } from './businessAdvisor';


export interface PredictionsData {
  trend: 'up' | 'down' | 'stable';
  predictedRevenue: number;
  predictedExpenses: number;
  predictedProfit: number;
  insights: string[];
  recommendations: Recommendation[];
}

export interface InputData {
  revenue: number;
  expenses: number;
  profit: number;
  growthRate: number;
}

function deriveTrend(growthRate: number): 'up' | 'down' | 'stable' {
  if (growthRate > 5) return 'up';
  if (growthRate < -5) return 'down';
  return 'stable';
}

function projectValue(current: number, growthRate: number, months = 3): number {
  const monthlyGrowth = growthRate / 100 / 12;
  return Math.round(current * Math.pow(1 + monthlyGrowth, months));
}

export function generateSmartRecommendations(data: InputData): PredictionsData {
  const { revenue, expenses, profit, growthRate } = data;
  const trend = deriveTrend(growthRate);
  
  // Simple predictions: 3-month projection
  const predictedRevenue = projectValue(revenue, growthRate);
  const predictedExpenses = projectValue(expenses, growthRate * 0.8); // expenses grow slower
  const predictedProfit = predictedRevenue - predictedExpenses;
  
  const recommendations: Recommendation[] = [];
  const insights: string[] = [];

  // Rule-based logic
  if (trend === 'up') {
    recommendations.push({ type: 'suggestion', message: 'Scale operations and hire strategically to capitalize on rising revenue' });
    if (revenue > 0) {
      recommendations.push({ type: 'suggestion', message: `Reinvest ${Math.round((predictedProfit * 0.3)/1000)}K profit into growth initiatives` });
    }
    insights.push('Strong upward momentum detected');
  } 

  if (trend === 'down') {
    recommendations.push({ type: 'critical', message: 'Immediate cost audit required - expenses growing faster than revenue ⚠️' });
    recommendations.push({ type: 'warning', message: 'Reduce non-essential spending by 15-20% immediately' });
    insights.push('Downward trend - action needed');
  }

  if (profit < 0 || predictedProfit < 0) {
    recommendations.push({ type: 'critical', message: `Profit declining: Cut costs in top category by ₹${Math.round(expenses * 0.2)}` });
  }

  if (expenses / revenue > 0.7) {
    recommendations.push({ type: 'warning', message: `High expense ratio (${Math.round((expenses/revenue)*100)}%). Target <65%` });
  }

  if (trend === 'stable') {
    recommendations.push({ type: 'suggestion', message: 'Explore new markets or products for breakthrough growth' });
    insights.push('Stable performance - opportunity for optimization');
  }

  if (growthRate > 15) {
    recommendations.push({ type: 'suggestion', message: 'High growth phase: Consider financing options for expansion' });
  }

  if (recommendations.length === 0) {
    recommendations.push({ type: 'suggestion', message: 'Continue current strategy - performance stable' });
  }

  return {
    trend,
    predictedRevenue,
    predictedExpenses,
    predictedProfit,
    insights,
    recommendations: recommendations.slice(0, 5), // Limit to top 5
  };
}

// Util helpers if not in utils
export function round(value: number): number {
  return Number(value.toFixed(1));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
