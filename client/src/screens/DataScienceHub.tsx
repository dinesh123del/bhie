"use client"
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Upload, 
  Zap, 
  Sparkles, 
  BrainCircuit, 
  LineChart, 
  PieChart, 
  ShieldCheck,
  ChevronRight,
  Info,
  Beaker,
  GraduationCap,
  FileText,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Download
} from 'lucide-react';
import { generateBrandedPDF } from '../utils/pdfGenerator';

import api from '../lib/axios';
import toast from 'react-hot-toast';
import { PremiumCard, PremiumButton } from '../components/ui/PremiumComponents';


interface DSAnalysisResult {
  summary: string;
  statistics: { metric: string; value: string; status: 'positive' | 'negative' | 'neutral' }[];
  correlations: string[];
  outliers: string[];
  trends: string[];
  graduateAdvice: string;
  profitabilityRoadmap: { step: string; rationale: string; impact: 'high' | 'medium' | 'low' }[];
}

export const DataScienceHub: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DSAnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const isValidFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv' || ext === 'xlsx' || ext === 'xls' || ext === 'pdf') return true;
    toast.error('Please upload a CSV, Excel, or PDF file.');
    return false;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const runAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/ds/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(response.data.analysis);
      toast.success('Analysis Done');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
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
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Expert Business Check</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] mb-4">
            Expert Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-blue-400">Check.</span>
          </h1>
          <p className="max-w-2xl text-xl text-white/40 font-medium leading-relaxed">
            Upload your spreadsheets or business files. Our smart AI will study them and find easy ways for you to grow in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-10">
          {/* Action Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <PremiumCard extreme className="p-8 backdrop-blur-3xl bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20">
                    <Beaker className="w-5 h-5" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white tracking-tight">Upload Your File</h2>
                   <p className="text-xs text-white/40 uppercase tracking-widest font-black">Smart Business Tool</p>
                </div>
              </div>

              {!file ? (
                <motion.div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center text-center ${
                    dragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-emerald-400/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,.pdf" onChange={handleFileChange} />
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-400/10">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-bold mb-1">Pick a File</h3>
                  <p className="text-xs text-white/30 font-medium">Put your spreadsheet or PDF here</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      {file.name.endsWith('.pdf') ? <FileText className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{file.name}</p>
                      <p className="text-[10px] text-white/40 uppercase font-black">{(file.size / 1024).toFixed(1)} KB • Local Data</p>
                    </div>
                    <button onClick={() => setFile(null)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Zap className="w-4 h-4 rotate-45" />
                    </button>
                  </div>

                  <PremiumButton 
                    onClick={runAnalysis} 
                    loading={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-none py-4"
                  >
                    See My Results
                  </PremiumButton>
                </motion.div>
              )}

              {/* Protocol Details */}
              <div className="mt-10 p-6 bg-emerald-500/5 border border-emerald-400/10 rounded-2xl">
                 <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">What we check</span>
                 </div>
                 <ul className="space-y-3">
                   {[
                     "Checking your costs & prices",
                     "Seeing how well you're doing",
                     "Finding any problems",
                     "Seeing your future growth"
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-[10px] text-white/50 font-medium font-mono">
                        <ChevronRight className="w-2.5 h-2.5 text-emerald-400" /> {item}
                     </li>
                   ))}
                 </ul>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="space-y-8"
                >
                  {/* Summary Card */}
                  <PremiumCard className="p-8 border-emerald-500/20 bg-emerald-500/[0.02]">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black text-white italic">What We Found</h2>
                      </div>
                      <PremiumButton
                        onClick={() => {
                          const content = `
Summary:
${analysis.summary}

Statistics:
${analysis.statistics.map(s => `${s.metric}: ${s.value}`).join('\n')}

Graduate Advice:
${analysis.graduateAdvice}

Profitability Roadmap:
${analysis.profitabilityRoadmap.map(r => `- ${r.step}: ${r.rationale} (${r.impact} impact)`).join('\n')}
                          `.trim();

                          void generateBrandedPDF({
                            title: 'Data Science Analysis Report',
                            content: content,
                            filename: `Analysis_${file?.name.replace(/\.[^/.]+$/, "")}_${Date.now()}`,
                            type: 'data_science'
                          });
                        }}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-2 px-6 flex items-center gap-2"
                      >
                        <Download size={18} />
                        Export PDF
                      </PremiumButton>
                    </div>
                    <p className="text-xl text-white/70 leading-relaxed font-medium italic">
                      "{analysis.summary}"
                    </p>
                  </PremiumCard>


                  {/* Profitability Roadmap Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 px-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Your Plan to Grow</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {(analysis.profitabilityRoadmap || []).map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <PremiumCard className="p-6 bg-white/[0.02] border-white/5 hover:border-emerald-500/30 transition-all group">
                            <div className="flex flex-col md:flex-row gap-6 md:items-center">
                              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-black text-white whitespace-nowrap">{item.step}</h4>
                                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                    item.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                                    item.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-[#00D4FF]/20 text-[#00D4FF]/20 text-[#00D4FF]'
                                  }`}>
                                    {item.impact} IMPACT
                                  </div>
                                </div>
                                <p className="text-sm text-white/40 font-medium leading-relaxed">
                                  {item.rationale}
                                </p>
                              </div>
                              <div className="hidden md:block">
                                <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-emerald-400 transition-colors" />
                              </div>
                            </div>
                          </PremiumCard>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(analysis.statistics || []).map((stat, i) => (
                      <PremiumCard key={i} className="p-6 bg-white/[0.03]">
                        <p className="text-[10px] text-white/40 uppercase font-black mb-2">{stat.metric}</p>
                        <p className={`text-2xl font-black ${
                          stat.status === 'positive' ? 'text-emerald-400' : 
                          stat.status === 'negative' ? 'text-red-400' : 'text-[#00D4FF]'
                        }`}>
                          {stat.value}
                        </p>
                      </PremiumCard>
                    ))}
                  </div>

                  {/* Graduate Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PremiumCard className="p-8 border-white/5">
                      <div className="flex items-center gap-3 mb-6">
                        <BrainCircuit className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter">Connections Found</h3>
                      </div>
                      <div className="space-y-4">
                        {(analysis.correlations || []).map((c, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <Zap className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                            <p className="text-sm text-purple-200/80 font-medium leading-relaxed">{c}</p>
                          </div>
                        ))}
                      </div>
                    </PremiumCard>

                    <PremiumCard className="p-8 border-white/5">
                      <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter">Odd Numbers Found</h3>
                      </div>
                      <div className="space-y-4">
                        {(analysis.outliers || []).map((o, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <Info className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                            <p className="text-sm text-amber-200/80 font-medium leading-relaxed">{o}</p>
                          </div>
                        ))}
                      </div>
                    </PremiumCard>
                  </div>

                  {/* The Expert Voice */}
                  <PremiumCard className="p-10 border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <GraduationCap className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/20">
                          <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-white">Expert Summary</h4>
                          <p className="text-xs text-white/40 uppercase font-black tracking-widest">Business Intelligence Report</p>
                        </div>
                      </div>
                      <p className="text-xl text-white/70 leading-relaxed font-medium mb-8">
                        {analysis.graduateAdvice}
                      </p>
                    </div>
                  </PremiumCard>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PremiumCard className="p-6 border-white/5 bg-[#00D4FF]/20 text-[#00D4FF]/5 hover:bg-[#00D4FF]/20 text-[#00D4FF]/10 transition-colors">
                      <div className="flex items-center gap-3 mb-4 text-[#00D4FF]">
                        <LineChart className="w-5 h-5" />
                        <h4 className="font-black text-xs uppercase tracking-widest">Track Your Trends</h4>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">
                        We look at your recent data more than old lists to make sure we know what is happening in your shop right now.
                      </p>
                    </PremiumCard>
                    <PremiumCard className="p-6 border-white/5 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                      <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <PieChart className="w-5 h-5" />
                        <h4 className="font-black text-xs uppercase tracking-widest">How We Group Spending</h4>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">
                        We split your spending into "Must Have" and "Extra Things" so you can see where to save your money.
                      </p>
                    </PremiumCard>
                    <PremiumCard className="p-6 border-white/5 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors">
                      <div className="flex items-center gap-3 mb-4 text-indigo-400">
                        <ShieldCheck className="w-5 h-5" />
                        <h4 className="font-black text-xs uppercase tracking-widest">How We Spot Odd Numbers</h4>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">
                        We find any numbers that look very different from the usual ones and flag them for you to check.
                      </p>
                    </PremiumCard>
                  </div>
                </motion.div>
              ) : loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                   <PremiumCard className="p-12 bg-white/[0.01] flex flex-col items-center justify-center min-h-[600px] border-white/5">
                      <div className="relative w-32 h-32 mb-12">
                         <motion.div 
                           className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"
                           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }}
                           transition={{ duration: 3, repeat: Infinity }}
                         />
                         <motion.div 
                           className="absolute inset-4 border-t-4 border-emerald-400 rounded-full"
                           animate={{ rotate: 360 }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                         />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Beaker className="w-10 h-10 text-emerald-400" />
                         </div>
                      </div>
                      <h3 className="text-3xl font-black text-white mb-2 italic">Reading Your File...</h3>
                      <p className="text-white/30 text-sm tracking-[0.4em] uppercase font-black">Looking for patterns in your data</p>
                   </PremiumCard>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <PremiumCard className="p-12 text-center bg-white/[0.01] border-white/5 flex flex-col items-center justify-center min-h-[600px] group">
                    <div className="w-32 h-32 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 mb-12 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                       <BarChart3 className="w-12 h-12 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-6">Ready to Help</h3>
                    <p className="text-white/40 max-w-sm mb-10 text-lg font-medium leading-relaxed">
                      Upload your business files and we'll find patterns you might have missed. We're ready to help you grow.
                    </p>
                    <div className="flex gap-4">
                       <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Secure
                       </div>
                       <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Real-time
                       </div>
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

export default DataScienceHub;
