# Google Search Console Setup Guide

**For:** https://www.wiro4x4indochina.com
**Last Updated:** 2026-02-24

## Step 1: Verify Domain Ownership

### Option A: DNS TXT Record (Recommended)

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add property"
3. Choose "Domain" and enter: `wiro4x4indochina.com`
4. Google will provide a TXT record like: `google-site-verification=XXXXXXXXXXXX`
5. Add this TXT record to your domain's DNS settings at your registrar
6. Wait 5-10 minutes for DNS propagation
7. Click "Verify" in Search Console

### Option B: HTML Meta Tag

1. Choose "URL prefix" and enter: `https://www.wiro4x4indochina.com`
2. Google will provide a meta tag like: `<meta name="google-site-verification" content="XXXX" />`
3. Add this tag to `client/index.html` inside `<head>`
4. Deploy the change
5. Click "Verify" in Search Console

## Step 2: Submit Sitemap

1. In Search Console, go to "Sitemaps" in the left sidebar
2. Enter: `sitemap.xml`
3. Click "Submit"
4. The dynamic sitemap at `https://www.wiro4x4indochina.com/sitemap.xml` includes:
   - All static pages (home, pricing, booking, blog, gallery, reviews)
   - Landing pages (kosher-tours, hebrew-guide, accessible-tours)
   - All tour detail pages (6 tours)
   - All published blog posts (dynamically generated)

## Step 3: Request Indexing

For priority pages, manually request indexing:

1. Go to "URL Inspection" in Search Console
2. Enter each priority URL and click "Request Indexing":
   - `https://www.wiro4x4indochina.com/`
   - `https://www.wiro4x4indochina.com/kosher-tours`
   - `https://www.wiro4x4indochina.com/hebrew-guide`
   - `https://www.wiro4x4indochina.com/accessible-tours`
   - `https://www.wiro4x4indochina.com/blog`
   - All 6 tour pages
   - All 10 blog articles

## Step 4: Key Metrics to Monitor

### Coverage Report

- **Valid pages:** Should match your sitemap count
- **Errors:** Fix any crawl errors immediately (404s, 5xx, redirect loops)
- **Excluded pages:** Review to ensure important pages aren't accidentally excluded

### Performance Report

- **Click-through rate (CTR):** Target 3-5% for branded terms, 1-3% for generic
- **Average position:** Track for target keywords
- **Impressions:** Growth indicates expanding visibility
- **Clicks:** The metric that matters most

### Target Keywords to Track

| Keyword                      | Target Position | Priority |
| ---------------------------- | --------------- | -------- |
| kosher tours chiang mai      | Top 3           | Critical |
| kosher tours thailand        | Top 5           | High     |
| hebrew guide chiang mai      | Top 3           | Critical |
| chiang mai day trips         | Top 10          | Medium   |
| sticky waterfalls chiang mai | Top 5           | High     |
| doi inthanon tour            | Top 10          | Medium   |
| off road chiang mai          | Top 10          | Medium   |

### Hebrew Keywords to Track

| Keyword                     | Target Position | Priority |
| --------------------------- | --------------- | -------- |
| טיולים כשרים צ'יאנג מאי     | Top 3           | Critical |
| מדריך דובר עברית צ'יאנג מאי | Top 3           | Critical |
| מטיילים ישראלים תאילנד      | Top 5           | High     |
| שבת בצ'יאנג מאי             | Top 3           | High     |

## Step 5: Rich Results Validation

1. Use [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Test each page type:
   - **Homepage:** Should show Organization + WebSite schemas
   - **Tour pages:** Should show TouristTrip + BreadcrumbList + FAQPage
   - **Blog posts:** Should show BlogPosting (when schema added to BlogPost.tsx)
   - **FAQ sections:** Should show FAQPage schema
   - **Landing pages:** Should show TouristTrip schema

## Step 6: Ongoing Monitoring Checklist

### Weekly

- [ ] Check Coverage report for new errors
- [ ] Monitor Performance for keyword position changes
- [ ] Review top queries for new keyword opportunities

### Monthly

- [ ] Submit any new pages for indexing
- [ ] Check Core Web Vitals report
- [ ] Review mobile usability report
- [ ] Compare month-over-month performance metrics

### After Publishing New Content

- [ ] Request indexing for new blog posts
- [ ] Verify new pages appear in sitemap
- [ ] Test structured data with Rich Results Test

## Useful Links

- [Google Search Console](https://search.google.com/search-console)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Schema.org Validator](https://validator.schema.org/)
