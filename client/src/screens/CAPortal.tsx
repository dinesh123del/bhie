"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, FileCheck, ClipboardList, 
  Users, Search, Filter, CheckCircle2, 
  AlertCircle, Download, ExternalLink,
  MessageSquare, Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { PremiumCard, PremiumButton, PremiumBadge } from '../components/ui/PremiumComponents';
import { PageTransition, StaggerList } from '../components/ui/MicroInteractions';
import { formatCurrency } from '../utils/dashboardIntelligence';
import toast from 'react-hot-toast';

const CAPortal = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    // In a real implementation, this would fetch assigned clients
    // For now, we fetch all users as mock clients
    const fetchClients = async () => {
      try {
        const response = await api.get('/admin/users');
        setClients(response.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const viewClientRecords = async (clientId: string) => {
    setLoading(true);
    setSelectedClient(clientId);
    try {
      // Mock fetching records for a specific user
      // Note: In real app, we need a specific CA-endpoint for this
      const response = await api.get(`/records?userId=${clientId}`);
      setRecords(response.data.records || []);
    } catch (err) {
      toast.error("Failed to load client records");
    } finally {
      setLoading(false);
    }
  };

  const certifyRecord = async (recordId: string) => {
    try {
      // Future API call: PATCH /ca/certify/:id
      toast.success("Record certified successfully! Verified by CA.");
      setRecords(records.map(r => r._id === recordId ? { ...r, isCertified: true } : r));
    } catch (err) {
      toast.error("Certification failed");
    }
  };

  return (
    <PageTransition>
      <div className="bg-mesh min-h-screen pb-20 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto space-y-10 pt-10">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.03] dark:border-white/5">
            <div className="space-y-1">
              <PremiumBadge variant="info" icon={<ShieldCheck className="w-3 h-3" />}>PROFESSIONAL AUDITOR PORTAL</PremiumBadge>
              <h1 className="text-4xl font-black tracking-tight text-black dark:text-white">
                Chartered Accountant <span className="text-brand-500">Workspace.</span>
              </h1>
              <p className="text-black/40 dark:text-white/40 font-medium text-sm">
                Analyze client data, certify records, and prepare compliance filings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PremiumButton variant="secondary" icon={<Briefcase className="w-4 h-4" />}>
                Firm Settings
              </PremiumButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* CLIENT LIST */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Active Clients</h3>
                <Search className="w-4 h-4 text-black/20" />
              </div>
              <StaggerList className="space-y-3">
                {clients.map(client => (
                  <div key={client._id} onClick={() => viewClientRecords(client._id)}>
                    <PremiumCard 
                      padded={false}
                      className={`cursor-pointer transition-all ${selectedClient === client._id ? 'border-brand-500 bg-brand-500/5' : 'hover:border-brand-500/30'}`}
                    >
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center font-bold text-brand-600">
                          {client.name[0]}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-black dark:text-white truncate">{client.name}</p>
                          <p className="text-[10px] text-black/40 dark:text-white/40 truncate">{client.email}</p>
                        </div>
                        {client.isCertified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                    </PremiumCard>
                  </div>
                ))}
              </StaggerList>
            </div>

            {/* AUDIT WORKSPACE */}
            <div className="lg:col-span-3 space-y-6">
              {selectedClient ? (
                <div className="space-y-6">
                  <PremiumCard gradient className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-white">
                          <Users className="w-8 h-8" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-white tracking-tight">Client Review: {clients.find(c => c._id === selectedClient)?.name}</h2>
                          <div className="flex gap-2 mt-1">
                            <PremiumBadge variant="success">Account Active</PremiumBadge>
                            <PremiumBadge variant="info">Audit Pending</PremiumBadge>
                          </div>
                        </div>
                      </div>
                      <PremiumButton variant="primary" className="bg-white text-brand-600 border-none" icon={<Download className="w-4 h-4" />}>
                        Generate Audit Report
                      </PremiumButton>
                    </div>
                  </PremiumCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PremiumCard className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black/30 dark:text-white/30 uppercase tracking-widest">Total Records</p>
                        <p className="text-2xl font-black text-black dark:text-white">{records.length}</p>
                      </div>
                    </PremiumCard>
                    <PremiumCard className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black/30 dark:text-white/30 uppercase tracking-widest">Certified Records</p>
                        <p className="text-2xl font-black text-black dark:text-white">{records.filter(r => r.isCertified).length}</p>
                      </div>
                    </PremiumCard>
                  </div>

                  <div className="bg-white/50 dark:bg-black/20 rounded-3xl border border-black/[0.03] dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-black/[0.03] dark:border-white/5 flex justify-between items-center">
                      <h3 className="font-black text-black dark:text-white">Audit History</h3>
                      <Filter className="w-4 h-4 text-black/20" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] uppercase font-black tracking-widest text-black/40 dark:text-white/40">
                          <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.02] dark:divide-white/[0.02]">
                          {records.map(record => (
                            <tr key={record._id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-black dark:text-white">{record.title}</div>
                                <div className="text-[10px] text-black/40 dark:text-white/40">{new Date(record.date).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 font-black text-black dark:text-white">{formatCurrency(record.amount)}</td>
                              <td className="px-6 py-4">
                                <PremiumBadge variant="info">{record.category}</PremiumBadge>
                              </td>
                              <td className="px-6 py-4">
                                {record.isCertified ? (
                                  <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                                    <AlertCircle className="w-3.5 h-3.5" /> Pending
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {!record.isCertified ? (
                                  <PremiumButton size="sm" variant="primary" onClick={() => certifyRecord(record._id)}>
                                    Certify
                                  </PremiumButton>
                                ) : (
                                  <PremiumButton size="sm" variant="ghost">
                                    <ExternalLink className="w-4 h-4" />
                                  </PremiumButton>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-[32px] bg-brand-500/5 flex items-center justify-center text-brand-500/20">
                    <Users className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-black dark:text-white tracking-tight">Select a Client Profile</h2>
                    <p className="text-black/40 dark:text-white/40 max-w-sm font-medium">
                      Select a client from the left panel to begin auditing their records and certifying their data.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CAPortal;
