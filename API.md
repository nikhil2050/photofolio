# Photofolio API

## Status

No public gallery-delivery API routes are implemented. Auth and profile
mutations are handled by authenticated Next.js Server Actions and are not a
public data API contract. Phase 2's database/access-control foundation is
implemented locally in migration `202611180005` but awaits explicit deployment
to the linked production project; it does not introduce an endpoint or public
client access.

## Private gallery upload routes

These authenticated owner routes require migration `202611180005` to be
applied. They never make a storage bucket or gallery record public.

- `POST /api/galleries/:galleryId/photos/upload-intent`: validates untrusted metadata, creates a pending photo record, then returns a short-lived signed URL for one private original upload.
- `POST /api/galleries/:galleryId/photos/:photoId/complete`: revalidates the uploaded bytes and decodability, auto-orients and strips metadata while creating private WebP preview and thumbnail files. It returns a protected preview route only after `ready`; it never returns an original URL.
- `POST /api/galleries/:galleryId/photos/:photoId/retry`: repeats safe server-side derivative creation from a retained valid original without re-uploading.
- `GET /api/galleries/:galleryId/photos/:photoId/preview`: checks ownership, then redirects to a 60-second signed thumbnail URL. It never serves originals.
- `DELETE /api/galleries/:galleryId/photos/:photoId`: idempotently removes a queued/failed item and its private objects.

## Profile asset route

- `POST /api/profile/avatar`: authenticated multipart upload for an optional photographer avatar or logo. The request must provide an `image` file that is PNG, JPEG, or WebP and no larger than 2 MB. The server validates the declared MIME type, file size, and matching image signature before writing a server-generated, owner-scoped path to the private `preview-images` bucket. It returns `{ "path": "..." }` on success, or a safe `{ "error": "...", "requestId": "..." }` response with an `x-request-id` header: `400` for invalid input, `401` when unauthenticated, or `500` for a storage failure.

## Authentication callback routes

- `GET /auth/callback`: primary Supabase email-confirmation return route. It exchanges a PKCE code or verifies a confirmation token hash, writes the cookie-backed session, and redirects to `/profile`. Invalid or expired links redirect to `/sign-in` with a non-technical message.
- `GET /auth/confirm`: compatible alias for existing Supabase email templates; it has the same behaviour as `/auth/callback`.

These routes accept only the Supabase-generated confirmation parameters and do not return token or session data in their response body.

## Server Actions

- `signUp`: validates email, password, and matching password confirmation with Zod and creates a Supabase Auth account.
- `signIn`: validates email/password with Zod and creates a cookie-backed Supabase session. An internal return path is constrained to a local application route.
- `signOut`: revokes the current Supabase session.
- `saveProfile`: validates and upserts the signed-in photographer's profile under RLS. It uses only the authenticated identity for ownership, accepts only server-generated avatar paths, marks setup complete through the database trigger once a valid display name persists, cleans up a replaced avatar when possible, and redirects to `/dashboard` after saving.
- `createGallery`: validates the short draft-gallery form, resolves the
  photographer profile from the authenticated identity rather than a submitted
  owner ID, creates an RLS-scoped private draft, revalidates the library, and
  redirects to the new gallery's owner-scoped confirmation route. It requires
  the pending `202611180005` migration because it persists the optional
  location field.

All actions use the authenticated server client. No service-role credentials are used. `proxy.ts` refreshes sessions and provides early redirects, while protected server routes independently verify JWT claims before returning data.
