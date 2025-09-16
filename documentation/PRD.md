# Product Requirements Document: Personal Job Tracker

---

### **1. Introduction & Vision** 🎯

This project is a **Personal Job Application Tracker and Scraper**. It's designed for a single user to manage and streamline their entire job search process. The app will provide a central dashboard to scrape job listings from specific companies, track application progress through a defined pipeline, and visualize personal application statistics to gain insights into the job hunt.

---

### **2. Core Features & Functionality**

#### **1. Authentication**
* **Social Logins Only:** User authentication will be handled exclusively through **Google** and **GitHub OAuth**. There will be no traditional email/password registration. This simplifies access and keeps the application secure for personal use.

#### **2. On-Demand Scraping**
* **Keyword-Based Scraping:** The user will have an input field to enter a company name (e.g., "Google", "Stripe").
* **Scraping Process:** Upon submission, a background job will be triggered to scrape the career page of the specified company.
* **Results Display:** The scraped job listings (Title, URL) will be displayed on the user's dashboard, ready to be acted upon.

#### **3. Application Tracking**
* **Manual Tracking:** From a scraped listing or a manual entry, the user can click an "Add to Tracker" button.
* **Tracked Information:** Each tracked application will store the Job Title, Company Name, and Application URL.

#### **4. Progress Pipeline**
* **Defined Statuses:** Each tracked application will have a status that can be updated by the user. The statuses are fixed:
    1.  **Applied**
    2.  **Online Assessment**
    3.  **Interview**
    4.  **Passed** ✅
    5.  **Rejected** ❌
* **Interface:** The progress can be managed via a simple dropdown next to each application or a Kanban-style drag-and-drop board.

#### **5. Statistics & Visualization**
* **Personal Dashboard:** The main dashboard will feature data visualizations based on the user's tracked applications.
* **Key Charts:**
    * A **pie chart** showing the distribution of application statuses (e.g., 50% Applied, 20% Interview, 30% Rejected).
    * A **bar chart** showing the number of applications sent per week or month.
    * A simple funnel view showing the conversion rate from one stage to the next.

---

### **6. Technical Implementation & Deployment**

* **Backend:** **Laravel**. It will handle authentication, database interactions, and dispatching scraping jobs.
* **Authentication:** **Laravel Socialite** will be used for Google and GitHub logins.
* **Scraping:** **Goutte** (for simple sites) or **Symfony Panther** (for JS-heavy sites) will perform the scraping. Jobs will be processed in the background using **Laravel Queues**.
* **Frontend & Visualization:**
    * **Inertia.js** with Vue/React is a strong choice for a modern single-page feel.
    * A charting library like **Chart.js** or **ApexCharts** will be used to create the data visualizations.
* **Deployment:** **Cloudflare Pages**.
    * **Important Consideration:** A standard Laravel application cannot be deployed directly to Cloudflare Pages. The recommended approach is a hybrid model:
        1.  **Frontend:** Deploy the Vue/React frontend to **Cloudflare Pages**.
        2.  **Backend:** Deploy the Laravel backend as a separate API on a traditional VPS (**DigitalOcean**, **Linode**) or a serverless platform (**Laravel Vapor**).