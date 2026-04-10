"use client"
import React, { useRef, useEffect, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { gsap, ScrollTrigger } from '../../lib/gsapConfig';

// ============================================
// Parallax Section Types
// ============================================

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  asChild?: boolean;
}

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  zIndex?: number;
}

interface MouseParallaxProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  invert?: boolean;
}

// ============================================
// Framer Motion Parallax Section
// ============================================

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className = '',
  speed = 0.5,
  direction = 'vertical',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const moveDistance = speed * 100;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'vertical' ? [moveDistance, -moveDistance] : [0, 0]
  );
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'horizontal' ? [moveDistance, -moveDistance] : [0, 0]
  );

  // Smooth spring physics
  const springY = useSpring(y, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const springX = useSpring(x, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y: springY, x: springX }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
};

// ============================================
// Multi-Layer Parallax Container
// ============================================

export const ParallaxContainer: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// Individual Parallax Layer
// ============================================

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  className = '',
  speed = 0.5,
  direction = 'vertical',
  zIndex = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const moveDistance = speed * 100;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'vertical' ? [moveDistance, -moveDistance] : [0, 0]
  );
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'horizontal' ? [moveDistance, -moveDistance] : [0, 0]
  );

  return (
    <div ref={ref} className={`absolute inset-0 ${className}`} style={{ zIndex }}>
      <motion.div style={{ y, x }} className="will-change-transform h-full">
        {children}
      </motion.div>
    </div>
  );
};

// ============================================
// Mouse-Based Parallax (Interactive)
// ============================================

export const MouseParallax: React.FC<MouseParallaxProps> = ({
  children,
  className = '',
  intensity = 0.05,
  invert = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const moveX = (e.clientX - centerX) * intensity * (invert ? -1 : 1);
      const moveY = (e.clientY - centerY) * intensity * (invert ? -1 : 1);

      x.set(moveX);
      y.set(moveY);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [intensity, invert, x, y]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ x: springX, y: springY }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
};

// ============================================
// GSAP ScrollTrigger Parallax (Performance optimized)
// ============================================

export const GSAPParallax: React.FC<{
  children: ReactNode;
  className?: string;
  speed?: number;
}> = ({ children, className = '', speed = 0.3 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: () => speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={contentRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
};

// ============================================
// Parallax Image with Scale
// ============================================

export const ParallaxImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  parallaxSpeed?: number;
  scaleRange?: [number, number];
}> = ({ src, alt, className = '', parallaxSpeed = 0.3, scaleRange = [1, 1.1] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [scaleRange[0], 1, scaleRange[1]]);

  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y: springY, scale: springScale }} className="will-change-transform h-full">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
};

// ============================================
// Depth Parallax (Multiple layers)
// ============================================

export const DepthParallax: React.FC<{
  layers: Array<{
    content: ReactNode;
    speed: number;
    zIndex: number;
  }>;
  className?: string;
}> = ({ layers, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {layers.map((layer, index) => (
        <ParallaxLayer
          key={index}
          speed={layer.speed}
          zIndex={layer.zIndex}
          className="inset-0"
        >
          {layer.content}
        </ParallaxLayer>
      ))}
    </div>
  );
};

export default ParallaxSection;
