# Conversion Funnel Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Increase visitor-to-booking conversion rate through full-funnel optimization and analytics tracking.

**Architecture:** 21 incremental tasks across 5 sections: homepage conversion, tour page persuasion, booking form optimization, abandoned booking recovery, and analytics. Each task is independently testable and committable. All components are React 19 + TypeScript + Tailwind CSS 4, API routes use tRPC 11 with Drizzle ORM.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, tRPC 11, Drizzle ORM, Vitest, Recharts, Plausible/Umami

**Key conventions:**

- Bilingual: use `const { t } = useLanguage()` with `t('English', 'Hebrew')`
- Icons: import from `lucide-react`
- API helpers: `securePublicProcedure` / `secureProtectedProcedure` from `server/routes/_helpers.ts`
- DB queries: add helpers to `server/db.ts`
- Schemas: add Zod schemas to `shared/schemas.ts`
- Tests: Vitest with `describe/it/expect`, use `itWithDb` for DB tests

---

## Section 1: Homepage Conversion

### Task 1: Trust Bar Component

**Files:**

- Create: `client/src/components/TrustBar.tsx`
- Modify: `client/src/pages/Home.tsx` (add import + placement after `<Hero />`)

**Step 1: Write the component**

Create `client/src/components/TrustBar.tsx`:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Star, MapPin, ShieldCheck, RotateCcw } from "lucide-react";

