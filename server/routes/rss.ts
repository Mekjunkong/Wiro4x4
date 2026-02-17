import type { Express } from "express";
import type { BlogPost } from "../../drizzle/schema";
import { getAllPublishedBlogPosts } from "../db";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateRssFeed(
  posts: Pick<
    BlogPost,
    "title" | "slug" | "excerpt" | "publishedAt" | "author"
  >[],
  siteUrl: string
): string {
  const items = posts
    .map(
      post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${escapeXml(post.slug)}</link>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ""}</pubDate>
      <guid>${siteUrl}/blog/${escapeXml(post.slug)}</guid>
      <author>${escapeXml(post.author || "WIRO 4x4")}</author>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WIRO 4x4 — Travel Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Travel tips, kosher dining guides, and adventure stories from Northern Thailand</description>
    <language>en</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export function registerRssRoute(app: Express) {
  app.get("/api/rss", async (_req, res) => {
    try {
      const posts = await getAllPublishedBlogPosts();
      const siteUrl = process.env.SITE_URL || "https://wiro4x4.com";
      const xml = generateRssFeed(posts, siteUrl);
      res.set("Content-Type", "application/rss+xml; charset=utf-8");
      res.send(xml);
    } catch (err) {
      console.error("[RSS] Failed to generate feed:", err);
      res.status(500).send("Failed to generate RSS feed");
    }
  });
}
