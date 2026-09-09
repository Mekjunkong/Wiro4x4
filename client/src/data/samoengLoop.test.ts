import { describe, expect, it } from "vitest";

import {
  SAMOENG_ATTRACTIONS,
  SAMOENG_CATEGORIES,
  buildGoogleMapsSearchUrl,
  filterSamoengAttractions,
} from "./samoengLoop";

describe("Samoeng Loop guide data", () => {
  it("keeps attraction and category identifiers unique", () => {
    const attractionIds = SAMOENG_ATTRACTIONS.map(attraction => attraction.id);
    const categoryIds = SAMOENG_CATEGORIES.map(category => category.id);

    expect(new Set(attractionIds).size).toBe(attractionIds.length);
    expect(new Set(categoryIds).size).toBe(categoryIds.length);
  });

  it("provides at least one attraction for every filter", () => {
    for (const category of SAMOENG_CATEGORIES) {
      expect(filterSamoengAttractions(category.id).length).toBeGreaterThan(0);
    }
  });

  it("builds a standard Google Maps search URL", () => {
    const url = new URL(
      buildGoogleMapsSearchUrl("Mae Sa Waterfall Chiang Mai")
    );

    expect(url.origin).toBe("https://www.google.com");
    expect(url.pathname).toBe("/maps/search/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe("Mae Sa Waterfall Chiang Mai");
  });
});
