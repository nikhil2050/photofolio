# Phase 2 — Gallery Management & Client Delivery

**Product:** Photographer Portfolio & Client Gallery Platform  
**Phase objective:** Deliver the first complete photographer-to-client workflow. A photographer can create a gallery, upload and organise photographs, publish a secure share link, and let a client view the work in a polished, branded experience. Clients can favourite photographs and contact the photographer from the gallery.

> **How to use this document:** Complete the prompts in order. Use Prompt 0 first, then implement one prompt at a time. Do not paste the entire document into a coding agent as one giant implementation request. Each prompt is designed to be independently actionable while preserving the shared architecture and design rules.

---

# A. Product and design direction

## 1. Phase 2 product definition

Phase 2 turns the Phase 1 foundation into a usable client-delivery product.

### Primary user journey

1. Photographer signs in and reaches the dashboard.
2. Photographer creates a new gallery and enters its basic details.
3. Photographer uploads multiple photographs.
4. The platform validates uploads and prepares private preview sizes.
5. Photographer organises photographs, chooses a cover image and reviews the gallery.
6. Photographer publishes the gallery and copies a secure share link.
7. Client opens the link without creating an account. If the gallery is password-protected, the client enters the password.
8. Client views the photographs in a branded, responsive gallery, opens a larger lightbox view and favourites selected photographs.
9. Client can use the photographer's configured contact/booking CTA or submit an inquiry.
10. Photographer can see the inquiry and the client's favourite selections in the dashboard.

### In scope

- Gallery creation, editing, listing, archiving and deletion.
- Gallery states: `draft`, `published`, and `archived`.
- Gallery metadata: title, client/event label, description, event date, optional location, cover photograph and access mode.
- Multi-photo upload with progress, validation, failure handling and retry.
- Private original storage and controlled preview/thumbnail assets.
- Photo ordering, selection, cover selection, basic caption/alt text and deletion.
- Share links using high-entropy, revocable tokens.
- Optional password protection for a shared gallery.
- Responsive, branded, client-facing gallery.
- Lightbox/photo viewer with keyboard accessibility.
- Anonymous client favourites, with no client account required.
- Contact/booking CTA and inquiry form.
- Basic photographer inquiry list and favourite summary.
- Security, privacy, accessibility, performance and documentation tests.

### Explicitly out of scope for Phase 2

Do not build these unless the product owner explicitly changes the scope:

- Original-file downloads or download permissions UI.
- Watermark editor or per-gallery watermark customisation.
- RAW photo format support (NEF, CR2, ARW, DNG and similar).
- Video delivery.
- AI image tagging, face recognition, AI culling or automated image sorting.
- Custom domains and fully custom client themes.
- Paid plans, subscriptions, payment collection or invoices.
- Print ordering or print-shop integrations.
- Email campaigns, automated reminders or marketing automation.
- Advanced analytics, heatmaps or tracking pixels.
- Client accounts, team accounts or multi-photographer organisations.
- Comments, annotations, approval workflows and advanced proofing rounds.
- Offline gallery access.

Do not build future functionality as fake buttons or disabled controls presented as if they are ready. It is better to omit a feature until it is implemented.

## 2. Product positioning and UX principles

The product replaces an impersonal file-sharing link with a branded delivery experience. The photographer should feel in control; the client should feel that the gallery was prepared especially for them.

Use this value proposition as the internal design reference:

> **A more personal way to deliver photography.** Beautiful, private galleries that keep the photographer's brand attached to every delivery and make it easy for clients to respond.

UX principles:

- Reduce the number of decisions required to publish a gallery.
- Make the next action obvious on every screen.
- Keep upload status and access status understandable without technical terminology.
- Do not make clients register for an account just to view photographs or favourite them.
- Do not place dashboard-style charts, statistics or marketing clutter inside the client gallery.
- Keep the photographer's logo/name and contact action visible but quiet.
- Never sacrifice image quality or privacy for a decorative effect.
- Use truthful product copy. Do not invent customer counts, testimonials, performance claims or activity.

## 3. Shared visual direction — Warm Editorial Minimalism

The current project skill remains the design source of truth:

`.agents/skills/photofolio-visual-system/SKILL.md`

Do not introduce a new palette or visual identity in Phase 2. Continue the existing warm editorial palette:

| Token                | Value     | Use                                                  |
| -------------------- | --------- | ---------------------------------------------------- |
| `--background`       | `#F7F5F0` | Warm app/gallery canvas                              |
| `--surface`          | `#FFFFFF` | Forms, menus, panels                                 |
| `--surface-muted`    | `#EFEBE4` | Quiet secondary surfaces                             |
| `--foreground`       | `#242421` | Main text and primary button                         |
| `--muted-foreground` | `#6F6A63` | Descriptions and metadata                            |
| `--accent`           | `#A66F52` | Restrained terracotta highlight                      |
| `--accent-strong`    | `#8D5B43` | Stronger accent text/action where contrast is needed |
| `--border`           | `#E5E0D8` | Borders and separators                               |
| `--ring`             | `#6F817E` | Focus ring                                           |
| `--success`          | `#456B56` | Success state                                        |
| `--warning`          | `#926B35` | Warning state                                        |
| `--destructive`      | `#A44840` | Destructive/error state                              |

Typography:

- DM Sans (or the font already established by Phase 1) for all product UI, labels, controls and body copy.
- Cormorant Garamond only for rare editorial display moments if the shared skill already permits it. Do not use it for controls or dense metadata.
- Use a small, consistent type scale. Avoid decorative all-caps labels and very light text weights.

Visual treatment:

- Large, well-composed photographs are the primary visual element.
- Use generous whitespace, subtle separators and restrained 8–16px corner radii.
- Avoid heavy shadows, thick borders, gradient overlays, glassmorphism, neon colours, 3D illustrations and generic SaaS illustrations.
- Avoid putting every item in a white card. Use the warm canvas to create breathing room.
- Use Lucide outline icons consistently. Do not mix emoji, filled icons and multiple icon families in the interface.
- Use real, licensed sample photography only for explicitly labelled demo content. Do not make demo imagery look like actual customer content.

## 4. Phase 2 visualization and reusable UI components

Build these as reusable components where they have repeated use. Reuse the existing UI foundation from Phase 1 instead of duplicating components.

