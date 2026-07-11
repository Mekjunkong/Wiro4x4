# SEO and booking attribution MVP design

This specification defines a 90-day acquisition and measurement system for
WIRO 4x4. It focuses on Israeli and Jewish families who need private Chiang Mai
trips with Hebrew communication, kosher-aware planning, and Shabbat-sensitive
scheduling. The system must connect organic discovery to confirmed tours without
requiring WhatsApp Business API or a second CRM.

## Goals

The MVP must let WIRO answer these questions:

- Which Google queries and landing pages attract prospective customers?
- Which pages and calls to action start WhatsApp conversations?
- Which WhatsApp inquiries become qualified, quoted, confirmed, completed, or
  lost?
- Which sources, languages, and tour interests produce confirmed revenue?
- Where do visitors leave the website funnel before contacting WIRO?

The primary 90-day outcome is an observable funnel from organic landing to
confirmed tour. Traffic growth without qualified inquiries does not count as
success.

## Audience and positioning

The primary audience is Israeli and Jewish families planning a Chiang Mai or
Northern Thailand trip. WIRO's differentiation is:

- Personal Hebrew and English communication.
- Private family-friendly 4x4 routes.
- Kosher-aware meal coordination with explicit requirement confirmation.
- Shabbat-sensitive scheduling.
- Local Chiang Mai route and pickup knowledge.

Copy must avoid unsupported certification, affiliation, safety, availability,
or response-time claims. Use "kosher-aware planning" unless a specific claim is
documented and verifiable.

## Scope

The MVP contains two coupled workstreams. Search landing pages create qualified
demand, and attribution records whether that demand produces confirmed tours.

### In scope

- Verify and expose Search Console readiness through correct sitemap,
  canonical, `hreflang`, and crawlable server-rendered metadata.
- Add indexable Hebrew landing URLs for kosher tours, Hebrew guide services,
  and private family tours.
- Strengthen commercial page content around itinerary, duration, pricing,
  inclusions, exclusions, pickup, group size, family suitability, planning
  constraints, proof, and WhatsApp availability.
- Capture first-touch attribution in the browser.
- Generate stable source codes for important WhatsApp entry points.
- Send consistent Plausible funnel and behavior events with non-sensitive
  properties.
- Extend the existing lead model and admin Leads tab for manual WhatsApp inquiry
  creation, attribution, status, value, and loss reason.
- Extend the existing admin Analytics tab with source and outcome reporting.
- Add an operations checklist for Search Console and Plausible account setup
  that cannot be completed from code.

### Out of scope

- WhatsApp Business API, conversation scraping, or automated message ingestion.
- Google Analytics 4, Google Tag Manager, heatmaps, or session recording.
- Automated rank tracking or Search Console API ingestion.
- Online payment or deposit processing.
- A new standalone CRM.
- Bulk generation of destination pages.
- Fabricated reviews, ratings, credentials, or customer counts.

## Search acquisition design

### Search-intent clusters

Pages must support three commercial intent clusters:

1. Kosher-friendly private tours in Chiang Mai.
2. Hebrew-speaking guide services in Chiang Mai.
3. Private family 4x4 tours in Chiang Mai.

English pages remain the default. The following Hebrew URLs provide distinct,
indexable equivalents:

- `/he/kosher-tours-chiang-mai`
- `/he/hebrew-guide-chiang-mai`
- `/he/private-family-tours-chiang-mai`

Each Hebrew route must render Hebrew content immediately without depending on a
stored browser preference. It must set `lang="he"`, `dir="rtl"`, a unique Hebrew
title and description, a self-referencing canonical URL, and reciprocal English
and Hebrew `hreflang` links. `x-default` must point to the corresponding English
page.

The matching English pages are:

- `/kosher-tours`
- `/hebrew-guide`
- A new `/private-family-tours` page.

### Commercial page requirements

Each commercial landing page must include:

- A query-aligned H1 and opening paragraph.
- A concrete audience and use-case statement.
- Sample route or itinerary options.
- Duration and starting price or a truthful price range.
- Included and excluded items.
- Pickup area and group-size guidance.
- Family and age suitability information.
- Kosher, Shabbat, and Hebrew support boundaries where relevant.
- Real WIRO imagery with descriptive alternative text.
- Verifiable proof links and no synthetic testimonials.
- One primary WhatsApp availability action with a page-specific source code.
- Internal links to relevant tour detail pages and supporting guides.

### Supporting content

The implementation may add internal links from existing articles, but new blog
articles are not part of this MVP. Future supporting topics include kosher
family planning, private versus group tours, family route logistics, and
Shabbat planning. Each future article must support one commercial page.

