import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Play,
  ArrowRight,
  BarChart2,
  BrainCircuit,
  MessageSquare,
  FileText,
  Activity,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { PremiumCard } from '../components/ui/PremiumComponents';
import { premiumFeedback } from '../utils/premiumFeedback';

// ======================= NETFLIX-STYLE INTRO =======================
const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    // We intentionally don't play actual audio here as modern browsers block un-interacted autoplay,
    // but the visual scale-up provides the haptic/mental "tadum" feeling.
    const timer = setTimeout(onComplete, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 3.5, ease: 'easeOut' }}
    >
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1, 1, 150], opacity: [0, 1, 1, 0] }}
        transition={{ 
          duration: 3.8, 
          times: [0, 0.15, 0.7, 1], 
          ease: [0.11, 0, 0.5, 0] // Expo-in-out feel
        }}
      >
        <span 
          className="text-[8rem] md:text-[16rem] font-black tracking-tighter"
          style={{
            color: '#38bdf8',
            textShadow: '0 0 50px rgba(56,189,248,0.8), 0 0 100px rgba(56,189,248,0.4)',
            fontFamily: '"Bebas Neue", "Arial Black", sans-serif'
          }}
        >
          BHIE
        </span>
      </motion.div>
    </motion.div>
  );
};

// ======================= NAVIGATION =======================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-3xl font-black text-white tracking-tighter">BHIE<span className="text-sky-500">.</span></Link>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/80">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-white hover:text-white/80 transition-colors">Sign In</Link>
          <Link 
            to="/register" 
            onClick={() => premiumFeedback.click()}
            onMouseEnter={() => premiumFeedback.haptic(5)}
            className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold rounded transiton-all shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            Start Free
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 inset-x-0 bg-black border-b border-white/10 flex flex-col p-6 gap-6 shadow-2xl"
          >
            <a href="#features" onClick={() => setMobileOpen(false)} className="text-white text-lg font-medium">Features</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-white text-lg font-medium">Pricing</a>
            <a href="#faq" onClick={() => setMobileOpen(false)} className="text-white text-lg font-medium">FAQ</a>
            <Link 
              to="/register" 
              onClick={() => {
                setMobileOpen(false);
                premiumFeedback.click();
              }} 
              className="py-3 bg-sky-500 text-center text-white font-bold rounded"
            >
              Start Free
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const floatingVariant = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const Hero = () => (
  <section className="relative min-h-[100svh] flex items-center justify-center pt-20 px-6 overflow-hidden">
    <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
      <motion.div
        variants={floatingVariant}
        animate="animate"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
          TRACK EXPENSES<br/>
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(56,189,248,0.4)]">AUTOMATICALLY FROM RECEIPTS</span>
        </h1>
        <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-10 font-medium">
          Save time on your accounts. Scan any receipt, and BHIE organizes your business spending with real-time reports and insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/register" 
            onClick={() => premiumFeedback.click()}
            onMouseEnter={() => premiumFeedback.haptic(5)}
            className="w-full sm:w-auto px-10 py-4 bg-white text-slate-950 hover:bg-white/90 text-lg font-black rounded transition-all flex items-center justify-center gap-2 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <button 
            onClick={() => {
              premiumFeedback.click();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white text-lg font-bold rounded transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md"
          >
            <Play className="w-5 h-5 fill-current" /> Watch Demo
          </button>
        </div>
      </motion.div>

      {/* Cinematic Dashboard Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
        className="mt-20 w-full max-w-4xl relative"
      >
        <div className="absolute inset-0 bg-sky-500 blur-[100px] opacity-20" />
        <div className="relative rounded-t-xl bg-[#0a0a0a] border border-[#333] border-b-0 overflow-hidden shadow-2xl">
           <div className="h-6 bg-[#1a1a1a] flex items-center px-4 gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
             <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
           </div>
           <div className="aspect-[16/9] bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-50 contrast-125 saturate-50 mix-blend-luminosity" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
      </motion.div>
    </div>
  </section>
);

// ======================= PROBLEM =======================
const Problem = () => (
  <section className="py-24 px-6 bg-[#0a0a0a]/95 border-t border-[#222]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-white">The old way is <span className="text-sky-400">broken</span>.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
         {[
           { title: "Manual Entry Pain", desc: "You waste hours typing data from paper receipts into old spreadsheets." },
           { title: "Tax Compliance Stress", desc: "You struggle to find that one specific receipt during tax season." },
           { title: "Spending Blindness", desc: "You don't know your real-time budget until it's too late." },
         ].map((item, i) => (
           <PremiumCard 
             extreme
             key={i}
             delay={i * 0.15}
             className="backdrop-blur-3xl bg-white/[0.01]"
           >
              <div className="w-12 h-12 bg-sky-950/40 border border-sky-500/20 flex items-center justify-center rounded-xl flex-shrink-0 mb-6">
                <X className="text-sky-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-white/50">{item.desc}</p>
           </PremiumCard>
         ))}
      </div>
    </div>
  </section>
);

// ======================= SOLUTION =======================
const Solution = () => (
  <section className="py-24 px-6 bg-black relative overflow-hidden">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
      <div className="w-full md:w-1/2">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Your Professional<br/>Business Assistant</h2>
          <p className="text-xl text-white/50 mb-8 max-w-lg">
            BHIE shifts your business from manual tracking to automated execution, surfacing actionable insights out of the noise.
          </p>
          <ul className="space-y-4">
             {[
               "AI-Powered Receipt Scanning",
               "Automatic Expense Categorization",
               "Real-time Profit & Loss Dashboard"
             ].map((str, i) => (
               <li key={i} className="flex items-center gap-4 text-white text-lg font-medium">
                 <CheckCircle className="text-[#E50914] w-6 h-6 flex-shrink-0" /> {str}
               </li>
             ))}
          </ul>
        </motion.div>
      </div>
      <div className="w-full md:w-1/2 relative">
         <div className="absolute inset-0 bg-[#E50914] blur-[120px] opacity-10 rounded-full" />
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }} 
           whileInView={{ opacity: 1, scale: 1 }} 
           viewport={{ once: true }}
           className="relative aspect-square bg-[#111] border border-[#333] rounded-2xl flex items-center justify-center p-8 overflow-hidden shadow-2xl"
         >
            {/* Abstract visual of AI Assistant */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.1)_0%,rgba(0,0,0,1)_100%)]" />
            <BrainCircuit className="w-32 h-32 text-[#E50914] opacity-80" />
         </motion.div>
      </div>
    </div>
  </section>
);