| Component               | Visual direction                                                            | Purpose                        |
| ----------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| `GalleryCard`           | Large photographic cover, quiet metadata, small text status                 | Gallery library                |
| `GalleryStatus`         | Small text + restrained icon; no oversized coloured badge                   | Draft/published/archived state |
| `GalleryForm`           | Clean vertical form with short helper text                                  | Create/edit gallery            |
| `UploadDropzone`        | Thin dashed border, upload icon, concise supported-format note              | Photo upload                   |
| `UploadQueue`           | Filename, progress bar, status and retry/remove action                      | Batch upload feedback          |
| `PhotoGrid`             | Image-led grid with calm gutters and subtle hover actions                   | Photographer management        |
| `PhotoSelectionToolbar` | Compact contextual bar, appears only when selected                          | Bulk photo actions             |
| `PhotoCoverMarker`      | Small unobtrusive label/icon                                                | Indicate cover photo           |
| `GallerySharePanel`     | Readable share URL, copy action, access state, password controls            | Publishing/sharing             |
| `PasswordGate`          | Centered minimal form, gallery/photographer identity, no unnecessary detail | Protected client gallery       |
| `ClientGalleryHeader`   | Photographer identity, gallery title and quiet contact CTA                  | Client experience              |
| `ClientPhotoGrid`       | Spacious, responsive, image-first layout                                    | Photo viewing                  |
| `PhotoLightbox`         | Large image, quiet controls, close/next/previous, favourite                 | Focused viewing                |
| `FavouriteButton`       | Heart outline; filled state only when selected                              | Client favourites              |
| `FavouriteSummary`      | Real count and photo list/filter                                            | Photographer proofing view     |
| `InquiryForm`           | Minimal name/email/message form with clear consent                          | Lead capture                   |
| `GalleryEmptyState`     | Simple line icon and useful next step, no generic illustration              | Empty states                   |
| `GallerySkeleton`       | Neutral image-shaped placeholders                                           | Loading states                 |

### Icon guidance

Use Lucide icons such as `images`, `image-plus`, `upload-cloud`, `camera`, `heart`, `lock-keyhole`, `link`, `copy`, `eye`, `eye-off`, `arrow-up-down`, `grip-vertical`, `more-horizontal`, `external-link`, `message-circle`, `mail`, `check`, `alert-circle`, `refresh-cw`, and `trash-2`. Verify exact icon availability in the installed package. Use icons as supporting cues, not as decoration.

### Photographer dashboard composition

- Keep the Phase 1 dashboard shell and navigation consistent.
- The Gallery page should have a clear title, one primary action (`Create gallery`), and a compact filter/search row.
- Use a responsive grid of gallery cards with a meaningful cover photograph. Cards should show title, client/event label when provided, photo count based on real records, updated date and status.
- Do not display fabricated analytics or pretend galleries. A new account should show a designed empty state with one primary action.
- Avoid a dense file-manager table as the default experience. Photography should be visible in the gallery library.

### Gallery editor composition

- Use a clear title and compact metadata form.
- Keep editing sections grouped: Details, Photos, and Sharing.
- Prefer progressive disclosure for advanced sharing settings.
- Make save/publish state explicit. Warn about unsaved changes if navigation would discard edits.
- Keep destructive operations separated from routine actions.

### Client gallery composition

- Do not show the photographer's application sidebar or dashboard UI.
- Use a calm, public-facing layout with photographer logo/avatar/name, gallery title and optional event date/description.
- Keep the contact/booking CTA visible but secondary to the photographs.
- Use a responsive photo grid with generous gutters. Preserve each photo's natural aspect ratio by default; do not aggressively crop faces or important subjects to force uniform tiles.
- A lightbox should focus on one image with minimal controls. It must support keyboard and touch interactions.
- Keep photo selection/favourite controls discoverable but visually quiet.
- The client should understand whether their favourite selection has been saved.

### Empty, loading, success and error states

Design all states intentionally:

- Empty gallery: explain that no photographs have been added and offer `Upload photos`.
- Uploading: show per-file and overall progress where available.
- Processing: distinguish upload completion from preview processing.
- Partial failure: preserve successful uploads and allow failed items to retry.
- Published: explain that the share link is ready.
- Revoked/archived gallery: explain that the link is no longer available without exposing private details.
- Password error: use a neutral message; do not reveal whether a token or gallery exists.
- Network interruption: preserve recoverable state and provide retry.
- Inquiry success: confirm that the request was sent; do not promise an email notification unless one is actually configured.

---

# B. Shared instructions to include in every implementation prompt

The following rules apply to all prompts below:

1. Read `AGENTS.md`, `AI_CONTEXT.md` if it exists, the relevant Phase 1 implementation notes, and `.agents/skills/photofolio-visual-system/SKILL.md` before coding.
2. Inspect the actual codebase and installed package versions before editing. Do not assume that a route, table, component or policy exists merely because it is mentioned in documentation.
3. Keep frontend and backend in the same Next.js repository using the existing modular-monolith structure. Do not create a separate backend repository or duplicate API server.
4. Keep UI, feature/business logic and data access separated. Follow existing naming and folder conventions.
5. Use the existing Supabase project for PostgreSQL, Auth and Storage. Do not introduce a second database or storage provider without an explicit decision.
6. Use server-side authorization and server-side validation. Client-side checks are for UX only and never replace server checks.
7. Never expose the Supabase service-role key, storage secrets, database credentials or private originals in browser code.
8. Treat all uploaded files, filenames, metadata, form values and URL parameters as untrusted input.
9. Do not store permanent signed URLs in database records. Store private object paths and create short-lived URLs only after authorization.
10. Reuse existing UI components and shared tokens. Do not hardcode new colours, radii, shadows, typography or spacing values in individual pages.
11. Add meaningful beginner-friendly comments for complex business/security logic. Explain why a security decision exists; do not add comments to obvious code.
12. Do not leave dead buttons, fake progress, mock records or TODO-only implementations presented as finished functionality.
13. Add tests for important business behaviour and authorization boundaries. Run the relevant lint, type-check, tests and build commands.
14. Update `AI_CONTEXT.md`, `API.md` and `README.md` when they exist and are affected. If they do not exist, do not silently create a conflicting documentation scheme; report the missing file and follow the repository's current documentation convention.
15. Before finishing, report changed files, migrations, environment/configuration requirements, tests run, test outcomes and remaining limitations.

---

# C. Implementation prompts

# Prompt 0 — Phase 2 repository audit and implementation plan ✅

**Paste this prompt first. Do not start feature implementation until the audit is complete.**

