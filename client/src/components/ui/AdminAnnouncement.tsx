import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

const AdminAnnouncement = () => {
  const [instructions, setInstructions] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const response = await fetch('/api/pricing');
        const data = await response.json();
        if (data.success && data.data.adminInstructions) {
          setInstructions(data.data.adminInstructions);
        }
      } catch (error) {
        console.error('Failed to fetch admin instructions');
      }
    };

    fetchInstructions();
    // Poll every 60 seconds
    const interval = setInterval(fetchInstructions, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!instructions || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
      >
        <div className="bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex items-start gap-4">
          <div className="bg-white/10 p-2 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Command Protocol Updates</p>
            <p className="text-sm font-bold text-white leading-relaxed italic">{instructions}</p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors self-center"
          >
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminAnnouncement;
