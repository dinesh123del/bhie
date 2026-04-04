import React from 'react';
import { motion } from 'framer-motion';
import { Scan, PieChart, Zap, ChevronRight, CheckCircle, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModernLanding: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <Scan className="w-6 h-6 text-indigo-600" />,
      title: "Smart Scan",
      description: "Capture receipts and extract key details instantly."
    },
    {
      icon: <PieChart className="w-6 h-6 text-indigo-600" />,
      title: "Expense Insights",
      description: "See where your money goes with clear summaries."
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-600" />,
      title: "Instant Tracking",
      description: "No manual entry. Everything updates automatically."
    }
  ];

  const steps = [
    { number: "01", title: "Scan your receipt", description: "Just take a photo or upload an image of your receipt." },
    { number: "02", title: "Review detected details", description: "Our AI extracts the merchant, date, and amount accurately." },
    { number: "03", title: "Track your expenses", description: "View your spending patterns in beautifully designed charts." }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">SpendWise</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How it works</a>
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Login</Link>
            <button className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-slate-100 px-6 py-8 flex flex-col gap-6"
          >
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Features</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">How it works</a>
            <Link to="/login" className="text-lg font-medium">Login</Link>
            <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl">Get Started</button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-6 tracking-wider uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Now with AI-powered scanning
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
              Track your expenses <span className="text-indigo-600">instantly</span> from receipts
            </motion.h1>
            <motion.p variants={fadeIn} className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Scan, organize, and understand your spending in seconds. The smartest way to manage your personal finances.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-1 active:translate-y-0 text-lg">
                Get Started
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-full border border-slate-200 hover:bg-slate-50 transition-all text-lg flex items-center gap-2">
                Try Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full max-w-2xl"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-white p-2 rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden">
                <img 
                  src="/Users/srilekha/.gemini/antigravity/brain/32cace36-7dfd-433c-a9cc-ad93226459ab/expense_app_mockup_1775328356728.png" 
                  alt="SpendWise Dashboard Mockup" 
                  className="rounded-[2rem] w-full h-auto object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Everything you need to master your money</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-[2rem] bg-[#fafafa] border border-slate-100/50 hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 ring-1 ring-slate-100">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-20">Three simple steps</h2>
          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex-1 text-left relative"
              >
                <span className="text-7xl font-black text-slate-100 absolute -top-10 -left-4 select-none -z-0">
                  {step.number}
                </span>
                <div className="relative z-10 pl-6 border-l-2 border-indigo-100">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{step.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-indigo-600 p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Start tracking your expenses today</h2>
            <p className="text-indigo-100 text-xl mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of people who have already taken control of their finances with SpendWise.
            </p>
            <button className="px-10 py-5 bg-white text-indigo-600 font-bold rounded-full hover:bg-indigo-50 transition-all shadow-xl text-lg hover:-translate-y-1 active:translate-y-0">
              Get Started for Free
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm transform rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">SpendWise</span>
            </div>
            <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
              Making personal finance simple, smart, and accessible for everyone.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 text-lg tracking-tight">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">About</a></li>
              <li><a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Contact</a></li>
              <li><a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 text-lg tracking-tight">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Terms of Service</a></li>
              <li><a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-50 text-center text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} SpendWise Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ModernLanding;
