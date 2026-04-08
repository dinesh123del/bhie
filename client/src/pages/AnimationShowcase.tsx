import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  HeroAnimation,
  HeroStagger,
  HeroStaggerItem,
  HeroCTAButton,
  AnimatedBackground,
  ScrollReveal,
  ScrollRevealGroup,
  ScrollProgress,
  ParallaxSection,
  ParallaxImage,
  AnimatedCounter,
  AnimatedBar,
  AnimatedProgressRing,
  AnimatedStatCard,
  MouseParallax,
  tokens,
  staggerContainer,
  staggerItem,
} from '../components/animations';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';

// ============================================
// Animation Showcase Page
// Demonstrates all animation system features
// ============================================

const AnimationShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Scroll Progress Indicator */}
      <ScrollProgress color="bg-gradient-to-r from-indigo-500 to-purple-500" />

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <HeroAnimation className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
        </AnimatedBackground>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <HeroStagger className="text-center">
            {/* Badge */}
            <HeroStaggerItem>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Premium Animation System</span>
              </motion.div>
            </HeroStaggerItem>

            {/* Main Heading */}
            <HeroStaggerItem>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                BHIE Animation
                <br />
                <span className="text-indigo-400">Engine</span>
              </h1>
            </HeroStaggerItem>

            {/* Subheading */}
            <HeroStaggerItem>
              <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Smooth, modern, high-performance animations inspired by Apple, Stripe, and Linear.
              </p>
            </HeroStaggerItem>

            {/* CTA Buttons */}
            <HeroStaggerItem>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <HeroCTAButton variant="primary">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </HeroCTAButton>
                <HeroCTAButton variant="secondary">
                  View Documentation
                </HeroCTAButton>
              </div>
            </HeroStaggerItem>
          </HeroStagger>

          {/* Floating Cards */}
          <motion.div
            className="absolute -right-20 top-20 hidden lg:block"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-64 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl backdrop-blur-xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">Revenue</div>
                  <div className="text-2xl font-bold text-white">$124.5K</div>
                </div>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-10 bottom-40 hidden lg:block"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <div className="w-56 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-purple-300" />
                <span className="text-sm text-slate-400">Active Users</span>
              </div>
              <div className="text-3xl font-bold text-white">24.8K</div>
              <div className="text-sm text-green-400 mt-1">+12.5% this week</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </HeroAnimation>

      {/* ============================================
          SCROLL REVEAL SECTION
          ============================================ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant="fadeUp" className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Scroll-Triggered Animations
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Elements smoothly reveal as you scroll, creating an engaging storytelling experience.
            </p>
          </ScrollReveal>

          <ScrollRevealGroup className="grid md:grid-cols-3 gap-8" direction="up" staggerDelay={0.15}>
            {[
              { icon: Zap, title: 'Lightning Fast', desc: '60fps animations with hardware acceleration' },
              { icon: Shield, title: 'Accessible', desc: 'Respects reduced-motion preferences' },
              { icon: Sparkles, title: 'Premium Feel', desc: 'Apple-level polish and attention to detail' },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors"
              >
                <motion.div
                  className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="w-7 h-7 text-indigo-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>

      {/* ============================================
          DATA VISUALIZATION SECTION
          ============================================ */}
      <section className="py-32 px-6 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant="fadeUp" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Animated Data Visualizations
            </h2>
            <p className="text-xl text-slate-400">
              Charts and numbers that come alive with smooth animations.
            </p>
          </ScrollReveal>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <AnimatedStatCard
              value={24500}
              label="Total Users"
              icon={<Users className="w-6 h-6" />}
              trend={{ value: 12.5, isPositive: true }}
              format={(n) => `${(n / 1000).toFixed(1)}K`}
            />
            <AnimatedStatCard
              value={892000}
              label="Revenue"
              icon={<DollarSign className="w-6 h-6" />}
              trend={{ value: 8.2, isPositive: true }}
              format={(n) => `$${(n / 1000).toFixed(0)}K`}
            />
            <AnimatedStatCard
              value={98}
              label="Satisfaction"
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 2.1, isPositive: true }}
              format={(n) => `${n}%`}
            />
            <AnimatedStatCard
              value={156}
              label="Daily Growth"
              icon={<TrendingUp className="w-6 h-6" />}
              trend={{ value: 5.4, isPositive: true }}
              format={(n) => `+${n}`}
            />
          </div>

          {/* Progress Bars */}
          <ScrollReveal variant="scaleIn" className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-2xl font-bold mb-8">Performance Metrics</h3>
            <div className="space-y-6">
              <AnimatedBar
                value={92}
                label="Page Load Speed"
                color="bg-gradient-to-r from-emerald-500 to-teal-500"
                duration={2}
              />
              <AnimatedBar
                value={88}
                label="Core Web Vitals"
                color="bg-gradient-to-r from-blue-500 to-indigo-500"
                duration={2}
              />
              <AnimatedBar
                value={95}
                label="Animation Performance"
                color="bg-gradient-to-r from-purple-500 to-pink-500"
                duration={2}
              />
              <AnimatedBar
                value={97}
                label="Accessibility Score"
                color="bg-gradient-to-r from-orange-500 to-red-500"
                duration={2}
              />
            </div>
          </ScrollReveal>

          {/* Progress Rings */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { label: 'Uptime', value: 99.9, color: '#10b981' },
              { label: 'Performance', value: 94, color: '#6366f1' },
              { label: 'SEO Score', value: 96, color: '#f59e0b' },
            ].map((item, i) => (
              <ScrollReveal key={i} variant="scaleIn" delay={i * 0.1} className="flex flex-col items-center">
                <AnimatedProgressRing
                  percentage={item.value}
                  size={150}
                  strokeWidth={10}
                  color={item.color}
                  bgColor="#334155"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      <AnimatedCounter value={item.value} suffix="%" />
                    </div>
                  </div>
                </AnimatedProgressRing>
                <p className="mt-4 text-lg font-medium text-slate-300">{item.label}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PARALLAX SECTION
          ============================================ */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant="fadeUp" className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Parallax Effects</h2>
            <p className="text-xl text-slate-400">
              Depth and dimension through layered scroll-based movement.
            </p>
          </ScrollReveal>

          <MouseParallax intensity={0.02} className="relative h-96 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900" />

            {/* Parallax Layers */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -50]) }}
            >
              <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </motion.div>

            <div className="relative z-10 h-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-4">Interactive Parallax</h3>
                <p className="text-slate-300">Move your mouse to see the effect</p>
              </motion.div>
            </div>
          </MouseParallax>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Elevate Your UI?
            </h2>
            <p className="text-xl text-slate-400 mb-10">
              Start building premium, animated experiences today with the BHIE Animation System.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <HeroCTAButton variant="primary">
                Start Building
                <ArrowRight className="w-5 h-5" />
              </HeroCTAButton>
              <HeroCTAButton variant="secondary">
                View on GitHub
              </HeroCTAButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500">
            © 2024 BHIE - Business Health Integration Engine
          </p>
          <div className="flex gap-6">
            {['Documentation', 'Components', 'GitHub'].map((link) => (
              <motion.a
                key={link}
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                {link}
              </motion.a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnimationShowcase;
