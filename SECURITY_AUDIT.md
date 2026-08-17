# Security Audit

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low

## Authentication

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 1 | `JWT_SECRET || 'supersecret'` hardcoded fallback in `auth.js` **and** `authenticateToken.js` (can silently diverge) | 🔴 | Fail-fast if unset; single config module |
| 2 | Tokens expire in 1 day but no refresh-token mechanism; revocation impossible (logout is client-side only) | 🟠 | Add refresh token or short-lived access tokens |
| 3 | Token stored in `localStorage` (exposed to XSS) | 🟡 | HttpOnly cookie (with CSRF mitigation) or documented trade-off |
| 4 | No password-strength policy; register accepts any password | 🟡 | Enforce minimum length/complexity |
| 5 | No email verification on registration | 🟡 | Verify email (optional for demo) |
| 6 | bcryptjs hashing with cost 10 — acceptable | ✅ | — |

## Authorization

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 7 | `GET/POST/PUT/DELETE /api/bookings|drivers|vehicles|invoices` have **no role check** — any authenticated user (company or vendor) can read/write *all* records across tenants | 🔴 | `requireRole` middleware + row scoping |
| 8 | Role gating on the frontend is cosmetic (localStorage `user.role`) — bypassable | 🟠 | Enforce server-side; frontend gating is UX only |
| 9 | `open-market/eligible` is the only role check, done inline and inconsistently | 🟡 | Move to middleware |

## Input validation / injection

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 10 | No input validation anywhere; `req.body` passed directly to inserts/updates | 🟠 | zod schemas on all mutating routes |
| 11 | SQL injection: mitigated by supabase-js parameterization (PostgREST) — no raw SQL | ✅ | — |
| 12 | Mass assignment: unknown fields are passed to PostgREST (rejected), but no allowlist of fields | 🟡 | zod strip/allowlist |
| 13 | XSS: React escapes rendered strings; no `dangerouslySetInnerHTML` observed | ✅ | — (CSV export still needs escaping — data-injection into CSV) |

## Session / transport

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 14 | `cors()` open to all origins | 🟠 | Allowlist frontend origin |
| 15 | No rate limiting on `/api/auth` (login/register brute force) | 🟠 | `express-rate-limit` |
| 16 | No Helmet security headers | 🟡 | `helmet` |
| 17 | No CSRF protection (stateless JWT in header is inherently CSRF-resistant for non-cookie auth; note if moving to cookies) | 🔵 | — |

## Secrets & configuration

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 18 | `backend/.env` committed (contains placeholder creds only — low impact, but establishes bad habit) | 🟡 | gitignore + `.env.example` |
| 19 | Supabase **service-role** key used server-side (bypasses RLS) — correct for backend, but means the app must enforce its own ACL | 🟠 | RLS + role-scoped queries |
| 20 | RabbitMQ default `amqp://localhost` with no credentials | 🟡 | Env-driven URL + credentials |

## Orphan / dead routes

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| 21 | `frontend/src/app/login/page.tsx` — hardcoded `admin/admin` login | 🔴 | Delete/redirect |
| 22 | `frontend/src/app/login/company.tsx` — hardcoded `company/company` | 🔴 | Delete |

## Summary

- 🔴 Critical: 1, 7, 21, 22
- 🟠 High: 2, 8, 10, 14, 15, 19
- 🟡 Medium: 3, 4, 5, 9, 12, 16, 18, 20
- 🔵 Low: 17

All Critical and High items are scheduled in the roadmap's Critical phase.
