# WIRO 4x4 conversion funnel and landing-page planning refresh

Date: 2026-09-03
Client: WIRO 4x4
Intent: approval-safe conversion planning using local source and public-site evidence only
Lifecycle status: audit/draft
Owner: conversion
Outcome: planning brief only; no source edits, no publishing, no deploy, no analytics/account access, no customer messaging, no pricing changes
Approval gate: Mike approval is required before any pricing, proposal, launch, production deployment, ad/budget change, public publishing, or client-facing release

## Status

Audit/draft complete. This brief maps the current public discover-to-book paths and proposes privacy-safe local experiments. All conversion estimates below are hypotheses; no funnel metrics, conversion rates, revenue, traffic, or customer-data claims were used or inferred.

## Outcome

The site already has several strong conversion assets:

- WhatsApp-first path is visible from the homepage hero, global header, floating action button, homepage inquiry, tour detail pages, package builder, booking form, pricing page, FAQ, and contact page.
- Tour and package pages provide route detail, starting prices, kosher/Hebrew/private-tour cues, and comparison paths.
- The booking form is positioned as availability checking, not payment capture, which lowers commitment risk.
- Hebrew/RTL routing exists and supports Hebrew-specific landing pages.
- Privacy-bounded event tracking exists for commercial page views, scroll depth, WhatsApp clicks, booking starts, booking completions, chat interactions, pricing views, proof opens, and FAQ opens.

Main planning gap: the funnel has many CTAs, but the decision hierarchy is not always consistent. Some surfaces push WhatsApp, some push online booking, some push pricing comparison, and some use fallback or older pricing/package copy. The safest next conversion work is not a redesign; it is a small set of message-hierarchy and measurement experiments that clarify the preferred next action per visitor intent.

## Key discover-to-book flows

### Flow A: Homepage organic visitor to WhatsApp

Route:

- `/`

Observed public path:

- Homepage hero headline: "Private Chiang Mai 4x4 tours into Northern Thailand."
- Hero CTA: "Plan with WIRO" links to WhatsApp with attribution capsule `HOME-HERO-EN`.
- Homepage trust bar links to public Tripadvisor reviews.
- Homepage product tiers link to `/tours`, `/packages/northern-thailand-3d2n`, and `/packages/grand-tour-laos-14d`.
- Homepage inquiry section states: "WhatsApp is the primary path. This short form is a backup if you also want an email record."
- Inquiry WhatsApp CTA uses `HOME-INQUIRY-EN`; backup form submits lead source `homepage_inquiry`.

Source references:

- `client/src/pages/Home.tsx:91-148` renders Header, Hero, TrustBar, ProductTiers, proof, gallery, QuickInquiryForm, FAQ, Footer, floating actions, and newsletter popup.
- `client/src/components/QuickInquiryForm.tsx:41-60` builds the prefilled WhatsApp message with dates, group size, pickup area, trip type, and kosher/Shabbat/Hebrew-guide needs.
- `client/src/components/QuickInquiryForm.tsx:73-90` saves backup inquiries through `trpc.lead.create` and tells users WhatsApp is fastest.
- `client/src/components/QuickInquiryForm.tsx:115-131` submits `source: "homepage_inquiry"` with route details in the lead message.
- `client/src/components/QuickInquiryForm.tsx:170-234` frames the section as "Fastest booking path" and "Prefer WhatsApp?".
- `client/src/components/QuickInquiryForm.tsx:454-488` offers both "Save Backup Inquiry" and "Open WhatsApp Instead".

Friction hypotheses:

- H1: The homepage has multiple mid-page onward paths; visitors with high intent may not know whether to choose Plan with WIRO, Explore routes, product tiers, or the backup inquiry.
- H2: The backup inquiry requires name and email but not phone/WhatsApp; for a WhatsApp-first business, requiring email before phone may reduce completion from mobile travelers.
- H3: The strongest qualifying fields are present, but not consistently reused across every CTA label.

Privacy-safe measurement:

- Track homepage commercial page views, hero WhatsApp clicks, inquiry starts, inquiry WhatsApp clicks, backup lead submits, and scroll depth by language and attribution code.
- Do not store message bodies or personal details in analytics; current `trackEvent` sanitization supports bounded properties only.

