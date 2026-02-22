# Landing Page Rugged Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Wiro 4x4 landing page from a luxury/elegant aesthetic to a bold, rugged adventure brand through typography, hero layout, and section styling changes.

**Architecture:** Swap Google Fonts (Cormorant Garamond + DM Sans -> Oswald + Source Sans 3), update global CSS font declarations, redesign hero section to left-aligned editorial layout, and clean up inline font overrides in components. Gold accent color preserved.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Google Fonts, GSAP (hero animations)

---

## Task 1: Swap Google Fonts

**Files:**

- Modify: `client/index.html:105-113`

**Step 1: Replace the Google Fonts URL**

In `client/index.html`, replace both font `<link>` tags (the media="print" one at line 106 and the noscript one at line 112).

Old URL:

```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@400;500&display=swap
```

New URL:

```
https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Rubik:wght@400;500;700&family=Heebo:wght@400;500&display=swap
```

**Step 2: Verify the page still loads**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev`

Open browser — fonts will look wrong (body/headings will fallback to sans-serif) until Task 2. That's expected.

**Step 3: Commit**

```bash
git add client/index.html
git commit -m "chore: swap Google Fonts to Oswald + Source Sans 3 + Rubik"
```

---

## Task 2: Update Global CSS Font Declarations

**Files:**

- Modify: `client/src/index.css:128-163`

**Step 1: Update body font-family**

Change line 130:

```css
/* Old */
font-family: "DM Sans", sans-serif;
/* New */
font-family: "Source Sans 3", sans-serif;
```

**Step 2: Update heading font-family and weight**

Change lines 141-143:

```css
/* Old */
font-family: "Cormorant Garamond", serif;
font-weight: 500;

/* New */
font-family: "Oswald", sans-serif;
font-weight: 600;
```

**Step 3: Update Hebrew heading font-family**

Change lines 161-162:

```css
/* Old */
font-family: "Frank Ruhl Libre", serif;
font-weight: 500;

/* New */
font-family: "Rubik", sans-serif;
font-weight: 600;
```

**Step 4: Verify in browser**

Run dev server. All headings across the site should now render in Oswald. Body text should be Source Sans 3. Hebrew headings should be Rubik.

**Step 5: Commit**

```bash
git add client/src/index.css
git commit -m "chore: update global font declarations to Oswald/Source Sans 3/Rubik"
```

---

## Task 3: Redesign Hero Banner

**Files:**

- Modify: `client/src/components/Hero.tsx`

This is the largest change. The hero shifts from centered to left-aligned with stacked title.

**Step 1: Update the gradient overlay**

Replace the single gradient div (line 116):

```tsx
{/* Old */}
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

{/* New — two overlapping gradients for left-aligned readability */}
<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
```

**Step 2: Update content wrapper alignment**

Replace the content container (lines 120-124):

```tsx
{/* Old */}
<div
  ref={heroContentRef}
  className="container relative z-10 text-center text-white py-20"
>
  <div className="max-w-5xl mx-auto space-y-8">

{/* New — left-aligned */}
<div
  ref={heroContentRef}
  className="container relative z-10 text-left text-white py-20"
>
  <div className="max-w-3xl space-y-6">
```

**Step 3: Update the title to stacked WIRO / 4x4**

Replace the h1 (lines 126-132):

```tsx
{
  /* Old */
}
<h1
  ref={titleRef}
  className="font-light text-5xl sm:text-6xl md:text-8xl tracking-tight text-white"
  style={{ opacity: 0 }}
>
  {t("WIRO 4\u00D74", "WIRO 4\u00D74")}
</h1>;

{
  /* New — stacked, bold, large */
}
<h1
  ref={titleRef}
  className="font-bold text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wide text-white leading-[0.9]"
  style={{ opacity: 0 }}
>
  {t("WIRO", "WIRO")}
  <br />
  {t("4\u00D74", "4\u00D74")}
</h1>;
```

**Step 4: Update the gold divider alignment**

Replace the divider (lines 135-139):

```tsx
{
  /* Old */
}
<div
  ref={dividerRef}
  className="h-px w-16 bg-[#D4AF37] mx-auto"
  style={{ transform: "scaleX(0)" }}
/>;

{
  /* New — left-aligned, slightly thicker */
}
<div
  ref={dividerRef}
  className="h-0.5 w-16 bg-[#D4AF37]"
  style={{ transform: "scaleX(0)" }}
/>;
```

**Step 5: Update tagline styling**

Replace the tagline paragraph (lines 142-148):

```tsx
{
  /* Old */
}
<p
  ref={taglineRef}
  className="text-sm sm:text-base uppercase tracking-[0.2em] font-medium text-white"
  style={{ opacity: 0 }}
>
  {t("Kosher Off-Road Adventures", "טיולי שטח כשרים")}
</p>;

{
  /* New — Oswald via heading-style, wider tracking */
}
<p
  ref={taglineRef}
  className="text-sm sm:text-base uppercase tracking-[0.25em] font-medium text-white/90"
  style={{ fontFamily: "'Oswald', sans-serif", opacity: 0 }}
