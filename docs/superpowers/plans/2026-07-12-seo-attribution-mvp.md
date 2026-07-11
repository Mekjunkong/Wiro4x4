# SEO and Booking Attribution MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect high-intent English and Hebrew organic landing pages to
trackable WhatsApp inquiries, confirmed tours, completed tours, and estimated
THB value in the existing WIRO admin.

**Architecture:** Add a privacy-safe attribution module and canonical WhatsApp
source registry on the client, then persist the transferred attribution capsule
through a protected admin lead workflow. Extend the existing lead and analytics
models rather than adding a second CRM. Add crawlable English/Hebrew commercial
routes through the existing React router, SEO middleware, and sitemap.

**Tech Stack:** React 19, TypeScript, Wouter, Plausible, tRPC, Zod, Drizzle ORM,
MySQL, Express SEO middleware, Vitest, Playwright, Vite, and Vercel.

---

## Working rules

Implement every task in
`/Users/pasuthunjunkong/workspace/Wiro4x4/.worktrees/seo-attribution-mvp`.
Use test-driven development and commit after each task. Do not add GA4, Google
Tag Manager, session recording, WhatsApp Business API, or a second CRM.

Never send names, phone numbers, email addresses, message text, full referrer
URLs, or click identifiers to Plausible or the attribution capsule.

## File map

The implementation uses these boundaries:

- `client/src/lib/attribution.ts`: Capture and normalize first-touch context.
- `shared/whatsappAttribution.ts`: Environment-neutral source registry and
  capsule parser.
- `client/src/lib/whatsappAttribution.ts`: Browser attribution integration and
  WhatsApp URL builder.
- `client/src/lib/analytics.ts`: Typed Plausible events and allowed properties.
- `client/src/lib/behaviorTracking.ts`: Testable scroll milestone state.
- `client/src/hooks/useBehaviorTracking.ts`: SPA page views and browser events.
- `client/src/components/TrackedWhatsAppLink.tsx`: Shared tracked link behavior.
- `drizzle/schema.ts` and a generated migration: Additive lead persistence.
- `shared/schemas.ts`: Separate public and authenticated admin lead schemas.
- `server/routes/lead.ts`: Protected admin lead creation and outcome mutation.
- `client/src/components/admin/WhatsAppLeadForm.tsx`: Fast manual capture.
- `client/src/components/admin/LeadsTab.tsx`: Existing funnel operations.
- `server/db/analytics.ts`, `server/routes/analytics.ts`, and
  `client/src/components/admin/AnalyticsTab.tsx`: Source and outcome reporting.
- `client/src/pages/PrivateFamilyTours.tsx`: English commercial page.
- `client/src/pages/HebrewLandingPage.tsx`: Immediate route-driven Hebrew
  rendering for three landing-page variants.
- `server/seoMiddleware.ts` and `server/routes/sitemap.ts`: Crawlable metadata.
- `docs/seo-attribution-operations.md`: Search Console and Plausible runbook.

### Task 1: Build first-touch attribution and source capsules

**Files:**

- Create: `client/src/lib/attribution.ts`
- Create: `client/src/lib/attribution.test.ts`
- Create: `shared/whatsappAttribution.ts`
- Create: `shared/whatsappAttribution.test.ts`
- Create: `client/src/lib/whatsappAttribution.ts`
- Create: `client/src/lib/whatsappAttribution.test.ts`

- [ ] **Step 1: Write failing first-touch tests**

Cover first capture, preservation of an existing first touch, 90-day expiry,
safe referrer-host extraction, UTM normalization, click-ID boolean presence,
session landing path, and unavailable storage.

```ts
expect(captureFirstTouch(env, emptyStorage).utmSource).toBe("google");
expect(captureFirstTouch(laterEnv, populatedStorage).landingPath).toBe("/");
expect(captureFirstTouch(expiredEnv, populatedStorage).landingPath).toBe(
  "/kosher-tours"
);
```

- [ ] **Step 2: Run attribution tests and verify failure**

Run:

```bash
pnpm vitest run client/src/lib/attribution.test.ts
```

