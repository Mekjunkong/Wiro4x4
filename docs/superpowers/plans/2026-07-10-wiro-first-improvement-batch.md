# WIRO First Improvement Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove misleading trust content, restore mobile navigation, correct 2026 seasonal pricing, fix audited contrast failures, improve mobile rendering performance, and harden canonical SEO behavior without redesigning or migrating the application.

**Architecture:** Keep the current React 19/Vite client, Express/tRPC server, and Vercel serverless entry. Put truth-sensitive constants and pricing rules in shared or single-source modules, cover behavioral regressions with Vitest and Playwright, and make performance changes through local static assets rather than an SSR migration.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Express 4, Vite 7, Vitest, Playwright, Sharp, Vercel.

**Spec:** `docs/superpowers/specs/2026-07-10-wiro-first-improvement-batch-design.md`

---

## File Map

- `client/src/const.ts` — canonical public review source URL.
- `client/src/components/GoogleReviewsSection.tsx` — real Google data or transparent external-proof fallback; never synthetic reviews.
- `client/src/pages/Reviews.tsx` — first-party review UI without self-serving aggregate-rating JSON-LD.
- `client/src/components/TrustBar.tsx` — sourceable, non-numeric trust actions.
- `client/src/components/SocialProofStrip.tsx` — truthful empty state and external review link.
- `client/src/components/Header.tsx` — deterministic mobile menu lifecycle.
- `shared/pricing.ts` — one source for the public seasonal table, year-specific holiday peak windows, calculator rules, and manual-confirmation status.
- `client/src/pages/Pricing.tsx` — table derived from shared pricing data.
- `client/src/components/CostCalculator.tsx` and `client/src/components/calculator-v2/PriceBreakdownModal.tsx` — unsupported-year confirmation note.
- `client/src/index.css`, `client/src/components/Hero.tsx`, `client/src/components/ProductTiers.tsx`, `client/src/components/Footer.tsx`, `client/src/components/NewsletterSignup.tsx` — audited contrast surfaces.
- `client/public/fonts/*` and `client/index.html` — local critical fonts and preloads.
- `client/src/components/OptimizedImage.tsx` — remove post-mount duplicate preloading.
- `scripts/optimize-images.ts` — production-time hero compression settings; responsive variants are generated and gitignored.
- `vercel.json` and `server/vercelConfig.test.ts` — apex-to-`www` redirect at the Vercel edge, before rewrites.
- `server/seoMiddleware.ts` — absolute OG images and word-safe descriptions.
- `server/routes/sitemap.ts` — truthful Hebrew guide alternates.
- `e2e/trust-integrity.spec.ts`, `e2e/mobile.spec.ts`, `e2e/accessibility-contrast.spec.ts` — browser regressions.
- `server/pricing.test.ts`, `server/vercelConfig.test.ts`, `server/seoMiddleware.test.ts`, `server/sitemap.test.ts`, `server/frontend-assets.test.ts` — unit and artifact regressions.

---

### Task 1: Remove synthetic review proof and unsourced counters

**Files:**

- Create: `e2e/trust-integrity.spec.ts`
- Modify: `client/src/const.ts`
- Modify: `client/src/components/GoogleReviewsSection.tsx`
- Modify: `client/src/pages/Reviews.tsx`
- Modify: `client/src/components/TrustBar.tsx`
- Modify: `client/src/components/SocialProofStrip.tsx`

- [ ] **Step 1: Write the failing trust-integrity browser tests**

Create tests that run with cookie/newsletter overlays disabled and assert the empty Google integration state:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-accepted", "true");
    localStorage.setItem(
      "wiro_newsletter_dismissed",
      String(Date.now() + 86400000)
    );
  });
});

test("never presents sample profiles as Google reviews", async ({ page }) => {
  await page.goto("/reviews");
  await expect(page.getByText("David Cohen")).toHaveCount(0);
  await expect(page.getByText(/Based on 5 reviews/i)).toHaveCount(0);
  await expect(page.locator("#google-reviews-aggregate-json-ld")).toHaveCount(
    0
  );
  await expect(
    page.getByRole("link", { name: /Tripadvisor/i })
  ).toHaveAttribute("href", /tripadvisor\.com\/Attraction_Review/);
});