### Technical SEO

The server SEO middleware and sitemap must include the six commercial language
URLs. HTML returned without client-side JavaScript must contain the correct
title, description, canonical, language alternates, and indexability policy.
The sitemap must contain only canonical, indexable URLs.

## Attribution design

### First-touch attribution

Create one attribution utility that captures the first landing context in
`localStorage`:

- Landing path.
- Referring host, without full sensitive URLs.
- UTM source, medium, campaign, and content.
- Google click identifier presence as a boolean, not the identifier value.
- Initial language.
- First-visit timestamp.

The utility must preserve the first touch for 90 days and expose the current
session landing page separately. It must tolerate unavailable storage and never
block navigation.

Do not store search terms, message content, email addresses, phone numbers, or
other personal data in Plausible properties or browser attribution storage.

### WhatsApp source codes

All high-value WhatsApp links must use one shared URL builder. The builder adds
a stable, human-readable source capsule to the prefilled message. The capsule
transfers non-sensitive first-touch attribution into the WhatsApp conversation
without a visitor identifier. Its versioned format is:

`[WIRO:v1|SOURCE_CODE|CHANNEL|UTM_SOURCE|UTM_MEDIUM|UTM_CAMPAIGN|LANDING_PATH]`

Each value must use a normalized allowlist of URL-safe characters and a bounded
length. Missing values use `-`. The builder must reject message content,
personal data, click identifiers, full referrer URLs, and arbitrary unbounded
values. Example source codes include:

- `HOME-HERO-EN`
- `HOME-FLOAT-HE`
- `KOSHER-PAGE-HE`
- `HEBREW-GUIDE-HE`
- `FAMILY-PAGE-EN`
- `TOUR-DOI-INTHANON-EN`

The source code must identify page, placement when relevant, and language. It
must not contain a visitor identifier. An authenticated admin can paste the
capsule from the incoming message into the manual lead form. A shared parser
validates the capsule and populates source code, source channel, UTM fields, and
landing page. If a customer removes the capsule, the admin can select a source
code manually and the remaining attribution fields stay unknown.

Maintain one canonical source-code registry. Each entry defines page,
placement, language, and a deterministic channel fallback. Both the WhatsApp
builder and admin source selector must use this registry. The builder must also
trigger a `whatsapp_click` event before navigation with page, placement,
language, tour, source code, and first-touch channel properties.

### Plausible event model

Use a single naming convention and shared typed helpers. Required events are:

- `commercial_page_view`
- `tour_view`
- `pricing_view`
- `itinerary_expand`
- `proof_open`
- `faq_expand`
- `inquiry_start`
- `whatsapp_click`
- `booking_start`
- `booking_complete`
- `scroll_depth`

Allowed event properties are page, placement, language, tour slug, depth,
source channel, UTM values, and source code. Event code must remain a no-op when
Plausible is unavailable.

Scroll depth must fire once per page at 25%, 50%, and 90%, with a maximum of
three events per page view. It must respect navigation within the single-page
application and avoid duplicate listeners.

Plausible account configuration is an operational step. The implementation
must document the goals and funnel definitions because events do not appear as
dashboard goals until matching goals are created in Plausible settings.

## Lead and booking outcome design

### Existing funnel mapping

Reuse the existing lead statuses:

- `new`: WhatsApp inquiry recorded.
- `contacted`: inquiry is qualified and WIRO has replied.
- `quoted`: route and price were offered.
- `converted`: customer verbally confirmed the tour.
- `lost`: customer declined or stopped responding.

A completed tour remains represented by an associated booking when one exists.
For WhatsApp-only confirmations without a booking record, a nullable
`completedAt` milestone records that the converted lead traveled. The admin can
mark a converted lead completed or undo that action without changing its lead
status. The MVP must not add a second competing status model. Analytics may
label `converted` as "Confirmed" in user-facing copy.

### Lead fields

Extend the existing lead record with nullable fields:

- `sourceCode`
- `sourceChannel`
- `landingPage`
- `language`
- `utmSource`
- `utmMedium`
- `utmCampaign`
- `travelDate`
- `groupSize`
- `estimatedValueThb`
- `lostReason`
- `completedAt`

Change the lead email database column to nullable with an additive migration.
Define a separate authenticated `adminLeadInputSchema` that requires a name or
recognizable WhatsApp label plus a phone number and accepts an optional email.
The public `leadInputSchema` and public creation endpoint must keep the existing
required, valid email behavior. Admin lead creation must use its own protected
procedure and must never generate placeholder email addresses.

