# Photofolio
## Phase 1 implementation prompt pack

Use these prompts with your coding assistant in the order shown. The shared product brief and visual-system skill should be applied to every prompt.

---

# 0. Shared project brief — prepend this to every implementation task ✅

You are the senior product designer and senior full-stack engineer working on a product called **Photofolio**.

## Product idea

Build a platform where photographers create a professional profile, showcase their work, and deliver photographs to clients through private, branded galleries. The experience should replace an unbranded Google Drive link with a polished delivery experience that can also encourage new enquiries and bookings.

The product should eventually support this growth loop:

1. A photographer creates a profile and showcases selected work.
2. The photographer shares a branded gallery with a client.
3. The client views, favourites, or shares selected photographs.
4. The gallery and photographer profile make it easy to enquire or book.
5. The photographer receives an enquiry and can convert it into another booking.

**Phase 1 is foundation only.** Do not build the full gallery delivery experience, photo upload workflow, favourites UI, public portfolio builder, payments, subscriptions, analytics, or CRM unless a task explicitly requests it. Create a sound foundation and data model that will support those later phases.

## Phase 1 outcome

A photographer can:
- Create an account.
- Sign in and sign out.
- Maintain a secure session.
- Complete a basic photographer profile with display name, logo/avatar, contact or WhatsApp number, and booking CTA.
- Access a protected dashboard.
- See a useful empty state when no galleries exist.

Private original-photo storage and controlled preview-image storage must be configured as infrastructure, even though a complete gallery upload/delivery feature is out of scope.

## Default technology choices

Use these defaults unless the existing repository already has an intentional alternative:
- Next.js with the App Router.
- TypeScript with strict type checking.
- React Server Components by default; use Client Components only for real browser interaction.
- Tailwind CSS for styling.
- shadcn/ui as an accessible component foundation, customised to the project's design system rather than used with its default visual theme.
- Lucide icons with a consistent outline style.
- Supabase Auth, Postgres, and Storage for the initial integrated backend.
- Zod for server-side input validation.
- React Hook Form only where a form's complexity justifies it; do not add dependencies without a clear reason.
- SQL migrations committed to the repository.
- Playwright for critical end-to-end flows if the project already uses it or it can be added without unnecessary complexity.

Use the current official documentation for the installed versions. Do not copy old Next.js or Supabase examples without checking that their APIs still match the installed packages. In particular, verify the current recommended Supabase SSR package and its stability before implementation.

## Product design direction

The interface should feel like a **premium, calm photography studio workspace**: image-led, editorial, minimal, warm, and professional. The product chrome should frame the photography rather than compete with it.

There are three related experiences:
- Marketing website: explain the value proposition and convert photographers into sign-ups.
- Photographer workspace: help the photographer set up and manage their studio.
- Client-facing gallery: a calm, branded, private place to view delivered work.

They must share the same design tokens, typography principles, spacing, component behaviour, icon style, and interaction patterns, while allowing the client gallery to give photographs more space.

## Shared visual-system requirement

Before creating or modifying any UI, read and follow:

`.agents/skills/photofolio-visual-system/SKILL.md`

Treat that file as the source of truth for colour, typography, spacing, components, imagery, responsive behaviour, accessibility, and visual QA. Do not create one-off styles or introduce a second design language. If a new component needs a design decision not covered by the skill, make the smallest consistent extension and update the skill so future screens reuse it.

## Engineering principles

- Prefer secure, boring, maintainable foundations over clever abstractions.
- Keep feature code organised by domain: auth, profile, dashboard, storage, legal.
- Keep database access and authorization in server-side data-access functions or trusted server operations.
- Validate all untrusted input on the server, even when there is client-side validation.
- Enable Row Level Security on every exposed application table and write explicit policies.
- Keep original images and controlled previews private by default. Do not expose permanent public URLs for private client photographs.
- Never put service-role keys, storage secrets, or other privileged credentials in browser code or public environment variables.
- Do not rely only on hiding UI or checking a route in the browser for authorization.
- Do not log passwords, auth tokens, signed URLs, private messages, or unnecessary personal information.
- Avoid premature abstractions. Build reusable components where there is a real repeated pattern.
- Use clear loading, success, validation, empty, and error states. No dead buttons or fake functionality.
- Never add fabricated dashboard counts, fake galleries, fake customer activity, or made-up testimonials to a real product screen.
- Preserve existing working code. Inspect before changing files and explain any migration or destructive operation.

