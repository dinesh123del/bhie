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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-white text-black text-[12px] font-black rounded-full shadow-2xl shadow-white/10 uppercase tracking-widest"
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
      <Navbar />
      <HeroScene3D showParticles showCards showStars>
        <main className="relative z-10 pt-32 px-6 md:px-12">
          {/* HERO SECTION: Extreme Apple Look with 8k Logo Reveal */}
          <section className="max-w-[1400px] mx-auto mb-40 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="space-y-10"
            >

              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, filter: 'blur(20px)', rotateY: -90 }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)', rotateY: 0 }}
                  transition={{ duration: 1.8, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                  className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-white/20 p-2 shadow-[0_0_120px_rgba(79,70,229,0.3)] relative group transform-gpu perspective-[1000px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 rounded-[3rem] opacity-50" />
                  <motion.img
                    src="/icon.png"
                    alt="AERA 8k Logo"
                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="absolute -inset-4 bg-indigo-500/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.6em] text-white/30 block max-w-max mx-auto shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                >
                  AERA / GLOBAL ECONOMIC MISSION
                </motion.span>

                <h1 className="text-[64px] md:text-[130px] font-black leading-[0.82] tracking-[-0.06em] text-white">
                  Eliminating failure. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-800 animate-gradient-slow drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">Globally.</span>
                </h1>

                <p className="text-[20px] md:text-[26px] text-white/40 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
                  The world's first economic resilience platform. <br className="hidden md:block" />
                  Professional-grade financial intelligence for every entrepreneur.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8">
                <motion.button
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="btn-apple bg-white text-black px-16 py-6 text-[20px] font-black tracking-tight"
                >
                  Try It Free
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-apple-outline px-16 py-6 text-[20px] font-black tracking-tight"
                >
                  Watch the Film
                </motion.button>
              </div>
            </motion.div>

            {/* CINEMATIC GLOBE REVEAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="mt-32 relative apple-card p-4 bg-black/40 border-white/5 aspect-video md:aspect-[21/9] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-transparent to-transparent z-10" />
              <InteractiveGlobe />
            </motion.div>
          </section>

          <section id="features" className="max-w-[1400px] mx-auto mb-60">
            <div className="text-center mb-24">
              <h2 className="text-[12px] font-black text-white/20 uppercase tracking-[0.6em] mb-6">How It Works</h2>
              <h3 className="text-[42px] font-black tracking-tight">Everything you need to grow.</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard
                icon={Target}
                title="Economic Autonomy."
                description="Autonomous systems that identify risk and opportunity before they hit your bottom line."
                delay={0.1}
              />
              <FeatureCard
                icon={Globe}
                title="Global Collective."
                description="Contextualize your performance against a world-wide mesh of anonymized business intelligence."
                delay={0.2}
              />
              <FeatureCard
                icon={Zap}
                title="Resilience First."
                description="Our engine prioritizes longevity and stability over short-term growth, ensuring you survive any market."
                delay={0.3}
              />
            </div>
          </section>

          {/* LIVE ACTIVITY COUNTER */}
          <section className="max-w-[1400px] mx-auto mb-40 px-6">
            <LiveActivityCounter />
          </section>

          {/* TESTIMONIALS WALL */}
          <section className="max-w-[1400px] mx-auto mb-40 px-6">
            <TestimonialsWall />
          </section>

          {/* FINAL CALL: Extreme Apple Standard */}
          <section className="max-w-[1400px] mx-auto pb-40 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="apple-card p-24 md:p-32 bg-[#0A0A0B] border-white/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/[0.03] blur-[150px] scale-150" />
              <div className="relative z-10 space-y-12">
                <h2 className="text-[56px] md:text-[92px] font-black tracking-[-0.05em] leading-[0.9] text-white">
                  Ready to <br /> start?
                </h2>
                <motion.button
                  onClick={() => navigate('/register')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-16 py-6 bg-white text-black text-[22px] font-black rounded-full shadow-2xl"
                >
                  Create Free Account
                </motion.button>
              </div>
            </motion.div>
          </section>
        </main>
      </HeroScene3D>

      {/* FOOTER: Deep Minimalist */}
      <footer className="border-t border-white/5 py-40 px-12 bg-black">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="space-y-10">
            <Logo size="sm" showSubtitle={false} />
            <p className="text-[18px] text-white/30 font-medium leading-relaxed tracking-tight">
              Built to help businesses thrive through economic uncertainty.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-12">Platform</h4>
            <ul className="space-y-6 text-[15px] font-black text-white/30 tracking-tight">
              <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              <li><Link to="/ds-hub" className="hover:text-white transition-colors">Data Hub</Link></li>
              <li><Link to="/scan-bill" className="hover:text-white transition-colors">Bill Scanner</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-12">Company</h4>
            <ul className="space-y-6 text-[15px] font-black text-white/30 tracking-tight">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Legal</Link></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-12">Connect</h4>
            <div className="flex flex-col gap-6">
              {['X', 'LinkedIn', 'Github'].map(s => (
                <button key={s} className="text-[15px] font-black text-white/30 text-left hover:text-white transition-colors">{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto pt-24 mt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.4em]">© 2026 AERA ECOSYSTEM. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
