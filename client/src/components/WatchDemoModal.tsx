import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, BarChart2, BrainCircuit, FileText, Zap, CheckCircle } from 'lucide-react';
import { premiumFeedback } from '../utils/premiumFeedback';
import { Link } from 'react-router-dom';

interface WatchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: FileText,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
    title: '1. Snap a Receipt',
    desc: 'Take a photo or upload a PDF of any receipt or invoice. Works with images, PDFs, and scanned documents.',
  },
  {
    icon: BrainCircuit,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    title: '2. Automatic Extraction',
    desc: 'Our system reads merchant name, date, amount, GST, and category — automatically. No manual typing.',
  },
  {
    icon: BarChart2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    title: '3. Dashboard Updates Live',
    desc: 'Watch your Profit & Loss dashboard refresh in real-time. Business insights appear immediately.',
  },
  {
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    title: '4. Take Action on Insights',
    desc: 'Our system surfaces top spending warnings, saving opportunities, and cash-flow predictions daily.',
  },
];

const features = [
  'Works with any receipt format',
  'Multi-language support (EN/HI/TE)',
  'Real-time P&L dashboard',
  'Smart pricing per region',
  'Secure cloud storage',
  'Export reports instantly',
];

const playDolbyDemoSound = () => {
  try {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(40, ctx.currentTime);
    sub.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 3);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.5, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start();
    sub.stop(ctx.currentTime + 3);

    const sweep = ctx.createOscillator();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(120, ctx.currentTime);
    sweep.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 2);

    const sweepGain = ctx.createGain();
    sweepGain.gain.setValueAtTime(0, ctx.currentTime);
    sweepGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
    sweepGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 2);

    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime(-1, ctx.currentTime);
      panner.pan.linearRampToValueAtTime(1, ctx.currentTime + 2);
      sweep.connect(filter);
      filter.connect(panner);
      panner.connect(sweepGain);
    } else {
      sweep.connect(filter);
      filter.connect(sweepGain);
    }

    sweepGain.connect(ctx.destination);
    sweep.start();
    sweep.stop(ctx.currentTime + 2.5);
  } catch (e) {
    console.error('Failed to parse watch demo features', e);
  }
};

const WatchDemoModal: React.FC<WatchDemoModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      playDolbyDemoSound();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        premiumFeedback.modalClose();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="demo-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
            onClick={() => { premiumFeedback.modalClose(); onClose(); }}
          />

          {/* Modal */}
          <motion.div
            key="demo-modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => { premiumFeedback.modalClose(); onClose(); }}
                className="absolute top-5 right-5 z-10 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                aria-label="Close demo"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-sky-950/60 via-indigo-950/40 to-purple-950/60 p-10 text-center border-b border-white/5">
                <motion.div
                  className="absolute -inset-10 opacity-30"
                  style={{ background: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.15), transparent 60%)' }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-bold uppercase tracking-widest mb-4">
                    <Play className="w-3 h-3 fill-current" /> Product Walkthrough
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3">
                    How AERA Works
                  </h2>
                  <p className="text-white/50 text-lg max-w-lg mx-auto">
                    From receipt to insight in under 30 seconds. Here's the complete workflow.
                  </p>
                </div>
              </div>

              {/* Cinematic Demo Video Container */}
              <div className="p-2 sm:p-4">
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
                  className="w-full relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black/50"
                >
                  {/* Subtle glass reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10 mix-blend-overlay" />

                  <img
                    src="/demo.png"
                    alt="AERA Working App Demo"
                    className="w-full h-auto object-cover opacity-90 shadow-2xl"
                  />

                  {/* Playing Indicator */}
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Demo</span>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 pb-8">

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-3 pt-4"
                >
                  <Link
                    to="/register"
                    onClick={() => { premiumFeedback.click(); onClose(); }}
                    className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-center rounded-2xl transition-all shadow-[0_10px_30px_-8px_rgba(56,189,248,0.4)]"
                  >
                    Start Free — No Credit Card
                  </Link>
                  <button
                    onClick={() => { premiumFeedback.modalClose(); onClose(); }}
                    className="sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold rounded-2xl transition-all"
                  >
                    Maybe Later
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WatchDemoModal;
