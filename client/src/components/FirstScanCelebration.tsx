import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Star, PartyPopper, ArrowRight, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SocialShare, { useMilestoneShare } from './SocialShare';

interface CelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  scanCount: number;
}

const MILESTONES = [
  { count: 1, title: 'First Scan!', reward: '50 XP', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
  { count: 10, title: 'Getting Started', reward: '100 XP + Streak Badge', icon: '🔥', color: 'from-orange-500 to-red-500' },
  { count: 50, title: 'Receipt Pro', reward: '250 XP + Pro Badge', icon: '💎', color: 'from-purple-500 to-pink-500' },
  { count: 100, title: 'Century Club', reward: '500 XP + Exclusive Theme', icon: '👑', color: 'from-amber-500 to-yellow-500' },
];

export default function FirstScanCelebration({ isOpen, onClose, scanCount }: CelebrationProps) {
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);
  const [showReward, setShowReward] = useState(false);
  const { shareMilestone, closeShare, isOpen: isShareOpen, shareData } = useMilestoneShare();
  
  const milestone = MILESTONES.find(m => m.count === scanCount) || MILESTONES[0];

  useEffect(() => {
    if (isOpen) {
      // Generate confetti
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(pieces);

      // Play celebration sound
      playCelebrationSound();

      // Show reward after delay
      setTimeout(() => setShowReward(true), 1000);

      // Track first scan
      if (scanCount === 1) {
        localStorage.setItem('aera_first_scan_complete', 'true');
      }
    }
  }, [isOpen, scanCount]);

  const playCelebrationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Success chord
      const playNote = (freq: number, start: number, duration: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // C Major 7 chord - uplifting
      playNote(261.63, 0, 1.5, 0.3);  // C4
      playNote(329.63, 0.1, 1.4, 0.25); // E4
      playNote(392.00, 0.2, 1.3, 0.25); // G4
      playNote(493.88, 0.3, 1.2, 0.2);  // B4

      // Sparkle effect
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const sparkle = ctx.createOscillator();
          const sparkleGain = ctx.createGain();
          sparkle.type = 'sine';
          sparkle.frequency.setValueAtTime(1000 + Math.random() * 500, ctx.currentTime);
          sparkleGain.gain.setValueAtTime(0.1, ctx.currentTime);
          sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          sparkle.connect(sparkleGain);
          sparkleGain.connect(ctx.destination);
          sparkle.start(ctx.currentTime);
          sparkle.stop(ctx.currentTime + 0.3);
        }, i * 100);
      }
    } catch {
      // Silently fail
    }
  };

  const handleContinue = () => {
    onClose();
    if (scanCount === 1) {
      toast.success('Welcome to BIZ PLUS! Check your rewards.');
      // Could trigger onboarding tour here
    }
  };

  const handleViewDashboard = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Confetti */}
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ y: -20, x: `${piece.x}%`, opacity: 1 }}
              animate={{ 
                y: '100vh', 
                x: `${piece.x + (Math.random() - 0.5) * 20}%`,
                rotate: Math.random() * 720,
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                delay: piece.delay,
                ease: 'linear',
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          ))}

          {/* Main Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${milestone.color} opacity-10`} />
            
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              className={`relative w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-2xl`}
            >
              <span className="text-5xl">{milestone.icon}</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative text-3xl font-black text-white mb-2"
            >
              {milestone.title}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative text-white/50 mb-8"
            >
              {scanCount === 1 
                ? "You've taken your first step to smarter business finances!"
                : `You've scanned ${scanCount} receipts with BIZ PLUS!`
              }
            </motion.p>

            {/* Reward Card */}
            <AnimatePresence>
              {showReward && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="relative bg-white/10 rounded-2xl p-6 mb-8 border border-white/10"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 font-bold">REWARD UNLOCKED</span>
                  </div>
                  <p className="text-white text-xl font-bold">{milestone.reward}</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative space-y-3"
            >
              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-colors"
              >
                <PartyPopper className="w-5 h-5" />
                Continue Scanning
              </button>
              
              {scanCount === 1 && (
                <button
                  onClick={handleViewDashboard}
                  className="w-full flex items-center justify-center gap-2 bg-white/10 text-white py-4 rounded-xl hover:bg-white/20 transition-colors"
                >
                  View Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => shareMilestone({
                  type: scanCount === 1 ? 'milestone' : 'achievement',
                  title: milestone.title,
                  value: milestone.reward,
                  subtitle: `I just unlocked ${milestone.title} on BIZ PLUS!`,
                  date: new Date().toLocaleDateString()
                })}
                className="w-full flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 py-3 rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition-all font-bold group"
              >
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Share My Momentum
              </button>
            </motion.div>

            {/* Social Share Modal */}
            {shareData && (
              <SocialShare 
                isOpen={isShareOpen}
                onClose={closeShare}
                data={shareData}
              />
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/30 hover:text-white/50 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>

            {/* Sparkle Effects */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-8 left-8"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-20 right-8"
            >
              <Sparkles className="w-6 h-6 text-blue-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to track scans and trigger celebration
export function useScanCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const triggerCelebration = (count: number) => {
    setScanCount(count);
    setShowCelebration(true);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  return {
    showCelebration,
    scanCount,
    triggerCelebration,
    closeCelebration,
  };
}
