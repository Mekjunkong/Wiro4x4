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

const SITE_URL = "https://www.wiro4x4indochina.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/optimized/single_cascade_waterfall-lg.jpg`;
const BRAND_SUFFIX = " | WIRO 4x4 Kosher Adventures";

interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonicalPath: string;
  jsonLd?: Record<string, unknown>;
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
    title: "Our Tours",
    description:
      "Browse our collection of 4x4 off-road tours in Chiang Mai and Northern Thailand. Day trips and multi-day adventures with kosher meal options.",
    canonicalPath: "/tours",
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Transparent pricing for WIRO 4x4 tours in Chiang Mai. Private tours, group rates, and kosher meal packages available.",
    canonicalPath: "/pricing",
  },
  "/estimate": {
    title: "Trip Cost Estimator",
    description:
      "Get an instant price estimate for your Chiang Mai 4x4 tour. Select tours, group size, and add-ons to see your total.",
    canonicalPath: "/estimate",
  },
  "/blog": {
    title: "Blog",
    description:
      "Travel tips, destination guides, and stories from Northern Thailand. Kosher travel advice and Chiang Mai insider knowledge.",
    canonicalPath: "/blog",
  },
  "/gallery": {
    title: "Photo Gallery",
    description:
      "Photos from WIRO 4x4 off-road adventures in Chiang Mai. Waterfalls, jungle trails, mountain views, and happy travelers.",
    canonicalPath: "/gallery",
  },
  "/reviews": {
    title: "Customer Reviews",
    description:
      "Read what our guests say about their WIRO 4x4 experience. Verified reviews from Israeli travelers and international visitors.",
    canonicalPath: "/reviews",
  },
  "/book": {
    title: "Book a Tour",
    description:
      "Reserve your WIRO 4x4 off-road adventure in Chiang Mai. Easy booking with WhatsApp confirmation.",
    canonicalPath: "/book",
  },
  "/kosher-tours": {
    title: "Kosher Tours in Thailand",
    description:
      "Fully kosher off-road tours in Chiang Mai with certified kosher meals, Shabbat accommodation, and Hebrew-speaking guides.",
    canonicalPath: "/kosher-tours",
  },
  "/hebrew-guide": {
    title: "Hebrew-Speaking Guide in Chiang Mai",
    description:
      "Tour Chiang Mai and Northern Thailand with an experienced Hebrew-speaking guide. Custom private tours for Israeli travelers.",
    canonicalPath: "/hebrew-guide",
  },
  "/accessible-tours": {
    title: "Accessible & Family-Friendly Tours",
    description:
      "Family-friendly and accessible 4x4 tours in Chiang Mai. Safe adventures for children, seniors, and travelers with special needs.",
    canonicalPath: "/accessible-tours",
  },
  "/faq": {
    title: "FAQ",
    description:
      "Frequently asked questions about WIRO 4x4 tours, kosher meals, booking, cancellation, and traveling in Northern Thailand.",
    canonicalPath: "/faq",
  },
  "/contact": {
    title: "Contact Us",
    description:
      "Get in touch with WIRO 4x4. WhatsApp, email, or booking form. We respond within 24 hours.",
    canonicalPath: "/contact",
  },
  "/packages": {
    title: "Tour Packages",
    description:
      "Multi-day tour packages in Northern Thailand and Indochina. All-inclusive 4x4 adventures with accommodation and kosher meals.",
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function injectMeta(html: string, meta: PageMeta): string {
  const fullTitle = meta.title + BRAND_SUFFIX;
  const safeTitle = escapeHtml(fullTitle);
  const safeDesc = escapeHtml(meta.description);
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const canonicalUrl = `${SITE_URL}${meta.canonicalPath}`;

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  // Replace OG tags
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
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
  );

  // Inject page-specific JSON-LD before closing </head>
  if (meta.jsonLd) {
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`;
    html = html.replace("</head>", `${jsonLdScript}\n</head>`);
  }

  return html;
}

/** Resolve meta for a dynamic route (tour or blog post) */
async function getDynamicMeta(urlPath: string): Promise<PageMeta | null> {
  // /tours/:slug
  const tourMatch = urlPath.match(/^\/tours\/([a-z0-9-]+)$/);
  if (tourMatch) {
    const tour = await getTourBySlug(tourMatch[1]);
    if (tour) {
      return {
        title: tour.name,
        description:
          tour.description?.slice(0, 155) ||
          `${tour.name} — off-road 4x4 tour in Chiang Mai with WIRO 4x4.`,
        ogImage: tour.imageUrl || undefined,
        canonicalPath: `/tours/${tour.slug}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: tour.name,
          description: tour.description,
          provider: {
            "@type": "TravelAgency",
            name: "WIRO 4x4",
            url: SITE_URL,
          },
        },
      };
    }
  }

  // /blog/:slug
  const blogMatch = urlPath.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const post = await getPublishedBlogPostBySlug(blogMatch[1]);
    if (post) {
      return {
        title: post.title,
        description:
          post.excerpt?.slice(0, 155) ||
          post.content?.slice(0, 155) ||
          `${post.title} — WIRO 4x4 blog.`,
        ogImage: post.coverImage || undefined,
        canonicalPath: `/blog/${post.slug}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.content?.slice(0, 200),
          image: post.coverImage || DEFAULT_OG_IMAGE,
          author: {
            "@type": "Organization",
            name: "WIRO 4x4",
          },
          publisher: {
            "@type": "Organization",
            name: "WIRO 4x4",
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/images/logo.png`,
            },
          },
          datePublished: post.publishedAt
            ? new Date(post.publishedAt).toISOString()
            : undefined,
        },
      };
    }
  }

  return null;
}

/** Cache the built index.html in memory (only read once per cold start) */
let cachedHtml: string | null = null;

function getIndexHtml(): string | null {
  if (cachedHtml) return cachedHtml;

  const distPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(import.meta.dirname, "public", "index.html")
      : path.resolve(import.meta.dirname, "..", "dist", "public", "index.html");

  try {
    cachedHtml = fs.readFileSync(distPath, "utf-8");
    return cachedHtml;
  } catch {
    return null;
  }
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
      next(); // Unknown route — let _core handle (404 page)
      return;
    }

    const injectedHtml = injectMeta(html, meta);
    res
      .status(200)
      .set("Content-Type", "text/html; charset=utf-8")
      .send(injectedHtml);
  };
}
