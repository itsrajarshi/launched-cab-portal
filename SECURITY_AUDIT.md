# Security Audit

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low

> Findings resolved by `feat/relational-integrity-and-authz` are marked ✅ **Resolved** with a short
> note on the actual fix. Everything else reflects the codebase as it stands.

## Authentication

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 1 | `JWT_SECRET || 'supersecret'` hardcoded fallback | 🔴 | ✅ **Resolved** — `config.js` fails fast at startup if `JWT_SECRET` is unset or a placeholder; there is one config module, not two divergent copies. |
| 2 | Tokens expire in 1 day but no refresh-token mechanism; revocation impossible (logout is client-side only) | 🟠 | Still open. Real fix is server-side sessions or a short-lived access token + rotating refresh token — see `INTERVIEW_STUDY_GUIDE.md` §6.6. |
| 3 | Token stored in `localStorage` (exposed to XSS) | 🟡 | Still open — accepted trade-off for a two-origin dev setup; the correct fix (httpOnly cookie) needs same-origin deployment first. |
| 4 | No password-strength policy beyond an 8-char minimum | 🟡 | Still open. |
| 5 | No email verification on registration | 🟡 | Still open (acceptable for a demo). |
| 6 | bcryptjs hashing with cost 10 | ✅ | — |
| 7 | **`POST /api/auth/register` threw against a real database** — `.insert()` was never chained with `.select()`, so supabase-js returned `data: null` and `data[0]` crashed | 🔴 | ✅ **Resolved** — `.select()` added; verified live against a real local Supabase instance (register → 201 → login round trip). |

## Authorization

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 8 | `GET/POST/PUT/DELETE /api/bookings\|drivers\|vehicles\|invoices` had **no row scoping** — any authenticated user, company or vendor, could read and write every record | 🔴 | ✅ **Resolved.** JWT now carries `id`. Every route filters by `user_id`/`vendor_id`: a company sees only its own bookings/invoices; a vendor sees unassigned requests plus its own fleet, bookings and invoices. `drivers`/`vehicles` gained a `vendor_id` FK and are scoped by it. Verified live: a freshly-registered second company account shows zero bookings while another company's completed trip sits in the same table. |
| 9 | Role gating on the frontend is cosmetic (`localStorage` `user.role`) — bypassable | 🟠 | Still true, and correctly so — the server-side `requireRole` middleware plus the new row-scoping is the real boundary; frontend gating stays UX-only by design. |
| 10 | `open-market/eligible` was the only inline role check | 🟡 | Unaffected by this PR — still uses `requireRole` middleware like every other route. |
| 11 | **Two dead vendor endpoints**: "Open Market" and "Accept & Assign" on the bookings page called the generic company-only `PUT /bookings/:id`, so a vendor clicking either got a 403 | 🔴 | ✅ **Resolved** — wired to the dedicated `POST /:id/open-market` and `POST /:id/accept-open-market` routes. Verified live end to end. |
| 12 | Manual booking page (vendor-only) called `POST /bookings`, which was `requireRole('company')` — always 403'd | 🔴 | ✅ **Resolved** — `POST /bookings` now accepts `company` or `vendor`; a vendor's booking is stamped `vendor_id`/`source: 'manual'`/`status: 'upcoming'` from the token, never from the body. |
| 13 | **Race condition**: two vendors accepting the same open-market booking simultaneously could both succeed, last write wins, neither told | 🟠 | ✅ **Resolved** — every status transition now guards on the expected current status in the `UPDATE`'s `WHERE` clause (`.eq('status', 'open_market')` / `.in('status', [...])`), so the losing request matches zero rows and gets a `409`. Postgres arbitrates the race, not the application. |