### Flow B: Tour comparison to tour detail to availability

Routes:

- `/tours`
- `/tours/:slug`
- Example public route verified: `/tours/doi-inthanon-roof-of-thailand`

Observed public path:

- `/tours` lists 6 tour cards with price badges, difficulty/duration filters, kosher/private/Shabbat tags, and "View Details" links.
- Doi Inthanon detail page shows route description, included/not-included lists, itinerary, availability section, enrichment content, related tours, blog link, FAQ, and sticky booking card.
- Sticky tour card offers "Check Availability" to `/book?tour=doi-inthanon-roof-of-thailand`, "Book via WhatsApp" to WhatsApp with `TOUR-DETAIL-EN`, and "Or request a free quote" which navigates to homepage inquiry.

Source references:

- `client/src/pages/ToursListing.tsx:39-94` renders the route hero and `Tours` grid.
- `client/src/components/Tours.tsx:186-228` resolves tours from DB or fallback catalog.
- `client/src/components/Tours.tsx:230-239` filters by difficulty and duration.
- `client/src/components/Tours.tsx:322-417` renders each card as a link to `/tours/${tour.slug}` with price, tags, and "View Details".
- `client/src/pages/TourDetail.tsx:1314-1322` emits `tour_view` for tour detail.
- `client/src/pages/TourDetail.tsx:1348-1355` emits `pricing_view` when the booking card is seen.
- `client/src/pages/TourDetail.tsx:1659-1665` renders `AvailabilityCalendar`.
- `client/src/pages/TourDetail.tsx:1822-1955` renders sticky price/booking card, Check Availability, WhatsApp, free quote, deposit, and cancellation copy.
- `client/src/lib/bookingTourContext.ts:1-31` parses and builds safe tour query parameters for booking links.

Friction hypotheses:

- H1: "View Details" is low-pressure, but there is no direct WhatsApp CTA on the tour cards themselves; high-intent users may need one extra click before contacting.
- H2: The tour detail card uses both THB display (`฿5,000`) and WhatsApp pricing confirmation; this is good if pricing is fixed, but any planned pricing change must pass Mike approval.
- H3: "Or request a free quote" jumps to the homepage inquiry, which may feel like leaving the tour context unless the selected tour is preserved.

Privacy-safe measurement:

- Compare `tour_view` to `pricing_view` to estimate how many visitors reach the sticky booking card.
- Compare `TOUR-DETAIL-*` WhatsApp clicks against `/book?tour=` booking starts.
- Track by slug/language only; do not track customer identity or contact details.

### Flow C: Packages builder to WhatsApp/formal quote/booking

Routes:

- `/packages`
- `/packages/:slug`

Observed public path:

- `/packages` opens with "Build Your Adventure Package" and suggested 3/5/7-day packages.
- Builder steps are Duration, Select Tours, Customize, Review & Quote.
- Step 4 can show price breakdown, package discount, deposit/balance, 7+ custom quote warning, WhatsApp request, and formal quote form.
- Package detail pages can link to `/book` or to `/book?tours=...` when DB package tour slugs resolve.

Source references:

- `client/src/pages/Packages.tsx:159-173` defines `/packages` SEO metadata.
- `client/src/pages/Packages.tsx:178-231` stores builder state and builds a safe booking URL from selected tour slugs.
- `client/src/pages/Packages.tsx:343-370` builds the WhatsApp package request and tracks `PACKAGES-REQUEST-*`.
- `client/src/pages/Packages.tsx:373-398` submits formal quote leads with `source: "package-builder"`.
- `client/src/pages/Packages.tsx:1181-1352` renders price breakdown, discounts, custom-quote warning, deposit, and balance.
- `client/src/pages/Packages.tsx:1354-1438` renders WhatsApp and formal quote CTAs.
- `client/src/pages/PackageDetail.tsx:505-539` emits `tour_view` and `pricing_view` for package detail booking card exposure.
- `client/src/pages/PackageDetail.tsx:800-825` fallback package detail offers WhatsApp inquiry and `/book`.
- `client/src/pages/PackageDetail.tsx:1073-1078` DB package detail links to the generated booking URL.

