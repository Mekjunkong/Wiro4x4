# WIRO Cinematic Hero Banner Implementation Plan

**Goal:** Replace the homepage's static hero background with the approved
15-second still-photo sequence while preserving its bilingual conversion
content, accessibility, and mobile performance.

**Architecture:** Add a presentation-only `CinematicHeroBackground` component
under the existing `Hero`. Keep the WIRO group image as the permanent semantic
base and middle scene, then animate the landscape and water-crossing overlays
with CSS opacity and transform keyframes. Continue using `OptimizedImage` and the
existing Vercel image-build pipeline.

**Tech stack:** React 19, TypeScript, Tailwind CSS 4, CSS keyframes,
`OptimizedImage`, Vitest with React server rendering, Playwright, Sharp, and
Vite.

**Design spec:**
`docs/superpowers/specs/2026-07-31-cinematic-hero-banner-design.md`

**Estimated effort:** 5–7 hours, including visual QA and a 25% contingency.

**Owners:** Implementer for code and verification; user for final visual
acceptance.

---

## Success Criteria

- The hero loops through landscape → WIRO group → water crossing in 15 seconds.
- Cross-dissolves are 1.0 second with no blank or flashing frame.
- Existing English and Hebrew copy, WhatsApp attribution, CTAs, and scroll
  behavior are unchanged.
- Reduced-motion users receive the existing static WIRO
  travelers-and-vehicle image.
- All three scenes use successful responsive WebP/JPEG requests in the production
  build.
- Combined WebP payload stays at or below 250 KB on mobile and 600 KB on
  desktop.
- Focused tests, homepage tests, language tests, typecheck, and both production
  build paths pass.
- Manual desktop, mobile, and RTL inspection finds no subject cropping or text
  contrast regression.

---

## Milestones

| #   | Milestone                              | Target        | Owner       | Success Criteria                                                             |
| --- | -------------------------------------- | ------------- | ----------- | ---------------------------------------------------------------------------- |
| 1   | Component contract locked              | End of Task 1 | Implementer | Focused test proves the three assets, semantic base, and decorative overlays |
| 2   | Cinematic sequence integrated          | End of Task 2 | Implementer | Homepage shows the approved timing and retains all existing actions          |
| 3   | Performance and accessibility verified | End of Task 3 | Implementer | Budgets, reduced motion, RTL, and automated gates pass                       |
| 4   | Visual acceptance                      | End of Task 3 | User        | User approves desktop and mobile result                                      |

---

## File Map

- `client/src/components/CinematicHeroBackground.tsx` — scene configuration,
  permanent fallback, and animated overlay markup.
- `client/src/components/CinematicHeroBackground.test.tsx` — server-rendered
  component contract and accessibility semantics.
- `client/src/components/Hero.tsx` — replace the single background image with
  `CinematicHeroBackground`; leave booking logic unchanged.
- `client/src/index.css` — 15-second sequence, scene movement, grain, responsive
  crops, and explicit reduced-motion fallback.
- `e2e/homepage.spec.ts` — assert the cinematic background and unchanged hero
  actions on the real page.
- `client/public/images/optimized/` — locally generated responsive image outputs;
  existing ignore rules keep derived files out of Git.

No dependency or package-file change is expected.

---

## Task 1: Lock the component and accessibility contract

**Effort:** 1.5–2 hours

**Depends on:** Approved design spec

**Done when:** A focused test fails first, then passes against the isolated
background component.

**Files:**

- Create: `client/src/components/CinematicHeroBackground.tsx`
- Create: `client/src/components/CinematicHeroBackground.test.tsx`

- [ ] **Step 1: Write the failing server-rendered component test**

Use `renderToStaticMarkup` from `react-dom/server`; no browser DOM dependency is
needed. Assert:

- the semantic base uses `tourists_with_4x4`;
- the overlays use `mountain_sunset_golden` and `4x4_water_splash`;
- the base keeps the localized descriptive alt text;
- overlay images are decorative with empty alt text and `aria-hidden="true"`;
- the root exposes a stable `data-testid="cinematic-hero-background"`;
- there are exactly two animated overlays, so the group image is not duplicated.

- [ ] **Step 2: Run the focused test and verify the expected failure**

```bash
pnpm vitest run client/src/components/CinematicHeroBackground.test.tsx
```

Expected: FAIL because `CinematicHeroBackground` does not exist.

