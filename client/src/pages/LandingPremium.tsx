import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import WatchDemoModal from '../components/WatchDemoModal';
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
        <div className="flex flex-col">
          <Link to="/" className="text-3xl font-black text-white tracking-tighter leading-none">BHIE<span className="text-sky-500">.</span></Link>
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-1 opacity-80 hidden md:block">Plain English Business</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/80">
          <a href="#features" className="hover:text-white transition-colors">Our Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">Help</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-white hover:text-white/80 transition-colors">Sign In</Link>
          <Link 
            to="/register" 
            onClick={() => premiumFeedback.click()}
            onMouseEnter={() => premiumFeedback.haptic(5)}
            className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold rounded transiton-all shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            Join Free
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

const Hero = ({ onWatchDemo }: { onWatchDemo?: () => void }) => (
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
          STOP TYPING BILLS.<br/>
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(56,189,248,0.4)] uppercase">OUR SMART ASSISTANT READS THEM FOR YOU</span>
        </h1>
        <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-10 font-medium">
          Just snap a photo of any receipt. We'll handle the math and show you exactly where your money goes — in plain English.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/register" 
            onClick={() => premiumFeedback.click()}
            onMouseEnter={() => premiumFeedback.haptic(5)}
            className="w-full sm:w-auto px-10 py-4 bg-white text-slate-950 hover:bg-white/90 text-lg font-black rounded transition-all flex items-center justify-center gap-2 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Try It Free <ArrowRight className="w-5 h-5" />
          </Link>
          <button 
            onClick={() => {
              premiumFeedback.click();
              onWatchDemo?.();
            }}
            className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white text-lg font-bold rounded transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md"
          >
            <Play className="w-5 h-5 fill-current" /> See How It Works
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
           <div className="aspect-[16/9] bg-[url('/demo.png')] bg-cover bg-center opacity-90 contrast-110 saturate-100" />
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
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase">Old spreadsheets are <span className="text-sky-400">boring and slow</span>.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
         {[
           { title: "Tired of Typing?", desc: "Stop wasting your evenings typing numbers from paper receipts. Let us do the work." },
           { title: "No More Lost Bills", desc: "Never hunt for a missing receipt again. They are all organized in one safe place." },
           { title: "Know Your Profit Now", desc: "Don't wait for your accountant to tell you how much money you have left." },
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
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Your Smart<br/>Business Buddy</h2>
          <p className="text-xl text-white/50 mb-8 max-w-lg">
            We turn your messy pile of receipts into a clear story. No jargon, just the facts you need to grow your business.
          </p>
          <ul className="space-y-4">
             {[
               "Smart Photo Scanning",
               "Auto-Sorting of Bills",
               "Real-time Profit Updates"
             ].map((str, i) => (
               <li key={i} className="flex items-center gap-4 text-white text-lg font-medium">
                 <CheckCircle className="text-sky-500 w-6 h-6 flex-shrink-0" /> {str}
               </li>
             ))}
          </ul>
        </motion.div>
      </div>
      <div className="w-full md:w-1/2 relative">
         <div className="absolute inset-0 bg-sky-500 blur-[120px] opacity-10 rounded-full" />
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }} 
           whileInView={{ opacity: 1, scale: 1 }} 
           viewport={{ once: true }}
           className="relative aspect-square bg-[#111] border border-[#333] rounded-2xl flex items-center justify-center p-8 overflow-hidden shadow-2xl"
         >
            {/* Abstract visual of AI Assistant */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1)_0%,rgba(0,0,0,1)_100%)]" />
            <BrainCircuit className="w-32 h-32 text-sky-500 opacity-80" />
         </motion.div>
      </div>
    </div>
  </section>
);

