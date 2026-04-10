import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  Search,
  FileBadge,
  CreditCard,
  Target
} from 'lucide-react';
import { PremiumCard, PremiumButton, PremiumBadge } from '../components/ui/PremiumComponents';
import { workflowService, OptimizationResult, TaxReadiness } from '../services/workflowService';
import toast from 'react-hot-toast';
import { premiumFeedback } from '../utils/premiumFeedback';

const Workflows: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [readiness, setReadiness] = useState<TaxReadiness | null>(null);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const [opt, read] = await Promise.all([
        workflowService.getExpenseOptimization(),
        workflowService.getTaxReadiness()
      ]);
      setOptimization(opt);
      setReadiness(read);
    } catch (err) {
      toast.error('Failed to update workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    premiumFeedback.click();
    const load = toast.loading('Generating Auditor Bundle...');
    try {
      await workflowService.generateBundle();
      toast.success('Bundle downloaded successfully', { id: load });
    } catch {
      toast.error('Failed to generate bundle', { id: load });
    }
  };

  useEffect(() => {
    void fetchWorkflows();
  }, []);

  return (
    <div className="min-h-screen bg-transparent py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Elite Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Automated Workflows</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] mb-6">
              Actionable <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-orange-400">Workflows.</span>
            </h1>
            <p className="text-xl text-white/40 font-medium leading-relaxed">
              We automate your tedious business tasks. Our systems scout for savings and handle your tax readiness so you can focus on growth.
            </p>
          </div>
          
          <PremiumButton 
            onClick={fetchWorkflows} 
            loading={loading}
            icon={<RefreshCw className="w-4 h-4" />}
            variant="secondary"
          >
            Sync Workflows
          </PremiumButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Expense Optimizer Workflow */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Expense Optimizer</h2>
            </div>

            <PremiumCard extreme className="p-10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-1">Estimated Savings</p>
                  <h3 className="text-4xl font-black text-amber-400">₹{optimization?.potentialMonthlySavings?.toLocaleString() || '0'}/mo</h3>
                </div>
                <PremiumBadge tone="positive">Analysis Active</PremiumBadge>
              </div>

              <div className="space-y-4">
                {optimization?.actions.map((action, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/[0.08] transition-colors group cursor-pointer"
                    onClick={() => {
                      premiumFeedback.click();
                      toast.success(`Automation initialized for ${action.item}`);
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        action.type === 'cancel' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#00D4FF]/20 text-[#00D4FF]/10 text-[#00D4FF] border-blue-500/20'
                      }`}>
                        {action.type === 'cancel' ? <CreditCard className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-white font-bold">{action.item}</p>
                        <p className="text-[10px] text-white/40 uppercase font-black truncate max-w-[200px]">{action.rationale}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">Save ₹{action.amount}</p>
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1 justify-end">
                        Run <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-bold text-white">Optimization Strategy</p>
                </div>
                <p className="text-xs text-white/40 leading-relaxed font-medium">
                  We look for duplicate subscriptions, high-cost vendors compared to market rates, and unused licenses. Our recommendation engine suggests the best way to cut costs without slowing down.
                </p>
              </div>
            </PremiumCard>
          </div>

          {/* Tax Readiness Workflow */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Tax Readiness</h2>
            </div>

            <PremiumCard extreme className="p-10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-1">Compliance Score</p>
                  <h3 className="text-4xl font-black text-white italic">{readiness?.score || 0}%</h3>
                </div>
                <PremiumBadge tone={readiness?.status === 'Ready' ? 'positive' : 'warning'}>{readiness?.status || 'Analyzing'}</PremiumBadge>
              </div>

              <div className="space-y-4">
                {readiness?.checklist.map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      {task.status === 'complete' || task.status === 'ready' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                      )}
                      <span className={`text-sm font-bold ${task.status === 'pending' ? 'text-white/40' : 'text-white'}`}>{task.task}</span>
                    </div>
                    {task.status === 'ready' && (
                      <button 
                        onClick={handleExport}
                        className="text-[9px] font-black text-sky-400 uppercase tracking-widest border border-sky-400/20 px-3 py-1 rounded-full hover:bg-sky-400/10 transition-colors"
                      >
                        Export Bundle
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {readiness?.missingDocuments && readiness.missingDocuments.length > 0 && (
                <div className="mt-8 p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-sm font-bold text-white uppercase tracking-tighter">Action Required</p>
                  </div>
                  <div className="space-y-3">
                    {readiness.missingDocuments.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-red-200/60 font-medium">
                        <div className="w-1 h-1 rounded-full bg-red-400" /> {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-white/5">
                <div 
                   className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all group"
                   onClick={handleExport}
                >
                   <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <FileBadge className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-white font-bold">Auditor Bundle Ready?</h4>
                      <p className="text-[10px] text-white/40 uppercase font-black">Generate a clean ZIP for your accountant</p>
                   </div>
                   <div className="ml-auto">
                      <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-sky-400 transition-colors" />
                   </div>
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>

        {/* Vision Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 p-12 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[3rem] border border-white/5 text-center relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
             <Target className="w-10 h-10 text-white/10 mx-auto mb-6" />
             <h3 className="text-3xl font-black text-white italic mb-4">Focus on growing your business.</h3>
             <p className="text-white/40 max-w-sm mx-auto font-medium leading-relaxed">
               We're building more workflows every day. Next: Automated Payroll Matching and Vendor Risk Assessment.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Workflows;