```text
We are starting Phase 2: Gallery Management & Client Delivery for the Photographer Portfolio & Client Gallery Platform.

Read AGENTS.md, AI_CONTEXT.md if present, phase-1-prompts.md, and .agents/skills/photofolio-visual-system/SKILL.md. Then inspect the current repository and actual Supabase migrations/configuration.

Our required architecture is one Next.js + TypeScript repository using a modular monolith. Frontend routes, server actions/route handlers, feature services, validation, and data-access code stay in this repository. Supabase is the existing provider for PostgreSQL, authentication and private object storage.

Phase 2 outcome:
A photographer can create and manage a gallery, upload and organise photographs, publish a secure share link, and let a client view a branded responsive gallery without creating an account. Clients can favourite photos and contact the photographer. The photographer can see favourites and received inquiries.

Before coding:
1. Identify which Phase 1 features are actually implemented and working.
2. List the current tables and columns for users, photographer_profiles, galleries, photos, favourites and inquiries. Inspect migrations, not just AI_CONTEXT.md.
3. Inspect current RLS policies and Storage bucket policies.
4. Identify current route structure, feature modules, service/data-access patterns, UI components, form validation, error handling and test setup.
5. Identify existing design tokens and compare them with the shared visual-system skill.
6. Identify the current deployment/runtime assumptions relevant to image processing and direct file uploads.
7. Identify documentation files and the current implementation status.

Produce:
- A concise current-state audit.
- A proposed Phase 2 task sequence with exact files/modules likely to change.
- Any additive database migrations required.
- Security risks or missing controls.
- External dashboard setup or environment variables that may be needed.
- Tests that will prove the feature works.

Do not implement features in this prompt. Do not replace existing architecture, rewrite working Phase 1 code, or assume a technology is installed. Flag conflicts before proceeding. If no critical blocker exists, recommend proceeding with Prompt 1.
```

**Deliverable:** An implementation plan grounded in the repository, not an assumed architecture.

---

# Prompt 1 — Database model, migrations and access-control foundation ✅

```text
Implement the Phase 2 database and access-control foundation for gallery delivery.

First inspect the existing schema and migrations. The Phase 1 tables may already exist. Do not recreate tables or reset data. Create additive, reversible/versioned migrations that safely extend the current schema.

A. Galleries
Ensure the gallery model can represent:
- owner/photographer reference;
- title;
- optional client or event label;
- optional description;
- optional event date and location;
- status: draft, published or archived;
- selected cover photo reference, nullable until selected;
- access mode: unlisted share link or password-protected share link;
- high-entropy share-token hash, not the raw share token;
- password hash when password protection is enabled;
- published_at and archived_at timestamps as appropriate;
- created_at and updated_at.

Do not use a predictable gallery ID or title slug as the only access secret. A gallery's database UUID is not a public access token.

B. Photos
Ensure the photo model can represent:
- gallery reference;
- original object path in private storage;
- preview object path in private storage;
- thumbnail object path in private storage;
- sanitised original filename for display only;
- MIME type and byte size;
- width and height;
- sort order;
- optional alt text/caption;
- processing state: pending, processing, ready or failed;
- processing error code/message safe for display (never credentials or internal paths);
- created_at and updated_at.

Store object paths, not public or signed URLs. Do not store a signed URL in the database.

C. Favourites
Support a client who is not registered. Implement a privacy-conscious anonymous visitor identity. Prefer a random opaque visitor identifier held in a Secure, HttpOnly, SameSite cookie and validated server-side. Store only the minimum identifier needed; consider storing a hash rather than the raw cookie value. Enforce a unique constraint so one visitor cannot create duplicate favourites for the same photo. Each favourite must be scoped to a photo and its gallery.

D. Inquiries
Ensure an inquiry can be linked to:
- the photographer receiving the inquiry;
- the source gallery, when submitted from a gallery;
- client's name;
- client's email;
- message;
- consent/acceptance field only where legally and operationally needed;
- status such as new/read/archived if the current product needs a simple inbox;
- created_at.

Do not collect unnecessary personal information. Do not store IP addresses or device fingerprints unless a documented security requirement exists.

E. Constraints and indexes
- Add foreign keys and deliberate on-delete behaviour.
- Add check constraints for statuses and access modes.
- Add indexes for owner_id, gallery_id, status, created_at and common list/filter queries.
- Ensure a cover photo belongs to the same gallery before it can be assigned. Enforce this in trusted server logic and, where practical, with database constraints/triggers.
- Add updated_at handling consistently.
- Keep enum/check-constraint strategy consistent with the existing schema.

F. Row Level Security and storage security
- Photographers can manage only galleries they own.
- A photographer can manage photos only through a gallery they own.
- A photographer can see favourites only for galleries they own.
- A photographer can see inquiries addressed to their own profile/account.
- Anonymous clients must not receive direct broad SELECT access to application tables.
- Public gallery delivery must use a trusted server-side access layer that verifies the share token/password before reading the gallery and generating signed preview URLs.
- Storage policies must ensure private objects cannot be listed or downloaded by arbitrary users. Use owner/gallery-scoped object paths and verify the relationship with the database.
- Never solve public client access by making the originals or whole storage bucket public.
- Never expose a service-role client to the browser.

G. Share token and password security design
- Generate share tokens using a cryptographically secure random generator with at least 128 bits of entropy; prefer 256 bits.
- Store a cryptographic hash of the token and compare safely on the server.
- Support token rotation/revocation.
- Hash gallery passwords with a suitable password-hashing algorithm and unique salt. Never store plaintext passwords or reversible encrypted passwords.
- Add protection against repeated password attempts. Use the project's existing rate-limiting infrastructure if present. If none exists, propose a production-suitable abstraction and clearly identify any development-only limitation rather than pretending an in-memory limiter is sufficient across multiple instances.

H. Deliverables
- SQL migration(s).
- Updated generated TypeScript database types if the project uses them.
- Updated data-access functions and policy tests as appropriate.
- A schema/relationship note in AI_CONTEXT.md.
- An update to API.md if this work adds or changes API contracts.

Do not implement the complete UI in this prompt.

Acceptance criteria:
1. Migrations apply to a clean local/test database and safely extend an existing database.
2. An authenticated photographer cannot read or modify another photographer's galleries or photos.
3. An anonymous request cannot query private photo rows or storage objects directly.
4. Favourites and inquiries are associated with the correct gallery and photographer.
5. No raw share token, password or permanent signed URL is stored in the database.
6. Automated tests cover the key RLS and ownership boundaries.
```

**Design note:** The security UI should remain calm. Show access state in plain language such as “Anyone with the private link” or “Password required”. Avoid technical labels such as “token mode”.

---

# Prompt 2 — Photographer gallery library and gallery creation flow ✅

