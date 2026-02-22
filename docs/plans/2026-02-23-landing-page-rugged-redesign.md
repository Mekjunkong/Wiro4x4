# Landing Page Rugged Adventure Redesign

**Date:** 2026-02-23
**Approach:** Bold Expedition
**Scope:** Full landing page refresh

## Summary

Transform the Wiro 4x4 landing page from its current luxury/elegant aesthetic to a rugged adventure brand. The primary lever is typography (replacing elegant serif Cormorant Garamond with bold condensed Oswald), combined with a left-aligned editorial hero layout and section styling updates. Gold accent color stays as brand identity.

## Typography System

### Fonts to Add

- **Oswald** (Google Fonts) -- weights 400, 500, 600, 700 -- display/heading font
- **Source Sans 3** (Google Fonts) -- weights 400, 500, 600 -- body font
- **Rubik** (Google Fonts) -- weights 400, 500, 700 -- Hebrew heading font

### Fonts to Remove

- **Cormorant Garamond** -- replaced by Oswald for headings
- **DM Sans** -- replaced by Source Sans 3 for body
- **Frank Ruhl Libre** -- replaced by Rubik for Hebrew headings

### Font Mapping

| Role                   | Current                       | New                  |
| ---------------------- | ----------------------------- | -------------------- |
| Body                   | DM Sans                       | Source Sans 3        |
| Headings (h1-h6)       | Cormorant Garamond 500        | Oswald 600           |
| Hero title             | DM Sans font-light            | Oswald 700           |
| Value prop text        | Cormorant Garamond (inline)   | Source Sans 3 400    |
| Tour card titles       | Cormorant Garamond (inline)   | Oswald 500           |
| Section banner         | Cormorant Garamond font-light | Oswald 600 uppercase |
| WhyWiro feature titles | Cormorant Garamond (inline)   | Oswald 500           |
| Hebrew headings        | Frank Ruhl Libre 500          | Rubik 600            |
| Hebrew body            | Heebo                         | Heebo (no change)    |

## Color Palette

Gold stays. One new secondary color added.

| Role                   | Value                 | Change?                             |
| ---------------------- | --------------------- | ----------------------------------- |
| Primary accent         | #D4AF37 (gold)        | No change                           |
| Secondary accent (new) | #4A5D23 (olive green) | New -- for nature/difficulty badges |
| Background             | #FAF7F2               | No change                           |
| Card                   | #FDFBF7               | No change                           |
| Charcoal               | #1C1C1C               | No change                           |
| Muted text             | #6B6560               | No change                           |

## Hero Banner Redesign

### Layout: Left-aligned editorial

- Content aligned to left (with left padding)
- max-width on text container ~3xl (768px)
- Background image fills full viewport height
- Gradient: heavier on left side for text readability

### Title treatment

- "WIRO" on first line, "4x4" on second line -- stacked
- Font: Oswald weight 700
- Size: text-6xl sm:text-7xl md:text-8xl lg:text-9xl
- Tracking: tracking-wide
- Color: white

### Tagline

- "KOSHER OFF-ROAD ADVENTURES"
- Font: Oswald weight 500
- Uppercase, tracking-[0.2em]
- Size: text-sm sm:text-base

### Value proposition

- "The only kosher 4x4 experience in Southeast Asia"
- Font: Source Sans 3 weight 400
- Size: text-base sm:text-lg
- Color: gold (#D4AF37)

### Location

- "in Chiang Mai"
- Font: Source Sans 3 weight 300
- Size: text-lg sm:text-xl md:text-2xl
- Color: white/90

### CTAs

- Left-aligned row (flex, not centered)
- Same buttons, same behavior

### Trust indicators

- Left-aligned, same content

### Gradient adjustment

- Change from `bg-gradient-to-t from-black/70 via-black/30 to-transparent`
- To: heavier left gradient for left-aligned text readability
- `bg-gradient-to-r from-black/80 via-black/40 to-transparent` combined with bottom gradient

## Section Changes

### TrustBar

- Text: use Oswald via global CSS (automatic from heading change)
- No structural changes

### Tours Section

- Section heading: Oswald (automatic)
- Card titles: remove inline `fontFamily: "'Cormorant Garamond', serif"` -- let global CSS apply Oswald
- Card structure: replace gold top-border (`border-t-2 border-[#D4AF37]`) with left accent bar (`border-l-4 border-[#D4AF37]`)
- "Challenging" difficulty tours: olive green badge color

### SectionBanner

- Remove inline `fontFamily: "'Cormorant Garamond', serif"`
- Add `uppercase tracking-wider` classes
- Change weight from font-light to font-semibold

### WhyWiro

- Feature titles: remove inline fontFamily -- let global h3 styling apply
- Icon containers: add `border border-[#D4AF37]/20` to the bg-[#D4AF37]/10 circles

### GoldDivider

- Increase from h-px to h-0.5 (2px) for bolder feel

### Other sections (Testimonials, FAQ, Footer, etc.)

- Typography changes happen automatically via global CSS
- No structural changes needed

## Files to Modify

1. `client/index.html` -- swap Google Fonts import URLs
2. `client/src/index.css` -- update font-family declarations in @layer base
3. `client/src/components/Hero.tsx` -- left-aligned layout, stacked title, new gradient
4. `client/src/components/SectionBanner.tsx` -- remove inline font, add uppercase/bold
5. `client/src/components/Tours.tsx` -- remove inline fontFamily, change card border
6. `client/src/components/WhyWiro.tsx` -- remove inline fontFamily, update icon styling
7. `client/src/components/GoldDivider.tsx` -- increase height to h-0.5

## Files NOT Modified

- Color CSS variables (gold stays)
- Component structure/logic
- Backend/API
- Hebrew body font (Heebo stays)
- Admin panel styling
- Other pages (Gallery, Reviews, Blog, etc.)
