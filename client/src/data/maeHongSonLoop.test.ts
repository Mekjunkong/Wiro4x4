import { describe, expect, it } from "vitest";

import {
  MAE_HONG_SON_CATEGORIES,
  MAE_HONG_SON_HIGHLIGHTS,
  MAE_HONG_SON_PACES,
  MAE_HONG_SON_STAGES,
  buildGoogleMapsDirectionsUrl,
  buildMaeHongSonSearchUrl,
  filterMaeHongSonHighlights,
} from "./maeHongSonLoop";

describe("Mae Hong Son guide data", () => {
  it("provides complete pace and stage choices", () => {
    expect(MAE_HONG_SON_PACES.map(pace => pace.id)).toEqual(["4", "5", "6"]);
    expect(MAE_HONG_SON_STAGES).toHaveLength(6);
    expect(MAE_HONG_SON_PACES[2].days).toHaveLength(6);
  });

  it("keeps every highlight traceable and mapped to a stage", () => {
    const stageIds = new Set(MAE_HONG_SON_STAGES.map(stage => stage.id));

    for (const highlight of MAE_HONG_SON_HIGHLIGHTS) {
      expect(stageIds.has(highlight.stageId), highlight.id).toBe(true);
      expect(highlight.sourceUrl, highlight.id).toMatch(/^https:\/\//);
      expect(highlight.lastVerified, highlight.id).toMatch(
        /^\d{4}-\d{2}-\d{2}$/
      );
      expect(highlight.searchQuery.length, highlight.id).toBeGreaterThan(8);
    }
  });

  it("provides at least one highlight in every category", () => {
    for (const category of MAE_HONG_SON_CATEGORIES) {
      expect(
        filterMaeHongSonHighlights(category.id).length,
        category.id
      ).toBeGreaterThan(0);
    }
  });

  it("builds Google Maps URLs from encoded user-safe inputs", () => {
    const directions = new URL(
      buildGoogleMapsDirectionsUrl(
        "Chiang Mai Thailand",
        "Mae Sariang Thailand",
        "two-wheeler"
      )
    );
    const search = new URL(buildMaeHongSonSearchUrl("Pai Canyon Thailand"));

    expect(directions.origin).toBe("https://www.google.com");
    expect(directions.searchParams.get("api")).toBe("1");
    expect(directions.searchParams.get("origin")).toBe("Chiang Mai Thailand");
    expect(directions.searchParams.get("destination")).toBe(
      "Mae Sariang Thailand"
    );
    expect(directions.searchParams.get("travelmode")).toBe("two-wheeler");
    expect(search.searchParams.get("query")).toBe("Pai Canyon Thailand");
  });
});