test("homepage trust claims link to public proof", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("4.9")).toHaveCount(0);
  await expect(page.getByText("500+")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /public reviews/i }).first()
  ).toHaveAttribute("href", /tripadvisor\.com\/Attraction_Review/);
});
```

- [ ] **Step 2: Run the test and verify it fails for the current synthetic content**

Run:

```bash
pnpm exec playwright test e2e/trust-integrity.spec.ts --project=chromium
```

Expected: FAIL because `David Cohen`, `Based on 5 reviews`, hardcoded homepage counters, and the synthetic aggregate script still exist.

- [ ] **Step 3: Add the canonical Tripadvisor source constant**

Add to `client/src/const.ts`:

```ts
export const COMPANY_TRIPADVISOR_URL =
  "https://www.tripadvisor.com/Attraction_Review-g293917-d8610288-Reviews-Wiro_4x4_Indochina_Adventure_Day_Tours-Chiang_Mai.html";
```

- [ ] **Step 4: Remove fallback review records and aggregate schema**

In `GoogleReviewsSection.tsx`:

- delete `FALLBACK_REVIEWS`;
- set `reviews = googleReviews ?? []`;
- remove the `AggregateRating` injection effect;
- when `reviews.length === 0`, render a concise explanation plus a clearly named external Tripadvisor link;
- when real Google data exists, render it without an invented generic Google review URL.

In `Reviews.tsx`, delete the `aggregateRating` calculation and JSON-LD injection effect. Keep real first-party review rendering and submission unchanged.

- [ ] **Step 5: Replace unsourced homepage counters and empty proof copy**

Change `TrustBar` to four static, sourceable concepts: `Public Reviews` (external Tripadvisor link), `Private Planning`, `Hebrew Speaking`, and `Kosher-Aware`. Remove animated numeric counters and their interval logic.

Change `SocialProofStrip` so:

- real approved website reviews still render when available;
- the heading description never says reviews are visible when `topReviews` is empty;
- an external `Read public reviews on Tripadvisor` link is always present;
- website submissions are labelled `Approved website review`, not `Verified` unless booking verification exists.

- [ ] **Step 6: Run the trust tests**

Run:

```bash
pnpm exec playwright test e2e/trust-integrity.spec.ts --project=chromium
```

Expected: PASS.

- [ ] **Step 7: Commit the trust-integrity change**

```bash
git add e2e/trust-integrity.spec.ts client/src/const.ts client/src/components/GoogleReviewsSection.tsx client/src/pages/Reviews.tsx client/src/components/TrustBar.tsx client/src/components/SocialProofStrip.tsx
git commit -m "fix: replace synthetic reviews with verifiable proof"
```

---

### Task 2: Fix the mobile menu race and accessibility lifecycle

**Files:**

- Modify: `e2e/mobile.spec.ts`
- Modify: `client/src/components/Header.tsx`

- [ ] **Step 1: Make the existing regression test use a real user click**

Replace the `dispatchEvent("click")` workaround in `openMobileMenu` with:

```ts
await menuButton.click();
await expect(menuButton).toHaveAttribute("aria-expanded", "true");
```

Add:

```ts
test("should close mobile menu with Escape", async ({ page }) => {
  await preparePage(page);
  await page.goto("/");
  const mobileNav = await openMobileMenu(page);
  await page.keyboard.press("Escape");
  await expect(mobileNav).not.toBeVisible();
});
```

- [ ] **Step 2: Run the mobile test and verify the actual click fails**

Run:

```bash
pnpm exec playwright test e2e/mobile.spec.ts --project="Mobile Chrome" --grep "open mobile menu|Escape"
```

Expected: FAIL because the document listener closes the menu during the same activation.

- [ ] **Step 3: Implement explicit menu closing behavior**

In `Header.tsx`:

- remove the document `click` listener effect;
- add `id="mobile-navigation"` to the menu container and `aria-controls="mobile-navigation"` to the toggle;
- add an Escape/body-scroll-lock effect scoped to `mobileMenuOpen`;
- close only when the toggle is pressed, a menu link is selected, Escape is pressed, or the outer backdrop itself is clicked;
- use `event.target === event.currentTarget` for backdrop closing so nav interactions do not close accidentally.

The effect shape should be:

```ts
useEffect(() => {
  if (!mobileMenuOpen) return;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") setMobileMenuOpen(false);
  };
  document.addEventListener("keydown", onKeyDown);
  return () => {
    document.body.style.overflow = previousOverflow;
    document.removeEventListener("keydown", onKeyDown);
  };
}, [mobileMenuOpen]);
```

- [ ] **Step 4: Run the complete mobile spec**

Run:

```bash
pnpm exec playwright test e2e/mobile.spec.ts --project="Mobile Chrome"
```

Expected: PASS with real `.click()` interaction.

- [ ] **Step 5: Commit the mobile navigation fix**

```bash
git add e2e/mobile.spec.ts client/src/components/Header.tsx
git commit -m "fix: keep mobile navigation open after activation"
```

---

### Task 3: Make holiday peak pricing year-specific and shared

**Files:**

- Modify: `server/pricing.test.ts`
- Modify: `shared/pricing.ts`
- Modify: `client/src/pages/Pricing.tsx`
- Modify: `client/src/components/CostCalculator.tsx`
- Modify: `client/src/components/calculator-v2/PriceBreakdownModal.tsx`

- [ ] **Step 1: Add failing 2026 boundary and unsupported-year tests**

Import `getSeasonForDate`, `getHolidayPeakWindows`, and `getSeasonPricingRows` and add:

```ts
describe("holiday peak pricing", () => {
  it("uses the inclusive 2026 Passover peak window", () => {
    expect(getSeasonForDate(new Date(2026, 3, 1)).type).toBe("passover");
    expect(getSeasonForDate(new Date(2026, 3, 9)).type).toBe("passover");
    expect(getSeasonForDate(new Date(2026, 3, 10)).type).toBe("low");
  });

  it("uses the inclusive 2026 Sukkot peak window", () => {
    expect(getSeasonForDate(new Date(2026, 8, 25)).type).toBe("sukkot");
    expect(getSeasonForDate(new Date(2026, 9, 2)).type).toBe("sukkot");
    expect(getSeasonForDate(new Date(2026, 9, 3)).type).toBe("low");
  });

  it("does not invent holiday surcharges for unsupported years", () => {
    const season = getSeasonForDate(new Date(2027, 3, 15));
    expect(season.multiplier).toBe(1);
    expect(season.note).toMatch(/WhatsApp/i);
    expect(getHolidayPeakWindows(2027)).toEqual([]);
  });

  it("builds the 2026 public table from the same seasonal source", () => {
    expect(getSeasonPricingRows(2026).map(row => row.type)).toEqual([
      "high",
      "passover",
      "sukkot",
      "low",
    ]);
  });
});
```

- [ ] **Step 2: Run the pricing tests and verify they fail**

Run:

```bash
pnpm vitest run server/pricing.test.ts
```

Expected: FAIL because the old fixed ranges classify April 10–13 and October 3–9 as holidays and have no unsupported-year note.

- [ ] **Step 3: Implement the shared holiday-window model**

Add exported `SeasonPricingRow` and `HolidayPeakWindow` types, shared high/standard season definitions, and `HOLIDAY_PEAK_WINDOWS_BY_YEAR` with these inclusive local-date ranges:

```ts
2026: [
  { type: "passover", start: "2026-04-01", end: "2026-04-09", multiplier: 1.25, labelEn: "Passover peak window", labelHe: "חלון שיא לפסח" },
  { type: "sukkot", start: "2026-09-25", end: "2026-10-02", multiplier: 1.25, labelEn: "Sukkot peak window", labelHe: "חלון שיא לסוכות" },
]
```

Export `getHolidayPeakWindows(year)` and `getSeasonPricingRows(year)`. The latter returns high season, any supported holiday windows, then standard season, using the same labels and multipliers that `getSeasonForDate` returns. Compare local year/month/day keys so timezone conversion cannot shift boundaries. For unsupported years, return only the normal high/standard public rows and normal high/low calculator data with:

```ts
note: "Holiday peak pricing for this year is confirmed on WhatsApp.";
noteHe: "מחירי שיא לחגים בשנה זו מאושרים בוואטסאפ.";
```

Extend `SeasonInfo` with `noteHe?: string`.

- [ ] **Step 4: Derive public pricing rows from shared data**

Delete `SEASON_TABLE` from `Pricing.tsx` and render every row from `getSeasonPricingRows(new Date().getFullYear())`, including high and standard season. If there are no holiday rows for the current year, render the bilingual manual-confirmation message alongside the shared high/standard rows instead of inventing holiday dates.

- [ ] **Step 5: Surface unsupported-year notes in both calculator breakdowns**

Render `breakdown.season.note` / `noteHe` as an informational callout in `CostCalculator.tsx` and `PriceBreakdownModal.tsx`, even when the seasonal surcharge is zero.

- [ ] **Step 6: Run focused pricing and TypeScript checks**

Run:

```bash
pnpm vitest run server/pricing.test.ts
pnpm check
```

Expected: PASS.

- [ ] **Step 7: Commit seasonal pricing**

```bash
git add server/pricing.test.ts shared/pricing.ts client/src/pages/Pricing.tsx client/src/components/CostCalculator.tsx client/src/components/calculator-v2/PriceBreakdownModal.tsx
git commit -m "fix: make holiday peak pricing year-specific"
```

---

### Task 4: Fix canonical host and dynamic metadata

**Files:**

- Create: `server/vercelConfig.test.ts`
- Modify: `vercel.json`
- Modify: `server/seoMiddleware.ts`
- Modify: `server/seoMiddleware.test.ts`
- Modify: `server/routes/sitemap.ts`
- Modify: `server/sitemap.test.ts`

- [ ] **Step 1: Write failing edge-config and metadata helper tests**

Read `vercel.json` and assert it contains this host-scoped permanent redirect before the existing rewrites:

```ts
expect(config.redirects).toContainEqual({
  source: "/:path*",
  has: [{ type: "host", value: "wiro4x4indochina.com" }],
  destination: "https://www.wiro4x4indochina.com/:path*",
  permanent: true,
});
expect(config.rewrites).toEqual(
  expect.arrayContaining([
    { source: "/api/(.*)", destination: "/api" },
    { source: "/", destination: "/api" },
    { source: "/(.*)", destination: "/api" },
  ])
);
```

Export and test metadata helpers:

```ts
expect(absoluteUrl("/images/post.jpg")).toBe(
  "https://www.wiro4x4indochina.com/images/post.jpg"
);
expect(absoluteUrl("https://cdn.example.com/post.jpg")).toBe(
  "https://cdn.example.com/post.jpg"
);
expect(truncateDescription("one two three four", 13)).toBe("one two…");
```

Add an `injectMeta` fixture test that passes an HTML shell plus a relative image and long description, then asserts that both OG/Twitter images are absolute and the injected description ends on a word boundary.

Update the sitemap test to isolate the `/hebrew-guide` `<url>` block and assert it contains `hreflang="he"` and `x-default`, but no same-URL `hreflang="en"`.

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
pnpm vitest run server/vercelConfig.test.ts server/seoMiddleware.test.ts server/sitemap.test.ts
```

