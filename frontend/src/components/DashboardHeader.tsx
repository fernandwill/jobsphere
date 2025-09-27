import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { CalendarDays, PlusCircle, Search, X } from 'lucide-react';
import type { JobApplication, ScrapeJob, WorkMode, ApplicationStatus } from '../types';

const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

const APPLICATION_STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'online_assessment', label: 'Online Assessment' },
  { value: 'interview', label: 'Interview' },
  { value: 'passed', label: 'Passed' },
  { value: 'rejected', label: 'Rejected' },
];

const MANUAL_DEFAULTS = {
  company: '',
  job_title: '',
  location: '',
  mode: '' as '' | WorkMode,
  status: 'applied' as ApplicationStatus,
  job_url: '',
  applied_at: '',
  notes: '',
};

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type DashboardHeaderProps = {
  userName: string;
  pendingScrapes: number;
  apiBaseUrl: string;
  onScrapeCreated?: (job: ScrapeJob) => void;
  onApplicationCreated?: (application: JobApplication) => void;
};

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
};

type ValidationErrors = Record<string, string>;

const normalizeErrors = (errors: Record<string, unknown> | undefined | null): ValidationErrors => {
  if (!errors || typeof errors !== 'object') {
    return {};
  }

  return Object.entries(errors).reduce<ValidationErrors>((accumulator, [key, value]) => {
    if (Array.isArray(value)) {
      accumulator[key] = String(value[0]);
    } else if (value !== null && value !== undefined) {
      accumulator[key] = String(value);
    }

    return accumulator;
  }, {});
};

