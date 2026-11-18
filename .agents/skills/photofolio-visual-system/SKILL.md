---
name: photofolio-visual-system
description: Shared visual and UX system for Photofolio, the photographer portfolio and client gallery platform. Use whenever creating, reviewing, or modifying any product UI, route, component, form, empty state, marketing section, photographer dashboard, or client-facing gallery.
---

# Photofolio Visual System

## Purpose

Keep every screen in Photofolio visually coherent. This is the single source of truth for design decisions. Apply it to marketing pages, authentication, onboarding, dashboard, settings, future galleries, and client-facing experiences.

The product should feel like a premium photography studio workspace: warm, editorial, image-led, calm, minimal, and easy to use. The interface is a frame for the photographer's work; it must never compete with the photographs.

## 1. Non-negotiable design principles

1. **Photography first:** Images should be the strongest visual element wherever photography is the content. UI chrome stays quiet.
2. **Clarity over decoration:** Every element must explain, guide, confirm, or help the user act. Remove decoration that does none of these.
3. **Warm minimalism:** Use warm neutrals, charcoal text, restrained borders, and one muted accent. Avoid sterile all-grey SaaS styling.
4. **Editorial rhythm:** Use generous whitespace, strong typography hierarchy, carefully composed image layouts, and occasional asymmetric composition in public/gallery surfaces.
5. **One system, three experiences:** Marketing, photographer workspace, and client galleries share the same tokens and interaction language. Layout density may change by context, not the underlying visual identity.
6. **Trust through restraint:** Avoid exaggerated claims, fake metrics, artificial urgency, fake testimonials, and fabricated activity.
7. **Accessible by default:** Semantic HTML, keyboard support, visible focus, readable contrast, clear labels, and reduced-motion support are mandatory.
8. **Responsive by design:** Design for small screens first, then enhance layouts for larger screens. Do not merely shrink desktop layouts.
9. **Real states only:** Every component must represent real loading, empty, success, validation, disabled, and error conditions where relevant. Do not fabricate data to make the screen look busy.
10. **Consistent implementation:** Reuse tokens and shared components. Do not introduce page-specific colours, typography, radii, or shadows without updating this skill.

## 2. Colour system

Use this warm editorial palette as the default light theme. Define colours as central CSS variables and map them into the project's Tailwind and component theme. Never scatter raw hex values through page components.

| Token | Hex | Intended use |
|---|---|---|
| `--background` | `#F7F5F0` | Main warm canvas |
| `--surface` | `#FFFFFF` | Cards, forms, menus, modal surfaces |
| `--surface-muted` | `#EFEBE4` | Quiet secondary surfaces, selected neutral areas |
| `--foreground` | `#242421` | Primary text, headings, primary button background |
| `--muted-foreground` | `#6F6A63` | Secondary text, helper copy, metadata |
| `--accent` | `#A66F52` | Restrained brand accent, subtle emphasis, active markers |
| `--accent-strong` | `#8D5B43` | Accent text or accents that require stronger contrast |
| `--border` | `#E5E0D8` | Dividers, input outlines, card borders |
| `--input` | `#D8D2C8` | Default input border |
| `--ring` | `#6F817E` | Visible keyboard focus ring |
| `--success` | `#456B56` | Success states |
| `--warning` | `#926B35` | Warning states |
| `--destructive` | `#A44840` | Destructive actions and errors |

### Colour usage rules

- The warm background is the default app canvas; do not place every element on a white card. Use white surfaces only where separation improves clarity.
- Use charcoal for primary buttons. This gives the product a confident, timeless action style.
- Use terracotta sparingly: links, small active indicators, selected details, or a restrained accent button when appropriate.
- Do not use accent colour for large decorative panels or every icon.
- Success, warning, and error colours communicate state only; they are not decorative brand colours.
- Pair every coloured status with text or an icon. Never rely on colour alone.
- Check contrast for actual foreground/background combinations. Do not assume a listed token is automatically safe for every text size.
- If a new theme is necessary later, extend semantic tokens rather than hardcoding a second palette.

## 3. Typography

### Font roles

