import type { Express } from "express";
import {
  COMMERCIAL_SEO_ROUTE_PAIRS,
  getCommercialSeoRoute,
} from "../../shared/commercialSeo";
import {
  isCanonicalBlogSlug,
  isCanonicalTourOrPackageSlug,
} from "../../shared/schemas";
import {
  CORE_TOUR_SLUGS,
  FALLBACK_BLOG_POSTS,
} from "../../shared/seoFallbackContent";
import {
  getAllActiveTours,
  getAllPublishedBlogPosts,
  getPublishedTourPackages,
} from "../db";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface SlugItem {
  slug: string;
  updatedAt?: Date | string | null;
  publishedAt?: Date | string | null;
}

interface SitemapSourceLoaders {
  tours: () => Promise<SlugItem[]>;
  blogs: () => Promise<SlugItem[]>;
  packages: () => Promise<SlugItem[]>;
}

interface SitemapSources {
  tours: SlugItem[];
  blogs: SlugItem[];
  packages: SlugItem[];
}

interface SitemapEntry {
  path: string;
  priority: string;
  changefreq: string;
  lastmod: string | null;
}

const COMMERCIAL_PAGES: SitemapEntry[] = COMMERCIAL_SEO_ROUTE_PAIRS.flatMap(
  pair =>
    ([pair.paths.en, pair.paths.he] as const).map(path => ({
      path,
      priority: "0.9",
      changefreq: "monthly",
      lastmod: null,
    }))
);

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly", lastmod: null },
  {
    path: "/tours",
    priority: "0.9",
    changefreq: "weekly",
    lastmod: null,
  },
  {
    path: "/packages",
    priority: "0.9",
    changefreq: "weekly",
    lastmod: null,
  },
  {
    path: "/packages/northern-thailand-3d2n",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: null,
  },
  {
    path: "/packages/grand-tour-laos-14d",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: null,
  },
  {
    path: "/pricing",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: null,
  },
  {
    path: "/book",
    priority: "0.4",
    changefreq: "yearly",
    lastmod: null,
  },
  {
    path: "/blog",
    priority: "0.8",
    changefreq: "weekly",
    lastmod: null,
  },
  {
    path: "/gallery",
    priority: "0.8",
    changefreq: "weekly",
    lastmod: null,
  },
  {
    path: "/reviews",
    priority: "0.8",
    changefreq: "weekly",
    lastmod: null,
  },
  {
    path: "/about",
    priority: "0.6",
    changefreq: "monthly",
    lastmod: null,
  },
  ...COMMERCIAL_PAGES,
  {
    path: "/accessible-tours",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: null,
  },
  {
    path: "/car-rental",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: null,
  },
  {
    path: "/faq",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: null,
  },
  {
    path: "/contact",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: null,
  },
  {
    path: "/terms",
    priority: "0.3",
    changefreq: "yearly",
    lastmod: null,
  },
  {
    path: "/privacy",
    priority: "0.3",
    changefreq: "yearly",
    lastmod: null,
  },
];

function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function buildHreflangLinks(siteUrl: string, path: string): string {
  const escaped = escapeXml(siteUrl);
  const commercialRoute = getCommercialSeoRoute(path);
  if (commercialRoute) {
    const { pair } = commercialRoute;
    return [
      `    <xhtml:link rel="alternate" hreflang="en" href="${escaped}${escapeXml(pair.paths.en)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="he" href="${escaped}${escapeXml(pair.paths.he)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escaped}${escapeXml(pair.paths.en)}"/>`,
    ].join("\n");
  }

  const escapedPath = escapeXml(path);
  return [
    `    <xhtml:link rel="alternate" hreflang="en" href="${escaped}${escapedPath}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escaped}${escapedPath}"/>`,
  ].join("\n");
}

function buildUrlEntry(
  siteUrl: string,
  path: string,
  lastmod: string | null,
  changefreq: string,
  priority: string
): string {
  return `  <url>
    <loc>${escapeXml(siteUrl)}${escapeXml(path)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${buildHreflangLinks(siteUrl, path)}
  </url>`;
}