Expected: FAIL because `attribution.ts` does not exist.

- [ ] **Step 3: Implement normalized first-touch capture**

Define `FirstTouchAttribution`, `SessionAttribution`, a 90-day TTL, injectable
storage and clock adapters for tests, and safe no-storage fallbacks. Store only
referring host, UTM values, landing path, initial language, timestamp, and a
boolean `hasGoogleClickId`.

- [ ] **Step 4: Write failing registry and capsule tests**

Test registry uniqueness, stable source codes, page/placement/language mapping,
capsule round-trip, bounded values, malformed capsule rejection, disallowed
characters, absence of personal data, message encoding, and deterministic
channel fallback.

```ts
const parsed = parseAttributionCapsule(
  "[WIRO:v1|HOME-HERO-HE|organic|google|organic|-|%2Fhe%2Fkosher-tours-chiang-mai]"
);
expect(parsed?.sourceCode).toBe("HOME-HERO-HE");
```

- [ ] **Step 5: Implement source registry, capsule, and URL builder**

Export `WHATSAPP_SOURCES`, `buildAttributionCapsule`, and
`parseAttributionCapsule` from the shared module. Export
`buildTrackedWhatsAppUrl` from the client module. Permit only registered source
codes. Normalize every capsule value to the spec's character and length limits.
Append the capsule as the final line of the human-readable message.

- [ ] **Step 6: Run focused tests**

Run:

```bash
pnpm vitest run client/src/lib/attribution.test.ts \
  shared/whatsappAttribution.test.ts client/src/lib/whatsappAttribution.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the attribution core**

```bash
git add client/src/lib/attribution.ts client/src/lib/attribution.test.ts \
  shared/whatsappAttribution.ts shared/whatsappAttribution.test.ts \
  client/src/lib/whatsappAttribution.ts client/src/lib/whatsappAttribution.test.ts
git commit -m "feat: add privacy-safe WhatsApp attribution"
```

### Task 2: Standardize Plausible behavior events and WhatsApp links

**Files:**

- Modify: `client/src/lib/analytics.ts`
- Create: `client/src/lib/analytics.test.ts`
- Create: `client/src/lib/behaviorTracking.ts`
- Create: `client/src/lib/behaviorTracking.test.ts`
- Create: `client/src/hooks/useBehaviorTracking.ts`
- Create: `client/src/components/TrackedWhatsAppLink.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/Hero.tsx`
- Modify: `client/src/components/Header.tsx`
- Modify: `client/src/components/FloatingActionButtons.tsx`
- Modify: `client/src/components/QuickInquiryForm.tsx`
- Modify: `client/src/components/Footer.tsx`
- Modify: `client/src/pages/KosherTours.tsx`
- Modify: `client/src/pages/HebrewGuide.tsx`
- Modify: `client/src/pages/TourDetail.tsx`

- [ ] **Step 1: Write failing analytics sanitization tests**

Test the required event-name union, allowed properties, removal of unexpected
or sensitive keys, no-op behavior without Plausible, and correct dispatch with
Plausible available.

- [ ] **Step 2: Run analytics tests and verify failure**

Run:

```bash
pnpm vitest run client/src/lib/analytics.test.ts
```

Expected: FAIL for missing typed event helpers.

- [ ] **Step 3: Implement the typed event contract**

Export the event names from the spec and a `trackEvent` function that accepts
only `page`, `placement`, `language`, `tour`, `depth`, `sourceChannel`, UTM
fields, and `sourceCode`. Filter properties at runtime before calling
`window.plausible`.

- [ ] **Step 4: Write failing SPA and scroll-depth tests**

Test a pure milestone tracker for one event each at 25%, 50%, and 90%, no
duplicates, page reset, and maximum three emissions. Browser listener cleanup
and route changes are covered in the E2E smoke test in Task 9.

- [ ] **Step 5: Implement `useBehaviorTracking`**

Implement milestone state in `behaviorTracking.ts` and keep browser event
binding in the thin hook. Mount the hook once in `App.tsx`. Reset scroll
milestones on route change. Treat commercial routes as explicit configuration
rather than string guesses.

- [ ] **Step 6: Implement `TrackedWhatsAppLink`**

The component builds the URL through `buildTrackedWhatsAppUrl`, emits
`whatsapp_click` with the registered source metadata, forwards standard anchor
props, and never delays navigation when analytics fails.

- [ ] **Step 7: Migrate high-value WhatsApp entry points**

Replace locally assembled URLs in the listed homepage, commercial-page, and
tour-detail files. Do not migrate administrative reply links or social sharing
links. Preserve the human message content and add a registry entry for each
page/placement/language pair.

- [ ] **Step 8: Add behavior events at existing interactions**

Instrument pricing visibility, itinerary expansion, proof links, FAQs, inquiry
start, tour views, booking start, and booking completion. Reuse existing events
where possible and rename them to the canonical event model.

- [ ] **Step 9: Run focused checks**

Run:

```bash
pnpm vitest run client/src/lib/analytics.test.ts \
  client/src/lib/behaviorTracking.test.ts \
  client/src/lib/whatsappAttribution.test.ts
