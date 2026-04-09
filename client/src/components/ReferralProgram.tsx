import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share2, Gift, Users, Award, Link2, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface ReferralStats {
  totalInvited: number;
  successfulSignups: number;
  rewardsEarned: number;
  pendingRewards: number;
  referralCode: string;
  rank: string;
}

const REFERRAL_REWARDS = [
  { count: 1, reward: '1 Month Pro Free', icon: '🎁' },
  { count: 3, reward: '3 Months Pro Free', icon: '🚀' },
  { count: 5, reward: 'Lifetime Pro Access', icon: '👑' },
  { count: 10, reward: '₹5,000 Cash + Lifetime Pro', icon: '💰' },
];

export default function ReferralProgram() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({
    totalInvited: 0,
    successfulSignups: 0,
    rewardsEarned: 0,
    pendingRewards: 0,
    referralCode: '',
    rank: 'Starter',
  });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'rewards' | 'leaderboard'>('invite');

  useEffect(() => {
    // Load referral stats from localStorage (mock - replace with API)
    const stored = localStorage.getItem(`aera_referral_${user?.id}`);
    if (stored) {
      setStats(JSON.parse(stored));
    } else if (user) {
      // Generate referral code
      const code = `BIZ PLUS${user.id.slice(0, 6).toUpperCase()}`;
      setStats(prev => ({ ...prev, referralCode: code }));
    }
  }, [user]);

  const referralLink = `${window.location.origin}/register?ref=${stats.referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareOptions = [
    { 
      name: 'WhatsApp', 
      color: 'bg-green-500', 
      icon: '💬',
      url: `https://wa.me/?text=${encodeURIComponent(`Join me on BIZ PLUS - the smartest way to track business finances! Use my link: ${referralLink}`)}`
    },
    { 
      name: 'LinkedIn', 
      color: 'bg-blue-600', 
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`
    },
    { 
      name: 'Twitter', 
      color: 'bg-sky-500', 
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just started using BIZ PLUS to track my business finances. Game changer! 📊 Join with my link:`)}&url=${encodeURIComponent(referralLink)}`
    },
  ];

  const leaderboard = [
    { name: 'Rahul M.', invites: 47, reward: '₹25,000', avatar: '👨‍💼' },
    { name: 'Priya K.', invites: 32, reward: '₹15,000', avatar: '👩‍💼' },
    { name: 'Amit S.', invites: 28, reward: 'Lifetime Pro', avatar: '👨‍💻' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-white/10"
        >
          <Users className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-black text-white">{stats.totalInvited}</p>
          <p className="text-xs text-white/50">Invited</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 border border-white/10"
        >
          <Award className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-black text-white">{stats.successfulSignups}</p>
          <p className="text-xs text-white/50">Joined</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-4 border border-white/10"
        >
          <Gift className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-black text-white">₹{stats.rewardsEarned}</p>
          <p className="text-xs text-white/50">Earned</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['invite', 'rewards', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === tab 
                ? 'bg-white text-black' 
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'invite' && (
          <motion.div
            key="invite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Referral Code */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-white/50 mb-2">Your Referral Code</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-black/30 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-white/30" />
                  <span className="text-white font-mono text-lg tracking-wider">
                    {stats.referralCode || 'Loading...'}
                  </span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-4 bg-blue-500 hover:bg-blue-400 rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${option.color} rounded-xl p-4 text-center hover:opacity-90 transition-opacity`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <p className="text-white text-xs font-bold mt-1">{option.name}</p>
                </a>
              ))}
            </div>

            {/* How it Works */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                How it Works
              </h4>
              <div className="space-y-3">
                {[
                  'Share your unique referral link',
                  'Friend signs up using your link',
                  'You both get rewards instantly!'
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-white/70 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rewards' && (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {REFERRAL_REWARDS.map((tier, index) => {
              const progress = Math.min((stats.successfulSignups / tier.count) * 100, 100);
              const isUnlocked = stats.successfulSignups >= tier.count;
              
              return (
                <motion.div
                  key={tier.count}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl p-4 border ${
                    isUnlocked 
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <p className={`font-bold ${isUnlocked ? 'text-amber-400' : 'text-white'}`}>
                          {tier.reward}
                        </p>
                        <p className="text-xs text-white/50">
                          Invite {tier.count} friends
                        </p>
                      </div>
                    </div>
                    {isUnlocked && (
                      <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-bold">
                        UNLOCKED! 🎉
                      </span>
                    )}
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        isUnlocked ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    {stats.successfulSignups}/{tier.count} completed
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="text-center mb-4">
              <p className="text-white/50 text-sm">Top referrers this month</p>
            </div>
            {leaderboard.map((user, index) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-amber-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-white/10 text-white'
                }`}>
                  {index + 1}
                </span>
                <span className="text-2xl">{user.avatar}</span>
                <div className="flex-1">
                  <p className="text-white font-bold">{user.name}</p>
                  <p className="text-xs text-white/50">{user.invites} friends joined</p>
                </div>
                <span className="text-amber-400 font-bold text-sm">{user.reward}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
