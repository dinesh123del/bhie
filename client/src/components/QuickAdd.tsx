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
      setIsOpen(false);

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
                  <h3 className="text-xl font-semibold text-white">Add New Record</h3>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      premiumFeedback.click();
                    }}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type Toggle */}
                  <div className="flex rounded-xl bg-slate-800/40 p-1.5 border border-white/5 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('income')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold tracking-tight transition-all duration-300 ${
                        form.type === 'income'
                          ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('expense')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold tracking-tight transition-all duration-300 ${
                        form.type === 'expense'
                          ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 rotate-180" />
                      Expense
                    </button>
                  </div>

                  {/* Row 1: Title & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        <FileText className="w-3 h-3 text-sky-400" /> Title
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Office Rent"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                       <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        <Tag className="w-3 h-3 text-indigo-400" /> Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-[#0f172a]">Select</option>
                        {availableCategories.map((category) => (
                          <option key={category} value={category} className="bg-[#0f172a]">
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Amount & Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        <IndianRupee className="w-3 h-3 text-emerald-400" /> Amount
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-lg font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        <Calendar className="w-3 h-3 text-amber-400" /> Date
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Amounts - Redesigned */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, amount: amount.toString() }));
                            premiumFeedback.click();
                          }}
                          className="rounded-lg px-3 py-1.5 text-[10px] font-black tracking-widest uppercase border border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          ₹{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      <Plus className="w-3 h-3 text-purple-400" /> Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional notes or merchant info..."
                      rows={2}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all resize-none text-sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        premiumFeedback.click();
                      }}
                      className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-95"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <PremiumButton
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="flex-[1.5] shadow-[0_20px_40px_-10px_rgba(56,189,248,0.3)]"
                      icon={isSubmitting ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    >
                      {isSubmitting ? 'Processing...' : 'Save Record'}
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