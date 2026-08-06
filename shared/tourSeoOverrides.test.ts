import { describe, expect, it } from "vitest";
import { resolveTourSeoMeta, TOUR_SEO_OVERRIDES } from "./tourSeoOverrides";

describe("tour SEO overrides", () => {
  it.each([
    "doi-inthanon-roof-of-thailand",
    "mae-wang-jungle-wilderness",
  ])("returns the focused metadata for %s", slug => {
    expect(
      resolveTourSeoMeta(slug, {
        title: "Fallback title",
        description: "Fallback description",
      })
    ).toEqual(TOUR_SEO_OVERRIDES[slug]);
  });

  it("leaves brand suffixing to the client and server metadata layers", () => {
    for (const override of Object.values(TOUR_SEO_OVERRIDES)) {
      expect(override.title).not.toContain("WIRO 4x4");
    }
  });

  it("preserves generic metadata for every other tour", () => {
    const fallback = {
      title: "Mae Kampong — Chiang Mai 4x4 Tour",
      description: "Generic tour description",
    };

    expect(resolveTourSeoMeta("mae-kampong-hidden-village", fallback)).toBe(
      fallback
    );
  });
});
