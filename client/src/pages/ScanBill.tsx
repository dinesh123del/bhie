import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Scan, Check, AlertCircle, IndianRupee, Calendar, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import { api } from '../services/api';
import { recordsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ScanBill = () => {
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
        title: `Receipt - ${data.date}`,
        amount: data.totalAmount,
        type: 'expense',
        category: 'bill',
        date: data.date,
        description: `Items: ${data.items.join(', ')}`
      });
      toast.success('Saved successfully');
      navigate('/records');
    } catch (err) {
      toast.error('Failed to save transaction');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 pt-28">
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
              <PremiumCard className="p-6 space-y-6 border-indigo-500/30">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Detected Details</h2>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Ready to save</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                    <div className="flex items-center gap-3 text-gray-400">
                      <IndianRupee className="w-4 h-4" /> Total Amount
                    </div>
                    <span className="text-xl font-bold text-white">₹{data.totalAmount}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                    <div className="flex items-center gap-3 text-gray-400">
                      <Calendar className="w-4 h-4" /> Date
                    </div>
                    <span className="text-white font-medium">{data.date}</span>
                  </div>

                  <div className="p-3 bg-white/[0.03] rounded-xl space-y-2">
                    <div className="flex items-center gap-3 text-gray-400 mb-2">
                      <List className="w-4 h-4" /> Items Found
                    </div>
                    {data.items.length > 0 ? (
                      <ul className="text-sm text-gray-300 pl-7 list-disc">
                        {data.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 pl-7">No individual items identified</p>
                    )}
                  </div>
                </div>

                <PremiumButton className="w-full" variant="primary" onClick={handleSave}>
                  Save Transaction
                </PremiumButton>
              </PremiumCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanBill;
