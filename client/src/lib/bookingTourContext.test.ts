import { describe, expect, it } from "vitest";

import {
  buildSelectedToursBookingUrl,
  parseRequestedTourSlugs,
} from "./bookingTourContext";

describe("booking tour context", () => {
  it("trims and deduplicates combined tour and tours query values", () => {
    expect(
      parseRequestedTourSlugs(
        " doi-inthanon , mae-kampong,doi-inthanon, ",
        " mae-kampong "
      )
    ).toEqual(["doi-inthanon", "mae-kampong"]);
  });

  it("ignores empty query values", () => {
    expect(parseRequestedTourSlugs(" , , ", " ")).toEqual([]);
    expect(parseRequestedTourSlugs(null, null)).toEqual([]);
  });

  it("filters the package-builder booking handoff to selected known tour slugs", () => {
    const url = buildSelectedToursBookingUrl(
      [
        "doi-inthanon",
        "unknown-tour",
        "mae-kampong",
        "doi-inthanon",
        "2026-12-20",
        "2-adults",
        "guest@example.com",
      ],
      ["doi-inthanon", "mae-kampong"]
    );

    expect(url).toBe("/book?tours=doi-inthanon,mae-kampong");
    expect(url).not.toContain("2026-12-20");
    expect(url).not.toContain("2-adults");
    expect(url).not.toContain("guest@example.com");
  });

  it("keeps the truthful bare booking flow when no selected slug is known", () => {
    expect(
      buildSelectedToursBookingUrl(["unknown-tour"], ["doi-inthanon"])
    ).toBe("/book");
  });

  it("filters stale DB package slugs before the package-detail booking handoff", () => {
    const persistedPackageTourSlugs = [
      " doi-inthanon ",
      "unknown-tour",
      "mae-kampong",
      "doi-inthanon",
      " ",
    ];
    const currentPublicTourSlugs = ["doi-inthanon", "mae-kampong"];

    expect(
      buildSelectedToursBookingUrl(
        persistedPackageTourSlugs,
        currentPublicTourSlugs
      )
    ).toBe("/book?tours=doi-inthanon,mae-kampong");
    expect(
      buildSelectedToursBookingUrl(
        ["unknown-tour", " "],
        currentPublicTourSlugs
      )
    ).toBe("/book");
  });
});
