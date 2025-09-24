# Project Task List: Personal Job Tracker

This document outlines the development tasks required to build the application, broken down into logical phases.

---

### **Phase 1: Project Setup & Authentication (Day 1-2)**

The goal of this phase is to initialize the project, set up the database, and implement user authentication.

- [v] **1. Initialize Laravel Project:**
    - `composer create-project laravel/jobsphere`
- [v] **2. Configure Environment:**
    - Set up the `.env` file with app details and a local database connection.
- [v] **3. Set Up Database:**
    - Create a new MySQL or PostgreSQL database.
    - Run the initial `php artisan migrate` command to verify the connection.
- [v] **4. Install Laravel Socialite:**
    - `composer require laravel/socialite`
- [v] **5. Implement Social Authentication:**
    - Add Google and GitHub credentials to `.env` and `config/services.php`.
    - Create routes and controller methods for handling the OAuth redirect and callback.
    - Modify the default user migration if needed.
- [v] **6. Set Up Frontend Scaffolding:**
    - Implemented a standalone Vite + React SPA with Tailwind CSS.
    - Established component architecture (e.g., pipeline board, stats grid, scrape panel) powered by mock data.
    - _Note:_ Material UI/Inertia.js were not adopted; custom Tailwind styling is in place instead.

---

### **Phase 2: Core Scraping Logic (Day 3-4)**

This phase focuses on building the functionality to scrape job data from company websites.

- [ ] **1. Install Scraping Tools:**
    - `composer require fabpot/goutte`
- [ ] **2. Create Scraping Service:**
    - Build a dedicated PHP class (`Services/ScraperService.php`) to handle the logic of fetching and parsing HTML.
- [ ] **3. Create Scraping Command:**
    - `php artisan make:command ScrapeCompanyCommand`
    - Implement the command to accept a company name/URL and use the `ScraperService`.
- [ ] **4. Set Up Queues:**
    - Configure Redis or a database driver for background jobs in `.env`.
- [ ] **5. Build Scraping UI:**
    - Create a simple form on the dashboard where a user can input a company name.
    - The form submission should dispatch a queued job that runs the scraping command.

---

### **Phase 3: Application Tracking (Day 5-6)**

This phase involves creating the system for users to track their job applications.

- [ ] **1. Create Application Model & Migration:**
    - `php artisan make:model Application -m`
    - Define the schema in the migration file: `user_id`, `company`, `job_title`, `url`, `status`.
- [ ] **2. Define Status Enum:**
    - Create a PHP Enum for the statuses: `Applied`, `OnlineAssessment`, `Interview`, `Passed`, `Rejected`.
- [ ] **3. Build "Add Application" Feature:**
    - Create a form (or button on scraped results) to add a new tracked application.
    - Write the controller logic to store the new application in the database.
- [ ] **4. Build Application List UI:**
    - Create a component to display all tracked applications for the logged-in user.
    - _Status:_ React components (`PipelineBoard`, `RecentApplications`) exist with mock data; real data wiring is pending.
- [ ] **5. Implement Status Updates:**
    - Add a dropdown or Kanban board interface to allow users to update the status of each application.
    - Create the backend route and controller method to handle the status update.
    - _Status:_ Frontend board layout exists, but drag-and-drop/status mutation logic and API endpoints are not yet built.

---

### **Phase 4: Dashboard & Visualization (Day 7)**

This phase is about creating the main dashboard to visualize the user's job search data.

- [ ] **1. Create Dashboard Controller:**
    - Write a controller method that fetches all of the user's application data.
- [ ] **2. Calculate Statistics:**
    - Add logic to the controller to count applications by status and group them by date.
- [ ] **3. Install Charting Library:**
    - `npm install chart.js` or another library of your choice.
- [ ] **4. Build Dashboard Components:**
    - Create Vue/React components for the dashboard layout.
    - Implement a pie chart for application statuses.
    - Implement a bar chart for applications per week/month.
    - _Status:_ Core layout components (header, stats cards, pipeline board, activity timeline) are in place using mock data; charting work remains.

---

### **Phase 5: Deployment (Day 8)**

The final phase is to deploy the application to a live environment.

- [ ] **1. Prepare Backend for Deployment:**
    - Set up a new server/database on a provider like DigitalOcean.
    - Configure your repository with GitHub Actions for automated deployment.
- [ ] **2. Deploy Laravel API:**
    - Push your code and run the deployment script.
    - Configure your production `.env` file, run migrations, and ensure queues are running.
- [ ] **3. Prepare Frontend for Deployment:**
    - Configure Vite to build your frontend assets for production.
- [ ] **4. Deploy Frontend to Cloudflare Pages:**
    - Connect your GitHub repository to Cloudflare Pages.
    - Configure the build command (`npm run build`).
    - Set the environment variables to point to your live Laravel API URL.
- [ ] **5. Final Testing:**
    - Thoroughly test the entire user flow on the live site.