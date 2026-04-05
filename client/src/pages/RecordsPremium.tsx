import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  LayoutGrid,
  Network,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../components/Layout/MainLayout';
import { PremiumBadge, PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import { recordsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/dashboardIntelligence';
import { HUDModal } from '../components/HUDModal';
import { StrategicTopology } from '../components/StrategicTopology';

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
  { icon: <BarChart3 className="h-5 w-5" />, label: 'Overview', href: '/dashboard' },
  { icon: <FileText className="h-5 w-5" />, label: 'My Bills', href: '/records' },
  { icon: <TrendingUp className="h-5 w-5" />, label: 'Growth', href: '/analytics' },
  { icon: <ScanSearch className="h-5 w-5" />, label: 'Ask Assistant', href: '/analysis-report' },
  { icon: <Wallet className="h-5 w-5" />, label: 'Upgrade', href: '/pricing' },
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

// Premium Section Wrapper for consistent animations
const PremiumSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.section>
);

const PremiumRecords = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState<'all' | RecordItem['status']>('all');
  const [viewMode, setViewMode] = useState<'list' | 'topology'>('list');
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  useEffect(() => {
    let active = true;

    const loadRecords = async () => {
      try {
        const response = await recordsAPI.getAll();
        if (active) {
          setRecords(Array.isArray(response) ? response : []);
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <>
      <div className="mx-auto max-w-7xl space-y-12 px-6 pb-20">
        
        {/* HUD INTERROGATION MODAL */}
        <HUDModal 
          isOpen={!!selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          data={selectedRecord} 
        />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[3rem] border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl md:p-14 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 pointer-events-none" />
          <div className="flex flex-col gap-12 xl:flex-row xl:items-end xl:justify-between relative z-10">
            <div className="max-w-4xl">
              <motion.div 
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 className="flex items-center gap-2 mb-8"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(139,92,246,0.8)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">FINANCIAL LEDGER</span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9]">
                All Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400 filter drop-shadow-sm">Bills & Money.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-semibold leading-relaxed tracking-tight">
                Trace every single Rupee. Discover, filter, and organize your receipts with military precision.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <PremiumButton
                variant="secondary"
                size="lg"
                icon={<Download className="h-5 w-5" />}
                onClick={() => exportRecords(filteredRecords)}
                className="rounded-2xl"
              >
                Export CSV
              </PremiumButton>
              <PremiumButton
                 size="lg"
                 icon={<Plus className="h-5 w-5" />}
                 onClick={() => navigate('/dashboard')}
                 className="rounded-2xl shadow-lg shadow-brand-500/20"
               >
                 Log New Bill
               </PremiumButton>
            </div>
          </div>
        </motion.section>

        {/* VIEW TOGGLE & SUMMARY STATS */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/40 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-4 rounded-[2.5rem] backdrop-blur-3xl shadow-xl gap-6">
           <div className="flex gap-2 p-1.5 bg-gray-100/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
               <button 
                 onClick={() => setViewMode('list')}
                 className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xl scale-105' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'}`}
               >
                  <LayoutGrid className="w-4 h-4" />
                  Grid View
               </button>
               <button 
                 onClick={() => setViewMode('topology')}
                 className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'topology' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xl scale-105' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'}`}
               >
                  <Network className="w-4 h-4" />
                  Visual Node
               </button>
           </div>
           <div className="flex flex-wrap justify-center md:flex-nowrap gap-12 px-8">
               <div className="flex flex-col items-center group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-brand-500 transition-colors">Total Entries</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">{totals.total}</p>
               </div>
               <div className="flex flex-col items-center group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-emerald-500 transition-colors">Capital In</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter tabular-nums filter drop-shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <span className="text-sm mr-1 opacity-50">₹</span>{totals.income.toLocaleString()}
                  </p>
               </div>
               <div className="flex flex-col items-center group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-rose-500 transition-colors">Money Out</p>
                  <p className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tighter tabular-nums filter drop-shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                    <span className="text-sm mr-1 opacity-50">₹</span>{totals.expenses.toLocaleString()}
                  </p>
               </div>
            </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'topology' ? (
            <motion.div
              key="topology"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
               <StrategicTopology records={filteredRecords} />
            </motion.div>
          ) : (
            <div className="space-y-8">
                <PremiumSection delay={0.3} className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between px-2">
                  <div className="relative w-full xl:max-w-xl group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search bills, categories, or notes..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] py-4.5 pl-14 pr-6 text-base text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-brand-500/50 backdrop-blur-3xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium shadow-inner"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 bg-gray-100/50 dark:bg-white/5 p-1.5 rounded-2xl backdrop-blur-md border border-black/5 dark:border-white/5">
                    {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const).map((filter) => (
                       <button
                         key={filter}
                         type="button"
                         onClick={() => setStatusFilter(filter)}
                         className={`relative px-5 py-2 text-xs font-bold transition-all duration-500 rounded-xl ${
                           statusFilter === filter
                             ? 'bg-white dark:bg-white/10 text-brand-600 dark:text-brand-400 shadow-sm'
                             : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                         }`}
                       >
                         {filter === 'all' ? 'All' : formatStatusLabel(filter)}
                         {statusFilter === filter && (
                           <motion.div 
                             layoutId="activeFilter" 
                             className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl -z-10 shadow-sm"
                             transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                           />
                         )}
                       </button>
                    ))}
                  </div>
                </PremiumSection>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-64 animate-pulse rounded-[2.5rem] border border-white/5 bg-white/[0.02]" />
                    ))}
                  </div>
                ) : filteredRecords.length === 0 ? (
                   <PremiumCard hoverable={false} className="border border-dashed border-black/10 dark:border-white/10 bg-white/30 dark:bg-white/[0.01] py-32 text-center rounded-[3rem] backdrop-blur-sm">
                     <div className="w-20 h-20 rounded-[2rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-sm">
                       <Search className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">No records match your search</h3>
                     <p className="mx-auto mt-4 max-w-sm text-base text-gray-500 dark:text-gray-400 font-medium">
                       Try using more general keywords or adjust your status filters.
                     </p>
                   </PremiumCard>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredRecords.map((record, index) => (
                      <motion.div
                        key={record._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        onClick={() => setSelectedRecord(record)}
                        className="group"
                      >
                        <div className="relative h-full overflow-hidden rounded-[2.5rem] p-px bg-gradient-to-br from-black/10 to-transparent dark:from-white/15 dark:to-transparent hover:from-brand-500/40 transition-all duration-500 shadow-lg">
                          <div className="relative h-full bg-white dark:bg-[#0A0A0B] rounded-[2.45rem] p-8 flex flex-col gap-6 transition-colors duration-500 group-hover:bg-white/95 dark:group-hover:bg-[#121214]">
                            {/* Card Content Interior */}
                            <div className="flex justify-between items-start">
                              <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                    {record.title}
                                  </h2>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                                   <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-400">
                                     {record.category}
                                   </span>
                                   <span className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                                     record.type === 'income' 
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                   }`}>
                                     <div className={`w-1.5 h-1.5 rounded-full ${record.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                     {record.type}
                                   </span>
                                </div>
                              </div>
                              
                              <div className="text-right ml-4">
                                <div className="flex flex-col items-end">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-lg font-bold text-gray-400 dark:text-gray-500">₹</span>
                                    <span className="text-4xl font-[900] text-gray-900 dark:text-white tracking-tighter transition-all font-mono tabular-nums leading-none">
                                      {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                             <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-medium line-clamp-2 min-h-[3rem]">
                               {record.description || 'No additional details provided for this entry.'}
                             </p>

                            <div className="flex justify-between items-end mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                               <div className="flex flex-col gap-1">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date Logged</span>
                                 <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                   {new Date(record.date || record.createdAt).toLocaleDateString('en-IN', {
                                     day: '2-digit', month: 'short', year: 'numeric'
                                   })}
                                 </span>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                    record.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                    record.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                                    record.status === 'in_progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                                    'bg-gray-500/10 border-gray-500/20 text-gray-500'
                                  }`}>
                                    {formatStatusLabel(record.status)}
                                  </div>
                                  <button 
                                    onClick={(e) => handleDelete(record._id, e)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group/del"
                                    title="Delete Record"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/del:scale-110 transiton-transform"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                  </button>
                               </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
      </div>
    </>
  );
};

export default PremiumRecords;