Friction hypotheses:

- H1: Package builder is powerful but multi-step; users with clear dates may prefer immediate WhatsApp over completing all steps.
- H2: Public `/packages` currently only exposes the first builder step in extracted public text until interaction; this may be fine for UI, but route should make "Request package by WhatsApp" visible earlier for mobile/high-intent visitors.
- H3: "Get a Formal Quote by Email" requires name/email; it may be better as a secondary option after WhatsApp, not equal priority.

Privacy-safe measurement:

- Add or verify package step-change events before changing UI so drop-off can be estimated locally without personal data.
- Segment only by route, language, selected duration, selected tour count, and CTA placement.

### Flow D: Pricing to WhatsApp

Route:

- `/pricing`
- Legacy `/estimate` redirects to `/pricing`.

Observed public path:

- Pricing page headline: "Transparent Pricing".
- Public text claims all prices include private vehicle, Hebrew-speaking guide, kosher meals, and insurance.
- Seasonal pricing table lists high season and 2026 Passover/Sukkot peak windows.
- Individual tours have "Book via WhatsApp" buttons.
- Multi-day package cards have "Inquire Now" buttons.
- Booking terms explain 30% deposit, balance on tour day, payment methods, cancellation, packing, and weather policy.

Source references:

- `client/src/App.tsx:79-86` redirects `/estimate` to `/pricing`.
- `client/src/App.tsx:101-114` declares primary public conversion routes: `/`, `/pricing`, `/estimate`, `/tours`, `/tours/:slug`, `/packages`, `/packages/:slug`, `/reviews`, `/book`.
- `client/src/pages/Pricing.tsx:157-166` defines page meta.
- `client/src/pages/Pricing.tsx:238-260` tracks `pricing_view` when the pricing section is seen.
- `client/src/pages/Pricing.tsx:262-285` builds tracked WhatsApp links for tour and package pricing inquiries.
- `client/src/pages/Pricing.tsx:328-580` renders seasonal and individual tour pricing.
- `client/src/pages/Pricing.tsx:581-655` renders multi-day packages.
- `client/src/pages/Pricing.tsx:657-731` renders booking terms and policies.

Friction hypotheses:

- H1: The pricing page fallback tour names differ from the 6 current route slugs shown on `/tours`. This can confuse visitors comparing tour detail pages against pricing cards.
- H2: Pricing uses USD approximations in public extracted text while tour detail uses THB. Mixed currency can reduce trust unless intentionally explained.
- H3: "No hidden fees" and fixed inclusions are strong claims; before paid traffic or public campaign use, Mike should confirm pricing and inclusion accuracy.

Privacy-safe measurement:

- Compare pricing section views to `PRICING-TOUR-*` and `PRICING-PACKAGE-*` WhatsApp clicks.
- Treat pricing conversions as intent clicks only; final booking and payment confirmation are not available from public evidence.

### Flow E: Booking form to WhatsApp handoff

Route:

- `/book`

Observed public path:

- Booking page headline: "Plan Your Private Adventure".
- First card says "Check availability before planning every detail" and "No payment is taken at this stage."
- Quick WhatsApp CTA appears before detailed form.
- Detailed form captures trip details, services, destinations, contact details, consent, then "Submit & Send to WhatsApp".
- Trust badges state refund, secure booking, and instant WhatsApp confirmation.

Source references:

- `client/src/pages/BookingForm.tsx:84-103` sets page meta and tracks `booking_start` on form interaction.
- `client/src/pages/BookingForm.tsx:113-125` reads `token`, `tours`, and `tour` query params.
- `client/src/pages/BookingForm.tsx:164-208` pre-fills selected tours from URL slugs into destinations/special requests.
- `client/src/pages/BookingForm.tsx:241-257` autosaves a local draft.
- `client/src/pages/BookingForm.tsx:316-429` validates required name, phone, dates, services, and consent.
- `client/src/pages/BookingForm.tsx:445-470` submits a booking, clears draft, and opens WhatsApp on success with `BOOKING-SUBMIT-*`.
- `client/src/pages/BookingForm.tsx:681-703` shows the quick WhatsApp availability path before the detailed form.
- `client/src/pages/BookingForm.tsx:758-874` renders the detailed form, consent, submit button, and trust badges.