Store estimated value as a non-negative integer number of Thai baht in
`estimatedValueThb`. Do not aggregate mixed currencies in this MVP. If a quote
uses another currency, the operator converts it to THB before entry. Label all
estimated-value input and output explicitly as THB.

### Admin workflow

Add an inline "Add WhatsApp inquiry" action to the existing Leads tab. It must
open a compact form, not a separate CRM surface. The required workflow is:

1. Enter customer name or WhatsApp label and phone number.
2. Paste the attribution capsule or select a source code.
3. Enter tour interest, travel date, and group size when known.
4. Save the lead with status `new`.
5. Update the existing status control as the conversation progresses.
6. Enter estimated value when quoted or confirmed.
7. Require a loss reason when status becomes `lost`.
8. Mark the tour completed after the customer travels.

The common create flow must take under 30 seconds on mobile and desktop. The
form must provide clear validation, preserve entered values after a recoverable
error, and prevent duplicate submissions while saving.

### Analytics reporting

Extend the existing admin analytics with:

- Leads by source code and source channel.
- Confirmed leads by source code.
- Completed tours by source code.
- Lead-to-confirmed conversion rate.
- Confirmed-to-completed conversion rate.
- Estimated confirmed value by source.
- Funnel counts for new, contacted, quoted, converted, and lost.
- Loss reasons.

Reports must show "Unknown" rather than dropping records without attribution.
Revenue reporting must remain separate from estimated lead value so verbal
confirmations are not presented as collected revenue.

## Search Console and operations setup

Add a concise operator runbook with these manual steps:

1. Confirm ownership of the domain property in Google Search Console.
2. Submit `/sitemap.xml`.
3. Inspect the six commercial landing URLs.
4. Export the previous three to six months of queries, pages, countries, and
   devices before launch.
5. Separate branded and non-branded queries when the property has enough data.
6. Create Plausible goals for the required events.
7. Create a funnel from commercial page view through WhatsApp click.
8. Review leads and update outcomes at least once per working day.
9. Review SEO and booking performance weekly for 90 days.

The weekly review must track non-branded impressions, clicks from Israel,
Hebrew-query impressions, commercial landing visits, WhatsApp clicks, recorded
inquiries, confirmed tours, conversion rate, estimated confirmed value, and
loss reasons.

## Accessibility, privacy, and reliability

- Hebrew pages must support keyboard navigation, screen readers, and RTL layout.
- Interactive targets must remain at least 44 pixels.
- Analytics failures must never prevent page rendering or WhatsApp navigation.
- No personal or message data may be sent to Plausible.
- Client attribution must degrade safely when storage is blocked.
- Admin mutation endpoints must require authentication, rate limiting where
  appropriate, schema validation, and audit logging.
- Database changes must be additive and backward compatible.

## Testing and acceptance criteria

The work passes only when automated tests and an independent reviewer approve
it.

Required automated coverage includes:

- Attribution capture, 90-day expiry, and unavailable-storage behavior.
- WhatsApp source-code generation and URL encoding.
- Attribution capsule normalization, parsing, and rejection of personal or
  malformed values.
- Plausible event property filtering and no-op behavior.
- Hebrew route metadata, canonical URLs, `hreflang`, and sitemap entries.
- Public lead validation remains unchanged.
- Authenticated WhatsApp lead creation without email.
- Lead attribution fields, status updates, THB estimated value, loss reason,
  and completion milestone.
- Analytics aggregation, including unattributed records.

Required verification commands are:

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Browser verification must cover English and Hebrew landing pages at mobile and
desktop sizes, WhatsApp message source codes, manual lead creation, status and
value updates, analytics display, keyboard navigation, and console errors.

## Rollout

Deploy the changes behind the existing production workflow after all gates
pass. After deployment:

1. Verify the production HTML and sitemap for all commercial routes.
2. Verify Plausible receives each configured event without personal data.
3. Complete Search Console and Plausible account setup from the runbook.
4. Record every serious WhatsApp inquiry for 30 days before changing the
   measurement model.
5. Evaluate session recording or additional analytics only if the funnel data
   cannot explain drop-off.

## Pass definition and retry policy

An implementation "passes" only when the independent reviewer approves the
delivered behavior and all required checks pass. If either condition fails, the
implementer receives the review notes and test failures, then retries. Stop and
ask the user for direction after five failed implementation attempts.

## Next steps

Review this specification for planning readiness. After approval, create a
task-by-task implementation plan, review that plan, and execute it in the
isolated worktree using the requested implementation and review loop.