```text
Build the photographer-facing Gallery Library and Create Gallery flow.

First inspect the existing dashboard shell, navigation, profile, data-access services and shared components. Reuse the Phase 1 layout and the Photofolio visual-system skill. Do not create a second dashboard design.

A. Gallery Library route
Create the authenticated gallery-management route using the repository's route conventions.

The page must include:
- Page title: “Galleries”.
- Short supporting text explaining that galleries are where the photographer organises and shares client photographs.
- One clear primary action: “Create gallery”.
- Compact search by gallery title/client label if the data model supports it.
- Simple filters for All, Draft, Published and Archived.
- A responsive visual grid of GalleryCard components.

Each card should display only real available information:
- cover photograph or restrained placeholder;
- gallery title;
- client/event label when provided;
- status;
- number of ready photographs;
- last updated date.

Do not invent views, revenue, engagement or photo counts. Do not show fake demo galleries in the real photographer account.

B. Empty state
For a photographer with no galleries:
- use the warm canvas and a simple line icon (for example images or camera);
- headline: “Your first gallery starts here” or similarly plain language;
- one short sentence explaining the value;
- one primary “Create gallery” button.
Do not use a cartoon photographer, gradient illustration or a large decorative graphic.

C. Create gallery flow
Create a focused form with:
- Gallery title (required).
- Client or event name (optional).
- Description (optional, with a sensible character limit).
- Event date (optional).
- Location (optional).

Keep the first step short. Do not ask for the password, cover image, social metadata or other advanced settings during the initial creation step. Those can be configured when editing/sharing the gallery.

On submission:
- validate with the project's existing Zod/server-validation pattern;
- create a draft gallery owned by the authenticated photographer;
- set safe defaults;
- redirect to the new gallery editor/photo-upload step;
- show a clear success state.

D. Gallery card actions
Provide a quiet overflow menu with actions supported by the current status, such as Open/Edit, Copy link (published only), Archive, Restore to draft (if supported), and Delete. Confirm destructive actions. Do not include nonfunctional menu items.

E. Search, filters and pagination
- Filters must reflect actual data.
- Search must be debounced only if useful; keep keyboard behaviour accessible.
- Paginate or progressively load if a photographer can have many galleries.
- Preserve filter/search state when returning from the editor where practical.

F. Server architecture
- Use a server component for initial authenticated data loading where appropriate.
- Use server actions or route handlers for mutations, following the project's established convention.
- Put authorization and database operations in the data-access/service layer, not inside visual components.
- Verify ownership on every read and mutation.
- Use optimistic updates only where rollback/error behaviour is correct.

G. Responsive behaviour
- Desktop: comfortable content width and 3-column gallery card grid where space permits.
- Tablet: 2-column grid.
- Mobile: 1-column or compact 2-column layout only if cover images and text remain legible.
- Keep primary action reachable without a huge sticky header.

Acceptance criteria:
1. A photographer can create a draft gallery.
2. The new gallery appears in the correct owner's library.
3. Search and status filters return correct results.
4. Another photographer cannot see or manipulate the gallery.
5. Empty, loading, error and populated states are designed.
6. Mobile and desktop layouts follow the shared skill.
```

---

# Prompt 3 — Secure multi-photo upload and image processing pipeline ✅

```text
Implement the gallery photo-upload workflow. This is a core product capability, so prioritise reliability, privacy and clear feedback over visual effects.

First inspect Phase 1 storage configuration, Supabase client setup, deployment runtime and any existing upload utilities. Use the existing private storage foundation. Do not make a bucket public.

A. Supported files and validation
For the first MVP, support standard browser-friendly image formats only, such as JPEG, PNG and WebP. Do not claim RAW or HEIC support unless the actual upload and processing pipeline is verified for those formats.

- Define configurable maximum file size and maximum batch size/concurrency. Choose sensible defaults for the current deployment and document them.
- Validate file extension, declared MIME type, actual file signature/magic bytes, byte size and image decodability. Do not trust the browser's MIME type.
- Reject SVG and executable or non-image files.
- Sanitise the original filename for display only. Never use a user-supplied filename as the storage object key.
- Generate random object names/UUIDs and scope paths to owner and gallery.
- Prevent path traversal and filename collision.
- Give the user a clear explanation when a file is rejected.

B. Upload architecture
- Prefer direct browser-to-private-storage uploads using short-lived, server-authorised upload permissions/URLs so large files do not need to pass through a Next.js server request body.
- The server must verify the signed-in photographer owns the target gallery before issuing upload permission.
- Create a pending photo/upload record with a generated ID and expected metadata before or as part of the upload protocol.
- Upload originals to a private originals location.
- Confirm the upload on the server and verify that the expected object exists and matches allowed constraints.
- Handle cancellation, retry, duplicate submission and partial failure safely.
- Limit concurrent uploads to avoid exhausting browser connections or processing resources.
- Do not mark an upload as complete until the storage operation has succeeded and the server has validated it.

C. Upload UI
Create reusable `UploadDropzone` and `UploadQueue` components.

The dropzone should:
- accept click-to-select and drag-and-drop;
- explain allowed formats and maximum file size;
- show a clear hover/focus/drop state;
- work with keyboard and screen readers;
- avoid bright gradients or oversized illustrations.

The upload queue should:
- show a small thumbnail when safely available;
- show filename, size and progress;
- distinguish Uploading, Processing, Ready and Failed;
- show per-file retry/remove actions where appropriate;
- show a concise overall summary;
- preserve successful uploads if another file fails;
- never fake progress or display 100% before the operation completes.

D. Preview and thumbnail generation
- Keep the original photograph private and unchanged unless a documented privacy requirement requires a separate derivative.
- Generate controlled preview and thumbnail derivatives for display.
- Correct image orientation using EXIF orientation data.
- Strip GPS and other unnecessary EXIF metadata from public/client-facing derivatives. Do not expose camera serial numbers or location metadata.
- Preserve aspect ratio and avoid aggressive crops by default.
- Use appropriate output formats/quality settings based on real browser support and image quality.
- Record width, height, generated object paths and processing state.
- Never expose the original object path or a permanent public URL to the client browser.

Check the target runtime before selecting the image-processing implementation. If using a native image library, verify that it works in the deployment runtime. Do not run CPU-heavy image processing in an unsuitable Edge runtime. Use a Node-compatible processing path or a clearly documented processing adapter. Bound concurrency and memory usage. If background jobs are not available in the current product, use a simple reliable processing strategy for the MVP and document its scaling limitation.

E. Failure recovery
- If original upload succeeds but preview generation fails, retain the original privately and mark processing failed.
- Allow an authorised photographer to retry processing without uploading the original again.
- If upload fails before completion, clean up pending records/partial objects safely.
- Avoid deleting a good original because a preview retry failed.
- Make cleanup idempotent so retries do not corrupt data.

F. Storage security
- Original and derivative buckets remain private.
- Validate owner/gallery relationship before creating, reading, replacing or deleting objects.
- Create short-lived signed read URLs only after a trusted server-side access check.
- Never send the service-role key to the browser.
- Do not persist signed URLs in database rows or logs.

G. Acceptance criteria
1. Photographer can upload a batch of supported images.
2. Upload progress reflects real upload state.
3. Invalid, oversized or malformed files are rejected safely.
4. Successful items remain available when another item fails.
5. Previews and thumbnails are generated and visible to the owner.
6. Public/client-facing derivatives do not expose GPS EXIF metadata.
7. Original files remain private and cannot be fetched by another photographer or an anonymous user without valid gallery access.
8. Processing failure can be retried without losing the original.
9. Tests cover ownership, file validation, upload completion and processing failure.
```

