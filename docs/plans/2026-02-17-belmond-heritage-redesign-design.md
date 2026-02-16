# Wiro4x4 "Belmond Heritage" Full Visual Redesign

**Date:** 2026-02-17
**Status:** Approved
**Reference:** Belmond.com (heritage luxury — refined, gold accents, serif typography, elegant transitions)
**Scope:** Full redesign of all pages — palette, typography, hero, components, layouts, animations

---

## 1. Color Palette

### Light Mode

| Token                    | Hex       | Usage                                                  |
| ------------------------ | --------- | ------------------------------------------------------ |
| `--primary`              | `#1C1C1C` | Primary text, nav, headings, button borders            |
| `--primary-foreground`   | `#FFFFFF` | Text on primary backgrounds                            |
| `--background`           | `#FAF7F2` | Page background (warm ivory)                           |
| `--foreground`           | `#2C2C2C` | Body text (true charcoal)                              |
| `--card`                 | `#FDFBF7` | Card backgrounds (soft cream)                          |
| `--card-foreground`      | `#2C2C2C` | Card text                                              |
| `--secondary`            | `#D4AF37` | Gold accent — buttons, borders, dividers, hover states |
| `--secondary-foreground` | `#1C1C1C` | Text on gold backgrounds                               |
| `--accent`               | `#D4AF37` | Same as secondary (gold)                               |
| `--accent-foreground`    | `#1C1C1C` | Text on accent backgrounds                             |
| `--muted`                | `#E8E2DA` | Borders, dividers, secondary backgrounds (warm stone)  |
| `--muted-foreground`     | `#6B6560` | Muted text, placeholders                               |
| `--border`               | `#E8E2DA` | Default borders                                        |
| `--input`                | `#E8E2DA` | Input borders                                          |
| `--ring`                 | `#D4AF37` | Focus ring (gold)                                      |
| `--destructive`          | `#B91C1C` | Error states                                           |

### Tertiary (Sparingly Used)

| Token          | Hex                      | Usage                                        |
| -------------- | ------------------------ | -------------------------------------------- |
| `--green`      | `#2D5A3D`                | "Kosher Certified" badges, nature icons only |
| `--gold-hover` | `#BF9B30`                | Darker gold for hover states                 |
| `--gold-muted` | `#D4AF37` at 20% opacity | Gold tint backgrounds, badges                |

### Dark Mode

| Token                | Hex                             |
| -------------------- | ------------------------------- |
| `--background`       | `#1A1A1A`                       |
| `--foreground`       | `#F0EDE8`                       |
| `--card`             | `#242420`                       |
| `--muted`            | `#2E2E2A`                       |
| `--muted-foreground` | `#9B9590`                       |
| `--secondary`        | `#D4AF37` (gold stays the same) |
| `--border`           | `#3A3A35`                       |

---

## 2. Typography

### Font Families

| Role                  | Font               | Weight             | Source                        |
| --------------------- | ------------------ | ------------------ | ----------------------------- |
| Display/Headings (EN) | Cormorant Garamond | 300, 400, 500, 600 | Google Fonts                  |
| Body (EN)             | DM Sans            | 400, 500, 600      | Google Fonts                  |
| Headings (HE)         | Frank Ruhl Libre   | 400, 500, 700      | Google Fonts                  |
| Body (HE)             | Heebo              | 400, 500           | Google Fonts (already loaded) |
| Nav/Labels            | DM Sans            | 500                | (same as body)                |

### Type Scale

| Element    | Size                   | Weight      | Style                                  |
| ---------- | ---------------------- | ----------- | -------------------------------------- |
| Hero h1    | `text-7xl md:text-9xl` | 300 (light) | Cormorant Garamond                     |
| Section h2 | `text-4xl md:text-5xl` | 500         | Cormorant Garamond                     |
| Section h3 | `text-2xl md:text-3xl` | 500         | Cormorant Garamond                     |
| Body       | `text-lg`              | 400         | DM Sans, `leading-relaxed`             |
| Nav items  | `text-xs`              | 500         | DM Sans, `tracking-[0.2em] uppercase`  |
| Labels     | `text-xs`              | 500         | DM Sans, `tracking-[0.15em] uppercase` |
| Captions   | `text-sm`              | 400         | DM Sans, `text-muted-foreground`       |

