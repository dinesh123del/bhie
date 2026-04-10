import React from 'react';
import { motion } from 'framer-motion';
import { Globe, BarChart2, TrendingUp } from 'lucide-react';

const MarketPulse = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#00D4FF]" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Global Context</h4>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase">In-Sync</span>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-[10px] font-black text-white/20 uppercase">Benchmarked Growth</span>
              <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-[18px] font-black text-white">+12.4%</span>
              </div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <span className="text-[10px] font-black text-white/20 uppercase">Market Velocity</span>
              <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-[18px] font-black text-white">Top 8%</span>
              </div>
          </div>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5">
          <p className="text-[13px] text-white/60 leading-relaxed font-medium">
             “Company performance is currently <span className="text-white font-bold">exceeding industry average by 22%</span>. Institutional stability confirmed.”
          </p>
      </div>
    </div>
  );
};

export default MarketPulse;
