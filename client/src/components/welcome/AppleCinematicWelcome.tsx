import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoVideoHero from './DemoVideoHero';
import { BizPlusIcon } from './BizPlusLogo';

const AppleCinematicWelcome: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const [phase, setPhase] = useState<'intro' | 'video' | 'interaction'>('intro');
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    // Phase 1: Minimalist Apple Reveal (2 seconds)
    const introTimer = setTimeout(() => setPhase('video'), 2500);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (phase === 'video') {
      const interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase('interaction'), 1000);
            return 100;
          }
          return prev + 0.5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const introVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 1.05, filter: 'blur(20px)', transition: { duration: 1, ease: 'easeInOut' } }
  };

  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: 0.5 + i * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }
    })
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {/* PHASE 1: THE REVEAL */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            variants={introVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="mb-12">
              <BizPlusIcon size={80} animated glowing />
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Biz Plus
            </h1>
            <p className="text-white/40 text-xl md:text-2xl font-medium tracking-wide">
              The future of economic resilience.
            </p>
          </motion.div>
        )}

        {/* PHASE 2 & 3: THE CINEMATIC EXPERIENCE */}
        {(phase === 'video' || phase === 'interaction') && (
          <motion.div
            key="cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <DemoVideoHero />

            {/* Letterbox Cinema Bars */}
            <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between">
              <motion.div 
                initial={{ height: '50vh' }}
                animate={{ height: phase === 'interaction' ? '5vh' : '12vh' }}
                transition={{ duration: 2, ease: "circOut" }}
                className="w-full bg-black" 
              />
              <motion.div 
                initial={{ height: '50vh' }}
                animate={{ height: phase === 'interaction' ? '5vh' : '12vh' }}
                transition={{ duration: 2, ease: "circOut" }}
                className="w-full bg-black" 
              />
            </div>

            {/* Video Interaction UI */}
            <div className="relative z-40 h-full flex flex-col items-center justify-center px-12">
              <AnimatePresence>
                {phase === 'video' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    className="text-center space-y-8"
                  >
                    <div className="space-y-4">
                      <motion.h2 
                        custom={0} variants={textVariants} initial="initial" animate="animate"
                        className="text-white/30 text-sm font-black uppercase tracking-[1em] ml-[1em]"
                      >
                        Induction Sequence
                      </motion.h2>
                      <motion.p 
                        custom={1} variants={textVariants} initial="initial" animate="animate"
                        className="text-white text-4xl md:text-6xl font-bold tracking-tighter"
                      >
                        Beyond Visualization.
                      </motion.p>
                    </div>
                    
                    {/* Video Progress Bar */}
                    <div className="w-64 h-[1px] bg-white/10 mx-auto relative overflow-hidden rounded-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${videoProgress}%` }}
                        className="absolute h-full bg-white shadow-[0_0_15px_#fff]"
                      />
                    </div>
                  </motion.div>
                )}

                {phase === 'interaction' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center flex flex-col items-center gap-16 max-w-4xl"
                  >
                    <div className="space-y-6">
                       <motion.span 
                         initial={{ opacity: 0 }} 
                         animate={{ opacity: 1 }} 
                         transition={{ delay: 1 }}
                         className="px-4 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/40"
                       >
                         Ecosystem v3.0 // Ready
                       </motion.span>
                       <h2 className="text-white text-6xl md:text-9xl font-black tracking-[-0.08em] leading-[0.85]">
                         Intelligence <br />
                         <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20">Refined.</span>
                       </h2>
                    </div>

                    <motion.button
                      onClick={onEnter}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,1)', color: '#000' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-16 py-6 border border-white/20 rounded-full text-white text-sm font-black uppercase tracking-[0.5em] backdrop-blur-3xl bg-white/5 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                    >
                      Enter Biz Plus
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Peripheral Peripheral Metrics (Apple-style) */}
            <div className="absolute bottom-12 left-12 z-[60] flex items-center gap-4 opacity-30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-mono text-white tracking-widest uppercase">System Integrity: 100%</span>
            </div>
            
            <div className="absolute bottom-12 right-12 z-[60] opacity-30">
              <span className="text-[9px] font-mono text-white tracking-widest uppercase">Rendering Engine: Cinematic-3D</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppleCinematicWelcome;
