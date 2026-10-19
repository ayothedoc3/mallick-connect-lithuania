-- Mallick Assist admin panel (/precious). Run AFTER schema.sql.
-- Safe to re-run: it uses "if not exists" / "or replace" / drop-then-create.

-- ───────────────────────── Admins ─────────────────────────
-- Add an admin:  insert into public.admins (user_id) select id from auth.users where email = '...';
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins read own" on public.admins;
create policy "admins read own" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ─────────────────── Admin access to marketplace ───────────────────
drop policy if exists "listings admin all" on public.listings;
create policy "listings admin all" on public.listings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "media admin all" on public.listing_media;
create policy "media admin all" on public.listing_media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "profiles admin read" on public.profiles;
create policy "profiles admin read" on public.profiles
  for select to authenticated using (public.is_admin());

drop policy if exists "listing media admin delete" on storage.objects;
create policy "listing media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'listing-media' and public.is_admin());

-- Sellers still cannot publish/reject their own listings; admins can.
create or replace function public.listings_guard()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if coalesce(auth.role(), '') = 'authenticated'
     and not public.is_admin()
     and new.status is distinct from old.status
     and new.status not in ('pending', 'sold') then
    raise exception 'Only an administrator can publish or reject listings';
  end if;
  return new;
end $$;

-- Accounts with email, last sign-in and listing count (admins only).
create or replace function public.admin_list_users()
returns table (
  id uuid, email text, display_name text, whatsapp text,
  created_at timestamptz, last_sign_in_at timestamptz, listing_count bigint, is_admin boolean
) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  return query
    select u.id, u.email::text, p.display_name, p.whatsapp, u.created_at, u.last_sign_in_at,
           (select count(*) from public.listings l where l.user_id = u.id),
           exists (select 1 from public.admins a where a.user_id = u.id)
    from auth.users u left join public.profiles p on p.id = u.id
    order by u.created_at desc;
end $$;
revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- ───────────────────────── Site settings ─────────────────────────
-- One row. Everyone can read it; only admins can change it.
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  phone text not null,
  phone_display text not null,
  city text not null,
  tiktok_url text not null,
  tiktok_handle text not null,
  banner_enabled boolean not null default false,
  banner_text text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id, phone, phone_display, city, tiktok_url, tiktok_handle)
values (1, '+37062434541', '+370 624 34541', 'Vilnius, Lithuania',
        'https://www.tiktok.com/@mallickinternational20', '@mallickinternational20')
on conflict (id) do nothing;
alter table public.site_settings enable row level security;

drop policy if exists "settings read" on public.site_settings;
create policy "settings read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "settings admin update" on public.site_settings;
create policy "settings admin update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Service requests ─────────────────────────
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  whatsapp text not null check (char_length(whatsapp) between 3 and 40),
  email text check (email is null or char_length(email) <= 200),
  service text not null check (char_length(service) <= 120),
  city text check (city is null or char_length(city) <= 120),
  budget text check (budget is null or char_length(budget) <= 60),
  preferred_date date,
  message text check (message is null or char_length(message) <= 5000),
  status text not null default 'new' check (status in ('new', 'contacted', 'done')),
  created_at timestamptz not null default now()
);
create index if not exists service_requests_created_idx on public.service_requests (created_at desc);
alter table public.service_requests enable row level security;

-- Visitors can submit (always as "new"); only admins can read or manage.
drop policy if exists "requests insert" on public.service_requests;
create policy "requests insert" on public.service_requests
  for insert to anon, authenticated with check (status = 'new');

drop policy if exists "requests admin all" on public.service_requests;
create policy "requests admin all" on public.service_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
