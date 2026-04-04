import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CircleDollarSign,
  Download,
  FileText,
  Filter,
  IndianRupee,
  Plus,
  ScanSearch,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../components/Layout/MainLayout';
import { PremiumBadge, PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import { recordsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/dashboardIntelligence';

interface RecordItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  createdAt: string;
}

const sidebarItems = [
  { icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard', href: '/dashboard' },
  { icon: <FileText className="h-5 w-5" />, label: 'Records', href: '/records' },
  { icon: <TrendingUp className="h-5 w-5" />, label: 'Analytics', href: '/analytics' },
  { icon: <Users className="h-5 w-5" />, label: 'Admin', href: '/admin' },
  { icon: <Wallet className="h-5 w-5" />, label: 'Billing', href: '/pricing' },
  { icon: <ScanSearch className="h-5 w-5" />, label: 'Image Search', href: '/image-intelligence' },
];

const statusToneMap = {
  pending: 'warning',
  in_progress: 'brand',
  completed: 'success',
  cancelled: 'error',
} as const;

const formatStatusLabel = (status: RecordItem['status']) =>
  status.replace('_', ' ');

const exportRecords = (records: RecordItem[]) => {
  const header = ['Title', 'Category', 'Type', 'Amount', 'Status', 'Date', 'Description'];
  const rows = records.map((record) => [
    record.title,
    record.category,
    record.type,
    String(record.amount),
    record.status,
    new Date(record.date || record.createdAt).toISOString(),
    record.description || '',
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bhie-records-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const PremiumRecords = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RecordItem['status']>('all');

  useEffect(() => {
    let active = true;

    const loadRecords = async () => {
      try {
        const response = await recordsAPI.getAll();
        if (active) {
          setRecords(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        if (active) {
          setRecords([]);
          toast.error('Failed to load records');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRecords();

    return () => {
      active = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        query.length === 0 ||
        [record.title, record.description, record.category, record.type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (accumulator, record) => {
        if (record.type === 'income') {
          accumulator.income += record.amount;
        } else {
          accumulator.expenses += record.amount;
        }

        accumulator.total += 1;
        return accumulator;
      },
      { total: 0, income: 0, expenses: 0 }
    );
  }, [filteredRecords]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) {
      return;
    }

    try {
      await recordsAPI.delete(id);
      setRecords((current) => current.filter((record) => record._id !== id));
      toast.success('Record deleted');
      window.dispatchEvent(new CustomEvent('bhie:records-updated'));
    } catch {
      toast.error('Failed to delete record');
    }
  };

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      activePage="/records"
      onNavigate={(href) => navigate(href)}
      onLogout={logout}
      userName={user?.name}
    >
      <div className="mx-auto max-w-7xl space-y-8 px-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_26%),rgba(2,6,23,0.78)] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.48)] md:p-8"
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="section-kicker">
                <FileText className="h-3.5 w-3.5" />
                Business records
              </div>
              <h1 className="mt-4 text-[2.6rem] font-black tracking-[-0.08em] text-white md:text-[3.35rem]">
                Clean records, faster decisions
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink-300 md:text-lg">
                Review every income and expense record in one place, filter by status, and export the current view when needed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <PremiumButton
                variant="secondary"
                size="md"
                icon={<Download className="h-4 w-4" />}
                onClick={() => exportRecords(filteredRecords)}
              >
                Export CSV
              </PremiumButton>
              <PremiumButton
                size="md"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => navigate('/dashboard')}
              >
                Add record
              </PremiumButton>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          <PremiumCard hoverable={false} className="border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Visible records</p>
                <p className="mt-3 text-3xl font-black tracking-[-0.08em] text-white">{totals.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard hoverable={false} className="border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Income tracked</p>
                <p className="mt-3 text-3xl font-black tracking-[-0.08em] text-white">{formatCurrency(totals.income)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard hoverable={false} className="border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Expenses tracked</p>
                <p className="mt-3 text-3xl font-black tracking-[-0.08em] text-white">{formatCurrency(totals.expenses)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-200">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </PremiumCard>
        </section>

        <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-ink-400" />
            <input
              type="text"
              placeholder="Search by title, category, type, or description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-12 pr-4 text-white placeholder:text-ink-400 focus:border-sky-300/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  statusFilter === filter
                    ? 'border-sky-300/50 bg-sky-400/15 text-white shadow-[0_0_24px_rgba(56,189,248,0.18)]'
                    : 'border-white/10 bg-white/[0.04] text-ink-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <Filter className="h-4 w-4" />
                {filter === 'all' ? 'All statuses' : formatStatusLabel(filter)}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.04]" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <PremiumCard hoverable={false} className="border border-dashed border-white/12 bg-white/[0.03] py-16 text-center">
            <p className="text-lg font-semibold text-white">No records match this view</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink-300">
              Adjust the search or filters, or add a new upload from the dashboard to populate this list.
            </p>
          </PremiumCard>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => (
              <motion.div
                key={record._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <PremiumCard className="border border-white/10 p-5 hover:scale-105 transition-all duration-300 card-glow glow-pulse">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-white">{record.title}</h2>
                        <PremiumBadge variant={statusToneMap[record.status]}>
                          {formatStatusLabel(record.status)}
                        </PremiumBadge>
                        <PremiumBadge variant={record.type === 'income' ? 'success' : 'warning'}>
                          {record.type}
                        </PremiumBadge>
                      </div>

                      <p className="text-sm leading-6 text-ink-300">
                        {record.description || 'No description added for this record.'}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-ink-300">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 capitalize">
                          {record.category}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                          {new Date(record.date || record.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-4 xl:items-end">
                      <div className="text-left xl:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Amount</p>
                        <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">
                          {formatCurrency(record.amount)}
                        </p>
                      </div>

                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(record._id)}
                      >
                        Delete record
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PremiumRecords;
