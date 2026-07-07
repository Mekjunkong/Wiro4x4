/**
 * SEO Middleware — injects route-specific meta tags into the SPA HTML
 * so crawlers and social media previews see correct titles, descriptions,
 * OG tags, and JSON-LD without executing JavaScript.
 */
import type { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import { getTourBySlug } from "./db/tours";
import { getPublishedBlogPostBySlug } from "./db/blog";
import { getTourPackageBySlug } from "./db/packages";

const SITE_URL = "https://www.wiro4x4indochina.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/optimized/single_cascade_waterfall-lg.jpg`;
const BRAND_LOGO = `${SITE_URL}/images/icon-512.png`;
const BRAND_SUFFIX = " | WIRO 4x4 Kosher Adventures";
const BUSINESS_NAME = "WIRO 4x4 - Kosher Off-Road Adventures";
const BUSINESS_PHONE = "+972544715400";
const BUSINESS_EMAIL = "wiro.adventures@gmail.com";
const BUSINESS_WHATSAPP = "https://wa.me/972544715400";
const BUSINESS_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Wiro%204x4%20Indochina%20Adventure%20Tours%20Chiang%20Mai";
const BUSINESS_IMAGES = [
  `${SITE_URL}/images/optimized/banner-lg.webp`,
  `${SITE_URL}/images/optimized/wiro_with_vehicle-lg.jpg`,
  `${SITE_URL}/images/optimized/wiro_with_colleague-sm.jpg`,
];

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

/** BreadcrumbList JSON-LD for rich breadcrumb trails in search results */
function breadcrumbJsonLd(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    ],
  };
}

interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath: string;
  lang?: string;
  dir?: "ltr" | "rtl";
  appendBrandSuffix?: boolean;
  alternateLanguages?: Partial<Record<"en" | "he" | "x-default", string>>;
  jsonLd?: JsonLdValue;
}

function pageJsonLd(meta: {
  name: string;
  description: string;
  path: string;
  inLanguage?: string | string[];
  pageType?: string;
}): Record<string, unknown> {
  const url = `${SITE_URL}${meta.path}`;
  return {
    "@context": "https://schema.org",
    "@type": meta.pageType || "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: meta.name,
    description: meta.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: meta.inLanguage || "en",
  };
}

function serviceJsonLd(meta: {
  name: string;
  description: string;
  path: string;
  audienceType: string;
  inLanguage?: string[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${meta.path}#service`,
    name: meta.name,
    description: meta.description,
    serviceType: "Private 4x4 tour operator",
    areaServed: { "@type": "City", name: "Chiang Mai" },
    audience: {
      "@type": "Audience",
      audienceType: meta.audienceType,
    },
    provider: { "@id": `${SITE_URL}/#organization` },
    url: `${SITE_URL}${meta.path}`,
    inLanguage: meta.inLanguage || ["en", "he"],
  };
}

function localBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS_NAME,
    alternateName: ["WIRO 4x4", "Wiro 4x4 Indochina Adventure Tours"],
    description:
      "Private kosher-friendly 4x4 tour operator in Chiang Mai and Northern Thailand with Hebrew and English support, kosher-aware meal planning, and WhatsApp-first reservations.",
    url: SITE_URL,
    logo: BRAND_LOGO,
    image: BUSINESS_IMAGES,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "183/15 Chang Klan Rd",
      addressLocality: "Mueang Chiang Mai District",
      addressRegion: "Chiang Mai",
      postalCode: "50100",
      addressCountry: "TH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 18.7883,
      longitude: 98.9853,
    },
    hasMap: BUSINESS_MAP_URL,
    areaServed: [
      "Chiang Mai",
      "Northern Thailand",
      "Chiang Rai",
      "Mae Hong Son",
      "Indochina",
    ],
    availableLanguage: ["English", "Hebrew", "Thai"],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "08:00:00",
      closes: "18:00:00",
    },
    priceRange: "$$-$$$",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS_PHONE,
      contactType: "reservations",
      availableLanguage: ["English", "Hebrew", "Thai"],
      url: BUSINESS_WHATSAPP,
    },
    sameAs: [BUSINESS_WHATSAPP],
    potentialAction: [
      {
        "@type": "ReserveAction",
        target: `${SITE_URL}/book`,
        name: "Book a private 4x4 tour",
      },
      {
        "@type": "CommunicateAction",
        target: BUSINESS_WHATSAPP,
        name: "Ask WIRO 4x4 on WhatsApp",
      },
    ],
  };
}

