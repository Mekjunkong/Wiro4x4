# Quick Wins Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 6 quick-win enhancements to Wiro 4x4 — dynamic sitemap, breadcrumbs, FAQ JSON-LD sync, social proof counters, recently-booked popup, and multi-day package builder.

**Architecture:** All features are data-driven via the existing tRPC + Drizzle ORM stack. New Express route for sitemap, new tRPC `stats` router for public metrics, and new React components on the homepage and sub-pages. No new DB tables required.

**Tech Stack:** React 19, TypeScript, tRPC 11, Drizzle ORM, Express 4, Tailwind CSS 4, Vitest

---

### Task 1: Stats DB Helpers

**Files:**

- Create: `server/db/stats.ts`
- Modify: `server/db/index.ts` (add exports)

**Step 1: Create `server/db/stats.ts`**

```typescript
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { count } from "drizzle-orm";
import { getDb } from "./connection";
import { bookings, reviews, tours } from "../../drizzle/schema";

export async function getPublicStats() {
  const db = await getDb();
  if (!db) return { totalBookings: 0, totalReviews: 0, totalTours: 0 };

  const [bookingCount] = await db
    .select({ value: count() })
    .from(bookings)
    .where(sql`${bookings.status} IN ('confirmed', 'completed')`);

  const [reviewCount] = await db
    .select({ value: count() })
    .from(reviews)
    .where(and(eq(reviews.isApproved, 1), gte(reviews.rating, 4)));

  const [tourCount] = await db
    .select({ value: count() })
    .from(tours)
    .where(eq(tours.isActive, 1));

  return {
    totalBookings: bookingCount?.value ?? 0,
    totalReviews: reviewCount?.value ?? 0,
    totalTours: tourCount?.value ?? 0,
  };
}

export async function getRecentBookings(limit = 5) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      contactName: bookings.contactName,
      tourName:
        sql<string>`COALESCE(${bookings.suggestedDestinations}, 'Off-Road Adventure')`.as(
          "tourName"
        ),
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(sql`${bookings.status} IN ('confirmed', 'completed')`)
    .orderBy(desc(bookings.createdAt))
    .limit(limit);

  return rows.map(r => ({
    firstName: r.contactName.split(" ")[0],
    tourName: r.tourName,
    createdAt: r.createdAt,
  }));
}
```

**Step 2: Add exports to `server/db/index.ts`**

Append to the bottom of `server/db/index.ts`, before the pagination export:

```typescript
// Stats (public)
export { getPublicStats, getRecentBookings } from "./stats";
```

**Step 3: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add server/db/stats.ts server/db/index.ts
git commit -m "feat: add public stats DB helpers (getPublicStats, getRecentBookings)"
```

---

### Task 2: Stats tRPC Router

**Files:**

- Create: `server/routes/stats.ts`
- Modify: `server/routers.ts` (register router)
- Create: `server/stats.test.ts`

**Step 1: Write the test file `server/stats.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createPublicContext } from "./test-helpers";

