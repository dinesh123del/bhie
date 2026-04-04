import React from 'react';
import { motion } from 'framer-motion';

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
    line: ` ${height} rounded-lg bg-gradient-to-r from-slate-200/30 via-white/10 to-slate-200/30`,
    card: 'w-full h-48 rounded-2xl',
    circle: 'w-12 h-12 rounded-full',
    text: `${height} w-32 rounded`,
  };

  const shimmerGradient = {
    background: 'linear-gradient(90deg, hsl(210 25% 8%) 25%, hsl(210 25% 15%) 50%, hsl(210 25% 8%) 75%)',
    backgroundSize: '300% 100%',
    animation: animate ? 'shimmer 1.8s infinite linear, pulse-soft 2s infinite' : 'none',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${width} ${variantClasses[variant]} ${className} overflow-hidden relative`}
          style={shimmerGradient}
          initial={false}
          animate={animate ? { backgroundPosition: ['300% 0', '-300% 0'] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, delay: delay + i * 0.1 }}
        />
      ))}
    </>
  );
};

// Grid skeleton for lists/tables
export const SkeletonGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3 p-6">
        <ShimmerSkeleton variant="text" height="h-6" width="w-48" delay={i * 0.1} />
        <ShimmerSkeleton variant="line" height="h-4" width="w-3/4" delay={i * 0.1 + 0.1} />
        <ShimmerSkeleton variant="line" height="h-3" width="w-1/2" delay={i * 0.1 + 0.2} />
      </div>
    ))}
  </div>
);

// Page skeleton container
export const PageSkeleton: React.FC = () => (
  <div className="space-y-8 max-w-7xl mx-auto px-6 md:px-12 py-12">
    <div className="space-y-3">
      <ShimmerSkeleton variant="text" height="h-10" width="w-64" />
      <ShimmerSkeleton variant="line" height="h-4" width="w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-panel rounded-2xl p-8">
          <ShimmerSkeleton variant="circle" delay={i * 0.15} />
          <ShimmerSkeleton variant="line" height="h-4" className="mt-4 w-3/4" delay={i * 0.15 + 0.1} />
          <ShimmerSkeleton variant="line" height="h-3" className="w-1/2" delay={i * 0.15 + 0.2} />
        </div>
      ))}
    </div>
  </div>
);
