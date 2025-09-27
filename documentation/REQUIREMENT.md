# Project Requirements

This document outlines the necessary software, tools, and environment configuration required to develop and run this application.

---

### **Server Requirements**

Your local development environment or production server must meet the following requirements:

* **PHP:** `^8.2`
* **Database:**
    * **MySQL** `^8.0` or
    * **PostgreSQL** `^14.0`
* **PHP Extensions:**
    * BCMath
    * Ctype
    * cURL
    * DOM
    * Fileinfo
    * JSON
    * Mbstring
    * OpenSSL
    * PCRE
    * PDO (with the appropriate driver for your database)
    * Tokenizer
    * XML

---

### **Framework & Dependencies**

This project is built on the following core technologies. You will need their respective package managers to install dependencies.

* **Framework:** **Laravel** `^12.0`
* **PHP Package Manager:** **Composer** `^2.7`
* **JavaScript Runtime:** **Node.js** `^20.11` (LTS recommended)
* **JS Package Manager:** **npm** `^10.2` or **Yarn** `^1.22`

---

### **Backend UI Stack**

The authenticated dashboard that ships with the Laravel application uses the following stack:

* **Inertia React Adapter:** `@inertiajs/react` `^1.0`
* **React Runtime:** `react` / `react-dom` `^18.0`
* **Component Library:** **Material UI** (`@mui/material`) `^5.15`
* **Styling Engine:** `@emotion/react` & `@emotion/styled` `^11.11`

---

### **Local Development Setup**

To get the project running locally, you will need a development environment that satisfies the server requirements. The recommended setup is:

* **Laravel Herd** (macOS, Windows)
* **Laravel Valet** (macOS)
* **Docker Desktop** with **Laravel Sail** (Cross-platform)

These tools come pre-packaged with the required versions of PHP, a database, and other necessary services, simplifying the setup process significantly.

---

### **Client Applications & Build Targets**

This repository currently serves two React entry points that live side by side:

1. **Laravel + Inertia Dashboard** (backend/resources/js)
    * Driven by the Laravel application and rendered via Inertia responses.
    * Uses Material UI components to deliver the authenticated user dashboard.
    * Bundled through the Laravel Vite pipeline (`php artisan serve` and `npm run dev` from `backend/`).
2. **Standalone Tailwind SPA** (`frontend/` directory)
    * A separate Vite + React application that experiments with pipeline boards and other UX concepts using Tailwind CSS.
    * Runs independently from the Laravel app (`npm install` then `npm run dev` from `frontend/`).
    * Ideal for rapid prototyping without touching the Inertia-powered dashboard.

Contributors can iterate on either surface independently. Shared business logic should continue to live in Laravel services or dedicated API routes so that both clients can consume the same data sources.