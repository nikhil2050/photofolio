# Photofolio database model

**Status:** IN_PROGRESS — migrations `202611180001` through `202611180004`
are applied to the linked project. `202611180005_phase_2_gallery_delivery_foundation.sql`
is locally validated and awaits explicit production deployment confirmation.

## Identity and ownership

`auth.users` owns authentication identities. `public.users` is a one-to-one, non-secret application record keyed by the same UUID. The `public.sync_auth_user` trigger creates or updates it from `auth.users`; no application code creates account rows lazily.

Every photographer-owned record is reached from `photographer_profiles.user_id`:

```text
auth.users / public.users
  └─ photographer_profiles
       ├─ galleries
       │   └─ photos
       │        └─ favourites
       └─ inquiries
```

`galleries.cover_photo_id` references a photo and is nullable, avoiding an insert-order cycle: create the gallery first, add photos, then set its cover photo. Future gallery code must verify that the selected photo belongs to that gallery before updating the cover.

The Phase 2 migration replaces the single-column cover-photo foreign key with
the composite `(galleries.id, galleries.cover_photo_id)` to
`(photos.gallery_id, photos.id)`. This makes the same-gallery rule a database
invariant rather than trusting an editor form or server action alone.

## Phase 2 gallery-delivery fields

Migration `202611180005` adds only fields required for the later delivery
workflow; it does not make any gallery or object public.

- `galleries` receives `access_mode`, a SHA-256 `share_token_hash`, token
  version, optional password hash, optional location, and publication/archive
  timestamps. A published gallery must have a token hash and timestamp; an
  archived gallery must have its token removed. These new-state checks are
  `NOT VALID` until any legacy rows are reviewed, so old Phase 1 test rows are
  not silently rewritten.
- `photos` receives thumbnail, caption/alt-text, and processing-state/error
  fields. Preview and thumbnail paths are nullable until processing is ready;
  the database prevents a row from being marked `ready` without both paths.
- `favourites` receives `gallery_id` plus a composite foreign key to the
  matching photo/gallery pair. The existing visitor-token hash remains the
  only stored anonymous identifier.
- `inquiries` retains `new`, `contacted`, and `closed` for compatibility and
  additionally permits `read` and `archived` for the future inbox.

The migration adds owner-list, ordering, token-lookup, favourite, and inquiry
indexes. It persists hashes and private paths only: no raw share token,
password, image binary, or signed URL is stored in Postgres.

## Favourites and future client identity

Clients do not need platform accounts. A future gallery-access flow must generate an opaque random visitor token, retain the raw value only in a Secure, HttpOnly, SameSite cookie, and persist only its SHA-256 hash in `favourites.visitor_token_hash`. The unique `(photo_id, visitor_token_hash)` constraint prevents duplicate favourites. The Phase 2 composite foreign key additionally prevents a favourite from claiming a gallery that does not own its photo.

There is deliberately no client or anonymous policy yet. Future client-facing writes require a dedicated server endpoint with gallery-access validation, rate limits, and abuse protection.

## RLS model

All six application tables have RLS enabled. The authenticated role receives only explicit table grants because automatic Data API exposure is disabled. Each private policy derives ownership from `auth.uid()` through the profile/galleries relationship. `anon` receives no application-table grants or policies. The Phase 2 migration intentionally adds no anonymous policy: future public requests must be authorised by trusted server code before it reads private rows or creates short-lived preview URLs.

## Applying and generating types

Apply migrations after reviewing them. The linked project is production, so use
an explicit command only after a backup and review:

```bash
npx supabase db push --remote --yes
```

After the schema is applied, generate and commit Supabase types:

```bash
npx supabase gen types typescript --remote --schema public > src/types/database.ts
```

Do not hand-edit the generated file. Regenerate it whenever the schema changes
and wire it into Supabase clients in the same schema task.

## RLS verification checks

Run these checks in a non-production Supabase environment after creating two test users, profiles, and a gallery for photographer A. Substitute real UUIDs; never use service-role credentials in the browser.

```sql
-- As photographer B, no rows belonging to A should be visible.
set local role authenticated;
select set_config('request.jwt.claim.sub', '<photographer-b-auth-user-id>', true);

select * from public.photographer_profiles
where user_id = '<photographer-a-auth-user-id>'; -- expect 0 rows

select * from public.galleries
where id = '<photographer-a-gallery-id>'; -- expect 0 rows

update public.galleries
set title = 'Should fail or affect zero rows'
where id = '<photographer-a-gallery-id>'; -- expect 0 rows updated
```

For a complete proof, repeat the `select` and attempted `update` for `photos`, `favourites`, and `inquiries`. RLS is a row-level boundary; service-role clients bypass it and are only permitted in trusted server environments.

## Phase 2 integrity checks

Run these checks only in a non-production test project after applying
`202611180005`. They verify database invariants independently of UI code.

```sql
-- A cover photo from a different gallery must be rejected by the composite FK.
update public.galleries
set cover_photo_id = '<photo-owned-by-a-different-gallery-id>'
where id = '<gallery-id>';
-- expect: foreign-key violation

-- A favourite cannot claim a gallery that does not own the chosen photo.
insert into public.favourites (photo_id, gallery_id, visitor_token_hash)
values (
  '<photo-id-from-gallery-a>',
  '<gallery-b-id>',
  repeat('a', 64)
);
-- expect: foreign-key violation

-- A ready photo requires both controlled derivative paths.
update public.photos
set processing_status = 'ready',
    thumbnail_storage_path = null
where id = '<photo-id>';
-- expect: check-constraint violation
```

## Rollback

Do not reverse the expansion migration on a populated production database. Restore from a tested backup or write a forward, data-preserving migration.
