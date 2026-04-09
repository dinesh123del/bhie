import { ChangeEvent, DragEvent, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Archive,
  Camera,
  FileImage,
  FileText,
  FileType2,
  Loader2,
  Zap,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { uploadService, UploadedImageRecord } from '../services/uploadService';
import { canUploadMore, getRemainingUploads, hasPremiumAccess } from '../utils/plan';
import { premiumFeedback } from '../utils/premiumFeedback';
import { PremiumCard, PremiumBadge } from './ui/PremiumComponents';
import { GlassShine, Scanlines } from './ui/MicroEngines';
import { useGamification } from './GamificationEngine';
import FirstScanCelebration, { useScanCelebration } from './FirstScanCelebration';
import SocialShare from './SocialShare';

import { CameraCapture } from './image-intelligence/CameraCapture';



export const FileUpload = ({ onUploadComplete }: { onUploadComplete?: (data: UploadedImageRecord[]) => void }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [latestResults, setLatestResults] = useState<UploadedImageRecord[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [shareData, setShareData] = useState({
    type: 'milestone' as const,
    title: 'Receipt Scanned',
    value: '',
    subtitle: '',
    date: new Date().toLocaleDateString('en-IN'),
  });
  const { user } = useAuth();
  const { addXP } = useGamification();
  const { showCelebration, scanCount, triggerCelebration, closeCelebration } = useScanCelebration();
  const premiumAccess = hasPremiumAccess(user);
  const remainingUploads = getRemainingUploads(user);
  const uploadsLocked = !canUploadMore(user);

  const totalSize = useMemo(
    () => previewFiles.reduce((sum, file) => sum + file.size, 0),
    [previewFiles]
  );

  const processFiles = useCallback(async (files: File[]) => {
    try {
      if (uploadsLocked) {
        premiumFeedback.error();
        toast.error('Free upload limit reached. Upgrade to Pro for unlimited uploads.');
        return;
      }

      setUploading(true);
      setProcessingStep('Neural Sync Initializing...');

      // ELITE PERFORMANCE: High-speed artificial delay for "working" feel (1.2s total)
      await new Promise(r => setTimeout(r, 600));
      setProcessingStep('Forensic Artifact Extraction...');

      const response = await uploadService.uploadFiles(files);

      setProcessingStep('Engine Synthesis Complete.');
      await new Promise(r => setTimeout(r, 400));

      if (!response.items.length) {
        throw new Error('Upload did not return saved data');
      }

      setLatestResults(response.items);
      addXP(response.items.length * 100);
      premiumFeedback.success();
      toast.success(`${response.items.length} records processed`);

      // Trigger celebration for milestones (1, 10, 50, 100)
      const totalScans = (parseInt(localStorage.getItem('aera_scan_count') || '0') || 0) + response.items.length;
      localStorage.setItem('aera_scan_count', String(totalScans));

      if ([1, 10, 50, 100].includes(totalScans)) {
        triggerCelebration(totalScans);
      }

      // Prepare social share data
      const totalAmount = response.items.reduce((sum, item) => sum + (item.record?.amount || item.extracted?.amount || 0), 0);
      setShareData({
        type: 'milestone',
        title: totalScans === 1 ? 'First Receipt Scanned!' : `${totalScans} Receipts Scanned`,
        value: totalAmount > 0 ? `₹${totalAmount.toLocaleString()}` : `${response.items.length} items`,
        subtitle: 'Tracked with BIZ PLUS',
        date: new Date().toLocaleDateString('en-IN'),
      });

      // Show social share for first scan or every 25 scans
      if (totalScans === 1 || totalScans % 25 === 0) {
        setTimeout(() => setShowSocialShare(true), 2000);
      }

      window.dispatchEvent(
        new CustomEvent('aera:records-updated', {
          detail: response.items,
        })
      );

      onUploadComplete?.(response.items);
    } catch (error: any) {
      premiumFeedback.error();
      toast.error(error?.response?.data?.message || 'Engine failure during synthesis');
    } finally {
      setUploading(false);
      setProcessingStep('');
      setPreviewFiles([]);
    }
  }, [onUploadComplete, uploadsLocked, addXP]);

  const handleDrag = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
      return;
    }

    if (event.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(event.dataTransfer.files ?? []);

    if (droppedFiles.length === 0) {
      return;
    }

    if (uploadsLocked) {
      premiumFeedback.error();
      toast.error('Free upload limit reached. Upgrade to Pro for unlimited uploads.');
      return;
    }

    if (droppedFiles.some((file) => file.size > 10 * 1024 * 1024)) {
      premiumFeedback.error();
      toast.error('File too large (max 10MB each)');
      return;
    }

    premiumFeedback.click();
    setPreviewFiles(droppedFiles);
    void processFiles(droppedFiles);
  }, [processFiles, uploadsLocked]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    if (uploadsLocked) {
      toast.error('Free upload limit reached. Upgrade to Pro for unlimited uploads.');
      return;
    }

    if (selectedFiles.some((file) => file.size > 10 * 1024 * 1024)) {
      premiumFeedback.error();
      toast.error('File too large (max 10MB each)');
      return;
    }

    premiumFeedback.click();
    setPreviewFiles(selectedFiles);
    void processFiles(selectedFiles);
  }, [processFiles, uploadsLocked]);

  if (!user) {
    return null;
  }

  return (
    <motion.section
      className={`glass-panel relative overflow-hidden rounded-[2rem] border transition-colors duration-500 ${dragActive ? 'border-sky-300/28 shadow-brand-glow' : 'border-white/10'
        }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onMouseEnter={() => premiumFeedback.haptic(5)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(file) => {
          setPreviewFiles([file]);
          void processFiles([file]);
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(125,211,252,0.1),transparent_24%)]" />

      <input
        id="file-upload"
        type="file"
        className="absolute inset-0 z-[3] h-full w-full cursor-pointer opacity-0"
        accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.doc,.docx,.zip"
        multiple
        onChange={handleChange}
        disabled={uploading || uploadsLocked}
      />

      <div className="relative z-[2] flex h-full flex-col gap-8 p-8 md:p-10">
        <div className="flex flex-col gap-8">
          <div className="space-y-6">
            <div className="section-kicker">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              Intelligence Engine
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-white md:text-4xl lg:text-5xl">Direct Intelligence Capture.</h3>
              <p className="max-w-xl text-base md:text-lg font-medium leading-relaxed text-ink-300">
                Snap any document for instant processing. BIZ PLUS extracts identity, fiscal data, and taxonomy automatically.
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* PRIMARY: SNAP RECEIPT (The Big One) */}
            <motion.div
              onClick={() => setShowCamera(true)}
              className="relative group overflow-hidden rounded-[2.5rem] border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-transparent to-indigo-500/5 p-8 cursor-pointer hover:border-sky-400/40 hover:-translate-y-1 transition-all duration-300 shadow-2xl z-[10]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-sky-500/20 transition-all" />

              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-[0_15px_30px_-5px_rgba(14,165,233,0.4)] group-hover:rotate-6 transition-transform">
                  <Camera className="w-8 h-8" strokeWidth={2.5} />
                </div>

                <div>
                  <h4 className="text-2xl font-black text-white tracking-tight">Snap Receipt</h4>
                  <p className="text-sm text-white/40 font-medium mt-2">Instant camera telemetry & scanning</p>
                  <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest group-hover:bg-sky-400 group-hover:text-white transition-all">
                    Initialize Scan
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SECONDARY: UPLOAD/DRAG (The Small One) */}
            <div className="flex flex-col gap-6">
              <PremiumCard className="p-8 bg-white/[0.02] border-white/5 flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-ink-400">Memory Capacity</div>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest border border-white/10">Standard Node</span>
                </div>
                <div className="text-2xl font-black text-white">10MB <span className="text-sm text-white/20">per artifact</span></div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-300">
                  {premiumAccess ? 'Unlimited uploads active' : `${remainingUploads} free uploads remaining`}
                </p>
              </PremiumCard>

              <div
                className="group relative rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center hover:bg-white/[0.04] transition-all cursor-pointer"
                onClick={() => document.getElementById('file-upload-small')?.click()}
              >
                <input
                  id="file-upload-small"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,.doc,.docx,.zip"
                  multiple
                  onChange={handleChange}
                />
                <div className="flex items-center gap-4 justify-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white/80 transition-all">
                    <Archive className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h5 className="text-sm font-black text-white uppercase tracking-wider">Drag or Browse</h5>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">Legacy File Upload</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="relative rounded-[2.5rem] border border-sky-400/20 bg-sky-400/5 px-6 py-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 via-transparent to-indigo-500/5" />
            <motion.div
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-5"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-white/10 bg-white/[0.06]">
                <Loader2 className="h-9 w-9 animate-spin text-sky-300" />
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-black tracking-[-0.05em] text-white uppercase italic">Synthesizing...</h4>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-sky-400 text-sm font-bold uppercase tracking-[0.2em]">
                    <Zap className="w-4 h-4 fill-current" />
                    {processingStep}
                  </div>
                  <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-gradient"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {previewFiles.length > 0 && !uploading && (
          <div className="w-full space-y-3 rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/20 mb-4">Queued for Synthesis</h4>
            {previewFiles.map((file) => (
              <div key={`${file.name}-${file.size}`} className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]">
                  {renderFileIcon(file.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-400">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: 'Reading', value: uploading ? 'Reading files...' : 'Ready' },
            { label: 'Saving', value: uploading ? 'Creating entries...' : 'Auto-save on' },
            {
              label: 'Total Size',
              value: previewFiles.length > 0 ? `${(totalSize / 1024 / 1024).toFixed(1)} MB` : '0 MB',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {latestResults.length > 0 ? (
          <div className="grid gap-6">
            {latestResults.map((result, index) => {
              const fileLabel = result.file?.originalName || result.record.title;
              const fileType = result.file?.fileType || 'image';
              const fileArchive = result.file?.archiveName;
              const isUnclear = result.extracted.isUnclear;
              const integrityScore = result.extracted.integrityScore ?? 100;
              const missingFields = result.extracted.missingFields || [];

              return (
                <motion.div
                  key={`${fileLabel}-${result.record.id}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl transition-colors duration-300 ${isUnclear ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/10 bg-white/[0.04]'
                    }`}
                >
                  <Scanlines />
                  <GlassShine />

                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] shadow-2xl">
                      {renderResultIcon(fileType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="truncate text-lg font-black text-white tracking-tight">{fileLabel}</p>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
                            {fileType} Artifact {fileArchive ? ` • ARCHIVE: ${fileArchive}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Integrity Score</span>
                            <span className={`text-sm font-black italic ${integrityScore < 60 ? 'text-rose-400' : integrityScore < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {integrityScore}%
                            </span>
                          </div>
                          <PremiumBadge tone={isUnclear ? 'warning' : 'positive'}>
                            {isUnclear ? 'Structural Entropy' : 'Synchronized'}
                          </PremiumBadge>
                        </div>
                      </div>

                      {/* Missing Details Guidance */}
                      {isUnclear && missingFields.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-5 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4"
                        >
                          <div className="flex items-center gap-2 mb-3 text-amber-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Incomplete Extraction Guide</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-amber-200/70 leading-relaxed italic">
                              Scanning engine detected visual noise in the photo. Minimum artifact threshold not met for:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {missingFields.map(f => (
                                <span key={f} className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-[9px] font-bold text-amber-300 uppercase tracking-tighter">
                                  {f}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 text-[10px] text-white/40 font-medium">
                              Note: You can proceed with fragmented data and correct manually in "Records".
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Metric label="Amount" value={formatCurrency(result.record.amount)} />
                        <Metric label="Type" value={result.record.type} capitalize />
                        <Metric label="Category" value={result.record.category} capitalize />
                        <Metric label="Status" value={isUnclear ? 'Awaiting Correction' : 'Verified'} />
                      </div>

                      {/* MERCHANT & GST INTELLIGENCE */}
                      <div className="mt-6 border-t border-white/5 pt-5">
                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                          <Archive className="w-3 h-3" />
                          Business Identity Intelligence
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-ink-400">Merchant Name</p>
                            <p className="text-sm font-bold text-white italic">
                              {result.extracted.businessName || 'Fragmented Data'}
                            </p>
                          </div>
                          {result.extracted.gstNumber && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] uppercase tracking-widest text-ink-400">GST Registration</p>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[8px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-tighter">Verified</span>
                              </div>
                              <p className="text-sm font-bold text-sky-400 font-mono tracking-wider italic">
                                {result.extracted.gstNumber}
                              </p>
                            </div>
                          )}
                        </div>

                        {result.extracted.gstDetails && result.extracted.gstDetails.legalName && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-5 rounded-2xl bg-white/[0.03] border border-white/5 p-4 overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-[9px] uppercase tracking-widest text-ink-400">Legal Entity</p>
                                <p className="text-xs font-bold text-white/80">{result.extracted.gstDetails.legalName}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] uppercase tracking-widest text-ink-400">Entity Type</p>
                                <p className="text-xs font-bold text-white/80">{result.extracted.gstDetails.taxpayerType || 'Professional'}</p>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <p className="text-[9px] uppercase tracking-widest text-ink-400">Registered Address</p>
                                <p className="text-xs font-medium text-white/50 leading-relaxed truncate">{result.extracted.gstDetails.address || 'Confidential Registry'}</p>
                              </div>
                            </div>
                            <div className="mt-3 text-[9px] text-sky-400/60 font-bold italic uppercase tracking-widest">
                              Forensic GSTR-1 Mapping Complete
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="mt-6 flex gap-2">
                        <PremiumBadge tone="brand" icon={<Activity className="w-3 h-3" />}>
                          Engine Synthesis v2.5 (GST Core)
                        </PremiumBadge>
                        {isUnclear && (
                          <button className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/60 hover:bg-white/10 transition-all uppercase tracking-widest">
                            Force Synchronize
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* First Scan Celebration */}
      <FirstScanCelebration
        isOpen={showCelebration}
        onClose={closeCelebration}
        scanCount={scanCount}
      />

      {/* Social Share Modal */}
      <SocialShare
        isOpen={showSocialShare}
        onClose={() => setShowSocialShare(false)}
        data={shareData}
      />
    </motion.section>
  );
};

function Metric({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-ink-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold text-white ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  );
}

function renderFileIcon(fileName: string) {
  const lower = fileName.toLowerCase();

  if (/\.(png|jpe?g|webp|gif|bmp|tiff?|heic)$/.test(lower)) {
    return <FileImage className="h-5 w-5 text-sky-300" />;
  }

  if (/\.pdf$/.test(lower)) {
    return <FileText className="h-5 w-5 text-rose-300" />;
  }

  if (/\.(doc|docx)$/.test(lower)) {
    return <FileType2 className="h-5 w-5 text-indigo-300" />;
  }

  if (/\.zip$/.test(lower)) {
    return <Archive className="h-5 w-5 text-amber-300" />;
  }

  return <FileText className="h-5 w-5 text-sky-300" />;
}

function renderResultIcon(fileType: string) {
  switch (fileType) {
    case 'image':
      return <FileImage className="h-5 w-5 text-sky-300" />;
    case 'pdf':
      return <FileText className="h-5 w-5 text-rose-300" />;
    case 'docx':
      return <FileType2 className="h-5 w-5 text-indigo-300" />;
    case 'zip':
      return <Archive className="h-5 w-5 text-amber-300" />;
    default:
      return <FileText className="h-5 w-5 text-sky-300" />;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export default FileUpload;
