import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  BarChart4, 
  Plus,
  Camera,
  Settings
} from 'lucide-react';
import { premiumFeedback } from '../utils/premiumFeedback';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, path: '/dashboard', label: 'Home' },
        { id: 'records', icon: Activity, path: '/records', label: 'Records' },
        { id: 'scan', icon: Camera, path: '/scan-bill', label: 'Scan', primary: true },
        { id: 'analytics', icon: BarChart4, path: '/analytics', label: 'Trends' },
        { id: 'admin', icon: Settings, path: '/admin', label: 'Menu' },
    ];

    const handleNav = (path: string) => {
        premiumFeedback.navigate();
        navigate(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/95 to-transparent">
            <div className="flex items-center justify-between px-2 py-3 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
                
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    
                    if (item.primary) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNav(item.path)}
                                className="relative -top-8 flex flex-col items-center group"
                            >
                                <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-90 transition-transform duration-300">
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="absolute -bottom-6 text-[10px] font-black uppercase tracking-widest text-indigo-400 opacity-100">
                                    {item.label}
                                </span>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-500/20 blur-2xl rounded-full -z-10 group-active:scale-150 transition-transform" />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNav(item.path)}
                            className="flex flex-col items-center justify-center flex-1 py-1 gap-1 relative"
                        >
                            <item.icon 
                                className={`w-5 h-5 transition-all duration-300 ${
                                    isActive ? 'text-white scale-110' : 'text-white/30 hover:text-white/60'
                                }`} 
                            />
                            <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                                isActive ? 'text-sky-400 opacity-100' : 'text-white/20 opacity-0'
                            }`}>
                                {item.label}
                            </span>
                            
                            {isActive && (
                                <motion.div 
                                    layoutId="bottom-nav-indicator"
                                    className="absolute -top-3 w-1 h-1 bg-sky-400 rounded-full shadow-[0_0_10px_#0EA5E9]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
