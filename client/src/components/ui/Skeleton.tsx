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
    card: 'w-full h-48 rounded-[2rem]',
    circle: 'w-12 h-12 rounded-full',
    text: `${height} w-32 rounded`,
  };

  const shimmerColors = {
    base: 'rgba(255, 255, 255, 0.03)',
    highlight: 'rgba(255, 255, 255, 0.12)',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`${width} ${variantClasses[variant]} ${className} relative overflow-hidden bg-white/[0.04] backdrop-blur-sm border border-white/5`}
        >
          {animate && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay + i * 0.1
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg, transparent 0%, ${shimmerColors.highlight} 50%, transparent 100%)`,
              }}
            />
          )}
        </div>
      ))}
    </>
  );
};

export const AnimatedText: React.FC<{ children: string; className?: string }> = ({ children, className = '' }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={children}
      initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)', scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`inline-block font-semibold ${className}`}
    >
      {children}
    </motion.span>
  </AnimatePresence>
);

export const PremiumSkeletonCard: React.FC = () => (
  <div className="rounded-[2.5rem] bg-white/[0.04] p-8 border border-white/10 space-y-6 backdrop-blur-xl">
    <div className="flex items-center gap-4">
      <ShimmerSkeleton variant="circle" />
      <div className="space-y-2 flex-1">
        <ShimmerSkeleton variant="text" height="h-6" width="w-2/3" />
        <ShimmerSkeleton variant="line" height="h-3" width="w-1/3" />
      </div>
    </div>
    <div className="space-y-3 pt-2">
      <ShimmerSkeleton variant="line" width="w-full" height="h-4" />
      <ShimmerSkeleton variant="line" width="w-full" height="h-4" />
      <ShimmerSkeleton variant="line" width="w-4/5" height="h-4" />
    </div>
    <div className="pt-4">
      <ShimmerSkeleton variant="line" width="w-32" height="h-10" className="rounded-xl" />
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <PremiumSkeletonCard key={i} />
    ))}
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="space-y-12 max-w-7xl mx-auto px-6 md:px-12 py-12">
    <div className="space-y-4 max-w-2xl">
      <ShimmerSkeleton variant="text" height="h-12" width="w-2/3" />
      <ShimmerSkeleton variant="line" height="h-5" width="w-full" />
      <ShimmerSkeleton variant="line" height="h-5" width="w-4/5" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <PremiumSkeletonCard key={i} />
      ))}
    </div>
  </div>
);