function uniqueByPath(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  return entries.filter(entry => {
    // Canonical sitemap URLs never contain query strings or fragments.
    if (!entry.path.startsWith("/") || /[?#]/.test(entry.path)) return false;
    if (seen.has(entry.path)) return false;
    seen.add(entry.path);
    return true;
  });
}

export function generateSitemap(
  tours: SlugItem[],
  blogs: SlugItem[],
  packages: SlugItem[],
  siteUrl: string
): string {
  const cleanSiteUrl = siteUrl.replace(/\/+$/, "");
  const entries = uniqueByPath([
    ...STATIC_PAGES,
    ...tours
      .filter(t => isCanonicalTourOrPackageSlug(t.slug))
      .map(t => ({
        path: `/tours/${t.slug}`,
        lastmod: formatDate(t.updatedAt),
        changefreq: "weekly",
        priority: "0.85",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    ...CORE_TOUR_SLUGS.map(slug => ({
      path: `/tours/${slug}`,
      lastmod: null,
      changefreq: "monthly",
      priority: "0.85",
    })),
    ...packages
      .filter(p => isCanonicalTourOrPackageSlug(p.slug))
      .map(p => ({
        path: `/packages/${p.slug}`,
        lastmod: formatDate(p.updatedAt),
        changefreq: "monthly",
        priority: "0.8",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    ...blogs
      .filter(b => isCanonicalBlogSlug(b.slug))
      .map(b => ({
        path: `/blog/${b.slug}`,
        lastmod: formatDate(b.publishedAt),
        changefreq: "monthly",
        priority: "0.6",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    ...FALLBACK_BLOG_POSTS.map(post => ({
      path: `/blog/${post.slug}`,
      lastmod: formatDate(post.publishedAt),
      changefreq: "monthly",
      priority: "0.6",
    })),
  ]);

  const urls = entries
    .map(p =>
      buildUrlEntry(cleanSiteUrl, p.path, p.lastmod, p.changefreq, p.priority)
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

export async function loadSitemapSources(
  loaders: SitemapSourceLoaders
): Promise<SitemapSources> {
  const sourceNames = ["tours", "blogs", "packages"] as const;
  const results = await Promise.allSettled([
    loaders.tours(),
    loaders.blogs(),
    loaders.packages(),
  ]);

  const sources: SitemapSources = {
    tours: [],
    blogs: [],
    packages: [],
  };

  results.forEach((result, index) => {
    const sourceName = sourceNames[index];
    if (result.status === "fulfilled") {
      sources[sourceName] = result.value;
      return;
    }

    const message =
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);
    console.warn(
      `[Sitemap] ${sourceName} unavailable; serving remaining URLs: ${message}`
    );
  });

  return sources;
}

export function registerSitemapRoute(app: Express) {
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const { tours, blogs, packages } = await loadSitemapSources({
        tours: async () =>
          (await getAllActiveTours()).map(t => ({
            slug: t.slug,
            updatedAt: (t as Record<string, unknown>).updatedAt as
              | string
              | null
              | undefined,
          })),
        blogs: async () =>
          (await getAllPublishedBlogPosts()).map(b => ({
            slug: b.slug,
            publishedAt: (b as Record<string, unknown>).publishedAt as
              | string
              | null
              | undefined,
          })),
        packages: async () =>
          (await getPublishedTourPackages()).map(p => ({
            slug: p.slug,
            updatedAt: (p as Record<string, unknown>).updatedAt as
              | string
              | null
              | undefined,
          })),
      });
      const siteUrl =
        process.env.SITE_URL || "https://www.wiro4x4indochina.com";
      const xml = generateSitemap(tours, blogs, packages, siteUrl);
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.set(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=86400"
      );
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Failed to generate:", err);
      res.status(500).send("Failed to generate sitemap");
    }
  });
}
