-- ============================================================
-- Facebook Gallery Feature
-- gallery_sources, gallery_photos, gallery_placements
-- ============================================================

-- Facebook Page connection config (one row per connected page)
create table if not exists gallery_sources (
  id                uuid primary key default uuid_generate_v4(),
  source_type       text not null default 'facebook',
  page_id           text,
  selected_album_id text,
  access_token      text,           -- page access token; admin-only RLS keeps this private
  enabled           boolean default true,
  default_title     text default 'Latest From Facebook',
  default_intro     text,
  last_synced_at    timestamptz,
  sync_status       text default 'idle',  -- idle | syncing | success | error
  sync_error        text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Photos synced from Facebook
create table if not exists gallery_photos (
  id            uuid primary key default uuid_generate_v4(),
  external_id   text unique not null,   -- Facebook photo ID
  source_id     uuid references gallery_sources(id) on delete cascade,
  image_url     text,
  thumbnail_url text,
  facebook_url  text,
  caption       text,
  created_time  timestamptz,
  featured      boolean default false,
  enabled       boolean default true,
  sort_order    integer default 0,
  metadata      jsonb default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Where gallery sections are placed (CMS page builder stores this in page_sections.content,
-- but this table lets the homepage and future placements be configured without a CMS page)
create table if not exists gallery_placements (
  id                 uuid primary key default uuid_generate_v4(),
  page_slug          text default 'home',
  section_key        text default 'facebook_gallery',
  gallery_source_id  uuid references gallery_sources(id) on delete set null,
  enabled            boolean default true,
  title_override     text,
  intro_override     text,
  display_mode       text default 'slideshow',   -- slideshow | grid
  max_images         integer default 12,
  sort_mode          text default 'featured_first',  -- featured_first | newest | manual
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

alter table gallery_sources enable row level security;
alter table gallery_photos enable row level security;
alter table gallery_placements enable row level security;

-- gallery_sources: admin-only (access token must never be readable publicly)
create policy "Admin full access to gallery_sources"
  on gallery_sources for all using (is_admin());

-- gallery_photos: public can read enabled photos; admins have full access
create policy "Public can read enabled gallery photos"
  on gallery_photos for select using (enabled = true);
create policy "Admin full access to gallery_photos"
  on gallery_photos for all using (is_admin());

-- gallery_placements: public can read enabled placements; admins have full access
create policy "Public can read enabled gallery placements"
  on gallery_placements for select using (enabled = true);
create policy "Admin full access to gallery_placements"
  on gallery_placements for all using (is_admin());

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists gallery_photos_source_id_idx on gallery_photos(source_id);
create index if not exists gallery_photos_enabled_idx on gallery_photos(enabled);
create index if not exists gallery_photos_sort_idx on gallery_photos(featured desc, sort_order asc, created_time desc);
create index if not exists gallery_placements_page_idx on gallery_placements(page_slug, section_key);
