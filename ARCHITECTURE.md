# Architecture

Corporate Cab Booking Portal — a full-stack app that automates corporate cab bookings and
vendor coordination. This document describes the system as it exists today. (An earlier revision
called itself "pre-refactor" — several PRs since, including this one, have landed, so that framing
is retired; this is the current state, not a target.)

## High-level stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), React 19, TypeScript, Tailwind v4, TanStack React Query |
| Backend    | Node.js + Express 5                                      |
| Database   | Supabase (PostgreSQL) via `@supabase/supabase-js` (service-role key) |
| Messaging  | RabbitMQ (`amqplib`) — publisher in the API, consumer in a separate worker process |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs` password hashing        |

## Folder structure

```
launched-cab-portal/
├── frontend/                 # Next.js app
│   └── src/
│       ├── app/              # App Router pages
│       │   ├── layout.tsx, client-layout.tsx, page.tsx
│       │   ├── auth/         # login + register
│       │   └── dashboard/    # bookings, drivers, vehicles, invoices, manual-booking, profile
│       ├── components/       # Modal, DashboardNav, DashboardFooter, bookings/*
│       ├── context/          # AuthContext (client-side user/token state)
│       └── lib/              # api.ts (typed client), hooks.ts (React Query), realtime.ts, types.ts
├── backend/                  # Express API
│   ├── index.js              # app bootstrap
│   ├── supabase.js           # Supabase client (service-role)
│   ├── rabbitmq.js           # queue topology + publisher (shared with worker.js)
│   ├── worker.js             # RabbitMQ consumer — separate process, `npm run worker`
│   ├── validation.js         # zod schemas (create + update, per resource)
│   ├── middleware/           # authenticateToken.js, requireRole.js
│   └── routes/               # auth, bookings, drivers, vehicles, invoices
├── supabase/
│   ├── migrations/           # 0001_init, 0002_invoice_attachments, 0003_relational_integrity
│   └── seed.sql
└── docs/                     # WORKFLOW.md + these reports
```

## Request flow

1. **Browser** loads a client component page, calls functions in `lib/api.ts`.
2. `api.ts` issues `fetch` to `${NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}` with a
   `Bearer` token read from `localStorage`.
3. **Express** route receives the request: `authenticateToken` → `requireRole` → a zod schema →
   the handler. Routes are mounted under `/api/*` in `index.js`.
4. Handlers call `supabase.from(<table>)...` **scoped to the caller** — `.eq('user_id', req.user.id)`
   for a company, `.eq('vendor_id', req.user.id)` (plus unassigned requests) for a vendor — using
   the service-role key, which bypasses RLS by design (see *Authentication & authorization* below
   for why row scoping happens in the route, not the database, for this access path).
5. Booking creation additionally calls `publishBookingRequest()` → RabbitMQ queue
   `booking_requests` (durable, persistent messages). Publish failures are logged and swallowed —
   deliberately: a lost notification shouldn't fail the booking write.
6. A **separate process**, `backend/worker.js`, consumes that queue with manual ack, a prefetch
   cap, and a dead-letter queue for messages that fail to parse or validate. It is not started by
   `npm run dev` / `npm start` — run `npm run worker` alongside the API.
7. The frontend also holds a live channel: `useBookingsRealtime()` subscribes to Postgres change
   events on `bookings` via Supabase Realtime, and on any event invalidates the React Query
   `bookings` cache so the table refetches through the authenticated API. This is a separate path
   from RabbitMQ — Realtime is what actually makes the dashboard live; RabbitMQ is the
   notification side-channel.

## Authentication & authorization flow

- **Register** (`POST /api/auth/register`): validates role ∈ {company, vendor}, checks email
  uniqueness, hashes password with bcrypt, inserts into `users`, returns a JWT + user.
- **Login** (`POST /api/auth/login`): looks up `users` by email, compares bcrypt hash, returns
  JWT (1-day expiry) + user.
- **The JWT payload is `{ id, email, role }`.** `id` is what makes row scoping possible — every
  protected route reads `req.user.id` to filter its query.
- **Client** stores `token` and `user` (JSON) in `localStorage`; `AuthContext` hydrates from it.
- **Protected routes** call `authenticateToken` middleware, which verifies the JWT and attaches
  `req.user = { id, email, role }`.
- **Authorization has two layers**: `requireRole` middleware (company vs. vendor, the coarse
  boundary) and per-row ownership filters in the handler (`user_id`/`vendor_id`, the fine
  boundary). `bookings` additionally has RLS enabled at the database level — not as the primary
  boundary (the backend's service-role key bypasses it), but as a second, independent layer
  against the *other* access path: the public anon key the browser holds for its Realtime
  subscription. See `DATABASE_REVIEW.md` and `SECURITY_AUDIT.md` for the detail on why that
  distinction matters and what each layer actually stops.

## Booking lifecycle

```
company creates booking (status: pending)
   └─> RabbitMQ publish "NEW_BOOKING_REQUEST" → consumed by worker.js
vendor sees pending / open-market requests (never other vendors' assigned bookings)
   ├─ Accept & assign driver/vehicle  -> status: upcoming   [guarded: status IN (pending, open_market)]
   ├─ Place in Open Market            -> status: open_market (30-min SLA)  [guarded: status = pending]
   │      any vendor can accept       -> status: upcoming
   └─ Reject                          -> status: cancelled  [any vendor if unassigned, else only the assigned one]
vendor starts trip                    -> status: ongoing    [guarded: status = upcoming, vendor_id = caller]
vendor ends trip                      -> status: completed  [guarded: status = ongoing, vendor_id = caller]
                                          + invoice created in the SAME request (see below)
```

Every transition's guard is a `WHERE` clause on the `UPDATE` itself, not a read-then-write — that
is what makes two vendors racing to accept the same booking resolve safely: the loser's `UPDATE`
matches zero rows and the route returns `409`, rather than silently overwriting the winner.

Ending a trip and creating its invoice happen in one Express handler as two sequential writes,
not two separate client-orchestrated HTTP calls: previously the browser called `/endtrip` then
`POST /invoices` itself, with the second call's failure swallowed in an empty `catch` — a
completed trip could end up with no invoice and nothing recording the gap. Now the server marks
the booking `completed` (persisting the actual fare, which used to never be written to the
`bookings` row at all) and inserts the invoice before responding; if the invoice insert fails, the
booking is rolled back to `ongoing` so the vendor can retry.

Statuses observed in code: `pending`, `upcoming`, `ongoing`, `completed`, `cancelled`,
`open_market`. There is still no `trip_events`/timeline table — status transitions are a single
`status` column overwritten in place, so history before the current state is not preserved. That
remains open (see `ROADMAP.md`).

## Database relationships (current)

- `users` — auth identity (email unique, password hash, role, name). Referenced by every other
  table's ownership column.
- `bookings` — one wide table mixing trip details, assignment, billing and open-market fields,
  now with `user_id`/`vendor_id` foreign keys back to `users`.
- `drivers` / `vehicles` — vendor fleet, now with a `vendor_id` FK to `users`; `vehicles.plate` is
  unique.
- `invoices` — `booking_id` (uuid, FK to `bookings`), `vendor_id`/`user_id` (FK to `users`).

Foreign keys, indexes, migrations and one RLS policy (on `bookings`, for the anon-key exposure)
now exist — see `DATABASE_REVIEW.md` and `supabase/migrations/0003_relational_integrity.sql` for
the detail. `bookings` still isn't in 3NF (the driver/vehicle snapshot on the row is partly a
deliberate point-in-time record and partly genuine denormalization) — that's covered in
`INTERVIEW_STUDY_GUIDE.md` §2.6, not treated as a defect here.

## Key design decisions (and their consequences)

- **Event-driven notifications via RabbitMQ** — the queue now has a real consumer (`worker.js`,
  manual ack + dead-letter queue), but it is a *separate process* you have to remember to run.
  The dashboard's actual live-update path is Supabase Realtime, not RabbitMQ; the queue is a
  notification side-channel, not what makes the UI live.
- **Service-role Supabase key** — simple, and bypasses RLS, which is exactly why authorization for
  the API's access path is enforced in the route handlers (row scoping) rather than relied on at
  the database layer. RLS was added anyway, but only where the service-role bypass doesn't cover
  the real exposure — the anon key's direct PostgREST access for Realtime.
- **Central API layer** (`api.ts`) — fully typed now (`types.ts`), no `any`; still no retry
  strategy beyond React Query's single retry.
- **Two-layer role gating** — `requireRole` middleware for the coarse company/vendor boundary,
  row-scoped queries for the fine per-user boundary, frontend gating for UX only. See
  `SECURITY_AUDIT.md` for what closed and what's still a documented trade-off.