pnpm check
```

Expected: PASS.

- [ ] **Step 10: Commit behavior tracking**

```bash
git add client/src/lib client/src/hooks/useBehaviorTracking.ts \
  client/src/components/TrackedWhatsAppLink.tsx client/src/App.tsx \
  client/src/components/Hero.tsx client/src/components/Header.tsx \
  client/src/components/FloatingActionButtons.tsx \
  client/src/components/QuickInquiryForm.tsx client/src/components/Footer.tsx \
  client/src/pages/KosherTours.tsx client/src/pages/HebrewGuide.tsx \
  client/src/pages/TourDetail.tsx
git commit -m "feat: track commercial behavior and WhatsApp starts"
```

### Task 3: Extend lead persistence with additive attribution fields

**Files:**

- Modify: `drizzle/schema.ts`
- Create: `drizzle/<generated>_lead_attribution.sql`
- Modify: `shared/schemas.ts`
- Modify: `server/db/leads.ts`
- Modify: `server/routes/lead.ts`
- Modify: `server/lead.test.ts`

- [ ] **Step 1: Write failing public/admin schema tests**

Verify the public schema still requires a valid email. Verify the admin schema
requires name plus phone, accepts no email, parses a valid attribution capsule,
rejects negative THB values, and requires a loss reason when the submitted
status is `lost`.

- [ ] **Step 2: Write failing protected-route tests**

Cover unauthenticated rejection, authenticated creation without email,
attribution persistence, audit logging, completion milestone set/unset, and
lost-reason validation.

- [ ] **Step 3: Run lead tests and verify failure**

Run:

```bash
pnpm vitest run server/lead.test.ts
```

Expected: FAIL for missing admin schema and persistence fields.

- [ ] **Step 4: Add nullable and additive schema fields**

Make `leads.email` nullable. Add nullable `sourceCode`, `sourceChannel`,
`landingPage`, `language`, `utmSource`, `utmMedium`, `utmCampaign`,
`travelDate`, `groupSize`, `estimatedValueThb`, `lostReason`, and `completedAt`.
Add indexes for source code and completion reporting where the query plan needs
them.

- [ ] **Step 5: Generate and inspect the migration**

Run:

```bash
pnpm exec drizzle-kit generate
```

Expected: one additive migration. Inspect it to ensure it does not drop or
recreate the leads table and does not change public booking data.

- [ ] **Step 6: Implement separate admin validation and procedures**

Keep `leadInputSchema` unchanged. Add `adminLeadInputSchema`. Add a protected
`lead.createFromWhatsApp` mutation and extend `lead.update` for attribution,
status, loss reason, estimated THB value, and completion milestone. Parse the
capsule on the server through `shared/whatsappAttribution.ts`, not client-only
code.

- [ ] **Step 7: Run lead and migration checks**

Run:

```bash
pnpm vitest run server/lead.test.ts server/validation.test.ts
pnpm check
```

Expected: PASS and public email validation remains covered.

- [ ] **Step 8: Commit lead persistence**

```bash
git add drizzle shared/schemas.ts server/db/leads.ts server/routes/lead.ts \
  server/lead.test.ts