## Delivery expectations for every task

1. Inspect the existing repository and identify relevant files before editing.
2. Summarise the implementation approach briefly.
3. Implement the task end to end, including responsive UI and error states where applicable.
4. Add or update tests for important behaviour and security boundaries.
5. Run available lint, type-check, test, and build commands.
6. Report exactly what changed, commands run, test outcomes, environment variables or manual dashboard configuration still required, and any known limitations.
7. Do not claim that an external service is configured unless the necessary project configuration was actually completed and verified.

---

# 1. Prompt — inspect the repository and establish the application foundation ✅

Read the shared project brief and `.agents/skills/photofolio-visual-system/SKILL.md` first.

Inspect the current repository before making changes. Determine whether this is a new project or an existing application. Identify the current Next.js, React, TypeScript, Tailwind, package manager, lint, test, and component-library setup. Do not overwrite existing files or replace the package manager without a reason.

For a new project, establish a clean Next.js App Router application with TypeScript strict mode, Tailwind, ESLint, path aliases, and a predictable `src/` structure. Use the package manager indicated by the lockfile; if there is no lockfile, choose one and state why.

Create a maintainable initial structure similar to:

```text
src/
  app/
    (marketing)/
    (auth)/
    (app)/
    privacy/
    terms/
    copyright/
  components/
    ui/
    layout/
    shared/
  features/
    auth/
    profile/
    dashboard/
  lib/
    supabase/
    validation/
    logging/
    utils/
  types/
  styles/
  middleware.ts or the current Next.js equivalent, only if appropriate
```

Adapt this structure to current Next.js conventions. Do not create empty folders just to match the diagram. Keep route groups clean and make shared layouts reusable.

Create a simple, polished root experience appropriate to the product. Do not spend time building a complete marketing website in Phase 1. Ensure the application starts successfully and that the root route, authentication route placeholders, protected dashboard route placeholder, and legal routes have a clear route plan.

Add:
- A clear `README.md` with prerequisites, setup commands, environment configuration, development commands, and a brief architecture overview.
- A `.env.example` containing variable names but no real secrets.
- A consistent formatting/lint/type-check script set.
- A short architecture decision note explaining any non-obvious technology choices.

Do not add unnecessary dependencies. Do not hardcode secrets. Do not claim Supabase is connected until real project credentials and a successful connection have been verified.

**Acceptance criteria**
- The app starts locally.
- TypeScript strict checking passes.
- Lint passes.
- The route and feature structure is understandable.
- The README lets another developer reproduce the setup.
- Existing repository functionality, if any, remains intact.

---

# 2. Prompt — implement the shared visual system and reusable UI foundations ✅

Read `.agents/skills/photofolio-visual-system/SKILL.md` and use it as the authoritative design reference.

Implement the visual system once so future screens can reuse it. Do not merely create a style guide document: connect the tokens to the actual application theme and reusable components.

## Design intent

Create a warm editorial minimal interface. Use a quiet off-white canvas, white surfaces, charcoal text, restrained stone-grey secondary text, subtle borders, and a muted terracotta accent. Photography should provide most of the colour and emotion.

## Required implementation

1. Define central design tokens as CSS custom properties and map them to Tailwind/shadcn theme variables as appropriate.
2. Implement the agreed typography using a consistent font-loading strategy. Product UI should use a highly readable sans-serif. A restrained editorial serif may appear on marketing headlines only.
3. Define spacing, radii, borders, shadows, focus rings, content widths, and responsive breakpoints in one place.
4. Customise shadcn/ui components to match the visual language. Do not allow default component styles to leak into the product.
5. Create/reuse the core primitives that Phase 1 needs:
   - Button variants: primary, secondary, outline, ghost, destructive, and link.
   - Text input, textarea, label, helper text, and validation message.
   - Card and section container.
   - Avatar/image upload presentation.
   - Alert, toast/feedback, badge, divider, skeleton, and empty state.
   - Page header with title, description, and optional action.
   - Dashboard shell with sidebar and responsive mobile navigation.
6. Use Lucide outline icons consistently. Icon-only buttons must have accessible names and visible focus states.
7. Provide light theme as the required default. Do not introduce a dark theme toggle in Phase 1 unless there is a compelling product requirement.
8. Add a small internal style-guide or component-preview route that demonstrates the actual tokens and components. Keep it out of public navigation and protect or disable it appropriately for production.

