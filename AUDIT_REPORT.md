# Audit Report

A complete repository audit of the Cab Booking Portal, grouped by discipline. Each finding is
cross-referenced to `ROADMAP.md`, `TECH_DEBT.md`, and the other domain reports.

> Scope: commit `b4834de` on `master`. Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low.

## 1. Code quality

| # | Finding | Severity | Notes |
|---|---------|----------|-------|
| 1 | `frontend/src/app/dashboard/bookings/page.tsx` is ~1,000 lines mixing table UI, forms, trip simulation, boarding pass, and CSV export in one component | 🟠 | Split into `components/` + `useBookings` hook |
| 2 | Large volume of dead state in bookings page: `dummyInvoices`, `timers`, `driverArrival`, `tripOngoing`, `tripAmount`, `ongoingTrips`, unused `tab` (`cancelled`/`live`), `SLATimer` component never rendered | 🟠 | Remove |
| 3 | Leftover debug UI: `<span>[Debug: Accept not shown. assignModal={JSON.stringify(assignModal)} …]</span>` | 🔴 | Renders in production |
| 4 | `navLinks` array in `DashboardNav.tsx` unused (only `companyLinks`/`vendorLinks` used) | 🔵 | Remove |
| 5 | Dead files: `app/auth/login.tsx`, `app/auth/register.tsx` (root-level, non-routable), `components/DarkModeToggle.tsx` (unused) | 🟡 | Remove |
| 6 | `mapBookingFields` contains `status: b.status || b.status` (redundant) | 🔵 | Cleanup |
| 7 | Duplicated input class string (`w-full border rounded px-3 py-2 dark:bg-gray-900 …`) repeated ~40× | 🟠 | Extract `Input`/`Field` components |
| 8 | Duplicated table markup across drivers/vehicles/invoices/bookings pages | 🟠 | Extract `DataTable` component |

## 2. Type safety

| # | Finding | Severity |
|---|---------|----------|
| 1 | `lib/api.ts` functions use `any` extensively (`mapBookingFields(b: any)`, `createBooking(data: any)`, etc.) | 🟠 |
| 2 | `InvoiceForm` uses `onSubmit(form, file!)` — non-null assertion on a value that can be `null` | 🟠 |
| 3 | `InvoicesPage` declares props `dummyInvoices`/`refreshKey` that the router never supplies | 🟡 |
| 4 | `drivers`/`vehicles`/`invoices` pages use `err: any` in catch blocks | 🟡 |
| 5 | No shared domain types (`Booking`, `Driver`, `Vehicle`, `Invoice`, `User`) — interfaces are duplicated per page | 🟠 |

## 3. Performance

| # | Finding | Severity |
|---|---------|----------|
| 1 | Vendor polling `setInterval` (10s) recreates interval on every tick because `liveBookings.length` is in deps | 🟠 |
| 2 | No server-side pagination/filtering — every list endpoint returns the full table | 🟠 |
| 3 | `handleAssign` calls `fetchBookings()` 3× in one action (redundant network) | 🟡 |
| 4 | No caching/dedupe (no React Query/SWR); repeated fetches on every interaction | 🟡 |
| 5 | `blocking alert()` on new booking interrupts user; poll still fires while tab hidden | 🟠 |
| 6 | Three font families loaded (Geist, Geist Mono, Inter) though only Inter + variables are applied | 🟡 |
| 7 | No `next/image` (minor: emoji used as icons, no raster images) | 🔵 |
| 8 | No lazy loading of routes; dashboard loads heavy pages eagerly | 🔵 |

## 4. Security

See `SECURITY_AUDIT.md` for the full list with severities. Highlights: hardcoded `JWT_SECRET`
fallback, no role scoping (cross-tenant data exposure), orphan login routes with hardcoded
credentials, permissive CORS, no rate limiting, no input validation.

## 5. Database

See `DATABASE_REVIEW.md`. Highlights: no schema/migrations in repo, one wide `bookings` table,
no FKs/indexes/constraints/RLS, snake_case vs camelCase drift between route code and columns.

## 6. API design

| # | Finding | Severity |
|---|---------|----------|
| 1 | No consistent error envelope; routes return raw `{ error }` with varying shapes | 🟡 |
| 2 | Status codes mostly correct, but 404 handling only inside `update`/`delete` (not `get`) | 🟡 |
| 3 | No pagination/filtering/sorting query params — filtering done client-side | 🟠 |
| 4 | No API documentation (no OpenAPI/Swagger) | 🟡 |
| 5 | `starttrip` writes fake/hardcoded billing values (`op_km:'100'`, `total_amount:'1500'`, …) | 🔴 |
| 6 | Open-market endpoints reference non-existent camelCase columns (`associatedVendors`, `companyAssociatedVendors`) | 🔴 |

## 7. UI/UX

See `UI_UX_AUDIT.md`. Summary: visually strong (glassmorphism, dark mode, boarding-pass card),
but inconsistent states (no skeletons, `alert()` UX, no toasts), disruptive fullscreen greeting
overlay, auto-opening trip modal, and duplicate form styles.

## 8. Mobile responsiveness

- Tables are wrapped in `overflow-x-auto` (functional but unpolished on phone).
- Dashboard nav has no mobile menu (horizontal row of pill links overflows/does not collapse).
- Modals use `min-w-[320px]`/`max-w-xl` (OK on small screens).
- Login/register forms are `max-w-md` and responsive.
- Boarding-pass card is desktop-oriented; needs a stacked mobile layout.

## 9. Accessibility

| # | Finding | Severity |
|---|---------|----------|
| 1 | Inputs lack `<label htmlFor>` (labels wrap controls inconsistently) | 🟠 |
| 2 | `<th>` lacks `scope`; tables lack `<caption>` | 🟡 |
| 3 | Several `<button>` elements lack `type="button"` inside forms (risk default submit) | 🟡 |
| 4 | Focus states only partially applied; `focus:ring` present on some, absent on others | 🟡 |
| 5 | Contrast unverified; some text uses low-opacity classes | 🟡 |
| 6 | Modal lacks focus trap, `role="dialog"`, `aria-modal`, Escape-to-close | 🟠 |
| 7 | Icons are emoji (no aria-hidden alternative text on decorative emoji) | 🔵 |

## 10. Developer experience

| # | Finding | Severity |
|---|---------|----------|
| 1 | `frontend/README.md` is default create-next-app boilerplate (misleading) | 🟡 |
| 2 | `backend/README.md` only lists 4 endpoints (auth/open-market missing) | 🟡 |
| 3 | No `.env.example` files | 🟠 |
| 4 | No Prettier/Husky/lint-staged/commitlint | 🟡 |
| 5 | `next lint` script references deprecated command (Next 15) | 🔵 |
| 6 | No CI (GitHub Actions) | 🟡 |

## 11. Testing

| # | Finding | Severity |
|---|---------|----------|
| 1 | Zero tests; `backend` `npm test` exits 1 | 🔴 |
| 2 | No test framework configured on frontend | 🟡 |
| 3 | Critical logic untested: JWT auth, booking lifecycle transitions, CSV export mapping | 🟠 |
