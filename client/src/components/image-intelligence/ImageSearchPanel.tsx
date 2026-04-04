import { useState } from 'react';
import { Search, Image, Loader2, Filter } from 'lucide-react';
import { DetectedType } from '../../types/imageIntelligence';

interface SearchPayload {
  q: string;
  type?: DetectedType | '';
  dateFrom?: string;
  dateTo?: string;
}

interface Props {
  searching: boolean;
  onSearch: (payload: SearchPayload) => Promise<void>;
  onReverseSearch: (file: File) => Promise<void>;
}

export default function ImageSearchPanel({ searching, onSearch, onReverseSearch }: Props) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<DetectedType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const triggerSearch = async () => {
    if (!query.trim()) return;

    await onSearch({
      q: query.trim(),
      type,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const onReverseFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onReverseSearch(file);
    event.target.value = '';
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <Search className="h-5 w-5 text-emerald-300" />
        <h2 className="text-lg font-semibold text-white">Smart Search</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search text, objects, tags, product names..."
          className="rounded-xl border border-white/20 bg-slate-900/70 px-4 py-2 text-sm text-white outline-none focus:border-cyan-400"
        />
        <button
          type="button"
          onClick={triggerSearch}
          disabled={searching || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1"><Filter className="h-3 w-3" /> Type</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as DetectedType | '')}
            className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          >
            <option value="">All</option>
            <option value="invoice">Invoice</option>
            <option value="material">Material</option>
            <option value="product">Product</option>
            <option value="document">Document</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          <span>From Date</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          <span>To Date</span>
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <p className="mb-2 text-sm font-medium text-white">Reverse Image Search</p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950">
          <Image className="h-4 w-4" />
          Find Similar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onReverseFileChange}
          />
        </label>
      </div>
    </section>
  );
}
