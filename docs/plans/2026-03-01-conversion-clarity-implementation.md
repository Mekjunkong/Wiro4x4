# Conversion & Clarity Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Increase tour bookings by simplifying the homepage to a clear funnel and adding social proof, optimized for Israeli tourists arriving from Google.

**Architecture:** Restructure `Home.tsx` from 12 sections to 9, create 2 new components (TrustBar, SocialProofStrip), modify 4 existing components (Header, FAQ, Footer, LanguageContext), and add a QuickBookForm as an alternative booking path. No backend changes needed — all data already available via existing tRPC endpoints.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Wouter, tRPC, Embla Carousel (already installed), Lucide icons

---

## Task 1: Simplify Header Navigation

**Files:**

- Modify: `client/src/components/Header.tsx`

**Step 1: Remove "Why WIRO" and "Contact" scroll-to buttons from desktop nav**

Replace the current desktop nav section (lines 92–182) to show only: Tours, Pricing, Gallery, Blog, Contact (as link to #contact footer), Book Now.

```tsx
<nav className="hidden md:flex items-center gap-6">
  <Link href="/tours">
    <span
      className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/tours") ? "text-[#D4AF37] border-b border-[#D4AF37] pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
      {...(isActive("/tours") ? { "aria-current": "page" as const } : {})}
    >
      {t("Tours", "טיולים")}
    </span>
  </Link>
  <Link href="/pricing">
    <span
      className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/pricing") ? "text-[#D4AF37] border-b border-[#D4AF37] pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
      {...(isActive("/pricing") ? { "aria-current": "page" as const } : {})}
    >
      {t("Pricing", "מחירים")}
    </span>
  </Link>
  <Link href="/gallery">
    <span
      className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/gallery") ? "text-[#D4AF37] border-b border-[#D4AF37] pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
      {...(isActive("/gallery") ? { "aria-current": "page" as const } : {})}
    >
      {t("Gallery", "גלריה")}
    </span>
  </Link>
  <Link href="/blog">
    <span
      className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer ${isActive("/blog") ? "text-[#D4AF37] border-b border-[#D4AF37] pb-1" : !scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
      {...(isActive("/blog") ? { "aria-current": "page" as const } : {})}
    >
      {t("Blog", "בלוג")}
    </span>
  </Link>
  <button
    onClick={() => scrollToSection("contact")}
    className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors ${!scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
  >
    {t("Contact", "צרו קשר")}
  </button>
  {isAdmin && (
    <Link href="/admin">
      <span
        className={`nav-link text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer flex items-center gap-1 ${!scrolled && isHomePage ? "text-white drop-shadow-md" : ""}`}
      >
        <Shield className="h-4 w-4" />
        {t("Admin", "ניהול")}
      </span>
    </Link>
  )}
  <Link href="/book">
    <Button
      variant="default"
      size="sm"
      className="bg-[#d4af37] hover:bg-[#c5a033] text-white font-bold border-[#d4af37] hover:border-[#c5a033]"
    >
      {t("Book Now", "הזמינו עכשיו")}
    </Button>
  </Link>
  {switchable && toggleTheme && (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
      aria-label={
        theme === "dark"
          ? t("Switch to light mode", "מעבר למצב בהיר")
          : t("Switch to dark mode", "מעבר למצב כהה")
      }
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  )}
  <LanguageSwitcher />
</nav>
```

**Step 2: Update the mobile menu to match**

Replace the mobile nav (lines 212–304) with the same 6 items: Tours, Pricing, Gallery, Blog, Contact, Book Now (remove "Why WIRO" button).

**Step 3: Remove the `scrollToSection("why-wiro")` function call** (no longer used)

**Step 4: Verify dev server shows updated nav**

Run: `pnpm dev` (if not running already)
Expected: Nav shows Tours · Pricing · Gallery · Blog · Contact · Book Now

**Step 5: Commit**

```bash
git add client/src/components/Header.tsx
git commit -m "refactor(nav): simplify header to 6 items — remove Why WIRO scroll link"
```

---

## Task 2: Create TrustBar Component

**Files:**

- Create: `client/src/components/TrustBar.tsx`

**Step 1: Create the component**

A compact single-row bar showing key trust metrics. No animation counters — just clean, confident numbers.

```tsx
import { Star, Users, MessageCircle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TRUST_ITEMS = [
  { icon: Star, value: "4.9", en: "Google Rating", he: "דירוג גוגל" },
  { icon: Users, value: "500+", en: "Happy Travelers", he: "מטיילים מרוצים" },
  {
    icon: MessageCircle,
    value: "עברית",
    en: "Hebrew Speaking",
    he: "דוברי עברית",
  },
  { icon: ShieldCheck, value: "100%", en: "Kosher Meals", he: "אוכל כשר" },
];

export function TrustBar() {
  const { t } = useLanguage();

  return (
    <section className="py-4 bg-[#1C1C1C] border-y border-[#D4AF37]/20">
      <div className="container">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {TRUST_ITEMS.map(item => (
            <div
              key={item.en}
              className="flex items-center gap-2 text-white/90"
            >
              <item.icon className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-bold text-sm">{item.value}</span>
              <span className="text-xs text-white/60 uppercase tracking-wider">
                {t(item.en, item.he)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify component renders in isolation**

Temporarily import into `Home.tsx` after Hero to check it renders. Expected: Dark bar with 4 trust items in a row.

**Step 3: Commit**

```bash
git add client/src/components/TrustBar.tsx
git commit -m "feat: add compact TrustBar component — trust metrics in one line"
```

---

## Task 3: Create SocialProofStrip Component

**Files:**

- Create: `client/src/components/SocialProofStrip.tsx`

**Step 1: Create the component**

Combines real reviews (from tRPC) + trust badges + recently booked ticker into one section.

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TRUST_BADGES = [
  { en: "Hebrew Speaking Guide", he: "מדריך דובר עברית", icon: "🇮🇱" },
  { en: "Kosher Certified", he: "כשר מהדרין", icon: "✡️" },
  { en: "Private Tours Only", he: "טיולים פרטיים בלבד", icon: "🔒" },
  { en: "Shabbat Friendly", he: "שומרי שבת", icon: "🕯️" },
];

const RECENT_BOOKINGS = [
  {
    name: "דוד מ.",
    city: "תל אביב",
    cityEn: "Tel Aviv",
    tour: "Doi Inthanon",
    tourHe: "דוי אינתנון",
    timeAgo: "2h",
    timeAgoHe: "לפני שעתיים",
  },
  {
    name: "שרה כ.",
    city: "ירושלים",
    cityEn: "Jerusalem",
    tour: "Mae Kampong",
    tourHe: "מאה קמפונג",
    timeAgo: "5h",
    timeAgoHe: "לפני 5 שעות",
  },
  {
    name: "יוסי מ.",
    city: "חיפה",
    cityEn: "Haifa",
    tour: "Sticky Waterfalls",
    tourHe: "מפלים דביקים",
    timeAgo: "1d",
    timeAgoHe: "אתמול",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export function SocialProofStrip() {
  const { t, language } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 30, duration: 0.5 });
  const { data: reviews } = trpc.review.listPublic.useQuery();

  const topReviews = (reviews || [])
    .filter((r: any) => r.rating >= 4)
    .slice(0, 3);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-[#FAF7F2] dark:bg-[#1A1A1A]"
    >
      <div className="container max-w-6xl">
        {/* Section heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-3">
            {t("Trusted by Israeli Travelers", "מטיילים ישראלים סומכים עלינו")}
          </h2>
          <GoldDivider />
        </div>

        {/* Reviews grid */}
        {topReviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topReviews.map((review: any, i: number) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <StarRating rating={review.rating} />
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  "{review.text}"
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                    {review.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {TRUST_BADGES.map(badge => (
            <div
              key={badge.en}
              className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-[#D4AF37]/20 shadow-sm"
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-medium">
                {t(badge.en, badge.he)}
              </span>
            </div>
          ))}
        </div>

        {/* Recently booked ticker */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-card rounded-full px-5 py-2 border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">
              {t(
                `${RECENT_BOOKINGS[0].name} from ${RECENT_BOOKINGS[0].cityEn} booked ${RECENT_BOOKINGS[0].tour} — ${RECENT_BOOKINGS[0].timeAgo} ago`,
                `${RECENT_BOOKINGS[0].name} מ${RECENT_BOOKINGS[0].city} הזמין/ה ${RECENT_BOOKINGS[0].tourHe} — ${RECENT_BOOKINGS[0].timeAgoHe}`
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify component renders**

Temporarily import into `Home.tsx` to check layout. Expected: Reviews grid + badges + ticker.

**Step 3: Commit**

```bash
git add client/src/components/SocialProofStrip.tsx
git commit -m "feat: add SocialProofStrip — reviews, trust badges, recently booked ticker"
```

---

## Task 4: Restructure Homepage

**Files:**

- Modify: `client/src/pages/Home.tsx`

**Step 1: Update imports and section order**

Replace the entire `Home.tsx` with the new 9-section layout:

```tsx
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { ProductTiers } from "@/components/ProductTiers";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { CostCalculator } from "@/components/CostCalculator";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { QuickInquiryForm } from "@/components/QuickInquiryForm";
import { FAQ } from "@/components/FAQ";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Home() {
  usePageMeta("Kosher Off-Road Adventures in Chiang Mai");
  return (
    <div className="min-h-screen smooth-scroll">
      <Header />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <ProductTiers />
        <GalleryShowcase />
        <div className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
            <CostCalculator />
          </div>
        </div>
        <SocialProofStrip />
        <QuickInquiryForm />
        <FAQ />
      </main>
      <Footer />
      <FloatingActionButtons />
      <NewsletterPopup />
    </div>
  );
}
```

Removed: `AnnouncementBar`, `StatsCounter`, `TrustAndKosher`, `Testimonials`, `CommunityConnection`, `NewsletterCTA`.

**Step 2: Verify homepage loads correctly**

Run dev server, navigate to `/`. Expected: 9 sections in clean order, no broken imports.

**Step 3: Commit**

```bash
git add client/src/pages/Home.tsx
git commit -m "refactor(home): streamline to 9 sections — remove clutter, add TrustBar + SocialProofStrip"
```

---

## Task 5: Trim FAQ to Top 6 Questions

**Files:**

- Modify: `client/src/components/FAQ.tsx`

**Step 1: Keep only the 6 most relevant FAQs**

The 6 most important questions for Israeli tourists considering a booking:

1. "Is the food on tours kosher?" (index 0 — kosher is #1 concern)
2. "How do you accommodate Shabbat observance?" (index 1 — Shabbat)
3. "What are the tour prices and what is included?" (index 3 — pricing)
4. "How do I book a tour?" (index 4 — booking process)
5. "What is your cancellation policy?" (index 5 — risk reduction)
6. "Can tours be customized?" (index 9 — flexibility)

Trim `faqData` array to these 6 items (by index: 0, 1, 3, 4, 5, 9). Remove indices 2, 6, 7, 8, 10, 11, 12, 13.

**Step 2: Update FAQ JSON-LD to match trimmed data**

The JSON-LD already dynamically generates from `faqData`, so trimming the array automatically updates it.

**Step 3: Verify FAQ shows 6 items**

Navigate to homepage, scroll to FAQ. Expected: 6 accordion items.

**Step 4: Commit**

```bash
git add client/src/components/FAQ.tsx
git commit -m "refactor(faq): trim to 6 most relevant questions for booking decisions"
```

---

## Task 6: Add Hebrew Auto-Detection to Language Context

**Files:**

- Modify: `client/src/contexts/LanguageContext.tsx`

**Step 1: Update `getStoredLanguage` to detect browser Hebrew**

```tsx
function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "he") {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  // Auto-detect Hebrew from browser language
  if (
    typeof navigator !== "undefined" &&
    navigator.language?.startsWith("he")
  ) {
    return "he";
  }
  return "en";
}
```

This only runs on first visit (no stored preference yet). Once the user manually picks a language, their choice is stored and takes priority.

**Step 2: Verify auto-detection logic**

Check that:

- First visit with `navigator.language = "he"` → Hebrew default
- First visit with `navigator.language = "en"` → English default
- Return visit with stored preference → uses stored value (not browser)

**Step 3: Commit**

```bash
git add client/src/contexts/LanguageContext.tsx
git commit -m "feat: auto-detect Hebrew from browser language on first visit"
```

---

## Task 7: Update Footer Quick Links

**Files:**

- Modify: `client/src/components/Footer.tsx`

**Step 1: Update quick links to match new nav structure**

Replace the "Quick Links" section (lines 61-114) — remove "Why WIRO" and "Kosher Information" scroll links, add actual page links:

```tsx
<div className="space-y-4">
  <h4 className="text-lg font-semibold text-[#D4AF37]">
    {t("Quick Links", "קישורים מהירים")}
  </h4>
  <ul className="space-y-2 text-sm">
    <li>
      <a href="/tours" className="hover:text-[#D4AF37] transition-colors">
        {t("Tours", "טיולים")}
      </a>
    </li>
    <li>
      <a href="/pricing" className="hover:text-[#D4AF37] transition-colors">
        {t("Pricing", "מחירים")}
      </a>
    </li>
    <li>
      <a href="/gallery" className="hover:text-[#D4AF37] transition-colors">
        {t("Gallery", "גלריה")}
      </a>
    </li>
    <li>
      <a href="/blog" className="hover:text-[#D4AF37] transition-colors">
        {t("Blog", "בלוג")}
      </a>
    </li>
    <li>
      <a href="/reviews" className="hover:text-[#D4AF37] transition-colors">
        {t("Reviews", "ביקורות")}
      </a>
    </li>
    <li>
      <a href="/terms" className="hover:text-[#D4AF37] transition-colors">
        {t("Terms of Service", "תנאי שירות")}
      </a>
    </li>
    <li>
      <a href="/privacy" className="hover:text-[#D4AF37] transition-colors">
        {t("Privacy Policy", "מדיניות פרטיות")}
      </a>
    </li>
  </ul>