- **Product UI:** DM Sans (or the existing project's closest clean, highly legible sans-serif) for navigation, forms, buttons, body copy, labels, and dashboard content.
- **Editorial display:** Cormorant Garamond may be used selectively for large marketing headlines or a future full-screen gallery title. It must not be used for dense UI, forms, tables, or small labels.
- If the fonts are unavailable or create loading/performance problems, choose a reliable system fallback and preserve the hierarchy. Do not block the app on a decorative font.

### Type scale

Use a restrained scale and centralise it where practical:

| Role | Desktop guidance | Weight |
|---|---:|---|
| Marketing display | 48–64px, responsive | Regular/medium |
| Page title | 30–36px | 600 |
| Section title | 20–24px | 600 |
| Card title | 16–18px | 600 |
| Body | 14–16px | 400 |
| Supporting text | 13–14px | 400 |
| Label / metadata | 12–13px | 500 |
| Eyebrow | 10–12px, modest tracking | 600 |

Rules:
- Body text should be easy to scan with line-height around 1.5–1.65.
- Avoid uppercase body copy. Reserve uppercase styling for rare small editorial labels.
- Avoid too many font sizes on one screen.
- Do not use ultra-light text weights for important information.
- Keep line length comfortable; avoid full-width paragraphs on desktop.

## 4. Layout, spacing, and shape

### Spacing

Use a 4px base scale. Prefer these values: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

- Form field spacing: 16–20px.
- Related field group spacing: 24–32px.
- Section spacing: 40–64px.
- Marketing section spacing: 72–112px depending on screen size.
- Dashboard content padding: 24px mobile, 32px desktop as a starting point.

Do not choose spacing values randomly. Reuse scale values and adjust only when visual alignment requires it.

### Containers and grids

- Marketing content max width: approximately 1200–1280px.
- Dashboard content max width: approximately 1120–1200px, with a wider allowance for future gallery grids.
- Desktop dashboard sidebar: approximately 224–248px.
- Top bar: approximately 64–72px.
- Use a consistent 12-column or simple CSS grid system for major desktop sections.
- On mobile, stack content in a clear reading order; avoid horizontal scrolling except for a deliberate image carousel with an accessible alternative.

### Corners and borders

- Small controls: 8–10px radius.
- Cards and popovers: 12–16px radius.
- Large image/hero containers: 16–20px radius where appropriate.
- Use a 1px subtle border for card and input separation.
- Do not combine large shadows, thick borders, and large radii on the same element.

### Shadows

Use shadows sparingly. Prefer surface contrast and borders over elevation. A subtle shadow is appropriate for floating menus, modals, and drag/drop overlays. Avoid heavy card shadows across the dashboard.

## 5. Imagery and photo presentation

Photography is the product's differentiator. Treat image display as a core interface capability, not decoration.

### Image selection

- Prefer authentic, high-quality, properly licensed photography supplied for the product or sourced with clear usage rights.
- Never imply that a sample photo is a real customer delivery.
- Use labelled demo/sample images only in explicitly marked demo content.
- Do not use generic cartoon illustrations, stock 3D objects, AI-generated people, or random gradient blobs as substitutes for real photography.
- If real photos are not available, use neutral, elegant placeholders with a restrained image icon and a clear label. Do not use broken-image icons or fake thumbnails.

### Aspect ratio and cropping

- Preserve the original image ratio by default.
- Use `object-fit: cover` only when the layout clearly calls for a fixed crop and the subject remains intact.
- Avoid cropping faces, hands, key products, or meaningful photographic details.
- For editorial grids, mix landscape and portrait ratios deliberately rather than randomly.
- For profile avatars, use a consistent square crop and a circular or softly rounded frame.
- For a future gallery, make image size and spacing generous; thumbnails should not feel like a file manager.

### Image loading and privacy

- Reserve image dimensions to avoid layout shift.
- Use responsive image sizes and appropriate modern formats.
- Lazy-load below-the-fold imagery; do not lazy-load the primary hero image if it harms perceived loading.
- Do not render a private original just because a preview is unavailable.
- Respect signed-URL expiry and authorization. Never bake private storage URLs into static public pages.

## 6. Iconography and graphics

### Icons

Use Lucide icons only, consistently in outline style.

- Typical size: 16px for inline metadata, 18–20px for controls, 20–24px for navigation or empty states.
- Use consistent stroke width around 1.75–2px.
- Do not mix filled icons, emoji, outline icons, and illustrations in the same component set.
- Do not use an icon without a label when the action is unfamiliar or consequential.
- Icon-only buttons need an accessible name, tooltip where useful, and a visible focus state.

Suggested semantic choices (use the exact installed Lucide icon names):
- Camera / image collection: `camera`, `images`, `image`.
- Favourites: `heart`.
- Enquiries/contact: `message-circle`, `mail`, `phone`.
- Dashboard: `layout-dashboard`.
- Profile: `user-round`.
- Settings: `settings-2` or `settings`.
- Security: `shield-check`, `lock-keyhole`.
- Navigation/external link: `arrow-up-right`, `chevron-right`.
- Upload: `upload`, `image-plus`.

### Illustration style

Prefer simple line illustrations or a small sequence of UI-shaped cards rather than character illustrations.

Useful product graphics:
- **Delivery loop:** three or four minimal nodes connected by a thin line: `Photographer → Branded gallery → Client → Enquiry`.
- **Empty gallery cue:** a simple outlined photo frame or stacked-image icon with a short message.
- **Profile preview:** an authentic miniature preview of the photographer's brand identity, using the actual form values.
- **Security cue:** a small lock icon with plain-language explanation, not a large shield graphic.

Do not add decorative graphics to every section. One meaningful visual per section is usually enough.

## 7. Component patterns

### Buttons

- Primary: charcoal background, white text, restrained hover state.
- Secondary: neutral surface with border.
- Outline: transparent surface and subtle border.
- Ghost: no visible border until hover/focus; reserve for low-emphasis actions.
- Destructive: semantic error colour and clear confirmation for irreversible operations.
- Link: readable underlined or accent-coloured text, not a button pretending to be a link.

Rules:
- Use consistent heights: approximately 40px standard, 44–48px prominent touch target.
- Keep labels action-oriented: `Save profile`, `Create account`, `Sign out`.
- Include loading and disabled states. Prevent duplicate submissions.
- Do not use multiple primary buttons in one small context.

### Forms

- Always provide a visible label; placeholders are examples, not labels.
- Put concise helper text below fields only when it resolves uncertainty.
- Put validation errors close to the relevant field.
- Do not rely on colour alone for errors.
- Keep required and optional fields clear.
- Preserve values when submission fails.
- Use sensible autocomplete attributes and input types.
- On mobile, use a single-column form and comfortable touch targets.

### Cards and surfaces

- Cards should group related content, not create a grid of generic dashboard widgets.
- Use subtle border and surface contrast.
- Keep card headers and actions aligned consistently.
- Avoid nesting cards inside cards.
- Avoid showing data cards when there is no meaningful data.

### Navigation

- Keep navigation short and task-oriented.
- Use a persistent desktop sidebar only where it improves orientation.
- Mobile navigation must be reachable with one hand and keyboard accessible.
- Clearly indicate the active route.
- Do not show links to unfinished functionality as if they work.

### Empty states

Every empty state should answer:
1. What is empty?
2. Why is it empty or what happens next?
3. What should the user do now?

Use a short title, one or two lines of helpful copy, one clear next action, and a restrained icon/graphic. Never fill empty states with fake data.

### Feedback and status

- Use inline success feedback for saved forms.
- Use toasts for transient confirmations, not for essential information that must remain visible.
- Use alerts for persistent problems or warnings.
- Use skeletons only when content shape is known; otherwise use a calm loading indicator.
- Provide a retry action where a recoverable load fails.

### Dialogs and destructive actions

Use dialogs only for consequential confirmation or a focused task. Avoid a modal for every small form. Explain the consequence in plain language and make the safe action visually clear.

## 8. Screen-specific guidance

### Marketing website

Goal: help a photographer understand the value and start an account.

Suggested hero:
- Headline direction: `Your work deserves more than a link.`
- Supporting copy: `Create beautiful, branded galleries that make photo delivery feel personal—and make it easier for clients to book you again.`
- Primary CTA: `Create your studio`.
- Secondary CTA: `See how it works`.
- Visual: a large, realistic client-gallery preview or a layered product mockup using clearly labelled sample photography.

Use a small number of sections:
1. Value proposition.
2. How the delivery-to-enquiry loop works.
3. A gallery/profile preview.
4. Core benefits.
5. Final signup CTA.

Avoid long feature grids, unverified claims, invented testimonials, and fake customer logos.

### Authentication

- Keep auth pages focused and calm.
- Use a narrow centred form container.
- Provide clear context and one primary action.
- Keep legal links visible but not dominant.
- Avoid decorative side panels that take space away from the form on mobile.

### Photographer onboarding/profile

- Present only the minimum required fields.
- Mark optional fields clearly.
- Use a live profile preview when it helps the user understand why the fields matter.
- Do not force optional logo, phone, or booking CTA details.
- Keep progress and completion status factual.

### Photographer dashboard

- Use a quiet app shell, a short navigation set, and a focused page heading.
- First-use dashboard should feel intentional, not unfinished.
- Guide the photographer to the next meaningful action.
- Never invent gallery totals or activity.

### Future client-facing gallery

- Reduce interface chrome further than the dashboard.
- Give photographs generous space and preserve their visual rhythm.
- Show photographer branding subtly.
- Make favourites, download, contact, and sharing actions clear but secondary to viewing the work.
- Keep privacy/access status understandable without exposing technical details.
- Do not use infinite animations or auto-advancing carousels by default.

## 9. Motion and interaction

- Use motion to communicate state change, not to decorate.
- Prefer short transitions around 120–200ms for hover/focus and 160–240ms for panels or menus.
- Respect `prefers-reduced-motion`.
- Avoid parallax, scroll-jacking, autoplaying media, animated gradients, and excessive page entrance effects.
- Ensure hover-only information is also available on touch and keyboard.
- Do not delay a user's task with ornamental animation.

## 10. Accessibility and responsive quality

- Use semantic landmarks and a logical heading hierarchy.
- All form fields require programmatic labels.
- All interactive controls must be keyboard accessible.
- Use a clear focus ring; never remove the browser focus indicator without replacing it.
- Provide alt text that describes meaningful image content. Decorative images should have empty alt text.
- Use accessible names for icon-only controls.
- Announce important form errors and asynchronous status changes appropriately.
- Support zoom and text resizing without clipping.
- Check at least 360px, 390px, 768px, 1024px, and 1440px widths.
- Avoid horizontal overflow and ensure controls are comfortably tappable.

## 11. Content and tone

Use calm, confident, plain language. Speak to photographers as creative professionals, not as technical users.

Prefer:
- `Create your studio account`
- `Set up your photographer profile`
- `Your studio starts here`
- `Save profile`
- `Share a gallery with your client` (only when that feature exists)

Avoid:
- Overly playful copy.
- Hype such as `revolutionary`, `game-changing`, or `10x your business`.
- Technical jargon in user-facing text.
- False urgency or pressure.
- Promising bookings, revenue, or client engagement that the product cannot guarantee.

## 12. Design QA checklist — run for every UI change

Before considering a screen complete, verify:

- [ ] It follows the warm editorial palette and central tokens.
- [ ] Typography hierarchy is consistent and readable.
- [ ] Spacing uses the shared scale.
- [ ] Buttons, inputs, cards, borders, radii, and shadows match existing components.
- [ ] Icons use the same Lucide outline style.
- [ ] The content is the visual priority; decoration is restrained.
- [ ] The design has appropriate loading, empty, success, disabled, and error states.
- [ ] No fake statistics, fabricated customers, or implied features are shown.
- [ ] Keyboard focus and accessible labels are present.
- [ ] Contrast is checked for actual combinations.
- [ ] Layout works at mobile, tablet, laptop, and desktop widths.
- [ ] Images preserve subject integrity and do not expose private originals.
- [ ] Reduced-motion preferences are respected.
- [ ] Any new shared pattern has been added to this skill rather than implemented as a one-off.

## 13. How to extend this system

## 14. Implementation convention

- Shared tokens are defined in `src/app/globals.css` and exposed through Tailwind semantic utilities such as `bg-surface`, `text-muted-foreground`, and `border-border`.
- Reusable shadcn-style primitives live in `src/components/ui`. Use them for buttons, form controls, feedback, cards, empty states, and page headers before writing page-specific markup.
- The internal component preview is available only during development at `/internal/style-guide`; it is intentionally unavailable in production and must never be linked in public navigation.
- Use the system font stacks already configured in the global theme unless the project deliberately adds self-hosted font assets. Do not add remote font requests solely for decoration.

When a future feature requires a new component or pattern:

1. Check whether an existing token or component already solves the need.
2. Prefer a variant of an existing component over a new visual style.
3. If a new token is genuinely needed, name it semantically and define it centrally.
4. Update this skill with the new rule and usage example.
5. Use the updated system in the current feature and future screens.

Never silently introduce a new palette, font, icon set, radius system, shadow style, or illustration language.
