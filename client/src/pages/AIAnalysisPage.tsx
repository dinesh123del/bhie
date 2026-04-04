import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { AnalysisDashboard } from '../components/AIAnalysisDashboard';
import { PremiumCard, PremiumButton, PremiumInput } from '../components/ui/PremiumComponents';
import type { BusinessData } from '../types/ai';
import { premiumFeedback } from '../utils/premiumFeedback';

export const AnalysisReportPage: React.FC = () => {
  const [formData, setFormData] = useState<BusinessData>({
    revenue: 0,
    expenses: 0,
    customerCount: 0,
    previousRevenue: 0,
  });

  const { data: analysisResult, loading, error, analyze, reset } = useAIAnalysis();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customerCount' ? parseInt(value) || 0 : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    premiumFeedback.click();
    try {
      await analyze(formData);
      premiumFeedback.success();
    } catch (err) {
      premiumFeedback.error();
    }
  };

  const handleReset = () => {
    reset();
    premiumFeedback.click();
    setFormData({
      revenue: 0,
      expenses: 0,
      customerCount: 0,
      previousRevenue: 0,
    });
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Elite Header */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6"
          >
            <BrainCircuit className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">AI Analyst v4.2</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] mb-4">
            Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-indigo-400">Deep Dive.</span>
          </h1>
          <p className="max-w-2xl text-xl text-white/40 font-medium leading-relaxed">
            Use our AI analyst to study your business numbers. Get clear advice based on your data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10">
          {/* Input Side */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <PremiumCard extreme className="p-8 backdrop-blur-3xl bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-400/20">
                    <Target className="w-5 h-5" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white tracking-tight">Enter Your Numbers</h2>
                   <p className="text-xs text-white/40 uppercase tracking-widest font-black">Update Business Data</p>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200 font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <PremiumInput
                  label="Current Revenue (₹)"
                  type="number"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleInputChange}
                  icon={<Activity className="w-4 h-4 text-sky-400" />}
                  placeholder="0.00"
                  floating
                />

                <PremiumInput
                  label="Monthly Expenses (₹)"
                  type="number"
                  name="expenses"
                  value={formData.expenses}
                  onChange={handleInputChange}
                  icon={<Zap className="w-4 h-4 text-amber-300" />}
                  placeholder="0.00"
                  floating
                />

                <PremiumInput
                  label="Total Customer Count"
                  type="number"
                  name="customerCount"
                  value={formData.customerCount}
                  onChange={handleInputChange}
                  icon={<PieChart className="w-4 h-4 text-indigo-400" />}
                  placeholder="0"
                  floating
                />

                <PremiumInput
                  label="Baseline Revenue (₹)"
                  type="number"
                  name="previousRevenue"
                  value={formData.previousRevenue}
                  onChange={handleInputChange}
                  icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                  placeholder="0.00"
                  floating
                />

                <div className="pt-6 flex flex-col gap-3">
                  <PremiumButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="w-full bg-white text-slate-950 border-none shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:bg-slate-100"
                  >
                    Start Analysis
                  </PremiumButton>
                  
                  {analysisResult && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full py-4 text-white/40 hover:text-white text-xs font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Node
                    </button>
                  )}
                </div>
              </form>

              {/* Protocol Monitor */}
              <div className="mt-10 p-6 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                 <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span className="text-[10px] font-black text-sky-400/80 uppercase tracking-widest">Analysis Tools</span>
                 </div>
                 <ul className="space-y-3">
                   {[
                     "Profit growth planning",
                     "Risk detection",
                     "Future trends",
                     "Business strategy"
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-[10px] text-white/50 font-medium">
                        <div className="w-1 h-1 rounded-full bg-sky-500/40" /> {item}
                     </li>
                   ))}
                 </ul>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Results Side */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {analysisResult ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnalysisDashboard
                    analysisResult={analysisResult}
                    loading={loading}
                  />
                </motion.div>
              ) : loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                   <PremiumCard className="p-12 bg-white/[0.01] flex flex-col items-center justify-center min-h-[600px] border-white/5">
                      <div className="relative w-24 h-24 mb-8">
                         <motion.div 
                           className="absolute inset-0 border-2 border-sky-500/20 rounded-full"
                           animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                           transition={{ duration: 2, repeat: Infinity }}
                         />
                         <motion.div 
                           className="absolute inset-2 border-2 border-sky-400 border-t-transparent rounded-full"
                           animate={{ rotate: 360 }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                         />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <BrainCircuit className="w-8 h-8 text-sky-400" />
                         </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Analyzing Data...</h3>
                      <p className="text-white/40 text-sm tracking-widest uppercase font-black">AI is working on your results</p>
                   </PremiumCard>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <PremiumCard className="p-12 text-center bg-white/[0.01] border-white/5 flex flex-col items-center justify-center min-h-[600px]">
                    <div className="w-24 h-24 rounded-3xl bg-sky-500/5 border border-sky-500/10 flex items-center justify-center text-sky-400 mb-8">
                       <PieChart className="w-10 h-10 opacity-40" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">Ready to Start</h3>
                    <p className="text-white/40 max-w-sm mb-8 font-medium">
                      Enter your numbers on the left to start the AI analysis.
                    </p>
                    <div className="flex gap-2">
                       <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/50 uppercase tracking-widest">Ready</div>
                       <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/50 uppercase tracking-widest">Optimized</div>
                       <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/50 uppercase tracking-widest">Secure</div>
                    </div>
                  </PremiumCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportPage;