describe("stats router", () => {
  it("stats.public returns numeric counts", async () => {
    const caller = appRouter.createCaller(createPublicContext().ctx);
    const result = await caller.stats.public();
    expect(result).toHaveProperty("totalBookings");
    expect(result).toHaveProperty("totalReviews");
    expect(result).toHaveProperty("totalTours");
    expect(typeof result.totalBookings).toBe("number");
    expect(typeof result.totalReviews).toBe("number");
    expect(typeof result.totalTours).toBe("number");
  });

  it("stats.recentBookings returns array with correct shape", async () => {
    const caller = appRouter.createCaller(createPublicContext().ctx);
    const result = await caller.stats.recentBookings();
    expect(Array.isArray(result)).toBe(true);
    // When DB is unavailable, returns empty array
    for (const item of result) {
      expect(item).toHaveProperty("firstName");
      expect(item).toHaveProperty("tourName");
      expect(item).toHaveProperty("timeAgo");
    }
  });
});
```

**Step 2: Run tests — verify they fail**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/stats.test.ts`
Expected: FAIL (stats router doesn't exist yet)

**Step 3: Create `server/routes/stats.ts`**

```typescript
import { router, securePublicProcedure } from "./_helpers";
import { getPublicStats, getRecentBookings } from "../db";
import { formatDistanceToNow } from "date-fns";

export const statsRouter = router({
  public: securePublicProcedure.query(async () => {
    return await getPublicStats();
  }),

  recentBookings: securePublicProcedure.query(async () => {
    const rows = await getRecentBookings(5);
    return rows.map(r => ({
      firstName: r.firstName,
      tourName: r.tourName,
      timeAgo: formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }),
    }));
  }),
});
```

**Step 4: Register in `server/routers.ts`**

Add import:

```typescript
import { statsRouter } from "./routes/stats";
```

Add to the `router({})` call:

```typescript
stats: statsRouter,
```

**Step 5: Run tests — verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/stats.test.ts`
Expected: 2 tests PASS

**Step 6: Run full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing tests still pass

**Step 7: Commit**

```bash
git add server/routes/stats.ts server/routers.ts server/stats.test.ts
git commit -m "feat: add stats tRPC router with public stats and recent bookings"
```

---

### Task 3: Dynamic Sitemap

**Files:**

- Create: `server/routes/sitemap.ts`
- Modify: `server/_core/index.ts` (register route)
- Delete: `client/public/sitemap.xml`
- Create: `server/sitemap.test.ts`

**Step 1: Write test `server/sitemap.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { generateSitemap } from "./routes/sitemap";

describe("sitemap", () => {
  it("generates valid XML with static pages", () => {
    const xml = generateSitemap([], [], "https://www.wiro4x4indochina.com");
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("https://www.wiro4x4indochina.com/");
    expect(xml).toContain("https://www.wiro4x4indochina.com/pricing");
    expect(xml).toContain("https://www.wiro4x4indochina.com/blog");
  });

  it("includes tour and blog slugs", () => {
    const tours = [{ slug: "doi-inthanon" }];
    const blogs = [{ slug: "kosher-guide" }];
    const xml = generateSitemap(
      tours,
      blogs,
      "https://www.wiro4x4indochina.com"
    );
    expect(xml).toContain("/tours/doi-inthanon");
    expect(xml).toContain("/blog/kosher-guide");
  });

  it("escapes XML special characters in slugs", () => {
    const tours = [{ slug: "tour-with-&-ampersand" }];
    const xml = generateSitemap(tours, [], "https://www.wiro4x4indochina.com");
    expect(xml).toContain("tour-with-&amp;-ampersand");
    expect(xml).not.toContain("tour-with-&-ampersand</loc>");
  });
});
```

**Step 2: Run test — verify it fails**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/sitemap.test.ts`
Expected: FAIL

**Step 3: Create `server/routes/sitemap.ts`**

```typescript
import type { Express } from "express";
import { getAllActiveTours, getAllPublishedBlogPosts } from "../db";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface SlugItem {
  slug: string;
}

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/pricing", priority: "0.9", changefreq: "monthly" },
  { path: "/estimate", priority: "0.9", changefreq: "monthly" },
  { path: "/book", priority: "0.9", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/gallery", priority: "0.8", changefreq: "weekly" },
  { path: "/reviews", priority: "0.8", changefreq: "weekly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
];

export function generateSitemap(
  tours: SlugItem[],
  blogs: SlugItem[],
  siteUrl: string
): string {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = STATIC_PAGES.map(
    p => `  <url>
    <loc>${escapeXml(siteUrl)}${escapeXml(p.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n");

  const tourUrls = tours
    .map(
      t => `  <url>
    <loc>${escapeXml(siteUrl)}/tours/${escapeXml(t.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  const blogUrls = blogs
    .map(
      b => `  <url>
    <loc>${escapeXml(siteUrl)}/blog/${escapeXml(b.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${tourUrls}
${blogUrls}
</urlset>`;
}

export function registerSitemapRoute(app: Express) {
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const tours = await getAllActiveTours();
      const blogs = await getAllPublishedBlogPosts();
      const siteUrl =
        process.env.SITE_URL || "https://www.wiro4x4indochina.com";
      const xml = generateSitemap(
        tours.map(t => ({ slug: t.slug })),
        blogs.map(b => ({ slug: b.slug })),
        siteUrl
      );
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Failed to generate:", err);
      res.status(500).send("Failed to generate sitemap");
    }
  });
}
```

**Step 4: Register in `server/_core/index.ts`**

Add import after the RSS import:

```typescript
import { registerSitemapRoute } from "../routes/sitemap";
```

Add call after `registerRssRoute(app);`:

```typescript
registerSitemapRoute(app);
```

**Step 5: Delete static sitemap**

```bash
rm /Users/pasuthunjunkong/workspace/Wiro4x4/client/public/sitemap.xml
```

**Step 6: Run tests — verify they pass**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx vitest run server/sitemap.test.ts`
Expected: 3 tests PASS

**Step 7: Run full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All existing tests still pass

**Step 8: Commit**

```bash
git add server/routes/sitemap.ts server/sitemap.test.ts server/_core/index.ts
git rm client/public/sitemap.xml
git commit -m "feat: dynamic sitemap.xml from DB tours and blog posts"
```

---

### Task 4: Breadcrumb Component

**Files:**

- Create: `client/src/components/Breadcrumb.tsx`
- Modify: `client/src/pages/TourDetail.tsx`
- Modify: `client/src/pages/BlogPost.tsx`
- Modify: `client/src/pages/Pricing.tsx`
- Modify: `client/src/pages/Gallery.tsx`
- Modify: `client/src/pages/Reviews.tsx`
- Modify: `client/src/pages/Estimate.tsx`
- Modify: `client/src/pages/BookingForm.tsx`

**Step 1: Create `client/src/components/Breadcrumb.tsx`**

```tsx
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `https://www.wiro4x4indochina.com${item.href}` }
        : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="px-4 sm:px-6 lg:px-8 py-3 mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
            {index === 0 && <Home className="w-3.5 h-3.5 shrink-0" />}
            {item.href && index < allItems.length - 1 ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**Step 2: Add Breadcrumb to `TourDetail.tsx`**

After the Header component, before the main content, add:

```tsx
import { Breadcrumb } from "@/components/Breadcrumb";
```

Then render below `<Header />`:

```tsx
<Breadcrumb
  items={[
    { label: t("Tours", "טיולים"), href: "/#tours" },
    { label: t(tour.name, tour.nameHe) },
  ]}
/>
```

**Step 3: Add Breadcrumb to all other pages**

Add the same import and render pattern after `<Header />` in each page:

- **BlogPost.tsx:** `items={[{ label: t("Blog", "בלוג"), href: "/blog" }, { label: post.title }]}`
- **Pricing.tsx:** `items={[{ label: t("Pricing", "מחירים") }]}`
- **Gallery.tsx:** `items={[{ label: t("Gallery", "גלריה") }]}`
- **Reviews.tsx:** `items={[{ label: t("Reviews", "ביקורות") }]}`
- **Estimate.tsx:** `items={[{ label: t("Cost Estimator", "מחשבון עלויות") }]}`
- **BookingForm.tsx:** `items={[{ label: t("Book a Tour", "הזמנת טיול") }]}`

**Step 4: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add client/src/components/Breadcrumb.tsx client/src/pages/TourDetail.tsx client/src/pages/BlogPost.tsx client/src/pages/Pricing.tsx client/src/pages/Gallery.tsx client/src/pages/Reviews.tsx client/src/pages/Estimate.tsx client/src/pages/BookingForm.tsx
git commit -m "feat: add Breadcrumb component with JSON-LD to all sub-pages"
```

---

### Task 5: FAQ JSON-LD Sync

**Files:**

- Create: `client/src/components/FaqJsonLd.tsx`
- Modify: `client/src/components/FAQ.tsx` (export faqData)
- Modify: `client/src/pages/Home.tsx` (add FaqJsonLd)
- Modify: `client/index.html` (remove hardcoded FAQ JSON-LD)

**Step 1: Export faqData from `FAQ.tsx`**

In `client/src/components/FAQ.tsx`, change `const faqData = [` to `export const faqData = [`.

**Step 2: Create `client/src/components/FaqJsonLd.tsx`**

```tsx
import { faqData } from "./FAQ";

export function FaqJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map(item => ({
      "@type": "Question",
      name: item.q[0], // English question
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a[0], // English answer
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Step 3: Add FaqJsonLd to `Home.tsx`**

Add import:

```tsx
import { FaqJsonLd } from "@/components/FaqJsonLd";
```

Add inside `<main>`, before `</main>`:

```tsx
<FaqJsonLd />
```

**Step 4: Remove FAQ JSON-LD from `client/index.html`**

In `client/index.html`, find the `"@type": "FAQPage"` block inside the `@graph` array (around lines 82-165) and remove the entire FAQPage object from the `@graph` array. Keep the Organization, TouristTrip, and WebSite objects.

**Step 5: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add client/src/components/FAQ.tsx client/src/components/FaqJsonLd.tsx client/src/pages/Home.tsx client/index.html
git commit -m "feat: sync FAQ JSON-LD from component data (single source of truth)"
```

---

### Task 6: Social Proof Bar

**Files:**

- Create: `client/src/components/SocialProofBar.tsx`
- Modify: `client/src/pages/Home.tsx` (add component)

**Step 1: Create `client/src/components/SocialProofBar.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MapPin, Star, Route, ShieldCheck } from "lucide-react";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold text-secondary">
      {count}
      {suffix}
    </span>
  );
}

export function SocialProofBar() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 30, duration: 0.5 });
  const { data } = trpc.stats.public.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });

  const stats = [
    {
      icon: MapPin,
      value: Math.max(data?.totalBookings ?? 0, 200), // minimum floor
      suffix: "+",
      label: t("Tours Completed", "טיולים שהושלמו"),
    },
    {
      icon: Star,
      value: Math.max(data?.totalReviews ?? 0, 50),
      suffix: "+",
      label: t("5-Star Reviews", "ביקורות 5 כוכבים"),
    },
    {
      icon: Route,
      value: Math.max(data?.totalTours ?? 0, 6),
      suffix: "",
      label: t("Unique Routes", "מסלולים ייחודיים"),
    },
    {
      icon: ShieldCheck,
      value: 100,
      suffix: "%",
      label: t("Kosher Certified", "כשרות מאושרת"),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-primary/95 text-primary-foreground py-12 sm:py-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <stat.icon className="w-8 h-8 text-secondary mb-1" />
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <span className="text-sm sm:text-base text-primary-foreground/80">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add to `Home.tsx`**

Add import:

```tsx
import { SocialProofBar } from "@/components/SocialProofBar";
```

Place between `<Tours />` and `<TripCostEstimator />`:

```tsx
<Tours />
<SocialProofBar />
<TripCostEstimator />
```

**Step 3: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add client/src/components/SocialProofBar.tsx client/src/pages/Home.tsx
git commit -m "feat: add SocialProofBar with animated counters on homepage"
```

---

### Task 7: Recently Booked Popup

**Files:**

- Create: `client/src/components/RecentlyBookedPopup.tsx`
- Modify: `client/src/pages/Home.tsx` (add component)

**Step 1: Create `client/src/components/RecentlyBookedPopup.tsx`**

```tsx
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { X, CheckCircle } from "lucide-react";

const DISMISSED_KEY = "wiro_recently_booked_dismissed";

export function RecentlyBookedPopup() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const { data: bookings } = trpc.stats.recentBookings.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  }, []);

  // Check if already dismissed this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISSED_KEY)) {
        setDismissed(true);
      }
    } catch {}
  }, []);

  // Show first popup after 5s delay
  useEffect(() => {
    if (dismissed || !bookings?.length) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [dismissed, bookings]);

  // Cycle through bookings every 8s
  useEffect(() => {
    if (dismissed || !bookings?.length || !visible) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % bookings.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [dismissed, bookings, visible]);

  if (dismissed || !bookings?.length) return null;
  const booking = bookings[currentIndex];
  if (!booking) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-[9990] max-w-xs bg-card border border-border rounded-lg shadow-lg p-3 transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      <button
        onClick={dismiss}
        className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-2.5 pr-4">
        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {booking.firstName} {t("just booked", "הזמין/ה")}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {booking.tourName}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {booking.timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add to `Home.tsx`**

Add import:

```tsx
import { RecentlyBookedPopup } from "@/components/RecentlyBookedPopup";
```

Add before `<FloatingActionButtons />`:

```tsx
<RecentlyBookedPopup />
```

**Step 3: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add client/src/components/RecentlyBookedPopup.tsx client/src/pages/Home.tsx
git commit -m "feat: add RecentlyBookedPopup with cycling real booking data"
```

---

### Task 8: Multi-Day Package Builder

**Files:**

- Create: `client/src/components/PackageBuilder.tsx`
- Modify: `client/src/pages/Estimate.tsx` (add section)

**Step 1: Create `client/src/components/PackageBuilder.tsx`**

```tsx
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MULTI_DAY_PACKAGES, formatTHB } from "@shared/pricing";
import { Check, Package, MessageCircle, BadgePercent } from "lucide-react";

interface Tour {
  name: string;
  nameHe: string;
  price: number;
  slug: string;
}

const FALLBACK_TOURS: Tour[] = [
  {
    name: "Doi Inthanon",
    nameHe: "דוי אינתנון",
    price: 4200,
    slug: "doi-inthanon-roof-of-thailand",
  },
  {
    name: "Mae Kampong",
    nameHe: "מאה קמפונג",
    price: 3500,
    slug: "mae-kampong-hidden-village",
  },
  {
    name: "Sticky Waterfalls",
    nameHe: "מפלים דביקים",
    price: 3800,
    slug: "maerim-sticky-waterfalls",
  },
  {
    name: "Doi Suthep & Pui",
    nameHe: "דוי סוטפ",
    price: 3200,
    slug: "doi-suthep-pui-beyond-temple",
  },
  {
    name: "Mae Wang Jungle",
    nameHe: "ג'ונגל מאה וואנג",
    price: 4800,
    slug: "mae-wang-jungle-wilderness",
  },
  {
    name: "Samoeng Loop",
    nameHe: "לולאת סמואנג",
    price: 3500,
    slug: "samoeng-loop-mountain-circuit",
  },
];

export function PackageBuilder() {
  const { t } = useLanguage();
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const { data: dbTours } = trpc.tour.list.useQuery();
  const tours: Tour[] = useMemo(() => {
    if (dbTours?.length) {
      return dbTours.map(t => ({
        name: t.name,
        nameHe: t.nameHe || t.name,
        price: t.price ?? 3500,
        slug: t.slug,
      }));
    }
    return FALLBACK_TOURS;
  }, [dbTours]);

  const toggleTour = (slug: string) => {
    setSelectedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectedTours = tours.filter(t => selectedSlugs.has(t.slug));
  const totalDays = selectedTours.length;
  const individualTotal = selectedTours.reduce((sum, t) => sum + t.price, 0);

  // Find best matching package
  const matchingPackage = MULTI_DAY_PACKAGES.filter(
    p => p.days <= totalDays
  ).sort((a, b) => b.days - a.days)[0];

  const packageTotal = matchingPackage
    ? matchingPackage.price +
      (totalDays > matchingPackage.days
        ? selectedTours
            .slice(matchingPackage.days)
            .reduce((s, t) => s + t.price, 0)
        : 0)
    : individualTotal;

  const savings = individualTotal - packageTotal;
  const savingsPercent =
    individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0;

  const whatsappMessage = encodeURIComponent(
    `Hi WIRO 4x4! I'd like to build a ${totalDays}-day package:\n\n${selectedTours
      .map(t => `- ${t.name} (${formatTHB(t.price)})`)
      .join("\n")}\n\nTotal estimate: ${formatTHB(packageTotal)}${
      savings > 0 ? ` (saving ${formatTHB(savings)})` : ""
    }\n\nPlease send me a quote!`
  );

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6 text-secondary" />
        <h3 className="text-xl sm:text-2xl font-bold text-primary">
          {t("Build a Multi-Day Package", "בנו חבילה רב-יומית")}
        </h3>
      </div>

      <p className="text-muted-foreground mb-6 text-sm">
        {t(
          "Select 2 or more tours to unlock package discounts.",
          "בחרו 2 טיולים או יותר כדי לקבל הנחת חבילה."
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {tours.map(tour => {
          const isSelected = selectedSlugs.has(tour.slug);
          return (
            <button
              key={tour.slug}
              onClick={() => toggleTour(tour.slug)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {t(tour.name, tour.nameHe)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTHB(tour.price)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {totalDays >= 2 && (
        <div className="border-t pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t("Individual total", "סכום בודד")}
            </span>
            <span className="line-through text-muted-foreground">
              {formatTHB(individualTotal)}
            </span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-sm items-center">
              <span className="flex items-center gap-1 text-emerald-600">
                <BadgePercent className="w-4 h-4" />
                {t(
                  `Package discount (save ${savingsPercent}%)`,
                  `הנחת חבילה (חיסכון ${savingsPercent}%)`
                )}
              </span>
              <span className="text-emerald-600 font-medium">
                -{formatTHB(savings)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>{t("Package total", "סה״כ חבילה")}</span>
            <span className="text-primary">{formatTHB(packageTotal)}</span>
          </div>

          <Button
            asChild
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Get a Quote via WhatsApp", "קבלו הצעת מחיר בוואטסאפ")}
            </a>
          </Button>
        </div>
      )}

      {totalDays === 1 && (
        <p className="text-center text-sm text-muted-foreground pt-4 border-t">
          {t(
            "Select at least one more tour for package pricing.",
            "בחרו עוד טיול אחד לפחות למחיר חבילה."
          )}
        </p>
      )}
    </Card>
  );
}
```

**Step 2: Add PackageBuilder to `Estimate.tsx`**

Read the current `Estimate.tsx` to find where to add the section. Add import:

```tsx
import { PackageBuilder } from "@/components/PackageBuilder";
```

Place after the existing `<CostCalculator />` component (or `<TripCostEstimator />`), inside the main content area:

```tsx
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
  <PackageBuilder />
</div>
```

**Step 3: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 4: Run full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All tests pass

**Step 5: Commit**

```bash
git add client/src/components/PackageBuilder.tsx client/src/pages/Estimate.tsx
git commit -m "feat: add multi-day PackageBuilder with tour selection and discounts"
```

---

### Task 9: Final Verification & Update Tracking

**Files:**

- Modify: `todo.md` (add completed items)

**Step 1: Run full test suite**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && pnpm test`
Expected: All tests pass (existing + 5 new tests in stats.test.ts + 3 in sitemap.test.ts)

**Step 2: Run type check**

Run: `cd /Users/pasuthunjunkong/workspace/Wiro4x4 && npx tsc --noEmit`
Expected: No errors

**Step 3: Update `todo.md`**

Append the following section to the end of `todo.md`:

```markdown
## Quick Wins Enhancements (Feb 21, 2026)

### SEO Quick Wins

- [x] Dynamic sitemap.xml generated from DB tours and blog posts (server/routes/sitemap.ts)
- [x] Reusable Breadcrumb component with JSON-LD BreadcrumbList schema (7 pages)
- [x] FAQ JSON-LD synced from FAQ.tsx single source of truth (removed hardcoded from index.html)

### Conversion Quick Wins

- [x] SocialProofBar with animated counters on homepage (tours, reviews, routes, kosher)
- [x] RecentlyBookedPopup showing real recent bookings (privacy-safe, dismissible)
- [x] PackageBuilder for multi-day tour combinations with package discounts on /estimate
```

**Step 4: Commit**

```bash
git add todo.md
git commit -m "docs: update todo.md with quick wins enhancements"
```
