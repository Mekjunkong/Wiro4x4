# WIRO 4x4 — final Mike approval packet

Date: 2026-09-03
Client: WIRO 4x4
Intent: refreshed final decision record for the local P0 selected-tour booking-context candidate and marketing-preparation drafts after the corrected market-research brief removed E9. This packet does not authorize any external action.
Lifecycle status: final gate; approval open
Owner: reviewer

## STATUS

REVISE — local implementation evidence is positive, but release and all marketing activity remain blocked pending the explicit approvals and evidence listed below.

## OUTCOME

### Facts verified in this review

- Local implementation: YES. The candidate preserves only active-public selected tour slugs at booking handoffs, renders matched selections bilingually, and falls back truthfully to `/book` if no requested slug is public.
- Commit: NOT CREATED. Current base HEAD is `3bbff2fe2cb4eeb77ea9e4b3dbb032338ab16306`; the candidate and this packet are uncommitted working-tree changes.
- Deployed: NO.
- Live verified: NO.
- Public content: NOT PUBLISHED.
- Customer-facing messages/newsletters/outreach: NOT SENT.
- Paid-ad accounts/campaigns: NOT CREATED.
- Budget/media spend: ZERO authorized and ZERO entered by this packet.
- Pricing/proposals: NOT changed or released.
- Mike approval: NOT recorded.
- Client approval: NOT recorded.

### Recommendations — not facts and not approvals

- Use the draft search-first positioning only after operational fact checks: private Chiang Mai/Northern Thailand route planning, Hebrew support, and kosher-/Shabbat-aware planning where the exact service is confirmed.
- Keep Meta deferred until a separately approved creative, consent, tracking, and landing-page QA plan exists. Keep TikTok deferred unless separately approved.
- Prefer process-led CTA language such as “ask what is possible for your date”; do not imply certification, availability, safety, accessibility, suitability, outcomes, performance, or price without written operational evidence.

Every marketing asset remains DRAFT — NOT APPROVED FOR PUBLICATION.

## EVIDENCE

### Local P0 candidate

Inspected current working-tree changes:

- `client/src/lib/bookingTourContext.ts:1-31` trims/deduplicates requested slugs and emits only those present in the current known-public slug set.
- `client/src/pages/Packages.tsx:221-231,1449-1452` uses the helper for package-builder booking navigation.
- `client/src/pages/PackageDetail.tsx:847-853` applies the helper to resolved active package tours.
- `client/src/pages/BookingForm.tsx:164-238,706-716` uses active-public API matches for prefill, WhatsApp context, and EN/HE selected-tour summary.
- `client/src/lib/bookingTourContext.test.ts:8-68` covers parsing, malformed/unknown values, deduplication, and stale DB package slugs.

Fresh verification run in this review:

- `pnpm exec vitest run client/src/lib/bookingTourContext.test.ts` — PASS: 1 file, 5 tests.
- `pnpm exec tsc --noEmit` — PASS (exit 0).
- `pnpm run lint` — PASS: 0 errors; 39 existing warnings outside the candidate paths.
- `pnpm run build` — PASS: Vite build and server esbuild completed.
- `git diff --check` — PASS.

No production, Vercel, browser-visual, or live-data check was performed.

### Marketing-preparation evidence inspected

- Content draft: `docs/agency-content/t_391a94e6-bilingual-draft-pack.md` — three EN/HE concepts, explicit claim boundaries, placeholders, CTA variants, and publication guardrail.
- SEO/local-discovery audit: `docs/agency-seo/wiro-technical-local-discovery-prep-2026-09-03.md` — read-only audit; P1 proposals identify contact/JSON-LD, pricing/inclusion, NAP, social-link, and canonical-slug consistency work.
- Paid-ads draft: `docs/agency-marketing/t_61b55443-paid-ads-strategy-package.md` — draft-only Search-first plan, official policy references, no-spend rule, and distinct approval gates.
- Market research: `docs/agency-research/wiro-market-competitor-refresh-2026-09-03.md` — directional public-source evidence and hypotheses only; its corrected evidence register intentionally contains E1–E8 and E10–E12. The previously unsuitable E9/GetYourGuide citation was removed and is not used in this packet’s reasoning.
- Conversion brief: `docs/agency-conversion/2026-09-03-wiro-conversion-funnel-landing-page-refresh.md` — local/public flow observations and hypotheses; no analytics or customer data accessed.

## ASSUMPTIONS / UNKNOWNS

