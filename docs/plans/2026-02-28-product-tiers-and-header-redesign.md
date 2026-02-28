# Product Tiers & Header Redesign

**Date:** 2026-02-28
**Status:** Approved

## 1. Cinematic Product Tier Cards

**Goal:** Make the "Our Adventures" section feel adventure-driven and visually impactful.

### Photo Changes

| Card    | Current                            | New                    | Reason                                                 |
| ------- | ---------------------------------- | ---------------------- | ------------------------------------------------------ |
| One-Day | `4x4_water_splash`                 | Keep                   | Action shot works perfectly                            |
| 3D2N    | `mountain_peak_sunrise_golden`     | `nong_khiaw_river`     | Epic aerial valley view feels like a multi-day journey |
| 14-Day  | `pickup_truck_dirt_road_mountains` | `vang_vieng_mountains` | Dramatic Laos karst mountains = "grand expedition"     |

### Card Layout (Cinematic Style)

- **Image area: ~70% of card** — increase from `h-56 md:h-64` to `h-72 md:h-80`
- **Title + price overlaid on image** at bottom, on a `from-black/70` gradient
- **Slim content footer (~30%)** with description, meta pills, and "Explore" CTA
- **Hover:** image scales 1.08x, card lifts with stronger shadow
- **Badge:** stays top-right, gold background

### Section Header

Keep "Choose Your Journey" / "Our Adventures" — no change needed.

## 2. Compact Floating Header

**Problem:** The full header bar is 96-144px tall and stays fixed on scroll, eating too much screen real estate.

**Solution:** When scrolled, shrink the header to a compact bar with:

- Logo shrinks from `h-24/h-32/h-36` down to `h-12 md:h-14`
- Header height shrinks from `h-24/h-32/h-36` to `h-16 md:h-18`
- Navigation text size stays the same
- Smooth transition between full and compact states

**Before scroll (on hero):** Full-size transparent header with large logo
**After scroll:** Compact sticky header with small logo, background blur, ~64px tall

## Implementation Tasks

1. Update `ProductTiers.tsx` — new photos + cinematic card layout
2. Update `Header.tsx` — compact scrolled state with smaller logo
3. Sync root-level copies if needed
4. TypeScript check + tests
5. Commit and push