Friction hypotheses:

- H1: Booking form validation requires at least one service and consent before submit; that is legally safer but can block users who only want availability.
- H2: Phone is required but WhatsApp field is optional. Since WhatsApp is the core channel, the label and copy should make the expected phone/WhatsApp path clear.
- H3: The form opens WhatsApp only after server booking succeeds; if the booking API fails, user sees a generic error and must manually use WhatsApp.

Privacy-safe measurement:

- Track `booking_start`, validation error count/category locally if implemented without values, `booking.create` success/failure counts, and `BOOKING-SUBMIT-*` clicks.
- Avoid tracking raw dates, names, phones, emails, or free-text special requests.

### Flow F: Reviews/proof to contact

Route:

- `/reviews`

Observed public path:

- Reviews page shows "Live Google reviews are not connected yet" and links to Tripadvisor.
- Site review form is present, but extracted public state says "No reviews yet" for site-hosted reviews.
- Global floating WhatsApp CTA is still available.

Source references:

- `client/src/pages/Reviews.tsx:101-110` defines reviews page meta.
- `client/src/pages/Reviews.tsx:135-152` queries public reviews and creates reviews.
- `client/src/pages/Reviews.tsx:180-203` validates and submits review form with source `website` or `whatsapp_post_tour`.
- `client/src/pages/Reviews.tsx:270-273` renders `GoogleReviewsSection`.
- `client/src/components/GoogleReviewsSection.tsx:127-201` shows Tripadvisor fallback when live Google reviews are unavailable.
- `client/src/components/SocialProofStrip.tsx:66-79` avoids invented testimonials and points users to Tripadvisor when site reviews are not approved.

Friction hypotheses:

- H1: A reviews page that says "No reviews yet" can weaken trust unless Tripadvisor proof remains visually dominant.
- H2: "Google reviews are not connected yet" is operationally honest but may not be the best customer-facing phrasing for conversion.
- H3: Site-hosted reviews require approval; until enough are approved, the stronger public proof route is Tripadvisor.

Privacy-safe measurement:

- Track clicks to Tripadvisor as a proof interaction if not already measured.
- Track proof exposure/open events without storing reviewer/customer details.

### Flow G: Hebrew/RTL visitor path

Routes:

- `/he/kosher-tours-chiang-mai`
- `/he/hebrew-guide-chiang-mai`
- `/he/private-family-tours-chiang-mai`
- shared bilingual routes with language switcher

Observed public path:

- `/he/kosher-tours-chiang-mai` renders Hebrew copy and WhatsApp CTA with `KOSHER-PAGE-HE` attribution.
- Copy explicitly states kosher planning boundaries, family fit, pickup assumptions, not-included items, and starting price conditions.

Source references:

- `client/src/contexts/LanguageContext.tsx:21-31` forces Hebrew language for `/he` routes and English for English commercial landing routes.
- `client/src/contexts/LanguageContext.tsx:68-71` sets `<html lang>` and `<html dir>` before paint.
- `client/src/contexts/LanguageContext.tsx:97-106` wraps children with `lang`, `dir`, and RTL class.
- `client/src/App.tsx:116-131` declares English and Hebrew commercial landing pages.
- `shared/whatsappAttribution.ts:136-162` registers kosher/hebrew guide EN/HE WhatsApp sources.

Friction hypotheses:

- H1: Hebrew-specific landing pages have strong intent matching, but shared routes depend on language state; a user switching language mid-funnel should keep CTA/source attribution consistent.
- H2: Mixed Hebrew/English product names and prices should be reviewed by Mike/native speaker before paid traffic.

Privacy-safe measurement:

- Segment commercial page views and CTA clicks by `language` only.
- Do not infer nationality, religion, or dietary strictness from behavior; only use self-stated form/WhatsApp content operationally.

## Measurement foundation already present

Source references:

- `client/src/lib/analytics.ts:6-22` defines canonical events.
- `client/src/lib/analytics.ts:60-145` sanitizes event properties and rejects non-bounded values.
- `client/src/lib/analytics.ts:154-169` dispatches Plausible events without blocking user actions.
- `client/src/lib/behaviorTracking.ts:20-52` defines commercial routes for page-view tracking.
- `client/src/hooks/useBehaviorTracking.ts:20-52` emits commercial page view and scroll-depth events.
- `client/src/components/TrackedWhatsAppLink.tsx:21-40` builds tracked WhatsApp links and emits `whatsapp_click`.
- `shared/whatsappAttribution.ts:15-394` stores durable WhatsApp source codes.

Recommended measurement model:

- Top-level funnel: commercial page view -> pricing/tour/package proof exposure -> CTA click -> booking start -> booking submit success -> WhatsApp handoff.
- Use only route, placement, language, slug, source code, UTM values, channel, and scroll depth.
- Never put contact details, route free text, dates, messages, phone/email, children ages, or special requests into analytics.

## P0 recommendations

P0.1 Align pricing/package/tour naming before any public campaign

Why:

- Public `/tours` shows current route-specific names like Doi Inthanon, Mae Kampong, Maerim, Doi Suthep, Mae Wang, Samoeng.
- Public `/pricing` fallback shows older/generic names like Waterfall Adventure Tour, Mountain & Valley Explorer, Jungle & River Expedition, Rice Fields & Culture Tour, Elephant Sanctuary Visit, Hill Tribe Cultural Journey.

Scope boundary:

- Planning only in this task. Future source change should be a small content/data alignment change, not a pricing strategy change.
- No price changes without Mike approval.

Acceptance for future implementation:

- Same tour names/slugs appear consistently on `/tours`, `/tours/:slug`, `/pricing`, WhatsApp prefill text, and package builder.
- If currency differs by page, add clear explanatory copy.

Measurement:

- Before/after: pricing page view -> pricing WhatsApp click rate by tour/package source code.

Approval gate:

- Mike must approve final pricing/inclusion wording before public release.

P0.2 Make every high-intent route choose one primary CTA hierarchy

Why:

- Current CTAs include Plan with WIRO, Explore routes, View Details, Check Availability, Book via WhatsApp, Or request a free quote, Inquire Now, Book Online, Get Formal Quote.
- Multiple labels are valid individually, but the preferred action should be consistent per intent.

Suggested hierarchy hypothesis:

- Discovery pages (`/`, `/tours`, Hebrew landing pages): primary = WhatsApp availability; secondary = compare routes.
- Detail pages (`/tours/:slug`, `/packages/:slug`): primary = Check Availability for this route/package; secondary = WhatsApp; tertiary = compare.
- Pricing page: primary = WhatsApp price/availability for selected item; secondary = terms/policies.
- Booking page: primary = quick WhatsApp if user only needs availability; secondary = detailed form.

Scope boundary:

- Copy/CTA-label planning only. Do not remove legally required consent or policy links.

Measurement:

- Compare primary CTA click share by route and placement before/after.

Approval gate:

- Mike approval before changing customer-facing CTA language.

P0.3 Replace customer-facing "not connected yet" proof language with approval-safe proof hierarchy

Why:

- Reviews page currently states Google reviews are not connected yet and site reviews show no approved reviews in extracted public state.
- The site already has Tripadvisor public proof. The conversion issue is phrasing and prominence, not inventing proof.

Safe copy direction:

- Lead with "Independent traveler feedback is available on Tripadvisor".
- Keep site reviews as "guest reviews submitted through this site appear after approval".
- Avoid implying Google integration is broken.

Scope boundary:

- Do not invent testimonials, ratings, review counts, or Google proof.
- Do not scrape or republish third-party reviews without approval/legal review.

Measurement:

- Track proof CTA clicks to Tripadvisor and subsequent WhatsApp clicks in the same session only if privacy policy/consent setup permits.

Approval gate:

- Mike approval before changing proof copy.

P0.4 Add explicit fallback path for booking API failure

Why:

- Booking success opens WhatsApp after server save. If booking submission fails, the UI shows generic error.
- Since WhatsApp is the fastest path, high-intent users should get a safe fallback CTA immediately when the detailed form fails.

Scope boundary:

- Do not change backend behavior or send messages automatically.
- Frontend-only future experiment: show "Could not save the form. Open WhatsApp with your details instead" after failure, using client-side form values only in the WhatsApp prefill that the user chooses to send.

Measurement:

- Track booking submit error count and fallback WhatsApp click count without storing form values.

Approval gate:

- Mike approval before release because it changes the customer-facing error path.

## P1 recommendations

P1.1 Preserve tour context when sending users from tour detail to homepage inquiry

Why:

- Tour detail "Or request a free quote" navigates home and scrolls to inquiry, but public evidence does not show selected tour context preserved in the homepage form.

Scope boundary:

- Future implementation can add a safe `?tour=`/session-state handoff or redirect to `/book?tour=...`; no backend required unless lead source needs explicit slug.

Measurement:

- Compare free-quote clicks and lead submit/WhatsApp clicks with and without prefilled route idea.

P1.2 Add direct WhatsApp test on `/tours` cards for mobile only or as secondary CTA

Why:

- `/tours` currently requires card click -> detail -> WhatsApp/availability. That supports education, but high-intent mobile users may prefer a direct availability CTA.

Scope boundary:

- Small A/B test or feature flag; do not clutter desktop cards.
- Keep "View Details" as the default research path.

Measurement:

- Track source code per tour card if added; compare direct WhatsApp clicks vs detail-page engagement.

P1.3 Instrument package builder step progress

Why:

- Package builder has clear multi-step state but current canonical events do not include builder step progress.

Scope boundary:

- Event-only local change; no PII. Properties: step number, language, selected duration bucket, selected tour count.

Measurement:

- Step 1 -> Step 2 -> Step 3 -> Step 4 -> WhatsApp/formal quote/booking URL.

P1.4 Reframe backup inquiry required fields around fastest response

Why:

- Homepage backup inquiry requires name/email while phone/WhatsApp is optional. For a WhatsApp-first flow, the form could better explain why email is required or make WhatsApp/phone the primary contact field.

Scope boundary:

- Do not remove contactability safeguards without Mike approval.
- If field requirements change, update frontend validation and backend schema/test expectations together.

Measurement:

- Inquiry start -> validation error -> submit success -> WhatsApp handoff.

P1.5 Add a one-screen "what happens next" microcopy block near primary CTAs

Why:

- Users deciding whether to send WhatsApp may want to know what happens after sending dates/group/pickup.

Safe copy direction:

- "1. Send dates/group/pickup. 2. WIRO confirms route, kosher/Shabbat needs, and exact price. 3. Deposit confirms the date."

Scope boundary:

- Must not promise instant final quote, availability, or guaranteed kosher arrangements without review.

Measurement:

- CTA click-through and booking-start changes by route.

## Public-site evidence

Observed with `web_extract` against live public URLs on 2026-09-03. These are reproducible by opening each URL in a browser or using the same extraction tool.