// Static route meta data
const STATIC_ROUTES: Record<string, PageMeta> = {
  "/": {
    title: "WIRO 4x4 - Kosher Off-Road Adventures in Chiang Mai, Thailand",
    description:
      "Explore Chiang Mai with Hebrew-speaking guides, kosher meals, and custom 4x4 off-road tours. Shabbat-friendly adventures for Israeli travelers in Northern Thailand.",
    canonicalPath: "/",
  },
  "/tours": {
    title: "4x4 Off-Road Tours in Chiang Mai",
    description:
      "6 private off-road day trips in Chiang Mai and Northern Thailand. Kosher meals, Hebrew-speaking guides, and Shabbat-friendly scheduling for Israeli travelers.",
    canonicalPath: "/tours",
  },
  "/pricing": {
    title: "4x4 Tour Pricing — Chiang Mai, Thailand",
    description:
      "Transparent group pricing for WIRO 4x4 tours in Chiang Mai. Private tours from $98/group, multi-day packages, kosher meal add-ons, and peak season rates.",
    canonicalPath: "/pricing",
  },
  "/estimate": {
    title: "4x4 Tour Price Estimator — Chiang Mai",
    description:
      "Get an instant price estimate for your Chiang Mai 4x4 tour. Select tours, group size, children ages, and add-ons to see your exact total.",
    canonicalPath: "/estimate",
  },
  "/blog": {
    title: "Chiang Mai Travel Blog & Kosher Travel Tips",
    description:
      "Guides, insider tips, and stories for Israeli travelers in Northern Thailand. Kosher dining, Shabbat travel, off-road adventures, and Chiang Mai destination guides.",
    canonicalPath: "/blog",
    jsonLd: pageJsonLd({
      name: "Chiang Mai Travel Blog & Kosher Travel Tips",
      description:
        "Guides, insider tips, and stories for Israeli travelers in Northern Thailand. Kosher dining, Shabbat travel, off-road adventures, and Chiang Mai destination guides.",
      path: "/blog",
      pageType: "CollectionPage",
      inLanguage: ["en", "he"],
    }),
  },
  "/gallery": {
    title: "Chiang Mai Off-Road Tour Photos — WIRO 4x4",
    description:
      "Photos from WIRO 4x4 adventures: waterfalls, jungle trails, mountain views, hill tribe villages, and happy travelers in Northern Thailand.",
    canonicalPath: "/gallery",
  },
  "/reviews": {
    title: "Customer Reviews — Chiang Mai 4x4 Tours",
    description:
      "Verified reviews from Israeli travelers and international visitors. See what guests say about kosher off-road tours with WIRO 4x4 in Chiang Mai.",
    canonicalPath: "/reviews",
  },
  "/book": {
    title: "Book a Chiang Mai 4x4 Tour",
    description:
      "Reserve your WIRO 4x4 off-road adventure in Chiang Mai. Easy online booking with WhatsApp confirmation.",
    canonicalPath: "/book",
  },
  "/kosher-tours": {
    title: "Kosher Tours Chiang Mai — Private 4x4 for Jewish Travelers",
    description:
      "Kosher tours in Chiang Mai with private 4x4 routes, kosher meal planning, Shabbat-aware scheduling, and Hebrew/English support for Jewish travelers.",
    canonicalPath: "/kosher-tours",
    jsonLd: serviceJsonLd({
      name: "Kosher Tours Chiang Mai",
      description:
        "Private kosher-friendly 4x4 tours in Chiang Mai with kosher meal planning, Shabbat-aware scheduling, and Hebrew/English support.",
      path: "/kosher-tours",
      audienceType:
        "Jewish travelers, kosher travelers, Israeli travelers, observant families",
    }),
  },
  "/hebrew-guide": {
    title: "מדריך דובר עברית בצ׳אנג מאי — Hebrew Guide Chiang Mai",
    description:
      "מדריך דובר עברית בצ׳אנג מאי לטיול ג׳יפים פרטי בצפון תאילנד. Hebrew-speaking Chiang Mai guide for Israeli families, couples, and groups.",
    canonicalPath: "/hebrew-guide",
    lang: "he",
    dir: "rtl",
    alternateLanguages: {
      he: `${SITE_URL}/hebrew-guide`,
      "x-default": `${SITE_URL}/hebrew-guide`,
    },
    jsonLd: serviceJsonLd({
      name: "Hebrew-Speaking Guide in Chiang Mai",
      description:
        "Private 4x4 tours in Chiang Mai and Northern Thailand with Hebrew-speaking guide support for Israeli travelers.",
      path: "/hebrew-guide",
      audienceType: "Israeli travelers, Hebrew-speaking travelers, families",
      inLanguage: ["he", "en"],
    }),
  },
  "/accessible-tours": {
    title: "Family-Friendly & Accessible Tours Chiang Mai",
    description:
      "Family-friendly and accessible 4x4 tours in Chiang Mai. Safe adventures for children, seniors, and travelers with mobility needs.",
    canonicalPath: "/accessible-tours",
    jsonLd: serviceJsonLd({
      name: "Family-Friendly & Accessible 4x4 Tours Chiang Mai",
      description:
        "Private 4x4 tours in Chiang Mai adapted for children, seniors, and travelers with mobility needs.",
      path: "/accessible-tours",
      audienceType:
        "Families, seniors, wheelchair users, travelers with mobility needs",
    }),
  },
  "/car-rental": {
    title: "Car Rental Chiang Mai — Self-Drive Cars & 4x4 from ฿990/Day",
    description:
      "Rent a car in Chiang Mai from ฿990/day. No credit card needed, first-class insurance, unlimited mileage, free hotel & airport delivery. Hebrew/English booking support.",
    canonicalPath: "/car-rental",
    jsonLd: serviceJsonLd({
      name: "Car Rental in Chiang Mai",
      description:
        "Self-drive car rental in Chiang Mai with first-class insurance, unlimited mileage, free hotel and airport delivery, and Hebrew/English booking support.",
      path: "/car-rental",
      audienceType:
        "Tourists, Israeli travelers, families, self-drive travelers",
    }),
  },
  "/faq": {
    title: "FAQ — Kosher Tours & Off-Road Adventures Chiang Mai",
    description:
      "Frequently asked questions about WIRO 4x4 tours, kosher meals, booking, cancellation, Shabbat support, and traveling in Northern Thailand.",
    canonicalPath: "/faq",
  },
  "/contact": {
    title: "Contact WIRO 4x4 — Chiang Mai Tour Guide",
    description:
      "Get in touch with WIRO 4x4. WhatsApp, email, or booking form. We respond within 24 hours.",
    canonicalPath: "/contact",
    jsonLd: localBusinessJsonLd(),
  },
  "/packages": {
    title: "Multi-Day Tour Packages — Northern Thailand",
    description:
      "Multi-day tour packages in Northern Thailand and Indochina. 2–5 day all-inclusive 4x4 adventures with kosher meals and accommodation.",
    canonicalPath: "/packages",
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "Terms and conditions for WIRO 4x4 tour bookings and services.",
    canonicalPath: "/terms",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "How WIRO 4x4 collects, uses, and protects your personal data.",
    canonicalPath: "/privacy",
  },
};