git commit -m "feat: persist WhatsApp lead attribution"
```

### Task 4: Add the fast manual WhatsApp lead workflow

**Files:**

- Create: `client/src/components/admin/WhatsAppLeadForm.tsx`
- Modify: `client/src/components/admin/LeadsTab.tsx`
- Modify: `client/src/lib/csvExport.ts`
- Modify: `e2e/admin-operations.spec.ts`

- [ ] **Step 1: Write the failing admin E2E scenario**

Extend `e2e/admin-operations.spec.ts` to cover required name and phone, capsule
parsing preview, manual source fallback, optional email, tour/date/group fields,
duplicate-submit prevention, THB labels, keyboard operation, and persistence
after reload.

- [ ] **Step 2: Run the focused E2E test and verify failure**

Run:

```bash
pnpm test:e2e -- e2e/admin-operations.spec.ts
```

Expected: FAIL because the WhatsApp lead action does not exist.

- [ ] **Step 3: Implement the compact inline form**

Place the action above the existing lead table. Use existing input and button
components. Show parsed source details before save and "Unknown" for absent
fields. Keep the common mobile workflow visible without nested modals.

- [ ] **Step 4: Extend lead table operations**

Display source code, channel, tour/date/group context, estimated THB value,
completion state, and loss reason with responsive disclosure. Require loss
reason before applying `lost`. Add mark-complete and undo-complete actions for
converted leads. Include new fields in CSV export.

- [ ] **Step 5: Complete the admin E2E scenario**

Create a WhatsApp lead without email, update it through contacted, quoted, and
converted, set THB value, mark completed, and confirm the values persist after
reload. Use the existing admin authentication helpers and test database.

- [ ] **Step 6: Run focused tests**

Run:

```bash
pnpm vitest run server/lead.test.ts
pnpm check
pnpm test:e2e -- e2e/admin-operations.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the admin workflow**

```bash
git add client/src/components/admin/WhatsAppLeadForm.tsx \
  client/src/components/admin/LeadsTab.tsx client/src/lib/csvExport.ts \
  e2e/admin-operations.spec.ts
git commit -m "feat: add manual WhatsApp lead workflow"
```

### Task 5: Report source, confirmation, completion, and loss outcomes

**Files:**

- Modify: `server/db/analytics.ts`
- Modify: `server/routes/analytics.ts`
- Create: `server/analytics-attribution.test.ts`
- Modify: `client/src/components/admin/AnalyticsTab.tsx`
- Create: `client/src/components/admin/AttributionAnalytics.tsx`

- [ ] **Step 1: Write failing aggregation tests**

Seed attributed and unattributed leads across statuses. Verify source counts,
confirmed and completed counts, lead-to-confirmed rate,
confirmed-to-completed rate, THB estimated value, and loss reasons. Ensure null
attribution groups under "Unknown" and estimated value is not included in
collected revenue.

- [ ] **Step 2: Run aggregation tests and verify failure**

Run:

```bash
pnpm vitest run server/analytics-attribution.test.ts
```

Expected: FAIL because attribution queries do not exist.

- [ ] **Step 3: Implement bounded analytics queries**

Add one query function per reporting concern or one well-typed grouped response
when a single SQL query is clearer. Avoid loading all leads into memory. Expose
the response from the protected analytics router.

- [ ] **Step 4: Implement the attribution dashboard section**

Add summary metrics and accessible tables or charts for sources and loss
reasons. Use "Confirmed" for converted leads, "Completed" for `completedAt`,
"Estimated confirmed value (THB)" for lead value, and keep collected revenue
separate.

- [ ] **Step 5: Run focused checks**

Run:

```bash
pnpm vitest run server/analytics-attribution.test.ts server/dashboard.test.ts
pnpm check
```

Expected: PASS.

- [ ] **Step 6: Commit attribution reporting**

