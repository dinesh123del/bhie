"use client"
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  History as HistoryIcon,
  LayoutDashboard,
  BarChart4,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  CreditCard,
  Activity,
  FlaskConical,
  Briefcase,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { premiumFeedback } from '../utils/premiumFeedback';
import { Logo } from './Logo';

interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'records', name: 'Records', path: '/records', icon: Activity },
  { id: 'analytics', name: 'Analytics', path: '/analytics', icon: BarChart4 },
  { id: 'insights', name: 'Insights', path: '/analysis-report', icon: Zap },
  { id: 'history', name: 'History', path: '/business-brain', icon: HistoryIcon },
  { id: 'workflows', name: 'Workflows', path: '/workflows', icon: Zap },
  { id: 'simulation', name: 'Simulator', path: '/simulation', icon: FlaskConical },
];

const mgmtItems: NavItem[] = [
  { id: 'ca-portal', name: 'CA Portal', path: '/ca-portal', icon: ShieldCheck },
  { id: 'partner', name: 'Partners', path: '/reseller-partner', icon: Briefcase },
  { id: 'admin', name: 'Admin', path: '/admin', icon: Settings },
  { id: 'billing', name: 'Billing', path: '/payments', icon: CreditCard },
];

const PremiumSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem('bizplus_sound_muted') === 'true'; } catch { return false; }
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNav = (path: string) => {
    premiumFeedback.navigate();
    navigate(path);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    try { localStorage.setItem('bizplus_sound_muted', String(next)); } catch { /* ignore */ }
    premiumFeedback.click();
  };

  const springConfig = { type: 'spring', bounce: 0, duration: 0.8 };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={springConfig}
      className="relative h-screen bg-[#0A0A0A]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col z-[60] overflow-hidden"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div
          className="flex items-center w-full active:scale-95 transition-transform cursor-pointer"
          onClick={() => handleNav('/')}
        >
          {isCollapsed ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto">
                <Logo size="sm" showSubtitle={false} />
             </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center w-full"
              >
                <Logo size="sm" showSubtitle={true} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-6 pt-6 overflow-y-auto no-scrollbar pb-6 scrollbar-premium">
        <div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 mb-3 text-[10px] font-black text-[#C0C0C0]/50 uppercase tracking-[0.2em]">
                Main Menu
              </motion.p>
            )}
          </AnimatePresence>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${active
                      ? 'text-white bg-gradient-to-r from-[#00D4FF]/10 to-[#7B61FF]/10 border border-[#00D4FF]/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                      : 'text-[#C0C0C0] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <item.icon
                    className={`w-[20px] h-[20px] transition-all duration-300 ${active ? 'text-[#00D4FF] scale-110 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]' : 'group-hover:scale-110'}`}
                  />
                  {!isCollapsed && (
                    <span className="text-[14px] font-semibold tracking-tight">
                      {item.name}
                    </span>
                  )}
                  {active && !isCollapsed && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00D4FF] rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 mb-3 text-[10px] font-black text-[#C0C0C0]/50 uppercase tracking-[0.2em]">
                Management
              </motion.p>
            )}
          </AnimatePresence>
          <nav className="space-y-2">
            {mgmtItems.filter(item => {
              if (item.id === 'admin') return user?.role === 'admin';
              return true;
            }).map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${active
                      ? 'text-white bg-gradient-to-r from-[#00D4FF]/10 to-[#7B61FF]/10 border border-[#00D4FF]/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                      : 'text-[#C0C0C0] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <item.icon
                    className={`w-[20px] h-[20px] transition-all duration-300 ${active ? 'text-[#00D4FF] scale-110 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]' : 'group-hover:scale-110'}`}
                  />
                  {!isCollapsed && (
                    <span className="text-[14px] font-semibold tracking-tight">
                      {item.name}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-[#0A0A0A]">
        <button
          onClick={toggleMute}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[#C0C0C0] hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          {isMuted ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px]" />}
          {!isCollapsed && <span className="text-[13px] font-semibold">Sounds {isMuted ? 'Off' : 'On'}</span>}
        </button>

        <button
          onClick={() => {
            premiumFeedback.click();
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!isCollapsed && <span className="text-[13px] font-semibold">Sign Out</span>}
        </button>

        <button
          onClick={() => {
            premiumFeedback.click();
            setIsCollapsed(!isCollapsed);
          }}
          className="w-full flex items-center justify-center h-12 mt-2 rounded-2xl text-[#C0C0C0] hover:text-[#00D4FF] hover:bg-white/5 border border-white/5 transition-all duration-300"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default PremiumSidebar;
