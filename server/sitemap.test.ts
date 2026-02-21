import { describe, it, expect } from "vitest";
import { generateSitemap } from "./routes/sitemap";

describe("sitemap", () => {
  it("generates valid XML with static pages", () => {
    const xml = generateSitemap([], [], "https://www.wiro4x4indochina.com");
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("https://www.wiro4x4indochina.com/");
    expect(xml).toContain("https://www.wiro4x4indochina.com/pricing");
    expect(xml).toContain("https://www.wiro4x4indochina.com/blog");
  });

  it("includes tour and blog slugs", () => {
    const tours = [{ slug: "doi-inthanon" }];
    const blogs = [{ slug: "kosher-guide" }];
    const xml = generateSitemap(
      tours,
      blogs,
      "https://www.wiro4x4indochina.com"
    );
    expect(xml).toContain("/tours/doi-inthanon");
    expect(xml).toContain("/blog/kosher-guide");
  });

  it("escapes XML special characters in slugs", () => {
    const tours = [{ slug: "tour-with-&-ampersand" }];
    const xml = generateSitemap(tours, [], "https://www.wiro4x4indochina.com");
    expect(xml).toContain("tour-with-&amp;-ampersand");
    expect(xml).not.toContain("tour-with-&-ampersand</loc>");
  });
});
