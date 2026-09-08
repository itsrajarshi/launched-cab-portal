# Production Readiness Checklist

Checklist to track progress toward production quality. Status is updated as each roadmap item
lands.

## Security
- [x] Remove hardcoded `JWT_SECRET` fallback; fail-fast if unset
- [x] Remove orphan login routes with hardcoded credentials
- [x] Enforce role/tenant scoping on all endpoints (`requireRole` + row-scoped queries by `user_id`/`vendor_id`)
- [x] Input validation (zod) on all mutating routes — `PUT` routes had none before this landed
- [x] Rate limiting on all of `/api` (previously `/api/auth` only)
- [x] CORS allowlist
- [x] Helmet security headers
- [x] `.env.example` + `.gitignore` (no secrets/`node_modules` in git)
- [ ] Password policy + confirm-password on register — minimum length only, no confirm field

## Performance
- [x] Replace polling with realtime updates
- [ ] Server-side pagination/filtering/sorting
- [x] Indexes on filtered columns (`status`, `company`, `date`, `user_id`, `vendor_id`)
- [x] Data-fetching layer (caching/retry/dedupe) — React Query
- [ ] Trim font payload

## Scalability
- [x] Stateless backend (no in-memory session)
- [x] Queue-driven notification fan-out (RabbitMQ) with a real consumer — `backend/worker.js`, manual ack, dead-letter queue. Previously the queue was publish-only and nothing ever read it.

## Maintainability
- [x] Split monolithic bookings page — extracted into `components/bookings/*`
- [x] Shared domain types (no `any`) — `lib/types.ts`
- [ ] Shared UI components (inputs, tables, forms) — partial; each page still duplicates form/table markup
- [x] Lint + typecheck green — `next lint` and `tsc --noEmit` both clean
- [ ] Prettier + Husky + commitlint

## Reliability
- [x] Global error handler + 404 handler
- [ ] Structured logging (request IDs, levels)
- [ ] Retry/backoff on external calls (Supabase, RabbitMQ)
- [ ] Graceful shutdown — `worker.js` handles `SIGINT`/`SIGTERM`; the API server (`index.js`) does not yet

## Monitoring
- [ ] Structured logs (JSON)
- [ ] Error reporting hook (e.g. Sentry) — optional
- [x] Health check endpoint (present: `GET /`)

## Error handling
- [ ] Consistent error envelope — mostly `{ error }`, but `endtrip` now returns `{ booking, invoice }`
- [x] User-facing error states — no `alert()` remains anywhere in the frontend (verified: zero matches)

## Deployment
- [ ] `Dockerfile` for backend + frontend
- [ ] `docker-compose.yml` (app + RabbitMQ [+ Supabase if self-hosted])
- [ ] Deployment docs (Vercel/Railway/Fly)

## Environment setup
- [x] `.env.example` for backend + frontend
- [ ] One-command local setup (compose + seed) — currently four manual steps (Supabase, RabbitMQ, backend + worker, frontend); see `README.md`

## Documentation
- [x] `ARCHITECTURE.md`
- [x] `README.md` (real quick-start)
- [x] `backend/README.md` (all endpoints, including the worker process)
- [ ] API docs (OpenAPI)

## Testing
- [x] Backend unit tests (auth, bookings, drivers/vehicles/invoices ownership, worker message handling — 47 tests)
- [ ] Frontend component tests
- [ ] E2E smoke test
- [ ] CI running tests on PRs
