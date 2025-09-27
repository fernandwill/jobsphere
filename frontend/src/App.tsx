import { useCallback, useEffect, useMemo, useState } from 'react';
import ActivityTimeline from './components/ActivityTimeline';
import DashboardHeader from './components/DashboardHeader';
import PipelineBoard from './components/PipelineBoard';
import RecentApplications from './components/RecentApplications';
import ScrapeJobsPanel from './components/ScrapeJobsPanel';
import StatsGrid from './components/StatsGrid';
import AnalyticsCharts from './components/AnalyticsCharts';
import { fetchApplications, type ApplicationsResponse } from './data/mock';
import type { ActivityLogItem, JobApplication, ScrapeJob } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

const DEFAULT_COUNTS: ApplicationsResponse['counts'] = {
  total: 0,
  byStatus: {
    applied: 0,
    online_assessment: 0,
    interview: 0,
    passed: 0,
    rejected: 0,
  },
};

const App = () => {
  const [scrapeJobs, setScrapeJobs] = useState<ScrapeJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activity, setActivity] = useState<ActivityLogItem[]>([]);
  const [counts, setCounts] = useState<ApplicationsResponse['counts']>({
    total: DEFAULT_COUNTS.total,
    byStatus: { ...DEFAULT_COUNTS.byStatus },
  });

  const handleScrapeCreated = useCallback(
    (job: ScrapeJob) => {
      setScrapeJobs((previous) => [job, ...previous]);
      setActivity((previous) => [
        {
          id: `scrape-${job.id}`,
          timestamp: new Date().toISOString(),
          summary: `Queued scrape for ${job.company}`,
          details: `Keyword: ${job.keyword}`,
          status: 'applied',
          company: job.company,
        },
        ...previous,
      ]);
    },
    []
  );

  const handleApplicationCreated = useCallback((application: JobApplication) => {
    setApplications((previous) => [application, ...previous]);
    setCounts((previous) => {
      const nextByStatus = { ...previous.byStatus };
      nextByStatus[application.status] = (nextByStatus[application.status] ?? 0) + 1;

      return {
        total: (previous.total ?? 0) + 1,
        byStatus: nextByStatus,
      };
    });
    setActivity((previous) => [
      {
        id: `application-${application.id}`,
        timestamp: new Date().toISOString(),
        summary: `Logged ${application.title}`,
        details: application.company,
        status: application.status,
        company: application.company,
      },
      ...previous,
    ]);
  }, []);

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

  const loadApplications = useCallback(async () => {
    try {
      const payload = await fetchApplications();

      setApplications(payload.applications);
      setActivity(payload.activity);
      setCounts({
        total: payload.counts?.total ?? payload.applications.length,
        byStatus: {
          ...DEFAULT_COUNTS.byStatus,
          ...(payload.counts?.byStatus ?? {}),
        },
      });
    } catch (error) {
      console.error('Failed to load applications', error);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const pendingScrapes = useMemo(
    () => scrapeJobs.filter((job) => ['queued', 'running'].includes(job.status)).length,
    [scrapeJobs]
  );

  const metrics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const applicationsThisWeek = applications.filter((application) => {
      if (!application.postedAt) return false;
      const posted = new Date(application.postedAt);
      return posted >= weekAgo;
    }).length;

    const total = counts.total || applications.length;
    const interviews = counts.byStatus.interview ?? 0;
    const responses = total - (counts.byStatus.applied ?? 0);
    const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0;
    const offerRate = interviews > 0
      ? Math.round(((counts.byStatus.passed ?? 0) / interviews) * 100)
      : 0;

    return {
      applicationsThisWeek,
      interviewsScheduled: interviews,
      responseRate,
      offerRate,
    };
  }, [applications, counts]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_bottom,_rgba(34,211,238,0.15),transparent_60%)]" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-12">
        <DashboardHeader
          userName="Alex"
          pendingScrapes={pendingScrapes}
          apiBaseUrl={API_BASE_URL}
          onScrapeCreated={handleScrapeCreated}
          onApplicationCreated={handleApplicationCreated}
        />
        <StatsGrid metrics={metrics} />
        <AnalyticsCharts counts={counts} applications={applications} />

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr] xl:items-start">
          <div className="flex flex-col gap-6">
            <PipelineBoard applications={applications} />
            <RecentApplications data={applications} />
          </div>

          <div className="flex flex-col gap-6">
            <ScrapeJobsPanel jobs={scrapeJobs} refreshing={refreshing} onRefresh={fetchScrapeJobs} />
            <ActivityTimeline items={activity} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
