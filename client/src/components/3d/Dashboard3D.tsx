import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Dashboard3DSectionProps {
  revenue?: number;
  growth?: number;
  expenses?: number;
  profit?: number;
}

// Pure CSS/Framer Motion replacement — no Three.js, no Canvas, no R3F crashes
export function RevenueFlowCard({ revenue = 500000, growth = 15 }: { revenue?: number; growth?: number }) {
  const isPositive = growth > 0;
  const bars = [65, 45, 72, 58, 80, 62, 88, 74, 91, 78, 85, growth > 0 ? 95 : 40];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="apple-card h-80 overflow-hidden bg-[#0A0A0B] border-white/5 p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] animate-pulse" />
        <span className="text-xs font-black uppercase tracking-widest text-white/40">Revenue Flow</span>
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-black text-white tracking-tight">
            ₹{(revenue / 100000).toFixed(1)}L
          </p>
          <p className={`text-sm font-bold flex items-center gap-1 mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{growth}% this month
          </p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-black"
          style={{ background: 'rgba(0,122,255,0.1)', color: '#007AFF' }}
        >
          LIVE
        </div>
      </div>

      {/* Animated bar chart */}
      <div className="flex items-end gap-1.5 h-28">
        {bars.map((pct, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              background: i === bars.length - 1
                ? isPositive
                  ? 'linear-gradient(180deg, #34d399, #059669)'
                  : 'linear-gradient(180deg, #f87171, #dc2626)'
                : `linear-gradient(180deg, rgba(0,122,255,${0.4 + (pct / 100) * 0.5}), rgba(0,122,255,0.2))`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${pct}%` }}
            transition={{ delay: i * 0.04, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          />
        ))}
      </div>

      {/* Bottom axis labels */}
      <div className="flex justify-between mt-2">
        {['Jan', 'Apr', 'Jul', 'Oct', 'Now'].map(l => (
          <span key={l} className="text-[10px] text-white/20 font-mono">{l}</span>
        ))}
      </div>
    </motion.div>
  );
}

export function GrowthTreeCard({ growth = 25, revenue = 1000000 }: { growth?: number; revenue?: number }) {
  const isPositive = growth > 0;
  const segments = [
    { label: 'Revenue', pct: Math.min(100, (revenue / 2000000) * 100), color: '#007AFF' },
    { label: 'Growth', pct: Math.min(100, Math.abs(growth) * 3), color: isPositive ? '#34d399' : '#f87171' },
    { label: 'Efficiency', pct: 68, color: '#a855f7' },
    { label: 'Health', pct: 75, color: '#f59e0b' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="apple-card h-80 overflow-hidden bg-[#0A0A0B] border-white/5 p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-black uppercase tracking-widest text-white/40">Business Growth</span>
      </div>

      <div className="flex items-end justify-between mb-6">
        <p className={`text-3xl font-black tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? '+' : ''}{growth}%
        </p>
        <span className="text-white/20 text-xs">Growth Rate</span>
      </div>

      {/* Horizontal metric bars */}
      <div className="space-y-4">
        {segments.map(({ label, pct, color }, i) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-white/30 font-mono">{label}</span>
              <span className="text-xs font-bold" style={{ color }}>{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function Dashboard3DSection({ revenue = 500000, growth = 15, expenses = 300000, profit = 200000 }: Dashboard3DSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <RevenueFlowCard revenue={revenue} growth={growth} />
      <GrowthTreeCard growth={growth} revenue={revenue} />
    </div>
  );
}

export default Dashboard3DSection;
