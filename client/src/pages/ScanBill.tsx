import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Scan, Check, AlertCircle, IndianRupee, Calendar, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import { api } from '../services/api';
import { recordsAPI } from '../services/api';
import toast from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';

const ScanBill = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setData(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    if (!user?.hasPremiumAccess && (user?.usageCount || 0) >= 5) {
      toast('Free tier limit reached (5 scans). Please upgrade to Pro.', { icon: '🔒' });
      navigate('/payments');
      // Dispatch an event to open upgrade modal if you want
      // window.dispatchEvent(new Event('limitReached'));
      return;
    }

    setScanning(true);
    const formData = new FormData();
    formData.append('bill', file);

    try {
      const res = await api.post('/ai/scan-bill', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(res.data.data);
      toast.success('Details detected successfully');
    } catch (err) {
      toast.error('Failed to scan receipt');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    try {
      await recordsAPI.create({
        title: data.businessName || `Receipt - ${data.date}`,
        amount: data.totalAmount,
        type: 'expense',
        category: 'bill',
        date: data.date,
        description: `Items: ${data.items.join(', ')}`,
        gstNumber: data.gstNumber,
        gstDetails: data.gstDetails
      });
      toast.success('Saved successfully');
      navigate('/records');
    } catch (err) {
      toast.error('Failed to save transaction');
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-8 pt-28">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Scan className="text-indigo-400" /> Receipt Scanner
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <PremiumCard className="p-6 space-y-6">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/[0.02]">
              {preview ? (
                <img src={preview} alt="Receipt Preview" className="max-h-64 mx-auto rounded-lg mb-4" />
              ) : (
                <div className="py-12">
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Upload an image of your receipt</p>
                </div>
              )}
              <input type="file" id="bill-upload" className="hidden" onChange={onFileChange} accept="image/*" />
              <label htmlFor="bill-upload" className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-medium">
                {preview ? 'Change Image' : 'Select Image'}
              </label>
            </div>

            <PremiumButton
              className="w-full"
              onClick={handleScan}
              disabled={!file || scanning}
              loading={scanning}
            >
              {scanning ? 'Reading receipt...' : 'Scan Receipt Now'}
            </PremiumButton>
          </PremiumCard>

          {/* Result Section */}
          {data && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <PremiumCard className="p-6 space-y-6 border-indigo-500/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Scan className="w-24 h-24 text-sky-400 rotate-12" />
                </div>

                <div className="flex justify-between items-center relative z-10">
                  <h2 className="text-xl font-black text-white italic tracking-tight">Receipt Details</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${data.isUnclear ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'}`}>
                      {data.integrityScore}% Accuracy
                    </span>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  {/* MERCHANT IDENTITY BLOCK */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Store Name</div>
                      {data.gstNumber && (
                        <div className="flex items-center gap-1 text-[9px] font-black text-sky-400 uppercase tracking-widest">
                          <Check className="w-3 h-3" /> Verified GST
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-black text-white tracking-tight">{data.businessName || 'Unknown Store'}</p>
                      {data.gstNumber && <p className="text-[11px] font-mono font-bold text-sky-400/60 mt-1 uppercase tracking-wider">{data.gstNumber}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Amount</div>
                      <span className="text-lg font-black text-white">₹{data.totalAmount}</span>
                    </div>

                    <div className="flex flex-col gap-1 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Date</div>
                      <span className="text-sm font-bold text-white/80">{data.date}</span>
                    </div>
                  </div>

                  {/* GST DETAILS RECOVERY */}
                  {data.gstDetails && data.gstDetails.legalName && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/10"
                    >
                      <div className="text-[9px] font-black uppercase tracking-widest text-sky-400/60 mb-2">Tax Details</div>
                      <p className="text-xs font-bold text-white/70 italic truncate">{data.gstDetails.legalName}</p>
                      <p className="text-[10px] font-medium text-white/30 mt-1 truncate">{data.gstDetails.address || 'Confidential Address'}</p>
                    </motion.div>
                  )}

                  <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                      <List className="w-3 h-3" /> List of Items ({data.items.length})
                    </div>
                    {data.items.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.items.map((item: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white/60">
                            {item.substring(0, 30)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-500 italic">No items found</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <PremiumButton className="w-full" variant="primary" onClick={handleSave}>
                    Save to Records
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanBill;
