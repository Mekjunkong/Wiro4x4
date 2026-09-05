# WIRO 4x4 current usability and booking-path audit — conversion

STATUS: complete for conversion audit. Product code was kept read-only; only audit artifacts were added under `docs/agency-audit/`.

CLIENT: WIRO 4x4
INTENT: current live website usability and booking-path audit, with evidence-ranked issues for orchestrator routing.
LIFECYCLE STATUS: BUSINESS_AUDIT
OWNER: conversion
NEXT OWNER: orchestrator
APPROVAL GATE: Mike/client approval required before production deployment, public publishing, pricing/commercial changes, ads/budget changes, or customer-facing release.

## Outcome

The live site is reachable and the primary commercial routes render on desktop and mobile. Header, hero, route cards, public WhatsApp links, booking form validation, English/Hebrew routing, and RTL root attributes are present. The highest-confidence conversion risk is the package/tour handoff into `/book`: the current live package review step can lose selected tours by linking to bare `/book`, and the booking page does not visibly preserve selected tours when opened with a `?tours=` URL in browser evidence. Local source on this branch already fixes the package-builder link construction, but the booking form still depends on `tour.list` data and has no fallback for preserving selected tour context when the API returns no matching tours.

## Evidence collected

Live routes inspected with Playwright Chromium against `https://www.wiro4x4indochina.com`:

- `/` desktop: HTTP 200, title `Chiang Mai 4x4 Tours & Private Off-Road Adventures | WIRO 4x4`, `html lang="en" dir="ltr"`, H1 `Private Chiang Mai 4x4 tours into Northern Thailand.`
- `/tours` desktop: HTTP 200, title `Chiang Mai 4x4 Tours | WIRO 4x4 Kosher Adventures`, six day-tour card links rendered.
- `/packages` desktop/mobile: HTTP 200, package builder rendered.
- `/book` desktop/mobile: HTTP 200, WhatsApp quick path and detailed booking form rendered.
- `/he/kosher-tours-chiang-mai` desktop: HTTP 200, title `טיולים כשרים בצ׳אנג מאי למשפחות | WIRO 4x4 Kosher Adventures`, `html lang="he" dir="rtl"`, Hebrew H1 rendered.

Screenshots saved:

- `docs/agency-audit/screenshots/2026-09-04-conversion/desktop-home.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/desktop-tours.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/desktop-packages.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/desktop-book.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/desktop-he-kosher-tours-chiang-mai.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/mobile-home.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/mobile-menu.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/mobile-book-prefill.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/mobile-book-empty-validation.png`
- `docs/agency-audit/screenshots/2026-09-04-conversion/mobile-packages-review.png`

Local verification:

- `pnpm run check` passed.
- `pnpm test` passed: 487 passed, 32 skipped, 70 test files total with 1 skipped file.
- `pnpm run lint` passed with 0 errors and 39 warnings.
- `pnpm run build` passed.
- Targeted tests passed: `client/src/lib/bookingTourContext.test.ts` and `client/src/lib/whatsappSourceScan.test.ts` — 29 tests passed.

Tooling limitation:

- Browser Use daemon failed twice, so Playwright Chromium was used instead. Chromium was installed with `npx playwright install chromium` to capture screenshots and DOM evidence.

## Verified positives

1. Primary public routes are reachable.
   - Live evidence: inspected routes returned HTTP 200 with route-specific titles/H1s.
   - Source pointer: routes are defined in `client/src/App.tsx:102-149`.

2. Global WhatsApp CTAs are present and tracked.
   - Live evidence: homepage, tours, booking, Hebrew landing, footer and floating links include `wa.me/66816401397` with WIRO attribution capsules.
   - Source pointer: header WhatsApp CTA uses `TrackedWhatsAppLink` in `client/src/components/Header.tsx:202-211`; source scanning tests cover public inquiry surfaces in `client/src/lib/whatsappSourceScan.test.ts:51-114`.

