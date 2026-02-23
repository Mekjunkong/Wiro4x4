# Hero Banner Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static hero banner with a 3-slide Embla Carousel featuring bolder typography, auto-play, progress bar, and GSAP entrance animations.

**Architecture:** Rewrite `Hero.tsx` to use Embla Carousel with fade effect and autoplay plugin. Slide data is a static array. GSAP handles first-load entrance only; slide transitions use CSS opacity. A progress bar component tracks autoplay timing.

**Tech Stack:** React 19, Embla Carousel React + Autoplay, GSAP, Tailwind CSS 4, TypeScript

---

## Task 1: Install embla-carousel-autoplay dependency

**Files:**

- Modify: `package.json`

**Step 1: Install the autoplay plugin**

Run:

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm add embla-carousel-autoplay
```

**Step 2: Verify installation**

Run:

```bash
grep "embla-carousel-autoplay" package.json
```

Expected: Shows version in dependencies.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add embla-carousel-autoplay dependency"
```

---

## Task 2: Add Oswald 900 font weight

**Files:**

- Modify: `client/index.html:106` and `client/index.html:112` (both Google Fonts links)

**Step 1: Update both Google Fonts URLs**

In both `<link>` tags (lines 106 and 112), change:

```
family=Oswald:wght@400;500;600;700
```

to:

```
family=Oswald:wght@400;500;600;700;900
```

**Step 2: Update hero image preload (lines 101-102)**

Change the preloaded images from the deprecated `hero-waterfall` to the current `hero-wiro`:

```html
<link
  rel="preload"
  as="image"
  href="/images/optimized/hero-wiro.webp"
  type="image/webp"
/>
<link
  rel="preload"
  as="image"
  href="/images/optimized/hero-wiro.jpg"
  type="image/jpeg"
/>
```

**Step 3: Verify dev server loads**

Run: `pnpm dev` (check no errors in terminal)

**Step 4: Commit**

```bash
git add client/index.html
git commit -m "chore: add Oswald 900 weight and fix hero image preload"
```

---

## Task 3: Add fade carousel CSS utilities

**Files:**

- Modify: `client/src/index.css`

**Step 1: Add hero carousel styles**

Add the following at the end of `client/src/index.css` (after existing custom animations):

```css
/* Hero carousel fade effect */
.hero-carousel .embla__container {
  display: flex;
}

.hero-carousel .embla__slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 0;
}

/* Fade effect: all slides stacked, opacity transitions */
.hero-carousel-fade .embla__container {
  display: grid;
}

.hero-carousel-fade .embla__slide {
  grid-area: 1 / 1;
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
}

.hero-carousel-fade .embla__slide--active {
  opacity: 1;
  z-index: 1;
}

/* Progress bar animation */
@keyframes progress-fill {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.hero-progress-bar {
  animation: progress-fill 6s linear;
  transform-origin: left;
}

.hero-progress-bar--paused {
  animation-play-state: paused;
}
```

**Step 2: Commit**

```bash
git add client/src/index.css
git commit -m "style: add hero carousel fade and progress bar CSS"
```

---

## Task 4: Rewrite Hero.tsx with carousel and enhanced typography

**Files:**

- Modify: `client/src/components/Hero.tsx` (full rewrite)

**Step 1: Rewrite the Hero component**

Replace the entire contents of `client/src/components/Hero.tsx` with:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

/* ─── Slide Data ─── */
const SLIDES = [
  {
    webp: "/images/optimized/hero-wiro.webp",
    jpg: "/images/optimized/hero-wiro.jpg",
    alt: "WIRO 4x4 Indochina Adventure — Off-road in Chiang Mai",
    taglineEn: "Kosher Off-Road Adventures",
    taglineHe: "טיולי שטח כשרים",
    infoEn: "Chiang Mai, Thailand",
    infoHe: "צ'יאנג מאי, תאילנד",
  },
  {
    webp: "/images/optimized/accessible_doi_inthanon_summit.webp",
    jpg: "/images/optimized/accessible_doi_inthanon_summit.jpg",
    alt: "Doi Inthanon Summit — Highest peak in Thailand",
    taglineEn: "Conquer the Roof of Thailand",
    taglineHe: "כבשו את גג תאילנד",
    infoEn: "Doi Inthanon · Full Day",
    infoHe: "דוי אינתנון · יום שלם",
  },
  {
    webp: "/images/optimized/sticky_waterfalls.webp",
    jpg: "/images/optimized/sticky_waterfalls.jpg",
    alt: "Sticky Waterfalls — Walk up a waterfall in Chiang Mai",
    taglineEn: "Walk Up a Waterfall",
    taglineHe: "טיפסו על מפל מים",
    infoEn: "Maerim Sticky Falls · Half Day",
    infoHe: "מפלי סטיקי מארים · חצי יום",
  },
] as const;

