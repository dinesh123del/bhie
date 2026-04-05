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
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { premiumFeedback } from '../utils/premiumFeedback';

interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'ds-hub', name: 'Data Hub', path: '/ds-hub', icon: GraduationCap },
  { id: 'analysis', name: 'Analysis', path: '/analysis-report', icon: BrainCircuit },
  { id: 'analytics', name: 'Performance', path: '/analytics', icon: BarChart4 },
  { id: 'health', name: 'System Health', path: '/system-health', icon: Activity },
];

const mgmtItems: NavItem[] = [
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
  { id: 'billing', name: 'Billing', path: '/payments', icon: CreditCard },
  { id: 'security', name: 'Security', path: '/admin', icon: ShieldCheck },
];

const PremiumSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNav = (path: string) => {
    premiumFeedback.navigate();
    navigate(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative h-screen bg-white dark:bg-[#0f172a] border-r border-black/[0.03] dark:border-white/5 flex flex-col z-50 overflow-hidden"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer" onClick={() => handleNav('/')}>
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-black tracking-tighter text-black dark:text-white uppercase whitespace-nowrap"
              >
                BHIE AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-6 pt-4 overflow-y-auto no-scrollbar">
        <div>
          {!isCollapsed && (
            <p className="px-4 mb-3 text-[10px] font-bold tracking-[0.2em] text-black/30 dark:text-white/20 uppercase">
              Main Menu
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    active 
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' 
                      : 'text-black/50 dark:text-white/40 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${active ? 'scale-110 opacity-100' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`} />
                  {!isCollapsed && (
                    <span className="text-[13px] font-bold tracking-tight flex-1 text-left">
                      {item.name}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="sidebar-bubble"
                      className="absolute inset-0 bg-brand-500/[0.05] rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <p className="px-4 mb-3 text-[10px] font-bold tracking-[0.2em] text-black/30 dark:text-white/20 uppercase">
              Management
            </p>
          )}
          <nav className="space-y-1">
            {mgmtItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    active 
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' 
                      : 'text-black/50 dark:text-white/40 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${active ? 'scale-110 opacity-100' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`} />
                  {!isCollapsed && (
                    <span className="text-[13px] font-bold tracking-tight">
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
      <div className="p-4 border-t border-black/[0.03] dark:border-white/5 space-y-2">
        <button
          onClick={() => {
            premiumFeedback.click();
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-[13px] font-bold tracking-tight">Disconnect</span>}
        </button>

        <button
          onClick={() => {
            premiumFeedback.click();
            setIsCollapsed(!isCollapsed);
          }}
          className="w-full flex items-center justify-center h-10 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/5 text-black/40 dark:text-white/40 hover:text-brand-500 transition-all group"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 group-hover:scale-110" /> : <ChevronLeft className="w-4 h-4 group-hover:scale-110" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default PremiumSidebar;
