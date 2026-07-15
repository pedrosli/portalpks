-- Hub de Imóveis: schema inicial, RLS e storage bucket de fotos.
-- Rodar este arquivo no SQL Editor do Supabase (ou via `supabase db push`).

-- ---------------------------------------------------------------------------
-- Extensões
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'broker' check (role in ('admin', 'broker')),
  name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  neighborhood text,
  price numeric,
  area_m2 numeric,
  bedrooms integer,
  bathrooms integer,
  parking_spots integer,
  furnished boolean not null default false,
  condo_fee numeric,
  iptu numeric,
  floor text,
  pets_allowed boolean not null default false,
  available_from date,
  contact_name text,
  contact_phone text,
  description text,
  status text not null default 'available' check (status in ('available', 'rented')),
  cover_photo_id uuid,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  path text not null, -- caminho do arquivo no bucket 'property-photos'
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.properties
  add constraint properties_cover_photo_fk
  foreign key (cover_photo_id) references public.property_photos (id) on delete set null;

create index if not exists property_photos_property_id_idx on public.property_photos (property_id, position);
create index if not exists properties_title_idx on public.properties using gin (to_tsvector('portuguese', title));

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Criação automática de profile ao registrar um usuário no Supabase Auth.
-- O role/name podem ser passados em user_metadata na criação do usuário
-- (ex: pelo Dashboard do Supabase > Authentication > Add user > User Metadata):
--   { "role": "admin", "name": "Fulano" }
-- Sem metadata, o usuário entra como 'broker' por padrão.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'broker')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper: is_admin()
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_photos enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists properties_select on public.properties;
create policy properties_select on public.properties
  for select using (auth.uid() is not null);

drop policy if exists properties_write_admin on public.properties;
create policy properties_write_admin on public.properties
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists property_photos_select on public.property_photos;
create policy property_photos_select on public.property_photos
  for select using (auth.uid() is not null);

drop policy if exists property_photos_write_admin on public.property_photos;
create policy property_photos_write_admin on public.property_photos
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: bucket privado para fotos dos imóveis
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', false)
on conflict (id) do nothing;

drop policy if exists property_photos_storage_select on storage.objects;
create policy property_photos_storage_select on storage.objects
  for select using (bucket_id = 'property-photos' and auth.uid() is not null);

drop policy if exists property_photos_storage_insert on storage.objects;
create policy property_photos_storage_insert on storage.objects
  for insert with check (bucket_id = 'property-photos' and public.is_admin());

drop policy if exists property_photos_storage_update on storage.objects;
create policy property_photos_storage_update on storage.objects
  for update using (bucket_id = 'property-photos' and public.is_admin());

drop policy if exists property_photos_storage_delete on storage.objects;
create policy property_photos_storage_delete on storage.objects
  for delete using (bucket_id = 'property-photos' and public.is_admin());
