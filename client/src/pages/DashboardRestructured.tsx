import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  IndianRupee,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  BarChart3,
  Scan,
  ArrowRight,
  TrendingDown,
  Layers,
  Zap,
  Share2,
  Flame,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PremiumCard, PremiumButton, PremiumBadge } from '../components/ui/PremiumComponents';
import { EliteEmptyState } from '../components/ui/EliteUI';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { formatCurrency } from '../utils/dashboardIntelligence';
import { analyticsService } from '../services/analyticsService';
import { PageTransition, StaggerList, FloatingCursorParallax } from '../components/ui/MicroInteractions';

interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  businessHealth: number;
  growthRate: number;
  expenseRatio: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
}

const DashboardRestructured = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      if (response.data) {
        const totalIncome = response.data.metrics?.kpis?.revenue || 0;
        const totalExpenses = response.data.metrics?.kpis?.expenses || 0;
        setMetrics({
          totalIncome,
          totalExpenses,
          profit: totalIncome - totalExpenses,
          businessHealth: response.data.scoreData?.score || 75,
          growthRate: response.data.metrics?.kpis?.growthRate || 0,
          expenseRatio: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
          monthlyData: response.data.metrics?.monthlyData || [],
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <PageTransition>
      <div className="bg-mesh min-h-full pb-20">
        <div className="max-w-[1400px] mx-auto space-y-10 px-6 lg:px-10">
          
          {/* PREMIUM HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-10">
            <div className="space-y-1">
              <PremiumBadge variant="info" icon={<Layers className="w-3 h-3" />}>DASHBOARD OVERVIEW</PremiumBadge>
              <h1 className="text-4xl font-black tracking-tight text-black dark:text-white">
                Welcome back, <span className="text-brand-500">{user?.name}.</span>
              </h1>
              <p className="text-black/40 dark:text-white/40 font-medium text-sm">
                Your ecosystem is <span className="text-emerald-500 font-bold">Stable</span>. You've scanned {user?.usageCount || 0} records this month.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PremiumButton 
                variant="ghost" 
                onClick={() => {
                  navigator.share?.({
                    title: 'BHIE Weekly Summary',
                    text: `I've tracked ${user?.usageCount || 0} expenses this month with BHIE! My business health score is ${metrics?.businessHealth || 0}.`,
                    url: window.location.origin,
                  }).then(() => {
                    analyticsService.addMetric('share_summary', 1);
                  }).catch(() => {
                    toast.success('Summary link copied to clipboard!');
                    navigator.clipboard.writeText(`${window.location.origin} - Track expenses instantly!`);
                    analyticsService.addMetric('copy_summary_link', 1);
                  });
                }}
                icon={<Share2 className="w-4 h-4" />}
              >
                Share
              </PremiumButton>
              <PremiumButton 
                variant="secondary" 
                onClick={loadDashboard} 
                loading={loading}
                icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              >
                Sync Data
              </PremiumButton>
            </div>
          </div>

          {/* KPI GRID - Ultra Premium Cards */}
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FloatingCursorParallax intensity={40}>
              <PremiumCard gradient className="group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <PremiumBadge variant="success" icon={<ArrowUpRight className="w-3 h-3" />}>+12.4%</PremiumBadge>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">Total Revenue</p>
                  <h3 className="text-3xl font-black text-black dark:text-white tracking-tighter">
                    {loading ? '---' : formatCurrency(metrics?.totalIncome || 0)}
                  </h3>
                </div>
              </PremiumCard>
            </FloatingCursorParallax>

            <FloatingCursorParallax intensity={40}>
              <PremiumCard className="group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <PremiumBadge variant="error" icon={<AlertCircle className="w-3 h-3" />}>High</PremiumBadge>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">Total Expenses</p>
                  <h3 className="text-3xl font-black text-black dark:text-white tracking-tighter">
                    {loading ? '---' : formatCurrency(metrics?.totalExpenses || 0)}
                  </h3>
                </div>
              </PremiumCard>
            </FloatingCursorParallax>

            <FloatingCursorParallax intensity={40}>
              <PremiumCard className="group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span className="text-[10px] font-black text-orange-500">3 DAY STREAK</span>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">Engagement Level</p>
                  <h3 className="text-3xl font-black text-black dark:text-white tracking-tighter">
                    Elite Tier
                  </h3>
                </div>
              </PremiumCard>
            </FloatingCursorParallax>
          </StaggerList>

          {/* SMART NOTIFICATION / DAILY ACTION */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-4 flex items-center gap-4 group hover:border-brand-500/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-brand-500 uppercase tracking-widest leading-none mb-1">Smart Suggestion</p>
              <p className="text-sm text-black/60 dark:text-white/60 font-medium">
                You tracked 15% more expenses this week than last. <span className="text-brand-500 font-bold">Great momentum!</span> Scan your dinner receipt now.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* MAIN GRID - Charts & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <PremiumCard padded={false} className="overflow-hidden">
                <div className="p-8 border-b border-black/[0.03] dark:border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white tracking-tight">Growth Analytics</h3>
                    <p className="text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-wider mt-1">Monthly performance trend</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-brand-500" />
                </div>
                <div className="min-h-[300px] flex items-center justify-center bg-black/[0.01] dark:bg-white/[0.01] p-8">
                   {loading ? (
                     <div className="w-full space-y-4">
                       <div className="flex items-end gap-2 h-32 justify-center">
                         {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                           <motion.div 
                             key={i}
                             animate={{ opacity: [0.3, 0.6, 0.3] }}
                             transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                             className="w-8 rounded-t-lg bg-brand-500/10 h-24"
                           />
                         ))}
                       </div>
                       <div className="flex flex-col items-center gap-2">
                         <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden relative">
                            <motion.div className="absolute inset-0 bg-brand-500/20" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity }} />
                         </div>
                       </div>
                     </div>
                   ) : (metrics?.monthlyData?.length || 0) > 0 ? (
                    <div className="text-center space-y-3 w-full">
                       <div className="flex items-end gap-2 h-32 justify-center">
                         {(metrics?.monthlyData || []).map((item, i) => (
                           <motion.div 
                             key={i}
                             initial={{ height: 0 }}
                             animate={{ height: `${(item.revenue / (metrics?.totalIncome || 1)) * 100}%` }}
                             transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                             className="w-8 rounded-t-lg bg-gradient-to-t from-brand-500/20 to-brand-500"
                           />
                         ))}
                       </div>
                       <p className="text-xs font-black text-black/20 dark:text-white/20 uppercase tracking-[0.2em]">Data Synced with Ecosystem</p>
                    </div>
                   ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12">
                      <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-6">
                        <Scan className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-black text-black dark:text-white mb-2">Ecosystem Silent</h4>
                      <p className="text-sm text-black/40 dark:text-white/40 max-w-sm mb-8">
                        Your intelligence core requires data to generate growth patterns. Start by scanning your first receipt.
                      </p>
                      <PremiumButton onClick={() => navigate('/scan-bill')} variant="secondary">
                        Initialize Scan
                      </PremiumButton>
                    </div>
                   )}
                </div>
              </PremiumCard>

              <div className="flex flex-wrap gap-4 pt-4">
                <PremiumButton 
                  onClick={() => {
                    analyticsService.addMetric('scan_receipt_start', 1);
                    navigate('/scan-bill');
                  }} 
                  variant="primary" 
                  icon={<Scan className="w-4 h-4" />}
                >
                  Scan Receipt
                </PremiumButton>
                <PremiumButton onClick={() => navigate('/analytics')} variant="secondary">
                  Detailed Intelligence
                </PremiumButton>
                <PremiumButton onClick={() => navigate('/records')} variant="ghost">
                  History
                </PremiumButton>
              </div>
            </div>

            <div className="space-y-8">
               <PremiumCard>
                  <h3 className="text-lg font-black text-black dark:text-white tracking-tight mb-6">Business Health</h3>
                  <div className="flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/[0.03] dark:text-white/5" />
                        <motion.circle 
                          cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" 
                          strokeDasharray="440"
                          initial={{ strokeDashoffset: 440 }}
                          animate={{ strokeDashoffset: 440 - (440 * (metrics?.businessHealth || 0)) / 100 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          className="text-brand-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-black dark:text-white tracking-tighter">{metrics?.businessHealth || 0}</span>
                        <span className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest">Score</span>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-sm font-black text-black/60 dark:text-white/60">Your ecosystem is stable.</p>
                       <p className="text-xs text-black/30 dark:text-white/30 leading-relaxed font-medium">Keep maintaining this score by scanning regular invoices.</p>
                    </div>
                  </div>
               </PremiumCard>

               <PremiumCard className="bg-gradient-to-br from-brand-500 to-indigo-600 border-none text-white overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="relative z-10 space-y-4">
                    <Zap className="w-8 h-8 text-white/50 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black tracking-tight leading-tight">Unlock AI Financial Predictions</h3>
                    <p className="text-sm text-white/70 font-medium">Get deeper insights with our premium prediction engine.</p>
                    <PremiumButton variant="secondary" className="w-full bg-white text-brand-600 hover:bg-white/90 border-none">Upgrade Now</PremiumButton>
                  </div>
               </PremiumCard>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardRestructured;
