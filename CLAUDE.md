# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

WIRO 4x4 (https://www.wiro4x4indochina.com): private off-road tours from Chiang Mai for Israeli / kosher-observant travelers. A bilingual (English / Hebrew with RTL) booking site plus an admin back office (bookings, CRM, accounting, inventory, gallery, blog, reviews). The conversion goal is a WhatsApp conversation or a booking inquiry.

Read `PRODUCT.md` (audience, voice, claims policy) and `DESIGN.md` (the "Expedition Dossier" visual system and its bans) before any UI or copy change. Key rules from them: real photos over decorative graphics; say "kosher-friendly planning" unless a certification is proven; no pure `#000` or `#fff`, no gradient text, no decorative glassmorphism; WhatsApp is the primary CTA.

## Commands

```bash
pnpm install
pnpm dev                 # Express + Vite dev server (tsx watch server/_core/index.ts)
pnpm check               # tsc --noEmit
pnpm lint                # eslint .
pnpm test                # vitest run (server/, shared/, client/src/ *.test.ts|*.spec.ts)
pnpm vitest run server/pricing.test.ts        # a single test file
pnpm vitest run -t "applies group multiplier" # tests matching a name
pnpm test:e2e            # Playwright (e2e/); starts its own `pnpm dev` on an e2e port
pnpm build               # local production build → dist/index.js (+ dist/public)
pnpm build:frontend      # what Vercel runs (see Deployment)
pnpm db:push             # drizzle-kit generate && migrate
pnpm n8n:validate        # also n8n:doctor / readiness / smoke, for workflows/
```

The Husky pre-commit hook runs `lint-staged` (eslint --fix + prettier) and then `tsc --noEmit` on the whole project, so a type error anywhere blocks commits. CI (`.github/workflows/ci.yml`) runs tsc, lint, `drizzle-kit push --force`, tests and build, then a separate Playwright E2E job.

Tests that need MySQL use the `itWithDb` helper from `server/test-helpers.ts`, which skips them when `DATABASE_URL` is unset, so a local run without a database passes with skips.

**The local `.env` `DATABASE_URL` points at the production database.** `server/_core/devWriteGuard.ts` therefore blocks every tRPC mutation when the server runs outside production/test against a non-local DB host (reads still work); `ALLOW_REMOTE_DB_WRITES=1` overrides it deliberately. Plain Express routes (WhatsApp webhook, n8n, agent API) are not covered. For browser checks and E2E runs, override it with a dead URL. Pages still render, and queries fail fast:

```bash
DATABASE_URL="mysql://offline:offline@127.0.0.1:9/offline" pnpm dev
DATABASE_URL="mysql://offline:offline@127.0.0.1:9/offline" E2E_PORT=3219 \
  npx playwright test e2e/booking-flow.spec.ts --project=chromium --project="Mobile Chrome"
```

With the dead URL, `pnpm vitest run client/src shared` passes; many `server/` tests fail rather than skip, because `DATABASE_URL` is set, so run those in CI.

## Architecture

**Stack:** React 19 + Wouter + Tailwind 4 (client) · Express 4 + tRPC 11 (server) · Drizzle ORM on MySQL/TiDB (`drizzle/schema.ts`, ~30 tables) · pnpm. Path aliases: `@/` → `client/src`, `@shared/` → `shared`.

**One Express app for every entrypoint.** `server/_core/app.ts` `createApp()` owns middleware order: production security headers → body parsers → SEO middleware (production only) → plain Express routes (auth, RSS, sitemap, WhatsApp webhook, n8n, agent API) → tRPC at `/api/trpc`. `server/_core/index.ts` (dev/local) and `server/vercel-entry.ts` (serverless) both call it. `_core/` is project code despite the name and is edited regularly.

**tRPC composition.** `server/routers.ts` is a thin aggregator. Each domain router lives in `server/routes/<domain>.ts`, and shared procedure builders, the rate-limit guard and the admin logger live in `server/routes/_helpers.ts`. Some files in `server/routes/` are plain Express routes, not tRPC (`n8n.ts`, `rss.ts`, `sitemap.ts`, `whatsapp.ts`, `authRoutes.ts`, `agentApi.ts`). Zod input schemas live in `shared/schemas.ts`.

**Data access.** `server/db/` is split by domain (`bookings.ts`, `tours.ts`, …). `server/db/index.ts` re-exports everything, so import from `server/db`. `getDb()` in `db/connection.ts` returns null without `DATABASE_URL`, and callers are expected to degrade.

**Tour data has a DB-independent fallback.** `shared/wiroTourCatalog.ts` is the single hand-written source of tour facts and prices, used by the package UI, and the SEO content. Database rows override it when the DB is healthy. Never add a second hard-coded price list. Tour card images are forced from `TOUR_IMAGE_MAP` (`shared/wiroTourStories.ts`, re-exported by `client/src/data/wiroTours.ts`), overriding DB `imageUrl`. That module also holds each tour's editorial copy (tagline, itinerary, map pins) but never prices.

**SEO is server-rendered for crawlers.** Beyond meta tags, `server/seoPageContent.ts` + `server/seoPageBody.ts` put real page text into `#root` (tour facts and itinerary, blog articles, FAQ, landing-page copy) for crawlers that never run JavaScript; React replaces it on mount. That text must come from the same shared modules the React pages render (`shared/wiroTourStories.ts`, `shared/blog/`, `shared/faqItems.ts`, `shared/commercialLandingContent.ts`), never a copy, and prices only where the server has loaded the live DB row (tour detail), not on `/tours`. Titles go through `withBrandSuffix` (`shared/pageTitle.ts`) on both server and client. In production, `server/seoMiddleware.ts` injects per-route meta and JSON-LD into the SPA shell (`STATIC_ROUTES`, plus `server/seoPageContent.ts`). Client pages also call `usePageMeta()`. A new public page needs its `<Route>` in `client/src/App.tsx`, `usePageMeta` in the page, an entry in `STATIC_ROUTES`, and an entry in `STATIC_PAGES` in `server/routes/sitemap.ts`. Any path the middleware doesn't know returns a real 404, so a client-only utility route (for example `/plan-trip`, the long multi-day planner behind the `/book` stepper) must be added to `CLIENT_ONLY_ROUTES` in `server/seoMiddleware.ts`. Those routes are served with `noindex`.

**Customer chat.** There is no live chat widget; customers are routed to WhatsApp. The Levi chat (widget, `/api/levi/message`, VPS profile) was removed in Sep 2026. `eliRelay.ts` / `eliChatApi.ts` are older chat paths and are not mounted in `createApp`.

**Background work.** `routers.ts` starts the Stripe session checker and the reminder scheduler, but not under `NODE_ENV=test` or on Vercel. On Vercel, scheduled and automated work runs through n8n (`workflows/`, `server/n8nAutomation.ts`, `server/routes/n8n.ts`, `docker-compose.n8n.yml`).

**Hebrew tour URLs.** Each tour has an English page at `/tours/:slug` and a Hebrew one at `/he/tours/:slug` (hreflang-linked, both in the sitemap). Build tour links with `tourPath(slug, language)` from `shared/tourPaths.ts`, never a hard-coded `/tours/...`. Visitors who prefer Hebrew are moved from `/tours/:slug` to the Hebrew URL, and the header language button uses `languagePairPath` to switch pages whose language is fixed by the URL.

**Bilingual UI.** `useLanguage()` from `client/src/contexts/LanguageContext.tsx` provides `t("English", "עברית")`. Hebrew sets `dir="rtl"` on `<html>`. Every user-facing string needs both languages, and layouts must not break mirrored.

**Styling: two systems.**

- The redesigned public pages (Home, Tours, tour detail, `/book`, Gallery) plus `Header` and `Footer` use plain CSS in `client/src/styles/wiro.css`, not Tailwind. Every class is `wx-` prefixed, and the page root carries `className="wx"`, which also remaps the shadcn tokens so older components nested inside match. That CSS is unlayered, so it beats Tailwind's layered utilities. For responsive visibility inside `wx` markup, use `.wx-desk` / `.wx-mob` / `.wx-sm-up`, not `lg:hidden`.
- The older pages and admin use Tailwind with the shadcn tokens in `client/src/index.css`.
- **Dark mode** is class-based: the header toggles `.dark` on `<html>` and stores it in `localStorage["wiro-theme"]`. Light is the default and system preference is ignored. Both files redefine their tokens under `.dark`.
- In `wiro.css`, `--wx-ink` is the text colour, which turns light in dark mode. Solid dark fills (active pills, dark panels, summaries) must use `--wx-solid`, and translucent ivory must use `rgba(var(--wx-paper-rgb), …)`.
- Photo heroes add `data-header-dark` to their section so the header switches to light text while it sits over them.

## Conventions that bite

- **Lazy clients.** Resend and Anthropic clients are created inside a getter on first use, never at module load. The getter returns `null` and logs a warning when the key is missing, so the app and tests run without those keys.
- **Email senders.** `shared/const.ts` has `COMPANY_EMAIL` (public Gmail contact) and `COMPANY_SENDER_EMAIL` (the Resend-verified `@wiro4x4indochina.com` domain). Every outbound email must send from the verified domain: `bookings@` for booking, confirmation and payment mail; `updates@` for newsletters and abandoned-booking recovery.
- **WhatsApp number** lives only in `shared/const.ts` (`COMPANY_WHATSAPP`, `COMPANY_WHATSAPP_URL`); `client/src/const.ts` re-exports it. Links to it go through `TrackedWhatsAppLink` (or `WaCta` in the redesign) with a source code such as `HOME-HERO`; `client/src/lib/whatsappSourceScan.test.ts` fails if a raw `wa.me` link is added.
- **Claims must be checkable** (PRODUCT.md; guarded by `e2e/trust-integrity.spec.ts`). The Tripadvisor rating, review count and quoted excerpts live only in `client/src/data/tripadvisorReviews.ts`, dated by `checkedOn`, with each quote linking to its review. Re-read the listing before changing any number or quote. Never add sample reviews, invented stats or aggregate-rating JSON-LD.
- **Environment variables:** `.env.example` is the reference list. Production values are set in the Vercel dashboard.
- **Images:** `pnpm images:optimize` (also run by `build:frontend`) writes `-sm/-md/-lg` WebP/JPG variants to `client/public/images/optimized/`. Originals are in `assets-source/images/`, whose filenames do not reliably match what the photo shows.

## Deployment

Vercel auto-deploys `main`. `pnpm build:frontend` optimizes images, runs `vite build` into `dist/public`, then esbuild-bundles `server/vercel-entry.ts` into `api/index.js` with the SPA `index.html` embedded as text. `vercel.json` rewrites every non-static path (including `/`) to that one function, so static files in `dist/public` are served first and everything else goes through Express. The apex domain redirects to `www`.

## Other folders

- `marketing/`: standalone campaign pages, not part of the Vite build. `marketing/indochina-scroll/` is a vanilla HTML/CSS/JS scroll-parallax page built only from real WIRO photos; `scripts/prep_layers.py` builds its layers and `scripts/cutout.swift` does macOS Vision subject cutouts.
- `docs/`, `brand/`, `ops/`: plans, brand guides and runbooks.
