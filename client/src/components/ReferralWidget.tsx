import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Users,
  Gift,
  Trophy,
  Mail,
  Twitter,
  Linkedin,
  Copy,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { referralService, ReferralStats, Referral, SocialShares } from '../services/referralService';
import { useGamification } from './GamificationEngine';
import { toast } from 'react-hot-toast';

interface ReferralWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferralWidget({ isOpen, onClose }: ReferralWidgetProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [socialShares, setSocialShares] = useState<SocialShares | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addXP } = useGamification();

  useEffect(() => {
    if (isOpen) {
      loadReferralData();
    }
  }, [isOpen]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const [statsRes, sharesRes] = await Promise.all([
        referralService.getStats(),
        referralService.getSocialShares(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data.stats);
        setReferrals(statsRes.data.referrals || []);
        setReferralLink(statsRes.data.referralLink);
      }

      if (sharesRes.success) {
        setSocialShares(sharesRes.data);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      setLoading(true);
      const response = await referralService.createReferral(emailInput);

      if (response.success) {
        toast.success('Referral invite sent!');
        setEmailInput('');
        loadReferralData();
      } else {
        toast.error(response.message || 'Failed to create referral');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    if (socialShares?.twitter) {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialShares.twitter)}`;
      window.open(url, '_blank');
    }
  };

  const shareOnLinkedIn = () => {
    if (socialShares?.linkedin) {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&summary=${encodeURIComponent(socialShares.linkedin)}`;
      window.open(url, '_blank');
    }
  };

  const sendEmail = () => {
    if (socialShares?.email) {
      const subject = encodeURIComponent(socialShares.email.subject);
      const body = encodeURIComponent(socialShares.email.body);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Refer & Earn</h2>
                  <p className="text-sm text-[#C0C0C0]">Invite friends, get rewards</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#C0C0C0]" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6 space-y-6">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-[#C0C0C0]">Invites</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalSent}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-[#C0C0C0]">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-[#C0C0C0]">Joined</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.converted}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-4 border border-amber-500/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-amber-300">XP Earned</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">+{stats.totalXP}</p>
                  </motion.div>
                </div>
              )}

              {/* Referral Link Section */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Your Referral Link
                </h3>

                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-transparent/50 rounded-xl px-4 py-3 border border-white/10">
                    <p className="text-sm text-[#C0C0C0] truncate">{referralLink}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={shareOnTwitter}
                    className="flex-1 py-2.5 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/30 rounded-xl text-[#1DA1F2] font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </button>
                  <button
                    onClick={shareOnLinkedIn}
                    className="flex-1 py-2.5 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/30 rounded-xl text-[#0A66C2] font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </button>
                  <button
                    onClick={sendEmail}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </div>
              </div>

              {/* Email Invite Form */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Invite by Email</h3>
                <form onSubmit={handleCreateReferral} className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="friend@example.com"
                    className="flex-1 bg-transparent/50 rounded-xl px-4 py-3 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading || !emailInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Invite'}
                  </button>
                </form>
                <p className="text-xs text-slate-500 mt-3">
                  They&apos;ll get 50% off their first month. You get 1 month free Pro when they subscribe.
                </p>
              </div>

              {/* Recent Referrals */}
              {referrals.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Invites</h3>
                  <div className="space-y-3">
                    {referrals.slice(0, 5).map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-3 bg-transparent/30 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            referral.status === 'converted'
                              ? 'bg-emerald-400'
                              : referral.status === 'expired'
                              ? 'bg-red-400'
                              : 'bg-amber-400'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-white">{referral.refereeEmail}</p>
                            <p className="text-xs text-slate-500 capitalize">{referral.status}</p>
                          </div>
                        </div>
                        {referral.status === 'converted' && referral.rewardGiven && (
                          <span className="text-xs text-emerald-400 font-medium">+1 Month Free</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reward Info */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-4 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">How it works</p>
                    <ul className="text-xs text-[#C0C0C0] mt-2 space-y-1">
                      <li>• Share your link with friends</li>
                      <li>• They get 50% off their first month</li>
                      <li>• You get 1 month free Pro when they subscribe</li>
                      <li>• +500 XP bonus for each successful referral</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
