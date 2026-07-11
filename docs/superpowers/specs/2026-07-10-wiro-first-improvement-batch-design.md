# WIRO First Improvement Batch Design

**Date:** 2026-07-10
**Status:** Approved by the user after the live audit
**Scope:** Trust integrity, mobile navigation, seasonal pricing accuracy, accessibility contrast, mobile performance quick wins, and targeted SEO cleanup.

## Context

The live audit found a technically sound deployment with real 404 handling, unique route metadata, strong security headers, and good desktop performance. The highest-risk defects are instead concentrated in customer trust and mobile use:

- The reviews page renders synthetic fallback profiles as “Google Reviews” and emits their calculated `AggregateRating` JSON-LD.
- The mobile menu closes immediately after the hamburger is activated.
- Public pricing labels fixed calendar approximations as Passover and Sukkot dates.
- Lighthouse reports contrast failures in the hero CTA, gold text on cream surfaces, and the footer newsletter form.
- Mobile Lighthouse performance is 51 with a 7.9-second LCP, while desktop is 94 with a 1.3-second LCP.
- Both apex and `www` hosts return 200, and some blog Open Graph images are relative URLs while descriptions are truncated mid-word.

An existing WIR-206 plan already requires verifiable proof, WhatsApp-first conversion, and removal of synthetic review patterns. This batch implements that direction without redesigning the product.

## Approaches Considered

### A. Surgical hardening in the current React/Express architecture — selected

Fix the verified failures in their owning components and shared helpers. Keep the current visual language, data model, routing, and Vercel deployment architecture. This has the smallest regression surface and can be covered by unit and Playwright tests.

### B. Full SSR or framework migration

Move public pages to server-rendered React or Next.js so meaningful body content exists in the initial HTML. This could improve crawler independence and mobile render timing, but it is a major architectural change explicitly outside the current approval and repository guidance.

### C. Cosmetic-only homepage refresh

Adjust colors and layout without fixing review provenance, navigation, pricing logic, or host canonicalization. This would improve screenshots but leave the highest business and policy risks intact.

## Selected Design

### 1. Review and trust integrity

- Delete synthetic fallback review records from `GoogleReviewsSection`.
- Render Google review cards only when the configured API returns real data.
- When Google data is unavailable, show a transparent empty state linking to the verified public Tripadvisor profile instead of invented names, dates, or ratings.
- Use the audited Tripadvisor destination exactly: `https://www.tripadvisor.com/Attraction_Review-g293917-d8610288-Reviews-Wiro_4x4_Indochina_Adventure_Day_Tours-Chiang_Mai.html`.
- Remove local-business `AggregateRating` JSON-LD emitted by both the Google review component and the first-party reviews page. Reviews remain visible content, but the site will not request an ineligible self-serving star snippet.
- Replace the homepage’s unsourced `4.9 Google Rating` and `500+ Happy Travelers` counters with sourceable, non-numeric trust actions: public reviews, private planning, Hebrew support, and kosher-aware planning.
- Update the homepage proof block so its empty state contains an actual external review source rather than saying “Every review here” when no reviews render.
- Add one shared Tripadvisor URL constant so all trust links stay consistent.

### 2. Mobile navigation

- Remove the document-level click handler that races with the icon swap and closes the menu on the same activation.
- Close the menu from an explicit backdrop interaction, the toggle button, route navigation, or Escape.
- Add `aria-controls` and a stable mobile navigation id.
- Lock body scrolling while the full-screen menu is open and restore it on cleanup.
- Preserve existing routes, bilingual labels, and styling.

### 3. Seasonal pricing

