# Private storage design and verification

## Status: IN_PROGRESS — configuration verified; multi-account checks remain

Migration `202611180004_secure_private_photo_storage.sql` was applied to the
linked Supabase project on 18 November 2026. A read-only remote query verified
that both buckets are private, `preview-images` has the 5 MB/image-only
controls, and only the two policies defined by this migration apply to these
owner-managed objects. The two-account RLS checks below still need deliberate
test fixtures; signed-URL expiry remains a future delivery-control check.

## Bucket design

Photofolio retains its existing bucket IDs rather than renaming them to the
suggested examples. Renaming would require moving profile assets that already
use `preview-images`.

| Bucket            | Visibility | Purpose                                                | Guardrails                                                                         |
| ----------------- | ---------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `original-photos` | Private    | Future full-resolution source files                    | Gallery-and-owner scoped RLS; no public URL path or client policy.                 |
| `preview-images`  | Private    | Future controlled previews and existing profile images | Gallery-and-owner/profile scoped RLS; 5 MB bucket limit; JPEG, PNG, and WebP only. |

`preview-images` remains shared temporarily because profile images already use
`{user_id}/profile/avatar-{asset_id}.{extension}`. Gallery delivery will use
`{user_id}/{gallery_id}/{photo_id}/preview.webp`. A dedicated `profile-assets`
bucket can be introduced later only with a deliberate migration of existing
objects and database paths.

## Key conventions

Only trusted future server-side gallery code may create photo keys:

```text
{user_id}/{gallery_id}/{photo_id}/original.{extension}
{user_id}/{gallery_id}/{photo_id}/preview.webp
{user_id}/profile/avatar-{asset_id}.{jpg|jpeg|png|webp}
```

The storage policies require the first path segment to equal `auth.uid()` and,
for gallery objects, verify that the second segment is an owned gallery. The
policy also enforces the expected directory depth and preview filename. An
unguessable path is never treated as authorization.

## Preview processing plan: PLANNED

No gallery upload, image resize, watermark, signed-preview endpoint, or client
gallery access is implemented in Phase 1. When delivery is built:

1. Create the photo ID and object keys on a trusted server operation.
2. Keep the uploaded original in `original-photos` only.
3. Produce a separate WebP preview, initially capped at 2560px on the longest
   edge with quality 82; assess watermark requirements per gallery before
   delivery.
4. Persist only the private paths in `photos`; never fall back to an original
   when a preview is missing.
5. Authorise the recipient, then create a short-lived preview signed URL from
   trusted server code. The initial intended expiry is 60 seconds; it must be
   rechecked against the final viewing experience before release.

No service-role credential is required or permitted in browser code. A signed
URL is a temporary delivery mechanism, not the authorisation decision.

## Apply and verify

From the linked project directory:

```bash
npx supabase db push
```

In the Supabase Dashboard, confirm both bucket rows are private. Confirm
`preview-images` shows the 5 MB size limit and its three allowed MIME types.

The linked production project was queried after migration application and
returned those expected bucket settings plus these authenticated policies:

- `Photographers manage originals in their own galleries`
- `Photographers manage controlled previews and profile images`

### RLS checks

Use two existing test accounts and one owned gallery per account. Insert the
test objects using a trusted admin-only setup step; do not put service-role
credentials in a browser. Then, in the SQL editor, run each query inside a
transaction after replacing the placeholders. Each foreign object query must
return zero rows.

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '<photographer-a-auth-user-id>', true);

-- Photographer A must not see Photographer B's original or preview.
select name from storage.objects
where bucket_id = 'original-photos'
  and name = '<photographer-b-id>/<b-gallery-id>/<photo-id>/original.jpg';

select name from storage.objects
where bucket_id = 'preview-images'
  and name = '<photographer-b-id>/<b-gallery-id>/<photo-id>/preview.webp';

-- A modified gallery ID must not reveal another owner's object.
select name from storage.objects
where bucket_id = 'preview-images'
  and name = '<photographer-a-id>/<b-gallery-id>/<photo-id>/preview.webp';

rollback;
```

For anonymous access, run the equivalent select as `anon`; it must return zero
rows:

```sql
begin;
set local role anon;
select name from storage.objects
where bucket_id in ('original-photos', 'preview-images');
rollback;
```

### Signed URL expiry check: PLANNED DELIVERY CONTROL

There is intentionally no signed-URL endpoint yet because client-gallery
authorisation is out of scope. When that endpoint is introduced, issue a
preview URL with `createSignedUrl(path, 60)` from the authorised server path,
request it immediately (expect success), then request the same URL after 61
seconds (expect a non-success response). Do not log the URL, token, or private
path while running this check.

## Official references

- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage serving guidance](https://supabase.com/docs/guides/storage/serving/downloads)
- [Supabase standard upload guidance](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
