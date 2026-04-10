"use client"
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageUploadPanel from '../components/image-intelligence/ImageUploadPanel';
import ImageSearchPanel from '../components/image-intelligence/ImageSearchPanel';
import ImageResultsGrid from '../components/image-intelligence/ImageResultsGrid';
import { imageIntelligenceService } from '../services/imageIntelligenceService';
import { DetectedType, ImageIntelligenceRecord, SearchResult } from '../types/imageIntelligence';

export default function ImageIntelligencePage() {
  const [records, setRecords] = useState<ImageIntelligenceRecord[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resultTitle, setResultTitle] = useState('Latest Intelligence Results');

  const loadRecords = useCallback(async () => {
    const response = await imageIntelligenceService.listImages({
      page: 1,
      limit: 30,
    });

    setRecords(response.items);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await loadRecords();
      } catch (error) {
        toast.error('Failed to load image intelligence records');
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [loadRecords]);

  useEffect(() => {
    const hasPending = records.some(
      (record) => record.processingStatus === 'queued' || record.processingStatus === 'processing'
    );

    if (!hasPending) {
      return;
    }

    const timer = setInterval(() => {
      void loadRecords();
    }, 3500);

    return () => clearInterval(timer);
  }, [records, loadRecords]);

  const handleUpload = async (files: File[]) => {
    try {
      setUploading(true);
      const response = await imageIntelligenceService.uploadImages(files);
      toast.success(`${response.count} image(s) uploaded and queued`);
      setSearchResults(null);
      setResultTitle('Latest Intelligence Results');
      await loadRecords();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (payload: {
    q: string;
    type?: DetectedType | '';
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      setSearching(true);
      const response = await imageIntelligenceService.search({
        q: payload.q,
        type: payload.type,
        dateFrom: payload.dateFrom,
        dateTo: payload.dateTo,
      });

      setSearchResults(response.results);
      setResultTitle(`Search Results for "${response.query}"`);
      toast.success(`${response.count} result(s) found`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleReverseSearch = async (file: File) => {
    try {
      setSearching(true);
      const response = await imageIntelligenceService.reverseSearch(file);
      setSearchResults(
        response.results.map((item) => ({
          ...item,
          relevance: item.similarity,
        }))
      );
      setResultTitle(`Reverse Search: ${response.query.name}`);
      toast.success(`${response.results.length} similar image(s) found`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Reverse image search failed');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = async () => {
    setSearchResults(null);
    setResultTitle('Latest Intelligence Results');
    await loadRecords();
  };

  const metrics = useMemo(() => {
    const completed = records.filter((record) => record.processingStatus === 'completed').length;
    const failed = records.filter((record) => record.processingStatus === 'failed').length;
    const processing = records.filter(
      (record) => record.processingStatus === 'queued' || record.processingStatus === 'processing'
    ).length;

    return { completed, failed, processing };
  }, [records]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-200">
                <BrainCircuit className="h-3.5 w-3.5" />
                GOOGLE LENS–LEVEL PIPELINE
              </p>
              <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">Image Intelligence Engine</h1>
              <p className="mt-1 text-sm text-[#C0C0C0]">Upload images, extract business intelligence, search by text and visual similarity.</p>
            </div>

            <button
              type="button"
              onClick={() => void loadRecords()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricCard label="Completed" value={metrics.completed} tone="text-emerald-300" />
            <MetricCard label="Processing" value={metrics.processing} tone="text-cyan-300" />
            <MetricCard label="Failed" value={metrics.failed} tone="text-rose-300" />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <ImageUploadPanel uploading={uploading} onUpload={handleUpload} />
          <ImageSearchPanel
            searching={searching}
            onSearch={handleSearch}
            onReverseSearch={handleReverseSearch}
          />
        </div>

        {searchResults ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void clearSearch()}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
            >
              Clear Search
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-[#0A0A0A]/80 border border-white/5/70 p-8 text-center text-sm text-[#C0C0C0]">
            Loading image intelligence records...
          </div>
        ) : (
          <ImageResultsGrid
            title={resultTitle}
            items={searchResults || records}
          />
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-wide text-[#C0C0C0]">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
