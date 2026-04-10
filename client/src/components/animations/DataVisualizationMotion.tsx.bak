import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useSpring, useMotionValue, useTransform, animate } from 'framer-motion';
import { tokens } from '../../lib/animationTokens';

// ============================================
// Types
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

interface AnimatedBarProps {
  value: number;
  maxValue?: number;
  color?: string;
  label?: string;
  duration?: number;
  className?: string;
  height?: number;
}

interface AnimatedProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  duration?: number;
  className?: string;
  children?: React.ReactNode;
}

interface AnimatedLineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  duration?: number;
  className?: string;
}

// ============================================
// Animated Counter Component
// ============================================

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  format = (n) => Math.round(n).toLocaleString(),
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className={className}>
      {prefix}{format(displayValue)}{suffix}
    </span>
  );
};

// ============================================
// Animated Number with Spring Physics
// ============================================

export const SpringCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  format = (n) => Math.round(n).toLocaleString(),
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });

    return () => unsubscribe();
  }, [springValue]);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [value, isInView, motionValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}{format(displayValue)}{suffix}
    </span>
  );
};

// ============================================
// Animated Bar Chart
// ============================================

export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  value,
  maxValue = 100,
  color = 'bg-gradient-to-r from-indigo-500 to-purple-600',
  label,
  duration = 1.5,
  className = '',
  height = 24,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const percentage = (value / maxValue) * 100;

  return (
    <div ref={ref} className={className}>
      {label && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: duration * 0.8 }}
            className="font-bold text-indigo-600"
          >
            {value}%
          </motion.span>
        </div>
      )}
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{
            duration,
            ease: tokens.easing.smooth,
            delay: 0.2,
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// Animated Progress Ring
// ============================================

export const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#6366f1',
  bgColor = '#e5e7eb',
  duration = 1.5,
  className = '',
  children,
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const motionValue = useMotionValue(0);
  const strokeDashoffset = useTransform(
    motionValue,
    [0, 100],
    [circumference, 0]
  );

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, percentage, {
        duration,
        ease: 'easeOut',
      });
      return () => controls.stop();
    }
  }, [percentage, duration, isInView, motionValue]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        ref={ref}
        width={size}
        height={size}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================
// Animated Line Chart (SVG Path)
// ============================================

export const AnimatedLineChart: React.FC<AnimatedLineChartProps> = ({
  data,
  width = 300,
  height = 100,
  color = '#6366f1',
  strokeWidth = 2,
  duration = 2,
  className = '',
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height * 0.8 - height * 0.1;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{
          pathLength: { duration, ease: 'easeOut' },
          opacity: { duration: 0.3 },
        }}
      />
    </svg>
  );
};

// ============================================
// Animated Pie/Donut Chart Segment
// ============================================

export const AnimatedPieSegment: React.FC<{
  percentage: number;
  startAngle: number;
  color: string;
  size?: number;
  innerRadius?: number;
  duration?: number;
  className?: string;
}> = ({
  percentage,
  startAngle,
  color,
  size = 120,
  innerRadius = 40,
  duration = 1,
  className = '',
}) => {
  const ref = useRef<SVGPathElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const radius = size / 2 - 5;
  const center = size / 2;

  const getCoordinates = (angle: number, r: number) => {
    const radian = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + r * Math.cos(radian),
      y: center + r * Math.sin(radian),
    };
  };

  const endAngle = startAngle + (percentage / 100) * 360;
  const start = getCoordinates(startAngle, radius);
  const end = getCoordinates(endAngle, radius);
  const largeArcFlag = percentage > 50 ? 1 : 0;

  const outerStart = getCoordinates(startAngle, radius);
  const outerEnd = getCoordinates(endAngle, radius);
  const innerStart = getCoordinates(startAngle, innerRadius);
  const innerEnd = getCoordinates(endAngle, innerRadius);

  const pathD = [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');

  return (
    <motion.path
      ref={ref}
      d={pathD}
      fill={color}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{
        scale: { type: 'spring', stiffness: 200, damping: 15 },
        opacity: { duration: 0.3 },
      }}
      className={className}
    />
  );
};

// ============================================
// Stat Card with Animated Number
// ============================================

export const AnimatedStatCard: React.FC<{
  value: number;
  label: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  format?: (n: number) => string;
  className?: string;
}> = ({ value, label, icon, trend, format, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: tokens.duration.normal }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <div className="text-3xl font-bold text-gray-900">
            <AnimatedCounter value={value} format={format} />
          </div>
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// Animated Data Table Row
// ============================================

export const AnimatedTableRow: React.FC<{
  children: React.ReactNode;
  index?: number;
  className?: string;
}> = ({ children, index = 0, className = '' }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: tokens.duration.fast,
        delay: index * tokens.stagger.fast,
        ease: tokens.easing.smooth,
      }}
      className={className}
    >
      {children}
    </motion.tr>
  );
};

export default AnimatedCounter;
