import type { Express } from "express";
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

interface SitemapEntry {
  path: string;
  priority: string;
  changefreq: string;
  lastmod: string | null;
}

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
    path: "/estimate",
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
    path: "/kosher-tours",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: null,
  },
  {
    path: "/hebrew-guide",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: null,
  },
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
  const escapedPath = escapeXml(path);
  if (path === "/hebrew-guide") {
    return [
      `    <xhtml:link rel="alternate" hreflang="he" href="${escaped}${escapedPath}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escaped}${escapedPath}"/>`,
    ].join("\n");
  }

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
      .map(t => ({
        path: `/tours/${t.slug}`,
        lastmod: formatDate(t.updatedAt),
        changefreq: "weekly",
        priority: "0.85",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    ...packages
      .map(p => ({
        path: `/packages/${p.slug}`,
        lastmod: formatDate(p.updatedAt),
        changefreq: "monthly",
        priority: "0.8",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    ...blogs
      .map(b => ({
        path: `/blog/${b.slug}`,
        lastmod: formatDate(b.publishedAt),
        changefreq: "monthly",
        priority: "0.6",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
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

export function registerSitemapRoute(app: Express) {
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const [tours, blogs, packages] = await Promise.all([
        getAllActiveTours(),
        getAllPublishedBlogPosts(),
        getPublishedTourPackages(),
      ]);
      const siteUrl =
        process.env.SITE_URL || "https://www.wiro4x4indochina.com";
      const xml = generateSitemap(
        tours.map(t => ({
          slug: t.slug,
          updatedAt: (t as Record<string, unknown>).updatedAt as
            | string
            | null
            | undefined,
        })),
        blogs.map(b => ({
          slug: b.slug,
          publishedAt: (b as Record<string, unknown>).publishedAt as
            | string
            | null
            | undefined,
        })),
        packages.map(p => ({
          slug: p.slug,
          updatedAt: (p as Record<string, unknown>).updatedAt as
            | string
            | null
            | undefined,
        })),
        siteUrl
      );
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Failed to generate:", err);
      res.status(500).send("Failed to generate sitemap");
    }
  });
}
