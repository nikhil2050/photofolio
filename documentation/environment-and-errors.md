# Environment configuration and safe error handling

## Status: COMPLETED

## Environment variables

Phase 1 requires only browser-safe Supabase configuration:

| Variable                               | Required | Exposure     | Purpose                          |
| -------------------------------------- | -------- | ------------ | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes      | Browser-safe | Supabase project URL.            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes      | Browser-safe | Supabase publishable client key. |

`src/lib/supabase/env.ts` validates these variables with Zod. Validation runs
when a Supabase client is created and at Next.js startup/build through
`src/instrumentation.ts` and `next.config.ts`. Error messages name invalid keys
but never print their values.

There are deliberately no server-only secrets in Phase 1. Do not add a
Supabase service-role key unless a future trusted server operation explicitly
needs it; it must remain server-only and never use the `NEXT_PUBLIC_` prefix.

### Environment expectations

| Environment | Expected setup                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Local       | Copy `.env.example` to `.env.local` and use a development Supabase project. `.env.local` is ignored by Git.                                     |
| Test        | Provide a separate Supabase project or isolated branch credentials through the test runner or CI secret store. Never reuse production data.     |
| Preview     | Set the two required variables in the hosting provider’s preview environment and add the preview origin to Supabase Auth redirect URLs.         |
| Production  | Set the two required variables in the production secret/configuration store. Keep the production project linked only for deliberate migrations. |

## Error handling

- `AppError` gives expected server failures a stable code and safe public
  message.
- Route data access translates provider failures into typed application errors.
- `src/app/error.tsx` provides a resettable, non-technical route fallback.
- The profile-avatar API returns validation/auth/storage failures as safe JSON
  with an `x-request-id` response header and matching body field.
- Browser forms keep their existing inline validation and upload errors.

## Logging

`src/lib/logging/logger.ts` emits structured JSON logs with event names,
operation, safe error code, status, route, and request ID where available.
The logger intentionally does not accept request bodies, credentials, tokens,
cookies, signed URLs, private object paths, email addresses, or raw provider
errors.

Next.js instrumentation records unexpected request failures using only route
metadata and the typed error code when available. Connect an external logging
provider later by extending this logger; do not send raw error objects there.
