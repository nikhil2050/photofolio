-- Phase 1: secure studio identity and private image-storage foundations.
-- Apply with `supabase db push` after linking the intended Supabase project.

create table if not exists public.photographer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_path text,
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 32),
  booking_url text,
  booking_cta_label text not null default 'Book a shoot' check (char_length(booking_cta_label) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- These tables are intentionally infrastructure only in Phase 1. There is no gallery UI.
create table if not exists public.galleries (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.photographer_profiles(user_id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  client_name text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  original_path text not null unique,
  preview_path text not null unique,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.photographer_profiles(user_id) on delete cascade,
  gallery_id uuid references public.galleries(id) on delete set null,
  name text not null,
  email text,
  phone text,
  event_type text,
  event_date date,
  location text,
  budget_range text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.photographer_profiles enable row level security;
alter table public.galleries enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.inquiries enable row level security;

create policy "Photographers manage their own profile"
  on public.photographer_profiles for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Photographers manage their own galleries"
  on public.galleries for all to authenticated
  using ((select auth.uid()) = photographer_id)
  with check ((select auth.uid()) = photographer_id);

create policy "Photographers manage photos in their own galleries"
  on public.gallery_photos for all to authenticated
  using (exists (select 1 from public.galleries where galleries.id = gallery_photos.gallery_id and galleries.photographer_id = (select auth.uid())))
  with check (exists (select 1 from public.galleries where galleries.id = gallery_photos.gallery_id and galleries.photographer_id = (select auth.uid())));

create policy "Photographers read their own inquiries"
  on public.inquiries for select to authenticated
  using ((select auth.uid()) = photographer_id);

-- Buckets remain private. Future galleries must use short-lived signed URLs after authorization.
insert into storage.buckets (id, name, public)
values ('original-photos', 'original-photos', false), ('preview-images', 'preview-images', false)
on conflict (id) do update set public = false;

create policy "Photographers manage original files in their own folder"
  on storage.objects for all to authenticated
  using (bucket_id = 'original-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'original-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Photographers manage preview files in their own folder"
  on storage.objects for all to authenticated
  using (bucket_id = 'preview-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'preview-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
