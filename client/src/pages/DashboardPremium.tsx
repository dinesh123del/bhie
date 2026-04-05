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
        icon: <IndianRupee className="h-6 w-6" />,
      },
      {
        title: 'Money Spent',
        value: <AnimatedNumber value={expenses} format="currency" />,
        change: expenseRatio > 60 ? 'Spending High' : 'Doing Well',
        detail: expenseRatio > 60 ? 'You are spending a lot of money. Try to save more.' : `Your spending is under control.`,
        tone: expenseRatio > 60 ? ('negative' as const) : ('positive' as const),
        icon: <Wallet className="h-6 w-6" />,
      },
      {
        title: 'Leftover Profit',
        value: <AnimatedNumber value={profit} format="currency" />,
        change: `${profitMargin.toFixed(1)}% Profit`,
        detail: profitMargin > 20 ? 'Your business is healthy and growing.' : 'Your profit is a bit low. Watch your costs.',
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
        <div className="p-8 space-y-12">
            <div className="h-20 w-2/3 bg-white/5 animate-pulse rounded-3xl" />
            <div className="grid grid-cols-3 gap-8">
                <div className="h-48 bg-white/5 animate-pulse rounded-[2.5rem]" />
                <div className="h-48 bg-white/5 animate-pulse rounded-[2.5rem]" />
                <div className="h-48 bg-white/5 animate-pulse rounded-[2.5rem]" />
            </div>
            <div className="h-[400px] bg-white/5 animate-pulse rounded-[3rem]" />
        </div>
    );
  }

  return (
    <>
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600 origin-left z-[100]" style={{ scaleX }} />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 py-10 md:py-20 space-y-16 md:space-y-24">
        
        {/* APP HEADER: Compact & Personalized */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl border border-brand-500/10 bg-brand-500/5 backdrop-blur-3xl"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400">Tactical Intelligence Sync</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.85]">
              Hey {user?.name?.split(' ')[0] || 'Partner'}, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-500 filter drop-shadow-sm">Your financial story.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 md:pb-4 overflow-x-auto no-scrollbar">
             <div className="p-5 flex flex-col gap-2 min-w-[160px] bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-xl">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <RiFlashlightFill className="text-amber-500" /> Goal Depth
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">{overallProgress}%</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black">+2.4%</span>
                </div>
             </div>
             
             <div className="p-5 flex flex-col gap-2 min-w-[160px] bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-xl">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <RiCalendarEventLine className="text-brand-500" /> Operational Day
                </span>
                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums text-right">Q1-28</span>
             </div>
          </div>
        </header>

        {/* QUICK ACTION HUB */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Capture Bill', icon: Camera, color: 'from-brand-500 to-indigo-600', path: '/scan-bill', desc: 'Scan any receipt' },
                { label: 'Neural Intelligence', icon: RiRobot2Line, color: 'from-purple-500 to-pink-600', path: '/analysis-report', desc: 'Ask your assistant' },
                { label: 'Data Hub', icon: Database, color: 'from-emerald-500 to-teal-600', path: '/ds-hub', desc: 'Global records' },
                { label: 'Ledger History', icon: RiHistoryLine, color: 'from-orange-500 to-rose-600', path: '/records', desc: 'View transactions' },
            ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    if (action.path) navigate(action.path);
                    premiumFeedback.click();
                  }}
                  className="flex flex-col items-start p-6 rounded-[2.5rem] bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-2xl transition-all group relative overflow-hidden text-left"
                >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-base font-black text-gray-900 dark:text-white tracking-tight mb-1">{action.label}</span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{action.desc}</span>
                    <Plus className="absolute top-6 right-6 w-5 h-5 text-gray-200 dark:text-white/5 group-hover:text-brand-500 group-hover:rotate-90 transition-all" />
                </button>
            ))}
        </div>

        {/* METRICS CAROUSEL */}
        <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto no-scrollbar pb-8 px-1 -mx-4 md:mx-0 md:px-0 scroll-padding">
            {summaryCards.map((card, i) => (
                <div key={card.title} className="min-w-[85vw] md:min-w-0">
                    <SummaryCard
                        title={card.title}
                        value={card.value}
                        change={card.change}
                        detail={card.detail}
                        tone={card.tone}
                        highlight={card.highlight}
                        icon={card.icon}
                    />
                </div>
            ))}
        </div>

        {/* WINNING STRATEGY */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">
            <PremiumSection className="space-y-12">
                <BusinessHealthEngine
                    score={healthScore}
                    status={scoreData?.status ?? (healthScore >= 80 ? 'Elite' : healthScore >= 60 ? 'Optimal' : 'Standard')}
                    resonanceIndex={scoreData?.resonanceIndex ?? 50}
                    breakdown={healthBreakdown}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative overflow-hidden rounded-[3rem] p-px bg-white/10 dark:bg-white/5 shadow-2xl">
                        <div className="relative bg-white dark:bg-[#0A0A0B] rounded-[2.95rem] p-10 h-full backdrop-blur-3xl">
                            <Scanlines />
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                                    <RiPieChart2Line className="text-brand-500" /> Capital Flux
                                </h3>
                                <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Real-time</div>
                            </div>
                            <RevenueLineChart data={apiData?.metrics?.monthlyData || []} loading={loading} />
                        </div>
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
            <aside className="space-y-8">
                <div className="relative overflow-hidden rounded-[3rem] p-8 dark:bg-brand-500/5 border border-brand-500/10 shadow-xl">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-500">Neural Sync</span>
                            <NeuralSyncEngine />
                        </div>
                        <p className="text-lg font-bold leading-tight text-gray-900 dark:text-white tracking-tight">
                            Engine is auditing <span className="text-brand-500 tabular-nums">{totalRecords}</span> entries.
                        </p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-widest">
                            {confirmationMessage}
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 blur-[80px] rounded-full" />
                </div >

                <div className="space-y-4">
                    <div className="flex items-center gap-2.5 px-2">
                        <Plus className="w-3.5 h-3.5 text-brand-500" /> 
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Quick Authority Input</span>
                    </div>
                    <QuickAdd onRecordAdded={() => void loadDashboard()} className="w-full" />
                </div>

                <div className="relative overflow-hidden rounded-[3rem] bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 p-8 shadow-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-8">Strategic Insights</h4>
                    <div className="space-y-6">
                        {insights.slice(0, 3).map((insight, idx) => (
                            <div key={idx} className="flex gap-5 group cursor-pointer" onClick={() => navigate('/analysis-report')}>
                                <div className="w-1.5 h-12 rounded-full bg-gray-100 dark:bg-white/5 group-hover:bg-brand-500 transition-all duration-500" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors uppercase tracking-widest leading-none">{insight.message}</p>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{insight.detail || 'Deep intelligence analysis available for this vector.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>

        {/* FOOTER ACTION */}
        <PremiumSection delay={0.2} className="pt-12 pb-12">
            <div className="p-px rounded-[4rem] bg-gradient-to-r from-transparent via-brand-500/30 to-transparent shadow-2xl">
                <div className="bg-white dark:bg-[#080809] rounded-[3.95rem] p-16 md:p-24 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(79,70,229,0.15),transparent)]" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-20">
                        <div className="space-y-8 text-center lg:text-left flex-1">
                            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl border border-brand-500/20 bg-brand-500/5">
                                <Camera className="w-4 h-4 text-brand-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-500">Optical Intelligence</span>
                            </div>
                            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.85]">Turn paper<br className="hidden md:block" /> into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500 uppercase italic">Power.</span></h2>
                            <p className="text-2xl font-semibold text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed tracking-tight">Capture any document. Our vision engine processes the data with surgical accuracy and syncs it to your ledger instantly.</p>
                        </div>
                        
                        <div className="w-full lg:w-[650px] shrink-0">
                            <FileUpload
                                onUploadComplete={(items) => {
                                    setLatestUpload(normalizeLatestUpload(items[0]));
                                    void loadDashboard();
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PremiumSection>

      </div>
    </>
  );
};

export default DashboardPremium;
