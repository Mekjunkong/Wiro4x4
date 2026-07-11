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

  it("rejects malformed and double-encoded sensitive landing paths", () => {
    for (const landingPath of [
      "/broken/%E0%A4%A",
      "/customer/person%2540example.com",
      "/customer/%252B972%252054%2520123%25204567",
    ]) {
      expect(() =>
        buildAttributionCapsule({
          sourceCode: "HOME-HERO-EN",
          landingPath,
        })
      ).toThrow(/landingPath/);
    }

    expect(
      parseAttributionCapsule(
        "[WIRO:v1|HOME-HERO-EN|direct|-|-|-|%2Fcustomer%2Fperson%252540example.com]"
      )
    ).toBeNull();
  });

  it("accepts a safe encoded path in one canonical representation", () => {
    const capsule = buildAttributionCapsule({
      sourceCode: "HOME-HERO-EN",
      landingPath: "/private%20family%20tours",
    });

    expect(capsule).toBe(
      "[WIRO:v1|HOME-HERO-EN|direct|-|-|-|%2Fprivate-family-tours]"
    );
    expect(parseAttributionCapsule(capsule)?.landingPath).toBe(
      "/private-family-tours"
    );
  });

  it.each(["channel", "utmSource", "utmMedium", "utmCampaign"] as const)(
    "rejects encoded personal data in capsule %s",
    field => {
      for (const encodedPrivateValue of [
        "person%40example.com",
        "person%2540example.com",
        "%2B972%2054%20123%204567",
        "%252B972%252054%2520123%25204567",
      ]) {
        expect(() =>
          buildAttributionCapsule({
            sourceCode: "HOME-HERO-EN",
            landingPath: "/",
            [field]: encodedPrivateValue,
          })
        ).toThrow();
      }
    }
  );

  it.each(["channel", "utmSource", "utmMedium", "utmCampaign"] as const)(
    "rejects malformed encoding in capsule %s",
    field => {
      expect(() =>
        buildAttributionCapsule({
          sourceCode: "HOME-HERO-EN",
          landingPath: "/",
          [field]: "broken%E0%A4%A",
        })
      ).toThrow();
    }
  );

  it("canonicalizes safe encoded capsule tokens", () => {
    const capsule = buildAttributionCapsule({
      sourceCode: "HOME-HERO-EN",
      channel: "Organic%2520Search",
      utmSource: "Safe%2520Source",
      utmMedium: "Social%2520Media",
      utmCampaign: "Family%2520Summer",
      landingPath: "/",
    });

    expect(capsule).toBe(
      "[WIRO:v1|HOME-HERO-EN|organic-search|safe-source|social-media|family-summer|%2F]"
    );
  });

  it("rejects encoded token values while parsing capsules", () => {
    for (const capsule of [
      "[WIRO:v1|HOME-HERO-EN|person%2540example.com|-|-|-|%2F]",
      "[WIRO:v1|HOME-HERO-EN|direct|person%2540example.com|-|-|%2F]",
      "[WIRO:v1|HOME-HERO-EN|direct|-|%252B972541234567|-|%2F]",
      "[WIRO:v1|HOME-HERO-EN|direct|-|-|person%40example.com|%2F]",
    ]) {
      expect(parseAttributionCapsule(capsule)).toBeNull();
    }
  });
});
