# Photofolio MVP Roadmap

## Purpose

This document converts the product idea in `README.md` into a deliberately narrow, free-tier-first MVP plan. It combines investor-style scope discipline with implementation-ready product tasks.

The MVP is not a complete Wfolio replacement. It is a test of one core hypothesis:

> A branded, private client gallery with photo proofing can replace a Google Drive link and create new photographer enquiries.

## VC view: what must be proven

The largest risk is not technical. It is whether photographers will use the product for real deliveries and whether the gallery creates measurable value beyond Google Drive.

The first proof point is therefore:

1. One photographer delivers one real shoot through Photofolio.
2. The client views the gallery and selects photos.
3. At least one qualified enquiry is submitted from the gallery, or the photographer clearly prefers the workflow and would reuse it.

Start with one beachhead: solo wedding/event photographers in India, using the existing photographer contact in the README as the first potential pilot. Keep the data model ready for Germany/EU later, but do not split initial marketing or product decisions across both regions.

## MVP product definition

### Primary user

An independent photographer who needs to deliver a shoot professionally, collect selections, and turn gallery viewers into future clients.

### Core job to be done

“Deliver a polished, private gallery where my client can view and select photos, while my branding and booking option remain visible.”

### In scope

- Photographer account and profile
- Branded, password-protected galleries
- Image upload, thumbnails, and gallery previews
- Public shareable gallery links
- Client favourites/photo selection
- Photographer view of selections
- Persistent booking CTA and structured enquiry form
- Minimal usage analytics

### Deferred

Do not build these before the MVP success gates are met:

- Full portfolio/website builder and custom domains
- Payments, print sales, invoices, and contracts
- CRM pipeline and automated follow-ups
- Public directory or marketplace
- AI captions, retouching, or face recognition
- RAW/video delivery
- Native mobile applications
- Referral rewards and genre-specific modules

Face recognition is especially unsuitable for the MVP because biometric data introduces substantial privacy and compliance risk.

## Feature and task plan

### Phase 0 — Validate before building

**Goal:** Confirm the problem, first segment, and pilot commitment.

Tasks:

1. Interview 10–15 photographers, beginning with the existing contact.
2. Record current delivery workflow, gallery size, client selection needs, sharing channels, and pain points.
3. Ask what they would pay for and what outcome would justify switching from Google Drive.
4. Choose one first city/region and genre.
5. Recruit 1–3 photographers for real pilot shoots.
6. Define a one-page pilot brief and baseline metrics.

**Exit criterion:** at least one photographer commits a real shoot to the pilot.

### Phase 1 — Foundation

**Goal:** Give a photographer a secure account and a profile used across galleries.

Tasks:

1. Create the Next.js + TypeScript application.
2. Configure authentication and protected dashboard routes.
3. Create the initial data model: `users`, `photographer_profiles`, `galleries`, `photos`, `favourites`, and `inquiries`.
4. Implement sign-up, sign-in, sign-out, and session handling.
5. Build profile setup for display name, logo/avatar, contact/WhatsApp number, and booking CTA.
6. Configure private originals and controlled preview images in object storage.
7. Add environment configuration and basic error logging.
8. Add privacy, terms, and copyright/takedown pages.

**Acceptance test:** a photographer can create an account, complete a profile, and reach an empty dashboard.

### Phase 2 — Gallery delivery vertical slice

**Goal:** Let a photographer deliver a real gallery from creation to share link.

Tasks:

1. Build “Create gallery” with title, client/event name, event date, and optional password.
2. Add multi-image upload with progress, retry, validation, and clear failure states.
3. Generate thumbnails and gallery-sized previews on upload.
4. Store image order, dimensions, filename, and processing status.
5. Build the dashboard gallery list with draft/published states.
6. Add gallery editing for title, password, cover image, and publish/unpublish.
7. Generate an unguessable public gallery URL.
8. Add copy-link and WhatsApp sharing actions.

