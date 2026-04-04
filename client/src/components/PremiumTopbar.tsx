import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  Command,
  ChevronDown,
  Moon,
  Sun,
  Crown
} from 'lucide-react';

const PremiumTopbar = () => {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.header
      className={`fixed top-0 right-0 left-0 lg:left-[auto] lg:w-[calc(100%-280px)] h-20 z-40 px-8 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-xl bg-black/20' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center h-full justify-between gap-6">
        {/* Search Bar - Apple Style */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 transition-colors group-focus-within:text-blue-400" />
            <input
              type="text"
              placeholder="Search Insights..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-white/30 border border-white/10">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={triggerHaptic}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500 border border-blue-500 shadow-blue-500/50 shadow-md animate-pulse" />
          </button>

          {/* Premium Badge */}
          {(!user?.plan || user.plan === 'free') && (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('limitReached'))}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-br from-amber-400/10 to-amber-600/10 border border-amber-500/20 shadow-amber-500/5 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-500" fill="currentColor" />
              <span className="text-xs font-bold text-amber-500 tracking-wide uppercase">Upgrade</span>
            </button>
          )}

          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                triggerHaptic();
                setShowProfile(!showProfile);
              }}
              className="flex items-center gap-3 p-1.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all border-transparent hover:border-white/10 group"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xl ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg select-none uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="hidden lg:block text-left mr-2">
                <p className="text-sm font-bold text-white tracking-wide truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] font-bold text-blue-400 tracking-wider uppercase leading-none">{user?.role || 'Member'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-300 hidden sm:block ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-72 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl p-4 overflow-hidden drop-shadow-2xl"
                >
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <p className="text-xs font-bold text-white/30 tracking-widest uppercase mb-2 px-2">Account Summary</p>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-sm font-bold text-white mb-1 truncate">{user?.email}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-blue-500/50 shadow-md" />
                        <span className="text-xs text-blue-400 font-bold tracking-wide uppercase leading-none">Active Session</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {[
                      { icon: User, label: 'Profile' },
                      { icon: Settings, label: 'Settings' },
                      { icon: Moon, label: 'Dark Mode' },
                      { icon: HelpCircle, label: 'Support' }
                    ].map((item, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium pr-10"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default PremiumTopbar;