### Hebrew Typography

- Headings: Frank Ruhl Libre 500 (replaces Heebo 700 for headings)
- Body: Heebo 400 (unchanged)
- Layout: LTR maintained (no RTL switch, as per current approach)

---

## 3. Hero Section

### Background

- Full-screen parallax image (keep current WebP/JPG approach)
- **Ken Burns effect:** `@keyframes kenBurns { from { transform: scale(1) } to { transform: scale(1.1) } }` — 20s duration, ease-in-out, infinite alternate
- Single gradient overlay: `bg-gradient-to-t from-black/70 via-black/30 to-transparent`
- Remove: decorative pulsing circles, secondary color gradient overlay

### Content

- **Badge:** Remove sparkle badge entirely
- **Title:** "WIRO 4x4" in Cormorant Garamond, `text-7xl md:text-9xl`, `font-light`
  - GSAP split-text letter-by-letter reveal animation
- **Divider:** Thin gold line `w-20 h-px bg-[#D4AF37]` that draws from center outward (GSAP)
- **Tagline:** "Kosher Off-Road Adventures in Chiang Mai" — DM Sans, `text-lg md:text-xl`, uppercase, `tracking-[0.15em]`, fade-in with 0.4s delay
- **Description:** Remove the long paragraph (minimal hero text)

### CTAs

- **Primary:** Transparent bg, gold border (2px), white text, `rounded-sm`, uppercase tracking → hover: gold fill, charcoal text
- **Secondary:** Transparent bg, white border (1px), white text, `rounded-sm` → hover: white fill, charcoal text
- Both: `px-10 py-4`, staggered fade-in entrance

### Trust Indicators

- Thin `|` separators instead of colored dots
- Gold-tinted text, `text-xs uppercase tracking-widest`
- Horizontal layout with generous spacing

### Scroll Indicator

- Replace bouncing mouse icon with simple: thin gold vertical line (40px) + "Discover" text in `text-xs uppercase tracking-widest`
- Subtle opacity pulse (0.6 → 1.0), no bounce

---

## 4. Navigation

### Desktop

- Height: `h-24`
- Logo: Keep current, add gold drop-shadow on transparent state
- Nav links: `text-xs font-medium tracking-[0.2em] uppercase` in DM Sans
- Active state: Thin gold underline `border-b border-[#D4AF37]`
- Hover: Gold underline animates width from center outward (CSS `::after` pseudo-element)
- "Book Now": Gold outline button (transparent bg, gold 2px border, gold text) → hover: gold fill
- Scrolled state: Ivory `#FAF7F2` background, thin gold bottom border, `backdrop-blur-md`

### Mobile

- Full-screen overlay: Ivory background `#FAF7F2`
- Centered nav items: Cormorant Garamond, `text-2xl`, generous `py-4` spacing
- Gold horizontal rules between items
- "Book Now" at bottom: Full-width gold outline button
- Smooth slide-down entrance animation (Framer Motion)

---

## 5. Components

### Tour Cards

- Photo fills 60% height, `overflow-hidden` for hover zoom
- Thin gold top border: `border-t-2 border-[#D4AF37]`
- `rounded-sm` or `rounded-none`
- Card bg: `#FDFBF7`
- Title: Cormorant Garamond 500
- Price: Gold accent text `From X,XXX`
- Hover: `translateY(-4px)`, image `scale(1.05)`, gold border top+bottom
- GSAP ScrollTrigger: Staggered entrance (0.15s stagger between cards)

