import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Globe, 
  AlertTriangle, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  Server
} from 'lucide-react';
import { PremiumCard, PremiumButton, PremiumBadge } from '../components/ui/PremiumComponents';
import { systemAPI } from '../services/api';
import toast from 'react-hot-toast';

interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: {
    nodeEnv: string;
    missingVars: string[];
  };
  services: {
    database: { status: 'up' | 'down'; latency?: number };
    redis: { status: 'up' | 'down' };
    ai: {
      openai: string;
      claude: string;
      blackbox: string;
    };
  };
}

const SystemHealth = () => {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);

  const performCheck = async () => {
    setLoading(true);
    try {
      const data = await systemAPI.getHealthReport();
      setReport(data);
      toast.success('System audit complete');
    } catch (error) {
      toast.error('Health check failed');
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'up' || status === 'healthy' || status === 'active') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
    if (status === 'degraded') {
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
    return <XCircle className="w-5 h-5 text-rose-400" />;
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-12 px-6">
      {/* Elite Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">System Health Check</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] mb-4">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-indigo-400">Check.</span>
          </h1>
          <p className="max-w-2xl text-xl text-white/40 font-medium leading-relaxed">
            Check if our servers and databases are working correctly.
          </p>
        </div>
        
        <PremiumButton 
          onClick={performCheck} 
          loading={loading}
          icon={<RefreshCw className="w-4 h-4" />}
          variant="primary"
          className="bg-white text-slate-950 border-none shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:bg-slate-100"
        >
          {report ? 'Check Again' : 'Check System'}
        </PremiumButton>
      </div>

      <AnimatePresence mode="wait">
        {!report && !loading ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center py-32 bg-white/[0.01] border border-white/5 rounded-[3rem] text-center backdrop-blur-3xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-sky-500/5 border border-sky-500/10 flex items-center justify-center mb-8">
              <Activity className="w-10 h-10 text-sky-400 opacity-40 animate-pulse" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 italic tracking-tight">Ready to Check.</h3>
            <p className="text-white/40 max-w-sm mx-auto font-medium">Click the protocol button to verify backend subsystems and external strategic providers.</p>
          </motion.div>
        ) : loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-white/[0.01] border border-white/5 rounded-[3rem] text-center backdrop-blur-3xl"
          >
            <div className="relative w-20 h-20 mb-8">
              <motion.div 
                className="absolute inset-0 border-2 border-sky-500/20 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute inset-2 border-2 border-sky-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Checking everything...</h3>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">Talking to our servers</p>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {report && (
              <>
                {/* Global Status Card */}
                <PremiumCard extreme className="md:col-span-2 p-10 bg-white/[0.02]">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${
                      report.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      <Zap className="w-10 h-10 fill-current" />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                             <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-1">Main Status</p>
                             <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Status: {report.status === 'healthy' ? 'Working Well' : 'Issues Found'}</h2>
                        </div>
                        <PremiumBadge tone={report.status === 'healthy' ? 'positive' : 'danger'}>Check Done</PremiumBadge>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: report.status === 'healthy' ? '100%' : '65%' }}
                          className={`h-full ${report.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_20px_rgba(16,185,129,0.5)]`}
                        />
                      </div>
                    </div>
                  </div>
                </PremiumCard>

                {/* Subsystem Monitoring */}
                <div className="grid gap-8">
                  {/* Infrastructure */}
                  <PremiumCard className="p-8 bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-sky-400" />
                            <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Database</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div>
                            <p className="text-sm font-bold text-white">MongoDB Primary</p>
                            <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">Saved Data</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-sky-400">{report.services.database.latency}ms</span>
                          <StatusIcon status={report.services.database.status} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div>
                            <p className="text-sm font-bold text-white">Redis Cache Layer</p>
                            <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">Volatile Cluster</p>
                        </div>
                        <StatusIcon status={report.services.redis.status} />
                      </div>
                    </div>
                  </PremiumCard>

                  {/* Strategic API Connectivity */}
                  <PremiumCard className="p-8 bg-white/[0.01]">
                    <div className="flex items-center gap-3 mb-8">
                      <Cpu className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-lg font-black text-white uppercase tracking-tight italic">AI Systems</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(report.services.ai).map(([name, status]) => (
                        <div key={name} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <span className="text-xs font-bold text-white/80 capitalize">{name} API</span>
                          <StatusIcon status={status} />
                        </div>
                      ))}
                    </div>
                  </PremiumCard>
                </div>

                {/* Environmental Safety */}
                <div className="flex flex-col gap-8">
                  <PremiumCard extreme className="bg-black/20 p-8 flex-1">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-amber-400" />
                        <div>
                             <h3 className="text-lg font-black text-white uppercase tracking-tight italic leading-tight">System Safety</h3>
                             <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Safety Check</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-400/20 uppercase tracking-widest">{report.environment.nodeEnv}</span>
                    </div>
                    
                    {report.environment.missingVars.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-4 opacity-40" />
                        <p className="text-sm font-bold text-emerald-200">System configuration is within safety parameters.</p>
                        <p className="text-[10px] text-emerald-400/50 uppercase tracking-[0.2em] mt-1 font-black">All Secrets Verified</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-rose-400 bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-bold tracking-tight">Security Breach: Missing Critical Secrets</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 font-black text-xs">
                          {report.environment.missingVars.map(v => (
                            <div key={v} className="bg-rose-500/5 border border-rose-500/10 px-4 py-3 rounded-2xl text-rose-300/80 flex items-center justify-center uppercase tracking-tighter italic">
                              {v}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </PremiumCard>

                  {/* Server Protocol Info */}
                  <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                        <Server className="w-32 h-32 text-white" />
                     </div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                           <Sparkles className="w-3 h-3 text-white/40" />
                           <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">System Info</span>
                        </div>
                        <p className="text-sm text-white/60 font-medium leading-relaxed">
                           This check looks at the health of the entire Finly application. Any problems found here should be fixed to keep everything working correctly.
                        </p>
                     </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemHealth;
