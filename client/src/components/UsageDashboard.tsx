import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Upload,
  Brain,
  Scan,
  Users,
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  CreditCard,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { usageService, UsageStat, BillingSummary } from '../services/usageService';
import { toast } from 'react-hot-toast';

interface UsageDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const USAGE_ICONS: Record<string, React.ReactNode> = {
  upload: <Upload className="w-5 h-5" />,
  ai_analysis: <Brain className="w-5 h-5" />,
  ocr: <Scan className="w-5 h-5" />,
  api_call: <Zap className="w-5 h-5" />,
  storage_gb: <Database className="w-5 h-5" />,
  team_member: <Users className="w-5 h-5" />,
};

const USAGE_LABELS: Record<string, string> = {
  upload: 'Receipt Uploads',
  ai_analysis: 'AI Analyses',
  ocr: 'OCR Scans',
  api_call: 'API Calls',
  storage_gb: 'Storage (GB)',
  team_member: 'Team Members',
};

export default function UsageDashboard({ isOpen, onClose }: UsageDashboardProps) {
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [billing, setBilling] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState(10);

  useEffect(() => {
    if (isOpen) {
      loadUsageData();
    }
  }, [isOpen]);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      const [statsRes, billingRes] = await Promise.all([
        usageService.getStats(),
        usageService.getBillingSummary(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (billingRes.success) {
        setBilling(billingRes.data);
      }
    } catch (error) {
      console.error('Failed to load usage data:', error);
      toast.error('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedType) return;

    try {
      const response = await usageService.purchaseCredits(selectedType, purchaseAmount);
      if (response.success) {
        toast.success(`Purchased ${purchaseAmount} credits!`);
        setSelectedType(null);
        loadUsageData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    }
  };

  const getProgressColor = (used: number, limit: number | string) => {
    if (limit === 'unlimited' || typeof limit === 'string') return 'bg-emerald-500';
    const percentage = (used / (limit as number)) * 100;
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Usage & Billing</h2>
                  <p className="text-sm text-[#C0C0C0]">
                    {billing?.plan ? `Current Plan: ${billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)}` : 'Loading...'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#C0C0C0]" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
              ) : (
                <>
                  {/* Total Cost Card */}
                  {billing && billing.totalOverageCost > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-2xl p-6 border border-rose-500/30"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        <span className="text-sm font-medium text-rose-300">Overage Charges</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-white">${billing.totalOverageCost.toFixed(2)}</p>
                          <p className="text-sm text-[#C0C0C0] mt-1">Current billing period</p>
                        </div>
                        <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-xl text-white font-medium transition-colors">
                          Pay Now
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Usage Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.type}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedType(stat.type)}
                        className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-cyan-500/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                              {USAGE_ICONS[stat.type] || <Zap className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{USAGE_LABELS[stat.type] || stat.type}</p>
                              {stat.overage > 0 && (
                                <span className="text-xs text-rose-400">+{stat.overage} overage</span>
                              )}
                            </div>
                          </div>
                          {stat.overage === 0 && stat.remaining !== 0 && (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressColor(stat.used, stat.limit)}`}
                              style={{
                                width: stat.limit === 'unlimited'
                                  ? '100%'
                                  : `${Math.min((stat.used / (stat.limit as number)) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#C0C0C0]">
                            {stat.used} / {stat.limit === 'unlimited' ? '∞' : stat.limit} used
                          </span>
                          <span className={stat.remaining === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                            {stat.remaining === 'unlimited' ? 'Unlimited' : stat.remaining} left
                          </span>
                        </div>

                        {stat.overageCost > 0 && (
                          <p className="text-xs text-rose-400 mt-2">
                            Extra charge: ${stat.overageCost.toFixed(2)}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-cyan-400" />
                      Quick Purchase
                    </h3>
                    <p className="text-sm text-[#C0C0C0] mb-4">
                      Running low? Buy additional credits instantly.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {['upload', 'ai_analysis', 'ocr'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className="px-4 py-2 bg-white/10 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 rounded-xl text-sm text-white transition-colors"
                        >
                          Buy {USAGE_LABELS[type]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plan Comparison */}
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">Need More?</h3>
                    </div>
                    <p className="text-sm text-[#C0C0C0] mb-4">
                      Upgrade your plan for higher limits and better rates.
                    </p>
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      View Plans
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Purchase Modal */}
            <AnimatePresence>
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-10"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0A0A0A]/80 border border-white/5 rounded-2xl p-6 border border-white/10 max-w-sm w-full"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">
                      Buy {USAGE_LABELS[selectedType]} Credits
                    </h3>

                    <div className="mb-6">
                      <label className="text-sm text-[#C0C0C0] mb-2 block">Amount</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={purchaseAmount}
                          onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-2xl font-bold text-white w-16 text-center">
                          {purchaseAmount}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[#C0C0C0]">Cost</span>
                        <span className="text-xl font-bold text-white">
                          ${(purchaseAmount * 0.5).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedType(null)}
                        className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePurchase}
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        Purchase
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
