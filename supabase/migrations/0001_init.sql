-- Cab Booking Portal — initial schema migration.
--
-- NOTE: column naming reflects the current application code. `bookings`,
-- `drivers`, and `vehicles` use snake_case (the backend maps camelCase input),
-- while `invoices` is written pass-through and therefore uses camelCase.
-- Unifying to snake_case everywhere is tracked as tech debt (normalization).

create extension if not exists pgcrypto;

-- =============================================================================
-- users
-- =============================================================================
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  password    text not null,            -- bcrypt hash
  role        text not null check (role in ('company', 'vendor')),
  name        text,
  created_at  timestamptz not null default now()
);

-- =============================================================================
-- bookings (trip + assignment + billing + open-market)
-- =============================================================================
create table if not exists bookings (
  id                        uuid primary key default gen_random_uuid(),
  company                   text,
  guest                     text,
  date                      text,
  pickup                    text,
  drop                      text,
  category                  text,
  contact                   text,
  status                    text not null default 'pending'
                            check (status in ('pending', 'upcoming', 'ongoing', 'completed', 'cancelled', 'open_market')),
  driver                    text,
  vehicle_type              text,
  vehicle_number            text,
  reference_name            text,
  invoice_number            text,
  assoc_vendor              text,
  accepted_by_vendor        text,
  cancelled_by              text,
  source                    text,       -- 'manual' | null (corporate)
  notes                     text,
  location                  text,
  location_link             text,
  -- billing / trip snapshot (populated by the client-side trip flow)
  op_km                     text,
  total_km                  text,
  pickup_time               text,
  drop_time                 text,
  toll_parking              text,
  night                     text,
  total_amount              text,
  fuel_office               text,
  fuel_cash                 text,
  road_tax                  text,
  expenses                  text,
  adv_office                text,
  -- lifecycle timestamps
  open_market_placed_at     timestamptz,
  open_market_accepted_at   timestamptz,
  trip_started_at           timestamptz,
  trip_ended_at             timestamptz,
  cancelled_at              timestamptz,
  created_at                timestamptz not null default now()
);

create index if not exists bookings_status_idx  on bookings (status);
create index if not exists bookings_company_idx on bookings (company);
create index if not exists bookings_date_idx   on bookings (date);

-- =============================================================================
-- drivers
-- =============================================================================
create table if not exists drivers (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  date_of_joining text,
  vehicle_type    text,
  vehicle_number  text,
  pan             text,
  aadhar          text,
  license         text,
  contact         text,
  email           text,
  address         text,
  salary          text,
  department      text,
  account_number  text,
  ifsc_code       text,
  created_at      timestamptz not null default now()
);

-- =============================================================================
-- vehicles
-- =============================================================================
create table if not exists vehicles (
  id           uuid primary key default gen_random_uuid(),
  type         text,
  plate        text,
  model        text,
  availability text,
  condition    text,
  insurance    text,
  created_at   timestamptz not null default now()
);

-- =============================================================================
-- invoices (pass-through: camelCase columns to match the API insert body)
-- =============================================================================
create table if not exists invoices (
  id            uuid primary key default gen_random_uuid(),
  bookingId     text,
  invoiceNumber text,
  company       text,
  amount        numeric,
  status        text not null default 'pending' check (status in ('pending', 'received')),
  date          text,
  month         text,
  fileUrl       text,
  created_at    timestamptz not null default now()
);

create index if not exists invoices_company_idx on invoices (company);
create index if not exists invoices_month_idx   on invoices (month);

-- Enable Realtime for the bookings table (live updates on the dashboard).
alter publication supabase_realtime add table public.bookings;
