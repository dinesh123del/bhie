import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  Command,
  ChevronDown,
  Crown,
  LogOut
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { API } from '../lib/axios';
import { premiumFeedback } from '../utils/premiumFeedback';

const PremiumTopbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API}/api/alerts/unread/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      setIsScrolled((e.target as HTMLElement).scrollTop > 0);
    };
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => mainContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleAction = () => {
    premiumFeedback.click();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleAction();
      navigate(`/records?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <motion.header
      className={`absolute top-0 left-0 right-0 z-40 px-8 transition-all duration-500 h-24 flex items-center ${
        isScrolled 
          ? 'bg-[#0A0A0A]/60 backdrop-blur-3xl border-b border-white/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center w-full justify-between gap-8 mt-2">
        
        {/* Left Side: Cinematic Search */}
        <div className="flex items-center gap-8 flex-1 max-w-2xl">
          <div className="flex-1 hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C0C0] transition-colors group-focus-within:text-[#00D4FF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search intelligence, reports, models..."
                className="w-full bg-white/5 border border-white/5 rounded-full py-3.5 pl-12 pr-12 text-[14px] text-white placeholder:text-[#C0C0C0]/50 focus:outline-none focus:ring-1 focus:ring-[#00D4FF] focus:border-[#00D4FF] focus:bg-white/10 transition-all font-medium shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-[#C0C0C0] border border-white/5">
                <Command className="w-3.5 h-3.5" />
                <span>K</span>
              </div>
            </form>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          <button
            onClick={() => {
              handleAction();
              navigate('/notifications');
              setUnreadCount(0); // Optimistic clear
            }}
            className="p-3 rounded-full bg-white/5 border border-white/5 text-[#C0C0C0] hover:text-[#00D4FF] hover:border-[#00D4FF]/40 transition-all relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black px-1 shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {(!user?.plan || user.plan === 'free') && (
            <button 
              onClick={() => {
                handleAction();
                window.dispatchEvent(new CustomEvent('limitReached'));
              }}
              className="cinematic-btn text-[11px] font-black tracking-[0.1em] uppercase hidden sm:flex"
            >
              <Crown className="w-3.5 h-3.5 mr-2" fill="currentColor" />
              Upgrade
            </button>
          )}

          <div className="h-8 w-px bg-white/10 mx-2" />

          {/* User Account */}
          <div className="relative">
            <button
              onClick={() => {
                handleAction();
                setShowProfile(!showProfile);
              }}
              className="flex items-center gap-3 p-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,212,255,0.2)] group-hover:shadow-[0_0_25px_rgba(123,97,255,0.4)] transition-all bg-gradient-to-br from-[#00D4FF] to-[#7B61FF] border border-white/20 flex items-center justify-center text-white font-black text-[15px] uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left pr-2">
                <p className="text-[14px] font-bold text-white tracking-tight truncate max-w-[120px] leading-none mb-1">
                  {user?.name}
                </p>
                <p className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] uppercase tracking-[0.1em] leading-none">
                  {user?.role || 'User'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#C0C0C0] transition-transform duration-300 mr-2 ${showProfile ? 'rotate-180 text-[#00D4FF]' : ''}`} />
            </button>

            {/* Account Popover */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="absolute right-0 mt-4 w-72 rounded-[24px] bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-5 z-50 overflow-hidden"
                >
                  <div className="mb-5 pb-5 border-b border-white/10">
                    <p className="text-[10px] font-black text-[#C0C0C0]/50 tracking-[0.2em] uppercase mb-3 px-2">Profile Details</p>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/10 to-[#7B61FF]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-[13px] font-semibold text-white mb-2 truncate relative z-10">{user?.email}</p>
                      <div className="flex items-center gap-2 relative z-10">
                        <span className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF] animate-pulse" />
                        <span className="text-[9px] text-[#00D4FF] font-black uppercase tracking-[0.2em] leading-none">Core Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {[
                       { icon: User, label: 'Identity', path: '/profile' },
                       { icon: Settings, label: 'Configuration', path: '/settings' },
                       { icon: HelpCircle, label: 'Support', path: '/about' }
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleAction();
                          setShowProfile(false);
                          navigate(item.path);
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[#C0C0C0] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-[12px] font-semibold tracking-wide"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                    
                    {/* Logout Button */}
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <button
                        onClick={() => {
                          handleAction();
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-[12px] font-semibold tracking-wide"
                      >
                        <LogOut className="w-4 h-4" />
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
