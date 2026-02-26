# Homepage Premium Restructure — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the WIRO 4x4 homepage into a premium, conversion-focused layout inspired by senior.co.il — with stronger CTAs, trust signals, tour filtering, and visual polish.

**Architecture:** Frontend-only restructure. Reuse existing tRPC data layer (tours, gallery, reviews, newsletter). Create 4 new components, rewrite Hero, enhance Tours/Testimonials/TrustAndKosher, update Header, and reorder Home.tsx sections. No backend changes needed.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, tRPC 11, Embla Carousel, GSAP (scroll reveal), Lucide icons

**Design Doc:** `docs/plans/2026-02-26-homepage-premium-restructure-design.md`

---

## Critical Conventions

Before implementing ANY component, follow these project conventions:

1. **Bilingual:** Every user-visible string uses `const { t } = useLanguage()` then `t("English", "Hebrew")`
2. **Colors:** Gold = `#d4af37` (or `var(--secondary)`). Charcoal = `#1c1c1c`. Ivory bg = `#faf7f2`
3. **Fonts:** Headings use `font-heading` (Oswald). Body uses default (Source Sans 3)
4. **Images:** Use `<picture>` with WebP + JPG fallback. First image: `loading="eager"`. Others: `loading="lazy"`
5. **Section IDs:** Add `id="section-name"` for header nav scroll targets
6. **Scroll reveal:** Use `useScrollReveal` hook from `@/hooks/useScrollReveal` for entrance animations
7. **Icons:** Import from `lucide-react`
8. **Links:** Use `<Link href="..." />` from `wouter` for internal routes
9. **tRPC:** Use `trpc.*.useQuery()` for reads, `trpc.*.useMutation()` for writes
10. **No RTL:** Hebrew uses same LTR layout as English
11. **Dark mode:** Support via `dark:` Tailwind prefix (existing pattern)
12. **Root copies:** When editing `client/src/components/Tours.tsx`, also sync `components/Tours.tsx` at repo root

---

## Task Dependency Graph

```
[Task 1: Header] → independent
[Task 2: AnnouncementBar] → independent
[Task 3: Hero] → independent
[Task 4: StatsCounter] → independent
[Task 5: Tours] → independent
[Task 6: GalleryShowcase] → independent
[Task 7: TrustAndKosher] → independent
[Task 8: Testimonials] → independent
[Task 9: QuickInquiryForm] → independent
[Task 10: NewsletterCTA] → independent
──────────────────────────────────────
[Task 11: Home.tsx Orchestration] → depends on ALL above (Tasks 1-10)
[Task 12: Verification & Cleanup] → depends on Task 11
```

Tasks 1-10 can be implemented in parallel. Task 11 wires them together. Task 12 verifies everything works.

---

### Task 1: Header — Bigger Logo, Transparent→Solid, Remove Packages

**Files:**

- Modify: `client/src/components/Header.tsx`

**Context:** Header is 335 lines. Logo uses `h-16 md:h-20`. Navigation includes a "Packages" link. Scroll behavior already exists (solid bg when `scrolled > 50px`) but uses `bg-[#FAF7F2]/95`. Need: bigger logo, truly transparent on hero (no bg), remove Packages nav link.

**Step 1: Increase logo size**

In `Header.tsx`, find the logo `<img>` tag (around line 160-170). Change:

```tsx
// FROM:
className = "h-16 md:h-20 w-auto ...";
// TO:
className = "h-24 md:h-32 lg:h-36 w-auto ...";
```

This approximately doubles the logo from 64-80px to 96-128-144px.

**Step 2: Make header fully transparent on hero**

Find the header's background classes that conditionally apply on scroll. The header should be:

- **Not scrolled + homepage:** Fully transparent background (`bg-transparent`)
- **Scrolled OR non-homepage:** Solid background (`bg-[#FAF7F2]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-sm`)

Look for the existing scroll logic (around line 50-70) and ensure `bg-transparent` is the default state when not scrolled on homepage. The existing `isHomePage && !scrolled` pattern for white nav text should already handle this — just verify no background color leaks through in the un-scrolled state.

**Step 3: Remove Packages navigation link**

Find the navigation items array or JSX (around line 180-220). Remove the "Packages" entry from both desktop and mobile nav. There should be items like:

```tsx
{ href: "/packages", label: t("Packages", "חבילות") }
```

Remove this entry. Keep all other nav items.

