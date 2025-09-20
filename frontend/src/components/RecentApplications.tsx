import clsx from 'clsx';
import { Clock3 } from 'lucide-react';

import { getStatusMeta } from '../data/mock';
import { getAccentClasses } from '../utils/accent';
import type { JobApplication } from '../types';
import { formatRelativeTime } from '../utils/date';

type RecentApplicationsProps = {
  data: JobApplication[];
};

const RecentApplications = ({ data }: RecentApplicationsProps) => {
  const items = [...data]
    .sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )
    .slice(0, 5);

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-center justify-between text-sm text-white/70">
        <div className="flex items-center gap-2">
          <Clock3 size={16} className="text-brand" />
          <span className="font-semibold text-white/90">Latest updates</span>
        </div>
        <span className="text-xs text-white/50">Sorted by most recent activity</span>
      </header>

      <ul className="mt-4 space-y-3">
        {items.map((application) => {
          const meta = getStatusMeta(application.status);
          const accent = getAccentClasses(meta.accent);

          return (
            <li
              key={application.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-white/90">{application.title}</p>
                <p className="text-xs text-white/50">
                  {application.company} · {application.location}
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Last update {formatRelativeTime(application.lastActivity)}
                </p>
              </div>
              <span
                className={clsx(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                  accent.pill
                )}
              >
                <span className={clsx('h-1.5 w-1.5 rounded-full', accent.dot)} aria-hidden />
                {meta.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
export default RecentApplications;