3. Booking form blocks empty submission with visible errors before any live submission.
   - Live evidence: clicking `Submit & Send to WhatsApp` empty produced six visible errors: name, phone, pickup date, end date, service selection, consent.
   - Source pointer: validation is centralized in `client/src/pages/BookingForm.tsx:315-428`; error summary renders at `client/src/pages/BookingForm.tsx:735-756`.

4. Hebrew landing page has correct root language direction.
   - Live evidence: `/he/kosher-tours-chiang-mai` returned `lang="he"`, `dir="rtl"` and Hebrew content.
   - Source pointer: route language forcing is in `client/src/contexts/LanguageContext.tsx:27-31` and root attributes update at `client/src/contexts/LanguageContext.tsx:68-71`.

5. Mobile homepage and menu did not show horizontal overflow in DOM evidence.
   - Live evidence: mobile homepage and menu reported `scrollWidth: 390`, `innerWidth: 390`.
   - Visual evidence: screenshots show readable hero CTAs and a full-screen menu with Tours, Packages, Pricing, Gallery, Car Rental, Blog, FAQ, About Wiro, Contact, Check Availability, and language switch.

## Findings ranked by severity

### P1 — Package-to-booking context is not reliably preserved on live `/book`

STATUS: reproducible live issue; partially fixed in local branch for the package-builder link, but booking-form fallback remains unverified/fragile.

Live evidence:

- Mobile package review after selecting 2-Day, Doi Inthanon, and Mae Kampong showed `Book Now`, but DOM extraction reported the link as `https://www.wiro4x4indochina.com/book` with no `?tours=` query.
- Directly opening live `/book?tours=doi-inthanon-roof-of-thailand,mae-kampong-hidden-village` did not show a `Selected tours` block, left `#specialRequests` empty, and only showed generic destination options.
- Screenshot: `mobile-packages-review.png` and `mobile-book-prefill.png`.

Local/source evidence:

- Current branch source builds the package-builder URL from selected slugs in `client/src/pages/Packages.tsx:224-230` through `buildSelectedToursBookingUrl()`.
- Local Vite smoke test on the current branch produced `http://127.0.0.1:5173/book?tours=doi-inthanon-roof-of-thailand,mae-kampong-hidden-village`, so the bare-link part appears to be a live/local parity or deployment issue already addressed by commit `9fbc0d1`.
- Booking form prefill still depends on `trpc.tour.list` data in `client/src/pages/BookingForm.tsx:164-179`; if no matching tours are returned, it returns early with no visible context.
- Only Doi Inthanon is mapped from slug to destination in `client/src/pages/BookingForm.tsx:181-184`, so additional selected tours are not translated into destination chips even when matched.
- `getAllActiveTours()` returns `[]` when DB is unavailable at `server/db/tours.ts:12-20`, and `tour.list` returns that directly at `server/routes/tour.ts:49-52`.

Impact:

- A user can build a package, click Book Now, and land on a generic booking form that does not visibly reassure them their selected routes were carried forward.
- Sales/admin may receive less specific booking requests if users do not manually repeat selected tours.

Acceptance criteria for implementer:

- From live/current build, selecting a multi-day package and clicking `Book Now` opens `/book?tours=<selected-slug-list>`.
- `/book?tours=doi-inthanon-roof-of-thailand,mae-kampong-hidden-village` visibly renders a `Selected tours` block before the form without requiring DB-only success.
- Booking form special requests or a hidden/submitted field preserves all selected tour names/slugs in the created booking request.
- Slug-to-destination mapping covers all current six day-tour slugs or uses the tour names directly instead of lossy destination mapping.
- Add/keep a browser or component regression test for package builder → `/book` → selected tours visible/submitted.

### P2 — Package builder review step has a disabled email-quote path with no guidance until fields are filled

STATUS: visible usability issue.

Evidence:

- Mobile package review shows `Get a Formal Quote by Email`, name/email fields, and a disabled `Get Formal Quote` button before the footer.
- DOM extraction after reaching review step: `Get Formal Quote` is disabled.
- Source pointer: quote submission requires only `quoteName` and `quoteEmail` at `client/src/pages/Packages.tsx:373-390`, but the visible state does not explain this at the button level.

Impact:

- Users may perceive the formal quote path as broken, especially on mobile where the fields and disabled button are visually separated in a long page.

Acceptance criteria:

- Show inline helper text near the disabled button, e.g. `Enter name and email to request a formal quote`.
- Mark required quote fields with labels and `required` semantics.
- Ensure the button enabled/disabled state is announced accessibly.

### P2 — Booking page is long and high-friction compared with the fastest WhatsApp path

STATUS: visible conversion risk, not a functional defect.

Evidence:

- Mobile booking screenshot shows the quick WhatsApp path at the top, then a long detailed form with trip details, dates/logistics, service checkboxes, destinations, customer details, agent field, special requests, consent, and submit.
- Empty-submit validation correctly surfaces six errors, but the number of required decisions is high for a user who may only want availability.
- Source pointer: the detailed form starts at `client/src/pages/BookingForm.tsx:759` after the quick WhatsApp card at `client/src/pages/BookingForm.tsx:675-702`.

Impact:

- The quick WhatsApp CTA mitigates friction, but users who choose the form may abandon before completion.

Acceptance criteria:

- Keep WhatsApp as the primary fast path.
- Consider a progressive disclosure form or a shorter first-step lead capture after Mike/orchestrator approval.
- Do not change required booking fields without owner approval because this affects operations and lead quality.

### P3 — Some form controls rely on visual text rather than explicit names in DOM extraction

STATUS: source mostly shows labels, but automated DOM extraction found many blank `name` attributes.

Evidence:

- Booking form extraction showed many inputs with empty `name` values; React state handles submission, so this is not a submit blocker.
- Source shows visible `label htmlFor` coverage for core fields in `TripDetailsStep.tsx:22-43`, `TripDetailsStep.tsx:142-164`, and `ContactStep.tsx:21-43`.
- Service checkbox labels wrap inputs in `ServicesStep.tsx:66-82`, but the inputs do not have stable `name`/`id` values.

Impact:

- Lower testability and weaker browser autofill/accessibility semantics, especially for service checkboxes.

Acceptance criteria:

- Add stable `id`/`name` values for service checkbox inputs while preserving wrapped-label click targets.
- Add accessible grouping/help text for required service selection.

## Assumptions / unknowns

- I did not submit live booking, lead, newsletter, review, or WhatsApp forms.
- I did not inspect admin/customer/private data or secrets.
- I did not verify actual WhatsApp handoff inside WhatsApp; evidence is limited to generated `wa.me` URLs and attribution capsules.
- Live/local parity is uncertain: local branch contains commit `9fbc0d1 feat: preserve selected tours in booking handoff`, but live evidence still showed the package review `Book Now` href as bare `/book`.
- Database content and production `tour.list` behavior were inferred only through public page behavior and source, not by reading production DB.

## Risks / blockers

- Do not deploy automatically: `main` auto-deploys to Vercel and requires approval.
- Package/booking handoff should be fixed or confirmed deployed before paid traffic, because it affects quote specificity.
- Any pricing/package copy changes require Mike approval.
- Browser Use daemon failure is a local tooling issue; Playwright provided replacement evidence.

## Next owner / action

NEXT OWNER: orchestrator.

Recommended routing:

1. Assign developer/builder to verify live deployment parity for commit `9fbc0d1` and harden `/book?tours=` so selected tours render/persist even when `tour.list` returns empty or partial data.
2. Assign conversion/UI implementer to add helper text and required semantics to the formal quote mini-form on `/packages`.
3. Assign QA to rerun mobile desktop package → booking, direct `/book?tours=...`, Hebrew RTL, empty validation, and WhatsApp URL checks after fixes.
4. Prepare Mike approval packet only after QA confirms the above and no production deployment happens without approval.
