# Jobsphere Frontend

React + Vite dashboard shell for the Jobsphere personal tracker.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   The app will boot on http://127.0.0.1:5173 by default.
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview the production build:
   ```bash
   npm run preview
   ```

## Tech Stack
- Vite 5 + React 18 + TypeScript
- Tailwind CSS for styling
- lucide-react icon set

## Next Steps
- Wire API calls to the Laravel backend for authentication state, scraping jobs, and pipeline data.
- Replace mocked data in `src/data/mock.ts` with live queries once endpoints are ready.
- Introduce state management (React Query/Zustand) as data sources grow.