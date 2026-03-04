# Wiro 4x4 — Chiang Mai Day Trip Itineraries Design

**Date:** 2026-02-19
**Status:** Approved — moving to implementation

## Overview

Replace the 6 generic placeholder tours with 6 real destination-based day trip itineraries around Chiang Mai. Add multi-day combo packages. All content bilingual (EN/HE), focused on off-the-beaten-path, nature, culture, and unusual experiences.

## Target Audience

- Israeli tourists (Hebrew-speaking, kosher needs, Shabbat awareness)
- International tourists (English-first, adventure-seeking)
- Both markets equally

## New Tour Lineup

| #   | Slug                            | Tour Name                             | Duration | Difficulty    | Price (THB) |
| --- | ------------------------------- | ------------------------------------- | -------- | ------------- | ----------- |
| 1   | `doi-inthanon-roof-of-thailand` | Doi Inthanon — Roof of Thailand       | 7-8h     | Moderate      | 5,000       |
| 2   | `mae-kampong-hidden-village`    | Mae Kampong — Hidden Mountain Village | 5-7h     | Easy-Moderate | 3,500       |
| 3   | `maerim-sticky-waterfalls`      | Maerim & Sticky Waterfalls            | 7-8h     | Easy-Moderate | 4,500       |
| 4   | `doi-suthep-pui-beyond-temple`  | Doi Suthep-Pui — Beyond the Temple    | 5-7h     | Easy-Moderate | 3,500       |
| 5   | `mae-wang-jungle-wilderness`    | Mae Wang — Jungle & River Wilderness  | 8-9h     | Challenging   | 5,500       |
| 6   | `samoeng-loop-mountain-circuit` | Samoeng Loop — The Mountain Circuit   | 8-10h    | Moderate      | 5,000       |

## Multi-Day Packages

| Package                    | Tours                               | Price  | Savings |
| -------------------------- | ----------------------------------- | ------ | ------- |
| 2-Day Peaks & Jungle       | Doi Inthanon + Mae Wang             | 9,500  | 1,000   |
| 2-Day Mountains & Villages | Doi Suthep + Mae Kampong            | 8,000  | 1,000   |
| 3-Day Chiang Mai Explorer  | Doi Suthep + Doi Inthanon + Samoeng | 12,500 | 1,500   |
| 5-Day Complete Chiang Mai  | All 5 best tours                    | 22,000 | 5,000   |

## Implementation Plan

### Files to Modify

1. **`client/src/components/Tours.tsx`** — Replace HARDCODED_TOURS (card data)
2. **`client/src/pages/TourDetail.tsx`** — Replace FALLBACK_TOURS (full itinerary data), extend type to support itinerary/highlights in fallback

### Data Structure

Each tour needs:

- **Card level** (Tours.tsx): slug, image, title/titleHe, short description, duration, difficulty, price, badges
- **Detail level** (TourDetail.tsx): long description, itinerary steps (time-based), highlights, included items, all bilingual

### Image Mapping

| Tour            | Image File                        |
| --------------- | --------------------------------- |
| Doi Inthanon    | `vietnam_rice_terraces.jpg`       |
| Mae Kampong     | `village_hamlet_rice_fields.jpg`  |
| Maerim & Sticky | `waterfall_wide_angle_view.jpg`   |
| Doi Suthep-Pui  | `waterfall_lush_jungle.jpg`       |
| Mae Wang        | `laos_jungle.jpg`                 |
| Samoeng Loop    | `hilltribe_girl_craft_market.jpg` |

### Validation

- `npx tsc --noEmit` — no type errors
- `pnpm test` — no test regressions
- Visual check that tour cards and detail pages render correctly