**Acceptance test:** a pilot photographer can upload a real gallery, password-protect it, publish it, and send it to a client.

### Phase 3 — Client proofing

**Goal:** Make the gallery useful enough to replace a basic file-sharing link.

Tasks:

1. Build a fast, mobile-first image grid.
2. Add full-screen/lightbox viewing with swipe and keyboard navigation.
3. Show the photographer’s branding and contact information.
4. Gate protected galleries behind password entry.
5. Allow viewers to favourite/unfavourite photos without creating an account.
6. Add a “Your selections” view and selected-photo count.
7. Add photographer dashboard views for selected photos and favourite totals.

**Acceptance test:** a client can select photos on a phone, return using the same browser, and the photographer can see the selected set.

### Phase 4 — Lead engine and pilot instrumentation

**Goal:** Test whether a gallery can generate demand, not only host files.

Tasks:

1. Place a persistent “Book a shoot” CTA in the gallery header, viewer, or footer.
2. Build a structured enquiry form: name, phone/email, event type, date, location, budget range, and message.
3. Save each enquiry against both the photographer and source gallery.
4. Notify the photographer by transactional email or a WhatsApp-ready message.
5. Track gallery views, approximate unique visitors, favourites, and enquiry submissions.
6. Add manual expiry/unpublish controls.
7. Run pilot deliveries and interview both photographer and client afterward.

**Acceptance test:** a visitor can submit an enquiry from a gallery and the photographer receives enough information to respond.

## Free-resource-first technical plan

Use managed free tiers for the pilot, keep service boundaries replaceable, and cap usage aggressively. Free-tier terms change, so recheck them before launch.

| Layer | Initial choice | MVP constraint |
|---|---|---|
| App | Next.js + TypeScript | One repository; server routes where practical |
| Database/auth | Supabase free tier | Suitable for prototype limits, not unlimited production storage |
| Object storage | Supabase Storage initially; evaluate Cloudflare R2 as volume grows | Keep originals private; serve resized previews |
| Image processing | `sharp` | Generate thumbnail and preview variants only |
| Email | Resend free tier | Use for low-volume pilot notifications |
| Deployment | Free development/previews; choose a commercial-compatible host before public SaaS launch | Confirm terms and quotas before launch |

Current reference limits include Supabase free storage/database/egress quotas and inactivity pausing, Resend’s free email quota, and Cloudflare R2’s free-usage/no-egress positioning. Verify the live provider terms before committing to a production architecture:

- [Supabase pricing](https://supabase.com/pricing)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Resend pricing](https://resend.com/pricing)
- [Vercel Hobby plan documentation](https://vercel.com/docs/plans/hobby)

For the pilot, set explicit limits such as:

- Three galleries per photographer
- Fifty photos per gallery
- Ten MB maximum per upload
- Preview images as the default client experience
- No original downloads until bandwidth and copyright handling are understood
- Manual deletion and expiry controls

These limits protect the free budget and prevent Photofolio from becoming an unbounded storage service before product-market evidence exists.

## MVP success gates

Do not expand into the portfolio builder or marketplace until these are measured:

- Three photographers complete real client deliveries.
- At least ten client viewers use the favourites flow.
- At least 70% of pilot galleries are delivered without falling back to Google Drive.
- At least one qualified enquiry comes through a gallery CTA.
- At least two of three photographers say they would use Photofolio again.
- Storage and bandwidth cost per gallery is known well enough to set a sustainable free allowance.

If photographers value proofing but not lead generation, retain the proofing workflow as the wedge and revise the growth hypothesis. If they value neither over Google Drive, change the target segment before adding features.

## Recommended build order

1. Complete Phase 0 interviews and recruit pilots.
2. Build Phase 1 foundation.
3. Build the Phase 2 vertical slice end-to-end.
4. Add Phase 3 proofing before polishing secondary screens.
5. Add Phase 4 lead capture and instrumentation.
6. Run real pilots, measure the gates, then decide whether to build the portfolio site, monetisation, or marketplace layer.

