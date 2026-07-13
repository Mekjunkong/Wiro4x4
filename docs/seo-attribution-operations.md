# SEO attribution operations runbook

Use this runbook to connect Google discovery, website behavior, WhatsApp
inquiries, and completed tours for the first 90 days after launch. Complete the
one-time account setup first, then follow the daily and weekly checklists. The
runbook uses the exact events, source codes, lead statuses, and reporting rules
implemented by WIRO 4x4.

<!-- prettier-ignore -->
> [!IMPORTANT]
> Search Console and Plausible setup requires access to the WIRO accounts.
> Website code can emit events and publish a sitemap, but it cannot verify DNS,
> submit the sitemap, create Plausible goals, or create a funnel by itself.

## Operating rhythm

Keep ownership simple so missing data is found while it can still be corrected.

- **Once after deployment:** The domain and DNS owner verifies Search Console.
  The analytics account owner creates Plausible goals and the funnel.
- **Every working day:** The WIRO owner or sales operator records serious
  WhatsApp inquiries and updates their outcomes.
- **Once each week for 90 days:** The WIRO owner saves the scorecard at the same
  time and uses the diagnostic thresholds in this runbook.
- **Once each month:** The technical maintainer reviews Search Console indexing,
  event delivery, unknown attribution, and any repeated data-quality alerts.

## Set up Google Search Console

