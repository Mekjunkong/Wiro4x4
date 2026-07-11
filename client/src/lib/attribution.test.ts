import { describe, expect, it } from "vitest";

import {
  ATTRIBUTION_TTL_MS,
  captureFirstTouch,
  type AttributionStorage,
} from "./attribution";

const NOW = Date.UTC(2026, 6, 12);

class MemoryStorage implements AttributionStorage {
  value: string | null = null;

  getItem() {
    return this.value;
  }

  setItem(_key: string, value: string) {
    this.value = value;
  }
}

function environment(
  pathname: string,
  search = "",
  overrides: Partial<{
    referrer: string;
    language: string;
    now: number;
  }> = {}
) {
  return {
    location: { pathname, search },
    referrer: overrides.referrer ?? "",
    language: overrides.language ?? "en-US",
    now: () => overrides.now ?? NOW,
  };
}

describe("captureFirstTouch", () => {
  it("captures normalized first-touch fields without storing a click id value", () => {
    const storage = new MemoryStorage();
    const result = captureFirstTouch(
      environment(
        "/kosher-tours/",
        "?utm_source=Google Ads&utm_medium=CPC&utm_campaign=Summer%20Family&utm_content=Hero CTA&gclid=secret-click-value",
        {
          referrer: "https://www.google.co.il/search?q=private+tours",
          language: "he-IL",
        }
      ),
      storage
    );

    expect(result).toMatchObject({
      landingPath: "/kosher-tours/",
      referrerHost: "google.co.il",
      utmSource: "google-ads",
      utmMedium: "cpc",
      utmCampaign: "summer-family",
      utmContent: "hero-cta",
      hasGoogleClickId: true,
      initialLanguage: "he",
      firstVisitAt: NOW,
      session: { landingPath: "/kosher-tours/" },
    });
    expect(storage.value).not.toContain("secret-click-value");
    expect(storage.value).not.toContain("search?q");
  });

  it("preserves a valid first touch while exposing the current session landing", () => {
    const storage = new MemoryStorage();
    captureFirstTouch(environment("/", "?utm_source=google"), storage);

    const later = captureFirstTouch(
      environment("/hebrew-guide", "?utm_source=newsletter", {
        now: NOW + 5_000,
      }),
      storage
    );

    expect(later.landingPath).toBe("/");
    expect(later.utmSource).toBe("google");
    expect(later.firstVisitAt).toBe(NOW);
    expect(later.session.landingPath).toBe("/hebrew-guide");
  });

  it("replaces first touch at the 90-day expiry boundary", () => {
    const storage = new MemoryStorage();
    captureFirstTouch(environment("/"), storage);

    const expired = captureFirstTouch(
      environment("/kosher-tours", "?utm_source=partner", {
        now: NOW + ATTRIBUTION_TTL_MS,
      }),
      storage
    );

    expect(expired.landingPath).toBe("/kosher-tours");
    expect(expired.utmSource).toBe("partner");
    expect(expired.firstVisitAt).toBe(NOW + ATTRIBUTION_TTL_MS);
  });

  it("safely extracts only a valid referrer hostname", () => {
    const validStorage = new MemoryStorage();
    const valid = captureFirstTouch(
      environment("/", "", {
        referrer:
          "https://User:Pass@WWW.Example.COM:8443/private?q=email@example.com",
      }),
      validStorage
    );
    const malformed = captureFirstTouch(
      environment("/", "", { referrer: "not a url" }),
      new MemoryStorage()
    );

    expect(valid.referrerHost).toBe("example.com");
    expect(validStorage.value).not.toContain("User");
    expect(validStorage.value).not.toContain("private");
    expect(malformed.referrerHost).toBeNull();
  });

  it("detects all Google click-id parameter names by presence only", () => {
    for (const key of ["gclid", "gbraid", "wbraid"]) {
      const storage = new MemoryStorage();
      const result = captureFirstTouch(
        environment("/", `?${key}=private-value`),
        storage
      );
      expect(result.hasGoogleClickId).toBe(true);
      expect(storage.value).not.toContain("private-value");
    }
  });

  it("falls back without throwing when storage is unavailable or malformed", () => {
    const unavailable: AttributionStorage = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    };
    const malformed = new MemoryStorage();
    malformed.value = "{broken-json";

    expect(() =>
      captureFirstTouch(environment("/contact"), unavailable)
    ).not.toThrow();
    expect(
      captureFirstTouch(environment("/contact"), unavailable).landingPath
    ).toBe("/contact");
    expect(captureFirstTouch(environment("/faq"), malformed).landingPath).toBe(
      "/faq"
    );
  });

  it("replaces structurally valid stored data that violates privacy bounds", () => {
    const storage = new MemoryStorage();
    storage.value = JSON.stringify({
      landingPath: "/old",
      referrerHost: "example.com",
      utmSource: "person@example.com",
      utmMedium: "x".repeat(65),
      utmCampaign: null,
      utmContent: null,
      hasGoogleClickId: false,
      initialLanguage: "en",
      firstVisitAt: NOW - 1_000,
    });

    const result = captureFirstTouch(
      environment("/safe", "?utm_source=google"),
      storage
    );

    expect(result.landingPath).toBe("/safe");
    expect(result.utmSource).toBe("google");
    expect(storage.value).not.toContain("person@example.com");
  });
});
