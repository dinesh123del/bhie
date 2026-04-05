import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { premiumFeedback } from '../../utils/premiumFeedback';

/**
 * Premium micro-interaction components using Framer Motion
 */

// Page Transition Component (Elite Spring Physics)
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.96, filter: 'blur(10px)' }}
    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -30, scale: 1.02, filter: 'blur(10px)' }}
    transition={{ type: 'spring', stiffness: 110, damping: 25, mass: 1.2 }}
    className="w-full h-full min-h-screen transform-gpu"
  >
    {children}
  </motion.div>
);

// Scale on Hover with Spring Physics
export const ScaleOnHover: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.div
    whileHover={{ scale: 1.015 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 110, damping: 25, mass: 1.2 }}
    className={className}
    onMouseEnter={() => premiumFeedback.haptic(5)}
  >
    {children}
  </motion.div>
);

// Staggered List Animation
export const StaggerList: React.FC<{
  children: React.ReactNode[];
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0.1 }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      visible: {
        transition: {
          staggerChildren: 0.08,
          delayChildren: delay,
        },
      },
    }}
  >
    {React.Children.map(children, (child) => (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.96 },
          visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: 'spring', stiffness: 150, damping: 18 } 
          },
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

// Success Check Animation
export const PremiumSuccessAnimation: React.FC<{ show: boolean; message?: string }> = ({ show, message }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05 }}
        onAnimationStart={() => premiumFeedback.success()}
        className="flex flex-col items-center justify-center p-6 space-y-4"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute inset-0 bg-emerald-400/30 rounded-full"
          />
          <motion.svg
            viewBox="0 0 52 52"
            className="h-16 w-16 text-emerald-400 relative z-10 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]"
            initial="hidden"
            animate="visible"
          >
            <motion.circle
              cx="26"
              cy="26"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 0.5 } },
              }}
            />
            <motion.path
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4, delay: 0.4 } },
              }}
            />
          </motion.svg>
        </div>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-emerald-400 font-bold tracking-tight text-lg"
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

// Error Shake Animation
export const ShakeOnTrigger: React.FC<{ children: React.ReactNode; trigger?: any }> = ({ children, trigger }) => {
  React.useEffect(() => {
    if (trigger) {
      premiumFeedback.error();
    }
  }, [trigger]);

  return (
    <motion.div
      animate={trigger ? { 
        x: [0, -10, 10, -10, 10, -5, 5, 0],
        transition: { duration: 0.5, ease: "easeInOut" }
      } : {}}
    >
      {children}
    </motion.div>
  );
};

// Cursor Parallax Hook/Component
export const FloatingCursorParallax: React.FC<{ children: React.ReactNode; intensity?: number }> = ({ 
  children, 
  intensity = 50 
}) => {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / intensity;
    const y = (clientY - innerHeight / 2) / intensity;
    setOffset({ x, y });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 100, damping: 25, mass: 1 }}
      className="relative w-full"
    >
      {children}
    </motion.div>
  );
};

// Text Processing Fade
export const TextProcessingFade: React.FC<{ text: string }> = ({ text }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={text}
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(4px)' }}
      transition={{ duration: 0.4 }}
      className="inline-block"
    >
      {text}
    </motion.span>
  </AnimatePresence>
);

// iPad OS Style Magnetic Interaction
export const MagneticElement: React.FC<{ children: React.ReactNode, strength?: number, className?: string }> = ({ children, strength = 0.2, className = '' }) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = e.currentTarget.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

