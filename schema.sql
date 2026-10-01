-- FLOW Petroleum MVP: Supabase/PostgreSQL starter schema
create extension if not exists pgcrypto;

create type public.app_role as enum ('owner', 'admin', 'manager');
create type public.shift_status as enum ('open', 'closed', 'review');
create type public.payment_method as enum ('cash', 'card', 'online', 'credit');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'manager',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_time time not null,
  end_time time not null,
  manager_id uuid references public.profiles(id),
  active boolean not null default true
);

create table public.fuel_types (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  current_rate numeric(12,2) not null default 0,
  active boolean not null default true
);

create table public.tanks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fuel_type_id uuid not null references public.fuel_types(id),
  capacity_litres numeric(12,2) not null,
  current_stock_litres numeric(12,2) not null default 0
);

create table public.nozzles (
  id uuid primary key default gen_random_uuid(),
  machine_number text not null,
  nozzle_number text not null,
  tank_id uuid not null references public.tanks(id),
  active boolean not null default true,
  unique(machine_number, nozzle_number)
);

create table public.shift_closings (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts(id),
  business_date date not null,
  opening_cash numeric(14,2) not null default 0,
  closing_cash numeric(14,2) not null default 0,
  expected_cash numeric(14,2) not null default 0,
  cash_difference numeric(14,2) generated always as (closing_cash - expected_cash) stored,
  status public.shift_status not null default 'open',
  closed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.meter_readings (
  id uuid primary key default gen_random_uuid(),
  shift_closing_id uuid not null references public.shift_closings(id) on delete cascade,
  nozzle_id uuid not null references public.nozzles(id),
  previous_reading numeric(14,2) not null,
  current_reading numeric(14,2) not null,
  sold_litres numeric(14,2) generated always as (current_reading - previous_reading) stored,
  rate numeric(12,2) not null,
  sale_amount numeric(14,2) generated always as ((current_reading - previous_reading) * rate) stored,
  check (current_reading >= previous_reading)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  amount numeric(14,2) not null check (amount >= 0),
  payment_method public.payment_method not null default 'cash',
  expense_date date not null default current_date,
  receipt_url text,
  entered_by uuid references public.profiles(id),
  approved boolean not null default false
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  identity_number text,
  designation text not null,
  shift_id uuid references public.shifts(id),
  monthly_salary numeric(14,2) not null default 0,
  active boolean not null default true,
  joining_date date
);

create table public.salary_payments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id),
  salary_month date not null,
  gross_salary numeric(14,2) not null,
  advance numeric(14,2) not null default 0,
  deduction numeric(14,2) not null default 0,
  overtime numeric(14,2) not null default 0,
  net_salary numeric(14,2) generated always as (gross_salary + overtime - advance - deduction) stored,
  paid_at date
);

create table public.other_income (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  amount numeric(14,2) not null check (amount >= 0),
  payment_method public.payment_method not null default 'cash',
  income_date date not null default current_date,
  notes text,
  entered_by uuid references public.profiles(id)
);

alter table public.profiles enable row level security;
alter table public.shifts enable row level security;
alter table public.fuel_types enable row level security;
alter table public.tanks enable row level security;
alter table public.nozzles enable row level security;
alter table public.shift_closings enable row level security;
alter table public.meter_readings enable row level security;
alter table public.expenses enable row level security;
alter table public.employees enable row level security;
alter table public.salary_payments enable row level security;
alter table public.other_income enable row level security;

-- Starter policy for authenticated station staff. Tighten by role before production.
create policy "authenticated staff can read station data" on public.fuel_types for select to authenticated using (true);
create policy "authenticated staff can read tanks" on public.tanks for select to authenticated using (true);
create policy "authenticated staff can read profiles" on public.profiles for select to authenticated using (true);
