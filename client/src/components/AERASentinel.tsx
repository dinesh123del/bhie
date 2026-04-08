import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Zap, AlertTriangle, CheckCircle2, BarChart4 } from 'lucide-react';
import { aeraAPI } from '../services/api';
import { getGlobalBenchmarks, calculateAntiFragility } from '../lib/globalBenchmarking';

interface SentinelData {
  resilience_score: number;
  status: string;
  grade: string;
  global_volatility_index: number;
  recommendation: string;
  verdict: string;
}

const AERASentinel = ({ 
  industry = 'Technology', 
  region = 'India', 
  cashReserve = 100000, 
  burnRate = 5000, 
  revenue = 0, 
  expenses = 0 
}: { 
    industry?: string; 
    region?: string; 
    cashReserve?: number; 
    burnRate?: number; 
    revenue?: number;
    expenses?: number;
}) => {
  const [data, setData] = useState<SentinelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentinel = async () => {
      try {
        const result = await aeraAPI.getSentinel({
          industry,
          region,
          current_cash_reserve: cashReserve,
          monthly_burn_rate: burnRate,
          is_global_exposure: true
        });
        setData(result);
      } catch (err) {
        console.error('Sentinel Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSentinel();
  }, [industry, region, cashReserve, burnRate]);

  const profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
  const benchmarks = getGlobalBenchmarks(industry, profitMargin, 'profit_margin');
  const antiFragility = calculateAntiFragility(burnRate, cashReserve, 0.4); // Mocking concentration for now

  if (loading) return (
    <div className="apple-card p-8 min-h-[300px] bg-[#0A0A0B] border-white/5 animate-pulse flex flex-col justify-center items-center">
      <div className="w-16 h-16 rounded-full bg-white/5 mb-4" />
      <div className="h-4 w-32 bg-white/5 rounded" />
    </div>
  );

  if (!data) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FORTIFIED': return 'text-emerald-400';
      case 'RESILIENT': return 'text-blue-400';
      case 'STABLE': return 'text-amber-400';
      case 'VULNERABLE': return 'text-rose-400';
      default: return 'text-white/40';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="apple-card p-10 bg-gradient-to-br from-[#0A0A0C] via-black to-[#0A0A0C] border-indigo-500/10 relative overflow-hidden group border"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">System Protocol</h3>
              <p className="text-[18px] font-black tracking-tight text-white">AERA Sentinel v3.0</p>
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Scanning Global Mesh</span>
          </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-white/5"
                />
                <motion.circle
                  initial={{ strokeDasharray: "0 365" }}
                  animate={{ strokeDasharray: `${(data.resilience_score / 100) * 365} 365` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="url(#resilience-gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <defs>
                   <linearGradient id="resilience-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#C084FC" />
                   </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-[32px] font-black tracking-tight text-white">{Math.round(data.resilience_score)}</span>
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-[-4px]">Resilience</span>
              </div>
           </div>

           <div className="flex-1 space-y-4">
              <div className="flex items-baseline gap-3">
                 <span className={`text-[32px] font-black tracking-tighter ${getStatusColor(data.status)}`}>{data.status}</span>
                 <span className="text-[14px] font-black text-white/30 tracking-tight uppercase">{data.grade}</span>
              </div>
              <p className="text-[15px] font-medium text-white/50 leading-relaxed max-w-sm">
                 {data.recommendation}
              </p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
           <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-white/20" />
              <div className="text-[11px]">
                 <span className="block text-white/20 uppercase font-black tracking-widest">Global Volatility</span>
                 <span className="text-white font-black">{Math.round(data.global_volatility_index * 100)}% Index</span>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-white/20" />
              <div className="text-[11px]">
                 <span className="block text-white/20 uppercase font-black tracking-widest">Network Effect</span>
                 <span className="text-white font-black">Active Context</span>
              </div>
           </div>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
           <div className="flex items-start gap-3">
              {data.resilience_score > 60 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-1" />}
              <p className="text-[13px] font-medium text-white/60 italic leading-snug">
                 {data.verdict}
              </p>
           </div>
        </div>

        {/* Global Benchmark Context */}
        <div className="apple-card p-6 bg-indigo-500/[0.03] border-indigo-500/10 mt-2">
           <div className="flex items-center gap-3 mb-6">
              <BarChart4 className="w-4 h-4 text-indigo-400" />
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400">Global Benchmarking</h4>
           </div>
           
           <div className="grid grid-cols-2 gap-8">
              <div>
                 <span className="block text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Market Percentile</span>
                 <div className="flex items-baseline gap-2">
                    <span className="text-[24px] font-black text-white">{benchmarks.percentile}th</span>
                    <span className="text-[10px] font-black text-emerald-400">Top {100 - benchmarks.percentile}%</span>
                 </div>
              </div>
              <div>
                 <span className="block text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Anti-Fragility</span>
                 <div className="flex items-baseline gap-2">
                    <span className="text-[24px] font-black text-white">{antiFragility}</span>
                    <span className="text-[10px] font-black text-indigo-400/50">/ 100</span>
                 </div>
              </div>
           </div>
           
           <p className="mt-6 text-[12px] font-medium text-white/40 leading-relaxed border-t border-white/5 pt-4">
              <span className="text-white/60 font-black">AERA Insight:</span> {benchmarks.recommendation}
           </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AERASentinel;
