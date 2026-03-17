# Gallery Peek Carousel Design

## Goal

Add a featured peek carousel to the top of the `/gallery` page showing admin-curated photos. Current photo displayed large with prev/next photos peeking from the sides. Grid with category filters remains below unchanged.

## Architecture

- New `isFeatured` boolean column on `galleryPhotos` table
- New `gallery.listFeatured` tRPC query (public, no auth)
- New `FeaturedCarousel` component using existing Embla carousel (`ui/carousel.tsx`)
- Admin toggle in Gallery tab to mark photos as featured
- Carousel hidden if no featured photos exist (graceful fallback)

## Components

### FeaturedCarousel (`client/src/components/FeaturedCarousel.tsx`)

- Embla carousel with `slidesToScroll: 1`, partial visible slides (peek effect)
- Center slide at ~60% width, side slides at ~20% each with opacity reduction
- Click on center slide opens existing lightbox
- Navigation: swipe + arrow buttons + dot indicators
- Gold accent on active dot, matching site design system
- Bilingual title: "Featured Photos" / "תמונות נבחרות"
- Responsive: full-width on mobile (no peek), peek on tablet+

### Schema Change

- `galleryPhotos.isFeatured` — `int` (0/1, Manus convention), default 0
- Migration via `pnpm db:push`

### API

- `gallery.listFeatured` — public query, returns `galleryPhotos` where `isFeatured = 1` AND `isPublished = 1`, ordered by `createdAt desc`, limit 8

### Admin

- Add star/toggle icon in Gallery admin tab photo cards
- Clicking toggles `isFeatured` via existing `gallery.update` mutation

## Page Layout (top to bottom)

1. Header
2. Breadcrumb
3. Hero section (existing — camera icon, title, description)
4. **NEW: FeaturedCarousel** (only if featured photos exist)
5. Category filters (existing)
6. Photo grid with infinite scroll (existing)
7. Lightbox dialog (existing)
8. Footer

## Design Tokens

- Active dot: `#D4AF37` (gold)
- Inactive dot: `rgba(255,255,255,0.3)`
- Arrow buttons: same style as lightbox arrows
- Carousel background: `#1C1C1C` (matching hero)
- Side slides opacity: 0.5
- Center slide border: `2px solid #D4AF37`

## Edge Cases

- 0 featured photos → carousel section hidden entirely
- 1 featured photo → show as single centered image, no arrows/dots
- 2 featured photos → peek shows both, no dots needed
- Broken S3 image → same `onError` pattern as grid, hide from carousel
