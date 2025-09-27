import { useMemo } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import type { ApplicationsResponse } from '../data/mock';
import type { JobApplication } from '../types';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_COLOURS: Record<string, string> = {
  applied: 'rgba(96, 165, 250, 0.8)',
  online_assessment: 'rgba(251, 191, 36, 0.85)',
  interview: 'rgba(129, 140, 248, 0.85)',
  passed: 'rgba(74, 222, 128, 0.85)',
  rejected: 'rgba(248, 113, 113, 0.85)',
};

const formatStatusLabel = (status: keyof ApplicationsResponse['counts']['byStatus']) => {
  switch (status) {
    case 'online_assessment':
      return 'Online Assessment';
    case 'passed':
      return 'Offers';
    case 'rejected':
      return 'Rejected';
    case 'interview':
      return 'Interview';
    default:
      return 'Applied';
  }
};

const computeMonthlyBuckets = (applications: JobApplication[], months = 6) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  const counts = applications.reduce<Record<string, number>>((acc, application) => {
    const value = application.postedAt ?? application.lastActivity;
    if (!value) return acc;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.valueOf())) return acc;

    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return Array.from({ length: months }).map((_, index) => {
    const monthDate = new Date(start.getFullYear(), start.getMonth() - (months - 1 - index), 1);
    const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;

    return {
      label: monthDate.toLocaleString(undefined, { month: 'short' }),
      count: counts[key] ?? 0,
    };
  });
};

type AnalyticsChartsProps = {
  counts: ApplicationsResponse['counts'];
  applications: JobApplication[];
};

const AnalyticsCharts = ({ counts, applications }: AnalyticsChartsProps) => {
  const statusChart = useMemo(() => {
    const entries = Object.entries(counts.byStatus).filter(([, value]) => value > 0);

    if (!entries.length) return null;

    return {
      data: {
        labels: entries.map(([status]) => formatStatusLabel(status as keyof ApplicationsResponse['counts']['byStatus'])),
        datasets: [
          {
            label: 'Applications',
            data: entries.map(([, value]) => value),
            backgroundColor: entries.map(([status]) => STATUS_COLOURS[status] ?? 'rgba(148, 163, 184, 0.8)'),
            borderWidth: 0,
          },
        ],
      },
    };
  }, [counts.byStatus]);

  const trendChart = useMemo(() => {
    const buckets = computeMonthlyBuckets(applications);
    if (!buckets.some((bucket) => bucket.count > 0)) return null;

    return {
      data: {
        labels: buckets.map((bucket) => bucket.label),
        datasets: [
          {
            label: 'Applications submitted',
            data: buckets.map((bucket) => bucket.count),
            backgroundColor: 'rgba(56, 189, 248, 0.35)',
            borderColor: 'rgba(56, 189, 248, 0.9)',
            borderWidth: 2,
            borderRadius: 12,
          },
        ],
      },
    };
  }, [applications]);

  if (!statusChart && !trendChart) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {statusChart && (
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-card">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Application mix</p>
              <h3 className="text-xl font-semibold text-white">Status distribution</h3>
            </div>
          </header>
          <div className="h-64">
            <Pie
              data={statusChart.data}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: 'rgba(226, 232, 240, 0.85)',
                    },
                  },
                },
              }}
            />
          </div>
        </article>
      )}

      {trendChart && (
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-card">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/60">Last 6 months</p>
              <h3 className="text-xl font-semibold text-white">Applications submitted</h3>
            </div>
          </header>
          <div className="h-64">
            <Bar
              data={trendChart.data}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: 'rgba(226, 232, 240, 0.75)',
                      precision: 0,
                    },
                    grid: {
                      color: 'rgba(148, 163, 184, 0.2)',
                    },
                  },
                  x: {
                    ticks: {
                      color: 'rgba(226, 232, 240, 0.75)',
                    },
                    grid: {
                      color: 'rgba(148, 163, 184, 0.15)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y ?? context.raw} applications`,
                    },
                  },
                },
              }}
            />
          </div>
        </article>
      )}
    </section>
  );
};

export default AnalyticsCharts;