## Quality requirements

- The design must remain clean at 360px mobile width, tablet width, laptop width, and large desktop.
- Keyboard focus must be visible.
- Text and controls must meet WCAG AA contrast where applicable.
- Controls must have consistent heights, spacing, labels, and error presentation.
- Motion must be subtle and respect `prefers-reduced-motion`.
- Avoid large gradients, glassmorphism, neumorphism, excessive shadows, decorative blobs, generic 3D graphics, or random border radii.

**Acceptance criteria**
- Tokens are centralised rather than duplicated in page-level classes.
- Core components use the shared tokens.
- A sample page demonstrates visual consistency.
- The style-guide route is responsive and accessible.
- The skill file is updated if an implementation decision changes the shared rules.

---

# 3. Prompt — design and implement the initial database model ✅

Read the shared brief. Inspect the existing Supabase project configuration and migrations. Do not assume tables or policies already exist.

Create versioned SQL migrations for these six application entities:

- `users`
- `photographer_profiles`
- `galleries`
- `photos`
- `favourites`
- `inquiries`

Use UUID primary keys unless a strong reason exists not to. Use `created_at` and `updated_at` consistently where relevant. Add foreign keys, unique constraints, check constraints, indexes, and deletion behaviour deliberately.

## Suggested relational model

### `users`

Application-level account record linked one-to-one to the authenticated identity. If Supabase Auth is used, reference `auth.users(id)` and do not duplicate passwords or authentication secrets.

Suggested fields:
- `id` UUID primary key referencing `auth.users(id)` with deliberate cascade behaviour.
- `email` where needed for application display/contact workflows; keep the auth identity as the source of truth for login credentials.
- `created_at`, `updated_at`.

Avoid storing redundant identity fields that can become inconsistent. Explain whether this row is created by a database trigger or lazily by a trusted server-side onboarding operation, and implement only one approach.

### `photographer_profiles`

One profile per photographer account for Phase 1.

Suggested fields:
- `id` UUID primary key.
- `user_id` UUID unique foreign key to `users(id)`.
- `display_name` required once setup is complete.
- `slug` unique, nullable until chosen or generated.
- `bio` nullable.
- `avatar_path` nullable.
- `logo_path` nullable.
- `whatsapp_number` nullable, stored in a normalised international format where possible.
- `booking_cta_label` nullable.
- `booking_cta_url` nullable and validated as an allowed URL scheme.
- `website_url`, `instagram_url` nullable if included; do not add fields without a clear future use.
- `setup_completed_at` nullable.
- `created_at`, `updated_at`.

Do not make optional fields required merely to satisfy a form layout.

### `galleries`

Prepare the future gallery entity without building gallery functionality in this task.

Suggested fields:
- `id` UUID primary key.
- `photographer_profile_id` foreign key.
- `title`.
- `slug`.
- `description` nullable.
- `status` constrained to a small documented set such as `draft`, `published`, `archived`.
- `visibility` constrained to a documented set such as `private`, `unlisted`, `public`; do not assume that `unlisted` means secure access.
- `client_name` nullable.
- `event_date` nullable.
- `cover_photo_id` nullable, with the circular reference handled safely.
- `created_at`, `updated_at`.

### `photos`

Suggested fields:
- `id` UUID primary key.
- `gallery_id` foreign key.
- `original_storage_path` private object path.
- `preview_storage_path` private object path.
- `file_name`.
- `mime_type`.
- `file_size_bytes`.
- `width`, `height` nullable until known.
- `sort_order` integer.
- `created_at`, `updated_at`.

Do not store binary image data in Postgres. Do not assume that a storage path itself grants access.

### `favourites`

Prepare the future client-favourites entity without assuming that clients have platform accounts. Propose a privacy-conscious visitor/session identity model. Prefer opaque, random client tokens with only a hash persisted if a bearer token is needed; never store a reusable raw access token. Ensure uniqueness prevents a visitor from favouriting the same photo repeatedly. Document how the future gallery-access model will establish ownership of a favourite.

### `inquiries`

