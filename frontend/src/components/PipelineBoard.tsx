import clsx from 'clsx';

import { STATUS_META } from '../data/mock';
import type { JobApplication } from '../types';
import { getAccentClasses } from '../utils/accent';

type PipelineBoardProps = {
  applications: JobApplication[];
};

const PipelineBoard = ({ applications }: PipelineBoardProps) => {
  return (
    <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {STATUS_META.map((meta) => {
        const items = applications.filter((item) => item.status === meta.key);
        const accent = getAccentClasses(meta.accent);

        return (
          <article
            key={meta.key}
            className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <header className="flex items-start justify-between gap-3 text-sm">
              <div>
                <h2 className="text-base font-semibold text-white/90">{meta.label}</h2>
                <p className="text-xs text-white/50">{meta.description}</p>
              </div>
              <span className={clsx('rounded-full border px-3 py-1 text-xs font-semibold', accent.pill)}>
                {items.length} active
              </span>
            </header>

            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/50">
                  Nothing here yet. Drag applications once they move into this stage.
                </p>
              ) : (
                items.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 transition hover:border-brand/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white/90">{application.title}</p>
                        <p className="text-xs text-white/50">{application.company}</p>
                      </div>
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide',
                          accent.pill
                        )}
                      >
                        <span className={clsx('inline-flex h-1.5 w-1.5 rounded-full', accent.dot)} aria-hidden />
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
                      <span>{application.location}</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
                        {application.mode.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
                        Updated {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(application.lastActivity))}
                      </span>
                    </div>
                    {application.notes ? (
                      <p className="mt-3 rounded-2xl bg-white/5 p-3 text-xs text-white/60">
                        {application.notes}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default PipelineBoard;
