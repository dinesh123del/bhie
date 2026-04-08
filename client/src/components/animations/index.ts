// ============================================
// BHIE Animation System Exports
// ============================================

// Animation Components
export {
  HeroAnimation,
  HeroTextReveal,
  HeroStagger,
  HeroStaggerItem,
  HeroCTAButton,
  HeroImage,
  AnimatedBackground,
} from './HeroAnimation';

export {
  ScrollReveal,
  ScrollRevealGroup,
  TextLineReveal,
  ScrollProgress,
  ScrollTriggerReveal,
  StickyRevealSection,
} from './ScrollReveal';

export {
  ParallaxSection,
  ParallaxContainer,
  ParallaxLayer,
  MouseParallax,
  GSAPParallax,
  ParallaxImage,
  DepthParallax,
} from './ParallaxSection';

export {
  AnimatedCounter,
  SpringCounter,
  AnimatedBar,
  AnimatedProgressRing,
  AnimatedLineChart,
  AnimatedPieSegment,
  AnimatedStatCard,
  AnimatedTableRow,
} from './DataVisualizationMotion';

// Animation Libraries
export { gsap, ScrollTrigger, createTimeline, batchAnimate } from '../../lib/gsapConfig';
export {
  tokens,
  fadeUp,
  fadeIn,
  scaleIn,
  slideLeft,
  slideRight,
  staggerContainer,
  staggerItem,
  heroTextReveal,
  pageTransition,
} from '../../lib/animationTokens';
