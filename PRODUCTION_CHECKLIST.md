# Production Readiness Checklist

Checklist to track progress toward production quality. Status is updated as each roadmap item
lands.

## Security
- [ ] Remove hardcoded `JWT_SECRET` fallback; fail-fast if unset
- [ ] Remove orphan login routes with hardcoded credentials
- [ ] Enforce role/tenant scoping on all endpoints (`requireRole`)
- [ ] Input validation (zod) on all mutating routes
- [ ] Rate limiting on `/api/auth`
- [ ] CORS allowlist
- [ ] Helmet security headers
- [ ] `.env.example` + `.gitignore` (no secrets/`node_modules` in git)
- [ ] Password policy + confirm-password on register

## Performance
- [ ] Replace polling with realtime updates
- [ ] Server-side pagination/filtering/sorting
- [ ] Indexes on filtered columns
- [ ] Data-fetching layer (caching/retry/dedupe)
- [ ] Trim font payload

## Scalability
- [ ] Stateless backend (no in-memory session) — already satisfied
- [ ] Queue-driven notification fan-out (RabbitMQ) — already present; add consumer bridge

## Maintainability
- [ ] Split monolithic bookings page
- [ ] Shared domain types (no `any`)
- [ ] Shared UI components (inputs, tables, forms)
- [ ] Lint + typecheck green
- [ ] Prettier + Husky + commitlint

## Reliability
- [ ] Global error handler + 404 handler
- [ ] Structured logging (request IDs, levels)
- [ ] Retry/backoff on external calls (Supabase, RabbitMQ)
- [ ] Graceful shutdown

## Monitoring
- [ ] Structured logs (JSON)
- [ ] Error reporting hook (e.g. Sentry) — optional
- [ ] Health check endpoint (present: `GET /`)

## Error handling
- [ ] Consistent error envelope
- [ ] User-facing error states (no `alert()`)

## Deployment
- [ ] `Dockerfile` for backend + frontend
- [ ] `docker-compose.yml` (app + RabbitMQ [+ Supabase if self-hosted])
- [ ] Deployment docs (Vercel/Railway/Fly)

## Environment setup
- [ ] `.env.example` for backend + frontend
- [ ] One-command local setup (compose + seed)

## Documentation
- [ ] `ARCHITECTURE.md`
- [ ] `README.md` (real quick-start)
- [ ] `backend/README.md` (all endpoints)
- [ ] API docs (OpenAPI)

## Testing
- [ ] Backend unit tests (auth, bookings)
- [ ] Frontend component tests
- [ ] E2E smoke test
- [ ] CI running tests on PRs
