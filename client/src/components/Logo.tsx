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
    shell: 'px-2 py-1',
    mark: 'h-8 w-8',
    wordmark: 'text-[19px]',
    subtitle: 'text-[10px]',
    gap: 'gap-3',
  },
  md: {
    shell: 'px-2 py-1.5',
    mark: 'h-[40px] w-[40px]',
    wordmark: 'text-[24px]',
    subtitle: 'text-[11px]',
    gap: 'gap-3.5',
  },
  lg: {
    shell: 'px-3 py-2',
    mark: 'h-[52px] w-[52px]',
    wordmark: 'text-[32px]',
    subtitle: 'text-[13px]',
    gap: 'gap-4',
  },
};

const LogoGraphic = ({ size }: { size: LogoSize }) => {
  return (
    <div className={`relative ${sizeMap[size].mark} flex items-center justify-center shrink-0`}>
      {/* Siri / Apple Intelligence External Aura */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#007AFF] via-[#AF52DE] to-[#FF2D55] opacity-20 blur-[10px]"
        animate={{ rotate: [0, 360], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Flat Minimalist Apple App Icon Style */}
      <div className="absolute inset-[10%] rounded-xl bg-black border border-white/10 shadow-lg overflow-hidden flex items-center justify-center">
        {/* Subtle inner gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />
        
        <svg 
          viewBox="0 0 100 100" 
          className="w-[65%] h-[65%] relative z-10"
        >
          <path
            d="M50 10 C 20 10 10 20 10 50 C 10 80 20 90 50 90 C 80 90 90 80 90 50 C 90 20 80 10 50 10 Z"
            fill="url(#iconAura)"
            opacity="0.1"
          />
          <path 
            d="M32 40 L45 40 Q55 40 55 50 Q55 60 45 60 L32 60 Z"
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
          />
          <path 
            d="M32 40 L32 60"
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round" 
          />
          <path 
            d="M32 50 L48 50"
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round" 
          />
          <circle cx="68" cy="50" r="5" fill="url(#iconAura)" />
          
          <defs>
            <linearGradient id="iconAura" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#007AFF" />
              <stop offset="50%" stopColor="#AF52DE" />
              <stop offset="100%" stopColor="#FF2D55" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

const LogoInner = ({
  size,
  subtitle,
  showSubtitle,
  className,
}: Required<Pick<LogoProps, 'size' | 'subtitle' | 'showSubtitle'>> & { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }} // Apple fluid easing
    className={`group relative inline-flex items-center ${sizeMap[size].gap} ${className || ''}`}
  >
    <LogoGraphic size={size} />
    <div className="relative flex flex-col justify-center">
      <span
        className={`${sizeMap[size].wordmark} font-bold tracking-tight leading-none text-white`}
        style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}
      >
        BHIE<span className="text-[#007AFF]">.</span>
      </span>
      {showSubtitle && (
        <span
          className={`mt-[2px] ${sizeMap[size].subtitle} font-medium tracking-tight text-white/50`}
          style={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          {subtitle}
        </span>
      )}
    </div>
  </motion.div>
);

export const Logo = ({
  size = 'md',
  className,
  to,
  subtitle = 'Intelligence',
  showSubtitle = true,
}: LogoProps) => {
  const content = (
    <LogoInner
      size={size}
      subtitle={subtitle}
      showSubtitle={showSubtitle}
      className={className}
    />
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} aria-label="BHIE logo" className="inline-flex outline-none">
      {content}
    </Link>
  );
};

export default Logo;
