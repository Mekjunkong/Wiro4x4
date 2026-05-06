# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Wiro 4x4 tour booking website.

## Project Overview

**Wiro 4x4** is a kosher off-road tour booking website for Chiang Mai, Thailand, deployed on **Vercel**. This is the **MVP release** — a fully functional bilingual (English/Hebrew with RTL support) tour booking site with SEO-optimized landing pages, blog content pipeline, admin panel, photo gallery, customer reviews, WhatsApp integration, individual tour detail pages, trip cost estimator, and destination showcase.

**Live Site:** https://www.wiro4x4indochina.com

**Tech Stack:**

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Wouter (routing)
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM
- **Database:** MySQL/TiDB
- **Auth:** Session-based authentication
- **AI:** Anthropic Claude API via `@anthropic-ai/sdk` (lazy init — no crash without API key)
- **Email:** Resend (lazy init, verified domain: `wiro4x4indochina.com`)
- **Testing:** Vitest (237 tests across 44 files)
- **Hosting:** Vercel (auto-deploy on push to `main`)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (frontend + backend)
pnpm dev

# Run tests (237 tests: 237 pass locally, 36 DB-dependent skipped)
pnpm test

# Type check
npx tsc --noEmit

# Database operations
pnpm db:push          # Push schema changes to database

# Build for production
pnpm build