/**
 * Hardcoded fallback meta for the 6 core tour slugs — mirrors the
 * client-side HARDCODED_TOURS in client/src/components/Tours.tsx.
 * Used when the tours table is empty or the DB is unreachable, so
 * tour pages always ship correct SEO meta.
 */
const TOUR_META: Record<
  string,
  {
    name: string;
    description: string;
    coverImage: string;
    price: number;
  }
> = {
  "doi-inthanon-roof-of-thailand": {
    name: "Doi Inthanon — Roof of Thailand",
    description:
      "Thailand's highest peak, cloud forest trails, and a hidden Karen village coffee farm. Private 4x4 day trip from Chiang Mai with kosher and Shabbat-friendly options.",
    coverImage: "/images/optimized/mountain_sunset-lg.jpg",
    price: 5000,
  },
  "mae-kampong-hidden-village": {
    name: "Mae Kampong — Hidden Mountain Village",
    description:
      "A 700-year-old eco-village, wild gibbon spotting, ancient tea ceremony, and panoramic viewpoint hike. Private 4x4 day trip from Chiang Mai.",
    coverImage: "/images/optimized/mountain_village_view-lg.jpg",
    price: 3500,
  },
  "maerim-sticky-waterfalls": {
    name: "Maerim & Sticky Waterfalls",
    description:
      "Climb UP a waterfall barefoot, walk a sky-high canopy walkway, and explore upper waterfall tiers no one reaches. Private 4x4 day trip from Chiang Mai.",
    coverImage: "/images/optimized/sticky_waterfalls-lg.jpg",
    price: 4500,
  },
  "doi-suthep-pui-beyond-temple": {
    name: "Doi Suthep-Pui — Beyond the Temple",
    description:
      "Hike the ancient Monk's Trail, then keep going where tourists turn back — Hmong village, hidden coffee farm, secluded waterfall. Private 4x4 day trip.",
    coverImage: "/images/optimized/doi_suthep_golden_chedi-lg.jpg",
    price: 3500,
  },
  "mae-wang-jungle-wilderness": {
    name: "Mae Wang — Jungle & River Wilderness",
    description:
      "Real 4x4 off-road through jungle, Pha Chor canyon, ethical elephants, bamboo rafting, and hidden waterfalls. Private day trip from Chiang Mai.",
    coverImage: "/images/optimized/elephant_encounter-lg.jpg",
    price: 5500,
  },
  "samoeng-loop-mountain-circuit": {
    name: "Samoeng Loop — The Mountain Circuit",
    description:
      "100km mountain loop — rare wooden Lanna temple, hilltop farm above the clouds, Hmong village, and lakeside sunset. Private 4x4 day trip from Chiang Mai.",
    coverImage: "/images/optimized/chiang_mai_valley-lg.jpg",
    price: 5000,
  },
};

