import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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
  Sparkles,
  Zap,
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
  exportReport,
} from '../utils/dashboardIntelligence';
import { premiumFeedback } from '../utils/premiumFeedback';

interface MetricsSummary {
  kpis?: {
    totalRecords?: number;
    activeRecords?: number;
    inactiveRatio?: number;
    growthRate?: number;
    revenue?: number;
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
  resonanceIndex: number;
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
  { icon: <TrendingUp className="h-5 w-5" />, label: 'Analytics', href: '/analytics' },
  { icon: <Sparkles className="h-5 w-5" />, label: 'AI Deep Dive', href: '/analysis-report' },
  { icon: <Wallet className="h-5 w-5" />, label: 'Pro Plan', href: '/pricing' },
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

// Premium Section Wrapper with Scroll Animations
const PremiumSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.section
    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.section>
);

const DashboardPremium = () => {
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
  const hasLoadedRef = useRef(false);
  const mountedRef = useRef(true);
  const requestInFlightRef = useRef(false);

  // Scroll Progress for parallax
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
      if (!mountedRef.current) return;
      if (isInitialLoad) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadDashboard();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      void loadDashboard({ silent: true });
    }, DASHBOARD_REFRESH_INTERVAL);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [loadDashboard]);

  // Logic calculation (same as original to maintain data integrity)
  const revenue = company?.revenue ?? metrics?.kpis?.revenue ?? 0;
  const expenses = company?.expenses ?? (revenue > 0 ? revenue * 0.58 : 92000);
  const profit = company?.profit ?? revenue - expenses;
  const growthRate = company?.growthRate ?? metrics?.kpis?.growthRate ?? 12.5;
  const profitMargin = company?.profitMargin ?? metrics?.kpis?.profitMargin ?? (revenue > 0 ? (profit / revenue) * 100 : 0);
  const totalRecords = metrics?.kpis?.totalRecords ?? user?.usageCount ?? 0;
  const expenseRatio = revenue > 0 ? (expenses / revenue) * 100 : 58;
  const aiInsightsEnabled = canUseAIInsights(user);
  
  const previousRevenue = revenue > 0 ? revenue / Math.max(0.2, 1 + growthRate / 100) : 140000;
  const targetRevenue = previousRevenue * 1.18;
  const overallProgress = Math.round((clamp(revenue > 0 ? (revenue / targetRevenue) * 100 : 86) + clamp(125 - expenseRatio) + clamp(profitMargin * 1.45 + Math.max(growthRate, 0) * 0.95)) / 3);

  const summaryCards = useMemo(() => [
      {
        title: 'Total Revenue',
        value: formatCurrency(revenue),
        change: `+${growthRate.toFixed(1)}% YoY`,
        detail: `Approaching ${formatCurrency(targetRevenue)} target.`,
        tone: 'positive' as const,
        icon: <IndianRupee className="h-6 w-6" />,
      },
      {
        title: 'Net Expenses',
        value: formatCurrency(expenses),
        change: expenseRatio > 60 ? 'High Burn' : 'Optimized',
        detail: `${expenseRatio.toFixed(1)}% Efficiency ratio.`,
        tone: expenseRatio > 60 ? ('negative' as const) : ('positive' as const),
        icon: <Wallet className="h-6 w-6" />,
      },
      {
        title: 'Gross Profit',
        value: formatCurrency(profit),
        change: `${profitMargin.toFixed(1)}% Margin`,
        detail: 'Stable baseline maintainance.',
        tone: 'accent' as const,
        highlight: true,
        icon: <TrendingUp className="h-6 w-6" />,
      },
    ], [expenseRatio, expenses, growthRate, profit, profitMargin, revenue, targetRevenue]);

  const healthScore = scoreData?.score ?? overallProgress;
  const healthBreakdown = useMemo(() => buildHealthBreakdown({
    revenue, expenses, profit, growthRate, expenseRatio, profitMargin, healthScore,
  }), [expenseRatio, expenses, growthRate, healthScore, profit, profitMargin, revenue]);

  const recommendations = useMemo(() => buildRecommendations({
    revenue, expenses, profit, growthRate, profitMargin, expenseRatio, totalRecords, activeRecords: Math.max(0, Math.round(totalRecords * 0.72)), latestUpload,
  }), [expenseRatio, expenses, growthRate, latestUpload, profit, profitMargin, revenue, totalRecords]);

  const confirmationMessage = loadError ? loadError : latestUpload ? `Success: ${latestUpload.record.title} processed.` : 'System operational.';

  if (loading) {
    return (
      <MainLayout sidebarItems={sidebarItems} activePage="/dashboard" onNavigate={(href) => navigate(href)} onLogout={logout} userName={user?.name}>
        <div className="p-8 space-y-12">
            <div className="h-20 w-2/3 bg-white/5 animate-pulse rounded-3xl" />
            <div className="grid grid-cols-3 gap-8">
                <div className="h-48 bg-white/5 animate-pulse rounded-[2.5rem]" />
                <div className="h-48 bg-white/5 animate-pulse rounded-[2.5rem]" />
                <div className="h-48 bg-white/5 animate-pulse rounded-[2.5rem]" />
            </div>
            <div className="h-[400px] bg-white/5 animate-pulse rounded-[3rem]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebarItems={sidebarItems} activePage="/dashboard" onNavigate={(href) => navigate(href)} onLogout={logout} userName={user?.name}>
      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 origin-left z-[100]" style={{ scaleX }} />

      <div className="relative mx-auto max-w-7xl space-y-20 px-6 py-12">
        
        {/* Header Section */}
        <PremiumSection className="grid gap-12 xl:grid-cols-[1fr_auto]">
          <div className="space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Business Overview</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
              Your Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-purple-300">Financials.</span>
            </h1>
            
            <p className="max-w-2xl text-xl text-white/40 font-medium leading-relaxed">
              Simple insights to help you grow your business and track your performance daily.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <PremiumCard hoverable={false} className="p-6 bg-white/[0.02] border-white/5 min-w-[240px]">
              <div className="flex justify-between items-center mb-6">
                 <Zap className="w-5 h-5 text-amber-400" />
                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Plan</span>
              </div>
              <p className="text-2xl font-black text-white">{getReadablePlanLabel(user?.plan)}</p>
              <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-amber-400" 
                  initial={{ width: 0 }}
                  animate={{ width: user?.plan === 'premium' ? '100%' : '33%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </PremiumCard>
          </div>
        </PremiumSection>

        {/* Health Engine Section */}
        <PremiumSection delay={0.1}>
          <BusinessHealthEngine
            score={healthScore}
            status={scoreData?.status ?? (healthScore >= 80 ? 'Elite' : healthScore >= 60 ? 'Optimal' : 'Needs Insight')}
            resonanceIndex={scoreData?.resonanceIndex ?? 50}
            breakdown={healthBreakdown}
          />
        </PremiumSection>

        {/* KPI Cards Section */}
        <PremiumSection delay={0.2} className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
                <SummaryCard
                  title={card.title}
                  value={card.value}
                  change={card.change}
                  detail={card.detail}
                  tone={card.tone}
                  highlight={card.highlight}
                  icon={card.icon}
                />
            </motion.div>
          ))}
        </PremiumSection>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <PremiumSection delay={0.3}>
                <PremiumCard className="p-8 h-full bg-white/[0.01]">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-bold text-white tracking-tight">Revenue Trends</h3>
                        <PremiumBadge tone="brand">Updated live</PremiumBadge>
                    </div>
                    <RevenueLineChart data={apiData?.metrics?.monthlyData || []} loading={loading} />
                </PremiumCard>
            </PremiumSection>

            <PremiumSection delay={0.4}>
                <PremiumCard className="p-8 h-full bg-white/[0.01]">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-bold text-white tracking-tight">Profit Distribution</h3>
                        <PremiumBadge tone="positive">High Margin</PremiumBadge>
                    </div>
                    <ProfitBarChart data={(apiData?.metrics?.monthlyData || []).map(item => ({
                        ...item,
                        profit: item.target
                    }))} loading={loading} />
                </PremiumCard>
            </PremiumSection>
        </div>

        {/* Secondary Charts / Insights */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <PremiumSection delay={0.5}>
                <PremiumCard className="p-8 bg-white/[0.01]">
                    <h3 className="text-xl font-bold text-white tracking-tight mb-8">Expense Breakdown</h3>
                    <ExpensePieChart 
                        data={[
                            { name: 'Operations', value: 45, color: '#0EA5E9' },
                            { name: 'Research', value: 25, color: '#8B5CF6' },
                            { name: 'Talent', value: 20, color: '#10B981' },
                            { name: 'Infrastructure', value: 10, color: '#F59E0B' },
                        ]}
                        loading={loading}
                    />
                </PremiumCard>
            </PremiumSection>

            <PremiumSection delay={0.6}>
                <PremiumCard className="p-8 bg-white/[0.01]">
                    <h3 className="text-xl font-bold text-white tracking-tight mb-8">Growth Overview</h3>
                    <GrowthAreaChart 
                        data={apiData?.trends?.map((t: any) => ({ name: t.name, value: t.value })) || []}
                        loading={loading}
                    />
                </PremiumCard>
            </PremiumSection>
        </div>

        {/* Action Center & Uploads */}
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[1.2fr_0.8fr]">
            <PremiumSection delay={0.7}>
                <ActionCenter
                    recommendations={recommendations}
                    onAskWhatShouldIDo={() => {
                        navigate('/analysis-report');
                        premiumFeedback.click();
                    }}
                    onExport={() => {
                        exportReport();
                        premiumFeedback.success();
                    }}
                />
            </PremiumSection>

            <PremiumSection delay={0.8} className="space-y-8">
                <QuickAdd onRecordAdded={() => void loadDashboard()} />
                <FileUpload
                    onUploadComplete={(items) => {
                        setLatestUpload(normalizeLatestUpload(items[0]));
                        void loadDashboard();
                    }}
                />
                
                <PremiumCard className="p-6 bg-gradient-to-br from-white/[0.04] to-transparent border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-400/20">
                            <RiSparkling2Fill className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-widest">System Status</p>
                            <p className="text-xs text-white/40">{confirmationMessage}</p>
                        </div>
                    </div>
                </PremiumCard>
            </PremiumSection>
        </div>

      </div>
    </MainLayout>
  );
};

export default DashboardPremium;