- `/`: title "Chiang Mai 4x4 Tours & Private Off-Road Adventures | WIRO 4x4"; hero CTA links to WhatsApp; product tiers link to `/tours` and package details; inquiry section states WhatsApp is primary and backup form is secondary.
- `/tours`: title "Chiang Mai 4x4 Tours | WIRO 4x4 Kosher Adventures"; lists 6 tours with filters, prices, kosher/private tags, and detail links.
- `/tours/doi-inthanon-roof-of-thailand`: title "Private Doi Inthanon Tour from Chiang Mai — Roof of Thailand 4x4 | WIRO 4x4 Kosher Adventures"; shows route details, itinerary, included/not-included items, sticky price card, `/book?tour=...`, WhatsApp, and quote link.
- `/packages`: title "Multi-Day Tour Packages | WIRO 4x4"; shows suggested packages and builder steps.
- `/pricing`: title "Tour Pricing | WIRO 4x4 Kosher Adventures"; shows transparent pricing, seasonal pricing, individual tour cards, package cards, deposit/cancellation terms, and WhatsApp CTAs.
- `/book`: title "Check Tour Availability | WIRO 4x4 Kosher Adventures"; shows quick WhatsApp availability CTA before the detailed form and states no payment is taken at this stage.
- `/reviews`: title "Guest Reviews | WIRO 4x4 Kosher Adventures"; shows Tripadvisor fallback and site-hosted review form; public extracted state has no approved site reviews.
- `/he/kosher-tours-chiang-mai`: title "טיולים כשרים בצ׳אנג מאי למשפחות | WIRO 4x4 Kosher Adventures"; Hebrew route shows kosher planning, family fit, not-included boundaries, starting price conditions, and Hebrew WhatsApp CTA.
- `/contact`: title "Contact Us | WIRO 4x4 Kosher Adventures"; shows phone/WhatsApp, email, contact form, hours, Shabbat closed note, and WhatsApp CTA.
- `/faq`: title "Frequently Asked Questions | WIRO 4x4 Kosher Adventures"; shows FAQ categories, WhatsApp CTA, and Book a Tour CTA.

## Assumptions and unknowns

- No analytics/account data was accessed. Actual traffic, conversion rates, device mix, channel mix, lead quality, booking close rate, cancellation rate, and revenue are unknown.
- No customer records or CRM data were accessed. Lead/booking completion quality is unknown.
- No production admin account was used. Public extraction may differ from logged-in/admin-visible content.
- Pricing and inclusion accuracy were not business-validated in this task; all pricing-sensitive recommendations require Mike approval.
- Hebrew copy quality was not reviewed by a native Hebrew editor in this task.
- Third-party proof claims are limited to public page observations; no review-platform data was scraped beyond visible public links/text.

## Risks and blockers

- Pricing inconsistency risk: public `/pricing` fallback names and current `/tours` names do not fully match.
- Proof risk: "No reviews yet" and "Google reviews are not connected yet" can weaken trust if not balanced by Tripadvisor proof.
- Measurement risk: CTA changes without before/after event hygiene could create activity without learning.
- Legal/privacy risk: analytics must never collect contact details, dates, children ages, or free-text travel needs.
- Approval risk: pricing, claims, public copy, and launch decisions cannot be inferred from this audit.
- Repo-collision risk: current git status already has modified source files and untracked booking-tour-context files from other work; this task intentionally avoided source edits.

## Approval gate

No approval is inferred. Required approvals before action:

- Mike approval before any pricing/inclusion/currency wording changes.
- Mike approval before customer-facing CTA/proof copy changes.
- Mike/client approval before publishing, deploying, or public release.
- Mike approval before any ad/account/budget setup or campaign use.
- Mike approval before any customer message, review request campaign, or newsletter/send action.
- Mike approval before any production deployment.

## Next owner and action

Recommended next owner: Mike / strategy reviewer.

Recommended next action:

- Review and approve which P0 items should become implementation cards.
- Suggested first implementation card after approval: align `/pricing` tour/package naming and currency explanation with `/tours` and `/tours/:slug`, with no price changes unless separately approved.

Potential implementation cards after approval:

- Align tour names and pricing copy across `/tours`, `/pricing`, package builder, and WhatsApp messages.
- Update proof/reviews page copy to lead with Tripadvisor proof and remove operational "not connected yet" phrasing.
- Add booking API failure fallback CTA to WhatsApp.
- Preserve selected tour context when moving from tour detail quote link to inquiry/booking.
- Add package-builder step tracking with privacy-safe properties only.

## Final handoff summary

STATUS: audit/draft complete.
OUTCOME: durable conversion planning brief written; source was not edited.
EVIDENCE: public routes and local source references listed above.
ASSUMPTIONS/UNKNOWNs: no analytics/customer/account data; estimates are hypotheses only.
RISKS/BLOCKERS: pricing/proof consistency, privacy-safe measurement, approval gates.
APPROVAL GATE: Mike/client approval required before public copy, pricing, launch, ads, messaging, or deployment.
NEXT OWNER/ACTION: Mike/reviewer to choose which P0 recommendation becomes an implementation card.
