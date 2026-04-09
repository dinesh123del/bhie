import { env } from '../config/env.js';
import { callOpenAI, parseAIResponse } from './openai.js';

export type InsightType = 'positive' | 'warning' | 'info';
export type InsightMetric = 'revenue' | 'expenses' | 'profit' | 'activity' | 'general';

export interface DashboardInsight {
  type: InsightType;
  message: string;
  detail?: string;
  metric?: InsightMetric;
  value?: string;
}

export interface InsightPeriodSnapshot {
  revenue: number;
  expenses: number;
  profit: number;
}

export interface InsightTrendPoint {
  date?: string;
  name?: string;
  value?: number;
}

export interface GenerateInsightsInput {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  growthRate: number;
  totalRecords: number;
  activeRecords: number;
  currentPeriod: InsightPeriodSnapshot;
  previousPeriod: InsightPeriodSnapshot;
  recentTrend: InsightTrendPoint[];
  userId?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const MAX_INSIGHTS = 5;
const AI_TIMEOUT_MS = 2500;

export async function generateInsights(input: GenerateInsightsInput): Promise<DashboardInsight[]> {
  const baseInsights = buildRuleBasedInsights(input);

  if (!env.OPENAI_API_KEY || baseInsights.length === 0) {
    return baseInsights;
  }

  try {
    const enhancedInsights = await withTimeout(enhanceInsightsWithAI(input, baseInsights), AI_TIMEOUT_MS);
    return enhancedInsights.length > 0 ? enhancedInsights : baseInsights;
  } catch {
    return baseInsights;
  }
}

function buildRuleBasedInsights(input: GenerateInsightsInput): DashboardInsight[] {
  const {
    revenue,
    expenses,
    profit,
    profitMargin,
    growthRate,
    totalRecords,
    activeRecords,
    currentPeriod,
    previousPeriod,
    recentTrend,
  } = input;

  if (totalRecords === 0 && revenue <= 0 && expenses <= 0) {
    return [
      {
        type: 'info',
        metric: 'general',
        message: 'Upload records to unlock AI insights',
        detail: 'Add bills, receipts, or transactions and Biz Plus will start tracking patterns automatically.',
        value: 'No data yet',
      },
    ];
  }

  const insights: DashboardInsight[] = [];

  // ELITE INNOVATION: CAPITAL EXHAUST & RESONANCE ENGINE
  const activityDensity = totalRecords > 0 ? (expenses + revenue) / totalRecords : 0;
  const yieldEfficiency = totalRecords > 0 ? profit / totalRecords : 0;
  const resonanceIndex = activityDensity > 0 ? (yieldEfficiency / activityDensity) * 100 : 0;

  if (totalRecords > 10) {
    if (resonanceIndex < 15) {
      insights.push({
        type: 'warning',
        metric: 'general',
        message: 'High Spending Relative to Profit',
        detail: `Your spending is significantly higher than your profit yield. Profitability is currently low compared to your business activity.`,
        value: 'Low Yield',
      });
    } else if (resonanceIndex > 45) {
      insights.push({
        type: 'positive',
        metric: 'general',
        message: 'Optimal Business Health',
        detail: 'The business is performing very efficiently. Each transaction is contributing well to your net profit.',
        value: 'Healthy Yield',
      });
    }
  }

  const revenueChange = calculateChange(currentPeriod.revenue, previousPeriod.revenue);
  const expenseChange = calculateChange(currentPeriod.expenses, previousPeriod.expenses);
  const profitChange = calculateChange(currentPeriod.profit, previousPeriod.profit);
  const activeRatio = totalRecords > 0 ? (activeRecords / totalRecords) * 100 : 0;
  const expenseRatio = revenue > 0 ? (expenses / revenue) * 100 : 0;
  const trendDirection = getTrendDirection(recentTrend);

  if (revenueChange >= 5) {
    insights.push({
      type: 'positive',
      metric: 'revenue',
      message: `Revenue increased by ${formatPercent(revenueChange)}`,
      detail: `Current revenue is ${formatCurrency(revenue)} compared with ${formatCurrency(previousPeriod.revenue)} in the previous period.`,
      value: formatCurrency(revenue),
    });
  } else if (revenueChange <= -5) {
    insights.push({
      type: 'warning',
      metric: 'revenue',
      message: `Revenue dropped by ${formatPercent(Math.abs(revenueChange))}`,
      detail: `Current revenue is ${formatCurrency(revenue)}. Review recent sales activity and collections to recover momentum.`,
      value: formatCurrency(revenue),
    });
  }

  if (expenseChange >= 8 || expenseRatio >= 70) {
    insights.push({
      type: 'warning',
      metric: 'expenses',
      message: expenseChange >= 8 ? 'Expenses are rising faster than before' : 'Expense ratio is too high',
      detail: `Expenses are ${formatCurrency(expenses)} and now use ${formatPercent(expenseRatio)} of revenue.`,
      value: formatCurrency(expenses),
    });
  } else if (expenseRatio > 0 && expenseRatio <= 50) {
    insights.push({
      type: 'info',
      metric: 'expenses',
      message: 'Expense control is healthy',
      detail: `Operating costs are holding at ${formatPercent(expenseRatio)} of revenue, which supports better profit protection.`,
      value: formatPercent(expenseRatio),
    });
  }

  if ((profitChange >= 5 && profit > 0) || (profitMargin >= 18 && growthRate >= 0)) {
    insights.push({
      type: 'positive',
      metric: 'profit',
      message: profitChange >= 5 ? `Profit improved by ${formatPercent(profitChange)}` : 'Profit margin is holding strong',
      detail: `Profit is ${formatCurrency(profit)} with a ${formatPercent(profitMargin)} margin.`,
      value: formatCurrency(profit),
    });
  } else if (profit <= 0 || profitChange <= -5 || profitMargin < 10) {
    insights.push({
      type: 'warning',
      metric: 'profit',
      message: profit <= 0 ? 'Profit is under pressure' : 'Profit margin needs attention',
      detail: `Current profit is ${formatCurrency(profit)} and margin is ${formatPercent(profitMargin)}. Tighten costs or improve revenue mix.`,
      value: formatPercent(profitMargin),
    });
  }

  if (activeRatio >= 80 && totalRecords >= 5) {
    insights.push({
      type: 'info',
      metric: 'activity',
      message: 'Business activity tracking is consistent',
      detail: `${activeRecords} of ${totalRecords} records are active, giving Biz Plus stronger data for analysis.`,
      value: `${Math.round(activeRatio)}% active`,
    });
  } else if (totalRecords > 0 && totalRecords < 5) {
    insights.push({
      type: 'info',
      metric: 'activity',
      message: 'Add more records for stronger insights',
      detail: 'A few more uploads or transactions will make the dashboard trends more reliable.',
      value: `${totalRecords} records`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      metric: 'general',
      message: 'Stable performance across the latest period',
      detail:
        trendDirection === 'up'
          ? 'Recent activity is steady and trending slightly upward without major risk signals.'
          : trendDirection === 'down'
            ? 'Recent activity softened slightly, but no strong warning signals were detected yet.'
            : 'Revenue, expenses, and profit are relatively stable compared with the previous period.',
      value: formatPercent(growthRate),
    });
  }

  return dedupeInsights(insights).slice(0, MAX_INSIGHTS);
}

async function enhanceInsightsWithAI(
  input: GenerateInsightsInput,
  baseInsights: DashboardInsight[]
): Promise<DashboardInsight[]> {
  const { CacheService } = await import('../services/cacheService.js');
  const cacheKey = input.userId ? `cache:ai:insights:${input.userId}` : null;

  if (cacheKey) {
    const cachedAI = await CacheService.get<DashboardInsight[]>(cacheKey);
    if (cachedAI && cachedAI.length > 0) {
      return cachedAI;
    }
  }

  const prompt = [
    'You are a professional Business Analyst and Strategic Consultant for Biz Plus.',
    'Your goal is to provide clear, actionable business advice to small and medium business owners.',
    'Do not use technical AI jargon or complex financial engineering terms.',
    'Keep the same meaning as the provided rule-based insights.',
    'Return valid JSON with this exact shape: {"insights":[{"type":"positive|warning|info","message":"...","detail":"...","metric":"revenue|expenses|profit|activity|general","value":"..."}]}',
    'Return at most 5 insights.',
    'Make the message concise, realistic, and useful for a regular business user.',
    '',
    `Business summary: ${JSON.stringify({
      revenue: input.revenue,
      expenses: input.expenses,
      profit: input.profit,
      profitMargin: input.profitMargin,
      growthRate: input.growthRate,
      totalRecords: input.totalRecords,
      activeRecords: input.activeRecords,
      currentPeriod: input.currentPeriod,
      previousPeriod: input.previousPeriod,
      recentTrend: input.recentTrend,
    })}`,
    '',
    `Rule-based insights: ${JSON.stringify(baseInsights)}`,
  ].join('\n');

  const result = await callOpenAI(prompt, 'gpt-4o-mini');
  const parsed = parseAIResponse(result);
  const aiInsights = normalizeInsights(parsed?.insights);

  const finalInsights = aiInsights.length > 0 ? aiInsights : baseInsights;

  if (cacheKey && finalInsights.length > 0) {
    // Cache AI Strategic insights for 12 hours since they shouldn't bounce constantly
    await CacheService.set(cacheKey, finalInsights, 60 * 60 * 12);
  }

  return finalInsights;
}

function normalizeInsights(value: unknown): DashboardInsight[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: DashboardInsight[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const raw = item as Record<string, unknown>;
    const type = normalizeInsightType(raw.type);
    const message = typeof raw.message === 'string' ? raw.message.trim() : '';
    if (!type || !message) {
      continue;
    }

    const insight: DashboardInsight = {
      type,
      message,
    };

    const metric = normalizeInsightMetric(raw.metric);
    if (metric) {
      insight.metric = metric;
    }

    if (typeof raw.detail === 'string' && raw.detail.trim()) {
      insight.detail = raw.detail.trim();
    }

    if (typeof raw.value === 'string' && raw.value.trim()) {
      insight.value = raw.value.trim();
    }

    normalized.push(insight);
  }

  return normalized.slice(0, MAX_INSIGHTS);
}

function normalizeInsightType(value: unknown): InsightType | null {
  if (value === 'positive' || value === 'warning' || value === 'info') {
    return value;
  }

  return null;
}

function normalizeInsightMetric(value: unknown): InsightMetric | undefined {
  if (
    value === 'revenue' ||
    value === 'expenses' ||
    value === 'profit' ||
    value === 'activity' ||
    value === 'general'
  ) {
    return value;
  }

  return undefined;
}

function dedupeInsights(insights: DashboardInsight[]): DashboardInsight[] {
  const seen = new Set<string>();

  return insights.filter((insight) => {
    const key = `${insight.type}:${insight.metric || 'general'}:${insight.message}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getTrendDirection(trends: InsightTrendPoint[]): 'up' | 'down' | 'flat' {
  if (trends.length < 2) {
    return 'flat';
  }

  const first = Number(trends[0]?.value || 0);
  const last = Number(trends[trends.length - 1]?.value || 0);

  if (last > first * 1.08) {
    return 'up';
  }

  if (last < first * 0.92) {
    return 'down';
  }

  return 'flat';
}

function calculateChange(current: number, previous: number): number {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number): string {
  return `${Math.abs(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Insights AI timeout')), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
