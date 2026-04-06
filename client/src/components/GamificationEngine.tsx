import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Shield, Crown, Flame } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   Finly GAMIFICATION ENGINE v2.1 (Context Enabled)
   ─ Daily Streak tracker
   ─ Level / Badge system (XP Based)
   ─ Rank names: Recruit → Guardian → Sentinel → Overlord
   ─ Celebration animation on milestones
   ─────────────────────────────────────────────────────────────── */

// ── Types ────────────────────────────────────────────────────
export interface UserLevel {
  name: string;
  minXP: number;
  emoji: string;
  color: string;
  glow: string;
}

const LEVELS: UserLevel[] = [
  { name: 'Recruit',     minXP: 0,      emoji: '🌱', color: 'text-emerald-400', glow: 'rgba(52,211,153,0.3)' },
  { name: 'Strategist',  minXP: 500,    emoji: '⚡', color: 'text-sky-400',     glow: 'rgba(56,189,248,0.3)' },
  { name: 'Sentinel',    minXP: 1500,   emoji: '🛡️', color: 'text-indigo-400',  glow: 'rgba(99,102,241,0.4)' },
  { name: 'Analyst Pro', minXP: 3000,   emoji: '💎', color: 'text-violet-400',  glow: 'rgba(167,139,250,0.4)' },
  { name: 'Overlord',    minXP: 6000,   emoji: '👑', color: 'text-amber-400',   glow: 'rgba(251,191,36,0.4)' },
];

// ── Local storage helpers ─────────────────────────────────────
const STREAK_KEY = 'finly_streak_data_v2';

interface ProgressData {
  currentStreak: number;
  lastCheckin: string | null;
  longestStreak: number;
  totalDays: number;
  xp: number;
}

interface GamificationContextType {
  progress: ProgressData;
  level: UserLevel;
  nextLevel: UserLevel | null;
  celebrateLevel: boolean;
  addXP: (amount: number) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as ProgressData;
  } catch { /* ignore */ }
  return { currentStreak: 0, lastCheckin: null, longestStreak: 0, totalDays: 0, xp: 0 };
}

function saveProgress(data: ProgressData) {
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function resolveLevel(xp: number): UserLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

// ── Provider ──────────────────────────────────────────────────
export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgressState] = useState<ProgressData>(() => loadProgress());
  const [celebrateLevel, setCelebrateLevel] = useState(false);

  const addXP = useCallback((amount: number) => {
    setProgressState(prev => {
      const oldLevel = resolveLevel(prev.xp);
      const newXP = prev.xp + amount;
      const newLevel = resolveLevel(newXP);

      if (oldLevel.name !== newLevel.name) {
        setCelebrateLevel(true);
        setTimeout(() => setCelebrateLevel(false), 5000);
      }

      const updated = { ...prev, xp: newXP };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const recordCheckin = useCallback(() => {
    const today = new Date().toDateString();
    setProgressState(prev => {
      const yesterday = new Date(Date.now() - 86_400_000).toDateString();
      let newStreak = 1;

      if (prev.lastCheckin === today) return prev;
      if (prev.lastCheckin === yesterday) newStreak = prev.currentStreak + 1;

      const dailyBonus = 50;
      const streakBonus = newStreak * 10;
      const totalXP = prev.xp + dailyBonus + streakBonus;

      const updated: ProgressData = {
        ...prev,
        currentStreak: newStreak,
        lastCheckin: today,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        totalDays: prev.totalDays + 1,
        xp: totalXP
      };
      
      saveProgress(updated);
      return updated;
    });
  }, []);

  useEffect(() => { recordCheckin(); }, [recordCheckin]);

  const level = useMemo(() => resolveLevel(progress.xp), [progress.xp]);
  const nextLevel = LEVELS[LEVELS.findIndex(l => l.name === level.name) + 1] || null;

  const value = useMemo(() => ({
    progress,
    level,
    nextLevel,
    celebrateLevel,
    addXP
  }), [progress, level, nextLevel, celebrateLevel, addXP]);

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

// ── Gaming HUD Component ─────────────────────────────────────
export function GamingHUD() {
  const { progress, level, nextLevel, celebrateLevel } = useGamification();

  const percentage = useMemo(() => {
    if (!nextLevel) return 100;
    const currentLevelMin = level.minXP;
    const nextLevelMin = nextLevel.minXP;
    return ((progress.xp - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
  }, [progress.xp, level, nextLevel]);

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {celebrateLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-2xl border border-white/20"
          >
            <div className="flex items-center gap-3 text-white">
              <Trophy className="h-6 w-6 text-amber-300" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none">Rank Up!</p>
                <p className="text-xl font-black">{level.name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.02, x: -4 }}
        className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl min-w-[200px]"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
              <span className="text-lg">{level.emoji}</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 leading-none">Rank</p>
              <p className={`text-sm font-black ${level.color}`}>{level.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-white leading-none">{progress.xp}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total XP</p>
          </div>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
          />
        </div>
        {nextLevel && (
          <p className="text-[9px] font-bold text-white/20 mt-1 uppercase tracking-widest">
            {Math.ceil(nextLevel.minXP - progress.xp)} XP to {nextLevel.name}
          </p>
        )}
      </motion.div>
    </div>
  );
}

// ── Streak Badge Component ─────────────────────────────────────
export function StreakBadge({ compact = false }: { compact?: boolean }) {
  const { progress } = useGamification();

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
      >
        <Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
        <span className="text-xs font-bold text-white/80">{progress.currentStreak}d</span>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
          <Flame className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Day Streak</p>
          <p className="text-2xl font-black text-white leading-none">{progress.currentStreak}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Best</p>
        <p className="text-lg font-black text-white/60 leading-none">{progress.longestStreak}</p>
      </div>
    </div>
  );
}

// ── Achievement Badge Component ─────────────────────────────────────
export function BadgeRow({ totalRecords, healthScore, revenue }: { totalRecords: number, healthScore: number, revenue: number }) {
  const badges = [
    { name: 'Founder', icon: '💎', active: true, desc: 'Early Finly Adopter' },
    { name: 'Data King', icon: '👑', active: totalRecords >= 100, desc: '100+ Records' },
    { name: 'Efficiency', icon: '⚡', active: healthScore >= 90, desc: '90+ Health Score' },
    { name: 'Capitalist', icon: '💰', active: revenue >= 50000, desc: '50k+ Revenue' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {badges.map(badge => (
        <motion.div
          key={badge.name}
          whileHover={{ y: -5, scale: 1.05 }}
          className={`p-3 rounded-2xl border flex items-center gap-3 transition-all duration-500 ${
            badge.active 
              ? 'bg-indigo-500/10 border-indigo-500/20 shadow-[0_10px_20px_rgba(99,102,241,0.1)]' 
              : 'bg-white/[0.02] border-white/5 opacity-30 grayscale'
          }`}
        >
          <span className="text-2xl">{badge.icon}</span>
          <div className="hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{badge.name}</p>
            <p className="text-[9px] text-white/40 font-medium">{badge.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── SmartInsight ─────────────────────────────────────────────
export function SmartInsight({ streak }: { streak: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10"
    >
      <p className="text-sm font-semibold text-white/80 leading-relaxed">
        {streak >= 5 
          ? `🔥 You're on a roll with a ${streak}-day streak! Your data engine is optimizing at 98% efficiency.` 
          : "💡 Keep up the daily check-ins to boost your business health score and earn more XP."}
      </p>
    </motion.div>
  );
}

