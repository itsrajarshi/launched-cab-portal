-- Relational integrity pass.
--
-- 0001/0002 shipped a schema with no foreign keys: every relationship was a
-- copied name string (a booking's "company", "driver", "vehicle_number").
-- That made two separate things impossible: the database could not reject a
-- reference to something that doesn't exist, and — because bookings carried
-- no owning user id at all — the API had nothing to filter reads on, which
-- is the direct cause of every authenticated user being able to read every
-- other user's bookings. This migration adds the missing owner columns and
-- ties every fleet/billing reference back to a real row.

-- =============================================================================
-- bookings: who created it, who is running it
-- =============================================================================
alter table bookings
  add column if not exists user_id   uuid references users(id) on delete set null,
  add column if not exists vendor_id uuid references users(id) on delete set null;

create index if not exists bookings_user_id_idx   on bookings (user_id);
create index if not exists bookings_vendor_id_idx on bookings (vendor_id);

-- The trip date and the fare were both stored as free text (see 0001's
-- header comment). Nothing else on `bookings` is safe to retype without
-- knowing every value ever written to it in the wild, but these two are
-- about to be written by validated, numeric-only code paths, so tighten
-- them now rather than carry the same mistake forward.
alter table bookings
  alter column date type date using nullif(date, '')::date,
  alter column total_amount type numeric using nullif(total_amount, '')::numeric,
  alter column total_km type numeric using nullif(total_km, '')::numeric;

-- =============================================================================
-- drivers / vehicles: whose fleet is this
-- =============================================================================
alter table drivers
  add column if not exists vendor_id uuid references users(id) on delete cascade;

create index if not exists drivers_vendor_id_idx on drivers (vendor_id);

alter table vehicles
  add column if not exists vendor_id uuid references users(id) on delete cascade;

create index if not exists vehicles_vendor_id_idx on vehicles (vendor_id);

-- A plate is the real-world natural key for a vehicle; nothing stopped two
-- rows sharing one, which made the plate-based lookup in AssignForm
-- (matching a selected plate back to its vehicle type) non-deterministic.
alter table vehicles
  add constraint vehicles_plate_unique unique (plate);

-- =============================================================================
-- invoices: a real link to the booking it bills, and who it belongs to
-- =============================================================================
-- "bookingId" held a booking's uuid as text with no constraint at all.
-- Existing values are already valid uuids (or null), so this is a safe
-- one-shot retype rather than an expand/contract split.
alter table invoices rename column "bookingId" to booking_id;
alter table invoices
  alter column booking_id type uuid using nullif(booking_id, '')::uuid;
alter table invoices
  add constraint invoices_booking_id_fkey foreign key (booking_id) references bookings(id) on delete set null;

alter table invoices
  add column if not exists vendor_id uuid references users(id) on delete set null,
  add column if not exists user_id   uuid references users(id) on delete set null;

create index if not exists invoices_booking_id_idx on invoices (booking_id);
create index if not exists invoices_vendor_id_idx  on invoices (vendor_id);
create index if not exists invoices_user_id_idx    on invoices (user_id);

-- =============================================================================
-- RLS: close the one real anonymous-key exposure.
-- =============================================================================
-- 0001 granted `select on bookings to anon, authenticated` so the browser's
-- Realtime subscription (an anon-key client with no per-user identity) can
-- receive change events. With no RLS, that grant meant anyone holding the
-- public anon key could read every booking directly through PostgREST,
-- bypassing the Express API and its auth checks entirely.
--
-- The frontend subscriber (frontend/src/lib/realtime.ts) never reads the
-- change payload — it only uses the event as a signal to invalidate the
-- React Query cache and refetch through the authenticated API. So the fix
-- keeps row-level visibility open (Realtime still needs to see every row
-- change to know when to fire) but narrows the *columns* the anon/
-- authenticated roles can read to the ones a live-update signal actually
-- needs. Guest names, contact numbers, pricing and driver/vehicle details
-- are no longer reachable through the anon key.
alter table bookings enable row level security;

drop policy if exists bookings_realtime_read on bookings;
create policy bookings_realtime_read on bookings
  for select
  to anon, authenticated
  using (true);

revoke select on table public.bookings from anon, authenticated;
grant select (id, status, created_at) on table public.bookings to anon, authenticated;
