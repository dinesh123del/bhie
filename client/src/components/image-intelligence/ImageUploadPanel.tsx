"use client"
import { useMemo, useState, DragEvent } from 'react';
import { UploadCloud, ImagePlus, Loader2, X } from 'lucide-react';

interface Props {
  uploading: boolean;
  onUpload: (files: File[]) => Promise<void>;
}

export default function ImageUploadPanel({ uploading, onUpload }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  const onFilesSelected = (selected: FileList | null) => {
    if (!selected) return;

    const accepted = Array.from(selected)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 10);

    setFiles(accepted);
  };

  const submitUpload = async () => {
    if (!files.length) return;
    await onUpload(files);
    setFiles([]);
  };

  const handleDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    onFilesSelected(event.dataTransfer.files);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <ImagePlus className="h-5 w-5 text-cyan-300" />
        <h2 className="text-lg font-semibold text-white">Image Upload</h2>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-white/20 bg-[#0A0A0A]/80 border border-white/5/40'
        }`}
      >
        <UploadCloud className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
        <p className="text-sm text-white">Drag and drop up to 10 images</p>
        <p className="mt-1 text-xs text-[#C0C0C0]">JPG, PNG, WEBP, GIF, BMP, TIFF, HEIC</p>

        <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400">
          Select Images
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => onFilesSelected(event.target.files)}
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {previews.map(({ file, url }, index) => (
            <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-white/10">
              <img src={url} alt={file.name} className="h-28 w-full object-cover" />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
              >
                <X className="h-3 w-3" />
              </button>
              <div className="truncate bg-black/60 px-2 py-1 text-xs text-white">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-[#C0C0C0]">Images are auto-compressed before upload.</p>
        <button
          type="button"
          onClick={submitUpload}
          disabled={uploading || files.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {uploading ? 'Uploading...' : 'Process Images'}
        </button>
      </div>
    </section>
  );
}