**Visual guidance:** The upload experience should feel like a quiet studio tool. A thin dashed outline and one upload icon are enough. Do not turn the upload screen into a brightly coloured cloud-storage dashboard.

---

# Prompt 4 — Photo grid, organisation and gallery editor ✅

```text
Build the photographer's gallery editor and photo-organisation workflow.

Use existing gallery and photo services. Re-check ownership in every server operation. Reuse the shared visual system.

A. Gallery editor layout
Organise the editor into clear sections or tabs:
- Details
- Photos
- Sharing

Keep the current section obvious. Do not add tabs for features outside Phase 2.

The header should show the gallery title, current status and one contextual primary action. For example, a draft with ready photos can show “Publish gallery”; a published gallery can show “View gallery” and “Copy link”.

B. Details section
Allow the photographer to edit:
- title;
- client/event label;
- description;
- event date;
- location.

Use server-side validation. Show saving/saved/error states. Avoid autosave unless it can be implemented with reliable conflict handling. A deliberate Save action is acceptable and clearer for the MVP.

C. Photo grid
- Display ready previews in a spacious responsive grid.
- Preserve natural aspect ratios by default.
- Do not crop photographs into uniform squares just to make the dashboard look tidy.
- Use subtle hover/focus actions for selection and overflow menus.
- Display processing/failed items with clear states and retry action.
- Show a meaningful empty state with an Upload photos action.

D. Photo actions
Support:
- select one or multiple photos;
- deselect photos;
- reorder photos;
- choose a cover photo;
- edit alt text/caption;
- remove a photo with confirmation.

For reordering:
- provide pointer drag-and-drop and a keyboard-accessible alternative;
- persist a stable sort order on the server;
- handle concurrent or repeated reorder requests safely;
- maintain visible order after refresh.

For cover selection:
- ensure the selected cover belongs to this gallery;
- show a small, restrained “Cover” marker;
- use a sensible fallback when no cover is selected (for example the first ready photo), but do not silently write a cover reference until the photographer chooses one unless that is a documented product rule.

For deletion:
- confirm destructive action;
- remove database reference and storage objects using a safe idempotent workflow;
- do not allow cross-gallery deletion;
- handle cleanup failures and avoid orphaned objects where possible.

E. Publishing readiness
Before enabling Publish, check:
- gallery has a valid title;
- at least one photo is in `ready` state;
- no required processing is pending or failed in a way that would make client delivery incomplete;
- the photographer has a usable profile identity/contact display according to the product rule.

Explain what needs attention. Do not silently publish an empty gallery.

F. Acceptance criteria
1. Photographer can edit gallery metadata.
2. Photographer can see all photo processing states.
3. Photographer can reorder photos and see the same order after refresh.
4. Photographer can select a cover photo and edit alt text/caption.
5. Photo deletion is confirmed and properly scoped.
6. Publish readiness is calculated from actual data.
7. All actions have loading, success and error feedback.
8. The editor works on desktop, tablet and mobile.
```

---

# Prompt 5 — Secure gallery sharing, publishing and access management ✅

```text
Implement publishing and secure sharing for a photographer's gallery.

This task establishes the boundary between the private photographer workspace and the public-facing client gallery. Treat it as a security-sensitive feature.

A. Share model
- A published gallery is reachable only through a high-entropy share token in the URL.
- Generate the token using a cryptographically secure random generator.
- Store only a cryptographic hash of the token in the database.
- Do not use the gallery UUID, numeric database ID, photographer email, or predictable title slug as the access secret.
- Do not expose a gallery-list endpoint to anonymous users.
- Keep the gallery out of search engine indexing with appropriate page metadata and response headers (`noindex`, `nofollow`, and equivalent directives as appropriate).

B. Publish flow
When a photographer publishes:
1. Verify authenticated identity and ownership server-side.
2. Verify the gallery passes publishing-readiness rules.
3. Generate a share token if one does not already exist, or preserve the existing token when republishing unless the photographer explicitly rotates it.
4. Store only the token hash.
5. Set status and published timestamp.
6. Return the share URL only to the authenticated owner.
7. Show a confirmation panel with Copy link and Preview gallery actions.

C. Access modes
Support:
- Link access: anyone with the unlisted share URL can view while the gallery is published.
- Password-protected access: the client must pass a password check before gallery content is returned.

Use plain-language labels. Explain that an unlisted link can be viewed by anyone who receives it; do not market it as equivalent to a login-protected private account.

D. Password protection
- Hash passwords using a suitable password-hashing algorithm.
- Never store or log plaintext passwords.
- Verify password server-side.
- Rate-limit repeated attempts.
- After successful verification, issue a short-lived signed, HttpOnly, Secure, SameSite cookie scoped to the gallery route (or another equally safe verified session mechanism).
- Do not place the password or a password-verification flag in localStorage, URL query parameters or client-readable cookies.
- Avoid revealing whether a gallery token exists when the password is incorrect.

E. Revocation and rotation
- Allow the owner to disable sharing/unpublish the gallery.
- Allow the owner to rotate the share link. The previous link must stop working after successful rotation.
- Archived galleries must not be accessible through an old public link.
- If a link is disabled or invalid, show a neutral unavailable screen without leaking gallery metadata or owner account information.

F. Sharing UI
Create a compact `GallerySharePanel` containing:
- current state (Draft / Published / Archived);
- current access mode in plain language;
- share link with Copy action when published;
- Preview gallery action;
- password setup/change controls when password protection is selected;
- Rotate link and Disable sharing actions with confirmation.

Do not show the raw share token in logs or analytics. Be careful not to leak it to third-party tracking systems.

G. Acceptance criteria
1. Only the owner can publish, unpublish, archive and rotate a gallery link.
2. A valid share link reaches the correct published gallery.
3. Invalid, revoked and archived links do not return gallery content.
4. Password-protected galleries do not return photo metadata or signed preview URLs before password verification.
5. Password attempts are rate-limited using a production-appropriate mechanism.
6. Old links stop working after rotation.
7. Public pages are not indexed.
8. Automated tests cover owner checks, token checks, password checks, revocation and archived status.
```

