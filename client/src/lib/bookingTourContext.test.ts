import { describe, expect, it } from "vitest";

import {
  buildPackageBookingUrl,
  buildSelectedToursBookingUrl,
  parseRequestedPackageName,
  parseRequestedTourSlugs,
} from "./bookingTourContext";

describe("booking tour context", () => {
  it("preserves a fallback package name in the booking handoff", () => {
    const packageName = "3 Days / 2 Nights — Northern Thailand";
    const url = buildPackageBookingUrl(packageName);

    expect(url).toBe(
      "/book?package=3%20Days%20%2F%202%20Nights%20%E2%80%94%20Northern%20Thailand"
    );
    expect(parseRequestedPackageName("  " + packageName + "  ")).toBe(
      packageName
    );
    expect(buildPackageBookingUrl("  ")).toBe("/book");
  });
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