# Format code
pnpm format
```

## Project Structure

```
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.tsx       # Navigation with language switcher
│   │   │   ├── Hero.tsx         # Hero banner with parallax effect
│   │   │   ├── Tours.tsx        # Tour cards (link to /tours/:slug, fallback)
│   │   │   ├── QuickInquiryForm.tsx  # Homepage "Get a Quote" lead form
│   │   │   ├── DestinationShowcase.tsx # Northern Thailand destination cards
│   │   │   ├── Footer.tsx       # Footer with contact info
│   │   │   ├── TrustAndKosher.tsx # "Why WIRO 4x4?" section (Wiro guide photo + trust points + kosher)
│   │   │   ├── Testimonials.tsx # Customer testimonials
│   │   │   ├── CommunityConnection.tsx
│   │   │   ├── KosherInfo.tsx   # Kosher information
│   │   │   ├── FloatingActionButtons.tsx  # WhatsApp + Book Now buttons
│   │   │   ├── CostCalculator.tsx   # Interactive trip cost estimator
│   │   │   ├── DashboardLayout.tsx  # Admin layout wrapper
│   │   │   ├── admin/
│   │   │   │   ├── BlogTab.tsx      # Blog management (editor, AI generate, send newsletter)
│   │   │   │   ├── MarkdownEditor.tsx    # Split-pane markdown editor with toolbar
│   │   │   │   └── GenerateArticleDialog.tsx  # AI article generation dialog
│   │   │   └── blog/
│   │   │       ├── ShareButtons.tsx  # Social share (WhatsApp, Facebook, X, copy link)
│   │   │       ├── MarkdownRenderer.tsx  # Markdown → HTML renderer
│   │   │       └── index.ts         # Barrel exports
│   │   ├── contexts/
│   │   │   └── LanguageContext.tsx  # Bilingual state (useLanguage hook)
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx         # Landing page (hero + inquiry + tours + destinations)
│   │   │   ├── TourDetail.tsx   # Individual tour page (/tours/:slug) + enrichment data
│   │   │   ├── BookingForm.tsx  # Tour booking form (7-rule validation)
│   │   │   ├── BookingSuccess.tsx  # Success page
│   │   │   ├── AdminDashboard.tsx  # Admin panel (9 tabs, paginated)
│   │   │   ├── Pricing.tsx      # Pricing page (dynamic from DB)
│   │   │   ├── Estimate.tsx     # Trip cost estimator page (/estimate)
│   │   │   ├── Gallery.tsx      # Photo gallery with category filters + broken image hiding
│   │   │   ├── Reviews.tsx      # Customer reviews + submission form
│   │   │   ├── Blog.tsx         # Blog listing (with search + category filters)
│   │   │   ├── BlogPost.tsx     # Individual blog post (with share buttons)
│   │   │   ├── KosherTours.tsx  # SEO landing page (/kosher-tours)
│   │   │   ├── HebrewGuide.tsx  # SEO landing page (/hebrew-guide)
│   │   │   └── AccessibleTours.tsx # SEO landing page (/accessible-tours)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts       # Authentication hook
│   │   │   └── usePageMeta.ts   # Per-page SEO (title, OG tags, canonical, JSON-LD)
│   │   ├── lib/
│   │   │   └── trpc.ts          # tRPC client setup
│   │   ├── const.ts             # Constants (WhatsApp, logos, etc.)
│   │   ├── App.tsx              # Main app with routing
│   │   ├── main.tsx             # Entry point with providers
│   │   └── index.css            # Global styles + Tailwind
│   ├── public/
│   │   └── robots.txt           # SEO crawl rules (sitemap is dynamic via /sitemap.xml)
│   └── index.html               # HTML template (OG tags, JSON-LD, RSS autodiscovery)
├── server/                      # Backend Node.js application
│   ├── _core/                   # Framework core (DO NOT EDIT)
│   ├── routers.ts               # tRPC API routes — imports shared schemas
│   ├── seoMiddleware.ts         # Server-side meta tag injection for crawlers
│   ├── db.ts                    # Database query helpers (50+ functions)
│   ├── storage.ts               # S3 file storage helpers
│   ├── emailService.ts          # Notification emails
│   ├── resendEmailService.ts    # Resend email (lazy init)
│   ├── customerEmailService.ts  # Customer confirmation + ICS calendar
│   ├── rateLimit.ts             # In-memory rate limiter
│   ├── aiContentGenerator.ts    # Claude API blog draft generation (lazy init)
│   ├── newsletterEmailService.ts # Resend newsletter emails (bilingual, lazy init)
│   ├── stripe.ts                # Stripe placeholder (TODO — deferred)
│   ├── routes/
│   │   ├── blog.ts              # Blog CRUD + generateDraft + uploadImage
│   │   ├── newsletter.ts        # subscribe/unsubscribe/list/send procedures
│   │   ├── rss.ts               # RSS 2.0 feed at /api/rss
│   │   └── sitemap.ts           # Dynamic sitemap with all pages + tours + blog posts
│   ├── seed-blog-articles.ts    # Seed 10 bilingual blog articles (run with npx tsx)
│   ├── test-helpers.ts          # Shared test context + itWithDb helper
│   ├── *.test.ts                # 21 test files (see Testing section)
├── drizzle/                     # Database schema and migrations
│   ├── schema.ts                # 11 tables (users, bookings, agents, leads,
│   │                            #   financialRecords, galleryPhotos, reviews,
│   │                            #   payments, tours, blogPosts, subscribers)
│   ├── relations.ts             # Drizzle relations (FK relationships)
│   └── migrations/              # Auto-generated migrations
├── .github/
│   └── workflows/
│       └── ci.yml               # CI checks (pnpm version from packageManager)
├── shared/                      # Shared types between frontend/backend
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── schemas.ts               # Shared Zod validation schemas (single source of truth)
│   └── pricing.ts               # Pure pricing calculation functions (used by client + server)
├── docs/
│   ├── plans/                   # Design documents and implementation plans
│   ├── seo-content-calendar.md  # Blog content calendar with keyword targets
│   └── google-search-console-setup.md  # GSC setup guide
├── todo.md                      # Project task tracking
├── package.json                 # Dependencies and scripts
└── vite.config.ts               # Vite configuration
```

## Database Schema (11 tables)

| Table              | Purpose          | Key Fields                                                                                      |
| ------------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| `users`            | Auth accounts    | openId, email, role (user/admin)                                                                |
| `bookings`         | Tour bookings    | contact info, dates, services, status, assignedAgentId                                          |
| `agents`           | Tour agents      | name, email, specialties, languages, status                                                     |
| `leads`            | Sales leads      | name, source, status (new→contacted→quoted→converted→lost)                                      |
| `financialRecords` | Revenue/costs    | bookingId, type (revenue/cost/refund), amount                                                   |
| `galleryPhotos`    | Photo gallery    | title, s3Key, s3Url, category, isPublished                                                      |
| `reviews`          | Customer reviews | name, rating (1-5), text, isApproved, adminResponse                                             |
| `payments`         | Payment records  | bookingId, type (deposit/balance/full/refund), stripeSessionId                                  |
| `tours`            | Tour offerings   | name/nameHe, slug (unique), price, difficulty, isKosher, includedItems (JSON), itinerary (JSON) |
| `blogPosts`        | Blog articles    | title/titleHe, slug, content/contentHe, isPublished, publishedAt                                |
| `subscribers`      | Newsletter subs  | email, language (en/he), isActive, subscribedAt                                                 |

**Relations** (defined in `drizzle/relations.ts`):

- bookings → agents (assignedAgentId)
- bookings → financialRecords (one-to-many)
- bookings → payments (one-to-many)
- leads → bookings (convertedToBookingId)

## tRPC API Reference

All procedures are in `server/routers.ts`. Validation schemas are in `shared/schemas.ts`.

### Public Procedures (no auth required)

| Procedure                | Type     | Purpose                                          |
| ------------------------ | -------- | ------------------------------------------------ |
| `booking.create`         | mutation | Create booking (rate limited: 10/min)            |
| `lead.create`            | mutation | Capture lead (rate limited: 10/min)              |
| `review.create`          | mutation | Submit review for approval (rate limited: 5/min) |
| `review.listPublic`      | query    | Get approved reviews                             |
| `gallery.list`           | query    | Get published photos                             |
| `tour.list`              | query    | Get active tours                                 |
| `tour.getBySlug`         | query    | Get single tour by URL slug                      |
| `blog.list`              | query    | Get published blog posts                         |
| `blog.getBySlug`         | query    | Get single blog post by slug                     |
| `newsletter.subscribe`   | mutation | Subscribe to newsletter (email + language)       |
| `newsletter.unsubscribe` | mutation | Unsubscribe from newsletter                      |
| `auth.me`                | query    | Get current user                                 |

### Protected Procedures (admin auth required)

| Procedure                                                             | Type     | Purpose                     |
| --------------------------------------------------------------------- | -------- | --------------------------- |
| `booking.list` / `listPaginated`                                      | query    | List all bookings           |
| `booking.update` / `delete`                                           | mutation | Manage bookings             |
| `agent.create` / `list` / `update` / `delete`                         | CRUD     | Manage agents               |
| `lead.list` / `listPaginated` / `update` / `delete`                   | CRUD     | Manage leads                |
| `financial.create` / `listAll` / `update` / `delete` / `stats`        | CRUD     | Financial records           |
| `gallery.create` / `listAll` / `update` / `delete` / `upload`         | CRUD     | Gallery photos              |
| `review.listAll` / `listAllPaginated` / `update` / `delete` / `stats` | CRUD     | Manage reviews              |
| `tour.create` / `listAll` / `update` / `delete`                       | CRUD     | Manage tours                |
| `blog.listAll` / `listAllPaginated` / `create` / `update` / `delete`  | CRUD     | Manage blog                 |
| `blog.generateDraft`                                                  | mutation | AI blog draft (Claude API)  |
| `blog.uploadImage`                                                    | mutation | Upload blog image to S3     |
| `newsletter.list` / `send`                                            | CRUD     | Manage newsletter           |
| `payment.listByBooking` / `listAll` / `stats`                         | query    | Payment records (read-only) |

### Pagination Pattern

All `listPaginated` procedures accept `{ page: number, pageSize: number }` and return:

```typescript
{ items: T[], total: number, page: number, pageSize: number, totalPages: number }
```

## Key Features

### 1. Bilingual Support (English/Hebrew)

- `useLanguage()` hook from `contexts/LanguageContext.tsx`
- `t('English text', 'Hebrew text')` pattern in all components
- Language switcher in header (flag icons)
- **RTL support:** Hebrew sets `dir="rtl"` on `<html>` element via `AppContent` effect + `.rtl` CSS class on wrapper div. Entire page renders right-to-left for Hebrew readers.
- **Hero layout:** "WIRO 4×4" text is always right-aligned for both languages (gradient darkens right side)

### 2. Booking System

- **Frontend:** `client/src/pages/BookingForm.tsx` (7-rule validation, inline errors, toast)
- **Backend:** `server/routers.ts` → `booking.create` (rate limited)
- **Database:** `drizzle/schema.ts` → `bookings` table
- **Flow:** Form → tRPC mutation → DB save → Email notifications → WhatsApp redirect
- **Emails:** 3-layer system (notification email + Resend email + Customer confirmation with ICS)
- **Email domain:** `wiro4x4indochina.com` verified on Resend (Tokyo/ap-northeast-1). All outbound emails use this domain.

### 3. Admin Panel (9 tabs)

- **URL:** `/admin` (requires authentication)
- **Tabs:** Bookings, Calendar, Agents, Leads, Financial, Tours, Gallery, Blog, Reviews
- **File:** `client/src/pages/AdminDashboard.tsx`
- **All tabs are paginated** (20 items per page with Previous/Next navigation)
- **CRUD operations** for all entities with toast notifications

### 4. Photo Gallery

- **Public:** `/gallery` — masonry grid with category filters
- **Homepage:** `PhotoGallery.tsx` — "Adventure Highlights" carousel with DB photos + local fallback
- **Broken image handling:** `LazyImage` component tracks broken S3 URLs via `brokenIds` state; broken images are hidden from the grid and excluded from category counts
- **First image eager-loaded:** `loading="eager"` + `fetchPriority="high"` for fast first paint
- **Admin:** Upload + manage photos via Gallery tab
- **Storage:** S3 via `storagePut()` in `server/storage.ts`
- **Fallback:** 16 local photos from `/images/optimized/` shown when DB is empty or all S3 URLs are broken
- **Categories:** tours, vehicles, destinations, activities, food, accommodation, other

### 5. Customer Reviews

- **Public:** `/reviews` — submit reviews + view approved ones
- **Admin:** Approve/reject reviews, add admin responses
- **Moderation:** Reviews start as pending, require admin approval

### 6. Dynamic Tours & Tour Detail Pages

- `client/src/components/Tours.tsx` fetches from `trpc.tour.list` — cards link to `/tours/:slug`
- `client/src/pages/TourDetail.tsx` — individual tour pages with hero, description, included items, itinerary, booking CTA
- Hardcoded fallback tours if DB returns empty (6 destination-based Chiang Mai day trips)
- **Tour image override:** `TOUR_IMAGE_MAP` in `Tours.tsx` maps tour slugs to local optimized images — these ALWAYS override DB `imageUrl` to prevent images reverting to incorrect DB values
- **WebP + JPG:** Tour cards use `<picture>` with optimized WebP source + JPG fallback for fast loading
- **Section images:** "Why WIRO 4x4?" uses `wiro_with_vehicle.jpg/webp` (Wiro guide standing next to 4x4). All section images use local `/images/optimized/` photos, NOT S3 URLs
- Extended fallback type includes `itineraryData`, `highlights`, `highlightsHe` fields serialized to JSON
- Admin can create/edit/delete tours, manage slug/itinerary/includedItems via Tours tab
- **Current 6 tour slugs:** `doi-inthanon-roof-of-thailand`, `mae-kampong-hidden-village`, `maerim-sticky-waterfalls`, `doi-suthep-pui-beyond-temple`, `mae-wang-jungle-wilderness`, `samoeng-loop-mountain-circuit`

### 7. Trip Cost Estimator

- **URL:** `/estimate` — interactive calculator for customers to estimate trip costs
- **Component:** `client/src/components/CostCalculator.tsx`
- **Page:** `client/src/pages/Estimate.tsx`
- **Pricing Engine:** `shared/pricing.ts` — pure functions, no DB dependency, shared between client and server
- **Features:**
  - Tour selection from DB (with hardcoded fallback)
  - Group size controls (adults + children with individual age selectors)
  - Children pricing: under 3 free, ages 3-10 at 50% surcharge, 11+ full price
  - Date picker with automatic Shabbat (Friday night) detection
  - Service add-ons: hotels, kosher meals, attractions, Shabbat hotel
  - Group multiplier: 1-4 base, 5-6 +20%, 7+ flagged as custom quote
  - Multi-day package auto-detection (2/3/5-day packages with savings)
  - Live itemized price breakdown with deposit (30%) / balance split
  - WhatsApp CTA with pre-filled message containing estimate details
- **Linked from:** Pricing page (`/pricing`) has a CTA button to `/estimate`
- **Tests:** `server/pricing.test.ts` — 31 unit tests covering all calculation logic

### 8. Homepage Inquiry Form

- `client/src/components/QuickInquiryForm.tsx` — "Get a Free Quote" section
- Fields: Name, Email, Phone, Travel Dates, Group Size, Interest type
- Submits to existing `trpc.lead.create` API (no backend changes needed)
- Shows success state with WhatsApp link after submission

### 9. Destination Showcase

- `client/src/components/DestinationShowcase.tsx` — "Explore Northern Thailand" section
- 6 destination cards matching tour slugs (Doi Inthanon, Mae Kampong, Sticky Waterfalls, Doi Suthep, Mae Wang, Samoeng Loop)
- Each card links to the matching tour detail page via `tourSlug`
- Static bilingual data with existing images from `/images/` folder

### 10. Blog Content Pipeline

- **Pages:** `/blog` (listing with search + category filters) and `/blog/:slug` (individual posts with share buttons)
- **Fallback:** 6 hardcoded blog posts shown when DB is empty (kosher dining, travel tips, culture, off-road, Doi Inthanon, elephants)
- **Bilingual:** Each post has English + Hebrew content fields (title, excerpt, content)
- **AI Content Generation:** Admin can generate bilingual blog drafts via Claude API
  - `server/aiContentGenerator.ts` — lazy Anthropic client, system prompt with tour data
  - `GenerateArticleDialog.tsx` — 6 topic suggestions, tone/length controls
  - Calls `trpc.blog.generateDraft` → returns full bilingual draft
  - **Requires:** `ANTHROPIC_API_KEY` env var
- **Rich Markdown Editor:** `MarkdownEditor.tsx` replaces plain textareas in Blog admin
  - Split-pane (edit/split/preview modes) with live markdown rendering
  - Toolbar: bold, italic, H2, H3, link, lists, blockquote, code
  - Image upload via S3 (`storagePut`), auto-save to localStorage every 30s
  - RTL support for Hebrew content
- **Newsletter System:**
  - `subscribers` table (email, language, isActive)
  - Public: `newsletter.subscribe` / `newsletter.unsubscribe`
  - Admin: `newsletter.list` / `newsletter.send` (sends to all active subscribers)
  - `newsletterEmailService.ts` — Resend emails with bilingual template, cover image, unsubscribe link
  - "Send to Subscribers" button per published post in Blog admin tab
  - **Requires:** `RESEND_API_KEY` env var, verified domain in Resend
- **RSS Feed:** `/api/rss` — RSS 2.0 XML with all published posts, XML escaping, autodiscovery `<link>` in `index.html`
- **Blog Search & Filtering:** Search bar + category filter chips on `/blog` page
- **Social Share Buttons:** WhatsApp, Facebook, X, Copy Link on each blog post page
- **Blog Image Upload:** `trpc.blog.uploadImage` — base64 → S3 via `storagePut`

### 11. Rate Limiting

- **File:** `server/rateLimit.ts` — in-memory sliding window
- `booking.create`: 10 requests/minute per IP
- `lead.create`: 10 requests/minute per IP
- `review.create`: 5 requests/minute per IP

### 12. SEO & Content Strategy

- **Domain:** `https://www.wiro4x4indochina.com` (all meta tags, canonical URLs, sitemaps point here)
- **`usePageMeta()` hook** — upgraded to full SEO engine supporting:
  - Per-page title, description, OG title/description/image, Twitter cards
  - Canonical URLs, JSON-LD structured data injection per page
  - Backward compatible: `usePageMeta("title")` or `usePageMeta({ title, description, canonicalPath, jsonLd })`
