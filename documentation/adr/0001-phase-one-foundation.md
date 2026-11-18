# ADR 0001: Phase 1 application foundation

**Status:** Accepted  
**Date:** 2026-11-18

## Context

Photofolio needs a maintainable foundation for a photographer profile, authenticated
workspace, and future private gallery delivery. The repository already used Next.js
16 App Router, TypeScript strict mode, Tailwind 4, npm, and Supabase SSR helpers.

## Decision

- Retain npm because `package-lock.json` is the existing lockfile.
- Retain Next.js App Router and `src/` layout.
- Keep Next.js Cache Components disabled because authenticated studio routes read
  request cookies. Revisit this only when a future feature has a measured caching
  need and a route-level suspense/caching plan.
- Keep browser/server Supabase clients isolated in `src/lib/supabase`.
- Use `proxy.ts`, the Next.js 16 convention, to refresh cookie-backed Supabase
  sessions.
- Use Server Actions and Zod for the small set of Phase 1 auth/profile mutations.
- Use simple shared React components rather than introducing a component library
  during an already-started foundation phase.
- Add legal pages as factual launch-preparation placeholders; they are not legal
  advice and do not claim a complete public policy.

## Consequences

The current structure remains small and domain-oriented. Add feature folders only
when a domain has enough code to benefit from them. A future gallery implementation
should live in a dedicated gallery feature and preserve the existing private-storage
access model.