Expected: FAIL because the Vercel redirect is absent, metadata helpers are not exported, truncation cuts raw characters, and the Hebrew sitemap block advertises the same URL as English.

- [ ] **Step 3: Configure the canonical redirect at the Vercel edge**

Add the tested `redirects` entry to `vercel.json` before the existing `rewrites` property. Vercel evaluates redirects before rewrites; the `has` host condition limits the rule to the apex domain, `permanent: true` produces a 308, and the wildcard preserves the path and query string. Do not put this redirect in Express: `createApp()` registers API routes before later middleware in the Vercel entry, while the local entry is intentionally generated under `server/_core/` and must not be edited.

- [ ] **Step 4: Normalize images and descriptions in SEO middleware**

- export `absoluteUrl` and apply it inside `injectMeta` to every OG/Twitter image;
- add and export `truncateDescription(text, maxLength)` that collapses whitespace, preserves whole words, and appends an ellipsis only when truncated;
- use the helper for tour, package, and blog descriptions;
- use the absolute image for `BlogPosting.image` too;
- retain existing titles, canonical paths, cache headers, 404 handling, and JSON-LD structure.

- [ ] **Step 5: Make Hebrew sitemap alternates truthful**

Change `buildHreflangLinks` so `/hebrew-guide` emits only `he` and `x-default`. English pages continue to emit `en` and `x-default`.

