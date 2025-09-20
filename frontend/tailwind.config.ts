import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          foreground: '#0b1021',
          accent: '#22d3ee',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 30px 60px -15px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;