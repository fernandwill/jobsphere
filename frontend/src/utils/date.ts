const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
] as const;

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export const formatRelativeTime = (date?: string | number | Date | null) => {
  if (!date) {
    return 'just now';
  }

  const value = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (Number.isNaN(value.getTime())) {
    return 'just now';
  }

  const deltaSeconds = (value.getTime() - Date.now()) / 1000;

  let duration = Math.abs(deltaSeconds);
  let item = DIVISIONS[0];

  for (const division of DIVISIONS) {
    if (duration < division.amount) {
      item = division;
      break;
    }
    duration /= division.amount;
    item = division;
  }

  const amount = Math.round((deltaSeconds < 0 ? -1 : 1) * duration);
  return rtf.format(amount, item.name);
};

export const formatDate = (date: string | number | Date, options?: Intl.DateTimeFormatOptions) => {
  const value = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options ?? {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value);
};
