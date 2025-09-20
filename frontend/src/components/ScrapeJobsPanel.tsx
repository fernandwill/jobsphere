import clsx from 'clsx';
import { Radar, RefreshCw, Zap } from 'lucide-react';

import type { ScrapeJob } from '../types';
import { formatRelativeTime } from '../utils/date';

type ScrapeJobsPanelProps = {
  jobs: ScrapeJob[];
};

const statusStyles = {
  queued: 'border-slate-500/30 bg-slate-500/10 text-slate-200',
  running: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  succeeded: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  failed: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
} as const;

const ScrapeJobsPanel = ({ jobs }: ScrapeJobsPanelProps) => {
  return (
    <section className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-center justify-between text-sm text-white/70">
        <div className="flex items-center gap-2">
          <Radar size={16} className="text-brand" />
          <span className="font-semibold text-white/90">Active scrapes</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/60 transition hover:text-white"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </header>

      <ul className="space-y-3 text-sm">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white/90">{job.company}</p>
                <p className="text-xs text-white/50">
                  Discovered <strong className="text-white/80">{job.roleCount}</strong> role(s)
                </p>
              </div>
              <span
                className={clsx(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                  statusStyles[job.status]
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                {job.status}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/50">
              <span className="inline-flex items-center gap-1">
                <Zap size={14} />
                Started {formatRelativeTime(job.startedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
                ETA: {job.eta}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ScrapeJobsPanel;