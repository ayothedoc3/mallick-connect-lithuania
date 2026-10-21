-- Mallick Assist platform features. Run AFTER schema.sql and admin.sql.
-- Safe to re-run: it uses "if not exists" / "or replace" / drop-then-create.

create schema if not exists private;
create extension if not exists btree_gist with schema extensions;

-- ───────────────────────── Private settings ─────────────────────────
-- API keys and secrets. Only admins can read or change them (in /precious →
-- Integrations); the website's server reads them with the service key.
create table if not exists public.private_settings (
  id int primary key default 1 check (id = 1),
  site_url text not null default 'https://mallickassistservice.com',
  hooks_secret text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  auth_hook_secret text not null default '',
  stripe_secret_key text not null default '',
  stripe_webhook_secret text not null default '',
  resend_api_key text not null default '',
  email_from text not null default 'Mallick Assist Service <hello@mallickassistservice.com>',
  notify_emails text not null default '',
  telegram_bot_token text not null default '',
  telegram_chat_id text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.private_settings (id) values (1) on conflict (id) do nothing;
alter table public.private_settings enable row level security;

drop policy if exists "private settings admin read" on public.private_settings;
create policy "private settings admin read" on public.private_settings
  for select to authenticated using (public.is_admin());

drop policy if exists "private settings admin update" on public.private_settings;
create policy "private settings admin update" on public.private_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Public site settings ─────────────────────────
alter table public.site_settings add column if not exists payments_enabled boolean not null default false;
alter table public.site_settings add column if not exists feature_price_eur numeric(10,2) not null default 5
  check (feature_price_eur >= 1);
alter table public.site_settings add column if not exists feature_days int not null default 7
  check (feature_days between 1 and 90);
alter table public.site_settings add column if not exists legal_name text not null default 'Mallick Assist Service';
alter table public.site_settings add column if not exists company_code text not null default '';
alter table public.site_settings add column if not exists legal_address text not null default '';
alter table public.site_settings add column if not exists contact_email text not null default '';
alter table public.site_settings add column if not exists booking_terms text not null default
  'The deposit secures your dates and is deducted from the total. It is refundable if you cancel at least 7 days before your booking starts. The balance is paid on arrival.';

-- Online payments are on only when both Stripe keys are filled in.
create or replace function private.sync_payments_enabled()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  update public.site_settings
     set payments_enabled = (new.stripe_secret_key <> '' and new.stripe_webhook_secret <> '')
   where id = 1;
  return new;
end $$;
drop trigger if exists private_settings_sync on public.private_settings;
create trigger private_settings_sync
  before update on public.private_settings
  for each row execute function private.sync_payments_enabled();

-- ───────────────────────── Notifications ─────────────────────────
-- Database events call the website's /api/hooks/notify, which sends email and Telegram.
create or replace function private.notify(event text, record_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare s public.private_settings;
begin
  select * into s from public.private_settings where id = 1;
  perform net.http_post(
    url := s.site_url || '/api/hooks/notify',
    body := jsonb_build_object('event', event, 'id', record_id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-hook-secret', s.hooks_secret)
  );
end $$;
revoke all on function private.notify(text, uuid) from public, anon, authenticated;

create or replace function private.on_listing_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    perform private.notify('listing_submitted', new.id);
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'pending' then
      perform private.notify('listing_submitted', new.id);
    elsif new.status in ('published', 'rejected') then
      perform private.notify('listing_status', new.id);
    end if;
  end if;
  return null;
end $$;
drop trigger if exists listings_notify on public.listings;
create trigger listings_notify
  after insert or update of status on public.listings
  for each row execute function private.on_listing_change();

create or replace function private.on_request_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform private.notify('request_created', new.id);
  return null;
end $$;
drop trigger if exists service_requests_notify on public.service_requests;
create trigger service_requests_notify
  after insert on public.service_requests
  for each row execute function private.on_request_created();

-- ───────────────────────── Provider profiles ─────────────────────────
-- Public page for anyone offering a service. Staff set "Verified by Mallick".
create table if not exists public.provider_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  bio text not null default '' check (char_length(bio) <= 1500),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.provider_profiles enable row level security;

drop policy if exists "providers read" on public.provider_profiles;
create policy "providers read" on public.provider_profiles
  for select to anon, authenticated using (true);

drop policy if exists "providers update own" on public.provider_profiles;
create policy "providers update own" on public.provider_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "providers staff all" on public.provider_profiles;
create policy "providers staff all" on public.provider_profiles
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create or replace function private.provider_guard()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if coalesce(auth.role(), '') = 'authenticated' and not public.is_staff()
     and new.verified is distinct from old.verified then
    raise exception 'Only staff can verify providers';
  end if;
  return new;
end $$;
drop trigger if exists provider_guard_trg on public.provider_profiles;
create trigger provider_guard_trg
  before update on public.provider_profiles
  for each row execute function private.provider_guard();

-- A provider profile is created with someone's first service listing.
create or replace function private.ensure_provider_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'service' then
    insert into public.provider_profiles (user_id, display_name)
    values (new.user_id, coalesce(nullif(trim(new.seller_name), ''), 'Provider'))
    on conflict (user_id) do nothing;
  end if;
  return null;
end $$;
drop trigger if exists listings_provider_profile on public.listings;
create trigger listings_provider_profile
  after insert on public.listings
  for each row execute function private.ensure_provider_profile();

insert into public.provider_profiles (user_id, display_name)
select distinct on (l.user_id) l.user_id, coalesce(nullif(trim(l.seller_name), ''), 'Provider')
from public.listings l where l.kind = 'service'
on conflict (user_id) do nothing;

-- ───────────────────────── Reviews ─────────────────────────
-- Signed-in customers review a provider; staff approve before it shows.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(user_id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 80),
  rating int not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  unique (provider_id, author_id),
  check (provider_id <> author_id)
);
create index if not exists reviews_provider_idx on public.reviews (provider_id, status);
alter table public.reviews enable row level security;

drop policy if exists "reviews read" on public.reviews;
create policy "reviews read" on public.reviews
  for select to anon, authenticated using (status = 'published' or auth.uid() = author_id);

drop policy if exists "reviews insert own" on public.reviews;
create policy "reviews insert own" on public.reviews
  for insert to authenticated with check (auth.uid() = author_id and status = 'pending');

drop policy if exists "reviews staff all" on public.reviews;
create policy "reviews staff all" on public.reviews
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create or replace function private.on_review_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform private.notify('review_submitted', new.id);
  return null;
end $$;
drop trigger if exists reviews_notify on public.reviews;
create trigger reviews_notify
  after insert on public.reviews
  for each row execute function private.on_review_created();

-- Published rating per provider, for cards and profile pages.
create or replace view public.provider_ratings with (security_invoker = true) as
  select provider_id, round(avg(rating)::numeric, 1) as average, count(*) as count
  from public.reviews where status = 'published'
  group by provider_id;
grant select on public.provider_ratings to anon, authenticated;

-- ───────────────────────── Bookings ─────────────────────────
-- Created by the website's server when a customer starts paying a deposit; confirmed
-- by the Stripe webhook. Only staff can see them.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  start_date date not null,
  end_date date not null check (end_date > start_date),
  guests int not null check (guests > 0),
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  customer_whatsapp text not null check (char_length(customer_whatsapp) between 3 and 40),
  customer_email text not null check (char_length(customer_email) between 3 and 200),
  note text check (note is null or char_length(note) <= 2000),
  total_eur numeric(10,2) not null check (total_eur >= 0),
  deposit_eur numeric(10,2) not null check (deposit_eur > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  stripe_session_id text unique,
  expires_at timestamptz not null default now() + interval '35 minutes',
  created_at timestamptz not null default now(),
  -- A listing can never have two active bookings on the same dates.
  constraint bookings_no_overlap exclude using gist (
    listing_id with =, daterange(start_date, end_date) with &&
  ) where (status in ('pending', 'confirmed'))
);
create index if not exists bookings_listing_idx on public.bookings (listing_id, start_date);
alter table public.bookings enable row level security;

drop policy if exists "bookings staff all" on public.bookings;
create policy "bookings staff all" on public.bookings
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Dates already taken, for the public booking calendar (no customer details).
create or replace function public.listing_booked_ranges(target uuid)
returns table (start_date date, end_date date)
language sql stable security definer set search_path = public as $$
  select b.start_date, b.end_date from public.bookings b
  where b.listing_id = target and b.end_date >= current_date
    and (b.status = 'confirmed' or (b.status = 'pending' and b.expires_at > now()))
  order by b.start_date;
$$;
grant execute on function public.listing_booked_ranges(uuid) to anon, authenticated;
