import { useEffect, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { formatCurrency } from '../utils/dashboardIntelligence';

interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'percent' | 'number';
  className?: string;
}

const DEFAULT_SPRING_CONFIG = {
  stiffness: 140,
  damping: 24,
  mass: 0.8,
};

const toSafeNumber = (value: number) => (Number.isFinite(value) ? value : 0);

const formatValue = (value: number, format: AnimatedNumberProps['format']) => {
  const safeValue = toSafeNumber(value);

  switch (format) {
    case 'currency':
      return formatCurrency(Math.round(safeValue));
    case 'percent':
      return `${Math.round(safeValue)}%`;
    case 'number':
    default:
      return Math.round(safeValue).toLocaleString('en-IN');
  }
};

export const AnimatedNumber = ({
  value,
  format = 'number',
  className = '',
}: AnimatedNumberProps) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, DEFAULT_SPRING_CONFIG);
  const [displayValue, setDisplayValue] = useState(() => formatValue(value, format));

  useEffect(() => {
    motionValue.set(toSafeNumber(value));
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(formatValue(latest, format));
    });

    return unsubscribe;
  }, [format, springValue]);

  return <span className={className}>{displayValue}</span>;
};

export default AnimatedNumber;