## Input validation / injection

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 14 | No input validation on `PUT` routes anywhere; `req.body` passed directly to `.update()` | 🟠 | ✅ **Resolved** for `bookings`/`drivers`/`vehicles`/`invoices` — each now has a dedicated update schema. Zod's default (non-strict, non-passthrough) object mode *strips* unlisted keys rather than rejecting the whole request, so a client that round-trips a full row (as the edit forms do) still works, but `status`, `vendor_id`, `user_id` etc. never reach the database from a `PUT`. |
| 15 | SQL injection: mitigated by supabase-js parameterization (PostgREST) — no raw SQL | ✅ | — |
| 16 | Mass assignment: unknown fields on **create** routes still pass through (`.passthrough()`) | 🟡 | Deliberately left open on create routes — see `INTERVIEW_STUDY_GUIDE.md` §8 item 5 for the reasoning (create payload shape is well known; only update routes had zero validation). |
| 17 | XSS: React escapes rendered strings; no `dangerouslySetInnerHTML` observed | ✅ | — |
| 18 | **`bookings.js drivers.js` PUT routes sent camelCase field names straight to snake_case columns** (`vehicleType` → a column literally named `vehicle_type`) — would fail against a real database | 🔴 | ✅ **Resolved** — drivers' `PUT` now maps camelCase → snake_case the same way `POST` already did. |

## Session / transport

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 19 | `cors()` open to all origins | 🟠 | ✅ Already resolved (prior PR) — `corsOrigins` allowlist from `CORS_ORIGINS`. |
| 20 | Rate limiting only on `/api/auth` | 🟠 | ✅ **Resolved** — the limiter now applies to all of `/api`. |
| 21 | Helmet security headers | 🟡 | ✅ Already resolved (prior PR). |
| 22 | No CSRF protection | 🔵 | Unaffected — bearer-token auth is structurally CSRF-resistant; see `INTERVIEW_STUDY_GUIDE.md` §6.6. |

## Secrets & configuration

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 23 | `backend/.env` committed | 🟡 | ✅ Already resolved (prior PR) — gitignored, `.env.example` only. |
| 24 | Supabase **service-role** key used server-side (bypasses RLS) | 🟠 | Still true by design — the backend is a trusted server. What changed: the app now enforces its own ACL via row-scoped queries (finding #8), and RLS was added on `bookings` as a second, independent layer against the *other* access path (the public anon key used for Realtime — see finding #25). |
| 25 | **The anon key (public, shipped to the browser for Realtime) had unrestricted `select` on `bookings`** — every guest name, contact number, driver, and fare was readable by anyone with the project URL, without ever touching the API | 🔴 | ✅ **Resolved** — RLS enabled on `bookings`; the anon/authenticated grant is now column-limited to `(id, status, created_at)`, which is all the Realtime subscriber actually reads (it only uses the event to invalidate the React Query cache and refetch through the authenticated API). Verified live: `SET ROLE anon; SELECT guest, contact FROM bookings;` now fails with a Postgres permission error; `SELECT id, status, created_at` still succeeds. |
| 26 | RabbitMQ default `amqp://localhost` with no credentials | 🟡 | Still open (fine for local dev). |

## New in this PR: RabbitMQ had no consumer

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 27 | Booking creation published `NEW_BOOKING_REQUEST` to a durable queue that **nothing ever read** — messages accumulated indefinitely | 🟠 | ✅ **Resolved** — `backend/worker.js`, run separately via `npm run worker`. Manual ack (`noAck: false`), `prefetch(5)`, and a dead-letter queue (`booking_requests.dlq`, reached via the default exchange's routing-key trick) for messages that fail to parse or fail validation. Verified live against a real broker: a well-formed message was consumed and acked; a malformed one was nacked without requeue and landed in the DLQ. |

## Orphan / dead routes

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 28 | Hardcoded-credential login routes | 🔴 | ✅ Already resolved (prior PR) — removed. |

## Summary

- 🔴 Critical, now resolved: 1, 7, 8, 11, 12, 18, 25, 28
- 🟠 High, now resolved: 13, 19, 20, 27
- 🟠 High, still open: 2, 24, 26
- 🟡 Medium, still open: 3, 4, 5, 10, 16
- 🔵 Low, still open: 22

All Critical items are now resolved. Remaining High items (#2 refresh tokens, #24 service-role by
design, #26 RabbitMQ credentials) are documented trade-offs, not oversights — each has a written
justification in `INTERVIEW_STUDY_GUIDE.md` §6.
