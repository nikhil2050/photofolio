# Photofolio database model

**Status:** IN_PROGRESS — implemented in migrations; apply the latest migration to the linked Supabase project before deploying the updated profile code.

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

## Favourites and future client identity

Clients do not need platform accounts. A future gallery-access flow must generate an opaque random visitor token, retain the raw value only in a secure client context, and persist only its SHA-256 hash in `favourites.visitor_token_hash`. The unique `(photo_id, visitor_token_hash)` constraint prevents duplicate favourites.

There is deliberately no client or anonymous policy yet. Future client-facing writes require a dedicated server endpoint with gallery-access validation, rate limits, and abuse protection.

## RLS model

All six application tables have RLS enabled. The authenticated role receives only explicit table grants because automatic Data API exposure is disabled. Each private policy derives ownership from `auth.uid()` through the profile/galleries relationship. `anon` receives no application-table grants or policies.

## Applying and generating types

Apply migrations after reviewing them:

```bash
npx supabase db push --remote
```

After the schema is applied, generate Supabase types:

```bash
npx supabase gen types typescript --remote > src/types/database.ts
```

Do not hand-edit the generated file. Regenerate it whenever the schema changes and then wire it into Supabase clients in a dedicated type-safety change.

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

## Rollback

Do not reverse the expansion migration on a populated production database. Restore from a tested backup or write a forward, data-preserving migration.
