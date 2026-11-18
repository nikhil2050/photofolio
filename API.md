# Photofolio API

## Status

No public data API routes are implemented in Phase 1. Auth and profile mutations are handled by authenticated Next.js Server Actions and are not a public API contract.

## Authentication callback routes

- `GET /auth/callback`: primary Supabase email-confirmation return route. It exchanges a PKCE code or verifies a confirmation token hash, writes the cookie-backed session, and redirects to `/profile`. Invalid or expired links redirect to `/sign-in` with a non-technical message.
- `GET /auth/confirm`: compatible alias for existing Supabase email templates; it has the same behaviour as `/auth/callback`.

These routes accept only the Supabase-generated confirmation parameters and do not return token or session data in their response body.

## Server Actions

- `signUp`: validates email, password, and matching password confirmation with Zod and creates a Supabase Auth account.
- `signIn`: validates email/password with Zod and creates a cookie-backed Supabase session. An internal return path is constrained to a local application route.
- `signOut`: revokes the current Supabase session.
- `saveProfile`: validates and upserts the signed-in photographer's profile under RLS. Avatar/logo uploads use the browser Supabase client only to an owner-scoped, private bucket path; the action verifies that path before saving it.

All actions use the authenticated server client. No service-role credentials are used. `proxy.ts` refreshes sessions and provides early redirects, while protected server routes independently verify JWT claims before returning data.