- **JSON-LD schemas:** LocalBusiness + TourOperator (global), TouristTrip (per tour), FAQPage (FAQ + tour FAQ), BlogPosting (per blog post)
- **3 SEO landing pages:**
  - `/kosher-tours` — targets "kosher tours Thailand", "kosher travel Chiang Mai"
  - `/hebrew-guide` — targets Hebrew-speaking Israeli travelers
  - `/accessible-tours` — targets accessibility + family-friendly searches
- **10 seeded blog articles** — bilingual (EN/HE), 800-1200 words each, with cover images. Seed script: `server/seed-blog-articles.ts`
- **Tour detail enrichment** — "What to Bring", "Best Time to Visit", "Local Tips", "Related Tours" sections per tour via `TOUR_ENRICHMENT` data map in `TourDetail.tsx`
- **Expanded FAQ** — 14 Q&A items (up from 10) with FAQPage JSON-LD
- `robots.txt` + dynamic sitemap (includes landing pages, tours, blog posts)
- OG tags, Twitter cards, canonical/hreflang/geo meta tags in `index.html`
- **Content calendar:** `docs/seo-content-calendar.md` — 10 initial + 10 future article ideas with keyword targets
- **GSC guide:** `docs/google-search-console-setup.md`

### 13. Stripe Payments (Deferred)

