# Hero Banner Enhancement Design

**Date:** 2026-02-23
**Status:** Approved

## Summary

Replace the static single-image hero banner with an Embla Carousel featuring 3 auto-playing slides, each showcasing a different tour. Enhance typography to be bolder/bigger with center alignment. Add progress bar, dot navigation, and smooth GSAP entrance animations.

## Goals

1. **Visual impact** — Bigger, bolder typography + carousel adds dynamism
2. **Conversion optimization** — Consistent CTAs on every slide, trust badges always visible
3. **Content/messaging** — Each slide highlights a specific tour with unique tagline
4. **Interactive experience** — Auto-play carousel with hover pause, swipe on mobile

## Typography Changes

| Element            | Before                                  | After                                             |
| ------------------ | --------------------------------------- | ------------------------------------------------- |
| Title "WIRO 4×4"   | `text-6xl → text-9xl` Oswald bold (700) | `clamp(5rem, 12vw, 12rem)` Oswald **black (900)** |
| Tagline            | `text-sm → text-base` uppercase         | `text-xl → text-3xl` uppercase                    |
| Location/tour info | `text-lg → text-2xl` font-light         | `text-2xl → text-4xl` font-normal                 |
| Text alignment     | Right-aligned (`text-right`, `ml-auto`) | **Center-aligned**                                |
| Gold divider       | `w-16` (64px)                           | `w-24` (96px)                                     |

**Font:** Load Oswald weight 900 (currently only 600-700 loaded).

## Carousel Structure

### 3 Slides

| #   | Image                   | Tagline (EN)                   | Tagline (HE)        | Info                           |
| --- | ----------------------- | ------------------------------ | ------------------- | ------------------------------ |
| 1   | `hero-wiro.webp`        | "Kosher Off-Road Adventures"   | "טיולי שטח כשרים"   | Chiang Mai, Thailand           |
| 2   | Doi Inthanon tour image | "Conquer the Roof of Thailand" | "כבשו את גג תאילנד" | Doi Inthanon · Full Day        |
| 3   | Sticky Waterfalls image | "Walk Up a Waterfall"          | "טיפסו על מפל מים"  | Maerim Sticky Falls · Half Day |

### Slide Layout (each slide)

```
┌─────────────────────────────────────────────┐
│         [Full-screen tour photo]            │
│         (dark gradient overlay)             │
│                                             │
│              WIRO 4×4                       │
│           ───────────                       │
│     "Slide-specific tour tagline"           │
│        Tour Name · Duration                 │
│                                             │
│     [Book Your Adventure] [WhatsApp]        │
│                                             │
│  Hebrew Speaking · Kosher · Shabbat · Private│
│               ● ○ ○                         │
│  ════════════════░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────┘
```

### Carousel Behavior

- **Library:** Embla Carousel (already installed)
- **Auto-play:** 6-second interval per slide
- **Pause:** On hover (desktop), resume on mouse leave
- **Transition:** Fade crossfade (0.6s CSS)
- **Navigation:** Dot indicators (centered), left/right chevrons on hover (desktop), swipe (mobile)
- **Loop:** Infinite loop

### Progress Bar

- Thin gold bar (2px) at hero bottom
- Fills left-to-right over 6 seconds
- Resets on slide change
- Pauses on hover

## Animations

### Entrance (first load, GSAP)

1. First slide image fades in (0.4s)
2. Title slides up + fades in (0.8s)
3. Gold divider scales from center (0.6s, offset -0.3s)
4. Tagline slides up (0.6s, offset -0.1s)
5. CTAs + trust badges fade in (0.5s, offset -0.2s)

### Slide Transitions

- Image: CSS fade crossfade (0.6s)
- Text: Fade out → fade in (staggered 0.3s)
- No heavy GSAP re-animation per slide

### Accessibility

- Respects `prefers-reduced-motion`: no animations, instant transitions
- Keyboard navigable (arrow keys)
- ARIA labels for dots and navigation arrows

## Consistent Elements (every slide)

- Brand title "WIRO 4×4"
- Gold divider
- "Book Your Adventure" + "WhatsApp Concierge" CTAs
- Trust badges (Hebrew Speaking, Kosher Meals, Shabbat Friendly, Private Tours)
- Scroll indicator ("Discover" + gold line)

## Slide-Specific Elements

- Background image (different per slide)
- Tagline text (unique per slide, bilingual)
- Tour info line (tour name + duration)

## Technical Approach

- Modify `client/src/components/Hero.tsx`
- Use Embla Carousel React (`embla-carousel-react` + `embla-carousel-autoplay`)
- Keep GSAP for entrance animations only
- Slide data as a const array within the component
- Images from existing `/images/optimized/` directory
- May need to add 2 new hero images (Doi Inthanon, Sticky Waterfalls) from gallery photos

## Images Needed

- Slide 1: `hero-wiro.webp` (exists, 320KB)
- Slide 2: Need a Doi Inthanon hero image (select from gallery or existing tour images)
- Slide 3: Need a Sticky Waterfalls hero image (select from gallery or existing tour images)

Both new images should be optimized to ~300-400KB WebP with JPG fallback.

## Dependencies

- `embla-carousel-react` (already installed)
- `embla-carousel-autoplay` (may need to install)
- `gsap` (already installed)
- Oswald font weight 900 (add to Google Fonts import)