```bash
git add server/db/analytics.ts server/routes/analytics.ts \
  server/analytics-attribution.test.ts \
  client/src/components/admin/AnalyticsTab.tsx \
  client/src/components/admin/AttributionAnalytics.tsx
git commit -m "feat: report organic booking attribution"
```

### Task 6: Add indexable English and Hebrew commercial routes

**Files:**

- Create: `client/src/pages/PrivateFamilyTours.tsx`
- Create: `client/src/pages/HebrewLandingPage.tsx`
- Create: `client/src/pages/commercialLandingContent.ts`
- Modify: `client/src/App.tsx`
- Modify: `client/src/contexts/LanguageContext.tsx`
- Modify: `client/src/hooks/usePageMeta.ts`
- Modify: `client/src/pages/KosherTours.tsx`
- Modify: `client/src/pages/HebrewGuide.tsx`
- Modify: `e2e/language.spec.ts`
- Modify: `e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing route-language tests**

Verify each `/he/` route renders Hebrew on first paint regardless of stored
preference, sets `lang="he"` and `dir="rtl"`, and switches back correctly after
navigation to an English route. Test unique H1, title, description, canonical,
and reciprocal alternates.

- [ ] **Step 2: Run language tests and verify failure**

Run:

```bash
pnpm test:e2e -- e2e/language.spec.ts
```

Expected: FAIL because the Hebrew routes do not exist.

- [ ] **Step 3: Make route language explicit**

Add a route-language boundary that sets Hebrew synchronously for Hebrew route
components and restores the correct language on navigation. Do not depend on a
`useEffect` after English content has rendered. Preserve the user's language
switch preference on non-forced routes.

- [ ] **Step 4: Implement the shared commercial content model**

Define typed English/Hebrew content for the three intent clusters. Reuse
existing real WIRO images and existing tour data. Include itinerary examples,
duration, truthful starting price or range, inclusions, exclusions, pickup,
group size, family suitability, planning boundaries, proof links, and one
tracked WhatsApp action.

- [ ] **Step 5: Implement the private family page and Hebrew variants**

Keep the layout image-led and consistent with the Expedition Dossier design.
Avoid duplicate generic card grids. Ensure every Hebrew page is native RTL and
does not merely machine-translate English strings.

- [ ] **Step 6: Extend page metadata for explicit alternates**

Update `usePageMeta` to accept explicit language and alternate URL mappings.
Do not infer that `/hebrew-guide` itself is a Hebrew-language page. Preserve
existing JSON-LD behavior.

- [ ] **Step 7: Add internal links**

Link the homepage and relevant existing commercial pages to the new family page
and Hebrew equivalents with descriptive anchors. Do not add unrelated blog
content.

- [ ] **Step 8: Run focused checks**

Run:

```bash
pnpm check
pnpm test:e2e -- e2e/language.spec.ts e2e/homepage.spec.ts
```

Expected: PASS.

- [ ] **Step 9: Commit commercial routes**

```bash
git add client/src/pages/PrivateFamilyTours.tsx \
  client/src/pages/HebrewLandingPage.tsx \
  client/src/pages/commercialLandingContent.ts client/src/App.tsx \
  client/src/contexts/LanguageContext.tsx client/src/hooks/usePageMeta.ts \
  client/src/pages/KosherTours.tsx client/src/pages/HebrewGuide.tsx \
  e2e/language.spec.ts e2e/homepage.spec.ts
