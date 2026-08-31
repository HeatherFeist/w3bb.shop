-- W3BB Shop — initial schema (v1)
--
-- A single-storefront shop (one business, one or a few admins), not a
-- multi-tenant SaaS — so this is much simpler than a per-customer app:
-- one products table, one orders table, and RLS that just checks
-- "is this an authenticated admin" rather than "does this row belong to
-- this particular signed-in user".
--
-- Admin access: any row in admin_users counts as an admin. Add yourself
-- and your mom by running, once each of you has signed up in Supabase
-- Auth (Authentication -> Users -> Add user, or via the app once a
-- sign-up flow exists):
--   insert into admin_users (user_id) values ('<their auth.users id>');

create table if not exists admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

-- Anyone signed in can check membership (needed so the app can tell if
-- the current user is an admin) but only an existing admin can add another.
create policy "admin_users: read own row" on admin_users
  for select using (auth.uid() = user_id);

create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from admin_users where user_id = uid);
$$;

-- --- Products -----------------------------------------------------------

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null check (category in ('dream_catcher', 'tie_dye', 'diy_kit')),
  price_cents integer not null check (price_cents >= 0),
  images text[] not null default '{}',
  -- Made-to-order items (track_stock = false) are always shown as
  -- available. Stocked items (track_stock = true) show "Sold out" once
  -- stock_qty hits 0, and stock_qty decrements automatically when an
  -- order is marked paid (see the stripe-webhook / square-webhook
  -- functions).
  track_stock boolean not null default false,
  stock_qty integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- The storefront (anonymous visitors) can only ever see active products.
create policy "products: public read active" on products
  for select using (is_active = true);

-- Admins can see and manage everything, active or not.
create policy "products: admin read/write" on products
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create index if not exists products_category_idx on products (category);
create index if not exists products_slug_idx on products (slug);

-- Public storage bucket for product photos.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product-images: public read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product-images: admin write" on storage.objects
  for all using (bucket_id = 'product-images' and is_admin(auth.uid()))
  with check (bucket_id = 'product-images' and is_admin(auth.uid()));

-- --- Orders ---------------------------------------------------------

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  shipping_address jsonb not null,
  items jsonb not null, -- [{ product_id, name, price_cents, quantity }]
  subtotal_cents integer not null,
  total_cents integer not null,
  payment_provider text not null check (payment_provider in ('stripe', 'square')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id text,
  square_order_id text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

-- Orders are created and updated only by the edge functions (service-role
-- key, bypasses RLS) — customers never read/write this table directly, so
-- the only policy needed is admin read access for the Orders dashboard.
create policy "orders: admin read" on orders
  for select using (is_admin(auth.uid()));

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_stripe_session_idx on orders (stripe_session_id);
create index if not exists orders_square_order_idx on orders (square_order_id);
