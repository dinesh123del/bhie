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
} from 'lucide-react';
import api from '../lib/axios';

interface DataRecord {
  _id: string;
  title: string;
  category: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  category: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
}

const CATEGORIES = ['Finance', 'Operations', 'HR', 'Sales', 'Marketing', 'Support', 'Legal'];

const STATUS_CONFIG = {
  draft: { color: 'gray', icon: Clock, label: 'Draft' },
  active: { color: 'green', icon: CheckCircle, label: 'Active' },
  archived: { color: 'red', icon: AlertCircle, label: 'Archived' },
};

const INITIAL_FORM: FormData = {
  title: '',
  category: '',
  description: '',
  status: 'active' as const,
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
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
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
      description: record.description,
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
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Records Management</h1>
            <p className="text-gray-400">Organize and manage your records efficiently</p>
          </div>
          <button
            onClick={() => {
              setFormData(INITIAL_FORM);
              setEditingId(null);
              setFormErrors({});
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-medium transition-all hover:shadow-lg active:scale-95"
          >
            <Plus size={20} />
            Add Record
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
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
              <p className="text-gray-400">Loading records...</p>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={40} />
            <h3 className="text-xl font-semibold mb-2">No records found</h3>
            <p className="text-gray-400 mb-6">
              {records.length === 0
                ? 'Get started by creating your first record.'
                : 'No records match your search or filter.'}
            </p>
            {records.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                Create Record
              </button>
            )}
          </div>
        ) : (
          /* Table */
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-xl border border-white/10"></div>
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
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
                          className="hover:bg-white/5 transition-colors animate-fadeIn"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <p className="font-medium text-white">{record.title}</p>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                                {record.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-medium text-blue-300">
                              {record.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Icon
                                size={16}
                                className={
                                  record.status === 'active'
                                    ? 'text-emerald-400'
                                    : record.status === 'draft'
                                    ? 'text-gray-400'
                                    : 'text-red-400'
                                }
                              />
                              <span
                                className={`text-xs font-semibold capitalize ${
                                  record.status === 'active'
                                    ? 'text-emerald-400'
                                    : record.status === 'draft'
                                    ? 'text-gray-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {record.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(record.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                                title="Edit record"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(record._id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                title="Delete record"
                              >
                                <Trash2 size={16} />
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
          <div className="mt-6 text-sm text-gray-400 flex items-center justify-between">
            <p>
              Showing {filteredRecords.length} of {records.length} record
              {records.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-gray-900 via-gray-900 to-transparent p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit Record' : 'Create New Record'}
              </h2>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter record title"
                  className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    formErrors.title
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-white/20 focus:border-blue-500'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white focus:outline-none transition-colors ${
                    formErrors.category
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-white/20 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.category}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter detailed description (min. 10 characters)"
                  rows={4}
                  className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors resize-none ${
                    formErrors.description
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-white/20 focus:border-blue-500'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          status: key as 'draft' | 'active' | 'archived',
                        })
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        formData.status === key
                          ? 'bg-blue-600 text-white border border-blue-400'
                          : 'bg-white/10 text-gray-300 border border-white/20 hover:border-white/40'
                      }`}
                    >
                      {getStatusIcon(key)}
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {editingId ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slideUp">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-red-500/20 border border-red-500/30">
              <AlertCircle className="text-red-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Delete Record?</h3>
            <p className="text-gray-400 text-center mb-6">
              This action cannot be undone. The record will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Records;

