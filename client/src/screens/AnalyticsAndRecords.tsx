"use client"
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Search,
  Plus,
  Download,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  FileText,
  DollarSign,
  Wallet,
  PiggyBank,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { dashboardAPI, recordsAPI } from '../services/api';
import { Button, Card, Badge, Input } from '../components/ui/BizUI';

type TimeRange = '7d' | '30d' | '90d' | '1y';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await dashboardAPI.get();
        setData(response);
      } catch (error) {
        console.error('Analytics load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [timeRange]);

  const metrics = data?.metrics;
  const monthlyData = data?.metrics?.monthlyData || [];
  
  const totals = useMemo(() => {
    if (!monthlyData.length) return { revenue: 0, expenses: 0, profit: 0 };
    return monthlyData.reduce((acc: any, item: any) => ({
      revenue: acc.revenue + (item.revenue || 0),
      expenses: acc.expenses + (item.expenses || 0),
      profit: acc.profit + ((item.revenue || 0) - (item.expenses || 0)),
    }), { revenue: 0, expenses: 0, profit: 0 });
  }, [monthlyData]);

  const chartData = useMemo(() => {
    if (!monthlyData.length) return [];
    const maxValue = Math.max(...monthlyData.map((d: any) => d.revenue || 0));
    return monthlyData.map((item: any) => ({
      label: item.month,
      revenue: item.revenue || 0,
      expenses: item.expenses || 0,
      revenueHeight: maxValue > 0 ? ((item.revenue || 0) / maxValue) * 100 : 0,
      expensesHeight: maxValue > 0 ? ((item.expenses || 0) / maxValue) * 100 : 0,
    }));
  }, [monthlyData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-bg-tertiary animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-tertiary animate-pulse rounded-xl" />
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
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-tertiary">Track your business performance</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-accent-blue text-white'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary">Total Revenue</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                ₹{(totals.revenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-accent-emerald flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" /> +12.5%
              </p>
            </div>
            <div className="p-3 bg-accent-emerald/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-accent-emerald" />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary">Total Expenses</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                ₹{(totals.expenses || 0).toLocaleString()}
              </p>
              <p className="text-sm text-accent-rose flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" /> +5.2%
              </p>
            </div>
            <div className="p-3 bg-accent-rose/10 rounded-lg">
              <Wallet className="w-6 h-6 text-accent-rose" />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary">Net Profit</p>
              <p className={`text-2xl font-bold mt-1 ${
                totals.profit >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
              }`}>
                ₹{totals.profit.toLocaleString()}
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {((totals.profit / totals.revenue) * 100 || 0).toFixed(1)}% margin
              </p>
            </div>
            <div className="p-3 bg-accent-blue/10 rounded-lg">
              <PiggyBank className="w-6 h-6 text-accent-blue" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Revenue Trend</h3>
          {chartData.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.map((item: any, index: number) => (
                <motion.div
                  key={item.label}
                  initial={{ height: 0 }}
                  animate={{ height: `${item.revenueHeight}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1 bg-accent-blue/20 rounded-t-lg relative group"
                >
                  <div className="absolute bottom-0 w-full bg-accent-blue rounded-t-lg transition-colors group-hover:bg-accent-blue" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-elevated px-2 py-1 rounded text-xs text-text-primary whitespace-nowrap">
                    ₹{item.revenue.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              No data available
            </div>
          )}
          <div className="flex justify-between mt-4 text-xs text-text-muted">
            {chartData.map((item: any) => (
              <span key={item.label}>{item.label}</span>
            ))}
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Expense Breakdown</h3>
          {chartData.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.map((item: any, index: number) => (
                <motion.div
                  key={item.label}
                  initial={{ height: 0 }}
                  animate={{ height: `${item.expensesHeight}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1 bg-accent-rose/20 rounded-t-lg relative group"
                >
                  <div className="absolute bottom-0 w-full bg-accent-rose rounded-t-lg" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-elevated px-2 py-1 rounded text-xs text-text-primary whitespace-nowrap">
                    ₹{item.expenses.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              No data available
            </div>
          )}
          <div className="flex justify-between mt-4 text-xs text-text-muted">
            {chartData.map((item: any) => (
              <span key={item.label}>{item.label}</span>
            ))}
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Key Insights</h3>
        <div className="space-y-3">
          {[
            { text: 'Your revenue increased by 12.5% this month', positive: true },
            { text: 'Top expense category: Operations (45%)', positive: false },
            { text: 'You have 3 recurring expenses to review', positive: false },
          ].map((insight, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-surface-default rounded-lg">
              {insight.positive ? (
                <TrendingUp className="w-5 h-5 text-accent-emerald" />
              ) : (
                <BarChart3 className="w-5 h-5 text-accent-amber" />
              )}
              <p className="text-sm text-text-secondary">{insight.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const RecordsPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      try {
        const data = await recordsAPI.getAll();
        setRecords(data);
      } catch (error) {
        console.error('Records load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (filter !== 'all') {
      result = result.filter((r) => r.type === filter);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((r) =>
        (r.title || '').toLowerCase().includes(searchLower) ||
        (r.category || '').toLowerCase().includes(searchLower)
      );
    }
    return result;
  }, [records, filter, search]);

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, page]);

  const totalPages = Math.ceil(filteredRecords.length / perPage);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await recordsAPI.delete(id);
      setRecords(records.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-bg-tertiary animate-pulse rounded" />
        <div className="h-96 bg-bg-tertiary animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Records</h1>
          <p className="text-text-tertiary">{filteredRecords.length} total records</p>
        </div>
        <Button onClick={() => navigate('/scan-bill')} icon={<Plus className="w-4 h-4" />}>
          Add Record
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-accent-blue text-white'
                  : 'text-text-tertiary hover:text-text-primary bg-surface-default'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <Card padding="none">
        {paginatedRecords.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-default">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-text-tertiary">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-text-tertiary">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-text-tertiary">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-text-tertiary">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-text-tertiary">Date</th>
                    <th className="text-right p-4 text-sm font-medium text-text-tertiary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record: any, index: number) => (
                    <motion.tr
                      key={record._id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border-default hover:bg-surface-hover transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-text-primary">{record.title || 'Untitled'}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant={record.type === 'income' ? 'success' : 'default'}>
                          {record.type || 'expense'}
                        </Badge>
                      </td>
                      <td className="p-4 text-text-secondary">{record.category || '-'}</td>
                      <td className="p-4">
                        <span className={record.type === 'income' ? 'text-accent-emerald' : 'text-text-primary'}>
                          {record.type === 'income' ? '+' : '-'}₹{(record.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            onClick={() => navigate(`/records/${record._id}`)}
                          >
                            <Eye className="w-4 h-4 text-text-tertiary" />
                          </button>
                          <button
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            onClick={() => handleDelete(record._id)}
                          >
                            <Trash2 className="w-4 h-4 text-accent-rose" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border-default">
                <p className="text-sm text-text-tertiary">
                  Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filteredRecords.length)} of {filteredRecords.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-text-secondary">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No records found</p>
            <p className="text-sm text-text-tertiary mt-1">
              {search ? 'Try a different search term' : 'Add your first record to get started'}
            </p>
            <Button className="mt-4" onClick={() => navigate('/scan-bill')} icon={<Plus className="w-4 h-4" />}>
              Add Record
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export { AnalyticsPage, RecordsPage };
export default AnalyticsPage;