const AUTOPLAY_DELAY = 6000;

export function Hero() {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  /* ─── Embla Carousel ─── */
  const autoplayPlugin = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplayPlugin.current,
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  /* ─── GSAP Entrance Animation ─── */
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const infoRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const refs = [titleRef, dividerRef, taglineRef, infoRef, ctaRef, trustRef];

    if (prefersReducedMotion) {
      refs.forEach(ref => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.transform = "none";
        }
      });
      return;
    }

    gsap.set(titleRef.current, { y: 30, opacity: 0 });
    gsap.set(dividerRef.current, { scaleX: 0 });
    gsap.set(taglineRef.current, { y: 20, opacity: 0 });
    gsap.set(infoRef.current, { y: 20, opacity: 0 });
    gsap.set(ctaRef.current, { opacity: 0 });
    gsap.set(trustRef.current, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(titleRef.current, { y: 0, opacity: 1, duration: 0.8 })
      .to(dividerRef.current, { scaleX: 1, duration: 0.6 }, "-=0.3")
      .to(taglineRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.1")
      .to(infoRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .to(ctaRef.current, { opacity: 1, duration: 0.5 }, "-=0.2")
      .to(trustRef.current, { opacity: 1, duration: 0.5 }, "-=0.2");

    return () => {
      tl.kill();
    };
  }, []);

  /* ─── Handlers ─── */
  const handleBookNow = () => {
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      t(
        "Hi WIRO 4x4 – I want to book a Kosher tour.",
        "היי WIRO 4x4 -- אשמח לשמוע על הטיולים הכשרים שלכם."
      )
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const trustItems = [
    t("Hebrew Speaking", "דוברי עברית"),
    t("Kosher Meals Available", "ארוחות כשרות"),
    t("Shabbat Friendly", "מותאם לשומרי שבת"),
    t("Private Tours", "טיולים פרטיים"),
  ];

  const currentSlide = SLIDES[selectedIndex];

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ─── Background Carousel ─── */}
      <div className="absolute inset-0 z-0" ref={emblaRef}>
        <div className="hero-carousel-fade embla__container h-full">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`embla__slide h-full ${i === selectedIndex ? "embla__slide--active" : ""}`}
            >
              <picture>
                <source srcSet={slide.webp} type="image/webp" />
                <img
                  src={slide.jpg}
                  alt={slide.alt}
                  className="w-full h-full object-cover scale-105"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                />
              </picture>
            </div>
          ))}
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ─── Navigation Arrows (desktop hover) ─── */}
      <button
        onClick={scrollPrev}
        className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* ─── Content Overlay ─── */}
      <div className="container relative z-10 text-white py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <h1
            ref={titleRef}
            className="text-white leading-[0.9] tracking-wide"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(5rem, 12vw, 12rem)",
              opacity: 0,
            }}
          >
            WIRO 4×4
          </h1>

          {/* Gold Divider */}
          <div
            ref={dividerRef}
            className="h-1 w-24 bg-[#D4AF37] mx-auto"
            style={{ transform: "scaleX(0)" }}
          />

          {/* Tagline — changes per slide */}
          <p
            ref={taglineRef}
            className="text-xl sm:text-2xl md:text-3xl uppercase tracking-[0.25em] font-medium text-white/90"
            style={{ fontFamily: "'Oswald', sans-serif", opacity: 0 }}
          >
            {t(currentSlide.taglineEn, currentSlide.taglineHe)}
          </p>

          {/* Tour Info — changes per slide */}
          <p
            ref={infoRef}
            className="text-2xl sm:text-3xl md:text-4xl text-white/90"
            style={{ opacity: 0 }}
          >
            {t(currentSlide.infoEn, currentSlide.infoHe)}
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center"
            style={{ opacity: 0 }}
          >
            <Button
              variant="hero-primary"
              size="xl"
              onClick={handleBookNow}
              className="gap-3 w-full sm:w-auto"
            >
              {t("Book Your Adventure", "הזמינו עכשיו")}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="hero-secondary"
              size="xl"
              onClick={handleWhatsApp}
              className="gap-3 w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              {t("WhatsApp Concierge", "שלחו לנו וואטסאפ")}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div
            ref={trustRef}
            className="flex flex-wrap items-center gap-3 pt-8 justify-center"
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

          {/* Dot Navigation */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? "bg-[#D4AF37] scale-125"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Progress Bar ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
        <div
          key={selectedIndex}
          className={`h-full bg-[#D4AF37] hero-progress-bar ${isHovered ? "hero-progress-bar--paused" : ""}`}
        />
      </div>

      {/* ─── Scroll Indicator ─── */}
      <div className="absolute bottom-12 z-10 animate-subtle-pulse left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-white/60">
            {t("Discover", "גלו")}
          </span>
          <div className="w-px h-8 bg-[#D4AF37]/60 mx-auto" />
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify dev server renders correctly**

Run: `pnpm dev`
Check in browser: carousel should show 3 slides with auto-play, centered text, bigger title.

**Step 3: Commit**

```bash
git add client/src/components/Hero.tsx
git commit -m "feat: rewrite hero banner with carousel, bolder typography, and progress bar"
```

---

## Task 5: Sync root-level Hero copy and verify build

**Files:**

- Check: `components/Hero.tsx` (root copy — sync if exists)

**Step 1: Check if root copy exists and sync**

Run:

```bash
ls /Users/pasuthunjunkong/workspace/Wiro4x4/components/Hero.tsx 2>/dev/null && echo "EXISTS" || echo "NO ROOT COPY"
```

If EXISTS, copy `client/src/components/Hero.tsx` to `components/Hero.tsx`.

**Step 2: Run type check**

Run:

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Run tests**

Run:

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test
```

Expected: All existing tests pass (hero is UI-only, no test changes needed).

**Step 4: Run build**

Run:

```bash
cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm build
```

Expected: Build succeeds.

**Step 5: Commit (if root copy was synced)**

```bash
git add components/Hero.tsx
git commit -m "chore: sync root Hero.tsx copy with carousel version"
```

---

## Task 6: Visual QA and final polish

**Files:**

- Possibly adjust: `client/src/components/Hero.tsx`
- Possibly adjust: `client/src/index.css`

**Step 1: Visual checks**

Open `pnpm dev` in browser and verify:

- [ ] Title "WIRO 4×4" is large, bold (weight 900), centered
- [ ] Carousel auto-plays through 3 slides every 6 seconds
- [ ] Fade transition between slides is smooth (0.6s)
- [ ] Tagline and tour info update per slide
- [ ] CTAs ("Book Your Adventure" + "WhatsApp") visible on all slides
- [ ] Trust badges visible on all slides
- [ ] Gold progress bar fills at bottom
- [ ] Hover pauses auto-play and shows navigation arrows
- [ ] Dot navigation works (click to go to slide)
- [ ] Mobile: swipe works, no arrows shown
- [ ] Scroll indicator centered at bottom
- [ ] GSAP entrance animation plays on first load

**Step 2: Fix any issues found**

Adjust styles/code as needed based on visual QA.

**Step 3: Final commit**

```bash
git add -A
git commit -m "polish: hero banner carousel visual refinements"
```

---

## Summary of All Files Changed

| File                             | Action           | Purpose                            |
| -------------------------------- | ---------------- | ---------------------------------- |
| `package.json`                   | Modify           | Add `embla-carousel-autoplay`      |
| `client/index.html`              | Modify           | Oswald 900 weight + fix preload    |
| `client/src/index.css`           | Modify           | Fade carousel + progress bar CSS   |
| `client/src/components/Hero.tsx` | Rewrite          | Carousel + typography + animations |
| `components/Hero.tsx`            | Sync (if exists) | Root copy sync                     |

## Dependencies

- `embla-carousel-autoplay` — NEW (to install)
- `embla-carousel-react` — already installed
- `gsap` — already installed
- `lucide-react` — already installed (adding ChevronLeft, ChevronRight)

## Available Images

- Slide 1: `/images/optimized/hero-wiro.webp` + `.jpg` (320KB/497KB)
- Slide 2: `/images/optimized/accessible_doi_inthanon_summit.webp` + `.jpg`
- Slide 3: `/images/optimized/sticky_waterfalls.webp` + `.jpg`