const DashboardHeader = ({
  userName,
  pendingScrapes,
  apiBaseUrl,
  onScrapeCreated,
  onApplicationCreated,
}: DashboardHeaderProps) => {
  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    []
  );

  const csrfToken =
    typeof document !== 'undefined'
      ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
      : undefined;

  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [scrapeOpen, setScrapeOpen] = useState(false);
  const [scrapeKeyword, setScrapeKeyword] = useState('');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualForm, setManualForm] = useState({ ...MANUAL_DEFAULTS });
  const [manualErrors, setManualErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), 6000);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleOpenScrape = () => {
    setScrapeKeyword('');
    setScrapeError(null);
    setScrapeOpen(true);
  };

  const handleOpenManual = () => {
    setManualForm({ ...MANUAL_DEFAULTS });
    setManualErrors({});
    setManualOpen(true);
  };

  const closeScrape = () => {
    if (!scrapeLoading) {
      setScrapeOpen(false);
    }
  };

  const closeManual = () => {
    if (!manualLoading) {
      setManualOpen(false);
    }
  };

  const showFeedback = (type: FeedbackState['type'], message: string) => {
    if (!message) return;

    setFeedback({ type, message });
  };

  const handleScrapeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setScrapeLoading(true);
    setScrapeError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/scrapes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ keyword: scrapeKeyword }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errors = normalizeErrors((payload as any)?.errors);
        const message = errors.keyword ?? (payload as any)?.message ?? `Request failed with status ${response.status}`;

        setScrapeError(message);
        showFeedback('error', message);
        return;
      }

      const data = (payload as any)?.data;

      if (data && onScrapeCreated) {
        const newJob: ScrapeJob = {
          id: String(data.id ?? generateId()),
          keyword: data.keyword ?? scrapeKeyword,
          company: data.company ?? data.keyword ?? scrapeKeyword,
          roleCount: Number(data.roleCount ?? data.role_count ?? 0),
          queuedAt: data.queuedAt ?? data.queued_at ?? new Date().toISOString(),
          startedAt: data.startedAt ?? data.started_at ?? null,
          finishedAt: data.finishedAt ?? data.finished_at ?? null,
          eta: data.eta ?? 'Pending',
          status: (data.status ?? 'queued') as ScrapeJob['status'],
          error: data.error ?? data.error_message ?? null,
        };

        onScrapeCreated(newJob);
      }

      setScrapeOpen(false);
      setScrapeKeyword('');
      showFeedback('success', 'Scrape queued successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to queue the scrape right now.';
      setScrapeError(message);
      showFeedback('error', message);
    } finally {
      setScrapeLoading(false);
    }
  };

  const handleManualChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setManualForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setManualLoading(true);
    setManualErrors({});

    const payload: Record<string, string> = {
      company: manualForm.company,
      job_title: manualForm.job_title,
      source: 'manual',
    };

    (['location', 'mode', 'status', 'job_url', 'applied_at', 'notes'] as const).forEach((field) => {
      const value = manualForm[field];
      if (value) {
        payload[field] = value;
      }
    });

    try {
      const response = await fetch(`${apiBaseUrl}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errors = normalizeErrors((body as any)?.errors);
        const message = (body as any)?.message ?? 'Unable to save the application.';

        setManualErrors(errors);
        if (!Object.keys(errors).length) {
          showFeedback('error', message);
        }
        return;
      }

      const data = (body as any)?.data;

      if (data && onApplicationCreated) {
        const newApplication: JobApplication = {
          id: String(data.id ?? generateId()),
          title: data.title ?? manualForm.job_title,
          company: data.company ?? manualForm.company,
          location: data.location ?? manualForm.location ?? '',
          mode: (data.mode ?? manualForm.mode ?? 'remote') as WorkMode,
          status: (data.status ?? manualForm.status ?? 'applied') as ApplicationStatus,
          source: (data.source ?? 'manual') as JobApplication['source'],
          postedAt: data.postedAt ?? manualForm.applied_at ?? new Date().toISOString(),
          lastActivity: data.lastActivity ?? new Date().toISOString(),
          notes: data.notes ?? manualForm.notes ?? undefined,
        };

        onApplicationCreated(newApplication);
      }

      setManualOpen(false);
      setManualForm({ ...MANUAL_DEFAULTS });
      showFeedback('success', 'Application logged successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save the application.';
      showFeedback('error', message);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
              : 'border-red-400/40 bg-red-500/10 text-red-100'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/60">{currentDate}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome back, <span className="text-brand-accent">{userName}</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Track your applications, launch new scrapes, and spot bottlenecks across the hiring funnel in one view.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleOpenScrape}
            className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/20"
          >
            <Search size={16} />
            Scrape company
          </button>
          <button
            type="button"
            onClick={handleOpenManual}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
          >
            <PlusCircle size={16} />
            Add manual application
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-brand" size={18} />
          <p className="text-sm text-white/70">
            You have <span className="font-semibold text-white">{pendingScrapes}</span> scraping job(s) in the queue.
          </p>
        </div>
        <span className="ml-auto text-xs uppercase tracking-wide text-white/40">All times in local timezone</span>
      </div>

      {scrapeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Scrape a company</h2>
                <p className="mt-1 text-sm text-white/60">
                  Provide a company keyword to queue a new scraping job. Results will appear in the pipeline once the run
                  completes.
                </p>
              </div>
              <button
                type="button"
                onClick={closeScrape}
                className="rounded-full border border-white/10 p-1 text-white/60 transition hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleScrapeSubmit}>
              <div className="space-y-2">
                <label htmlFor="scrape-keyword" className="text-sm font-medium text-white/80">
                  Company keyword
                </label>
                <input
                  id="scrape-keyword"
                  name="keyword"
                  value={scrapeKeyword}
                  onChange={(event) => setScrapeKeyword(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                {scrapeError && <p className="text-sm text-red-300">{scrapeError}</p>}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeScrape}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
                  disabled={scrapeLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scrapeLoading || !scrapeKeyword.trim()}
                  className="inline-flex items-center gap-2 rounded-full border border-brand bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:border-brand/40 disabled:bg-brand/50"
                >
                  {scrapeLoading ? 'Queuing…' : 'Start scrape'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {manualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Log a manual application</h2>
                <p className="mt-1 text-sm text-white/60">
                  Record the essentials for an opportunity you sourced manually so the dashboard stays accurate.
                </p>
              </div>
              <button
                type="button"
                onClick={closeManual}
                className="rounded-full border border-white/10 p-1 text-white/60 transition hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleManualSubmit}>
              <div className="md:col-span-1">
                <label htmlFor="manual-company" className="text-sm font-medium text-white/80">
                  Company<span className="text-red-300">*</span>
                </label>
                <input
                  id="manual-company"
                  name="company"
                  value={manualForm.company}
                  onChange={handleManualChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                {manualErrors.company && <p className="mt-1 text-sm text-red-300">{manualErrors.company}</p>}
              </div>

              <div className="md:col-span-1">
                <label htmlFor="manual-role" className="text-sm font-medium text-white/80">
                  Role title<span className="text-red-300">*</span>
                </label>
                <input
                  id="manual-role"
                  name="job_title"
                  value={manualForm.job_title}
                  onChange={handleManualChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                {manualErrors.job_title && <p className="mt-1 text-sm text-red-300">{manualErrors.job_title}</p>}
              </div>

              <div className="md:col-span-1">
                <label htmlFor="manual-location" className="text-sm font-medium text-white/80">
                  Location
                </label>
                <input
                  id="manual-location"
                  name="location"
                  value={manualForm.location}
                  onChange={handleManualChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                {manualErrors.location && <p className="mt-1 text-sm text-red-300">{manualErrors.location}</p>}
              </div>

              <div className="md:col-span-1">
                <label htmlFor="manual-mode" className="text-sm font-medium text-white/80">
                  Work mode
                </label>
                <select
                  id="manual-mode"
                  name="mode"
                  value={manualForm.mode}
                  onChange={handleManualChange}
                  className="mt-2 w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  <option value="">Select…</option>
                  {WORK_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {manualErrors.mode && <p className="mt-1 text-sm text-red-300">{manualErrors.mode}</p>}
              </div>

              <div className="md:col-span-1">
                <label htmlFor="manual-status" className="text-sm font-medium text-white/80">
                  Status
                </label>
                <select
                  id="manual-status"
                  name="status"
                  value={manualForm.status}
                  onChange={handleManualChange}
                  className="mt-2 w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  {APPLICATION_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {manualErrors.status && <p className="mt-1 text-sm text-red-300">{manualErrors.status}</p>}
              </div>

              <div className="md:col-span-1">
                <label htmlFor="manual-url" className="text-sm font-medium text-white/80">
                  Job URL
                </label>
                <input
                  id="manual-url"
                  name="job_url"
                  value={manualForm.job_url}
                  onChange={handleManualChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                {manualErrors.job_url && <p className="mt-1 text-sm text-red-300">{manualErrors.job_url}</p>}
              </div>

              <div className="md:col-span-1">
                <label htmlFor="manual-applied" className="text-sm font-medium text-white/80">
                  Applied on
                </label>
                <input
                  id="manual-applied"
                  name="applied_at"
                  type="date"
                  value={manualForm.applied_at}
                  onChange={handleManualChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                {manualErrors.applied_at && <p className="mt-1 text-sm text-red-300">{manualErrors.applied_at}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="manual-notes" className="text-sm font-medium text-white/80">
                  Notes
                </label>
                <textarea
                  id="manual-notes"
                  name="notes"
                  value={manualForm.notes}
                  onChange={handleManualChange}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                {manualErrors.notes && <p className="mt-1 text-sm text-red-300">{manualErrors.notes}</p>}
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeManual}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
                  disabled={manualLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-brand bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:border-brand/40 disabled:bg-brand/50"
                >
                  {manualLoading ? 'Saving…' : 'Save application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
