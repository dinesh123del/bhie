import { motion } from 'framer-motion';
import { useId } from 'react';

interface RingProps {
  size: number;
  progress: number;
  strokeWidth: number;
  label: string;
  colors: [string, string];
  glowColor: string;
  delay?: number;
  className?: string;
}

const clampProgress = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

const Ring = ({
  size,
  progress,
  strokeWidth,
  label,
  colors,
  glowColor,
  delay = 0,
  className = '',
}: RingProps) => {
  const safeProgress = clampProgress(progress);
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - safeProgress / 100);
  const gradientId = useId().replace(/:/g, '');
  const glowId = `ring-glow-${gradientId}`;
  const haloId = `ring-halo-${gradientId}`;
  const rotation = safeProgress * 3.6;
  const capSize = Math.max(5, strokeWidth / 3.4);

  return (
    <div className={className} aria-label={`${label} ${Math.round(safeProgress)} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <linearGradient id={`ring-gradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
          <radialGradient id={haloId}>
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius + strokeWidth / 2}
          fill={`url(#${haloId})`}
          opacity="0.35"
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#ring-gradient-${gradientId})`}
          strokeOpacity="0.28"
          strokeWidth={strokeWidth + 8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={`url(#${glowId})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{
            rotate: -90,
            transformOrigin: '50% 50%',
          }}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#ring-gradient-${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{
            rotate: -90,
            transformOrigin: '50% 50%',
            filter: `drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 0 24px ${glowColor})`,
          }}
        />

        <motion.circle
          cx={center}
          cy={center - radius}
          r={capSize}
          fill={colors[1]}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: rotation }}
          transition={{ duration: 1.4, delay: delay + 0.12, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transformOrigin: `${center}px ${center}px`,
            filter: `drop-shadow(0 0 10px ${glowColor})`,
          }}
        />
      </svg>
    </div>
  );
};

export default Ring;
