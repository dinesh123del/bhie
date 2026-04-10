import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Search, History, Sparkles, 
  ChevronRight, Mic, Filter, Database,
  ArrowUpRight, Info, AlertCircle, Quote
} from 'lucide-react';
import { 
  PremiumCard, 
  PremiumButton, 
  PremiumInput, 
  PremiumBadge 
} from '../components/ui/PremiumComponents';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';

interface MemoryItem {
  id: string;
  content: string;
  timestamp: number;
  metadata?: any;
}

const BusinessBrain = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [activeBriefing, setActiveBriefing] = useState(false);
  const [newDecision, setNewDecision] = useState('');

  // Simulated memories for initial wow factor
  const initialMemories: MemoryItem[] = [
    { 
      id: '1', 
      content: 'Identified recurring 15% wastage in AWS bill during Q3 2025. Recommended migration to reserved instances.', 
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 
    },
    { 
      id: '2', 
      content: 'Successfully navigated 2024 supply chain disruption by pivoting to redundant vendors in Mumbai.', 
      timestamp: Date.now() - 400 * 24 * 60 * 60 * 1000 
    },
    { 
      id: '3', 
      content: 'Ad-hoc marketing spend spiked 40% without direct ROAS correlation. Audit recommended stricter approval flows.', 
      timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 
    }
  ];

  useEffect(() => {
    setMemories(initialMemories);
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    
    try {
      const response = await api.post('/ai/memory/query', { query });
      setMemories(response.data.results || []);
      toast.success("Strategic context retrieval complete.");
    } catch (err) {
      toast.error("Failed to retrieve insights from history.");
    } finally {
       setIsSearching(false);
    }
  };

  const handleSaveDecision = async (content: string) => {
    if (!content) return;
    const loading = toast.loading("Persisting decision to history...");
    try {
      await api.post('/ai/memory/store', {
        id: `decision-${Date.now()}`,
        content,
        timestamp: Date.now(),
        metadata: { type: 'decision' }
      });
      toast.success("Decision recorded for future context.", { id: loading });
      void handleSearch(); // Refresh results if needed
    } catch {
      toast.error("Cloud storage failed. Please try again.", { id: loading });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <PremiumBadge variant="info">BUSINESS HISTORY</PremiumBadge>
          </motion.div>
          <h1 className="text-5xl font-black text-black dark:text-white tracking-tighter mb-4 italic uppercase">
            Business <span className="text-brand-500">History</span>
          </h1>
          <p className="text-black/50 dark:text-white/50 max-w-xl font-medium">
            Access the history of your business. The system remembers every cost, 
            every bill, and every problem from the past to help you make better choices today.
          </p>
        </div>

        <div className="flex gap-4">
           <PremiumButton 
             variant="primary"
             onClick={() => {
               setActiveBriefing(true);
               setTimeout(() => setActiveBriefing(false), 5000);
             }}
             className="flex items-center gap-2"
           >
             <Mic className="w-4 h-4" /> Start Voice Briefing
           </PremiumButton>
        </div>
      </div>

      {/* Semantic Search Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <PremiumCard padded={false} className="p-2 bg-white/50 dark:bg-black/50 backdrop-blur-3xl border-brand-500/20 shadow-2xl shadow-brand-500/10">
            <div className="relative flex items-center">
              <Search className="absolute left-6 w-6 h-6 text-black/30 dark:text-white/30" />
              <input 
                type="text"
                placeholder="Search your records... (e.g. 'How were my AWS expenses last quarter?')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent px-16 py-8 text-xl font-black tracking-tighter text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 focus:outline-none"
              />
              <div className="absolute right-4 flex gap-2">
                 <button className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl text-black/30 dark:text-white/30 hover:text-brand-500 transition-colors">
                    <History className="w-5 h-5" />
                 </button>
                 <PremiumButton onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Sparkles className="animate-spin w-4 h-4" /> : "SEARCH"}
                 </PremiumButton>
              </div>
            </div>
          </PremiumCard>

          {/* Decision Capture */}
          <PremiumCard className="p-10 border-brand-500/10 bg-brand-500/[0.02]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter italic">Record Strategic Decision</h2>
                <p className="text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Captured context builds your long-term memory</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <PremiumInput
                  placeholder="e.g., Switched to Razorpay for subscriptions due to better Indian card support."
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  className="w-full text-lg font-bold"
                />
              </div>
              <PremiumButton 
                variant="primary" 
                onClick={() => {
                  handleSaveDecision(newDecision);
                  setNewDecision('');
                }}
                className="md:w-48 bg-brand-500 text-white border-none shadow-lg shadow-brand-500/20"
              >
                Save Context
              </PremiumButton>
            </div>
          </PremiumCard>

          {/* Results Area */}
          <div className="space-y-6">
             <AnimatePresence>
               {isSearching && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="flex items-center gap-4 p-8 bg-brand-500/5 border border-brand-500/10 rounded-3xl"
                 >
                    <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
                    <div className="text-left">
                       <p className="text-sm font-black uppercase tracking-widest text-brand-500">Searching your history...</p>
                       <p className="text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Scanning all available records</p>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="grid gap-6">
                {memories.map((memory, i) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <PremiumCard className="hover:scale-[1.01] transition-all cursor-pointer group text-left p-8">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 group-hover:border-brand-500/50 transition-all">
                                <Quote className="w-5 h-5 text-black/40 dark:text-white/40" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">
                                SAVED DATA • {new Date(memory.timestamp).toLocaleDateString()}
                             </p>
                          </div>
                          <button className="text-black/20 dark:text-white/20 hover:text-brand-500 transition-colors">
                             <ArrowUpRight className="w-5 h-5" />
                          </button>
                       </div>
                       <p className="text-xl font-bold tracking-tight leading-relaxed mb-6">
                          {memory.content}
                       </p>
                       <div className="flex gap-2">
                          <PremiumBadge variant="info">FINANCIAL CORE</PremiumBadge>
                          <PremiumBadge variant="warning">AUDIT READY</PremiumBadge>
                       </div>
                    </PremiumCard>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
           {/* Ambient briefing simulation */}
           <AnimatePresence>
             {activeBriefing && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
               >
                 <PremiumCard gradient className="p-8 border-none text-white overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 animate-ping">
                       <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                          <Mic className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest opacity-60">Voice Briefing Live</p>
                          <p className="font-bold tracking-tight">Business Summary</p>
                       </div>
                    </div>
                    <div className="space-y-1 h-3 flex items-end gap-1 mb-6">
                       {[0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 0.2, 0.6, 0.4].map((h, i) => (
                         <motion.div 
                           key={i}
                           animate={{ height: [`${h * 100}%`, `${(1-h) * 100}%`, `${h * 100}%`] }}
                           transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                           className="flex-1 bg-white/40 rounded-full"
                         />
                       ))}
                    </div>
                    <p className="text-sm italic opacity-80 leading-relaxed font-medium">
                       "Based on your recent history, we found inconsistent spending in your recurring subscriptions. 
                       Clicking optimization will reduce this by 15%."
                    </p>
                 </PremiumCard>
               </motion.div>
             )}
           </AnimatePresence>

           <PremiumCard className="p-8 text-left border-black/5 dark:border-white/5">
              <h4 className="text-sm font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-6 flex items-center gap-2">
                 <Database className="w-4 h-4" /> Memory Health
              </h4>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <p className="text-xs font-bold uppercase tracking-tighter">Accuracy Score</p>
                       <p className="text-xl font-black italic">98%</p>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-500 w-[98%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <p className="text-xs font-bold uppercase tracking-tighter">Data Amount</p>
                       <p className="text-xl font-black italic">High</p>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-500 w-[85%]" />
                    </div>
                 </div>
              </div>
           </PremiumCard>

           <div className="p-6 bg-brand-500/5 border border-brand-500/10 rounded-3xl flex items-start gap-4">
              <Info className="w-5 h-5 text-brand-500 mt-1 shrink-0" />
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 mb-1">SMART TIP</p>
                 <p className="text-[11px] font-medium text-black/50 dark:text-white/50 leading-relaxed">
                    The more bills you scan, the more our system learns. 
                    This helps us predict how outside business changes will affect your specific suppliers.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessBrain;