Suggested fields:
- `id` UUID primary key.
- `photographer_profile_id` foreign key.
- `gallery_id` nullable foreign key when the enquiry originates from a gallery.
- `name`, `email`, `message`.
- `phone` nullable.
- `status` constrained to a small set such as `new`, `contacted`, `closed`.
- `source` nullable or constrained if useful.
- `created_at`, `updated_at`.

Do not expose a public insert policy for inquiries without considering spam prevention, rate limiting, validation, and abuse controls. Phase 1 only needs the table foundation.

## Security and database requirements

- Enable Row Level Security on every application table exposed through the Supabase Data API.
- Write explicit owner-scoped policies for the authenticated photographer's rows.
- Do not use broad `USING (true)` or `WITH CHECK (true)` policies for private photographer data.
- Ensure a photographer cannot read or modify another photographer's profile, galleries, photos, or inquiries.
- Avoid granting clients access to private tables merely because future public galleries will exist. Client access must be designed explicitly in a later phase.
- Treat Supabase service-role credentials as privileged server-only secrets; they bypass RLS and must never enter browser bundles.
- Add indexes for foreign keys and common lookup fields such as profile slug, gallery slug, and gallery foreign keys.
- Use database constraints for invariants that must remain true even if a request bypasses the UI.
- Include rollback notes where practical.

Generate TypeScript database types from the schema if the project's Supabase workflow supports it. Keep generated types in the agreed location and document the regeneration command.

**Acceptance criteria**
- A clean database can apply the migrations in order.
- Constraints and indexes exist.
- RLS is enabled and owner-scoped policies are present.
- Tests or documented SQL checks demonstrate that photographer A cannot read or alter photographer B's rows.
- No client-facing access is accidentally opened.

---

# 4. Prompt — implement secure authentication and protected routes ✅

Read the shared brief and check current official Next.js and Supabase authentication documentation for the installed package versions before coding.

Implement:
- Sign up with email and password.
- Sign in with email and password.
- Sign out.
- Session persistence and refresh using the currently recommended server-compatible Supabase approach.
- Email confirmation handling if enabled in the Supabase project.
- A callback route for exchanging an auth code when required by the chosen flow.
- Server-side authentication checks for protected application routes.
- A clean redirect for unauthenticated visitors.
- A clean redirect for authenticated users who visit sign-in/sign-up unnecessarily.

## UX requirements

Use the shared visual-system skill. Keep the forms minimal and calm.

Sign-up page:
- Small brand mark or product wordmark placeholder.
- Heading: `Create your studio account`.
- One short supporting sentence explaining the benefit.
- Email, password, and confirm-password fields only if the chosen auth flow requires confirmation.
- Clear password requirements before submission.
- Primary CTA: `Create account`.
- Link to sign in.
- Terms/privacy acknowledgement only if required by the product's actual legal/consent design; do not invent a pre-checked consent.

Sign-in page:
- Heading: `Welcome back`.
- Email and password.
- Primary CTA: `Sign in`.
- Link to account creation.
- Forgot-password link only if the reset flow is implemented; do not show a dead link.

Provide clear inline validation, pending state, success state, and non-technical error messages. Avoid revealing whether an arbitrary email address is registered where that would create an account-enumeration risk.

## Security requirements

- Use the current recommended cookie-based SSR/session integration for the chosen provider.
- Verify the authenticated identity on the server before returning protected data.
- Do not trust a client-side auth context as the sole authorization check.
- Do not use a public environment variable for privileged secrets.
- Use secure cookie defaults as appropriate to the framework/provider.
- Handle expired sessions and failed refreshes gracefully.
- Ensure sign-out clears the provider session and returns the user to a public route.
- Do not log credentials, tokens, or raw session data.

## Routes to implement

At minimum:
- `/sign-up`
- `/sign-in`
- `/auth/callback` or the route required by the chosen provider flow
- `/dashboard` (protected)

Keep the authenticated route layout separate from the public auth layout. Use the current Next.js approach for route protection and server-side data access; do not rely on middleware/proxy checks alone.

**Acceptance criteria**
- A new user can register.
- A registered user can sign in.
- A signed-in user remains signed in across reloads.
- A user can sign out.
- An unauthenticated visitor cannot access `/dashboard` or protected data.
- An authenticated user is redirected away from sign-in/sign-up where appropriate.
- Errors are understandable and do not leak sensitive implementation details.

---

# 5. Prompt — build photographer profile setup and save the profile ✅

