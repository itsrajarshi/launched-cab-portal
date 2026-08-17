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

The API runs on http://localhost:4000.

## Endpoints

All routes except `/api/auth/*` and `GET /` require a `Authorization: Bearer <token>` header.

| Method | Path | Roles | Description |
| ------ | ---- | ----- | ----------- |
| GET | `/` | public | Health check |
| POST | `/api/auth/register` | public | Register (email, password, role, name) |
| POST | `/api/auth/login` | public | Login (email, password) |
| GET | `/api/bookings` | any | List bookings |
| POST | `/api/bookings` | company | Create booking (publishes to RabbitMQ) |
| PUT | `/api/bookings/:id` | company | Update booking |
| DELETE | `/api/bookings/:id` | company | Delete booking |
| POST | `/api/bookings/:id/open-market` | vendor | Place booking in open market |
| POST | `/api/bookings/:id/accept-open-market` | vendor | Accept open-market booking + assign driver/vehicle |
| POST | `/api/bookings/:id/starttrip` | vendor | Start trip (`status: ongoing`) |
| POST | `/api/bookings/:id/endtrip` | vendor | End trip (`status: completed`) |
| POST | `/api/bookings/:id/reject` | vendor | Reject/cancel booking |
| GET | `/api/bookings/open-market/eligible` | vendor | List eligible open-market bookings |
| GET/POST/PUT/DELETE | `/api/drivers` | vendor | Driver management |
| GET/POST/PUT/DELETE | `/api/vehicles` | vendor | Vehicle management |
| GET | `/api/invoices` | any | List invoices |
| POST/PUT/DELETE | `/api/invoices` | vendor | Invoice management |

## Auth

- JWT signed with `JWT_SECRET`, expires in 1 day.
- Passwords hashed with bcrypt (cost 10).
- `/api/auth` is rate-limited (100 requests / 15 min).

## Rate limiting / security

- Helmet security headers.
- CORS restricted to `CORS_ORIGINS` (default `http://localhost:3000`).
- Request body limited to 1 MB.
