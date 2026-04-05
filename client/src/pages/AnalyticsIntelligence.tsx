import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  Zap, 
  AlertCircle,
  ArrowRight,
  Filter,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { PremiumCard, PremiumButton } from '../components/ui/PremiumComponents';
import InsightCard from '../components/analytics/InsightCard';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';

// --- Types ---
interface AnalyticsData {
  revenue: { data: any[]; metrics: { totalRevenue: number; growth: number }; insight: string };
  profitCost: { comparison: any[]; breakdown: any[]; insight: string };
  customers: { topCustomers: any[]; metrics: { newCustomers: number; repeatRate: number }; insight: string };
  inventory: { topProducts: any[]; lowStock: any[]; insight: string };
  predictions: { forecast: any[]; risks: any[] };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const AnalyticsIntelligence = () => {
  const navigate = useNavigate();
  const { filters, setRange } = useAnalyticsStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rev, pc, cust, inv, pred] = await Promise.all([
          api.get(`/analytics/intel/revenue?days=${filters.range}`),
          api.get('/analytics/intel/profit-cost'),
          api.get('/analytics/intel/customers'),
          api.get('/analytics/intel/inventory'),
          api.get('/analytics/intel/predictions'),
        ]);

        setData({
          revenue: rev.data,
          profitCost: pc.data,
          customers: cust.data,
          inventory: inv.data,
          predictions: pred.data
        });
      } catch (e) {
        toast.error('Failed to load intelligence data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.range]);

  const MetricCard = ({ icon: Icon, title, value, growth, color }: any) => (
    <PremiumCard className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(growth)}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tighter">${value.toLocaleString()}</h3>
      </div>
    </PremiumCard>
  );

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="p-4 rounded-full border-2 border-blue-500/20 border-t-blue-500"
        >
          <Zap className="w-8 h-8 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">How's Your Business Doing?</h1>
          <p className="text-white/40 font-medium italic">A clear look at your money and growth.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-[1.25rem] border border-white/10 backdrop-blur-2xl self-start md:self-auto">
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-500 ${
                filters.range === r ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-white/40 hover:text-white'
              }`}
            >
              {r} DAYS
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Revenue Intelligence */}
        <PremiumCard className="lg:col-span-2 flex flex-col h-full" padded={false}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">Money Coming In</h3>
            </div>
          </div>
          <div className="p-6 flex-1">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenue.data}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6">
                <InsightCard 
                    title="Money Tip" 
                    message={data.revenue.insight} 
                    impactLevel="medium"
                />
            </div>
          </div>
        </PremiumCard>

        {/* Predictive Dashboard */}
        <PremiumCard className="flex flex-col h-full" padded={false}>
            <div className="p-6 border-b border-white/5 bg-blue-600/5">
                <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-sm font-bold text-white tracking-widest uppercase">Future Predictions</h3>
                </div>
            </div>
            <div className="p-6 flex-1 space-y-6">
                <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.predictions.forecast}>
                            <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                    {data.predictions.risks.map((risk, index) => (
                        <div key={index} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                           <h4 className="text-xs font-bold text-amber-500 uppercase mb-1">{risk.title}</h4>
                           <p className="text-xs text-white/60 font-medium">{risk.message}</p>
                        </div>
                    ))}
                    <button 
                        onClick={() => navigate('/analysis-report')}
                        className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-between hover:bg-white/10 transition-all group"
                    >
                        Mitigate Risks
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </PremiumCard>

        {/* Profit vs Expenses */}
        <PremiumCard className="h-full" padded={false}>
            <div className="p-6 border-b border-white/5">
                <h3 className="text-sm font-bold text-white tracking-widest uppercase">Profit Left Over</h3>
            </div>
            <div className="p-6 space-y-6">
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.profitCost.comparison}>
                            <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
                                {data.profitCost.comparison.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-[1.25rem] bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-emerald-400/60 mb-1">Total Net</p>
                        <h4 className="text-xl font-black text-emerald-400 tracking-tighter">$12,400</h4>
                    </div>
                    <div className="p-4 rounded-[1.25rem] bg-rose-500/10 border border-rose-500/20">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-rose-400/60 mb-1">Operations</p>
                        <h4 className="text-xl font-black text-rose-400 tracking-tighter">$4,200</h4>
                    </div>
                </div>
            </div>
        </PremiumCard>

        {/* Expense Breakdown */}
        <PremiumCard padded={false}>
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Where Your Money Goes</h3>
          </div>
          <div className="p-6">
            <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data.profitCost.breakdown} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {data.profitCost.breakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '16px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
                {data.profitCost.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                           <span className="text-xs font-semibold text-white/60">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-white">${item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
          </div>
        </PremiumCard>

        {/* Customer & Product Leaderboard */}
        <PremiumCard padded={false}>
            <div className="p-6 border-b border-white/5">
               <h3 className="text-sm font-bold text-white tracking-widest uppercase">Best Customers & Products</h3>
            </div>
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Top Customers</p>
                    {data.customers.topCustomers.map((cust, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                            <span className="text-sm font-bold text-white/80">{cust.name}</span>
                            <span className="text-sm font-black text-blue-400">${cust.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Low Stock Alerts</p>
                    {data.inventory.lowStock.map((prod, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white/60">{prod.name}</span>
                            <span className="text-[10px] font-black text-rose-400 uppercase bg-rose-500/10 px-2 py-1 rounded-lg">
                                {prod.stock} LEFT
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </PremiumCard>

      </div>
    </div>
  );
};

export default AnalyticsIntelligence;
