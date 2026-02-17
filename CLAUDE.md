# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Wiro 4x4 tour booking website.

## Project Overview

**Wiro 4x4** is a kosher off-road tour booking website for Chiang Mai, Thailand, built on the **Manus platform**. The site features bilingual support (English/Hebrew), booking system, admin panel with 9 tabs, photo gallery, customer reviews, WhatsApp integration, individual tour detail pages, homepage inquiry form, destination showcase, and parallax effects.

**Tech Stack:**

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Wouter (routing)
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM
- **Database:** MySQL/TiDB (provided by Manus platform)
- **Auth:** Manus OAuth (built-in)
- **AI:** Anthropic Claude API via `@anthropic-ai/sdk` (lazy init — no crash without API key)
- **Email:** Resend (lazy initialization — no crash without API key)
- **Testing:** Vitest (117 tests across 21 files)
- **Hosting:** Manus platform (with custom domain support)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (frontend + backend)
pnpm dev

# Run tests (117 tests: 96 pass locally, 21 DB-dependent skipped)
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
│   │   │   ├── WhyWiro.tsx      # Why choose us section
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
│   │   │   ├── TourDetail.tsx   # Individual tour page (/tours/:slug)
│   │   │   ├── BookingForm.tsx  # Tour booking form (7-rule validation)
│   │   │   ├── BookingSuccess.tsx  # Success page
│   │   │   ├── AdminDashboard.tsx  # Admin panel (6 tabs, paginated)
│   │   │   ├── Pricing.tsx      # Pricing page (dynamic from DB)
│   │   │   ├── Estimate.tsx     # Trip cost estimator page (/estimate)
│   │   │   ├── Gallery.tsx      # Photo gallery with category filters
│   │   │   ├── Reviews.tsx      # Customer reviews + submission form
│   │   │   ├── Blog.tsx         # Blog listing (with search + category filters)
│   │   │   └── BlogPost.tsx     # Individual blog post (with share buttons)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts       # Authentication hook
│   │   │   └── usePageMeta.ts   # Per-page title + meta description
│   │   ├── lib/
│   │   │   └── trpc.ts          # tRPC client setup
│   │   ├── const.ts             # Constants (WhatsApp, logos, etc.)
│   │   ├── App.tsx              # Main app with routing
│   │   ├── main.tsx             # Entry point with providers
│   │   └── index.css            # Global styles + Tailwind
│   ├── public/
│   │   ├── robots.txt           # SEO crawl rules
│   │   └── sitemap.xml          # SEO sitemap
│   └── index.html               # HTML template (OG tags, JSON-LD, RSS autodiscovery)
├── server/                      # Backend Node.js application
│   ├── _core/                   # Manus framework core (DO NOT EDIT)
│   ├── routers.ts               # tRPC API routes — imports shared schemas
│   ├── db.ts                    # Database query helpers (50+ functions)
│   ├── storage.ts               # S3 file storage helpers
│   ├── emailService.ts          # Manus notification emails
│   ├── resendEmailService.ts    # Resend email (lazy init)
│   ├── customerEmailService.ts  # Customer confirmation + ICS calendar
│   ├── rateLimit.ts             # In-memory rate limiter
│   ├── aiContentGenerator.ts    # Claude API blog draft generation (lazy init)
│   ├── newsletterEmailService.ts # Resend newsletter emails (bilingual, lazy init)
│   ├── stripe.ts                # Stripe placeholder (TODO — deferred)
│   ├── routes/
│   │   ├── blog.ts              # Blog CRUD + generateDraft + uploadImage
│   │   ├── newsletter.ts        # subscribe/unsubscribe/list/send procedures
│   │   └── rss.ts               # RSS 2.0 feed at /api/rss
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
│       ├── ci.yml               # CI checks
│       └── deploy-manus.yml     # Auto-deploy to Manus on push to main
├── shared/                      # Shared types between frontend/backend
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── schemas.ts               # Shared Zod validation schemas (single source of truth)
│   └── pricing.ts               # Pure pricing calculation functions (used by client + server)
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
- RTL removed (caused layout issues — English layout used for both)

### 2. Booking System

- **Frontend:** `client/src/pages/BookingForm.tsx` (7-rule validation, inline errors, toast)
- **Backend:** `server/routers.ts` → `booking.create` (rate limited)
- **Database:** `drizzle/schema.ts` → `bookings` table
- **Flow:** Form → tRPC mutation → DB save → Email notifications → WhatsApp redirect
- **Emails:** 3-layer system (Manus notification + Resend email + Customer confirmation with ICS)