- Schema ready: `payments` table with Stripe fields
- Placeholder: `server/stripe.ts` with typed functions + TODO comments
- Read-only procedures: `payment.listByBooking`, `payment.listAll`, `payment.stats`
- **Not yet active** — waiting for Stripe credentials

## Testing

**Framework:** Vitest | **237 total tests** | **44 test files**

```bash
pnpm test          # Run all tests
npx vitest run     # Same thing
```

### Test Files

| File                         | Tests | Covers                                             |
| ---------------------------- | ----- | -------------------------------------------------- |
| `validation.test.ts`         | 12    | All 6 Zod schemas from `shared/schemas.ts`         |
| `emailService.test.ts`       | 6     | Notification emails (mocked)                       |
| `booking.test.ts`            | 6     | Booking create + list + agent/lead/financial list  |
| `lead.test.ts`               | 6     | Lead create + list + status transitions            |
| `review.test.ts`             | 6     | Review create + list + approve + stats             |
| `agent.test.ts`              | 5     | Agent create + list + update + delete              |
| `financial.test.ts`          | 4     | Financial create (revenue/cost/refund) + stats     |
| `pagination.test.ts`         | 3     | Paginated query structure verification             |
| `rateLimit.test.ts`          | 3     | Under/over limit + independent key tracking        |
| `stripe.test.ts`             | 3     | Placeholder functions throw correctly              |
| `gallery.test.ts`            | 3     | Gallery create + public list + admin list          |
| `resendEmailService.test.ts` | 1     | Graceful fallback without API key                  |
| `auth.logout.test.ts`        | 1     | Cookie clearing                                    |
| `blog.test.ts`               | 5     | Blog list, getBySlug, create, listAll, uploadImage |
| `newsletter.test.ts`         | 4     | Subscribe, duplicate handling, list, unsubscribe   |
| `aiContentGenerator.test.ts` | 2     | Draft generation fields + graceful fallback        |
| `rss.test.ts`                | 3     | Empty feed, posts in feed, XML escaping            |
| `pricing.test.ts`            | 31    | Pricing calculations, group multipliers, packages  |

