export type ApplicationStatus =
  | 'applied'
  | 'online_assessment'
  | 'interview'
  | 'passed'
  | 'rejected';

export type ApplicationSource = 'scraped' | 'manual';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: WorkMode;
  status: ApplicationStatus;
  source: ApplicationSource;
  postedAt: string;
  lastActivity: string;
  notes?: string;
}

export interface ScrapeJob {
  id: string;
  keyword: string;
  company: string;
  roleCount: number;
  queuedAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  eta: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  error?: string | null;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  summary: string;
  details?: string;
  status: ApplicationStatus;
  company: string;
}

export interface StatusMeta {
  key: ApplicationStatus;
  label: string;
  description: string;
  accent: string;
}