- [ ] **Step 6: Run focused SEO tests**

Run:

```bash
pnpm vitest run server/vercelConfig.test.ts server/seoMiddleware.test.ts server/sitemap.test.ts
pnpm check
```

Expected: PASS.

- [ ] **Step 7: Commit canonical SEO cleanup**

```bash
git add vercel.json server/vercelConfig.test.ts server/seoMiddleware.ts server/seoMiddleware.test.ts server/routes/sitemap.ts server/sitemap.test.ts
git commit -m "fix: consolidate canonical host and social metadata"
```

---

### Task 5: Repair the audited contrast failures

**Files:**

- Create: `e2e/accessibility-contrast.spec.ts`
- Modify: `client/src/index.css`
- Modify: `client/src/components/Hero.tsx`
- Modify: `client/src/components/ProductTiers.tsx`
- Modify: `client/src/components/Footer.tsx`
- Modify: `client/src/components/NewsletterSignup.tsx`

- [ ] **Step 1: Write a failing computed-contrast browser test**

Create a small WCAG contrast helper inside the Playwright spec. Check these live elements after dismissing overlays:

- hero `Check Availability on WhatsApp` link: at least 4.5:1;
- `Choose Your Journey` label: at least 4.5:1;
- first `Explore` card action: at least 4.5:1;
- footer newsletter description and input text: at least 4.5:1.

