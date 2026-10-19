-- One-time: replace the admins table with staff (admin/manager roles).
-- Run once on databases created before this change, then re-run admin.sql.
create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'manager')),
  created_at timestamptz not null default now()
);
insert into public.staff (user_id, role, created_at)
select user_id, 'admin', created_at from public.admins
on conflict (user_id) do nothing;
drop table public.admins;
