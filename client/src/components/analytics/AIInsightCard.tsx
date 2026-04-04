import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Info
} from 'lucide-react';

export type ImpactLevel = 'low' | 'medium' | 'high';

interface AIInsightCardProps {
  title?: string;
  message: string;
  impactLevel: ImpactLevel;
  category?: 'revenue' | 'expense' | 'customer' | 'inventory';
}

const AIInsightCard = ({ title, message, impactLevel, category }: AIInsightCardProps) => {
  const getImpactStyles = (level: ImpactLevel) => {
    switch (level) {
      case 'high': return 'border-rose-500/20 bg-rose-500/5 text-rose-400';
      case 'medium': return 'border-amber-500/20 bg-amber-500/5 text-amber-400';
      default: return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400';
    }
  };

  const getIcon = () => {
    if (impactLevel === 'high') return <AlertTriangle className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group overflow-hidden border p-4 rounded-2xl ${getImpactStyles(impactLevel)} backdrop-blur-sm transition-all duration-300 hover:bg-white/5 shadow-2xl shadow-black/40`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-xl bg-white/5 border border-white/10`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          {title && <h4 className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{title}</h4>}
          <p className="text-sm font-medium leading-relaxed text-white/80">{message}</p>
        </div>
      </div>
      
      {/* Decorative scanline */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
    </motion.div>
  );
};

export default AIInsightCard;
