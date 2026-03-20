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

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/tours", priority: "0.9", changefreq: "weekly" },
  { path: "/packages", priority: "0.9", changefreq: "weekly" },
  {
    path: "/packages/northern-thailand-3d2n",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    path: "/packages/grand-tour-laos-14d",
    priority: "0.9",
    changefreq: "monthly",
  },
  { path: "/pricing", priority: "0.9", changefreq: "monthly" },
  { path: "/estimate", priority: "0.9", changefreq: "monthly" },
  { path: "/book", priority: "0.9", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/gallery", priority: "0.8", changefreq: "weekly" },
  { path: "/reviews", priority: "0.8", changefreq: "weekly" },
  { path: "/kosher-tours", priority: "0.9", changefreq: "monthly" },
  { path: "/hebrew-guide", priority: "0.9", changefreq: "monthly" },
  { path: "/accessible-tours", priority: "0.9", changefreq: "monthly" },
  { path: "/faq", priority: "0.8", changefreq: "monthly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
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
  return [
    `    <xhtml:link rel="alternate" hreflang="en" href="${escaped}${escapedPath}"/>`,
    `    <xhtml:link rel="alternate" hreflang="he" href="${escaped}${escapedPath}?lang=he"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escaped}${escapedPath}"/>`,
  ].join("\n");
}

function buildUrlEntry(
  siteUrl: string,
  path: string,
  lastmod: string,
  changefreq: string,
  priority: string
): string {
  return `  <url>
    <loc>${escapeXml(siteUrl)}${escapeXml(path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${buildHreflangLinks(siteUrl, path)}
  </url>`;
}

export function generateSitemap(
  tours: SlugItem[],
  blogs: SlugItem[],
  packages: SlugItem[],
  siteUrl: string
): string {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = STATIC_PAGES.map(p =>
    buildUrlEntry(siteUrl, p.path, today, p.changefreq, p.priority)
  ).join("\n");

  const tourUrls = tours
    .map(t => {
      const lastmod = formatDate(t.updatedAt) || today;
      return buildUrlEntry(
        siteUrl,
        `/tours/${t.slug}`,
        lastmod,
        "weekly",
        "0.85"
      );
    })
    .join("\n");

  const packageUrls = packages
    .map(p => {
      const lastmod = formatDate(p.updatedAt) || today;
      return buildUrlEntry(
        siteUrl,
        `/packages/${p.slug}`,
        lastmod,
        "monthly",
        "0.8"
      );
    })
    .join("\n");

  const blogUrls = blogs
    .map(b => {
      const lastmod = formatDate(b.publishedAt) || today;
      return buildUrlEntry(
        siteUrl,
        `/blog/${b.slug}`,
        lastmod,
        "monthly",
        "0.6"
      );
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls}
${tourUrls}
${packageUrls}
${blogUrls}
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
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Failed to generate:", err);
      res.status(500).send("Failed to generate sitemap");
    }
  });
}
