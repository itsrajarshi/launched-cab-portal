# Cab Booking Portal — Corporate Offices

> Full-stack platform that automates corporate cab booking and vendor coordination: companies create requests, vendors pick them up in real time, and trips are tracked from booking to completion.

## Overview

Corporate offices still book cabs over calls, messages, and spreadsheets — slow, error-prone, and opaque. This portal digitizes the flow: a company submits a request, vendors receive it instantly, assign drivers and vehicles, and the trip moves through `pending → upcoming → ongoing → completed` with every change persisted and streamed to the dashboard live.

Built as a portfolio project, it demonstrates a production-minded full-stack implementation: typed API layer, React Query state management, Supabase Realtime, RabbitMQ messaging, JWT auth with role-based authorization, zod validation, a hardened Express API, and an automated backend test suite.

## Features

| Area | Company | Vendor |
|------|---------|--------|
| Bookings | Create, edit, delete, export CSV, live updates | Accept & assign, open-market placement, start/end trips |
| Open Market | — | Place unfulfilled bookings for 30-min SLA pickup by any vendor |
| Drivers & Vehicles | — | Full CRUD |
| Invoices | View + monthly report | Submit, attach files (Supabase Storage), mark received |
| Real-time | Bookings stream via Supabase Realtime + sonner toasts | Same live feed |
| Auth | JWT login / register | Role-gated routes (backend + UI) |

## Tech Stack

- **Frontend** — Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS), TanStack React Query, sonner toasts, Supabase Realtime
- **Backend** — Node.js, Express 5, zod validation, Helmet, CORS, express-rate-limit, JWT (jsonwebtoken), bcryptjs
- **Data & messaging** — Supabase (PostgreSQL + Storage + Realtime), RabbitMQ (`amqplib`)
- **Testing** — Jest + Supertest (35 tests), Gitleaks + GitGuardian secret scanning in CI

## Architecture

```
Browser (Next.js)
  ├─ React Query ──── typed REST client ────> Express API (:4000)
  │                                             ├─ JWT auth + role middleware
  │                                             ├─ zod validation
  │                                             ├─ Supabase service-role client (Postgres)
  │                                             └─ RabbitMQ publish (booking requests)
  └─ Supabase Realtime <── postgres_changes ─── Supabase (Postgres :54321 / DB :54322)
```

The frontend never talks to Postgres directly for writes: all mutations go through the authenticated Express API. Realtime is read-only and used to invalidate the React Query cache so the dashboard updates without polling.

## Project Structure

```
backend/                Express API
  routes/               auth, bookings, drivers, vehicles, invoices
  middleware/           authenticateToken, requireRole
  tests/                jest suites (validation, auth, role, bookings)
  validation.js         zod schemas
  config.js             fail-fast env config
  rabbitmq.js           booking request publisher
supabase/
  migrations/           0001_init.sql (schema + grants + realtime), 0002_invoice_attachments.sql
  seed.sql              demo users + sample drivers
frontend/src/
  lib/                  api.ts (typed client), hooks.ts (React Query), realtime.ts, types.ts, format.ts
  components/           shared UI (Card, Modal, StatusBadge, ConfirmDialog, ...) + bookings/*
  app/                  routes + dashboard pages
docs/                   WORKFLOW.md, Project Report.pdf
*.md                    ARCHITECTURE, AUDIT_REPORT, SECURITY_AUDIT, ROADMAP, ... (audit deliverables)
```

## Quick Start (local dev)

### Prerequisites
- Node.js 20+, Docker Desktop (for local Supabase + RabbitMQ), Supabase CLI

### 1. Local Supabase

```powershell
supabase start          # API :54321, DB :54322, Studio :54323
supabase db reset       # applies migrations + seed (demo users + drivers)
```

### 2. RabbitMQ

```powershell
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 --restart unless-stopped rabbitmq:3-management
```

### 3. Backend

```powershell
cd backend
npm install
copy .env.example .env   # fill from `supabase status -o env` (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET)
npm run dev              # http://localhost:4000
```

### 4. Frontend

```powershell
cd frontend
npm install
# create frontend/.env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:4000/api
#   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from `supabase status -o env`>
npm run dev              # http://localhost:3000
```

### Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Company | `company@demo.com` | `Demo@123` |
| Vendor | `vendor@demo.com` | `Demo@123` |

## Testing

```powershell
cd backend
npm test                  # 35 tests (validation, auth, role middleware, booking routes)
npm run test:coverage
```

## Security Notes

- Secrets live only in gitignored `.env` / `.env.local` / `supabase/.temp`; every push and PR is scanned by Gitleaks and GitGuardian.
- Backend validates all inputs with zod, rate-limits auth routes, and enforces role-based authorization on every route.
- Supabase grants are explicit (no default auto-expose); Realtime reads are demo-scoped with RLS/tenant scoping tracked as follow-up.
- See `SECURITY_AUDIT.md` for the full audit and remaining hardening items.

## Documentation

- `ARCHITECTURE.md` — system design and decisions
- `AUDIT_REPORT.md` / `TECH_DEBT.md` / `PERFORMANCE_AUDIT.md` / `UI_UX_AUDIT.md` / `DATABASE_REVIEW.md` — deep audits
- `PRODUCTION_CHECKLIST.md` — go-live checklist
- `ROADMAP.md` — feature roadmap
- `docs/WORKFLOW.md` — end-to-end workflow notes
- `Demonstration (1).mp4` — demo walkthrough

## Roadmap

Map/GPS integration, background workers for long-running tasks, tenant-scoped RLS, and a containerized production deployment are the natural next steps (see `ROADMAP.md`).
