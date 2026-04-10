"use client"
import { useCallback, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Plus,
  RefreshCw,
  ArrowRight,
  Target,
  Wallet,
  PiggyBank,
  Camera,
  Gift,
  Activity,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI, recordsAPI } from '../services/api';
import { Button, Card, Badge, Progress, Spinner } from '../components/ui/BizUI';

interface Metrics {
  totalRecords?: number;
  activeRecords?: number;
  revenue?: number;
  expenses?: number;
  profit?: number;
  profitMargin?: number;
  growthRate?: number;
}

interface TrendData {
  month: string;
  revenue: number;
  expenses: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await dashboardAPI.get();
      setMetrics(data.metrics || null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadRecords = useCallback(async () => {
    try {
      const data = await recordsAPI.getAll();
      setRecentRecords(data.slice(0, 5));
    } catch (error) {
      console.error('Records load error:', error);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const revenue = metrics?.revenue || 0;
  const expenses = metrics?.expenses || 0;
  const profit = metrics?.profit || revenue - expenses;
  const profitMargin = metrics?.profitMargin || (revenue > 0 ? (profit / revenue) * 100 : 0);
  const growthRate = metrics?.growthRate || 0;
  const totalRecords = metrics?.totalRecords || 0;

  const profitStatus = useMemo(() => {
    if (profitMargin >= 20) return { label: 'Excellent', color: 'success' as const };
    if (profitMargin >= 10) return { label: 'Good', color: 'info' as const };
    if (profitMargin > 0) return { label: 'Fair', color: 'warning' as const };
    return { label: 'Loss', color: 'error' as const };
  }, [profitMargin]);

  const statCards = [
    {
      title: 'Revenue',
      value: `₹${revenue.toLocaleString()}`,
      change: `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
      trend: growthRate >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      title: 'Expenses',
      value: `₹${expenses.toLocaleString()}`,
      change: `${((expenses / revenue) * 100 || 0).toFixed(0)}% of revenue`,
      trend: expenses > revenue * 0.8 ? 'down' : 'up',
      icon: Wallet,
    },
    {
      title: 'Profit',
      value: `₹${profit.toLocaleString()}`,
      change: `${profitMargin.toFixed(1)}% margin`,
      trend: profit > 0 ? 'up' : 'down',
      icon: PiggyBank,
    },
    {
      title: 'Records',
      value: totalRecords.toString(),
      change: `${metrics?.activeRecords || 0} active`,
      trend: 'up',
      icon: FileText,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-bg-tertiary animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-bg-tertiary animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-bg-tertiary animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Hello, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-text-tertiary">Here's your business overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/scan-bill')}
            icon={<Camera className="w-4 h-4" />}
          >
            Scan Bill
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:border-border-hover transition-colors cursor-pointer" onClick={() => navigate('/analytics')}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-tertiary">{stat.title}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                    <p className={`text-sm mt-2 flex items-center gap-1 ${
                      stat.trend === 'up' ? 'text-accent-emerald' : 'text-accent-rose'
                    }`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-default rounded-lg">
                    <Icon className="w-5 h-5 text-accent-blue" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Overview */}
        <Card className="lg:col-span-2" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Profit Overview</h3>
              <p className="text-sm text-text-tertiary">Monthly performance</p>
            </div>
            <Badge variant={profitStatus.color}>{profitStatus.label}</Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Profit Margin</span>
                <span className="text-text-primary font-medium">{profitMargin.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(100, Math.max(0, profitMargin * 5))} 
                variant={profitMargin >= 20 ? 'success' : profitMargin >= 10 ? 'warning' : 'error'}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-default">
              <div>
                <p className="text-sm text-text-tertiary">Revenue</p>
                <p className="text-lg font-semibold text-text-primary">₹{revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-text-tertiary">Expenses</p>
                <p className="text-lg font-semibold text-text-primary">₹{expenses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-text-tertiary">Profit</p>
                <p className={`text-lg font-semibold ${profit >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  ₹{profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Health Score */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Health Score</h3>
          
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-bg-tertiary"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={351}
                  strokeDashoffset={351 - (351 * Math.min(100, totalRecords > 0 ? 70 : 30)) / 100}
                  className="text-accent-blue transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-text-primary">
                  {totalRecords > 0 ? Math.min(100, 70) : 30}
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-text-secondary font-medium">
                {totalRecords > 0 ? 'Healthy' : 'Getting Started'}
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {totalRecords} records tracked
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Records */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Recent Records</h3>
            <p className="text-sm text-text-tertiary">Your latest transactions</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/records')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            View All
          </Button>
        </div>

        {recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map((record: any, index: number) => (
              <motion.div
                key={record._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-surface-default rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                onClick={() => navigate('/records')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-bg-tertiary rounded-lg">
                    <FileText className="w-4 h-4 text-text-tertiary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{record.title || 'Untitled'}</p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">
                    ₹{(record.amount || 0).toLocaleString()}
                  </p>
                  <Badge variant={record.type === 'income' ? 'success' : 'default'} className="text-xs">
                    {record.type || 'expense'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No records yet</p>
            <p className="text-sm text-text-tertiary mt-1">Start by scanning your first receipt</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/scan-bill')}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Record
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:border-accent-blue/50 transition-colors"
          onClick={() => navigate('/scan-bill')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-blue/10 rounded-lg">
              <Camera className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Scan Receipt</p>
              <p className="text-sm text-text-tertiary">Quick add from photo</p>
            </div>
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:border-accent-purple/50 transition-colors"
          onClick={() => navigate('/analytics')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-purple/10 rounded-lg">
              <Activity className="w-6 h-6 text-accent-purple" />
            </div>
            <div>
              <p className="font-medium text-text-primary">View Analytics</p>
              <p className="text-sm text-text-tertiary">Deep insights & trends</p>
            </div>
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:border-accent-emerald/50 transition-colors"
          onClick={() => navigate('/referral')}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-emerald/10 rounded-lg">
              <Gift className="w-6 h-6 text-accent-emerald" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Refer & Earn</p>
              <p className="text-sm text-text-tertiary">Get 1 month free</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-text-muted">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Dashboard;