### Test Patterns

- **tRPC caller:** Tests use `appRouter.createCaller(ctx)` — no HTTP server needed
- **Auth contexts:** `createAuthContext()` / `createPublicContext()` in `server/test-helpers.ts`
- **DB-dependent tests:** Use `itWithDb` (auto-skips when `DATABASE_URL` not set)
- **Mocks:** `emailService.test.ts` mocks email notifications; Resend uses lazy init

### Shared Validation Schemas

All Zod schemas live in `shared/schemas.ts` (single source of truth):

- `bookingInputSchema`, `agentInputSchema`, `leadInputSchema`
- `financialRecordInputSchema`, `tourInputSchema`, `reviewInputSchema`
- `paginationInput`

Both `server/routers.ts` and test files import from `shared/schemas.ts`.

## Important Files to Edit

### Frequently Modified:

- `server/routers.ts` - API endpoints (imports schemas from `shared/schemas.ts`)
- `server/seoMiddleware.ts` - SEO meta tags for crawlers (update when adding pages)
- `server/db.ts` - Database query helpers (50+ functions)
- `drizzle/schema.ts` - Database tables (11 tables)
- `client/src/pages/AdminDashboard.tsx` - Admin panel (6 tabs)
- `client/src/pages/BookingForm.tsx` - Booking form
- `client/src/components/Tours.tsx` - Tour card data (fallback)
- `client/src/pages/TourDetail.tsx` - Tour detail page + enrichment data + TouristTrip JSON-LD
- `client/src/components/TrustAndKosher.tsx` - "Why WIRO 4x4?" section
- `client/src/components/DestinationShowcase.tsx` - Homepage destination cards
- `client/src/pages/Home.tsx` - Landing page content
- `client/src/const.ts` - Constants (WhatsApp, logos)
- `shared/schemas.ts` - Shared Zod validation schemas
- `shared/pricing.ts` - Pure pricing calculation functions

