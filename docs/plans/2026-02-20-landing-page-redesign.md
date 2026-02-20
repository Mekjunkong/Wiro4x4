# Landing Page Redesign — Cinematic Scroll Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the Wiro4x4 landing page from 9 sections to 6 with a luxury adventure aesthetic (dark backgrounds, gold accents, cinematic imagery).

**Architecture:** Modify existing React components in-place with dark theme styling. Create one new merged component (TrustAndKosher). Update Home.tsx to remove unused sections and reorder. No backend or database changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, GSAP, Embla Carousel (already installed), Framer Motion

---

### Task 1: Update CSS Variables for Dark Landing Sections

**Files:**

- Modify: `client/src/index.css`

**Step 1: Add dark landing section utility class**

After the existing `.dark { ... }` block (around line 122), add a new utility class in the `@layer components` section that landing page sections will use. This allows dark sections without toggling the global theme.

Add inside `@layer components { ... }`:

```css
/* Dark cinematic section for landing page */
.section-dark {
  --section-bg: #0f0f0f;
  --section-bg-alt: #141414;
  --section-card-bg: #1c1c1c;
  --section-text: #f0ede8;
  --section-text-muted: #9b9590;
  --section-border: #2a2a25;
}
```

**Step 2: Verify no build errors**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add client/src/index.css
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "style: add dark section CSS variables for landing page"
```

---

### Task 2: Refine Hero Section

**Files:**

- Modify: `client/src/components/Hero.tsx`

**Step 1: Darken gradient overlay**

In the gradient div (around line 107), change:

```
from-black/70 via-black/30
```

to:

```
from-black/80 via-black/40
```

**Step 2: Replace pipe-separated trust badges with gold-bordered pills**

Replace the trust indicators div (lines 180-195). Current implementation uses pipe `|` separators. Replace with bordered pill badges:

```tsx
<div
  ref={trustRef}
  className="flex flex-wrap justify-center items-center gap-3 pt-8"
  style={{ opacity: 0 }}
>
  {trustItems.map((item, index) => (
    <span
      key={index}
      className="px-4 py-1.5 border border-[#D4AF37]/40 rounded-full text-xs uppercase tracking-[0.15em] text-[#D4AF37]"
    >
      {item}
    </span>
  ))}
</div>
```

**Step 3: Remove Ken Burns animation, add subtle scale**

On the `<img>` tag (line 101), replace `animate-ken-burns` class with a static class. The Ken Burns effect can feel busy — use a simple scale that's set once:

```
className="w-full h-full object-cover scale-105"
```

Keep the GSAP entrance animations as-is — they're already good.

**Step 4: Verify the dev server renders correctly**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`
Expected: No type errors

**Step 5: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add client/src/components/Hero.tsx
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "style: refine hero with darker overlay and gold pill badges"
```

---

### Task 3: Restyle Tours Section (Dark Theme)

**Files:**

- Modify: `client/src/components/Tours.tsx`

**Step 1: Dark section background**

Change the outer `<section>` className (line 177):

- From: `bg-card`
- To: `bg-[#0F0F0F]`

**Step 2: Dark card backgrounds**

On the `<Card>` component (line 204), update classes:

- From: `bg-card`
- To: `bg-[#1C1C1C] border-t-2 border-[#D4AF37]`

**Step 3: Text colors for dark background**

- Section heading (h2, line 182): add `text-white`
- Section description (p, line 185): change `text-muted-foreground` to `text-[#9B9590]`
- Card title (h3, line 224): add `text-white`
- Card description (p, line 229): change `text-sm text-muted-foreground` to `text-sm text-[#9B9590]`
- Duration/difficulty labels (span elements in grid): add `text-white`
- Gold divider should stay gold

**Step 4: Add hover glow effect on cards**

On the `<Card>`, change hover shadow:

- From: `hover:shadow-premium-lg`
- To: `hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]`

**Step 5: Add "Estimate Your Trip Cost" CTA after the grid**

After the closing `</div>` of the grid (after line 279), add:

```tsx
<div className="text-center mt-12">
  <a
    href="/estimate"
    className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#E8C84A] font-medium text-lg transition-colors"
  >
    {t("Estimate Your Trip Cost", "חשבו את עלות הטיול")}
    <ArrowRight className="h-5 w-5" />
  </a>
</div>
```

(ArrowRight is already imported.)

**Step 6: Verify no type errors**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`

**Step 7: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add client/src/components/Tours.tsx
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "style: dark theme tour cards with gold hover glow and estimate CTA"
```

---

### Task 4: Create TrustAndKosher Component (New)

**Files:**

- Create: `client/src/components/TrustAndKosher.tsx`

**Step 1: Create the new merged component**

This component consolidates WhyWiro + KosherInfo + CommunityConnection into a single split-layout section.

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Award,
  MessageSquare,
  Calendar,
  Users,
  MapPin,
  Shield,
  Heart,
  Utensils,
} from "lucide-react";

