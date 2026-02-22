# Conversion Funnel Optimization + Analytics — Design Document

**Date:** 2026-02-22
**Goal:** Increase visitor-to-booking conversion rate across the full funnel
**Approach:** Blend of conversion optimization (Approach 1) + basic analytics (Approach 2)

---

## Problem

Visitors arrive at the site but don't complete bookings. The drop-off point is unknown — no analytics exist to pinpoint it. The site needs both persuasion improvements and measurement to track their impact.

## Design

### 1. Homepage Conversion Improvements

**Trust bar above the fold** — Compact strip showing: review count + average rating, total tours completed, "Kosher Certified" badge, "Free Cancellation" guarantee. Provides instant credibility.

**Sticky "Book Now" CTA bar** — Appears after scrolling past the hero. Slim bar at top (desktop) or bottom (mobile) with primary CTA. Always one tap away.

**Tour card urgency signals** — "Most Popular" badge on top-booked tour. "Limited Availability" tag for tours with fewer upcoming slots.

**Scroll-depth WhatsApp prompt** — If visitor scrolls 70%+ without clicking, show gentle WhatsApp popup: "Have questions? Chat with us!" Leverages existing WhatsApp integration.

### 2. Tour Page Persuasion

**Social proof block** — Below tour hero: "X people booked this tour this month" (from stats API), 2-3 filtered review snippets, star rating.

**Pricing clarity panel** — Sticky sidebar (desktop) / bottom sheet (mobile):

- Base price per person
- "Starting from" with group discount hint
- "Includes:" checklist with green checkmarks
- Clear "Book This Tour" CTA

**Comparison nudge** — Bottom section: "Compare with other tours" linking to tours directory with current tour highlighted.

**Tour-specific FAQ** — Reuse existing FAQ component with per-tour questions (clothing, children suitability, weather policy).

### 3. Booking Form Optimization

**Visual progress bar** — Steps: Tour > Details > Services > Confirm. Shows completion percentage.

**Save & resume (localStorage)** — Auto-save form state. On return, show "Welcome back! Continue your booking" prompt restoring previous data.

**Live pricing summary** — Floating sidebar (desktop) / collapsible panel (mobile) updating in real-time. Uses existing `shared/pricing.ts` engine.

**Reduced friction on step 1** — Only tour + preferred dates on first step. Contact details and extras pushed to later steps.

**Trust reinforcement near submit** — Badges: "Free cancellation within 48h", "Secure booking", "Instant WhatsApp confirmation".

### 4. Abandoned Booking Recovery

**Draft storage** — If visitor provides contact info but doesn't complete, store as draft in leads table with source "abandoned_booking".

**WhatsApp follow-up** — After 1-2 hours, send: "Hi [Name], you were looking at [Tour]. Want help finishing your booking?" Only if contact info was explicitly provided.

**Email recovery** — Send follow-up with tokenized link that restores form state server-side.

**Admin visibility** — "Abandoned Bookings" section in admin dashboard showing incomplete submissions with contact info for manual follow-up.

**Privacy:** Only trigger recovery for visitors who explicitly provided contact info. No anonymous tracking.

### 5. Analytics & Funnel Tracking

**Lightweight analytics** — Integrate Plausible or Umami (privacy-friendly, no cookie banner). Provides page views, referrers, devices, geography.

**Custom funnel events:**

```
homepage_view → tour_page_view → booking_started → booking_step_2 → booking_step_3 → booking_completed
```

**UTM parameter support** — Parse UTM tags from URLs, store with bookings/leads for channel attribution.

**Admin funnel widget** — "Conversion Funnel" chart in admin dashboard using existing Recharts library. Shows step-by-step drop-off rates.

---

## Scope

### In scope

- All 5 sections above
- Desktop + mobile responsive
- Works with existing bilingual (en/he) system
- Uses existing tech stack (React, tRPC, Drizzle, Tailwind)

### Out of scope

- Stripe payment completion (separate initiative)
- Full booking redesign / Airbnb-style flow
- A/B testing framework
- Heatmap integration (Hotjar/Clarity)
- Push notifications

## Dependencies

- Existing `shared/pricing.ts` for live pricing summary
- Existing stats API for social proof data
- Existing WhatsApp integration for recovery messages
- Resend API for email recovery
- External: Plausible/Umami account or self-hosted instance
