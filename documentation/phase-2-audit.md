# Phase 2 repository audit and implementation plan

**Status:** COMPLETED — audit only; no Phase 2 product feature has been
implemented.

**Audited:** 18 November 2026

## Current state

Photofolio is a single Next.js modular monolith. It uses Next.js 16.4.6,
React 19.3.0, TypeScript strict mode, Tailwind CSS 4.3.3, Zod 4.6.7,
`@supabase/ssr` 0.12.7, Supabase JS 2.119.0, and Vitest 5.1.1. No gallery UI,
photo upload flow, share-link flow, client gallery, favourites UI, inquiry UI,
image processor, job queue, Playwright suite, or generated database types exist
yet.

Phase 1 provides working foundations in source code:

- Cookie-backed Supabase email/password authentication and confirmation routes.
- Server-side protected studio routes using `getClaims()` rather than a
  browser-only session check.
- Photographer profile onboarding, owner-scoped private avatar upload, and a
  dashboard that reads a real gallery count.
- Private `original-photos` and `preview-images` buckets.
- Central visual tokens in `src/app/globals.css` and reusable UI primitives in
  `src/components/ui`.
- Safe logging, typed expected errors, Zod validation, and small Vitest suites.

The Phase 1 repository checks passed on 18 November 2026. Hosted two-account
auth, table-RLS, storage-RLS, and browser accessibility checks remain
**IN_PROGRESS**; see [phase-1-acceptance.md](phase-1-acceptance.md).

## Schema and access-control baseline

The Supabase CLI confirms that local and linked-production migrations
`202611180001` through `202611180004` are all applied. `supabase db lint
--remote` reported no schema errors. There is no committed `supabase/config.toml`;
the existing CLI link is local developer state and must not be treated as a
portable project configuration.

| Table                   | Existing relevant columns                                                                                                                          | Current access model                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `users`                 | `id`, `email`, timestamps                                                                                                                          | An authenticated account can select only itself. Auth owns credentials.                      |
| `photographer_profiles` | `id`, `user_id`, `display_name`, avatar/logo paths, WhatsApp and booking fields, `slug`, `bio`, setup/timestamps                                   | Photographer can manage its own profile.                                                     |
| `galleries`             | `id`, `photographer_profile_id`, `title`, `client_name`, `description`, `event_date`, `status`, `visibility`, `slug`, `cover_photo_id`, timestamps | Photographer can manage galleries reached from its own profile.                              |
| `photos`                | `id`, `gallery_id`, original/preview storage paths, filename, MIME type, byte size, dimensions, `sort_order`, timestamps                           | Photographer can manage a photo only through an owned gallery.                               |
| `favourites`            | `id`, `photo_id`, `visitor_token_hash`, timestamp                                                                                                  | Photographer may select favourites for owned galleries. There is no anonymous insert policy. |
| `inquiries`             | `id`, `photographer_profile_id`, optional `gallery_id`, name/contact/event fields, `status`, `source`, timestamps                                  | Photographer can manage inquiries addressed to its profile.                                  |

All application tables have RLS enabled. `anon` has no table grants or
policies. The authenticated role has explicit grants because automatic Data API
exposure is disabled. The current policies are appropriate for the private
photographer foundation, but deliberately do not implement client delivery.

Both storage buckets are private. Current policies allow an authenticated
photographer to manage only owner-and-gallery-scoped objects:

- `original-photos`: `{user_id}/{gallery_id}/{photo_id}/original.{extension}`
- `preview-images`: `{user_id}/{gallery_id}/{photo_id}/preview.webp`, plus the
  existing profile avatar namespace.

They do not permit anonymous listing, download, or upload. This is correct for
Phase 1 and must not be weakened to build client access.

## Existing application structure

