import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  TrendingUp, Download, Filter, Sparkles, Wallet, PieChart as PieIcon, Activity, Zap
} from 'lucide-react';
import { PremiumCard, PremiumButton, KPICard } from '../components/ui/PremiumComponents';
import api from '../lib/axios';
import { BusinessInsights } from '../components/BusinessInsights';
import { aiService, BusinessData, AIAnalysisResponse } from '../services/aiService';
import { canUseDeepInsights as canUseAIInsights } from '../utils/plan';
import { premiumFeedback } from '../utils/premiumFeedback';
import { generateBrandedPDF } from '../utils/pdfGenerator';


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

  const cashFlowData = metrics?.monthlyData || [
    { name: 'No Data', revenue: 0, expenses: 0, profit: 0 }
  ];

  const performanceData = metrics?.monthlyData ? metrics.monthlyData.map((d: any) => ({
    name: d.month,
    active: d.revenue,
    target: d.target
  })) : [
    { name: 'Mon', active: 0, target: 0 },
    { name: 'Tue', active: 0, target: 0 },
    { name: 'Wed', active: 0, target: 0 },
    { name: 'Thu', active: 0, target: 0 },
    { name: 'Fri', active: 0, target: 0 },
    { name: 'Sat', active: 0, target: 0 },
    { name: 'Sun', active: 0, target: 0 },
  ];

  const radarData = metrics?.scoreData?.breakdown ? [
    { subject: 'Profitability', A: metrics.scoreData.breakdown.profitability, B: 70, fullMark: 100 },
    { subject: 'Growth', A: metrics.scoreData.breakdown.growth, B: 65, fullMark: 100 },
    { subject: 'Activity', A: metrics.scoreData.breakdown.activity, B: 50, fullMark: 100 },
    { subject: 'Efficiency', A: metrics.scoreData.breakdown.efficiency, B: 80, fullMark: 100 },
    { subject: 'Resonance', A: metrics.scoreData?.resonanceIndex || 50, B: 60, fullMark: 100 },
    { subject: 'Stability', A: 100 - (metrics.kpis?.inactiveRatio || 0), B: 75, fullMark: 100 },
  ] : [
    { subject: 'Profitability', A: 0, B: 0, fullMark: 100 },
    { subject: 'Growth', A: 0, B: 0, fullMark: 100 },
    { subject: 'Activity', A: 0, B: 0, fullMark: 100 },
    { subject: 'Efficiency', A: 0, B: 0, fullMark: 100 },
    { subject: 'Resonance', A: 0, B: 0, fullMark: 100 },
    { subject: 'Stability', A: 0, B: 0, fullMark: 100 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-1/3 bg-[#1C1C1E] animate-pulse rounded-lg" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#1C1C1E] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-[400px] bg-[#1C1C1E] animate-pulse rounded-xl" />
      </div>
    );
  }

  const springTransition = { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] };

  return (
    <>
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-8 py-8 space-y-12 pb-24 text-white">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1C1C1E]">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="inline-flex items-center gap-2 mb-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#AF52DE]" />
              <span className="text-[11px] font-semibold text-[#A1A1A6] uppercase tracking-wider">Business Intelligence</span>
            </motion.div>
            <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight text-white leading-tight">
              Real-time analysis.
            </h1>
          </div>
          <motion.div className="flex gap-3">
            <button className="px-4 py-2 rounded-full border border-[#1C1C1E] hover:bg-[#1C1C1E] transition-colors flex items-center gap-2 text-[13px] font-medium text-[#A1A1A6]">
              <Filter className="w-4 h-4" /> Parameters
            </button>
            <button
              onClick={() => {
                premiumFeedback.click();
                if (metrics) {
                  const header = 'Month | Revenue | Expenses | Target\n-----------------------------------------';
                  const rows = (metrics.monthlyData || []).map((d: any) =>
                    `${d.month} | ₹${d.revenue} | ₹${d.expenses} | ₹${d.target}`
                  );
                  const kpis = `\nKPIs:\nGrowth Rate: ${metrics?.kpis?.growthRate || 0}%\nProfit Margin: ${metrics?.kpis?.profitMargin || 0}%\nRevenue: ₹${metrics?.kpis?.revenue || 0}\nNet Profit: ₹${metrics?.kpis?.profit || 0}\n`;

                  const content = `Analytics Premium Export\n\n${kpis}\nMonthly Breakdown:\n${header}\n${rows.join('\n')}`;

                  void generateBrandedPDF({
                    title: 'BIZ PLUS Premium Analytics Report',
                    content: content,
                    filename: `aera-analytics-${new Date().toISOString().slice(0, 10)}`,
                    type: 'analytics_export'
                  });

                  premiumFeedback.success();
                }
              }}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors flex items-center gap-2 text-[13px] font-medium"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </motion.div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Zap className="w-5 h-5 text-[#FF9500]" />, label: "Cash Velocity", value: metrics?.kpis?.growthRate ? `${(metrics.kpis.growthRate / 10).toFixed(1)}x` : "0.0x", trend: metrics?.kpis?.growthRate ? `+${metrics.kpis.growthRate}%` : "0%" },
            { icon: <TrendingUp className="w-5 h-5 text-[#34C759]" />, label: "Gross Margin", value: metrics?.kpis?.profitMargin ? `${metrics.kpis.profitMargin.toFixed(1)}%` : "0.0%", trend: "0%" },
            { icon: <Wallet className="w-5 h-5 text-[#007AFF]" />, label: "Total Revenue", value: metrics?.kpis?.revenue ? `₹${(metrics.kpis.revenue / 100000).toFixed(1)}L` : "₹0.0L", trend: "0%" },
            { icon: <PieIcon className="w-5 h-5 text-[#AF52DE]" />, label: "Net Profit", value: metrics?.kpis?.profit ? `₹${(metrics.kpis.profit / 100000).toFixed(1)}L` : "₹0.0L", trend: "0%" }
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ...springTransition }}
              whileHover={{ y: -2 }}
              className="apple-card p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-semibold text-[#A1A1A6]">{kpi.label}</span>
                {kpi.icon}
              </div>
              <div className="text-[28px] font-bold tracking-tight mb-1">{kpi.value}</div>
              <div className={`text-[13px] font-medium ${kpi.trend.startsWith('+') ? 'text-[#34C759]' : 'text-[#A1A1A6]'}`}>
                {kpi.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Major Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cash Flow Area Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={springTransition}
          >
            <div className="apple-card p-6 md:p-8 h-full">
              <div className="mb-6">
                <h3 className="text-[17px] font-semibold tracking-tight text-white">Cumulative Cash Flow</h3>
                <p className="text-[13px] text-[#A1A1A6] mt-1">Revenue vs Operating Expenses</p>
              </div>
              <div className="h-[300px] w-full font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34C759" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#A1A1A6" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }} />
                    <YAxis stroke="#A1A1A6" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)', fontSize: '12px' }}
                      itemStyle={{ fontWeight: '500' }}
                      labelStyle={{ color: '#fff', fontWeight: '600', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#34C759" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" stroke="#FF3B30" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Radar Chart for Resource Allocation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ ...springTransition, delay: 0.1 }}
          >
            <div className="apple-card p-6 md:p-8 h-full">
              <div className="mb-6">
                <h3 className="text-[17px] font-semibold tracking-tight text-white">Resource Synthesis</h3>
                <p className="text-[13px] text-[#A1A1A6] mt-1">Variance across structural domains</p>
              </div>
              <div className="h-[300px] w-full font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#A1A1A6', fontSize: 11, fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }} />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" tick={false} axisLine={false} />
                    <Radar dataKey="A" stroke="#007AFF" fill="#007AFF" fillOpacity={0.4} />
                    <Radar dataKey="B" stroke="#AF52DE" fill="#AF52DE" fillOpacity={0.2} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)', fontSize: '12px' }}
                      itemStyle={{ fontWeight: '500' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springTransition}
        >
          <div className="apple-card p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-[17px] font-semibold tracking-tight text-white">Operational Performance</h3>
              <p className="text-[13px] text-[#A1A1A6] mt-1">Active vs Target Benchmark</p>
            </div>
            <div className="h-[300px] w-full font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#A1A1A6" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }} />
                  <YAxis stroke="#A1A1A6" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)', fontSize: '12px' }}
                    itemStyle={{ fontWeight: '500' }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="active" fill="#007AFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#2C2C2E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* AI Insights with Premium Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springTransition}
          className="relative overflow-hidden apple-card p-8 md:p-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#007AFF]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
              <div>
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-semibold uppercase tracking-wider mb-2"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Intelligence Core
                </motion.div>
                <h3 className="text-[28px] font-bold text-white tracking-tight">AI Strategic Analysis.</h3>
                <p className="text-[15px] font-medium text-[#A1A1A6] mt-1">Synthesized business recommendations based on real-time data.</p>
              </div>
              {aiInsightsEnabled ? (
                <button
                  onClick={() => {
                    premiumFeedback.click();
                    generateAIInsights();
                  }}
                  disabled={aiLoading}
                  className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-[14px] font-medium rounded-full shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? <span className="animate-spin inline-block">⟳</span> : <TrendingUp className="w-4 h-4" />}
                  Refresh Analysis
                </button>
              ) : null}
            </div>

            {!aiInsightsEnabled ? (
              <div className="rounded-2xl border border-white/5 bg-[#1C1C1E]/50 p-12 text-center relative overflow-hidden group">
                <h3 className="text-[20px] font-bold text-white mb-2">Unlock Strategic Power</h3>
                <p className="mx-auto max-w-xl text-[15px] text-[#A1A1A6] font-medium leading-relaxed">
                  The AI Strategic Engine is currently reserved for Pro Tier users. Upgrade today to access predictive forecasting, expense optimization, and growth scaling strategies.
                </p>
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => {
                      premiumFeedback.click();
                      navigate('/pricing');
                    }}
                    className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            ) : aiAnalysis ? (
              <BusinessInsights analysisResult={aiAnalysis} />
            ) : (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-2 border-[#2C2C2E] border-t-[#007AFF] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#A1A1A6] font-semibold text-[13px]">Synthesizing Business Intelligence...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>);
};

export default PremiumAnalytics;
