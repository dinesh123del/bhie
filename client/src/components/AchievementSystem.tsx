"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  Crown,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Star,
  Gift,
  Medal,
  Award,
  Crown as CrownIcon
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  category: 'revenue' | 'savings' | 'streak' | 'milestone' | 'special';
}

interface AchievementState {
  achievements: Achievement[];
  totalXP: number;
  recentlyUnlocked: Achievement[];
  showCelebration: boolean;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'current' | 'unlocked' | 'unlockedAt'>[] = [
  // Revenue Achievements
  {
    id: 'first_sale',
    title: 'First Steps',
    description: 'Record your first sale',
    icon: <Wallet className="w-6 h-6" />,
    color: '#34C759',
    requirement: 1,
    rarity: 'common',
    xpReward: 100,
    category: 'revenue'
  },
  {
    id: 'revenue_10k',
    title: '10K Club',
    description: 'Reach ₹10,000 in revenue',
    icon: <TrendingUp className="w-6 h-6" />,
    color: '#007AFF',
    requirement: 10000,
    rarity: 'common',
    xpReward: 200,
    category: 'revenue'
  },
  {
    id: 'revenue_1lakh',
    title: 'Lakh Lap',
    description: 'Cross ₹1,00,000 revenue milestone',
    icon: <Trophy className="w-6 h-6" />,
    color: '#AF52DE',
    requirement: 100000,
    rarity: 'rare',
    xpReward: 500,
    category: 'revenue'
  },
  {
    id: 'revenue_10lakh',
    title: 'Deca-Dominator',
    description: 'Achieve ₹10,00,000 in total revenue',
    icon: <CrownIcon className="w-6 h-6" />,
    color: '#FF9500',
    requirement: 1000000,
    rarity: 'epic',
    xpReward: 1000,
    category: 'revenue'
  },
  {
    id: 'revenue_1crore',
    title: 'Crore Champion',
    description: 'Become a Crorepati business owner!',
    icon: <Crown className="w-6 h-6" />,
    color: '#FFD700',
    requirement: 10000000,
    rarity: 'legendary',
    xpReward: 5000,
    category: 'revenue'
  },
  
  // Streak Achievements
  {
    id: 'streak_3',
    title: 'Getting Consistent',
    description: '3-day login streak',
    icon: <Flame className="w-6 h-6" />,
    color: '#FF6B35',
    requirement: 3,
    rarity: 'common',
    xpReward: 150,
    category: 'streak'
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: '7-day login streak',
    icon: <Zap className="w-6 h-6" />,
    color: '#FF9500',
    requirement: 7,
    rarity: 'rare',
    xpReward: 300,
    category: 'streak'
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: '30-day login streak',
    icon: <Star className="w-6 h-6" />,
    color: '#AF52DE',
    requirement: 30,
    rarity: 'epic',
    xpReward: 1000,
    category: 'streak'
  },
  
  // Savings Achievements
  {
    id: 'save_10k',
    title: 'Smart Saver',
    description: 'Save ₹10,000 in a month',
    icon: <PiggyBank className="w-6 h-6" />,
    color: '#34C759',
    requirement: 10000,
    rarity: 'rare',
    xpReward: 400,
    category: 'savings'
  },
  {
    id: 'save_50k',
    title: 'Financial Wizard',
    description: 'Save ₹50,000 in a month',
    icon: <Gift className="w-6 h-6" />,
    color: '#007AFF',
    requirement: 50000,
    rarity: 'epic',
    xpReward: 800,
    category: 'savings'
  },
  
  // Special Achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Check in before 7 AM',
    icon: <Sparkles className="w-6 h-6" />,
    color: '#FFD700',
    requirement: 1,
    rarity: 'rare',
    xpReward: 250,
    category: 'special'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Check in after 11 PM',
    icon: <Star className="w-6 h-6" />,
    color: '#5856D6',
    requirement: 1,
    rarity: 'rare',
    xpReward: 250,
    category: 'special'
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Record transactions every day for a week',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: '#34C759',
    requirement: 7,
    rarity: 'epic',
    xpReward: 600,
    category: 'milestone'
  }
];

