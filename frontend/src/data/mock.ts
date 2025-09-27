import type {
  ActivityLogItem,
  JobApplication,
  StatusMeta,
} from '../types';

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

export const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-245',
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'Remote  AMER',
    mode: 'remote',
    status: 'interview',
    source: 'scraped',
    postedAt: '2025-09-15',
    lastActivity: '2025-09-19T10:24:00Z',
    notes: 'Panel interview booked for next week',
  },
  {
    id: 'app-198',
    title: 'Product Designer',
    company: 'Linear',
    location: 'San Francisco, CA',
    mode: 'hybrid',
    status: 'online_assessment',
    source: 'manual',
    postedAt: '2025-09-11',
    lastActivity: '2025-09-18T18:02:00Z',
  },
  {
    id: 'app-201',
    title: 'Staff Platform Engineer',
    company: 'Vercel',
    location: 'Remote  Global',
    mode: 'remote',
    status: 'applied',
    source: 'scraped',
    postedAt: '2025-09-16',
    lastActivity: '2025-09-17T08:33:00Z',
  },
  {
    id: 'app-157',
    title: 'Fullstack Engineer',
    company: 'Canva',
    location: 'Sydney, AU',
    mode: 'onsite',
    status: 'passed',
    source: 'manual',
    postedAt: '2025-08-10',
    lastActivity: '2025-09-10T12:10:00Z',
  },
  {
    id: 'app-129',
    title: 'Engineering Manager',
    company: 'Notion',
    location: 'New York, NY',
    mode: 'hybrid',
    status: 'rejected',
    source: 'scraped',
    postedAt: '2025-07-22',
    lastActivity: '2025-09-05T15:40:00Z',
  },
  {
    id: 'app-275',
    title: 'Data Visualization Engineer',
    company: 'Figma',
    location: 'Remote  AMER',
    mode: 'remote',
    status: 'applied',
    source: 'scraped',
    postedAt: '2025-09-19',
    lastActivity: '2025-09-19T09:05:00Z',
  },
];

export const MOCK_ACTIVITY: ActivityLogItem[] = [
  {
    id: 'activity-1',
    timestamp: '2025-09-19T17:45:00Z',
    summary: 'Sent follow-up email to Stripe recruiter',
    status: 'interview',
    company: 'Stripe',
  },
  {
    id: 'activity-2',
    timestamp: '2025-09-19T16:10:00Z',
    summary: 'Completed Linear product challenge',
    status: 'online_assessment',
    company: 'Linear',
  },
  {
    id: 'activity-3',
    timestamp: '2025-09-18T09:25:00Z',
    summary: 'Application submitted for Vercel role',
    status: 'applied',
    company: 'Vercel',
  },
  {
    id: 'activity-4',
    timestamp: '2025-09-17T20:40:00Z',
    summary: 'Received rejection from Notion',
    status: 'rejected',
    company: 'Notion',
  },
];

export const MOCK_METRICS = {
  applicationsThisWeek: 4,
  interviewsScheduled: 2,
  responseRate: 38,
  offerRate: 12,
};

export const getStatusMeta = (status: StatusMeta['key']) =>
  STATUS_META.find((item) => item.key === status)!;