- Represent holiday surcharge windows as explicit year-specific data in the shared pricing module.
- Publish these inclusive 2026 peak-pricing ranges: Passover from April 1 through April 9, and Sukkot from September 25 through October 2.
- For an unsupported year, apply only normal high/standard season logic; do not add an automatic holiday surcharge. Mark the returned season with a bilingual note that holiday peak pricing for that year must be confirmed on WhatsApp.
- Show that manual-confirmation note in both calculator price-breakdown surfaces whenever it is present. The public pricing page must replace unsupported-year holiday rows with the same confirmation message.
- Drive the public seasonal table from the same shared data used by the calculator so display and calculation cannot drift.
- Label the ranges as peak pricing windows, making clear they are pricing rules rather than religious-calendar authority.

### 4. Accessible color system

- Keep decorative brand gold for borders and icons, but introduce a darker semantic accent for text on light surfaces.
- Use a dark WhatsApp green that meets AA with white text.
- Remove the giant low-contrast decorative background word from the product tier heading.
- Restyle the newsletter description, icon, input, and placeholder using light-theme semantic foreground and border tokens.
- Change only the Lighthouse-identified surfaces in this batch; a full site-wide palette redesign is out of scope.

### 5. Mobile performance quick wins

- Self-host the currently used Latin heading and body font files and remove the render-blocking Google Fonts stylesheet and preconnect chain.
- Preload only critical local font resources.
- Recompress responsive hero WebP variants and verify them visually.
- Remove the runtime duplicate image preload created after React mounts; retain the early HTML hero preload for the homepage shell.
- Keep the existing React SPA and server-injected metadata. Full HTML prerendering/SSR is a separately approved architectural project.

### 6. SEO cleanup

- Add canonical-host middleware that permanently redirects apex requests to `www` before application routing.
- Normalize dynamic Open Graph image URLs to absolute `https://www.wiro4x4indochina.com/...` URLs.
- Truncate generated descriptions at a word boundary with an ellipsis instead of cutting words.
- Remove the misleading same-URL English alternate from the Hebrew guide sitemap entry; retain only truthful self/default declarations until distinct localized URLs exist.
- Preserve the verified real-404 and `noindex` behavior from the earlier SEO middleware work.

## Error Handling and Fallbacks

- A failed or unconfigured Google Reviews API produces a transparent external-proof empty state, never synthetic content.
- Missing external review URLs degrade to the site reviews page without emitting ratings.
- Unsupported holiday years do not receive holiday surcharges automatically.
- Canonical-host middleware leaves localhost, previews, and non-apex hosts unchanged.
- URL normalization accepts existing absolute images and resolves root-relative images against the canonical site URL.

## Testing Strategy

- Add focused unit tests for year-specific seasonal boundaries, unsupported-year behavior, canonical-host redirect behavior, OG URL normalization, and word-safe descriptions.
- Add a Playwright mobile navigation regression test that proves the menu stays open after activation and closes intentionally.
- Add component/source-level regression checks for the absence of fallback reviewers and aggregate-rating scripts if the current Vitest setup cannot render React DOM components.
- Run targeted tests red-first, then the full Vitest suite, TypeScript check, production build, lint on touched files, and selected Playwright tests.
- Re-run mobile and desktop Lighthouse against a local production build, then visually inspect desktop/mobile screenshots.

## Success Criteria

- No synthetic reviewer names, sample rating totals, or synthetic aggregate rating JSON-LD appear.
- Mobile hamburger exposes a visible, accessible navigation until intentionally closed.
- 2026 holiday pricing and the public table use the same shared ranges.
- Lighthouse no longer reports the identified contrast failures.
- Mobile Lighthouse performance reaches at least 70 and LCP reaches 5.0 seconds or faster from the recorded 51 / 7.9-second baseline. Desktop performance remains at least 90, CLS remains 0, and mobile TBT does not exceed the 360-millisecond baseline.
- Apex requests redirect permanently to `www`; route metadata and 404 behavior remain correct.
- All repository verification gates pass.

## Non-Goals

- Framework migration, SSR, or a full prerender pipeline.
- A new visual identity or homepage information-architecture redesign.
- Inventing or scraping Google ratings without a valid configured Place ID.
- Changing payment, booking, CRM, database, or admin workflows beyond sharing the corrected pricing-window data.
