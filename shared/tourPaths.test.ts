import { describe, expect, it } from "vitest";
import {
  hebrewTourSeoMeta,
  hebrewTourSlug,
  languagePairPath,
  tourAlternates,
  tourPath,
} from "./tourPaths";

describe("tour paths", () => {
  it("builds per-language URLs and hreflang alternates", () => {
    expect(tourPath("samoeng-loop-mountain-circuit", "en")).toBe(
      "/tours/samoeng-loop-mountain-circuit"
    );
    expect(tourPath("samoeng-loop-mountain-circuit", "he")).toBe(
      "/he/tours/samoeng-loop-mountain-circuit"
    );
    expect(tourAlternates("x")).toEqual({
      en: "/tours/x",
      he: "/he/tours/x",
      "x-default": "/tours/x",
    });
    expect(hebrewTourSlug("/he/tours/x")).toBe("x");
    expect(hebrewTourSlug("/tours/x")).toBeNull();
  });

  it("finds the other-language page for tours and landing pages", () => {
    expect(languagePairPath("/tours/x", "he")).toBe("/he/tours/x");
    expect(languagePairPath("/he/tours/x", "en")).toBe("/tours/x");
    expect(languagePairPath("/tours/x", "en")).toBeNull();
    expect(languagePairPath("/kosher-tours", "he")).toBe(
      "/he/kosher-tours-chiang-mai"
    );
    expect(languagePairPath("/he/kosher-tours-chiang-mai", "en")).toBe(
      "/kosher-tours"
    );
    expect(languagePairPath("/gallery", "he")).toBeNull();
  });

  it("writes Hebrew meta from the site's own Hebrew copy", () => {
    const meta = hebrewTourSeoMeta("mae-kampong-hidden-village")!;
    expect(meta.title).toContain("מאה קמפונג");
    expect(meta.description).toContain("כפר הרים אקולוגי");
    expect(hebrewTourSeoMeta("not-a-tour")).toBeNull();
  });
});
