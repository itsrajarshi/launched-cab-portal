<!--
	README for: Cab Booking Portal for Corporate Offices
	Purpose: explain why the project exists, what it does, how to run it, and where to find key code
-->

# Cab Booking Portal — Corporate Offices

> A full‑stack web application to automate corporate cab bookings and vendor coordination. Built as a real‑world case study and implementation project.

## 1. Why this project? (Introduction)

### 1.1 Overview

Corporate offices frequently require reliable transportation for employees and guests. Manual booking workflows — phone calls, messages, spreadsheets — are slow, error‑prone, and hard to scale. The Cab Booking Portal digitizes this process: companies create booking requests, vendors receive them in real time, drivers and vehicles are assigned, and trips are tracked through their full lifecycle (booked → ongoing → completed → cancelled).

Real‑time messaging (RabbitMQ), secure APIs, and modern front‑end UX bring transparency and efficiency to a traditionally manual operation.

---

## 2. Problem Statement

### 2.1 Background & Context

Many organizations depend on ad‑hoc/manual cab booking channels that lack centralized visibility and automation. Vendors managing multiple corporate clients struggle to coordinate requests and allocate drivers; companies lack standardized dashboards to monitor bookings and payments.

### 2.2 Problem Definition

Key issues addressed by this project:
- Lack of real‑time communication between companies and vendors
- No centralized dashboards for booking and trip lifecycle management
- Vendor coordination bottlenecks when a vendor cannot fulfil a request
- Inadequate trip lifecycle tracking and driver/vehicle management
- Billing and invoice transparency gaps

---

## 3. Objective

Design and implement a Cab Booking Portal that:
- Automates the cab booking lifecycle from request to completion
- Delivers real‑time notifications and coordination between companies and vendors
- Provides role‑based dashboards (Company / Vendor / Driver)
- Supports vendor management (drivers, vehicles, invoices)
- Includes an “Open Market” fallback to reassign unfulfilled bookings

---

## 4. Proposed Solution (Implemented Tech Stack)

This project is implemented as a modern, event‑driven full‑stack application using the following technologies:

- Frontend: Next.js (TypeScript) + Tailwind CSS
	- Responsive, componentized UI; pages and shared components under `frontend/src/`.
- Backend: Node.js + Express.js
	- REST API and business logic located in `backend/index.js` and `backend/routes/`.
- Database: Supabase (Postgres)
	- Supabase client and DB interactions in `backend/supabase.js`.
- Messaging / Async: RabbitMQ
	- Booking notifications and message publishes in `backend/rabbitmq.js`.
- Authentication: JWT
	- Middleware in `backend/middleware/authenticateToken.js` and role checks handled in auth routes and frontend `AuthContext`.

Key design choices:
- Event‑driven notifications for low‑latency vendor coordination (RabbitMQ)
- Centralized API layer to keep frontend decoupled from backend implementation (`frontend/src/lib/api.ts`)
- Role‑based authorization to enforce Company, Vendor, and Driver access rules

---

## 5. Expected Outcome

- A working MVP that enables companies to request cabs and vendors to accept/reject/assign drivers
- Real‑time booking updates and a persisted trip lifecycle
- Vendor tools for managing drivers, vehicles, and invoices
- Clear audit and reporting capabilities for bookings and billing

---

## 6. Project Structure (high level)

- `frontend/` — Next.js app (pages/components/layouts/styles)
	- Key files: `src/context/AuthContext.tsx`, `src/lib/api.ts`, `src/components/Modal.tsx`, `src/app/dashboard/*`
- `backend/` — Express server + routes
	- Key files: `index.js`, `routes/*.js`, `rabbitmq.js`, `supabase.js`, `middleware/authenticateToken.js`
- `docs/` — Workflow and architecture notes (`docs/WORKFLOW.md`)

---

## 7. How it works (workflow summary)

1. Company user creates a booking request via the frontend form.
2. Backend persists the booking to Supabase and publishes a booking message to RabbitMQ.
3. Vendors subscribed to the company’s bookings receive the message and can Accept / Reject / Place into Open Market.
4. When a vendor accepts, they assign driver & vehicle and the booking status updates to `upcoming` → `ongoing` → `completed` as the trip progresses.
5. All status changes are persisted and reflected across dashboards in real time.

---

## 8. Features

- Multi‑role dashboards (Company / Vendor / Driver)
- Real‑time booking notifications using RabbitMQ
- Booking lifecycle: submit, accept, start, end, cancel
- Driver & vehicle management (CRUD)
- Invoice & billing management
- Open Market fallback for unassigned bookings
- JWT authentication and role checks
- Modern responsive UI using Tailwind CSS

---

## 9. Quick Start (run locally)

1. Clone the repo

```bash
git clone <repo-url>
cd launched-capstone-project
```

2. Backend

```powershell
cd backend
npm install
# create a .env with SUPABASE and RABBITMQ values (see backend/README.md)
node index.js
# or for development with auto-reload: npx nodemon index.js
```

3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 (or the port shown by Next.js).

---

## 10. Tests (example)

- Example unit test for RabbitMQ utility (Jest). Add `backend/rabbitmq.test.js` and run `npm test` after installing Jest as a dev dependency.

---

## 11. Notes & Next steps

- Map/GPS integration (Google Maps or Mapbox), advanced analytics, and a production‑ready deployment pipeline are natural next steps.
- Add stronger error handling and background workers for long‑running tasks.

---

## 12. Contact

If you want to see the demo, review code, or collaborate, feel free to open an issue or reach out via the repository.

---

_Project created as a case study for the Web Development Program — Launched Global_

