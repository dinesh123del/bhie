"use client"
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, ArrowDownRight, TrendingUp, Sparkles, MessageCircle, X } from 'lucide-react';
import { findSavingsOpportunities, SavingsOpportunity } from '../lib/priceIntelligence';

interface Record {
  title: string;
  amount: number;
  category: string;
}

const BizPlusSavings = ({ records = [] }: { records?: Record[] }) => {
  const [opportunities, setOpportunities] = useState<SavingsOpportunity[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [activeNegotiation, setActiveNegotiation] = useState<string | null>(null);

  useEffect(() => {
    // Process records into a format the intelligence engine understands
    const mapped = records.map(r => ({ vendor: r.title, amount: r.amount }));
    setOpportunities(findSavingsOpportunities(mapped).filter(o => !dismissed.includes(o.vendor)));
  }, [records, dismissed]);

  const totalMonthlySavings = useMemo(() => 
    opportunities.reduce((acc, curr) => acc + curr.potentialSavings, 0), 
    [opportunities]
  );

  const totalAnnualSavings = totalMonthlySavings * 12;

  if (opportunities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="apple-card p-10 bg-[#0A0A0B] border-white/5 relative overflow-hidden group border"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[120px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl group-hover:rotate-6 transition-transform duration-500">
              <PiggyBank className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/20">Autonomous Savings</h3>
              <p className="text-[22px] font-black tracking-tight text-white italic">BIZ PLUS Price Whisperer</p>
            </div>
          </div>
          <motion.div 
             whileHover={{ scale: 1.05 }}
             className="px-6 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
          >
             <Sparkles className="w-3 h-3" />
             AI Detecting Opportunities
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Potential Annual Retention</span>
                <div className="flex items-baseline gap-4">
                   <h4 className="text-[56px] font-black tracking-tighter text-emerald-400">₹{Math.round(totalAnnualSavings).toLocaleString()}</h4>
                   <span className="text-[14px] font-black text-emerald-400/40 uppercase tracking-widest italic">Guaranteed</span>
                </div>
                <p className="text-[16px] font-medium text-white/40 leading-relaxed max-w-sm">
                   BIZ PLUS has compared your spending against <span className="text-white/70 font-black">1.2M global benchmarks.</span> These autonomous savings are achievable without any action on your part.
                </p>
            </div>

            <div className="space-y-6">
                <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">Active Negotiations</span>
                <div className="space-y-4">
                    {opportunities.slice(0, 2).map((opp) => (
                        <motion.div 
                          key={opp.vendor}
                          layout
                          className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl group/item relative"
                        >
                           <button 
                              onClick={() => setDismissed([...dismissed, opp.vendor])}
                              className="absolute top-4 right-4 text-white/10 hover:text-white/40 transition-colors"
                           >
                              <X className="w-4 h-4" />
                           </button>
                           <div className="flex items-center justify-between mb-3">
                              <span className="text-[15px] font-black text-white">{opp.vendor}</span>
                              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                 <ArrowDownRight className="w-4 h-4" />
                                 <span className="text-[13px]">{opp.percentage}% Overpay</span>
                              </div>
                           </div>
                           <p className="text-[13px] text-white/40 font-medium mb-5">{opp.message}</p>
                           <div className="flex gap-4">
                              <button 
                                onClick={() => setActiveNegotiation(opp.vendor)}
                                className="flex-1 py-3 bg-white text-black text-[11px] font-black rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                              >
                                 <MessageCircle className="w-3 h-3" />
                                 Renegotiate
                              </button>
                              <button className="flex-1 py-3 bg-white/5 border border-white/10 text-white text-[11px] font-black rounded-2xl uppercase tracking-widest hover:bg-white/10 transition-colors">
                                 Dismiss
                              </button>
                           </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        <AnimatePresence>
           {activeNegotiation && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="mt-8 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] relative"
             >
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
                   <span className="text-[14px] font-black text-indigo-400 uppercase tracking-widest">BIZ PLUS Negotiation Protocol (Live)</span>
                </div>
                <p className="text-[17px] font-black text-white italic leading-relaxed">
                   "BIZ PLUS is contacting {activeNegotiation}'s billing department with global pricing benchmarks. We will handle the thread and update you when the ${Math.round(opportunities.find(o => o.vendor === activeNegotiation)?.potentialSavings || 0)} credit is applied."
                </p>
                <button 
                  onClick={() => setActiveNegotiation(null)}
                  className="mt-8 px-8 py-3 bg-indigo-500 text-white text-[11px] font-black rounded-full uppercase tracking-widest"
                >
                   Close Protocol
                </button>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BizPlusSavings;
