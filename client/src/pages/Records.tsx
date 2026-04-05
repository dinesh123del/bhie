import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock,
  IndianRupee,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import api from '../lib/axios';
import { PremiumInput, PremiumButton } from '../components/ui/PremiumComponents';

interface DataRecord {
  _id: string;
  title: string;
  category: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  category: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

const CATEGORIES = ['Finance', 'Operations', 'HR', 'Sales', 'Marketing', 'Support', 'Legal', 'Bill', 'Tax', 'Other'];

const STATUS_CONFIG = {
  pending: { color: 'gray', icon: Clock, label: 'Pending' },
  in_progress: { color: 'blue', icon: Clock, label: 'Progress' },
  completed: { color: 'green', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'red', icon: AlertCircle, label: 'Cancelled' },
};

const INITIAL_FORM: FormData = {
  title: '',
  category: '',
  description: '',
  type: 'expense',
  amount: 0,
  status: 'pending',
};

const Records: React.FC = () => {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal & Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch records on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter records when search or category changes
  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, categoryFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/records');
      const data = Array.isArray(response.data) ? response.data : response.data.records || [];
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    setFilteredRecords(filtered);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/records/${editingId}`, formData);
        toast.success('Record updated successfully!');
      } else {
        await api.post('/records', formData);
        toast.success('Record created successfully!');
      }

      await fetchRecords();
      closeModal();
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record: DataRecord) => {
    setEditingId(record._id);
    setFormData({
      title: record.title,
      category: record.category,
      description: record.description || '',
      type: record.type,
      amount: record.amount,
      status: record.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await api.delete(`/records/${deleteId}`);
      toast.success('Record deleted successfully!');
      await fetchRecords();
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Delete failed';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  const getStatusIcon = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    const Icon = config?.icon || Clock;
    return <Icon size={16} />;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 md:p-8">
      <Toaster position="top-right" />

      {/* Fixed background grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage:
              'linear-gradient(0deg, transparent 24%, rgba(79, 172, 254, 0.1) 25%, rgba(79, 172, 254, 0.1) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, 0.1) 75%, rgba(79, 172, 254, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(79, 172, 254, 0.1) 25%, rgba(79, 172, 254, 0.1) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, 0.1) 75%, rgba(79, 172, 254, 0.1) 76%, transparent 77%, transparent)',
            backgroundSize: '60px 60px',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeIn">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tighter">Business Records</h1>
            <p className="text-gray-400">Streamline your financial activity with precision.</p>
          </div>
          <PremiumButton
            onClick={() => {
              setFormData(INITIAL_FORM);
              setEditingId(null);
              setFormErrors({});
              setShowModal(true);
            }}
            icon={<Plus size={20} />}
          >
            Add New Record
          </PremiumButton>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search records by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="animate-spin text-blue-400 mx-auto mb-4" size={40} />
              <p className="text-gray-400 font-medium">Synchronizing records...</p>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-24 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl">
            <AlertCircle className="mx-auto mb-4 text-gray-400/50" size={60} />
            <h3 className="text-2xl font-bold mb-2">No records found</h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              {records.length === 0
                ? 'Your ledger is empty. Start tracking your business activity now.'
                : 'No results matches your forensic search parameters.'}
            </p>
            {records.length === 0 && (
              <PremiumButton
                onClick={() => setShowModal(true)}
                icon={<Plus size={20} />}
              >
                Create First Record
              </PremiumButton>
            )}
          </div>
        ) : (
          /* Table */
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-3xl border border-white/10"></div>
            <div className="relative overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Data Point
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Total Amount
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Command
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredRecords.map((record, index) => {
                      const statusConfig =
                        STATUS_CONFIG[record.status as keyof typeof STATUS_CONFIG];
                      const Icon = statusConfig?.icon || Clock;

                      return (
                        <tr
                          key={record._id}
                          className="hover:bg-white/10 transition-colors animate-fadeIn"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <p className="font-bold text-white text-lg tracking-tight">{record.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                  {record.category}
                                </span>
                                <p className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
                                  {record.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-tight ${record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {record.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              {record.type}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xl font-black text-white italic">
                              ₹{record.amount.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${
                                  record.status === 'completed'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : record.status === 'pending'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : record.status === 'in_progress'
                                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}>
                              <Icon size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {record.status.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-xs text-gray-400 font-medium font-mono">
                            {new Date(record.createdAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-3 hover:bg-blue-500/20 rounded-xl transition-all text-blue-400 hover:text-blue-300 border border-transparent hover:border-blue-500/30"
                                title="Edit record"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(record._id)}
                                className="p-3 hover:bg-red-500/20 rounded-xl transition-all text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/30"
                                title="Delete record"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Results info */}
        {!loading && records.length > 0 && (
          <div className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center justify-between">
            <p>
              Displaying {filteredRecords.length} / {records.length} Core Nodes
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Header */}
            <div className="sticky top-0 bg-[#0D0D0D]/80 backdrop-blur-md p-8 border-b border-white/5 flex items-center justify-between z-10">
              <h2 className="text-3xl font-black italic tracking-tighter text-white">
                {editingId ? 'Edit Synthetic Record' : 'Initialize New Record'}
              </h2>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-3 hover:bg-white/10 rounded-2xl transition-colors disabled:opacity-50 text-white/50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Title */}
                <div className="md:col-span-2">
                  <PremiumInput
                    label="Record Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={formErrors.title}
                    placeholder="Enter identifying title"
                    floating
                  />
                </div>

                {/* Amount */}
                <PremiumInput
                  label="Transaction Amount (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  error={formErrors.amount}
                  icon={<IndianRupee size={16} />}
                  placeholder="0.00"
                  floating
                />

                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Classification</label>
                  <div className="flex gap-2">
                    {(['income', 'expense'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t })}
                        className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                          formData.type === t
                            ? t === 'income' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Business Domain</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-6 py-3 bg-white/5 border rounded-2xl text-white font-bold text-sm focus:outline-none transition-colors ${
                      formErrors.category ? 'border-rose-500/50' : 'border-white/10 focus:border-blue-500'
                    }`}
                  >
                    <option value="" className="bg-[#0D0D0D]">Select Sector</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0D0D0D]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Lifecycle Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key} className="bg-[#0D0D0D]">
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Tactical Observations</label>
                 <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter detailed observations relative to this record..."
                    rows={4}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-white font-medium text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder-white/20"
                  />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-colors disabled:opacity-50"
                >
                  Terminate
                </button>
                <PremiumButton
                  type="submit"
                  disabled={submitting}
                  loading={submitting}
                  className="flex-1"
                >
                  {editingId ? 'Execute Update' : 'Initialize Record'}
                </PremiumButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="bg-[#0D0D0D] border border-red-500/20 rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 animate-slideUp text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-8 rounded-3xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="text-red-500" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white italic mb-4">Purge Record?</h3>
            <p className="text-white/40 font-medium mb-10 leading-relaxed">
              This action executes a permanent deletion protocol. This cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50"
              >
                abort
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader size={12} className="animate-spin" /> : 'confirm purge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Records;

