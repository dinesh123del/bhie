import { Calendar, Tag, Boxes, FileText, GaugeCircle } from 'lucide-react';
import { backendUrl } from '../../config/api';
import { ImageIntelligenceRecord } from '../../types/imageIntelligence';

interface DisplayRecord extends ImageIntelligenceRecord {
  relevance?: number;
  similarity?: number;
}

interface Props {
  title: string;
  items: DisplayRecord[];
}

export default function ImageResultsGrid({ title, items }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
          No records yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
              <img
                src={toAbsoluteImageUrl(item.imageUrl)}
                alt={item.originalName}
                className="h-44 w-full object-cover"
              />

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="truncate text-sm font-semibold text-white">{item.originalName}</p>
                    <p className="text-xs text-slate-400">{item.detectedType} • {item.processingStatus}</p>
                  </div>

                  <div className="text-right text-xs text-cyan-300">
                    {item.relevance ? <p>Rel: {item.relevance.toFixed(1)}</p> : null}
                    {item.similarity ? <p>Sim: {(item.similarity * 100).toFixed(1)}%</p> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.tags.slice(0, 6).map((tag) => (
                    <span key={tag} className="rounded-full bg-cyan-500/20 px-2 py-1 text-[11px] text-cyan-200">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="line-clamp-2">
                    <FileText className="mr-1 inline h-3 w-3" />
                    {item.extractedText || 'No text extracted yet'}
                  </p>
                  <p>
                    <Boxes className="mr-1 inline h-3 w-3" />
                    Objects: {item.detectedObjects.map((o) => `${o.label} (${Math.round(o.confidence * 100)}%)`).join(', ') || 'None'}
                  </p>
                  <p>
                    <Tag className="mr-1 inline h-3 w-3" />
                    Prices: {item.structuredData.prices.slice(0, 3).join(', ') || 'N/A'}
                  </p>
                  <p>
                    <Tag className="mr-1 inline h-3 w-3" />
                    Quantities: {item.structuredData.quantities.slice(0, 3).join(', ') || 'N/A'}
                  </p>
                  <p>
                    <GaugeCircle className="mr-1 inline h-3 w-3" />
                    Confidence: {(item.confidenceScore * 100).toFixed(1)}%
                  </p>
                  <p>
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function toAbsoluteImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return backendUrl(imageUrl);
}
