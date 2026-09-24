# MoTA ST Scholarship System (NFST Scheme) - Phase 1

A lightweight prototype for the **Ministry of Tribal Affairs (MoTA)** National Fellowship for Higher Education of ST Students (**NFST Scheme - Scheme Code: ARG45**).

## Quick Overview
- **Frontend**: React (Vite, plain JavaScript, functional components + hooks only, no external UI libraries), `react-router-dom`, plain CSS with design color tokens.
- **Backend**: Node.js & Express REST API with CORS enabled.
- **Data Persistence**: Flat-file JSON data store (`backend/src/data/applications.json`).
- **Authentication**: Working applicant and admin login/logout with role persistence in `localStorage`.

---

## Dummy Credentials

| Role | Email | Password |
|---|---|---|
| **Applicant** | `applicant@nfst.gov.in` | `applicant123` |
| **Ministry Admin** | `admin@mota.gov.in` | `admin123` |

*Under each login form, quick-fill buttons are provided to instantly populate credentials with one click.*

---

## Getting Started

### 1. Start Backend API Server
```bash
cd backend
npm install
npm start
```
The backend starts at `http://localhost:5000` (or `5001` if `5000` is busy).

### 2. Start Frontend Dev Server
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Features Implemented in Phase 1

1. **Applicant Workflow**:
   - Secure login with `applicant@nfst.gov.in`.
   - Comprehensive application form (Full Name, Date of Birth, ST Category fixed, PVTG/Divyangan preference indicator, M.Phil/Ph.D. degree selection, UGC institution, PG mark %, document filename uploads).
   - Dynamic monthly fellowship computation (₹25,000 for M.Phil; ₹28,000 for Ph.D.).
   - Automatic redirect upon submission to the **Status Tracking Page**.
   - Stepper UI for positive paths (`Submitted` → `Under Review` → `Selected`).
   - Distinct red rejection alert banner for `Rejected` applications (not forced into stepper).

2. **Ministry Admin Workflow**:
   - Secure login with `admin@mota.gov.in`.
   - Admin dashboard with metric counters and application list.
   - Preference flags highlighting PVTG and Divyangan priority candidates.
   - In-depth Review Panel with **AI Document Analysis** (OCR confidence score, extracted name/DOB, mismatch discrepancy alert, verification checklist).
   - Action buttons ("Approve & Select", "Reject", "Mark as Under Review") that make live `PATCH` requests to update status.

3. **Session Management**:
   - Session stored in `localStorage` so page refreshes maintain role and state.
   - Working Logout button in top navigation bar that terminates the session and safely redirects to login.

For detailed documentation, architectural specifics, and Phase 2 roadmap, refer to [PROJECT.md](./PROJECT.md).
