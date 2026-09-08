# Cab Booking Backend API

Node.js + Express 5 REST API for the Cab Booking Portal. Uses Supabase (PostgreSQL)
for persistence, RabbitMQ for booking fan-out, and JWT for auth.

## Prerequisites

- Node.js 18+
- A Supabase project (cloud or self-hosted)
- RabbitMQ (optional — booking notifications; the API degrades gracefully if unavailable)

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Configure environment variables:

   ```sh
   cp .env.example .env
   # then fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and JWT_SECRET
   ```

   Required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.
   Optional: `PORT` (default 4000), `RABBITMQ_URL`, `RABBITMQ_BOOKING_QUEUE`, `CORS_ORIGINS`.

3. Create the database schema (and optional seed data):

   - **Local** (recommended): `supabase start` from the repo root — this runs
     `supabase/migrations/*.sql` and `supabase/seed.sql` automatically.
   - **Remote**: paste `supabase/migrations/0001_init.sql` (and optionally
     `supabase/seed.sql`) into the Supabase SQL Editor.

4. Start the server:

   ```sh
   node index.js            # or: npm run dev (nodemon)
   ```

   In a second terminal, start the RabbitMQ consumer — booking creation
   publishes a `NEW_BOOKING_REQUEST` message, and nothing reads it unless
   this is also running:

   ```sh
   npm run worker           # or: npm run worker:dev (nodemon)
   ```

The API runs on http://localhost:4000.

## Endpoints

All routes except `/api/auth/*` and `GET /` require a `Authorization: Bearer <token>` header.

| Method | Path | Roles | Description |
| ------ | ---- | ----- | ----------- |
| GET | `/` | public | Health check |
| POST | `/api/auth/register` | public | Register (email, password, role, name) |
| POST | `/api/auth/login` | public | Login (email, password) |
| GET | `/api/bookings` | any | List bookings — a company sees its own; a vendor sees unassigned requests plus its own |
| POST | `/api/bookings` | company, vendor | Company: raise a request (publishes to RabbitMQ). Vendor: manual/offline booking, no publish |
| PUT | `/api/bookings/:id` | company | Update own booking |
| DELETE | `/api/bookings/:id` | company | Delete own booking |
| POST | `/api/bookings/:id/open-market` | vendor | Place a `pending` booking in the open market (409 if already taken) |
| POST | `/api/bookings/:id/accept-open-market` | vendor | Accept a `pending` or `open_market` booking + assign driver/vehicle (409 if already accepted) |
| POST | `/api/bookings/:id/starttrip` | vendor | Start trip — own booking, only from `upcoming` |
| POST | `/api/bookings/:id/endtrip` | vendor | End trip + create its invoice in one call — own booking, only from `ongoing`; body `{ amount, km? }` |
| POST | `/api/bookings/:id/reject` | vendor | Reject/cancel — any vendor if unassigned, else only the assigned vendor |
| GET | `/api/bookings/open-market/eligible` | vendor | List open-market bookings still inside the 30-min SLA window |
| GET/POST/PUT/DELETE | `/api/drivers` | vendor | Own fleet only |
| GET/POST/PUT/DELETE | `/api/vehicles` | vendor | Own fleet only |
| GET | `/api/invoices` | any | A vendor sees invoices it raised; a company sees invoices on its own bookings |
| POST/PUT/DELETE | `/api/invoices` | vendor | Own invoices only |

## Auth

- JWT signed with `JWT_SECRET`, expires in 1 day.
- Passwords hashed with bcrypt (cost 10).
- `/api/auth` is rate-limited (100 requests / 15 min).

## Rate limiting / security

- Helmet security headers.
- CORS restricted to `CORS_ORIGINS` (default `http://localhost:3000`).
- Request body limited to 1 MB.
