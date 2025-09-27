import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from './data/mock';
import type { ScrapeJob } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

const App = () => {
  const [scrapeJobs, setScrapeJobs] = useState<ScrapeJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScrapeJobs = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE_URL}/api/scrapes`);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const data = Array.isArray(payload?.data) ? payload.data : [];

      setScrapeJobs(
        data.map((item: any) => ({
          id: String(item.id),
          keyword: item.keyword ?? '',
          company: item.company ?? item.keyword ?? 'Unknown',
          roleCount: Number(item.roleCount ?? 0),
          queuedAt: item.queuedAt ?? item.queued_at ?? null,
          startedAt: item.startedAt ?? item.started_at ?? null,
          finishedAt: item.finishedAt ?? item.finished_at ?? null,
          eta: item.eta ?? 'Pending',
          status: item.status ?? 'queued',
          error: item.error ?? item.error_message ?? null,
        }))
      );
    } catch (error) {
      console.error('Failed to load scrape jobs', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScrapeJobs();

    const interval = window.setInterval(fetchScrapeJobs, 10000);

    return () => window.clearInterval(interval);
  }, [fetchScrapeJobs]);

  const pendingScrapes = useMemo(
    () => scrapeJobs.filter((job) => ['queued', 'running'].includes(job.status)).length,
    [scrapeJobs]
  );

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
            <ScrapeJobsPanel jobs={scrapeJobs} refreshing={refreshing} onRefresh={fetchScrapeJobs} />
            <ActivityTimeline items={MOCK_ACTIVITY} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
