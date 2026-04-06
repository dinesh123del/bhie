import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import WatchDemoModal from '../components/WatchDemoModal';
import { Logo } from '../components/Logo';
import {
  Menu,
  X,
  Play,
  ArrowRight,
  BarChart2,
  List,
  Sparkles,
  Camera,
  ChevronDown,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { PremiumCard } from '../components/ui/PremiumComponents';
import { premiumFeedback } from '../utils/premiumFeedback';

// ======================= NAVIGATION =======================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out border-b border-white/5 ${
        scrolled ? 'bg-[#000000]/80 backdrop-blur-xl' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-[980px] mx-auto px-6 h-14 flex items-center justify-between">
        <Logo size="sm" showSubtitle={false} className="scale-90 opacity-90 hover:opacity-100 transition-opacity" to="/" />
        
        <nav className="hidden md:flex gap-8 text-[12px] font-medium text-white/80 tracking-wide">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">Support</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-[12px] font-medium text-white/80 hover:text-white transition-colors">Sign In</Link>
          <Link 
            to="/register" 
            onClick={() => premiumFeedback.click()}
            onMouseEnter={() => premiumFeedback.haptic(5)}
            className="px-4 py-1.5 bg-white text-black text-[12px] font-semibold rounded-full hover:scale-105 transition-transform"
          >
            Join Free
          </Link>
        </div>

        <button className="md:hidden text-white/80" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1C1C1E] border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              <a href="#features" onClick={() => setMobileOpen(false)} className="text-white/80 text-sm py-2">Features</a>
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-white/80 text-sm py-2 border-t border-white/10">Pricing</a>
              <div className="pt-4 flex gap-4">
                 <Link to="/login" className="flex-1 py-2 text-center text-white/80 text-sm bg-white/10 rounded-lg">Sign In</Link>
                 <Link to="/register" className="flex-1 py-2 text-center text-black text-sm bg-white rounded-lg font-medium">Join Free</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// ======================= HERO =======================
