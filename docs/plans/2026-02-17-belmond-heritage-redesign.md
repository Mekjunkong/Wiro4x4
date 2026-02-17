# Belmond Heritage Visual Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Wiro4x4 from a functional tour booking site into a Belmond-caliber luxury adventure brand through a full visual redesign.

**Architecture:** CSS-first approach — update design tokens (CSS variables) and typography first so all Shadcn/ui components inherit the new palette automatically. Then restyle components top-down (hero → nav → homepage sections → other pages). GSAP added for scroll-triggered animations, Framer Motion for page transitions and micro-interactions.

**Tech Stack:** React 19, Tailwind CSS 4, Shadcn/ui, GSAP + ScrollTrigger, Framer Motion, Cormorant Garamond + DM Sans + Frank Ruhl Libre fonts

**Design Reference:** `docs/plans/2026-02-17-belmond-heritage-redesign-design.md`

---

## Phase 1: Foundation (Tasks 1-3)

### Task 1: Install GSAP and Update Font Loading

**Files:**

- Modify: `package.json`
- Modify: `client/index.html:176-195`

**Step 1: Install GSAP**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm add gsap @gsap/react`
Expected: packages added to `package.json`

**Step 2: Update font imports in index.html**

Replace the font loading block in `client/index.html` (lines 186-195) with:

```html
<!-- Optimized font loading with media print trick -->
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@400;500&display=swap"
  rel="stylesheet"
  media="print"
  onload="this.media='all'"
/>
<noscript>
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@400;500&display=swap"
    rel="stylesheet"
  />
</noscript>
```

Also update `meta name="theme-color"` (line 170) from `#2d5016` to `#1C1C1C`.

**Step 3: Verify build**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm build`
Expected: Build succeeds, GSAP resolves

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml client/index.html
git commit -m "chore: add GSAP and update fonts to Cormorant Garamond + DM Sans"
```

---

### Task 2: Rewrite CSS Design Tokens and Typography

**Files:**

- Modify: `client/src/index.css` (major rewrite)

**Step 1: Replace `:root` color variables**

Replace the entire `:root` block (lines 45-83) with the new Belmond Heritage palette:

```css
:root {
  --radius: 0.25rem;
  /* Charcoal primary */
  --primary: #1c1c1c;
  --primary-foreground: #ffffff;
  /* Warm ivory background */
  --background: #faf7f2;
  --foreground: #2c2c2c;
  /* Soft cream cards */
  --card: #fdfbf7;
  --card-foreground: #2c2c2c;
  --popover: #fdfbf7;
  --popover-foreground: #2c2c2c;
  /* Bright gold accent */
  --secondary: #d4af37;
  --secondary-foreground: #1c1c1c;
  /* Warm stone muted */
  --muted: #e8e2da;
  --muted-foreground: #6b6560;
  /* Gold accent */
  --accent: #d4af37;
  --accent-foreground: #1c1c1c;
  --destructive: #b91c1c;
  --destructive-foreground: #ffffff;
  --border: #e8e2da;
  --input: #e8e2da;
  --ring: #d4af37;
  /* Charts — gold gradient */
  --chart-1: #d4af37;
  --chart-2: #bf9b30;
  --chart-3: #a88829;
  --chart-4: #917422;
  --chart-5: #7a611b;
  /* Sidebar */
  --sidebar: #faf7f2;
  --sidebar-foreground: #2c2c2c;
  --sidebar-primary: #1c1c1c;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #e8e2da;
  --sidebar-accent-foreground: #2c2c2c;
  --sidebar-border: #e8e2da;
  --sidebar-ring: #d4af37;
}
```

**Step 2: Replace `.dark` block**

Replace the `.dark` block (lines 85-121) with:

```css
.dark {
  --primary: #f0ede8;
  --primary-foreground: #1a1a1a;
  --background: #1a1a1a;
  --foreground: #f0ede8;
  --card: #242420;
  --card-foreground: #f0ede8;
  --popover: #242420;
  --popover-foreground: #f0ede8;
  --secondary: #d4af37;
  --secondary-foreground: #1c1c1c;
  --muted: #2e2e2a;
  --muted-foreground: #9b9590;
  --accent: #d4af37;
  --accent-foreground: #1c1c1c;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #3a3a35;
  --input: #3a3a35;
  --ring: #d4af37;
  --chart-1: #d4af37;
  --chart-2: #bf9b30;
  --chart-3: #a88829;
  --chart-4: #917422;
  --chart-5: #7a611b;
  --sidebar: #1a1a1a;
  --sidebar-foreground: #f0ede8;
  --sidebar-primary: #f0ede8;
  --sidebar-primary-foreground: #1a1a1a;
  --sidebar-accent: #2e2e2a;
  --sidebar-accent-foreground: #f0ede8;
  --sidebar-border: #3a3a35;
  --sidebar-ring: #d4af37;
}
```

**Step 3: Update typography in `@layer base`**

Replace the body and heading font declarations (lines 123-162) with:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: "DM Sans", sans-serif;
    font-feature-settings:
      "rlig" 1,
      "calt" 1;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: "Cormorant Garamond", serif;
    font-weight: 500;
  }
  /* Hebrew text support */
  [lang="he"],
  .rtl {
    font-family: "Heebo", "DM Sans", sans-serif;
  }
  [lang="he"] h1,
  [lang="he"] h2,
  [lang="he"] h3,
  [lang="he"] h4,
  [lang="he"] h5,
  [lang="he"] h6,
  .rtl h1,
  .rtl h2,
  .rtl h3,
  .rtl h4,
  .rtl h5,
  .rtl h6 {
    font-family: "Frank Ruhl Libre", serif;
    font-weight: 500;
  }
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  [type="button"]:not(:disabled),
  [type="submit"]:not(:disabled),
  [type="reset"]:not(:disabled),
  a[href],
  select:not(:disabled),
  input[type="checkbox"]:not(:disabled),
  input[type="radio"]:not(:disabled) {
    @apply cursor-pointer;
  }
}
```

**Step 4: Update shadow utilities**

Replace the `.shadow-premium` utilities (lines 221-223 area) with:

```css
/* Premium shadow utilities */
.shadow-premium {
  box-shadow: 0 10px 40px rgba(28, 28, 28, 0.08);
}
.shadow-premium-lg {
  box-shadow: 0 20px 60px rgba(28, 28, 28, 0.12);
}
```

**Step 5: Add Ken Burns and new animation keyframes**

Replace the existing `@keyframes` blocks (lines 247-293) with:

```css
/* Ken Burns hero effect */
@keyframes kenBurns {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.1) translate(-1%, -1%);
  }
}

/* Scroll reveal */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Gold divider draw */
@keyframes drawLine {
  from {
    width: 0;
  }
  to {
    width: 5rem;
  }
}

/* Subtle opacity pulse for scroll indicator */
@keyframes subtlePulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-ken-burns {
  animation: kenBurns 20s ease-in-out infinite alternate;
}

.animate-draw-line {
  animation: drawLine 0.6s ease-out forwards;
}

.animate-subtle-pulse {
  animation: subtlePulse 3s ease-in-out infinite;
}

.animate-page-in {
  animation: fadeIn 0.2s ease-in;
}
```

**Step 6: Add gold-specific utility classes**

Add after the animation classes:

```css
/* Gold accent utilities */
.gold-divider {
  height: 1px;
  width: 4rem;
  background: #d4af37;
  margin-left: auto;
  margin-right: auto;
}

.text-gold {
  color: #d4af37;
}
.border-gold {
  border-color: #d4af37;
}
.bg-gold {
  background-color: #d4af37;
}

/* Navigation underline animation */
.nav-link {
  position: relative;
}
.nav-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 1px;
  background: #d4af37;
  transition:
    width 0.3s ease,
    left 0.3s ease;
}
.nav-link:hover::after {
  width: 100%;
  left: 0;
}
```

**Step 7: Verify build passes**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm build`
Expected: Build succeeds. The entire site now renders with ivory background, charcoal text, and gold accents.

**Step 8: Commit**

```bash
git add client/src/index.css
git commit -m "style: apply Belmond Heritage palette, typography, and animation keyframes"
```

