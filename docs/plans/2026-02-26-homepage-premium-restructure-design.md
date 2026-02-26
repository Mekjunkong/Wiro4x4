# Homepage Premium Restructure — Design Document

**Date:** 2026-02-26
**Status:** Approved
**Approach:** B — Premium Restructure (reuse existing data layer + UI library, restructure homepage flow)
**Inspiration:** senior.co.il (Beshvil HaZahav) — premium Israeli travel company

## Goals

1. **More bookings/leads** — stronger CTAs, trust signals, urgency, smoother conversion path
2. **Premium brand perception** — visual polish matching senior.co.il's quality while keeping adventure identity
3. **Better content showcase** — tours, gallery, and reviews sell themselves

## Header Changes

- **Logo:** Significantly larger (~2x current size)
- **Behavior:** Transparent on hero → solid on scroll (like senior.co.il)
- **Remove:** Packages link from navigation
- **Book Now button:** Gold accent, always visible

## Homepage Section Flow

### 1. Announcement Bar (NEW)

- Slim fixed bar above header (36px height)
- Gold background (#d4af37), dark text
- Rotating seasonal offers (e.g., "Book 3+ days and get 10% off")
- Dismissible with X button (persists in localStorage)
- Bilingual via `t()` hook
- New component: `AnnouncementBar.tsx`

### 2. Hero (REPLACED)

- **Single image:** `/images/banner.jpeg` (travelers + branded 4x4 on jungle road)
- **No carousel** — remove 3-slide carousel + GSAP Ken Burns animations
- Full viewport height (100vh)
- Bottom 50% dark gradient overlay for text readability
- Content: "WIRO 4×4" heading + "Kosher Off-Road Adventures in Chiang Mai" subtitle
- CTAs: "Explore Tours" (gold) + "WhatsApp Us" (outlined)
- Trust badge pills: Hebrew Speaking | Kosher Meals | Shabbat Friendly | Private Tours
- Animated scroll chevron at bottom

### 3. Stats Counter (FIXED)

- Fix "0+" values with reasonable estimates:
  - 500+ Tours Completed
  - 120+ Happy Travelers
  - 6 Unique Routes
  - 100% Kosher Certified
- Count-up animation on scroll into view (Intersection Observer)
- Horizontal row with icons, gold numbers, muted labels
- New component: `StatsCounter.tsx`

### 4. Tours with Filters (ENHANCED)

- **Filter bar:** Horizontal chips
  - Difficulty: All | Easy | Moderate | Challenging
  - Duration: Half Day (5-7h) | Full Day (7-10h)
- **Layout:** 3-column grid (desktop), 2 (tablet), 1 (mobile)
- **Card redesign:**
  - Large image (aspect-ratio 16/10) with hover zoom
  - Price badge overlay (top-right corner)
  - Tour name, short description
  - Duration + difficulty badges
  - Kosher/Private/Shabbat tags
  - "View Details →" link
- "Estimate Your Trip Cost" CTA below grid
- Modify existing `Tours.tsx`

### 5. Gallery Showcase (NEW)

- Masonry-style grid (3 columns), 6-8 best photos
- Hover effect: slight zoom + caption overlay with location name
- "See Full Gallery →" CTA button
- Source: `trpc.gallery.list` with fallback to local images
- New component: `GalleryShowcase.tsx`

### 6. Cost Estimator (REPOSITIONED)

- Move existing `CostCalculator` higher in page (from bottom to mid-page)
- Add premium card background and shadow
- Keep all existing functionality as-is

### 7. Trust & Kosher (RESTYLED)

- Combine current "Why WIRO" and "Kosher Logistics" into one section
- **Left column:** Large photo of Wiro guide (existing asset)
- **Right column:** 2×3 grid of trust points with icons
  - First Kosher 4x4 Company | Hebrew Guides | Shabbat-Friendly
  - Private Tours | Real Off-Road | WhatsApp Support
- **Below:** Kosher logistics accordion (collapsed by default)
- Warm cream background to visually separate
- Modify existing `TrustAndKosher.tsx`

### 8. Testimonials (ENHANCED)

- Header: "What Our Travelers Say" + aggregated 5.0 rating from 120+ travelers
- 3 visible review cards at a time (carousel with arrows)
- Card: quote icon, 5 stars, review text, author name + location
- Hover lift animation on cards
- "See All Reviews →" CTA
- Source: existing `trpc.review.listPublic`
- Modify existing `Testimonials.tsx`

### 9. Community Connection (KEPT AS-IS)

Chabad community section with city icons — no changes.

### 10. Quote Form (KEPT, POLISHED)

Existing `QuickInquiryForm` with tighter spacing and premium card shadow.

### 11. FAQ (KEPT AS-IS)

14 Q&A items with JSON-LD structured data — no changes.

### 12. Newsletter CTA (NEW)

- Gold gradient or dark navy background
- Copy: "Get exclusive tour deals and travel tips"
- Email input + Subscribe button
- Reuse existing `trpc.newsletter.subscribe` endpoint
- Bilingual support
- New component: `NewsletterCTA.tsx`

### 13. Footer (KEPT AS-IS)

No changes.

## Removed Sections

- **Packages section** — removed per user request
- **Hero carousel** — replaced with single banner.jpeg
- **GSAP hero animations** — simplified (no Ken Burns needed)

## Files Affected

### Modified

- `client/src/pages/Home.tsx` — section order + imports
- `client/src/components/Hero.tsx` — rewrite (single image, no carousel)
- `client/src/components/Header.tsx` — bigger logo, transparent→fixed, remove packages
- `client/src/components/Tours.tsx` — filter chips, grid layout, card redesign
- `client/src/components/TrustAndKosher.tsx` — combined layout restyle
- `client/src/components/Testimonials.tsx` — enhanced cards + rating header
- `client/src/components/QuickInquiryForm.tsx` — polish spacing/shadows

### New Components

- `client/src/components/AnnouncementBar.tsx`
- `client/src/components/StatsCounter.tsx`
- `client/src/components/GalleryShowcase.tsx`
- `client/src/components/NewsletterCTA.tsx`

### Removed Dependencies

- GSAP (if only used for hero Ken Burns — verify before removing)

## Design Tokens (Unchanged)

- Primary: #1c1c1c (charcoal)
- Gold/Accent: #d4af37
- Background: #faf7f2 (ivory)
- Card: #fdfbf7 (soft cream)
- Fonts: Oswald (headings), Source Sans 3 (body), Heebo/Rubik (Hebrew)

## Success Criteria

1. Stats section shows real numbers (not "0+")
2. Hero loads fast with single optimized image
3. Tour filtering works by difficulty and duration
4. All sections bilingual (EN/HE)
5. Mobile responsive across all new sections
6. No regression in existing functionality (booking, admin, etc.)
7. Lighthouse performance score maintained or improved