// ======================= FEATURES =======================
const Features = () => {
  const cards = [
    { icon: Activity, title: "Snap & Scan", desc: "Just take a photo. Our system reads the shop name, date, and price in a second." },
    { icon: BarChart2, title: "Auto-Sorting", desc: "We automatically group your spending so you know what's for work and what's personal." },
    { icon: BrainCircuit, title: "Simple Insights", desc: "See your daily money in and out with clear, easy-to-read charts." },
    { icon: MessageSquare, title: "Chat to Add", desc: "Record expenses directly by texting our simple WhatsApp assistant." },
    { icon: FileText, title: "Smart Reader", desc: "Upload messy PDFs or folders of photos and watch them turn into organized lists." },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-[#0a0a0a]/95 border-y border-[#222]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl text-center md:text-5xl font-black text-white mb-16 uppercase">Built to <span className="text-sky-400">Help You</span></h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((f, i) => (
             <PremiumCard 
               key={i}
               hoverable
               delay={i * 0.1}
               className={`bg-black/40 border-white/5 transition-colors hover:border-sky-500/50 ${i === 0 ? 'lg:col-span-2' : ''}`}
             >
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-sky-500/10 transition-colors">
                 <f.icon className="w-6 h-6 text-white group-hover:text-sky-400 transition-colors" />
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
      <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16 uppercase">How it <span className="text-sky-400">Works</span></h2>
      <div className="flex flex-col md:flex-row justify-between gap-12 relative">
        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-[#333] z-0" />
        
        {[
          { icon: ShieldCheck, title: "1. Take a Pic", desc: "Snap a photo of your receipt with your phone." },
          { icon: Activity, title: "2. We Read It", desc: "Our smart system fills in all the details for you." },
          { icon: BrainCircuit, title: "3. You Grow", desc: "See exactly where your money goes and save more." }
        ].map((item, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center text-center w-full md:w-1/3">
             <div className="w-16 h-16 rounded-full bg-black border-[4px] border-[#333] flex items-center justify-center mb-6 text-white font-black text-xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
               <item.icon className="w-6 h-6 text-sky-500" />
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
    { name: "FREE", price: "0", features: ["Basic Analytics", "Scan 5 Bills/mo", "Simple Lists", "Help Desk"], highlight: false },
    { name: "GOLD", price: "59", features: ["Smart Advice", "Daily Task List", "Unlimited Scans", "Priority Help"], highlight: true },
    { name: "PLATINUM", price: "119", features: ["Team Access", "Custom Reports", "Deep Research", "VIP Support"], highlight: false },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-[#0a0a0a]/95 border-t border-[#222]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16 uppercase">Pick Your <span className="text-sky-400">Plan</span></h2>
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {planData.map((plan, i) => (
            <PremiumCard 
              key={i}
              extreme={plan.highlight}
              className={`relative border ${plan.highlight ? 'border-transparent' : 'border-white/5'} bg-black group`}
            >
               {plan.highlight && (
                 <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1 bg-sky-500 text-white text-[10px] font-black tracking-widest uppercase rounded-full z-20">
                   Best Value
                 </div>
               )}
               <h3 className="text-sm font-black text-white/40 tracking-[0.2em] uppercase mb-4">{plan.name}</h3>
               <div className="text-5xl font-black text-white mb-8 tracking-tighter">
                 ₹{plan.price}<span className="text-lg text-white/20 font-medium tracking-normal ml-1">/mo</span>
               </div>
               <ul className="space-y-4 mb-8">
                 {plan.features.map((f, j) => (
                   <li key={j} className="flex items-center gap-3 text-white/60 text-sm font-medium">
                     <CheckCircle className={`w-5 h-5 ${plan.highlight ? 'text-sky-400' : 'text-white/20'}`} /> {f}
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
                 Get Started
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
      <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16 uppercase">What <span className="text-sky-400">Owners Say</span></h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: "Rahul S.", role: "Shop Owner", initial: "R", text: "I used to spend 3 hours a week on bills. Now it takes 5 minutes. BHIE is magic." },
          { name: "S. Priya", role: "Freelancer", initial: "S", text: "Finally, something that talks like a human. No big words, just my money info." },
          { name: "Amit K.", role: "Café Founder", initial: "A", text: "I love the WhatsApp feature. Just text a photo and done. Best business tool yet." }
        ].map((t, i) => (
          <div key={i} className="p-8 border border-[#222] bg-[#050505] rounded-xl flex flex-col justify-between">
            <p className="text-white/60 italic leading-relaxed mb-8">"{t.text}"</p>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold">{t.initial}</div>
               <div>
                  <h4 className="text-white font-bold">{t.name}</h4>
                  <p className="text-xs text-sky-400 tracking-widest uppercase">{t.role}</p>
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
    { q: "Is my data safe?", a: "Yes. We use top-notch security to keep your business info private and locked away. We never share your secrets." },
    { q: "Do I need to be a tech expert?", a: "Not at all. If you can take a photo, you can use our app. It's built for everyone." },
    { q: "What kind of businesses use this?", a: "Everyone from local shops and freelancers to big agencies and online stores." }
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-[#0a0a0a]/95 border-t border-[#222]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-black text-white text-center mb-16 uppercase">Common Questions</h2>
        <div className="space-y-4">
          {questions.map((faq, i) => (
            <div key={i} className="border border-[#333] bg-black rounded-xl overflow-hidden">
               <button 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-white font-bold"
               >
                 {faq.q}
                 <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === i ? 'rotate-180 text-sky-500' : 'text-white/50'}`} />
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
  <section className="py-32 px-6 bg-sky-600 text-center relative overflow-hidden">
     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-multiply opacity-20" />
     <div className="relative z-10 max-w-3xl mx-auto">
       <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none">Start Today</h2>
       <p className="text-xl text-white/80 font-medium mb-10">Stop the manual work. Join us today and take back your time.</p>
       <Link 
         to="/register" 
         onClick={() => premiumFeedback.click()}
         onMouseEnter={() => premiumFeedback.haptic(5)}
         className="inline-block px-12 py-5 bg-black hover:bg-[#111] text-white text-lg font-black tracking-widest uppercase rounded shadow-2xl transition-all border border-black hover:border-white/20"
       >
         Try It Free Now
       </Link>
     </div>
  </section>
);

// ======================= FOOTER =======================
const Footer = () => (
  <footer className="py-12 px-6 bg-black border-t border-[#222]">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col items-center md:items-start leading-none group">
        <div className="text-2xl font-black text-sky-500 tracking-tighter">BHIE</div>
        <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1 group-hover:text-sky-400 transition-colors">Plain English Business</span>
      </div>
      <div className="flex gap-6 text-sm text-white/50">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>
      <div className="text-sm text-white/30">© 2026 ANTIGRAVITY. Business Intelligence Made Simple.</div>
    </div>
  </footer>
);

// ======================= MAIN ASSEMBLY =======================
export default function LandingPremium() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen text-white font-sans selection:bg-sky-500 selection:text-white">
      <WatchDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <Navbar />
      <main>
        <Hero onWatchDemo={() => setDemoOpen(true)} />
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