---

### Task 3: Create GSAP ScrollTrigger Hook and Utility Components

**Files:**

- Create: `client/src/hooks/useScrollReveal.ts`
- Create: `client/src/components/ScrollProgress.tsx`
- Create: `client/src/components/CustomCursor.tsx`
- Create: `client/src/components/GoldDivider.tsx`

**Step 1: Create useScrollReveal hook**

Create `client/src/hooks/useScrollReveal.ts`:

```typescript
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    y = 40,
    duration = 0.6,
    delay = 0,
    stagger = 0,
    once = true,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const children = stagger > 0 ? el.children : [el];

    gsap.set(children, { opacity: 0, y });

    const tl = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [y, duration, delay, stagger, once]);

  return ref;
}
```

**Step 2: Create ScrollProgress component**

Create `client/src/components/ScrollProgress.tsx`:

```tsx
import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[2px] bg-[#D4AF37] z-[10001] transition-none"
      style={{ width: `${progress}%` }}
    />
  );
}
```

**Step 3: Create CustomCursor component**

Create `client/src/components/CustomCursor.tsx`:

```tsx
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Hide on touch devices
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsTouch(true);
      return;
    }

    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });

    const hoverIn = () => setIsHovering(true);
    const hoverOut = () => setIsHovering(false);

    window.addEventListener("mousemove", move);

    const interactiveSelector =
      "a, button, [role='button'], input, select, textarea, [data-cursor-hover]";

    const observer = new MutationObserver(() => {
      document.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener("mouseenter", hoverIn);
        el.addEventListener("mouseleave", hoverOut);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial bind
    document.querySelectorAll(interactiveSelector).forEach(el => {
      el.addEventListener("mouseenter", hoverIn);
      el.addEventListener("mouseleave", hoverOut);
    });

    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
    };
  }, []);

  if (isTouch) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] rounded-full bg-[#D4AF37] mix-blend-difference transition-transform duration-150 ease-out"
      style={{
        left: pos.x,
        top: pos.y,
        width: isHovering ? 40 : 8,
        height: isHovering ? 40 : 8,
        transform: `translate(-50%, -50%)`,
        opacity: 0.8,
      }}
    />
  );
}
```

**Step 4: Create GoldDivider component**

Create `client/src/components/GoldDivider.tsx`:

```tsx
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function GoldDivider({ className = "" }: { className?: string }) {
  const ref = useScrollReveal<HTMLDivElement>({ y: 0, duration: 0.6 });

  return (
    <div
      ref={ref}
      className={`h-px w-16 bg-[#D4AF37] mx-auto my-6 ${className}`}
    />
  );
}
```

**Step 5: Verify build**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit && pnpm build`
Expected: No type errors, build succeeds.

**Step 6: Commit**

```bash
git add client/src/hooks/useScrollReveal.ts client/src/components/ScrollProgress.tsx client/src/components/CustomCursor.tsx client/src/components/GoldDivider.tsx
git commit -m "feat: add GSAP scroll reveal hook, scroll progress, custom cursor, gold divider"
```

---

## Phase 2: Design System (Tasks 4-5)

### Task 4: Restyle Button Component with Gold Outline Variants

**Files:**

- Modify: `client/src/components/ui/button.tsx`

**Step 1: Update button variants**

