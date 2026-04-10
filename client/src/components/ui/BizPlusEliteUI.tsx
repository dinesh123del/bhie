import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { PremiumCard, PremiumButton } from './PremiumComponents';

const spring = { type: 'spring', stiffness: 200, damping: 20 };

// 1. Skeleton Loading (Glassmorphic Shimmer)
export const SkeletonCard: React.FC<{ height?: string }> = ({ height = 'h-32' }) => (
  <div className={`relative overflow-hidden rounded-[2rem] bg-white/[0.03] border border-white/5 ${height} w-full`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

export const SkeletonText: React.FC<{ width?: string }> = ({ width = 'w-3/4' }) => (
  <div className={`h-3 ${width} rounded-full bg-white/[0.05] overflow-hidden relative mb-2`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

// 2. Elite Empty State
export const EliteEmptyState: React.FC<{
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, icon: Icon, actionLabel, onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-12 text-center"
  >
    <div className="relative mb-8">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 backdrop-blur-xl"
      >
        <Icon className="w-10 h-10 text-indigo-400" />
      </motion.div>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-4 -right-4"
      >
        <Sparkles className="w-6 h-6 text-indigo-300/40" />
      </motion.div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h3>
    <p className="text-white/40 text-sm max-w-xs mb-8 leading-relaxed italic">
      "{description}"
    </p>
    {actionLabel && (
      <PremiumButton onClick={onAction} icon={<ArrowRight className="w-4 h-4" />}>
        {actionLabel}
      </PremiumButton>
    )}
  </motion.div>
);

// 3. Intelligent Dynamic Message (Notification Retention Engine)
export const IntelligentMessage: React.FC<{
  title: string;
  message: string;
  type?: 'insight' | 'warning' | 'achievement';
}> = ({ title, message, type = 'insight' }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: 50, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: -50, scale: 0.8 }}
    transition={spring}
    className="glass-card mb-4 group"
  >
    <div className="p-5 flex gap-4 items-start">
      <div className={`p-3 rounded-2xl ${
        type === 'insight' ? 'bg-[#00D4FF]/20 text-[#00D4FF]/10 text-[#00D4FF]' :
        type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
        'bg-emerald-500/10 text-emerald-400'
      }`}>
        <MessageCircle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-black uppercase tracking-widest text-white/40 mb-1">{title}</h4>
        <p className="text-white/90 text-sm font-medium leading-snug">{message}</p>
      </div>
    </div>
  </motion.div>
);

// 4. Onboarding Guide Step
export const OnboardingStep: React.FC<{
  step: number;
  total: number;
  title: string;
  description: string;
  onNext: () => void;
}> = ({ step, total, title, description, onNext }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
  >
    <PremiumCard className="max-w-md w-full border-indigo-500/30">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">
          Step {step} of {total}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1 w-4 rounded-full ${i < step ? 'bg-indigo-500' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>
      <h2 className="text-3xl font-black text-white mb-4 leading-none tracking-tighter">{title}</h2>
      <p className="text-white/60 mb-10 leading-relaxed font-medium">{description}</p>
      <PremiumButton className="w-full h-16 text-lg" onClick={onNext} icon={<ArrowRight className="w-5 h-5" />}>
        {step < total ? 'Continue Experience' : 'Get Started'}
      </PremiumButton>
    </PremiumCard>
  </motion.div>
);
