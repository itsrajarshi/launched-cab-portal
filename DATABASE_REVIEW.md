# Database Review

> Updated for `supabase/migrations/0003_relational_integrity.sql`. This document used to say the
> repo shipped no schema at all — that was already stale by the time this revision was written
> (`0001_init.sql` / `0002_invoice_attachments.sql` had shipped schema and grants for several PRs).
> It now describes the schema as it actually exists on disk.

## Tables (as implemented)

### `users`
`id uuid pk`, `email text unique not null`, `password text not null` (bcrypt hash),
`role text not null check (role in ('company','vendor'))`, `name text`, `created_at timestamptz`.

No FK targets — this is the root identity table every other table's ownership columns reference.

### `bookings`
The wide trip/assignment/billing/open-market table from `0001`, plus two ownership columns added
in `0003`:

- `user_id uuid references users(id) on delete set null` — the company that created it.
- `vendor_id uuid references users(id) on delete set null` — the vendor assigned to it (null until
  accepted).

`date` is now `date` (was `text`); `total_amount` and `total_km` are now `numeric` (were `text`) —
both are written for real now, by `POST /:id/endtrip`, which persists the trip's billing snapshot
in the same call that creates its invoice (previously nothing ever wrote these columns at all).

Indexes: `status`, `company`, `date` (from `0001`) plus `user_id`, `vendor_id` (from `0003`).

### `drivers` / `vehicles`
Both gained `vendor_id uuid references users(id) on delete cascade` in `0003`, so a fleet actually
belongs to a vendor now — every list/create/update/delete route filters and stamps this column.
`vehicles.plate` is `unique`.

### `invoices`
`"bookingId"` (text, unconstrained) was renamed to `booking_id` and retyped to
`uuid references bookings(id) on delete set null`. Added `vendor_id` and `user_id`, both
`uuid references users(id) on delete set null`. `"invoiceNumber"` and `"fileUrl"` stay quoted
camelCase — see `0002`'s header comment for why (a Postgres identifier-folding bug, fixed by
renaming rather than by re-normalizing the whole table).

## What changed and why

| # | Was | Now | Migration |
|---|-----|-----|-----------|
| 1 | No foreign keys anywhere — every relationship was a copied name string | `bookings`↔`users` (×2), `drivers`↔`users`, `vehicles`↔`users`, `invoices`↔`bookings`, `invoices`↔`users` (×2) | `0003` |
| 2 | `bookings` carried no owning user id, so no query could filter "my bookings" | `user_id`/`vendor_id` on `bookings`, used by every route (see `SECURITY_AUDIT.md`) | `0003` |
| 3 | `vehicles.plate` had no uniqueness constraint, though `AssignForm.tsx` looks vehicles up *by* plate | `unique (plate)` | `0003` |
| 4 | `bookings.date` was `text`; `total_amount`/`total_km` were `text` and never actually written by any route | `date` is `date`; both amount columns are `numeric` and written by `endtrip` | `0003` |
| 5 | The public anon key (shipped to the browser for Realtime) had unrestricted `select` on `bookings` — every column, every row | RLS enabled + one permissive row policy (Realtime still needs every row to fire a change event) + a column-level grant restricting anon/authenticated to `(id, status, created_at)` | `0003` |
| 6 | `drivers`/`vehicles` had no vendor ownership — any vendor saw every other vendor's fleet | `vendor_id` FK, filtered server-side | `0003` |

## Remaining known gaps (deliberately out of scope for this PR)

- **No `trip_events` audit table.** Status transitions still overwrite a single column in place;
  there is no history of a booking's past states. See `ROADMAP.md` Medium #17.
- **The billing snapshot columns not written by `endtrip`** (`op_km`, `toll_parking`, `fuel_office`,
  etc.) are still `text` and still unwritten by any route — only `total_amount`/`total_km` were
  brought in scope, because those are the two the atomic `endtrip` call actually needs.
- **No RLS on `drivers`/`vehicles`/`invoices`.** These never had an `anon`/`authenticated` grant in
  the first place, so there's nothing for a policy to gate — the real fix (application-level
  `vendor_id`/`user_id` scoping) is done in the route handlers instead. See `SECURITY_AUDIT.md`.
- **`drivers.id` still doubles as a display "EmployeeId"** in the UI — unrelated to this PR.

## Normal form

1NF and 2NF hold throughout (single-column uuid PKs everywhere, no repeating groups). `bookings`
still breaks 3NF — `vehicle_number` determines `vehicle_type`, both copied onto the booking row
rather than joined from `vehicles`. That denormalization is partly a deliberate snapshot (a
completed trip should record what was actually dispatched, not what a vehicle's row says today)
and partly just unnormalized; seat [`INTERVIEW_STUDY_GUIDE.md`](INTERVIEW_STUDY_GUIDE.md) §2.6 for
the full argument on which half is which.
