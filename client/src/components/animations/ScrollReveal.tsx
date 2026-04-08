import React, { useRef, useEffect, ReactNode } from 'react';
import { motion, useInView, useAnimation, useScroll, useTransform, Variants } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tokens, scrollRevealUp, scrollRevealScale } from '../../lib/animationTokens';

// ============================================
// Scroll Reveal Configuration Types
// ============================================

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight' | 'custom';
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  customVariants?: Variants;
  onReveal?: () => void;
}

interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  once?: boolean;
}

// ============================================
// Individual Scroll Reveal Component
// ============================================

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  variant = 'fadeUp',
  delay = 0,
  duration = tokens.duration.slow,
  once = true,
  threshold = 0.2,
  customVariants,
  onReveal,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('animate');
      onReveal?.();
    }
  }, [isInView, controls, onReveal]);

  const getVariants = (): Variants => {
    if (customVariants) return customVariants;

    const variants: Record<string, Variants> = {
      fadeUp: {
        initial: { opacity: 0, y: tokens.distance.large },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: tokens.easing.smooth, delay },
        },
      },
      fadeIn: {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: { duration, ease: tokens.easing.gentle, delay },
        },
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: { duration, ease: tokens.easing.smooth, delay },
        },
      },
      slideLeft: {
        initial: { opacity: 0, x: -tokens.distance.large },
        animate: {
          opacity: 1,
          x: 0,
          transition: { duration, ease: tokens.easing.smooth, delay },
        },
      },
      slideRight: {
        initial: { opacity: 0, x: tokens.distance.large },
        animate: {
          opacity: 1,
          x: 0,
          transition: { duration, ease: tokens.easing.smooth, delay },
        },
      },
      custom: scrollRevealUp,
    };

    return variants[variant];
  };

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={controls}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Scroll Reveal Group with Stagger
// ============================================

export const ScrollRevealGroup: React.FC<ScrollRevealGroupProps> = ({
  children,
  className = '',
  staggerDelay = tokens.stagger.normal,
  direction = 'up',
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const getItemVariants = (): Variants => {
    const directions: Record<string, Variants> = {
      up: {
        hidden: { opacity: 0, y: tokens.distance.medium },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: tokens.duration.normal, ease: tokens.easing.smooth },
        },
      },
      down: {
        hidden: { opacity: 0, y: -tokens.distance.medium },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: tokens.duration.normal, ease: tokens.easing.smooth },
        },
      },
      left: {
        hidden: { opacity: 0, x: tokens.distance.medium },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: tokens.duration.normal, ease: tokens.easing.smooth },
        },
      },
      right: {
        hidden: { opacity: 0, x: -tokens.distance.medium },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: tokens.duration.normal, ease: tokens.easing.smooth },
        },
      },
      scale: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: tokens.duration.normal, ease: tokens.easing.smooth },
        },
      },
    };

    return directions[direction];
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={getItemVariants()}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ============================================
// Text Line Reveal (for headings)
// ============================================

export const TextLineReveal: React.FC<{
  text: string;
  className?: string;
  lineClassName?: string;
  delay?: number;
}> = ({ text, className = '', lineClassName = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const lines = text.split('\n');

  return (
    <div ref={ref} className={className}>
      {lines.map((line, index) => (
        <div key={index} className="overflow-hidden">
          <motion.div
            initial={{ y: '100%' }}
            animate={isInView ? { y: 0 } : { y: '100%' }}
            transition={{
              duration: tokens.duration.slow,
              ease: tokens.easing.smooth,
              delay: delay + index * 0.1,
            }}
            className={lineClassName}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// Scroll Progress Indicator
// ============================================

export const ScrollProgress: React.FC<{
  className?: string;
  color?: string;
}> = ({ className = '', color = 'bg-indigo-600' }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 origin-left z-50 ${color} ${className}`}
      style={{ scaleX }}
    />
  );
};

// ============================================
// GSAP ScrollTrigger Section Reveal
// ============================================

interface ScrollTriggerRevealProps {
  children: ReactNode;
  className?: string;
  pin?: boolean;
  pinDuration?: number;
  scrub?: boolean;
  markers?: boolean;
  start?: string;
  end?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

export const ScrollTriggerReveal: React.FC<ScrollTriggerRevealProps> = ({
  children,
  className = '',
  pin = false,
  pinDuration = 1,
  scrub = false,
  markers = false,
  start = 'top 80%',
  end = 'bottom 20%',
  onEnter,
  onLeave,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: sectionRef.current,
        start,
        end: pin ? `+=${pinDuration * 100}%` : end,
        pin,
        scrub,
        markers,
        onEnter,
        onLeave,
        onEnterBack: onEnter,
        onLeaveBack: onLeave,
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      triggerRef.current?.kill();
    };
  }, [pin, pinDuration, scrub, markers, start, end, onEnter, onLeave]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};

// ============================================
// Sticky Section with Animation
// ============================================

export const StickyRevealSection: React.FC<{
  children: ReactNode;
  className?: string;
  stickyClassName?: string;
  backgroundContent?: ReactNode;
}> = ({ children, className = '', stickyClassName = '', backgroundContent }) => {
  return (
    <div className={`relative ${className}`}>
      <div className={`sticky top-0 h-screen ${stickyClassName}`}>
        {backgroundContent}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ScrollReveal;
