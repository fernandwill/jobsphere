import { CalendarDays, PlusCircle, Search } from 'lucide-react';

type DashboardHeaderProps = {
  userName: string;
  pendingScrapes: number;
};

const DashboardHeader = ({ userName, pendingScrapes }: DashboardHeaderProps) => {
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
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
            className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/20"
          >
            <Search size={16} />
            Scrape company
          </button>
          <button
            type="button"
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
        <span className="ml-auto text-xs uppercase tracking-wide text-white/40">
          All times in local timezone
        </span>
      </div>
    </header>
  );
};

export default DashboardHeader;