### Testimonial Cards

- Large gold `"` quotation mark (Cormorant Garamond, `text-6xl`, gold)
- Quote: Cormorant Garamond italic
- Author: `— Name` with gold dash
- Stars: Gold filled
- No visible card border, subtle bottom divider line
- Smooth crossfade carousel (Framer Motion)

### Destination Cards

- Full-bleed photo with `bg-gradient-to-t from-black/60 to-transparent`
- Name: White uppercase letter-spaced text at bottom
- Hover: Gold overlay tint (via `bg-[#D4AF37]/10`), text slides up 8px
- GSAP wipe-in reveal on scroll

### Buttons

| Variant                    | Default                                                                  | Hover                                        |
| -------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| **Primary (gold outline)** | Transparent bg, `#D4AF37` 2px border, gold text, `rounded-sm`, uppercase | Gold fill `#D4AF37`, charcoal `#1C1C1C` text |
| **Secondary**              | Transparent bg, `#1C1C1C` 1px border, charcoal text, `rounded-sm`        | Charcoal fill, white text                    |
| **Ghost**                  | No border, gold text                                                     | Gold underline appears                       |
| **Hero primary**           | Transparent bg, gold 2px border, white text                              | Gold fill, charcoal text                     |
| **Hero secondary**         | Transparent bg, white 1px border, white text                             | White fill, charcoal text                    |

All buttons: Magnetic hover effect (button follows cursor within small radius), `transition-all duration-300`

### Form Elements

- Input borders: `#E8E2DA` (warm stone)
- Focus: Gold border `#D4AF37` + subtle gold box-shadow
- Labels: Uppercase, `tracking-[0.15em]`, `text-xs`, DM Sans 500
- Form containers: Thin gold accent border on wrapper

### Section Dividers

- Thin gold horizontal rule: `w-16 h-px bg-[#D4AF37] mx-auto`
- Placed between section title and content
- Animated width from 0 to full via GSAP ScrollTrigger
- Alternating section backgrounds: `#FAF7F2` → `#FDFBF7`

---

## 6. Page Layouts

### Homepage Section Order & Treatment

| #   | Section              | Background       | Special Treatment                                    |
| --- | -------------------- | ---------------- | ---------------------------------------------------- |
| 1   | Hero                 | Full-bleed image | Ken Burns, split-text reveal, parallax               |
| 2   | Quick Inquiry Form   | `#FAF7F2`        | Centered form, gold border container                 |
| 3   | Tours                | `#FDFBF7`        | 3-col grid, staggered card reveals, gold top borders |
| 4   | Destination Showcase | `#FAF7F2`        | Full-width photo grid, wipe-in reveals               |
| 5   | Kosher Info          | `#FDFBF7`        | Split layout (text L, photo R), gold accent icons    |
| 6   | Testimonials         | `#FAF7F2`        | Large centered quote, gold quotation marks, carousel |
| 7   | Why WIRO             | `#FDFBF7`        | Icon grid, SVG draw-on animation, gold icons         |
| 8   | Community Connection | Full-bleed photo | Dark overlay, centered white/gold text, parallax     |
| 9   | FAQ                  | `#FAF7F2`        | Accordion, gold chevrons, smooth height animation    |

All sections: `py-24 md:py-32` padding

### Booking Form Page

- Short hero banner (40vh) with parallax background
- Centered form card overlapping hero by 80px (negative margin)
- Gold accent border on form container
- Ivory background below hero

### Gallery Page

- Masonry grid layout
- Image hover: zoom 1.08 + gold overlay tint fade-in
- Category filter pills: Gold outline style
- GSAP staggered image load animation

### Tour Detail Page

- Full-bleed hero image (60vh)
- Content card with negative top margin (overlapping hero)
- Gold accent details: section dividers, included items checkmarks, itinerary numbering
- Parallax on hero image

### Reviews Page

