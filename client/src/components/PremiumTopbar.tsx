import React, { useState, useEffect } from 'react';
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
import { ThemeToggle } from './ThemeToggle';
import { premiumFeedback } from '../utils/premiumFeedback';

const PremiumTopbar = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAction = () => {
    premiumFeedback.click();
  };

  return (
    <motion.header
      className={`fixed top-0 right-0 z-40 px-8 transition-all duration-300 h-20 ${
        isScrolled 
          ? 'bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border-b border-black/[0.03] dark:border-white/5' 
          : 'bg-transparent'
      }`}
      style={{ left: 'var(--sidebar-width, auto)' }}
    >
      <div className="flex items-center h-full justify-between gap-8">
        {/* Modern Search */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 dark:text-white/20 transition-colors group-focus-within:text-brand-500" />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl py-2.5 pl-11 pr-12 text-sm text-black dark:text-white placeholder-black/20 dark:placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/20 transition-all font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] text-[10px] font-bold text-black/20 dark:text-white/20 border border-black/5 dark:border-white/5">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={handleAction}
            className="p-2.5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-black/40 dark:text-white/40 hover:text-brand-500 dark:hover:text-brand-400 transition-all relative overflow-hidden group"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-lg shadow-brand-500/50" />
          </button>

          {(!user?.plan || user.plan === 'free') && (
            <button 
              onClick={() => {
                handleAction();
                window.dispatchEvent(new CustomEvent('limitReached'));
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-500/10 dark:bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-black text-[11px] uppercase tracking-wider hover:bg-brand-500 hover:text-white transition-all shadow-sm"
            >
              <Crown className="w-3.5 h-3.5" fill="currentColor" />
              Upgrade
            </button>
          )}

          <div className="h-6 w-px bg-black/5 dark:bg-white/5 mx-2" />

          {/* User Account */}
          <div className="relative">
            <button
              onClick={() => {
                handleAction();
                setShowProfile(!showProfile);
              }}
              className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm ring-2 ring-transparent group-hover:ring-brand-500/20 transition-all bg-gradient-to-br from-brand-400 to-brand-600 border border-brand-500/50 flex items-center justify-center text-white font-black text-sm uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <p className="text-sm font-black text-black dark:text-white tracking-tighter truncate max-w-[120px] leading-none mb-1">
                  {user?.name}
                </p>
                <p className="text-[10px] font-bold text-black/30 dark:text-white/20 uppercase tracking-widest leading-none">
                  {user?.role || 'User'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-black/20 dark:text-white/20 transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {/* Account Popover */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-4 w-64 rounded-3xl bg-white dark:bg-[#0f172a] border border-black/[0.03] dark:border-white/5 shadow-2xl p-4 z-50 ring-1 ring-black/5 overflow-hidden"
                >
                  <div className="mb-4 pb-4 border-b border-black/[0.03] dark:border-white/5">
                    <p className="text-[10px] font-black text-black/20 dark:text-white/20 tracking-widest uppercase mb-3 px-2">Account Registry</p>
                    <div className="p-3 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5">
                      <p className="text-xs font-black text-black dark:text-white mb-1 truncate">{user?.email}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-black/30 dark:text-white/30 font-black uppercase tracking-widest leading-none">Active Identity</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {[
                      { icon: User, label: 'Profile Settings' },
                      { icon: Settings, label: 'Ecosystem Config' },
                      { icon: HelpCircle, label: 'Documentation' }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={handleAction}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-black/50 dark:text-white/40 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-brand-500/5 transition-all text-xs font-black uppercase tracking-widest"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                    
                    {/* Logout Button */}
                    <div className="pt-2 mt-2 border-t border-black/[0.03] dark:border-white/5">
                      <button
                        onClick={() => {
                          handleAction();
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/5 transition-all text-xs font-black uppercase tracking-widest"
                      >
                        <div className="w-4 h-4" />
                        Terminate Session
                      </button>
                    </div>
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
