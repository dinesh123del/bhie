import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Filter,
  Plus,
  Search,
  LayoutGrid,
  Network,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { recordsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { HUDModal } from '../components/HUDModal';
import { StrategicTopology } from '../components/StrategicTopology';
import { premiumFeedback } from '../utils/premiumFeedback';

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
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState<'all' | RecordItem['status']>('all');
  const [viewMode, setViewMode] = useState<'list' | 'topology'>('list');
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  const springTransition = { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] };

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
    return () => { active = false; };
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
    return filteredRecords.reduce((accumulator, record) => {
      if (record.type === 'income') accumulator.income += record.amount;
      else accumulator.expenses += record.amount;
      accumulator.total += 1;
      return accumulator;
    }, { total: 0, income: 0, expenses: 0 });
  }, [filteredRecords]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this record?')) return;
    try {
      premiumFeedback.click();
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
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-8 py-8 space-y-10 pb-24 text-white">
        
        {/* HUD INTERROGATION MODAL */}
        <HUDModal 
          isOpen={!!selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          data={selectedRecord} 
        />

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1C1C1E]">
          <div className="space-y-2">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={springTransition}
               className="inline-flex items-center gap-2 mb-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
              <span className="text-[11px] font-semibold text-[#A1A1A6] uppercase tracking-wider">Financial Ledger</span>
            </motion.div>
            <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight text-white leading-tight">
              All transactions.
            </h1>
          </div>
          <motion.div className="flex gap-3">
            <button 
              onClick={() => {
                premiumFeedback.click();
                exportRecords(filteredRecords);
              }}
              className="px-4 py-2 rounded-full border border-[#1C1C1E] hover:bg-[#1C1C1E] transition-colors flex items-center gap-2 text-[13px] font-medium text-[#A1A1A6]"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
               onClick={() => {
                 premiumFeedback.click();
                 navigate('/dashboard');
               }}
               className="px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors flex items-center gap-2 text-[13px] font-medium"
            >
              <Plus className="w-4 h-4" /> Log New Bill
            </button>
          </motion.div>
        </header>

        {/* View Toggle & Summary Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#1C1C1E]/50 border border-white/5 p-4 rounded-3xl backdrop-blur-3xl gap-6">
           <div className="flex gap-2 p-1.5 bg-black/50 rounded-2xl border border-white/5">
               <button 
                 onClick={() => {
                   premiumFeedback.click();
                   setViewMode('list');
                 }}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${viewMode === 'list' ? 'bg-[#1C1C1E] text-white shadow-lg' : 'text-[#A1A1A6] hover:text-white'}`}
               >
                  <LayoutGrid className="w-4 h-4" /> Grid
               </button>
               <button 
                 onClick={() => {
                   premiumFeedback.click();
                   setViewMode('topology');
                 }}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${viewMode === 'topology' ? 'bg-[#1C1C1E] text-white shadow-lg' : 'text-[#A1A1A6] hover:text-white'}`}
               >
                  <Network className="w-4 h-4" /> Visual
               </button>
           </div>
           
           <div className="flex flex-wrap md:flex-nowrap gap-12 px-8 py-2">
               <div className="flex flex-col items-center">
                  <p className="text-[11px] font-semibold text-[#A1A1A6] uppercase tracking-wider mb-1">Total Entries</p>
                  <p className="text-[24px] font-bold text-white tracking-tight">{totals.total}</p>
               </div>
               <div className="flex flex-col items-center">
                  <p className="text-[11px] font-semibold text-[#A1A1A6] uppercase tracking-wider mb-1">Capital In</p>
                  <p className="text-[24px] font-bold text-[#34C759] tracking-tight">₹{totals.income.toLocaleString()}</p>
               </div>
               <div className="flex flex-col items-center">
                  <p className="text-[11px] font-semibold text-[#A1A1A6] uppercase tracking-wider mb-1">Money Out</p>
                  <p className="text-[24px] font-bold text-[#FF3B30] tracking-tight">₹{totals.expenses.toLocaleString()}</p>
               </div>
            </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'topology' ? (
            <motion.div
              key="topology"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={springTransition}
            >
               <StrategicTopology records={filteredRecords} />
            </motion.div>
          ) : (
            <div className="space-y-8">
                {/* Search & Filter */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springTransition}
                  className="flex flex-col md:flex-row gap-4"
                >
                  <div className="relative w-full md:max-w-[400px]">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-[#A1A1A6]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search bills, categories..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-2xl bg-[#1C1C1E] border border-white/5 py-3 pl-11 pr-4 text-[15px] text-white placeholder:text-[#636366] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 bg-[#1C1C1E] p-1.5 rounded-2xl border border-white/5">
                    {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const).map((filter) => (
                       <button
                         key={filter}
                         type="button"
                         onClick={() => {
                           premiumFeedback.click();
                           setStatusFilter(filter);
                         }}
                         className={`relative px-4 py-2 text-[13px] font-medium transition-all rounded-xl ${
                           statusFilter === filter
                             ? 'bg-[#2C2C2E] text-white shadow-sm'
                             : 'text-[#A1A1A6] hover:text-white'
                         }`}
                       >
                         {filter === 'all' ? 'All' : formatStatusLabel(filter)}
                       </button>
                    ))}
                  </div>
                </motion.div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="h-48 animate-pulse rounded-2xl bg-[#1C1C1E]" />
                    ))}
                  </div>
                ) : filteredRecords.length === 0 ? (
                   <div className="border border-white/10 bg-[#1C1C1E]/50 py-24 text-center rounded-[32px] backdrop-blur-xl">
                     <div className="w-20 h-20 rounded-[2rem] bg-[#2C2C2E] flex items-center justify-center mx-auto mb-6">
                       <Search className="w-8 h-8 text-[#A1A1A6]" />
                     </div>
                     <h3 className="text-xl font-bold text-white tracking-tight">No records found</h3>
                     <p className="mx-auto mt-2 text-[15px] text-[#A1A1A6] max-w-sm">
                       Try adjusting your search or filters to find what you're looking for.
                     </p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecords.map((record, index) => (
                      <motion.div
                        key={record._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, ...springTransition }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        onClick={() => setSelectedRecord(record)}
                        className="apple-card p-6 cursor-pointer flex flex-col group"
                      >
                         <div className="flex justify-between items-start mb-4">
                           <div className="space-y-3">
                             <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex ${
                               record.type === 'income' ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                             }`}>
                               {record.type}
                             </div>
                             <h2 className="text-[17px] font-semibold text-white tracking-tight line-clamp-1 group-hover:text-[#007AFF] transition-colors">
                               {record.title}
                             </h2>
                           </div>
                           
                           <div className="text-right">
                              <span className="text-[20px] font-bold tabular-nums tracking-tight">
                                ₹{record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                           </div>
                         </div>

                         <p className="text-[13px] leading-relaxed text-[#A1A1A6] line-clamp-2 min-h-[40px] mb-6">
                           {record.description || 'No additional details provided.'}
                         </p>

                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                           <div className="flex items-center gap-2">
                              <span className="text-[11px] text-[#636366] font-medium uppercase tracking-wider">
                                {new Date(record.date || record.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })}
                              </span>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                record.status === 'completed' ? 'text-[#34C759]' :
                                record.status === 'pending' ? 'text-[#FF9500]' :
                                record.status === 'in_progress' ? 'text-[#007AFF]' :
                                'text-[#A1A1A6]'
                              }`}>
                                {formatStatusLabel(record.status)}
                              </span>
                              <button 
                                onClick={(e) => handleDelete(record._id, e)}
                                className="text-[#A1A1A6] hover:text-[#FF3B30] transition-colors"
                                title="Delete Record"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                              </button>
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
