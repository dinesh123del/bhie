"use client"
import { useEffect, useMemo, useState } from 'react';
import { FilePlus2, FileText, Trash2, CreditCard, Lock, Download } from 'lucide-react';
import { generateBrandedPDF } from '../utils/pdfGenerator';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Report, reportsService } from '../services/reportsService';

const REPORT_TEMPLATES = [
  {
    title: 'Monthly Business Summary',
    type: 'summary',
    content: 'Comprehensive overview of business performance, highlighting key operational wins and critical growth trends for the current period.',
    isPremium: false,
  },
  {
    title: 'Revenue Snapshot',
    type: 'finance',
    content: 'Detailed financial breakdown, covering gross revenue, net profit margins, and expense attribution for optimized financial health tracking.',
    isPremium: false,
  },
  {
    title: 'Comprehensive Tax & Audit Report',
    type: 'audit_tax',
    content: 'A full-scale, AI-verified 40-page PDF report designed for CAs and compliance formatting. Unlock advanced export formatting.',
    isPremium: true,
    price: '₹199'
  }
];

const getReportId = (report: Report) => report._id ?? report.id;

const formatDate = (value?: string) => {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingType, setCreatingType] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      try {
        const data = await reportsService.getReports();
        if (active) {
          setReports(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          setReports([]);
          toast.error('Failed to load reports');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      active = false;
    };
  }, []);

  const reportCountLabel = useMemo(() => {
    if (reports.length === 1) {
      return '1 saved report';
    }

    return `${reports.length} saved reports`;
  }, [reports.length]);

  const handleCreateReport = async (template: typeof REPORT_TEMPLATES[number]) => {
    if (template.isPremium && user?.plan !== 'premium') {
      toast('Premium Feature. Please upgrade your plan or purchase one-time pass.', { icon: '🔒' });
      navigate('/payments');
      return;
    }

    setCreatingType(template.type);

    try {
      const created = await reportsService.createReport(template as any);
      setReports((current) => [created, ...current]);
      toast.success('Report created');
    } catch {
      toast.error('Failed to create report');
    } finally {
      setCreatingType(null);
    }
  };

  const handleDeleteReport = async (report: Report) => {
    const reportId = getReportId(report);

    if (!reportId || !window.confirm(`Delete "${report.title}"?`)) {
      return;
    }

    setDeletingId(reportId);

    try {
      await reportsService.deleteReport(reportId);
      setReports((current) => current.filter((item) => getReportId(item) !== reportId));
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadReport = (report: Report) => {
    void generateBrandedPDF({
      title: report.title,
      content: report.content,
      filename: `Report_${report.title.replace(/\s+/g, '_')}_${new Date().getTime()}`,
      type: report.type
    });
    toast.success('Downloading report...');
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="mt-2 text-sm text-[#C0C0C0]">
            Create lightweight report records from the live backend and manage them in one place.
          </p>
        </div>
        <p className="text-sm font-medium text-[#C0C0C0]">{reportCountLabel}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {REPORT_TEMPLATES.map((template) => (
          <button
            key={template.type}
            type="button"
            onClick={() => handleCreateReport(template)}
            disabled={creatingType !== null}
            className={`group rounded-2xl border p-6 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
              template.isPremium 
                ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-400 hover:bg-amber-500/10' 
                : 'border-dashed border-gray-700 bg-[#0A0A0A]/80 border border-white/5/70 hover:border-sky-400 hover:bg-sky-500/5'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${template.isPremium ? 'bg-amber-500/15 text-amber-300' : 'bg-sky-500/15 text-sky-300'}`}>
                  {template.isPremium ? <Lock className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    {template.title}
                  </h2>
                  <p className="text-sm text-[#C0C0C0]">Type: {template.type}</p>
                </div>
              </div>
              {template.isPremium && (
                 <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg">
                   <CreditCard size={14} />
                   {template.price}
                 </span>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-[#C0C0C0]">
              {creatingType === template.type ? 'Creating report...' : template.content}
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-sky-300" />
          <h2 className="text-xl font-semibold text-white">Saved Reports</h2>
        </div>

        {reports.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-800 bg-[#0A0A0A]/80 border border-white/5/60 p-6 text-sm text-[#C0C0C0]">
            No reports yet. Use one of the templates above to create your first saved report.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reports.map((report) => {
              const reportId = getReportId(report);

              return (
                <div
                  key={reportId ?? `${report.title}-${report.createdAt}`}
                  className="rounded-2xl border border-gray-800 bg-[#0A0A0A]/80 border border-white/5/70 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                        {report.type || 'general'}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{report.title}</h3>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#C0C0C0]">
                        {report.content || 'No content provided.'}
                      </p>
                      <p className="mt-3 text-xs text-gray-500">
                        Created {formatDate(report.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownloadReport(report)}
                        className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 px-3 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/10"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(report)}
                        disabled={!reportId || deletingId === reportId}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === reportId ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
