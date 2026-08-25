import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const PUBLIC_INQUIRY_SURFACES = [
  "client/src/components/Hero.tsx",
  "client/src/components/Header.tsx",
  "client/src/components/FloatingActionButtons.tsx",
  "client/src/components/QuickInquiryForm.tsx",
  "client/src/components/Footer.tsx",

  "client/src/components/calculator-v2/SaveEstimateModal.tsx",
  "client/src/components/blog/BlogPostCta.tsx",
  "client/src/pages/HebrewLandingPage.tsx",
  "client/src/pages/TourDetail.tsx",
  "client/src/pages/Pricing.tsx",
  "client/src/pages/Packages.tsx",
  "client/src/pages/PackageDetail.tsx",
  "client/src/pages/BookingForm.tsx",
  "client/src/pages/BookingSuccess.tsx",
  "client/src/pages/BookingCancel.tsx",
  "client/src/pages/FAQ.tsx",
  "client/src/pages/Contact.tsx",
  "client/src/pages/CarRental.tsx",
  "client/src/pages/AccessibleTours.tsx",
] as const;

const DELEGATED_INQUIRY_SURFACES = [
  "client/src/pages/KosherTours.tsx",
  "client/src/pages/HebrewGuide.tsx",
  "client/src/pages/PrivateFamilyTours.tsx",
] as const;

const MIXED_INQUIRY_AND_SOCIAL_SHARE_SURFACES = [
  "client/src/pages/TripAlbum.tsx",
] as const;

// Explicit exclusions from inquiry attribution: admin replies, social sharing,
// and legal-page contact references. These are intentionally not scanned as
// customer inquiry starts.
const EXCLUDED_SURFACES = [
  "client/src/components/admin",
  "client/src/pages/AdminCostCalculator.tsx",
  "client/src/components/blog/ShareButtons.tsx",
  "client/src/components/blog/BlogPostMeta.tsx",
  "client/src/pages/TermsOfService.tsx",
  "client/src/pages/PrivacyPolicy.tsx",
] as const;

describe("public WhatsApp inquiry source scan", () => {
  it("enumerates every public inquiry surface separately from explicit exclusions", () => {
    expect(PUBLIC_INQUIRY_SURFACES).toHaveLength(19);
    expect(DELEGATED_INQUIRY_SURFACES).toHaveLength(3);
    expect(EXCLUDED_SURFACES).not.toContain(
      "client/src/components/calculator-v2/SaveEstimateModal.tsx"
    );
  });

  for (const file of PUBLIC_INQUIRY_SURFACES) {
    it(`${file} uses the shared tracked WhatsApp path`, () => {
      const source = readFileSync(resolve(file), "utf8");

      expect(source, "must not construct wa.me URLs directly").not.toMatch(
        /https:\/\/wa\.me/i
      );
      expect(
        source,
        "must not consume legacy WhatsApp URL constants"
      ).not.toMatch(/\b(?:WHATSAPP_URL|COMPANY_WHATSAPP_URL)\b/);
      expect(source, "must route inquiries through the shared builder").toMatch(
        /\b(?:TrackedWhatsAppLink|buildTrackedWhatsApp(?:Url|Link))\b/
      );
      if (/\bbuildTrackedWhatsApp(?:Url|Link)\b/.test(source)) {
        expect(
          source,
          "programmatic inquiry navigation must emit the canonical click event"
        ).toContain('trackEvent("whatsapp_click"');
      }
    });
  }

  for (const file of DELEGATED_INQUIRY_SURFACES) {
    it(`${file} delegates to the audited commercial inquiry surface`, () => {
      const source = readFileSync(resolve(file), "utf8");

      expect(source, "must not construct wa.me URLs directly").not.toMatch(
        /https:\/\/wa\.me/i
      );
      expect(source, "must delegate to the audited landing renderer").toMatch(
        /\bCommercialLandingPage\b/
      );
    });
  }

  for (const file of MIXED_INQUIRY_AND_SOCIAL_SHARE_SURFACES) {
    it(`${file} tracks company inquiries while preserving generic social sharing`, () => {
      const source = readFileSync(resolve(file), "utf8");

      expect(
        source,
        "must not consume the company WhatsApp base URL"
      ).not.toMatch(/\b(?:WHATSAPP_URL|COMPANY_WHATSAPP_URL)\b/);
      expect(
        source,
        "must route company inquiries through the shared builder"
      ).toMatch(/\bTrackedWhatsAppLink\b/);
      expect(
        source.match(/https:\/\/wa\.me\/\?text=/gi) ?? [],
        "may retain only the generic person-to-person social share URL"
      ).toHaveLength(1);
    });
  }
});
