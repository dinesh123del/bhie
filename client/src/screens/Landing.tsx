"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Play,
  Menu,
  X,
  Star as StarIcon,
  Sparkles,
  Camera,
  Target,
  Globe
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { premiumFeedback } from '../utils/premiumFeedback';
import SparkBackground from '../components/ui/SparkBackground';
import InteractiveGlobe from '../components/ui/InteractiveGlobe';
import TestimonialsWall from '../components/TestimonialsWall';
import LiveActivityCounter from '../components/LiveActivityCounter';
import { HeroScene3D, HeroScene3DLight } from '../components/3d/scenes';
import DemoVideoHero from '../components/welcome/DemoVideoHero';
import SEO from '../components/SEO';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 border-b border-white/5 ${scrolled ? 'bg-black/80 backdrop-blur-3xl' : 'bg-transparent border-transparent'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
        <Logo size="sm" showSubtitle={false} to="/" />

        <nav className="hidden md:flex gap-12 text-[11px] font-black text-white/30 tracking-[0.3em] uppercase">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#showcase" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/login" className="text-[11px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.3em]">Sign In</Link>
          <motion.button
            onClick={() => {
              premiumFeedback.click();
              navigate('/register');
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-2.5 bg-white text-black text-[11px] font-black rounded-full shadow-2xl uppercase tracking-[0.2em] transition-all hover:bg-indigo-50"
          >
            Get Started
          </motion.button>
        </div>

        <button className="md:hidden text-white/80" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-20 bg-black/95 backdrop-blur-3xl z-40 p-12"
          >
            <div className="flex flex-col gap-10">
              <a href="#features" onClick={() => setMobileOpen(false)} className="text-[32px] font-black text-white tracking-tight">Features.</a>
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-[32px] font-black text-white tracking-tight">Pricing.</a>
              <div className="pt-12 flex flex-col gap-6">
                <Link to="/login" className="w-full py-6 text-center text-white/40 text-[12px] font-black bg-white/5 rounded-3xl uppercase tracking-[0.4em]">Sign In</Link>
                <Link to="/register" className="w-full py-6 text-center text-black text-[12px] font-black bg-white rounded-3xl uppercase tracking-[0.4em]">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
    whileHover={{ y: -10 }}
    className="apple-card p-12 bg-[#0A0A0B] border-white/5 group"
  >
    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-[24px] font-black text-white mb-4 tracking-tight leading-tight">{title}</h3>
    <p className="text-[17px] text-white/40 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

export default function LandingPagePremium() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <SEO 
        title="Biz Plus — Economic Intelligence Ecosystem"
        description="Eliminate business failure with Biz Plus. Autonomous financial intelligence, automated bill scanning, and global economic resilience for every entrepreneur."
      />
      <Navbar />
      
      <HeroScene3D>
        <DemoVideoHero />
        
        <main className="relative z-10 pt-48 px-6 md:px-12 flex flex-col items-center">
          {/* HERO SECTION: ULTRA PREMIUM REVEAL */}
          <section className="max-w-[1400px] w-full mx-auto mb-60 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >

              <div className="flex justify-center mb-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-32 h-32 md:w-56 md:h-56 rounded-[3.5rem] bg-black/50 backdrop-blur-3xl border border-white/10 p-3 shadow-[0_0_150px_rgba(79,70,229,0.2)] relative group perspective-[1000px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-purple-500/20 rounded-[3.5rem] opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
                  <motion.img
                    src="/icon.png"
                    alt="BIZ PLUS Icon"
                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl brightness-125"
                    animate={{ y: [0, -8, 0], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="absolute -inset-8 bg-indigo-500/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                </motion.div>
              </div>

              <div className="space-y-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-8"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">
                    Official Global Launch 2026
                  </span>
                </motion.div>

                <h1 className="text-[72px] md:text-[140px] font-black leading-[0.75] tracking-[-0.07em] text-white drop-shadow-[0_25px_60px_rgba(0,0,0,0.9)] perspective-[1000px]">
                  Economic <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-indigo-100 to-indigo-600 inline-block drop-shadow-[0_0_40px_rgba(99,102,241,0.4)] px-4">Power.</span>
                </h1>

                <p className="text-[20px] md:text-[28px] text-white/50 max-w-4xl mx-auto font-medium leading-tight tracking-tight mt-12 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30">
                  The most advanced business resilience platform ever built. <br className="hidden md:block" />
                  Elite intelligence for every entrepreneur, everywhere.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-10 pt-20">
                <motion.button
                  whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="bg-white text-black px-20 py-7 text-[22px] font-black tracking-tight rounded-full transition-all duration-300"
                >
                  Get Started
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-white/20 text-white px-20 py-7 text-[22px] font-black tracking-tight rounded-full transition-all duration-300 backdrop-blur-3xl"
                >
                  Watch Film
                </motion.button>
              </div>
            </motion.div>

            {/* CINEMATIC GLOBE SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-60 relative w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-3xl group"
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020203] to-transparent z-10" />
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
              <InteractiveGlobe />
            </motion.div>
          </section>

          {/* FEATURES GRID: REDEFINED */}
          <section id="features" className="max-w-[1400px] w-full mx-auto mb-80">
            <div className="text-center mb-32 space-y-6">
              <h2 className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.8em] mb-4">Ecosystem Architecture</h2>
              <h3 className="text-[48px] md:text-[82px] font-black tracking-[-0.04em] leading-tight max-w-4xl mx-auto">
                Built for the new <br /> economic reality.
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 px-4">
              <FeatureCard
                icon={Target}
                title="Economic Autonomy."
                description="Autonomous agents that identify risk and opportunity before they hit your bottom line."
                delay={0.1}
              />
              <FeatureCard
                icon={Globe}
                title="Global Ledger."
                description="Contextualize your performance against a world-wide mesh of real-time business intelligence."
                delay={0.2}
              />
              <FeatureCard
                icon={Zap}
                title="Resilience First."
                description="Our engine prioritizes longevity and stability, ensuring you thrive in any market condition."
                delay={0.3}
              />
            </div>
          </section>

          {/* LIVE ACTIVITY COUNTER */}
          <section className="max-w-[1400px] w-full mx-auto mb-60 px-6">
            <LiveActivityCounter />
          </section>

          {/* TESTIMONIALS */}
          <section className="max-w-[1400px] w-full mx-auto mb-60 px-6">
            <div className="text-center mb-24">
               <h3 className="text-[42px] font-black tracking-tight">Trusted by Founders Everywhere.</h3>
            </div>
            <TestimonialsWall />
          </section>

          {/* FINAL CTA */}
          <section className="max-w-[1400px] w-full mx-auto pb-60 text-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-32 md:p-48 bg-gradient-to-b from-[#0A0A0B] to-black border border-white/5 rounded-[4rem] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-indigo-500/10 blur-[150px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
              <div className="relative z-10 space-y-20">
                <h2 className="text-[64px] md:text-[110px] font-black tracking-[-0.06em] leading-[0.85] text-white">
                  Join the <br /> 
                  <span className="text-white/20 group-hover:text-white transition-colors duration-1000">Future Today.</span>
                </h2>
                <motion.button
                  onClick={() => navigate('/register')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-24 py-8 bg-white text-black text-[24px] font-black rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-white/20 transition-all"
                >
                  Create Your Account
                </motion.button>
              </div>
            </motion.div>
          </section>
        </main>
      </HeroScene3D>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-48 pb-24 px-12 bg-[#020203]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-32">
          <div className="space-y-12">
            <Logo size="sm" showSubtitle={false} />
            <p className="text-[18px] text-white/30 font-medium leading-relaxed tracking-tight max-w-xs">
              Empowering entrepreneurs with industrial-grade economic intelligence.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em] mb-12">Platform</h4>
            <ul className="space-y-6 text-[15px] font-black text-white/30 tracking-tight">
              <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              <li><Link to="/ds-hub" className="hover:text-white transition-colors">Neural Hub</Link></li>
              <li><Link to="/scan-bill" className="hover:text-white transition-colors">A.I. Scanner</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em] mb-12">Company</h4>
            <ul className="space-y-6 text-[15px] font-black text-white/30 tracking-tight">
              <li><Link to="/about" className="hover:text-white transition-colors">Vision</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
          <div className="space-y-12">
            <h4 className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em] mb-12">Connect</h4>
            <div className="flex flex-col gap-6">
              {['Twitter', 'LinkedIn', 'Discord'].map(s => (
                <button key={s} className="text-[15px] font-black text-white/30 text-left hover:text-white transition-colors">{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto pt-32 mt-32 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">© 2026 BIZ PLUS ECOSYSTEM INC. ALL DEPLOYMENTS NOMINAL.</p>
        </div>
      </footer>
    </div>
  );
}