The helper should parse computed `rgb(...)`, calculate relative luminance, and compare `(lighter + 0.05) / (darker + 0.05)`.

- [ ] **Step 2: Run the contrast spec and verify it fails**

Run:

```bash
pnpm exec playwright test e2e/accessibility-contrast.spec.ts --project="Mobile Chrome"
```

Expected: FAIL on the green/white CTA, gold/cream text, and white/cream newsletter elements.

- [ ] **Step 3: Add a semantic readable-accent token and fix components**

In `index.css`, add a light-surface text token such as `--accent-readable: #715700` and expose it through Tailwind’s theme mapping. Preserve the existing gold for decorative borders and non-text icons.

- change the hero WhatsApp CTA to dark green `#075e54` with a darker hover state;
- use `text-accent-readable` for the product eyebrow, card `Explore` text, and footer/newsletter headings on light surfaces;
- remove the giant low-contrast `ADVENTURES` background word rather than treating meaningful-looking text as decoration;
- use `text-muted-foreground`, `bg-background`, `border-border`, `text-foreground`, and readable placeholder styles for the newsletter form.

- [ ] **Step 4: Re-run the contrast test**

Run:

```bash
pnpm exec playwright test e2e/accessibility-contrast.spec.ts --project="Mobile Chrome"
```

Expected: PASS.

- [ ] **Step 5: Commit accessibility corrections**

```bash
git add e2e/accessibility-contrast.spec.ts client/src/index.css client/src/components/Hero.tsx client/src/components/ProductTiers.tsx client/src/components/Footer.tsx client/src/components/NewsletterSignup.tsx
git commit -m "fix: meet contrast requirements on conversion surfaces"
```

---

### Task 6: Self-host critical fonts and optimize hero delivery

**Files:**

- Create: `server/frontend-assets.test.ts`
- Create: `client/public/fonts/dm-serif-display-regular.woff2`
- Create: `client/public/fonts/dm-serif-display-italic.woff2`
- Create: `client/public/fonts/source-sans-3-latin.woff2`
- Create: `client/public/fonts/source-sans-3-italic-latin.woff2`
- Modify: `client/index.html`
- Modify: `client/src/index.css`
- Modify: `client/src/components/OptimizedImage.tsx`
- Modify: `scripts/optimize-images.ts`

