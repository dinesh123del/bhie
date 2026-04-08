import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  Wallet,
  Camera,
  Database,
  Zap,
  ArrowRight,
  Brain,
  Activity
} from 'lucide-react';
import {
  RiHistoryLine
} from 'react-icons/ri';
import MarketPulse from '../components/MarketPulse';
import StrategicActions from '../components/StrategicActions';
import { PremiumCard, PremiumButton } from '../components/ui/PremiumComponents';
import { AnimatedNumber } from '../components/AnimatedNumber';
import RevenueLineChart from '../components/charts/RevenueLineChart';
import StoryDashboard from '../components/StoryDashboard';
import GrowthForecast from '../components/GrowthForecast';
import AERASentinel from '../components/AERASentinel';
import AERASavings from '../components/AERASavings';
import { recordsAPI } from '../services/api';

import { InsightItem } from '../components/InsightsPanel';
import { useAuth } from '../hooks/useAuth';
import { FileUpload } from '../components/FileUpload';
import QuickAdd from '../components/QuickAdd';
import { UploadedImageRecord } from '../services/uploadService';
import { dashboardAPI } from '../services/api';
import BusinessHealthEngine from '../components/BusinessHealthEngine';
import ActionCenter from '../components/ActionCenter';
import RealTimeIntelligence from '../components/RealTimeIntelligence';
import AutonomousAgents from '../components/AutonomousAgents';
import {
  buildDailyStatus,
  buildHealthBreakdown,
  buildStoryBullets,
  buildRecommendations,
  buildQuantumForesight,
  buildSurgicalDirectives,
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

const DASHBOARD_REFRESH_INTERVAL = 45000;

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [latestUpload, setLatestUpload] = useState<UploadedImageRecord | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [apiData, setApiData] = useState<DashboardResponse | null>(null);
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

      // Fetch full records for Intelligence Features (Autonomous Savings)
      const recordsData = await recordsAPI.getAll();
      setRecords(recordsData);

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

  const revenue = company?.revenue ?? metrics?.kpis?.revenue ?? 0;
  const expenses = company?.expenses ?? metrics?.kpis?.expenses ?? 0;
  const profit = company?.profit ?? revenue - expenses;
  const growthRate = company?.growthRate ?? metrics?.kpis?.growthRate ?? 0;
  const profitMargin = company?.profitMargin ?? metrics?.kpis?.profitMargin ?? (revenue > 0 ? (profit / revenue) * 100 : 0);
  const totalRecords = metrics?.kpis?.totalRecords ?? user?.usageCount ?? 0;
  const expenseRatio = revenue > 0 ? (expenses / revenue) * 100 : 0;
  
  const previousRevenue = revenue > 0 ? (revenue / Math.max(0.2, 1 + growthRate / 100)) : 0;
  const targetRevenue = previousRevenue > 0 ? previousRevenue * 1.18 : 0;
  const overallProgress = targetRevenue > 0 ? Math.round((clamp((revenue / targetRevenue) * 100) + clamp(revenue > 0 ? 125 - expenseRatio : 0) + clamp(profitMargin * 1.45 + Math.max(growthRate, 0) * 0.95)) / 3) : 0;

  const summaryCards = useMemo(() => [
      {
        title: 'Money Made',
        value: <AnimatedNumber value={revenue} format="currency" />,
        change: growthRate > 0 ? `+${growthRate.toFixed(1)}% this month` : 'No growth data',
        tone: 'positive' as const,
        icon: <IndianRupee className="w-5 h-5 text-[#27C93F]" />,
      },
      {
        title: 'Money Spent',
        value: <AnimatedNumber value={expenses} format="currency" />,
        change: expenseRatio > 60 ? 'Spending High' : 'Doing Well',
        tone: expenseRatio > 60 ? ('negative' as const) : ('positive' as const),
        icon: <Wallet className="w-5 h-5 text-[#FFBD2E]" />,
      },
      {
        title: 'Leftover Profit',
        value: <AnimatedNumber value={profit} format="currency" />,
        change: `${profitMargin.toFixed(1)}% Profit`,
        tone: 'accent' as const,
        highlight: true,
        icon: <TrendingUp className="w-5 h-5 text-[#007AFF]" />,
      },
    ], [expenseRatio, expenses, growthRate, profit, profitMargin, revenue]);

  const healthScore = scoreData?.score ?? overallProgress;
  const healthBreakdown = useMemo(() => buildHealthBreakdown({
    revenue, expenses, profit, growthRate, expenseRatio, profitMargin, healthScore,
  }), [expenseRatio, expenses, growthRate, healthScore, profit, profitMargin, revenue]);

  const recommendations = useMemo(() => buildRecommendations({
    revenue, expenses, profit, growthRate, profitMargin, expenseRatio, totalRecords, activeRecords: Math.max(0, Math.round(totalRecords * 0.72)), latestUpload,
  }), [expenseRatio, expenses, growthRate, latestUpload, profit, profitMargin, revenue, totalRecords]);

  const foresightData = useMemo(() => buildQuantumForesight({
    revenue, expenses, profit, growthRate
  }), [revenue, expenses, profit, growthRate]);

  const directives = useMemo(() => buildSurgicalDirectives({
    revenue, expenses, profit, growthRate, profitMargin
  }), [revenue, expenses, profit, growthRate, profitMargin]);

  const confirmationMessage = loadError ? loadError : latestUpload ? `Success: ${latestUpload.record.title} processed.` : 'System operational.';

  if (loading) {
    return (
        <div className="p-8 space-y-12 bg-black min-h-screen">
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
    <div className="relative mx-auto max-w-[1400px] px-6 md:px-12 py-12 space-y-16 pb-32 text-white">
        
        {/* APP HEADER: Extreme Apple Look */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.6 }}
               className="inline-flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
              <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white/30">Live Dashboard</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-[56px] md:text-[82px] font-black tracking-[-0.05em] text-white leading-[0.85]"
            >
              Hey {user?.name?.split(' ')[0] || 'there'}, <br className="hidden md:block" />
              <span className="text-white/20">here's your overview.</span>
            </motion.h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="apple-card p-6 min-w-[180px] bg-white/[0.03] backdrop-blur-3xl border-white/5">
                <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">
                    Monthly Goal
                </span>
                <span className="text-[42px] font-black tracking-tight text-ai-extreme">{overallProgress}%</span>
             </div>
          </div>
        </header>

        {/* METRICS BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {summaryCards.map((card, i) => (
                <motion.div 
                  key={card.title} 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                  className="apple-card p-10 flex flex-col group relative overflow-hidden bg-[#0A0A0B] border-white/5"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                   <div className="flex items-center justify-between mb-8">
                     <span className="text-[13px] font-black uppercase tracking-[0.25em] text-white/20">{card.title}</span>
                     <div className="p-4 rounded-3xl bg-white/5 border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                       {card.icon}
                     </div>
                   </div>
                   <div className="mb-4">
                     {card.value}
                   </div>
                   <div className={`text-[15px] font-black tracking-tight ${card.tone === 'positive' ? 'text-emerald-400' : card.tone === 'negative' ? 'text-rose-400' : 'text-white/40'}`}>
                     {card.change}
                   </div>
                </motion.div>
            ))}
        </div>

        {/* MAIN INTELLIGENCE SECTION */}
        <div className="space-y-12">
            <AERASavings records={records} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
            <div className="space-y-12">
                <div className="grid gap-8 xl:grid-cols-2">
                   <StoryDashboard 
                        bullets={buildStoryBullets({
                            revenue, expenses, profit, growthRate, profitMargin, healthScore,
                            totalRecords, activeRecords: Math.max(0, Math.round(totalRecords * 0.72)),
                            lastUpdated
                        })} 
                        dailySummary={confirmationMessage} 
                   />
                   <div className="apple-card p-12 bg-[#0A0A0B] border-white/5 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-6 h-6 text-amber-400" />
                            <h3 className="text-xl font-black text-white italic">Run Workflows</h3>
                        </div>
                        <p className="text-white/40 text-sm font-medium mb-8 leading-relaxed">
                            Automate your business tasks. Optimize expenses and check tax readiness in one click.
                        </p>
                        <PremiumButton 
                            onClick={() => navigate('/workflows')}
                            variant="primary"
                            className="bg-white text-black border-none"
                            icon={<ArrowRight className="w-4 h-4" />}
                        >
                            Open Workflows
                        </PremiumButton>
                   </div>
                </div>
                
                <div className="space-y-8">
                   <AERASentinel 
                        industry={company?.industry || 'Technology'} 
                        region="India" 
                        cashReserve={revenue - expenses}
                        burnRate={expenses / (metrics?.kpis?.activeRecords || 1) * 10} 
                        revenue={revenue}
                        expenses={expenses}
                   />
                   
                   <div className="apple-card p-12 bg-[#0A0A0B] border-white/5">
                      <BusinessHealthEngine
                          score={healthScore}
                          status={scoreData?.status ?? (healthScore >= 80 ? 'Elite' : healthScore >= 60 ? 'Optimal' : 'Standard')}
                          healthIndex={scoreData?.resonanceIndex ?? 50}
                          breakdown={healthBreakdown}
                      />
                   </div>
                </div>

                <div className="apple-card p-12 bg-[#0A0A0B] border-white/5">
                   <GrowthForecast data={foresightData} />
                </div>
                
                <div className="apple-card p-12 bg-[#0A0A0B] border-white/5">
                   <StrategicActions directives={directives as any} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="apple-card p-8 min-h-[350px] bg-[#0A0A0B] border-white/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[18px] font-black tracking-tight uppercase text-white/50">Revenue Trend</h3>
                            <div className="px-3 py-1 rounded-full text-[10px] font-black bg-[#007AFF]/10 text-[#007AFF] tracking-widest">LIVE</div>
                        </div>
                        <RevenueLineChart data={apiData?.metrics?.monthlyData || []} loading={loading} />
                    </div>

                    <ActionCenter
                        recommendations={recommendations}
                        onAskWhatShouldIDo={() => navigate('/analysis-report')}
                        onExport={exportReport}
                    />
                </div>

                {/* NEXT-LEVEL INTELLIGENCE SECTION */}
                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-center space-y-4"
                    >
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 text-blue-400">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">BUSINESS INSIGHTS</span>
                        </div>
                        <h2 className="text-[42px] md:text-[52px] font-black tracking-[-0.06em] leading-[0.88]">
                            Smart <br />Business Analytics.
                        </h2>
                        <p className="text-[19px] text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
                            Advanced monitoring, expert analysis, and actionable insights to grow your business faster.
                        </p>
                    </motion.div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                        >
                            <RealTimeIntelligence className="apple-card p-8 bg-[#0A0A0B] border-white/5" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <AutonomousAgents className="apple-card p-8 bg-[#0A0A0B] border-white/5" />
                        </motion.div>
                    </div>
                </div>
            </div>

            <aside className="space-y-8">
                <div className="apple-card p-8 bg-gradient-to-br from-[#111113] to-black border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 blur-[80px] -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#007AFF]">System Status</span>
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                        </div>
                        <p className="text-[20px] font-black leading-tight tracking-[-0.03em] text-white">
                            Tracking <span className="text-ai-extreme">{totalRecords}</span> financial records.
                        </p>
                    </div>
                </div >

                <div className="apple-card p-8 bg-[#0A0A0B] border-white/5 overflow-hidden">
                   <MarketPulse />
                </div>

                <div className="apple-card p-8 bg-[#0A0A0B] border-white/5">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">Recent Insights</h4>
                    <div className="space-y-8">
                        {insights.slice(0, 3).map((insight, idx) => (
                            <div key={idx} className="group cursor-pointer" onClick={() => navigate('/analysis-report')}>
                                <p className="text-[16px] font-black tracking-tight group-hover:text-[#007AFF] transition-colors mb-2">{insight.message}</p>
                                <p className="text-[14px] text-white/40 leading-relaxed font-medium">{insight.detail || 'Deep intelligence analysis available.'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>

        {/* EXTREME FOOTER: Vision Engine */}
        <PremiumSection delay={0.4} className="pb-20">
            <div className="apple-card p-16 md:p-24 overflow-hidden relative border-white/5 bg-[#0A0A0B]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.03] blur-[150px] rounded-full" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
                    <div className="space-y-8 flex-1">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                            <Camera className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Smart Scanner</span>
                        </div>
                        <h2 className="text-[52px] md:text-[72px] font-black tracking-[-0.06em] leading-[0.88]">Scan & <br />Save.</h2>
                        <p className="text-[19px] text-white/40 max-w-lg leading-relaxed font-medium">Take a photo of any bill or receipt. We'll read it and save the details for you automatically.</p>
                    </div>
                    
                    <div className="w-full lg:w-[450px]">
                        <FileUpload
                            onUploadComplete={(items) => {
                                setLatestUpload(normalizeLatestUpload(items[0]));
                                void loadDashboard();
                                premiumFeedback.success();
                            }}
                        />
                    </div>
                </div>
            </div>
        </PremiumSection>

      </div>
    </div>
  );
};

export default Dashboard;
