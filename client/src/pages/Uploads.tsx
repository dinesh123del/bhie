import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { AxiosProgressEvent } from 'axios';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
}

const Uploads = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file upload
  const handleUpload = async (selectedFiles: FileList) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);

    for (const file of selectedFiles) {
      // Add file to list with processing status
      const fileId = Date.now().toString();
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toLocaleString(),
        status: 'processing',
        progress: 0
      };

      setFiles(prev => [newFile, ...prev]);

      try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);

        // Upload file using the simple upload endpoint
        await api.post('/upload/simple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
              : 0;

            setFiles(prev =>
              prev.map(f =>
                f.id === fileId ? { ...f, progress } : f
              )
            );
          }
        });

        // Update status to completed
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        );

        toast.success(`${file.name} uploaded successfully!`);
      } catch (error) {
        console.error('Upload failed:', error);

        // Update status to failed
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId ? { ...f, status: 'failed' } : f
          )
        );

        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleRemove = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">File Uploads</h1>
        <p className="text-slate-400">Upload your financial documents and records</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
        }`}
        whileHover={{ borderColor: '#60a5fa' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
          accept=".csv,.xlsx,.xls,.pdf,.jpg,.png"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ scale: dragActive ? 1.1 : 1 }}
            className="p-4 rounded-full bg-gradient-to-br from-blue-600 to-blue-700"
          >
            <Upload className="w-8 h-8 text-white" />
          </motion.div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              {dragActive ? 'Drop files here' : 'Drag & drop your files'}
            </h3>
            <p className="text-slate-400 mb-4">or click to browse</p>
            <p className="text-sm text-slate-500">
              Supported formats: CSV, Excel, PDF, JPG, PNG
            </p>
          </div>

          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {uploading ? 'Uploading...' : 'Select Files'}
          </motion.button>
        </div>
      </motion.div>

      {/* Upload History */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Upload History</h2>

          <div className="space-y-3">
            {files.map((file, idx) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* File Icon */}
                  <div className="flex-shrink-0 p-3 rounded-lg bg-slate-700/50">
                    <File className="w-6 h-6 text-blue-400" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold truncate">{file.name}</h4>
                      {getStatusIcon(file.status)}
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        file.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : file.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm text-slate-400">
                        {formatFileSize(file.size)} • {file.uploadedAt}
                      </div>

                      {/* Progress Bar */}
                      {file.status === 'processing' && file.progress !== undefined && (
                        <div className="flex-1 max-w-xs">
                          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${file.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{file.progress}%</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <motion.button
                    onClick={() => handleRemove(file.id)}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {files.length === 0 && !uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-slate-400">No files uploaded yet. Start by uploading your first file!</p>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        className="p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-700/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white mb-3">Upload Tips</h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Upload CSV files for bulk income/expense records</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Excel files will be automatically processed and categorized</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Receipt images will be analyzed using OCR technology</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <span>Maximum file size: 50MB per file</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Uploads;
