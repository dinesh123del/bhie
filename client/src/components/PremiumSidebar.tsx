import { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'ai', name: 'AI Intelligence', path: '/ai-analysis', icon: BrainCircuit, badge: 'AI' },
  { id: 'analytics', name: 'Intelligence Analytics', path: '/analytics', icon: BarChart4 },

  { id: 'health', name: 'System Health', path: '/system-health', icon: Activity },
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
];


const subItems: NavItem[] = [
  { id: 'billing', name: 'Billing', path: '/payments', icon: CreditCard },
  { id: 'security', name: 'Security', path: '/admin', icon: ShieldCheck },
];

const PremiumSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleNav = (path: string) => {
    triggerHaptic();
    navigate(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      className="relative h-screen bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col z-50 transition-all duration-500 ease-in-out"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold tracking-tight text-white whitespace-nowrap"
              >
                ANTIGRAVITY
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        <div className="mb-4">
          <p className={`px-4 mb-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '•' : 'Main Menu'}
          </p>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  active 
                    ? 'bg-white/10 text-white shadow-inner shadow-white/5' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium tracking-wide flex-1 text-left">
                    {item.name}
                  </span>
                )}
                {item.badge && !isCollapsed && (
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-bold tracking-wider">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div>
          <p className={`px-4 mb-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '•' : 'Management'}
          </p>
          {subItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.path)}
              className={`w-full group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                location.pathname === item.path 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {!isCollapsed && (
                <span className="text-sm font-medium tracking-wide">
                  {item.name}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            triggerHaptic();
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-semibold tracking-wide">Disconnect</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-blue-600 transition-all shadow-xl"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default PremiumSidebar;