Read the shared brief and visual-system skill. Implement a first-time photographer profile setup flow that runs after successful account creation when the user has not completed their profile.

## Required fields

- Display name — required.
- Logo or avatar — optional image upload.
- Contact/WhatsApp number — optional; clearly label the expected international format and normalise it safely.
- Booking CTA — optional label and destination URL. Example default label: `Check availability`. Do not invent a destination URL.

Do not force photographers to provide a logo, phone number, or booking link just to reach the dashboard. Make the minimum required step obvious and let users add optional details later.

## UX structure

Use a two-column desktop layout:
- Main column: concise form with grouped fields and helper text.
- Secondary column: live profile preview card showing how the photographer's identity and booking CTA may appear in a future gallery.

On mobile, stack the preview below the form or make it collapsible. Do not make the user scroll horizontally.

Suggested copy:
- Heading: `Set up your photographer profile`.
- Supporting text: `Add the details clients should see when they receive a gallery from you.`
- Required field label: `Display name`.
- Optional field labels: `Logo or profile photo`, `WhatsApp number`, `Booking button text`, `Booking link`.
- Primary CTA: `Save and continue`.
- Secondary action: `Skip optional details`.

## Form behaviour

- Validate with a shared Zod schema on the server and, where useful, mirror it client-side.
- Trim whitespace and normalise inputs.
- Validate booking URLs and reject unsafe schemes such as `javascript:`.
- Validate image MIME type and size before upload; revalidate on the server.
- Make upload progress and failure states clear.
- Allow replacing/removing a selected logo/avatar.
- Preserve entered values after validation errors.
- Prevent duplicate submissions.
- Provide an accessible live preview without introducing unnecessary animations.

## Data behaviour

- Associate the profile with the currently authenticated user on the server. Never accept an arbitrary `user_id` from the browser as ownership proof.
- Use an idempotent create-or-update operation so refreshing or retrying does not create duplicate profiles.
- Save `setup_completed_at` only after the minimum required information is valid and persisted.
- Ensure a user cannot update another user's profile by changing a request ID.
- After a successful save, navigate to `/dashboard`.

**Acceptance criteria**
- A new user is prompted to complete the profile.
- Display name is required; optional fields can be skipped.
- The profile is persisted and linked to the authenticated account.
- The profile preview updates as the form changes.
- The user reaches the dashboard after saving.
- A returning user with a completed profile is not repeatedly forced through onboarding.

---

# 6. Prompt — build the first protected dashboard and empty state ✅

Read the shared brief and visual-system skill. Build the first real photographer dashboard, not a generic admin template.

## Layout

Desktop:
- Restrained left sidebar, approximately 224–248px wide.
- Compact top bar with page context and account/avatar menu.
- Main content area with a comfortable reading width.

Mobile:
- Compact top bar and accessible navigation drawer or bottom navigation if it improves the experience.
- No persistent desktop sidebar squeezing the content.
- All actions remain reachable by keyboard and touch.

## Phase 1 navigation

Only include destinations that exist:
- Dashboard.
- Profile/settings.
- Sign out.

You may show future sections such as Galleries only as clearly disabled/coming-later navigation if the product strategy needs to signal direction. Prefer not to include inert controls.

## Dashboard first-visit content

Show a calm, welcoming empty state:
- Heading: `Your studio starts here` or similarly clear language.
- Supporting text: `Your profile is ready. When you create your first gallery, it will appear here.`
- A clear primary action to view/edit the photographer profile.
- A small visual cue using a Lucide outline icon or restrained line illustration—not a large generic stock illustration.
- A short three-step explanation of the future workflow only if it adds clarity: `Create a gallery → Share it with your client → Receive favourites and enquiries`.

Do not show fake gallery cards, sample client names, fake statistics, fake activity, or fabricated storage usage. The dashboard should look intentional even when the account is empty.

## Data behaviour

- Fetch the authenticated user's profile and gallery count securely on the server.
- Use the count only if the query is scoped and genuinely returns a value.
- Show a loading state only where needed; use the framework's streaming/loading conventions appropriately.
- Show a distinct error state if the dashboard cannot load its data.
- Include a useful profile-completion status only if it is based on saved fields.

**Acceptance criteria**
- The dashboard is protected.
- It identifies the signed-in photographer without leaking another user's data.
- The empty state appears when there are no galleries.
- The layout is consistent with the profile and authentication pages.
- No placeholder button falsely implies that gallery creation already works.

