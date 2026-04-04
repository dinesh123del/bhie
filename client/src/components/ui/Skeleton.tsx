import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  count?: number;
  variant?: 'line' | 'card' | 'circle' | 'text';
  animate?: boolean;
  delay?: number;
}

export const ShimmerSkeleton: React.FC<SkeletonProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  count = 1,
  variant = 'line',
  animate = true,
  delay = 0,
}) => {
  const variantClasses = {
    line: ` ${height} rounded-lg`,
    card: 'w-full h-48 rounded-2xl',
    circle: 'w-12 h-12 rounded-full',
    text: `${height} w-32 rounded`,
  };

  const shimmerGradient = {
    background: 'linear-gradient(90deg, hsl(210 25% 8%) 25%, hsl(210 25% 15%) 50%, hsl(210 25% 8%) 75%)',
    backgroundSize: '300% 100%',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${width} ${variantClasses[variant]} ${className} overflow-hidden relative shadow-inner`}
          style={shimmerGradient}
          initial={false}
          animate={animate ? { backgroundPosition: ['300% 0', '-300% 0'] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: delay + i * 0.1 }}
        />
      ))}
    </>
  );
};

export const AnimatedText: React.FC<{ children: string; className?: string }> = ({ children, className = '' }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={children}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`inline-block font-semibold ${className}`}
    >
      {children}
    </motion.span>
  </AnimatePresence>
);

export const PremiumSkeletonCard: React.FC = () => (
  <div className="rounded-[2.5rem] bg-white/[0.04] p-8 border border-white/10 space-y-4">
    <ShimmerSkeleton variant="circle" />
    <ShimmerSkeleton variant="text" height="h-8" width="w-3/4" />
    <div className="space-y-2 pt-2">
      <ShimmerSkeleton variant="line" width="w-full" />
      <ShimmerSkeleton variant="line" width="w-1/2" />
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3 p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
        <ShimmerSkeleton variant="text" height="h-6" width="w-48" delay={i * 0.1} />
        <ShimmerSkeleton variant="line" height="h-4" width="w-3/4" delay={i * 0.1 + 0.1} />
      </div>
    ))}
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-8 max-w-7xl mx-auto px-6 md:px-12 py-12">
    <div className="space-y-3">
      <ShimmerSkeleton variant="text" height="h-10" width="w-64" />
      <ShimmerSkeleton variant="line" height="h-4" width="w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <PremiumSkeletonCard key={i} />
      ))}
    </div>
  </div>
);