### 3. Admin Panel (6 tabs)

- **URL:** `/admin` (requires authentication)
- **Tabs:** Bookings, Calendar, Agents, Leads, Financial, Tours, Gallery, Blog, Reviews
- **File:** `client/src/pages/AdminDashboard.tsx`
- **All tabs are paginated** (20 items per page with Previous/Next navigation)
- **CRUD operations** for all entities with toast notifications

### 4. Photo Gallery

- **Public:** `/gallery` — masonry grid with category filters
- **Admin:** Upload + manage photos via Gallery tab
- **Storage:** S3 via `storagePut()` in `server/storage.ts`
- **Categories:** tours, vehicles, destinations, activities, food, accommodation, other

### 5. Customer Reviews

- **Public:** `/reviews` — submit reviews + view approved ones
- **Admin:** Approve/reject reviews, add admin responses
- **Moderation:** Reviews start as pending, require admin approval

### 6. Dynamic Tours & Tour Detail Pages

- `client/src/components/Tours.tsx` fetches from `trpc.tour.list` — cards link to `/tours/:slug`
- `client/src/pages/TourDetail.tsx` — individual tour pages with hero, description, included items, itinerary, booking CTA
- Hardcoded fallback tours if DB returns empty (6 tours with matching slug keys)
- Admin can create/edit/delete tours, manage slug/itinerary/includedItems via Tours tab

### 10. Trip Cost Estimator

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

### 11. Homepage Inquiry Form

- `client/src/components/QuickInquiryForm.tsx` — "Get a Free Quote" section
- Fields: Name, Email, Phone, Travel Dates, Group Size, Interest type
- Submits to existing `trpc.lead.create` API (no backend changes needed)
- Shows success state with WhatsApp link after submission

### 12. Destination Showcase

- `client/src/components/DestinationShowcase.tsx` — "Explore Northern Thailand" section
- 6 destination cards (Sticky Waterfalls, Doi Inthanon, Jungle, Rice Terraces, Elephants, Hill Tribes)
- Each card links to the matching tour detail page via slug
- Static data with existing images from `/images/` folder

### 13. Blog Content Pipeline

- **Pages:** `/blog` (listing with search + category filters) and `/blog/:slug` (individual posts with share buttons)
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

### 7. Rate Limiting

- **File:** `server/rateLimit.ts` — in-memory sliding window
- `booking.create`: 10 requests/minute per IP
- `lead.create`: 10 requests/minute per IP
- `review.create`: 5 requests/minute per IP

### 8. SEO

- `robots.txt` + `sitemap.xml` in `client/public/`
- JSON-LD structured data (TourOperator, LocalBusiness) in `index.html`
- OG tags, Twitter cards, canonical/hreflang/geo meta tags
- Per-page meta via `usePageMeta()` hook

### 9. Stripe Payments (Deferred)

- Schema ready: `payments` table with Stripe fields
- Placeholder: `server/stripe.ts` with typed functions + TODO comments
- Read-only procedures: `payment.listByBooking`, `payment.listAll`, `payment.stats`
- **Not yet active** — waiting for Stripe credentials

## Testing

**Framework:** Vitest | **117 total tests** | **21 test files**

```bash
pnpm test          # Run all tests
npx vitest run     # Same thing
```

### Test Files

| File                         | Tests | Covers                                             |
| ---------------------------- | ----- | -------------------------------------------------- |
| `validation.test.ts`         | 12    | All 6 Zod schemas from `shared/schemas.ts`         |
| `emailService.test.ts`       | 6     | Manus notification emails (mocked)                 |
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
- **Mocks:** `emailService.test.ts` mocks `notifyOwner`; Resend uses lazy init

### Shared Validation Schemas

All Zod schemas live in `shared/schemas.ts` (single source of truth):

- `bookingInputSchema`, `agentInputSchema`, `leadInputSchema`
- `financialRecordInputSchema`, `tourInputSchema`, `reviewInputSchema`
- `paginationInput`

Both `server/routers.ts` and test files import from `shared/schemas.ts`.

## Important Files to Edit

### Frequently Modified:

- `server/routers.ts` - API endpoints (imports schemas from `shared/schemas.ts`)
- `server/db.ts` - Database query helpers (50+ functions)
- `drizzle/schema.ts` - Database tables (11 tables)
- `client/src/pages/AdminDashboard.tsx` - Admin panel (6 tabs)
- `client/src/pages/BookingForm.tsx` - Booking form
- `client/src/components/Tours.tsx` - Tour offerings
- `client/src/pages/Home.tsx` - Landing page content
- `client/src/const.ts` - Constants (WhatsApp, logos)
- `shared/schemas.ts` - Shared Zod validation schemas
- `shared/pricing.ts` - Pure pricing calculation functions

### DO NOT EDIT:

- `server/_core/*` - Manus framework internals
- `client/src/_core/*` - Manus framework internals
- `drizzle/migrations/*` - Auto-generated
- `node_modules/*` - Dependencies

## Manus Platform Features

### Built-in Services (No Setup Required):

1. **Database:** MySQL/TiDB automatically provisioned
2. **Authentication:** OAuth with user management
3. **File Storage:** S3-compatible storage via `storagePut()`
4. **Email:** Resend integration (requires domain verification)
5. **LLM:** OpenAI API via `invokeLLM()`
6. **Image Generation:** via `generateImage()`
7. **Voice Transcription:** via `transcribeAudio()`
8. **Maps:** Google Maps proxy via `makeRequest()`
9. **Notifications:** Owner alerts via `notifyOwner()`

### Environment Variables (Auto-injected):

- `DATABASE_URL` - MySQL connection
- `JWT_SECRET` - Session signing
- `VITE_APP_ID` - OAuth app ID
- `OAUTH_SERVER_URL` - OAuth backend
- `VITE_OAUTH_PORTAL_URL` - Login portal
- `BUILT_IN_FORGE_API_KEY` - Manus API key
- `RESEND_API_KEY` - Email service + newsletter (lazy — no crash if missing)
- `ANTHROPIC_API_KEY` - AI blog generation via Claude (lazy — no crash if missing)
- `SITE_URL` - Site URL for newsletter links (defaults to `https://wiro4x4.com`)
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
2. Add route in `client/src/App.tsx`:

```typescript
<Route path="/new-page" component={NewPage} />
```

3. Add to `client/public/sitemap.xml`

### Change Colors:

Edit CSS variables in `client/src/index.css`:

```css
:root {
  --primary: 142 76% 36%; /* Forest green */
  --secondary: 43 74% 66%; /* Gold */
}
```

## Deployment

### Auto-Deploy via GitHub Actions (Primary)

Pushing to `main` automatically deploys to Manus via `.github/workflows/deploy-manus.yml`:

```bash
git push origin main  # Triggers auto-deploy to Manus
```

- **Trigger:** Push to `main` branch
- **Ignores:** `.md` files, `.claude/`, `.agents/`, `.cursor/`, `blogs/` directories
- **Secret:** `WIRO` (Manus API key, configured in GitHub repo settings)
- **What happens:** GitHub Actions calls Manus API → Manus pulls latest code → runs `pnpm install && pnpm build` → deploys

### Manual Manus Deployment (Alternative)

1. Tell Manus agent: "Save checkpoint"
2. Click "Publish" button in Manus UI
3. Site live at `wiro4x4.manus.space`
4. Add custom domain in Settings → Domains

### Standalone Deployment

1. Build: `pnpm build`
2. Deploy `dist/` folder
3. Set environment variables manually
4. Configure database connection
5. Set up OAuth redirect URLs

## Troubleshooting

### Build Errors:

```bash
pnpm install  # Reinstall dependencies
pnpm db:push  # Sync database schema
```

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

- This is a **Manus platform project** - some features are platform-specific
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
- **Newsletter emails** send from `updates@wiro4x4.com` — requires Resend domain verification

## Quick Reference

| Task              | Command/File                                               |
| ----------------- | ---------------------------------------------------------- |
| Start dev server  | `pnpm dev`                                                 |
| Run tests         | `pnpm test`                                                |
| Type check        | `npx tsc --noEmit`                                         |
| Update database   | `pnpm db:push`                                             |
| Add API endpoint  | `shared/schemas.ts` + `server/db.ts` + `server/routers.ts` |
| Add page          | Create in `client/src/pages/` + add route in `App.tsx`     |
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

---

**Last Updated:** 2026-02-17
**Version:** 2.4
**Platform:** Manus
**Test Coverage:** 117 tests (21 files) — 96 pass locally, 21 DB-dependent skipped
