import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BrainCircuit,
  BarChart4,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  ShieldCheck,
  CreditCard,
  Activity,
  GraduationCap,
  Volume2,
  VolumeX,
  FilePlus2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { premiumFeedback } from '../utils/premiumFeedback';
import { StreakBadge } from './GamificationEngine';
import { MagneticElement } from './ui/MicroInteractions';

interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'records', name: 'Records', path: '/records', icon: Activity },
  { id: 'analytics', name: 'Trends', path: '/analytics', icon: BarChart4 },
  { id: 'reports', name: 'Reports', path: '/reports', icon: FilePlus2 },
  { id: 'insights', name: 'Insights', path: '/insights', icon: BrainCircuit },
  { id: 'ds-hub', name: 'Data Hub', path: '/ds-hub', icon: GraduationCap },
  { id: 'health', name: 'Health Status', path: '/system-health', icon: Activity },
];

const mgmtItems: NavItem[] = [
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
  { id: 'billing', name: 'Billing', path: '/payments', icon: CreditCard },
  { id: 'security', name: 'Admin', path: '/admin', icon: ShieldCheck },
];

const PremiumSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem('bhie_sound_muted') === 'true'; } catch { return false; }
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNav = (path: string) => {
    premiumFeedback.navigate();
    navigate(path);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    try { localStorage.setItem('bhie_sound_muted', String(next)); } catch { /* ignore */ }
    premiumFeedback.click();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative h-screen bg-slate-50/95 dark:bg-[#0A0A0A]/95 backdrop-blur-2xl border-r border-black/[0.05] dark:border-white/[0.05] flex flex-col z-[60] overflow-hidden shadow-2xl"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6">
        <div
          className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer"
          onClick={() => handleNav('/')}
        >
          {/* Gradient icon mark */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #9333EA)',
              boxShadow: '0 0 16px rgba(79,70,229,0.4)',
            }}
          >
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-black tracking-[-0.06em] whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #818CF8, #C084FC)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                BHIE
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-6 pt-4 overflow-y-auto no-scrollbar">
        <div>
          {!isCollapsed && (
            <p className="px-5 mb-4 text-[10px] font-black tracking-[0.25em] text-gray-500 dark:text-gray-400 uppercase">
              Main Menu
            </p>
          )}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full group relative flex items-center gap-3.5 px-5 py-3 rounded-2xl transition-all duration-500 ${
                    active
                      ? 'text-brand-600 dark:text-brand-400 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.1)]'
                      : 'text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-2xl -z-10 shadow-inner"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(147,51,234,0.05))',
                        border: '1px solid rgba(79,70,229,0.1)'
                      }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.7 }}
                    />
                  )}
                  <div className="relative">
                    <item.icon
                      className={`w-5 h-5 transition-all duration-500 flex-shrink-0 ${
                        active ? 'opacity-100 scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-115'
                      }`}
                      style={active ? { filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.4))' } : {}}
                    />
                    {active && <motion.div layoutId="dot" className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
                  </div>
                  {!isCollapsed && (
                    <span className={`text-[14px] font-bold tracking-tight transition-colors duration-300 ${active ? 'text-gray-900 dark:text-white' : ''}`}>
                      {item.name}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #4F46E5, #9333EA)' }}
                      layoutId="sidebar-indicator"
                      transition={{ type: 'spring', bounce: 0.2 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <p className="px-5 mb-4 text-[10px] font-black tracking-[0.25em] text-gray-500 dark:text-gray-400 uppercase">
              Management
            </p>
          )}
          <nav className="space-y-1.5">
            {mgmtItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full group relative flex items-center gap-3.5 px-5 py-3 rounded-2xl transition-all duration-500 ${
                    active 
                      ? 'bg-brand-500/10 text-brand-500' 
                      : 'text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-all duration-500 ${active ? 'scale-110 opacity-100' : 'opacity-40 group-hover:opacity-100 group-hover:scale-115'}`} />
                  {!isCollapsed && (
                    <span className={`text-[14px] font-bold tracking-tight transition-colors duration-300 ${active ? 'text-gray-900 dark:text-white' : ''}`}>
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
      <div className="p-6 border-t border-black/[0.04] dark:border-white/[0.04] space-y-3">

        {/* Streak badge — hidden when collapsed */}
        {!isCollapsed && (
          <div className="mb-4">
            <StreakBadge compact />
          </div>
        )}

        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className="w-full flex items-center gap-3.5 px-5 py-2.5 rounded-2xl text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300"
        >
          {isMuted
            ? <VolumeX className="w-4 h-4 flex-shrink-0" />
            : <Volume2 className="w-4 h-4 flex-shrink-0" />}
          {!isCollapsed && (
            <span className="text-[12px] font-bold tracking-tight">
              {isMuted ? 'Muted' : 'Audible'}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            premiumFeedback.click();
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3.5 px-5 py-2.5 rounded-2xl text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-[13px] font-black uppercase tracking-widest">Sign Out</span>}
        </button>

        <button
          onClick={() => {
            premiumFeedback.click();
            setIsCollapsed(!isCollapsed);
          }}
          className="w-full flex items-center justify-center h-12 rounded-2xl transition-all duration-500 group shadow-sm bg-white dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] hover:border-brand-500/30"
        >
          {isCollapsed
            ? <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500" />
            : <ChevronLeft  className="w-5 h-5 text-gray-400 group-hover:text-brand-500" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default PremiumSidebar;
