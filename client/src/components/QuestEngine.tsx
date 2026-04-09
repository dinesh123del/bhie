import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Trophy,
  Star,
  Zap,
  Target,
  Cpu,
  Settings,
  Activity,
  ShieldCheck,
  TrendingUp,
  Search,
  Layers
} from 'lucide-react';
import { PremiumCard, PremiumBadge } from './ui/PremiumComponents';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from './GamificationEngine';

/* ──────────────────────────────────────────────────────────────
   BIZ PLUS QUEST ENGINE v2
   ─ Enhanced with Micro-Engine Animations
   ─ Advanced Task Tracking
   ─ Premium Celebration Effects
   ─────────────────────────────────────────────────────────────── */

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: React.ReactNode;
  completed: boolean;
  type: 'VISIT' | 'ACTION' | 'MILESTONE';
  category?: 'AI' | 'SECURITY' | 'FINANCE' | 'SYSTEM';
}

const QUEST_STORAGE_KEY = 'aera_quests_v2';

export default function QuestEngine() {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [showCelebration, setShowCelebration] = useState<Quest | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  // Initialize Quests
  useEffect(() => {
    const defaultQuests: Quest[] = [
      {
        id: 'WELCOME',
        title: 'System Boot',
        description: 'Explore the dashboard for the first time.',
        xp: 50,
        icon: <Zap className="h-4 w-4" />,
        completed: false,
        type: 'VISIT',
        category: 'SYSTEM'
      },
      {
        id: 'FIRST_UPLOAD',
        title: 'Data Ingestion',
        description: 'Upload your first invoice or bill.',
        xp: 150,
        icon: <Target className="h-4 w-4" />,
        completed: false,
        type: 'ACTION',
        category: 'FINANCE'
      },
      {
        id: 'AI_ANALYSIS',
        title: 'Neural Sync',
        description: 'Perform your first AI document analysis.',
        xp: 200,
        icon: <Cpu className="h-4 w-4" />,
        completed: false,
        type: 'ACTION',
        category: 'AI'
      },
      {
        id: 'ANALYTICS_CHECK',
        title: 'Growth Matrix',
        description: 'Review your business growth in analytics.',
        xp: 100,
        icon: <Star className="h-4 w-4" />,
        completed: false,
        type: 'VISIT',
        category: 'FINANCE'
      },
      {
        id: 'SECURITY_CHECK',
        title: 'Shield Protocol',
        description: 'Visit your security & profile settings.',
        xp: 75,
        icon: <ShieldCheck className="h-4 w-4" />,
        completed: false,
        type: 'VISIT',
        category: 'SECURITY'
      },
    ];

    const saved = localStorage.getItem(QUEST_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Quest[];
        const synced = defaultQuests.map(dq => {
          const matching = parsed.find(p => p.id === dq.id);
          return matching ? { ...dq, completed: matching.completed } : dq;
        });
        setQuests(synced);
      } catch (e) {
        setQuests(defaultQuests);
      }
    } else {
      setQuests(defaultQuests);
    }
  }, []);

  // Completion logic
  const completeQuest = useCallback((id: string) => {
    setQuests(prev => {
      const q = prev.find(item => item.id === id);
      if (q && !q.completed) {
        const updated = prev.map(item => item.id === id ? { ...item, completed: true } : item);
        localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(updated));
        setShowCelebration(q);
        addXP(q.xp);
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 2000);
        setTimeout(() => setShowCelebration(null), 4000);
        return updated;
      }
      return prev;
    });
  }, [addXP]);

  // Check conditions automatically
  useEffect(() => {
    const path = window.location.pathname;

    // 1. Dashboard Welcome
    if (path.includes('/dashboard')) {
      completeQuest('WELCOME');
    }
    // 2. First Upload check via user usageCount
    if (user && user.usageCount > 0) {
      completeQuest('FIRST_UPLOAD');
    }
    // 3. Analytics check
    if (path.includes('/analytics')) {
      completeQuest('ANALYTICS_CHECK');
    }
    // 4. AI Analysis check
    if (path.includes('/ai-analysis')) {
      completeQuest('AI_ANALYSIS');
    }
    // 5. Security check
    if (path.includes('/settings') || path.includes('/profile')) {
      completeQuest('SECURITY_CHECK');
    }
  }, [user, completeQuest]);

  const completedCount = quests.filter(q => q.completed).length;
  const progress = quests.length > 0 ? (completedCount / quests.length) * 100 : 0;

  // Sorting quests: uncompleted first
  const sortedQuests = useMemo(() => {
    return [...quests].sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
  }, [quests]);

  return (
    <div className="relative">
      <AnimatePresence>
        {showCelebration && (
          <>
            {/* Particle Fountain */}
            <motion.div
              className="fixed bottom-24 right-24 z-[9998] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0 }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.8) * 400,
                    scale: [0, 1, 0.5, 0],
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 100, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -100, filter: 'blur(10px)' }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="fixed bottom-12 right-12 z-[9999] pointer-events-none"
            >
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-6 rounded-[2rem] shadow-[0_20px_80px_rgba(79,70,229,0.6)] border border-white/30 backdrop-blur-xl relative overflow-hidden">
                {/* Particle backgrounds */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
                />

                <div className="relative z-10 flex items-center gap-5">
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md shadow-inner border border-white/10">
                    <Trophy className="h-10 w-10 text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200/80 mb-1">Engine Synchronized</p>
                    <p className="text-2xl font-black mb-1">{showCelebration.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-black/20 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-white">+{showCelebration.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PremiumCard className="overflow-hidden border border-white/10 p-0 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: isRotating ? 360 : 0,
                    boxShadow: isRotating ? "0 0 20px rgba(99, 102, 241, 0.4)" : "none"
                  }}
                  transition={{ duration: 2, ease: "circInOut" }}
                  className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20"
                >
                  <Settings className="h-6 w-6 text-indigo-400" />
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-500 blur-xl -z-10 rounded-full"
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Lvl 1</span>
                  <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 w-1/3" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Quest Engine
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-emerald-400"
                  />
                </h3>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <motion.span
                  key={completedCount}
                  initial={{ scale: 1.5, y: -10, color: '#818cf8' }}
                  animate={{ scale: 1, y: 0, color: '#ffffff' }}
                  className="text-4xl font-black leading-none"
                >
                  {completedCount}
                </motion.span>
                <span className="text-sm font-bold text-white/30 uppercase">/ {quests.length}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 mt-1">Status Active</p>
            </div>
          </div>

          <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </motion.div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {sortedQuests.map((quest, idx) => (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`relative group p-4 rounded-2xl border transition-all duration-500 ${quest.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-indigo-500/30'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`relative p-3 rounded-xl transition-all duration-500 ${quest.completed
                        ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                        : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20'
                      }`}>
                      {quest.completed ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        quest.icon
                      )}

                      {!quest.completed && (
                        <motion.div
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-indigo-400/20 rounded-xl blur-md"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`font-bold text-sm truncate ${quest.completed ? 'text-emerald-200/60 line-through' : 'text-white group-hover:text-indigo-200'}`}>
                          {quest.title}
                        </p>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${quest.completed
                            ? 'border-emerald-500/30 text-emerald-400/80 bg-emerald-500/10'
                            : 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
                          }`}>
                          {quest.xp} XP
                        </div>
                      </div>
                      <p className={`text-xs transition-colors duration-500 ${quest.completed ? 'text-emerald-300/30' : 'text-white/40 group-hover:text-white/60'}`}>
                        {quest.description}
                      </p>
                    </div>

                    {/* Progress indicator micro-asset */}
                    {!quest.completed && (
                      <div className="hidden sm:flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Activity className="h-3 w-3 text-indigo-400" />
                      </div>
                    )}
                  </div>

                  {/* Shimmer on hover for uncompleted */}
                  {!quest.completed && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Stats Line */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3 w-3" />
              <span>Layer 02 Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              <span>Efficiency 98%</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Search className="h-3 w-3 text-white/20" />
            <span className="text-[10px] font-black uppercase text-white/20">V.2.0.4</span>
          </div>
        </div>
      </PremiumCard>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}} />
    </div>
  );
}