>
  {t("Kosher Off-Road Adventures", "טיולי שטח כשרים")}
</p>;
```

**Step 6: Update value proposition — remove inline Cormorant Garamond**

Replace the value prop (lines 151-163):

```tsx
{/* Old */}
<p
  ref={valuePropRef}
  className="text-base sm:text-lg text-[#D4AF37] font-medium tracking-wide"
  style={{
    fontFamily: "'Cormorant Garamond', serif",
    opacity: 0,
  }}
>

{/* New — use body font (Source Sans 3), no inline font override */}
<p
  ref={valuePropRef}
  className="text-base sm:text-lg text-[#D4AF37] font-normal tracking-wide"
  style={{ opacity: 0 }}
>
```

**Step 7: Update location text — remove inline Cormorant Garamond**

Replace the location (lines 166-175):

```tsx
{/* Old */}
<p
  ref={locationRef}
  className="text-lg sm:text-xl md:text-2xl text-white/90 font-light"
  style={{
    fontFamily: "'Cormorant Garamond', serif",
    opacity: 0,
  }}
>

{/* New — body font, light weight */}
<p
  ref={locationRef}
  className="text-lg sm:text-xl md:text-2xl text-white/90 font-light"
  style={{ opacity: 0 }}
>
```

**Step 8: Update CTAs to left-aligned**

Replace the CTA container (lines 178-181):

```tsx
{/* Old */}
<div
  ref={ctaRef}
  className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
  style={{ opacity: 0 }}
>

{/* New — left-aligned */}
<div
  ref={ctaRef}
  className="flex flex-col sm:flex-row gap-4 items-start pt-4"
  style={{ opacity: 0 }}
