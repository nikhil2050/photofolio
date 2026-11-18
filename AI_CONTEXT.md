# Photofolio AI Context

## Status

**IN_PROGRESS — Phase 1 acceptance review; Phase 2 Prompts 1–2 are locally complete.** The repository contains the App Router foundation, Supabase SSR auth integration, photographer profile flow, protected dashboard, legal-information drafts, and committed SQL migrations. Hosted two-account and browser acceptance checks remain before Phase 1 can be declared complete. The Phase 2 gallery library and draft-creation routes are implemented locally but require migration `202611180005` before they can create or fully read galleries against the linked production Supabase project. See `documentation/phase-2-audit.md` and `documentation/database-model.md`.

## Architecture

- Next.js App Router + TypeScript + Tailwind CSS.
- Supabase provides Auth, Postgres, and private Storage.
- `@supabase/ssr` owns browser/server cookie-aware clients in `src/lib/supabase`; Zod validates required browser-safe configuration at startup/build and client creation.
- `proxy.ts` refreshes cookie sessions in Next.js 16.
- Server Actions implement sign-up, sign-in, sign-out, and profile persistence. `getClaims()` verifies the authenticated identity on the server before protected data is read. A server-validated profile-image route stores optional avatars in an owner-scoped private path.
- Zod validates all auth/profile input server-side.
- `src/components/ui` contains the reusable shadcn-style visual primitives; `/internal/style-guide` previews them only outside production. `src/lib/errors` and `src/lib/logging` provide safe typed failures and structured server logs.
- `src/lib/galleries` owns gallery reads and draft creation; `src/lib/validation/gallery.ts` owns create-form and URL-filter validation. `src/app/actions/galleries.ts` resolves ownership from the signed-in profile before it creates a draft.
- Vitest covers pure validation, safe redirects, and environment boundaries. Hosted Supabase and browser acceptance procedures live in `documentation/phase-1-acceptance.md`.

## Current routes

- `/`: public marketing foundation
- `/sign-up`, `/sign-in`: email/password authentication
- `/auth/callback`: primary Supabase email-confirmation callback; `/auth/confirm` remains as a compatible alias for existing templates
- `/dashboard`: authenticated studio overview with an owner-scoped gallery count, first-visit empty state, profile action, and a recoverable load-error state
- `/profile`: authenticated profile setup/editing with a live gallery-identity preview; a valid saved display name completes onboarding and leads to the dashboard
- `/galleries`: authenticated gallery library with server-side search, status filters, pagination, real ready-photo counts, and empty/loading/error states
- `/galleries/new`: authenticated short draft-gallery form
- `/galleries/[galleryId]`: authenticated, owner-scoped confirmation/details screen for a created private draft
- `/privacy`, `/terms`, `/copyright`: readable Phase 1 legal-information drafts with clearly marked operator and legal-review placeholders

## Data and privacy

`supabase/migrations/202611180001_phase_1_foundation.sql` creates the original RLS-protected foundation and private storage buckets. `202611180002_grant_authenticated_table_access.sql` explicitly grants the signed-in Data API role required operations because automatic table exposure is disabled. `202611180003_expand_application_data_model.sql` establishes the six-entity model: users, photographer profiles, galleries, photos, favourites, and inquiries. `202611180004_secure_private_photo_storage.sql` is applied and hardens private object-key policies for owner-and-gallery access. `202611180005_phase_2_gallery_delivery_foundation.sql` is locally validated and pending remote application; it adds access-secret hashes, photo processing fields, gallery-scoped favourites, integrity constraints, thumbnail policy support, and original-bucket limits without opening client access. See `documentation/database-model.md` and `documentation/storage-security.md` for verification guidance.

## Required environment variables

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Next planned work

1. Run the documented hosted authentication, two-account RLS, storage, and responsive browser checks before declaring Phase 1 complete.
2. Explicitly approve and apply `202611180005_phase_2_gallery_delivery_foundation.sql` to the linked production project, then generate `src/types/database.ts` from the applied schema.
3. Execute Phase 2 Prompt 3: secure multi-photo upload and processing, after the migration is deployed.
4. Run the documented two-account Phase 2 RLS and storage checks in a non-production Supabase project or branch.
5. Verify the Supabase Auth redirect URLs include `/auth/callback` (and `/auth/confirm` while an older email template remains active).