### DO NOT EDIT:

- `server/_core/*` - Framework internals
- `client/src/_core/*` - Framework internals
- `drizzle/migrations/*` - Auto-generated
- `node_modules/*` - Dependencies

## Environment Variables

Configured in Vercel dashboard (Settings → Environment Variables):

- `DATABASE_URL` - MySQL connection
- `JWT_SECRET` - Session signing (required for login/session cookies)
- `R2_ACCOUNT_ID` - Cloudflare R2 account ID
- `R2_ACCESS_KEY_ID` - Cloudflare R2 access key
- `R2_SECRET_ACCESS_KEY` - Cloudflare R2 secret key
- `R2_BUCKET_NAME` - Cloudflare R2 bucket name
- `R2_PUBLIC_URL` - Public CDN URL for uploaded assets
- `OWNER_EMAIL` - Admin notification recipient
- `VITE_APP_ID` - App ID
- `RESEND_API_KEY` - Email service + newsletter (lazy — no crash if missing)
- `ANTHROPIC_API_KEY` - AI blog generation via Claude (lazy — no crash if missing)
- `SITE_URL` - Site URL for newsletter links (defaults to `https://www.wiro4x4indochina.com`)
- `STRIPE_SECRET_KEY` - Payment processing (not yet configured)
- `VITE_APP_TITLE` - App name
- `VITE_APP_LOGO` - App logo URL

## Common Tasks

### Update WhatsApp Number:

Edit `client/src/const.ts`:

```typescript
export const WHATSAPP_NUMBER = "+66929894495";
```

### Add New Tour:

1. Admin panel → Tours tab → Create tour (or)
2. Edit `client/src/components/Tours.tsx` hardcoded fallback array

### Add New API Endpoint:

1. Add Zod schema in `shared/schemas.ts`
2. Add DB helper in `server/db.ts`
3. Add tRPC procedure in `server/routers.ts`
4. Add test in `server/*.test.ts`

### Add New Page:

1. Create `client/src/pages/NewPage.tsx`
2. Add `usePageMeta({ title, description, canonicalPath })` in the page component
3. Add route in `client/src/App.tsx`:

