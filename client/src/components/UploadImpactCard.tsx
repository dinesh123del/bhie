import { ArrowUpRight, FileCheck2, Sparkles } from 'lucide-react';
import { PremiumBadge, PremiumCard } from './ui/PremiumComponents';
import { UploadedImageRecord } from '../services/uploadService';
import { formatCurrency } from '../utils/dashboardIntelligence';

interface UploadImpactCardProps {
  latestUpload: UploadedImageRecord | null;
  revenue: number;
  expenses: number;
}

export default function UploadImpactCard({
  latestUpload,
  revenue,
  expenses,
}: UploadImpactCardProps) {
  const impactValue = latestUpload?.record.amount || 0;
  const revenueShare = revenue > 0 ? (impactValue / revenue) * 100 : 0;
  const expenseShare = expenses > 0 ? (impactValue / expenses) * 100 : 0;
  const extractedText =
    latestUpload?.extracted.rawText ||
    latestUpload?.image?.extractedText ||
    '';

  return (
    <PremiumCard gradient hoverable={false} className="min-h-[420px] border border-white/10">
      <div className="flex h-full flex-col gap-6">
        <div className="space-y-3">
          <PremiumBadge tone="brand" icon={<FileCheck2 className="h-3.5 w-3.5" />}>
            Instant value
          </PremiumBadge>
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl">Upload impact</h3>
            <p className="mt-2 text-sm leading-7 text-ink-300">
              Every upload should feel useful immediately. BHIE shows what was extracted and how it changes your business picture.
            </p>
          </div>
        </div>

        {latestUpload ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Extracted amount</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
                  {formatCurrency(latestUpload.record.amount)}
                </p>
                <p className="mt-2 text-sm text-ink-300 capitalize">{latestUpload.record.category} • {latestUpload.record.type}</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Business impact</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {latestUpload.record.type === 'income'
                    ? `${revenueShare.toFixed(1)}% of current revenue`
                    : `${expenseShare.toFixed(1)}% of current expenses`}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-300">
                  {latestUpload.record.type === 'income'
                    ? 'This upload adds to your top-line momentum.'
                    : 'This upload highlights a recent cost on your books.'}
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-sky-300/15 bg-sky-400/10 p-5 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-400/10 text-sky-100">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{latestUpload.record.title}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-200">
                    {extractedText || 'No text detected from the latest file.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Recommended next step</p>
                  <p className="mt-2 text-sm leading-6 text-white">
                    Confirm the extracted category and keep daily uploads flowing so BHIE can detect cost and profit patterns faster.
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-auto rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] px-5 py-6">
            <p className="text-sm font-semibold text-white">No recent upload yet</p>
            <p className="mt-2 text-sm leading-6 text-ink-300">
              Upload a bill, invoice, or statement and BHIE will instantly show extracted data and business impact here.
            </p>
          </div>
        )}
      </div>
    </PremiumCard>
  );
}
