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
  ShieldCheck,
  CreditCard,
  Activity,
  GraduationCap,
  Volume2,
  VolumeX,
  FilePlus2,
  FlaskConical,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { premiumFeedback } from '../utils/premiumFeedback';
import { StreakBadge } from './GamificationEngine';
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
  { id: 'analytics', name: 'Business Intel', path: '/analytics', icon: BarChart4 },
  { id: 'reports', name: 'Reports', path: '/reports', icon: FilePlus2 },
  { id: 'insights', name: 'Insights', path: '/insights', icon: BrainCircuit },
  { id: 'ds-hub', name: 'Expert Check', path: '/ds-hub', icon: GraduationCap },
  { id: 'simulate', name: 'Simulate', path: '/simulate', icon: FlaskConical },
  { id: 'health', name: 'Health Status', path: '/system-health', icon: Activity },
];

const mgmtItems: NavItem[] = [
  { id: 'partner', name: 'CA Reseller', path: '/reseller-partner', icon: Briefcase },
  { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
  { id: 'billing', name: 'Billing', path: '/payments', icon: CreditCard },
  { id: 'security', name: 'Admin', path: '/admin', icon: ShieldCheck },
];

const PremiumSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem('finly_sound_muted') === 'true'; } catch { return false; }
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
    try { localStorage.setItem('finly_sound_muted', String(next)); } catch { /* ignore */ }
    premiumFeedback.click();
  };

  const springConfig = { type: 'spring', bounce: 0, duration: 0.8 };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={springConfig}
      className="relative h-screen bg-[#000000] border-r border-[#1C1C1E] flex flex-col z-[60] overflow-hidden"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-[#1C1C1E]">
        <div
          className="flex items-center w-full active:scale-95 transition-transform cursor-pointer"
          onClick={() => handleNav('/')}
        >
          {isCollapsed ? (
             <Logo size="sm" showSubtitle={false} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center w-full"
              >
                 <Logo size="sm" showSubtitle={false} />
              </motion.div>
             </AnimatePresence>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-6 pt-6 overflow-y-auto no-scrollbar pb-6">
        <div>
          {!isCollapsed && (
            <p className="px-3 mb-3 text-[11px] font-semibold text-[#636366] uppercase tracking-wider">
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
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                    active
                      ? 'text-[#FFFFFF] bg-[#1C1C1E]'
                      : 'text-[#A1A1A6] hover:text-[#FFFFFF] hover:bg-[#1C1C1E]/50'
                  }`}
                >
                  <item.icon
                    className={`w-[18px] h-[18px] transition-colors duration-300 ${active ? 'text-[#007AFF]' : ''}`}
                  />
                  {!isCollapsed && (
                    <span className="text-[14px] font-medium tracking-tight">
                      {item.name}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <p className="px-3 mb-3 text-[11px] font-semibold text-[#636366] uppercase tracking-wider">
              Management
            </p>
          )}
          <nav className="space-y-1">
            {mgmtItems.filter(item => {
              if (item.id === 'security') return user?.role === 'admin';
              return true;
            }).map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                    active 
                      ? 'text-[#FFFFFF] bg-[#1C1C1E]' 
                      : 'text-[#A1A1A6] hover:text-[#FFFFFF] hover:bg-[#1C1C1E]/50'
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {!isCollapsed && (
                    <span className="text-[14px] font-medium tracking-tight">
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
      <div className="p-4 border-t border-[#1C1C1E] space-y-2">
        {!isCollapsed && (
          <div className="mb-4 text-center">
            <StreakBadge compact />
          </div>
        )}

        <button
          onClick={toggleMute}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#A1A1A6] hover:text-white hover:bg-[#1C1C1E] transition-all duration-300"
        >
          {isMuted ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px]" />}
          {!isCollapsed && <span className="text-[13px] font-medium">Sounds {isMuted ? 'Off' : 'On'}</span>}
        </button>

        <button
          onClick={() => {
            premiumFeedback.click();
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-all duration-300"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!isCollapsed && <span className="text-[13px] font-medium">Sign Out</span>}
        </button>

        <button
          onClick={() => {
            premiumFeedback.click();
            setIsCollapsed(!isCollapsed);
          }}
          className="w-full flex items-center justify-center h-10 mt-2 rounded-lg text-[#636366] hover:text-white hover:bg-[#1C1C1E] transition-all duration-300"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default PremiumSidebar;