---

# Prompt 6 — Client-facing branded gallery and photo lightbox

```text
Build the public/client-facing gallery experience for valid published share links.

This is the product's most important visual surface. It should feel like receiving photographs from a thoughtful professional photographer, not browsing a generic cloud-drive folder.

Before coding, study the existing profile model and Photofolio visual-system skill. The client gallery must use the same underlying design tokens as the photographer dashboard, but its layout should give much more space to the photographs.

A. Public route and access
- Implement the share-token route following the existing Next.js route conventions.
- Verify token, published status and password access on the server before returning gallery metadata or signed preview URLs.
- Do not rely on a client-side route guard.
- Do not expose the original storage path, original image URL or private photographer account fields.
- Generate short-lived signed URLs for preview/thumbnail assets only after authorisation.
- Do not expose the Supabase service-role key or a privileged database client to the browser.

B. Gallery header
Display only the photographer profile fields intended for public use:
- logo/avatar if available;
- photographer display name;
- gallery title;
- client/event label when supplied;
- event date and description when supplied;
- one clear contact/booking CTA based on the photographer's configured profile.

Keep the identity area restrained. It should frame the work, not compete with it. Do not display private email/account settings unless explicitly configured as public.

C. Photo grid
- Use a responsive layout with generous but not wasteful gutters.
- Desktop: typically 3 or 4 columns depending on viewport width.
- Tablet: typically 2 or 3 columns.
- Mobile: normally 2 columns if images remain comfortably tappable; use one column when the composition needs more room.
- Preserve natural image aspect ratio by default.
- Do not crop faces or meaningful content to force a uniform grid.
- Reserve image dimensions to prevent layout shift.
- Lazy-load below-the-fold images.
- Use a restrained placeholder while an image loads.
- Do not render original images in the grid.
- Handle expired signed URLs by refreshing them through an authorised server flow; do not ask the client to reload the entire gallery unnecessarily.

D. Photo lightbox
Create a reusable, accessible `PhotoLightbox`:
- open when a client activates a photo;
- show the largest authorised preview available;
- include close, previous, next and favourite controls;
- support Escape to close and left/right arrow navigation;
- support touch swipe where reliable, without blocking normal page scrolling when not active;
- trap focus while open and return focus to the triggering photo after close;
- provide accessible labels and photo alt text;
- prevent background scrolling while open;
- keep controls visually quiet and discoverable.

E. Client navigation and status
- Show a subtle gallery progress/position indicator only if it genuinely helps (for example, “12 of 48”).
- Do not show a fake download button. Original downloads are out of scope for Phase 2.
- If there are no ready photos, do not show an empty public gallery as though it were complete; publishing readiness should prevent this state, but still handle it safely.
- Show a clear unavailable state for revoked, archived or invalid links without leaking private information.

F. Brand and marketing details
The product should make the photographer's identity feel present without turning the page into an advertisement. Use one contact CTA, not multiple competing buttons. Add an understated footer only if it supports trust or attribution and does not distract from the photographs.

G. SEO, social previews and privacy
- Add `noindex`/`nofollow` metadata and suitable response headers.
- Do not accidentally emit private gallery data into public metadata, static generation output or shared caches.
- Avoid static pre-rendering or caching authenticated/private gallery content in a way that can leak between users.
- If Open Graph previews are implemented, use only explicitly authorised preview content and do not expose private originals.

H. Acceptance criteria
1. Valid share link displays the correct gallery.
2. Password-protected content is hidden before verification.
3. Client gallery works without a client account.
4. Public page displays only approved photographer profile fields.
5. Original photographs remain inaccessible to clients.
6. Grid and lightbox work with keyboard, touch and screen readers.
7. Gallery is visually consistent with the product's warm editorial system.
8. Responsive behaviour is tested at mobile, tablet and desktop widths.
```

---

# Prompt 7 — Client favourites and photographer proofing view

```text
Implement anonymous client photo favourites and a simple photographer-facing favourites view.

The client must not need to create an account. Keep identity and data collection minimal.

A. Anonymous visitor identity
- Create or reuse a random opaque visitor identifier stored in a Secure, HttpOnly, SameSite cookie.
- Validate it server-side and scope favourite operations to a valid gallery session.
- Prefer storing a hash of the visitor identifier in the database.
- Do not use browser fingerprinting.
- Do not use localStorage as the sole security boundary.
- Explain in product documentation that favourites are associated with the visitor's browser/device in this MVP and may not sync across devices or browsers.

B. Client interaction
- Place a subtle outline heart control on each photo card and in the lightbox.
- Use a filled heart only for a selected favourite.
- Add a clear accessible label (for example, “Add to favourites” / “Remove from favourites”).
- Make the interaction responsive and avoid accidental opening of the photo when the favourite button is clicked.
- Show a small confirmation when a selection is saved or removed.
- Provide a “View favourites” filter or section if it can be done without cluttering the gallery.
- Ensure the favourite state is restored on refresh for the same browser identity.

C. Server and database rules
- Verify that the gallery is published, share token is valid, and password gate (if enabled) has been passed before changing favourites.
- Verify that the photo belongs to the gallery.
- Enforce uniqueness of visitor + gallery + photo.
- Make add/remove operations idempotent.
- Rate-limit abuse where appropriate.
- Never allow a visitor to favourite a photo in another gallery by altering a request parameter.

D. Photographer view
- Add a simple Favourites view or filter in the gallery editor.
- Show only favourites for galleries the signed-in photographer owns.
- Show actual favourite counts and photo selections.
- Do not expose the visitor's raw cookie identifier or unnecessary identifying information.
- Allow the photographer to review selected photos and understand which images a client has shortlisted.
- If the product cannot identify individual clients reliably, label the information honestly (for example “Visitor selections”) rather than inventing a client name.

E. Accessibility and privacy
- Heart state must not rely on colour alone; provide an accessible label and state.
- Respect keyboard interaction.
- Document anonymous favourite retention and deletion expectations.
- Avoid storing unnecessary personal information.

F. Acceptance criteria
1. Client can favourite and unfavourite a photo without creating an account.
2. Favourite state persists across refresh in the same browser.
3. A visitor cannot alter another gallery's favourites.
4. Duplicate favourites are prevented.
5. Photographer can see favourites only for owned galleries.
6. Favourite controls work in both grid and lightbox.
7. The UI remains calm and unobtrusive.
```

---

# Prompt 8 — Contact CTA, inquiry submission and photographer inquiry inbox

