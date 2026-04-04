import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  className?: string;
  to?: string;
  subtitle?: string;
  showSubtitle?: boolean;
  glow?: boolean;
}

const sizeMap: Record<LogoSize, {
  shell: string;
  mark: string;
  wordmark: string;
  subtitle: string;
  gap: string;
}> = {
  sm: {
    shell: 'px-2.5 py-2 rounded-2xl',
    mark: 'h-10 w-10',
    wordmark: 'text-lg',
    subtitle: 'text-[10px]',
    gap: 'gap-2.5',
  },
  md: {
    shell: 'px-3 py-2.5 rounded-[1.4rem]',
    mark: 'h-12 w-12',
    wordmark: 'text-2xl',
    subtitle: 'text-[11px]',
    gap: 'gap-3',
  },
  lg: {
    shell: 'px-4 py-3 rounded-[1.7rem]',
    mark: 'h-16 w-16',
    wordmark: 'text-4xl',
    subtitle: 'text-xs',
    gap: 'gap-4',
  },
};

const LogoGraphic = ({ size }: { size: LogoSize }) => {
  const sizes = {
    sm: { viewBox: '0 0 56 56', stroke: 2.8 },
    md: { viewBox: '0 0 56 56', stroke: 2.8 },
    lg: { viewBox: '0 0 72 72', stroke: 3.2 },
  };

  const current = sizes[size];

  return (
    <div className={`relative ${sizeMap[size].mark}`}>
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-sky-400 via-purple-500 to-orange-500 shadow-[0_20px_40px_rgba(168,85,247,0.3)]"
        initial={{ opacity: 0.84, scale: 0.94 }}
        animate={{ opacity: [0.9, 1, 0.95], scale: [0.98, 1.05, 0.99] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -inset-4 rounded-[40%] bg-gradient-to-r from-sky-400/30 via-purple-500/20 to-orange-500/30 blur-2xl"
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.svg
        viewBox={current.viewBox}
        className="absolute inset-[18%] text-white"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <motion.path
          d={size === 'lg'
            ? 'M12 52V22C12 17.6 15.6 14 20 14H31C34.3 14 37 16.7 37 20V26C37 29.3 39.7 32 43 32H58'
            : 'M8 42V18C8 14.7 10.7 12 14 12H23.5C26.1 12 28.2 14.1 28.2 16.7V21.5C28.2 24.1 30.3 26.2 32.9 26.2H46'}
          stroke="currentColor"
          strokeWidth={current.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.15, ease: 'easeInOut' }}
        />
        <motion.path
          d={size === 'lg'
            ? 'M22 52V30C22 27.8 23.8 26 26 26H36'
            : 'M14 42V24.5C14 22.8 15.3 21.5 17 21.5H27'}
          stroke="currentColor"
          strokeWidth={current.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.35 }}
          animate={{ pathLength: 1, opacity: 0.95 }}
          transition={{ duration: 0.9, delay: 0.18, ease: 'easeInOut' }}
        />
        <motion.circle
          cx={size === 'lg' ? 58 : 46}
          cy={size === 'lg' ? 32 : 26.2}
          r={size === 'lg' ? 4.4 : 3.5}
          fill="currentColor"
          initial={{ scale: 0, opacity: 0.2 }}
          animate={{ scale: [0.85, 1.12, 0.9], opacity: [0.7, 1, 0.82] }}
          transition={{ duration: 1.8, delay: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  );
};

const LogoInner = ({
  size,
  subtitle,
  showSubtitle,
  glow,
  className,
}: Required<Pick<LogoProps, 'size' | 'subtitle' | 'showSubtitle' | 'glow'>> & { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.94, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={`group relative inline-flex items-center ${sizeMap[size].gap} ${sizeMap[size].shell} border border-white/10 bg-white/[0.03] backdrop-blur-xl ${className || ''}`}
  >
    {glow && (
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-sky-300/10 via-sky-200/5 to-indigo-300/10"
        animate={{ opacity: [0.32, 0.52, 0.32] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    )}
    <LogoGraphic size={size} />
    <div className="relative flex flex-col items-start">
      <motion.span
        className={`${sizeMap[size].wordmark} font-black tracking-[-0.08em] leading-none bg-gradient-to-r from-sky-300 via-purple-300 to-orange-300 bg-clip-text text-transparent`}
        whileHover={{ letterSpacing: '-0.04em' }}
        transition={{ duration: 0.3 }}
      >
        BHIE
      </motion.span>
      {showSubtitle && (
        <motion.span
          className={`mt-1 ${sizeMap[size].subtitle} uppercase tracking-[0.34em] text-slate-400`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {subtitle}
        </motion.span>
      )}
    </div>
  </motion.div>
);

export const Logo = ({
  size = 'md',
  className,
  to,
  subtitle = 'Business Intelligence',
  showSubtitle = true,
  glow = true,
}: LogoProps) => {
  const content = (
    <LogoInner
      size={size}
      subtitle={subtitle}
      showSubtitle={showSubtitle}
      glow={glow}
      className={className}
    />
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} aria-label="BHIE logo" className="inline-flex">
      {content}
    </Link>
  );
};

export default Logo;