| Concern        | Current implementation                                            | Phase 2 extension point                                                                         |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Routes         | App Router with `(auth)` and `(studio)` route groups              | Add studio gallery routes and a separate public gallery route group.                            |
| Mutations      | Server Actions in `src/app/actions`                               | Keep photographer mutations there or use route handlers where multipart/progress requires them. |
| Data access    | Focused repositories in `src/lib/profile` and `src/lib/dashboard` | Add `src/lib/galleries`, `src/lib/photos`, `src/lib/favourites`, and `src/lib/inquiries`.       |
| Validation     | Zod schemas in `src/lib/validation`                               | Add gallery, upload, access, favourite, and inquiry schemas.                                    |
| Supabase       | Cookie-aware browser/server clients in `src/lib/supabase`         | Keep privileged server-only client creation isolated from browser-safe clients.                 |
| UI             | Shared primitives, `DashboardShell`, profile components           | Reuse primitives; add gallery-specific components only for repeated patterns.                   |
| Errors/logging | `AppError` and allowlisted structured logs                        | Extend codes without logging paths, tokens, customer data, or provider errors.                  |
| Tests          | Vitest pure validation/redirect/config tests                      | Add service, route, ownership, RLS/storage, and browser tests incrementally.                    |

The visual system matches the shared Photofolio skill: central semantic tokens,
shared buttons/forms/cards, Lucide outline icons, visible focus rules, and
reduced-motion handling. Gallery-specific rules are already recorded in the
skill. Future UI should reuse this system rather than introduce a second theme.

## Runtime and deployment findings

The repository has no documented deployment target, serverless limits, image
processing dependency, queue, background worker, Supabase Edge Function, or
direct/resumable upload implementation. It also has no `sharp`, image
metadata, rate-limiting, or browser E2E dependency installed.

This is a material Phase 2 constraint: a Next.js request handler must not be
assumed to safely receive or transform arbitrary large multi-photo uploads.
Prompt 3 must choose and document an upload/processing design compatible with
the eventual host before implementation. The smallest MVP candidate is
direct-to-private-storage uploads authorised by a server endpoint, followed by
trusted preview generation. It needs size/type limits, retry semantics, and a
durable processing-state model; it must never expose originals or use a
browser service-role key.

## Additive migration plan

Prompt 1 should add forward-only migrations; it must not recreate the Phase 1
tables or reset data.

1. Extend `galleries` with an explicit Phase 2 access mode, high-entropy share
   token hash, optional password hash, publication/archive timestamps, and
   optional location. Keep the legacy `visibility` column temporarily, then
   document which field is authoritative during migration. A public UUID or
   slug must never become the gallery secret.
2. Extend `photos` with nullable thumbnail path, processing state/error,
   caption/alt text, and any required metadata constraints. Make preview-path
   nullability compatible with a genuine `pending` state; do not use a fake
   preview path. Add a trusted constraint/trigger or verified server operation
   so a gallery cover photo belongs to that same gallery.
3. Extend `favourites` with an explicit gallery association if needed for
   efficient ownership checks, with a database invariant that the photo belongs
   to that gallery. Preserve hashed anonymous visitor identifiers and prevent
   duplicates.
4. Evolve `inquiries` status deliberately. Existing values are
   `new`/`contacted`/`closed`; do not silently replace them. Either retain and
   document them or use a data-preserving status migration before adopting a
   `new`/`read`/`archived` inbox.
5. Add indexes for photographer gallery lists, gallery/photo ordering, access
   lookups, and photographer favourites/inquiries views. Add only any access
   grant or rate-limit tables proven necessary by the chosen server-side access
   design.
6. Keep `anon` away from application tables and storage. Public-gallery reads,
   favourites, and inquiries must go through server-side authorization that
   verifies a share token/password and issues only short-lived preview URLs.

## Proposed task sequence