```text
Implement the gallery contact/booking action and a minimal inquiry-capture workflow. This completes the basic lead-generation loop for Phase 2.

A. Public contact CTA
Use the photographer profile's configured public contact/booking fields from Phase 1.
- If a WhatsApp number exists and is confirmed as public, provide a WhatsApp action using a correctly normalised international phone number.
- If a booking URL exists, provide a safe external booking link.
- If neither exists, show the inquiry form as the primary contact method.
- Do not invent a phone number, booking URL or contact method.
- Validate and render external URLs safely. Add appropriate `rel` attributes for new-tab external links.

B. Inquiry form
Create a simple form with:
- Name (required).
- Email (required).
- Message (required, with minimum and maximum length).
- Privacy/consent text with a link to the applicable privacy page. Only add a checkbox if a real consent basis is required by the product's legal design; do not add a decorative consent checkbox.

Keep the form focused. Do not ask for phone, address, budget or event details unless the product explicitly needs them.

C. Submission handling
- Validate all fields server-side with the existing Zod pattern.
- Normalise and validate email safely.
- Associate the inquiry with the correct photographer and source gallery.
- Use the verified gallery access context; do not trust a photographer ID supplied by the browser.
- Add an unobtrusive honeypot and rate limiting or another proportionate anti-spam measure.
- Ensure duplicate/replayed submissions are handled reasonably.
- Escape or safely render user-provided content in the dashboard.
- Return a generic success/error response that does not reveal private account information.
- Never send email notifications unless an email provider is configured, tested and intentionally included in this phase.

D. Photographer inquiry inbox
Create a basic authenticated Inquiries page or a compact gallery-level inquiry section.
- Show name, email, message preview, source gallery and created date.
- Support marking an inquiry read/unread or archiving it if the schema supports this.
- Provide a safe way to open/copy the email address.
- Do not expose inquiries belonging to another photographer.
- Use pagination or bounded queries.
- Include empty, loading, error and populated states.

E. Client confirmation
After successful submission, show a simple confirmation such as “Your message has been sent.” Do not promise a response time or email delivery that the platform cannot guarantee.

F. Acceptance criteria
1. The correct public contact action is shown based on configured profile data.
2. Inquiry is stored against the right photographer and source gallery.
3. Browser cannot choose a different photographer by modifying request values.
4. Spam and invalid submissions are constrained.
5. Photographer can view only their own inquiries.
6. Success and failure messages are accurate.
7. Tests cover validation, ownership, source-gallery association and abuse controls.
```

---

# Prompt 9 — Visual polish, responsive behaviour and accessibility audit

```text
Perform a dedicated visual and UX pass across all Phase 2 screens. Do not add new features during this task unless a missing state prevents a screen from being usable.

Read `.agents/skills/photofolio-visual-system/SKILL.md` and compare the implementation against it.

Review these surfaces:
1. Photographer Gallery Library.
2. Create/Edit Gallery form.
3. Photo upload dropzone and queue.
4. Photo grid and selection toolbar.
5. Gallery Sharing panel and password settings.
6. Client password gate.
7. Client Gallery header and image grid.
8. Photo Lightbox.
9. Client favourites interactions.
10. Inquiry form and photographer inquiry inbox.
11. All empty, loading, success, error, disabled and unavailable states.

Check and fix:
- inconsistent token use or one-off colours;
- inconsistent type scale and typography;
- cramped or excessive spacing;
- inconsistent control heights and corner radii;
- excessive borders, shadows or badges;
- unclear hierarchy or competing CTAs;
- image crops that damage the subject;
- missing loading dimensions and layout shift;
- mobile overflow or unusable controls;
- low contrast and missing focus rings;
- missing labels, accessible names or keyboard behaviour;
- hover-only actions that cannot be used on touch;
- excessive motion or motion that ignores reduced-motion settings;
- unclear upload, processing, publishing or favourite feedback.

Specific design direction:
- Keep the photographer dashboard calm and functional.
- Make the client gallery feel more editorial and spacious than the dashboard.
- Let photographs provide the visual interest. Remove decorative panels and unnecessary UI.
- Keep terracotta accents restrained.
- Use charcoal as the main primary-action colour, consistent with Phase 1.
- Keep the contact CTA secondary to the photographs.

Do not use randomly generated placeholders, fake gallery records or fabricated metrics. If a demo gallery is needed for design review, label it clearly as sample/demo data and keep it out of real user accounts.

Deliver:
- A list of UX issues found and fixed.
- Screenshots or a route-by-route verification note if browser tooling is available.
- Any remaining accessibility/performance issues.
- Updates to the shared skill if a reusable design rule was refined.
```

---

# Prompt 10 — Security, reliability, performance and end-to-end testing

```text
Run a Phase 2 release-readiness audit. Do not assume that a feature is secure because the happy path works.

A. Authentication and ownership
Test that:
- unauthenticated users cannot access photographer routes;
- photographer A cannot read/update/delete photographer B's galleries;
- photographer A cannot upload, reorder, replace or delete photographer B's photos;
- photographers cannot read another photographer's inquiries or favourites;
- server actions and route handlers re-check authorization on every mutation.

B. Share-link security
Test that:
- valid token + published gallery works;
- invalid token returns a neutral unavailable result;
- rotated/revoked tokens stop working;
- archived and unpublished galleries are unavailable;
- password-protected content is not returned before successful password verification;
- repeated password attempts are limited;
- tokens and passwords do not appear in logs, client bundles, analytics or error messages.

C. Storage and image privacy
Test that:
- originals are private;
- preview/thumbnail objects are not broadly public;
- signed read URLs are issued only after gallery authorisation;
- a signed URL expires according to the configured TTL;
- EXIF GPS data is removed from client-facing derivatives;
- storage object paths cannot be manipulated to access another gallery;
- deleting a photo/gallery cleans up related objects safely;
- cleanup retries are idempotent.

D. Upload reliability
Test:
- supported valid file;
- unsupported extension;
- invalid MIME/signature mismatch;
- oversized image;
- malformed image;
- duplicate file submission;
- partial batch failure;
- network interruption;
- preview-processing failure and retry;
- concurrent upload limit;
- gallery ownership mismatch.

E. Client workflow end-to-end
Create a Playwright flow, or extend the existing E2E test setup, that covers:
1. Photographer signs in.
2. Photographer creates a draft gallery.
3. Photographer uploads multiple test photographs.
4. Processing completes and previews appear.
5. Photographer edits gallery details and selects a cover.
6. Photographer publishes and copies/opens the share link.
7. Client opens the gallery in a separate unauthenticated browser context.
8. Client favourites and unfavourites a photograph.
9. Client submits an inquiry.
10. Photographer returns to the dashboard and sees the favourites/inquiry.
11. Photographer rotates or disables the share link and the old link stops working.

F. Performance and UX
- Test a gallery with a realistic number of photographs, not only 2–3 images.
- Use pagination or progressive loading as needed.
- Confirm below-the-fold images are lazy-loaded.
- Confirm image dimensions prevent layout shift.
- Verify no original-sized image is loaded in the gallery grid.
- Check mobile data usage and responsive image sizes.
- Confirm that errors do not expose secrets or stack traces.

G. Automated checks
Run the project's actual scripts for lint, type-check, unit/integration tests and production build. Do not report a check as passed unless it was executed successfully. Identify any tests that require Supabase local services or external credentials.

H. Release report
Provide:
- what was tested;
- exact commands run and results;
- security findings and fixes;
- known limitations;
- manual Supabase dashboard/configuration steps;
- environment variables required;
- production-readiness blockers.
```

