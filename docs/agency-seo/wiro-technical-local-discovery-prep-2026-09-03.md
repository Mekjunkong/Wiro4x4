# WIRO 4x4 technical SEO and local discovery preparation refresh

Date: 2026-09-03
Client: WIRO 4x4
Intent: safe technical/on-page SEO preparation from current local source plus public inspection
Lifecycle status: audit/draft
Owner: SEO
Outcome: read-only audit and prioritized opportunity backlog; no production/account changes made
Approval gate: Mike approval before public content, GBP, Search Console, Vercel, production deploy, pricing/claim changes, or account-side updates

## Executive status

STATUS: Draft audit complete from local source and public HTTP inspection.

OUTCOME: No P0 indexability blocker was found for the primary public marketing routes sampled. The highest-value next work is a scoped P1 cleanup: align client-side structured data/contact claims, make local-discovery NAP facts consistent and approval-gated, and strengthen internal links to the commercial SEO landing pages.

EVIDENCE:

- Public HTTP sample returned 200 + `index, follow` + canonical URLs for `/`, `/tours`, `/packages`, `/pricing`, `/book`, `/blog`, `/gallery`, `/reviews`, `/about`, `/accessible-tours`, `/car-rental`, `/faq`, `/contact`, `/kosher-tours`, `/hebrew-guide`, `/private-family-tours`, and Hebrew commercial variants.
- Public `/admin` and `/booking/success` returned 200 with `X-Robots-Tag: noindex, nofollow`; unknown route `/not-a-real-page` returned 404 with noindex.
- Public `/robots.txt` returned 200 and points to `https://www.wiro4x4indochina.com/sitemap.xml`.
- Public `/sitemap.xml` returned 200 with 42 URLs in the sampled parse; it contains `/private-family-tours`, `/he/private-family-tours-chiang-mai`, `/kosher-tours`, and `/he/kosher-tours-chiang-mai`, and excludes `/estimate`, `/booking/success`, and `/admin/cost-calculator`.
- Source evidence is cited below by file path and line number.

ASSUMPTIONS / UNKNOWNS:

- No Search Console, GBP, Vercel, analytics, or credential-backed checks were performed by scope.
- Rankings, impressions, traffic, GBP state, reviews state, and crawl coverage are unknown.
- Facebook/Instagram URLs in source are marked TODO and should be treated as unverified until Mike confirms the live profiles.
- The exact verified public street address/NAP to display should be approved before expanding visible local-business content.

RISKS / BLOCKERS:

- Client-side JSON-LD still includes masked phone values in some pages; server-rendered crawler HTML is better for sampled routes, but hydrated metadata can diverge for browsers and secondary crawlers.
- Some local-discovery claims and contact data are split across multiple source files, increasing stale-data risk.
- Public changes require Developer/QA implementation and Mike approval before deploy.

NEXT OWNER / ACTION:

- SEO: hand this brief to Developer/QA as a scoped P1 remediation set if Mike approves.
- Developer/QA: implement only approved local changes, run existing checks, smoke-test metadata/CTA paths locally and publicly after approved deploy.
- Mike: approve local NAP/social/profile facts and any claim/pricing wording before public release.

## Source-verified technical SEO map

### Route and server metadata coverage

- Client routes exist for the primary marketing and transactional pages in `client/src/App.tsx:102-147`: `/`, `/pricing`, `/estimate` redirect, `/tours`, `/tours/:slug`, `/packages`, `/packages/:slug`, `/blog`, `/blog/:slug`, `/gallery`, `/reviews`, `/book`, booking status pages, commercial landing pages, `/accessible-tours`, `/car-rental`, `/faq`, `/contact`, `/about`, `/terms`, `/privacy`, auth/admin/album pages, and `/404`.
- Server-side crawler metadata is defined in `server/seoMiddleware.ts:232-379` for static marketing pages plus commercial landing page pairs.
- Dynamic crawler metadata covers `/tours/:slug`, `/packages/:slug`, and `/blog/:slug` in `server/seoMiddleware.ts:652-838`.
- SPA-only/account-sensitive routes are explicitly noindexed in `server/seoMiddleware.ts:841-862` and served with `X-Robots-Tag: noindex, nofollow` in `server/seoMiddleware.ts:997-1005`.
- Unknown paths and unknown content slugs return 404 with noindex in `server/seoMiddleware.ts:1009-1023`, reducing soft-404 risk.

### Sitemap and robots