git commit -m "feat: add Hebrew family tour landing pages"
```

### Task 7: Make commercial metadata crawlable without JavaScript

**Files:**

- Modify: `server/seoMiddleware.ts`
- Modify: `server/seoMiddleware.test.ts`
- Modify: `server/routes/sitemap.ts`
- Modify: `server/sitemap.test.ts`
- Modify: `client/public/robots.txt`

- [ ] **Step 1: Write failing server metadata tests**

For all six commercial URLs, verify title, description, canonical,
index/follow, HTML language, direction, and reciprocal `hreflang` in raw server
HTML. Confirm English `/hebrew-guide` is `lang="en"`, not Hebrew.

- [ ] **Step 2: Write failing sitemap tests**

Verify all six canonical URLs occur once, each has correct reciprocal language
alternates, and no admin, login, or tracking URL is present.

- [ ] **Step 3: Run SEO tests and verify failure**

Run:

```bash
pnpm vitest run server/seoMiddleware.test.ts server/sitemap.test.ts
```

Expected: FAIL for missing family and Hebrew routes.

- [ ] **Step 4: Extend static metadata and sitemap entries**

Use one source of truth for route pairs where practical. Ensure raw HTML matches
client metadata. Keep the existing baked HTML fallback and noindex policies.
Confirm `robots.txt` still references the canonical sitemap and requires no new
allow rule.

- [ ] **Step 5: Run SEO and configuration tests**

Run:

```bash
pnpm vitest run server/seoMiddleware.test.ts server/sitemap.test.ts \
  server/vercelConfig.test.ts
pnpm check
```

Expected: PASS.

- [ ] **Step 6: Commit crawlable metadata**

```bash
git add server/seoMiddleware.ts server/seoMiddleware.test.ts \
  server/routes/sitemap.ts server/sitemap.test.ts client/public/robots.txt
git commit -m "feat: expose bilingual commercial SEO metadata"
```

### Task 8: Document Search Console and Plausible operations

**Files:**

- Create: `docs/seo-attribution-operations.md`
- Modify: `README.md` only if it already links operational guides

- [ ] **Step 1: Write the operator runbook**

Document domain-property verification, sitemap submission, URL inspection,
three-to-six-month baseline export, branded versus non-branded analysis,
Plausible goal creation, funnel definition, daily lead updates, and the weekly
90-day scorecard. List the exact canonical event names and explain that emitted
events do not appear as goals until configured in Plausible.

- [ ] **Step 2: Add privacy and data-quality checks**

Document how to verify event payloads contain no personal data, how to test an
attribution capsule, how to label unknown sources, and why estimated confirmed
THB value is not collected revenue.

- [ ] **Step 3: Format and review documentation**

Run:

```bash
pnpm exec prettier --check docs/seo-attribution-operations.md
```

Expected: PASS.

- [ ] **Step 4: Commit the runbook**

```bash
git add docs/seo-attribution-operations.md README.md
git commit -m "docs: add SEO attribution operations runbook"
```

If `README.md` was not changed, omit it from `git add`.

### Task 9: Complete full verification and reviewer handoff

**Files:**

- Modify tests only when a test exposes a real requirement gap. Do not weaken
  assertions to obtain a pass.

- [ ] **Step 1: Run formatting and diff checks**

Run:

```bash
pnpm exec prettier --check client server shared drizzle e2e docs
git diff --check
```

Expected: PASS.

- [ ] **Step 2: Run all required automated checks**

Run:

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Expected: all commands exit zero. Record the exact test counts.

- [ ] **Step 3: Perform browser verification**

Verify English and Hebrew commercial pages at 390x844 and 1440x900, source
capsules in WhatsApp URLs, manual lead creation, status/value/completion updates,
analytics source reporting, keyboard navigation, RTL, and zero application
console errors. Save screenshots under `output/playwright/`, which remains
untracked.

- [ ] **Step 4: Inspect the migration and production build artifacts**

Confirm the migration is additive. Inspect raw built/server HTML for every
commercial route and the generated sitemap before deployment.

- [ ] **Step 5: Prepare independent review evidence**

Provide the reviewer with the spec path, plan path, commit range, migration,
changed-file list, automated command outputs, test counts, and browser evidence.

- [ ] **Step 6: Apply the pass and retry rule**

Pass only when the independent reviewer approves and every required command
passes. On failure, return all reviewer issues and failing outputs to the Sol
implementation role. Retry from a clean understanding of those notes. Stop
after five failed implementation attempts and ask the user for direction.

- [ ] **Step 7: Commit any final verification-only corrections**

```bash
git status --short
git log --oneline --decorate -12
```

Expected: no tracked changes remain and the implementation commit series is
ready for integration.
