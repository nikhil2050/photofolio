-- The project intentionally disables automatic Data API exposure.
-- Grant only the operations used by the authenticated application role;
-- RLS policies remain the row-level boundary.

grant usage on schema public to authenticated;

grant select, insert, update on table public.photographer_profiles to authenticated;
grant select, insert, update, delete on table public.galleries to authenticated;
grant select, insert, update, delete on table public.gallery_photos to authenticated;
grant select on table public.inquiries to authenticated;