- Large featured review at top (Cormorant Garamond italic, centered)
- Grid of review cards below
- Gold star ratings
- Submit review form: gold border container

### Blog

- Editorial layout: large featured post image
- Clean serif typography for post content
- Gold accent links
- Related posts at bottom

### Pricing Page

- Card-based tier layout with gold header accents
- Comparison-style columns
- Gold "Popular" badge on recommended tier

---

## 7. Animation System

### Dependencies

- **GSAP** (new) + ScrollTrigger plugin — dramatic scroll-triggered animations
- **Framer Motion** (already installed) — React component animations, page transitions
- **CSS @keyframes** — simple continuous animations (Ken Burns, opacity pulses)

### Animation Inventory

| Element              | Animation                                                 | Tool                          | Duration                 |
| -------------------- | --------------------------------------------------------- | ----------------------------- | ------------------------ |
| Hero image           | Ken Burns zoom `1.0 → 1.1` + slight horizontal drift      | CSS @keyframes                | 20s infinite alternate   |
| Hero title           | Split-text letter-by-letter reveal with stagger           | GSAP SplitText                | 1.2s total               |
| Hero gold divider    | Width draws from center outward `0 → 100%`                | GSAP                          | 0.6s                     |
| Hero tagline         | Fade-in + translateY(10px)                                | GSAP                          | 0.6s, 0.4s delay         |
| Hero CTAs            | Staggered fade-in                                         | GSAP                          | 0.4s each, 0.2s stagger  |
| Section headings     | Clip-path reveal: text slides up from behind mask         | GSAP ScrollTrigger            | 0.8s                     |
| Gold section rules   | Animate width from 0 → full                               | GSAP ScrollTrigger            | 0.6s                     |
| Tour cards           | Staggered entrance: fade + translateY(40px)               | GSAP ScrollTrigger            | 0.6s each, 0.15s stagger |
| Destination images   | Wipe-in: gold overlay slides off left-to-right            | GSAP ScrollTrigger            | 0.8s                     |
| Gallery images       | Staggered grid load                                       | GSAP ScrollTrigger            | 0.4s, 0.1s stagger       |
| Why WIRO icons       | SVG stroke draw-on (stroke-dashoffset)                    | GSAP ScrollTrigger            | 0.8s                     |
| Numbers/stats        | Count-up animation                                        | GSAP ScrollTrigger            | 1.5s                     |
| Scroll progress      | Thin gold line at top of viewport                         | GSAP ScrollTrigger            | Continuous               |
| Buttons              | Magnetic hover (follows cursor within radius)             | Framer Motion                 | Continuous               |
| Button borders       | Color + fill transition                                   | CSS transition                | 0.3s                     |
| Cards hover          | translateY(-4px) + shadow increase                        | CSS transition                | 0.3s                     |
| Images hover         | scale(1.05 or 1.08) within overflow-hidden                | CSS transition                | 0.4s                     |
| Nav underline        | Width from center outward (::after)                       | CSS transition                | 0.3s                     |
| Nav bg scroll        | Transparent → ivory                                       | CSS transition                | 0.3s                     |
| Page transitions     | Fade + translateY(10px) between routes                    | Framer Motion AnimatePresence | 0.3s                     |
| Gold line sweep      | Horizontal gold line sweeps across during page transition | Framer Motion                 | 0.4s                     |
| FAQ accordion        | Smooth height + chevron rotation                          | Framer Motion                 | 0.3s                     |
| Testimonial carousel | Crossfade + slight scale                                  | Framer Motion                 | 0.5s                     |
| Custom cursor        | Small gold dot, scales up on interactive elements         | CSS + JS                      | Continuous               |

### Performance Guardrails

- All animations respect `prefers-reduced-motion: reduce`
- Custom cursor hidden on touch devices
- Parallax disabled on mobile (< 768px)
- GSAP uses `will-change: transform` only during active animation
- Image animations use `transform` and `opacity` only (GPU-composited)
- Page transition duration capped at 0.4s for perceived speed
- Lazy-load GSAP ScrollTrigger instances (only for visible sections)

