import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Crown, 
  Clock, 
  Edit3, 
  Save, 
  Camera,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';
import { premiumFeedback } from '../utils/premiumFeedback';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateMe(formData);
      updateProfile(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
      premiumFeedback.success();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-[3rem] p-12 bg-white dark:bg-[#0A0A0B] border border-black/5 dark:border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full -mr-20 -mt-20" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-white dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 shadow-xl text-brand-500 hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                  {user?.name}
                </h1>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  user?.plan === 'premium' 
                    ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                    : user?.plan === 'pro'
                    ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                    : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                }`}>
                  <Shield className="w-3 h-3" />
                  {user?.plan} Status
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  premiumFeedback.click();
                }}
                className="p-4 rounded-3xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-brand-500 hover:bg-brand-500/10 transition-all font-bold flex items-center gap-2"
              >
                {isEditing ? <CheckCircle2 className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                {isEditing ? 'Viewing' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#0A0A0B] border border-black/5 dark:border-white/5 shadow-xl">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Account Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 transition-all"
                    />
                  ) : (
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 transition-all"
                    />
                  ) : (
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.email}</p>
                  )}
                </div>

                {isEditing && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleUpdate}
                    disabled={loading}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </motion.button>
                )}
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 shadow-xl">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Subscription Engine</h3>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-indigo-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    <Zap className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{user?.plan} Access</p>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Next renewal: {user?.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-indigo-500 hover:underline uppercase tracking-widest">Manage</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#0A0A0B] border border-black/5 dark:border-white/5 shadow-xl">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Usage Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Scans</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{user?.usageCount}</p>
                </div>
                <div className="p-4 rounded-3xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-2xl font-black text-emerald-500 uppercase tracking-tighter">Active</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                  <span>Quota Resonance</span>
                  <span>{Math.min(100, (user?.usageCount || 0) / 5)}%</span>
                </div>
                <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (user?.usageCount || 0) / 5)}%` }}
                    className="h-full bg-brand-500 shadow-[0_0_12px_rgba(79,70,229,0.5)]"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#0A0A0B] border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-purple-500/10">
                    <Crown className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Special Access</h3>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">Unlock Surgical Precision with Premium.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">Get advanced AI analysis, global multi-currency support, and surgical data precision.</p>
                <button className="w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform">Upgrade Now</button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
