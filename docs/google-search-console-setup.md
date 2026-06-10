# Google Search Console and Google Business SEO Setup

**For:** https://www.wiro4x4indochina.com  
**Last updated:** 2026-05-18

This is the operating checklist for getting WIRO 4x4 cleanly represented in Google Search Console, the sitemap report, URL inspection, and Google Business Profile.

## 1. Search Console Welcome Page

Use the domain property first. It covers both `https://wiro4x4indochina.com` and `https://www.wiro4x4indochina.com`.

1. Open [Google Search Console](https://search.google.com/search-console).
2. Choose **Add property**.
3. Select **Domain**.
4. Enter `wiro4x4indochina.com`.
5. Add the TXT record Google gives you at the DNS provider.
6. Verify the property after DNS propagation.

Fallback option if DNS access is slow:

1. Choose **URL prefix**.
2. Enter `https://www.wiro4x4indochina.com`.
3. Use Google's HTML meta tag option.
4. Put only the token value in the Vercel environment variable `GOOGLE_SITE_VERIFICATION`.
5. Redeploy and verify.

The server SEO middleware now injects `<meta name="google-site-verification">` automatically when `GOOGLE_SITE_VERIFICATION` is present.

## 2. Sitemap Page

Submit exactly this sitemap:

```text
https://www.wiro4x4indochina.com/sitemap.xml
```

In Search Console:

1. Go to **Sitemaps**.
2. Enter `sitemap.xml`.
3. Click **Submit**.
4. After Google reads it, confirm the status is **Success**.

The sitemap now does three Search Console-friendly things:

- Uses canonical HTTPS `www` URLs only.
- Keeps static-page `lastmod` dates current for the SEO update on 2026-05-18.
- Omits dynamic `lastmod` when the database does not provide a real update date, instead of faking today's date.
- Deduplicates package URLs when a package is both a static priority URL and a database URL.

Priority URLs to inspect after deploy:

- `https://www.wiro4x4indochina.com/`
- `https://www.wiro4x4indochina.com/kosher-tours`
- `https://www.wiro4x4indochina.com/hebrew-guide`
- `https://www.wiro4x4indochina.com/tours`
- `https://www.wiro4x4indochina.com/packages`
- `https://www.wiro4x4indochina.com/reviews`
- `https://www.wiro4x4indochina.com/contact`

## 3. URL Inspection After Deploy

For each priority URL:

1. Paste the URL into **URL inspection**.
2. Click **Test live URL**.
3. Confirm the page is indexable.
4. Click **Request indexing**.

Check that Google sees:

- Title and meta description matching the page.
- Canonical URL on `https://www.wiro4x4indochina.com`.
- `hreflang="he"` only on `/hebrew-guide`.
- LocalBusiness/TravelAgency structured data on the site shell and contact page.
- Page-specific schema on tours, packages, blog posts, FAQ, and landing pages.

## 4. Google Business Profile

Recommended primary category:

```text
Tour operator
```

Recommended secondary categories:

```text
Travel agency
Sightseeing tour agency
Tourist attraction
Outdoor activity organizer
```

Business name:

```text
WIRO 4x4
```

Website:

```text
https://www.wiro4x4indochina.com
```

Phone:

```text
+972 54-471-5400
```

Business description:

```text
WIRO 4x4 runs private kosher-friendly off-road tours from Chiang Mai across Northern Thailand and Indochina. We help Israeli, Jewish, and international travelers plan safe 4x4 adventures with Hebrew and English support, kosher-aware meal planning, Shabbat-sensitive itinerary advice, waterfalls, mountain viewpoints, hill tribe visits, and multi-day routes.
```

Services to add:

```text
Private 4x4 tours Chiang Mai
Kosher tours Chiang Mai
Hebrew-speaking guide Chiang Mai
Northern Thailand day trips
Multi-day 4x4 tour packages
Family-friendly off-road tours
Accessible Chiang Mai tours
Custom Thailand and Laos overland trips
```

Photo plan:

- Add a logo and cover photo matching the website.
- Add 10-20 real tour photos from waterfalls, 4x4 routes, kosher meals, family groups, vehicles, and Wiro/guide portraits.
- Avoid stock-style landscape-only photos; Google Business should show the real operator and actual tour experience.

Post topics:

- Private kosher tours in Chiang Mai.
- Hebrew-speaking guide support for Israeli families.
- Sticky Waterfalls and Doi Inthanon 4x4 day trips.
- Northern Thailand multi-day packages.
- Shabbat-aware itinerary planning.

## 5. Rich Results Checks

Use these after deployment:

- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

Expected structured data:

- Homepage: `TravelAgency`, `LocalBusiness`, `WebSite`, `Service`.
- Contact page: `LocalBusiness`.
- Tour pages: `TouristTrip` plus offer/provider details.
- Package pages: `TouristTrip`.
- Blog posts: `BlogPosting`.
- FAQ page/components: `FAQPage`.

## 6. Monthly Monitoring

Search Console:

- Check **Pages** for indexing errors.
- Check **Sitemaps** for sitemap fetch status.
- Check **Performance** for queries around kosher tours, Hebrew guide, Chiang Mai 4x4, and Northern Thailand private tours.
- Inspect any page Google marks as duplicate or crawled but not indexed.

Google Business Profile:

- Reply to every review.
- Add fresh real photos monthly.
- Keep phone, website, hours, and services aligned with the website schema.
- Publish one Google Business post per month for a seasonal route or kosher travel tip.

## Reference Links

- [Google Search Console](https://search.google.com/search-console)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Local Business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google Business Profile guidelines](https://support.google.com/business/answer/3038177)
