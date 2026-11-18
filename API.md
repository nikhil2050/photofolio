# Photofolio API

## Status

No public HTTP API routes are implemented in Phase 1. Auth and profile mutations are handled by authenticated Next.js Server Actions and are not a public API contract.

## Server Actions

- `signUp`: validates email/password with Zod and creates a Supabase Auth account.
- `signIn`: validates email/password with Zod and creates a cookie-backed Supabase session.
- `signOut`: revokes the current Supabase session.
- `saveProfile`: validates and upserts the signed-in photographer's profile under RLS. Avatar/logo uploads use the browser Supabase client only to an owner-scoped, private bucket path; the action verifies that path before saving it.

All actions use the authenticated server client. No service-role credentials are used.