// ======================= FEATURES =======================
const Features = () => {
  const cards = [
    { icon: Activity, title: "Instant Scan", desc: "Snap a photo of any receipt. Our AI extracts merchant, date, and amount in seconds." },
    { icon: BarChart2, title: "Smart Categorization", desc: "Automatically groups spending into Tax, Business, and Personal categories." },
    { icon: BrainCircuit, title: "Real-time Analytics", desc: "See your daily profit and loss at a glance with high-contrast charts." },
    { icon: MessageSquare, title: "WhatsApp Input", desc: "Record expenses directly by texting our simple WhatsApp bot." },
    { icon: FileText, title: "OCR Document Parsing", desc: "Upload chaotic PDFs or image folders and watch them become structured data." },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-[#0a0a0a]/95 border-y border-[#222]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl text-center md:text-5xl font-black text-white mb-16">The Business <span className="text-[#E50914]">Features</span></h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((f, i) => (
             <PremiumCard 
               key={i}
               hoverable
               delay={i * 0.1}
               className={`bg-black/40 border-white/5 transition-colors hover:border-[#E50914]/50 ${i === 0 ? 'lg:col-span-2' : ''}`}
             >
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#E50914]/10 transition-colors">
                 <f.icon className="w-6 h-6 text-white group-hover:text-[#E50914] transition-colors" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
               <p className="text-white/50 leading-relaxed">{f.desc}</p>
             </PremiumCard>
          ))}
        </div>
      </div>
    </section>
  );
};

