import { ChangeEvent, DragEvent, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Archive,
  FileImage,
  FileText,
  FileType2,
  Loader2,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { uploadService, UploadedImageRecord } from '../services/uploadService';
import { canUploadMore, getRemainingUploads, hasPremiumAccess } from '../utils/plan';
import { premiumFeedback } from '../utils/premiumFeedback';

const acceptedFormats = ['JPG', 'PNG', 'WEBP', 'HEIC', 'PDF', 'DOCX', 'ZIP'];

export const FileUpload = ({ onUploadComplete }: { onUploadComplete?: (data: UploadedImageRecord[]) => void }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [latestResults, setLatestResults] = useState<UploadedImageRecord[]>([]);
  const { user } = useAuth();
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
      const response = await uploadService.uploadFiles(files);

      if (!response.items.length) {
        throw new Error('Upload did not return saved data');
      }

      setLatestResults(response.items);
      premiumFeedback.success();
      toast.success(`${response.items.length} file(s) processed and saved`);

      window.dispatchEvent(
        new CustomEvent('bhie:records-updated', {
          detail: response.items,
        })
      );

      onUploadComplete?.(response.items);
    } catch (error: any) {
      premiumFeedback.error();
      toast.error(error?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setPreviewFiles([]);
    }
  }, [onUploadComplete, uploadsLocked]);

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
      className={`glass-panel relative overflow-hidden rounded-[2rem] border transition-all duration-500 ${
        dragActive ? 'border-sky-300/28 shadow-brand-glow' : 'border-white/10'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onMouseEnter={() => premiumFeedback.haptic(5)}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
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

      <div className="relative z-[2] flex h-full flex-col gap-6 p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="section-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              Scan Files
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl">Upload Bills & Receipts</h3>
              <p className="max-w-lg text-sm leading-7 text-ink-300">
                Upload images, PDF, or DOCX files. BHIE finds the amount, category, and date, then creates your records automatically.
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                {premiumAccess ? 'Unlimited uploads active' : `${remainingUploads} free uploads remaining`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Capacity</div>
            <div className="mt-1 text-lg font-bold text-white">10MB each</div>
          </div>
        </div>

        <div
          className={`relative rounded-[1.75rem] border border-dashed px-6 py-10 text-center transition-all duration-500 ${
            dragActive ? 'border-sky-300/40 bg-sky-400/10' : 'border-white/14 bg-white/[0.04]'
          }`}
        >
          <motion.div
            animate={uploading ? { opacity: [0.45, 1, 0.45] } : { opacity: 1 }}
            transition={{ duration: 1.5, repeat: uploading ? Infinity : 0, ease: 'easeInOut' }}
            className="mx-auto flex max-w-xl flex-col items-center gap-5"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-white/10 bg-white/[0.06]">
              <div className="absolute inset-0 rounded-[inherit] bg-brand-gradient opacity-10" />
              {uploading ? (
                <Loader2 className="h-9 w-9 animate-spin text-sky-300" />
              ) : (
                <UploadCloud className="h-9 w-9 text-sky-300" />
              )}
            </div>

            {uploadsLocked ? (
              <div className="space-y-2">
                <h4 className="text-2xl font-black tracking-[-0.05em] text-white">Free upload limit reached</h4>
                <p className="mx-auto max-w-md text-sm leading-6 text-ink-300">
                  Upgrade to Pro or Enterprise to unlock unlimited uploads and AI-powered features.
                </p>
              </div>
            ) : uploading ? (
              <div className="space-y-2">
                <h4 className="text-2xl font-black tracking-[-0.05em] text-white">Processing your files</h4>
                <p className="text-sm leading-6 text-ink-300">Extracting text and creating business records now.</p>
              </div>
            ) : previewFiles.length > 0 ? (
              <div className="w-full max-w-md space-y-3 rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4 text-left">
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
            ) : (
              <div className="space-y-2">
                <h4 className="text-2xl font-black tracking-[-0.05em] text-white">Drag, drop, or browse</h4>
                <p className="mx-auto max-w-md text-sm leading-6 text-ink-300">
                  Upload invoices, receipts, PDFs, DOCX, or ZIP files and BHIE will extract data into MongoDB records.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              {acceptedFormats.map((format) => (
                <span
                  key={format}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-300"
                >
                  {format}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

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
          <div className="grid gap-3">
            {latestResults.map((result, index) => {
              const fileLabel = result.file?.originalName || result.record.title;
              const fileType = result.file?.fileType || 'image';
              const fileArchive = result.file?.archiveName;

              return (
                <div key={`${fileLabel}-${result.record.id}-${index}`} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]">
                      {renderResultIcon(fileType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{fileLabel}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-400">
                        {fileType}
                        {fileArchive ? ` • from ${fileArchive}` : ''}
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-4">
                        <Metric label="Amount" value={formatCurrency(result.record.amount)} />
                        <Metric label="Type" value={result.record.type} capitalize />
                        <Metric label="Category" value={result.record.category} capitalize />
                        <Metric label="Record" value={result.record.title} />
                      </div>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Extracted text</p>
                        <p className="mt-2 text-sm leading-6 text-ink-200">
                          {result.extracted.rawText || 'No text detected from this file.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
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
