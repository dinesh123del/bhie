import React from 'react';
import { motion } from 'framer-motion';
import { Network, Circle, GitBranch, Terminal } from 'lucide-react';

interface TopologyProps {
  records: any[];
}

export const StrategicTopology = ({ records }: TopologyProps) => {
  // CLUSTER RECORDS BY CATEGORY
  const clusters = records.reduce((acc: any, rec: any) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {});

  const categories = Object.keys(clusters);

  return (
    <div className="relative w-full h-[600px] border border-white/5 bg-black/40 rounded-[3rem] overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05),transparent_70%)]" />
      
      {/* HUD ELEMENTS */}
      <div className="absolute top-8 left-8 flex items-center gap-4 z-10">
         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <Network className="w-5 h-5 text-sky-400" />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Strategic Topology</p>
            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Capital Node Distribution</h3>
         </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-[800px] h-[800px] border border-dashed border-white/5 rounded-full opacity-20" 
          />
      </div>

      {/* RENDER CLUSTERS */}
      <div className="relative w-full h-full p-20 flex flex-wrap items-center justify-center gap-24">
        {categories.map((cat, i) => (
          <motion.div
            key={cat}
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            className="relative flex flex-col items-center group cursor-move"
          >
            {/* CONNECTOR LINE TO CENTER */}
            <div className={`absolute w-px h-[200px] bg-gradient-to-t from-sky-500/20 to-transparent bottom-full -mb-10`} />
            
            <div className="relative">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ duration: 3 + i, repeat: Infinity }}
                 className={`w-20 h-20 rounded-full bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.2)]`}
               >
                  <Circle className="w-6 h-6 text-sky-400 fill-sky-400/20" />
               </motion.div>
               
               <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-[10px] font-black text-white">
                  {clusters[cat].length}
               </div>
            </div>

            <div className="mt-4 text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{cat}</p>
               <p className="text-xl font-black text-white tracking-tighter">
                  ₹{clusters[cat].reduce((sum: any, r: any) => sum + r.amount, 0).toLocaleString()}
               </p>
            </div>
            
            <div className="absolute -bottom-12 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black text-sky-400 flex items-center gap-2">
               <Terminal className="w-3 h-3" />
               <span>RESONANCE DETECTED</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="absolute bottom-8 right-8 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-4">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>TOPOLOGY_ACTIVE</span>
         </div>
         <div className="w-px h-3 bg-white/10" />
         <span>DRAG TO RE-CALIBRATE</span>
      </div>
    </div>
  );
};
