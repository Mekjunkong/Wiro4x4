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
      sourceCode: "PRICING-CARD-EN",
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
        sourceCode: "PRICING-CARD-EN",
      },
    });
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
