-- Phase 1: private photo-delivery storage boundaries.
--
-- Retain the existing bucket IDs to avoid moving any uploaded profile assets:
--   original-photos  -> future full-resolution originals
--   preview-images   -> future controlled previews and current profile images
-- Neither bucket is public. Client-gallery access is intentionally not granted.

insert into storage.buckets (id, name, public)
values ('original-photos', 'original-photos', false)
on conflict (id) do update set public = false;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'preview-images',
  'preview-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Photographers manage original files in their own folder"
  on storage.objects;
drop policy if exists "Photographers manage preview files in their own folder"
  on storage.objects;

-- Original object keys must be:
-- {user_id}/{gallery_id}/{photo_id}/original.{extension}
-- The gallery ownership check makes modifying an object path insufficient to
-- access another photographer's files.
create policy "Photographers manage originals in their own galleries"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'original-photos'
    and array_length(storage.foldername(name), 1) = 3
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[3] ~ '^[0-9a-f-]{36}$'
    and storage.filename(name) ~ '^original[.][a-z0-9]{1,10}$'
    and exists (
      select 1
      from public.galleries
      join public.photographer_profiles
        on photographer_profiles.id = galleries.photographer_profile_id
      where galleries.id::text = (storage.foldername(name))[2]
        and photographer_profiles.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'original-photos'
    and array_length(storage.foldername(name), 1) = 3
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[3] ~ '^[0-9a-f-]{36}$'
    and storage.filename(name) ~ '^original[.][a-z0-9]{1,10}$'
    and exists (
      select 1
      from public.galleries
      join public.photographer_profiles
        on photographer_profiles.id = galleries.photographer_profile_id
      where galleries.id::text = (storage.foldername(name))[2]
        and photographer_profiles.user_id = (select auth.uid())
    )
  );

-- Preview object keys must be one of:
-- {user_id}/{gallery_id}/{photo_id}/preview.webp
-- {user_id}/profile/avatar-{asset_id}.{jpg|jpeg|png|webp}
-- Profile images retain their existing path shape; gallery previews are limited
-- to the controlled WebP rendition so an original cannot be used as a fallback.
create policy "Photographers manage controlled previews and profile images"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'preview-images'
    and (
      (
        array_length(storage.foldername(name), 1) = 3
        and (storage.foldername(name))[1] = (select auth.uid())::text
        and (storage.foldername(name))[3] ~ '^[0-9a-f-]{36}$'
        and storage.filename(name) = 'preview.webp'
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
        and storage.filename(name) = 'preview.webp'
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

-- Rollback notes:
-- Drop the two policies created above, then restore the two prior owner-folder
-- policies from 202611180001_phase_1_foundation.sql. Do not make either bucket
-- public as a rollback shortcut.
