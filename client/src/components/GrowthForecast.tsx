import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Zap, Compass } from 'lucide-react';
import { ForesightData, formatCurrency } from '../utils/dashboardIntelligence';

interface GrowthForecastProps {
  data: ForesightData;
}

const GrowthForecast: React.FC<GrowthForecastProps> = ({ data }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-400 bg-emerald-400/10';
      case 'medium': return 'text-amber-400 bg-amber-400/10';
      case 'high': return 'text-rose-400 bg-rose-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  return (
    <div className="relative group">
      {/* Cinematic Pulse Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-ai-extreme" />
            <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-white/40">Growth Forecast</h3>
          </div>
          <p className="text-[28px] font-black tracking-tight text-white">Projected Runway</p>
        </div>
        
        <div className={`px-4 py-2 rounded-2xl text-[12px] font-black uppercase tracking-widest ${getRiskColor(data.riskLevel)}`}>
          Risk: {data.riskLevel}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Visual Runway Gauge */}
        <div className="relative aspect-square flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white/5"
                />
                <motion.circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="url(#foresightGradient)"
                    strokeWidth="4"
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * (Math.min(data.runwayMonths, 12) / 12)) }}
                    transition={{ duration: 2, ease: [0.2, 0.8, 0.2, 1] }}
                    strokeLinecap="round"
                />
                <defs>
                   <linearGradient id="foresightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#007AFF" />
                      <stop offset="100%" stopColor="#AF52DE" />
                   </linearGradient>
                </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[64px] font-black tracking-tight text-white leading-none">{data.runwayMonths}</span>
                <span className="text-[12px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Months Left</span>
            </div>
        </div>

        {/* Insights */}
        <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-white/20" />
                    <span className="text-[14px] font-bold text-white/40">Efficiency Score</span>
                    <span className="ml-auto text-[14px] font-black text-white">{Math.round(data.efficiencyScore)}%</span>
                </div>
                <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${data.efficiencyScore}%` }}
                        className="h-full bg-ai-extreme shadow-[0_0_15px_rgba(175,82,222,0.5)]"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-white/20" />
                    <span className="text-[14px] font-bold text-white/40">Monthly Burn Rate</span>
                    <span className="ml-auto text-[14px] font-black text-white">{formatCurrency(data.burnRate)}/mo</span>
                </div>
            </div>

            {/* Strategic Insight */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-3xl">
                <div className="flex gap-4">
                    <ShieldAlert className={`w-6 h-6 shrink-0 ${data.riskLevel === 'high' ? 'text-rose-400' : 'text-blue-400'}`} />
                    <p className="text-[15px] font-medium text-white/70 leading-relaxed italic">
                        "{data.recommendation}"
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthForecast;
