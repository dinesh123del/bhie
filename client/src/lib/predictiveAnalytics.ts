/**
 * Predictive Analytics Engine
 * Forecasts business trends, predicts losses, and generates early warnings
 */

export interface HistoricalData {
  date: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface Prediction {
  timeframe: string;
  predictedLoss: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
  shouldAlert: boolean;
}

export interface TrendAnalysis {
  incomeDirection: 'up' | 'down' | 'flat';
  expenseDirection: 'up' | 'down' | 'flat';
  velocityIncome: number; // % change per period
  velocityExpense: number; // % change per period
  riskScore: number; // 0-100
  healthScore: number; // 0-100
}

/**
 * Simple linear regression for trend prediction
 */
const linearRegression = (data: number[]): { slope: number; intercept: number } => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0 };

  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  return { slope, intercept };
};

/**
 * Predict next period value based on trend
 */
const predictNextValue = (
  historicalData: number[],
  periods: number = 1
): number => {
  const { slope, intercept } = linearRegression(historicalData);
  const nextIndex = historicalData.length + periods - 1;
  return intercept + slope * nextIndex;
};

/**
 * Calculate trend analysis
 */
export const analyzeTrends = (history: HistoricalData[]): TrendAnalysis => {
  if (history.length < 2) {
    return {
      incomeDirection: 'flat',
      expenseDirection: 'flat',
      velocityIncome: 0,
      velocityExpense: 0,
      riskScore: 50,
      healthScore: 50
    };
  }

  // Extract data
  const incomes = history.map(h => h.income);
  const expenses = history.map(h => h.expenses);
  const profits = history.map(h => h.profit);

  // Calculate trends
  const recentIncome = incomes.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const previousIncome = incomes.slice(-6, -3).reduce((a, b) => a + b, 0) / 3 || recentIncome;
  const incomeVelocity = previousIncome !== 0 ? ((recentIncome - previousIncome) / previousIncome) * 100 : 0;

  const recentExpense = expenses.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const previousExpense = expenses.slice(-6, -3).reduce((a, b) => a + b, 0) / 3 || recentExpense;
  const expenseVelocity = previousExpense !== 0 ? ((recentExpense - previousExpense) / previousExpense) * 100 : 0;

  // Determine directions
  const incomeDirection: 'up' | 'down' | 'flat' =
    incomeVelocity > 5 ? 'up' : incomeVelocity < -5 ? 'down' : 'flat';
  const expenseDirection: 'up' | 'down' | 'flat' =
    expenseVelocity > 5 ? 'up' : expenseVelocity < -5 ? 'down' : 'flat';

  // Calculate risk score (0-100, higher = more risky)
  let riskScore = 50;

  // Income declining = higher risk
  if (incomeDirection === 'down') riskScore += 20;
  if (incomeVelocity < -10) riskScore += 15;

  // Expenses rising = higher risk
  if (expenseDirection === 'up') riskScore += 20;
  if (expenseVelocity > 10) riskScore += 15;

  // Expense ratio check
  const recentExpenseRatio = recentExpense / recentIncome;
  if (recentExpenseRatio > 0.8) riskScore += 20;
  if (recentExpenseRatio > 0.9) riskScore += 15;

  // Recent losses = higher risk
  const recentLoss = profits.slice(-3).some(p => p < 0) ? true : false;
  if (recentLoss) riskScore += 25;

  riskScore = Math.min(100, riskScore);

  // Health score is inverse of risk
  const healthScore = 100 - riskScore;

  return {
    incomeDirection,
    expenseDirection,
    velocityIncome: Math.round(incomeVelocity * 10) / 10,
    velocityExpense: Math.round(expenseVelocity * 10) / 10,
    riskScore: Math.round(riskScore),
    healthScore: Math.round(healthScore)
  };
};

/**
 * Predict loss for next 1-3 months
 */
