import { describe, expect, it } from "vitest";

import { isAllowedGoogleMyMapsEmbedUrl } from "./SamoengMapOverview";

describe("SamoengMapOverview", () => {
  it("accepts the supported Google My Maps embed shape", () => {
    expect(
      isAllowedGoogleMyMapsEmbedUrl(
        "https://www.google.com/maps/d/u/0/embed?mid=example&ehbc=2E312F"
      )
    ).toBe(true);
  });

  it("rejects non-Google, insecure, and editor URLs", () => {
    expect(
      isAllowedGoogleMyMapsEmbedUrl(
        "https://maps.example.com/maps/d/u/0/embed?mid=example"
      )
    ).toBe(false);
    expect(
      isAllowedGoogleMyMapsEmbedUrl(
        "http://www.google.com/maps/d/u/0/embed?mid=example"
      )
    ).toBe(false);
    expect(
      isAllowedGoogleMyMapsEmbedUrl(
        "https://www.google.com/maps/d/u/0/edit?mid=example"
      )
    ).toBe(false);
    expect(
      isAllowedGoogleMyMapsEmbedUrl("https://www.google.com/maps/d/u/0/embed")
    ).toBe(false);
  });
});
