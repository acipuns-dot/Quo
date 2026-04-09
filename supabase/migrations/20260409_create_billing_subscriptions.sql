create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('paypal')),
  provider_subscription_id text not null unique,
  plan_interval text not null check (plan_interval in ('monthly', 'yearly')),
  status text not null,
  current_period_start timestamptz null,
  current_period_end timestamptz null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists billing_subscriptions_user_id_idx
on public.billing_subscriptions(user_id);

drop trigger if exists set_billing_subscriptions_updated_at on public.billing_subscriptions;
create trigger set_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.billing_subscriptions enable row level security;

create policy "Users can read their own billing subscriptions"
on public.billing_subscriptions
for select
using (auth.uid() = user_id);