>
```

**Step 9: Update trust indicators to left-aligned**

Replace the trust div (lines 213-216):

```tsx
{/* Old */}
<div
  ref={trustRef}
  className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 pt-8 text-xs uppercase tracking-[0.15em] text-[#D4AF37]"
  style={{ opacity: 0 }}
>

{/* New — left-aligned */}
<div
  ref={trustRef}
  className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-xs uppercase tracking-[0.15em] text-[#D4AF37]"
  style={{ opacity: 0 }}
>
```

**Step 10: Update scroll indicator to left-aligned**

Replace the scroll indicator (lines 233-239):

```tsx
{/* Old */}
<div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-subtle-pulse">

{/* New — left-aligned to match content */}
<div className="absolute bottom-12 left-8 sm:left-12 md:left-16 z-10 animate-subtle-pulse">
```

**Step 11: Verify in browser**

The hero should now show:

- Left-aligned content
- "WIRO" stacked on top of "4x4" in bold Oswald
- Strong left-side gradient for readability
- CTAs left-aligned
- Trust indicators left-aligned

**Step 12: Commit**

```bash
git add client/src/components/Hero.tsx
git commit -m "feat: redesign hero banner with left-aligned layout and bold typography"
```

---

## Task 4: Update SectionBanner

**Files:**

- Modify: `client/src/components/SectionBanner.tsx`

**Step 1: Remove inline fontFamily and update classes**

Replace line 17-19:

```tsx
{/* Old */}
<h2
  className="text-3xl md:text-5xl lg:text-6xl font-light text-white text-center tracking-wide px-4"
  style={{ fontFamily: "'Cormorant Garamond', serif" }}
>

{/* New — Oswald via global CSS, bold, uppercase */}
<h2
  className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white text-center uppercase tracking-wider px-4"
>
```

**Step 2: Commit**

```bash
git add client/src/components/SectionBanner.tsx
git commit -m "feat: update SectionBanner to bold uppercase typography"
```

---

## Task 5: Update Tour Cards

**Files:**

- Modify: `client/src/components/Tours.tsx`

**Step 1: Remove inline fontFamily from card title**

Replace lines 238-241:

```tsx
{/* Old */}
<h3
  className="text-xl font-medium"
  style={{ fontFamily: "'Cormorant Garamond', serif" }}
>

{/* New — Oswald via global h3 CSS */}
<h3 className="text-xl font-medium">
```

**Step 2: Change card border from top to left**

Replace line 204:

```tsx
{/* Old */}
<Card className="overflow-hidden hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 h-full border-t-2 border-[#D4AF37] rounded-sm bg-card">

{/* New — left accent bar */}
<Card className="overflow-hidden hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 h-full border-l-4 border-[#D4AF37] rounded-sm bg-card">
```

**Step 3: Commit**

```bash
git add client/src/components/Tours.tsx
git commit -m "feat: update tour cards with left accent bar and Oswald headings"
```

---

## Task 6: Update WhyWiro

**Files:**

- Modify: `client/src/components/WhyWiro.tsx`

**Step 1: Remove inline fontFamily from feature titles**

Replace lines 119-122:

```tsx
{/* Old */}
<h3
  className="text-lg font-medium"
  style={{ fontFamily: "'Cormorant Garamond', serif" }}
>

{/* New — Oswald via global h3 CSS */}
<h3 className="text-lg font-medium">
```

**Step 2: Add border to icon circles**

Replace line 116:

```tsx
{/* Old */}
<div className="p-3 bg-[#D4AF37]/10 rounded-full">

{/* New — add subtle border */}
<div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full">
```

**Step 3: Commit**

```bash
git add client/src/components/WhyWiro.tsx
git commit -m "feat: update WhyWiro section with Oswald headings and bordered icons"
```

---

## Task 7: Update GoldDivider

**Files:**

- Modify: `client/src/components/GoldDivider.tsx`

**Step 1: Increase divider thickness**

Replace line 9:

```tsx
{/* Old */}
className={`h-px w-16 bg-[#D4AF37] mx-auto my-6 ${className}`}

{/* New — 2px thick */}
className={`h-0.5 w-16 bg-[#D4AF37] mx-auto my-6 ${className}`}
```

**Step 2: Commit**

```bash
git add client/src/components/GoldDivider.tsx
git commit -m "feat: increase GoldDivider thickness for bolder aesthetic"
```

---

## Task 8: Remove All Remaining Inline Cormorant Garamond References

Since the global CSS now applies Oswald to all h1-h6 elements, all inline `fontFamily: "'Cormorant Garamond', serif"` overrides are redundant and must be removed for consistency.

**Files to modify (remove inline fontFamily from each):**

- `client/src/components/Header.tsx` — 7 occurrences (mobile menu items)
- `client/src/components/Testimonials.tsx` — 2 occurrences
- `client/src/components/FAQ.tsx` — 1 occurrence
- `client/src/components/TourFAQ.tsx` — 1 occurrence
- `client/src/components/CostCalculator.tsx` — 1 occurrence
- `client/src/pages/TourDetail.tsx` — 5 occurrences
- `client/src/pages/Blog.tsx` — 1 occurrence
- `client/src/pages/BlogPost.tsx` — 1 occurrence
- `client/src/pages/Reviews.tsx` — 1 occurrence
- `client/src/pages/Pricing.tsx` — 2 occurrences

**Step 1: For each file above, find and remove ALL instances of:**

```tsx
style={{ fontFamily: "'Cormorant Garamond', serif" }}
```

Or when it's part of a multi-property style object:

```tsx
// Remove just the fontFamily line, keep other properties
fontFamily: "'Cormorant Garamond', serif",
```

If fontFamily was the ONLY property in the style object, remove the entire `style={...}` prop.
If fontFamily was one of multiple properties, remove just the fontFamily line.

**Step 2: Verify no Cormorant Garamond references remain**

```bash
grep -r "Cormorant" client/src/
```

The only remaining reference should be in `client/src/index.css` — and that gets removed in Task 2 when we update the global font declarations. So after both tasks, zero references should remain.

**Step 3: Commit**

```bash
git add client/src/components/Header.tsx client/src/components/Testimonials.tsx client/src/components/FAQ.tsx client/src/components/TourFAQ.tsx client/src/components/CostCalculator.tsx client/src/pages/TourDetail.tsx client/src/pages/Blog.tsx client/src/pages/BlogPost.tsx client/src/pages/Reviews.tsx client/src/pages/Pricing.tsx
git commit -m "refactor: remove all inline Cormorant Garamond overrides (now handled by global CSS)"
```

---

## Task 9: Sync Root-Level Component Copies

Per CLAUDE.md, root-level copies of Tours.tsx and other components need to stay in sync.

**Files:**

- Sync: `components/Tours.tsx` (root-level copy)

**Step 1: Copy the updated Tours.tsx to root**

```bash
cp client/src/components/Tours.tsx components/Tours.tsx
```

**Step 2: Check if GoldDivider root copy exists and sync**

```bash
# Only if root copy exists
cp client/src/components/GoldDivider.tsx components/GoldDivider.tsx
```

**Step 3: Commit**

```bash
git add components/
git commit -m "chore: sync root-level component copies"
```

---

## Task 10: Visual Verification & Final Check

**Step 1: Run the dev server**

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev
```

**Step 2: Verify each section in browser**

Checklist:

- [ ] Hero: left-aligned, stacked WIRO/4x4 in bold Oswald, strong gradient
- [ ] Hero: value prop in Source Sans 3, no Cormorant Garamond
- [ ] Hero: CTAs and trust indicators left-aligned
- [ ] TrustBar: text renders in correct font
- [ ] Tours: card titles in Oswald, left border accent
- [ ] SectionBanner: bold uppercase text
- [ ] WhyWiro: Oswald headings, bordered icon circles
- [ ] GoldDividers: slightly thicker across all sections
- [ ] Testimonials/FAQ/Footer: headings automatically in Oswald
- [ ] No remaining Cormorant Garamond anywhere

**Step 3: Run type check**

```bash
npx tsc --noEmit
```

**Step 4: Run tests**

```bash
pnpm test
```

Tests should all pass — these are pure styling changes with no logic changes.

**Step 5: Final check for any remaining inline Cormorant Garamond references**

Search the codebase:

```bash
grep -r "Cormorant" client/src/
```

If any remain in other components (Header mobile menu, etc.), remove them — the global CSS now handles all headings.
