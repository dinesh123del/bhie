import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Crown,
  Search,
  Filter,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldAlert
} from 'lucide-react';
import { adminService, AdminUser, AdminStats, AdminSettings } from '../services/adminService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Admin = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadStats();
    loadUsers();
    loadSettings();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [searchTerm, planFilter, statusFilter, currentPage]);

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

  const handleUpdateSettings = async (newData: Partial<AdminSettings>) => {
    try {
      setSettingsLoading(true);
      const updated = await adminService.updateSettings(newData);
      setSettings(updated);
      toast.success('Settings updated successfully');
      loadStats(); // Reload stats as they depend on prices
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSettingsLoading(false);
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

  const handleUpdatePlan = async (userId: string, newPlan: 'free' | 'pro' | 'premium') => {
    try {
      await adminService.updateUserPlan(userId, { plan: newPlan });
      toast.success('User plan updated successfully');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Failed to update plan:', error);
      toast.error('Failed to update user plan');
    }
  };

  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminService.updateUserStatus(userId, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update user status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Control Panel</h1>
          <p className="text-slate-400">Manage users, subscriptions, and monitor BHIE performance</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{stats.users.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold">{stats.users.active}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Records</p>
                  <p className="text-2xl font-bold">{stats.records.total.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Plan Distribution */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Free</span>
                  <span className="font-semibold">{stats.users.free}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pro</span>
                  <span className="font-semibold">{stats.users.paidPro}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Premium</span>
                  <span className="font-semibold">{stats.users.paidPremium}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pro plans</span>
                  <span className="font-semibold">{formatCurrency(stats.revenue.monthlyPro)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Premium plans</span>
                  <span className="font-semibold">{formatCurrency(stats.revenue.monthlyPremium)}</span>
                </div>
                <hr className="border-slate-600" />
                <div className="flex justify-between">
                  <span className="text-slate-300 font-semibold">Total</span>
                  <span className="font-bold text-green-400">{formatCurrency(stats.revenue.total)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <h3 className="text-lg font-semibold mb-4">Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Records (30 days)</span>
                  <span className="font-semibold">{stats.records.last30Days.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Conversion Rate</span>
                  <span className="font-semibold">
                    {stats.users.total > 0
                      ? Math.round(((stats.users.paidPro + stats.users.paidPremium) / stats.users.total) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* System & Pricing Settings */}
        {settings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 gap-6 mb-8"
          >
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-semibold">System & Pricing Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Pro Plan Price ({settings.currency})</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings.proPrice}
                      onChange={(e) => setSettings({ ...settings, proPrice: parseInt(e.target.value) })}
                      className="bg-slate-900 border border-slate-700 rounded px-3 py-2 w-full focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      onClick={() => handleUpdateSettings({ proPrice: settings.proPrice })}
                      disabled={settingsLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 rounded px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Premium Plan Price ({settings.currency})</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings.premiumPrice}
                      onChange={(e) => setSettings({ ...settings, premiumPrice: parseInt(e.target.value) })}
                      className="bg-slate-900 border border-slate-700 rounded px-3 py-2 w-full focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      onClick={() => handleUpdateSettings({ premiumPrice: settings.premiumPrice })}
                      disabled={settingsLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 rounded px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-300">Free Access Mode</p>
                    <p className="text-xs text-slate-400 mt-1">Users can upgrade without payment</p>
                  </div>
                  <button
                    onClick={() => handleUpdateSettings({ isFreeMode: !settings.isFreeMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.isFreeMode ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.isFreeMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {settings.isFreeMode && (
                <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <p className="text-xs text-amber-200">
                    <strong>Note:</strong> Free Access Mode is currently ACTIVE. Payment processing is bypassed for all new upgrades.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Users Management */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setPlanFilter('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="p-8 text-center">
                <LoadingSpinner />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Records</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-700/25">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.plan === 'free' ? 'bg-gray-600 text-gray-200' :
                          user.plan === 'pro' ? 'bg-blue-600 text-blue-200' :
                          'bg-purple-600 text-purple-200'
                        }`}>
                          {user.plan === 'free' ? 'Free' : user.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {user.recordCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatDate(user.planExpiry)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Plan Update Dropdown */}
                          <select
                            value={user.plan}
                            onChange={(e) => handleUpdatePlan(user._id, e.target.value as 'free' | 'pro' | 'premium')}
                            className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="premium">Premium</option>
                          </select>

                          {/* Status Toggle */}
                          <button
                            onClick={() => handleUpdateStatus(user._id, !user.isActive)}
                            className={`p-1 rounded ${
                              user.isActive
                                ? 'text-red-400 hover:bg-red-500/20'
                                : 'text-green-400 hover:bg-green-500/20'
                            }`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                Previous
              </button>

              <span className="text-slate-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
