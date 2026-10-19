-- Mallick Assist admin panel (/precious). Run AFTER schema.sql.
-- Safe to re-run: it uses "if not exists" / "or replace" / drop-then-create.

-- ───────────────────────── Staff ─────────────────────────
-- admin:   everything, including site settings and staff roles
-- manager: listings and service requests only
-- First admin:  insert into public.staff (user_id, role)
--               select id, 'admin' from auth.users where email = '...';
create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'manager')),
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create or replace function public.staff_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.staff where user_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.staff_role() = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.staff_role() is not null;
$$;

drop policy if exists "staff read own" on public.staff;
create policy "staff read own" on public.staff
  for select to authenticated using (user_id = auth.uid());

-- Admins set a user's role ('admin', 'manager') or remove it (null). An admin cannot
-- change their own role, so the site can never be left without an admin by accident.
create or replace function public.set_staff_role(target uuid, new_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  if target = auth.uid() then
    raise exception 'You cannot change your own role';
  end if;
  if new_role is null then
    delete from public.staff where user_id = target;
  elsif new_role in ('admin', 'manager') then
    insert into public.staff (user_id, role) values (target, new_role)
    on conflict (user_id) do update set role = excluded.role;
  else
    raise exception 'Unknown role %', new_role;
  end if;
end $$;
revoke all on function public.set_staff_role(uuid, text) from public, anon;
grant execute on function public.set_staff_role(uuid, text) to authenticated;

-- ─────────────────── Staff access to marketplace ───────────────────
drop policy if exists "listings admin all" on public.listings;
drop policy if exists "listings staff all" on public.listings;
create policy "listings staff all" on public.listings
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "media admin all" on public.listing_media;
drop policy if exists "media staff all" on public.listing_media;
create policy "media staff all" on public.listing_media
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "profiles admin read" on public.profiles;
drop policy if exists "profiles staff read" on public.profiles;
create policy "profiles staff read" on public.profiles
  for select to authenticated using (public.is_staff());

drop policy if exists "listing media admin delete" on storage.objects;
drop policy if exists "listing media staff delete" on storage.objects;
create policy "listing media staff delete" on storage.objects
  for delete to authenticated using (bucket_id = 'listing-media' and public.is_staff());

-- Sellers can only add photos/videos while a listing is waiting for review.
drop policy if exists "media insert own" on public.listing_media;
create policy "media insert own" on public.listing_media
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and storage_path like auth.uid()::text || '/%'
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id = auth.uid() and l.status = 'pending'
    )
  );

-- Sellers cannot publish/reject their own listings, and editing the content of an
-- approved listing sends it back for review. Staff are not restricted.
create or replace function public.listings_guard()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if coalesce(auth.role(), '') = 'authenticated' and not public.is_staff() then
    if new.status is distinct from old.status and new.status not in ('pending', 'sold') then
      raise exception 'Only staff can publish or reject listings';
    end if;
    if (new.title, new.description, new.price_eur, new.category, new.condition, new.city, new.seller_name)
       is distinct from
       (old.title, old.description, old.price_eur, old.category, old.condition, old.city, old.seller_name)
    then
      new.status := 'pending';
    end if;
  end if;
  return new;
end $$;

-- Accounts with email, last sign-in, listing count and staff role (admins only).
drop function if exists public.admin_list_users();
create or replace function public.admin_list_users()
returns table (
  id uuid, email text, display_name text, whatsapp text,
  created_at timestamptz, last_sign_in_at timestamptz, listing_count bigint, role text
) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  return query
    select u.id, u.email::text, p.display_name, p.whatsapp, u.created_at, u.last_sign_in_at,
           (select count(*) from public.listings l where l.user_id = u.id),
           (select s.role from public.staff s where s.user_id = u.id)
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
-- Google Analytics 4 measurement ID, e.g. G-ABC123XYZ. Empty = analytics off.
alter table public.site_settings add column if not exists ga_measurement_id text not null default ''
  check (ga_measurement_id = '' or ga_measurement_id ~ '^G-[A-Z0-9]{4,20}$');
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

-- Visitors can submit (always as "new"); only staff can read or manage.
drop policy if exists "requests insert" on public.service_requests;
create policy "requests insert" on public.service_requests
  for insert to anon, authenticated with check (status = 'new');

drop policy if exists "requests admin all" on public.service_requests;
drop policy if exists "requests staff all" on public.service_requests;
create policy "requests staff all" on public.service_requests
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
