import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  CANONICAL_EVENTS,
  trackEvent,
  type AnalyticsEventName,
} from "./analytics";

const originalWindow = globalThis.window;

function setWindow(plausible?: (...args: unknown[]) => void) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: plausible ? { plausible } : {},
  });
}

afterEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });
  vi.restoreAllMocks();
});

describe("analytics event contract", () => {
  it("exports only the canonical commercial event names", () => {
    expect(CANONICAL_EVENTS).toEqual([
      "commercial_page_view",
      "tour_view",
      "pricing_view",
      "itinerary_expand",
      "proof_open",
      "faq_expand",
      "inquiry_start",
      "whatsapp_click",
      "booking_start",
      "booking_complete",
      "scroll_depth",
    ]);
    expectTypeOf<AnalyticsEventName>().toEqualTypeOf<
      (typeof CANONICAL_EVENTS)[number]
    >();
  });

  it("forwards only allowlisted non-sensitive properties", () => {
    const plausible = vi.fn();
    setWindow(plausible);

    trackEvent("whatsapp_click", {
      page: "/pricing",
      placement: "package-card",
      language: "en",
      tour: "mae-kampong",
      depth: 50,
      sourceChannel: "organic",
      utmSource: "google",
      utmMedium: "search",
      utmCampaign: "summer",
      sourceCode: "PRICING-PACKAGE-EN",
      email: "traveler@example.com",
      phone: "+972541234567",
      message: "private inquiry",
      unexpected: "drop-me",
    } as never);

    expect(plausible).toHaveBeenCalledWith("whatsapp_click", {
      props: {
        page: "/pricing",
        placement: "package-card",
        language: "en",
        tour: "mae-kampong",
        depth: 50,
        sourceChannel: "organic",
        utmSource: "google",
        utmMedium: "search",
        utmCampaign: "summer",
        sourceCode: "PRICING-PACKAGE-EN",
      },
    });
  });

  it("drops plain, encoded, and double-encoded personal data from every free-text field", () => {
    const plausible = vi.fn();
    setWindow(plausible);
    const fields = [
      "page",
      "placement",
      "tour",
      "sourceChannel",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "language",
      "sourceCode",
    ] as const;
    const privateValues = [
      "person@example.com",
      "person%40example.com",
      "person%2540example.com",
      "+972 54 123 4567",
      "%2B972%2054%20123%204567",
      "%252B972%252054%2520123%25204567",
    ];

    for (const field of fields) {
      for (const value of privateValues) {
        trackEvent("whatsapp_click", { [field]: value } as never);
        expect(plausible.mock.calls.at(-1)?.[1]).toEqual({ props: {} });
      }
    }
  });

  it("drops malformed and field-specific oversized string properties", () => {
    const plausible = vi.fn();
    setWindow(plausible);
    const oversized = {
      page: `/${"x".repeat(240)}`,
      placement: "x".repeat(81),
      tour: "x".repeat(121),
      sourceChannel: "x".repeat(25),
      utmSource: "x".repeat(65),
      utmMedium: "x".repeat(65),
      utmCampaign: "x".repeat(65),
      language: "x".repeat(3),
      sourceCode: "X".repeat(121),
    } as const;

    for (const [field, value] of Object.entries(oversized)) {
      trackEvent("whatsapp_click", { [field]: value } as never);
      expect(plausible.mock.calls.at(-1)?.[1]).toEqual({ props: {} });
    }

    for (const field of Object.keys(oversized)) {
      trackEvent("whatsapp_click", { [field]: "%E0%A4%A" } as never);
      expect(plausible.mock.calls.at(-1)?.[1]).toEqual({ props: {} });
    }
  });

  it("restricts language, depth, and source codes to canonical runtime values", () => {
    const plausible = vi.fn();
    setWindow(plausible);

    for (const depth of [
      75,
      25.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      "50",
    ]) {
      trackEvent("scroll_depth", {
        language: "english",
        depth,
        sourceCode: "UNKNOWN-SOURCE",
      } as never);
      expect(plausible).toHaveBeenLastCalledWith("scroll_depth", { props: {} });
    }

    trackEvent("scroll_depth", {
      language: "he",
      depth: 90,
      sourceCode: "ESTIMATE-V2-SAVE-HE",
    });
    expect(plausible).toHaveBeenLastCalledWith("scroll_depth", {
      props: {
        language: "he",
        depth: 90,
        sourceCode: "ESTIMATE-V2-SAVE-HE",
      },
    });
  });

  it("normalizes and forwards bounded canonical values while dropping an invalid event", () => {
    const plausible = vi.fn();
    setWindow(plausible);

    trackEvent("whatsapp_click", {
      page: "/tours/doi-inthanon",
      placement: "booking-card",
      language: "en",
      tour: "doi-inthanon",
      depth: 25,
      sourceChannel: "organic",
      utmSource: "google",
      utmMedium: "search",
      utmCampaign: "summer-2026",
      sourceCode: "TOUR-DETAIL-EN",
    });
    expect(plausible).toHaveBeenLastCalledWith("whatsapp_click", {
      props: {
        page: "/tours/doi-inthanon",
        placement: "booking-card",
        language: "en",
        tour: "doi-inthanon",
        depth: 25,
        sourceChannel: "organic",
        utmSource: "google",
        utmMedium: "search",
        utmCampaign: "summer-2026",
        sourceCode: "TOUR-DETAIL-EN",
      },
    });

    trackEvent("not-canonical" as AnalyticsEventName, { page: "/pricing" });
    expect(plausible).toHaveBeenCalledTimes(1);
  });

  it("is a no-op without Plausible and never surfaces analytics failures", () => {
    setWindow();
    expect(() =>
      trackEvent("commercial_page_view", { page: "/" })
    ).not.toThrow();

    setWindow(() => {
      throw new Error("analytics unavailable");
    });
    expect(() => trackEvent("whatsapp_click", { page: "/" })).not.toThrow();
  });
});
