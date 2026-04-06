import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Settings,
  TrendingUp,
  Wallet,
  Sparkles,
  Zap,
  Plus,
  Camera,
  Database
} from 'lucide-react';
import {
  RiCalendarEventLine,
  RiSparkling2Fill,
  RiFlashlightFill,
  RiRobot2Line,
  RiPieChart2Line,
  RiHistoryLine
} from 'react-icons/ri';
import { PremiumBadge, PremiumCard } from '../components/ui/PremiumComponents';
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
import { canUseAIInsights, getPlanLabel as getReadablePlanLabel } from '../utils/plan';
import BusinessHealthEngine from '../components/BusinessHealthEngine';
import ActionCenter from '../components/ActionCenter';
import {
  buildHealthBreakdown,
  buildRecommendations,
  exportReport,
} from '../utils/dashboardIntelligence';
import { premiumFeedback } from '../utils/premiumFeedback';
import { 
  NeuralSyncEngine, 
  Scanlines, 
  MagneticWrapper,
  GlassShine
} from '../components/ui/MicroEngines';

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

// Premium Section Wrapper with Apple smooth scroll easing
const PremiumSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.section
    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
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

  // Smooth Scroll Progress for parallax
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
  const expenses = company?.expenses ?? metrics?.kpis?.expenses ?? 0;
  const profit = company?.profit ?? revenue - expenses;
  const growthRate = company?.growthRate ?? metrics?.kpis?.growthRate ?? 0;
  const profitMargin = company?.profitMargin ?? metrics?.kpis?.profitMargin ?? (revenue > 0 ? (profit / revenue) * 100 : 0);
  const totalRecords = metrics?.kpis?.totalRecords ?? user?.usageCount ?? 0;
  const expenseRatio = revenue > 0 ? (expenses / revenue) * 100 : 0;
  const aiInsightsEnabled = canUseAIInsights(user);
  
  const previousRevenue = revenue > 0 ? (revenue / Math.max(0.2, 1 + growthRate / 100)) : 0;
  const targetRevenue = previousRevenue > 0 ? previousRevenue * 1.18 : 0;
  const overallProgress = targetRevenue > 0 ? Math.round((clamp((revenue / targetRevenue) * 100) + clamp(revenue > 0 ? 125 - expenseRatio : 0) + clamp(profitMargin * 1.45 + Math.max(growthRate, 0) * 0.95)) / 3) : 0;

  const summaryCards = useMemo(() => [
      {
        title: 'Money Made',
        value: <AnimatedNumber value={revenue} format="currency" />,
        change: growthRate > 0 ? `+${growthRate.toFixed(1)}% this month` : 'No growth data',
        detail: `You've made more money this month! Great job.`,
        tone: 'positive' as const,
        icon: <IndianRupee className="w-5 h-5 text-[#27C93F]" />,
      },
      {
        title: 'Money Spent',
        value: <AnimatedNumber value={expenses} format="currency" />,
        change: expenseRatio > 60 ? 'Spending High' : 'Doing Well',
        detail: expenseRatio > 60 ? 'You are spending a lot of money. Try to save more.' : `Your spending is under control.`,
        tone: expenseRatio > 60 ? ('negative' as const) : ('positive' as const),
        icon: <Wallet className="w-5 h-5 text-[#FFBD2E]" />,
      },
      {
        title: 'Leftover Profit',
        value: <AnimatedNumber value={profit} format="currency" />,
        change: `${profitMargin.toFixed(1)}% Profit`,
        detail: profitMargin > 20 ? 'Your business is healthy and growing.' : 'Your profit is a bit low. Watch your costs.',
        tone: 'accent' as const,
        highlight: true,
        icon: <TrendingUp className="w-5 h-5 text-[#007AFF]" />,
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
        <div className="p-8 space-y-12">
            <div className="h-10 w-1/3 bg-[#1C1C1E] animate-pulse rounded-lg" />
            <div className="grid grid-cols-3 gap-6">
                <div className="h-32 bg-[#1C1C1E] animate-pulse rounded-xl" />
                <div className="h-32 bg-[#1C1C1E] animate-pulse rounded-xl" />
                <div className="h-32 bg-[#1C1C1E] animate-pulse rounded-xl" />
            </div>
            <div className="h-[400px] bg-[#1C1C1E] animate-pulse rounded-xl" />
        </div>
    );
  }

  return (
    <>
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-8 py-8 space-y-12 pb-24 text-white">
        
        {/* APP HEADER: Apple Clean Typography */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1C1C1E]">
          <div className="space-y-2">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
               className="inline-flex items-center gap-2 mb-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
              <span className="text-[11px] font-semibold text-[#A1A1A6] uppercase tracking-wider">Analytics</span>
            </motion.div>
            
            <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight text-white leading-tight">
              Hey {user?.name?.split(' ')[0] || 'Partner'}, <br className="hidden md:block" />
              <span className="text-[#A1A1A6]">Here's your summary.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <div className="px-5 py-4 flex flex-col gap-1 min-w-[140px] apple-card">
                <span className="text-[11px] font-medium text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
                    Goal Progress
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-bold tracking-tight tabular-nums">{overallProgress}%</span>
                </div>
             </div>
             
             <div className="px-5 py-4 flex flex-col gap-1 min-w-[140px] apple-card">
                <span className="text-[11px] font-medium text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
                    Current Period
                </span>
                <span className="text-[28px] font-bold tracking-tight text-right">Q{Math.ceil((new Date().getMonth() + 1) / 3)}</span>
             </div>
          </div>
        </header>

        {/* QUICK ACTION HUB */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Capture Receipt', icon: Camera, path: '/scan-bill', desc: 'Scan AI' },
                { label: 'Intelligence', icon: RiRobot2Line, path: '/analysis-report', desc: 'Ask assistant' },
                { label: 'Data Hub', icon: Database, path: '/ds-hub', desc: 'Global storage' },
                { label: 'Ledger', icon: RiHistoryLine, path: '/records', desc: 'Transactions' },
            ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    if (action.path) navigate(action.path);
                    premiumFeedback.click();
                  }}
                  className="flex flex-col items-start p-5 rounded-2xl bg-[#1C1C1E] border border-white/5 hover:border-white/20 transition-all group text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                        <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[16px] font-semibold tracking-tight text-white mb-1">{action.label}</span>
                    <span className="text-[12px] font-medium text-[#A1A1A6]">{action.desc}</span>
                </button>
            ))}
        </div>

        {/* METRICS CAROUSEL */}
        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto no-scrollbar pb-4 md:pb-0">
            {summaryCards.map((card, i) => (
                <div key={card.title} className="min-w-[85vw] md:min-w-0 apple-card p-6 flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-[13px] font-semibold text-[#A1A1A6]">{card.title}</span>
                     {card.icon}
                   </div>
                   <div className="mb-2">
                     {card.value}
                   </div>
                   <div className={`text-[13px] font-medium ${card.tone === 'positive' ? 'text-[#27C93F]' : card.tone === 'negative' ? 'text-[#FF3B30]' : 'text-[#A1A1A6]'}`}>
                     {card.change}
                   </div>
                </div>
            ))}
        </div>

        {/* STRATEGY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <PremiumSection className="space-y-8">
                <div className="apple-card p-8">
                   <BusinessHealthEngine
                       score={healthScore}
                       status={scoreData?.status ?? (healthScore >= 80 ? 'Elite' : healthScore >= 60 ? 'Optimal' : 'Standard')}
                       resonanceIndex={scoreData?.resonanceIndex ?? 50}
                       breakdown={healthBreakdown}
                   />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="apple-card p-6 min-h-[300px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[17px] font-semibold tracking-tight">Revenue Trend</h3>
                            <div className="px-2 py-1 rounded text-[10px] font-medium bg-[#007AFF]/10 text-[#007AFF]">Live</div>
                        </div>
                        <RevenueLineChart data={apiData?.metrics?.monthlyData || []} loading={loading} />
                    </div>

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
                </div>
            </PremiumSection>

            {/* SIDEBAR WIDGETS */}
            <aside className="space-y-6">
                <div className="apple-card p-6 bg-gradient-to-br from-[#1C1C1E] to-black relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#007AFF]">System Status</span>
                            <div className="w-2 h-2 rounded-full bg-[#27C93F] animate-pulse" />
                        </div>
                        <p className="text-[17px] font-medium leading-snug tracking-tight text-white">
                            Monitoring <span className="text-[#007AFF] font-semibold">{totalRecords}</span> financial entries.
                        </p>
                        <p className="text-[13px] text-[#A1A1A6]">
                            {confirmationMessage}
                        </p>
                    </div>
                </div >

                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#636366]">Quick Add</span>
                    </div>
                    <QuickAdd onRecordAdded={() => void loadDashboard()} className="w-full" />
                </div>

                <div className="apple-card p-6">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#636366] mb-4">AI Observations</h4>
                    <div className="space-y-4">
                        {insights.slice(0, 3).map((insight, idx) => (
                            <div key={idx} className="flex gap-4 group cursor-pointer" onClick={() => navigate('/analysis-report')}>
                                <div className="space-y-1">
                                    <p className="text-[14px] font-semibold tracking-tight group-hover:text-[#007AFF] transition-colors">{insight.message}</p>
                                    <p className="text-[13px] text-[#A1A1A6] line-clamp-2 leading-relaxed">{insight.detail || 'Deep intelligence analysis available.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>

        {/* FOOTER ACTION */}
        <PremiumSection delay={0.2} className="pt-8 mb-20">
            <div className="apple-card p-10 md:p-14 overflow-hidden relative border-t border-[#007AFF]/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#007AFF]/10 blur-[100px] rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
                    <div className="space-y-4 flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#007AFF]/10 text-[#007AFF]">
                            <Camera className="w-4 h-4" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Vision Engine</span>
                        </div>
                        <h2 className="text-[32px] md:text-[40px] font-bold tracking-tight leading-tight">Instant extraction.</h2>
                        <p className="text-[17px] text-[#A1A1A6] max-w-lg leading-relaxed">Simply capture a receipt. Our Apple Intelligence model processes amounts, dates, and vendors instantly.</p>
                    </div>
                    
                    <div className="w-full md:w-[400px] shrink-0">
                        <FileUpload
                            onUploadComplete={(items) => {
                                setLatestUpload(normalizeLatestUpload(items[0]));
                                void loadDashboard();
                            }}
                        />
                    </div>
                </div>
            </div>
        </PremiumSection>

      </div>
    </>
  );
};

export default DashboardPremium;