- [ ] **Step 1: Add failing frontend-asset regression tests**

Read the source assets with Node and assert:

```ts
expect(indexHtml).not.toContain("fonts.googleapis.com");
expect(indexHtml).not.toContain("fonts.gstatic.com");
expect(indexHtml).toContain("/fonts/dm-serif-display-regular.woff2");
expect(css).toContain('font-family: "DM Serif Display"');
expect(css).toContain("font-display: swap");
expect(optimizedImageSource).not.toContain('document.createElement("link")');
```

Also assert the four font files exist and that `scripts/optimize-images.ts` sets hero WebP quality no higher than 72. Generated responsive image variants are intentionally gitignored, so their byte sizes are checked after running the optimizer rather than required in a clean unit-test checkout.

- [ ] **Step 2: Run the asset test and verify it fails**

Run:

```bash
pnpm vitest run server/frontend-assets.test.ts
```

Expected: FAIL because fonts are remote, local font files do not exist, and `OptimizedImage` injects a second preload.

- [ ] **Step 3: Download and register the audited local font files**

Download these exact Latin WOFF2 resources already requested by the current Google Fonts stylesheet into `client/public/fonts/`, then verify HTTP status, `Content-Type`, and WOFF2 file signatures:

```text
DM Serif Display italic:
https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFhOHM81r4j6k0gjAW3mujVU2B2G_VB0PD2xWr53A.woff2

DM Serif Display normal:
https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFnOHM81r4j6k0gjAW3mujVU2B2G_Bx0vrx52g.woff2

Source Sans 3 italic Latin:
https://fonts.gstatic.com/s/sourcesans3/v19/nwpDtKy2OAdR1K-IwhWudF-R3woAa8opPOrG97lwqLlOxCkSmqXCzTo.woff2

Source Sans 3 normal Latin (variable file used for weights 300–600):
https://fonts.gstatic.com/s/sourcesans3/v19/nwpStKy2OAdR1K-IwhWudF-R3w8aZejf5Hc.woff2
```

Add matching `@font-face` declarations with `font-display: swap` and Latin unicode ranges. The normal Source Sans face may declare `font-weight: 300 600` because the Google-served Latin file is shared across those requested weights.

Replace Google DNS/preconnect/stylesheet tags in `client/index.html` with local font preloads. Retain the Google font origins in the current Helmet CSP because `LanguageContext.tsx` loads Rubik and Heebo on demand for Hebrew; this batch only removes the critical English-page network dependency.

- [ ] **Step 4: Remove post-mount duplicate image preload**

Delete the priority-image `useEffect` that appends a `<link rel="preload">` after React mounts and delete the unused exported `preloadImage()` helper that does the same thing. Remove `useEffect` from the React import if nothing else uses it. Keep `fetchPriority="high"`, eager loading, responsive sources, and the early HTML hero preload.

- [ ] **Step 5: Recompress responsive hero WebP variants**

Change `HERO_WEBP_QUALITY` in `scripts/optimize-images.ts` from 98 to 72 and set `effort: 6` for generated WebP variants. Keep the tracked source image unchanged. Run `pnpm run images:optimize -- --force` so the gitignored responsive variants are regenerated, then inspect the `sm`, `md`, and `lg` outputs visually.

Expected target: `banner-md.webp` below 150 KiB and no visible objectionable artifacts at mobile/desktop crop positions.

- [ ] **Step 6: Run asset, type, and build checks**

Run:

```bash
pnpm vitest run server/frontend-assets.test.ts
pnpm check
pnpm run images:optimize -- --force
pnpm build
pnpm build:frontend
```

Expected: PASS, with generated `banner-md.webp` below 150 KiB and the actual Vercel serverless bundle created at `api/index.js`.

- [ ] **Step 7: Commit performance assets**

```bash
git add server/frontend-assets.test.ts client/public/fonts client/index.html client/src/index.css client/src/components/OptimizedImage.tsx scripts/optimize-images.ts
git commit -m "perf: self-host fonts and reduce hero payload"
```

