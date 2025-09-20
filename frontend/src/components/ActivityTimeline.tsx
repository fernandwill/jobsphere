import clsx from 'clsx';
import { Dot } from 'lucide-react';

import { getStatusMeta } from '../data/mock';
import { getAccentClasses } from '../utils/accent';
import type { ActivityLogItem } from '../types';
import { formatRelativeTime } from '../utils/date';

type ActivityTimelineProps = {
  items: ActivityLogItem[];
};

const ActivityTimeline = ({ items }: ActivityTimelineProps) => {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <header className="mb-4 text-sm font-semibold text-white/80">Activity timeline</header>
      <ol className="relative space-y-5 before:absolute before:left-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-white/10">
        {items.map((item) => {
          const meta = getStatusMeta(item.status);
          const accent = getAccentClasses(meta.accent);

          return (
            <li key={item.id} className="relative pl-10">
              <span
                className={clsx(
                  'absolute left-0 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px]',
                  accent.pill
                )}
              >
                <Dot size={16} />
              </span>
              <p className="text-sm font-medium text-white/80">{item.summary}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/50">
                <span className="font-semibold text-white/70">{item.company}</span>
                <span className="inline-flex items-center gap-1">
                  <span className={clsx('h-1.5 w-1.5 rounded-full', accent.dot)} aria-hidden />
                  {meta.label}
                </span>
                <span>{formatRelativeTime(item.timestamp)}</span>
              </div>
              {item.details ? (
                <p className="mt-2 rounded-2xl bg-white/5 p-3 text-xs text-white/60">{item.details}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
export default ActivityTimeline;


