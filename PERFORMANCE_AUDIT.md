# Performance Audit

## Current state

The app is a low-traffic MVP; correctness and security dominate over throughput. This audit
flags structural inefficiencies that will matter at scale and for a polished demo.

## Findings

| # | Area | Finding | Impact | Fix |
|---|------|---------|--------|-----|
| 1 | Network | Vendor dashboard polls `open-market/eligible` every 10s; `liveBookings.length` in the effect deps recreates the interval on every tick | High | Supabase Realtime subscription (or SSE) |
| 2 | UX | `alert()` blocks the main thread on new bookings | High | Toast notifications |
| 3 | API | No pagination/filtering/sorting on list endpoints; all rows returned and filtered client-side | High | Server-side query params + indexes |
| 4 | Network | `handleAssign` triggers `fetchBookings()` 3× redundantly | Medium | Single refresh after mutation |
| 5 | Caching | No dedupe/cache across fetches; every navigation refetches | Medium | React Query/SWR |
| 6 | DB | No indexes on `bookings` (filtered by `status`, `company`, `date`) | High | Add indexes in schema |
| 7 | DB | `bookings` fetched with `select('*')` (wide table incl. billing columns) | Medium | Column projection |
| 8 | Bundle | Three font families loaded (Geist, Geist Mono, Inter); only Inter used for body + geist vars | Medium | Trim to needed fonts |
| 9 | Rendering | Fullscreen greeting overlay + auto-open trip modal cause re-renders/layout churn | Low | Simplify |
| 10 | Runtime | Trip simulation uses `setInterval` + `setState` every second per ongoing trip | Low | Move to backend timestamps |
| 11 | Images | No `next/image` (emoji icons; no raster images) — no benefit now | Low | — |
| 12 | Lazy load | Routes not code-split/lazy-loaded beyond App Router defaults | Low | `next/dynamic` for heavy pages |

## Recommendations (ordered)

1. Replace polling with a realtime channel (Supabase Realtime) — removes N concurrent pollers.
2. Add server-side pagination + filtering + indexes.
3. Introduce a data-fetching layer (React Query) for caching/retry/dedupe.
4. Trim fonts and enable column projection.

See `ROADMAP.md` High #9, #10, #14 and Medium items for scheduling.
