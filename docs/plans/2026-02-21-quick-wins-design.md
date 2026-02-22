# Quick Wins Enhancement Design

**Date:** 2026-02-21
**Status:** Approved
**Approach:** Server-side dynamic generation (Approach A)

## Overview

Six quick-win enhancements for Wiro 4x4 — three SEO improvements and three conversion features. All data-driven via existing tRPC + DB infrastructure.

---

## SEO Quick Wins

### 1. Dynamic Sitemap (`/sitemap.xml`)

**What:** Replace the static `client/public/sitemap.xml` with a dynamic Express route.

**Implementation:**

- New file: `server/routes/sitemap.ts` — Express handler that generates XML
- Queries `tours` (active, published) and `blogPosts` (published) from DB
- Includes all static pages: `/`, `/pricing`, `/estimate`, `/book`, `/blog`, `/gallery`, `/reviews`, `/terms`, `/privacy`
- Includes dynamic pages: `/tours/:slug` for each active tour, `/blog/:slug` for each published post
- Base URL: `https://www.wiro4x4indochina.com`
- Content-Type: `application/xml`
- Delete static `client/public/sitemap.xml` after

**Priority values:**

- Home: 1.0
- Pricing/Estimate/Book: 0.9
- Tours/Blog/Gallery/Reviews: 0.8
- Individual tour/blog pages: 0.7
- Terms/Privacy: 0.3

### 2. Breadcrumb Component

**What:** Reusable `<Breadcrumb>` component with visible trail + JSON-LD schema.

**Implementation:**

- New file: `client/src/components/Breadcrumb.tsx`
- Props: `items: Array<{ label: string; href?: string }>`
- Renders: visible breadcrumb links styled with Tailwind + a `<script type="application/ld+json">` for `BreadcrumbList`
- Integrate into: TourDetail, BlogPost, Pricing, Gallery, Reviews, Estimate, BookingForm
- Uses `t()` for bilingual labels
- Chevron separator between items

### 3. FAQ JSON-LD Sync

**What:** Make FAQ data the single source of truth for both UI and JSON-LD.

**Implementation:**

- Export `faqData` array from `client/src/components/FAQ.tsx`
- New component `<FaqJsonLd>` that renders `<script type="application/ld+json">` from `faqData`
- Embed `<FaqJsonLd>` in `Home.tsx` (replaces the hardcoded FAQ JSON-LD in `index.html`)
- Remove FAQ JSON-LD block from `client/index.html` (keep other JSON-LD)

---

## Conversion Quick Wins

### 4. Social Proof Counters

**What:** Animated counter bar on homepage showing real stats.

**Implementation:**

- New file: `client/src/components/SocialProofBar.tsx`
- Place between Tours and KosherInfo sections in `Home.tsx`
- 4 counters: Tours Completed, 5-Star Reviews, Unique Routes, Kosher Certified (100%)
- New tRPC procedure: `stats.public` (public, no auth) — returns:
  - `totalBookings` (count from bookings where status = confirmed or completed)
  - `totalReviews` (count from reviews where isApproved = true and rating >= 4)
  - `totalTours` (count from tours where isActive = true)
- Animate on scroll-into-view using `IntersectionObserver` + CSS counter animation
- Bilingual labels via `t()`
- Forest green background with gold counter numbers

### 5. Recently Booked Notification Popup

**What:** Toast-style popup showing recent real bookings to create urgency.

**Implementation:**

- New file: `client/src/components/RecentlyBookedPopup.tsx`
- Renders in bottom-left corner (opposite of floating action buttons)
- New tRPC procedure: `stats.recentBookings` (public) — returns last 5 confirmed bookings:
  - First name only (truncated), tour name, relative time ("2 hours ago")
  - No email/phone/last name (privacy)
- Appears after 5-second delay on homepage
- Cycles through bookings every 8 seconds
- Slide-in animation from left
- X button to dismiss; sets `sessionStorage` flag to not reappear
- Small avatar icon + booking details + tour name
- Only shows on homepage

### 6. Multi-Day Package Builder

**What:** Enhancement to `/estimate` page for combining multiple tours.

**Implementation:**

- Modify: `client/src/components/CostCalculator.tsx` (or new section below it)
- Add "Build a Multi-Day Package" accordion/section:
  - Checkboxes for each available tour (from DB or fallback)
  - Shows per-tour price and combined total
  - Applies package discount from `shared/pricing.ts` (2-day: -5%, 3-day: -10%, 5-day: -15%)
  - Shows "You save X%" badge when discount applies
  - Group size controls (shared with single-tour estimator)
- WhatsApp CTA button with pre-filled message listing selected tours + total estimate
- Bilingual UI

---

## New tRPC Procedures

| Procedure              | Type  | Auth   | Returns                                           |
| ---------------------- | ----- | ------ | ------------------------------------------------- |
| `stats.public`         | query | public | `{ totalBookings, totalReviews, totalTours }`     |
| `stats.recentBookings` | query | public | `Array<{ firstName, tourName, timeAgo }>` (max 5) |

## New Files

| File                                            | Purpose                                |
| ----------------------------------------------- | -------------------------------------- |
| `server/routes/sitemap.ts`                      | Dynamic sitemap generation             |
| `client/src/components/Breadcrumb.tsx`          | Reusable breadcrumb + JSON-LD          |
| `client/src/components/SocialProofBar.tsx`      | Animated stat counters                 |
| `client/src/components/RecentlyBookedPopup.tsx` | Recent booking notification            |
| `client/src/components/FaqJsonLd.tsx`           | FAQ structured data from single source |

## Modified Files

| File                                       | Change                                                   |
| ------------------------------------------ | -------------------------------------------------------- |
| `server/routers.ts`                        | Add `stats.public` and `stats.recentBookings` procedures |
| `server/db.ts`                             | Add stat query helpers                                   |
| `client/src/pages/Home.tsx`                | Add SocialProofBar, RecentlyBookedPopup, FaqJsonLd       |
| `client/src/pages/TourDetail.tsx`          | Add Breadcrumb                                           |
| `client/src/pages/BlogPost.tsx`            | Add Breadcrumb                                           |
| `client/src/pages/Pricing.tsx`             | Add Breadcrumb                                           |
| `client/src/pages/Gallery.tsx`             | Add Breadcrumb                                           |
| `client/src/pages/Reviews.tsx`             | Add Breadcrumb                                           |
| `client/src/pages/Estimate.tsx`            | Add Breadcrumb + multi-day package section               |
| `client/src/pages/BookingForm.tsx`         | Add Breadcrumb                                           |
| `client/src/components/FAQ.tsx`            | Export faqData                                           |
| `client/src/components/CostCalculator.tsx` | Add multi-day package builder                            |
| `client/index.html`                        | Remove FAQ JSON-LD block                                 |
| `client/public/sitemap.xml`                | Delete (replaced by dynamic route)                       |
