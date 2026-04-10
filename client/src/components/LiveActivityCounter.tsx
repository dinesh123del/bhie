"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Receipt, Clock, Zap, Activity, Globe, Wallet, type LucideIcon } from 'lucide-react';

interface LiveStat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  icon: LucideIcon;
  color: string;
  increment: number;
}

const INITIAL_STATS: LiveStat[] = [
  {
    id: 'users',
    label: 'Active Users Today',
    value: 2847,
    suffix: '',
    icon: Users,
    color: 'text-[#00D4FF]',
    increment: 3,
  },
  {
    id: 'receipts',
    label: 'Receipts Scanned',
    value: 12483,
    suffix: '',
    icon: Receipt,
    color: 'text-emerald-400',
    increment: 12,
  },
  {
    id: 'value',
    label: 'Value Tracked Today',
    value: 2.4,
    prefix: '₹',
    suffix: 'Cr',
    icon: Wallet,
    color: 'text-amber-400',
    increment: 0.1,
  },
  {
    id: 'time',
    label: 'Hours Saved Today',
    value: 847,
    suffix: 'hrs',
    icon: Clock,
    color: 'text-purple-400',
    increment: 2,
  },
];

const RECENT_ACTIVITY = [
  { action: 'scanned a receipt', amount: '₹2,499', time: '2s ago', location: 'Mumbai' },
  { action: 'generated report', amount: '', time: '5s ago', location: 'Delhi' },
  { action: 'added expense', amount: '₹450', time: '8s ago', location: 'Bangalore' },
  { action: 'exported data', amount: '', time: '12s ago', location: 'Chennai' },
  { action: 'scanned a receipt', amount: '₹1,299', time: '15s ago', location: 'Pune' },
];

export default function LiveActivityCounter() {
  const [stats, setStats] = useState<LiveStat[]>(INITIAL_STATS);
  const [pulse, setPulse] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update stats every few seconds
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => {
        const newValue = stat.value + stat.increment + (Math.random() * stat.increment);
        // Trigger pulse animation
        setPulse(stat.id);
        setTimeout(() => setPulse(null), 500);
        return {
          ...stat,
          value: stat.id === 'value' ? Math.round(newValue * 10) / 10 : Math.floor(newValue),
        };
      }));
    }, 4000);

    // Update time
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const formatNumber = (num: number, id: string) => {
    if (id === 'value') return num.toFixed(1);
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            animate={pulse === stat.id ? { scale: [1, 1.05, 1] } : {}}
            className="relative bg-white/5 rounded-2xl p-5 border border-white/10 overflow-hidden group hover:bg-white/10 transition-colors"
          >
            {/* Pulse Effect */}
            <AnimatePresence>
              {pulse === stat.id && (
                <motion.div
                  initial={{ opacity: 0.5, scale: 0 }}
                  animate={{ opacity: 0, scale: 2 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#00D4FF]/20 text-[#00D4FF]/20 rounded-2xl"
                />
              )}
            </AnimatePresence>

            <div className="relative z-10">
              <div className={`flex items-center gap-2 mb-3 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                  LIVE
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                {stat.prefix && (
                  <span className="text-lg text-white/50">{stat.prefix}</span>
                )}
                <span className="text-3xl font-black text-white">
                  {formatNumber(stat.value, stat.id)}
                </span>
                <span className="text-sm text-white/50">{stat.suffix}</span>
              </div>

              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </div>

            {/* Mini Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <motion.div
                className={`h-full ${stat.color.replace('text', 'bg')}`}
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-white font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            Live Activity
          </h4>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/40">Real-time</span>
          </div>
        </div>

        <div className="space-y-3">
          {RECENT_ACTIVITY.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                  {activity.location === 'Mumbai' ? '🏙️' :
                    activity.location === 'Delhi' ? '🏛️' :
                      activity.location === 'Bangalore' ? '🏢' :
                        activity.location === 'Chennai' ? '🌊' : '📍'}
                </div>
                <div>
                  <p className="text-white text-sm">
                    Someone in {activity.location} {activity.action}
                  </p>
                  {activity.amount && (
                    <span className="text-green-400 text-xs font-medium">
                      {activity.amount}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-white/30 text-xs">{activity.time}</span>
            </motion.div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              99.9% Uptime
            </span>
          </div>
          <div className="text-xs text-white/40">
            Updated live from India
          </div>
        </div>
      </div>

      {/* FOMO Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-blue-500/30 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
          <p className="text-white text-sm">
            <span className="font-bold">{stats[0].value.toLocaleString()}</span> businesses are tracking their finances right now
          </p>
        </div>
        <a
          href="/register"
          className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap"
        >
          Join Them
        </a>
      </motion.div>
    </div>
  );
}
