"use client"
import React, { useRef, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { gsap } from 'gsap';
import { tokens, heroTextReveal, staggerContainer, staggerItem } from '../../lib/animationTokens';

interface HeroAnimationProps {
  children: React.ReactNode;
  className?: string;
  enableParallax?: boolean;
  backgroundElement?: React.ReactNode;
}

// ============================================
// Hero Text Animation with Stagger
// ============================================

export const HeroTextReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={{
      initial: { opacity: 0, y: 60, filter: 'blur(10px)' },
      animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: tokens.duration.slow,
          ease: tokens.easing.smooth,
          delay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// Hero Stagger Container
// ============================================

export const HeroStagger: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = tokens.stagger.normal }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={{
      initial: {},
      animate: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.15,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// Hero Stagger Item
// ============================================

export const HeroStaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    variants={heroTextReveal}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// Hero CTA Button with Glow Effect
// ============================================

export const HeroCTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}> = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = 'relative overflow-hidden font-semibold rounded-full px-8 py-4 transition-shadow duration-300';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30',
    secondary: 'bg-white text-indigo-900 border-2 border-indigo-100',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{
        scale: 1.05,
        boxShadow: variant === 'primary'
          ? '0 20px 40px -10px rgba(99, 102, 241, 0.5)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Glow effect layer */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`absolute inset-0 rounded-full blur-xl ${
          variant === 'primary' ? 'bg-indigo-400/50' : 'bg-white/50'
        }`} />
      </motion.div>

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

// ============================================
// Hero Image with Parallax
// ============================================

export const HeroImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  parallaxSpeed?: number;
}> = ({ src, alt, className = '', parallaxSpeed = 0.5 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.05]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y, scale }} className="will-change-transform">
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: tokens.duration.slow, delay: 0.3 }}
        />
      </motion.div>
    </div>
  );
};

// ============================================
// Background Gradient Animation
// ============================================

export const AnimatedBackground: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className = '', children }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)' }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)' }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {children}
    </div>
  );
};

// ============================================
// Main Hero Animation Component
// ============================================

export const HeroAnimation: React.FC<HeroAnimationProps> = ({
  children,
  className = '',
  enableParallax = true,
  backgroundElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Background parallax layer */}
      {backgroundElement && enableParallax && (
        <div className="absolute inset-0 -z-10">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: tokens.easing.smooth }}
          >
            {backgroundElement}
          </motion.div>
        </div>
      )}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default HeroAnimation;
