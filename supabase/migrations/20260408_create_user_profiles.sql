create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_profiles enable row level security;

create policy "Users can read their own profile"
on public.user_profiles
for select
using (auth.uid() = user_id);

create policy "Users can insert their own profile"
on public.user_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own profile"
on public.user_profiles
for update
using (auth.uid() = user_id);