export function TrustBar() {
  const { t } = useLanguage();
  const { data: stats } = trpc.stats.public.useQuery();
  const { data: reviewStats } = trpc.review.stats.useQuery();

  return (
    <div className="bg-[#1C1C1C] border-y border-[#D4AF37]/20 py-3">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm">
        {reviewStats && reviewStats.averageRating > 0 && (
          <div className="flex items-center gap-2 text-white/90">
            <Star className="h-4 w-4 text-[#D4AF37] fill-[#D4AF37]" />
            <span>{reviewStats.averageRating.toFixed(1)}/5</span>
            <span className="text-white/50">
              ({reviewStats.totalApproved} {t("reviews", "ביקורות")})
            </span>
          </div>
        )}
        {stats && stats.totalBookings > 0 && (
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-4 w-4 text-[#D4AF37]" />
            <span>
              {stats.totalBookings}+ {t("tours completed", "טיולים הושלמו")}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-white/90">
          <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
          <span>{t("Kosher Certified", "כשרות מאושרת")}</span>
        </div>
        <div className="flex items-center gap-2 text-white/90">
          <RotateCcw className="h-4 w-4 text-[#D4AF37]" />
          <span>{t("Free Cancellation", "ביטול חינם")}</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add to Home page**

In `client/src/pages/Home.tsx`, add import:

```tsx
import { TrustBar } from "@/components/TrustBar";
```

Place `<TrustBar />` right after `<Hero />` (line ~25):

```tsx
<Hero />
<TrustBar />
<Tours />
```

**Step 3: Verify visually**

Run: `pnpm dev`
Check homepage — trust bar should appear between hero and tours section.

**Step 4: Commit**

```bash
git add client/src/components/TrustBar.tsx client/src/pages/Home.tsx
git commit -m "feat: add trust bar with stats above tours section"
```

---

### Task 2: Sticky "Book Now" CTA Bar

**Files:**

- Create: `client/src/components/StickyBookBar.tsx`
- Modify: `client/src/pages/Home.tsx` (add import + placement)

**Step 1: Write the component**

Create `client/src/components/StickyBookBar.tsx`:

```tsx
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "lucide-react";
import { Link } from "wouter";

export function StickyBookBar() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#1C1C1C]/95 backdrop-blur-sm border-b border-[#D4AF37]/30 py-2 px-4 transition-all duration-300 animate-in slide-in-from-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-white/90 text-sm font-medium hidden sm:block">
          {t(
            "Ready for your Chiang Mai adventure?",
            "מוכנים להרפתקה בצ'יאנג מאי?"
          )}
        </span>
        <Link href="/book">
          <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1C1C1C] font-semibold px-5 py-2 rounded-full text-sm transition-all hover:scale-105">
            <Calendar className="h-4 w-4" />
            {t("Book Now", "הזמינו עכשיו")}
          </button>
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Add to Home page**

In `client/src/pages/Home.tsx`:

```tsx
import { StickyBookBar } from "@/components/StickyBookBar";
```

Place `<StickyBookBar />` before `<Header />`:

```tsx
<StickyBookBar />
<Header />
```

**Step 3: Verify visually**

Run: `pnpm dev`
Scroll down on homepage — sticky bar should appear after ~600px scroll.

**Step 4: Commit**

```bash
git add client/src/components/StickyBookBar.tsx client/src/pages/Home.tsx
git commit -m "feat: add sticky Book Now bar on homepage scroll"
```

---

### Task 3: Tour Card Urgency Signals

**Files:**

- Modify: `client/src/components/Tours.tsx` (add badges to tour cards)

**Step 1: Read existing Tours.tsx**

Read `client/src/components/Tours.tsx` to understand the card structure.

**Step 2: Add urgency badges**

Add "Most Popular" badge to the first/top tour card and "Limited Availability" to cards where `groupMaxSize` is small. The badge should be positioned absolute over the tour image:

```tsx
{
  /* Inside tour card, over the image */
}
{
  index === 0 && (
    <span className="absolute top-3 left-3 bg-[#D4AF37] text-[#1C1C1C] text-xs font-bold px-2 py-1 rounded-full z-10">
      {t("Most Popular", "הכי פופולרי")}
    </span>
  );
}
{
  tour.groupMaxSize && tour.groupMaxSize <= 6 && index !== 0 && (
    <span className="absolute top-3 left-3 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
      {t("Limited Availability", "זמינות מוגבלת")}
    </span>
  );
}
```

**Step 3: Verify visually**

Run: `pnpm dev`
Check homepage tour cards — first card should show "Most Popular" badge.

**Step 4: Commit**

```bash
git add client/src/components/Tours.tsx
git commit -m "feat: add urgency badges to tour cards"
```

---

### Task 4: Scroll-Depth WhatsApp Prompt

**Files:**

- Create: `client/src/components/WhatsAppPrompt.tsx`
- Modify: `client/src/pages/Home.tsx` (add import)

**Step 1: Write the component**

Create `client/src/components/WhatsAppPrompt.tsx`:

```tsx
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppPrompt() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const scrollPercent =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.7 && !show) setShow(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed, show]);

  if (!show || dismissed) return null;

  const message = encodeURIComponent(
    t(
      "Hi WIRO 4x4 – I have some questions about your tours.",
      "היי WIRO 4x4 — יש לי כמה שאלות על הטיולים שלכם."
    )
  );

  return (
    <div className="fixed bottom-24 left-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-[280px] border border-gray-100 relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label={t("Close", "סגור")}
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-gray-800 text-sm mb-3 pr-4">
          {t(
            "Have questions? Chat with us on WhatsApp!",
            "יש שאלות? דברו איתנו בוואטסאפ!"
          )}
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors w-full justify-center"
        >
          <MessageCircle className="h-4 w-4" />
          {t("Chat Now", "שלחו הודעה")}
        </a>
      </div>
    </div>
  );
}
```

**Step 2: Add to Home page**

In `client/src/pages/Home.tsx`:

```tsx
import { WhatsAppPrompt } from "@/components/WhatsAppPrompt";
```

Place `<WhatsAppPrompt />` after `<FloatingActionButtons />`:

```tsx
<FloatingActionButtons />
<WhatsAppPrompt />
```

**Step 3: Verify**

Run: `pnpm dev`
Scroll to 70%+ of homepage — WhatsApp prompt should appear bottom-left.

**Step 4: Commit**

```bash
git add client/src/components/WhatsAppPrompt.tsx client/src/pages/Home.tsx
git commit -m "feat: add scroll-depth WhatsApp prompt on homepage"
```

---

## Section 2: Tour Page Persuasion

### Task 5: Social Proof Block on Tour Detail

**Files:**

- Create: `client/src/components/TourSocialProof.tsx`
- Modify: `client/src/pages/TourDetail.tsx` (add import + placement)

**Step 1: Write the component**

Create `client/src/components/TourSocialProof.tsx`:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Star, Users } from "lucide-react";

export function TourSocialProof({ tourType }: { tourType?: string }) {
  const { t } = useLanguage();
  const { data: stats } = trpc.stats.public.useQuery();
  const { data: reviews } = trpc.review.listPublic.useQuery();

  // Filter reviews for this tour type, fallback to recent reviews
  const relevantReviews = reviews
    ? reviews.filter(r => !tourType || r.tourType === tourType).slice(0, 2)
    : [];
  const displayReviews =
    relevantReviews.length > 0 ? relevantReviews : (reviews ?? []).slice(0, 2);

  return (
    <div className="bg-[#F9F7F2] rounded-xl p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {stats && stats.totalBookings > 0 && (
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="h-4 w-4 text-[#D4AF37]" />
            <span className="font-medium">
              {stats.monthlyBookings || stats.totalBookings}+{" "}
              {t("booked this month", "הזמינו החודש")}
            </span>
          </div>
        )}
        {displayReviews.length > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={`h-4 w-4 ${i <= Math.round(displayReviews[0].rating) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"}`}
              />
            ))}
          </div>
        )}
      </div>
      {displayReviews.map(review => (
        <blockquote
          key={review.id}
          className="border-l-2 border-[#D4AF37] pl-4 text-gray-600 text-sm italic"
        >
          "{review.text.slice(0, 150)}
          {review.text.length > 150 ? "..." : ""}"
          <footer className="mt-1 text-gray-500 not-italic text-xs">
            — {review.name}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
```

**Step 2: Add to TourDetail.tsx**

Import and place after the tour hero/description area, before the itinerary section.

**Step 3: Commit**

```bash
git add client/src/components/TourSocialProof.tsx client/src/pages/TourDetail.tsx
git commit -m "feat: add social proof block on tour detail pages"
```

---

### Task 6: Pricing Clarity Sticky Panel

**Files:**

- Create: `client/src/components/TourPricingPanel.tsx`
- Modify: `client/src/pages/TourDetail.tsx` (add sidebar layout)

**Step 1: Write the component**

Create `client/src/components/TourPricingPanel.tsx`:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTHB } from "@shared/pricing";
import { Check, Calendar } from "lucide-react";
import { Link } from "wouter";

interface Props {
  price: number;
  included: { en: string; he: string }[];
  groupMinSize?: number;
  groupMaxSize?: number;
  tourSlug: string;
}

export function TourPricingPanel({
  price,
  included,
  groupMinSize = 1,
  groupMaxSize = 10,
  tourSlug,
}: Props) {
  const { language, t } = useLanguage();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 space-y-4 sticky top-24">
      <div>
        <p className="text-sm text-gray-500">{t("Starting from", "החל מ-")}</p>
        <p className="text-3xl font-bold text-[#1C1C1C]">{formatTHB(price)}</p>
        <p className="text-xs text-gray-400">
          {t("per group", "לקבוצה")} ({groupMinSize}-{groupMaxSize}{" "}
          {t("people", "אנשים")})
        </p>
      </div>

      <div className="border-t pt-4 space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          {t("Includes:", "כולל:")}
        </p>
        {included.slice(0, 5).map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <span>{language === "he" ? item.he : item.en}</span>
          </div>
        ))}
      </div>

      <Link href={`/book?tour=${tourSlug}`}>
        <button className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1C1C1C] font-bold py-3 rounded-full transition-all hover:scale-[1.02] text-base">
          <Calendar className="h-5 w-5" />
          {t("Book This Tour", "הזמינו טיול זה")}
        </button>
      </Link>
    </div>
  );
}
```

**Step 2: Integrate into TourDetail.tsx**

Wrap the tour detail content in a 2-column grid (desktop), with the pricing panel in the right column as a sticky sidebar.

On mobile, show the panel as a fixed bottom bar with price + CTA button.

**Step 3: Commit**

```bash
git add client/src/components/TourPricingPanel.tsx client/src/pages/TourDetail.tsx
git commit -m "feat: add sticky pricing panel to tour detail pages"
```

---

### Task 7: Tour Comparison Nudge

**Files:**

- Modify: `client/src/pages/TourDetail.tsx` (add section at bottom)

**Step 1: Add comparison section**

At the bottom of TourDetail.tsx, before the footer, add:

```tsx
{
  /* Compare with other tours */
}
<section className="py-12 bg-gray-50">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <h3 className="text-xl font-semibold mb-2">
      {t("Not sure yet?", "עדיין לא בטוחים?")}
    </h3>
    <p className="text-gray-600 mb-4">
      {t(
        "Compare all our tours to find your perfect adventure",
        "השוו את כל הטיולים שלנו כדי למצוא את ההרפתקה המושלמת"
      )}
    </p>
    <Link href="/pricing">
      <button className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1C1C] font-semibold px-6 py-2 rounded-full transition-all">
        {t("Compare All Tours", "השוו את כל הטיולים")}
      </button>
    </Link>
  </div>
</section>;
```

**Step 2: Commit**

```bash
git add client/src/pages/TourDetail.tsx
git commit -m "feat: add tour comparison nudge section"
```

---

### Task 8: Tour-Specific FAQ

**Files:**

- Create: `client/src/components/TourFAQ.tsx`
- Modify: `client/src/pages/TourDetail.tsx` (add before comparison nudge)

**Step 1: Write the component**

Create `client/src/components/TourFAQ.tsx` using the existing `Accordion` UI component:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TOUR_FAQS = [
  {
    q: "What should I wear?",
    qHe: "מה כדאי ללבוש?",
    a: "Comfortable clothes suitable for outdoor activities. Closed-toe shoes are required for 4x4 trips. Bring a light jacket for higher elevations.",
    aHe: "בגדים נוחים המתאימים לפעילות חוצות. נעליים סגורות הן חובה לטיולי 4x4. הביאו ז'קט קל לגבהים.",
  },
  {
    q: "Is this tour suitable for children?",
    qHe: "האם הטיול מתאים לילדים?",
    a: "Yes! Our tours are family-friendly. Children under 3 ride free, ages 3-10 at 50% price. We adjust the itinerary pace for families.",
    aHe: "כן! הטיולים שלנו מתאימים למשפחות. ילדים מתחת לגיל 3 ללא תשלום, גילאי 3-10 ב-50%. אנחנו מתאימים את קצב הטיול למשפחות.",
  },
  {
    q: "What happens if it rains?",
    qHe: "מה קורה אם יורד גשם?",
    a: "Our 4x4 vehicles handle all weather conditions. Light rain often enhances the experience! For heavy storms, we offer rescheduling at no extra cost.",
    aHe: "כלי הרכב 4x4 שלנו מתמודדים עם כל תנאי מזג האוויר. גשם קל לרוב משפר את החוויה! בסערות חזקות, אנו מציעים תיאום מחדש ללא עלות נוספת.",
  },
  {
    q: "Can you accommodate dietary restrictions?",
    qHe: "האם אתם מתאימים להגבלות תזונתיות?",
    a: "Absolutely. All our food options are kosher. We also accommodate vegetarian, vegan, and allergy requirements with advance notice.",
    aHe: "בהחלט. כל אפשרויות האוכל שלנו כשרות. אנו גם מתאימים לצמחונים, טבעונים ואלרגיות בהודעה מראש.",
  },
];

export function TourFAQ() {
  const { language, t } = useLanguage();

  return (
    <section className="py-10">
      <h3 className="text-xl font-semibold mb-4">
        {t("Common Questions", "שאלות נפוצות")}
      </h3>
      <Accordion type="single" collapsible>
        {TOUR_FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">
              {language === "he" ? faq.qHe : faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600">
              {language === "he" ? faq.aHe : faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
```

**Step 2: Add to TourDetail.tsx**

Import and place before the comparison nudge section.

**Step 3: Commit**

```bash
git add client/src/components/TourFAQ.tsx client/src/pages/TourDetail.tsx
git commit -m "feat: add tour-specific FAQ section"
```

---

## Section 3: Booking Form Optimization

### Task 9: Visual Progress Bar

**Files:**

- Create: `client/src/components/booking/ProgressBar.tsx`
- Modify: `client/src/pages/BookingForm.tsx` (add import + placement)

**Step 1: Write the component**

Create `client/src/components/booking/ProgressBar.tsx`:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";

const STEPS = [
  { en: "Trip Details", he: "פרטי הטיול" },
  { en: "Services", he: "שירותים" },
  { en: "Destinations", he: "יעדים" },
  { en: "Contact", he: "פרטי קשר" },
];

export function BookingProgressBar({ currentStep }: { currentStep: number }) {
  const { language } = useLanguage();

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#D4AF37] transition-all duration-500"
          style={{
            width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, i) => (
          <div key={i} className="flex flex-col items-center relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                i < currentStep
                  ? "bg-[#D4AF37] text-[#1C1C1C]"
                  : i === currentStep
                    ? "bg-[#D4AF37] text-[#1C1C1C] ring-4 ring-[#D4AF37]/20"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`mt-2 text-xs hidden sm:block ${
                i <= currentStep
                  ? "text-[#1C1C1C] font-medium"
                  : "text-gray-400"
              }`}
            >
              {language === "he" ? step.he : step.en}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Import and place in BookingForm.tsx**

Add `<BookingProgressBar currentStep={currentStep} />` after the page heading, before the form steps. Map the existing step state variable to the progress bar index (0-3).

**Step 3: Commit**

```bash
git add client/src/components/booking/ProgressBar.tsx client/src/pages/BookingForm.tsx
git commit -m "feat: add visual progress bar to booking form"
```

---

### Task 10: Save & Resume with localStorage

**Files:**

- Modify: `client/src/pages/BookingForm.tsx`

**Step 1: Implement save/resume logic**

The booking form already has a `DRAFT_KEY = "wiro-booking-draft"` constant (line 33). Check if save/resume is already implemented. If not, add:

```tsx
// On mount: restore draft
useEffect(() => {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved) {
    try {
      const draft = JSON.parse(saved);
      setFormData(prev => ({ ...prev, ...draft }));
      toast.info(
        t(
          "Welcome back! Your draft was restored.",
          "ברוכים השבים! הטיוטה שלכם שוחזרה."
        )
      );
    } catch {}
  }
}, []);

// Auto-save on change (debounced)
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, 1000);
  return () => clearTimeout(timer);
}, [formData]);

// Clear on successful submission
// In the success handler: localStorage.removeItem(DRAFT_KEY);
```

**Step 2: Verify**

Fill partial form → close tab → reopen → form data should be restored with toast.

**Step 3: Commit**

```bash
git add client/src/pages/BookingForm.tsx
git commit -m "feat: auto-save and restore booking form drafts"
```

---

### Task 11: Live Pricing Summary Panel

**Files:**

- Create: `client/src/components/booking/PricingSummary.tsx`
- Modify: `client/src/pages/BookingForm.tsx` (add sidebar)

**Step 1: Write the component**

Create `client/src/components/booking/PricingSummary.tsx`:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import {
  calculateTripTotal,
  formatTHB,
  type TripConfig,
  type PriceBreakdown,
} from "@shared/pricing";
import { Receipt } from "lucide-react";

interface Props {
  breakdown: PriceBreakdown | null;
}

export function PricingSummary({ breakdown }: Props) {
  const { language, t } = useLanguage();

  if (!breakdown) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 sticky top-24">
      <div className="flex items-center gap-2 text-[#1C1C1C] font-semibold">
        <Receipt className="h-5 w-5 text-[#D4AF37]" />
        {t("Price Estimate", "הערכת מחיר")}
      </div>

      {breakdown.tourItems.map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span className="text-gray-600">
            {language === "he" ? item.labelHe : item.labelEn}
          </span>
          <span>{formatTHB(item.amount)}</span>
        </div>
      ))}

      {breakdown.serviceItems.map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span className="text-gray-600">
            {language === "he" ? item.labelHe : item.labelEn}
          </span>
          <span>{formatTHB(item.amount)}</span>
        </div>
      ))}

      {breakdown.packageOption && (
        <div className="flex justify-between text-sm text-green-600">
          <span>{t("Package Savings", "חיסכון מחבילה")}</span>
          <span>-{formatTHB(breakdown.packageOption.savings)}</span>
        </div>
      )}

      <div className="border-t pt-3 flex justify-between font-bold text-lg">
        <span>{t("Total", 'סה"כ')}</span>
        <span className="text-[#D4AF37]">{formatTHB(breakdown.total)}</span>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>{t("Deposit (30%)", "מקדמה (30%)")}</span>
          <span>{formatTHB(breakdown.depositAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t("Balance", "יתרה")}</span>
          <span>{formatTHB(breakdown.balanceAmount)}</span>
        </div>
      </div>

      {breakdown.isCustomQuote && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          {t(
            "Groups of 7+ require a custom quote.",
            "קבוצות של 7+ דורשות הצעת מחיר מותאמת."
          )}
        </p>
      )}
    </div>
  );
}
```

**Step 2: Integrate with BookingForm.tsx**

Use `useMemo` to compute the `PriceBreakdown` from `formData` using the `calculateTripTotal` function from `shared/pricing.ts`. Show the panel in a right sidebar on desktop, collapsible on mobile.

**Step 3: Commit**

```bash
git add client/src/components/booking/PricingSummary.tsx client/src/pages/BookingForm.tsx
git commit -m "feat: add live pricing summary panel to booking form"
```

---

### Task 12: Reorder Form Steps (Trip Details First)

**Files:**

- Modify: `client/src/pages/BookingForm.tsx`

**Step 1: Reorder steps**

Change step order so that Trip Details (dates, group size) comes first, then Services, then Destinations, then Contact info last. The user gets invested in their trip before providing personal details.

Ensure the step state maps: 0 = Trip Details, 1 = Services, 2 = Destinations, 3 = Contact.

**Step 2: Verify**

Run booking flow — Trip Details should be step 1, contact info should be last.

**Step 3: Commit**

```bash
git add client/src/pages/BookingForm.tsx
git commit -m "refactor: reorder booking form - trip details first, contact last"
```

---

### Task 13: Trust Reinforcement Badges

**Files:**

- Modify: `client/src/pages/BookingForm.tsx` (near submit button)

**Step 1: Add trust badges**

Near the submit button on the final step, add:

```tsx
<div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-gray-500">
  <div className="flex items-center gap-1">
    <RotateCcw className="h-3 w-3" />
    {t("Free cancellation within 48h", "ביטול חינם תוך 48 שעות")}
  </div>
  <div className="flex items-center gap-1">
    <ShieldCheck className="h-3 w-3" />
    {t("Secure booking", "הזמנה מאובטחת")}
  </div>
  <div className="flex items-center gap-1">
    <MessageCircle className="h-3 w-3" />
    {t("Instant WhatsApp confirmation", "אישור מיידי בוואטסאפ")}
  </div>
</div>
```

**Step 2: Commit**

```bash
git add client/src/pages/BookingForm.tsx
git commit -m "feat: add trust badges near booking submit button"
```

---

## Section 4: Abandoned Booking Recovery

### Task 14: Draft Booking Storage (DB Schema + API)

**Files:**

- Modify: `drizzle/schema.ts` (add `bookingDrafts` table)
- Modify: `shared/schemas.ts` (add `bookingDraftInputSchema`)
- Modify: `server/db.ts` (add draft CRUD helpers)
- Create: `server/routes/bookingDraft.ts`
- Modify: `server/routers.ts` (register draft router)

**Step 1: Add DB table**

In `drizzle/schema.ts`, add after the bookings table:

```ts
export const bookingDrafts = mysqlTable("bookingDrafts", {
  id: int("id").autoincrement().primaryKey(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  formData: text("formData"), // Full JSON of form state
  tourSlug: varchar("tourSlug", { length: 255 }),
  resumeToken: varchar("resumeToken", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "converted", "expired"])
    .default("active")
    .notNull(),
  convertedToBookingId: int("convertedToBookingId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookingDraft = typeof bookingDrafts.$inferSelect;
export type InsertBookingDraft = typeof bookingDrafts.$inferInsert;
```

**Step 2: Add Zod schema in shared/schemas.ts**

```ts
export const bookingDraftInputSchema = z.object({
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  formData: z.string(), // JSON string
  tourSlug: z.string().optional(),
});
```

**Step 3: Add DB helpers in server/db.ts**

```ts
export async function createBookingDraft(data: InsertBookingDraft) { ... }
export async function getBookingDraftByToken(token: string) { ... }
export async function listActiveBookingDrafts() { ... }
export async function updateBookingDraftStatus(id: number, status: string) { ... }
```

**Step 4: Create tRPC router**

Create `server/routes/bookingDraft.ts` with:

- `save` (public) — saves/updates a draft, returns resumeToken
- `getByToken` (public) — retrieves draft for resume link
- `listActive` (admin) — lists abandoned drafts

**Step 5: Register in routers.ts**

```ts
import { bookingDraftRouter } from "./routes/bookingDraft";
// ...
bookingDraft: bookingDraftRouter,
```

**Step 6: Write test**

Create `server/bookingDraft.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { bookingDraftInputSchema } from "../shared/schemas";

describe("BookingDraft", () => {
  it("validates draft input schema", () => {
    const result = bookingDraftInputSchema.safeParse({
      formData: JSON.stringify({ arrivalDate: "2026-03-01" }),
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email in draft", () => {
    const result = bookingDraftInputSchema.safeParse({
      contactEmail: "not-email",
      formData: "{}",
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 7: Run test**

```bash
pnpm test -- bookingDraft
```

**Step 8: Push DB schema**

```bash
pnpm db:push
```

**Step 9: Commit**

```bash
git add drizzle/schema.ts shared/schemas.ts server/db.ts server/routes/bookingDraft.ts server/routers.ts server/bookingDraft.test.ts
git commit -m "feat: add booking drafts table and API for abandoned booking recovery"
```

---

### Task 15: Admin "Abandoned Bookings" Section

**Files:**

- Create: `client/src/components/admin/AbandonedBookingsTab.tsx`
- Modify: `client/src/pages/AdminDashboard.tsx` (add tab)

**Step 1: Write the component**

Create `client/src/components/admin/AbandonedBookingsTab.tsx` that:

- Calls `trpc.bookingDraft.listActive.useQuery()`
- Shows table with: Name, Email/Phone, Tour interest, Time abandoned, Actions (WhatsApp link, Email link)
- Format abandoned time using `formatDistanceToNow` from `date-fns`

**Step 2: Add tab to AdminDashboard.tsx**

Add a new "Abandoned" tab in the admin dashboard tab list. Import and render `AbandonedBookingsTab`.

**Step 3: Commit**

```bash
git add client/src/components/admin/AbandonedBookingsTab.tsx client/src/pages/AdminDashboard.tsx
git commit -m "feat: add abandoned bookings tab to admin dashboard"
```

---

### Task 16: WhatsApp Follow-up for Abandoned Bookings

**Files:**

- Modify: `client/src/components/admin/AbandonedBookingsTab.tsx` (add WhatsApp action button)

**Step 1: Add WhatsApp follow-up button**

For each abandoned draft that has a phone number, add a button that opens WhatsApp with a pre-filled message:

```tsx
const followUpMessage = encodeURIComponent(
  `Hi ${draft.contactName}, you were looking at booking a tour with WIRO 4x4. Would you like help completing your reservation?`
);
const whatsappUrl = `https://wa.me/${draft.contactPhone}?text=${followUpMessage}`;
```

**Step 2: Commit**

```bash
git add client/src/components/admin/AbandonedBookingsTab.tsx
git commit -m "feat: add WhatsApp follow-up action for abandoned bookings"
```

---

### Task 17: Email Recovery with Tokenized Resume Link

**Files:**

- Create: `server/abandonedBookingEmail.ts`
- Modify: `client/src/pages/BookingForm.tsx` (handle `?token=` query param)

**Step 1: Write email service**

Create `server/abandonedBookingEmail.ts`:

```ts
import { getResend } from "./resendEmailService";

export async function sendBookingRecoveryEmail(
  email: string,
  name: string,
  resumeToken: string,
  siteUrl: string
) {
  const resend = getResend();
  if (!resend) return;

  const resumeLink = `${siteUrl}/book?token=${resumeToken}`;

  await resend.emails.send({
    from: "WIRO 4x4 <updates@wiro4x4indochina.com>",
    to: email,
    subject: "Complete your WIRO 4x4 booking",
    html: `
      <p>Hi ${name},</p>
      <p>You started booking a tour with us but didn't finish. Your details are saved!</p>
      <p><a href="${resumeLink}" style="background:#D4AF37;color:#1C1C1C;padding:12px 24px;text-decoration:none;border-radius:99px;font-weight:bold;">Continue Booking</a></p>
      <p>Or reply to this email if you have any questions.</p>
      <p>— WIRO 4x4 Team</p>
    `,
  });
}
```

**Step 2: Handle token in BookingForm.tsx**

On mount, check for `?token=` in URL. If present, fetch draft via `trpc.bookingDraft.getByToken` and pre-fill form:

```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    // Fetch and restore draft from server
  }
}, []);
```

**Step 3: Commit**

```bash
git add server/abandonedBookingEmail.ts client/src/pages/BookingForm.tsx
git commit -m "feat: add email recovery with tokenized booking resume link"
```

---

## Section 5: Analytics & Funnel Tracking

### Task 18: Analytics Integration (Plausible)

**Files:**

- Modify: `client/index.html` (add Plausible script)
- OR create: `client/src/components/Analytics.tsx` (for self-hosted Umami)

**Step 1: Add Plausible script**

In `client/index.html`, add before `</head>`:

```html
<!-- Analytics (Plausible - privacy-friendly, no cookies) -->
<script
  defer
  data-domain="wiro4x4indochina.com"
  src="https://plausible.io/js/script.js"
></script>
```

Alternative (Umami self-hosted):

```html
<script
  defer
  src="https://your-umami-instance/script.js"
  data-website-id="YOUR_ID"
></script>
```

**Step 2: Commit**

```bash
git add client/index.html
git commit -m "feat: add Plausible analytics script"
```

---

### Task 19: Custom Funnel Event Tracking

**Files:**

- Create: `client/src/lib/analytics.ts`
- Modify: `client/src/pages/Home.tsx` (homepage_view event)
- Modify: `client/src/pages/TourDetail.tsx` (tour_page_view event)
- Modify: `client/src/pages/BookingForm.tsx` (booking events)

**Step 1: Create analytics helper**

Create `client/src/lib/analytics.ts`:

```ts
/**
 * Track custom events with Plausible or Umami.
 * Falls back to no-op if analytics not loaded.
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number>
) {
  // Plausible
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(eventName, { props });
  }
}

// Funnel events
export const FUNNEL = {
  HOMEPAGE_VIEW: "homepage_view",
  TOUR_PAGE_VIEW: "tour_page_view",
  BOOKING_STARTED: "booking_started",
  BOOKING_STEP_2: "booking_step_2",
  BOOKING_STEP_3: "booking_step_3",
  BOOKING_COMPLETED: "booking_completed",
} as const;
```

**Step 2: Add events to pages**

- `Home.tsx`: `useEffect(() => trackEvent(FUNNEL.HOMEPAGE_VIEW), []);`
- `TourDetail.tsx`: `useEffect(() => trackEvent(FUNNEL.TOUR_PAGE_VIEW, { tour: slug }), [slug]);`
- `BookingForm.tsx`: Track each step transition and completion

**Step 3: Commit**

```bash
git add client/src/lib/analytics.ts client/src/pages/Home.tsx client/src/pages/TourDetail.tsx client/src/pages/BookingForm.tsx
git commit -m "feat: add custom funnel event tracking"
```

---

### Task 20: UTM Parameter Parsing & Storage

**Files:**

- Create: `client/src/hooks/useUtmParams.ts`
- Modify: `shared/schemas.ts` (add utm fields to booking schema)
- Modify: `drizzle/schema.ts` (add utm columns to bookings)
- Modify: `client/src/pages/BookingForm.tsx` (attach UTM to submission)

**Step 1: Create UTM hook**

Create `client/src/hooks/useUtmParams.ts`:

```ts
import { useEffect } from "react";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];
const STORAGE_KEY = "wiro-utm";

export function captureUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  let hasUtm = false;

  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) {
      utm[key] = val;
      hasUtm = true;
    }
  }

  if (hasUtm) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  }
}

export function getStoredUtm(): Record<string, string> | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}
```

**Step 2: Capture UTM on app load**

In `client/src/App.tsx`, add `captureUtmParams()` call in AppContent useEffect.

**Step 3: Add utmSource column to bookings**

In `drizzle/schema.ts`, add to bookings table:

```ts
utmSource: varchar("utmSource", { length: 255 }),
utmMedium: varchar("utmMedium", { length: 255 }),
utmCampaign: varchar("utmCampaign", { length: 255 }),
```

**Step 4: Push schema and commit**

```bash
pnpm db:push
git add client/src/hooks/useUtmParams.ts client/src/App.tsx drizzle/schema.ts shared/schemas.ts client/src/pages/BookingForm.tsx
git commit -m "feat: capture and store UTM parameters with bookings"
```

---

### Task 21: Admin Funnel Widget (Recharts)

**Files:**

- Create: `client/src/components/admin/FunnelChart.tsx`
- Modify: `client/src/components/admin/DashboardCharts.tsx` (add funnel chart)
- Create: `server/routes/analytics.ts` (funnel data API)
- Modify: `server/routers.ts` (register analytics router)

**Step 1: Create analytics API**

Create `server/routes/analytics.ts`:

```ts
import { router, secureProtectedProcedure } from "./_helpers";
import { getDb } from "../db";
import { bookings, bookingDrafts } from "../../drizzle/schema";
import { count, eq, gte, and } from "drizzle-orm";

export const analyticsRouter = router({
  funnelData: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { steps: [] };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Count completed bookings in last 30 days
    const [completedResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(gte(bookings.createdAt, thirtyDaysAgo));

    // Count drafts (abandoned) in last 30 days
    const [draftsResult] = await db
      .select({ count: count() })
      .from(bookingDrafts)
      .where(gte(bookingDrafts.createdAt, thirtyDaysAgo));

    const completed = completedResult?.count ?? 0;
    const abandoned = draftsResult?.count ?? 0;
    const started = completed + abandoned;

    // Estimate funnel from available data
    // (Real page view data comes from Plausible API — this is booking-side only)
    return {
      steps: [
        { name: "Bookings Started", count: started },
        { name: "Bookings Completed", count: completed },
        { name: "Abandoned", count: abandoned },
      ],
      conversionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
    };
  }),
});
```

**Step 2: Register in routers.ts**

```ts
import { analyticsRouter } from "./routes/analytics";
// ...
analytics: analyticsRouter,
```

**Step 3: Create FunnelChart component**

Create `client/src/components/admin/FunnelChart.tsx` using Recharts `BarChart`:

```tsx
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function FunnelChart() {
  const { t } = useLanguage();
  const { data } = trpc.analytics.funnelData.useQuery();

  if (!data || data.steps.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-1">
        {t("Booking Funnel (30 days)", "משפך הזמנות (30 יום)")}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {t("Conversion rate", "שיעור המרה")}: {data.conversionRate}%
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.steps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Step 4: Add to DashboardCharts.tsx**

Import `FunnelChart` and add it to the dashboard charts grid.

**Step 5: Commit**

```bash
git add server/routes/analytics.ts server/routers.ts client/src/components/admin/FunnelChart.tsx client/src/components/admin/DashboardCharts.tsx
git commit -m "feat: add booking funnel chart to admin dashboard"
```

---

## Final Verification

After all 21 tasks are complete:

1. **Run tests:** `pnpm test`
2. **Type check:** `npx tsc --noEmit`
3. **Manual test flow:**
   - Visit homepage → see trust bar, sticky bar on scroll, urgency badges
   - Click tour → see social proof, pricing panel, FAQ, comparison nudge
   - Click book → see progress bar, live pricing, trust badges, auto-save working
   - Abandon form → admin sees abandoned booking in dashboard
   - Check admin → funnel chart shows data
4. **Push schema:** `pnpm db:push`