const RARITY_COLORS = {
  common: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-[#C0C0C0]' },
  rare: { bg: 'bg-[#00D4FF]/20 text-[#00D4FF]/10', border: 'border-blue-500/20', text: 'text-[#00D4FF]' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' }
};

export function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load achievements from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bizplus_achievements');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAchievements(parsed.achievements || []);
      setTotalXP(parsed.totalXP || 0);
    } else {
      // Initialize achievements
      const initial = ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        current: 0,
        unlocked: false
      }));
      setAchievements(initial);
    }
  }, []);

  // Save achievements
  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem('bizplus_achievements', JSON.stringify({
        achievements,
        totalXP
      }));
    }
  }, [achievements, totalXP]);

  // Simulate checking achievements (in real app, this would come from user data)
  const checkAchievements = useCallback(() => {
    // This is a demo - in production, you'd check against real user metrics
    const demoMetrics = {
      totalRevenue: 150000,
      currentStreak: 5,
      monthlySavings: 25000,
      totalTransactions: 150
    };

    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.unlocked) return achievement;

        let current = achievement.current;
        let shouldUnlock = false;

        switch (achievement.category) {
          case 'revenue':
            current = demoMetrics.totalRevenue;
            shouldUnlock = current >= achievement.requirement;
            break;
          case 'streak':
            current = demoMetrics.currentStreak;
            shouldUnlock = current >= achievement.requirement;
            break;
          case 'savings':
            current = demoMetrics.monthlySavings;
            shouldUnlock = current >= achievement.requirement;
            break;
          case 'milestone':
            current = demoMetrics.totalTransactions;
            shouldUnlock = current >= achievement.requirement;
            break;
        }

        if (shouldUnlock && !achievement.unlocked) {
          // Trigger celebration
          setTimeout(() => {
            setCelebratingAchievement({ ...achievement, current, unlocked: true, unlockedAt: new Date() });
            setShowCelebration(true);
            setTotalXP(xp => xp + achievement.xpReward);
          }, 100);

          return {
            ...achievement,
            current,
            unlocked: true,
            unlockedAt: new Date()
          };
        }

        return { ...achievement, current };
      });

      return updated;
    });
  }, []);

  useEffect(() => {
    // Check achievements on mount
    checkAchievements();
  }, [checkAchievements]);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  const categories = [
    { id: 'all', label: 'All', count: achievements.length },
    { id: 'revenue', label: 'Revenue', count: achievements.filter(a => a.category === 'revenue').length },
    { id: 'streak', label: 'Streaks', count: achievements.filter(a => a.category === 'streak').length },
    { id: 'savings', label: 'Savings', count: achievements.filter(a => a.category === 'savings').length },
    { id: 'milestone', label: 'Milestones', count: achievements.filter(a => a.category === 'milestone').length },
    { id: 'special', label: 'Special', count: achievements.filter(a => a.category === 'special').length }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && celebratingAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center p-8"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-8xl mb-4"
              >
                {celebratingAchievement.icon}
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold text-white mb-2"
              >
                Achievement Unlocked!
              </motion.h2>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-2xl font-semibold" style={{ color: celebratingAchievement.color }}>
                  {celebratingAchievement.title}
                </p>
                <p className="text-[#C0C0C0]">{celebratingAchievement.description}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">+{celebratingAchievement.xpReward} XP</span>
                </div>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setShowCelebration(false)}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-semibold hover:scale-105 transition-transform"
              >
                Awesome!
              </motion.button>
            </motion.div>

            {/* Confetti particles */}
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: -10
                }}
                animate={{
                  y: window.innerHeight + 20,
                  x: (Math.random() - 0.5) * 200,
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: 0,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Achievements
            </h2>
            <p className="text-[#C0C0C0] mt-1">
              {unlockedCount} of {achievements.length} unlocked • {totalXP} XP earned
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{Math.round(progressPercentage)}%</div>
            <div className="text-sm text-[#C0C0C0]">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#00D4FF]/20 text-[#00D4FF] text-white'
                : 'bg-white/5 text-[#C0C0C0] hover:bg-white/10'
            }`}
          >
            {cat.label}
            <span className="ml-2 text-xs opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement, index) => {
          const rarityStyle = RARITY_COLORS[achievement.rarity];
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-4 rounded-xl border transition-all ${
                achievement.unlocked
                  ? `${rarityStyle.bg} ${rarityStyle.border}`
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              {/* Rarity Badge */}
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium uppercase ${rarityStyle.bg} ${rarityStyle.text}`}>
                {achievement.rarity}
              </div>

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    achievement.unlocked
                      ? 'bg-white/10'
                      : 'bg-white/5'
                  }`}
                  style={{ color: achievement.unlocked ? achievement.color : '#6B7280' }}
                >
                  {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-[#C0C0C0] mt-0.5">{achievement.description}</p>

                  {/* Progress */}
                  {!achievement.unlocked && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{achievement.current.toLocaleString()}</span>
                        <span>{achievement.requirement.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-600 rounded-full"
                          style={{
                            width: `${Math.min(100, (achievement.current / achievement.requirement) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked Info */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </span>
                      <span className="text-yellow-400 ml-auto">+{achievement.xpReward} XP</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span>Common</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#00D4FF]/20 text-[#00D4FF]" />
          <span>Rare</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Epic</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Legendary</span>
        </div>
      </div>
    </div>
  );
}

export default AchievementSystem;
