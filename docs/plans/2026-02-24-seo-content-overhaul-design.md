# SEO & Content Overhaul Design

**Date:** 2026-02-24
**Status:** Approved
**Goal:** Outrank ecotourschiangmai.com for kosher/Hebrew/general Chiang Mai tour searches

## Audiences

1. Hebrew/Israeli travelers (Hebrew search terms)
2. English-speaking Jewish travelers (kosher-specific terms)
3. General English searchers (Chiang Mai tours broadly)

## Section 1: Technical SEO Fixes

### 1.1 Fix Domain References

- Canonical URL: `wiro-4x4.manus.space` → `https://www.wiro4x4indochina.com`
- `robots.txt` sitemap URL → correct domain
- All hreflang tags → correct domain
- JSON-LD `@id` and `url` → correct domain

### 1.2 Per-Page Meta & OG Tags

- Upgrade `usePageMeta` hook to set: OG title, OG description, OG image, canonical
- Tour detail pages: unique meta per tour (e.g., "Mae Kampong Village Tour | Kosher Off-Road | WIRO 4x4")
- Blog posts: own OG image + description
- All OG images use absolute URLs with domain

### 1.3 Structured Data (JSON-LD)

Add per-page schemas:

- **TouristTrip** per tour page (name, description, price, duration, provider)
- **FAQPage** on homepage FAQ + tour FAQs
- **BreadcrumbList** on tour detail + blog post pages
- **AggregateRating** on tour pages (from reviews data)
- **BlogPosting** on each blog post page
- **LocalBusiness** expanded (opening hours, price range, area served)

### 1.4 Indexing

- Add `<meta name="robots" content="index, follow">` on public pages

## Section 2: SEO Blog Articles (10 Bilingual EN/HE)

Each article: 800-1200 words, bilingual, internal links to tours, CTA at bottom.

### Israeli/Hebrew Travelers

1. "Chiang Mai for Israeli Travelers — The Complete Guide" — visa, money, SIM, Hebrew services
2. "Shabbat in Chiang Mai — Where to Stay, Eat & Pray" — Chabad, kosher restaurants, Shabbat hotels
3. "Kosher Food in Chiang Mai — Every Option Mapped" — restaurants, supermarkets, tips

### Kosher/Jewish Travelers (English)

4. "Top 5 Kosher-Friendly Day Trips from Chiang Mai" — positions our 5 tours
5. "Planning a Kosher Trip to Thailand — What You Need to Know" — broader Thailand guide
6. "Jewish Holidays in Thailand — Celebrating Abroad" — Pesach, Sukkot, Rosh Hashana

### General Chiang Mai Searchers

7. "Mae Kampong Village — The Hidden Gem Most Tourists Miss" — deep guide
8. "Best Off-Road Adventures in Northern Thailand" — expert positioning
9. "Doi Inthanon — Beyond the Summit: A Local's Guide" — detailed guide
10. "Sticky Waterfalls Chiang Mai — How to Actually Climb Them" — practical tips

### Article Spec

- SEO title + meta description targeting specific keywords
- Categories + tags for blog filtering
- Published status: ready to go
- Internal links to 1-2 relevant tour pages
- CTA: WhatsApp / Book Now

## Section 3: Audience Landing Pages

3 new routes — conversion-focused, not blog posts.

### 3.1 `/kosher-tours` — "Kosher Tours Chiang Mai"

- Keywords: "kosher tours Thailand", "kosher travel Chiang Mai", "frum friendly tours"
- Content: Why kosher touring is different, what we provide, all 6 tours with kosher badges
- CTA: WhatsApp inquiry + booking form

### 3.2 `/hebrew-guide` — "Hebrew Speaking Guide Chiang Mai"

- Keywords: "מדריך דובר עברית צ'אנג מאי", "טיולים בעברית תאילנד"
- Content: Guide bio + photo, why Hebrew guide matters, sample itinerary, Israeli testimonials
- Heavy Hebrew content for Hebrew search ranking
- CTA: WhatsApp direct

### 3.3 `/accessible-tours` — "Wheelchair Accessible Tours Chiang Mai"

- Keywords: "accessible tours Chiang Mai", "wheelchair travel Thailand"
- Content: Accessibility capabilities, adapted vehicles, what's possible
- CTA: Custom inquiry form

### Landing Page Spec

- Unique JSON-LD per page
- Own meta title/description/OG
- Added to sitemap + internal linking

## Section 4: On-Page Content Enrichment

### 4.1 Tour Detail Pages

- Add "What to Bring" section per tour
- Add "Best Time to Visit" section per tour
- Add "Local Tips" section
- Expand descriptions ~50% with keyword-rich content
- Add "Related Tours" section (internal linking)

### 4.2 Homepage FAQ Expansion

New questions:

- "Is the food on tours kosher?"
- "Can you accommodate Shabbat schedules?"
- "Are tours wheelchair accessible?"
- "What's the best season for Chiang Mai?"
- "How do I get from Bangkok to Chiang Mai?"
- "Can I pay in shekels/USD?"
- FAQPage schema on all FAQ sections

### 4.3 Internal Linking Strategy

- Blog → 1-2 tour pages
- Tour pages → 1-2 blog posts ("Read more about Mae Kampong →")
- Landing pages → tours + blog
- Footer → landing pages + top blog posts

### 4.4 Image SEO

- Descriptive `alt` tags on all images
- Image `title` attributes for hover context

## Section 5: SEO Infrastructure

### 5.1 Admin SEO Health Indicator

- Published blog posts count
- Total indexed pages (sitemap count)
- Missing meta descriptions warning
- Missing OG images warning

### 5.2 Content Calendar

- `docs/seo-content-calendar.md` with 10 initial + 10 future article ideas
- Target keywords per article
- Publishing cadence: 2 articles/month

### 5.3 Google Search Console Guide

- `docs/google-search-console-setup.md`
- Domain verification steps
- Sitemap submission
- Key metrics to monitor

### 5.4 Sitemap & Robots Updates

- Add landing pages to dynamic sitemap
- Fix robots.txt domain
- Consider image sitemap for gallery

## Implementation Order

1. Technical SEO fixes (foundation — everything depends on this)
2. Landing pages (new routes + components)
3. On-page content enrichment (tour pages, FAQ, image alt)
4. Blog articles (10 articles, created via DB insert)
5. SEO infrastructure (admin, docs, calendar)

## Success Metrics

- All pages pass Google Rich Results Test
- Sitemap indexed in Google Search Console
- Ranking page 1 for "kosher tours Chiang Mai" within 4-6 weeks
- Ranking page 1 for "טיולים כשרים צ'אנג מאי" within 4-6 weeks
- Blog articles appearing in search within 2-3 weeks