export function TrustAndKosher() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  const trustPoints = [
    {
      icon: Award,
      text: t(
        "First kosher-focused off-road company in Chiang Mai",
        "חברת טיולי השטח הכשרה הראשונה בצ'יאנג מאי"
      ),
    },
    {
      icon: MessageSquare,
      text: t(
        "Hebrew-speaking guides and support",
        "מדריכים דוברי עברית ותמיכה בעברית"
      ),
    },
    {
      icon: Calendar,
      text: t("Shabbat-friendly scheduling", "לוח זמנים מותאם לשומרי שבת"),
    },
    {
      icon: Users,
      text: t("Private premium 4x4 tours", "טיולי 4x4 פרטיים ומפנקים"),
    },
    {
      icon: MapPin,
      text: t(
        "Authentic trails, not tourist traps",
        "שבילים אותנטיים, לא מלכודות תיירים"
      ),
    },
    {
      icon: Heart,
      text: t(
        "Trusted by 120+ Israeli travelers",
        "מומלצים בקרב 120+ מטיילים ישראלים"
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-[#0F0F0F] overflow-hidden"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Image */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full min-h-[400px] rounded-sm overflow-hidden">
            <picture>
              <source
                srcSet="/images/optimized/1000000135.webp"
                type="image/webp"
              />
              <img
                src="/images/1000000135.jpg"
                alt={t("WIRO 4x4 off-road adventure", "הרפתקת שטח עם WIRO 4x4")}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </picture>
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-4">
                {t("Why WIRO 4×4?", "?למה WIRO 4×4")}
              </h2>
              <GoldDivider />
              <p className="text-lg text-[#9B9590]">
                {t(
                  "Authentic off-road adventures with the comfort and cultural understanding Israeli travelers deserve.",
                  "הרפתקאות שטח אמיתיות עם הנוחות וההבנה התרבותית שמגיעה למטיילים ישראלים."
                )}
              </p>
            </div>

            {/* Trust Points */}
            <div className="space-y-4">
              {trustPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-2 bg-[#D4AF37]/10 rounded-full">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <span className="text-white">{point.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Kosher Summary */}
            <div className="border-t border-[#2A2A25] pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-[#D4AF37]" />
                <h3
                  className="text-xl font-medium text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {t("Kosher Standards", "סטנדרטים כשרים")}
                </h3>
              </div>
              <p className="text-[#9B9590] leading-relaxed">
                {t(
                  "Certified ingredient sourcing, dedicated kosher kitchen, sealed packaging, and strict separation. We accommodate all levels — from basic kosher to mehadrin standards. Non-kosher guests welcome too.",
                  "חומרי גלם מוסמכים, מטבח כשר ייעודי, אריזות אטומות והפרדה מלאה. מתאימים לכל רמות הכשרות — מכשרות רגילה ועד מהדרין. גם מי שלא שומר כשרות מוזמן."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify no type errors**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`

**Step 3: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add client/src/components/TrustAndKosher.tsx
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "feat: create TrustAndKosher merged section component"
```

---

### Task 5: Redesign Testimonials as Embla Carousel

**Files:**

- Modify: `client/src/components/Testimonials.tsx`

**Step 1: Read Embla Carousel docs**

Check how embla-carousel-react is used in the project. The package `embla-carousel-react` is already installed.

Reference: `import useEmblaCarousel from 'embla-carousel-react'`

**Step 2: Rewrite Testimonials component**

Replace the entire component with a carousel implementation. Key requirements:

- Desktop: 3 visible slides, Tablet: 2, Mobile: 1
- Dark background (`#141414`)
- Dark cards with gold left-border accent
- Auto-advance every 6 seconds
- Arrow buttons on desktop
- Dot indicators
- "See All Reviews" link at bottom

```tsx
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import useEmblaCarousel from "embla-carousel-react";

export function Testimonials() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const testimonials = [
    {
      name: "David & Sarah Cohen",
      location: t("Tel Aviv, Israel", "תל אביב, ישראל"),
      rating: 5,
      text: t(
        "WIRO 4x4 exceeded all expectations! The kosher meals were fresh and delicious, our guide spoke perfect Hebrew, and the waterfalls were absolutely stunning. Highly recommend!",
        "WIRO 4x4 עלו על כל הציפיות! האוכל הכשר היה טרי וטעים, המדריך דיבר עברית מושלמת, והמפלים היו פשוט מדהימים. ממליצים בחום!"
      ),
    },
    {
      name: "משפחת לוי",
      location: t("Jerusalem, Israel", "ירושלים, ישראל"),
      rating: 5,
      text: t(
        "Perfect for families! They scheduled our tour to finish before Shabbat, provided mehadrin kosher food, and the kids loved the elephant sanctuary.",
        "מושלם למשפחות! תיאמו לנו את הטיול כך שנסיים לפני שבת, סיפקו אוכל כשר מהדרין, והילדים התלהבו מהפילים."
      ),
    },
    {
      name: "Yossi Mizrahi",
      location: t("Haifa, Israel", "חיפה, ישראל"),
      rating: 5,
      text: t(
        "Best off-road experience in Thailand! Real trails, not tourist traps. The guide knew every hidden spot and the 4x4 vehicles were top quality.",
        "חוויית השטח הכי טובה בתאילנד! שבילים אמיתיים, לא מלכודות תיירים. המדריך הכיר כל פינה חבויה והג'יפים היו ברמה גבוהה."
      ),
    },
    {
      name: "Rachel & Avi Goldstein",
      location: t("Netanya, Israel", "נתניה, ישראל"),
      rating: 5,
      text: t(
        "The attention to kosher details was impressive. Sealed packaging, dedicated utensils, and they even helped us find a minyan in Chiang Mai.",
        "תשומת הלב לפרטי הכשרות הייתה מרשימה. אריזה אטומה, כלים ייעודיים, והם אפילו עזרו לנו למצוא מניין בצ'יאנג מאי."
      ),
    },
    {
      name: "Michael Ben-David",
      location: t("Ramat Gan, Israel", "רמת גן, ישראל"),
      rating: 5,
      text: t(
        "Incredible rice field landscapes and authentic hill tribe villages. The WhatsApp support was instant and helpful. WIRO 4x4 made our Thailand trip unforgettable!",
        "שדות אורז מדהימים וכפרי שבטים אותנטיים. התמיכה בוואטסאפ הייתה מיידית. WIRO 4x4 הפכו לנו את הטיול לתאילנד לבלתי נשכח!"
      ),
    },
    {
      name: "שרה ויעקב כהן",
      location: t("Ashdod, Israel", "אשדוד, ישראל"),
      rating: 5,
      text: t(
        "From booking to the end of the tour, everything was perfect. They understand Israeli travelers and go above and beyond.",
        "מההזמנה ועד סוף הטיול, הכל היה מושלם. הם מבינים מטיילים ישראלים ונותנים שירות מעל ומעבר."
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#141414]">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-medium mb-6 text-white">
            {t("What Our Travelers Say", "מה המטיילים שלנו אומרים")}
          </h2>
          <GoldDivider />
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                />
              ))}
            </div>
            <span className="text-lg font-bold text-white">5.0</span>
            <span className="text-[#9B9590]">
              {t("from 120+ travelers", "מ-120+ מטיילים")}
            </span>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <div className="h-full p-6 bg-[#1C1C1C] border-l-2 border-[#D4AF37] rounded-sm">
                    <div className="flex flex-col h-full">
                      <span
                        className="text-5xl text-[#D4AF37] leading-none mb-4"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {"\u201C"}
                      </span>
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]"
                            />
                          )
                        )}
                      </div>
                      <p
                        className="italic text-lg leading-relaxed text-[#9B9590] mb-4 flex-grow"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {testimonial.text}
                      </p>
                      <div>
                        <p className="font-semibold text-white">
                          <span className="text-[#D4AF37]">{"\u2014 "}</span>
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-[#9B9590]">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-[#1C1C1C] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1C1C] transition-colors"
            aria-label={t("Previous", "הקודם")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-[#1C1C1C] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1C1C] transition-colors"
            aria-label={t("Next", "הבא")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? "bg-[#D4AF37]" : "bg-[#2A2A25]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/reviews">
            <span className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold hover:underline cursor-pointer">
              {t("See All Reviews", "לכל חוות הדעת")}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Verify no type errors**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`

**Step 4: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add client/src/components/Testimonials.tsx
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "feat: redesign testimonials as embla carousel with dark theme"
```

---

### Task 6: Restyle QuickInquiryForm (Dark Theme)

**Files:**

- Modify: `client/src/components/QuickInquiryForm.tsx`

**Step 1: Dark section background**

Change the outer `<section>` className (line 124):

- From: `bg-background`
- To: `bg-[#0F0F0F]`

Also update the submitted state section (line 89):

- From: `bg-background`
- To: `bg-[#0F0F0F]`

**Step 2: Dark card background**

Change the `<Card>` (line 140):

- From: `border border-[#D4AF37]/30 rounded-sm`
- To: `border border-[#D4AF37]/30 rounded-sm bg-[#1C1C1C]`

Change the submitted state `<Card>` (line 91):

- Add: `bg-[#1C1C1C]`

**Step 3: Text colors**

- Section heading (h2, line 129): add `text-white`
- Section description (p): change `text-muted-foreground` to `text-[#9B9590]`
- Form labels: change `text-muted-foreground` to `text-[#9B9590]`
- Submitted state heading: add `text-white`
- Submitted state description: change to `text-[#9B9590]`

**Step 4: Dark input fields**

All `<input>` elements: change `border-border` to `border-[#2A2A25] bg-[#141414] text-white placeholder:text-[#6B6560]`

**Step 5: Interest option buttons (dark variant)**

Update the button styling (line 251):

- Active state: keep `bg-[#D4AF37] text-[#1C1C1C] border-[#D4AF37]`
- Inactive state: change `border-border` to `border-[#2A2A25] text-[#9B9590] hover:border-[#D4AF37]/50`

**Step 6: Verify no type errors**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`

**Step 7: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add client/src/components/QuickInquiryForm.tsx
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "style: dark theme for inquiry form section"
```

---

### Task 7: Restyle FAQ (Dark Theme)

**Files:**

- Modify: `client/src/components/FAQ.tsx`

**Step 1: Dark section background**

Change the outer `<section>` className (line 98):

- From: `bg-background`
- To: `bg-[#141414]`

**Step 2: Text colors**

- Heading (h2): change `text-foreground` to `text-white`
- Description (p): change `text-muted-foreground` to `text-[#9B9590]`
- Accordion trigger text: change `text-foreground` to `text-white`
- Accordion content text: change `text-muted-foreground` to `text-[#9B9590]`

**Step 3: Accordion border**

- `AccordionItem` border (line 118): change `border-[#E8E2DA]` to `border-[#2A2A25]`

**Step 4: Verify no type errors**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`

**Step 5: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add client/src/components/FAQ.tsx
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "style: dark theme for FAQ accordion section"
```

---

### Task 8: Update Home.tsx (New Section Order)

**Files:**

- Modify: `client/src/pages/Home.tsx`

**Step 1: Update imports**

Remove imports for:

- `WhyWiro`
- `KosherInfo`
- `CommunityConnection` (if imported)
- `TripCostEstimator`

Add import for:

- `TrustAndKosher` from `@/components/TrustAndKosher`

**Step 2: Update section order in JSX**

New order:

```tsx
<Header />
<main id="main-content">
  <Hero />
  <Tours />
  <TrustAndKosher />
  <Testimonials />
  <QuickInquiryForm />
  <FAQ />
</main>
<Footer />
<FloatingActionButtons />
```

**Step 3: Verify no type errors**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`

**Step 4: Run tests to make sure nothing broke**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page test`
Expected: All 115 tests pass (no frontend component tests exist, so this validates backend didn't break)

**Step 5: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add client/src/pages/Home.tsx
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "feat: consolidate landing page from 9 to 6 sections with dark theme"
```

---

### Task 9: Sync Root-Level Component Copies

**Files:**

- Modify: `components/Tours.tsx` (root-level copy)

Per CLAUDE.md: "When editing `client/src/components/Tours.tsx`, also sync the root copies."

**Step 1: Copy the updated Tours.tsx to root**

```bash
cp /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page/client/src/components/Tours.tsx /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page/components/Tours.tsx
```

**Step 2: Commit**

```bash
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page add components/Tours.tsx
git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page commit -m "chore: sync root-level Tours.tsx copy"
```

---

### Task 10: Final Verification

**Step 1: Run full test suite**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page test`
Expected: 115 passed, ~30 skipped

**Step 2: Run type check**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page exec -- npx tsc --noEmit`
Expected: No errors

**Step 3: Verify build succeeds**

Run: `pnpm --dir /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page build`
Expected: Build completes successfully

**Step 4: Review git log**

Run: `git -C /Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/landing-page log --oneline feature/landing-page --not main`
Expected: ~10 clean commits with descriptive messages