---

### Task 7: Full verification and before/after audit

**Files:**

- Modify: `todo.md` with a concise completed batch entry, as required by `CLAUDE.md`.
- Create: local ignored audit artifacts under `output/playwright/` only; do not commit them.

- [ ] **Step 1: Update project task tracking**

Add a dated, concise completion entry to `todo.md` covering trust integrity, mobile nav, pricing dates, accessibility, performance assets, and SEO host/metadata.

- [ ] **Step 2: Run repository verification gates**

Run:

```bash
pnpm test
pnpm check
pnpm build
pnpm build:frontend
pnpm exec eslint \
  client/src/const.ts \
  client/src/components/GoogleReviewsSection.tsx \
  client/src/pages/Reviews.tsx \
  client/src/components/TrustBar.tsx \
  client/src/components/SocialProofStrip.tsx \
  client/src/components/Header.tsx \
  shared/pricing.ts \
  client/src/pages/Pricing.tsx \
  client/src/components/CostCalculator.tsx \
  client/src/components/calculator-v2/PriceBreakdownModal.tsx \
  client/src/components/Hero.tsx \
  client/src/components/ProductTiers.tsx \
  client/src/components/Footer.tsx \
  client/src/components/NewsletterSignup.tsx \
  server/seoMiddleware.ts \
  server/routes/sitemap.ts
```

Expected: all pass. Pre-existing unrelated lint errors outside the touched-file list do not block this batch.

- [ ] **Step 3: Run selected browser regressions**

Run:

```bash
pnpm exec playwright test \
  e2e/trust-integrity.spec.ts \
  e2e/mobile.spec.ts \
  e2e/accessibility-contrast.spec.ts \
  --project=chromium
pnpm exec playwright test e2e/mobile.spec.ts e2e/accessibility-contrast.spec.ts --project="Mobile Chrome"
```

Expected: PASS.

- [ ] **Step 4: Run a local production server and Lighthouse**

Build, serve the production output on an unused local port, then capture mobile and desktop Lighthouse JSON. Record:

- mobile performance at least 70;
- mobile LCP at most 5.0 seconds;
- desktop performance at least 90;
- CLS 0;
- mobile TBT at most 360 ms;
- accessibility has no identified contrast failures.

If the local environment produces large variance, run three times and use the median while retaining all reports.

- [ ] **Step 5: Visually inspect desktop, mobile, Hebrew, menu, reviews, pricing, and footer**

Capture screenshots after real scrolling so reveal animations and lazy images execute. Verify no console errors, no synthetic reviews, no overflow, correct RTL behavior, readable footer fields, and an intentionally closable mobile menu.

- [ ] **Step 6: Verify SEO artifacts and document the production-only host check**

Start the actual `pnpm build:frontend` output on an unused local port with a small one-line Node launcher that imports the default Express app from `api/index.js` and calls `app.listen(...)`. Use that server, plus the focused unit tests for dynamic fixtures, to confirm:

- blog OG/Twitter image values are absolute;
- long descriptions end on a word boundary;
- `/hebrew-guide` sitemap alternates do not claim the same URL as English;
- invalid page/tour/blog/package routes remain 404 with `noindex`;
- a static marketing route is served by the built Vercel entry with its injected canonical metadata.

The Vercel `has` host matcher is not executed by `vercel dev`, so do not claim a local apex redirect test. Record a required post-deployment check instead:

```bash
curl -sSI 'https://wiro4x4indochina.com/pricing?from=ad'
```

Expected after deployment: `308` with `Location: https://www.wiro4x4indochina.com/pricing?from=ad`. Also confirm the `www` URL remains `200` and does not loop.

- [ ] **Step 7: Commit task tracking and any verification-driven corrections**

```bash
git add todo.md
git commit -m "docs: record verified website improvement batch"
```

- [ ] **Step 8: Review the branch diff and hand off before deployment**

Run:

```bash
git status --short
git diff --check main...HEAD
git log --oneline main..HEAD
```

Expected: clean tracked worktree, no whitespace errors, focused commits, and no user-owned files from the original dirty worktree.