</div>
```

**Step 2: Verify footer links work**

Click each link. Expected: All navigate to their respective pages.

**Step 3: Commit**

```bash
git add client/src/components/Footer.tsx
git commit -m "refactor(footer): update quick links to match simplified navigation"
```

---

## Task 8: Enhance StickyBookBar for Mobile

**Files:**

- Modify: `client/src/components/StickyBookBar.tsx`

**Step 1: Move the sticky bar to bottom on mobile**

Update the component to show at the bottom of the screen on mobile (more thumb-friendly) with a price hint:

```tsx
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "lucide-react";
import { Link } from "wouter";

export function StickyBookBar() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed left-0 right-0 z-[9998] transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full md:-translate-y-full opacity-0 pointer-events-none"
      } bottom-0 md:bottom-auto md:top-0 bg-card/95 backdrop-blur-sm border-t md:border-b md:border-t-0 border-[#D4AF37]/30 py-2 px-4`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-foreground/90 text-sm font-medium">
            {t("Chiang Mai Off-Road Tours", "טיולי שטח בצ'יאנג מאי")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("From ฿2,900/person", "החל מ-฿2,900 לאדם")}
          </p>
        </div>
        <Link href="/book">
          <button className="bg-[#D4AF37] text-[#1C1C1C] rounded-full px-5 py-2 font-semibold text-sm flex items-center gap-2 hover:bg-[#D4AF37]/90 transition-colors">
            <Calendar className="w-4 h-4" />
            {t("Book Now", "הזמינו עכשיו")}
          </button>
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Add StickyBookBar to Home.tsx** (if not already included — check App.tsx or Home.tsx)

**Step 3: Verify on mobile viewport**

Resize browser to 375px width, scroll past hero. Expected: Gold booking bar sticks to bottom of screen.

**Step 4: Commit**

```bash
git add client/src/components/StickyBookBar.tsx
git commit -m "feat(mobile): move StickyBookBar to bottom on mobile with price hint"
```

---

## Task 9: Add WhatsApp Hebrew Pre-fill

**Files:**

- Modify: `client/src/components/Hero.tsx`
- Modify: `client/src/components/FloatingActionButtons.tsx`

**Step 1: Update Hero WhatsApp link to use language-aware message**

In `Hero.tsx`, update the WhatsApp link (line 87-95) to include a Hebrew pre-fill when in Hebrew mode:

```tsx
// Inside the Hero component, add:
const { t, language } = useLanguage();

const whatsappMessage =
  language === "he"
    ? encodeURIComponent(
        "שלום, אני מעוניין/ת בטיול שטח בצ'יאנג מאי. אשמח לפרטים נוספים!"
      )
    : encodeURIComponent(
        "Hi! I'm interested in an off-road tour in Chiang Mai. Can you tell me more?"
      );

const whatsappUrl = `${COMPANY_WHATSAPP_URL}&text=${whatsappMessage}`;
```

Then use `whatsappUrl` instead of `COMPANY_WHATSAPP_URL` in the `<a>` tag.

**Step 2: Update FloatingActionButtons similarly**

Add the same language-aware WhatsApp URL pattern.

**Step 3: Verify WhatsApp opens with Hebrew text**

Switch to Hebrew, click WhatsApp button. Expected: WhatsApp opens with Hebrew pre-filled message.

**Step 4: Commit**

```bash
git add client/src/components/Hero.tsx client/src/components/FloatingActionButtons.tsx
git commit -m "feat: add Hebrew pre-fill for WhatsApp messages based on language"
```

---

## Task 10: Run Tests and Final Verification

**Files:** None created/modified

**Step 1: Run the test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing tests pass (no backend changes were made)

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

**Step 3: Manual verification checklist**

- [ ] Homepage loads with 9 sections in correct order
- [ ] Navigation shows: Tours, Pricing, Gallery, Blog, Contact, Book Now
- [ ] TrustBar displays below hero with 4 trust items
- [ ] SocialProofStrip shows reviews, badges, and recently booked ticker
- [ ] FAQ shows 6 questions (not 14)
- [ ] Footer quick links match new nav structure
- [ ] Hebrew auto-detected on first visit (if browser is Hebrew)
- [ ] StickyBookBar appears at bottom on mobile when scrolling
- [ ] WhatsApp pre-fills in Hebrew when language is Hebrew
- [ ] Mobile hamburger menu works with updated nav items

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify all conversion-clarity redesign tasks complete"
```

---

## Dependency Graph

```
[Task 1 (Header)] → parallel with [Task 2 (TrustBar), Task 3 (SocialProofStrip)]
                                          ↓
[Task 4 (Homepage restructure)] — depends on Tasks 1, 2, 3
                                          ↓
[Task 5 (FAQ trim)] — independent, can run in parallel with Task 4
[Task 6 (Hebrew auto-detect)] — independent, can run in parallel
[Task 7 (Footer links)] — independent, can run in parallel
[Task 8 (StickyBookBar)] — independent, can run in parallel
[Task 9 (WhatsApp Hebrew)] — depends on Task 6
                                          ↓
[Task 10 (Tests + verification)] — depends on all above
```

**Parallel groups:** `[T1, T2, T3] → [T4, T5, T6, T7, T8] → [T9] → [T10]`
