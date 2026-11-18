-- Phase 2: gallery-delivery data and access-control foundation.
--
-- This migration is deliberately additive. It does not create anonymous table
-- or storage access: public gallery delivery must later pass through a trusted
-- server-side access layer that verifies the share secret before it reads data.

-- Phase 2 uses a bearer share secret rather than a predictable gallery ID or
-- slug. Only the SHA-256 hash is persisted, so a database export cannot be
-- used to reconstruct a working gallery link.
alter table public.galleries
  add column if not exists access_mode text not null default 'link',
  add column if not exists share_token_hash text,
  add column if not exists share_token_version integer not null default 1,
  add column if not exists password_hash text,
  add column if not exists location text,
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

alter table public.galleries
  add constraint galleries_access_mode_check
    check (access_mode in ('link', 'password')),
  add constraint galleries_share_token_hash_format_check
    check (share_token_hash is null or share_token_hash ~ '^[a-f0-9]{64}$'),
  add constraint galleries_share_token_version_check
    check (share_token_version > 0),
  add constraint galleries_password_hash_length_check
    check (password_hash is null or char_length(password_hash) <= 512),
  add constraint galleries_location_length_check
    check (location is null or char_length(location) <= 160),
  add constraint galleries_password_access_check
    check (
      (access_mode = 'password' and password_hash is not null)
      or (access_mode = 'link' and password_hash is null)
    );

-- NOT VALID preserves any legacy Phase 1 rows while ensuring new or changed
-- rows cannot be published without a secret or archived with a live secret.
-- A later data-cleanup migration can validate these constraints once any old
-- test rows have been reviewed.
alter table public.galleries
  add constraint galleries_published_access_check
    check (
      status <> 'published'
      or (
        share_token_hash is not null
        and published_at is not null
        and archived_at is null
      )
    ) not valid,
  add constraint galleries_archived_access_check
    check (
      status <> 'archived'
      or (archived_at is not null and share_token_hash is null)
    ) not valid;

create unique index galleries_share_token_hash_key
  on public.galleries (share_token_hash)
  where share_token_hash is not null;
create index galleries_profile_status_updated_at_idx
  on public.galleries (photographer_profile_id, status, updated_at desc);

-- A processing record exists before its preview and thumbnail are ready. The
-- paths are nullable during processing so the application never needs to store
-- a fake path or serve the private original as a fallback.
alter table public.photos
  alter column preview_storage_path drop not null,
  add column if not exists thumbnail_storage_path text,
  add column if not exists alt_text text,
  add column if not exists caption text,
  add column if not exists processing_status text not null default 'pending',
  add column if not exists processing_error_code text,
  add column if not exists processing_error_message text;

alter table public.photos
  add constraint photos_file_name_safe_check
    check (
      char_length(file_name) between 1 and 255
      and file_name !~ '[\\/[:cntrl:]]'
    ),
  add constraint photos_processing_status_check
    check (processing_status in ('pending', 'processing', 'ready', 'failed')),
  add constraint photos_alt_text_length_check
    check (alt_text is null or char_length(alt_text) <= 500),
  add constraint photos_caption_length_check
    check (caption is null or char_length(caption) <= 1000),
  add constraint photos_processing_error_code_length_check
    check (
      processing_error_code is null
      or processing_error_code ~ '^[a-z0-9_]{1,80}$'
    ),
  add constraint photos_processing_error_message_length_check
    check (
      processing_error_message is null
      or char_length(processing_error_message) <= 240
    ),
  add constraint photos_failed_error_check
    check (
      processing_status <> 'failed'
      or processing_error_code is not null
    ),
  add constraint photos_ready_preview_check
    check (
      processing_status <> 'ready'
      or (
        preview_storage_path is not null
        and thumbnail_storage_path is not null
      )
    );

-- The composite key lets dependent records prove that a photo belongs to the
-- gallery named alongside it. A single photo UUID alone cannot provide that
-- invariant.
alter table public.photos
  add constraint photos_gallery_id_id_key unique (gallery_id, id);

