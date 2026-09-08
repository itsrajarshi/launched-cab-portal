# Tech Debt

Living registry of technical debt. Each item links to the roadmap phase that resolves it.

Legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low

## Frontend

| # | Debt | Location | Roadmap |
|---|------|----------|---------|
| 1 | 1,000-line monolith component | `app/dashboard/bookings/page.tsx` | High #8 |
| 2 | Dead state + debug `<span>` | `app/dashboard/bookings/page.tsx` | Critical #4 |
| 3 | `any`-typed API layer, no error/retry | `lib/api.ts` | High #11 |
| 4 | Duplicated input class strings (~40×) | all `dashboard/*/page.tsx` | High #13 |
| 5 | Duplicated table markup | drivers/vehicles/invoices/bookings | High #13 |
| 6 | `alert()`-based polling UX | bookings page | High #9/#12 |
| 7 | Dead files (`auth/login.tsx`, `auth/register.tsx`, `DarkModeToggle.tsx`) | `app/auth/*`, `components/` | Medium #23 |
| 8 | `DarkModeToggle` conflicts with `darkMode:'media'` | `components/DarkModeToggle.tsx` + `tailwind.config.js` | Medium #20 |
| 9 | Hardcoded creds in orphan routes | `app/login/*` | Critical #2 |
| 10 | CSV export unescaped | bookings `handleExport` | High #14 |
| 11 | Invoice file upload ignored | `invoices/page.tsx` | High #14 |
| 12 | Redundant font loading (3 families) | `app/layout.tsx` | Medium |
| 13 | Default create-next-app README | `frontend/README.md` | High #16 |

## Backend

| # | Debt | Location | Roadmap |
|---|------|----------|---------|
| 14 | `JWT_SECRET || 'supersecret'` duplicated in 2 files | `auth.js`, `authenticateToken.js` | Critical #1 — ✅ resolved |
| 15 | No role/tenant scoping on any list endpoint | all routes | Critical #3 — ✅ resolved (`feat/relational-integrity-and-authz`): JWT carries `id`; every route filters by `user_id`/`vendor_id`. |
| 16 | Fake `starttrip` billing snapshot | `bookings.js` | Critical #5 — ✅ resolved: `endtrip` now takes and persists a real `{amount, km}`. |
| 17 | Open-market filters on non-existent camelCase columns | `bookings.js` | Critical #7 — not present in the codebase as of this revision; likely already fixed in an earlier PR this entry was never updated for. |
| 18 | No input validation / mass assignment | all routes | Critical #5 — ✅ resolved for `PUT` routes (previously had zero validation on any resource); create routes deliberately keep `.passthrough()`, see `SECURITY_AUDIT.md` #16. |
| 19 | No global error handler or 404 | `index.js` | Critical #6 — ✅ resolved |
| 20 | Connect-per-publish + 500ms close race in RabbitMQ | `rabbitmq.js` | Critical #6 — still true; unrelated to this PR, which added the missing consumer (`worker.js`) rather than changing the publisher's connection lifecycle. |
| 21 | No logger | all routes | High — still open |
| 22 | `postgres` npm dep unused | `package.json` | Medium #23 — still true; left alone deliberately (removing an unrelated dependency wasn't part of this PR's scope). |
| 29 | **RabbitMQ queue had no consumer** — messages accumulated indefinitely | `backend/rabbitmq.js` | New — ✅ resolved: `backend/worker.js`, manual ack, `prefetch(5)`, dead-letter queue. |
| 30 | Drivers/vehicles PUT routes sent camelCase field names straight to snake_case columns (would fail against a real DB) | `drivers.js` | New — ✅ resolved: PUT now maps camelCase → snake_case, same as POST already did. |

## Repository / process

| # | Debt | Location | Roadmap |
|---|------|----------|---------|
| 23 | `backend/node_modules` (1,846 files) committed | git | Critical #1 |
| 24 | `backend/.env` committed (placeholders) | git | Critical #1 |
| 25 | No `.gitignore` for backend, no `.env.example` | repo root | Critical #1 |
| 26 | No schema/migrations | — | Critical #7 |
| 27 | No tests / CI / lint-config / formatter | — | High #15, Medium #21 |
| 28 | 24 MB demo video in repo | `Demonstration (1).mp4` | 🔵 (keep for portfolio) |