- [ ] **Step 3: Implement the presentation-only component**

Keep static scene data in the component module:

```ts
const scenes = {
  base: "tourists_with_4x4",
  landscape: "mountain_sunset_golden",
  action: "4x4_water_splash",
} as const;
```

Render:

1. the permanent `tourists_with_4x4` layer with the localized alt text;
2. the landscape overlay;
3. the action overlay;
4. a non-interactive grain layer.

The component accepts only the base image's localized `alt` string. It owns no
language context, WhatsApp behavior, CTA, timer, or state.

Give each image intrinsic width and height, `sizes="100vw"`, and a
scene-specific class. Give only the opening landscape high fetch priority; the
base and action layers use asynchronous decoding without a second high-priority
request.

- [ ] **Step 4: Run the focused test**

```bash
pnpm vitest run client/src/components/CinematicHeroBackground.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the component contract**

```bash
git add client/src/components/CinematicHeroBackground.tsx \
  client/src/components/CinematicHeroBackground.test.tsx
git commit -m "feat: add cinematic hero background layers"
```

---

## Task 2: Add the approved sequence and integrate it into the hero

**Effort:** 2–2.5 hours

**Depends on:** Task 1

**Done when:** The homepage follows the approved sequence without changing
conversion behavior.

**Files:**

- Modify: `client/src/index.css`
- Modify: `client/src/components/Hero.tsx`
- Modify: `e2e/homepage.spec.ts`

- [ ] **Step 1: Extend the homepage regression test**

Before changing `Hero`, add assertions that:

- `[data-testid="cinematic-hero-background"]` exists;
- the WhatsApp CTA remains a link with the existing accessible name and a
  `wa.me` destination;
- the route-ideas CTA remains a button;
- switching to Hebrew still produces a Hebrew hero heading and RTL document.

Run:

```bash
pnpm exec playwright test e2e/homepage.spec.ts --project=chromium \
  --grep "cinematic|hero|Hebrew"
```

Expected: FAIL on the missing cinematic background.

- [ ] **Step 2: Add the 15-second CSS sequence**

Use the permanent group layer as the middle scene. Animate only the landscape
and action overlays:

| Loop percentage | Visible result                                |
| --------------- | --------------------------------------------- |
| 0–26.67%        | Landscape holds                               |
| 26.67–33.33%    | Landscape dissolves to the group              |
| 33.33–60%       | Group holds                                   |
| 60–66.67%       | Action dissolves over the group               |
| 66.67–93.33%    | Action holds                                  |
| 93.33–100%      | Action dissolves into the next landscape loop |

Combine opacity with independent `scale(1.02)` to `scale(1.08)` and restrained
translations. Use scene-specific `object-position` values for mobile and
desktop. Apply a subtle inline/CSS grain texture and preserve the existing
bottom contrast gradient in `Hero`.

Add an explicit reduced-motion rule:

```css
@media (prefers-reduced-motion: reduce) {
  .cinematic-hero__overlay {
    display: none;
  }
}
```

This rule must override the sequence independently of the repository's global
reduced-motion duration reset.

- [ ] **Step 3: Integrate the component without touching conversion logic**

In `Hero.tsx`:

- remove only the single background `OptimizedImage`;
- render `CinematicHeroBackground` with the same localized alt text;
- keep the gradient, copy, WhatsApp source codes and message, route scrolling,
  trust note, and scroll cue unchanged.

- [ ] **Step 4: Run focused and homepage tests**

```bash
pnpm vitest run client/src/components/CinematicHeroBackground.test.tsx
pnpm exec playwright test e2e/homepage.spec.ts --project=chromium \
  --grep "cinematic|hero|Hebrew"
```

Expected: PASS.

- [ ] **Step 5: Commit the integrated sequence**

```bash
git add client/src/index.css client/src/components/Hero.tsx \
  e2e/homepage.spec.ts
