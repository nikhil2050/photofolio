Coding Agent - Codex

# Photofolio

> **Implementation status:** Phase 1 acceptance is in progress. Authentication, protected studio routes, photographer profile onboarding, private-storage foundations, and a local Phase 2 gallery-library/draft-creation flow are implemented. Apply all committed Supabase migrations before using gallery features.

## Local setup

Prerequisite: Node.js 22.12 or later (required by the test runner) and npm.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and add the URL and publishable key from your Supabase project.
3. Link the project and apply all committed migrations with the Supabase CLI (for example, `npx supabase db push`).
4. In Supabase Auth, add `http://localhost:3000/auth/callback` to the permitted redirect URLs for email confirmation. Keep `http://localhost:3000/auth/confirm` while migrating an existing confirmation-email template; the app supports both paths.
5. Run `npm run dev`.

## Quality checks

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npx next build --webpack
```

See [phase-1-acceptance.md](documentation/phase-1-acceptance.md) for the
hosted Supabase integration checks that require disposable accounts.

The migrations create private `original-photos` and `preview-images` buckets. Do not make either bucket public; see [storage-security.md](documentation/storage-security.md) for key conventions and verification.

See [environment-and-errors.md](documentation/environment-and-errors.md) for environment expectations and the safe error/logging approach.

A platform where photographers deliver photos to clients through branded galleries and showcase their portfolio, with a built-in loop that brings them new leads. It replaces the plain Google Drive link most photographers use today.

> **Status:** Idea / pre-MVP. Reference competitor: [Wfolio](https://wfolio.com) (wfolio.pro redirects there).
> **Honesty note:** Competitor facts below come from Wfolio's own marketing page and are self-reported. Pricing and features change, so **verify them on the live site**. No market-size numbers have been verified; validate everything by interviewing real photographers before building.

---

## 1. Problems with Google Drive links

These come from reasoning about the product, not from verified research. Confirm them in interviews.

| Problem                     | Why it hurts the photographer                                                     |
| --------------------------- | --------------------------------------------------------------------------------- |
| No branding                 | Client sees Google's UI, not the photographer's brand                             |
| Weak first impression       | A folder link looks less professional than a curated gallery                      |
| Weak selection workflow     | No favourites, per-photo comments, or "pick 30 for the album"                     |
| No lead capture             | When a client shares the link, nothing brings new people back to the photographer |
| No analytics                | Photographer can't see if the link was opened or which photos were liked          |
| Weak protection             | No watermarking; links are easily forwarded                                       |
| No sales or payments        | Can't sell prints, albums, or extra photos                                        |
| Poor video and RAW handling | Weak previews, quota limits                                                       |
| Not findable on Google      | Builds no SEO value or discoverability                                            |

---

## 2. What Wfolio does (reference)

Per Wfolio's own page:

- Bundles a website builder, client galleries, AI retouching, and a community (festivals, contests).
- Galleries offer passwords, watermarks, photo selection, face recognition, RAW and video support, and direct photo sales.
- Has a free galleries tier and paid plans starting around $18.9/year (first-year discount). **Verify current pricing.**
- Claims 300,000+ creators (self-reported, **unverified**).
- Key insight from their FAQ: each gallery carries the photographer's contact details, so when a client shares it, new people can contact and book the photographer. **The gallery is the lead channel.**

---

## 3. Strategies

### 3.1 Make every gallery a lead engine

- Put a **"Book a shoot"** button and a contact card on every gallery.
- Add a **"Share with friends and family"** flow that shows a favourites set with the booking button always visible.
- Add a **"Copy Link", "Send link", "Share using QR"**.
- Add a **"Powered by [brand]"** footer on the free tier (a growth loop for the platform itself).
- Add referral rewards, such as print discounts when a guest's friend books.
- Use a structured inquiry form (date, event type, budget, location) instead of "hi, price?".

### 3.2 Public portfolio built to rank on Google

- Fast, SEO-ready sites with per-genre and per-city pages and structured data.
- AI-assisted alt text and captions (like Facebook and Instagram).
- Client reviews block with schema markup.
- "Real shoot stories" (with client consent) to feed long-tail search.

### 3.3 Workflow features that make photographers stay

- Selection and proofing (favourites, comments, album picks).
- Contracts, invoices, and payment links. [FUTURESCOPE]
- Automated follow-ups: "gallery expires in 7 days", "order prints", "leave a review".
- Booking calendar and a lightweight CRM pipeline. [FUTURESCOPE]
- Face-based photo discovery for event guests (see the privacy warning in section 7).

### 3.4 Marketplace layer (potential differentiator)

- Public directory where clients search by city, genre, and budget.
- Wfolio's page mentions festivals and contests but doesn't show a client-facing directory. I can't confirm it has none, so **check this yourself**.
- Chicken-and-egg risk: start with one city and one genre.

### 3.5 Genre-specific modules [FUTURESCOPE]

- Real estate: VR tours, floor-plan embeds.
- Weddings: guest galleries, album design proofing.
- Schools and events: bulk galleries with per-student access codes.

---

## 4. How to compete with Wfolio

Don't try to out-feature it. Pick a wedge:

1. **Regional focus:** local languages, payment methods, pricing, and WhatsApp-based sharing (India) or GDPR-first privacy positioning (Germany/EU).
2. **Lead-gen first:** be the platform that sends photographers clients, not just where they host photos.
3. **Niche vertical:** for example, only wedding photographers in one region, with workflows tuned to them.

---

## 5. Suggested MVP order

1. Branded gallery with password, watermark, photo selection, and a booking button on every gallery.
2. Portfolio site with templates and SEO basics.
3. Inquiry form and basic CRM.
4. Payments and print/album sales.
5. Public directory and referral loop.

Pilot rule: get a real photographer (the friend in India is a natural first user) delivering a real shoot through step 1 before building step 2.

---

## 6. Decisions

### 6.1 Business model: SaaS?

**Suggestion (not certain):** start with a freemium SaaS subscription. It is the simplest model, recurring, and works in both regions. Add a marketplace or commission layer later, once photographers and galleries exist to supply it.

- Free tier: limited storage, platform branding on galleries (the growth loop).
- Paid tier: custom domain, more storage, no branding, payments, CRM.
- **Watch the costs:** storage and bandwidth are likely the biggest expense, so a generous free tier can burn money. Model the cost per GB before setting limits.
- **Validate first:** ask 10 to 15 photographers what they'd pay and for what.

### 6.2 Region: Germany, India, or both?

Building for both is possible, but marketing to both at once splits focus. **Suggestion:** pick one region for outreach first, probably India given the existing photographer contact and the planned visit, while keeping the code ready for both (multi-currency payments, i18n, regional compliance). Treat this as a hypothesis, not a verified conclusion.

### 6.3 Tech stack: Node.js + Next.js?

Yes, Next.js with TypeScript is a reasonable fast-MVP choice, especially when vibe-coding, because there is a large amount of public documentation and examples for AI tools to draw on. **Verify** current versions and docs before relying on any API.

| Layer            | Option to evaluate                                        | Note                                                     |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| Framework        | Next.js (App Router) + TypeScript                         | Frontend and API routes in one repo                      |
| Database         | PostgreSQL (hosted, e.g. Supabase or Neon)                | Verify current free tiers                                |
| File storage     | S3-compatible object storage (e.g. Cloudflare R2, AWS S3) | Compare egress/bandwidth costs                           |
| Image processing | `sharp` for thumbnails and watermarks                     | Verify the API in current docs                           |
| Auth             | Auth.js or the DB provider's auth                         | Pick one, don't mix                                      |
| Payments         | Stripe (EU), Razorpay (India)                             | Verify availability and onboarding rules in each country |
| Email            | A transactional email service                             | Needed for gallery delivery and inquiries                |

---

## 7. Risks and open questions

- **Face recognition and privacy:** face data is biometric, which is likely a special category under GDPR, and India has its own data protection law. Get legal advice **before** building this feature. Not a lawyer; verify.
- **Storage costs** can sink a free tier (see 6.1).
- **Image copyright and takedown handling** needed from day one.
- **Cold start** for any directory or marketplace.
- **Unverified assumptions:** every pain point in section 1 and every claim about Wfolio needs checking.

### Questions to answer through interviews

1. How do you deliver photos today and what annoys you most?
2. Where do your clients actually come from?
3. What would you pay monthly, and for what?
4. Which genre and city should be first?

---

## 8. Next steps

- [ ] Interview 10 to 15 photographers (start with the friend in India)
- [ ] Pick the first region and genre
- [ ] Build MVP step 1 (branded gallery with booking button)
- [ ] Pilot with 1 to 3 real photographers and a real shoot
- [ ] Decide pricing from what they say

## 9. FUTURESCOPE