const PACKAGE_META: Record<
  string,
  {
    name: string;
    description: string;
    coverImage: string;
    price: number;
  }
> = {
  "northern-thailand-3d2n": {
    name: "3 Days / 2 Nights — Northern Thailand Mountain Loop",
    description:
      "A private 3-day 4x4 adventure through Chiang Dao, Doi Ang Khang, Mae Salong, and Chiang Rai with kosher support and Hebrew-speaking guide service.",
    coverImage: "/images/optimized/nong_khiaw_river.jpg",
    price: 12900,
  },
  "grand-tour-laos-14d": {
    name: "14-Day Grand Tour: Thailand to Laos by 4x4",
    description:
      "A private 14-day overland 4x4 expedition from Chiang Mai through Northern Thailand and Laos with kosher support and Hebrew-speaking guide service.",
    coverImage: "/images/optimized/vang_vieng_mountains.jpg",
    price: 59900,
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function absoluteUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function defaultAlternateLanguages(meta: PageMeta, canonicalUrl: string) {
  if (meta.alternateLanguages) return meta.alternateLanguages;
  if (meta.lang === "he") {
    return {
      he: canonicalUrl,
      "x-default": canonicalUrl,
    };
  }
  return {
    en: canonicalUrl,
    "x-default": canonicalUrl,
  };
}

function buildAlternateTags(meta: PageMeta, canonicalUrl: string): string {
  return Object.entries(defaultAlternateLanguages(meta, canonicalUrl))
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(
      ([hreflang, href]) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(
          href
        )}" />`
    )
    .join("\n");
}

function injectMeta(html: string, meta: PageMeta): string {
  const fullTitle =
    meta.appendBrandSuffix === false || meta.title.includes("WIRO 4x4")
      ? meta.title
      : meta.title + BRAND_SUFFIX;
  const safeTitle = escapeHtml(fullTitle);
  const safeDesc = escapeHtml(meta.description);
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const canonicalUrl = `${SITE_URL}${meta.canonicalPath}`;
  const ogType = meta.ogType || "website";

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
  );

  // Replace canonical URL
  const alternateTags = buildAlternateTags(meta, canonicalUrl);
  html = html.replace(
    /\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]*"\s*\/?>/g,
    ""
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n${alternateTags}`
  );

  // Override lang attribute for non-English pages
  if (meta.lang) {
    html = html.replace(
      /(<html\b[^>]*)\blang="[^"]*"/,
      `$1 lang="${meta.lang}"`
    );
  }

  // Override text direction for Hebrew crawler-visible HTML
  if (meta.dir) {
    if (/<html\b[^>]*\sdir="[^"]*"/.test(html)) {
      html = html.replace(
        /(<html\b[^>]*)\bdir="[^"]*"/,
        `$1 dir="${meta.dir}"`
      );
    } else {
      html = html.replace(/<html\b([^>]*)>/, `<html$1 dir="${meta.dir}">`);
    }
  }

  // Inject page-specific JSON-LD before closing </head>
  if (meta.jsonLd) {
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`;
    html = html.replace("</head>", `${jsonLdScript}\n</head>`);
  }

  const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  if (
    googleSiteVerification &&
    !html.includes('name="google-site-verification"')
  ) {
    html = html.replace(
      "</head>",
      `<meta name="google-site-verification" content="${escapeHtml(
        googleSiteVerification
      )}" />\n</head>`
    );
  }

  return html;
}

