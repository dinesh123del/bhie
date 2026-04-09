import React from 'react';
import { motion } from 'framer-motion';

interface BizPlusLogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'wordmark';
  animated?: boolean;
  glowing?: boolean;
  className?: string;
}

export const BizPlusIcon: React.FC<{ size: number; animated?: boolean; glowing?: boolean }> = ({ 
  size, 
  animated = true,
  glowing = true 
}) => {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* ── Background Glow ────────────────────────────────────────── */}
      {glowing && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            filter: 'blur(12px)',
          }}
          animate={animated ? {
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* ── SVG Logo Symbol ────────────────────────────────────────── */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="bizplus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="bizplus-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Path (Intelligence Mesh) */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#bizplus-gradient)"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          initial={animated ? { rotate: 0 } : {}}
          animate={animated ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Sophisticated 'B' Symbol with Negative Space 'Plus' */}
        <motion.path
          d="M35 25V75H55C66.0457 75 75 66.0457 75 55C75 49.3396 72.6451 44.2373 68.8787 40.5905C72.0463 37.4704 74 33.102 74 28.25C74 19.8277 67.1723 13 58.75 13H55"
          stroke="url(#bizplus-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={glowing ? "url(#bizplus-glow)" : ""}
          initial={animated ? { pathLength: 0, opacity: 0 } : {}}
          animate={animated ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Inner Plus Symbol (integrated into the design) */}
        <motion.path
          d="M48 50H62M55 43V57"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={animated ? { scale: 0, opacity: 0 } : {}}
          animate={animated ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.6, type: 'spring' }}
        />
      </svg>
    </div>
  );
};

const BizPlusLogo: React.FC<BizPlusLogoProps> = ({ 
  size = 40, 
  variant = 'full', 
  animated = true,
  glowing = true,
  className = "" 
}) => {
  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      {(variant === 'full' || variant === 'icon') && (
        <BizPlusIcon size={size} animated={animated} glowing={glowing} />
      )}
      
      {(variant === 'full' || variant === 'wordmark') && (
        <div className="flex flex-col">
          <motion.div
            className="flex items-baseline"
            initial={animated ? { opacity: 0, x: -10 } : {}}
            animate={animated ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span 
              className="text-white font-black tracking-tight uppercase"
              style={{ fontSize: size * 0.75, lineHeight: 1 }}
            >
              BIZ
            </span>
            <span 
              className="font-black tracking-widest uppercase ml-1"
              style={{ 
                fontSize: size * 0.75, 
                lineHeight: 1,
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Plus
            </span>
          </motion.div>
          {variant === 'full' && (
            <motion.span 
              className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 -mt-1"
              initial={animated ? { opacity: 0 } : {}}
              animate={animated ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 1 }}
            >
              Economic Intel
            </motion.span>
          )}
        </div>
      )}
    </div>
  );
};

export default BizPlusLogo;
