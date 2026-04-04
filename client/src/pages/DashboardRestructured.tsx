import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  TrendingUp,
  IndianRupee,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart3,
  Plus,
  Scan,
} from 'lucide-react';
import { MainLayout } from '../components/Layout/MainLayout';
import { PremiumCard, PremiumButton, PremiumBadge } from '../components/ui/PremiumComponents';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { formatCurrency } from '../utils/dashboardIntelligence';
import Onboarding from '../components/Onboarding';

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

interface CompanyData {
  name: string;
  industry: string;
  revenue: number;
  expenses: number;
}

const DashboardRestructured = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    recentTransactions: true,
    insights: true,
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      
      if (response.data) {
        const totalIncome = response.data.metrics?.kpis?.revenue || 0;
        const totalExpenses = response.data.metrics?.kpis?.expenses || 0;
        const profit = totalIncome - totalExpenses;
        const businessHealth = response.data.scoreData?.score || 75;
        const growthRate = response.data.metrics?.kpis?.growthRate || 0;
        const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

        setMetrics({
          totalIncome,
          totalExpenses,
          profit,
          businessHealth,
          growthRate,
          expenseRatio,
          monthlyData: response.data.metrics?.monthlyData || [],
        });

        if (response.data.company) {
          setCompany({
            name: response.data.company.name || 'Your Business',
            industry: response.data.company.industry || 'N/A',
            revenue: totalIncome,
            expenses: totalExpenses,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => loadDashboard(), 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const healthStatus = !metrics
    ? 'Loading'
    : metrics.businessHealth >= 80
    ? 'Excellent'
    : metrics.businessHealth >= 60
    ? 'Good'
    : 'Needs attention';

  const healthColor = !metrics
    ? 'text-gray-400'
    : metrics.businessHealth >= 80
    ? 'text-green-400'
    : metrics.businessHealth >= 60
    ? 'text-blue-400'
    : 'text-amber-400';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Onboarding />
      <div className="w-full space-y-6 px-6 py-8 lg:px-8 pt-28">
        {/* PAGE HEADER */}
        <motion.div
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Business Overview</h1>
            <p className="mt-1 text-sm text-gray-400">
              {company?.name || 'Your business'} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <PremiumButton
            variant="secondary"
            onClick={loadDashboard}
            icon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
          >
            Refresh
          </PremiumButton>
        </motion.div>

        {/* TOP SUMMARY CARDS - 4 COLUMN GRID */}
        <motion.div
          className="tour-step-overview grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* TOTAL INCOME CARD */}
          <motion.div variants={itemVariants}>
            <PremiumCard className="border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-gray-400">Total Income</span>
                  <IndianRupee className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {loading ? '-' : formatCurrency(metrics?.totalIncome || 0)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Money coming in</p>
                </div>
                {metrics && metrics.growthRate > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <ArrowUpRight className="h-3 w-3" />
                    {metrics.growthRate.toFixed(1)}% growth
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* TOTAL EXPENSES CARD */}
          <motion.div variants={itemVariants}>
            <PremiumCard className="border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-gray-400">Total Expenses</span>
                  <IndianRupee className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {loading ? '-' : formatCurrency(metrics?.totalExpenses || 0)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Money going out</p>
                </div>
                {metrics && (
                  <div className="text-xs text-gray-400">
                    {metrics.expenseRatio.toFixed(0)}% of your income
                  </div>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* PROFIT CARD */}
          <motion.div variants={itemVariants}>
            <PremiumCard className="border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-gray-400">Your Profit</span>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {loading ? '-' : formatCurrency(metrics?.profit || 0)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Money left over</p>
                </div>
                {metrics && metrics.profit > 0 ? (
                  <div className="text-xs text-green-400">✓ Profitable</div>
                ) : (
                  <div className="text-xs text-amber-400">⚠ Review needed</div>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* BUSINESS HEALTH CARD */}
          <motion.div variants={itemVariants}>
            <PremiumCard className="border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-gray-400">Business Health</span>
                  <AlertCircle className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${healthColor}`}>
                    {loading ? '-' : `${metrics?.businessHealth || 0}/100`}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{healthStatus}</p>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className={`h-full transition-all duration-500 ${
                      metrics && metrics.businessHealth >= 80
                        ? 'bg-green-400'
                        : metrics && metrics.businessHealth >= 60
                        ? 'bg-blue-400'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${metrics?.businessHealth || 0}%` }}
                  />
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </motion.div>

        {/* EXPANDABLE SECTIONS */}
        <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
          {/* RECENT TRANSACTIONS SECTION */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
          >
            <button
              onClick={() => toggleSection('recentTransactions')}
              className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-white">Recent Income & Expenses</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.recentTransactions ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </button>

            <motion.div
              animate={{ height: expandedSections.recentTransactions ? 'auto' : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/10 px-6 py-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 rounded-lg bg-white/[0.05] animate-pulse" />
                    ))}
                  </div>
                ) : metrics?.monthlyData && metrics.monthlyData.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.monthlyData.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white/[0.05] p-3">
                        <div>
                          <p className="text-sm font-medium text-white">{item.month}</p>
                          <p className="text-xs text-gray-400">
                            Income: {formatCurrency(item.revenue)} | Expenses: {formatCurrency(item.expenses)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-400">
                            +{formatCurrency(item.revenue - item.expenses)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-white/[0.05] p-4 text-center">
                    <p className="text-sm text-gray-400">No data yet. Upload invoices to see transactions.</p>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/uploads')}
                      className="mt-3"
                    >
                      Upload Now
                    </PremiumButton>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* AI INSIGHTS SECTION */}
          <motion.div
            variants={itemVariants}
            className="tour-step-insights rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
          >
            <button
              onClick={() => toggleSection('insights')}
              className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <span className="font-semibold text-white">Smart Insights</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.insights ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </button>

            <motion.div
              animate={{ height: expandedSections.insights ? 'auto' : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/10 px-6 py-4">
                {!metrics ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 rounded-lg bg-white/[0.05] animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics.expenseRatio > 60 && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                        <p className="text-sm font-semibold text-amber-200">💡 You are spending more than half of your income</p>
                        <p className="mt-1 text-xs text-amber-100/70">
                          Consider reviewing expenses to improve profit.
                        </p>
                      </div>
                    )}
                    {metrics.profit > 0 && (
                      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                        <p className="text-sm font-semibold text-green-200">✓ Your business is profitable</p>
                        <p className="mt-1 text-xs text-green-100/70">
                          Keep this trend going by maintaining income and controlling costs.
                        </p>
                      </div>
                    )}
                    {metrics.businessHealth < 60 && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                        <p className="text-sm font-semibold text-red-200">⚠ Your business needs attention</p>
                        <p className="mt-1 text-xs text-red-100/70">
                          Focus on increasing income or reducing expenses immediately.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ACTION BUTTONS */}
        <motion.div
          className="tour-step-actions flex flex-wrap gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PremiumButton onClick={() => navigate('/scan-bill')} variant="secondary" icon={<Scan className="w-4 h-4" />}>
            Scan Bill
          </PremiumButton>
          <PremiumButton onClick={() => navigate('/uploads')} variant="primary">
            Upload Files
          </PremiumButton>
          <PremiumButton onClick={() => navigate('/records')} variant="secondary">
            View All Records
          </PremiumButton>
          <PremiumButton onClick={() => navigate('/analytics')} variant="secondary">
            See Charts
          </PremiumButton>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardRestructured;
