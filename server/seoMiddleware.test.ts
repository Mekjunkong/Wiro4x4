import { describe, it, expect } from "vitest";
import {
  injectNoindex,
  isClientOnlyRoute,
  isContentSlugPath,
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
