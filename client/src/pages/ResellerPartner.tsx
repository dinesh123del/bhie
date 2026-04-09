import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, ArrowRight, CheckCircle2,
  Briefcase, LineChart, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ResellerPartner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-6">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-white text-center">Application Received!</h2>
        <p className="text-slate-400 max-w-md text-center">
          Our team will review your CA/Firm details and contact you within 24 hours to activate your Reseller Portal.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
            CA & ACCOUNTING FIRMS
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Partner with BIZ PLUS
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage dozens of client businesses from a single dashboard.
            Resell BIZ PLUS's deep intelligence, provide <strong>Official Audit Certifications</strong>, and earn 20% recurring commission.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/ca-portal')}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-2xl flex items-center gap-2 shadow-xl shadow-brand-500/20 transition-all hover:scale-105"
            >
              <ShieldCheck className="w-5 h-5" /> Launch Auditor Workspace
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('partnership-form');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all"
            >
              Apply for Partnership
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left Side: Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-10"
        >
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <IndianRupee size={120} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Revenue Potential</h3>
            <p className="text-slate-400 mb-8">Special pricing block for CA Partners</p>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-white">₹4,999</span>
              <span className="text-slate-500">/ month</span>
            </div>
            <p className="text-sm text-slate-400 mb-6 border-b border-slate-800 pb-6">
              Includes access for up to <strong>50 client businesses</strong>
            </p>

            <ul className="space-y-4">
              {[
                'Single sign-on for all client accounts',
                'Bulk automated GST reporting',
                'Custom white-labeled reports (Your Logo)',
                'Dedicated Account Manager'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                <LineChart size={20} />
              </div>
              <h4 className="text-white font-bold mb-2">20% Recurring</h4>
              <p className="text-sm text-slate-400">Earn lifetime commissions for every client that upgrades via your link.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-white font-bold mb-2">Priority Access</h4>
              <p className="text-sm text-slate-400">Jump the queue. Your clients get premium servers & priority OCR.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          id="partnership-form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <Briefcase className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Apply for Partnership</h3>
                <p className="text-sm text-slate-400">Takes 2 minutes</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Firm Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sharma & Associates CA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Your Name</label>
                  <input
                    required
                    type="text"
                    defaultValue={user?.name}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <input
                  required
                  type="email"
                  defaultValue={user?.email}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Estimated Clients</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none">
                  <option value="1-10">1 - 10 Businesses</option>
                  <option value="11-50">11 - 50 Businesses</option>
                  <option value="50-100">50 - 100 Businesses</option>
                  <option value="100+">100+ Businesses</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Application
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
