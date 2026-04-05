import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  FileText,
  IndianRupee,
  ScanSearch,
  Settings,
  TrendingUp,
  UploadCloud,
  Users,
  Wallet,
} from 'lucide-react';
import {
  RiCalendarEventLine,
  RiSparkling2Fill,
} from 'react-icons/ri';
import { MainLayout } from '../components/Layout/MainLayout';
import { PremiumBadge, PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import { SkeletonGrid } from '../components/ui/Skeleton';
import SummaryCard from '../components/SummaryCard';
import { AnimatedNumber } from '../components/AnimatedNumber';
import RevenueLineChart from '../components/charts/RevenueLineChart';
import ProfitBarChart from '../components/charts/ProfitBarChart';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import GrowthAreaChart from '../components/charts/GrowthAreaChart';

import { InsightItem } from '../components/InsightsPanel';
import { useAuth } from '../hooks/useAuth';
import { FileUpload } from '../components/FileUpload';
import QuickAdd from '../components/QuickAdd';
import { UploadedImageRecord } from '../services/uploadService';
import { dashboardAPI } from '../services/api';
import { canUseAIInsights, getPlanLabel as getReadablePlanLabel, getRemainingUploads } from '../utils/plan';
import BusinessHealthEngine from '../components/BusinessHealthEngine';
import ActionCenter from '../components/ActionCenter';
import {
  buildDailyStatus,
  buildHealthBreakdown,
  buildPlainReport,
  buildRecommendations,
  buildStoryBullets,
  formatCurrency,
} from '../utils/dashboardIntelligence';
import { QuickActionsBar } from '../components/QuickActionsBar';
import { premiumFeedback } from '../utils/premiumFeedback';

interface MetricsSummary {
  kpis?: {
    totalRecords?: number;
    activeRecords?: number;
    inactiveRatio?: number;
    growthRate?: number;
    revenue?: number;
    expenses?: number;
    profitMargin?: number;
  };
  monthlyData?: Array<{ month: string; revenue: number; expenses: number; target: number }>;
}

interface Breakdown {
  profitability: number;
  growth: number;
  activity: number;
  efficiency: number;
}

interface ScoreData {
  score: number;
  status: string;
  breakdown: Breakdown;
}

interface CompanyProfile {
  name?: string;
  industry?: string;
  revenue?: number;
  expenses?: number;
  employees?: number;
  growthRate?: number;
  profit?: number;
  profitMargin?: number;
}

interface TrendPoint {
  name?: string;
  value?: number;
  date?: string;
}

interface DashboardResponse {
  unreadCount?: number;
  metrics: MetricsSummary | null;
  scoreData: ScoreData | null;
  company: CompanyProfile | null;
  trends: TrendPoint[];
  insights: InsightItem[];
  latestUpload: UploadedImageRecord | null;
  refreshedAt?: string;
}

const DASHBOARD_REFRESH_INTERVAL = 7000;

const sidebarItems = [
  { icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard', href: '/dashboard' },
  { icon: <FileText className="h-5 w-5" />, label: 'Records', href: '/records' },
  { icon: <UploadCloud className="h-5 w-5" />, label: 'Uploads', href: '/uploads' },
  { icon: <TrendingUp className="h-5 w-5" />, label: 'Analytics', href: '/analytics' },
  { icon: <Settings className="h-5 w-5" />, label: 'Settings', href: '/settings' },
];

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
});

const clamp = (value: number, min: number = 0, max: number = 100) =>
  Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

const getDashboardErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to refresh dashboard right now.';
};

