-- Aayna security & exploration (run in Supabase SQL editor as a privileged role).
-- Do not put passwords in the frontend. Admin access is email-based.

create or replace function public.is_aayna_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'parthjbariya@gmail.com';
$$;

revoke all on function public.is_aayna_admin() from public;
grant execute on function public.is_aayna_admin() to authenticated;

create table if not exists public.explorations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id text not null,
  place_name text not null,
  category text not null,
  explored_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create index if not exists explorations_user_id_idx on public.explorations (user_id);

alter table public.explorations enable row level security;

drop policy if exists "explorations_select_own" on public.explorations;
create policy "explorations_select_own"
  on public.explorations for select
  using (auth.uid() = user_id or public.is_aayna_admin());

drop policy if exists "explorations_insert_own" on public.explorations;
create policy "explorations_insert_own"
  on public.explorations for insert
  with check (auth.uid() = user_id);

drop policy if exists "explorations_update_own" on public.explorations;
create policy "explorations_update_own"
  on public.explorations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "explorations_delete_own" on public.explorations;
create policy "explorations_delete_own"
  on public.explorations for delete
  using (auth.uid() = user_id);

-- Shared place catalog used by the public app and admin dashboard.
create table if not exists public.places (
  id text primary key,
  name text not null,
  category text not null,
  coordinates jsonb not null,
  description text not null default '',
  rating numeric not null default 0,
  image text,
  history text,
  historical_significance text,
  architecture text,
  cultural_significance text,
  interesting_facts jsonb,
  historical_images jsonb,
  address text,
  estimated_exploration_time text,
  best_time text,
  opening_hours text,
  things_to_see jsonb,
  gallery jsonb,
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;

drop policy if exists "places_select_public" on public.places;
create policy "places_select_public"
  on public.places for select
  using (true);

drop policy if exists "places_insert_admin" on public.places;
create policy "places_insert_admin"
  on public.places for insert
  with check (public.is_aayna_admin());

drop policy if exists "places_update_admin" on public.places;
create policy "places_update_admin"
  on public.places for update
  using (public.is_aayna_admin())
  with check (public.is_aayna_admin());

drop policy if exists "places_delete_admin" on public.places;
create policy "places_delete_admin"
  on public.places for delete
  using (public.is_aayna_admin());

drop policy if exists "explorations_select_admin" on public.explorations;
create policy "explorations_select_admin"
  on public.explorations for select
  using (public.is_aayna_admin());

-- Example: lock any future admin-only tables with:
-- using (public.is_aayna_admin()) with check (public.is_aayna_admin());
-- Regular users cannot become admin by visiting /admin; RLS must also reject writes.

-- Registered user directory used by the admin Users screen.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_admin_or_own" on public.profiles;
create policy "profiles_select_admin_or_own"
  on public.profiles for select
  using (auth.uid() = id or public.is_aayna_admin());

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

-- Backfill users that existed before the trigger was installed.
insert into public.profiles (id, full_name, email, created_at)
select id, coalesce(raw_user_meta_data ->> 'full_name', ''), coalesce(email, ''), created_at
from auth.users
on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email;
