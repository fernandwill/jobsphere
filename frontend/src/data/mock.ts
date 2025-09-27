import type {
  ActivityLogItem,
  ApplicationStatus,
  JobApplication,
  StatusMeta,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const STATUS_META: StatusMeta[] = [
  {
    key: 'applied',
    label: 'Applied',
    description: 'Awaiting recruiter review',
    accent: 'sky',
  },
  {
    key: 'online_assessment',
    label: 'Online Assessment',
    description: 'Assessment in progress',
    accent: 'violet',
  },
  {
    key: 'interview',
    label: 'Interview',
    description: 'Interviews scheduled or ongoing',
    accent: 'amber',
  },
  {
    key: 'passed',
    label: 'Passed',
    description: 'Offers or final approvals',
    accent: 'emerald',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    description: 'Closed and archived',
    accent: 'rose',
  },
];

export const getStatusMeta = (status: StatusMeta['key']) =>
  STATUS_META.find((item) => item.key === status)!;

const normaliseStatus = (value: unknown): ApplicationStatus => {
  const fallback: ApplicationStatus = 'applied';
  if (typeof value !== 'string') return fallback;
  return (
    [
      'applied',
      'online_assessment',
      'interview',
      'passed',
      'rejected',
    ] as ApplicationStatus[]
  ).includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : fallback;
};

export type ApplicationsResponse = {
  applications: JobApplication[];
  activity: ActivityLogItem[];
  counts: {
    total: number;
    byStatus: Record<ApplicationStatus, number>;
  };
  pipeline: any[];
};

export const fetchApplications = async (): Promise<ApplicationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/applications`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to load applications (${response.status})`);
  }

  const payload = await response.json();
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta ?? {};

  const applications: JobApplication[] = data.map((item: any) => ({
    id: String(item?.id ?? crypto.randomUUID()),
    title: item?.title ?? item?.job_title ?? 'Untitled role',
    company: item?.company ?? 'Unknown company',
    location: item?.location ?? 'Remote',
    mode: (item?.mode ?? 'remote') as JobApplication['mode'],
    status: normaliseStatus(item?.status),
    source: (item?.source ?? 'manual') as JobApplication['source'],
    postedAt: item?.postedAt ?? item?.posted_at ?? new Date().toISOString(),
    lastActivity:
      item?.lastActivity ?? item?.last_activity ?? new Date().toISOString(),
    notes: item?.notes ?? undefined,
  }));

  const activity: ActivityLogItem[] = Array.isArray(meta?.activity)
    ? meta.activity.map((item: any, index: number) => ({
        id: String(item?.id ?? `activity-${index}`),
        timestamp: item?.timestamp ?? new Date().toISOString(),
        summary:
          item?.summary ?? `${item?.company ?? 'Company'} — ${item?.status ?? ''}`,
        details: item?.details ?? undefined,
        status: normaliseStatus(item?.status),
        company: item?.company ?? 'Unknown company',
      }))
    : [];

  const counts = meta?.counts ?? { total: applications.length, byStatus: {} };
  const normalisedCounts: ApplicationsResponse['counts'] = {
    total: typeof counts.total === 'number' ? counts.total : applications.length,
    byStatus: {
      applied: counts.byStatus?.applied ?? 0,
      online_assessment: counts.byStatus?.online_assessment ?? 0,
      interview: counts.byStatus?.interview ?? 0,
      passed: counts.byStatus?.passed ?? 0,
      rejected: counts.byStatus?.rejected ?? 0,
    },
  };

  const pipeline = Array.isArray(meta?.pipeline) ? meta.pipeline : [];

  return { applications, activity, counts: normalisedCounts, pipeline };
};
