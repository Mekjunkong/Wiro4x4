import { describe, expect, it } from "vitest";

import {
  WHATSAPP_SOURCES,
  buildAttributionCapsule,
  getWhatsAppSource,
  parseAttributionCapsule,
} from "./whatsappAttribution";

describe("WHATSAPP_SOURCES", () => {
  it("has unique source codes", () => {
    const codes = WHATSAPP_SOURCES.map(source => source.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("keeps the approved initial source mapping stable", () => {
    expect(WHATSAPP_SOURCES).toEqual(
      expect.arrayContaining([
        {
          code: "HOME-HERO-EN",
          page: "/",
          placement: "hero",
          language: "en",
          channelFallback: "direct",
        },
        {
          code: "HOME-FLOAT-HE",
          page: "/",
          placement: "floating",
          language: "he",
          channelFallback: "direct",
        },
        {
          code: "KOSHER-PAGE-HE",
          page: "/he/kosher-tours-chiang-mai",
          placement: "page",
          language: "he",
          channelFallback: "direct",
        },
        {
          code: "HEBREW-GUIDE-HE",
          page: "/he/hebrew-guide-chiang-mai",
          placement: "page",
          language: "he",
          channelFallback: "direct",
        },
        {
          code: "FAMILY-PAGE-EN",
          page: "/private-family-tours",
          placement: "page",
          language: "en",
          channelFallback: "direct",
        },
        {
          code: "TOUR-DOI-INTHANON-EN",
          page: "/tours/doi-inthanon-roof-of-thailand",
          placement: "tour",
          language: "en",
          channelFallback: "direct",
        },
      ])
    );
    expect(getWhatsAppSource("HOME-HERO-EN")?.placement).toBe("hero");
    expect(getWhatsAppSource("NOT-REGISTERED")).toBeUndefined();
  });
});

describe("attribution capsule", () => {
  it("normalizes safe values and round-trips the versioned capsule", () => {
    const capsule = buildAttributionCapsule({
      sourceCode: "HOME-HERO-EN",
      channel: "Organic Search",
      utmSource: "Google Ads",
      utmMedium: "Organic",
      utmCampaign: "Family Summer 2026",
      landingPath: "/he/kosher-tours-chiang-mai",
    });

    expect(capsule).toBe(
      "[WIRO:v1|HOME-HERO-EN|organic-search|google-ads|organic|family-summer-2026|%2Fhe%2Fkosher-tours-chiang-mai]"
    );
    expect(parseAttributionCapsule(capsule)).toEqual({
      version: "v1",
      sourceCode: "HOME-HERO-EN",
      channel: "organic-search",
      utmSource: "google-ads",
      utmMedium: "organic",
      utmCampaign: "family-summer-2026",
      landingPath: "/he/kosher-tours-chiang-mai",
    });
  });

  it("uses missing markers and a deterministic registered channel fallback", () => {
    const first = buildAttributionCapsule({
      sourceCode: "KOSHER-PAGE-HE",
      landingPath: "/he/kosher-tours-chiang-mai",
    });
    const second = buildAttributionCapsule({
      sourceCode: "KOSHER-PAGE-HE",
      landingPath: "/he/kosher-tours-chiang-mai",
    });

    expect(first).toBe(second);
    expect(first).toContain("|direct|-|-|-|");
  });

  it.each([
    "[WIRO:v2|HOME-HERO-EN|direct|-|-|-|%2F]",
    "[WIRO:v1|HOME-HERO-EN|direct|-|-|%2F]",
    "[WIRO:v1|UNKNOWN|direct|-|-|-|%2F]",
    "[WIRO:v1|HOME-HERO-EN|bad channel|-|-|-|%2F]",
    "[WIRO:v1|HOME-HERO-EN|direct|-|-|-|%0Asecret]",
    "prefix [WIRO:v1|HOME-HERO-EN|direct|-|-|-|%2F] suffix",
  ])("rejects malformed or non-canonical capsules: %s", capsule => {
    expect(parseAttributionCapsule(capsule)).toBeNull();
  });

  it("rejects unknown codes, unbounded values, and personal data", () => {
    expect(() =>
      buildAttributionCapsule({ sourceCode: "UNKNOWN", landingPath: "/" })
    ).toThrow(/source code/i);
    expect(() =>
      buildAttributionCapsule({
        sourceCode: "HOME-HERO-EN",
        utmCampaign: "x".repeat(65),
        landingPath: "/",
      })
    ).toThrow(/length/i);

    for (const privateValue of [
      "person@example.com",
      "+972 54 123 4567",
      "https://example.com/private?q=secret",
      "hello|my message",
    ]) {
      expect(() =>
        buildAttributionCapsule({
          sourceCode: "HOME-HERO-EN",
          utmCampaign: privateValue,
          landingPath: "/",
        })
      ).toThrow();
    }
  });

  it("cannot serialize click ids, names, phones, emails, or message content", () => {
    const capsule = buildAttributionCapsule({
      sourceCode: "HOME-HERO-EN",
      channel: "paid",
      utmSource: "google",
      utmMedium: "cpc",
      landingPath: "/",
    });

    expect(capsule).not.toMatch(/gclid|name|phone|email|message/i);
    expect(Object.keys(parseAttributionCapsule(capsule) ?? {})).toEqual([
      "version",
      "sourceCode",
      "channel",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "landingPath",
    ]);
  });
});
