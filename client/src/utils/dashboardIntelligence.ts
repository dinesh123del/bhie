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
  const revenueStrength = clamp(input.revenue > 0 ? 55 + input.growthRate * 2.2 : 0);
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
      title: 'Cash Flow Overview',
      body: `Operational health sustained at ${Math.round(input.healthScore)} score. Current results show ${formatCurrency(input.profit)} net profit from ${formatCurrency(input.revenue)} revenue.`,
    },
    {
      title: 'Expense Overview',
      body: `Total expenses are ${formatCurrency(input.expenses)} with a ${percentFormatter.format(input.growthRate)}% change. Current profit margin stands at ${percentFormatter.format(input.profitMargin)}%.`,
    },
    {
      title: 'Data Status',
      body: `${input.activeRecords} of ${input.totalRecords} records are being analyzed. Last system update confirmed at ${input.lastUpdated.toLocaleTimeString('en-IN', {
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

  if (input.expenseRatio > 60) {
    recommendations.push({
      title: 'Optimize Variable Costs',
      description: 'Spending is higher than usual. Review your main expense categories to improve available cash.',
      impact: 'Immediate profit improvement',
      priority: 'high',
    });
  }

  if (input.profitMargin < 20) {
    recommendations.push({
      title: 'Review Pricing Strategy',
      description: 'Profit margins are below average. Consider adjusting prices or bundling services to increase value.',
      impact: 'Direct profit growth',
      priority: 'high',
    });
  }

  if (input.growthRate < 10) {
    recommendations.push({
      title: 'Increase Sales Activity',
      description: 'Growth has slowed down. Focus on new customer acquisition and improving your sales process.',
      impact: 'Increases revenue growth',
      priority: 'medium',
    });
  }

  if (input.latestUpload) {
    recommendations.push({
      title: `Check ${input.latestUpload.record.category} Entry`,
      description: `New entry detected: ${formatCurrency(input.latestUpload.record.amount)}. Ensure this matches your latest records.`,
      impact: 'Ensures data accuracy',
      priority: 'low',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintain Current Performance',
      description: 'Your business metrics are looking great. Continue tracking your records regularly to stay on top.',
      impact: 'Secures business health',
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
      label: 'System Status',
      value: input.loadError ? 'ERROR' : input.isRefreshing ? 'UPDATING' : 'ACTIVE',
      tone: input.loadError ? 'warning' : 'positive',
    },
    {
      label: 'Last Sync',
      value: input.lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      tone: 'brand',
    },
    {
      label: 'Performance',
      value: input.healthScore >= 80 ? 'ELITE' : input.healthScore >= 60 ? 'STABLE' : 'CRITICAL',
      tone: input.healthScore >= 80 ? 'positive' : 'warning',
    },
    {
      label: 'Data Input',
      value: input.latestUpload ? 'DATA ADDED' : 'READY FOR DATA',
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
    `BHIE BUSINESS INTELLIGENCE REPORT`,
    `=============================`,
    `Organization: ${input.companyName || 'Main Account'}`,
    `Report Date: ${input.lastUpdated.toLocaleString('en-IN')}`,
    ``,
    `KEY METRICS:`,
    `- Health Score: ${Math.round(input.healthScore)}/100`,
    `- Total Revenue: ${formatCurrency(input.revenue)}`,
    `- Total Expenses: ${formatCurrency(input.expenses)}`,
    `- Net Profit: ${formatCurrency(input.profit)}`,
    `- Growth Rate: ${percentFormatter.format(input.growthRate)}%`,
    `- Profit Margin: ${percentFormatter.format(input.profitMargin)}%`,
    ``,
    `BUSINESS OVERVIEW:`,
    ...input.storyBullets.map((item) => `▶ ${item.title.toUpperCase()}: ${item.body}`),
    ``,
    `RECOMMENDED ACTIONS:`,
    ...input.recommendations.map((item, index) => `[${index + 1}] ${item.title} - ${item.description}`),
    `=============================`,
  ];

  return lines.join('\n');
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

export function exportReport(content: string = "Business Intelligence Report"): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BHIE-Report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