**Step 4: Ensure Book Now button uses gold accent**

Find the "Book Now" button in the header. It should use:

```tsx
className = "bg-[#d4af37] hover:bg-[#c5a033] text-white font-bold ...";
```

If it's using a different color scheme, update to gold.

**Step 5: Verify and commit**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`
Expected: No type errors

```bash
git add client/src/components/Header.tsx
git commit -m "feat(header): bigger logo, transparent on hero, remove packages nav"
```

---

### Task 2: AnnouncementBar — New Component

**Files:**

- Create: `client/src/components/AnnouncementBar.tsx`

**Context:** Slim gold bar above the header. Rotating seasonal offers. Dismissible via localStorage. Bilingual.

**Step 1: Create the component**

Create `client/src/components/AnnouncementBar.tsx`:

```tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STORAGE_KEY = "wiro-announcement-dismissed";

const OFFERS = [
  { en: "Book 3+ days and get 10% off!", he: "הזמינו 3+ ימים וקבלו 10% הנחה!" },
  {
    en: "Early bird special — Book now for peak season!",
    he: "מבצע מוקדם — הזמינו עכשיו לעונת השיא!",
  },
  {
    en: "New! Samoeng Loop Mountain Circuit now available",
    he: "חדש! מסלול לולאת סמואנג זמין עכשיו",
  },
];

export function AnnouncementBar() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY);
    if (!wasDismissed) setDismissed(false);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % OFFERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const offer = OFFERS[currentIndex];

  return (
    <div
      className="bg-[#d4af37] text-[#1c1c1c] text-center text-sm font-medium relative"
      style={{ height: "36px", lineHeight: "36px" }}
    >
      <span className="inline-block animate-fade-in">
        {t(offer.en, offer.he)}
      </span>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label={t("Dismiss announcement", "סגור הודעה")}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

**Step 2: Verify TypeScript**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add client/src/components/AnnouncementBar.tsx
git commit -m "feat: add AnnouncementBar with rotating offers and localStorage dismiss"
```

---

### Task 3: Hero — Rewrite with Single Banner Image

**Files:**

- Modify: `client/src/components/Hero.tsx` (full rewrite, keep same export name)

**Context:** Current Hero is 346 lines with 3-slide carousel, GSAP timeline, autoplay, dot navigation. Replace with a single full-viewport image hero using `/images/banner.jpeg`. GSAP is still used by `useScrollReveal` hook elsewhere, so do NOT remove GSAP from package.json.

**Step 1: Rewrite Hero.tsx**

Replace the entire contents of `client/src/components/Hero.tsx` with:

```tsx
import { useRef, useEffect } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_WHATSAPP_URL } from "@/const";
import gsap from "gsap";

const TRUST_ITEMS = [
  { en: "Hebrew Speaking", he: "דוברי עברית" },
  { en: "Kosher Meals", he: "ארוחות כשרות" },
  { en: "Shabbat Friendly", he: "שומרי שבת" },
  { en: "Private Tours", he: "טיולים פרטיים" },
];

