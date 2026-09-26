# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

WIRO 4x4 (https://www.wiro4x4indochina.com): private off-road tours from Chiang Mai for Israeli / kosher-observant travelers. A bilingual (English / Hebrew with RTL) booking site plus an admin back office (bookings, CRM, accounting, inventory, gallery, blog, reviews) and the Levi customer chat assistant. The conversion goal is a WhatsApp conversation or a booking inquiry.

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
pnpm eval:levi           # evaluate Levi chat prompts
pnpm n8n:validate        # also n8n:doctor / readiness / smoke, for workflows/
```

The Husky pre-commit hook runs `lint-staged` (eslint --fix + prettier) and then `tsc --noEmit` on the whole project, so a type error anywhere blocks commits. CI (`.github/workflows/ci.yml`) runs tsc, lint, `drizzle-kit push --force`, tests and build, then a separate Playwright E2E job.

Tests that need MySQL use the `itWithDb` helper from `server/test-helpers.ts`, which skips them when `DATABASE_URL` is unset, so a local run without a database passes with skips.

## Architecture

**Stack:** React 19 + Wouter + Tailwind 4 (client) · Express 4 + tRPC 11 (server) · Drizzle ORM on MySQL/TiDB (`drizzle/schema.ts`, ~30 tables) · pnpm. Path aliases: `@/` → `client/src`, `@shared/` → `shared`.

**One Express app for every entrypoint.** `server/_core/app.ts` `createApp()` owns middleware order: production security headers → body parsers → SEO middleware (production only) → plain Express routes (auth, RSS, sitemap, WhatsApp webhook, n8n, agent API, Levi) → tRPC at `/api/trpc`. `server/_core/index.ts` (dev/local) and `server/vercel-entry.ts` (serverless) both call it. `_core/` is project code despite the name and is edited regularly.

**tRPC composition.** `server/routers.ts` is a thin aggregator. Each domain router lives in `server/routes/<domain>.ts`, and shared procedure builders, the rate-limit guard and the admin logger live in `server/routes/_helpers.ts`. Some files in `server/routes/` are plain Express routes, not tRPC (`levi.ts`, `n8n.ts`, `rss.ts`, `sitemap.ts`, `whatsapp.ts`, `authRoutes.ts`, `agentApi.ts`). Zod input schemas live in `shared/schemas.ts`.

**Data access.** `server/db/` is split by domain (`bookings.ts`, `tours.ts`, …). `server/db/index.ts` re-exports everything, so import from `server/db`. `getDb()` in `db/connection.ts` returns null without `DATABASE_URL`, and callers are expected to degrade.

**Tour data has a DB-independent fallback.** `shared/wiroTourCatalog.ts` is the single hand-written source of tour facts and prices, used by the package UI, the SEO content and Levi. Database rows override it when the DB is healthy. Never add a second hard-coded price list. Tour card images are forced from `TOUR_IMAGE_MAP` (`client/src/components/Tours.tsx`), overriding DB `imageUrl`.

**SEO is server-rendered for crawlers.** In production, `server/seoMiddleware.ts` injects per-route meta and JSON-LD into the SPA shell (`STATIC_ROUTES`, plus `server/seoPageContent.ts`). Client pages also call `usePageMeta()`. A new public page needs its `<Route>` in `client/src/App.tsx`, `usePageMeta` in the page, an entry in `STATIC_ROUTES`, and an entry in `STATIC_PAGES` in `server/routes/sitemap.ts`.

**Levi (customer chat).** `client/src/components/ChatWidget.tsx` posts to `server/routes/levi.ts`, which forwards the conversation to an external Levi service (`LEVI_CHAT_URL` / `LEVI_API_KEY`), builds booking state (`server/leviBooking.ts`) and prompts (`server/leviKnowledge.ts`), and sends signed owner alerts (`LEVI_WEBHOOK_URL` / `LEVI_WEBHOOK_SECRET`). Per PRODUCT.md, Levi must reduce friction before WhatsApp, not compete with it. `eliRelay.ts` / `eliChatApi.ts` are older chat paths and are not mounted in `createApp`.

**Background work.** `routers.ts` starts the Stripe session checker and the reminder scheduler, but not under `NODE_ENV=test` or on Vercel. On Vercel, scheduled and automated work runs through n8n (`workflows/`, `server/n8nAutomation.ts`, `server/routes/n8n.ts`, `docker-compose.n8n.yml`).

**Bilingual UI.** `useLanguage()` from `client/src/contexts/LanguageContext.tsx` provides `t("English", "עברית")`. Hebrew sets `dir="rtl"` on `<html>`. Every user-facing string needs both languages, and layouts must not break mirrored.

**Styling.** Use the semantic tokens and CSS variables in `client/src/index.css` (Tailwind theme mappings) rather than hard-coded hex values.

## Conventions that bite

- **Lazy clients.** Resend and Anthropic clients are created inside a getter on first use, never at module load. The getter returns `null` and logs a warning when the key is missing, so the app and tests run without those keys.
- **Email senders.** `shared/const.ts` has `COMPANY_EMAIL` (public Gmail contact) and `COMPANY_SENDER_EMAIL` (the Resend-verified `@wiro4x4indochina.com` domain). Every outbound email must send from the verified domain: `bookings@` for booking, confirmation and payment mail; `updates@` for newsletters and abandoned-booking recovery.
- **WhatsApp number** lives only in `shared/const.ts` (`COMPANY_WHATSAPP`, `COMPANY_WHATSAPP_URL`); `client/src/const.ts` re-exports it.
- **Environment variables:** `.env.example` is the reference list. Production values are set in the Vercel dashboard.
- **Images:** `pnpm images:optimize` (also run by `build:frontend`) writes `-sm/-md/-lg` WebP/JPG variants to `client/public/images/optimized/`. Originals are in `assets-source/images/`, whose filenames do not reliably match what the photo shows.

## Deployment

Vercel auto-deploys `main`. `pnpm build:frontend` optimizes images, runs `vite build` into `dist/public`, then esbuild-bundles `server/vercel-entry.ts` into `api/index.js` with the SPA `index.html` embedded as text. `vercel.json` rewrites every non-static path (including `/`) to that one function, so static files in `dist/public` are served first and everything else goes through Express. The apex domain redirects to `www`.

## Other folders

- `marketing/`: standalone campaign pages, not part of the Vite build. `marketing/indochina-scroll/` is a vanilla HTML/CSS/JS scroll-parallax page built only from real WIRO photos; `scripts/prep_layers.py` builds its layers and `scripts/cutout.swift` does macOS Vision subject cutouts.
- `docs/`, `brand/`, `ops/`: plans, brand guides and runbooks.
