# Photofolio AI Context

## Status

**IN_PROGRESS — Phase 1 foundation.** The repository contains the App Router foundation, Supabase SSR auth integration, photographer profile flow, protected dashboard, and committed SQL migrations. A local environment still needs its own Supabase credentials.

## Architecture

- Next.js App Router + TypeScript + Tailwind CSS.
- Supabase provides Auth, Postgres, and private Storage.
- `@supabase/ssr` owns browser/server cookie-aware clients in `src/lib/supabase`; Zod validates required browser-safe configuration at startup/build and client creation.
- `proxy.ts` refreshes cookie sessions in Next.js 16.
- Server Actions implement sign-up, sign-in, sign-out, and profile persistence. `getClaims()` verifies the authenticated identity on the server before protected data is read. A server-validated profile-image route stores optional avatars in an owner-scoped private path.
- Zod validates all auth/profile input server-side.
- `src/components/ui` contains the reusable shadcn-style visual primitives; `/internal/style-guide` previews them only outside production. `src/lib/errors` and `src/lib/logging` provide safe typed failures and structured server logs.

## Current routes

- `/`: public marketing foundation
- `/sign-up`, `/sign-in`: email/password authentication
- `/auth/callback`: primary Supabase email-confirmation callback; `/auth/confirm` remains as a compatible alias for existing templates
- `/dashboard`: authenticated studio overview with an owner-scoped gallery count, first-visit empty state, profile action, and a recoverable load-error state
- `/profile`: authenticated profile setup/editing with a live gallery-identity preview; a valid saved display name completes onboarding and leads to the dashboard
- `/privacy`, `/terms`, `/copyright`: readable Phase 1 legal-information drafts with clearly marked operator and legal-review placeholders

## Data and privacy

`supabase/migrations/202611180001_phase_1_foundation.sql` creates the original RLS-protected foundation and private storage buckets. `202611180002_grant_authenticated_table_access.sql` explicitly grants the signed-in Data API role required operations because automatic table exposure is disabled. `202611180003_expand_application_data_model.sql` establishes the six-entity model: users, photographer profiles, galleries, photos, favourites, and inquiries. `202611180004_secure_private_photo_storage.sql` is applied and hardens private object-key policies for owner-and-gallery access. See `documentation/database-model.md` and `documentation/storage-security.md` for verification guidance.

## Required environment variables

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Next planned work

1. Run the documented two-account storage RLS checks before enabling gallery delivery.
2. Generate `src/types/database.ts` from the applied remote schema.
3. Verify the Supabase Auth redirect URLs include `/auth/callback` (and `/auth/confirm` while an older email template remains active).
4. Begin Phase 2 gallery delivery only after pilot validation.
