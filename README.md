<div align="center">

# 🎓 Injibara University HRMS

### Human Resource Management System

**A full-stack MERN web application that digitizes the complete employee lifecycle for Injibara University: from recruitment to exit.**

![Node.js](https://img.shields.io/badge/Node.js-v20_LTS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)
![Status](https://img.shields.io/badge/Status-v1.0_Delivered-success)

</div>

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Project Structure](#-project-structure)
6. [Prerequisites](#-prerequisites)
7. [Installation and Setup](#-installation-and-setup)
8. [Environment Variables](#-environment-variables)
9. [Database Seeding](#-database-seeding)
10. [Running the Application](#-running-the-application)
11. [Default Credentials](#-default-credentials)
12. [User Roles and Permissions](#-user-roles-and-permissions)
13. [Modules in Detail](#-modules-in-detail)
14. [Ethiopian Payroll Logic](#-ethiopian-payroll-logic)
15. [API Overview](#-api-overview)
16. [Testing](#-testing)
17. [Production Deployment](#-production-deployment)
18. [Security Practices](#-security-practices)
19. [Troubleshooting](#-troubleshooting)
20. [Documentation](#-documentation)
21. [Roadmap](#-roadmap)
22. [Contributing](#-contributing)
23. [License](#-license)
24. [Contact](#-contact)

---

## 📖 Project Overview

The **Injibara University HRMS (IU-HRMS)** replaces manual, paper-based, and spreadsheet-driven HR record keeping with a single integrated web platform. It was built for **Injibara University** (Injibara Town, Awi Zone, Amhara Region, Ethiopia) and follows Ethiopian labour, income tax, and pension rules.

The system covers the entire employee lifecycle:

```
Recruitment → Onboarding → Daily Operations → Performance → Training → Exit
                    (Leave · Attendance · Payroll · Discipline)
```

| Metric             | Value                |
| ------------------ | -------------------- |
| Backend modules    | 13                   |
| Frontend pages     | 14                   |
| REST API endpoints | 130+                 |
| User roles         | 5                    |
| Currency           | Ethiopian Birr (ETB) |

---

## ✨ Key Features

| Module                          | Highlights                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| 🔐 **Authentication & RBAC**    | JWT sessions (30 days), bcrypt hashing, 5 roles enforced server-side                |
| 🏛️ **Departments & Positions**  | Budgets, HOD assignment, salary grades, slot tracking                               |
| 👥 **Employee Master Data**     | Auto codes (`INJ-0001`), Ethiopian name and address structure, history, documents   |
| 🌿 **Leave Management**         | 7+ leave types, balance allocation, two-stage HOD → HR approval                     |
| 🕒 **Attendance**               | Self check-in/out, 15-minute grace period, overtime, manual HR correction           |
| 💰 **Payroll**                  | 7-bracket Ethiopian income tax, 7% / 11% pension, payslips, Draft → Approved → Paid |
| 📋 **Recruitment**              | Job postings, applicant pipeline, interviews, offers, auto-convert hire to employee |
| ⭐ **Performance Appraisal**    | Weighted goals (must total 100%), self + manager + HR review, auto rating           |
| 📚 **Training**                 | Programs, nominations, attendance, scores, certificates                             |
| ⚖️ **Disciplinary & Grievance** | Warnings, hearings, resolutions                                                     |
| 🚪 **Exit & Offboarding**       | 5-department clearance, settlement, exit interview, account deactivation            |
| 🔔 **Notifications**            | In-app alerts across all modules                                                    |
| 📊 **Dashboard**                | Live KPI cards and Recharts visualizations                                          |
| 🎨 **Interface**                | Dark glassmorphism theme, 3D particle background, responsive layout                 |

---

## 🛠 Technology Stack

### Backend

| Technology               | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| Node.js v20 LTS          | Runtime                                           |
| Express.js               | REST API framework                                |
| MongoDB Atlas + Mongoose | Database and ODM                                  |
| JSON Web Token           | Authentication                                    |
| bcryptjs                 | Password hashing (12 rounds)                      |
| Multer                   | File uploads (5 MB limit)                         |
| Helmet, CORS, Morgan     | Security headers, origin control, request logging |
| express-validator        | Input validation                                  |

### Frontend

| Technology                   | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| React 18 + Vite              | SPA and build tooling                     |
| React Router                 | Client-side routing with protected routes |
| Axios                        | HTTP client with JWT interceptor          |
| Framer Motion                | Animations                                |
| React Three Fiber / Three.js | 3D particle background                    |
| Recharts                     | Dashboard charts                          |
| React Hot Toast              | Notifications                             |

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────┐
│  TIER 1: PRESENTATION  (React 18 + Vite)     │
│  14 pages · AuthContext · Axios interceptors │
└───────────────────┬──────────────────────────┘
                    │  HTTPS + JWT Bearer Token
┌───────────────────▼──────────────────────────┐
│  TIER 2: APPLICATION  (Node.js + Express)    │
│  Routes → Middleware → Controllers → Models  │
└───────────────────┬──────────────────────────┘
                    │  Mongoose ODM (TLS)
┌───────────────────▼──────────────────────────┐
│  TIER 3: DATA  (MongoDB Atlas)               │
│  injibara_hrms database                      │
└──────────────────────────────────────────────┘
```

The backend follows the **MVC pattern**. The complete architecture, ER, sequence, workflow, DFD, and deployment diagrams are in the SRS document.

---

## 📁 Project Structure

```
injibara-university-hrms/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/                 # Business logic (one per module)
│   ├── middleware/
│   │   ├── authMiddleware.js        # protect() + authorize(...roles)
│   │   └── uploadMiddleware.js      # Multer configuration
│   ├── models/                      # Mongoose schemas
│   ├── routes/                      # Express routers (13 modules)
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   ├── generateToken.js
│   │   ├── generateEmployeeCode.js  # INJ-XXXX generator
│   │   ├── taxCalculator.js         # Ethiopian tax + pension engine
│   │   ├── seedLeaveTypes.js
│   │   ├── seedSalaryStructures.js
│   │   ├── seedWorkSchedule.js
│   │   └── resetAdmin.js
│   ├── uploads/                     # Uploaded photos and documents
│   ├── .env                         # Secrets (never commit)
│   ├── package.json
│   └── server.js                    # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/ParticleBackground.jsx
│   │   │   └── ui/                  # GradientText, StatCard, PageHeader, LoadingSpinner
│   │   ├── context/AuthContext.jsx
│   │   ├── layouts/MainLayout.jsx   # Sidebar, topbar, live clock
│   │   ├── pages/                   # 14 pages
│   │   ├── services/api.js          # Axios instance
│   │   ├── App.jsx                  # Router + route guards
│   │   ├── index.css                # Design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── IU-HRMS-SRS-FINAL.docx       # Software Requirements Specification
│   └── Injibara-University-HRMS-Manual.md   # User manual
│
├── .gitignore
└── README.md
```

---

## ✅ Prerequisites

| Software              | Version                             | Check                                          |
| --------------------- | ----------------------------------- | ---------------------------------------------- |
| Node.js               | v20.x LTS                           | `node -v`                                      |
| npm                   | v10+                                | `npm -v`                                       |
| Git                   | v2+                                 | `git --version`                                |
| MongoDB Atlas account | Free M0 tier is enough              | [cloud.mongodb.com](https://cloud.mongodb.com) |
| Modern browser        | Chrome 90+ / Firefox 88+ / Edge 90+ |                                                |

---

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd injibara-university-hrms
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create the `.env` file (see [Environment Variables](#-environment-variables)).

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Confirm the API base URL in `frontend/src/services/api.js` points to your backend (default `http://localhost:5000/api`).

### 4. Prepare MongoDB Atlas

1. Create a cluster and a database user.
2. Under **Network Access**, allow your IP address (or `0.0.0.0/0` for development only).
3. Copy the connection string into `MONGO_URI`.

---

## 🔑 Environment Variables

Create `backend/.env`:

```env
# Database
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/injibara_hrms

# Authentication
JWT_SECRET=replace-with-a-long-random-string-of-64-or-more-characters
JWT_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

| Variable     | Required | Description                                             |
| ------------ | -------- | ------------------------------------------------------- |
| `MONGO_URI`  | ✅       | MongoDB Atlas connection string                         |
| `JWT_SECRET` | ✅       | Signing secret for JWT tokens. Keep it private and long |
| `JWT_EXPIRE` | ✅       | Token lifetime (`30d`)                                  |
| `PORT`       | ✅       | Backend port (`5000`)                                   |
| `NODE_ENV`   | ✅       | `development` or `production`                           |
| `CLIENT_URL` | ✅       | Allowed CORS origin (frontend URL)                      |

> ⚠️ **Never commit `.env` to Git.** It must be listed in `.gitignore`.

---

## 🌱 Database Seeding

Run these **once**, from the `backend` folder, after the first successful connection:

```bash
node utils/seedLeaveTypes.js        # 7 standard Ethiopian leave types
node utils/seedSalaryStructures.js  # 7 salary grades with allowances
node utils/seedWorkSchedule.js      # Standard university working hours
```

Create the first Super Admin (choose one):

```bash
# Option A: reset script (creates the default admin)
node utils/resetAdmin.js

# Option B: API call
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@injibara.edu.et","password":"Admin@2024","role":"super_admin"}'
```

> 💡 `resetAdmin.js` is also the recovery tool if the admin password is forgotten. Note that the version that clears all users deletes every account, so read the script before running it on live data.

---

## ▶️ Running the Application

Open two terminals.

**Terminal 1: Backend**

```bash
cd backend
npm run dev        # development (nodemon)
# npm start        # production
```

Expected output: `MongoDB Connected: ...` and `Server running on port 5000`.

**Terminal 2: Frontend**

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## 🔓 Default Credentials

| Field    | Value                   |
| -------- | ----------------------- |
| Email    | `admin@injibara.edu.et` |
| Password | `Admin@2024`            |
| Role     | `super_admin`           |

> 🔒 **Change this password immediately after first login** (Profile → Security), and write the new password down. There is no email-based "forgot password" feature in v1.0; recovery is done by an administrator using `resetAdmin.js`.

---

## 👤 User Roles and Permissions

| Capability                    | Super Admin | HR Manager | Payroll Officer |       HOD       | Employee |
| ----------------------------- | :---------: | :--------: | :-------------: | :-------------: | :------: |
| Manage users and roles        |     ✅      |            |                 |                 |          |
| Departments / Positions       |     ✅      |     ✅     |                 |      view       |          |
| Employee master data          |     ✅      |     ✅     |                 | own dept (view) | own only |
| Leave: apply                  |     ✅      |     ✅     |       ✅        |       ✅        |    ✅    |
| Leave: first approval         |     ✅      |     ✅     |                 |       ✅        |          |
| Leave: final approval         |     ✅      |     ✅     |                 |                 |          |
| Attendance: self check-in/out |     ✅      |     ✅     |       ✅        |       ✅        |    ✅    |
| Attendance: manual entry      |     ✅      |     ✅     |                 |                 |          |
| Payroll: process              |     ✅      |     ✅     |       ✅        |                 |          |
| Payroll: approve              |     ✅      |     ✅     |                 |                 |          |
| Payroll: mark paid            |     ✅      |            |       ✅        |                 |          |
| Payslip view                  |     all     |    all     |       all       |       own       |   own    |
| Recruitment                   |     ✅      |     ✅     |                 |                 |          |
| Appraisal: create / finalize  |     ✅      |     ✅     |                 |                 |          |
| Appraisal: manager review     |     ✅      |     ✅     |                 |       ✅        |          |
| Appraisal: self-appraisal     |             |            |                 |                 |    ✅    |
| Training nominate             |     ✅      |     ✅     |                 |       ✅        |          |
| Disciplinary cases            |     ✅      |     ✅     |                 |                 |          |
| Exit and offboarding          |     ✅      |     ✅     |                 |                 |          |

All permissions are enforced **on the server** for every request; the interface only hides what a role cannot use.

---

## 🧩 Modules in Detail

### Leave workflow

```
Employee applies → [balance and overlap check] → Pending
   → HOD decision → Approved by HOD / Rejected
   → HR decision  → Approved (days move to "used", employee On-Leave) / Rejected
```

Rejected or cancelled requests restore the reserved days. Weekends are excluded from the day count.

### Attendance rules

- Standard start 08:00, **15-minute grace period** (after 08:15 → _Late_)
- Work hours = check-out − check-in − 1 hour lunch
- Overtime = hours beyond 8
- Under 4 hours → _Half-Day_
- One record per employee per day (compound unique index)

### Appraisal rating scale

| Final score | Rating            |
| ----------- | ----------------- |
| 90–100      | Excellent         |
| 75–89       | Very Good         |
| 60–74       | Good              |
| 45–59       | Needs Improvement |
| 0–44        | Unsatisfactory    |

Goal weights must total exactly **100%**. Final score is the weighted average of manager scores.

### Exit clearance

Library · IT · Finance · Hostel · HR. All five must be cleared before the status becomes _Clearance Done_. Completing the exit sets the employee to _Terminated_ and disables their login.

---

## 💰 Ethiopian Payroll Logic

```
Gross       = Basic + Allowances + Overtime Pay + Bonuses − Unpaid Leave
Pension(Ee) = Basic × 7%          (deducted from the employee)
Pension(Er) = Basic × 11%         (paid by the university)
Taxable     = Gross − Pension(Ee)
Net         = Gross − Pension(Ee) − Income Tax − Other Deductions
Overtime    = (Basic ÷ 30 ÷ 8) × 1.25 × Overtime Hours
```

### Income tax brackets (monthly, ETB)

| Taxable income   | Rate | Fixed deduction |
| ---------------- | ---- | --------------- |
| 0 – 600          | 0%   | 0               |
| 601 – 1,650      | 10%  | 60              |
| 1,651 – 3,200    | 15%  | 142.50          |
| 3,201 – 5,250    | 20%  | 302.50          |
| 5,251 – 7,800    | 25%  | 565             |
| 7,801 – 10,900   | 30%  | 955             |
| 10,901 and above | 35%  | 1,500           |

`Tax = (Taxable × Rate) − Fixed deduction`

**Worked example:** Basic 10,000 + allowances 3,500 → Gross 13,500. Pension 700. Taxable 12,800. Tax = (12,800 × 0.35) − 1,500 = **2,980**. Net = 13,500 − 700 − 2,980 = **9,820**.

> If the Ethiopian government revises the brackets or pension rates, update `backend/utils/taxCalculator.js`.

Payroll status flow: **Draft → Approved (HR) → Paid (Payroll Officer)**. A unique index prevents more than one record per employee per month.

---

## 🌐 API Overview

Base URL: `http://localhost:5000/api`

All protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

| Module         | Base route       |
| -------------- | ---------------- |
| Authentication | `/auth`          |
| Departments    | `/departments`   |
| Positions      | `/positions`     |
| Employees      | `/employees`     |
| Leave          | `/leaves`        |
| Attendance     | `/attendance`    |
| Payroll        | `/payroll`       |
| Recruitment    | `/recruitment`   |
| Appraisals     | `/appraisals`    |
| Training       | `/training`      |
| Disciplinary   | `/disciplinary`  |
| Exit           | `/exit`          |
| Notifications  | `/notifications` |

**Quick example: login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@injibara.edu.et","password":"Admin@2024"}'
```

**Standard response shape**

```json
{ "success": true, "data": { } }
{ "success": false, "message": "Descriptive error message" }
```

The complete endpoint reference (method, route, access level, description) is in **Appendix A of the SRS**.

---

## 🧪 Testing

- **API testing:** every endpoint exercised with Postman (import your saved collection).
- **Functional testing:** all 14 pages exercised in the browser, including every workflow transition.
- **Authorization testing:** restricted actions attempted from each lower role (expect HTTP 403).
- **Calculation testing:** payroll tax checked against hand-calculated values for all seven brackets.

Representative checks:

| Scenario                                 | Expected |
| ---------------------------------------- | -------- |
| Wrong password                           | HTTP 401 |
| Leave request over balance               | HTTP 400 |
| Overlapping leave dates                  | HTTP 400 |
| Duplicate work email                     | HTTP 400 |
| Appraisal goal weights ≠ 100%            | HTTP 400 |
| Delete department with employees         | HTTP 400 |
| Employee role calls `GET /api/employees` | HTTP 403 |

The full test case tables are in Section 12 of the SRS.

---

## 🚢 Production Deployment

Recommended topology: **Browser → Nginx (SSL, static files) → Node.js (PM2) → MongoDB Atlas**.

```bash
# Backend
cd backend
npm install --production
pm2 start server.js --name iu-hrms-api
pm2 save && pm2 startup

# Frontend
cd ../frontend
npm run build                      # outputs /dist
sudo cp -r dist/* /var/www/iu-hrms/
```

Nginx essentials:

```nginx
server {
    listen 443 ssl;
    server_name hrms.example.edu.et;

    root /var/www/iu-hrms;
    index index.html;
    client_max_body_size 6M;

    location / { try_files $uri $uri/ /index.html; }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
    }
}
```

Production checklist:

- [ ] `NODE_ENV=production`
- [ ] Strong, unique `JWT_SECRET`
- [ ] `CLIENT_URL` set to the real HTTPS origin
- [ ] Atlas network access restricted to the server IP
- [ ] HTTPS certificate installed
- [ ] Default admin password changed
- [ ] Public registration route restricted (see below)
- [ ] Atlas backups enabled

---

## 🛡 Security Practices

- Passwords hashed with **bcrypt (12 rounds)**; the password field is never returned by queries
- **JWT** verification on every protected route, plus server-side role checks
- **Helmet** security headers and a **CORS** allow-list
- Input validation and Mongoose schema validation
- Upload limits: 5 MB, restricted file types
- Secrets only in `.env`

> ⚠️ **Important for production:** `POST /api/auth/register` is open in this version so the first admin can be created. After creating your accounts, restrict this route to `super_admin` only (or remove it) so strangers cannot register privileged users.

---

## 🩺 Troubleshooting

| Problem                              | Likely cause                        | Fix                                                           |
| ------------------------------------ | ----------------------------------- | ------------------------------------------------------------- |
| `MongoDB connection error`           | Wrong `MONGO_URI` or IP not allowed | Check the URI and Atlas Network Access                        |
| `Invalid credentials` at login       | Wrong or changed password           | Run `node utils/resetAdmin.js`                                |
| `401` on every request               | Expired or missing token            | Log in again; check the Axios interceptor                     |
| CORS error in the browser            | `CLIENT_URL` mismatch               | Match it exactly to the frontend origin                       |
| `EADDRINUSE: port 5000`              | Port already used                   | Stop the other process or change `PORT`                       |
| Blank page after build               | SPA routing not configured          | Add the `try_files` fallback in Nginx                         |
| Leave request says "no balance"      | Balances not allocated              | Use bulk allocation: `POST /api/leaves/balances/allocate-all` |
| Payroll shows no overtime            | No attendance for that month        | Record attendance first                                       |
| Pre-save hook error on user creation | Old `next()` hook style             | Use an `async` hook without `next`                            |

---

## 📚 Documentation

| Document                                       | Location                                  |
| ---------------------------------------------- | ----------------------------------------- |
| Software Requirements Specification (IEEE 830) | `docs/IU-HRMS-SRS-FINAL.docx`             |
| User Manual (14 modules, step by step)         | `docs/Injibara-University-HRMS-Manual.md` |
| API reference                                  | SRS, Appendix A                           |

---

## 🗺 Roadmap

**Planned for future versions (not in v1.0):**

- [ ] Native mobile applications (iOS and Android)
- [ ] Biometric attendance device integration
- [ ] Amharic (Ethiopic script) interface
- [ ] Automated email and SMS notifications
- [ ] ERCA integration for tax reporting
- [ ] Bank API integration for salary disbursement
- [ ] Custom report builder with Excel/PDF export
- [ ] Two-factor authentication
- [ ] Succession planning module

---

## 🤝 Contributing

This is a proprietary project built for Injibara University. Internal contributors should:

1. Create a branch: `git checkout -b feature/short-description`
2. Follow the existing MVC structure and naming conventions
3. Write clear commit messages, e.g. `feat(payroll): add bonus field to bulk processing`
4. Test the affected endpoints and pages before opening a pull request
5. Never commit `.env`, `node_modules`, or `uploads/`

Suggested `.gitignore` entries:

```
node_modules/
.env
uploads/
dist/
*.log
```

---

## 📄 License

**Proprietary. All rights reserved.**
© 2026 Injibara University. This software and its documentation are confidential property of Injibara University. Copying, distribution, or modification without written permission is prohibited.

---

## 📬 Contact

|                      |                                                  |
| -------------------- | ------------------------------------------------ |
| **Organization**     | Injibara University, Human Resource Office       |
| **Location**         | Injibara Town, Awi Zone, Amhara Region, Ethiopia |
| **Development team** | _add your name / team here_                      |
| **Email**            | _add contact email here_                         |

---

<div align="center">

**Built for Injibara University** 🇪🇹

</div>
