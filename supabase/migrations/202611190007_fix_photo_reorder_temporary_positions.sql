-- Repair the initial Phase 2 reorder function for projects where migration
-- 202611180006 was already applied. sort_order has a non-negative check, so
-- temporary negative positions are invalid even inside a transaction.

create or replace function public.reorder_gallery_photos(
  p_gallery_id uuid,
  p_photo_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  owned_photo_count integer;
  temporary_base integer;
begin
  if p_photo_ids is null or cardinality(p_photo_ids) = 0 then
    raise exception 'A gallery needs at least one photo to reorder.';
  end if;

  if cardinality(p_photo_ids) <> cardinality(array(select distinct unnest(p_photo_ids))) then
    raise exception 'A photograph was included more than once.';
  end if;

  -- Lock all visible rows. SECURITY INVOKER keeps the caller's RLS policy in
  -- effect, so this cannot be used to reorder another photographer's gallery.
  perform 1 from public.photos where gallery_id = p_gallery_id for update;

  select count(*) into owned_photo_count
  from public.photos
  where gallery_id = p_gallery_id;

  if owned_photo_count <> cardinality(p_photo_ids)
    or exists (
      select 1
      from unnest(p_photo_ids) as requested_photo(id)
      left join public.photos as photo
        on photo.id = requested_photo.id and photo.gallery_id = p_gallery_id
      where photo.id is null
    ) then
    raise exception 'The submitted photo order does not match this gallery.';
  end if;

  select coalesce(max(sort_order), 0) into temporary_base
  from public.photos
  where gallery_id = p_gallery_id;

  if temporary_base > 2147483147 - cardinality(p_photo_ids) then
    raise exception 'This gallery has no safe photo-order space remaining.';
  end if;

  update public.photos as photo
  set sort_order = temporary_base + ordered.position::integer
  from unnest(p_photo_ids) with ordinality as ordered(id, position)
  where photo.id = ordered.id and photo.gallery_id = p_gallery_id;

  update public.photos as photo
  set sort_order = ordered.position::integer * 1024
  from unnest(p_photo_ids) with ordinality as ordered(id, position)
  where photo.id = ordered.id and photo.gallery_id = p_gallery_id;
end;
$$;
