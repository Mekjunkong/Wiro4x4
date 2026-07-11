import { describe, it, expect } from "vitest";
import {
  injectNoindex,
  isClientOnlyRoute,
  isContentSlugPath,
  absoluteUrl,
  truncateDescription,
  injectMeta,
} from "./seoMiddleware";

describe("seoMiddleware route classification", () => {
  it("flags auth and transactional SPA routes as client-only (noindex, 200)", () => {
    expect(isClientOnlyRoute("/login")).toBe(true);
    expect(isClientOnlyRoute("/register")).toBe(true);
    expect(isClientOnlyRoute("/forgot-password")).toBe(true);
    expect(isClientOnlyRoute("/booking/success")).toBe(true);
    expect(isClientOnlyRoute("/booking/cancel")).toBe(true);
    expect(isClientOnlyRoute("/admin")).toBe(true);
    expect(isClientOnlyRoute("/admin/cost-calculator")).toBe(true);
    expect(isClientOnlyRoute("/album/abc123")).toBe(true);
    expect(isClientOnlyRoute("/404")).toBe(true);
  });

  it("does not flag marketing pages or content slugs as client-only", () => {
    expect(isClientOnlyRoute("/")).toBe(false);
    expect(isClientOnlyRoute("/tours")).toBe(false);
    expect(isClientOnlyRoute("/tours/doi-inthanon-roof-of-thailand")).toBe(
      false
    );
    expect(isClientOnlyRoute("/kosher-tours")).toBe(false);
    // Prefix must not over-match
    expect(isClientOnlyRoute("/administrator")).toBe(false);
  });

  it("recognizes content slug shapes for tours, packages, and blog", () => {
    expect(isContentSlugPath("/tours/some-tour")).toBe(true);
    expect(isContentSlugPath("/packages/northern-thailand-3d2n")).toBe(true);
    expect(isContentSlugPath("/blog/kosher-food-chiang-mai")).toBe(true);
    expect(isContentSlugPath("/tours")).toBe(false);
    expect(isContentSlugPath("/random-page")).toBe(false);
    expect(isContentSlugPath("/tours/UPPER_case!")).toBe(false);
  });
});

describe("injectNoindex", () => {
  it("replaces the index,follow robots meta with noindex", () => {
    const html = `<head><meta name="robots" content="index, follow" /></head>`;
    const result = injectNoindex(html);
    expect(result).toContain(
      '<meta name="robots" content="noindex, nofollow" />'
    );
    expect(result).not.toContain('content="index, follow"');
  });
});

describe("SEO metadata helpers", () => {
  it("normalizes image URLs and keeps descriptions on word boundaries", () => {
    expect(absoluteUrl("/images/post.jpg")).toBe(
      "https://www.wiro4x4indochina.com/images/post.jpg"
    );
    expect(absoluteUrl("https://cdn.example.com/post.jpg")).toBe(
      "https://cdn.example.com/post.jpg"
    );
    expect(truncateDescription("one two three four", 13)).toBe("one two…");
  });

  it("injects absolute social images into the HTML shell", () => {
    const shell = `<html lang="en"><head>
      <title>App</title>
      <meta name="description" content="default" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="default" />
      <meta property="og:description" content="default" />
      <meta property="og:image" content="/default.jpg" />
      <meta property="og:url" content="https://example.com" />
      <meta name="twitter:title" content="default" />
      <meta name="twitter:description" content="default" />
      <meta name="twitter:image" content="/default.jpg" />
      <link rel="canonical" href="https://example.com" />
    </head></html>`;
    const result = injectMeta(shell, {
      title: "Post",
      description: "one two three four",
      ogImage: "/images/post.jpg",
      canonicalPath: "/blog/post",
    });

    expect(result).toContain(
      'property="og:image" content="https://www.wiro4x4indochina.com/images/post.jpg"'
    );
    expect(result).toContain(
      'name="twitter:image" content="https://www.wiro4x4indochina.com/images/post.jpg"'
    );
    expect(result).toContain('name="description" content="one two three four"');
  });
});
