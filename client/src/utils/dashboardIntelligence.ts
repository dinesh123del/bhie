import { UploadedImageRecord } from '../services/uploadService';

export interface HealthBreakdownItem {
  label: string;
  value: number;
  displayValue: string;
  insight: string;
  tone: 'positive' | 'warning' | 'danger' | 'brand';
}

export interface ActionRecommendation {
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StoryBullet {
  title: string;
  body: string;
}

export interface DailyStatusItem {
  label: string;
  value: string;
  tone: 'positive' | 'warning' | 'brand';
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function buildHealthBreakdown(input: {
  revenue: number;
  expenses: number;
  profit: number;
  growthRate: number;
  expenseRatio: number;
  profitMargin: number;
  healthScore: number;
}): HealthBreakdownItem[] {
  const revenueStrength = clamp(input.revenue > 0 ? 55 + input.growthRate * 2.2 : 22);
  const expenseStrength = clamp(100 - input.expenseRatio);
  const profitStrength = clamp(input.profitMargin * 1.9 + Math.max(input.growthRate, 0) * 0.8);

  return [
    {
      label: 'Revenue',
      value: revenueStrength,
      displayValue: formatCurrency(input.revenue),
      insight: input.revenue > 0 ? `Growth running at ${percentFormatter.format(input.growthRate)}%` : 'No revenue captured yet',
      tone: revenueStrength >= 70 ? 'positive' : revenueStrength >= 45 ? 'brand' : 'warning',
    },
    {
      label: 'Expenses',
      value: expenseStrength,
      displayValue: `${percentFormatter.format(input.expenseRatio)}% of revenue`,
      insight: input.expenseRatio <= 55 ? 'Costs are controlled' : 'Costs need attention',
      tone: expenseStrength >= 70 ? 'positive' : expenseStrength >= 45 ? 'warning' : 'danger',
    },
    {
      label: 'Profit',
      value: profitStrength,
      displayValue: formatCurrency(input.profit),
      insight: `${percentFormatter.format(input.profitMargin)}% margin`,
      tone: profitStrength >= 70 ? 'positive' : profitStrength >= 45 ? 'brand' : 'danger',
    },
  ];
}

export function buildStoryBullets(input: {
  revenue: number;
  expenses: number;
  profit: number;
  growthRate: number;
  profitMargin: number;
  healthScore: number;
  totalRecords: number;
  activeRecords: number;
  lastUpdated: Date;
}): StoryBullet[] {
  return [
    {
      title: 'Business snapshot',
      body: `Your business health score is ${Math.round(input.healthScore)}/100 with ${formatCurrency(input.profit)} in profit from ${formatCurrency(input.revenue)} revenue.`,
    },
    {
      title: 'What changed today',
      body: `Expenses are running at ${formatCurrency(input.expenses)} and growth is ${percentFormatter.format(input.growthRate)}%, giving you a ${percentFormatter.format(input.profitMargin)}% margin.`,
    },
    {
      title: 'Operational story',
      body: `${input.activeRecords} of ${input.totalRecords} records are active, and BHIE last synced at ${input.lastUpdated.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
      })}.`,
    },
  ];
}

export function buildRecommendations(input: {
  revenue: number;
  expenses: number;
  profit: number;
  growthRate: number;
  profitMargin: number;
  expenseRatio: number;
  totalRecords: number;
  activeRecords: number;
  latestUpload: UploadedImageRecord | null;
}): ActionRecommendation[] {
  const recommendations: ActionRecommendation[] = [];

  if (input.expenseRatio > 62) {
    recommendations.push({
      title: 'Reduce operating costs this week',
      description: 'Expenses are consuming a high share of revenue. Review recurring categories and trim low-value spend.',
      impact: 'Could improve margin fastest',
      priority: 'high',
    });
  }

  if (input.profitMargin < 18) {
    recommendations.push({
      title: 'Improve profit on the next five transactions',
      description: 'Raise pricing, bundle services, or prioritize high-margin categories to widen profit margin.',
      impact: 'Direct profit lift',
      priority: 'high',
    });
  }

  if (input.growthRate < 8) {
    recommendations.push({
      title: 'Push revenue momentum',
      description: 'Growth is soft. Focus on repeat customers, follow-ups, and faster invoice collection.',
      impact: 'Supports healthier revenue pace',
      priority: 'medium',
    });
  }

  if (input.totalRecords - input.activeRecords > 3) {
    recommendations.push({
      title: 'Clean up stale records',
      description: 'Several records are inactive. Close or archive them to keep the dashboard reliable.',
      impact: 'Higher data trust and focus',
      priority: 'medium',
    });
  }

  if (input.latestUpload) {
    recommendations.push({
      title: `Review the latest ${input.latestUpload.record.category} upload`,
      description: `BHIE extracted ${formatCurrency(input.latestUpload.record.amount)} as ${input.latestUpload.record.type}. Confirm it and compare against recent spending.`,
      impact: 'Instant upload value',
      priority: 'low',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Stay consistent',
      description: 'Your business indicators are healthy. Keep uploading records daily to maintain momentum and catch changes early.',
      impact: 'Protects current performance',
      priority: 'low',
    });
  }

  return recommendations.slice(0, 4);
}

export function buildDailyStatus(input: {
  healthScore: number;
  lastUpdated: Date;
  isRefreshing: boolean;
  loadError: string | null;
  latestUpload: UploadedImageRecord | null;
}): DailyStatusItem[] {
  return [
    {
      label: 'System status',
      value: input.loadError ? 'Needs attention' : input.isRefreshing ? 'Refreshing' : 'Healthy',
      tone: input.loadError ? 'warning' : 'positive',
    },
    {
      label: 'Last sync',
      value: input.lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      tone: 'brand',
    },
    {
      label: 'Today',
      value: input.healthScore >= 75 ? 'On track' : input.healthScore >= 55 ? 'Watch closely' : 'Take action',
      tone: input.healthScore >= 75 ? 'positive' : 'warning',
    },
    {
      label: 'Upload status',
      value: input.latestUpload ? 'New data captured' : 'Waiting for upload',
      tone: input.latestUpload ? 'positive' : 'brand',
    },
  ];
}

export function buildPlainReport(input: {
  companyName?: string;
  healthScore: number;
  revenue: number;
  expenses: number;
  profit: number;
  growthRate: number;
  profitMargin: number;
  recommendations: ActionRecommendation[];
  storyBullets: StoryBullet[];
  lastUpdated: Date;
}): string {
  const lines = [
    `BHIE Daily Report`,
    `Company: ${input.companyName || 'BHIE Workspace'}`,
    `Generated: ${input.lastUpdated.toLocaleString('en-IN')}`,
    ``,
    `Health Score: ${Math.round(input.healthScore)}/100`,
    `Revenue: ${formatCurrency(input.revenue)}`,
    `Expenses: ${formatCurrency(input.expenses)}`,
    `Profit: ${formatCurrency(input.profit)}`,
    `Growth Rate: ${percentFormatter.format(input.growthRate)}%`,
    `Profit Margin: ${percentFormatter.format(input.profitMargin)}%`,
    ``,
    `Story`,
    ...input.storyBullets.map((item) => `- ${item.title}: ${item.body}`),
    ``,
    `Recommended Actions`,
    ...input.recommendations.map((item, index) => `${index + 1}. ${item.title} - ${item.description} (${item.impact})`),
  ];

  return lines.join('\n');
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
