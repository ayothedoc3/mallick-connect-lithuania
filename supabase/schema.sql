-- Mallick Assist marketplace: run this ONCE in Supabase > SQL Editor > New query.
-- Safe to re-run: it uses "if not exists" / "or replace" / drop-then-create.

-- ───────────────────────── Profiles ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  whatsapp text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, whatsapp)
  values (
    new.id,
    nullif(left(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), 80), ''),
    nullif(left(trim(coalesce(new.raw_user_meta_data->>'whatsapp', '')), 30), '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Listings ─────────────────────────
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seller_name text,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 5000),
  price_eur numeric(10,2) check (price_eur is null or price_eur >= 0),
  category text not null,
  condition text,
  city text,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'sold', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listings_status_created_idx on public.listings (status, created_at desc);
create index if not exists listings_user_idx on public.listings (user_id);
-- A listing is either an item for sale or a service a local provider offers.
-- For services, price_eur is the starting price and price_unit what it is charged per.
-- kind: item (marketplace), service (local pros), stay or hall (staff-managed, bookable).
alter table public.listings add column if not exists kind text not null default 'item';
alter table public.listings drop constraint if exists listings_kind_check;
alter table public.listings add constraint listings_kind_check
  check (kind in ('item', 'service', 'stay', 'hall'));
alter table public.listings add column if not exists price_unit text;
alter table public.listings drop constraint if exists listings_price_unit_check;
alter table public.listings add constraint listings_price_unit_check
  check (price_unit is null or price_unit in ('hour', 'session', 'person', 'job', 'night', 'day'));
-- Stays and halls: how many guests, and the deposit paid online to book.
alter table public.listings add column if not exists capacity int check (capacity is null or capacity > 0);
alter table public.listings add column if not exists deposit_eur numeric(10,2)
  check (deposit_eur is null or deposit_eur >= 0);
-- Paid or staff-granted "Featured" placement until this time.
alter table public.listings add column if not exists featured_until timestamptz;
create index if not exists listings_kind_status_created_idx on public.listings (kind, status, created_at desc);
alter table public.listings enable row level security;

-- Everyone sees live/sold listings; owners also see their own pending/rejected ones.
drop policy if exists "listings read" on public.listings;
create policy "listings read" on public.listings
  for select to anon, authenticated
  using (status in ('published', 'sold') or auth.uid() = user_id);

-- New listings always start as "pending" (you approve them).
drop policy if exists "listings insert own" on public.listings;
create policy "listings insert own" on public.listings
  for insert to authenticated
  with check (
    auth.uid() = user_id and status = 'pending'
    and kind in ('item', 'service') and featured_until is null
  );

drop policy if exists "listings update own" on public.listings;
create policy "listings update own" on public.listings
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "listings delete own" on public.listings;
create policy "listings delete own" on public.listings
  for delete to authenticated using (auth.uid() = user_id);

-- Sellers can never publish or reject their own listings; only you can, from the
-- Supabase dashboard (Table Editor), where auth.role() is not "authenticated".
create or replace function public.listings_guard()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if coalesce(auth.role(), '') = 'authenticated'
     and new.status is distinct from old.status
     and new.status not in ('pending', 'sold') then
    raise exception 'Only an administrator can publish or reject listings';
  end if;
  return new;
end $$;

drop trigger if exists listings_guard_trg on public.listings;
create trigger listings_guard_trg
  before update on public.listings
  for each row execute function public.listings_guard();

-- ─────────────────────── Listing media ───────────────────────
create table if not exists public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists listing_media_listing_idx on public.listing_media (listing_id);
alter table public.listing_media enable row level security;

drop policy if exists "media read" on public.listing_media;
create policy "media read" on public.listing_media
  for select to anon, authenticated
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (l.status in ('published', 'sold') or l.user_id = auth.uid())
  ));

drop policy if exists "media insert own" on public.listing_media;
create policy "media insert own" on public.listing_media
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and storage_path like auth.uid()::text || '/%'
    and exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

drop policy if exists "media delete own" on public.listing_media;
create policy "media delete own" on public.listing_media
  for delete to authenticated using (auth.uid() = user_id);

-- Max 8 photos and 2 videos per listing.
create or replace function public.listing_media_limits()
returns trigger language plpgsql as $$
declare n int;
begin
  select count(*) into n from public.listing_media
    where listing_id = new.listing_id and kind = new.kind;
  if new.kind = 'image' and n >= 8 then raise exception 'Too many photos (max 8)'; end if;
  if new.kind = 'video' and n >= 2 then raise exception 'Too many videos (max 2)'; end if;
  return new;
end $$;

drop trigger if exists listing_media_limits_trg on public.listing_media;
create trigger listing_media_limits_trg
  before insert on public.listing_media
  for each row execute function public.listing_media_limits();

-- ───────────────────────── Storage ─────────────────────────
-- Public bucket (anyone with a file's URL can view it). 50 MB per file is the
-- maximum on Supabase's free plan.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-media', 'listing-media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Users can only write inside their own folder: <user id>/...
drop policy if exists "listing media upload own folder" on storage.objects;
create policy "listing media upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listing media select own folder" on storage.objects;
create policy "listing media select own folder" on storage.objects
  for select to authenticated
  using (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listing media delete own folder" on storage.objects;
create policy "listing media delete own folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);
