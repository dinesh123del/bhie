import { useRef, useEffect, RefObject } from 'react';
import { useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { gsap, ScrollTrigger } from '../lib/gsapConfig';

// ============================================
// Framer Motion Parallax Hook
// ============================================

interface UseParallaxOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  springConfig?: { stiffness?: number; damping?: number; restDelta?: number };
}

export const useParallax = (
  options: UseParallaxOptions = {}
): { ref: RefObject<HTMLDivElement>; y: MotionValue<number>; x: MotionValue<number> } => {
  const { speed = 0.5, direction = 'vertical', springConfig = {} } = options;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const moveDistance = speed * 100;

  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'vertical' ? [moveDistance, -moveDistance] : [0, 0]
  );

  const rawX = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'horizontal' ? [moveDistance, -moveDistance] : [0, 0]
  );

  const y = useSpring(rawY, {
    stiffness: springConfig.stiffness ?? 100,
    damping: springConfig.damping ?? 30,
    restDelta: springConfig.restDelta ?? 0.001,
  });

  const x = useSpring(rawX, {
    stiffness: springConfig.stiffness ?? 100,
    damping: springConfig.damping ?? 30,
    restDelta: springConfig.restDelta ?? 0.001,
  });

  return { ref, y, x };
};

// ============================================
// Multi-Speed Parallax Hook (for layered effects)
// ============================================

// Removed useMultiParallax as it violates React Hooks rules (hooks in loop) and was unused

// ============================================
// GSAP ScrollTrigger Parallax Hook
// ============================================

interface UseGSAPParallaxOptions {
  speed?: number;
  scrub?: boolean | number;
  start?: string;
  end?: string;
}

export const useGSAPParallax = (
  options: UseGSAPParallaxOptions = {}
): RefObject<HTMLDivElement> => {
  const { speed = 0.3, scrub = true, start = 'top bottom', end = 'bottom top' } = options;
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const ctx = gsap.context(() => {
      gsap.to(element, {
        y: () => speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start,
          end,
          scrub,
        },
      });
    });

    return () => ctx.revert();
  }, [speed, scrub, start, end]);

  return elementRef;
};

// ============================================
// Mouse-based Parallax Hook
// ============================================

import { useMotionValue } from 'framer-motion';

interface UseMouseParallaxOptions {
  intensity?: number;
  invert?: boolean;
  smoothing?: number;
}

interface UseMouseParallaxResult {
  ref: RefObject<HTMLDivElement>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}

export const useMouseParallax = (
  options: UseMouseParallaxOptions = {}
): UseMouseParallaxResult => {
  const { intensity = 0.05, invert = false, smoothing = 150 } = options;
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: smoothing, damping: 15 });
  const springY = useSpring(y, { stiffness: smoothing, damping: 15 });

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

  return { ref, x, y, springX, springY };
};

// ============================================
// Scale on Scroll Hook (for zoom effects)
// ============================================

interface UseScrollScaleOptions {
  minScale?: number;
  maxScale?: number;
  start?: string;
  end?: string;
}

export const useScrollScale = (
  options: UseScrollScaleOptions = {}
): { ref: RefObject<HTMLDivElement>; scale: MotionValue<number> } => {
  const { minScale = 0.8, maxScale = 1.2, start = 'top bottom', end = 'bottom top' } = options;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [start as any, end as any],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [minScale, 1, maxScale]);

  return { ref, scale };
};

// ============================================
// Opacity on Scroll Hook
// ============================================

interface UseScrollOpacityOptions {
  fadeInStart?: number;
  fadeInEnd?: number;
  fadeOutStart?: number;
  fadeOutEnd?: number;
}

export const useScrollOpacity = (
  options: UseScrollOpacityOptions = {}
): { ref: RefObject<HTMLDivElement>; opacity: MotionValue<number> } => {
  const {
    fadeInStart = 0,
    fadeInEnd = 0.2,
    fadeOutStart = 0.8,
    fadeOutEnd = 1,
  } = options;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(
    scrollYProgress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0]
  );

  return { ref, opacity };
};

export default useParallax;
