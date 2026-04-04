import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  TrendingUp, MoreHorizontal, ArrowUpRight, Download, Filter, Sparkles, Wallet, FileText, BarChart2, PieChart as PieIcon, Activity, Zap
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
    { icon: <BarChart2 className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Records', href: '/records' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', href: '/analytics' },
    { icon: <Sparkles className="w-5 h-5" />, label: 'AI Deep Dive', href: '/analysis-report' },
    { icon: <Wallet className="w-5 h-5" />, label: 'Pro Plan', href: '/pricing' },
  ];

  const cashFlowData = [
    { name: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { name: 'Feb', revenue: 52000, expenses: 34000, profit: 18000 },
    { name: 'Mar', revenue: 48000, expenses: 38000, profit: 10000 },
    { name: 'Apr', revenue: 61000, expenses: 42000, profit: 19000 },
    { name: 'May', revenue: 55000, expenses: 40000, profit: 15000 },
    { name: 'Jun', revenue: 67000, expenses: 45000, profit: 22000 },
  ];

  const radarData = [
    { subject: 'Marketing', A: 120, B: 110, fullMark: 150 },
    { subject: 'Payroll', A: 98, B: 130, fullMark: 150 },
    { subject: 'Software', A: 86, B: 130, fullMark: 150 },
    { subject: 'Rent', A: 99, B: 100, fullMark: 150 },
    { subject: 'Travel', A: 85, B: 90, fullMark: 150 },
    { subject: 'Operations', A: 65, B: 85, fullMark: 150 },
  ];

  const performanceData = [
    { name: 'Mon', active: 400, target: 240 },
    { name: 'Tue', active: 300, target: 139 },
    { name: 'Wed', active: 200, target: 980 },
    { name: 'Thu', active: 278, target: 390 },
    { name: 'Fri', active: 189, target: 480 },
    { name: 'Sat', active: 239, target: 380 },
    { name: 'Sun', active: 349, target: 430 },
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
             <div className="flex items-center gap-3 mb-2 text-sky-400">
                <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                   <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em]">Institutional Grade</span>
             </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">Business Intelligence<span className="text-sky-500">.</span></h1>
            <p className="text-gray-400 mt-1 font-medium">Real-time financial synthesis for scaled operations</p>
          </div>
          <motion.div className="flex gap-3">
            <PremiumButton variant="secondary" size="md" icon={<Filter className="w-4 h-4" />}>
              Parameters
            </PremiumButton>
            <PremiumButton size="md" icon={<Download className="w-4 h-4" />}>
              Full Export
            </PremiumButton>
          </motion.div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Zap className="w-6 h-6 text-yellow-400" />, label: "Cash Velocity", value: "8.4x", trend: "+12.2%", color: "yellow" },
            { icon: <TrendingUp className="w-6 h-6 text-emerald-400" />, label: "Gross Margin", value: "64.8%", trend: "+2.4%", color: "emerald" },
            { icon: <Wallet className="w-6 h-6 text-sky-400" />, label: "Burn Rate", value: "₹4.2L", trend: "-5.1%", color: "sky" },
            { icon: <PieIcon className="w-6 h-6 text-indigo-400" />, label: "EBITDA Margin", value: "31.2%", trend: "+1.8%", color: "indigo" }
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className={`absolute -inset-1 bg-${kpi.color}-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />
              <KPICard
                icon={kpi.icon}
                label={kpi.label}
                value={kpi.value}
                trend={{ val: kpi.trend, positive: kpi.trend.startsWith('+') }}
              />
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
          >
            <PremiumCard className="relative p-8 h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Cumulative Cash Flow</h3>
                  <p className="text-xs text-white/30 uppercase tracking-widest mt-1">Revenue vs Operating Expenses</p>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b828" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b828" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b828" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Radar Chart for Resource Allocation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <PremiumCard className="relative p-8 h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Resource Synthesis</h3>
                  <p className="text-xs text-white/30 uppercase tracking-widest mt-1">Variance across structural domains</p>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" />
                    <Radar
                      name="Current"
                      dataKey="A"
                      stroke="#38bdf8"
                      fill="#38bdf8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Prior Period"
                      dataKey="B"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          </motion.div>
        </div>

        {/* Weekly Performance Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <PremiumCard className="p-8">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Operational Performance</h3>
                  <p className="text-xs text-white/30 uppercase tracking-widest mt-1">Active vs Target Benchmark</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="active" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#1e293b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </PremiumCard>
        </motion.div>

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
