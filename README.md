# Hirewell — Job Board Web App

A full-stack job board: employers post jobs, candidates search and apply.
Built with **React + Vite + Tailwind CSS** (frontend) and **Node.js + Express + MongoDB/Mongoose** (backend).

```
job-board/
├── server/     ← Node.js/Express API + MongoDB
└── client/     ← React (Vite) + Tailwind frontend
```

---

## 1. Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas connection string
- (Optional) A Gmail account + [App Password](https://support.google.com/accounts/answer/185833) for sending real emails, or any other SMTP provider

---

## 2. Backend setup (`/server`)

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobboard
JWT_SECRET=replace_with_a_long_random_string
CLIENT_URL=http://localhost:5173

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Install and run:

```bash
npm install
npm run dev      # starts on http://localhost:5000 with nodemon (auto-restart)
```

Confirm it's alive: open `http://localhost:5000/api/health` → should return `{"status":"ok"}`.

### (Optional) Seed sample data

This creates a sample employer, candidate, and 3 jobs so you can test the frontend immediately:

```bash
npm run seed
```

Login with:
- Employer: `employer@example.com` / `password123`
- Candidate: `candidate@example.com` / `password123`

---

## 3. Frontend setup (`/client`)

```bash
cd client
cp .env.example .env
```

`.env` should point at your backend:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Install and run:

```bash
npm install
npm run dev       # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 4. How the features map to the code

| Feature | Where it lives |
|---|---|
| Home Page | `client/src/pages/HomePage.jsx` |
| Job Listings + Search | `client/src/pages/JobListingsPage.jsx`, backend search in `jobController.js::getJobs` |
| Job Detail Page | `client/src/pages/JobDetailPage.jsx` |
| Employer Dashboard | `client/src/pages/EmployerDashboard.jsx` |
| Candidate Dashboard | `client/src/pages/CandidateDashboard.jsx` |
| Job Application + Resume Upload | `client/src/pages/ApplyPage.jsx`, `server/src/middleware/uploadResume.js` |
| Email Notifications | `server/src/utils/email.js` (Nodemailer), triggered in `applicationController.js` |
| Auth & Security | `server/src/controllers/authController.js`, `middleware/auth.js`, JWT + bcrypt + helmet + rate-limiting |
| Mobile Responsiveness | Tailwind responsive classes throughout `client/src` |

---

## 5. Core data models

- **User** (`server/src/models/User.js`) — single collection, `role` field distinguishes `candidate` / `employer`, with role-specific sub-objects (`candidateProfile`, `employerProfile`).
- **Job** (`server/src/models/Job.js`) — owned by an employer (`employer` ref), has a MongoDB text index across title/description/skills/location/company for search.
- **Application** (`server/src/models/Application.js`) — links `job` + `candidate` + `employer`, unique compound index prevents duplicate applications, has a `status` enum (`submitted → under_review → shortlisted → hired`, or `rejected`).

---

## 6. API reference (quick)

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/jobs` | Public — supports `?search=&location=&jobType=&workMode=&experienceLevel=&page=&limit=` |
| GET | `/api/jobs/featured` | Public |
| GET | `/api/jobs/:id` | Public |
| POST | `/api/jobs` | Employer |
| PUT | `/api/jobs/:id` | Employer (owner) |
| DELETE | `/api/jobs/:id` | Employer (owner) |
| GET | `/api/jobs/employer/mine` | Employer |
| POST | `/api/applications/:jobId` | Candidate (multipart: `resume`, `coverLetter`) |
| GET | `/api/applications/mine` | Candidate |
| GET | `/api/applications/job/:jobId` | Employer (owner) |
| PUT | `/api/applications/:id/status` | Employer (owner) |
| PUT | `/api/users/profile` | Authenticated |
| PUT | `/api/users/resume` | Authenticated (multipart: `resume`) |

---

## 7. Security features already in place

- Passwords hashed with bcrypt, never returned in API responses
- JWT auth with 7-day expiry (configurable), Bearer token scheme
- Role-based authorization middleware (`authorize('employer')`, etc.)
- `helmet` for HTTP security headers
- Rate limiting on auth routes (30 requests / 15 min) and general API (300 / 15 min)
- File upload validation: type whitelist (PDF/DOC/DOCX) + 5MB size limit
- Centralized error handler that never leaks stack traces in production

---

## 8. Next steps / production considerations

- Swap local disk resume storage for S3 or similar (multer-s3) before deploying — local files won't persist on most hosting platforms (e.g. Heroku, Vercel serverless)
- Use a real transactional email provider (SendGrid, Postmark, SES) instead of Gmail SMTP for production volume
- Add refresh tokens / shorter-lived JWTs if you need tighter session control
- Add server-side pagination caching or Redis if traffic grows
- Add automated tests (Jest + Supertest for backend, React Testing Library for frontend)
