import React from 'react';
import { motion } from 'framer-motion';

export const TableRowHover: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <motion.div
    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', x: 4 }}
    transition={{ type: 'tween', duration: 0.15 }}
    className={`transition-colors duration-200 ${className}`}
    {...(props as any)}
  >
    {children}
  </motion.div>
);

export const ScaleOnHover: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'tween', duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const TextAnimated: React.FC<{ children: string; delay?: number }> = ({
  children,
  delay = 0,
}) => (
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
  >
    {children}
  </motion.span>
);

export const StaggerList: React.FC<{
  children: React.ReactNode[];
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      visible: {
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.1,
        },
      },
    }}
  >
    {React.Children.map(children, (child) => (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        }}
      >
        {child}
      </motion.div>
    ))}
  </motion.div>
);

export const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode }
> = ({ icon, className = '', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'tween', duration: 0.15 }}
    className={`inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/5 transition-colors duration-200 ${className}`}
    {...(props as any)}
  >
    {icon}
  </motion.button>
);

export const SmoothLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <motion.a
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'tween', duration: 0.2 }}
    className={`transition-colors duration-200 ${className}`}
    {...(props as any)}
  >
    {children}
  </motion.a>
);

export const PulseGlow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    animate={{
      boxShadow: [
        '0 0 0 0 rgba(99, 102, 241, 0.7)',
        '0 0 0 10px rgba(99, 102, 241, 0)',
      ],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
    }}
    className={`rounded-full ${className}`}
  />
);

export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 0.4 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration }}
  >
    {children}
  </motion.div>
);

export const SlideInFromLeft: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export const SlideInFromRight: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export const NumberTicker: React.FC<{
  value: number;
  duration?: number;
  decimals?: number;
}> = ({ value, duration = 1, decimals = 0 }) => {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const controls = {
      from: 0,
      to: value,
    };

    const updateNumber = (v: number) => {
      if (ref.current) {
        ref.current.textContent = v.toFixed(decimals);
      }
    };

    const startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const current = controls.from + (controls.to - controls.from) * progress;
      updateNumber(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration, decimals]);

  return <span ref={ref}>{value}</span>;
};
