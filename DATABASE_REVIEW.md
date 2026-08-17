# Database Review

The repository ships **no schema, migrations, or seed data** — tables are assumed to exist in a
Supabase project. This document reviews what the code implies and prescribes a target schema
(implemented in `supabase/schema.sql`).

## Implied tables

From route code and the frontend API layer:

### `users`
- `id` (uuid), `email` (unique), `password` (bcrypt hash), `role` (`company`|`vendor`), `name`.

### `bookings`
One wide table. Referenced columns (snake_case on disk):
`id`, `company`, `guest`, `date`, `pickup`, `drop`, `category`, `contact`, `status`,
`driver`, `vehicle_type`, `vehicle_number`, `reference_name`, `invoice_number`, `assoc_vendor`,
`accepted_by_vendor`, `open_market_placed_at`, `open_market_accepted_at`,
`trip_started_at`, `trip_ended_at`, `op_km`, `total_km`, `pickup_time`, `drop_time`,
`toll_parking`, `night`, `total_amount`, `fuel_office`, `fuel_cash`, `road_tax`, `expenses`,
`adv_office`, `location_link`, `cancelled_by`, `cancelled_at`, `created_at`.

### `drivers`
`id`, `name`, `date_of_joining`, `vehicle_type`, `vehicle_number`, `pan`, `aadhar`,
`license`, `contact`, `email`, `address`, `salary`, `department`, `account_number`, `ifsc_code`.

### `vehicles`
`id`, `type`, `plate`, `model`, `availability`, `condition`, `insurance`.

### `invoices`
Insert body passed through directly (no fixed shape in backend). Frontend implies:
`invoice_number`, `company`, `amount`, `status`, `date`, `month`, `file_url`.

## Problems

| # | Issue | Severity |
|---|-------|----------|
| 1 | No migration history — schema cannot be reproduced from repo | 🔴 |
| 2 | `bookings` mixes trip, assignment, billing, and open-market concerns in one table | 🟠 |
| 3 | No foreign keys (`drivers.vehicle`, `bookings.driver`, `invoices.booking`) | 🟠 |
| 4 | No indexes on filtered columns (`status`, `company`, `date`) | 🟠 |
| 5 | No constraints/checks on `status` enum-like values | 🟡 |
| 6 | camelCase vs snake_case drift: `bookings.js` open-market code filters on `associatedVendors`/`companyAssociatedVendors` (camelCase) which don't match snake_case columns | 🔴 |
| 7 | `accept-open-market` writes `vehicleType`/`vehicleNumber` (camelCase) instead of `vehicle_type`/`vehicle_number` | 🔴 |
| 8 | Amount/kilometre/fuel fields are `text` (billing should be numeric) | 🟡 |
| 9 | No RLS policies (backend uses service-role key, so ACL must be enforced in app code) | 🟠 |
| 10 | `drivers.id` doubles as "EmployeeId" (string) rather than a surrogate key | 🟡 |

## Target schema (see `supabase/schema.sql`)

- `users(id uuid pk, email citext unique, password_hash text, role text check, name text, created_at)`.
- `companies`, `vendors` (or keep `users.role` for MVP simplicity).
- `bookings` normalized: core trip fields + `status` (with `CHECK`), timestamps for each
  transition; FK to assigning vendor/company.
- `trip_events` (new) for the booking timeline/audit trail.
- `drivers`, `vehicles`, `invoices` with FKs + indexes.
- Indexes on `bookings(status)`, `bookings(company)`, `bookings(date)`, `invoices(company)`.
- Optional RLS policies (enabled when the app migrates off service-role writes).

## Migration strategy

1. Commit `supabase/schema.sql` as the source of truth (idempotent `CREATE TABLE IF NOT EXISTS`).
2. Add a lightweight migration runner or document apply steps in `backend/README.md`.
3. Seed a demo company + vendor + driver/vehicle via `supabase/seed.sql` (optional).
