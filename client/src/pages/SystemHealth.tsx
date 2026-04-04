import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Globe, 
  AlertTriangle, 
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { PremiumCard, PremiumButton } from '../components/ui/PremiumComponents';
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header section with immediate action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">System Core Audit</h1>
          <p className="text-white/40 font-medium">Verify infrastructure health, API connectivity, and environment integrity.</p>
        </div>
        <PremiumButton 
          onClick={performCheck} 
          loading={loading}
          icon={<RefreshCw className="w-4 h-4" />}
          variant="primary"
        >
          {report ? 'Re-Run Audit' : 'Start Audit'}
        </PremiumButton>
      </div>

      {!report && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-6">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ready for Inspection</h3>
          <p className="text-white/40 max-w-sm mx-auto">Click the audit button to verify all backend services and external API connections.</p>
        </motion.div>
      )}

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Status Panel */}
          <PremiumCard className="md:col-span-2">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-3xl ${
                report.status === 'healthy' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
              }`}>
                <Activity className={`w-8 h-8 ${
                  report.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">System {report.status}</h2>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase leading-none">Global Status</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: report.status === 'healthy' ? '100%' : '50%' }}
                    className={`h-full ${report.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Infrastructure Health */}
          <PremiumCard padded={false} className="flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Data Core</h3>
              </div>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60 font-medium">MongoDB Insight</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/40">{report.services.database.latency}ms</span>
                  <StatusIcon status={report.services.database.status} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60 font-medium">Redis Cluster</span>
                <StatusIcon status={report.services.redis.status} />
              </div>
            </div>
          </PremiumCard>

          {/* Engine Connectivity */}
          <PremiumCard padded={false} className="flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Strategic Providers</h3>
              </div>
            </div>
            <div className="p-6 space-y-6 flex-1">
              {Object.entries(report.services.ai).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-white/60 font-medium capitalize">{name} API</span>
                  <StatusIcon status={status} />
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Environment Safety */}
          <PremiumCard padded={false} className="md:col-span-2">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Environment Integrity</h3>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-black/40 text-blue-400 border border-white/5">{report.environment.nodeEnv}</span>
            </div>
            <div className="p-6">
              {report.environment.missingVars.length === 0 ? (
                <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-tight">All critical secrets are properly configured.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-rose-400 mb-4">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-bold">Missing Critical Variables:</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {report.environment.missingVars.map(v => (
                      <div key={v} className="bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-rose-300 font-bold uppercase">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
