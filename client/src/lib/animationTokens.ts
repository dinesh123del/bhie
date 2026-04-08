import { Variants, Transition } from 'framer-motion';

// ============================================
// Animation Token System
// Apple / Stripe / Linear inspired
// ============================================

export const tokens = {
  // Duration tokens (in seconds)
  duration: {
    instant: 0.15,
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
    ultraSlow: 2,
  },

  // Easing curves (Framer Motion format)
  easing: {
    smooth: [0.22, 1, 0.36, 1],      // Apple-style ease
    snappy: [0.25, 1, 0.5, 1],        // Quick interactions
    bounce: [0.34, 1.56, 0.64, 1],   // Playful bounce
    gentle: [0.4, 0, 0.2, 1],        // Material ease
    linear: [0, 0, 1, 1],            // Constant speed
  },

  // Spring physics
  spring: {
    gentle: { type: 'spring', stiffness: 100, damping: 15 },
    snappy: { type: 'spring', stiffness: 400, damping: 25 },
    bouncy: { type: 'spring', stiffness: 300, damping: 10 },
    stiff: { type: 'spring', stiffness: 500, damping: 30 },
  },

  // Stagger delays
  stagger: {
    fast: 0.03,
    normal: 0.08,
    slow: 0.15,
    cascade: 0.1,
  },

  // Distance values
  distance: {
    small: 8,
    medium: 24,
    large: 48,
    xlarge: 80,
  },

  // Scale values
  scale: {
    subtle: 1.02,
    normal: 1.05,
    prominent: 1.1,
    press: 0.98,
  },
};

// ============================================
// Framer Motion Variants
// ============================================

export const fadeUp: Variants = {
  initial: {
    opacity: 0,
    y: tokens.distance.medium,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: tokens.duration.normal,
      ease: tokens.easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -tokens.distance.small,
    transition: {
      duration: tokens.duration.fast,
    },
  },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: tokens.duration.normal,
      ease: tokens.easing.gentle,
    },
  },
  exit: { opacity: 0, transition: { duration: tokens.duration.fast } },
};

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: tokens.duration.normal,
      ease: tokens.easing.snappy,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: tokens.duration.fast },
  },
};

export const slideLeft: Variants = {
  initial: {
    opacity: 0,
    x: -tokens.distance.large,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: tokens.duration.normal,
      ease: tokens.easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: -tokens.distance.medium,
  },
};

export const slideRight: Variants = {
  initial: {
    opacity: 0,
    x: tokens.distance.large,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: tokens.duration.normal,
      ease: tokens.easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: tokens.distance.medium,
  },
};

// ============================================
// Container Variants (with stagger)
// ============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: tokens.stagger.normal,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: tokens.stagger.fast,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: tokens.stagger.fast,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: tokens.stagger.slow,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: tokens.distance.small,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: tokens.duration.fast,
      ease: tokens.easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -tokens.distance.small,
    transition: { duration: tokens.duration.instant },
  },
};

// ============================================
// Hero Section Variants
// ============================================

export const heroTextReveal: Variants = {
  initial: {
    opacity: 0,
    y: tokens.distance.xlarge,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: tokens.duration.slow,
      ease: tokens.easing.smooth,
    },
  },
};

export const heroImageReveal: Variants = {
  initial: {
    opacity: 0,
    scale: 1.1,
    y: 30,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: tokens.duration.slow,
      ease: tokens.easing.smooth,
      delay: 0.2,
    },
  },
};

// ============================================
// Interactive Variants
// ============================================

export const buttonHover = {
  scale: tokens.scale.normal,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
  },
};

export const buttonTap = {
  scale: tokens.scale.press,
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

export const cardHover = {
  y: -6,
  scale: tokens.scale.subtle,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
};

export const cardTap = {
  scale: tokens.scale.press,
};

export const iconSpin = {
  rotate: 180,
  transition: { duration: tokens.duration.fast, ease: tokens.easing.smooth },
};

// ============================================
// Page Transition Variants
// ============================================

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: tokens.duration.normal,
      ease: tokens.easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: tokens.duration.fast,
      ease: tokens.easing.smooth,
    },
  },
};

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: tokens.duration.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: tokens.duration.fast },
  },
};

// ============================================
// Data Visualization Variants
// ============================================

export const barGrow: Variants = {
  initial: {
    scaleY: 0,
    originY: 1,
  },
  animate: {
    scaleY: 1,
    transition: {
      duration: tokens.duration.slow,
      ease: tokens.easing.smooth,
    },
  },
};

export const numberCountUp = {
  transition: {
    duration: tokens.duration.slow,
    ease: tokens.easing.gentle,
  },
};

export const pathDraw: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: tokens.duration.slow, ease: tokens.easing.smooth },
      opacity: { duration: tokens.duration.fast },
    },
  },
};

// ============================================
// Scroll Reveal Variants
// ============================================

export const scrollRevealUp: Variants = {
  initial: {
    opacity: 0,
    y: tokens.distance.large,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: tokens.duration.slow,
      ease: tokens.easing.smooth,
    },
  },
};

export const scrollRevealScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: tokens.duration.normal,
      ease: tokens.easing.smooth,
    },
  },
};

// ============================================
// Utility Functions
// ============================================

export const createCustomTransition = (
  duration: number,
  ease: number[] = tokens.easing.smooth
): Transition => ({
  duration,
  ease,
});

export const createStaggerDelay = (
  index: number,
  baseDelay: number = tokens.stagger.normal
): number => index * baseDelay;

export const withDelay = (
  variant: Variants,
  delay: number
): Variants => ({
  ...variant,
  animate: {
    ...(variant.animate as object),
    transition: {
      ...(variant.animate as { transition?: object }).transition,
      delay,
    },
  },
});

// ============================================
// Export All Variants
// ============================================

export const allVariants = {
  fadeUp,
  fadeIn,
  scaleIn,
  slideLeft,
  slideRight,
  staggerContainer,
  staggerItem,
  heroTextReveal,
  heroImageReveal,
  pageTransition,
  pageFade,
  barGrow,
  pathDraw,
  scrollRevealUp,
  scrollRevealScale,
};

export default tokens;