const Hero = ({ onWatchDemo }: { onWatchDemo?: () => void }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 px-6 overflow-hidden bg-black pb-20">
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 max-w-[980px] mx-auto flex flex-col items-center text-center mt-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h1 className="text-[48px] md:text-[80px] font-bold text-white tracking-tight leading-[1.05] mb-6">
            Business intelligence. <br/>
            <span className="bg-gradient-to-r from-[#007AFF] via-[#AF52DE] to-[#FF2D55] bg-clip-text text-transparent">
              Reimagined.
            </span>
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-[19px] md:text-[24px] text-[#A1A1A6] max-w-[750px] mx-auto mb-12 font-medium tracking-tight leading-relaxed"
        >
          Elite financial intelligence. Instant receipt scanning. A sophisticated, high-fidelity engine built precisely for the modern entrepreneur.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Link 
            to="/register" 
            onClick={() => premiumFeedback.click()}
            onMouseEnter={() => premiumFeedback.haptic(5)}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black hover:bg-white/90 text-[17px] font-semibold rounded-full transition-all flex items-center justify-center gap-2"
          >
            Start free <ArrowRight className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => {
              premiumFeedback.click();
              onWatchDemo?.();
            }}
            className="w-full sm:w-auto px-8 py-3.5 text-white text-[17px] font-medium rounded-full transition-all flex items-center justify-center gap-2 hover:bg-white/5"
          >
            Watch the film <Play className="w-4 h-4 opacity-80" />
          </button>
        </motion.div>
      </motion.div>

      {/* Hero UI Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 150, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.5, delay: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="mt-20 w-full max-w-[1024px] relative perspective-1000"
      >
        <div className="absolute inset-0 bg-[#007AFF] blur-[150px] opacity-10 rounded-full" />
        <div className="relative rounded-2xl bg-[#1C1C1E]/50 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl apple-card">
           <div className="h-10 bg-[#2C2C2E]/30 flex items-center justify-center relative border-b border-white/5">
             <div className="absolute left-4 flex gap-2">
               <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
               <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
               <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
             </div>
             <div className="text-[12px] text-white/40 font-medium">Dashboard</div>
           </div>
           <div className="aspect-[16/9] bg-gradient-to-br from-[#1C1C1E] to-[#000000] relative overflow-hidden flex items-center justify-center">
              {/* Minimalist Dashboard Representation */}
              <div className="w-3/4 h-3/4 flex gap-6">
                 <div className="flex-[2] flex flex-col gap-6">
                    <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 flex flex-col p-6">
                       <div className="w-1/3 h-4 bg-white/10 rounded-full mb-4" />
                       <div className="flex-1 w-full flex items-end gap-2 pb-2">
                          {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                             <motion.div 
                               key={i} 
                               initial={{ height: 0 }} 
                               animate={{ height: `${h}%` }} 
                               transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                               className="flex-1 bg-gradient-to-t from-[#007AFF] to-[#AF52DE] rounded-sm opacity-80" 
                             />
                          ))}
                       </div>
                    </div>
                    <div className="h-1/3 bg-white/5 rounded-2xl border border-white/5 p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#FF2D55]/20 flex items-center justify-center">
                          <Camera className="w-5 h-5 text-[#FF2D55]" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="w-1/2 h-3 bg-white/20 rounded-full" />
                          <div className="w-full h-2 bg-white/5 rounded-full" />
                        </div>
                    </div>
                 </div>
                 <div className="flex-[1] bg-white/5 rounded-2xl border border-white/5 p-6">
                    <div className="w-1/2 h-4 bg-white/10 rounded-full mb-6" />
                    <div className="flex flex-col gap-4">
                       {[1, 2, 3, 4].map(i => (
                         <div key={i} className="w-full h-10 bg-white/[0.03] rounded-lg border border-white/5 flex items-center px-4">
                           <div className="w-6 h-6 rounded bg-white/10" />
                           <div className="ml-3 w-1/2 h-2 bg-white/10 rounded-full" />
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </section>
  );
};

// ======================= FEATURES =======================
const Features = () => {
  return (
    <section id="features" className="py-32 px-6 bg-[#000000]">
      <div className="max-w-[980px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-[32px] md:text-[48px] font-bold text-white tracking-tight mb-4">Brilliant. By design.</h2>
          <p className="text-[19px] text-[#A1A1A6] max-w-[600px] mx-auto">Everything you need to master your business, built directly into one elegant application.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           <div className="apple-card p-10 md:p-12 min-h-[400px] flex flex-col col-span-1 md:col-span-2 relative overflow-hidden group hover:border-[#007AFF]/30 border border-[#1C1C1E]">
             <div className="relative z-10 w-full md:w-1/2">
               <Sparkles className="w-8 h-8 text-[#007AFF] mb-6" />
               <h3 className="text-[28px] font-bold text-white tracking-tight mb-3">Intelligence that works for you.</h3>
               <p className="text-[#A1A1A6] text-[17px] leading-relaxed">Simply upload an image of your receipt. Our Apple-grade AI reads the context, amount, date, and vendor in milliseconds.</p>
             </div>
             <div className="absolute right-0 bottom-0 top-0 w-full md:w-1/2 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-700 mask-radial" />
           </div>

           <div className="apple-card p-10 hover:border-[#AF52DE]/30 border border-[#1C1C1E] transition-colors">
              <BarChart2 className="w-8 h-8 text-[#AF52DE] mb-6" />
              <h3 className="text-[24px] font-bold text-white tracking-tight mb-3">Clear insights.</h3>
              <p className="text-[#A1A1A6] text-[17px] leading-relaxed">No confusing spreadsheets. Just beautiful, fluid charts that tell you exactly how your business is moving.</p>
           </div>

           <div className="apple-card p-10 hover:border-[#FF2D55]/30 border border-[#1C1C1E] transition-colors">
              <ShieldCheck className="w-8 h-8 text-[#FF2D55] mb-6" />
              <h3 className="text-[24px] font-bold text-white tracking-tight mb-3">Bank-grade security.</h3>
              <p className="text-[#A1A1A6] text-[17px] leading-relaxed">Your data is yours. Protected by industry-leading encryption so you can focus entirely on your growth.</p>
           </div>
        </div>
      </div>
    </section>
  );
};

// ======================= HOW IT WORKS =======================
const HowItWorks = () => (
  <section id="how-it-works" className="py-32 px-6 bg-[#000000] relative">
    <div className="max-w-[980px] mx-auto border-t border-[#1C1C1E] pt-32">
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className="w-full md:w-1/2">
          <h2 className="text-[40px] font-bold text-white tracking-tight mb-6">Seamless workflow.</h2>
          <div className="space-y-8">
            {[
              { title: "Snap a photo", desc: "Use your device to capture any expense." },
              { title: "Auto-sync", desc: "It appears instantly across all your devices." },
              { title: "Analyze", desc: "We sort it and add it to your financial story." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center text-[14px] font-bold text-[#A1A1A6] border border-white/5 flex-shrink-0 mt-1">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-[19px] font-bold text-white tracking-tight mb-1">{item.title}</h3>
                  <p className="text-[#A1A1A6] text-[15px]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2 relative">
           <div className="apple-card aspect-[4/5] bg-gradient-to-b from-[#1C1C1E] to-black w-full max-w-sm mx-auto p-4 flex flex-col justify-end relative shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#007AFF] to-transparent opacity-10 blur-2xl" />
              <div className="w-full h-1/2 bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col gap-4 relative z-10 translate-y-4 group-hover:-translate-y-2 transition-transform duration-700 ease-[0.2,0.8,0.2,1]">
                 <div className="w-3/4 h-6 bg-white/10 rounded-lg" />
                 <div className="w-1/2 h-4 bg-white/5 rounded-lg" />
                 <div className="mt-auto w-full h-12 bg-[#007AFF] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                   Scan Complete
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

// ======================= PRICING =======================
const Pricing = () => {
  const plans = [
    { name: "Starter", price: "0", features: ["5 Smart Scans/mo", "Basic Analytics", "Community Support"] },
    { name: "Pro", price: "59", features: ["Unlimited Scans", "Advanced AI Insights", "Priority Support"] }
  ];

  return (
    <section id="pricing" className="py-32 px-6 bg-[#000000]">
      <div className="max-w-[980px] mx-auto text-center border-t border-[#1C1C1E] pt-32">
        <h2 className="text-[40px] md:text-[56px] font-bold text-white tracking-tight mb-4">Choose your plan.</h2>
        <p className="text-[19px] text-[#A1A1A6] mb-16">Simple, transparent pricing. Designed for everyone.</p>

        <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`apple-card p-10 text-left border ${i === 1 ? 'border-[#007AFF]/30' : 'border-[#1C1C1E]'}`}>
               <h3 className="text-[24px] font-bold text-white tracking-tight mb-2">{plan.name}</h3>
               <div className="flex items-baseline gap-1 mb-8">
                 <span className="text-[48px] font-bold text-white tracking-tighter">₹{plan.price}</span>
                 <span className="text-[#A1A1A6] font-medium">/mo</span>
               </div>
               <div className="space-y-4 mb-10">
                 {plan.features.map((f, j) => (
                   <div key={j} className="flex items-center gap-3">
                     <Check className="w-4 h-4 text-[#007AFF]" />
                     <span className="text-[15px] text-[#A1A1A6]">{f}</span>
                   </div>
                 ))}
               </div>
               <Link 
                 to="/register"
                 className={`w-full py-3.5 rounded-full font-semibold flex items-center justify-center transition-colors ${
                   i === 1 ? 'bg-white text-black hover:bg-white/90' : 'bg-[#1C1C1E] text-white hover:bg-[#2C2C2E]'
                 }`}
               >
                 Get Started
               </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ======================= FOOTER =======================
const Footer = () => (
  <footer className="py-12 px-6 bg-[#000000] border-t border-[#1C1C1E]">
    <div className="max-w-[980px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <Logo size="sm" showSubtitle={false} />
      <div className="flex gap-6 text-[12px] text-[#A1A1A6]">
        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>
      <div className="text-[12px] text-[#A1A1A6]">Copyright © 2026 BHIE Ecosystem. All rights reserved.</div>
    </div>
  </footer>
);

// ======================= MAIN =======================
export default function LandingPremium() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="bg-[#000000] min-h-screen text-white font-sans overflow-x-hidden selection:bg-[#007AFF]/30 selection:text-white">
      <WatchDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <Navbar />
      <main>
        <Hero onWatchDemo={() => setDemoOpen(true)} />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
