import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { generateSitemap } from "./routes/sitemap";

describe("sitemap", () => {
  const commercialPairs = [
    {
      en: "/kosher-tours",
      he: "/he/kosher-tours-chiang-mai",
    },
    {
      en: "/hebrew-guide",
      he: "/he/hebrew-guide-chiang-mai",
    },
    {
      en: "/private-family-tours",
      he: "/he/private-family-tours-chiang-mai",
    },
  ] as const;

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

  it("includes every commercial canonical once with reciprocal language alternates", () => {
    const xml = generateSitemap([], [], [], "https://www.wiro4x4indochina.com");

    for (const pair of commercialPairs) {
      for (const path of [pair.en, pair.he]) {
        const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const canonicalMatches = xml.match(
          new RegExp(
            `<loc>https://www\\.wiro4x4indochina\\.com${escapedPath}</loc>`,
            "g"
          )
        );
        expect(canonicalMatches, path).toHaveLength(1);

        const block = xml.match(
          new RegExp(
            `<url>\\s*<loc>https://www\\.wiro4x4indochina\\.com${escapedPath}</loc>[\\s\\S]*?</url>`
          )
        )?.[0];
        expect(block, path).toBeTruthy();
        expect(block).toContain(
          `hreflang="en" href="https://www.wiro4x4indochina.com${pair.en}"`
        );
        expect(block).toContain(
          `hreflang="he" href="https://www.wiro4x4indochina.com${pair.he}"`
        );
        expect(block).toContain(
          `hreflang="x-default" href="https://www.wiro4x4indochina.com${pair.en}"`
        );
      }
    }
  });

  it("excludes non-canonical admin, auth, booking, album, and tracking URLs", () => {
    const xml = generateSitemap(
      [{ slug: "tracked?utm_source=referral" }],
      [{ slug: "fragmented#section" }],
      [],
      "https://www.wiro4x4indochina.com"
    );

    expect(xml).not.toMatch(
      /<loc>[^<]*\/(?:admin|login|register|booking|album)(?:\/|<)/
    );
    expect(xml).not.toMatch(/<loc>[^<]*[?&](?:utm_|gclid|fbclid)/);
    expect(xml).not.toContain("fragmented#section");
  });

  it("keeps one canonical sitemap directive and relies on the existing root allow rule", () => {
    const robots = readFileSync("client/public/robots.txt", "utf8");

    expect(robots).toContain("User-agent: *\nAllow: /");
    expect(robots.match(/^Sitemap:/gm)).toHaveLength(1);
    expect(robots).toContain(
      "Sitemap: https://www.wiro4x4indochina.com/sitemap.xml"
    );
    expect(robots).not.toContain("Allow: /he/kosher-tours-chiang-mai");
    expect(robots).not.toContain("Allow: /he/hebrew-guide-chiang-mai");
    expect(robots).not.toContain("Allow: /private-family-tours");
    expect(robots).not.toContain("Allow: /he/private-family-tours-chiang-mai");
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
