import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  claimOnce,
  createBehaviorTrackingState,
  getCommercialRoute,
  recordScrollDepth,
} from "./behaviorTracking";

describe("scroll-depth behavior state", () => {
  it("emits each crossed 25, 50, and 90 percent milestone once", () => {
    let state = createBehaviorTrackingState("/pricing");

    let result = recordScrollDepth(state, "/pricing", 24);
    expect(result.depths).toEqual([]);
    state = result.state;

    result = recordScrollDepth(state, "/pricing", 51);
    expect(result.depths).toEqual([25, 50]);
    state = result.state;

    result = recordScrollDepth(state, "/pricing", 95);
    expect(result.depths).toEqual([90]);
    state = result.state;

    result = recordScrollDepth(state, "/pricing", 100);
    expect(result.depths).toEqual([]);
    expect(result.state.emittedDepths).toEqual([25, 50, 90]);
  });

  it("resets milestones on an SPA path change and never emits more than three per page", () => {
    const firstPage = recordScrollDepth(
      createBehaviorTrackingState("/pricing"),
      "/pricing",
      100
    );
    expect(firstPage.depths).toEqual([25, 50, 90]);

    const duplicate = recordScrollDepth(firstPage.state, "/pricing", 100);
    expect(duplicate.depths).toEqual([]);

    const nextPage = recordScrollDepth(duplicate.state, "/packages", 50);
    expect(nextPage.depths).toEqual([25, 50]);
    expect(nextPage.state.page).toBe("/packages");
  });
});

describe("once-only behavior state", () => {
  it("claims visibility or interaction events once per page and resets after navigation", () => {
    const initial = createBehaviorTrackingState("/tours/doi-inthanon");
    const first = claimOnce(
      initial,
      "/tours/doi-inthanon",
      "pricing:doi-inthanon"
    );
    const duplicate = claimOnce(
      first.state,
      "/tours/doi-inthanon",
      "pricing:doi-inthanon"
    );
    const nextPage = claimOnce(
      duplicate.state,
      "/packages/family",
      "pricing:family"
    );

    expect(first.claimed).toBe(true);
    expect(duplicate.claimed).toBe(false);
    expect(nextPage.claimed).toBe(true);
  });

  it("keeps booking_start on the booking form instead of the global sticky link", () => {
    const bookingForm = readFileSync(
      resolve("client/src/pages/BookingForm.tsx"),
      "utf8"
    );
    const stickyBookBar = readFileSync(
      resolve("client/src/components/StickyBookBar.tsx"),
      "utf8"
    );

    expect(bookingForm).toContain('trackEvent("booking_start"');
    expect(stickyBookBar).not.toContain('trackEvent("booking_start"');
  });

  it("starts the quick inquiry on the first focus interaction", () => {
    const quickInquiry = readFileSync(
      resolve("client/src/components/QuickInquiryForm.tsx"),
      "utf8"
    );

    expect(quickInquiry).toContain("onFocusCapture={handleInquiryInteraction}");
  });

  it("guards the pricing-page visibility event across language rerenders", () => {
    const pricingPage = readFileSync(
      resolve("client/src/pages/Pricing.tsx"),
      "utf8"
    );

    expect(pricingPage).toContain("pricingViewTrackedRef.current");
  });

  it("does not construct pricing observers after visibility is already claimed", () => {
    const cases = [
      ["client/src/pages/Pricing.tsx", "pricingViewTrackedRef.current"],
      ["client/src/pages/TourDetail.tsx", "pricingViewKeyRef.current === slug"],
      [
        "client/src/pages/PackageDetail.tsx",
        "pricingViewKeyRef.current === slug",
      ],
    ] as const;

    for (const [file, guard] of cases) {
      const source = readFileSync(resolve(file), "utf8");
      expect(
        source.indexOf(guard),
        `${file} must guard before observing`
      ).toBeLessThan(source.indexOf("new IntersectionObserver"));
    }
  });
});

describe("commercial route configuration", () => {
  it("matches configured static and dynamic commercial routes only", () => {
    expect(getCommercialRoute("/pricing")?.id).toBe("pricing");
    expect(getCommercialRoute("/tours/doi-inthanon")?.id).toBe("tour-detail");
    expect(getCommercialRoute("/packages/family")?.id).toBe("package-detail");
    expect(getCommercialRoute("/admin")).toBeUndefined();
    expect(getCommercialRoute("/blog/how-to-pack")).toBeUndefined();
  });

  it("pairs each English and Hebrew commercial landing route under one stable intent", () => {
    const routePairs = [
      {
        id: "kosher-tours",
        en: "/kosher-tours",
        he: "/he/kosher-tours-chiang-mai",
      },
      {
        id: "hebrew-guide",
        en: "/hebrew-guide",
        he: "/he/hebrew-guide-chiang-mai",
      },
      {
        id: "private-family-tours",
        en: "/private-family-tours",
        he: "/he/private-family-tours-chiang-mai",
      },
    ] as const;

    for (const { id, en, he } of routePairs) {
      expect(getCommercialRoute(en)?.id).toBe(id);
      expect(getCommercialRoute(he)?.id).toBe(id);
    }
  });
});