| Prompt | Deliverable                                 | Likely files/modules                                                                                                                                   |
| ------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Schema, RLS, private-access foundation      | New migration(s); `src/lib/galleries`, `src/lib/photos`, `src/lib/validation/*`; generated `src/types/database.ts`; RLS SQL checks.                    |
| 2      | Gallery library and draft creation          | `src/app/(studio)/galleries/*`, `src/app/actions/galleries.ts`, gallery repository/schema/components, `DashboardShell`.                                |
| 3      | Multi-photo upload and processing           | Upload route handlers under `src/app/api/galleries/*`, photo service/validation, storage-key utility, processing abstraction, upload components/tests. |
| 4      | Editor, photo organisation, cover selection | Gallery editor routes/actions, photo repository/service, reusable photo grid/row components and ownership tests.                                       |
| 5      | Publish, private links, password gate       | Share-token/password/access services, server-only route handlers, sharing settings UI, access/rate-limit tests.                                        |
| 6      | Client viewing and lightbox                 | Public gallery route group, authorised preview-url service, gallery grid/lightbox components, keyboard and unavailable-state tests.                    |
| 7      | Favourites and proofing                     | Anonymous visitor-cookie service, favourite routes/actions, photographer proofing view, duplicate/ownership tests.                                     |
| 8      | Contact CTA, inquiry submission/inbox       | Inquiry validation/service/routes, client inquiry form, studio inbox route, abuse-control tests.                                                       |
| 9      | Responsive and accessibility pass           | Shared UI variants only where repeated; browser viewport and keyboard checks.                                                                          |
| 10     | Reliability/security/end-to-end             | Two-account RLS/storage checks, expired URL checks, real auth/client journeys; add Playwright only with a non-production project.                      |
| 11     | Closeout                                    | Audit `AI_CONTEXT.md`, `API.md`, README, migration/type-generation instructions, and acceptance evidence.                                              |

## Required security decisions before public delivery

- Use a server-only Supabase service-role client only when necessary for an
  authorised public-gallery operation. It must be isolated from browser-safe
  clients and receive an explicit `SUPABASE_SERVICE_ROLE_KEY` environment
  variable. RLS remains the primary photographer boundary; a service role is
  not a shortcut for browser access.
- Generate share tokens with `crypto.randomBytes` (at least 128 bits, prefer
  256), store only a SHA-256 hash, compare safely, and support rotation or
  revocation.
- Hash gallery passwords with a salted adaptive password-hashing approach;
  never store plaintext or reversible encryption. Implement real, shared
  rate limiting before exposing password verification publicly. There is no
  existing rate-limit infrastructure.
- Issue an opaque, Secure, HttpOnly, SameSite cookie for anonymous favourites.
  Persist only a hash where identity is stored. Verify gallery access on the
  server before permitting a favourite or creating an inquiry.
- Validate MIME signature, size, dimensions, and filename independently of the
  browser. Sanitise display filenames and generate every storage key on the
  server. Do not trust client-supplied gallery IDs, paths, dimensions, or MIME
  types.
- Persist private object paths only. Authorise each request, then create a
  short-lived preview URL. Never make a bucket public or fall back to an
  original when a preview is unavailable.

## External configuration and verification needed

- A non-production Supabase project or branch plus two disposable confirmed
  photographer accounts for RLS/storage and browser acceptance checks.
- A server-only `SUPABASE_SERVICE_ROLE_KEY` only if the selected public access
  or processing architecture requires privileged operations. Never prefix it
  with `NEXT_PUBLIC_`.
- A server-only app origin and a high-entropy gallery-access-cookie signing
  secret if share links/cookies are implemented; define their exact names with
  Prompt 5, add placeholders to `.env.example`, and document them in README.
- A documented hosting/upload limit and a chosen preview-processing runtime
  before Prompt 3. Any added native image library or external worker must be
  verified against that host.
- Supabase dashboard bucket limits and MIME restrictions updated through a
  committed migration/configuration procedure, not an undocumented click-only
  change.

## Test plan

- Unit: gallery/photo/access/inquiry schemas; token and password helpers;
  storage-key construction; safe client URL handling; duplicate retry logic.
- Service/route: authenticated ownership checks, unsupported/oversize/corrupt
  file rejection, no raw paths/tokens in errors, processing failures, and
  no original fallback.
- Database/storage: Photographer B cannot read/write Photographer A's
  galleries, photos, favourites, inquiries, or storage objects; anonymous
  direct table/storage access is denied; authorised private previews expire.
- Browser: sign in, create gallery, upload/retry, organise/publish/revoke,
  password gate, anonymous favourite, inquiry submission, sign out, and
  unavailable gallery states at 360, 390, 768, 1024, and 1440 pixels with
  keyboard-only checks.

## Recommendation

No critical architectural blocker prevents Phase 2 planning. Proceed with
**Prompt 1** first. Resolve the access-mode/legacy-visibility migration,
pending-preview nullability, public-access service boundary, rate-limit
strategy, and deployment-compatible processing approach before Prompt 3 or
any client-facing gallery route.