```typescript
<Route path="/new-page" component={NewPage} />
```

4. Add meta to `STATIC_ROUTES` in `server/seoMiddleware.ts` (for crawler SEO)
5. Add to `STATIC_PAGES` in `server/routes/sitemap.ts` (for sitemap XML)

### Seed Blog Articles:

Requires DATABASE_URL:

```bash
npx tsx server/seed-blog-articles.ts
```

Seeds 10 bilingual articles with cover images. Skips duplicates (safe to re-run).

### Change Colors:

All colors use CSS custom properties in `client/src/index.css` with Tailwind theme mappings. **Never use hardcoded hex values** — always use semantic tokens:

- `accent` — brand gold (buttons, highlights, icons)
- `accent-cta` / `accent-cta-hover` — CTA button gold
- `primary` / `primary-foreground` — dark charcoal sections
- `background` / `foreground` — page background and text
- `card` — card backgrounds (adapts to dark mode)
- `muted` / `muted-foreground` — subtle backgrounds and secondary text
- `border` — borders

```css
:root {
  --primary: #1c1c1c; /* Charcoal */
  --secondary: #d4af37; /* Gold */
  --accent-cta: #b8960f; /* CTA gold (darker for WCAG contrast) */
}
```

## Deployment

### Vercel Deployment

Deployment is **automatic** via Vercel. Pushing to `main` triggers a production deployment.

```bash
git push origin main
```

Vercel automatically builds and deploys the site at https://www.wiro4x4indochina.com.

