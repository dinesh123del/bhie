import { useEffect, useRef, RefObject } from 'react';
import {
  useAnimation,
  useInView,
  AnimationControls,
  useScroll,
  useTransform,
  MotionValue,
  useSpring,
  useMotionValue,
} from 'framer-motion';

// ============================================
// Enhanced Scroll Animation Hook
// ============================================

interface UseScrollAnimationOptions {
  once?: boolean;
  margin?: string | number | { [key: string]: string | number };
  amount?: 'some' | 'all' | number;
  delay?: number;
}

interface UseScrollAnimationResult {
  ref: RefObject<HTMLDivElement>;
  isInView: boolean;
  controls: AnimationControls;
}

export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationResult => {
  const { once = true, margin = '-100px', amount, delay = 0 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: margin as any, amount });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        controls.start('animate');
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, controls, delay]);

  return { ref, isInView, controls };
};

// ============================================
// Scroll Progress Hook
// ============================================

interface UseScrollProgressOptions {
  target?: RefObject<HTMLElement>;
  offset?: any;
}

interface UseScrollProgressResult {
  ref: RefObject<HTMLDivElement>;
  scrollYProgress: MotionValue<number>;
  scrollXProgress: MotionValue<number>;
}

export const useScrollProgress = (
  options: UseScrollProgressOptions = {}
): UseScrollProgressResult => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress, scrollXProgress } = useScroll({
    target: options.target || ref,
    offset: options.offset || ['start end', 'end start'],
  });

  return { ref, scrollYProgress, scrollXProgress };
};

// ============================================
// Scroll Velocity Hook
// ============================================


interface UseScrollVelocityResult {
  ref: RefObject<HTMLDivElement>;
  velocity: MotionValue<number>;
  direction: MotionValue<number>;
}

export const useScrollVelocity = (): UseScrollVelocityResult => {
  const ref = useRef<HTMLDivElement>(null);
  const velocity = useMotionValue(0);
  const direction = useMotionValue(1);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let rafId: number;

    const updateVelocity = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      const newVelocity = delta * 0.1;

      velocity.set(Math.abs(newVelocity));
      direction.set(delta > 0 ? 1 : -1);

      lastScrollY = currentScrollY;
      rafId = requestAnimationFrame(updateVelocity);
    };

    rafId = requestAnimationFrame(updateVelocity);

    return () => cancelAnimationFrame(rafId);
  }, [velocity, direction]);

  return { ref, velocity, direction };
};

// ============================================
// Parallax Scroll Hook
// ============================================

interface UseParallaxScrollOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  spring?: boolean;
}

interface UseParallaxScrollResult {
  ref: RefObject<HTMLDivElement>;
  y: MotionValue<number>;
  x: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
}

export const useParallaxScroll = (
  options: UseParallaxScrollOptions = {}
): UseParallaxScrollResult => {
  const { speed = 0.5, direction = 'vertical', spring = true } = options;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'vertical' ? [speed * 100, -speed * 100] : [0, 0]
  );

  const rawX = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'horizontal' ? [speed * 100, -speed * 100] : [0, 0]
  );

  const springY = useSpring(rawY, { stiffness: 100, damping: 30 });
  const springX = useSpring(rawX, { stiffness: 100, damping: 30 });

  const y = spring ? springY : rawY;
  const x = spring ? springX : rawX;

  return { ref, y, x, scrollYProgress };
};

// ============================================
// Staggered Children Animation Hook
// ============================================

interface UseStaggerAnimationOptions {
  childCount: number;
  staggerDelay?: number;
  baseDelay?: number;
  margin?: any;
}

interface UseStaggerAnimationResult {
  containerRef: RefObject<HTMLDivElement>;
  isInView: boolean;
  getChildDelay: (index: number) => number;
  controls: AnimationControls;
}

export const useStaggerAnimation = (
  options: UseStaggerAnimationOptions
): UseStaggerAnimationResult => {
  const { childCount, staggerDelay = 0.08, baseDelay = 0.1, margin = '-100px' } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        controls.start('animate');
      }, baseDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, controls, baseDelay]);

  const getChildDelay = (index: number): number => {
    return index * staggerDelay;
  };

  return { containerRef, isInView, getChildDelay, controls };
};

// ============================================
// Scroll Snap Hook (for section snapping)
// ============================================

export const useScrollSnap = (): RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is a placeholder for scroll snap behavior
    // In a real implementation, you'd use native CSS scroll-snap or
    // a library like gsap/ScrollTrigger for more complex snapping
  }, []);

  return ref;
};

// ============================================
// Legacy Export (backwards compatibility)
// ============================================

export default useScrollAnimation;