---

# Prompt 11 — Documentation, context transfer and Phase 2 closeout

```text
Update the project's documentation to reflect the actual Phase 2 implementation. Inspect the source code and migrations while writing. The implementation is the source of truth; do not document planned or incomplete functionality as completed.

A. AI_CONTEXT.md
Create or update the project context file. Keep it concise enough for a new AI coding agent to understand the system quickly, but complete enough to continue implementation safely.

Include:
- product overview and Phase 2 objective;
- current architecture and modular-monolith boundaries;
- project structure and key file reference;
- installed technology stack and versions where useful;
- route/navigation structure;
- database tables, relationships, indexes and important constraints;
- RLS policies and authorization model;
- Storage buckets, object path conventions and access rules;
- upload and image-processing flow;
- share-token and password-protection flow;
- signed URL handling and privacy assumptions;
- favourites/anonymous visitor identity model;
- inquiry flow;
- API/server-action/route-handler reference;
- state management and form-validation conventions;
- visual system and shared skill path;
- environment variable names (never actual secrets);
- local setup and test commands;
- deployment/runtime assumptions;
- implementation status by feature;
- known limitations, technical debt and unresolved decisions;
- next recommended task and future roadmap.

Clearly label each item PLANNED, IN_PROGRESS, BLOCKED, COMPLETED or DEPRECATED. Do not state that a service is configured unless verified.

B. API.md
Document every implemented Phase 2 API route, route handler and externally relevant server endpoint. Also document server-action contracts where they form a meaningful boundary, while distinguishing them from public HTTP endpoints.

For each endpoint include:
- method and path;
- purpose;
- authentication requirement;
- gallery/share access requirement;
- request parameters, headers and body;
- validation rules;
- response shape and status codes;
- error cases;
- rate limits or upload constraints;
- security/ownership checks.

Do not invent REST endpoints for server actions that are not HTTP APIs.

C. README.md
Update the root README with:
- what the product does;
- current Phase 2 capabilities;
- prerequisites;
- environment setup;
- Supabase setup and migrations;
- Storage bucket/policy setup;
- local development commands;
- test commands;
- upload/image-processing notes;
- deployment/runtime constraints;
- links to AGENTS.md, AI_CONTEXT.md, API.md and the visual-system skill.

If the repository later contains separate deployable services, add a README per service. This project is currently a single-repository modular monolith, so do not create artificial service READMEs for folders that are not independent services.

D. AGENTS.md
Ensure the root agent instructions tell future agents to:
- read AI_CONTEXT.md before implementation;
- read the shared visual-system skill before UI changes;
- inspect source/migrations before trusting docs;
- update docs when implementation changes;
- run security and ownership tests for relevant changes.

E. Audit
Audit AI_CONTEXT.md, API.md, README.md and AGENTS.md against actual implementation. Remove stale statements and duplicate/conflicting instructions. Confirm route names, table/column names, environment variables and command names against the code.

F. Closeout
Provide a Phase 2 status report with:
- completed features;
- partially completed features;
- blockers;
- tests and exact results;
- outstanding manual configuration;
- known security/performance limitations;
- next recommended Phase 3 scope.
```

---

# D. Phase 2 acceptance checklist

Phase 2 is complete only when the following end-to-end outcome works in the actual application:

- [ ] Photographer can sign in and open the Gallery Library.
- [ ] Photographer can create, edit, archive and delete a gallery within their ownership boundary.
- [ ] Photographer can upload a batch of valid photographs with real progress feedback.
- [ ] Invalid/oversized/malformed uploads are safely rejected.
- [ ] Private originals and controlled previews are stored separately or clearly distinguished by private object paths.
- [ ] Preview derivatives are generated, correctly oriented and stripped of unnecessary sensitive EXIF metadata.
- [ ] Photographer can organise photos, reorder them and set a cover image.
- [ ] Photographer can publish a gallery and receive a secure share link.
- [ ] Photographer can password-protect, revoke or rotate a share link.
- [ ] Client can view a valid gallery without registering.
- [ ] Client cannot access original files or another gallery by changing URL/request values.
- [ ] Gallery is responsive, accessible and follows the shared visual system.
- [ ] Client can open a lightbox and favourite/unfavourite images.
- [ ] Photographer can review favourite selections without receiving unnecessary visitor identity data.
- [ ] Client can contact the photographer or submit an inquiry.
- [ ] Photographer can see only their own inquiries.
- [ ] Core authorization, storage, token, password and visitor-isolation tests pass.
- [ ] Documentation reflects actual code and known limitations.

---

# E. Suggested Phase 3 roadmap

Do not implement these as part of Phase 2. Keep them as future product opportunities.

1. **Advanced client proofing:** named selections, shortlist export, comments, approval rounds and favourites sharing across devices.
2. **Original downloads:** per-gallery download permission, individual/all-photo download, expiring download links and download audit trail.
3. **Brand customisation:** custom gallery themes, font/logo controls, custom domain and branded email delivery.
4. **Lead management:** inquiry notifications, email templates, reminders, lead status pipeline and conversion tracking.
5. **Monetisation:** storage quotas, subscription plans, paid upgrades and payment integrations.
6. **Scale and operations:** background processing queue, resumable uploads, lifecycle policies, CDN strategy, storage quotas and observability.
7. **Portfolio and discovery:** public photographer portfolio pages, SEO controls, shareable sample galleries and referral loops.
8. **Business intelligence:** privacy-respecting gallery analytics and photographer-level insights.

**Phase 2 product success measure:** A photographer can deliver a real client gallery from start to finish without sending a Google Drive link, and the client can view, shortlist and contact the photographer through one consistent branded experience.
