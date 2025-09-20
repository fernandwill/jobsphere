import DashboardHeader from './components/DashboardHeader';
import PipelineBoard from './components/PipelineBoard';
import RecentApplications from './components/RecentApplications';
import ScrapeJobsPanel from './components/ScrapeJobsPanel';
import StatsGrid from './components/StatsGrid';
import ActivityTimeline from './components/ActivityTimeline';
import {
  MOCK_ACTIVITY,
  MOCK_APPLICATIONS,
  MOCK_METRICS,
  MOCK_SCRAPE_JOBS,
} from './data/mock';

const App = () => {
  const pendingScrapes = MOCK_SCRAPE_JOBS.filter((job) =>
    ['queued', 'running'].includes(job.status)
  ).length;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_bottom,_rgba(34,211,238,0.15),transparent_60%)]" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-12">
        <DashboardHeader userName="Alex" pendingScrapes={pendingScrapes} />
        <StatsGrid metrics={MOCK_METRICS} />

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr] xl:items-start">
          <div className="flex flex-col gap-6">
            <PipelineBoard applications={MOCK_APPLICATIONS} />
            <RecentApplications data={MOCK_APPLICATIONS} />
          </div>

          <div className="flex flex-col gap-6">
            <ScrapeJobsPanel jobs={MOCK_SCRAPE_JOBS} />
            <ActivityTimeline items={MOCK_ACTIVITY} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;