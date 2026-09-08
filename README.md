# Cab Booking Portal — Corporate Offices

> Full-stack platform that automates corporate cab booking and vendor coordination: companies create requests, vendors pick them up in real time, and trips are tracked from booking to completion.

## Overview

Corporate offices still book cabs over calls, messages, and spreadsheets — slow, error-prone, and opaque. This portal digitizes the flow: a company submits a request, vendors receive it instantly, assign drivers and vehicles, and the trip moves through `pending → upcoming → ongoing → completed` with every change persisted and streamed to the dashboard live.

Built as a portfolio project, it demonstrates a production-minded full-stack implementation: typed API layer, React Query state management, Supabase Realtime, RabbitMQ messaging, JWT auth with role-based authorization, zod validation, a hardened Express API, and an automated backend test suite.

## Features

| Area | Company | Vendor |
|------|---------|--------|
| Bookings | Create, edit, delete, export CSV, live updates — scoped to your own bookings | Accept & assign, open-market placement, start/end trips — sees unassigned requests plus its own |
| Open Market | — | Place unfulfilled bookings for 30-min SLA pickup by any vendor; race-safe (status-guarded updates, not read-then-write) |
| Drivers & Vehicles | — | Full CRUD, scoped to your own fleet |
| Invoices | View + monthly report — scoped to your own bookings | Submit, attach files (Supabase Storage), mark received; created atomically with trip completion |
| Real-time | Bookings stream via Supabase Realtime + sonner toasts | Same live feed |
| Notifications | New bookings publish to RabbitMQ, consumed by a separate worker process (`npm run worker`) with manual ack + dead-letter queue | Same |
| Auth | JWT login / register (JWT carries the user id) | Role-gated routes (backend row-scoped by id + UI) |

## Tech Stack

- **Frontend** — Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS), TanStack React Query, sonner toasts, Supabase Realtime
- **Backend** — Node.js, Express 5, zod validation, Helmet, CORS, express-rate-limit (all of `/api`), JWT (jsonwebtoken), bcryptjs
- **Data & messaging** — Supabase (PostgreSQL + Storage + Realtime, with foreign keys and one RLS policy), RabbitMQ (`amqplib`) with a real consumer (`backend/worker.js`)
- **Testing** — Jest + Supertest (50+ tests), Gitleaks + GitGuardian secret scanning in CI

## Architecture

```
Browser (Next.js)
  ├─ React Query ──── typed REST client ────> Express API (:4000)
  │                                             ├─ JWT auth + role middleware
  │                                             ├─ row-scoped queries (user_id / vendor_id)
  │                                             ├─ zod validation (create + update schemas)
  │                                             ├─ Supabase service-role client (Postgres)
  │                                             └─ RabbitMQ publish (booking requests)
  │                                                   └─> worker.js (separate process, manual ack + DLQ)
  └─ Supabase Realtime <── postgres_changes ─── Supabase (Postgres :54321 / DB :54322)
                                                   RLS-gated to (id, status, created_at) for anon
```

The frontend never talks to Postgres directly for writes: all mutations go through the authenticated Express API. Realtime is read-only and used to invalidate the React Query cache so the dashboard updates without polling — it never reads the row payload itself, which is why the anon key's RLS grant only needs to expose `id`/`status`/`created_at`, not the full row.

## Project Structure

```
backend/                Express API
  routes/               auth, bookings, drivers, vehicles, invoices
  middleware/           authenticateToken, requireRole
  tests/                jest suites (validation, auth, role, bookings, worker)
  validation.js         zod schemas (create + update, per resource)
  config.js             fail-fast env config
  rabbitmq.js           queue topology + publisher (shared with worker.js)
  worker.js             RabbitMQ consumer — separate process, `npm run worker`
supabase/
  migrations/           0001_init.sql, 0002_invoice_attachments.sql, 0003_relational_integrity.sql
  seed.sql              demo users + sample drivers/vehicles (linked to the demo vendor)
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

In a second terminal, start the RabbitMQ consumer — booking creation publishes to
`booking_requests`, and nothing reads it unless this is also running:

```powershell
cd backend
npm run worker
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
npm test                  # 47 tests (validation, auth, role middleware, booking routes, worker)
npm run test:coverage
```

## Security Notes

- Secrets live only in gitignored `.env` / `.env.local` / `supabase/.temp`; every push and PR is scanned by Gitleaks and GitGuardian.
- Backend validates all inputs with zod (create + update schemas), rate-limits all of `/api`, and enforces role-based authorization on every route.
- Every read and write is scoped to the caller: a company sees only its own bookings/invoices; a vendor sees unassigned requests plus its own fleet/bookings/invoices. Verified live — a second registered company sees zero bookings from the first.
- Supabase grants are explicit (no default auto-expose); the anon key used by the browser's Realtime subscription is now RLS-gated to `(id, status, created_at)` on `bookings` — it never had access to guest names, contact numbers, or pricing beyond what this PR closed.
- See `SECURITY_AUDIT.md` for the full audit and remaining hardening items (token revocation, RabbitMQ credentials).

## Documentation

- `ARCHITECTURE.md` — system design and decisions
- `AUDIT_REPORT.md` / `TECH_DEBT.md` / `PERFORMANCE_AUDIT.md` / `UI_UX_AUDIT.md` / `DATABASE_REVIEW.md` — deep audits
- `PRODUCTION_CHECKLIST.md` — go-live checklist
- `ROADMAP.md` — feature roadmap
- `docs/WORKFLOW.md` — end-to-end workflow notes
- `INTERVIEW_STUDY_GUIDE.md` — a from-the-code reference covering the schema, auth, RabbitMQ, API surface, the trade-offs behind each stack choice, and honest weak points
- `Demonstration (1).mp4` — demo walkthrough

## Roadmap

Row-level authorization, a real foreign-key schema, and a consumed RabbitMQ queue (all previously
open items) landed in `feat/relational-integrity-and-authz`. Map/GPS integration, a booking
timeline/audit table (`trip_events`), and a containerized production deployment are the natural
next steps — see `ROADMAP.md`.