Use a Domain property so the report includes both `www` and non-`www` hosts and
all protocols. Google's current instructions are in [Add a website property to
Search Console](https://support.google.com/webmasters/answer/34592?hl=en).

### Verify the Domain property with DNS

Domain-property verification requires access to the DNS provider for
`wiro4x4indochina.com`.

1. Open [Google Search Console](https://search.google.com/search-console).
2. Open the property selector, select **Add property**, and choose **Domain**.
3. Enter `wiro4x4indochina.com` without `https://`, `www`, or a path.
4. Copy the TXT record that Google provides.
5. At the DNS provider, add that TXT record to the root domain. Keep all
   unrelated DNS records unchanged.
6. Return to Search Console and select **Verify** after the record is available.
7. Keep the verification TXT record in DNS after verification.

If another owner has already verified the Domain property, ask that owner to
grant access instead of creating a competing property. A failed verification is
a DNS-access issue, not a reason to change website routing.

### Submit the sitemap

Submit the canonical production sitemap only after the new commercial routes
are live. Google's current workflow is documented in the [Sitemaps
report](https://support.google.com/webmasters/answer/7451001?hl=en).

1. Open `https://www.wiro4x4indochina.com/sitemap.xml` in a signed-out browser
   and confirm that it loads without a login prompt.
2. In the verified Domain property, open **Sitemaps**.
3. Under **Add a new sitemap**, enter
   `https://www.wiro4x4indochina.com/sitemap.xml`.
4. Select **Submit**.
5. Confirm that the submitted sitemap eventually reports **Success**. If it
   doesn't, open the sitemap row and record the exact fetch or parsing error.

### Inspect all six commercial routes

Inspect every English and Hebrew URL separately. URL Inspection reports the
indexed version and can also test the live page; it doesn't guarantee that
Google will index a page. See Google's [URL Inspection
guide](https://support.google.com/webmasters/answer/9012289?hl=en).

- `https://www.wiro4x4indochina.com/kosher-tours`
- `https://www.wiro4x4indochina.com/he/kosher-tours-chiang-mai`
- `https://www.wiro4x4indochina.com/hebrew-guide`
- `https://www.wiro4x4indochina.com/he/hebrew-guide-chiang-mai`
- `https://www.wiro4x4indochina.com/private-family-tours`
- `https://www.wiro4x4indochina.com/he/private-family-tours-chiang-mai`

For each URL, complete the same inspection sequence:

1. Paste the full URL into the inspection bar at the top of Search Console.
2. Record whether **URL is on Google** or the report gives an exclusion reason.
3. Select **Test live URL** and confirm that the page fetch succeeds and the
   page is eligible for indexing.
4. Open the page details and confirm that the user-declared canonical is the URL
   being inspected. After Google recrawls the page, compare Google's selected
   canonical as well.
5. Select **Request indexing** when the live page passes and the URL is new or
   materially changed.
6. Recheck any excluded URL after Google processes the sitemap. Escalate a
   canonical mismatch, blocked page, `noindex`, redirect, or fetch failure.

### Export the pre-launch baseline

Save a three-to-six-month baseline before judging the launch. Use six months
when the property has that much useful data; otherwise, use the longest period
available, with a minimum target of three months. Search Console exports the
current report view and its active filters, as described in [Export data from a
report](https://support.google.com/webmasters/answer/12919797?hl=en).

1. Open **Performance** and then **Search results**.
2. Set **Search type** to **Web**.
3. Set a custom date range covering the previous three to six complete months.
4. Enable **Total clicks**, **Total impressions**, **Average CTR**, and
   **Average position**.
5. Open **Queries**, select **Export**, and save a CSV, Excel file, or Google
   Sheet with `baseline-queries` and the date range in its name.
6. Repeat the export from **Pages**, **Countries**, and **Devices** without
   changing the date range.
7. Save the four exports outside the source-code repository in the restricted
   WIRO operations folder.
8. Record the property name, export date, date range, search type, and active
   filters beside the files.

Search Console may omit anonymized queries, and a normal report export contains
at most the rows shown by the report. Don't force exported query rows to equal
the chart total.

### Separate branded and non-branded queries

Use Search Console's native branded-query filter when it is available. Google
only shows it for properties with enough impressions, and its classification is
informational rather than perfect. The behavior is documented in [Performance
report dimensions](https://support.google.com/webmasters/answer/17011259?hl=en).

1. In **Performance** > **Search results**, keep the baseline date range and
   select **Queries**.
2. Add the native **Branded queries** filter and export the view.
3. Change the filter to **Non-branded queries** and export the view.
4. If the native filter is unavailable, add a **Query** > **Custom (regex)**
   filter that matches reviewed WIRO variants such as
   `(wiro|wiro4x4|wiro 4x4|wiro 4x4 indochina)`.
5. Export the matching view as branded. Change the condition to **Doesn't match
   regex** and export the non-branded view.
6. Review unexpected terms before changing the regex, and keep the same regex
   for all later comparisons.

Query filters are case-insensitive by default. Applying a query filter can
change the report total because anonymized queries are excluded. Google's
[advanced filtering guide](https://support.google.com/webmasters/answer/17011165?hl=en)
documents these limitations.

## Set up Plausible

The website sends eleven privacy-bounded custom events. Configure all of them
as custom event goals, then create one two-step commercial funnel.

<!-- prettier-ignore -->
> [!IMPORTANT]
> An emitted custom event does not become a dashboard goal automatically. Create
> a goal whose name matches the event character for character, including
> lowercase letters and underscores. Plausible doesn't backfill conversions
> sent before the matching goal was created.

### Create the custom event goals

Follow Plausible's current [custom event goal
instructions](https://plausible.io/docs/custom-event-goals) for the WIRO site.

1. Open the settings for `www.wiro4x4indochina.com` in Plausible.
2. Open **Goals** and select **Add goal**.
3. Choose **Custom event**.
4. Enter one exact event name from the list below. Don't add a property filter.
5. Select **Add goal**.
6. Repeat the process until all eleven goals exist.

Create these exact goals:

- `commercial_page_view`: a visitor views a registered commercial route,
  including any of the six SEO landing routes.
- `tour_view`: a visitor views a tour or package detail.
- `pricing_view`: pricing becomes visible on a pricing, tour, or package page.
- `itinerary_expand`: a visitor expands itinerary information.
- `proof_open`: a visitor opens a proof or review link.
- `faq_expand`: a visitor expands an FAQ answer.
- `inquiry_start`: a visitor starts the quick inquiry form.
- `whatsapp_click`: a visitor selects a tracked WhatsApp action.
- `booking_start`: a visitor opens the booking form.
- `booking_complete`: the booking success page records completion.
- `scroll_depth`: a visitor reaches 25%, 50%, or 90% of a page.

The code permits only these custom property keys: `page`, `placement`,
`language`, `tour`, `depth`, `sourceChannel`, `utmSource`, `utmMedium`,
`utmCampaign`, and `sourceCode`. Not every event contains every property.

### Create the commercial-to-WhatsApp funnel

Use a sequential funnel because a visitor may read details or pricing between
the landing page and WhatsApp. Plausible currently offers funnels on eligible
Business plans; see [Funnel analysis](https://plausible.io/docs/funnel-analysis).

1. Open the WIRO site settings and select **Funnels**.
2. Select **Add funnel**.
3. Name the funnel `Commercial page to WhatsApp`.
4. Add step 1 as the custom event goal `commercial_page_view`.
5. Add step 2 as the custom event goal `whatsapp_click`.
6. Keep **Allow other activity in between funnel steps** enabled so the funnel
   is sequential.
7. Select **Save**.
8. Trigger both events in order on the live website and confirm that the funnel
   begins receiving data.

Don't add `inquiry_start` between the two steps. Some visitors use a direct
WhatsApp action and never open the quick inquiry form. If **Funnels** is absent,
record that the current Plausible plan doesn't include the feature and track
the two goal totals separately until access changes.

### Verify live event delivery and privacy

Inspect the browser request before trusting the dashboard. Plausible recommends
looking for `plausible.io/api/event` in the Network panel when testing a custom
event.

1. Open a production commercial route in a private browser window. Use a URL
   without a name, email, phone number, message, or secret in its path or query.
2. Open browser developer tools, select **Network**, and filter for
   `plausible.io/api/event`.
3. Trigger the event being tested. For `whatsapp_click`, inspect the request
   without sending the WhatsApp message.
4. Open the request payload and confirm that its event name matches one of the
   eleven exact names above.
5. Inspect the custom properties. Confirm that every property key is in the
   allowlist above and every value is a page or bounded reporting label.
6. Search the complete request for the test visitor's name, email, phone,
   WhatsApp message, full referrer URL, and any `gclid`, `gbraid`, or `wbraid`
   value. None may appear in WIRO's event name or custom properties.
7. Confirm that the response doesn't include `x-plausible-dropped: 1`. That
   response means Plausible received but rejected the event.
8. After creating the matching goal, confirm that a new live test conversion
   appears. Earlier events aren't backfilled.

Plausible's transport includes standard analytics fields such as the site
domain and current page URL. The WIRO-specific privacy boundary is that custom
events and `props` never add personal data, message text, a full referrer URL,
or a click-identifier value. Never test analytics from a URL that already
contains personal data.

## Handle WhatsApp attribution safely

The source capsule is a non-sensitive reporting label appended to a prefilled
WhatsApp message. It has no visitor ID and must never be edited to include
customer or conversation data.

The exact version 1 structure is:

```text
[WIRO:v1|SOURCE_CODE|CHANNEL|UTM_SOURCE|UTM_MEDIUM|UTM_CAMPAIGN|LANDING_PATH]
```

Missing values use `-`. The capsule stores a registered source code, normalized
channel and UTM labels, and a landing path. It doesn't store a name, email,
phone number, message, search term, full referrer URL, or Google click ID. A
Google click ID may set the channel to `paid`, but its value is never stored.

### Recognize commercial source codes

The six commercial pages currently use these exact source-code and path pairs.
The admin selector gets them from the same registry as the public links.

- `KOSHER-PAGE-EN` for `/kosher-tours`.
- `KOSHER-PAGE-HE` for `/he/kosher-tours-chiang-mai`.
- `HEBREW-GUIDE-EN` for `/hebrew-guide`.
- `HEBREW-GUIDE-HE` for `/he/hebrew-guide-chiang-mai`.
- `FAMILY-PAGE-EN` for `/private-family-tours`.
- `FAMILY-PAGE-HE` for `/he/private-family-tours-chiang-mai`.

Never type a new source code into a capsule. If a public link needs a source
that isn't present in the admin selector, ask the technical maintainer to add it
to the canonical registry and deploy it first.

### Test a capsule without sending a message

Use benign test labels and stop before saving a lead or sending a WhatsApp
message. This procedure tests both the public link and the admin parser without
adding customer data.

1. Open a new private browser window so an older 90-day first touch doesn't
   replace the test values.
2. Visit
   `https://www.wiro4x4indochina.com/kosher-tours?utm_source=runbook&utm_medium=manual&utm_campaign=attribution-test`.
3. Open developer tools, use **Elements** to select the primary WhatsApp link,
   and inspect its `href`. Don't open the link.
4. With that link still selected, open **Console** and run this local command:

   ```js
   decodeURIComponent(new URL($0.href).searchParams.get("text") ?? "");
   ```

5. Confirm that the final line of the result is this capsule:

   ```text
   [WIRO:v1|KOSHER-PAGE-EN|manual|runbook|manual|attribution-test|%2Fkosher-tours]
   ```

6. In the WIRO admin, open **Leads** and select **Add WhatsApp inquiry**.
7. Paste only the test capsule into **Attribution capsule**.
8. Confirm that **Source preview** shows `KOSHER-PAGE-EN`, channel `manual`,
   language `EN`, landing `/kosher-tours`, and the three test UTM values.
9. Clear the form and close it without saving.

If the capsule reports **Capsule not recognized**, don't repair its separators
or replace values by hand. Confirm that the whole bracketed line was copied. If
it still fails, leave attribution unknown and escalate the public page and CTA
location to the technical maintainer. Don't share an invalid capsule if a
customer has inserted personal data into it.

## Update WhatsApp leads every working day

Record each serious inquiry on the day it arrives, then update its status as
the conversation changes. This is the bridge between anonymous website events
and real tour outcomes.

### Record a new inquiry

Use the existing admin lead workflow; don't create a second spreadsheet copy as
the source of truth.

1. In the WIRO admin, open **Leads** and select **Add WhatsApp inquiry**.
2. Enter the customer name or recognizable WhatsApp label and phone number.
   Email is optional.
3. Copy only the complete `[WIRO:v1|...]` line from the incoming WhatsApp
   message into **Attribution capsule**.
4. Confirm the parsed fields in **Source preview** before saving.
5. If there is no capsule, select **Manual source fallback** only when the exact
   website source is known. Otherwise, keep it as `Unknown`; don't guess.
6. Add tour interest, travel date, group size, and estimated value in THB when
   known.
7. Save the inquiry. A new WhatsApp lead starts with status **New**.

The exact missing-value label is `Unknown`, with a capital `U`. Keep missing
source code, channel, landing, language, and UTM fields unknown together when no
valid capsule or registered manual source exists. Don't use values such as
`Other`, `N/A`, `Direct?`, or a customer name to fill attribution gaps.

### Maintain the outcome

Use one status and one completion milestone for each lead.

- Set **New** when the inquiry has been recorded but not yet qualified.
- Set **Contacted** after WIRO replies and qualifies the inquiry.
- Set **Quoted** after WIRO offers a route and price.
- Set **Confirmed** after the customer verbally confirms. The stored status is
  `converted`, but the admin and reports label it **Confirmed**.
- Set **Lost** when the customer declines or stops responding. Enter a concise
  loss reason before selecting **Lost**.
- Select **Mark completed** only after a confirmed customer travels. Select
  **Undo completed** if it was marked by mistake.

Enter or correct **Estimated value (THB)** when the route and price are known.
Convert a quote in another currency to a non-negative, whole number of Thai
baht before entry. Review all open **New**, **Contacted**, and **Quoted** leads
at least once each working day. When a lead becomes **Confirmed**, **Lost**, or
**Completed**, add one mark to that week's scorecard tally; the current admin
report doesn't preserve a date-filtered status-transition history.

### Apply the reporting definitions

Use the same definitions in every weekly scorecard so the numbers remain
comparable.

- **Lead:** One record in the admin Leads tab.
- **Confirmed:** A lead whose stored status is `converted`.
- **Completed:** A lead with a `completedAt` date or a linked booking whose
  booking status is `completed`. A lead meeting both conditions is counted
  once.
- **Lead-to-confirmed rate:** Confirmed leads divided by all leads.
- **Confirmed-to-completed rate:** Completed leads divided by confirmed leads.
- **Estimated confirmed value (THB):** The sum of `estimatedValueThb` only for
  leads currently marked **Confirmed**.
- **Collected revenue:** Financial revenue records. It is separate from
  estimated lead value and must never be replaced by it.

The attribution dashboard normalizes a blank source code, source channel, or
loss reason to exactly `Unknown` rather than dropping the record.

## Review the 90-day scorecard each week

Save the scorecard at the same weekday and time for 13 weeks. Compare a complete
seven-day period with the trailing four complete weeks, and keep the original
three-to-six-month Search Console export as the pre-launch baseline.

The admin attribution report is currently cumulative rather than date-filtered.
Record a dated snapshot of its totals each week and subtract the previous
snapshot to calculate net changes. Keep a daily tally of newly confirmed,
completed, and lost outcomes because a snapshot delta can't distinguish a new
outcome from a later correction. Don't describe the visible dashboard total as
a seven-day total.

### Record the weekly metrics

Use these definitions and sources for the scorecard.

- **Non-branded impressions:** Search Console impressions with the saved
  non-branded filter.
- **Clicks from Israel:** Search Console clicks with **Country** set to Israel.
- **Hebrew-query impressions:** Search Console impressions with a **Query** >
  **Custom (regex)** filter of `[א-ת]`. Keep the same filter each week.
- **Commercial landing visits:** Plausible **Total conversions** for
  `commercial_page_view` during the seven-day period.
- **WhatsApp clicks:** Plausible **Total conversions** for `whatsapp_click`
  during the same period.
- **Recorded inquiries:** Lead records whose **Created At** date falls inside
  the period, counted from a Leads CSV export.
- **Confirmed tours:** The daily tally of leads newly moved to **Confirmed**
  during the period. If the tally is missing, use the cumulative dashboard
  change and label it **net confirmed change**.
- **Lead-to-confirmed conversion:** The cumulative dashboard count of confirmed
  leads divided by all leads. Record it as a cumulative rate; don't present
  weekly confirmations divided by weekly inquiries as a cohort conversion.
- **Estimated confirmed value:** The weekly increase in **Estimated confirmed
  value (THB)**, with corrections noted separately.
- **Loss reasons:** The daily tally of leads newly moved to **Lost**, grouped by
  the recorded reason. Label a snapshot-only result as a net change.

Use Plausible total conversions for event counts. A unique conversion counts a
visitor once, while total conversions count repeated events; the distinction is
documented in Plausible's [metrics
definitions](https://plausible.io/docs/metrics-definitions).

### Use thresholds as diagnostic alerts

These thresholds start an investigation; they aren't promises or industry
benchmarks. When a week has fewer than 20 commercial visits or fewer than five
recorded inquiries, record the numbers but mark conversion conclusions as
**low sample**.

- **Unknown source code above 20% of newly recorded leads:** Divide new lead
  records whose source code is `Unknown` by all new lead records. Inspect the
  public WhatsApp links, confirm capsules are present, and retrain the operator
  to paste the capsule. Don't relabel old leads by guessing.
- **Non-branded impressions or Israel clicks down at least 20% from the trailing
  four-week weekly average for two complete weeks:** Check sitemap status, URL
  Inspection, page indexing, canonical selection, and the pages and queries
  responsible for the decline.
- **No Hebrew-query impressions for four complete weeks:** Inspect the three
  Hebrew URLs, confirm that Google selected their own canonicals, and check the
  Hebrew titles, descriptions, and internal links before changing content.
- **Commercial-page-to-WhatsApp rate down at least 25% from its trailing
  four-week rate with at least 20 commercial visits:** Break down the two goals
  by page, language, country, and device. Test the affected WhatsApp action on
  mobile and desktop.
- **Plausible records WhatsApp clicks but no website-attributed inquiries for a
  complete week:** Audit daily lead entry and capsule parsing. Remember that one
  visitor can click more than once and some conversations never become serious
  inquiries, so the two totals don't need to match.
- **Cumulative lead-to-confirmed rate down at least 25% relative to the first
  weekly snapshot, after at least five new inquiries:** Review loss reasons,
  response delay, route fit, dates, and price objections before changing
  acquisition pages.
- **One loss reason reaches at least 50% of four or more weekly losses:** Review
  the affected source and tour, then define one owner action for the next week.
- **Any confirmed lead has no estimated THB value:** Add the best current quote
  estimate or document why it is unavailable. Don't copy collected revenue into
  the estimate.
- **A past travel date remains confirmed but not completed:** Verify whether the
  customer traveled, then mark the lead completed or correct its outcome.

## Diagnose common failures

Use the smallest safe correction and preserve evidence of the original error.

### Search Console failures

Search Console problems usually come from property scope, DNS, fetchability, or
page-level index signals.

- **Verification fails:** Confirm the selected property is the Domain property
  `wiro4x4indochina.com`, compare the TXT host and value character for
  character, and wait for DNS propagation. Don't remove other TXT records.
- **Sitemap can't be fetched:** Open the full sitemap URL signed out. Escalate a
  redirect loop, login requirement, `4xx`, `5xx`, or invalid XML response.
- **A URL isn't indexed:** Use **Test live URL**. Record the exact reason, user
  canonical, Google canonical, robots result, and fetch result. Don't keep
  requesting indexing until the underlying issue is fixed.
- **Performance has no data:** Confirm the correct Domain property and date
  range. A new property can take time to show data, and very low search demand
  can legitimately produce an empty report.

### Plausible failures

Separate event delivery from goal and funnel configuration.

- **No network request:**
  Confirm the Plausible script loads, an ad blocker isn't blocking the test,
  and the tested interaction actually fires an event.
- **Request has `x-plausible-dropped: 1`:** Retest on the configured production
  domain. Localhost and unconfigured staging traffic can be rejected as bots.
- **Request exists but the goal is absent:** Create a matching custom event goal
  with the exact lowercase-and-underscore name.
- **Goal remains at zero:** Trigger a fresh event after goal creation. Confirm
  the event name matches character for character; past events aren't backfilled.
- **Funnel remains at zero:** Confirm both goals work independently, the funnel
  order is `commercial_page_view` then `whatsapp_click`, and sequential mode is
  enabled.
- **Properties show missing values:** Some events don't send every allowed
  property. Investigate only when a property required for that interaction,
  such as `sourceCode` on `whatsapp_click`, is absent.

### Lead-report failures

Protect the source-of-truth record while correcting operator errors.

- **Capsule isn't recognized:** Copy the whole bracketed line again. Don't edit
  delimiters or invent values; use `Unknown` when no valid capsule remains.
- **Unknown share rises:** Find the affected page or operator before changing
  historical records. A real unknown is better than false attribution.
- **Completed exceeds expectations:** Confirm `completedAt` and any linked
  booking status. A lead satisfying both rules is still counted only once.
- **Estimated value looks like revenue:** Use **Estimated confirmed value
  (THB)** only for pipeline planning. Use financial revenue records for money
  actually collected.

## Escalate and roll back safely

Analytics must never block a page or WhatsApp navigation. Search ranking or
conversion movement alone is not a reason to roll back a deployment.

1. Stop the test immediately if an event or capsule contains a name, email,
   phone number, message, full referrer URL, or click-identifier value.
2. Record the production URL, UTC time, event name or CTA placement, browser,
   and a redacted screenshot. Don't copy the personal value into a ticket.
3. Ask the technical maintainer to disable the affected event or tracked link,
   or roll production back to the last verified commit if personal data is
   being sent, WhatsApp navigation is broken, a commercial route returns an
   error, or canonical/indexability output regressed.
4. Keep the public WhatsApp contact available through a verified safe link if a
   tracked link is disabled.
5. Retest the exact production request, route HTML, sitemap, and CTA after the
   correction before restoring normal monitoring.
6. For account-only problems, preserve the deployed website and escalate to the
   Search Console property owner, DNS owner, or Plausible account owner instead
   of rolling back code.

## Next steps

After deployment, the account owners must complete the external setup and hand
the evidence to the person responsible for the 90-day scorecard.

- Record Search Console Domain-property verification and sitemap **Success**.
- Record the inspection result for all six commercial URLs.
- Store the four baseline exports outside the repository.
- Record all eleven Plausible goals and the two-step sequential funnel.
- Save one redacted event-payload check and one unsent capsule test.
- Name the daily lead owner, weekly scorecard owner, DNS owner, Plausible owner,
  and technical escalation contact.
