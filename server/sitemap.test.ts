import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { generateSitemap } from "./routes/sitemap";

describe("sitemap", () => {
  it("generates valid XML with static pages", () => {
    const xml = generateSitemap([], [], [], "https://www.wiro4x4indochina.com");
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("https://www.wiro4x4indochina.com/");
    expect(xml).toContain("https://www.wiro4x4indochina.com/pricing");
    expect(xml).toContain("https://www.wiro4x4indochina.com/gallery");
    expect(xml).toContain("https://www.wiro4x4indochina.com/packages");
    expect(xml).toContain("https://www.wiro4x4indochina.com/blog");
    expect(xml).toContain("https://www.wiro4x4indochina.com/kosher-tours");
    expect(xml).toContain("https://www.wiro4x4indochina.com/hebrew-guide");
    expect(xml).toContain("https://www.wiro4x4indochina.com/accessible-tours");
    expect(xml).toContain("https://www.wiro4x4indochina.com/faq");
    expect(xml).toContain("https://www.wiro4x4indochina.com/contact");
  });

  it("includes tour, package, and blog slugs", () => {
    const tours = [{ slug: "doi-inthanon", updatedAt: "2026-05-10" }];
    const blogs = [{ slug: "kosher-guide", publishedAt: "2026-05-11" }];
    const packages = [{ slug: "weekend-adventure", updatedAt: "2026-05-12" }];
    const xml = generateSitemap(
      tours,
      blogs,
      packages,
      "https://www.wiro4x4indochina.com"
    );
    expect(xml).toContain("/tours/doi-inthanon");
    expect(xml).toContain("/packages/weekend-adventure");
    expect(xml).toContain("/blog/kosher-guide");
  });

  it("uses accurate lastmod values and omits dynamic lastmod when no date is available", () => {
    const xml = generateSitemap(
      [{ slug: "dated-tour", updatedAt: "2026-05-10T12:30:00.000Z" }],
      [{ slug: "undated-blog" }],
      [],
      "https://www.wiro4x4indochina.com/"
    );

    expect(xml).toContain(
      "<loc>https://www.wiro4x4indochina.com/tours/dated-tour</loc>\n    <lastmod>2026-05-10</lastmod>"
    );
    expect(xml).toContain(
      "<loc>https://www.wiro4x4indochina.com/blog/undated-blog</loc>\n    <changefreq>monthly</changefreq>"
    );
    expect(xml).not.toContain("https://www.wiro4x4indochina.com//");
  });

  it("does not duplicate static package URLs when the same package comes from the database", () => {
    const xml = generateSitemap(
      [],
      [],
      [{ slug: "northern-thailand-3d2n", updatedAt: "2026-05-18" }],
      "https://www.wiro4x4indochina.com"
    );

    const occurrences = xml.match(
      /https:\/\/www\.wiro4x4indochina\.com\/packages\/northern-thailand-3d2n/g
    );
    expect(occurrences).toHaveLength(3);
  });

  it("marks the Hebrew guide as the Hebrew page without making every URL Hebrew", () => {
    const xml = generateSitemap([], [], [], "https://www.wiro4x4indochina.com");
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="he" href="https://www.wiro4x4indochina.com/hebrew-guide"/>'
    );
    expect(xml).not.toContain(
      '<xhtml:link rel="alternate" hreflang="he" href="https://www.wiro4x4indochina.com/tours"/>'
    );
  });

  it("escapes XML special characters in slugs", () => {
    const tours = [{ slug: "tour-with-&-ampersand" }];
    const xml = generateSitemap(
      tours,
      [],
      [],
      "https://www.wiro4x4indochina.com"
    );
    expect(xml).toContain("tour-with-&amp;-ampersand");
    expect(xml).not.toContain("tour-with-&-ampersand</loc>");
  });

  it("routes all page requests (sitemap, package details, catch-all) to the server function on Vercel", () => {
    // The catch-all rewrite must target /api (the Express app with the SEO
    // middleware), NOT /index.html — a static-shell catch-all would bypass
    // meta injection and turn every unknown URL into a soft 404. Static
    // files still win before rewrites, so this covers /sitemap.xml,
    // /packages/:slug, and every other HTML route.
    const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8")) as {
      rewrites: Array<{ source: string; destination: string }>;
    };

    const catchAll = vercelConfig.rewrites.find(r => r.source === "/(.*)");
    expect(catchAll?.destination).toBe("/api");

    // Every rewrite destination must be the server function — nothing may
    // point at a static shell.
    for (const rewrite of vercelConfig.rewrites) {
      expect(rewrite.destination).toBe("/api");
    }
  });
});
