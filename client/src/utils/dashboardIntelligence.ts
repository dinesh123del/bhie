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
      title: 'Strategic Capital Velocity',
      body: `Operational health sustained at ${Math.round(input.healthScore)} INDEX. Current yield reflects ${formatCurrency(input.profit)} net profit from a ${formatCurrency(input.revenue)} revenue stream.`,
    },
    {
      title: 'Tactical Expenditure Analysis',
      body: `Outflows normalized at ${formatCurrency(input.expenses)} with a ${percentFormatter.format(input.growthRate)}% momentum shift. Current capital efficiency stands at ${percentFormatter.format(input.profitMargin)}% margin.`,
    },
    {
      title: 'System Node Integrity',
      body: `${input.activeRecords} of ${input.totalRecords} intelligence nodes are functional. Real-time data synthesis confirmed at ${input.lastUpdated.toLocaleTimeString('en-IN', {
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
      title: 'Optimize Variable Expenditure',
      description: 'Capital consumption is exceeding optimal thresholds. Initiate a deep audit of high-density expense categories to restore liquidity.',
      impact: 'Immediate margin recovery',
      priority: 'high',
    });
  }

  if (input.profitMargin < 20) {
    recommendations.push({
      title: 'Calibrate Pricing Strategy',
      description: 'Net margins are below industry benchmarks. Consider defensive pricing adjustments or high-yield service bundling.',
      impact: 'Direct bottom-line expansion',
      priority: 'high',
    });
  }

  if (input.growthRate < 10) {
    recommendations.push({
      title: 'Accelerate Client Acquisition',
      description: 'Market momentum has decelerated. Deploy growth-focused tactics and optimize the sales conversion funnel.',
      impact: 'Scales revenue trajectory',
      priority: 'medium',
    });
  }

  if (input.latestUpload) {
    recommendations.push({
      title: `Validate ${input.latestUpload.record.category} Intelligence`,
      description: `New data detected: ${formatCurrency(input.latestUpload.record.amount)}. Synchronize this input with your current fiscal projections.`,
      impact: 'Ensures data synchronicity',
      priority: 'low',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintain Operational Excellence',
      description: 'System metrics indicate top-tier performance. Continue high-frequency data ingestion to preserve market advantage.',
      impact: 'Secures elite status',
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
      label: 'Core Protocol',
      value: input.loadError ? 'TERMINAL ERROR' : input.isRefreshing ? 'SYNCHRONIZING' : 'ACTIVE',
      tone: input.loadError ? 'warning' : 'positive',
    },
    {
      label: 'Data Integrity',
      value: input.lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      tone: 'brand',
    },
    {
      label: 'Performance',
      value: input.healthScore >= 80 ? 'ELITE' : input.healthScore >= 60 ? 'STABLE' : 'CRITICAL',
      tone: input.healthScore >= 80 ? 'positive' : 'warning',
    },
    {
      label: 'Intelligence Node',
      value: input.latestUpload ? 'DATA INGESTED' : 'AWAITING INPUT',
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
    `BHIE ELITE INTELLIGENCE REPORT`,
    `=============================`,
    `Organization: ${input.companyName || 'BHIE Primary Node'}`,
    `Synthesis Date: ${input.lastUpdated.toLocaleString('en-IN')}`,
    ``,
    `CRITICAL METRICS:`,
    `- Health Index: ${Math.round(input.healthScore)}/100`,
    `- Revenue Velocity: ${formatCurrency(input.revenue)}`,
    `- Capital Outflow: ${formatCurrency(input.expenses)}`,
    `- Net Yield: ${formatCurrency(input.profit)}`,
    `- Growth Momentum: ${percentFormatter.format(input.growthRate)}%`,
    `- Operational Margin: ${percentFormatter.format(input.profitMargin)}%`,
    ``,
    `STRATEGIC NARRATIVE:`,
    ...input.storyBullets.map((item) => `▶ ${item.title.toUpperCase()}: ${item.body}`),
    ``,
    `RECOMMENDED PROTOCOLS:`,
    ...input.recommendations.map((item, index) => `[${index + 1}] ${item.title} - ${item.description}`),
    `=============================`,
  ];

  return lines.join('\n');
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
