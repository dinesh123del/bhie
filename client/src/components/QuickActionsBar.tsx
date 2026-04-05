import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Plus, PieChart, FileText, ArrowRightLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { premiumFeedback } from '../utils/premiumFeedback';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  delay?: number;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick, color, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      delay, 
      type: 'spring', 
      stiffness: 260, 
      damping: 20,
      mass: 0.8
    }}
    whileHover={{ 
      y: -8,
      scale: 1.04,
      transition: { type: 'spring', stiffness: 400, damping: 15 }
    }}
    whileTap={{ scale: 0.94 }}
    onClick={() => {
      premiumFeedback.click();
      onClick();
    }}
    className="flex flex-col items-center gap-3 group relative"
  >
    <div 
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 border border-white/10 group-hover:border-white/25 relative overflow-hidden shadow-2xl"
      style={{ 
        background: `linear-gradient(135deg, ${color}25, ${color}08)`,
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Animated glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
        style={{ background: `radial-gradient(circle at center, ${color}60 0%, transparent 80%)` }} 
      />
      
      {/* Glass shine effect */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="text-white group-hover:scale-110 transition-transform duration-500 z-10 relative drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        {React.cloneElement(icon as React.ReactElement, { 
          strokeWidth: 1.8,
          className: "w-7 h-7 sm:w-9 sm:h-9"
        })}
      </div>

      {/* Decorative dot */}
      <div 
        className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </div>
    
    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors duration-300">
      {label}
    </span>
  </motion.button>
);

export const QuickActionsBar: React.FC<{ onQuickAdd: () => void; className?: string }> = ({ onQuickAdd, className = '' }) => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: <Camera />, 
      label: 'Snap Bill', 
      onClick: () => navigate('/scan-bill'), 
      color: '#818cf8' // Indigo
    },
    { 
      icon: <Plus />, 
      label: 'Quick Add', 
      onClick: onQuickAdd, 
      color: '#fbbf24' // Amber
    },
    { 
      icon: <ArrowRightLeft />, 
      label: 'Payments', 
      onClick: () => navigate('/payments'), 
      color: '#38bdf8' // Sky
    },
    { 
      icon: <PieChart />, 
      label: 'Insights', 
      onClick: () => navigate('/insights'), 
      color: '#34d399' // Emerald
    },
    { 
      icon: <FileText />, 
      label: 'Reports', 
      onClick: () => navigate('/reports'), 
      color: '#f87171' // Rose
    },
  ];

  return (
    <div className={`w-full overflow-visible ${className}`}>
      <div className="flex items-center justify-between px-2 sm:px-6 py-8 bg-white/[0.03] border border-white/10 rounded-[3rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group/bar">
        {/* Ambient background rays */}
        <div className="absolute -top-24 left-1/4 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none group-hover/bar:bg-indigo-500/15 transition-colors" />
        <div className="absolute -bottom-24 right-1/4 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none group-hover/bar:bg-emerald-500/15 transition-colors" />

        {actions.map((action, i) => (
          <QuickAction key={action.label} {...action} delay={0.1 + i * 0.06} />
        ))}
      </div>
    </div>
  );
};
