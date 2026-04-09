create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text not null default '',
  email text not null default '',
  phone text not null default '',
  tax_number text not null default '',
  default_currency text not null default 'USD',
  default_tax_label text not null default 'Tax',
  default_tax_rate numeric(5,2) not null default 0,
  default_payment_terms text not null default '',
  logo_url text null,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  address text not null default '',
  email text not null default '',
  phone text not null default '',
  tax_number text not null default '',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid null references public.customers(id) on delete set null,
  kind text not null check (kind in ('quotation', 'invoice', 'receipt')),
  status text not null check (status in ('draft', 'exported')),
  document_number text not null,
  issue_date date not null,
  payload_version integer not null,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint documents_business_kind_number_key unique (business_id, kind, document_number)
);

create index if not exists businesses_user_id_idx on public.businesses(user_id);
create index if not exists customers_business_id_idx on public.customers(business_id);
create index if not exists documents_business_id_idx on public.documents(business_id);
create index if not exists documents_customer_id_idx on public.documents(customer_id);

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_businesses_updated_at on public.businesses;
create trigger set_businesses_updated_at
before update on public.businesses
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.businesses enable row level security;

create policy "Users can read their own businesses"
on public.businesses
for select
using (auth.uid() = user_id);

create policy "Users can insert their own businesses"
on public.businesses
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own businesses"
on public.businesses
for update
using (auth.uid() = user_id);

create policy "Users can delete their own businesses"
on public.businesses
for delete
using (auth.uid() = user_id);

alter table public.customers enable row level security;

create policy "Users can read customers for their businesses"
on public.customers
for select
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = customers.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Users can insert customers for their businesses"
on public.customers
for insert
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = customers.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Users can update customers for their businesses"
on public.customers
for update
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = customers.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Users can delete customers for their businesses"
on public.customers
for delete
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = customers.business_id
      and businesses.user_id = auth.uid()
  )
);

alter table public.documents enable row level security;

create policy "Users can read documents for their businesses"
on public.documents
for select
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = documents.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Users can insert documents for their businesses"
on public.documents
for insert
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = documents.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Users can update documents for their businesses"
on public.documents
for update
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = documents.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Users can delete documents for their businesses"
on public.documents
for delete
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = documents.business_id
      and businesses.user_id = auth.uid()
  )
);
