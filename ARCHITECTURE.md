# Architecture

Corporate Cab Booking Portal — a full-stack app that automates corporate cab bookings and
vendor coordination. This document describes the system as it exists (pre-refactor) so that
future work has a shared mental model.

## High-level stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), React 19, TypeScript, Tailwind v4 |
| Backend    | Node.js + Express 5                                      |
| Database   | Supabase (PostgreSQL) via `@supabase/supabase-js` (service-role key) |
| Messaging  | RabbitMQ (`amqplib`) for booking fan-out                  |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs` password hashing        |

## Folder structure

```
launched-cab-portal/
├── frontend/                 # Next.js app
│   └── src/
│       ├── app/              # App Router pages
│       │   ├── layout.tsx, client-layout.tsx, page.tsx
│       │   ├── auth/         # login + register (page.tsx + stale .tsx files)
│       │   ├── login/        # orphan routes with hardcoded creds (to be removed)
│       │   └── dashboard/    # bookings, drivers, vehicles, invoices, manual-booking, profile
│       ├── components/       # Modal, DashboardNav, DashboardFooter, DarkModeToggle
│       ├── context/          # AuthContext (client-side user/token state)
│       └── lib/              # api.ts (raw fetch wrapper)
├── backend/                  # Express API
│   ├── index.js              # app bootstrap
│   ├── supabase.js           # Supabase client
│   ├── rabbitmq.js           # RabbitMQ publish utility
│   ├── middleware/           # authenticateToken.js
│   └── routes/               # auth, bookings, drivers, vehicles, invoices
└── docs/                     # WORKFLOW.md + these reports
```

## Request flow

1. **Browser** loads a client component page, calls functions in `lib/api.ts`.
2. `api.ts` issues `fetch` to `${NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}` with a
   `Bearer` token read from `localStorage`.
3. **Express** route receives the request. Routes are mounted under `/api/*` in `index.js`.
4. Routes call `supabase.from(<table>)...` to read/write Postgres (bypassing RLS via the
   service-role key).
5. Booking creation additionally calls `publishBookingRequest()` → RabbitMQ queue
   `booking_requests` (durable, persistent messages). Publish failures are logged and swallowed.
6. The frontend has **no live channel** to RabbitMQ; the vendor dashboard instead polls
   `GET /bookings/open-market/eligible` every 10 s and fires `alert()` on new items.

## Authentication & authorization flow

- **Register** (`POST /api/auth/register`): validates role ∈ {company, vendor}, checks email
  uniqueness, hashes password with bcrypt, inserts into `users`, returns a JWT + user.
- **Login** (`POST /api/auth/login`): looks up `users` by email, compares bcrypt hash, returns
  JWT (1-day expiry) + user.
- **Client** stores `token` and `user` (JSON) in `localStorage`; `AuthContext` hydrates from it.
- **Protected routes** call `authenticateToken` middleware, which verifies the JWT and attaches
  `req.user = { email, role }`.
- **Authorization is client-side only** for UI gating (`useAuth().user.role`); the backend does
  not scope rows by role/tenant, and only `/open-market/eligible` checks `role` inline.

## Booking lifecycle

```
company creates booking (status: pending)
   └─> RabbitMQ publish "NEW_BOOKING_REQUEST"
vendor sees pending booking
   ├─ Accept & assign driver/vehicle  -> status: upcoming
   ├─ Place in Open Market            -> status: open_market (30-min SLA)
   │      other vendors can accept    -> status: upcoming
   └─ Reject                          -> status: cancelled
vendor starts trip                    -> status: ongoing (+ fake billing snapshot)
vendor ends trip                      -> status: completed (+ invoice created)
```

Statuses observed in code: `pending`, `upcoming`, `ongoing`, `completed`, `cancelled`,
`open_market`. There is no `trip_events`/timeline table — status transitions are a single
`status` column overwritten in place, so history is not preserved.

## Database relationships (current)

- `users` — auth identity (email unique, password hash, role, name).
- `bookings` — one wide table mixing trip details, assignment, billing and open-market fields.
- `drivers` — vendor fleet drivers (flat, no FK to vendor).
- `vehicles` — vendor fleet vehicles (flat).
- `invoices` — billing records (insert body passed through directly).

There are **no foreign keys, no indexes, no migrations, no RLS policies** in the repository.
The schema lives only in the (uncommitted) Supabase project. See `DATABASE_REVIEW.md` and
`supabase/schema.sql` (added in the refactor) for the target schema.

## Key design decisions (and their consequences)

- **Event-driven notifications** via RabbitMQ — good, but the browser has no consumer, so it
  degrades to polling.
- **Service-role Supabase key** — simple, but bypasses RLS and makes every endpoint "admin".
- **Central API layer** (`api.ts`) — decouples frontend from backend URL, but is untyped (`any`)
  and has no error/retry strategy.
- **Client-only role gating** — easy to build, but not a security boundary.