export function Hero() {
  const { t } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !contentRef.current) return;

    const children = contentRef.current.children;
    gsap.set(children, { y: 30, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(children[0], { y: 0, opacity: 1, duration: 0.8 })
      .to(children[1], { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .to(children[2], { y: 0, opacity: 1, duration: 0.6 }, "-=0.2")
      .to(children[3], { y: 0, opacity: 1, duration: 0.5 }, "-=0.2")
      .to(children[4], { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");

    return () => {
      tl.kill();
    };
  }, []);

  const scrollToTours = () => {
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <img
        src="/images/banner.jpeg"
        alt={t(
          "Travelers with WIRO 4x4 vehicle on jungle road in Chiang Mai",
          "מטיילים עם רכב WIRO 4x4 בדרך ג'ונגל בצ'יאנג מאי"
        )}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        fetchPriority="high"
      />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div
        ref={contentRef}
        className="absolute bottom-0 left-0 right-0 pb-24 px-6 md:px-12 lg:px-20 text-white"
      >
        {/* Heading */}
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
          WIRO 4×4
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl lg:text-3xl font-light mb-8 max-w-2xl opacity-90">
          {t(
            "Kosher Off-Road Adventures in Chiang Mai",
            "הרפתקאות שטח כשרות בצ'יאנג מאי"
          )}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={scrollToTours}
            className="bg-[#d4af37] hover:bg-[#c5a033] text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg"
          >
            {t("Explore Tours", "גלו את הטיולים")}
          </button>
          <a
            href={COMPANY_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white/80 hover:bg-white/10 text-white font-bold px-8 py-3 rounded-lg text-lg transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            {t("WhatsApp Us", "דברו איתנו בוואטסאפ")}
          </a>
        </div>

        {/* Trust badge pills */}
        <div className="flex flex-wrap gap-2">
          {TRUST_ITEMS.map(item => (
            <span
              key={item.en}
              className="bg-white/15 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full border border-white/20"
            >
              {t(item.en, item.he)}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll chevron */}
      <div
        ref={chevronRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-subtle-pulse cursor-pointer"
        onClick={scrollToTours}
      >
        <ChevronDown className="w-8 h-8 text-white/70" />
      </div>
    </section>
  );
}
```

**Step 2: Verify TypeScript**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add client/src/components/Hero.tsx
git commit -m "feat(hero): replace carousel with single banner.jpeg, bottom gradient, trust pills"
```

---

### Task 4: StatsCounter — New Component

**Files:**

- Create: `client/src/components/StatsCounter.tsx`

**Context:** Horizontal row showing 4 stats with count-up animation on scroll. Uses Intersection Observer for trigger. Gold numbers, muted labels, icons.

**Step 1: Create the component**

Create `client/src/components/StatsCounter.tsx`:

```tsx
import { useState, useEffect, useRef } from "react";
import { Map, Users, Route, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STATS = [
  {
    icon: Map,
    value: 500,
    suffix: "+",
    en: "Tours Completed",
    he: "טיולים שהושלמו",
  },
  {
    icon: Users,
    value: 120,
    suffix: "+",
    en: "Happy Travelers",
    he: "מטיילים מרוצים",
  },
  {
    icon: Route,
    value: 6,
    suffix: "",
    en: "Unique Routes",
    he: "מסלולים ייחודיים",
  },
  {
    icon: ShieldCheck,
    value: 100,
    suffix: "%",
    en: "Kosher Certified",
    he: "כשרות מוסמכת",
  },
];

function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, isVisible, duration]);

  return count;
}

function StatItem({
  icon: Icon,
  value,
  suffix,
  label,
}: {
  icon: typeof Map;
  value: number;
  suffix: string;
  label: string;
  isVisible: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <Icon className="w-8 h-8 text-[#d4af37] mb-2" strokeWidth={1.5} />
      <span className="text-3xl md:text-4xl font-heading font-bold text-[#d4af37]">
        {value}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export function StatsCounter() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 bg-[#fdfbf7] dark:bg-[#1A1A1A] border-y border-[#e8e2da] dark:border-[#333]">
      <div
        ref={ref}
        className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(stat => (
            <StatItem
              key={stat.en}
              icon={stat.icon}
              value={isVisible ? stat.value : 0}
              suffix={stat.suffix}
              label={t(stat.en, stat.he)}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Important fix:** The `StatItem` receives `value` as a prop but we need the count-up. Refactor so `StatItem` internally uses the `useCountUp` hook:

```tsx
function StatItem({
  icon: Icon,
  target,
  suffix,
  label,
  isVisible,
}: {
  icon: typeof Map;
  target: number;
  suffix: string;
  label: string;
  isVisible: boolean;
}) {
  const count = useCountUp(target, isVisible);
  return (
    <div className="flex flex-col items-center text-center p-4">
      <Icon className="w-8 h-8 text-[#d4af37] mb-2" strokeWidth={1.5} />
      <span className="text-3xl md:text-4xl font-heading font-bold text-[#d4af37]">
        {count}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
```

And update the rendering to pass `target={stat.value}` instead of `value`.

**Step 2: Verify TypeScript**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add client/src/components/StatsCounter.tsx
git commit -m "feat: add StatsCounter with count-up animation on scroll"
```

---

### Task 5: Tours — Filter Chips + Grid Layout

**Files:**

- Modify: `client/src/components/Tours.tsx` (403 lines)
- Sync: `components/Tours.tsx` (root-level copy)

**Context:** Currently uses Embla carousel with 3-across cards. Replace with filter chips + CSS grid. Keep existing data fetching, `TOUR_IMAGE_MAP`, fallback tours, and `<picture>` pattern. The card content structure stays similar but layout changes.

**Step 1: Add filter state and chips UI**

At the top of the `Tours` component function, add:

```tsx
const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
const [durationFilter, setDurationFilter] = useState<string>("all");
```

Add filter chip arrays:

```tsx
const DIFFICULTY_FILTERS = [
  { value: "all", en: "All", he: "הכל" },
  { value: "easy", en: "Easy", he: "קל" },
  { value: "moderate", en: "Moderate", he: "בינוני" },
  { value: "challenging", en: "Challenging", he: "מאתגר" },
];

const DURATION_FILTERS = [
  { value: "all", en: "All Durations", he: "כל הזמנים" },
  { value: "half", en: "Half Day (5-7h)", he: "חצי יום (5-7 שעות)" },
  { value: "full", en: "Full Day (7-10h)", he: "יום שלם (7-10 שעות)" },
];
```

**Step 2: Add filtering logic**

Filter tours before rendering:

```tsx
const filteredTours = displayTours.filter(tour => {
  if (difficultyFilter !== "all" && tour.difficulty !== difficultyFilter)
    return false;
  if (durationFilter !== "all") {
    const hours = parseDurationHours(tour.duration); // extract number from "7-8 hours" etc.
    if (durationFilter === "half" && hours > 7) return false;
    if (durationFilter === "full" && hours <= 7) return false;
  }
  return true;
});
```

Add a helper at the top of the file:

```tsx
function parseDurationHours(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 8;
}
```

**Step 3: Replace carousel with filter UI + grid**

Remove all Embla carousel imports and logic (`useEmblaCarousel`, `emblaRef`, navigation arrows, dots).

Replace the carousel JSX with:

```tsx
{
  /* Filter chips */
}
<div className="flex flex-wrap gap-2 mb-6 justify-center">
  {DIFFICULTY_FILTERS.map(f => (
    <button
      key={f.value}
      onClick={() => setDifficultyFilter(f.value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        difficultyFilter === f.value
          ? "bg-[#d4af37] text-white"
          : "bg-[#e8e2da] dark:bg-[#333] text-[#1c1c1c] dark:text-[#faf7f2] hover:bg-[#d4af37]/20"
      }`}
    >
      {t(f.en, f.he)}
    </button>
  ))}
  <span className="w-px h-8 bg-[#e8e2da] dark:bg-[#444] self-center mx-1" />
  {DURATION_FILTERS.map(f => (
    <button
      key={f.value}
      onClick={() => setDurationFilter(f.value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        durationFilter === f.value
          ? "bg-[#d4af37] text-white"
          : "bg-[#e8e2da] dark:bg-[#333] text-[#1c1c1c] dark:text-[#faf7f2] hover:bg-[#d4af37]/20"
      }`}
    >
      {t(f.en, f.he)}
    </button>
  ))}
</div>;

{
  /* Tour grid */
}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredTours.map(tour => (
    <TourCard key={tour.id ?? tour.slug} tour={tour} />
  ))}
</div>;
```

**Step 4: Refactor card into TourCard**

Extract the existing card JSX into a `TourCard` component within the same file. Update the card to use:

- `aspect-[16/10]` for image container
- `overflow-hidden group` on card for hover zoom
- `group-hover:scale-105 transition-transform duration-500` on image
- Price badge overlay: `absolute top-3 right-3 bg-[#d4af37] text-white font-bold px-3 py-1 rounded-lg`
- Keep existing `<picture>` pattern with `TOUR_IMAGE_MAP`
- Keep existing difficulty labels, kosher/private/shabbat tags
- "View Details →" link using `<Link href={/tours/${tour.slug}}>` from wouter

**Step 5: Keep the "Estimate Your Trip Cost" CTA below the grid**

Keep the existing CTA that links to `/estimate`.

**Step 6: Sync root copy**

```bash
cp client/src/components/Tours.tsx components/Tours.tsx
```

**Step 7: Verify and commit**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`

```bash
git add client/src/components/Tours.tsx components/Tours.tsx
git commit -m "feat(tours): replace carousel with filter chips + responsive grid layout"
```

---

### Task 6: GalleryShowcase — New Component

**Files:**

- Create: `client/src/components/GalleryShowcase.tsx`

**Context:** Masonry-style grid of 6-8 photos. Data from `trpc.gallery.list` with local fallback. Hover zoom + caption. CTA to /gallery. Replaces `PhotoGallery` on homepage.

**Step 1: Create the component**

Create `client/src/components/GalleryShowcase.tsx`:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Camera, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FALLBACK_IMAGES = [
  { src: "/images/optimized/hero-wiro.jpg", caption: "Chiang Mai Adventure" },
  {
    src: "/images/optimized/accessible_doi_inthanon_summit.jpg",
    caption: "Doi Inthanon Summit",
  },
  {
    src: "/images/optimized/mae_kampong_hidden_village.jpg",
    caption: "Mae Kampong Village",
  },
  {
    src: "/images/optimized/maerim_sticky_waterfalls.jpg",
    caption: "Sticky Waterfalls",
  },
  {
    src: "/images/optimized/doi_suthep_pui_temple.jpg",
    caption: "Doi Suthep Temple",
  },
  { src: "/images/optimized/mae_wang_jungle.jpg", caption: "Mae Wang Jungle" },
];

export function GalleryShowcase() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });
  const { data: photos } = trpc.gallery.list.useQuery();

  const images =
    photos && photos.length >= 6
      ? photos.slice(0, 8).map(p => ({
          src: p.s3Url || FALLBACK_IMAGES[0].src,
          caption: p.title || "",
        }))
      : FALLBACK_IMAGES;

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-[#faf7f2] dark:bg-[#111]"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Camera className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1c1c1c] dark:text-[#faf7f2] mb-3">
            {t("Adventure Gallery", "גלריית הרפתקאות")}
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg group break-inside-avoid"
            >
              <img
                src={img.src}
                alt={img.caption}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium">
                  {img.caption}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#c5a033] font-semibold text-lg transition-colors"
          >
            {t("See Full Gallery", "לגלריה המלאה")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify fallback image paths exist**

Check that the paths in `FALLBACK_IMAGES` correspond to actual files in `client/public/images/optimized/`. Adjust filenames to match whatever actually exists (use `ls client/public/images/optimized/` to check). The key pattern is: use real existing local images, not invented paths.

**Step 3: Verify and commit**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`

```bash
git add client/src/components/GalleryShowcase.tsx
git commit -m "feat: add GalleryShowcase with masonry grid and hover captions"
```

---

### Task 7: TrustAndKosher — Restyled Combined Layout

**Files:**

- Modify: `client/src/components/TrustAndKosher.tsx` (132 lines)

**Context:** Currently a 2-column layout (image left, trust points right) with kosher section below. Restyle to: left column = large guide photo, right column = 2×3 grid of trust points with icons, below = kosher logistics as collapsible accordion. Warm cream background.

**Step 1: Restructure the trust points into a 2×3 grid**

The current trust points are in a vertical list. Change to:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {trustPoints.map(point => (
    <div
      key={point.en}
      className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5"
    >
      <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0">
        <point.icon className="w-5 h-5 text-[#d4af37]" />
      </div>
      <div>
        <h4 className="font-semibold text-sm">{t(point.en, point.he)}</h4>
        <p className="text-xs text-muted-foreground">
          {t(point.descEn, point.descHe)}
        </p>
      </div>
    </div>
  ))}
</div>
```

**Step 2: Make kosher section a collapsible accordion**

Import `useState` and wrap the kosher details:

```tsx
const [kosherOpen, setKosherOpen] = useState(false);

{
  /* Below the main grid */
}
<div className="mt-8 border-t border-[#d4af37]/30 pt-6">
  <button
    onClick={() => setKosherOpen(!kosherOpen)}
    className="flex items-center gap-2 w-full text-left font-heading text-xl font-bold"
  >
    <ShieldCheck className="w-6 h-6 text-[#d4af37]" />
    {t("Kosher Standards & Logistics", "תקני כשרות ולוגיסטיקה")}
    <ChevronDown
      className={`w-5 h-5 ml-auto transition-transform ${kosherOpen ? "rotate-180" : ""}`}
    />
  </button>
  {kosherOpen && (
    <div className="mt-4 text-muted-foreground leading-relaxed animate-fade-in">
      {/* existing kosher paragraph content */}
    </div>
  )}
</div>;
```

**Step 3: Add warm cream background to entire section**

Change the section wrapper background:

```tsx
<section id="why-wiro" className="py-16 md:py-20 bg-[#fdfbf7] dark:bg-[#1A1A1A]">
```

**Step 4: Verify and commit**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`

```bash
git add client/src/components/TrustAndKosher.tsx
git commit -m "feat(trust): 2x3 grid layout, collapsible kosher accordion, cream background"
```

---

### Task 8: Testimonials — Enhanced Cards + Rating Header

**Files:**

- Modify: `client/src/components/Testimonials.tsx` (214 lines)

**Context:** Already has Embla carousel with 3-across cards, gold left-border, quote icon, star rating. The rating header ("What Our Travelers Say" + 5.0 from 120+) already exists. Enhancements: add hover lift animation, ensure cards have consistent height, polish the overall styling.

**Step 1: Add hover lift to cards**

Find the card wrapper div and add:

```tsx
className =
  "... hover:-translate-y-1 hover:shadow-lg transition-all duration-300";
```

**Step 2: Ensure cards have premium shadow**

Add `shadow-premium` class (defined in index.css) to each card.

**Step 3: Source reviews from tRPC**

If not already done, add:

```tsx
const { data: dbReviews } = trpc.review.listPublic.useQuery();
```

Merge DB reviews with hardcoded fallback (prefer DB if available):

```tsx
const reviews =
  dbReviews && dbReviews.length > 0
    ? dbReviews.slice(0, 9).map(r => ({
        name: r.name,
        location: "",
        rating: r.rating,
        text: r.text,
      }))
    : FALLBACK_TESTIMONIALS;
```

**Step 4: Verify and commit**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`

```bash
git add client/src/components/Testimonials.tsx
git commit -m "feat(testimonials): hover lift, premium shadows, tRPC review source"
```

---

### Task 9: QuickInquiryForm — Polish Spacing

**Files:**

- Modify: `client/src/components/QuickInquiryForm.tsx` (285 lines)

**Context:** Existing form works well. Just needs tighter spacing and premium card shadow per design doc.

**Step 1: Add premium card wrapper**

Find the main form container and update its classes:

```tsx
className =
  "bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-premium-lg p-8 md:p-10 border border-[#e8e2da]/50 dark:border-[#333]";
```

**Step 2: Tighten spacing**

Reduce gaps between form fields from `gap-6` to `gap-4` (or similar). Adjust section padding from `py-20` to `py-16`.

**Step 3: Verify and commit**

```bash
git add client/src/components/QuickInquiryForm.tsx
git commit -m "style(inquiry): premium card shadow, tighter spacing"
```

---

### Task 10: NewsletterCTA — New Component

**Files:**

- Create: `client/src/components/NewsletterCTA.tsx`

**Context:** Dark navy or gold gradient section. Email input + subscribe button. Uses existing `trpc.newsletter.subscribe` endpoint. Bilingual.

**Step 1: Create the component**

Create `client/src/components/NewsletterCTA.tsx`:

```tsx
import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function NewsletterCTA() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success(t("Subscribed successfully!", "נרשמת בהצלחה!"));
      setEmail("");
    },
    onError: err => {
      toast.error(err.message || t("Something went wrong", "משהו השתבש"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribeMutation.mutate({ email: email.trim(), language });
  };

  return (
    <section className="py-16 bg-[#1c1c1c] dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl text-center">
        <Mail className="w-10 h-10 text-[#d4af37] mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
          {t(
            "Get Exclusive Tour Deals & Travel Tips",
            "קבלו מבצעים בלעדיים וטיפים לטיולים"
          )}
        </h2>
        <p className="text-white/60 mb-8 max-w-lg mx-auto">
          {t(
            "Join our newsletter for seasonal offers, new routes, and insider tips for traveling in Northern Thailand.",
            "הצטרפו לניוזלטר שלנו למבצעים עונתיים, מסלולים חדשים וטיפים פנימיים לטיול בצפון תאילנד."
          )}
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("Your email address", "כתובת האימייל שלך")}
            required
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="bg-[#d4af37] hover:bg-[#c5a033] text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {subscribeMutation.isPending
              ? t("Subscribing...", "נרשם...")
              : t("Subscribe", "הרשמה")}
          </button>
        </form>
      </div>
    </section>
  );
}
```

**Step 2: Verify and commit**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`

```bash
git add client/src/components/NewsletterCTA.tsx
git commit -m "feat: add NewsletterCTA with email subscribe and bilingual support"
```

---

### Task 11: Home.tsx — Orchestrate New Section Order

**Files:**

- Modify: `client/src/pages/Home.tsx`

**Context:** Current Home.tsx is 31 lines. Need to add imports for new components, add existing CostCalculator and CommunityConnection, remove PhotoGallery, and reorder everything.

**Step 1: Rewrite Home.tsx**

```tsx
import { Header } from "@/components/Header";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Hero } from "@/components/Hero";
import { StatsCounter } from "@/components/StatsCounter";
import { Tours } from "@/components/Tours";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { CostCalculator } from "@/components/CostCalculator";
import { TrustAndKosher } from "@/components/TrustAndKosher";
import { Testimonials } from "@/components/Testimonials";
import { CommunityConnection } from "@/components/CommunityConnection";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { FAQ } from "@/components/FAQ";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Home() {
  usePageMeta("Kosher Off-Road Adventures in Chiang Mai");
  return (
    <div className="min-h-screen smooth-scroll">
      <AnnouncementBar />
      <Header />
      <main id="main-content">
        <Hero />
        <StatsCounter />
        <Tours />
        <GalleryShowcase />
        <div className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
            <CostCalculator />
          </div>
        </div>
        <TrustAndKosher />
        <Testimonials />
        <CommunityConnection />
        <QuickInquiryForm />
        <FAQ />
        <NewsletterCTA />
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
```

**Important notes:**

- `PhotoGallery` import is removed (replaced by `GalleryShowcase`)
- `CostCalculator` is wrapped in a container div with padding (it's currently a component without its own section wrapper)
- `CommunityConnection` is added between Testimonials and QuickInquiryForm
- `AnnouncementBar` goes ABOVE `Header`

**Step 2: Verify TypeScript**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`

If `CostCalculator` has import issues (it may expect to be inside the `/estimate` page context), check if it needs any props and adjust accordingly.

**Step 3: Commit**

```bash
git add client/src/pages/Home.tsx
git commit -m "feat(home): restructure section order with all new and enhanced components"
```

---

### Task 12: Verification & Cleanup

**Files:**

- Various (verification only, no expected edits)

**Step 1: TypeScript check**

Run: `cd ~/workspace/wiro4x4 && npx tsc --noEmit`
Expected: No type errors

**Step 2: Run test suite**

Run: `cd ~/workspace/wiro4x4 && pnpm test`
Expected: All existing tests pass (125 local tests). No regression.

**Step 3: Visual verification**

Run: `cd ~/workspace/wiro4x4 && pnpm dev`

Open `http://localhost:5173` and verify:

1. AnnouncementBar shows gold bar with rotating offers, X button dismisses
2. Header has larger logo, transparent on hero, solid on scroll, no Packages link
3. Hero shows banner.jpeg full-viewport, gradient overlay, CTAs work, trust pills visible
4. StatsCounter shows animated numbers (500+, 120+, 6, 100%)
5. Tours section has filter chips that work, 3-column grid on desktop
6. GalleryShowcase shows masonry grid with hover captions
7. CostCalculator appears mid-page with proper styling
8. TrustAndKosher has 2×3 grid, collapsible kosher section
9. Testimonials have hover lift effect
10. CommunityConnection renders correctly
11. QuickInquiryForm has premium shadow
12. NewsletterCTA shows dark section with email subscribe
13. Toggle language (EN/HE) — all new sections show Hebrew text
14. Check mobile responsive (320px, 768px, 1024px breakpoints)

**Step 4: Check GSAP is still used**

Verify `useScrollReveal.ts` still imports GSAP. Since it does, do NOT remove GSAP from `package.json`.

**Step 5: Final commit**

If any fixes were needed during verification:

```bash
git add -A
git commit -m "fix: verification fixes for homepage premium restructure"
```

---

## Summary

| Task | Component        | Action                                      | Est. Lines   |
| ---- | ---------------- | ------------------------------------------- | ------------ |
| 1    | Header           | Modify (logo, transparent, remove packages) | ~20 changed  |
| 2    | AnnouncementBar  | Create new                                  | ~60          |
| 3    | Hero             | Full rewrite                                | ~110         |
| 4    | StatsCounter     | Create new                                  | ~90          |
| 5    | Tours            | Major modify (filters + grid)               | ~150 changed |
| 6    | GalleryShowcase  | Create new                                  | ~80          |
| 7    | TrustAndKosher   | Restyle                                     | ~50 changed  |
| 8    | Testimonials     | Enhance                                     | ~30 changed  |
| 9    | QuickInquiryForm | Polish                                      | ~10 changed  |
| 10   | NewsletterCTA    | Create new                                  | ~70          |
| 11   | Home.tsx         | Rewrite imports + order                     | ~40          |
| 12   | Verification     | Test + visual check                         | 0            |