- Live/Vercel state, browser/mobile visual behavior, Hebrew RTL rendering, and production active-tour-data behavior were not exercised.
- No Search Console, analytics, CRM, bookings, ad-platform, GBP, Vercel, billing, consent, or customer data was accessed.
- Current availability, capacities, pickup areas, Hebrew-guide support, food/kashrut standards, Shabbat arrangements, insurance wording, accessibility/safety limits, imagery rights, cancellation terms, prices, inclusions, package names, and response capacity remain unverified.
- No native Hebrew editorial review or client approval for wording, visual treatment, CTA, or release timing is recorded.
- Account ownership, billing ownership, privacy/consent implementation, platform eligibility, and event diagnostics are unverified.

## RISKS / BLOCKERS

### Blocking issues

1. Mike and client approvals are not recorded.
2. Operational and commercial facts needed for any public, customer-facing, pricing, or ad claim are not verified.
3. No approval-safe evidence exists for deployment, public release, customer messages, paid-platform setup, budget entry/spend, or credentials/platform permissions.

Research correction resolved: the corrected brief removed the unsuitable E9 host rather than substituting an unverified GetYourGuide claim. No approval decision or draft asset in this packet relies on E9. Any future marketplace evidence must be re-checked at a direct canonical source before use.

### Non-blocking suggestions

- After approved scope and facts, route the SEO P1 contact/structured-data and pricing/inclusion consistency items as small reversible implementation tasks.
- Before any Hebrew release, obtain native-speaker proofreading plus RTL/mobile CTA QA evidence.
- Before any campaign, use only approved imagery, consent-safe measurement, a written total cap/daily control/stop rule, and a named monitoring owner.

## EXACT DECISIONS REQUIRED — NO APPROVAL IS IMPLIED

### Gate 1 — local implementation / controlled release preparation

Mike must explicitly approve or decline the current local candidate for a separate reversible commit and preview workflow. Approval must name the precise scope, preview/release owner, rollback owner, and required visual/CTA/RTL/metadata checks.

Decision today: NOT APPROVED.

### Gate 2 — content publication

Mike must explicitly approve or decline the chosen concept, routes, languages, EN/HE copy, metadata, imagery, CTA destination, and the exact approved definitions/boundaries for kosher-aware, Shabbat-aware, Hebrew support, private, and family-paced language.

Client/operations must fact-check every public price, duration, capacity, pickup, inclusion, food, insurance, route, and availability statement and approve public release.

Decision today: NOT APPROVED.

### Gate 3 — paid-platform setup and budget

Mike must explicitly approve or decline platform scope, geography/language, landing routes, keyword/exclusion governance, account roles, billing owner, consent/privacy design, events/UTMs, a hard total media cap, daily control, schedule/end date, monitoring owner, stop rule, and separate Studio fee.

A separate written authorization is required for account setup, campaign creation, budget entry, and launch after all other gates pass.

Decision today: NOT APPROVED; no spend authorized.

### Gate 4 — customer-facing messages

Mike must explicitly approve or decline each WhatsApp prefill, inquiry follow-up, newsletter, review request, proof/CTA message, language version, consent wording, response expectation, and operational response owner. Client approval is also required for wording and timing.

Decision today: NOT APPROVED; no message may be sent.

### Gate 5 — pricing/proposal release

Mike must explicitly approve or decline every public/customer-facing price, currency, deposit, discount, inclusion/exclusion, quote condition, validity period, cancellation/payment statement, and any proposal template. Operations must confirm date-specific availability and scope.

Decision today: NOT APPROVED; no price, quote, or proposal may be released.

### Gate 6 — deployment and live verification

Mike must explicitly approve or decline the specific implementation after development/QA evidence, preview/release plan, rollback plan, and client-facing review are available. Production deploy requires separate client release approval and post-deploy verification.

Decision today: NOT APPROVED; no commit, push, preview, deployment, or public release is authorized by this packet.

## NEXT OWNER / ACTION

1. Mike: record an explicit approval or rejection for Gates 1–6. A strategy decision does not authorize a commit, release, spend, message, price, proposal, or deploy unless it specifically says so.
2. Client/operations: supply dated written fact checks for any selected public copy, creative, pricing/proposal, or release scope.
3. Release owner/QA: only after Gate 1 approval, create a separate controlled commit/preview task and return current diff, preview, mobile/RTL/CTA/metadata, and rollback evidence.
4. Marketing/SEO/conversion/content: only after the applicable approvals and fact checks, create narrowly scoped follow-up cards; no external action is authorized by this packet.
5. Researcher (future only): if marketplace evidence is needed, directly verify canonical live source URLs and log the access date, extracted evidence, and boundaries; do not revive E9.

## REVIEW VERDICT

REVISE. The E9 citation blocker is resolved by removal in the corrected research brief. The local code candidate has passed its previously recorded local checks, and the marketing materials remain draft planning inputs only. Explicit Mike/client approvals, verified operational/commercial facts, and release-specific QA are still required before any external or public-facing action.
