# Landing Page Redesign — Cinematic Scroll

**Date:** 2026-02-20
**Branch:** `feature/landing-page`
**Approach:** Cinematic Scroll (Approach A)

## Goal

Modernize the landing page with a luxury adventure aesthetic: dark backgrounds, cinematic imagery, gold accents, and full-bleed photos. Consolidate from 9 sections to 6 for a more focused, premium experience.

## Design Direction

- **Palette:** Dark backgrounds (`#0F0F0F`, `#141414`, `#1C1C1C`), gold accents (`#D4AF37`), white text
- **Typography:** Keep Cormorant Garamond for headings, system sans-serif for body
- **Animations:** Keep existing GSAP entrance on hero, add scroll-reveal to other sections
- **Images:** Full-bleed where possible, WebP with JPG fallback (existing optimized images)

## Section Lineup

### 1. Cinematic Hero (refine existing)

- Full viewport height, dark image with gradient overlay
- Keep existing GSAP entrance animation
- Darken gradient overlay (`from-black/80`)
- Replace Ken Burns with subtle slow-zoom parallax on scroll
- Trust badges become gold-bordered pills (instead of pipe-separated text)
- Same content: title, tagline, location, two CTAs, trust items

**File:** `client/src/components/Hero.tsx` (modify)

### 2. Tours Showcase (restyle)

- Dark section background (`#0F0F0F`)
- Dark card backgrounds (`#1C1C1C`)
- Taller image area (60% of card height)
- Gold hover glow effect on cards
- Add "Estimate Your Trip Cost" CTA link to `/estimate` at bottom
- Absorbs TripCostEstimator section (just a link, not the full component)

**File:** `client/src/components/Tours.tsx` (modify)

### 3. Trust & Kosher (new merged section)

Consolidates: WhyWiro + KosherInfo + CommunityConnection

- Split layout: large image left, content right
- 6 trust points as compact icon + one-liner rows
- Brief kosher summary paragraph (not 6 separate cards)
- CommunityConnection absorbed into "Trusted by 120+ Israeli travelers" bullet
- Dark background
- Mobile: image stacks on top, content below

**File:** `client/src/components/TrustAndKosher.tsx` (new)

### 4. Social Proof (redesign testimonials)

- Dark background (`#141414`)
- Embla carousel (already in dependencies)
- Desktop: 3 testimonials visible | Tablet: 2 | Mobile: 1
- Dark cards with gold left-border accent
- Large serif quotes (Cormorant Garamond)
- Star rating summary above carousel
- Auto-advance every 6 seconds, manual arrows on desktop
- Dot indicators
- "See All Reviews" link

**File:** `client/src/components/Testimonials.tsx` (modify)

### 5. Get a Quote (restyle inquiry form)

- Dark background
- Dark input fields with subtle borders, gold focus rings
- Gold CTA button
- Same form logic (trpc.lead.create, same validation)
- Full-width section (no longer split with FAQ)

**File:** `client/src/components/QuickInquiryForm.tsx` (modify)

### 6. FAQ (restyle)

- Dark background, dark accordion panels
- Gold expand/collapse indicators
- Keep existing FAQ content
- Stays as its own section

**File:** `client/src/components/FAQ.tsx` (modify)

## Removed Sections

| Removed             | Disposition                           |
| ------------------- | ------------------------------------- |
| TripCostEstimator   | Replaced by CTA link in Tours section |
| WhyWiro             | Merged into Trust & Kosher            |
| KosherInfo          | Merged into Trust & Kosher            |
| CommunityConnection | Merged into Trust & Kosher            |

## Home.tsx New Section Order

```tsx
<Header />
<Hero />
<Tours />
<TrustAndKosher />
<Testimonials />
<QuickInquiryForm />
<FAQ />
<Footer />
<FloatingActionButtons />
```

## Files to Modify

| File                                         | Action                                                       |
| -------------------------------------------- | ------------------------------------------------------------ |
| `client/src/pages/Home.tsx`                  | Update section order, remove old imports, add TrustAndKosher |
| `client/src/components/Hero.tsx`             | Darken overlay, trust badge pills, remove Ken Burns          |
| `client/src/components/Tours.tsx`            | Dark theme, card styling, add estimate CTA                   |
| `client/src/components/Testimonials.tsx`     | Carousel with Embla, dark theme, 3-up layout                 |
| `client/src/components/QuickInquiryForm.tsx` | Dark theme styling                                           |
| `client/src/components/FAQ.tsx`              | Dark theme accordion                                         |
| `client/src/components/TrustAndKosher.tsx`   | **New** — merged WhyWiro + KosherInfo + Community            |
| `client/src/index.css`                       | Dark theme CSS variables, new utility classes                |

## Files NOT Modified

- WhyWiro.tsx, KosherInfo.tsx, CommunityConnection.tsx — kept for reference but not imported in Home.tsx
- TripCostEstimator component — kept for /estimate page, just removed from Home
- No backend changes
- No database changes
- No test changes needed (frontend-only)

## Constraints

- Bilingual support (t() pattern) must be maintained in all sections
- Existing GSAP/Framer Motion animations should be preserved where possible
- All existing images used (no new image assets required)
- Mobile-first responsive design
- Accessibility: maintain aria labels, keyboard navigation, reduced-motion support
