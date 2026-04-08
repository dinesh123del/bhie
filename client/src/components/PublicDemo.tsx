import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, CheckCircle, Sparkles, ArrowRight, Scan, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DemoResult {
  merchant: string;
  date: string;
  amount: string;
  category: string;
  confidence: number;
}

const DEMO_RECEIPTS = [
  { merchant: 'Starbucks', amount: '₹450', category: 'Food & Dining' },
  { merchant: 'Amazon', amount: '₹2,499', category: 'Shopping' },
  { merchant: 'Uber', amount: '₹180', category: 'Transport' },
  { merchant: 'Zomato', amount: '₹320', category: 'Food & Dining' },
];

export default function PublicDemo() {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [result, setResult] = useState<DemoResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      startProcessing();
    };
    reader.readAsDataURL(file);
  };

  const startProcessing = () => {
    setStep('processing');
    setScanProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          showResult();
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const showResult = () => {
    // Pick random demo result
    const random = DEMO_RECEIPTS[Math.floor(Math.random() * DEMO_RECEIPTS.length)];
    setResult({
      ...random,
      date: new Date().toLocaleDateString('en-IN'),
      confidence: Math.floor(Math.random() * 10 + 90),
    });
    setStep('result');
    toast.success('Receipt scanned successfully!');
  };

  const resetDemo = () => {
    setStep('upload');
    setSelectedImage('');
    setResult(null);
    setScanProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <Scan className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-2">
            Try AERA Free
          </h1>
          <p className="text-white/50">
            No signup required. See how fast we extract data from receipts.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-3xl p-12 text-center transition-colors bg-white/5">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-10 h-10 text-white/50" />
                  </div>
                  <p className="text-white font-bold text-lg mb-2">
                    Snap a receipt
                  </p>
                  <p className="text-white/40 text-sm mb-4">
                    or click to upload from gallery
                  </p>
                  <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
                    <span className="px-2 py-1 bg-white/10 rounded">JPG</span>
                    <span className="px-2 py-1 bg-white/10 rounded">PNG</span>
                    <span className="px-2 py-1 bg-white/10 rounded">PDF</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Demo Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '< 3s', label: 'Scan Time' },
                  { value: '98%', label: 'Accuracy' },
                  { value: '50K+', label: 'Receipts' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-xs text-white/40">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-white/30 text-xs">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> No credit card
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> No signup
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Free forever
                </span>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Receipt"
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Scanning Effect */}
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-lg shadow-blue-500/50"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning receipt...
                  </span>
                  <span className="text-white font-bold">{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <div className="flex gap-2 text-xs text-white/30">
                  <span className={scanProgress > 30 ? 'text-blue-400' : ''}>🔍 Detecting text</span>
                  <span>→</span>
                  <span className={scanProgress > 60 ? 'text-blue-400' : ''}>🧠 Extracting data</span>
                  <span>→</span>
                  <span className={scanProgress > 90 ? 'text-blue-400' : ''}>✓ Verifying</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Success Animation */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
                <p className="text-green-400 font-bold mb-1">Extracted Successfully!</p>
                <p className="text-white/50 text-sm">
                  Confidence: {result.confidence}%
                </p>
              </div>

              {/* Results Card */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-white/50 text-sm">Merchant</span>
                  <span className="text-white font-bold text-lg">{result.merchant}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-white/50 text-sm">Amount</span>
                  <span className="text-white font-bold text-2xl text-green-400">{result.amount}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-white/50 text-sm">Date</span>
                  <span className="text-white">{result.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">Category</span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                    {result.category}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <a
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Full Access - It's Free
                </a>
                <button
                  onClick={resetDemo}
                  className="flex items-center justify-center gap-2 w-full bg-white/5 text-white py-4 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Scan Another Receipt
                </button>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  'Unlimited scans',
                  'Auto-categorization',
                  'Expense reports',
                  'Tax insights',
                ].map((feature) => (
                  <div key={feature} className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/70 text-sm">{feature}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
