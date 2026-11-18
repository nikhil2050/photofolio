# Phase 1 integration and acceptance review

## Status: IN_PROGRESS

Repository-level checks were completed on 18 November 2026. Phase 1 cannot be
declared complete until the hosted Supabase tests and browser journey below are
run with disposable test accounts. Do not use production credentials or
customer data.

## Completed repository checks

- `npm test`: passed (4 files, 9 tests).
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npx next build --webpack`: passed.
- Task-owned files pass Prettier and `git diff --check` has no whitespace
  errors. The repository-wide `npm run format:check` is currently blocked by
  the unrelated, untracked `documentation/phase-2-prompts.md`; this review did
  not reformat or modify that file.
- Local production smoke check: signed-out `/dashboard` returned `307` to
  `/sign-in`; `/privacy`, `/terms`, and `/copyright` each returned `200`.

## Automated coverage

Run locally:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npx next build --webpack
```

The unit suite covers:

- Email/password and matching-password validation.
- Profile URL and owner-scoped avatar-path validation.
- Safe internal redirects after authentication.
- Missing or malformed public Supabase environment configuration.

## Hosted Supabase integration setup: REQUIRED

Create two disposable confirmed Supabase accounts, **Photographer A** and
**Photographer B**, in a non-production project or isolated Supabase branch.
Use each account’s normal browser session; do not put passwords, refresh
tokens, access tokens, or service-role keys in source control, test output, or
this document.

Apply all migrations to that isolated project. Then use the same browser with
separate profiles (or a private window) for each account. The storage checks in
[storage-security.md](storage-security.md) require one gallery and one test
object per account.

## Acceptance journey

| Step                                  | Expected result                                                                         | Verification status                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Public visitor opens `/`              | Marketing foundation and legal links render.                                            | Repository build verified; browser check required.     |
| Sign up                               | Invalid values show inline errors; valid submission avoids email enumeration.           | Unit validation verified; hosted auth check required.  |
| Confirm email                         | `/auth/callback` establishes a session and leads to profile setup.                      | Hosted check required.                                 |
| Sign in / refresh                     | Session persists and authenticated users leave auth pages for `/dashboard`.             | Hosted check required.                                 |
| Signed-out `/dashboard` or `/profile` | Redirects to `/sign-in`; server check still protects data.                              | Browser check required.                                |
| Save profile                          | Only the authenticated user owns the persisted profile; optional values can be skipped. | Unit validation verified; hosted RLS check required.   |
| Dashboard                             | Completed profile sees the genuine gallery count and factual empty state.               | Repository build verified; hosted data check required. |
| Sign out                              | Supabase session clears and protected pages redirect after reload.                      | Hosted check required.                                 |

## Security verification still required

- Run the two-account table RLS checks in
  [database-model.md](database-model.md).
- Run original, preview, profile asset, anonymous, and modified-key checks in
  [storage-security.md](storage-security.md).
- Verify the authorised-preview signed URL expires once gallery delivery
  exists; it is intentionally not implemented in Phase 1.
- Test 360px, 390px, 768px, 1024px, and 1440px widths in a real browser, plus
  keyboard-only navigation, labels, focus visibility, and error announcements.

## Known Phase 1 limits

- Gallery upload, delivery, client access, favourites UI, enquiries UI,
  payments, subscriptions, analytics, and CRM are intentionally out of scope.
- No browser end-to-end test runner is installed because the only meaningful
  full journey depends on real Supabase email confirmation and isolated test
  identities. Add Playwright with a non-production Supabase project when that
  environment is available.