alter table public.galleries
  drop constraint if exists galleries_cover_photo_id_fkey,
  add constraint galleries_cover_photo_belongs_to_gallery_fkey
    foreign key (id, cover_photo_id)
    references public.photos (gallery_id, id)
    on delete set null (cover_photo_id);

create index photos_gallery_processing_sort_order_idx
  on public.photos (gallery_id, processing_status, sort_order);

-- Keep the anonymous visitor identifier as a hash and make the gallery scope
-- explicit. The composite foreign key rejects a favourite whose gallery does
-- not match its photo, even if a request bypasses application code.
alter table public.favourites
  add column if not exists gallery_id uuid;

update public.favourites as favourite
set gallery_id = photo.gallery_id
from public.photos as photo
where photo.id = favourite.photo_id
  and favourite.gallery_id is null;

alter table public.favourites
  alter column gallery_id set not null,
  add constraint favourites_gallery_photo_fkey
    foreign key (gallery_id, photo_id)
    references public.photos (gallery_id, id)
    on delete cascade;

create index favourites_gallery_created_at_idx
  on public.favourites (gallery_id, created_at desc);

-- Keep the Phase 1 inbox states valid while adding the states required by the
-- future client-gallery inbox. Existing rows are neither rewritten nor lost.
alter table public.inquiries
  drop constraint if exists inquiries_status_check,
  add constraint inquiries_status_check
    check (status in ('new', 'read', 'archived', 'contacted', 'closed'));

create index inquiries_profile_status_created_at_idx
  on public.inquiries (photographer_profile_id, status, created_at desc);

-- The original-photo bucket is intentionally limited to the supported image
-- formats and a free-MVP-safe size. Application code still validates file
-- signatures and metadata; bucket restrictions are a second boundary.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'original-photos',
  'original-photos',
  false,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Gallery previews now include a small controlled thumbnail. Retain the
-- profile-avatar exception without permitting arbitrary filenames or paths.
drop policy if exists "Photographers manage controlled previews and profile images"
  on storage.objects;

create policy "Photographers manage controlled previews and profile images"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'preview-images'
    and (
      (
        array_length(storage.foldername(name), 1) = 3
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and (storage.foldername(name))[3] ~ '^[0-9a-f-]{36}$'
        and storage.filename(name) in ('preview.webp', 'thumbnail.webp')
        and exists (
          select 1
          from public.galleries
          join public.photographer_profiles
            on photographer_profiles.id = galleries.photographer_profile_id
          where galleries.id::text = (storage.foldername(name))[2]
            and photographer_profiles.user_id = (select auth.uid())
        )
      )
      or (
        array_length(storage.foldername(name), 1) = 2
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and (storage.foldername(name))[2] = 'profile'
        and storage.filename(name) ~ '^avatar-[0-9a-f-]{36}[.](jpg|jpeg|png|webp)$'
      )
    )
  )
  with check (
    bucket_id = 'preview-images'
    and (
      (
        array_length(storage.foldername(name), 1) = 3
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and (storage.foldername(name))[3] ~ '^[0-9a-f-]{36}$'
        and storage.filename(name) in ('preview.webp', 'thumbnail.webp')
        and exists (
          select 1
          from public.galleries
          join public.photographer_profiles
            on photographer_profiles.id = galleries.photographer_profile_id
          where galleries.id::text = (storage.foldername(name))[2]
            and photographer_profiles.user_id = (select auth.uid())
        )
      )
      or (
        array_length(storage.foldername(name), 1) = 2
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and (storage.foldername(name))[2] = 'profile'
        and storage.filename(name) ~ '^avatar-[0-9a-f-]{36}[.](jpg|jpeg|png|webp)$'
      )
    )
  );

-- No anon grants or policies are added here. A future public-gallery server
-- route must authorise each request before it creates a short-lived preview
-- URL. The storage buckets remain private.

-- Rollback notes:
-- 1. Do not reverse this migration on populated production data.
-- 2. Use a forward migration to remove unused Phase 2 fields after a backup.
-- 3. If thumbnail support must be reverted, replace the preview policy with
--    the policy from 202611180004_secure_private_photo_storage.sql; do not
--    make a bucket public as a rollback shortcut.
