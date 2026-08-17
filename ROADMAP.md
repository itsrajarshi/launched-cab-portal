# Roadmap

Ordered by impact. Effort is a rough estimate (hours) for a single senior engineer.

## Critical — must be done before production

| # | Task | Effort | Risk | Branch |
|---|------|--------|------|--------|
| 1 | Secrets hygiene: `.env.example` (both sides), `.gitignore`, untrack `node_modules`+`.env`, fail-fast `JWT_SECRET` | 1h | Low | `fix/secrets-hygiene` |
| 2 | Remove insecure `/login`, `/login/company` + dead `auth/*.tsx` files | 0.5h | Low | `fix/remove-insecure-login` |
| 3 | `requireRole` middleware + tenant-scoped queries on all list/mutate endpoints | 3h | Med | `fix/authz-role-scoping` |
| 4 | Fix crash bugs (`toLocaleDateString`, `errors.gguest`) + remove debug `<span>` and dead state | 1h | Low | `fix/bookings-bugs` |
| 5 | zod validation on auth/bookings/invoices; remove fake `starttrip` billing values | 4h | Med | `fix/input-validation` |
| 6 | Global error/404 handlers, Helmet, CORS allowlist, rate limit on auth | 3h | Med | `fix/api-hardening` |
| 7 | Committed `supabase/migrations/0001_init.sql` + apply to project | 3h | Med | `feat/db-schema-migrations` |

## High priority

| # | Task | Effort |
|---|------|--------|
| 8 | Split `bookings/page.tsx` into components + `useBookings` hook | 4h |
| 9 | Real-time bookings via Supabase Realtime (keep RabbitMQ backend fan-out) | 4h |
| 10 | Data-fetching layer (React Query/SWR) | 4h |
| 11 | Typed API layer + shared `types.ts` (remove `any`) | 4h |
| 12 | Toast system + skeletons + empty/error states | 4h |
| 13 | Shared form/table UI components | 4h |
| 14 | CSV escaping + invoice file upload (Supabase Storage) | 3h |
| 15 | Backend tests (vitest + supertest) | 5h |
| 16 | Docs rewrite (`README.md`, `backend/README.md`) | 2h |

## Medium priority

| # | Task | Effort |
|---|------|--------|
| 17 | Normalize DB schema (trip_events, FKs, indexes, checks) | 6h |
| 18 | Mobile nav + responsive polish | 4h |
| 19 | Accessibility pass (labels, `th scope`, focus, aria, modal a11y) | 3h |
| 20 | Unify dark mode (persisted + system preference) | 2h |
| 21 | GitHub Actions CI + Prettier + Husky + commitlint | 3h |
| 22 | OpenAPI/Swagger docs | 3h |
| 23 | Remove dead files/deps (`postgres` pkg, unused components) | 1h |
| 24 | Lint + typecheck green | 3h |

## Nice to have (portfolio)

| # | Task | Effort |
|---|------|--------|
| 25 | Dashboard analytics (recharts) | 5h |
| 26 | Booking timeline + audit log | 4h |
| 27 | Email notifications (Resend) | 4h |
| 28 | Map integration (Leaflet) | 4h |
| 29 | PDF invoice export (react-pdf) | 4h |
| 30 | PWA + offline + Lighthouse >95 + WCAG AA | 6h |
| 31 | Dockerfiles + compose + deploy config | 3h |

## Execution notes

- Each task is a feature branch with a PR into `master`, reviewed and merged before the next.
- Work is committed in small logical units; working functionality is never broken.
