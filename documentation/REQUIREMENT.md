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

* **Framework:** **Laravel** `^11.0`
* **PHP Package Manager:** **Composer** `^2.7`
* **JavaScript Runtime:** **Node.js** `^20.11` (LTS recommended)
* **JS Package Manager:** **npm** `^10.2` or **Yarn** `^1.22`

---

### **UI Library**

The user interface for this project is built using:

* **UI Framework:** **Tailwind CSS** `^3.0`
* **Component Library:** **ShadCN** 

---

### **Local Development Setup**

To get the project running locally, you will need a development environment that satisfies the server requirements. The recommended setup is:

* **Laravel Herd** (macOS, Windows)
* **Laravel Valet** (macOS)
* **Docker Desktop** with **Laravel Sail** (Cross-platform)

These tools come pre-packaged with the required versions of PHP, a database, and other necessary services, simplifying the setup process significantly.