Replace the entire `buttonVariants` definition in `client/src/components/ui/button.tsx` (lines 7-37) with:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-[0.1em] uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[#D4AF37]/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1C1C]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-[#1C1C1C] bg-transparent text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white dark:border-[#F0EDE8] dark:text-[#F0EDE8] dark:hover:bg-[#F0EDE8] dark:hover:text-[#1A1A1A]",
        secondary: "bg-[#D4AF37] text-[#1C1C1C] hover:bg-[#BF9B30]",
        ghost:
          "text-[#D4AF37] hover:underline hover:underline-offset-4 hover:decoration-[#D4AF37]",
        link: "text-[#D4AF37] underline-offset-4 hover:underline",
        "hero-primary":
          "bg-transparent border-2 border-[#D4AF37] text-white hover:bg-[#D4AF37] hover:text-[#1C1C1C]",
        "hero-secondary":
          "bg-transparent border border-white/60 text-white hover:bg-white hover:text-[#1C1C1C]",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 py-1.5 text-xs",
        lg: "h-12 px-10 py-4 text-sm",
        xl: "h-14 px-12 py-4 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

**Step 2: Verify build**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit && pnpm build`
Expected: Build succeeds. Any page using `<Button>` now renders with gold outline style.

**Step 3: Run tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing tests pass (button changes are visual-only, no logic change).

**Step 4: Commit**

```bash
git add client/src/components/ui/button.tsx
git commit -m "style: restyle Button component with gold outline variants"
```

---

### Task 5: Add ScrollProgress and CustomCursor to App.tsx

**Files:**

- Modify: `client/src/App.tsx`

**Step 1: Import and add global components**

In `client/src/App.tsx`, add imports at the top:

```typescript
import { ScrollProgress } from "./components/ScrollProgress";
import { CustomCursor } from "./components/CustomCursor";
```

Then in the `AppContent` function, add them inside `<TooltipProvider>` before the skip-to-content link:

```tsx
<TooltipProvider>
  <ScrollProgress />
  <CustomCursor />
  {/* Skip to main content link ... */}
```

**Step 2: Verify build and dev**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm build`
Expected: Build succeeds. Gold progress bar appears at top when scrolling. Gold cursor dot visible on desktop.

**Step 3: Commit**

```bash
git add client/src/App.tsx
git commit -m "feat: add scroll progress bar and custom cursor to app shell"
```

---

## Phase 3: Hero and Navigation (Tasks 6-7)

### Task 6: Redesign Hero Section

**Files:**

- Modify: `client/src/components/Hero.tsx` (major rewrite)

**Step 1: Rewrite Hero component**

Replace the entire content of `client/src/components/Hero.tsx` with the new Belmond Heritage hero:

Key changes from current:

- Remove: decorative pulsing circles, sparkle badge, description paragraph, bouncing scroll indicator
- Add: Ken Burns effect on image, staggered text entrance, gold divider, refined CTAs
- Typography: Cormorant Garamond light (font-light) for title, DM Sans uppercase for tagline
- CTAs: Gold outline (hero-primary) and white outline (hero-secondary) using new button variants
- Trust indicators: Gold text with `|` separators instead of colored dots
- Scroll indicator: Gold vertical line + "Discover" text with subtle opacity pulse

The component should:

1. Use `useEffect` with GSAP timeline for staggered entrance animation (title letters, divider, tagline, CTAs)
2. Apply `animate-ken-burns` class to the hero image instead of JS parallax
3. Use `<Button variant="hero-primary" size="xl">` and `<Button variant="hero-secondary" size="xl">`
4. Simplify gradient to single `bg-gradient-to-t from-black/70 via-black/30 to-transparent`
5. Keep bilingual `t()` calls for all text

**Step 2: Verify visually**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev`
Expected: Hero renders with Ken Burns zooming image, staggered text entrance, gold divider line, gold outline CTAs, and "Discover" scroll indicator.

**Step 3: Verify build**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit && pnpm build`
Expected: No errors.

**Step 4: Commit**

```bash
git add client/src/components/Hero.tsx
git commit -m "style: redesign hero with Ken Burns effect, GSAP text reveal, gold accents"
```

---

### Task 7: Redesign Navigation (Header)

**Files:**

- Modify: `client/src/components/Header.tsx`

**Step 1: Restyle desktop navigation**

Key changes:

- Height: `h-20` → `h-24`
- Nav links: Add `nav-link` class (for gold underline animation), `text-xs font-medium tracking-[0.2em] uppercase`
- Active state: `text-[#D4AF37] border-b border-[#D4AF37]` instead of green
- "Book Now" button: Use `<Button variant="default" size="sm">` (gold outline)
- Scrolled state: `bg-[#FAF7F2]/95 backdrop-blur-md` + `border-b border-[#D4AF37]/20` instead of white
- Logo: Keep current, add `drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]` when on transparent hero

**Step 2: Restyle mobile menu**

Key changes:

- Full-screen overlay with `bg-[#FAF7F2]` (not transparent)
- Centered nav items in Cormorant Garamond `text-2xl font-light`
- Gold `h-px bg-[#D4AF37]/30` dividers between items
- "Book Now" at bottom: Full-width gold outline button

**Step 3: Update hover states**

Replace `hover:text-primary` with `hover:text-[#D4AF37]` across all nav links.
Replace `hover:bg-primary/10` with `hover:bg-[#D4AF37]/10` for touch targets.

**Step 4: Verify visually**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm dev`
Expected: Nav renders with uppercase tracking, gold underline hover, gold outline "Book Now", ivory scrolled background.

**Step 5: Verify build**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit && pnpm build`
Expected: No errors.

**Step 6: Commit**

```bash
git add client/src/components/Header.tsx
git commit -m "style: redesign navigation with gold accents and uppercase tracking"
```

---

## Phase 4: Homepage Sections (Tasks 8-15)

### Task 8: Restyle QuickInquiryForm

**Files:**

- Modify: `client/src/components/QuickInquiryForm.tsx`

**Changes:**

- Section bg: `bg-background` (warm ivory)
- Section padding: `py-24 md:py-32`
- Form container: Add `border border-[#D4AF37]/30` wrapper
- Section heading: Use Cormorant Garamond, add `<GoldDivider />` below
- Labels: `text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground`
- Input focus: Gold ring (already handled by CSS vars)
- Submit button: Gold outline `<Button variant="default">`
- Add `useScrollReveal` to the section container

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle inquiry form with gold border container and refined labels"`

---

### Task 9: Restyle Tours Section with GSAP Staggered Cards

**Files:**

- Modify: `client/src/components/Tours.tsx`

**Changes:**

- Section bg: `bg-card` (`#FDFBF7`)
- Section padding: `py-24 md:py-32`
- Section title: Cormorant Garamond `text-4xl md:text-5xl font-medium`, add `<GoldDivider />`
- Tour cards:
  - `border-t-2 border-[#D4AF37]` top border
  - `rounded-sm` (not rounded-lg)
  - `bg-card` background
  - Photo: 60% height, `overflow-hidden` for hover zoom
  - Image hover: `group-hover:scale-105 transition-transform duration-500`
  - Title: `font-[Cormorant_Garamond] text-xl font-medium`
  - Price: `text-[#D4AF37] font-medium`
  - Card hover: `hover:-translate-y-1 hover:shadow-premium-lg transition-all duration-300`
- Add GSAP staggered entrance: use `useScrollReveal` with `stagger: 0.15` on the grid container
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: redesign tour cards with gold borders and GSAP stagger"`

---

### Task 10: Restyle DestinationShowcase with Wipe-In Reveals

**Files:**

- Modify: `client/src/components/DestinationShowcase.tsx`

**Changes:**

- Section bg: `bg-background`
- Section padding: `py-24 md:py-32`
- Section title: Cormorant Garamond + `<GoldDivider />`
- Destination cards:
  - Full-bleed photo with `bg-gradient-to-t from-black/60 to-transparent` overlay
  - Name: `text-white uppercase tracking-[0.2em] text-sm font-medium` at bottom
  - Hover: `bg-[#D4AF37]/10` overlay tint + text `translate-y` shift
  - `rounded-sm overflow-hidden`
- Add `useScrollReveal` with stagger for card grid
- Grid: `grid-cols-2 lg:grid-cols-3 gap-4`

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle destination cards with gold overlay and scroll reveals"`

---

### Task 11: Restyle KosherInfo

**Files:**

- Modify: `client/src/components/KosherInfo.tsx`

**Changes:**

- Section bg: `bg-card`
- Section padding: `py-24 md:py-32`
- Layout: Split — text left, image right (if image exists), or centered
- Section title: Cormorant Garamond + `<GoldDivider />`
- Icon accents: `text-[#D4AF37]` for any icons
- Bullet/checkmark items: Gold checkmarks or gold dots
- Add `useScrollReveal`

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle kosher info with split layout and gold accents"`

---

### Task 12: Restyle Testimonials with Gold Quotation Marks

**Files:**

- Modify: `client/src/components/Testimonials.tsx`

**Changes:**

- Section bg: `bg-background`
- Section padding: `py-24 md:py-32`
- Section title: Cormorant Garamond + `<GoldDivider />`
- Testimonial display:
  - Large gold `"` quotation mark: `text-6xl text-[#D4AF37] font-[Cormorant_Garamond] leading-none`
  - Quote text: `font-[Cormorant_Garamond] italic text-xl md:text-2xl leading-relaxed`
  - Author: `— Name` with gold dash
  - Stars: Gold filled (`text-[#D4AF37]`)
  - No card borders — just subtle bottom divider
- If carousel: Use Framer Motion `AnimatePresence` for crossfade
- Add `useScrollReveal`

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle testimonials with gold quotation marks and serif quotes"`

---

### Task 13: Restyle WhyWiro with Gold Icons

**Files:**

- Modify: `client/src/components/WhyWiro.tsx`

**Changes:**

- Section bg: `bg-card`
- Section padding: `py-24 md:py-32`
- Section title: Cormorant Garamond + `<GoldDivider />`
- Icon colors: `text-[#D4AF37]` for all feature icons
- Feature cards: Clean grid, no heavy borders, `text-center`
- Feature titles: `font-[Cormorant_Garamond] text-lg font-medium`
- Add `useScrollReveal` with stagger

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle Why WIRO with gold icons and staggered reveal"`

---

### Task 14: Restyle CommunityConnection with Parallax

**Files:**

- Modify: `client/src/components/CommunityConnection.tsx`

**Changes:**

- Full-bleed photo section with `bg-cover bg-center bg-fixed` (CSS parallax)
- Dark overlay: `bg-black/60`
- Centered text: White + gold, Cormorant Garamond
- CTA: Gold outline button (hero-primary variant)
- Add subtle gold divider above text

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle community section with parallax and gold CTA"`

---

### Task 15: Restyle FAQ with Gold Chevrons

**Files:**

- Modify: `client/src/components/FAQ.tsx`

**Changes:**

- Section bg: `bg-background`
- Section padding: `py-24 md:py-32`
- Section title: Cormorant Garamond + `<GoldDivider />`
- Accordion items:
  - Thin `border-b border-[#E8E2DA]` dividers
  - Trigger text: `font-[Cormorant_Garamond] text-lg font-medium`
  - Chevron: `text-[#D4AF37]`
  - Content: DM Sans, `text-muted-foreground`
- If using Framer Motion for height animation: wrap content in `motion.div` with `animate={{ height: "auto" }}`
- Add `useScrollReveal`

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle FAQ accordion with gold chevrons and warm dividers"`

---

## Phase 5: Footer and Floating Buttons (Task 16)

### Task 16: Restyle Footer and FloatingActionButtons

**Files:**

- Modify: `client/src/components/Footer.tsx`
- Modify: `client/src/components/FloatingActionButtons.tsx`

**Footer changes:**

- Background: `bg-[#1C1C1C]` (charcoal) instead of `bg-foreground`
- Section headings: `text-[#D4AF37]` (gold) — already uses `text-secondary` which maps to gold
- Links hover: `hover:text-[#D4AF37]`
- Bottom border: `border-[#D4AF37]/20`
- Body text: `text-white/70` for readability
- Newsletter signup: Restyle input with gold focus ring
- Copyright text: `text-white/50`

**FloatingActionButtons changes:**

- WhatsApp button: Keep green (`#25D366`) for brand recognition
- "Book Now" button: Gold outline style matching new buttons
- Rounded: Keep rounded-full for FABs (they're floating action buttons, not nav buttons)

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle footer with charcoal bg and gold accents, update floating buttons"`

---

## Phase 6: Other Pages (Tasks 17-22)

### Task 17: Restyle BookingForm Page

**Files:**

- Modify: `client/src/pages/BookingForm.tsx`

**Changes:**

- Add short hero banner at top (40vh) with parallax background image + dark overlay
- Form card: `bg-card border border-[#D4AF37]/30 rounded-sm shadow-premium -mt-20 relative z-10`
- Form labels: `text-xs font-medium tracking-[0.15em] uppercase`
- Section title: Cormorant Garamond
- Submit button: Gold outline `<Button variant="default" size="lg">`
- Input/select focus: Gold ring (handled by CSS vars)

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: redesign booking form with hero banner and gold-bordered card"`

---

### Task 18: Restyle Gallery Page

**Files:**

- Modify: `client/src/pages/Gallery.tsx`

**Changes:**

- Page title: Cormorant Garamond + `<GoldDivider />`
- Category filter pills: Gold outline style — `border border-[#D4AF37] text-[#D4AF37] rounded-sm px-4 py-1.5 text-xs tracking-[0.15em] uppercase`, active: `bg-[#D4AF37] text-[#1C1C1C]`
- Image grid: Masonry or auto-rows layout
- Image hover: `scale-105` zoom + gold overlay tint `bg-[#D4AF37]/10`
- Add `useScrollReveal` with stagger on image grid
- `rounded-sm overflow-hidden` on image containers

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle gallery with gold filter pills and hover effects"`

---

### Task 19: Restyle TourDetail Page

**Files:**

- Modify: `client/src/pages/TourDetail.tsx`

**Changes:**

- Full-bleed hero image (60vh) with dark gradient overlay
- Content card with negative top margin: `-mt-20 relative z-10 bg-card rounded-sm shadow-premium`
- Tour name: Cormorant Garamond `text-4xl md:text-5xl font-medium`
- Gold divider below title
- Included items: Gold checkmarks `text-[#D4AF37]`
- Itinerary numbers: Gold accent `text-[#D4AF37] font-[Cormorant_Garamond] text-2xl`
- CTA buttons: Gold outline
- Parallax on hero image: `bg-fixed` or `animate-ken-burns`

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: redesign tour detail with overlapping content card and gold accents"`

---

### Task 20: Restyle Reviews Page

**Files:**

- Modify: `client/src/pages/Reviews.tsx`

**Changes:**

- Featured review at top: Large Cormorant Garamond italic quote, centered, gold quotation marks
- Review grid: Cards with gold star ratings, serif quotes
- Submit form: Gold-bordered container, refined labels
- Star ratings: `text-[#D4AF37]` for filled, `text-[#E8E2DA]` for empty
- Section title: Cormorant Garamond + `<GoldDivider />`

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle reviews with serif quotes and gold star ratings"`

---

### Task 21: Restyle Blog and BlogPost Pages

**Files:**

- Modify: `client/src/pages/Blog.tsx`
- Modify: `client/src/pages/BlogPost.tsx`

**Changes:**

**Blog listing:**

- Page title: Cormorant Garamond + `<GoldDivider />`
- Featured post: Large image with overlay text
- Post cards: Photo-forward, gold top border, serif titles
- Publish date: `text-xs text-muted-foreground uppercase tracking-wider`
- "Read more" links: `text-[#D4AF37] hover:underline`

**Blog post:**

- Editorial layout: Content max-width `max-w-3xl mx-auto`
- Post title: Cormorant Garamond `text-4xl md:text-5xl font-medium`
- Body: DM Sans `text-lg leading-relaxed`
- Links in content: `text-[#D4AF37]`
- Gold divider between title and content

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle blog with editorial layout and gold accent links"`

---

### Task 22: Restyle Pricing and Estimate Pages

**Files:**

- Modify: `client/src/pages/Pricing.tsx`
- Modify: `client/src/pages/Estimate.tsx`
- Modify: `client/src/components/CostCalculator.tsx`

**Changes:**

**Pricing:**

- Page title: Cormorant Garamond + `<GoldDivider />`
- Pricing cards: `bg-card border border-[#E8E2DA] rounded-sm`
- Recommended tier: `border-[#D4AF37]` + gold "Popular" badge
- Price amounts: `text-[#D4AF37] font-[Cormorant_Garamond] text-3xl`

**Estimate / CostCalculator:**

- Form container: Gold border accent
- Labels: Uppercase tracking
- Result breakdown: Gold accent on totals
- CTA: Gold outline button

**Verify:** `pnpm build` passes.

**Commit:** `git commit -m "style: restyle pricing tiers and cost estimator with gold accents"`

---

## Phase 7: Page Transitions (Task 23)

### Task 23: Add Framer Motion Page Transitions

**Files:**

- Modify: `client/src/App.tsx`

**Step 1: Add AnimatePresence wrapper**

In `client/src/App.tsx`, import `motion` and `AnimatePresence` from `framer-motion`:

```typescript
import { motion, AnimatePresence } from "framer-motion";
```

Replace the `<div key={location} className="animate-page-in">` wrapper in the `Router` function with:

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={location}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    <Switch>{/* ... existing routes ... */}</Switch>
  </motion.div>
</AnimatePresence>
```

**Step 2: Verify build**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit && pnpm build`
Expected: Build succeeds. Pages now smoothly fade/slide between routes.

**Step 3: Commit**

```bash
git add client/src/App.tsx
git commit -m "feat: add Framer Motion page transitions with fade and slide"
```

---

## Phase 8: Verification (Task 24)

### Task 24: Full Build, Type Check, Test, and Visual Verification

**Step 1: Type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No type errors.

**Step 2: Run tests**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All 107 tests pass (90 pass, 17 skip). Visual changes should not break any tests since tests are backend/logic-focused.

**Step 3: Build for production**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm build`
Expected: Build succeeds with no warnings.

**Step 4: Visual verification checklist**

Run `pnpm dev` and verify each page:

- [ ] **Homepage hero:** Ken Burns zooming image, staggered text entrance, gold CTAs, no pulsing circles
- [ ] **Navigation:** Uppercase tracking, gold underline hover, gold "Book Now", ivory scrolled bg
- [ ] **Scroll progress:** Gold line at top of viewport
- [ ] **Custom cursor:** Gold dot that scales on interactive elements (desktop only)
- [ ] **Tours section:** Gold top-bordered cards, staggered entrance, hover zoom on images
- [ ] **Destinations:** Photo grid with gold hover overlay
- [ ] **Testimonials:** Gold quotation marks, serif italic quotes
- [ ] **Footer:** Charcoal background, gold headings
- [ ] **Booking form:** Hero banner, overlapping gold-bordered form card
- [ ] **Gallery:** Gold filter pills, image hover zoom + gold tint
- [ ] **Tour detail:** Full-bleed hero, overlapping content card
- [ ] **Reviews:** Gold stars, serif quotes
- [ ] **Blog:** Editorial layout, gold links
- [ ] **Pricing:** Gold-accented tiers
- [ ] **Hebrew mode:** Toggle language — Frank Ruhl Libre headings, Heebo body, all text renders correctly
- [ ] **Dark mode:** Toggle theme — dark backgrounds, gold accents preserved
- [ ] **Mobile:** Responsive nav, no custom cursor, section padding works
- [ ] **Reduced motion:** Enable OS reduce motion — all animations disabled

**Step 5: Final commit**

If any fixes were needed during verification, commit them:

```bash
git add -A
git commit -m "fix: visual polish and verification fixes for Belmond Heritage redesign"
```

---

## Summary

| Phase                | Tasks | Focus                                                 |
| -------------------- | ----- | ----------------------------------------------------- |
| 1. Foundation        | 1-3   | GSAP install, fonts, CSS tokens, utility components   |
| 2. Design System     | 4-5   | Button variants, global components in App             |
| 3. Hero + Nav        | 6-7   | Hero redesign with Ken Burns/GSAP, nav restyle        |
| 4. Homepage Sections | 8-15  | All 8 homepage components restyled                    |
| 5. Footer + FABs     | 16    | Footer and floating buttons                           |
| 6. Other Pages       | 17-22 | Booking, Gallery, Tour Detail, Reviews, Blog, Pricing |
| 7. Page Transitions  | 23    | Framer Motion AnimatePresence                         |
| 8. Verification      | 24    | Build, test, visual checklist                         |

**Total: 24 tasks, ~30 files modified, ~4 files created**
