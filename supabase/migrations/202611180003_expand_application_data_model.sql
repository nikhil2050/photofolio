-- Phase 1 application data model expansion.
-- This migration is forward-only and evolves the initial foundation migration.
-- It intentionally does not create public/anonymous client access.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.mark_profile_setup_complete()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.display_name is not null and new.setup_completed_at is null then
    new.setup_completed_at = now();
  end if;
  return new;
end;
$$;

-- Application account rows hold non-secret app metadata only. auth.users remains
-- the source of truth for credentials and identity lifecycle.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.users (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email;

create or replace function public.sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_or_updated on auth.users;
create trigger on_auth_user_created_or_updated
  after insert or update of email on auth.users
  for each row execute procedure public.sync_auth_user();

-- Photographer profiles: move to a stable UUID primary key while retaining one
-- profile per application user. Optional fields remain optional during onboarding.
drop policy if exists "Photographers manage their own profile" on public.photographer_profiles;
alter table public.galleries drop constraint galleries_photographer_id_fkey;
alter table public.inquiries drop constraint inquiries_photographer_id_fkey;

alter table public.photographer_profiles
  add column id uuid default gen_random_uuid();

update public.photographer_profiles
set id = gen_random_uuid()
where id is null;

alter table public.photographer_profiles
  alter column id set not null,
  alter column display_name drop not null,
  drop constraint photographer_profiles_pkey,
  add constraint photographer_profiles_pkey primary key (id),
  add constraint photographer_profiles_user_id_key unique (user_id),
  drop constraint photographer_profiles_user_id_fkey,
  add constraint photographer_profiles_user_id_fkey
    foreign key (user_id) references public.users(id) on delete cascade;

alter table public.photographer_profiles
  rename column contact_phone to whatsapp_number;
alter table public.photographer_profiles
  rename column booking_url to booking_cta_url;
alter table public.photographer_profiles
  add column slug text,
  add column bio text,
  add column logo_path text,
  add column setup_completed_at timestamptz;

alter table public.photographer_profiles
  add constraint photographer_profiles_slug_format_check
    check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint photographer_profiles_whatsapp_number_check
    check (whatsapp_number is null or whatsapp_number ~ '^\\+[1-9][0-9]{6,14}$'),
  add constraint photographer_profiles_booking_cta_url_check
    check (booking_cta_url is null or booking_cta_url ~* '^https?://');

create unique index photographer_profiles_slug_key
  on public.photographer_profiles (slug)
  where slug is not null;

-- Galleries now reference a stable profile identifier and receive the fields that
-- future delivery functionality needs. Unlisted is discoverability, not access.
drop policy if exists "Photographers manage their own galleries" on public.galleries;
drop policy if exists "Photographers manage photos in their own galleries" on public.gallery_photos;

alter table public.galleries
  add column photographer_profile_id uuid,
  add column slug text default gen_random_uuid()::text,
  add column description text,
  add column visibility text not null default 'private',
  add column event_date date,
  add column cover_photo_id uuid;

update public.galleries as gallery
set photographer_profile_id = profile.id
from public.photographer_profiles as profile
where profile.user_id = gallery.photographer_id;

alter table public.galleries
  alter column photographer_profile_id set not null,
  alter column slug set not null,
  drop column photographer_id,
  add constraint galleries_photographer_profile_id_fkey
    foreign key (photographer_profile_id)
    references public.photographer_profiles(id) on delete cascade,
  add constraint galleries_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint galleries_visibility_check
    check (visibility in ('private', 'unlisted', 'public'));

create unique index galleries_profile_slug_key
  on public.galleries (photographer_profile_id, slug);
create index galleries_photographer_profile_id_idx
  on public.galleries (photographer_profile_id);
create index galleries_status_idx on public.galleries (status);

-- Rename the original foundation table to the domain name used by the app and
-- retain its private object-path design. Postgres never stores image binaries.
alter table public.gallery_photos rename to photos;
alter table public.photos
  rename column original_path to original_storage_path;
alter table public.photos
  rename column preview_path to preview_storage_path;
alter table public.photos
  add column file_name text,
  add column mime_type text,
  add column file_size_bytes bigint,
  add column width integer,
  add column height integer,
  add column updated_at timestamptz not null default now();

update public.photos
set file_name = regexp_replace(original_storage_path, '^.*/', ''),
    mime_type = 'application/octet-stream',
    file_size_bytes = 0
where file_name is null;

alter table public.photos
  alter column file_name set not null,
  alter column mime_type set not null,
  alter column file_size_bytes set not null,
  add constraint photos_file_size_bytes_check check (file_size_bytes >= 0),
  add constraint photos_width_check check (width is null or width > 0),
  add constraint photos_height_check check (height is null or height > 0),
  add constraint photos_gallery_sort_order_key unique (gallery_id, sort_order);

create index photos_gallery_id_idx on public.photos (gallery_id);

alter table public.galleries
  add constraint galleries_cover_photo_id_fkey
    foreign key (cover_photo_id) references public.photos(id) on delete set null;

-- A client is not assumed to have a platform account. Future gallery-access code
-- creates a random bearer token, stores it only in the visitor's secure context,
-- and persists a SHA-256 hash in visitor_token_hash. No raw token is stored.
create table public.favourites (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  visitor_token_hash text not null check (visitor_token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  unique (photo_id, visitor_token_hash)
);

create index favourites_photo_id_idx on public.favourites (photo_id);
create index favourites_visitor_token_hash_idx on public.favourites (visitor_token_hash);

-- Inquiries are private workflow data. There is intentionally no anonymous insert
-- policy: a later public endpoint must add validation, abuse controls, and limits.
drop policy if exists "Photographers read their own inquiries" on public.inquiries;

alter table public.inquiries
  add column photographer_profile_id uuid,
  add column status text not null default 'new',
  add column source text,
  add column updated_at timestamptz not null default now();

update public.inquiries as inquiry
set photographer_profile_id = profile.id
from public.photographer_profiles as profile
where profile.user_id = inquiry.photographer_id;

alter table public.inquiries
  alter column photographer_profile_id set not null,
  drop column photographer_id,
  add constraint inquiries_photographer_profile_id_fkey
    foreign key (photographer_profile_id)
    references public.photographer_profiles(id) on delete cascade,
  add constraint inquiries_status_check
    check (status in ('new', 'contacted', 'closed')),
  add constraint inquiries_contact_check
    check (email is not null or phone is not null);

create index inquiries_photographer_profile_id_idx
  on public.inquiries (photographer_profile_id);
create index inquiries_gallery_id_idx on public.inquiries (gallery_id)
  where gallery_id is not null;
create index inquiries_status_idx on public.inquiries (status);

alter table public.users enable row level security;
alter table public.photographer_profiles enable row level security;
alter table public.galleries enable row level security;
alter table public.photos enable row level security;
alter table public.favourites enable row level security;
alter table public.inquiries enable row level security;

create policy "Users read their own account"
  on public.users for select to authenticated
  using ((select auth.uid()) = id);

create policy "Photographers manage their own profile"
  on public.photographer_profiles for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Photographers manage their own galleries"
  on public.galleries for all to authenticated
  using (exists (
    select 1 from public.photographer_profiles
    where photographer_profiles.id = galleries.photographer_profile_id
      and photographer_profiles.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.photographer_profiles
    where photographer_profiles.id = galleries.photographer_profile_id
      and photographer_profiles.user_id = (select auth.uid())
  ));

create policy "Photographers manage photos in their own galleries"
  on public.photos for all to authenticated
  using (exists (
    select 1 from public.galleries
    join public.photographer_profiles on photographer_profiles.id = galleries.photographer_profile_id
    where galleries.id = photos.gallery_id
      and photographer_profiles.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.galleries
    join public.photographer_profiles on photographer_profiles.id = galleries.photographer_profile_id
    where galleries.id = photos.gallery_id
      and photographer_profiles.user_id = (select auth.uid())
  ));

create policy "Photographers read favourites from their own galleries"
  on public.favourites for select to authenticated
  using (exists (
    select 1 from public.photos
    join public.galleries on galleries.id = photos.gallery_id
    join public.photographer_profiles on photographer_profiles.id = galleries.photographer_profile_id
    where photos.id = favourites.photo_id
      and photographer_profiles.user_id = (select auth.uid())
  ));

create policy "Photographers manage their own inquiries"
  on public.inquiries for all to authenticated
  using (exists (
    select 1 from public.photographer_profiles
    where photographer_profiles.id = inquiries.photographer_profile_id
      and photographer_profiles.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.photographer_profiles
    where photographer_profiles.id = inquiries.photographer_profile_id
      and photographer_profiles.user_id = (select auth.uid())
  ));

-- The project disables automatic API exposure, so grants are explicit. RLS stays
-- authoritative for rows; anon has no table privileges or policies.
revoke all on table public.users, public.photographer_profiles, public.galleries,
  public.photos, public.favourites, public.inquiries from anon;
revoke all on table public.users, public.photographer_profiles, public.galleries,
  public.photos, public.favourites, public.inquiries from authenticated;

grant select on table public.users to authenticated;
grant select, insert, update on table public.photographer_profiles to authenticated;
grant select, insert, update, delete on table public.galleries to authenticated;
grant select, insert, update, delete on table public.photos to authenticated;
grant select on table public.favourites to authenticated;
grant select, insert, update, delete on table public.inquiries to authenticated;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();
drop trigger if exists set_photographer_profiles_updated_at on public.photographer_profiles;
create trigger set_photographer_profiles_updated_at before update on public.photographer_profiles
  for each row execute procedure public.set_updated_at();
drop trigger if exists mark_photographer_profile_setup_complete on public.photographer_profiles;
create trigger mark_photographer_profile_setup_complete
  before insert or update on public.photographer_profiles
  for each row execute procedure public.mark_profile_setup_complete();
drop trigger if exists set_galleries_updated_at on public.galleries;
create trigger set_galleries_updated_at before update on public.galleries
  for each row execute procedure public.set_updated_at();
drop trigger if exists set_photos_updated_at on public.photos;
create trigger set_photos_updated_at before update on public.photos
  for each row execute procedure public.set_updated_at();
drop trigger if exists set_inquiries_updated_at on public.inquiries;
create trigger set_inquiries_updated_at before update on public.inquiries
  for each row execute procedure public.set_updated_at();

-- Rollback note: do not reverse this migration on a populated production database
-- without a tested data migration. Restore from a backup or write a dedicated,
-- data-preserving forward migration instead.
