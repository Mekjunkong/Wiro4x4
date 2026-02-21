import type { Express } from "express";
import { getAllActiveTours, getAllPublishedBlogPosts } from "../db";

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
}

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/pricing", priority: "0.9", changefreq: "monthly" },
  { path: "/estimate", priority: "0.9", changefreq: "monthly" },
  { path: "/book", priority: "0.9", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/gallery", priority: "0.8", changefreq: "weekly" },
  { path: "/reviews", priority: "0.8", changefreq: "weekly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
];

export function generateSitemap(
  tours: SlugItem[],
  blogs: SlugItem[],
  siteUrl: string
): string {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = STATIC_PAGES.map(
    p => `  <url>
    <loc>${escapeXml(siteUrl)}${escapeXml(p.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n");

  const tourUrls = tours
    .map(
      t => `  <url>
    <loc>${escapeXml(siteUrl)}/tours/${escapeXml(t.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  const blogUrls = blogs
    .map(
      b => `  <url>
    <loc>${escapeXml(siteUrl)}/blog/${escapeXml(b.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${tourUrls}
${blogUrls}
</urlset>`;
}

export function registerSitemapRoute(app: Express) {
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const tours = await getAllActiveTours();
      const blogs = await getAllPublishedBlogPosts();
      const siteUrl =
        process.env.SITE_URL || "https://www.wiro4x4indochina.com";
      const xml = generateSitemap(
        tours.map(t => ({ slug: t.slug })),
        blogs.map(b => ({ slug: b.slug })),
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