export const predictLoss = (
  history: HistoricalData[],
  monthsAhead: 1 | 2 | 3 = 1
): Prediction => {
  if (history.length < 3) {
    return {
      timeframe: `Next ${monthsAhead} month${monthsAhead > 1 ? 's' : ''}`,
      predictedLoss: 0,
      confidence: 0,
      riskFactors: ['Insufficient historical data'],
      recommendations: ['Upload more financial data for accurate predictions'],
      shouldAlert: false
    };
  }

  // Get trends
  const trends = analyzeTrends(history);

  // Extract data
  const incomes = history.map(h => h.income);
  const expenses = history.map(h => h.expenses);

  // Predict income and expenses
  const predictedIncome = predictNextValue(incomes, monthsAhead);
  const predictedExpense = predictNextValue(expenses, monthsAhead);
  const predictedLoss = Math.max(0, predictedExpense - predictedIncome);

  // Calculate confidence based on data consistency
  const incomeStdDev = calculateStdDev(incomes);
  const incomeVariance = incomeStdDev / (incomes.reduce((a, b) => a + b, 0) / incomes.length) * 100;
  const confidence = Math.max(30, Math.min(95, 100 - incomeVariance));

  // Risk factors
  const riskFactors: string[] = [];
  if (trends.incomeDirection === 'down') riskFactors.push('📉 Income declining');
  if (trends.expenseDirection === 'up') riskFactors.push('📈 Expenses rising');
  if (trends.velocityExpense > 15) riskFactors.push('⚠️ Rapid expense growth detected');
  if (predictedLoss > 0) riskFactors.push('🔴 Predicted loss in next period');
  if (trends.riskScore > 75) riskFactors.push('⚠️ High overall risk');

  // Recommendations
  const recommendations: string[] = [];
  if (predictedLoss > 0) {
    recommendations.push('Immediately review and cut non-essential expenses');
    recommendations.push('Reach out to top clients to accelerate payments');
    recommendations.push('Consider postponing large capital investments');
  }
  if (trends.expenseDirection === 'up' && trends.incomeDirection === 'down') {
    recommendations.push('This is a critical squeeze - prioritize revenue growth');
  }
  recommendations.push('Implement daily expense monitoring');
  recommendations.push('Create 90-day cash flow forecast');

  const shouldAlert = predictedLoss > 0 && confidence > 65;

  return {
    timeframe: `Next ${monthsAhead} month${monthsAhead > 1 ? 's' : ''}`,
    predictedLoss: Math.round(predictedLoss),
    confidence: Math.round(confidence),
    riskFactors,
    recommendations,
    shouldAlert
  };
};

/**
 * Generate action items to prevent predicted loss
 */
export const generatePreventionPlan = (
  prediction: Prediction
): Array<{
  priority: number;
  action: string;
  estimatedImpact: string;
  timeframe: string;
}> => {
  const plan: Array<{
    priority: number;
    action: string;
    estimatedImpact: string;
    timeframe: string;
  }> = [];

  if (prediction.shouldAlert) {
    plan.push({
      priority: 1,
      action: 'Conduct expense audit this week',
      estimatedImpact: 'Save $500-2000',
      timeframe: '1 week'
    });

    plan.push({
      priority: 2,
      action: 'Reach out to delinquent clients',
      estimatedImpact: 'Recover $1000-5000+',
      timeframe: '2-3 days'
    });

    plan.push({
      priority: 3,
      action: 'Suspend new vendor payments',
      estimatedImpact: 'Preserve cash flow',
      timeframe: 'Immediate'
    });

    plan.push({
      priority: 4,
      action: 'Launch targeted marketing campaign',
      estimatedImpact: 'Increase revenue 10-15%',
      timeframe: '1-2 weeks'
    });

    plan.push({
      priority: 5,
      action: 'Negotiate better rates with suppliers',
      estimatedImpact: 'Save 5-10% on expenses',
      timeframe: '1 week'
    });
  }

  return plan.sort((a, b) => a.priority - b.priority);
};

/**
 * Calculate standard deviation
 */
const calculateStdDev = (data: number[]): number => {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  return Math.sqrt(avgSquaredDiff);
};

/**
 * Breakeven analysis - when will business turn profitable
 */
export const breakEvenAnalysis = (
  history: HistoricalData[]
): {
  breakEvenDate: string | null;
  monthsToBreakEven: number;
  requiredIncomeGrowth: number;
} => {
  const incomes = history.map(h => h.income);
  const expenses = history.map(h => h.expenses);

  const avgIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length;
  const avgExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length;

  if (avgIncome >= avgExpense) {
    return {
      breakEvenDate: 'Now',
      monthsToBreakEven: 0,
      requiredIncomeGrowth: 0
    };
  }

  const monthlyDeficit = avgExpense - avgIncome;
  const { slope: incomeSlope } = linearRegression(incomes);

  if (incomeSlope <= 0) {
    return {
      breakEvenDate: 'Unable to determine',
      monthsToBreakEven: -1,
      requiredIncomeGrowth: ((avgExpense - avgIncome) / avgIncome) * 100
    };
  }

  const monthsToBreakEven = monthlyDeficit / incomeSlope;

  return {
    breakEvenDate: `In ${Math.ceil(monthsToBreakEven)} months`,
    monthsToBreakEven: Math.ceil(monthsToBreakEven),
    requiredIncomeGrowth: ((avgExpense - avgIncome) / avgIncome) * 100
  };
};

export default analyzeTrends;
