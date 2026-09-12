# Mae Hong Son Loop and Cover Flow Autoplay Implementation Plan

**Goal:** Publish a production-ready Mae Hong Son Expedition Atlas guide and add accessible 6.5-second autoplay to the existing homepage cover flow without changing unrelated WIRO surfaces.

**Owner:** Codex implementation; WIRO retains approval of route geometry, commercial claims, and future Google My Map ownership.

## Milestones

| Milestone             | Owner            | Done criteria                                                                                 |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| Autoplay behavior     | Carousel owner   | Timer, pause state, play/pause, RTL and reduced-motion tests pass                             |
| Guide data and page   | Route-page owner | 4/5/6-day and motorcycle/4x4 guide works responsively in English and Hebrew                   |
| Discovery integration | SEO owner        | App route, internal links, metadata, fallback content, sitemap and WhatsApp attribution agree |
| Production candidate  | QA owner         | Build, focused tests and real-browser desktop/mobile/RTL checks pass                          |
| Release               | Human checkpoint | WIRO approves screenshots and production deployment; public routes are verified after merge   |

## Work Breakdown

### 1. Autoplay system

- Add a pure autoplay eligibility helper and focused tests.
- Wire the one-shot 6.5-second timer into the existing Embla component.
- Add viewport, visibility, hover, focus, drag, dialog, reduced-motion and manual-pause conditions.
- Add localized persistent Play/Pause and clearer detail guidance.
- Verify logical next direction in English and Hebrew.

### 2. Mae Hong Son content system

- Add typed route, pace, stage, highlight and safety data.
- Record official source URLs, last-verified dates and live-check flags.
- Generate resilient stage-level Google Maps directions and attraction search links.
- Avoid exact distance, operating status, pricing and package claims that lack WIRO approval.

### 3. Expedition Atlas page

- Build the cinematic hero, pace selector, vehicle selector and route ribbon.
- Build the map overview, stage chapters and filterable photo highlight rail/grid.
- Build safety and WIRO planning CTA sections.
- Preserve no-JavaScript link behavior, keyboard operation, semantic hierarchy and RTL.

### 4. Platform integration

- Add the lazy route to `App.tsx`.
- Add Mae Hong Son entry cards to relevant motorcycle and private/4x4 discovery surfaces without replacing current tour products.
- Add canonical metadata, structured data, server fallback content and sitemap entry.
- Add durable English/Hebrew WhatsApp attribution sources and tests.

### 5. Media and performance

- Audit existing WIRO images for truthful regional use.
- Generate only the minimum missing cinematic editorial asset; do not present it as documentary proof of an exact attraction.
- Add explicit image dimensions, eager-load only the hero and lazy-load below-the-fold media.

### 6. QA and release

- Run formatting, TypeScript, lint, focused unit tests and production build.
- Use a real browser at 375, 390, 430, 768, 1024 and 1440 pixels.
- Verify autoplay timing/pauses, swipe, arrows, keyboard, Play/Pause, dialogs, image loading, overflow and console output.
- Repeat the key checks in Hebrew RTL and reduced motion.
- Present screenshots and diffs for the human deployment checkpoint.
- After approval, publish through the repository's existing Vercel/GitHub path and verify the public English/Hebrew routes.

## Dependencies

```text
approved specs
  -> typed route data -> page UI -> SEO and internal links -> browser QA -> human release approval
  -> autoplay helper  -> Embla integration -------------------^
  -> image audit/generation -----------------> page media ----^
```

## Failure Paths

- Map unavailable: show route ribbon and normal stage/attraction Google Maps links.
- Live attraction fact uncertain: omit the fact and show a live-check note.
- Generated image visually inaccurate: use a truthful regional WIRO image instead.
- Autoplay state uncertain: clear the timer and preserve the complete manual carousel.
- Reduced motion requested: disable autoplay and transform animation.
- Inherited E2E failures: compare with current `main`, isolate feature regressions, and report the distinction accurately.
