import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cpu, Zap, Activity } from 'lucide-react';

interface HUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const HUDModal = ({ isOpen, onClose, data }: HUDModalProps) => {
  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-12"
      >
        {/* SCANNING GRID */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
           <motion.div 
             animate={{ y: ['0%', '100%', '0%'] }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             className="absolute top-0 left-0 right-0 h-1 bg-sky-500/20 blur-sm shadow-[0_0_20px_rgba(56,189,248,0.5)] z-20"
           />
        </div>

        <motion.div
          initial={{ scale: 0.9, y: 20, rotateX: 10 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          className="relative w-full max-w-5xl aspect-video border border-sky-500/30 bg-black/40 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(56,189,248,0.15)] group"
        >
          {/* HUD CORNERS */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-sky-500/50" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-sky-500/50" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-sky-500/50" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-sky-500/50" />

          {/* HEADER */}
          <div className="p-8 border-b border-sky-500/20 flex justify-between items-center bg-sky-500/5">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/30">
                  <Shield className="w-6 h-6 text-sky-400" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400/60">Record Identifier</p>
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{data.title}</h2>
               </div>
            </div>
            <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
               <X className="w-6 h-6" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
               <div className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                     <Cpu className="w-4 h-4 text-sky-400" />
                     <p className="text-xs font-black uppercase tracking-widest text-white/40">Technical Summary</p>
                  </div>
                  <p className="text-lg text-white font-medium leading-relaxed italic">
                    "{data.description || 'System node initialized with static parameters. No specific strategic directive attached.'}"
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-white/5 bg-white/[0.02] rounded-xl text-center">
                     <p className="text-[10px] font-bold text-white/30 uppercase mb-2">Category</p>
                     <p className="text-xl font-black text-sky-400">{data.category}</p>
                  </div>
                  <div className="p-4 border border-white/5 bg-white/[0.02] rounded-xl text-center">
                     <p className="text-[10px] font-bold text-white/30 uppercase mb-2">Node Type</p>
                     <p className="text-xl font-black text-amber-400 capitalize">{data.type}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col justify-center items-center relative">
               <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-[300px] h-[300px] border-4 border-dashed border-sky-500/10 rounded-full" 
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="w-[240px] h-[240px] border-2 border-dashed border-sky-500/20 rounded-full" 
                  />
               </div>
               
               <div className="relative z-10 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                     <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
                     <p className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Capital Weight</p>
                  </div>
                  <p className="text-[5rem] font-black text-white leading-none tracking-tighter">
                    ₹{data.amount.toLocaleString()}
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-6">
                     <div className="flex flex-col items-center">
                        <Activity className="w-5 h-5 text-emerald-400 mb-2" />
                        <span className="text-[10px] font-bold text-white/20">CONFIDENCE: 98.4%</span>
                     </div>
                     <div className="w-px h-10 bg-white/10" />
                     <div className="flex flex-col items-center">
                        <Shield className="w-5 h-5 text-sky-400 mb-2" />
                        <span className="text-[10px] font-bold text-white/20">SECURITY: ELITE</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 flex gap-12 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
             <span>NODE_REF: {data._id.slice(-8)}</span>
             <span>TIMESTAMP: {new Date(data.createdAt).toISOString()}</span>
             <span>STATUS: {data.status}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
