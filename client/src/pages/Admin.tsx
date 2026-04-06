import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Crown,
  Search,
  Filter,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldAlert,
  UserPlus,
  Trash2,
  Key,
  ShieldCheck,
  Lock,
  ChevronRight,
  UserCheck,
  Mail,
  Zap
} from 'lucide-react';
import { adminService, AdminUser, AdminStats, AdminSettings } from '../services/adminService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { PremiumCard, PremiumButton, PremiumInput } from '../components/ui/PremiumComponents';
import { premiumFeedback } from '../utils/premiumFeedback';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Security Gate State
  const [isVerified, setIsVerified] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Dashboard Data State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'admins' | 'settings'>('overview');
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Admin Management State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Access Code Update State
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [updatingCode, setUpdatingCode] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
    } else {
      if (isVerified) {
        loadData();
      } else {
        setLoading(false);
      }
    }
  }, [user, isVerified]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadSettings(),
        loadAdminsList()
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await adminService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadAdminsList = async () => {
    try {
      const response = await adminService.getAdmins();
      setAdmins(response.data);
    } catch (error) {
      console.error('Failed to load admins:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (searchTerm) params.search = searchTerm;
      if (planFilter) params.plan = planFilter;
      if (statusFilter) {
        params.isActive = statusFilter === 'active';
      }

      const response = await adminService.getUsers(params);
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setCodeError('');
    try {
      const response = await adminService.verifyAccessCode(accessCode);
      if (response.verified) {
        setIsVerified(true);
        premiumFeedback.success();
        toast.success('Access Granted. Welcome Administrator.');
      }
    } catch (error: any) {
      setCodeError('Invalid Access Code');
      premiumFeedback.error();
    } finally {
      setVerifying(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setAddingAdmin(true);
    try {
      await adminService.addAdmin({ 
        email: newAdminEmail, 
        password: newAdminPass || 'Bolla@123',
        name: newAdminEmail.split('@')[0]
      });
      toast.success(`Admin access granted to ${newAdminEmail}`);
      setNewAdminEmail('');
      setNewAdminPass('');
      loadAdminsList();
    } catch (error) {
      toast.error('Failed to add admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!window.confirm(`Are you sure you want to revoke admin access for ${email}?`)) return;
    try {
      await adminService.removeAdmin(email);
      toast.success('Admin revoked');
      loadAdminsList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove admin');
    }
  };

  const handleChangeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !currentCode) return;
    setUpdatingCode(true);
    try {
      await adminService.changeAccessCode(currentCode, newCode);
      toast.success('Access code updated successfully');
      setCurrentCode('');
      setNewCode('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingCode(false);
    }
  };

  const handleUpdatePlan = async (userId: string, newPlan: 'free' | 'pro' | 'premium') => {
    try {
      await adminService.updateUserPlan(userId, { plan: newPlan });
      toast.success('User plan updated');
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminService.updateUserStatus(userId, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ShieldAlert className="w-24 h-24 text-rose-500 mb-8 opacity-20 mx-auto" />
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">High Security Sector</h1>
          <p className="text-white/40 max-w-md mb-10 font-medium">
            This sector of the Finly Intelligence Engine is strictly restricted to system administrators.
          </p>
          <PremiumButton 
            onClick={() => navigate('/dashboard')}
            className="px-10 h-14 bg-white text-black font-black uppercase tracking-widest text-[11px]"
          >
            Return to Dashboard
          </PremiumButton>
        </motion.div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <PremiumCard extreme className="p-8 md:p-12 text-center border-white/5 backdrop-blur-3xl bg-white/[0.01]">
            <Lock className="w-16 h-16 text-indigo-400 mx-auto mb-8 opacity-50" />
            <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Admin Authentication</h2>
            <p className="text-white/40 text-sm font-medium mb-10">Enter your secondary verification code to continue.</p>
            
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <PremiumInput
                type="password"
                placeholder="4-8 Digit Access Code"
                value={accessCode}
                onChange={(e: any) => setAccessCode(e.target.value)}
                className="text-center text-2xl tracking-[1em] font-black py-6 bg-white/[0.02]"
                autoFocus
              />
              {codeError && <p className="text-rose-400 text-xs font-black uppercase tracking-widest">{codeError}</p>}
              <PremiumButton 
                type="submit" 
                loading={verifying}
                className="w-full h-14 bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px]"
              >
                Unlock Dashboard
              </PremiumButton>
            </form>
          </PremiumCard>
        </motion.div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-indigo-500/20 bg-indigo-500/10">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">Central Intelligence Control</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 italic uppercase">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600">Forge.</span>
            </h1>
            <p className="text-white/30 text-base md:text-lg font-medium max-w-2xl leading-relaxed text-left">
              Global command center for Finly operations. Monitor metrics, manage access protocols, and scaling parameters.
            </p>
          </div>
          <div className="flex gap-2 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 backdrop-blur-3xl">
            {(['overview', 'users', 'admins', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-black shadow-xl scale-[1.02]' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats?.users.total || 0, icon: Users, color: 'text-sky-400' },
                  { label: 'Active Sessions', value: stats?.users.active || 0, icon: Activity, color: 'text-emerald-400' },
                  { label: 'Monthly Revenue', value: `₹${(stats?.revenue.total || 0).toLocaleString()}`, icon: DollarSign, color: 'text-amber-400' },
                  { label: 'Records Processed', value: (stats?.records.total || 0).toLocaleString(), icon: TrendingUp, color: 'text-indigo-400' }
                ].map((stat, i) => (
                  <PremiumCard key={i} className="p-8 border-white/5 flex items-center justify-between group hover:border-indigo-500/20 transition-all duration-500">
                    <div className="text-left">
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
                      <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-10 h-10 ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />
                  </PremiumCard>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PremiumCard className="p-8 border-white/5 text-left">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3 italic">
                    <Crown className="w-5 h-5 text-amber-400" />
                    Subscription Distribution
                  </h3>
                  <div className="space-y-6">
                    {[
                      { name: 'Platinum (Premium)', count: stats?.users.paidPremium || 0, total: stats?.users.total || 1, color: 'bg-purple-500' },
                      { name: 'Professional (Pro)', count: stats?.users.paidPro || 0, total: stats?.users.total || 1, color: 'bg-indigo-500' },
                      { name: 'Explorer (Free)', count: stats?.users.free || 0, total: stats?.users.total || 1, color: 'bg-sky-500' }
                    ].map((plan, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[11px] font-black uppercase tracking-widest text-white/50">{plan.name}</span>
                          <span className="text-sm font-black italic">{plan.count} Users</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden text-left">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${(plan.count / plan.total) * 100}%` }} 
                            className={`h-full ${plan.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumCard>

                <PremiumCard className="p-8 border-white/5 text-left">
                   <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3 italic">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Growth Metrics
                  </h3>
                  <div className="flex flex-col h-full justify-center text-center py-10 border border-white/5 bg-white/[0.01] rounded-[40px] italic">
                     <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 tracking-tighter mb-2">
                       {stats?.users.total ? Math.round(((stats.users.paidPro + stats.users.paidPremium) / stats.users.total) * 100) : 0}%
                     </p>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Conversion Rate</p>
                  </div>
                </PremiumCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
               <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-sky-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search users..."
                      className="w-full h-16 pl-14 pr-6 bg-white/[0.02] border border-white/5 rounded-[30px] outline-none text-sm font-medium focus:border-sky-500/40 text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                       value={planFilter} 
                       onChange={(e) => setPlanFilter(e.target.value)}
                       className="h-16 px-6 bg-white/[0.02] border border-white/5 rounded-[30px] text-[10px] font-black uppercase tracking-widest outline-none text-white cursor-pointer"
                    >
                       <option value="" className="bg-black">All Plans</option>
                       <option value="free" className="bg-black">Free</option>
                       <option value="pro" className="bg-black">Pro</option>
                       <option value="premium" className="bg-black">Premium</option>
                    </select>
                    <PremiumButton onClick={loadUsers} className="h-16 w-16 p-0 bg-white/[0.02] border border-white/5 rounded-[30px] flex items-center justify-center">
                       <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                    </PremiumButton>
                  </div>
               </div>

               <PremiumCard className="overflow-hidden border-white/5">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white/[0.02] border-b border-white/5 text-left">
                        <tr>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-left">Identity</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-left">Plan</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-left">Status</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-left">Records</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-left">Command</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-left">
                        {users.map(u => (
                          <tr key={u._id} className="hover:bg-white/[0.01]">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-400">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-black italic">{u.name}</p>
                                  <p className="text-[11px] font-medium text-white/30">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                u.plan === 'premium' ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' :
                                u.plan === 'pro' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' :
                                'bg-white/5 border-white/10 text-white/40'
                              }`}>
                                {u.plan}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{u.isActive ? 'Active' : 'Banned'}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                                <p className="text-sm font-black italic">{u.recordCount}</p>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex gap-2">
                                  <select 
                                     value={u.plan} 
                                     onChange={(e) => handleUpdatePlan(u._id, e.target.value as any)}
                                     className="bg-black border border-white/5 rounded-lg px-2 py-1 text-[9px] font-black uppercase text-white"
                                  >
                                     <option value="free">Free</option>
                                     <option value="pro">Pro</option>
                                     <option value="premium">Premium</option>
                                  </select>
                                  <button onClick={() => handleUpdateStatus(u._id, !u.isActive)} className="p-2 rounded-lg border border-white/5 hover:bg-rose-500/20 text-rose-400">
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </PremiumCard>
            </motion.div>
          )}

          {activeTab === 'admins' && (
            <motion.div key="admins" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 space-y-6">
                 <PremiumCard extreme className="p-8 border-white/5 text-left">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3 italic text-left">
                      <UserPlus className="w-5 h-5 text-sky-400" />
                      Add Admin
                    </h3>
                    <form onSubmit={handleAddAdmin} className="space-y-6">
                       <PremiumInput label="Email" value={newAdminEmail} onChange={(e: any) => setNewAdminEmail(e.target.value)} placeholder="Email" />
                       <PremiumInput label="Password" type="password" value={newAdminPass} onChange={(e: any) => setNewAdminPass(e.target.value)} placeholder="Password" />
                       <PremiumButton type="submit" loading={addingAdmin} className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[11px]">
                         Grant Access
                       </PremiumButton>
                    </form>
                 </PremiumCard>
               </div>
               <div className="lg:col-span-2 space-y-6">
                 <PremiumCard className="p-8 border-white/5 h-full text-left">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3 italic text-left">
                      <UserCheck className="w-5 h-5 text-indigo-400" />
                      Active Staff
                    </h3>
                    <div className="space-y-4">
                       {admins.map(a => (
                         <div key={a.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between text-left">
                            <div className="text-left">
                               <p className="text-base font-black italic">{a.email}</p>
                            </div>
                            {!a.isSuperAdmin && (
                              <button onClick={() => handleRemoveAdmin(a.email)} className="p-2 text-rose-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                         </div>
                       ))}
                    </div>
                 </PremiumCard>
               </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
               <PremiumCard extreme className="p-10 border-white/5 backdrop-blur-3xl bg-white/[0.01] text-left">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3 italic text-leftv">
                    <Key className="w-6 h-6 text-indigo-400" />
                    Security
                  </h3>
                  <form onSubmit={handleChangeCode} className="space-y-8">
                     <div className="space-y-6">
                        <PremiumInput label="Current Code" type="password" value={currentCode} onChange={(e: any) => setCurrentCode(e.target.value)} />
                        <PremiumInput label="New Code" type="password" value={newCode} onChange={(e: any) => setNewCode(e.target.value)} />
                     </div>
                     <PremiumButton type="submit" loading={updatingCode} className="w-full h-16 bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px]">
                       Update Code
                     </PremiumButton>
                  </form>
               </PremiumCard>

               <div className="space-y-8">
                 <PremiumCard className="p-10 border-white/5 text-left">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic text-left">
                        <DollarSign className="w-5 h-5 text-sky-400" />
                        Plan Economics
                      </h3>
                    </div>
                    
                    <div className="space-y-6 text-left">
                       <div className="flex items-center justify-between p-6 bg-white/[0.01] border border-white/5 rounded-3xl">
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">PRO</p>
                            <p className="text-3xl font-black italic">₹{settings?.proPrice}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/10" />
                       </div>
                    </div>
                    
                    <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-center justify-between">
                        <div className="text-left">
                           <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Free Mode</p>
                           <p className="text-[10px] font-medium text-white/30">Allow free access</p>
                        </div>
                        <button 
                          onClick={async () => {
                            const newMode = !settings?.isFreeMode;
                            await adminService.updateSettings({ isFreeMode: newMode });
                            loadSettings();
                          }}
                          className={`w-12 h-6 rounded-full relative transition-all ${settings?.isFreeMode ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings?.isFreeMode ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="mt-12 space-y-4 pt-8 border-t border-white/5 text-left">
                        <div className="text-left">
                          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic text-left">
                            <Activity className="w-5 h-5 text-purple-400" />
                            Instructions
                          </h3>
                        </div>
                        <textarea
                          className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm text-white outline-none"
                          value={settings?.adminInstructions || ''}
                          onChange={(e) => setSettings(prev => prev ? { ...prev, adminInstructions: e.target.value } : null)}
                        />
                        <PremiumButton onClick={() => adminService.updateSettings({ adminInstructions: settings?.adminInstructions })} className="w-full">
                          Push Globally
                        </PremiumButton>
                    </div>

                    <div className="mt-12 space-y-4 pt-8 border-t border-white/5 text-left">
                        <div className="text-left">
                          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic text-left">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Splash Ads
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {settings?.splashAds?.map((ad, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-left">
                               <p className="text-xs font-bold text-white/60 text-left">{ad}</p>
                               <button onClick={async () => {
                                 const next = settings.splashAds?.filter((_, idx) => idx !== i);
                                 await adminService.updateSettings({ splashAds: next });
                                 loadSettings();
                               }} className="text-rose-400"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                           <input id="ad-in" type="text" className="flex-1 bg-white/5 rounded-xl px-4 text-xs text-white" placeholder="Add custom ad..." />
                           <button onClick={async () => {
                              const el = document.getElementById('ad-in') as HTMLInputElement;
                              const val = el.value;
                              if (!val) return;
                              const next = [...(settings?.splashAds || []), val];
                              await adminService.updateSettings({ splashAds: next });
                              el.value = '';
                              loadSettings();
                           }} className="px-4 py-2 bg-amber-500 text-black text-[10px] font-black rounded-xl">ADD</button>
                        </div>
                    </div>
                 </PremiumCard>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
