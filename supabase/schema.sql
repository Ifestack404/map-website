-- World Folder Map — Stage 5 country knowledge
-- Run this in the Supabase SQL editor, then run seed.sql.

create table if not exists public.countries (
  id text primary key,
  name text not null,
  iso_code text,
  continent text,
  capital text,
  population bigint,
  area numeric,
  description text,
  flag_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists countries_iso_code_idx on public.countries (iso_code);
create index if not exists countries_continent_idx on public.countries (continent);
create index if not exists countries_name_idx on public.countries (name);

comment on table public.countries is
  'Descriptive country knowledge. Geometry stays in the client atlas; ids match world-atlas ISO numeric strings.';

-- Future-ready media slots. Stage 5 does not query or upload files here.
create table if not exists public.country_media (
  id uuid primary key default gen_random_uuid(),
  country_id text not null references public.countries (id) on delete cascade,
  kind text not null check (kind in ('image', 'landmark', 'map')),
  url text not null,
  title text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists country_media_country_id_idx on public.country_media (country_id);

alter table public.countries enable row level security;
alter table public.country_media enable row level security;

drop policy if exists "Public read countries" on public.countries;
create policy "Public read countries"
  on public.countries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read country media" on public.country_media;
create policy "Public read country media"
  on public.country_media
  for select
  to anon, authenticated
  using (true);
