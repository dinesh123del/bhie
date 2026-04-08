import { useRef, useEffect, RefObject } from 'react';
import { useInView, useAnimation, AnimationControls } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ============================================
// Framer Motion Scroll Reveal Hook
// ============================================

interface UseRevealOptions {
  threshold?: number;
  once?: boolean;
  amount?: 'some' | 'all' | number;
  delay?: number;
}

interface UseRevealResult {
  ref: RefObject<HTMLDivElement>;
  isInView: boolean;
  controls: AnimationControls;
}

export const useReveal = (options: UseRevealOptions = {}): UseRevealResult => {
  const { threshold = 0.2, once = true, amount = threshold, delay = 0 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });
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
// Stagger Reveal Hook (for lists/grids)
// ============================================

interface UseStaggerRevealOptions {
  itemCount: number;
  staggerDelay?: number;
  baseDelay?: number;
  threshold?: number;
  once?: boolean;
}

interface UseStaggerRevealResult {
  containerRef: RefObject<HTMLDivElement>;
  itemRefs: RefObject<(HTMLDivElement | null)[]>;
  getItemDelay: (index: number) => number;
  isInView: boolean;
}

export const useStaggerReveal = (
  options: UseStaggerRevealOptions
): UseStaggerRevealResult => {
  const { itemCount, staggerDelay = 0.08, baseDelay = 0.1, threshold = 0.2, once = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isInView = useInView(containerRef, { once, amount: threshold });

  const getItemDelay = (index: number): number => {
    return baseDelay + index * staggerDelay;
  };

  // Initialize item refs array
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, itemCount);
  }, [itemCount]);

  return { containerRef, itemRefs, getItemDelay, isInView };
};

// ============================================
// GSAP ScrollTrigger Reveal Hook
// ============================================

interface UseGSAPRevealOptions {
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  toggleActions?: string;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

interface UseGSAPRevealResult {
  ref: RefObject<HTMLDivElement>;
  trigger: ScrollTrigger | null;
}

export const useGSAPReveal = (
  options: UseGSAPRevealOptions = {}
): UseGSAPRevealResult => {
  const {
    start = 'top 80%',
    end = 'bottom 20%',
    scrub = false,
    markers = false,
    toggleActions = 'play none none reverse',
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
  } = options;
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        trigger: ref.current,
        start,
        end,
        scrub,
        markers,
        toggleActions,
        onEnter,
        onLeave,
        onEnterBack,
        onLeaveBack,
      });
    }, ref);

    return () => {
      ctx.revert();
      if (triggerRef.current) {
        triggerRef.current.kill();
      }
    };
  }, [start, end, scrub, markers, toggleActions, onEnter, onLeave, onEnterBack, onLeaveBack]);

  return { ref, trigger: triggerRef.current };
};

// ============================================
// Intersection Observer Reveal Hook (Vanilla)
// ============================================

interface UseIntersectionRevealOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionReveal = (
  callback: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void,
  options: UseIntersectionRevealOptions = {}
): RefObject<HTMLDivElement> => {
  const { threshold = 0.2, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (triggerOnce && hasTriggered.current && entry.isIntersecting) {
            return;
          }

          if (entry.isIntersecting) {
            hasTriggered.current = true;
          }

          callback(entry.isIntersecting, entry);
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [callback, threshold, rootMargin, triggerOnce]);

  return ref;
};

// ============================================
// Cascade Reveal Hook (for sequential reveals)
// ============================================

interface UseCascadeRevealOptions {
  totalItems: number;
  batchSize?: number;
  batchDelay?: number;
  itemDelay?: number;
  threshold?: number;
}

interface UseCascadeRevealResult {
  containerRef: RefObject<HTMLDivElement>;
  getBatchForIndex: (index: number) => number;
  getDelayForIndex: (index: number) => number;
  isInView: boolean;
}

export const useCascadeReveal = (
  options: UseCascadeRevealOptions
): UseCascadeRevealResult => {
  const {
    totalItems,
    batchSize = 3,
    batchDelay = 0.3,
    itemDelay = 0.08,
    threshold = 0.2,
  } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: threshold });

  const getBatchForIndex = (index: number): number => {
    return Math.floor(index / batchSize);
  };

  const getDelayForIndex = (index: number): number => {
    const batch = getBatchForIndex(index);
    const positionInBatch = index % batchSize;
    return batch * batchDelay + positionInBatch * itemDelay;
  };

  return { containerRef, getBatchForIndex, getDelayForIndex, isInView };
};

// ============================================
// Text Reveal Hook (for character/word animations)
// ============================================

interface UseTextRevealOptions {
  splitBy?: 'chars' | 'words' | 'lines';
  staggerDelay?: number;
  threshold?: number;
}

interface UseTextRevealResult {
  containerRef: RefObject<HTMLDivElement>;
  getTextArray: (text: string) => string[];
  getDelayForIndex: (index: number) => number;
  isInView: boolean;
}

export const useTextReveal = (
  options: UseTextRevealOptions = {}
): UseTextRevealResult => {
  const { splitBy = 'words', staggerDelay = 0.03, threshold = 0.5 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: threshold });

  const getTextArray = (text: string): string[] => {
    switch (splitBy) {
      case 'chars':
        return text.split('');
      case 'words':
        return text.split(' ');
      case 'lines':
        return text.split('\n');
      default:
        return text.split(' ');
    }
  };

  const getDelayForIndex = (index: number): number => {
    return index * staggerDelay;
  };

  return { containerRef, getTextArray, getDelayForIndex, isInView };
};

export default useReveal;