// ======================= HOW IT WORKS =======================
const HowItWorks = () => (
  <section id="how-it-works" className="py-24 px-6 bg-black relative">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">How it <span className="text-[#E50914]">Works</span></h2>
      <div className="flex flex-col md:flex-row justify-between gap-12 relative">
        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-[#333] z-0" />
        
        {[
          { icon: ShieldCheck, title: "1. Snap", desc: "Take a photo of your receipt or upload a PDF." },
          { icon: Activity, title: "2. Process", desc: "Our AI engines structure the data and categorize it." },
          { icon: BrainCircuit, title: "3. Analyze", desc: "Watch your dashboard update with actionable insights." }
        ].map((item, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3">
             <div className="w-16 h-16 rounded-full bg-black border-[4px] border-[#333] flex items-center justify-center mb-6 text-white font-black text-xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
               <item.icon className="w-6 h-6 text-[#E50914]" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
             <p className="text-white/50">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ======================= PRICING =======================
const Pricing = () => {
  const planData = [
    { name: "FREE", price: "0", features: ["Business Analytics", "Manual Entry", "Simple Dashboard", "Basic Support"], highlight: false },
    { name: "PRO", price: "59", features: ["Insights & Advice", "Daily Action List", "File Uploads", "Priority Support"], highlight: true },
    { name: "BUSINESS", price: "119", features: ["Unlimited Records", "Team Access", "Custom Reports", "Dedicated Support"], highlight: false },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-[#0a0a0a]/95 border-t border-[#222]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">Select Your <span className="text-[#E50914]">Tier</span></h2>
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {planData.map((plan, i) => (
            <PremiumCard 
              key={i}
              extreme={plan.highlight}
              className={`relative border ${plan.highlight ? 'border-transparent' : 'border-white/5'} bg-black group`}
            >
               {plan.highlight && (
                 <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1 bg-[#E50914] text-white text-[10px] font-black tracking-widest uppercase rounded-full z-20">
                   Popular
                 </div>
               )}
               <h3 className="text-sm font-black text-white/40 tracking-[0.2em] uppercase mb-4">{plan.name}</h3>
               <div className="text-5xl font-black text-white mb-8 tracking-tighter">
                 ₹{plan.price}<span className="text-lg text-white/20 font-medium tracking-normal ml-1">/mo</span>
               </div>
               <ul className="space-y-4 mb-8">
                 {plan.features.map((f, j) => (
                   <li key={j} className="flex items-center gap-3 text-white/60 text-sm font-medium">
                     <CheckCircle className={`w-5 h-5 ${plan.highlight ? 'text-[#E50914]' : 'text-white/20'}`} /> {f}
                   </li>
                 ))}
               </ul>
               <Link 
                 to="/register" 
                 onClick={() => premiumFeedback.click()}
                 onMouseEnter={() => premiumFeedback.haptic(5)}
                 className={`w-full py-4 rounded-xl font-bold transition-all block text-center text-sm tracking-tight ${
                   plan.highlight 
                     ? 'bg-white text-black hover:bg-white/90 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]' 
                     : 'bg-white/5 text-white hover:bg-white/10'
                 }`}
               >
                 Choose Plan
               </Link>
            </PremiumCard>
          ))}
        </div>
      </div>
    </section>
  );
};

// ======================= TESTIMONIALS =======================
const Testimonials = () => (
  <section className="py-24 px-6 bg-black">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">Classified <span className="text-[#E50914]">Success</span></h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: "M. Torres", role: "Logistics Director", initial: "M", text: "The predictive alerts intercepted a massive stock shortage before it cascaded down to client deliveries." },
          { name: "S. Jenkins", role: "Retail Operations", initial: "S", text: "Finally, an analytics engine that doesn't just show charts, but issues direct execution commands." },
          { name: "J. Chang", role: "Agency Founder", initial: "J", text: "BHIE’s webhook ingestion completely eliminated manual data entry. We are moving 100x faster." }
        ].map((t, i) => (
          <div key={i} className="p-8 border border-[#222] bg-[#050505] rounded-xl flex flex-col justify-between">
            <p className="text-white/60 italic leading-relaxed mb-8">"{t.text}"</p>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-[#E50914] flex items-center justify-center text-white font-bold">{t.initial}</div>
               <div>
                  <h4 className="text-white font-bold">{t.name}</h4>
                  <p className="text-xs text-[#E50914] tracking-widest uppercase">{t.role}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ======================= FAQ =======================
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const questions = [
    { q: "Is my business data secure?", a: "Yes. BHIE uses bank-level encryption and secure tokens. Your private info is never shared or stored insecurely." },
    { q: "Do I need a developer to set it up?", a: "No. The system works as soon as you log in. You can start by uploading a receipt immediately." },
    { q: "Which businesses can use BHIE?", a: "The system works for all types of businesses, including Retail, Freelance, Agencies, and E-commerce." }
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-[#0a0a0a]/95 border-t border-[#222]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-black text-white text-center mb-16">Briefings</h2>
        <div className="space-y-4">
          {questions.map((faq, i) => (
            <div key={i} className="border border-[#333] bg-black rounded-xl overflow-hidden">
               <button 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-white font-bold"
               >
                 {faq.q}
                 <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === i ? 'rotate-180 text-[#E50914]' : 'text-white/50'}`} />
               </button>
               <AnimatePresence>
                  {openIndex === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                       <p className="px-6 pb-5 text-white/50 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ======================= FINAL CTA =======================
const CTA = () => (
  <section className="py-32 px-6 bg-[#E50914] text-center relative overflow-hidden">
     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-multiply opacity-20" />
     <div className="relative z-10 max-w-3xl mx-auto">
       <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none">Start Today</h2>
       <p className="text-xl text-white/80 font-medium mb-10">Stop tracking manually. Start your trial today and take control of your business.</p>
       <Link 
         to="/register" 
         onClick={() => premiumFeedback.click()}
         onMouseEnter={() => premiumFeedback.haptic(5)}
         className="inline-block px-12 py-5 bg-black hover:bg-[#111] text-white text-lg font-black tracking-widest uppercase rounded shadow-2xl transition-all border border-black hover:border-white/20"
       >
         Start Free Now
       </Link>
     </div>
  </section>
);

// ======================= FOOTER =======================
const Footer = () => (
  <footer className="py-12 px-6 bg-black border-t border-[#222]">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-2xl font-black text-[#E50914] tracking-tighter">BHIE</div>
      <div className="flex gap-6 text-sm text-white/50">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
      </div>
      <div className="text-sm text-white/30">© 2026 ANTIGRAVITY. All rights reserved.</div>
    </div>
  </footer>
);

// ======================= MAIN ASSEMBLY =======================
export default function LandingPremium() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