const normalizeLatestUpload = (value: unknown): UploadedImageRecord | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const input = value as Partial<UploadedImageRecord> & {
    extracted?: UploadedImageRecord['extracted'] & { extractedText?: string };
  };

  if (!input.record) {
    return null;
  }

  const rawText =
    input.extracted?.rawText ||
    input.extracted?.extractedText ||
    input.image?.extractedText ||
    '';

  return {
    ...input,
    extracted: {
      rawText,
      amount: input.extracted?.amount ?? input.record.amount ?? 0,
      type: input.extracted?.type ?? input.image?.detectedType ?? input.record.type ?? 'unknown',
      category: input.extracted?.category ?? input.record.category ?? input.image?.category ?? 'general',
      date: input.extracted?.date ?? input.record.date ?? new Date().toISOString(),
      amountMatch: input.extracted?.amountMatch ?? null,
      extractedText: input.extracted?.extractedText,
    },
    file: input.file,
    image: input.image ?? null,
    record: input.record,
  } as UploadedImageRecord;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [latestUpload, setLatestUpload] = useState<UploadedImageRecord | null>(null);
  const [apiData, setApiData] = useState<DashboardResponse | null>(null);
  const [detailsOpen, setDetailsOpen] = useState({ recent: true, insights: true });
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const hasLoadedRef = useRef(false);
  const mountedRef = useRef(true);
  const requestInFlightRef = useRef(false);

  const loadDashboard = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    const isInitialLoad = !hasLoadedRef.current;

    if (requestInFlightRef.current) {
      return;
    }

    if (isInitialLoad) {
      setLoading(true);
    } else if (silent) {
      setIsRefreshing(true);
    }

    try {
      requestInFlightRef.current = true;
      const response = await dashboardAPI.get();
      if (!mountedRef.current) {
        return;
      }

      const payload = response as DashboardResponse;

      startTransition(() => {
        setApiData(payload);
        setMetrics(payload.metrics ?? null);
        setScoreData(payload.scoreData ?? null);
        setCompany(payload.company ?? null);
        setInsights(payload.insights ?? []);
        setLatestUpload((current) => normalizeLatestUpload(payload.latestUpload) ?? current);
        setLastUpdated(payload.refreshedAt ? new Date(payload.refreshedAt) : new Date());
      });

      setLoadError(null);
      hasLoadedRef.current = true;
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setLoadError(getDashboardErrorMessage(error));
    }
    finally {
      requestInFlightRef.current = false;

      if (!mountedRef.current) {
        return;
      }

      if (isInitialLoad) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadDashboard();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'hidden') {
        return;
      }

      void loadDashboard({ silent: true });
    }, DASHBOARD_REFRESH_INTERVAL);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [loadDashboard]);

  useEffect(() => {
    const handleRecordsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<UploadedImageRecord | UploadedImageRecord[] | undefined>;
      const eventPayload = Array.isArray(customEvent.detail) ? customEvent.detail[0] : customEvent.detail;
      const nextUpload = normalizeLatestUpload(eventPayload);

      if (nextUpload) {
        setLatestUpload(nextUpload);
      }

      void loadDashboard({ silent: true });
    };

    window.addEventListener('bhie:records-updated', handleRecordsUpdated);
    return () => window.removeEventListener('bhie:records-updated', handleRecordsUpdated);
  }, [loadDashboard]);

  const revenue = company?.revenue ?? metrics?.kpis?.revenue ?? 0;
  const expenses = company?.expenses ?? (metrics?.kpis?.expenses ?? 0);
  const profit = company?.profit ?? (revenue - expenses);
  const growthRate = company?.growthRate ?? metrics?.kpis?.growthRate ?? 0;
  const profitMargin =
    company?.profitMargin ??
    metrics?.kpis?.profitMargin ??
    (revenue > 0 ? (profit / revenue) * 100 : 0);
  const totalRecords = metrics?.kpis?.totalRecords ?? user?.usageCount ?? 0;
  const activeRecords = metrics?.kpis?.activeRecords ?? totalRecords;
  const expenseRatio = revenue > 0 ? (expenses / revenue) * 100 : 0;
  const smartInsightsEnabled = canUseAIInsights(user);
  const remainingUploads = getRemainingUploads(user);
  const remainingUploadsLabel = Number.isFinite(remainingUploads)
    ? `${remainingUploads} free uploads left`
    : 'Unlimited uploads available';
  const previousRevenue = revenue > 0 ? (revenue / Math.max(0.2, 1 + growthRate / 100)) : 0;
  const targetRevenue = previousRevenue * 1.18;
  const revenueProgress = clamp(targetRevenue > 0 ? (revenue / targetRevenue) * 100 : 0);
  const expenseControlProgress = clamp(revenue > 0 ? (125 - expenseRatio) : 0);
  const profitGrowthProgress = clamp(profitMargin * 1.45 + Math.max(growthRate, 0) * 0.95);
  const overallProgress = Math.round((revenueProgress + expenseControlProgress + profitGrowthProgress) / 3);

  const summaryCards = useMemo(
    () => [
      {
        title: 'Revenue',
        value: formatCurrency(revenue),
        change: `Growth: +${growthRate.toFixed(1)}%`,
        detail: revenue > 0 ? `On track toward ${formatCurrency(targetRevenue)} this cycle.` : 'No revenue recorded yet.',
        tone: 'positive' as const,
        icon: <IndianRupee className="h-7 w-7" />,
      },
      {
        title: 'Expenses',
        value: formatCurrency(expenses),
        change: expenseRatio > 60 ? 'Cost pressure' : 'Cost under control',
        detail: revenue > 0 ? `${expenseRatio.toFixed(1)}% of revenue is spent.` : 'Add expenses as you upload records.',
        tone: expenseRatio > 60 ? ('negative' as const) : ('positive' as const),
        icon: <Wallet className="h-7 w-7" />,
      },
      {
        title: 'Profit',
        value: formatCurrency(profit),
        change: `${profitMargin.toFixed(1)}% margin`,
        detail: profit >= 0 ? 'Profit is positive, keep the trend.' : 'Profit needs a cost review.',
        tone: 'accent' as const,
        highlight: true,
        icon: <TrendingUp className="h-7 w-7" />,
      },
    ],
    [expenseRatio, expenses, growthRate, profit, profitMargin, revenue, targetRevenue]
  );

  const statusCards = [
    {
      label: 'Date',
      value: dateFormatter.format(new Date()),
      icon: <RiCalendarEventLine className="h-5 w-5" />,
    },
    {
      label: 'User',
      value: user?.name ?? 'BHIE User',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Plan',
      value: getReadablePlanLabel(user?.plan),
      icon: <RiSparkling2Fill className="h-5 w-5" />,
    },
  ];

  const healthScore = scoreData?.score ?? overallProgress;
  const healthBreakdown = useMemo(
    () =>
      buildHealthBreakdown({
        revenue,
        expenses,
        profit,
        growthRate,
        expenseRatio,
        profitMargin,
        healthScore,
      }),
    [expenseRatio, expenses, growthRate, healthScore, profit, profitMargin, revenue]
  );

  const storyBullets = useMemo(
    () =>
      buildStoryBullets({
        revenue,
        expenses,
        profit,
        growthRate,
        profitMargin,
        healthScore,
        totalRecords,
        activeRecords,
        lastUpdated,
      }),
    [activeRecords, expenses, growthRate, healthScore, lastUpdated, profit, profitMargin, revenue, totalRecords]
  );

  const storySummary = useMemo(() => {
    if (healthScore >= 80) {
      return `Today looks healthy. You are converting ${formatCurrency(revenue)} revenue into ${formatCurrency(profit)} profit with strong control.`;
    }

    if (healthScore >= 60) {
      return `Today is stable, but costs need a closer watch. Protect profit while keeping revenue momentum moving.`;
    }

    return `Today needs action. Reduce cost leakage, review the latest records, and focus on restoring margin quickly.`;
  }, [healthScore, profit, revenue]);

  const recommendations = useMemo(
    () =>
      buildRecommendations({
        revenue,
        expenses,
        profit,
        growthRate,
        profitMargin,
        expenseRatio,
        totalRecords,
        activeRecords,
        latestUpload,
      }),
    [activeRecords, expenseRatio, expenses, growthRate, latestUpload, profit, profitMargin, revenue, totalRecords]
  );

  const dailyStatus = useMemo(
    () =>
      buildDailyStatus({
        healthScore,
        lastUpdated,
        isRefreshing,
        loadError,
        latestUpload,
      }),
    [healthScore, isRefreshing, lastUpdated, latestUpload, loadError]
  );

  const confirmationMessage = loadError
    ? loadError
    : latestUpload
      ? `Latest file processed successfully. ${(latestUpload.file?.originalName || latestUpload.record.title)} was converted into a saved ${latestUpload.record.type} record.`
      : 'System is healthy, dashboard is synced, and BHIE is ready for your next upload.';

  const handleExportReport = useCallback(() => {
    const report = buildPlainReport({
      companyName: company?.name,
      healthScore,
      revenue,
      expenses,
      profit,
      growthRate,
      profitMargin,
      recommendations,
      storyBullets,
      lastUpdated,
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bhie-daily-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [company?.name, expenses, growthRate, healthScore, lastUpdated, profit, profitMargin, recommendations, revenue, storyBullets]);

  const handleWhatShouldIDo = useCallback(() => {
    const topPriority = recommendations[0];
    if (!topPriority) {
      return;
    }

    window.alert(`${topPriority.title}\n\n${topPriority.description}\n\nImpact: ${topPriority.impact}`);
  }, [recommendations]);

  if (loading) {
    return (
      <MainLayout
        sidebarItems={sidebarItems}
        activePage="/dashboard"
        onNavigate={(href) => navigate(href)}
        onLogout={logout}
        userName={user?.name}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="h-14 w-80 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-5 w-96 animate-pulse rounded-full bg-white/10" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel h-[430px] animate-pulse border border-white/10" />
            <div className="glass-panel h-[430px] animate-pulse border border-white/10" />
          </div>

          <SkeletonGrid count={3} className="grid-cols-1 xl:grid-cols-3" />
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel h-[440px] animate-pulse border border-white/10" />
            <div className="glass-panel h-[440px] animate-pulse border border-white/10" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      activePage="/dashboard"
      onNavigate={(href) => navigate(href)}
      onLogout={logout}
      userName={user?.name}
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="space-y-5">
            <div className="section-kicker">
              <RiSparkling2Fill className="h-3.5 w-3.5" />
              Performance overview
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-400">
                {dateFormatter.format(new Date())}
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.07em] text-white md:text-[3.4rem]">
                Business performance dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-ink-300 md:text-lg">
                Track revenue, cost control, profit momentum, and daily activity in one premium view.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {statusCards.map((card) => (
              <PremiumCard key={card.label} hoverable={false} className="min-h-[158px] border border-white/10 bg-white/[0.04]">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white backdrop-blur-md">
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">{card.label}</p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{card.value}</p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <QuickActionsBar 
            onQuickAdd={() => {
              setIsQuickAddOpen(true);
              premiumFeedback.haptic(10);
            }} 
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
        >
          {summaryCards.map((card) => (
            <SummaryCard
              key={card.title}
              title={card.title}
              value={card.value}
              change={card.change}
              detail={card.detail}
              tone={card.tone}
              highlight={card.highlight}
              icon={card.icon}
            />
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <BusinessHealthEngine
            score={healthScore}
            status={scoreData?.status ?? (healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs attention')}
            breakdown={healthBreakdown}
          />
        </motion.section>


        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]"
        >
          {/* <StoryDashboard bullets={storyBullets} dailySummary={storySummary} />
          <DailyCheckInPanel
            items={dailyStatus}
            confirmationMessage={confirmationMessage}
            refreshing={isRefreshing}
            onRefresh={() => void loadDashboard({ silent: true })}
          /> */}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          <div className="space-y-6">
            <RevenueLineChart data={apiData?.metrics?.monthlyData || []} loading={loading} />
          </div>
          <div className="space-y-6">
            <ProfitBarChart data={(apiData?.metrics?.monthlyData || []).map(item => ({
              ...item,
              profit: item.target
            }))} loading={loading} />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          <ExpensePieChart 
            data={[
              { name: 'Operating', value: 45, color: '#ef4444' },
              { name: 'Marketing', value: 25, color: '#f59e0b' },
              { name: 'Salaries', value: 20, color: '#10b981' },
              { name: 'Other', value: 10, color: '#3b82f6' },
            ]}
            loading={loading}
          />
          <GrowthAreaChart 
            data={apiData?.trends?.map((t: any) => ({ name: t.name, value: t.value })) || []}
            loading={loading}
          />
        </motion.section>


        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-6 xl:grid-cols-[1fr_1fr]"
        >
          <ActionCenter
            recommendations={recommendations}
            onAskWhatShouldIDo={handleWhatShouldIDo}
            onExport={handleExportReport}
          />
          {/* <UploadImpactCard latestUpload={latestUpload} revenue={revenue} expenses={expenses} /> */}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]"
        >
          <div className="space-y-4">
            <FileUpload
              onUploadComplete={(items) => {
                setLatestUpload(normalizeLatestUpload(items[0]));
                void loadDashboard();
              }}
            />
            <QuickAdd 
              onRecordAdded={() => void loadDashboard()} 
              externalOpen={isQuickAddOpen}
              onExternalClose={() => setIsQuickAddOpen(false)}
            />
          </div>

          <PremiumCard hoverable={false} className="min-h-[420px] border border-white/10">
            <div className="flex h-full flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <PremiumBadge tone={loadError ? 'warning' : 'positive'}>
                    Trust center
                  </PremiumBadge>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl">Sync, clarity, and guidance</h3>
                    <p className="mt-2 text-sm leading-7 text-ink-300">
                      Keep the experience calm and focused with status, guidance, and only the most useful signals.
                    </p>
                  </div>
                </div>
                <PremiumButton
                  variant="secondary"
                  onClick={() => navigate('/analytics')}
                  icon={<TrendingUp className="h-4 w-4" />}
                >
                  View Analytics
                </PremiumButton>
              </div>

              {loadError ? (
                <div className="rounded-[1.5rem] border border-amber-400/18 bg-amber-500/10 p-5 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/18 bg-amber-500/10 text-amber-200">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Dashboard needs attention</p>
                      <p className="mt-2 text-sm leading-6 text-ink-200">{loadError}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Last sync time</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.05em] text-white">{timeFormatter.format(lastUpdated)}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-300">Fresh data builds trust and keeps actions grounded.</p>
                </div>
                <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">System status</p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.05em] text-white">{loadError ? 'Warning' : isRefreshing ? 'Refreshing' : 'Online'}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-300">{confirmationMessage}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Smart insights</p>
                <div className="mt-4 grid gap-3">
                  {(smartInsightsEnabled ? insights : []).slice(0, 3).map((insight) => (
                    <div key={insight.message} className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                      <p className="text-sm font-semibold text-white">{insight.message}</p>
                      {insight.detail ? <p className="mt-2 text-sm leading-6 text-ink-300">{insight.detail}</p> : null}
                    </div>
                  ))}

                  {!smartInsightsEnabled || insights.length === 0 ? (
                    <div className="rounded-[1.2rem] border border-dashed border-white/12 bg-white/[0.02] p-4">
                      <p className="text-sm font-semibold text-white">Action guidance is active</p>
                      <p className="mt-2 text-sm leading-6 text-ink-300">
                        BHIE is using business rules to keep recommendations useful even when premium insights are unavailable.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </PremiumCard>
        </motion.section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