/** Resolve meta for a dynamic route (tour or blog post) */
async function getDynamicMeta(urlPath: string): Promise<PageMeta | null> {
  // /tours/:slug
  const tourMatch = urlPath.match(/^\/tours\/([a-z0-9-]+)$/);
  if (tourMatch) {
    const slug = tourMatch[1];
    let tour: Awaited<ReturnType<typeof getTourBySlug>>;
    try {
      tour = await getTourBySlug(slug);
    } catch {
      tour = undefined; // DB error — use hardcoded fallback below
    }
    const fallback = TOUR_META[slug];
    const name = tour?.name || fallback?.name;
    const description = tour?.description || fallback?.description;
    const coverImage = tour?.imageUrl || fallback?.coverImage;
    const price = tour?.price ?? fallback?.price;

    if (name) {
      return {
        title: `${name} — Chiang Mai 4x4 Tour`,
        description:
          description?.slice(0, 155) ||
          `${name} — private off-road 4x4 tour in Chiang Mai with WIRO 4x4.`,
        ogImage: coverImage ? absoluteUrl(coverImage) : undefined,
        canonicalPath: `/tours/${slug}`,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name,
            description,
            provider: {
              "@type": "TravelAgency",
              name: "WIRO 4x4",
              url: SITE_URL,
            },
            offers:
              price !== undefined && price !== null
                ? {
                    "@type": "Offer",
                    price: String(price),
                    priceCurrency: "THB",
                    availability: "https://schema.org/InStock",
                  }
                : undefined,
          },
          breadcrumbJsonLd([
            { name: "Tours", path: "/tours" },
            { name, path: `/tours/${slug}` },
          ]),
        ],
      };
    }
  }

  // /packages/:slug
  const packageMatch = urlPath.match(/^\/packages\/([a-z0-9-]+)$/);
  if (packageMatch) {
    const slug = packageMatch[1];
    const dbPkg = await getTourPackageBySlug(slug);
    const pkg = dbPkg?.isPublished === 1 ? dbPkg : undefined;
    const fallback = PACKAGE_META[slug];
    const name = pkg?.name || fallback?.name;
    const description = pkg?.description || fallback?.description;
    const coverImage = pkg?.coverImage || fallback?.coverImage;
    const price = fallback?.price;

    if (name && (pkg || fallback)) {
      return {
        title: `${name} — Private 4x4 Package`,
        description:
          description?.slice(0, 155) ||
          `${name} — private multi-day 4x4 tour package with WIRO 4x4.`,
        ogImage: coverImage ? absoluteUrl(coverImage) : undefined,
        canonicalPath: `/packages/${slug}`,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name,
            description,
            image: coverImage ? absoluteUrl(coverImage) : DEFAULT_OG_IMAGE,
            provider: {
              "@type": "TravelAgency",
              name: "WIRO 4x4",
              url: SITE_URL,
            },
            offers: price
              ? {
                  "@type": "Offer",
                  price: String(price),
                  priceCurrency: "THB",
                  availability: "https://schema.org/InStock",
                }
              : undefined,
          },
          breadcrumbJsonLd([
            { name: "Packages", path: "/packages" },
            { name, path: `/packages/${slug}` },
          ]),
        ],
      };
    }
  }

  // /blog/:slug
  const blogMatch = urlPath.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const post = await getPublishedBlogPostBySlug(blogMatch[1]);
    if (post) {
      const publishedIso = post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined;
      return {
        title: post.title,
        description:
          post.excerpt?.slice(0, 155) ||
          post.content?.slice(0, 155) ||
          `${post.title} — WIRO 4x4 blog.`,
        ogImage: post.coverImage || undefined,
        ogType: "article",
        canonicalPath: `/blog/${post.slug}`,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || post.content?.slice(0, 200),
            image: post.coverImage || DEFAULT_OG_IMAGE,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${SITE_URL}/blog/${post.slug}`,
            },
            author: {
              "@type": "Person",
              name: "Wiro",
              worksFor: { "@type": "Organization", name: "WIRO 4x4" },
            },
            publisher: {
              "@type": "Organization",
              name: "WIRO 4x4",
              logo: {
                "@type": "ImageObject",
                url: BRAND_LOGO,
              },
            },
            datePublished: publishedIso,
            dateModified: publishedIso,
            url: `${SITE_URL}/blog/${post.slug}`,
          },
          breadcrumbJsonLd([
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ],
      };
    }
  }

  return null;
}

/** Cache the built index.html in memory (only read once per cold start) */
let cachedHtml: string | null = null;

function getIndexHtml(): string | null {
  if (cachedHtml) return cachedHtml;

  const candidatePaths =
    process.env.NODE_ENV === "production"
      ? [
          // Vercel serverless bundle: copied by build:frontend for API rewrites.
          path.resolve(import.meta.dirname, "public", "index.html"),
          // Local production fallbacks when running from repository/build output.
          path.resolve(
            import.meta.dirname,
            "..",
            "dist",
            "public",
            "index.html"
          ),
          path.resolve(import.meta.dirname, "dist", "public", "index.html"),
        ]
      : [
          path.resolve(
            import.meta.dirname,
            "..",
            "dist",
            "public",
            "index.html"
          ),
        ];

  for (const distPath of candidatePaths) {
    try {
      cachedHtml = fs.readFileSync(distPath, "utf-8");
      return cachedHtml;
    } catch {
      // Try next candidate path.
    }
  }

  return null;
}

/**
 * Express middleware that intercepts HTML page requests and injects
 * route-specific meta tags into the SPA shell for SEO.
 *
 * Must be registered BEFORE the _core catch-all static file handler.
 */
export function seoMiddleware() {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Only intercept GET requests for HTML pages (not API, assets, etc.)
    const urlPath = req.path;

    // Skip API routes, static assets, and non-GET requests
    if (
      req.method !== "GET" ||
      urlPath.startsWith("/api/") ||
      urlPath.startsWith("/assets/") ||
      urlPath.startsWith("/images/") ||
      urlPath.match(/\.\w{2,5}$/) // has file extension (.js, .css, .png, etc.)
    ) {
      next();
      return;
    }

    const html = getIndexHtml();
    if (!html) {
      next(); // Fallback to _core handler in dev mode
      return;
    }

    // Try static routes first, then dynamic
    let meta: PageMeta | null = STATIC_ROUTES[urlPath] || null;

    if (!meta) {
      try {
        meta = await getDynamicMeta(urlPath);
      } catch {
        // DB error — fall through to default HTML
      }
    }

    if (!meta) {
      // No route-specific meta (e.g. unknown slug or DB unavailable).
      // On Vercel this middleware is the LAST handler for rewritten SPA
      // routes (/tours/:slug, /blog/:slug, ...) — calling next() would
      // return an empty response and the visitor would see a blank page.
      // Serve the SPA shell as-is so the client router can render the
      // page (or its own 404) instead.
      res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .send(html);
      return;
    }

    const injectedHtml = injectMeta(html, meta);
    res
      .status(200)
      .set("Content-Type", "text/html; charset=utf-8")
      .send(injectedHtml);
  };
}
