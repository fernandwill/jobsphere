import { CalendarCheck, Inbox, Medal, MessageCircle } from 'lucide-react';

export type DashboardMetrics = {
  applicationsThisWeek: number;
  interviewsScheduled: number;
  responseRate: number;
  offerRate: number;
};

const cards = [
  {
    key: 'applicationsThisWeek' as const,
    label: 'Applications this week',
    helper: 'Target: 5 per week',
    icon: Inbox,
    unit: '',
  },
  {
    key: 'interviewsScheduled' as const,
    label: 'Interviews scheduled',
    helper: 'Next 14 days',
    icon: CalendarCheck,
    unit: '',
  },
  {
    key: 'responseRate' as const,
    label: 'Response rate',
    helper: 'Percent responses received',
    icon: MessageCircle,
    unit: '%',
  },
  {
    key: 'offerRate' as const,
    label: 'Offer rate',
    helper: 'Share of interviews converted',
    icon: Medal,
    unit: '%',
  },
];

const StatsGrid = ({ metrics }: { metrics: DashboardMetrics }) => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, helper, icon: Icon, unit }) => {
        const value = metrics[key];
        return (
          <article
            key={key}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-card"
          >
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-brand/30 blur-3xl" aria-hidden />
            <header className="flex items-center gap-3 text-sm text-white/70">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-brand">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-medium text-white/80">{label}</p>
                <span className="text-xs text-white/50">{helper}</span>
              </div>
            </header>
            <p className="mt-6 text-3xl font-semibold tracking-tight">
              {value}
              {unit}
            </p>
          </article>
        );
      })}
    </section>
  );
};

export default StatsGrid;