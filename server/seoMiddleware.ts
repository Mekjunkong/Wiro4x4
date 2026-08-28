/**
 * SEO Middleware — injects route-specific meta tags into the SPA HTML
 * so crawlers and social media previews see correct titles, descriptions,
 * OG tags, and JSON-LD without executing JavaScript.
 */
import type { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import { COMMERCIAL_SEO_ROUTE_PAIRS } from "../shared/commercialSeo";
import {
  isCanonicalBlogSlug,
  isCanonicalTourOrPackageSlug,
} from "../shared/schemas";
import { getTourBySlug } from "./db/tours";
import { getPublishedBlogPostBySlug } from "./db/blog";
import { getTourPackageBySlug } from "./db/packages";
import { getFallbackBlogPost } from "../shared/seoFallbackContent";
import { getFallbackTourBySlug } from "../shared/wiroTourCatalog";
import { resolveTourSeoMeta } from "../shared/tourSeoOverrides";
import {
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_WHATSAPP_URL,
} from "../shared/const";

function catalogPrice(slug: string): number {
  const tour = getFallbackTourBySlug(slug);
  if (!tour) throw new Error(`Missing WIRO catalog entry: ${slug}`);
  return tour.price;
}

const SITE_URL = "https://www.wiro4x4indochina.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/optimized/single_cascade_waterfall-lg.jpg`;
const BRAND_LOGO = `${SITE_URL}/images/icon-512.png`;
const BRAND_SUFFIX = " | WIRO 4x4 Kosher Adventures";
const BUSINESS_NAME = "WIRO 4x4 - Kosher Off-Road Adventures";
const BUSINESS_PHONE = COMPANY_PHONE;
const BUSINESS_EMAIL = COMPANY_EMAIL;
const BUSINESS_WHATSAPP = COMPANY_WHATSAPP_URL;
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

const COMMERCIAL_STATIC_ROUTES: Record<string, PageMeta> = Object.fromEntries(
  COMMERCIAL_SEO_ROUTE_PAIRS.flatMap(pair =>
    (["en", "he"] as const).map(language => {
      const path = pair.paths[language];
      const metadata = pair.metadata[language];
      return [
        path,
        {
          title: metadata.title,
          description: metadata.description,
          canonicalPath: path,
          lang: language,
          dir: language === "he" ? "rtl" : "ltr",
          ogImage: `${SITE_URL}/images/optimized/${pair.heroImage}.webp`,
          alternateLanguages: {
            en: `${SITE_URL}${pair.paths.en}`,
            he: `${SITE_URL}${pair.paths.he}`,
            "x-default": `${SITE_URL}${pair.paths.en}`,
          },
          jsonLd: serviceJsonLd({
            name: metadata.title,
            description: metadata.description,
            path,
            audienceType:
              "Jewish and Israeli families seeking private Chiang Mai 4x4 tours",
            inLanguage: [language],
          }),
        } satisfies PageMeta,
      ];
    })
  )
);

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
    title: "Chiang Mai 4x4 Tours & Private Off-Road Adventures | WIRO 4x4",
    description:
      "Explore Northern Thailand with WIRO 4x4. Private off-road tours, customized Jeep adventures and multi-day expeditions from Chiang Mai.",
    canonicalPath: "/",
  },
  "/tours": {
    title: "Chiang Mai 4x4 Tours",
    description:
      "6 private off-road day trips in Chiang Mai and Northern Thailand, with kosher-friendly meal planning and Hebrew-speaking guide support available.",
    canonicalPath: "/tours",
    jsonLd: pageJsonLd({
      name: "Chiang Mai 4x4 Tours",
      description:
        "Private 4x4 day tours from Chiang Mai to mountain, jungle, waterfall, and village destinations across Northern Thailand.",
      path: "/tours",
      pageType: "CollectionPage",
      inLanguage: ["en", "he"],
    }),
  },
  "/pricing": {
    title: "4x4 Tour Pricing — Chiang Mai, Thailand",
    description:
      "Transparent group pricing for WIRO 4x4 tours in Chiang Mai. Private tours from $98/group, multi-day packages, kosher meal add-ons, and peak season rates.",
    canonicalPath: "/pricing",
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
  "/about": {
    title: "About Wiro — Local Chiang Mai 4x4 Guide",
    description:
      "Meet Wiro, founder and primary guide of WIRO 4x4. A fluent Hebrew speaker with extensive experience guiding Israeli travelers on private Chiang Mai 4x4 tours.",
    canonicalPath: "/about",
    ogImage: `${SITE_URL}/images/optimized/guide_wiro.webp`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#webpage`,
      url: `${SITE_URL}/about`,
      name: "About Wiro — Local Chiang Mai 4x4 Guide",
      description:
        "Meet Wiro, founder and primary guide of WIRO 4x4. A fluent Hebrew speaker with extensive experience guiding Israeli travelers on private Chiang Mai 4x4 tours.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/about#wiro` },
      inLanguage: ["en", "he"],
      mainEntity: {
        "@type": "Person",
        "@id": `${SITE_URL}/about#wiro`,
        name: "Wiro",
        jobTitle: "Founder & Primary Guide",
        knowsLanguage: ["he"],
        worksFor: { "@id": `${SITE_URL}/#organization` },
      },
    },
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
  ...COMMERCIAL_STATIC_ROUTES,
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
    price: catalogPrice("doi-inthanon-roof-of-thailand"),
  },
  "mae-kampong-hidden-village": {
    name: "Mae Kampong — Hidden Mountain Village",
    description:
      "A 700-year-old eco-village, wild gibbon spotting, ancient tea ceremony, and panoramic viewpoint hike. Private 4x4 day trip from Chiang Mai.",
    coverImage: "/images/optimized/mountain_village_view-lg.jpg",
    price: catalogPrice("mae-kampong-hidden-village"),
  },
  "maerim-sticky-waterfalls": {
    name: "Maerim & Sticky Waterfalls",
    description:
      "Climb UP a waterfall barefoot, walk a sky-high canopy walkway, and explore upper waterfall tiers no one reaches. Private 4x4 day trip from Chiang Mai.",
    coverImage: "/images/optimized/sticky_waterfalls-lg.jpg",
    price: catalogPrice("maerim-sticky-waterfalls"),
  },
  "doi-suthep-pui-beyond-temple": {
    name: "Doi Suthep-Pui — Beyond the Temple",
    description:
      "Hike the ancient Monk's Trail, then keep going where tourists turn back — Hmong village, hidden coffee farm, secluded waterfall. Private 4x4 day trip.",
    coverImage: "/images/optimized/doi_suthep_golden_chedi-lg.jpg",
    price: catalogPrice("doi-suthep-pui-beyond-temple"),
  },
  "mae-wang-jungle-wilderness": {
    name: "Mae Wang — Jungle & River Wilderness",
    description:
      "Real 4x4 off-road through jungle, Pha Chor canyon, ethical elephants, bamboo rafting, and hidden waterfalls. Private day trip from Chiang Mai.",
    coverImage: "/images/optimized/elephant_encounter-lg.jpg",
    price: catalogPrice("mae-wang-jungle-wilderness"),
  },
  "samoeng-loop-mountain-circuit": {
    name: "Samoeng Loop — The Mountain Circuit",
    description:
      "100km mountain loop — rare wooden Lanna temple, hilltop farm above the clouds, Hmong village, and lakeside sunset. Private 4x4 day trip from Chiang Mai.",
    coverImage: "/images/optimized/chiang_mai_valley-lg.jpg",
    price: catalogPrice("samoeng-loop-mountain-circuit"),
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

const PAGE_JSON_LD_ID = "page-json-ld";
const PAGE_JSON_LD_PATTERN =
  /<script\b(?=[^>]*\bid=["']page-json-ld["'])[^>]*>[\s\S]*?<\/script>\s*/gi;

function serializeJsonLd(value: JsonLdValue): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function absoluteUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function truncateDescription(text: string, maxLength = 155): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const ellipsis = "…";
  const available = Math.max(1, maxLength - ellipsis.length);
  const candidate = normalized.slice(0, available).trimEnd();
  const boundary = candidate.lastIndexOf(" ");
  const wholeWord = boundary > 0 ? candidate.slice(0, boundary) : candidate;
  return `${wholeWord}${ellipsis}`;
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

export function injectMeta(html: string, meta: PageMeta): string {
  const fullTitle =
    meta.appendBrandSuffix === false || meta.title.includes("WIRO 4x4")
      ? meta.title
      : meta.title + BRAND_SUFFIX;
  const safeTitle = escapeHtml(fullTitle);
  const safeDesc = escapeHtml(truncateDescription(meta.description));
  const ogImage = absoluteUrl(meta.ogImage || DEFAULT_OG_IMAGE);
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
      /(<html\b[^>]*)\s+lang="[^"]*"/,
      `$1 lang="${meta.lang}"`
    );
  }

  // Override text direction for Hebrew crawler-visible HTML
  if (meta.dir) {
    if (/<html\b[^>]*\sdir="[^"]*"/.test(html)) {
      html = html.replace(
        /(<html\b[^>]*)\s+dir="[^"]*"/,
        `$1 dir="${meta.dir}"`
      );
    } else {
      html = html.replace(/<html\b([^>]*)>/, `<html$1 dir="${meta.dir}">`);
    }
  }

  // Replace the page-specific JSON-LD while preserving baked organization data.
  html = html.replace(PAGE_JSON_LD_PATTERN, "");
  if (meta.jsonLd) {
    const jsonLdScript = `<script id="${PAGE_JSON_LD_ID}" type="application/ld+json">${serializeJsonLd(meta.jsonLd)}</script>`;
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

/** Render a known static route from the same metadata used by the middleware. */
export function renderStaticRouteHtml(
  html: string,
  urlPath: string
): string | null {
  const meta = STATIC_ROUTES[urlPath];
  return meta ? injectMeta(html, meta) : null;
}

interface DynamicMetaOptions {
  loadTourBySlug?: typeof getTourBySlug;
  loadPackageBySlug?: typeof getTourPackageBySlug;
  loadBlogPostBySlug?: typeof getPublishedBlogPostBySlug;
}

/** Resolve meta for a dynamic route (tour, package, or blog post). */
export async function resolveDynamicMeta(
  urlPath: string,
  options?: DynamicMetaOptions
): Promise<PageMeta | null> {
  // /tours/:slug
  const tourMatch = urlPath.match(/^\/tours\/([^/]+)$/);
  if (tourMatch && isCanonicalTourOrPackageSlug(tourMatch[1])) {
    const slug = tourMatch[1];
    let tour: Awaited<ReturnType<typeof getTourBySlug>>;
    try {
      tour = await (options?.loadTourBySlug || getTourBySlug)(slug);
    } catch {
      tour = undefined; // DB error — use hardcoded fallback below
    }
    const fallback = TOUR_META[slug];
    const name = tour?.name || fallback?.name;
    const description = tour?.description || fallback?.description;
    const coverImage = tour?.imageUrl || fallback?.coverImage;
    const price = tour?.price ?? fallback?.price;

    if (name) {
      const seoMeta = resolveTourSeoMeta(slug, {
        title: `${name} — Chiang Mai 4x4 Tour`,
        description:
          truncateDescription(description || "") ||
          `${name} — private off-road 4x4 tour in Chiang Mai with WIRO 4x4.`,
      });
      return {
        title: seoMeta.title,
        description: seoMeta.description,
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
  const packageMatch = urlPath.match(/^\/packages\/([^/]+)$/);
  if (packageMatch && isCanonicalTourOrPackageSlug(packageMatch[1])) {
    const slug = packageMatch[1];
    let dbPkg: Awaited<ReturnType<typeof getTourPackageBySlug>>;
    try {
      dbPkg = await (options?.loadPackageBySlug || getTourPackageBySlug)(slug);
    } catch {
      dbPkg = undefined; // DB error — use hardcoded fallback below
    }
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
          truncateDescription(description || "") ||
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
  const blogMatch = urlPath.match(/^\/blog\/([^/]+)$/);
  if (blogMatch && isCanonicalBlogSlug(blogMatch[1])) {
    const slug = blogMatch[1];
    let dbPost: Awaited<ReturnType<typeof getPublishedBlogPostBySlug>>;
    try {
      dbPost = await (
        options?.loadBlogPostBySlug || getPublishedBlogPostBySlug
      )(slug);
    } catch {
      dbPost = undefined; // DB error — use hardcoded fallback below
    }
    const fallback = getFallbackBlogPost(slug);
    const title = dbPost?.title || fallback?.title;
    const excerpt = dbPost?.excerpt || fallback?.excerpt;
    const content = dbPost?.content || "";
    const coverImage = dbPost?.coverImage || fallback?.coverImage;
    const publishedAt = dbPost?.publishedAt || fallback?.publishedAt;

    if (title && (dbPost || fallback)) {
      const publishedIso = publishedAt
        ? new Date(publishedAt).toISOString()
        : undefined;
      return {
        title,
        description:
          truncateDescription(excerpt || content) ||
          `${title} — WIRO 4x4 blog.`,
        ogImage: coverImage ? absoluteUrl(coverImage) : undefined,
        ogType: "article",
        canonicalPath: `/blog/${slug}`,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            description: truncateDescription(excerpt || content),
            image: coverImage ? absoluteUrl(coverImage) : DEFAULT_OG_IMAGE,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${SITE_URL}/blog/${slug}`,
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
            url: `${SITE_URL}/blog/${slug}`,
          },
          breadcrumbJsonLd([
            { name: "Blog", path: "/blog" },
            { name: title, path: `/blog/${slug}` },
          ]),
        ],
      };
    }
  }

  return null;
}

/**
 * Client-side routes that have no server meta but are valid SPA pages.
 * They get the plain shell with a noindex signal (auth/transactional pages).
 */
const CLIENT_ONLY_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/booking/success",
  "/booking/cancel",
  "/404",
]);

const CLIENT_ONLY_PREFIXES = [/^\/admin(\/|$)/, /^\/album\/[^/]+$/];

/** True for SPA-only pages (auth, admin, booking confirmations) that should
 * be served with a noindex signal but a 200 status. Exported for tests. */
export function isClientOnlyRoute(urlPath: string): boolean {
  return (
    CLIENT_ONLY_ROUTES.has(urlPath) ||
    CLIENT_ONLY_PREFIXES.some(p => p.test(urlPath))
  );
}

/** True for /tours/:slug, /packages/:slug, /blog/:slug shapes. Exported for tests. */
export function isContentSlugPath(urlPath: string): boolean {
  const match = urlPath.match(/^\/(tours|packages|blog)\/([^/]+)$/);
  if (!match) return false;
  return match[1] === "blog"
    ? isCanonicalBlogSlug(match[2])
    : isCanonicalTourOrPackageSlug(match[2]);
}

/** Edge cache for indexable marketing pages (1h fresh, 24h stale) */
const PAGE_CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";
/** Short edge cache for 404 responses */
const NOT_FOUND_CACHE_CONTROL = "public, s-maxage=300";

/** Swap the shell's index,follow robots meta for noindex. Exported for tests. */
export function injectNoindex(html: string): string {
  return html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="noindex, nofollow" />`
  );
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
 *
 * Pass `html` (the SPA shell) to make the middleware self-contained —
 * the Vercel entry embeds it at build time because file tracing does not
 * reliably ship index.html into the serverless bundle. Without it, the
 * shell is read from disk (local dev/prod).
 */
export function seoMiddleware(options?: { html?: string }) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Only intercept GET/HEAD requests for HTML pages (not API, assets, etc.)
    // HEAD must be handled too: link checkers and some crawlers probe with
    // HEAD, and falling through returns a 404 for perfectly valid pages.
    const urlPath = req.path;

    if (
      (req.method !== "GET" && req.method !== "HEAD") ||
      urlPath.startsWith("/api/") ||
      urlPath.startsWith("/assets/") ||
      urlPath.startsWith("/images/") ||
      urlPath.match(/\.\w{2,5}$/) // has file extension (.js, .css, .png, etc.)
    ) {
      next();
      return;
    }

    const html = options?.html || getIndexHtml();
    if (!html) {
      next(); // Fallback to _core handler in dev mode
      return;
    }

    // Static pages render through the same helper covered by raw-HTML tests.
    const staticHtml = renderStaticRouteHtml(html, urlPath);
    if (staticHtml) {
      res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .set("Cache-Control", PAGE_CACHE_CONTROL)
        .send(staticHtml);
      return;
    }

    let meta: PageMeta | null = null;
    try {
      meta = await resolveDynamicMeta(urlPath);
    } catch {
      // DB error — fall through to default HTML
    }

    if (meta) {
      res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .set("Cache-Control", PAGE_CACHE_CONTROL)
        .send(injectMeta(html, meta));
      return;
    }

    // Valid SPA-only routes (auth, admin, booking confirmations): serve the
    // shell with a noindex signal — these should never appear in search.
    if (isClientOnlyRoute(urlPath)) {
      res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .set("Cache-Control", "no-store")
        .set("X-Robots-Tag", "noindex, nofollow")
        .send(injectNoindex(html));
      return;
    }

    // Unknown content slug or unknown path: real 404 so crawlers don't
    // index junk URLs (previously every URL returned 200 — a soft 404).
    // The client router renders its own NotFound view from the shell.
    // A 404 is also safer than noindex on transient DB failures for
    // /tours|/packages|/blog slugs: Google retries 404s before dropping.
    const isContentSlug = isContentSlugPath(urlPath);
    res
      .status(404)
      .set("Content-Type", "text/html; charset=utf-8")
      .set(
        "Cache-Control",
        isContentSlug ? NOT_FOUND_CACHE_CONTROL : "no-store"
      )
      .set("X-Robots-Tag", "noindex, nofollow")
      .send(injectNoindex(html));
  };
}
