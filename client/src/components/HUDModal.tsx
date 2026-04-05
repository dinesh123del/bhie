import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, CheckCircle2, Calendar, FileText, IndianRupee } from 'lucide-react';

interface HUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const HUDModal = ({ isOpen, onClose, data }: HUDModalProps) => {
  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#151517] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 flex justify-between items-center bg-gray-50 border-b border-black/5 dark:bg-white/[0.02] dark:border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                  <Receipt className="w-6 h-6 text-brand-600 dark:text-brand-400" />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{data.title}</h2>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Record Details</p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 bg-gray-200/50 dark:bg-white/10 rounded-full hover:bg-gray-300/50 dark:hover:bg-white/20 text-gray-600 dark:text-white/60 transition-all">
               <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Amount Centered */}
            <div className="text-center mb-10">
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
               <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                 ₹{data.amount.toLocaleString()}
               </h1>
               <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-500/20 capitalize">
                 <CheckCircle2 className="w-4 h-4" />
                 {data.status.replace('_', ' ')}
               </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-brand-500/30 transition-colors">
                   <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                     <FileText className="w-4 h-4" />
                     <span className="text-sm font-medium">Category</span>
                   </div>
                   <p className="text-lg font-bold text-gray-900 dark:text-white">{data.category}</p>
                </div>
                <div className="p-5 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-brand-500/30 transition-colors">
                   <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                     <IndianRupee className="w-4 h-4" />
                     <span className="text-sm font-medium">Type</span>
                   </div>
                   <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{data.type}</p>
                </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</p>
               <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                 {data.description || 'No additional details provided for this record.'}
               </p>
            </div>
            
            {/* Footer Metadata */}
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center text-sm font-medium text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-2">
                   <Calendar className="w-4 h-4" />
                   {new Date(data.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute:'2-digit'
                   })}
                </div>
                <span>ID: {data._id.slice(-8)}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
