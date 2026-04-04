import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, IndianRupee, Calendar, Tag, FileText, Save, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { recordsService } from '../services/recordsService';
import { PremiumButton, PremiumCard } from './ui/PremiumComponents';

interface QuickAddProps {
  onRecordAdded?: () => void;
  className?: string;
}

interface TransactionForm {
  title: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
}

const CATEGORIES = {
  income: [
    'Sales Revenue',
    'Service Income',
    'Consulting Fees',
    'Product Sales',
    'Commission',
    'Interest Income',
    'Other Income'
  ],
  expense: [
    'Office Supplies',
    'Marketing',
    'Software',
    'Travel',
    'Utilities',
    'Rent',
    'Salaries',
    'Equipment',
    'Professional Services',
    'Taxes',
    'Insurance',
    'Other Expense'
  ]
};

const INITIAL_FORM: TransactionForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: new Date().toISOString().split('T')[0],
  description: ''
};

export default function QuickAdd({ onRecordAdded, className = '' }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<TransactionForm>(INITIAL_FORM);

  const availableCategories = CATEGORIES[form.type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.amount || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      await recordsService.createRecord({
        title: form.title.trim(),
        amount,
        type: form.type,
        category: form.category,
        date: form.date,
        description: form.description.trim() || undefined
      });

      toast.success(`${form.type === 'income' ? 'Income' : 'Expense'} record added successfully!`);

      // Reset form
      setForm(INITIAL_FORM);
      setIsOpen(false);

      // Notify parent
      onRecordAdded?.();

    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Failed to add record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setForm(prev => ({
      ...prev,
      type,
      category: '' // Reset category when type changes
    }));
  };

  const quickAmounts = form.type === 'income'
    ? [1000, 5000, 10000, 25000, 50000]
    : [500, 1000, 2500, 5000, 10000];

  return (
    <>
      {/* Trigger Button */}
      <PremiumButton
        size="md"
        icon={<Plus className="h-4 w-4" />}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        Quick Add
      </PremiumButton>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            >
              <PremiumCard className="border border-white/10 p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Quick Add Transaction</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type Toggle */}
                  <div className="flex rounded-lg bg-slate-800/50 p-1">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('income')}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        form.type === 'income'
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('expense')}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        form.type === 'expense'
                          ? 'bg-rose-500 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Expense
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Office supplies, Client payment"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Amount (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-9 pr-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, amount: amount.toString() }))}
                          className="rounded px-2 py-1 text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                        >
                          ₹{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Select category</option>
                      {availableCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Additional details..."
                      rows={2}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <PremiumButton
                      type="submit"
                      size="md"
                      disabled={isSubmitting}
                      className="flex-1"
                      icon={isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Record'}
                    </PremiumButton>
                  </div>
                </form>
              </PremiumCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}