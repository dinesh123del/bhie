import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';

// Memoized components to prevent re-renders
export const MemoButton = memo(
  ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'tween', duration: 0.15 }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
);

MemoButton.displayName = 'MemoButton';

export const MemoCard = memo(
  ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'tween', duration: 0.2 }}
      className={`will-change-transform ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
);

MemoCard.displayName = 'MemoCard';

export const MemoIcon = memo(
  ({ children, ...props }: React.SVGAttributes<SVGSVGElement> & { children?: React.ReactNode }) => (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'tween', duration: 0.15 }}
      className="will-change-transform"
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
);

MemoIcon.displayName = 'MemoIcon';

// Optimized list rendering with memoization
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
}

export const OptimizedList = memo(function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  className = '',
}: ListProps<T>) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <React.Fragment key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
}) as <T,>(props: ListProps<T>) => JSX.Element;

// Lazy scroll animation with debounce
export const useLazyAnimation = (callback: () => void, delay: number = 0) => {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const trigger = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return trigger;
};

// Transform-only animation helper
export const transformOnly = (x = 0, y = 0, scale = 1, rotate = 0) => ({
  transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
  willChange: 'transform',
});

// Reduced motion variants for accessibility
export const reducedMotionVariants = (enabled: boolean) => {
  if (!enabled) return {};
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };
};
