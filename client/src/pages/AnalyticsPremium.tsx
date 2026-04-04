import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  TrendingUp, MoreHorizontal, ArrowUpRight, Download, Filter,
} from 'lucide-react';
import { MainLayout } from '../components/Layout/MainLayout';
import { PremiumCard, PremiumButton, KPICard } from '../components/ui/PremiumComponents';
import api from '../lib/axios';
import { AIAnalysisDashboard } from '../components/AIAnalysisDashboard';
import { aiService, BusinessData, AIAnalysisResponse } from '../services/aiService';
import { canUseAIInsights } from '../utils/plan';

const PremiumAnalytics = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const aiInsightsEnabled = canUseAIInsights(user);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    loadMetrics();
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const response = await api.get('/company');
      const companyData = response.data.company;
      setCompany(companyData);
      if (companyData && canUseAIInsights(JSON.parse(localStorage.getItem('user') || 'null'))) {
        await generateAIInsights(companyData);
      }
    } catch (err) {
      console.warn('No company data', err);
    }
  };

  const generateAIInsights = async (companyData = company) => {
    if (!companyData) return;
    if (!canUseAIInsights(JSON.parse(localStorage.getItem('user') || 'null'))) {
      return;
    }
    setAiLoading(true);
    try {
      const data: BusinessData = {
        revenue: companyData.revenue || 0,
        expenses: companyData.expenses || 0,
        customerCount: companyData.employees || 0,
        industry: companyData.industry,
      };
      const result = await aiService.analyzeBusinessData(data);
      setAiAnalysis(result);
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await api.get('/analytics/summary');
      setMetrics(response.data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const sidebarItems = [
    { icon: <BarChart className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', href: '/analytics' },
  ];

  const chartData = [
    { name: 'Jan', value: 4000, prediction: 2400 },
    { name: 'Feb', value: 3000, prediction: 1398 },
    { name: 'Mar', value: 2000, prediction: 9800 },
    { name: 'Apr', value: 2780, prediction: 3908 },
    { name: 'May', value: 1890, prediction: 4800 },
    { name: 'Jun', value: 2390, prediction: 3800 },
  ];

  if (loading) {
    return (
      <MainLayout
        sidebarItems={sidebarItems}
        activePage="/analytics"
        onNavigate={(href) => navigate(href)}
        onLogout={handleLogout}
        userName={user?.name}
      >
        <div className="space-y-6">
          <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      activePage="/analytics"
      onNavigate={(href) => navigate(href)}
      onLogout={handleLogout}
      userName={user?.name}
    >
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Advanced Analytics</h1>
            <p className="text-gray-400">In-depth analysis and predictions</p>
          </div>
          <motion.div className="flex gap-3">
            <PremiumButton variant="secondary" size="md" icon={<Filter className="w-4 h-4" />}>
              Filter
            </PremiumButton>
            <PremiumButton size="md" icon={<Download className="w-4 h-4" />}>
              Export
            </PremiumButton>
          </motion.div>
        </motion.div>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <KPICard
              icon={<BarChart className="w-8 h-8 text-indigo-400" />}
              label="Total Events"
              value={metrics?.kpis?.totalRecords || 0}
              change="+15.2%"
              trend="up"
              gradient="from-indigo-500/10 to-indigo-600/10"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <KPICard
              icon={<TrendingUp className="w-8 h-8 text-purple-400" />}
              label="Avg. Performance"
              value="94.2%"
              change="+3.1%"
              trend="up"
              gradient="from-purple-500/10 to-purple-600/10"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <KPICard
              icon={<ArrowUpRight className="w-8 h-8 text-emerald-400" />}
              label="Prediction Accuracy"
              value="87.5%"
              change="+5.2%"
              trend="up"
              gradient="from-emerald-500/10 to-emerald-600/10"
            />
          </motion.div>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
                <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-white/10 rounded-lg">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                  }} />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </PremiumCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Prediction vs Actual</h3>
                <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-white/10 rounded-lg">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                  }} />
                  <Line type="monotone" dataKey="value" stroke="#4f46e5" />
                  <Line type="monotone" dataKey="prediction" stroke="#8b5cf6" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </PremiumCard>
          </motion.div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  🤖 AI Insights Dashboard
                </h3>
                <p className="text-sm text-gray-400">Real-time business analysis and recommendations</p>
              </div>
              {aiInsightsEnabled ? (
                <PremiumButton 
                  onClick={generateAIInsights}
                  loading={aiLoading}
                  size="sm"
                  icon={<TrendingUp className="w-4 h-4" />}
                >
                  Refresh AI
                </PremiumButton>
              ) : null}
            </div>
            {!aiInsightsEnabled ? (
              <div className="rounded-3xl border border-dashed border-amber-400/20 bg-amber-500/10 p-8 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-amber-200" />
                <p className="text-lg font-semibold text-white">Upgrade to Pro to unlock AI analysis</p>
                <p className="mt-3 text-sm leading-6 text-ink-300">
                  Free accounts can view analytics, but AI forecasts and strategic recommendations are premium features.
                </p>
                <div className="mt-6">
                  <PremiumButton onClick={() => navigate('/pricing')}>View plans</PremiumButton>
                </div>
              </div>
            ) : aiAnalysis ? (
              <AIAnalysisDashboard analysisResult={aiAnalysis} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p>AI insights loading or no company data</p>
              </div>
            )}
          </PremiumCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default PremiumAnalytics;
