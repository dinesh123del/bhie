import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  { icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard', href: '/dashboard' },
  { icon: <FileText className="h-5 w-5" />, label: 'Records', href: '/records' },
  { icon: <TrendingUp className="h-5 w-5" />, label: 'Analytics', href: '/analytics' },
  { icon: <Users className="h-5 w-5" />, label: 'Admin', href: '/admin' },
  { icon: <Wallet className="h-5 w-5" />, label: 'Billing', href: '/pricing' },
  { icon: <ScanSearch className="h-5 w-5" />, label: 'Analysis', href: '/analysis-report' },
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
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    if (!window.confirm('Terminate this data node?')) {
      return;
    }

    try {
      await recordsAPI.delete(id);
      setRecords((current) => current.filter((record) => record._id !== id));
      toast.success('Node terminated');
      window.dispatchEvent(new CustomEvent('bhie:records-updated'));
    } catch {
      toast.error('Termination sequence failed');
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
          className="overflow-hidden rounded-[3rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_26%),rgba(2,6,23,0.78)] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.48)] md:p-12 relative"
        >
          <div className="flex flex-col gap-12 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <motion.div 
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 className="section-kicker flex items-center gap-2 mb-6"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Strategic Intel Hub</span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
                Capital <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-indigo-300">Resonance</span> Node.
              </h1>
              <p className="mt-8 max-w-2xl text-xl text-white/40 font-medium leading-relaxed">
                Autonomous data orchestration for elite strategic command. Interrogate your capital nodes in real-time.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <PremiumButton
                variant="secondary"
                size="lg"
                icon={<Download className="h-5 w-5" />}
                onClick={() => exportRecords(filteredRecords)}
              >
                Data Export
              </PremiumButton>
              <PremiumButton
                size="lg"
                icon={<Plus className="h-5 w-5" />}
                onClick={() => navigate('/dashboard')}
              >
                Ingest Node
              </PremiumButton>
            </div>
          </div>
        </motion.section>

        {/* VIEW TOGGLE */}
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-[2rem] backdrop-blur-xl">
           <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'text-white/40 hover:text-white'}`}
              >
                 <LayoutGrid className="w-4 h-4" />
                 Tactical List
              </button>
              <button 
                onClick={() => setViewMode('topology')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'topology' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'text-white/40 hover:text-white'}`}
              >
                 <Network className="w-4 h-4" />
                 Strategic Topology
              </button>
           </div>
           
           <div className="hidden md:flex gap-8 px-8">
              <div className="flex flex-col items-center">
                 <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Density</p>
                 <p className="text-xl font-black text-white">{totals.total}</p>
              </div>
              <div className="flex flex-col items-center">
                 <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Yield</p>
                 <p className="text-xl font-black text-emerald-400">{formatCurrency(totals.income)}</p>
              </div>
              <div className="flex flex-col items-center">
                 <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Exhaust</p>
                 <p className="text-xl font-black text-rose-400">{formatCurrency(totals.expenses)}</p>
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
               <PremiumSection delay={0.3} className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between px-2">
                 <div className="relative w-full xl:max-w-xl group">
                   <Search className="absolute left-6 top-4.5 h-6 w-6 text-white/30 group-focus-within:text-sky-400 transition-colors" />
                   <input
                     type="text"
                     placeholder="Search Intelligence Core..."
                     value={search}
                     onChange={(event) => setSearch(event.target.value)}
                     className="w-full rounded-[1.5rem] border border-white/5 bg-white/[0.02] py-5 pl-16 pr-6 text-xl text-white placeholder:text-white/10 focus:border-sky-400/50 backdrop-blur-3xl focus:outline-none focus:ring-4 focus:ring-sky-400/5 transition-all"
                   />
                 </div>

                 <div className="flex flex-wrap gap-2">
                   {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const).map((filter) => (
                     <button
                       key={filter}
                       type="button"
                       onClick={() => setStatusFilter(filter)}
                       className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                         statusFilter === filter
                           ? 'border-sky-400/50 bg-sky-400/20 text-white shadow-[0_0_25px_rgba(56,189,248,0.2)]'
                           : 'border-white/5 bg-white/[0.01] text-white/40 hover:bg-white/5 hover:text-white'
                       }`}
                     >
                       {filter === 'all' ? 'All Nodes' : formatStatusLabel(filter)}
                     </button>
                   ))}
                 </div>
               </PremiumSection>

               {loading ? (
                 <div className="grid gap-6">
                   {[1, 2, 3, 4].map((item) => (
                     <div key={item} className="h-32 animate-pulse rounded-[2.5rem] border border-white/10 bg-white/[0.04]" />
                   ))}
                 </div>
               ) : filteredRecords.length === 0 ? (
                 <PremiumCard hoverable={false} className="border border-dashed border-white/12 bg-white/[0.03] py-24 text-center rounded-[3rem]">
                   <Zap className="w-12 h-12 text-white/10 mx-auto mb-6" />
                   <p className="text-2xl font-black text-white italic tracking-tight">No intelligence nodes detected.</p>
                   <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/30 font-medium">
                     Adjust the search parameters or filter nodes.
                   </p>
                 </PremiumCard>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {filteredRecords.map((record, index) => (
                     <motion.div
                       key={record._id}
                       initial={{ opacity: 0, y: 12, rotateX: 10 }}
                       animate={{ opacity: 1, y: 0, rotateX: 0 }}
                       transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                       whileHover={{ y: -8, transition: { duration: 0.2 } }}
                       onClick={() => setSelectedRecord(record)}
                     >
                       <PremiumCard className="border border-white/5 p-8 bg-white/[0.01] backdrop-blur-3xl group cursor-pointer overflow-hidden rounded-[2.5rem] relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         
                         <div className="flex flex-col gap-6 relative z-10">
                           <div className="flex justify-between items-start">
                             <div className="space-y-4">
                               <div className="flex items-center gap-3">
                                 <h2 className="text-2xl font-black text-white tracking-tighter uppercase line-clamp-1">{record.title}</h2>
                               </div>
                               <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                                  <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">{record.category}</span>
                                  <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">{record.type}</span>
                                  <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">{formatStatusLabel(record.status)}</span>
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="text-[3rem] font-black text-white leading-none tracking-tighter">
                                 ₹{record.amount.toLocaleString()}
                               </p>
                             </div>
                           </div>

                           <p className="text-lg leading-relaxed text-white/40 font-medium line-clamp-2 italic">
                             "{record.description || 'No strategic metadata attached.'}"
                           </p>

                           <div className="flex justify-between items-center pt-8 border-t border-white/5">
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                {new Date(record.date || record.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'long', year: 'numeric'
                                })}
                              </span>
                              <div className="flex items-center gap-4">
                                 <button 
                                   onClick={(e) => handleDelete(record._id, e)}
                                   className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60 hover:text-rose-400"
                                 >
                                   Terminate Node
                                 </button>
                                 <div className="w-10 h-10 rounded-full border border-sky-400/20 bg-sky-400/5 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-5 h-5" />
                                 </div>
                              </div>
                           </div>
                         </div>
                       </PremiumCard>
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default PremiumRecords;
