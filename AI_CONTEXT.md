# Photofolio AI Context

## Status

**IN_PROGRESS — Phase 1 foundation.** The repository contains the App Router foundation, Supabase SSR auth integration, photographer profile flow, protected dashboard, and a committed SQL migration. A Supabase project is not configured in this repository.

## Architecture

- Next.js App Router + TypeScript + Tailwind CSS.
- Supabase provides Auth, Postgres, and private Storage.
- `@supabase/ssr` owns browser/server cookie-aware clients in `src/lib/supabase`.
- `proxy.ts` refreshes cookie sessions in Next.js 16.
- Server Actions implement sign-up, sign-in, sign-out, and profile persistence.
- Zod validates all auth/profile input server-side.

## Current routes

- `/`: public marketing foundation
- `/sign-up`, `/sign-in`: email/password authentication
- `/auth/confirm`: Supabase email-confirmation callback
- `/dashboard`: authenticated, factual empty state
- `/profile`: authenticated photographer profile form with an optional owner-scoped logo/avatar upload

## Data and privacy

`supabase/migrations/202611180001_phase_1_foundation.sql` creates RLS-protected profiles, galleries, photos, inquiries, and two private storage buckets. `202611180002_grant_authenticated_table_access.sql` explicitly grants the signed-in Data API role only the required table operations because automatic table exposure is disabled. Galleries, images, inquiries, and client-facing delivery are data foundations only in this phase; no UI workflow is implemented.

## Required environment variables

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Next planned work

1. Link a Supabase project and apply the migration.
2. Verify authentication redirect URLs in the Supabase dashboard.
3. Add avatar upload only after the storage path and signed-access workflow is designed.
4. Begin Phase 2 gallery delivery only after pilot validation.
