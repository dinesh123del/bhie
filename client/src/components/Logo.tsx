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
      
      {/* Generated App Logo replacing SVG architecture */}
      <img src="/icon.png" alt="AERA Icon" className="w-[85%] h-[85%] relative z-10 object-contain drop-shadow-[0_4px_6px_rgba(175,82,222,0.4)] hover:scale-105 transition-transform" />
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
        AERA<span className="text-[#007AFF]">.</span>
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
  subtitle = 'Economic Resilience',
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
    <Link to={to} aria-label="AERA logo" className="inline-flex outline-none">
      {content}
    </Link>
  );
};

export default Logo;
