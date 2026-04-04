export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInScaleHover = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleInCenter = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const buttonHover = {
  scale: 1.05,
  transition: { type: 'tween', duration: 0.2 },
};

export const buttonTap = {
  scale: 0.97,
  transition: { type: 'tween', duration: 0.1 },
};

export const cardHover = {
  y: -4,
  scale: 1.02,
  transition: { type: 'tween', duration: 0.2 },
};

export const shakes = {
  animate: {
    x: [-8, 8, -8, 8, -4, 4, -2, 2, 0],
    transition: { duration: 0.5 },
  },
};

export const successPulse = {
  animate: {
    scale: [0, 1, 0.95],
    transition: { duration: 0.6 },
  },
};

export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const iconRotate = {
  whileHover: { rotate: 5 },
  whileTap: { rotate: -5 },
  transition: { type: 'tween', duration: 0.2 },
};

export const fadeInStagger = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } },
  },
};

// Apple scroll reveal
export const appleScrollReveal = {
  initial: { opacity: 0, y: 48 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
};

// Micro bounce for buttons/CTAs
export const microBounce = {
  whileHover: { 
    scale: 1.02, 
    y: -2,
    transition: { type: 'spring', stiffness: 400, damping: 18 }
  },
  whileTap: { scale: 0.98 },
};

// Subtle card lift
export const cardLift = {
  whileHover: {
    y: -6,
    scale: 1.015,
    transition: { type: 'spring', stiffness: 350, damping: 22 }
  },
};

// List stagger with scroll sync
export const listStagger = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
        staggerDirection: 1,
      },
    },
  },
};

// Progress ring variants
export const progressRing = {
  path: {
    initial: { pathLength: 0 },
    animate: { pathLength: 1, transition: { duration: 1.2, ease: 'easeOut' } },
  },
};

// Parallax hero
export const heroParallax = {
  y: 0,
  scale: 1.05,
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const cardEntrance = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: { y: -5, scale: 1.05 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};
