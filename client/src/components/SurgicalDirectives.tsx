import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export interface Directive {
  id: string;
  type: 'growth' | 'efficiency' | 'equity';
  directive: string;
  expectedImpact: string;
  confidence: number;
}

interface SurgicalDirectivesProps {
  directives: Directive[];
}

const SurgicalDirectives: React.FC<SurgicalDirectivesProps> = ({ directives }) => {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-ai-extreme" />
          <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-white/40">Surgical Directives</h3>
        </div>
        <p className="text-[28px] font-black tracking-tight text-white">Quantum Action Plan</p>
      </header>

      <div className="grid gap-6">
        {directives.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ x: 10 }}
            className="apple-card p-4 bg-white/[0.02] border border-white/5 group relative overflow-hidden"
          >
            <div className="flex items-start gap-8 relative z-10">
               <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-ai-extreme group-hover:text-black transition-all duration-500 shrink-0">
                  {item.type === 'growth' ? <Zap className="w-5 h-5" /> : 
                   item.type === 'equity' ? <ShieldCheck className="w-5 h-5" /> : 
                   <Target className="w-5 h-5" />}
               </div>
               
               <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                     <span className="text-[12px] font-black uppercase tracking-widest text-white/30">{item.type} Strategy</span>
                     <span className="text-[12px] font-black text-ai-extreme">{item.confidence}% Confidence</span>
                  </div>
                  
                  <h4 className="text-[20px] font-black tracking-tight leading-tight group-hover:text-white transition-colors">
                    {item.directive}
                  </h4>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 w-fit">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Expected Impact:</span>
                    <span className="text-[11px] font-black text-emerald-400">{item.expectedImpact}</span>
                  </div>
               </div>

               <button className="p-4 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-white" />
               </button>
            </div>
            
            {/* Glass Shine on Hover */}
            <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-white/[0.03] to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
          </motion.div>
        ))}
      </div>
      
      <div className="flex items-center justify-center pt-6">
          <p className="text-[12px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Decision Engine Active: Analyzing 14.2k scenarios
          </p>
      </div>
    </div>
  );
};

export default SurgicalDirectives;