git commit -m "feat: animate WIRO cinematic hero sequence"
```

---

## Task 3: Verify responsive assets, performance, and visual behavior

**Effort:** 1.5–2.5 hours

**Depends on:** Task 2

**Done when:** Production assets and quality gates pass, and the user can review
desktop and mobile captures.

**Files:**

- Modify only if verification finds a scoped defect:
  `client/src/components/CinematicHeroBackground.tsx`,
  `client/src/index.css`, `client/src/components/Hero.tsx`,
  `e2e/homepage.spec.ts`
- Generated but ignored:
  `client/public/images/optimized/{tourists_with_4x4,mountain_sunset_golden,4x4_water_splash}-{sm,md,lg}.{webp,jpg}`

- [ ] **Step 1: Generate the production-responsive variants**

Run the same pipeline Vercel uses:

```bash
pnpm run images:optimize
```

Confirm all 18 selected outputs exist. Do not force-add the ignored derived
files and do not commit unrelated optimizer output.

- [ ] **Step 2: Check payload budgets**

Use a small read-only Node command or filesystem-size check to total the three
`sm.webp` files and the three `lg.webp` files.

Expected:

- `sm.webp` total ≤ 250 KB;
- `lg.webp` total ≤ 600 KB.

If a budget fails, adjust quality for these three assets through the existing
optimizer's hero-image classification or a narrowly scoped configuration
change. Do not reduce unrelated gallery quality.

- [ ] **Step 3: Run automated gates**

```bash
pnpm check
pnpm vitest run client/src/components/CinematicHeroBackground.test.tsx
pnpm exec playwright test e2e/homepage.spec.ts e2e/language.spec.ts \
  --project=chromium
pnpm build
pnpm build:frontend
```

Expected: all commands PASS.

- [ ] **Step 4: Verify real production asset requests**

Serve the actual `build:frontend` output and inspect the homepage network log.
Confirm that the selected `sm`, `md`, or `lg` WebP files return `200`, with no
avoidable responsive-image 404 fallbacks.

- [ ] **Step 5: Perform manual visual QA**

Inspect at minimum:

- desktop English;
- common phone width English;
- desktop or phone Hebrew RTL;
- reduced motion;
- one simulated overlay-image failure;
- two complete loops on desktop and mobile.

Check subject crops, text contrast, dissolve timing, blank frames, initial-load
flash, CTA readability, and whether the overall rhythm reads as quiet → human →
action.

Capture desktop and mobile screenshots for user review. Because still images
cannot prove timing, also report that two full loops were watched.

- [ ] **Step 6: Commit only scoped QA fixes**

If QA requires changes, commit only the affected hero files:

```bash
git add client/src/components/CinematicHeroBackground.tsx \
  client/src/index.css client/src/components/Hero.tsx e2e/homepage.spec.ts
git commit -m "polish: refine cinematic hero crops and timing"
```

If no files change, do not create an empty commit.

---

## Dependencies Map

```text
Approved design
      │
      ▼
Component contract and test
      │
      ▼
CSS sequence + Hero integration
      │
      ├──────────────┐
      ▼              ▼
Responsive assets   Automated regression gates
      └──────┬───────┘
             ▼
     Manual visual QA
             ▼
      User acceptance
```

**Critical path:** component contract → sequence integration → responsive
asset verification → manual visual QA → user acceptance.

---

## Risks and Mitigation

| Risk                                                  | Impact | Probability | Mitigation                                                                            |
| ----------------------------------------------------- | ------ | ----------- | ------------------------------------------------------------------------------------- |
| Bright landscape or water reduces text contrast       | High   | Medium      | Retain the current bottom-heavy gradient and verify every scene                       |
| Mobile crop loses the vehicle or people               | High   | Medium      | Use per-scene mobile `object-position`; adjust crops rather than content layout       |
| Later image is not ready before its first dissolve    | Medium | Low         | Load above-fold overlays immediately and keep the group base permanently visible      |
| Three hero images regress LCP or bandwidth            | High   | Medium      | One high-priority scene, responsive WebP variants, explicit combined payload budgets  |
| Global reduced-motion reset leaves an overlay visible | Medium | Medium      | Explicitly hide animated overlays in the reduced-motion media query                   |
| Build pipeline generates unrelated ignored outputs    | Low    | High        | Review Git status and commit only source code; never force-add derived variants       |
| Animation feels like a carousel                       | Medium | Medium      | No controls or captions; slow motion, fixed copy, and one continuous 15-second rhythm |

---

## Final Handoff

Report:

- exact files changed and commits created;
- automated commands and results;
- `sm.webp` and `lg.webp` combined payloads;
- desktop, mobile, Hebrew, reduced-motion, and image-failure QA results;
- any behavior intentionally left unchanged;
- a visual preview for final user acceptance.