- **Production:** Pushes to `main` → auto-deploy to production
- **Preview:** Pushes to other branches / PRs → preview deployment URL
- **Environment variables:** Configured in Vercel dashboard (Settings → Environment Variables)
- **Auth/session gate:** Set `JWT_SECRET` in both Production and Preview environments before enabling `/admin`; session cookies are signed with this secret and are only marked secure behind HTTPS / `x-forwarded-proto`
- **Storage:** Set the full R2 env set (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`) for uploads to work
- **Build command:** `pnpm build`
- **Output directory:** `dist/`
- **CI:** `.github/workflows/ci.yml` — TypeScript check, lint, tests, build (pnpm version from `packageManager` in `package.json`)

## Gotchas & Patterns

### Removing Dependencies

- When removing a package from `package.json`, also check `vite.config.ts` `manualChunks` — Vite will fail to build if a manual chunk entry module is missing

### Shared Constants

- Cookie consent: `client/src/lib/cookieConsent.ts` exports `COOKIE_CONSENT_KEY` and `COOKIE_CONSENT_EVENT` — used by CookieConsent, StickyBookBar, FloatingActionButtons, NewsletterPopup
- URL sanitization: `client/src/lib/sanitizeUrl.ts` — allowlist-based URL sanitizer used by MarkdownRenderer

### Client-Side Tests

- `vitest.config.ts` includes `client/src/**/*.test.ts` — client tests use same Vitest setup as server tests

### Animation System

- `useScrollReveal` hook (`client/src/hooks/useScrollReveal.ts`) — used in 15+ components, uses IntersectionObserver + CSS (GSAP removed)
- Hero animations use CSS `@keyframes heroReveal` in `index.css` with `animation-delay` for stagger
- Route transitions use CSS `@keyframes pageEnter` in `index.css` (framer-motion was removed)
- `@media (prefers-reduced-motion: reduce)` disables page-enter and respects `ScrollToTop`

### SEO Middleware

- `server/seoMiddleware.ts` injects route-specific `<title>`, meta description, OG tags, Twitter cards, canonical URL, and JSON-LD into the SPA HTML server-side for crawlers
- Registered in both `server/vercel-entry.ts` and `server/index.ts` — BEFORE the `_core` catch-all handler
- Static routes have hardcoded meta; dynamic routes (`/tours/:slug`, `/blog/:slug`) query the DB
- When adding new public pages, add their meta to `STATIC_ROUTES` in `seoMiddleware.ts`

### Build & Bundle

- `vite.config.ts` esbuild `pure` strips `console.log/warn/debug` in production — `console.error` is preserved
- `lucide-react` is NOT in `manualChunks` — Vite tree-shakes it into consuming chunks
- Do NOT remove `openai` from dependencies — `server/_core/llm.ts` imports it

## Troubleshooting

### Build Errors:

```bash
pnpm install  # Reinstall dependencies
pnpm db:push  # Sync database schema
```

### Deployment Issues:

- Vercel builds independently of GitHub Actions CI — CI lint failures don't block Vercel, but Vercel build failures (`vite build`) prevent deployment
- Check Vercel deployment status (not just CI) when changes aren't showing on the live site
- Pre-existing lint errors in `Login.tsx`, `Register.tsx`, `create-admin.ts`, `auth.test.ts` cause CI failure but don't affect Vercel

### Database Issues:

- Schema changes require `pnpm db:push`
- Check `drizzle/schema.ts` for table definitions
- Locally, DB is unavailable — DB-dependent tests auto-skip via `itWithDb`

### tRPC Errors:

- Check `server/routers.ts` for procedure definitions
- Validation schemas are in `shared/schemas.ts` (not duplicated in routers)
- Check browser console for error messages

### Test Failures:

- "Database not available" → Expected locally (no `DATABASE_URL`), tests use `itWithDb`
- "Missing API key" → Resend uses lazy init, should not crash
- Run `npx tsc --noEmit` to check TypeScript errors separately

### Styling Issues:

- Tailwind classes not working? Check `tailwind.config.js`
- Custom CSS in `client/src/index.css`
- Use browser DevTools to inspect elements

## Contact & Support

- **GitHub:** https://github.com/Mekjunkong/Wiro4x4
- **WhatsApp:** +66929894495
- **Email:** wiro.adventures@gmail.com, pasuthunjunkong@gmail.com

## Notes for Claude Code

- This project is deployed on **Vercel** — legacy framework internals live in `_core/` directories
- **DO NOT** modify files in `server/_core/` or `client/src/_core/`
- **ALWAYS** update `todo.md` when making changes
- **TEST** before pushing to GitHub (`pnpm test` + `npx tsc --noEmit`)
- **USE** tRPC for all API calls (not REST/fetch)
- **USE** `shared/schemas.ts` for new Zod validation (don't duplicate in routers)
- **USE** `itWithDb` in test files for DB-dependent tests
- **STORE** files in S3 using `storagePut()`, not local filesystem
- **FOLLOW** the existing code patterns and conventions
- **ASK** user before making major architectural changes
- **Resend/email services** use lazy initialization — never eagerly construct `new Resend()` at module level
- **Anthropic SDK** uses lazy initialization — never eagerly construct `new Anthropic()` at module level
- **Email sending:** Domain `wiro4x4indochina.com` is verified on Resend. All outbound emails MUST use `@wiro4x4indochina.com` as sender:
  - `bookings@wiro4x4indochina.com` — booking notifications, customer confirmations, auto-responses, payment confirmations
  - `updates@wiro4x4indochina.com` — newsletters, abandoned booking recovery
- **Two email constants** in `shared/const.ts`: `COMPANY_EMAIL` (gmail, public contact) vs `COMPANY_SENDER_EMAIL` (verified domain, Resend `from` field). New email services MUST use `COMPANY_SENDER_EMAIL` for sending.
- **Admin notification recipients:** Both `wiro.adventures@gmail.com` and `pasuthunjunkong@gmail.com` receive booking notifications

## Quick Reference

| Task              | Command/File                                               |
| ----------------- | ---------------------------------------------------------- |
| Start dev server  | `pnpm dev`                                                 |
| Run tests         | `pnpm test`                                                |
| Type check        | `npx tsc --noEmit`                                         |
| Update database   | `pnpm db:push`                                             |
| Add API endpoint  | `shared/schemas.ts` + `server/db.ts` + `server/routers.ts` |
| Add page          | `pages/` + `App.tsx` + `seoMiddleware.ts` + `sitemap.ts`   |
| Add test          | Create `server/*.test.ts` using `test-helpers.ts`          |
| Update styles     | Edit `client/src/index.css` or use Tailwind classes        |
| Change WhatsApp   | Edit `client/src/const.ts`                                 |
| View bookings     | Visit `/admin` (requires login)                            |
| Add tour          | Admin panel → Tours tab, or edit `Tours.tsx` fallback      |
| Add gallery photo | Admin panel → Gallery tab                                  |
| Manage reviews    | Admin panel → Reviews tab                                  |
| Cost estimator    | `/estimate` page, logic in `shared/pricing.ts`             |
| Generate blog     | Admin → Blog tab → "Generate Article" button               |
| Send newsletter   | Admin → Blog tab → "Send to Subscribers" on published post |
| RSS feed          | `/api/rss` — auto-generated from published posts           |
| Seed blog content | `npx tsx server/seed-blog-articles.ts`                     |
| SEO landing pages | `/kosher-tours`, `/hebrew-guide`, `/accessible-tours`      |

---

**Last Updated:** 2026-03-21
**Version:** 3.3
**Platform:** Vercel
**Test Coverage:** 237 tests (44 files) — 237 pass locally, 36 DB-dependent skipped
