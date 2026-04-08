import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Share2, Users, Clock, Zap, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WaitlistUser {
  position: number;
  name: string;
  joinedAt: string;
  referrals: number;
}

export default function ViralWaitlist() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [position, setPosition] = useState(0);
  const [totalWaitlist, setTotalWaitlist] = useState(2847);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 42,
  });

  useEffect(() => {
    // Check if already joined
    const stored = localStorage.getItem('aera_waitlist');
    if (stored) {
      const data = JSON.parse(stored);
      setJoined(true);
      setPosition(data.position);
      setReferralCode(data.referralCode);
      setReferrals(data.referrals || 0);
    }
  }, []);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Generate position and referral code
    const newPosition = totalWaitlist + 1;
    const code = `AERA${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const data = {
      email,
      position: newPosition,
      referralCode: code,
      referrals: 0,
      joinedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('aera_waitlist', JSON.stringify(data));
    setJoined(true);
    setPosition(newPosition);
    setReferralCode(code);
    setTotalWaitlist(prev => prev + 1);
    toast.success(`You're #${newPosition.toLocaleString()} in line!`);
  };

  const referralLink = `${window.location.origin}/waitlist?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copied! Share to jump ahead');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `I just joined the AERA waitlist! 📊 Smart business finance tracking. ` +
      `Use my link to skip ahead: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const calculateJump = () => {
    // Each referral jumps you ahead 10 positions
    const jump = referrals * 10;
    return Math.max(1, position - jump);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">
            Early Access
          </h1>
          <p className="text-white/50">
            Join {totalWaitlist.toLocaleString()}+ businesses waiting for AERA
          </p>
        </div>

        {!joined ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Email Form */}
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 transition-colors uppercase tracking-widest"
              >
                Join Waitlist
              </button>
            </form>

            {/* Countdown */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-center text-white/50 text-sm mb-4">Launching in</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                ].map((item) => (
                  <div key={item.label} className="bg-black/30 rounded-xl p-3">
                    <p className="text-2xl font-black text-white">{item.value}</p>
                    <p className="text-xs text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, text: 'Lifetime 20% off' },
                { icon: Users, text: 'Priority Support' },
                { icon: Crown, text: 'Founder Badge' },
                { icon: Share2, text: 'Referral Rewards' },
              ].map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
                  <benefit.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-white/70 text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Position Display */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-8 border border-blue-500/30 text-center">
              <p className="text-white/50 text-sm mb-2">Your position</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl font-black text-white mb-2"
              >
                #{calculateJump().toLocaleString()}
              </motion.p>
              <p className="text-white/50 text-sm">
                of {totalWaitlist.toLocaleString()} in line
              </p>
              {referrals > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold"
                >
                  <ArrowUp className="w-4 h-4" />
                  Jumped ahead {referrals * 10} spots!
                </motion.div>
              )}
            </div>

            {/* Share to Jump Ahead */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Jump the Queue
              </h3>
              <p className="text-white/50 text-sm mb-4">
                Share your link. Each friend who joins moves you up 10 spots!
              </p>
              
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <p className="text-xs text-white/30 mb-1">Your referral link</p>
                <p className="text-white font-mono text-sm truncate">{referralLink}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors font-bold"
                >
                  <Share2 className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white py-3 rounded-xl transition-colors font-bold"
                >
                  <span className="text-lg">💬</span>
                  WhatsApp
                </button>
              </div>

              {referrals > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/50 text-sm">
                    <span className="text-white font-bold">{referrals}</span> friends joined using your link
                  </p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-sm">Queue progress</span>
                <span className="text-white font-bold">
                  {Math.round(((totalWaitlist - calculateJump()) / totalWaitlist) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((totalWaitlist - calculateJump()) / totalWaitlist) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
