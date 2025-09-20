const accentPalette = {
  sky: {
    pill: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    dot: 'bg-sky-400',
  },
  violet: {
    pill: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    dot: 'bg-violet-400',
  },
  amber: {
    pill: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    dot: 'bg-amber-400',
  },
  emerald: {
    pill: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    dot: 'bg-emerald-400',
  },
  rose: {
    pill: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    dot: 'bg-rose-400',
  },
} as const;

export type AccentKey = keyof typeof accentPalette;

export const getAccentClasses = (accent: string) => {
  if (accent in accentPalette) {
    return accentPalette[accent as AccentKey];
  }

  return accentPalette.sky;
};

export default accentPalette;
