import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================
// GSAP Configuration
// ============================================

export const gsapConfig = {
  // Default ease curves (Apple/Stripe style)
  easing: {
    smooth: 'power3.out',
    smoothInOut: 'power3.inOut',
    expo: 'expo.out',
    elastic: 'elastic.out(1, 0.5)',
    bounce: 'back.out(1.7)',
    gentle: 'power2.out',
    snappy: 'power4.out',
  },

  // Duration presets
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
    ultraSlow: 2,
  },

  // Stagger presets
  stagger: {
    fast: 0.03,
    normal: 0.08,
    slow: 0.15,
    cascade: 0.1,
  },

  // ScrollTrigger defaults
  scrollTrigger: {
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
  },
};

// ============================================
// Pre-configured Timeline Factory
// ============================================

export const createTimeline = (
  options: gsap.TimelineVars = {},
  scrollTriggerOptions?: ScrollTrigger.Vars
): gsap.core.Timeline => {
  const config: gsap.TimelineVars = {
    defaults: {
      ease: gsapConfig.easing.smooth,
      duration: gsapConfig.duration.normal,
    },
    ...options,
  };

  if (scrollTriggerOptions) {
    config.scrollTrigger = {
      ...gsapConfig.scrollTrigger,
      ...scrollTriggerOptions,
    };
  }

  return gsap.timeline(config);
};

// ============================================
// Batch Animation Helper
// ============================================

export const batchAnimate = (
  elements: string | Element[] | NodeListOf<Element>,
  animation: gsap.TweenVars,
  staggerAmount: number = gsapConfig.stagger.normal,
  scrollTriggerOptions?: ScrollTrigger.Vars
): gsap.core.Timeline => {
  const tl = createTimeline({}, scrollTriggerOptions);

  tl.from(elements, {
    ...animation,
    stagger: staggerAmount,
  });

  return tl;
};

// ============================================
// Text Reveal Animation
// ============================================

export const textReveal = (
  element: string | Element,
  options: {
    splitType?: 'chars' | 'words' | 'lines';
    duration?: number;
    stagger?: number;
    y?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  } = {}
): gsap.core.Timeline => {
  const {
    duration = gsapConfig.duration.normal,
    stagger = gsapConfig.stagger.normal,
    y = 30,
    scrollTrigger,
  } = options;

  const tl = createTimeline({}, scrollTrigger);

  tl.from(element, {
    y,
    opacity: 0,
    duration,
    stagger,
    ease: gsapConfig.easing.smooth,
  });

  return tl;
};

// ============================================
// Parallax Configuration
// ============================================

export const createParallax = (
  element: string | Element,
  speed: number = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
): ScrollTrigger => {
  const moveAmount = speed * 100;

  return ScrollTrigger.create({
    trigger: element,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      gsap.to(element, {
        y: direction === 'vertical' ? self.progress * moveAmount : 0,
        x: direction === 'horizontal' ? self.progress * moveAmount : 0,
        ease: 'none',
        overwrite: 'auto',
        duration: 0.1,
      });
    },
  });
};

// ============================================
// Pin Section Configuration
// ============================================

export const pinSection = (
  trigger: string | Element,
  pinDuration: number = 1,
  options: ScrollTrigger.Vars = {}
): ScrollTrigger => {
  return ScrollTrigger.create({
    trigger,
    start: 'top top',
    end: `+=${pinDuration * 100}%`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    ...options,
  });
};

// ============================================
// Performance Utilities
// ============================================

export const willChange = (element: HTMLElement, property: string = 'transform'): void => {
  element.style.willChange = property;
};

export const removeWillChange = (element: HTMLElement): void => {
  element.style.willChange = 'auto';
};

// ============================================
// Cleanup Utilities
// ============================================

export const killScrollTrigger = (trigger: ScrollTrigger | ScrollTrigger[]): void => {
  if (Array.isArray(trigger)) {
    trigger.forEach((t) => t.kill());
  } else {
    trigger.kill();
  }
};

export const refreshScrollTrigger = (): void => {
  ScrollTrigger.refresh();
};

// ============================================
// Match Media for Responsive Animations
// ============================================

export const setupResponsiveAnimations = (
  queries: Record<string, (context: gsap.Context) => void>
): (() => void) => {
  const mm = gsap.matchMedia();

  Object.entries(queries).forEach(([query, callback]) => {
    mm.add(query, callback);
  });

  return () => mm.revert();
};

// ============================================
// Reduced Motion Support
// ============================================

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const safeAnimate = (
  element: string | Element | Element[] | NodeListOf<Element> | null,
  vars: gsap.TweenVars
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) {
    return null;
  }
  return gsap.to(element, vars);
};

export { gsap, ScrollTrigger };
