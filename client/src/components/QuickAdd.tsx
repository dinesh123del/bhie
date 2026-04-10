import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, IndianRupee, Calendar, Tag, FileText, Save, Loader, ArrowUpRight, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { recordsService } from '../services/recordsService';
import { PremiumButton, PremiumCard } from './ui/PremiumComponents';
import { premiumFeedback } from '../utils/premiumFeedback';

interface QuickAddProps {
  onRecordAdded?: () => void;
  className?: string;
  externalOpen?: boolean;
  onExternalClose?: () => void;
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

export default function QuickAdd({ onRecordAdded, className = '', externalOpen, onExternalClose }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<TransactionForm>(INITIAL_FORM);

  const effectiveOpen = externalOpen !== undefined ? externalOpen : isOpen;
  const setOpen = (val: boolean) => {
    if (externalOpen !== undefined) {
      if (!val && onExternalClose) onExternalClose();
    } else {
      setIsOpen(val);
    }
  };

  const availableCategories = CATEGORIES[form.type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.amount || !form.category) {
      toast.error('Please fill in all required fields');
      premiumFeedback.error();
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      premiumFeedback.error();
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
      premiumFeedback.success();

      // Reset form
      setForm(INITIAL_FORM);
      setOpen(false);

      // Notify parent
      onRecordAdded?.();

    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Failed to add record. Please try again.');
      premiumFeedback.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    premiumFeedback.click();
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
        onClick={() => {
          setIsOpen(true);
          premiumFeedback.click();
        }}
        className={className}
      >
        Quick Add
      </PremiumButton>

      {/* Modal */}
      <AnimatePresence>
        {effectiveOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[100] bg-transparent/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="w-full max-w-lg pointer-events-auto"
              >
                <div className="relative overflow-hidden rounded-[3.5rem] p-px bg-gradient-to-b from-white/20 to-transparent dark:from-white/10 dark:to-transparent shadow-2xl">
                  <div className="relative bg-white dark:bg-[#0D0D0E] rounded-[3.45rem] p-10 flex flex-col gap-8 shadow-inner backdrop-blur-3xl">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                            Add Record
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-brand-500/10 text-brand-500 border border-brand-500/20">Sync Active</span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-[#C0C0C0] font-semibold tracking-tight">Entry will be processed by the financial engines.</p>
                      </div>
                      <button
                        onClick={() => {
                          setOpen(false);
                          premiumFeedback.click();
                        }}
                        className="rounded-2xl p-2.5 text-[#C0C0C0] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Type Toggle */}
                      <div className="flex rounded-2xl bg-gray-100 dark:bg-white/5 p-1.5 border border-black/5 dark:border-white/5 backdrop-blur-xl">
                        <button
                          type="button"
                          onClick={() => handleTypeChange('income')}
                          className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                            form.type === 'income'
                              ? 'bg-white dark:bg-white/15 text-emerald-600 dark:text-emerald-400 shadow-xl scale-105'
                              : 'text-gray-500 hover:text-gray-800 dark:text-[#C0C0C0] dark:hover:text-white'
                          }`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          Income
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTypeChange('expense')}
                          className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                            form.type === 'expense'
                              ? 'bg-white dark:bg-white/15 text-rose-600 dark:text-rose-400 shadow-xl scale-105'
                              : 'text-gray-500 hover:text-gray-800 dark:text-[#C0C0C0] dark:hover:text-white'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4 rotate-180" />
                          Expense
                        </button>
                      </div>

                      {/* Big Amount Section */}
                      <div className="space-y-4">
                        <label className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-[#C0C0C0] ml-1">
                          Calculated Amount
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                             <span className="text-3xl font-black text-[#C0C0C0] dark:text-gray-600">₹</span>
                          </div>
                          <input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full rounded-3xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] pl-16 pr-8 py-8 text-6xl font-black text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-800 focus:border-brand-500/50 focus:ring-8 focus:ring-brand-500/5 focus:outline-none transition-all text-right tracking-tighter tabular-nums shadow-inner"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Row 1: Title */}
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-[#C0C0C0] ml-1">
                          Transaction Identifer
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="What was this for? (e.g. Rent, SaaS, Client Payment)"
                          className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-6 py-4.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 focus:outline-none transition-all font-semibold"
                          required
                        />
                      </div>

                      {/* Row 2: Category & Date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <label className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-[#C0C0C0] ml-1">
                            Classification
                          </label>
                          <div className="relative">
                            <select
                              value={form.category}
                              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-6 py-4.5 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 focus:outline-none transition-all appearance-none cursor-pointer font-semibold"
                              required
                            >
                              <option value="" className="bg-white dark:bg-[#0D0D0E]">Select Tag</option>
                              {availableCategories.map((category) => (
                                <option key={category} value={category} className="bg-white dark:bg-[#0D0D0E]">
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-[#C0C0C0] ml-1">
                            Date of Record
                          </label>
                          <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-6 py-4.5 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 focus:outline-none transition-all cursor-pointer font-semibold color-scheme-dark"
                          />
                        </div>
                      </div>

                      {/* Quick Amounts */}
                      <div className="flex flex-wrap gap-2.5">
                        {quickAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => {
                              setForm(prev => ({ ...prev, amount: amount.toString() }));
                              premiumFeedback.click();
                            }}
                            className="rounded-xl px-4 py-2 text-[10px] font-black tracking-widest uppercase border border-black/5 dark:border-white/5 bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-brand-500 hover:bg-brand-500/10 hover:border-brand-500/30 transition-all duration-300"
                          >
                            ₹{amount.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      {/* Description */}
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-[#C0C0C0] ml-1">
                          Extended Notes
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional merchant info, service details, or internal memos..."
                          rows={2}
                          className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-6 py-4.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 focus:outline-none transition-all resize-none text-sm font-medium"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            premiumFeedback.click();
                          }}
                          className="flex-1 rounded-2xl border border-black/5 dark:border-white/5 bg-gray-100 dark:bg-white/5 px-6 py-4.5 text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <PremiumButton
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="flex-[1.5] shadow-2xl shadow-brand-500/20"
                          icon={isSubmitting ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        >
                          {isSubmitting ? 'Processing...' : 'Authorize Entry'}
                        </PremiumButton>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
          </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}