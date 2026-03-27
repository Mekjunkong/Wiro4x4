# WIRO 4x4 Website Enhancements TODO

> Last audited: 2026-03-23

## Phase 1: Upgrade to Full-Stack ✅ COMPLETE

- [x] Add web-db-user feature (database + backend + auth)
- [x] Add Stripe payment integration
- [x] Set up database schema for tours, bookings, blog posts (Drizzle ORM + MySQL/TiDB)
- [x] Configure environment variables

## Phase 2: Dynamic Pricing & Packages ✅ COMPLETE

- [x] Create pricing page component (`pages/Pricing.tsx`)
- [x] Design pricing cards for each tour
- [x] Add group size pricing calculator (`CostCalculator.tsx`)
- [x] Implement multi-day package discounts (`pages/PackageDetail.tsx`)
- [x] Show what's included/excluded clearly
- [ ] Add seasonal pricing variations
- [x] Create pricing API endpoints (tRPC)

## Phase 3: Interactive Booking System ✅ COMPLETE

- [x] Create booking form with tour selection (`pages/BookingForm.tsx`, 7-rule validation)
- [x] Add date picker with availability checking
- [x] Implement group size selector with children support
- [x] Add kosher meal preference options
- [x] Create pick-up location selector (airport/hotel)
- [x] Build booking summary page
- [x] Integrate Stripe payment (SDK installed, basic flow)
- [x] Create booking confirmation page (`pages/BookingSuccess.tsx`)
- [x] Set up automated email confirmations (Resend, verified domain)
- [x] Add WhatsApp notification integration
- [x] Create booking management dashboard (admin, 9 tabs)
- [x] Add booking history for users

## Phase 4: Blog & Travel Resources ✅ COMPLETE

- [x] Design blog listing page (`pages/Blog.tsx`, search + category filters)
- [x] Create blog post detail page (`pages/BlogPost.tsx`)
- [x] Build blog post editor (admin, `BlogTab.tsx` + `MarkdownEditor.tsx`)
- [x] AI article generation (`GenerateArticleDialog.tsx`, Claude API)
- [x] Add blog categories and tags
- [x] Implement blog search functionality
- [x] Add social sharing buttons (`ShareButtons.tsx` — WhatsApp, Facebook, X, copy link)
- [x] Newsletter send from blog editor

## Phase 5: Performance Optimization & SEO ✅ MOSTLY COMPLETE

- [x] Add proper meta tags for all pages (`usePageMeta.ts` — title, OG tags, canonical)
- [x] Create sitemap.xml (`server/routes/sitemap.ts` — dynamic, pulls tours/blog/packages)
- [x] Add robots.txt (`client/public/robots.txt` — Allow/Disallow rules)
- [x] Implement schema markup for tours (JSON-LD in `usePageMeta.ts`, tour detail, blog posts)
- [x] Add Open Graph tags for social sharing
- [x] Add service worker for PWA (`client/public/sw.js` — caching + offline)
- [x] Configure caching strategies (service worker + Vercel headers)
- [x] Add analytics tracking (Plausible via `lib/analytics.ts` with funnel events)
- [x] Create mobile app manifest (`client/public/manifest.json`)
- [ ] Implement advanced image optimization (WebP/AVIF with `<picture>` fallbacks)
- [ ] Implement lazy route loading (`React.lazy()` for route-level code splitting)
- [ ] Optimize bundle size (analyze with `ANALYZE=true vite build`)

## Phase 6: Additional Features — PARTIALLY COMPLETE

- [x] Add FAQ section (`pages/FAQ.tsx` + `components/FAQ.tsx` + `TourFAQ.tsx`)
- [x] Create contact form (`pages/Contact.tsx`)
- [x] Add newsletter signup (`NewsletterSignup.tsx` + `NewsletterPopup.tsx` with tRPC)
- [ ] Implement tour comparison feature (side-by-side compare 2-3 tours)
- [ ] Add wishlist / save tours feature (requires auth, which exists)

---

## Remaining Work (prioritized)

### High Impact

- [ ] **Tour comparison** — let users compare tours side-by-side (price, duration, inclusions)
- [ ] **Wishlist** — save favorite tours (uses existing JWT auth)
- [ ] **Seasonal pricing** — date-based price adjustments

### Performance

- [ ] **Lazy route loading** — `React.lazy()` + `Suspense` for each page
- [ ] **Image optimization** — serve WebP/AVIF via `<picture>` element
- [ ] **Bundle analysis** — run `ANALYZE=true vite build` and reduce large chunks
