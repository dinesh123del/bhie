import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────────────────
   BHIE GAMIFICATION ENGINE
   ─ Daily Streak tracker
   ─ Level / Badge system (Beginner → Smart → Pro → Expert → Boss)
   ─ Celebration animation on milestones
   ─────────────────────────────────────────────────────────────── */

// ── Types ────────────────────────────────────────────────────
export interface UserLevel {
  name: 'Beginner' | 'Smart' | 'Pro' | 'Expert' | 'Boss';
  minDays: number;
  emoji: string;
  color: string;
  glow: string;
}

const LEVELS: UserLevel[] = [
  { name: 'Beginner', minDays: 0,  emoji: '🌱', color: 'text-emerald-400', glow: 'rgba(52,211,153,0.3)' },
  { name: 'Smart',    minDays: 3,  emoji: '⚡', color: 'text-sky-400',     glow: 'rgba(56,189,248,0.3)' },
  { name: 'Pro',      minDays: 7,  emoji: '🚀', color: 'text-indigo-400',  glow: 'rgba(99,102,241,0.4)' },
  { name: 'Expert',   minDays: 21, emoji: '💎', color: 'text-violet-400',  glow: 'rgba(167,139,250,0.4)' },
  { name: 'Boss',     minDays: 60, emoji: '👑', color: 'text-amber-400',   glow: 'rgba(251,191,36,0.4)' },
];

// ── Local storage helpers ─────────────────────────────────────
const STREAK_KEY = 'bhie_streak_data';

interface StreakData {
  currentStreak: number;
  lastCheckin: string | null;
  longestStreak: number;
  totalDays: number;
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as StreakData;
  } catch { /* ignore */ }
  return { currentStreak: 0, lastCheckin: null, longestStreak: 0, totalDays: 0 };
}

function saveStreak(data: StreakData) {
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function resolveLevel(days: number): UserLevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (days >= LEVELS[i].minDays) return LEVELS[i];
  }
  return LEVELS[0];
}

// ── Hook ──────────────────────────────────────────────────────
export function useStreak() {
  const [streak, setStreakState] = useState<StreakData>(() => loadStreak());
  const [celebrateLevel, setCelebrateLevel] = useState(false);

  const recordCheckin = useCallback(() => {
    const today = new Date().toDateString();
    setStreakState(prev => {
      const yesterday = new Date(Date.now() - 86_400_000).toDateString();
      let newStreak = 1;

      if (prev.lastCheckin === today) {
        // Already checked in today — no change
        return prev;
      } else if (prev.lastCheckin === yesterday) {
        newStreak = prev.currentStreak + 1;
      }
      // else: streak broken — reset to 1

      const oldLevel = resolveLevel(prev.totalDays);
      const newTotalDays = prev.totalDays + 1;
      const newLevel = resolveLevel(newTotalDays);

      if (oldLevel.name !== newLevel.name) {
        setCelebrateLevel(true);
        setTimeout(() => setCelebrateLevel(false), 3000);
      }

      const updated: StreakData = {
        currentStreak: newStreak,
        lastCheckin: today,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        totalDays: newTotalDays,
      };
      saveStreak(updated);
      return updated;
    });
  }, []);

  // Auto-checkin on mount (once per day)
  useEffect(() => { recordCheckin(); }, [recordCheckin]);

  const level = resolveLevel(streak.totalDays);

  return { streak, level, celebrateLevel, recordCheckin };
}

// ── Streak Badge Component ─────────────────────────────────────
interface StreakBadgeProps {
  compact?: boolean;
}

export function StreakBadge({ compact = false }: StreakBadgeProps) {
  const { streak, level, celebrateLevel } = useStreak();

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span className="animate-fire text-base">🔥</span>
        <span className="text-xs font-bold text-white/80">
          {streak.currentStreak}d
        </span>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {celebrateLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
          >
            <div
              className="px-4 py-2 rounded-2xl text-sm font-bold text-white text-center"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #9333EA)',
                boxShadow: '0 0 20px rgba(79,70,229,0.5)',
              }}
            >
              🎉 Level Up! You're {level.name} now!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex flex-col gap-3 p-4 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Streak row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-fire">🔥</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Daily Streak
              </p>
              <p className="text-2xl font-black text-white leading-none">
                {streak.currentStreak}
                <span className="text-sm font-semibold text-white/40 ml-1">days</span>
              </p>
            </div>
          </div>

          {/* Level badge */}
          <motion.div
            animate={{
              boxShadow: celebrateLevel
                ? [`0 0 0px ${level.glow}`, `0 0 20px ${level.glow}`, `0 0 0px ${level.glow}`]
                : `0 0 8px ${level.glow}`,
            }}
            transition={{ duration: 1.5, repeat: celebrateLevel ? Infinity : 0 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.10)` }}
          >
            <span className="text-base">{level.emoji}</span>
            <span className={`text-xs font-black ${level.color}`}>{level.name}</span>
          </motion.div>
        </div>

        {/* Progress bar to next level */}
        <NextLevelProgress totalDays={streak.totalDays} level={level} />
      </motion.div>
    </div>
  );
}

// ── Next Level Progress Bar ───────────────────────────────────
function NextLevelProgress({ totalDays, level }: { totalDays: number; level: UserLevel }) {
  const currentIdx = LEVELS.findIndex(l => l.name === level.name);
  const nextLevel  = LEVELS[currentIdx + 1];
  if (!nextLevel) {
    return (
      <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
        👑 Max rank achieved
      </p>
    );
  }
  const progress = Math.min(100, ((totalDays - level.minDays) / (nextLevel.minDays - level.minDays)) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">
          Next: {nextLevel.emoji} {nextLevel.name}
        </p>
        <p className="text-[10px] text-white/30 font-semibold">
          {nextLevel.minDays - totalDays}d left
        </p>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #4F46E5, #9333EA)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

// ── Human-tone Insight Renderer ──────────────────────────────
interface SmartInsightProps {
  revenue: number;
  profit: number;
  growthRate: number;
  expenseRatio: number;
  streak: number;
}

export function SmartInsight({ revenue, profit, growthRate, expenseRatio, streak }: SmartInsightProps) {
  const getMessage = () => {
    if (growthRate > 15) return `🚀 You're up ${growthRate.toFixed(0)}% — exceptional momentum. Keep it going.`;
    if (growthRate > 5)  return `📈 Up ${growthRate.toFixed(0)}% this period. Solid trajectory — keep optimizing.`;
    if (profit > 0)      return `✅ Profitable and stable. Watch expenses at ${expenseRatio.toFixed(0)}% — there's room to win.`;
    if (expenseRatio > 70) return `⚠️ Expenses at ${expenseRatio.toFixed(0)}% — that's eating margin. Time to tighten.`;
    return `💡 Your data is flowing in. Give it a moment and your insights will sharpen.`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-start gap-3 p-4 rounded-2xl"
      style={{
        background: 'rgba(79,70,229,0.06)',
        border: '1px solid rgba(79,70,229,0.15)',
      }}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-white/80 leading-relaxed">
          {getMessage()}
        </p>
        {streak >= 5 && (
          <p className="mt-1 text-xs text-indigo-400 font-semibold">
            🔥 {streak}-day streak! You're building a great habit.
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Milestone Celebration Overlay ─────────────────────────────
export function MilestoneCelebration({ show, message }: { show: boolean; message: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9000] pointer-events-none"
        >
          <div
            className="px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #9333EA)',
              boxShadow: '0 0 40px rgba(79,70,229,0.5), 0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
