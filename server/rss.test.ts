import { describe, expect, it } from "vitest";
import { generateRssFeed } from "./routes/rss";

describe("RSS feed generation", () => {
  it("returns valid XML with no posts", () => {
    const xml = generateRssFeed([], "https://wiro4x4.com");
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<rss");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("WIRO 4x4");
  });

  it("includes published posts in feed", () => {
    const posts = [
      {
        title: "Test Post",
        slug: "test-post",
        excerpt: "A test excerpt",
        publishedAt: new Date("2026-01-15"),
        content: "Full content here",
        author: "WIRO 4x4",
      },
    ];
    const xml = generateRssFeed(posts as any, "https://wiro4x4.com");
    expect(xml).toContain("<item>");
    expect(xml).toContain("<title>Test Post</title>");
    expect(xml).toContain("/blog/test-post");
  });

  it("escapes XML special characters", () => {
    const posts = [
      {
        title: "Tips & Tricks <2026>",
        slug: "tips-tricks",
        excerpt: 'Use "quotes" & <tags>',
        publishedAt: new Date("2026-01-15"),
        content: "",
        author: "WIRO 4x4",
      },
    ];
    const xml = generateRssFeed(posts as any, "https://wiro4x4.com");
    expect(xml).toContain("&amp;");
    expect(xml).not.toContain("& ");
  });
});