- Robots source allows public content areas and disallows admin/API/auth/private-album/status areas in `client/public/robots.txt:1-23`.
- Sitemap source includes static pages, commercial page pairs, DB/fallback tour slugs, DB/fallback blog slugs, and published packages in `server/routes/sitemap.ts:54-163` and `server/routes/sitemap.ts:217-265`.
- Sitemap source builds hreflang links for commercial route pairs and en/x-default links for other routes in `server/routes/sitemap.ts:172-203`.
- Public evidence: `/robots.txt` 200; `/sitemap.xml` 200 with 42 parsed URL entries.

### Hreflang and bilingual routing

- Commercial route pairs are centralized in `shared/commercialSeo.ts:21-85` for kosher, Hebrew-guide, and family-tour intents.
- Commercial pages use reciprocal alternates in client metadata at `client/src/pages/HebrewLandingPage.tsx:48-58`.
- Public sampled commercial routes returned reciprocal `en`, `he`, and `x-default` hreflang tags.
- Core routes currently expose `en` and `x-default` only in server-rendered metadata, which is consistent with one canonical URL per core page even though the UI can switch language client-side.

### Structured data and local-discovery facts

- Server LocalBusiness/TravelAgency JSON-LD includes name, alternateName, description, URL, logo, images, phone, email, street address, geo, map URL, area served, languages, hours, price range, WhatsApp contact point, and reserve/communicate actions in `server/seoMiddleware.ts:166-229`.
- The baked shell has LocalBusiness/TravelAgency + Service + WebSite JSON-LD in `client/index.html:96-202`.
- Homepage client JSON-LD contains TravelAgency and TouristTrip data in `client/src/pages/Home.tsx:25-59`.
- Contact page client JSON-LD has a LocalBusiness object in `client/src/pages/Contact.tsx:38-74`.
- FAQ page client JSON-LD emits FAQPage from visible FAQ items in `client/src/pages/FAQ.tsx:189-208`.
- Tour detail client JSON-LD emits TouristTrip data with Offer and provider in `client/src/pages/TourDetail.tsx:1236-1280`.

### Internal linking and conversion paths

- Desktop header links primary routes and an Explore dropdown in `client/src/components/Header.tsx:120-211`.
- Mobile header links tours, packages, pricing, gallery, car rental, blog, FAQ, about, contact, and WhatsApp in `client/src/components/Header.tsx:276-350`.
- Homepage links the three commercial planning guides from a dedicated section in `client/src/pages/Home.tsx:63-78` and `client/src/pages/Home.tsx:118-135`.
- Footer quick links cover tours, pricing, gallery, blog, reviews, about, car rental, terms, and privacy in `client/src/components/Footer.tsx:47-125`.
- Footer contact area exposes city, phone, email, and WhatsApp in `client/src/components/Footer.tsx:128-174`.
- WhatsApp link construction is centralized through `TrackedWhatsAppLink` and attribution builder usage at `client/src/components/TrackedWhatsAppLink.tsx:28-40`.

## Public HTTP sample details

Sample method: unauthenticated GET requests to `https://www.wiro4x4indochina.com` from this repo workspace, extracting status, title, meta description, robots, canonical, hreflang, JSON-LD count, X-Robots-Tag, and sitemap membership.

Positive samples:

- `/`: 200, index/follow, canonical `https://www.wiro4x4indochina.com/`, 1 JSON-LD script.
- `/tours`: 200, index/follow, canonical `/tours`, 2 JSON-LD scripts.
- `/packages`: 200, index/follow, canonical `/packages`.
- `/pricing`: 200, index/follow, canonical `/pricing`.
- `/blog`: 200, index/follow, canonical `/blog`, 2 JSON-LD scripts.
- `/contact`: 200, index/follow, canonical `/contact`, 2 JSON-LD scripts.
- `/kosher-tours`, `/hebrew-guide`, `/private-family-tours`, `/he/kosher-tours-chiang-mai`, `/he/hebrew-guide-chiang-mai`, `/he/private-family-tours-chiang-mai`: all 200, index/follow, canonical self, reciprocal commercial hreflang tags.
- `/tours/doi-inthanon-roof-of-thailand`: 200, index/follow, canonical self, TouristTrip-style dynamic metadata present.
- `/packages/northern-thailand-3d2n`: 200, index/follow, canonical self.

Noindex / non-index samples:

- `/admin`: 200, meta robots noindex/nofollow, `X-Robots-Tag: noindex, nofollow`, no-store cache.
- `/booking/success`: 200, meta robots noindex/nofollow, `X-Robots-Tag: noindex, nofollow`, no-store cache.
- `/not-a-real-page`: 404, meta robots noindex/nofollow, `X-Robots-Tag: noindex, nofollow`.

Caution sample:

- `/blog/kosher-food-chiang-mai-complete-guide` returned 404/noindex in public sampling. This is not necessarily a defect because the source fallback slug is `kosher-dining-guide` in `shared/seoFallbackContent.ts:22-35`; avoid using old or guessed blog URLs in internal links/campaigns.

## Prioritized P0/P1 opportunity list

### P0

No P0 technical SEO/indexability blocker was found in the sampled core public routes.

Acceptance for keeping P0 clear:

- Core public routes continue to return 200, self-canonical, and index/follow.
- Account/private/status routes continue to return noindex and/or 404 as appropriate.
- Sitemap continues to include only canonical public URLs.

### P1-1: Align all client-side structured data phone/contact facts to the verified constants

Intent: Improve local discovery consistency and reduce stale or masked NAP data in hydrated metadata.

Evidence:

- Verified phone constants exist in `shared/const.ts:8-13`.
- Contact page client JSON-LD hardcodes masked telephone `+668****1397` in `client/src/pages/Contact.tsx:45-53`.
- Tour detail client JSON-LD hardcodes masked telephone `+668****1397` in `client/src/pages/TourDetail.tsx:1254-1260`.
- Server LocalBusiness JSON-LD uses constants for phone/email/WhatsApp in `server/seoMiddleware.ts:20-24` and `server/seoMiddleware.ts:166-229`.

Recommended reversible change:

- Replace client JSON-LD hardcoded/masked phone values with `COMPANY_PHONE` or equivalent imported constants.
- Avoid adding unverified fields; keep public contact email as `COMPANY_EMAIL` and sender emails separate.

Acceptance criteria:

- Source search for `+668****1397` returns only old docs/tests where masking is intentional, not live client structured data.
- Public `/contact` and one tour detail still return valid JSON-LD after deploy.
- WhatsApp CTA still resolves to `https://wa.me/66816401397` with attribution parameters/message.

### P1-2: Reconcile client-vs-server metadata wording for pricing and kosher claims

Intent: Keep search snippets and social previews truthful, especially around included services and pricing.

Evidence:

- Server `/pricing` description says private tours from `$98/group`, multi-day packages, kosher meal add-ons, and peak season rates in `server/seoMiddleware.ts:254-258`.
- Client `/pricing` metadata says private vehicle, Hebrew guide, kosher meals included in `client/src/pages/Pricing.tsx:161-165`.
- Project/product guidance says use “kosher-friendly planning” unless a specific certified claim is proven in `PRODUCT.md:38-42`.

Recommended reversible change:

- Align client `/pricing` metadata to server wording or a Mike-approved alternative that does not imply every package includes kosher meals/Hebrew guide unless confirmed.

Acceptance criteria:

- Server and client metadata for `/pricing` describe the same offer and do not overclaim inclusions.
- Mike approves any pricing wording before release.
- QA verifies public raw HTML and hydrated browser metadata after deploy.

### P1-3: Strengthen internal links to commercial landing pages beyond the homepage planning guide block

Intent: Improve crawl depth and user discovery for high-intent pages: kosher tours, Hebrew-speaking guide, and private family tours.

Evidence:

- Commercial landing pages exist and are route-paired in `shared/commercialSeo.ts:25-84`.
- Homepage links these guides in `client/src/pages/Home.tsx:63-78` and `client/src/pages/Home.tsx:118-135`.
- Header main/explore menus do not expose kosher/hebrew-guide/private-family-tour landing pages directly in `client/src/components/Header.tsx:120-211` and `client/src/components/Header.tsx:276-350`.
- Footer quick links omit these planning guides in `client/src/components/Footer.tsx:47-125`.

Recommended reversible change:

- Add a compact “Planning guides” group in the footer linking to `/kosher-tours`, `/hebrew-guide`, and `/private-family-tours` with Hebrew equivalents where the language context is Hebrew.
- Optionally add one “Planning” dropdown group in the Explore menu if UX remains uncluttered.

Acceptance criteria:

- Footer contains crawlable internal links to all three English commercial landing pages and, when Hebrew UI is active, to the Hebrew equivalents.
- No duplicate/overcrowded primary navigation on mobile.
- Public page source or rendered DOM confirms the links are reachable without form/login actions.

### P1-4: Make visible NAP/local-discovery content match approved structured data

Intent: Support local discovery and trust by aligning visible contact page/footer facts with structured data, without inventing address details.

Evidence:

- Server structured data includes street address `183/15 Chang Klan Rd`, district, region, postal code, and geo coordinates in `server/seoMiddleware.ts:180-193`.
- Footer visible contact only says `Chiang Mai, Thailand` in `client/src/components/Footer.tsx:134-137`.
- Contact page visible location card only says `Chiang Mai, Thailand` in `client/src/pages/Contact.tsx:236-249`.
- Contact page map embed uses a generic/approximate embed string in `client/src/pages/Contact.tsx:456-471`.

Recommended reversible change:

- After Mike approves the exact public NAP, show the same approved address on `/contact` and optionally footer.
- Use the approved Google Maps profile/embed/share URL if available; do not invent a Place ID or GBP URL.

Acceptance criteria:

- Visible NAP, JSON-LD address, map link/embed, and Google Business Profile data (when checked by Mike/account owner) match exactly.
- If Mike does not want to publish the street address, structured data should be reviewed for consistency with the visible business model.

### P1-5: Verify or remove placeholder social profile URLs before using them as trust/local signals

Intent: Avoid linking customers/crawlers to unclaimed or incorrect profiles.

Evidence:

- Social constants are marked TODO in `shared/const.ts:24-27`.
- Footer renders Facebook and Instagram links from those constants in `client/src/components/Footer.tsx:178-212`.
- Server LocalBusiness `sameAs` currently includes WhatsApp only in `server/seoMiddleware.ts:216`, which is safer until social profiles are verified.

Recommended reversible change:

- Mike confirms real Facebook/Instagram profile URLs, or Developer hides those footer links until confirmed.
- Only after confirmation, consider adding verified social URLs to LocalBusiness `sameAs`.

Acceptance criteria:

- Footer social links open verified WIRO-owned profiles.
- `shared/const.ts` no longer has TODO comments for live social URLs, or the UI does not render unverified links.
- No unverified social URLs are added to structured data.

### P1-6: Keep sitemap/blog campaign URLs tied to actual canonical slugs

Intent: Prevent wasted crawl paths and broken campaign links.

Evidence:

- Fallback blog slugs are defined in `shared/seoFallbackContent.ts:22-100`.
- Public sample of guessed/old `/blog/kosher-food-chiang-mai-complete-guide` returned 404/noindex.
- Sitemap generation includes fallback blog slugs in `server/routes/sitemap.ts:259-264`.

Recommended reversible change:

- When drafting posts/newsletters/internal links, use the sitemap or `FALLBACK_BLOG_POSTS`/DB slugs as source of truth.
- Add redirects only if Search Console/analytics later proves meaningful external links to old URLs.

Acceptance criteria:

- New content briefs and campaign links use canonical slugs present in `/sitemap.xml`.
- Any legacy redirect request cites evidence from Search Console, server logs, or known external campaign URLs.

## External/account-side approval-gated checklist

Do not perform these without Mike/client approval and proper account access.

Search Console:

- Verify property ownership and sitemap submission for `https://www.wiro4x4indochina.com/sitemap.xml`.
- Inspect representative URLs: `/`, `/tours`, `/kosher-tours`, `/he/kosher-tours-chiang-mai`, `/contact`, one tour detail, one package detail, one blog post.
- Export actual coverage/indexing issues before prioritizing redirects or noindex changes.
- Do not report rankings, impressions, or traffic without exported evidence.

Google Business Profile:

- Confirm exact business name, category, address/service-area choice, phone, website, WhatsApp/contact links, hours, photos, and services.
- Ensure GBP NAP matches website visible content and structured data.
- Confirm whether street address should be public or service-area only.
- Add services/posts/photos only after Mike approves claims, images, and wording.

Analytics/measurement:

- Confirm WhatsApp click tracking and form lead tracking only with QA/developer help.
- Validate Plausible/analytics events against real test events; do not infer conversions from code alone.
- Confirm Search Console and analytics are linked only if Mike approves.

Vercel/production:

- Do not deploy from this SEO task.
- Developer/QA should run relevant checks and use a preview URL before Mike-approved production release.

## Handoff summary

STATUS: Complete draft audit.
OUTCOME: Durable findings written for SEO/developer planning; no implementation or external account action taken.
EVIDENCE: Local source files and public HTTP samples cited above.
ASSUMPTIONS / UNKNOWNS: No account-side data; social/GBP/NAP exact state unknown; no ranking or traffic claims made.
RISKS / BLOCKERS: Public implementation requires Mike approval plus Developer/QA verification.
APPROVAL GATE: Mike approval for claim/pricing/NAP/social/profile wording and any production deploy.
NEXT OWNER / ACTION: SEO to request approval for P1 scope; Developer/QA to implement approved local fixes and smoke-test metadata, sitemap, robots, WhatsApp, form, and CTA flow before release.