---

# 7. Prompt — configure private originals and controlled preview storage ✅

Read the shared brief. Inspect the current storage provider documentation and the project's bucket/policy state before changing anything.

Configure object storage for future photo delivery. Original files and preview files must be private by default.

## Suggested bucket separation

- `photo-originals` — private, full-resolution originals.
- `photo-previews` — private, resized/controlled preview renditions.
- `profile-assets` — private in Phase 1 unless a specific public-profile requirement is deliberately approved.

If the provider or current project uses a different recommended structure, explain the trade-off before implementing it.

## Object-key conventions

Use server-controlled paths scoped by owner and gallery, for example:

```text
{user_id}/{gallery_id}/{photo_id}/original.{ext}
{user_id}/{gallery_id}/{photo_id}/preview.webp
{user_id}/profile/{asset_id}.{ext}
```

Do not trust client-submitted storage paths as proof of ownership. Generate or validate object keys on the server.

## Access control

- Enable private bucket access.
- Write policies so a photographer can upload/read/delete only objects belonging to their own account and permitted gallery.
- Ensure changing a path or UUID in a browser request cannot access another photographer's file.
- Use short-lived signed URLs or an authenticated server-side delivery endpoint for previews when a client is authorised to view them.
- Never make originals publicly readable.
- Never expose the service-role key to the browser.
- Do not treat an unguessable URL as a complete authorization strategy.
- Keep client-gallery access out of Phase 1 until a gallery password/token/recipient authorization model is designed.

## Upload and preview controls

For profile assets, apply a reasonable maximum file size and allow only explicitly supported image MIME types. Do not trust the filename extension alone. Generate safe object names and store metadata.

For future photo previews, document the planned resize, format, quality, and watermark strategy, but do not claim image processing exists until it has been implemented. Do not serve a full-resolution original as a preview fallback.

## Verification

Add automated or repeatable security checks demonstrating:
- Photographer A cannot read Photographer B's original.
- Photographer A cannot read Photographer B's preview.
- Unauthenticated users cannot read private objects.
- A signed preview URL expires according to the configured expiry.
- A modified object key does not bypass authorization.

Document any provider dashboard steps still required. Do not claim the buckets or policies are live until verified against the actual project.

---

# 8. Prompt — environment configuration, error handling, and logging

Read the shared brief and inspect the existing configuration before editing.

Create a reliable environment configuration layer:
- `.env.example` with every required variable name and safe placeholder values.
- Runtime environment validation using Zod or an equivalent small validation layer.
- Separate public variables from server-only secrets.
- Fail clearly during server startup/build when required configuration is missing, without printing secret values.
- Ensure browser bundles can only access explicitly public variables.
- Document local, test, preview, and production configuration expectations.

Create a small shared error-handling approach:
- Typed application errors for expected user-facing failures.
- Safe generic messages for unexpected server errors.
- Consistent error boundaries or route-level error pages where appropriate.
- Structured logs with request correlation where practical.
- No passwords, tokens, cookies, signed URLs, private image paths, or unnecessary personal information in logs.

Provide useful states for network failures, auth failures, validation errors, upload failures, and missing configuration. Do not silently swallow errors and do not show raw stack traces to end users.

**Acceptance criteria**
- Missing required environment variables produce a clear actionable error.
- Secret values are never printed or bundled client-side.
- Expected errors are distinguishable from unexpected failures.
- Logging is useful for debugging without exposing private user data.

---

# 9. Prompt — create privacy, terms, and copyright/takedown pages

Read the shared brief and visual-system skill. Build three simple, readable public legal-information pages that use the same typography, spacing, navigation, and footer rules as the rest of the product:

- `/privacy`
- `/terms`
- `/copyright`

These pages are a product and engineering starting point, **not legal advice and not a claim of legal compliance**. Do not invent a company legal name, postal address, registration number, contact email, retention period, subprocessors, or contractual promises. Use clearly marked placeholders wherever the operator must provide verified information.

## Privacy page structure