---

## 8. Technical Implementation Notes

### New Dependencies

```bash
pnpm add gsap @gsap/react
```

### Font Loading (index.html)

Replace current Google Fonts imports with:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600&family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

### CSS Variables Update

Update `client/src/index.css` `:root` block with new palette values.

### Shadcn/ui Restyling

- Override default Shadcn component styles via CSS variables
- Button component: Update variants for gold outline primary
- Card component: Update background, border, radius
- Input component: Update border colors, focus states

### File Impact (Estimated)

- `client/src/index.css` — Major rewrite (palette, typography, utilities, animations)
- `client/index.html` — Font imports update
- `client/src/components/Hero.tsx` — Major rewrite
- `client/src/components/Header.tsx` — Significant changes
- `client/src/components/Tours.tsx` — Card styling + GSAP
- `client/src/components/Footer.tsx` — Restyle
- `client/src/components/WhyWiro.tsx` — Restyle + SVG animations
- `client/src/components/Testimonials.tsx` — Carousel + quotes
- `client/src/components/DestinationShowcase.tsx` — Grid + animations
- `client/src/components/KosherInfo.tsx` — Layout + accent changes
- `client/src/components/QuickInquiryForm.tsx` — Form restyling
- `client/src/components/CommunityConnection.tsx` — Parallax + overlay
- `client/src/components/FAQ.tsx` — Accordion + gold accents
- `client/src/components/FloatingActionButtons.tsx` — Restyle
- `client/src/components/CostCalculator.tsx` — Form restyling
- `client/src/components/DashboardLayout.tsx` — Admin chrome only
- `client/src/pages/BookingForm.tsx` — Layout + form restyling
- `client/src/pages/Gallery.tsx` — Grid + animations
- `client/src/pages/TourDetail.tsx` — Hero + card overlap
- `client/src/pages/Reviews.tsx` — Quote styling
- `client/src/pages/Blog.tsx` + `BlogPost.tsx` — Editorial layout
- `client/src/pages/Pricing.tsx` — Card tiers
- `client/src/pages/Estimate.tsx` — Form restyling
- `client/src/pages/Home.tsx` — Section spacing/ordering
- `client/src/App.tsx` — Page transition wrapper
- New: `client/src/hooks/useScrollAnimation.ts` — GSAP ScrollTrigger hook
- New: `client/src/components/CustomCursor.tsx` — Gold cursor component
- New: `client/src/components/PageTransition.tsx` — Route transition wrapper
- New: `client/src/components/ScrollProgress.tsx` — Gold progress bar

### Constraints Preserved

- Bilingual English/Hebrew (with Frank Ruhl Libre for Hebrew headings)
- Tailwind CSS 4 + Shadcn/ui (restyled, not replaced)
- All existing functionality untouched (tRPC, booking flow, admin panel, etc.)
- Manus platform compatibility
- Accessibility: `prefers-reduced-motion` respected
- Performance: Mobile-optimized animations

---

## 9. Summary

Transform Wiro4x4 from a functional tour booking site into a **Belmond-caliber luxury adventure brand** through:

1. **Warm, sophisticated palette** — Charcoal + ivory + bright gold replacing flat green/white
2. **Refined typography** — Cormorant Garamond + DM Sans replacing Playfair + Poppins
3. **Cinematic hero** — Ken Burns effect + split-text reveal + minimal text
4. **Elegant components** — Gold outline buttons, photo-forward cards, serif quotes
5. **Dynamic animations** — GSAP scroll reveals, parallax layers, magnetic buttons, page transitions, custom cursor
6. **Editorial layouts** — More whitespace, larger type scale, alternating section backgrounds

The result: a site that makes customers feel they're booking a **luxury experience**, not just a tour.
