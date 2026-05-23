-- ============================================================
-- Stella Vaulting Academy – Initial Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ADMIN USERS
-- ============================================================
create table if not exists admin_users (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  email       text not null,
  created_at  timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- PAGES
-- ============================================================
create table if not exists pages (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  meta_description text,
  og_image        text,
  published       boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- PAGE SECTIONS
-- ============================================================
create table if not exists page_sections (
  id           uuid primary key default uuid_generate_v4(),
  page_id      uuid references pages(id) on delete cascade,
  section_type text not null, -- hero, text_block, image_text, gallery, call_to_action, event_countdown
  order_index  integer default 0,
  content      jsonb default '{}',
  published    boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- POSTS (for pinned posts / news / updates)
-- ============================================================
create table if not exists posts (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  short_description text,
  body            text,
  image           text,
  published       boolean default false,
  pinned          boolean default false,
  pin_order       integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
create table if not exists team_members (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  role          text,
  bio           text,
  photo         text,
  display_order integer default 0,
  published     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- EVENTS
-- ============================================================
create table if not exists events (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  event_date          timestamptz,
  location            text,
  description         text,
  image               text,
  fundraising_target  numeric(10,2),
  show_countdown      boolean default true,
  published           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- FUNDRAISING PRODUCTS
-- ============================================================
create table if not exists fundraising_products (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  description  text,
  price        numeric(10,2) not null,
  image        text,
  emoji        text,
  stripe_price_id text,
  display_order integer default 0,
  published    boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- SPONSORSHIP ITEMS
-- ============================================================
create table if not exists sponsorship_items (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  body          text,
  image         text,
  tier          text, -- e.g. 'platinum', 'gold', 'silver', 'bronze'
  amount        numeric(10,2),
  cta_text      text,
  cta_url       text,
  display_order integer default 0,
  published     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- GALLERIES (Stella + Community)
-- ============================================================
create table if not exists galleries (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  description text,
  cover_image text,
  gallery_type text default 'stella', -- 'stella' | 'community'
  published   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- GALLERY IMAGES
-- ============================================================
create table if not exists gallery_images (
  id              uuid primary key default uuid_generate_v4(),
  gallery_id      uuid references galleries(id) on delete cascade,
  title           text,
  description     text,
  category        text, -- Training, Exercise, Event, Behind the Scenes
  tags            text[],
  image_date      date,
  -- Stella gallery fields
  image_url       text,
  -- Community gallery fields (separate low/high res)
  preview_url     text, -- low-res watermarked
  highres_url     text, -- high-res for purchase
  price           numeric(10,2),
  event_name      text,
  club_name       text,
  rider_name      text,
  for_sale        boolean default false,
  display_order   integer default 0,
  published       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  stripe_session_id text unique,
  customer_email    text,
  customer_name     text,
  message           text, -- social shout-out message
  total_amount      numeric(10,2),
  status            text default 'pending', -- pending, paid, fulfilled, refunded
  order_type        text default 'mixed', -- 'donation', 'photo', 'mixed'
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table if not exists order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references orders(id) on delete cascade,
  item_type       text not null, -- 'donation', 'community_photo'
  item_id         uuid, -- references fundraising_products or gallery_images
  item_name       text,
  unit_price      numeric(10,2),
  quantity        integer default 1,
  download_url    text, -- for photo orders
  fulfilled       boolean default false,
  created_at      timestamptz default now()
);

-- ============================================================
-- SITE SETTINGS (key/value store for global settings)
-- ============================================================
create table if not exists site_settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table admin_users enable row level security;
alter table pages enable row level security;
alter table page_sections enable row level security;
alter table posts enable row level security;
alter table team_members enable row level security;
alter table events enable row level security;
alter table fundraising_products enable row level security;
alter table sponsorship_items enable row level security;
alter table galleries enable row level security;
alter table gallery_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table site_settings enable row level security;

-- Helper function: is_admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$ language sql security definer;

-- PUBLIC READ policies (published content only)
create policy "Public can read published pages" on pages for select using (published = true);
create policy "Public can read published sections" on page_sections for select using (published = true);
create policy "Public can read published posts" on posts for select using (published = true);
create policy "Public can read published team members" on team_members for select using (published = true);
create policy "Public can read published events" on events for select using (published = true);
create policy "Public can read published fundraising products" on fundraising_products for select using (published = true);
create policy "Public can read published sponsorship items" on sponsorship_items for select using (published = true);
create policy "Public can read published galleries" on galleries for select using (published = true);
create policy "Public can read published gallery images" on gallery_images for select using (published = true);
create policy "Public can read site settings" on site_settings for select using (true);

-- ADMIN FULL ACCESS policies
create policy "Admin full access to admin_users" on admin_users for all using (is_admin());
create policy "Admin full access to pages" on pages for all using (is_admin());
create policy "Admin full access to page_sections" on page_sections for all using (is_admin());
create policy "Admin full access to posts" on posts for all using (is_admin());
create policy "Admin full access to team_members" on team_members for all using (is_admin());
create policy "Admin full access to events" on events for all using (is_admin());
create policy "Admin full access to fundraising_products" on fundraising_products for all using (is_admin());
create policy "Admin full access to sponsorship_items" on sponsorship_items for all using (is_admin());
create policy "Admin full access to galleries" on galleries for all using (is_admin());
create policy "Admin full access to gallery_images" on gallery_images for all using (is_admin());
create policy "Admin full access to orders" on orders for all using (is_admin());
create policy "Admin full access to order_items" on order_items for all using (is_admin());
create policy "Admin full access to site_settings" on site_settings for all using (is_admin());

-- Allow inserting orders (for checkout flow - anonymous)
create policy "Anyone can create orders" on orders for insert with check (true);
create policy "Anyone can create order items" on order_items for insert with check (true);

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard or via CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('images', 'images', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('community-gallery', 'community-gallery', false) on conflict do nothing;