Prepare sections for:
- Who operates the service and how to contact them.
- Categories of account and profile data collected.
- Photo and gallery data processed by the service.
- Enquiry and communication data.
- Purposes and legal bases to be confirmed by the operator and legal adviser.
- Storage, hosting, authentication, analytics, and other processors actually used.
- International transfers, if applicable.
- Retention and deletion approach.
- User rights and how to submit a request.
- Security overview without making absolute guarantees.
- Cookie and tracking practices that match the actual implementation.
- Effective date and change history.

## Terms page structure

Prepare sections for:
- Eligibility and account responsibilities.
- Photographer ownership and responsibility for uploaded content.
- Client access and permitted use of galleries.
- Prohibited content and misuse.
- Intellectual property and platform licence needed to operate the service.
- Service availability and acceptable limitations.
- Account suspension and termination.
- Deletion, export, and retention approach.
- Liability and warranty sections for legal review.
- Governing law and jurisdiction placeholders to be completed by counsel.
- Contact details and effective date.

## Copyright/takedown page structure

Explain a clear process for reporting allegedly infringing material. Include fields/instructions for:
- Reporter contact details.
- Identification of the original copyrighted work.
- Exact URL or gallery/photo identifier of the allegedly infringing content.
- Explanation of the claim and authority to submit it.
- Good-faith statement and accuracy declaration, subject to legal review.
- How the platform will acknowledge, assess, restrict, or restore material.
- A counter-notice or dispute route where legally appropriate.
- A verified contact method placeholder.

Use plain language. Do not imply that submitting a form automatically proves infringement. In Phase 1, a well-designed information page with a clearly labelled contact placeholder is enough; do not create a fake takedown workflow.

**Acceptance criteria**
- All three pages render and are navigable.
- The layout is readable on mobile and desktop.
- Placeholders are obvious to the operator and not disguised as real legal details.
- No unsupported privacy, security, or legal-compliance claims appear.

---

# 10. Prompt — complete Phase 1 integration and acceptance testing

Read the shared brief and the visual-system skill. Review all Phase 1 work as one connected product, not as isolated tickets.

Run a complete quality and security review for this user journey:

1. A new visitor opens the product.
2. The visitor creates an account.
3. The visitor completes email confirmation if required.
4. The user signs in.
5. The user is prompted to complete the photographer profile.
6. The user enters a display name and optionally adds a logo/avatar, WhatsApp number, and booking CTA.
7. The profile is saved once and linked to the authenticated identity.
8. The user reaches the protected dashboard.
9. The dashboard shows the intentional no-galleries empty state.
10. The user refreshes the page and remains authenticated.
11. The user signs out and can no longer access the dashboard.

## Required test coverage

- Authentication happy paths and important failure paths.
- Protected-route access when signed out.
- Server-side identity and profile ownership checks.
- Profile form validation and persistence.
- Duplicate submission and retry behaviour.
- RLS isolation between two photographer accounts.
- Storage policy isolation for originals, previews, and profile assets.
- Invalid or missing environment variables.
- Responsive layout at mobile, tablet, and desktop sizes.
- Keyboard navigation, labels, visible focus, and error announcements.
- Legal pages render and contain no unfilled fake identity/contact details beyond clearly marked placeholders.

Use automated tests for repeatable behaviour. If a test needs a real Supabase project, mark it as an integration test and document the required test credentials and setup. Never commit live credentials.

## Final review checklist

- No dead navigation or buttons.
- No fake galleries, stats, users, or customer activity.
- No public original-photo bucket.
- No service-role key in client code.
- RLS enabled on exposed tables.
- All profile writes derive ownership from the authenticated server identity.
- No raw exception messages shown to users.
- No inconsistent colours, typography, radii, spacing, or icon styles.
- No avoidable horizontal overflow on mobile.
- No console errors or avoidable accessibility warnings.

Run lint, type-check, tests, and production build. Fix issues rather than merely listing them. Report any tests that could not run and why.

**Phase 1 is complete only when the acceptance journey works end to end and the security boundaries have been verified.**

---

# Suggested execution order

1. Repository inspection and foundation.
2. Shared visual system and reusable UI primitives.
3. Database schema and RLS.
4. Authentication and protected routes.
5. Photographer profile setup.
6. Dashboard empty state.
7. Private storage configuration.
8. Environment validation, logging, and error handling.
9. Privacy, terms, and copyright pages.
10. End-to-end acceptance and security testing.

The visual-system skill should be read before every UI task. Database and storage tasks should be implemented and verified before treating profile or future gallery data as secure.
