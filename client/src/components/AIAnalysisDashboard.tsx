import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Target, 
  BrainCircuit, 
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  IndianRupee,
  Users,
  Wallet,
  Sparkles
} from 'lucide-react';
import type { AnalysisResult, Strategy } from '../types/ai';
import type { AIAnalysisResponse } from '../services/aiService';
import { PremiumCard, PremiumBadge } from './ui/PremiumComponents';

interface AnalysisDashboardProps {
  analysisResult: AnalysisResult | AIAnalysisResponse;
  loading?: boolean;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysisResult,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white/[0.01] rounded-3xl border border-white/5 backdrop-blur-3xl min-h-[600px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <RefreshCw className="w-12 h-12 text-sky-400" />
        </motion.div>
        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-sm italic">Synthesizing Data Streams...</p>
      </div>
    );
  }

  if (!analysisResult || analysisResult.status !== 'complete') {
    return (
      <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-4">
           <AlertTriangle className="w-6 h-6 text-red-400" />
           <p className="text-xl font-bold text-white">Analysis Disrupted</p>
        </div>
        <p className="text-red-200/60 font-medium">
          {analysisResult?.message || 'The neural engine encountered an unexpected error during synthesis. Please re-initiate the protocol.'}
        </p>
      </div>
    );
  }

  const { analysis } = analysisResult;

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-sky-500 to-indigo-600 p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(56,189,248,0.4)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <BrainCircuit className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <Sparkles className="w-5 h-5 text-white/80" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Intelligence Finalized</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none">Command Briefing.</h1>
          <div className="flex items-center gap-2 text-white/70 font-medium bg-black/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
             <Calendar className="w-4 h-4" />
             {new Date(analysisResult.timestamp).toLocaleString()}
          </div>
        </div>
      </motion.div>

      {/* KPI Core */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: analysisResult.businessData.revenue, icon: <IndianRupee />, color: 'sky' },
          { label: 'Operational Burn', value: analysisResult.businessData.expenses, icon: <Wallet />, color: 'amber' },
          { label: 'User Base', value: analysisResult.businessData.customerCount, icon: <Users />, color: 'purple' }
        ].map((kpi, i) => (
          <PremiumCard key={i} extreme={kpi.color === 'sky'} className="p-8 bg-white/[0.02]">
            <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-500/10 flex items-center justify-center mb-6`}>
               {React.cloneElement(kpi.icon as React.ReactElement, { className: `w-5 h-5 text-${kpi.color}-400` })}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{kpi.label}</p>
            <p className="text-3xl font-black text-white tracking-tighter">
               {kpi.label.includes('Count') ? kpi.value?.toLocaleString() : `₹${kpi.value?.toLocaleString()}`}
            </p>
          </PremiumCard>
        ))}
      </div>

      {/* Financial Health Section */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-8">
        <PremiumCard className="p-8 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-white tracking-tight">Financial Health</h2>
            <PremiumBadge tone="positive">Stability Optimal</PremiumBadge>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Net Margin</p>
              <p className="text-3xl font-black text-sky-400">{analysis.financial.profitMargin}</p>
            </div>
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Burn Velocity</p>
              <p className="text-3xl font-black text-white">{analysis.financial.expenseRatio}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/20 mb-4">Tactical Findings</p>
              <ul className="space-y-3">
                {analysis.financial.keyFindings.map((finding: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-white/60 leading-relaxed font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500/40 mt-1.5 flex-shrink-0" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
            
            {analysis.financial.risks.length > 0 && (
              <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <AlertTriangle className="w-3 h-3" /> Critical Risks
                </p>
                <ul className="space-y-2">
                  {analysis.financial.risks.map((risk: string, idx: number) => (
                    <li key={idx} className="text-xs text-red-200/70 font-medium flex gap-2">
                      <span className="text-red-400">×</span> {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Strategic Forecast */}
        <PremiumCard className="p-8 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-white tracking-tight">Growth Forecast</h2>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
               <ArrowUpRight className="w-3 h-3" /> Upward Trend
            </div>
          </div>

          <div className="space-y-4 mb-10">
            {[
              { label: '3-Month', sub: 'Tactical Window', val: analysis.predictions.forecast3Month, color: 'sky' },
              { label: '6-Month', sub: 'Strategic Horizon', val: analysis.predictions.forecast6Month, color: 'indigo' },
              { label: '12-Month', sub: 'Corporate Trajectory', val: analysis.predictions.forecast12Month, color: 'purple' }
            ].map((f, i) => (
              <div key={i} className="group relative p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all flex items-center justify-between">
                 <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{f.label}</p>
                    <p className="text-[10px] text-white/30 font-medium">{f.sub}</p>
                 </div>
                 <div className="text-right">
                    <p className={`text-2xl font-black text-${f.color}-400 mb-1`}>{f.val.revenue}</p>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Conf: {f.val.confidence}</span>
                        <span className="text-[10px] font-black text-emerald-400">{f.val.changePercent}</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-16 h-16 text-indigo-400" />
             </div>
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Overall Momentum</p>
             <p className="text-xl font-bold text-white mb-1">{analysis.predictions.growthTrajectory}</p>
             <p className="text-sm text-white/40 font-medium">Projection: {analysis.predictions.overallTrend}</p>
          </div>
        </PremiumCard>
      </div>

      {/* Market Strategy Section */}
      <PremiumCard className="p-10 bg-white/[0.01]">
         <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
               <Target className="w-6 h-6 text-white" />
            </div>
            <div>
               <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">Market Execution</h2>
               <p className="text-xs text-white/40 font-black uppercase tracking-[0.25em]">Strategic Command Directive</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {[
              { label: 'Demand Level', val: analysis.market.demandLevel, icon: <Activity /> },
              { label: 'Competition', val: analysis.market.competitionIntensity, icon: <Zap /> },
              { label: 'Market Trend', val: analysis.market.marketTrend, icon: <TrendingUp /> }
            ].map((m, i) => (
              <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                 <div className="flex items-center gap-2 mb-4 text-white/40">
                    {React.cloneElement(m.icon as React.ReactElement, { className: 'w-3 h-3' })}
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                 </div>
                 <p className="text-xl font-black text-white">{m.val}</p>
              </div>
            ))}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
               <h3 className="text-lg font-black text-emerald-400 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Opportunities
               </h3>
               <ul className="space-y-4">
                 {analysis.market.opportunities.map((opp: string, idx: number) => (
                   <li key={idx} className="flex gap-4 text-sm text-emerald-200/70 font-medium leading-relaxed">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/30 mt-1.5 flex-shrink-0" />
                      {opp}
                   </li>
                 ))}
               </ul>
            </div>
            <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
               <h3 className="text-lg font-black text-amber-400 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Threats Identified
               </h3>
               <ul className="space-y-4">
                 {analysis.market.threats.map((threat: string, idx: number) => (
                   <li key={idx} className="flex gap-4 text-sm text-amber-200/70 font-medium leading-relaxed">
                      <div className="w-2 h-2 rounded-full bg-amber-500/30 mt-1.5 flex-shrink-0" />
                      {threat}
                   </li>
                 ))}
               </ul>
            </div>
         </div>
      </PremiumCard>

      {/* Strategic Actions */}
      <PremiumCard extreme className="p-10 bg-black/20 backdrop-blur-3xl overflow-hidden relative">
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
         
         <div className="relative z-10 mb-12">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 italic">Actionable Strategy.</h2>
            <p className="max-w-3xl text-lg text-white/50 font-medium leading-relaxed">
               {analysis.strategies.executiveSummary}
            </p>
         </div>

         <div className="mb-10 p-8 bg-white text-slate-950 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)]">
            <div className="flex items-center gap-3 mb-6">
               <Zap className="w-5 h-5 text-sky-600 fill-current" />
               <span className="text-xs font-black uppercase tracking-[0.3em]">Immediate Priority Protocols</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
               {analysis.strategies.immediateActions.slice(0, 3).map((action: string, idx: number) => (
                  <div key={idx} className="p-5 border border-slate-200 rounded-2xl flex gap-4">
                     <span className="text-2xl font-black text-slate-300">0{idx + 1}</span>
                     <p className="text-sm font-bold leading-snug">{action}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            {analysis.strategies.strategies.map((strategy: Strategy) => (
               <motion.div
                  key={strategy.rank}
                  whileHover={{ scale: 1.01 }}
                  className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl transition-all"
               >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                     <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-white/20 italic">{strategy.rank}</span>
                        <h3 className="text-xl font-black text-white tracking-tight">{strategy.title}</h3>
                     </div>
                     <PremiumBadge tone="brand">Impact Potential: {strategy.impactPercent}</PremiumBadge>
                  </div>

                  <p className="text-white/60 mb-6 font-medium leading-relaxed">{strategy.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                     {[
                       { label: 'Expectation', val: strategy.expectedImpact },
                       { label: 'Timeline', val: strategy.timeline },
                       { label: 'Risk Model', val: strategy.riskLevel },
                       { label: 'Confidence', val: strategy.confidence }
                     ].map((stat, sidx) => (
                       <div key={sidx} className="p-4 bg-white/5 rounded-xl border border-white/5">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className="text-xs font-black text-white">{stat.val}</p>
                       </div>
                     ))}
                  </div>

                  <div className="p-5 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                     <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <BrainCircuit className="w-3" /> Execution Plan
                     </p>
                     <p className="text-sm text-white/80 font-medium">{strategy.actionPlan}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </PremiumCard>

      {/* Global Defense Protocols */}
      <PremiumCard className="p-10 border-red-500/20 bg-red-500/5 backdrop-blur-3xl">
        <h3 className="text-2xl font-black text-red-100 italic tracking-tighter mb-8 flex items-center gap-3 underline underline-offset-8 decoration-red-500/40">
           <ShieldCheck className="w-6 h-6 text-red-500" /> Global Defense Protocols
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
           <ul className="space-y-4">
              {analysis.strategies.riskMitigation.map((mitigation: string, idx: number) => (
              <li key={idx} className="flex gap-4 text-sm text-red-100/60 font-medium leading-relaxed">
                 <div className="w-2 h-2 rounded-full bg-red-500/40 mt-1.5 flex-shrink-0" />
                 {mitigation}
              </li>
            ))}
           </ul>
           <div className="flex flex-col justify-end items-end">
              <div className="text-right">
                 <p className="text-[10px] font-black text-red-400/60 uppercase tracking-[0.3em] mb-1">System Audit Requisite</p>
                 <p className="text-xl font-black text-white">{analysis.strategies.nextReviewDate}</p>
              </div>
           </div>
        </div>
      </PremiumCard>
    </div>
  );
};

import { RefreshCw } from 'lucide-react';

export default AnalysisDashboard;
