import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  TrendingUp, MoreHorizontal, ArrowUpRight, Download, Filter, Sparkles,
} from 'lucide-react';
import { MainLayout } from '../components/Layout/MainLayout';
import { PremiumCard, PremiumButton, KPICard } from '../components/ui/PremiumComponents';
import api from '../lib/axios';
import { AnalysisDashboard } from '../components/AIAnalysisDashboard';
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
          initial="initial"
          animate="animate"
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: <BarChart className="w-8 h-8 text-sky-400" />, label: "Total Records", value: metrics?.kpis?.totalRecords || 0, trend: "+15.2%" },
            { icon: <TrendingUp className="w-8 h-8 text-indigo-400" />, label: "Avg. Performance", value: "94.2%", trend: "+3.1%" },
            { icon: <ArrowUpRight className="w-8 h-8 text-emerald-400" />, label: "Prediction Accuracy", value: "87.5%", trend: "+5.2%" }
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.95 },
                animate: { opacity: 1, y: 0, scale: 1 }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <KPICard
                icon={kpi.icon}
                label={kpi.label}
                value={kpi.value}
                trend={{ val: kpi.trend, positive: true }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Charts with Glass Overlays */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <PremiumCard className="relative bg-white/[0.01] backdrop-blur-3xl border-white/10 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Performance Metrics</h3>
                  <p className="text-xs text-white/30 uppercase tracking-[0.2em] mt-1 font-bold">Historical data</p>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                      }} 
                    />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative"
          >
             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <PremiumCard className="relative bg-white/[0.01] backdrop-blur-3xl border-white/10 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Predictive Insights</h3>
                  <p className="text-xs text-white/30 uppercase tracking-[0.2em] mt-1 font-bold">Future projections</p>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                      }} 
                    />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="prediction" stroke="#a855f7" strokeWidth={2} strokeDasharray="8 8" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          </motion.div>
        </div>

        {/* AI Insights with Premium Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.01] backdrop-blur-3xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="p-10 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
              <div>
                <motion.div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-400 text-[10px] font-black uppercase tracking-widest mb-3"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3" /> Core Intelligence
                </motion.div>
                <h3 className="text-3xl font-black text-white tracking-tight">AI Strategic Analysis</h3>
                <p className="text-gray-400 mt-2 font-medium">Synthesized business recommendations based on real-time data.</p>
              </div>
              {aiInsightsEnabled ? (
                <PremiumButton 
                  onClick={generateAIInsights}
                  loading={aiLoading}
                  size="lg"
                  className="bg-sky-500 hover:bg-sky-400 border-none shadow-[0_15px_30px_-5px_rgba(14,165,233,0.3)]"
                  icon={<TrendingUp className="w-4 h-4" />}
                >
                  Refresh Intelligence
                </PremiumButton>
              ) : null}
            </div>

            {!aiInsightsEnabled ? (
              <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-12 text-center backdrop-blur-xl relative overflow-hidden group-hover:border-white/10 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-purple-500/5 opacity-50" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-20 h-20 mx-auto mb-6 text-sky-400/40" />
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-4">Unlock Strategic Power</h3>
                <p className="mx-auto max-w-xl text-gray-400 font-medium leading-relaxed">
                  The AI Strategic Engine is currently reserved for Pro Tier users. Upgrade today to access predictive forecasting, expense optimization, and growth scaling strategies.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <PremiumButton onClick={() => navigate('/pricing')} size="lg" className="px-10">Upgrade to Pro</PremiumButton>
                </div>
              </div>
            ) : aiAnalysis ? (
              <AnalysisDashboard analysisResult={aiAnalysis} />
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin mx-auto mb-6" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Synthesizing Business Intelligence...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default PremiumAnalytics;
