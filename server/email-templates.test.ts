import { describe, expect, it } from "vitest";
import {
  sendAbandonedBookingEmail,
  type AbandonedBookingEmailData,
} from "./email-templates/abandoned-booking";
import {
  sendPreTripInfoEmail,
  type PreTripInfoEmailData,
} from "./email-templates/pre-trip-info";
import {
  sendPostTripFollowupEmail,
  type PostTripFollowupEmailData,
} from "./email-templates/post-trip-followup";
import {
  sendSeasonalPromoEmail,
  type SeasonalPromoEmailData,
} from "./email-templates/seasonal-promo";

describe("Email Templates", () => {
  describe("Abandoned Booking Email", () => {
    const baseData: AbandonedBookingEmailData = {
      customerEmail: "test@example.com",
      customerName: "John Doe",
      resumeToken: "abc123",
      isFirstTimeBooker: true,
      language: "en",
    };

    it("returns false without RESEND_API_KEY (English)", async () => {
      const result = await sendAbandonedBookingEmail(baseData);
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });

    it("returns false without RESEND_API_KEY (Hebrew)", async () => {
      const result = await sendAbandonedBookingEmail({
        ...baseData,
        language: "he",
      });
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });

    it("accepts data with isFirstTimeBooker=false", async () => {
      const result = await sendAbandonedBookingEmail({
        ...baseData,
        isFirstTimeBooker: false,
      });
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });
  });

  describe("Pre-Trip Info Email", () => {
    const baseData: PreTripInfoEmailData = {
      customerEmail: "test@example.com",
      customerName: "Jane Doe",
      tourName: "Doi Inthanon Day Trip",
      tripDate: new Date("2026-04-15").toISOString(),
      meetingPoint: "Hotel Lobby, Chiang Mai",
      meetingPointMapUrl: "https://maps.google.com/?q=18.7883,98.9853",
      pickupTime: "08:00 AM",
      includesKosherMeals: true,
      emergencyPhone: "+66 81 640 1397",
      language: "en",
    };

    it("returns false without RESEND_API_KEY (English)", async () => {
      const result = await sendPreTripInfoEmail(baseData);
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });

    it("returns false without RESEND_API_KEY (Hebrew)", async () => {
      const result = await sendPreTripInfoEmail({
        ...baseData,
        language: "he",
      });
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });

    it("accepts data with optional weather forecast", async () => {
      const result = await sendPreTripInfoEmail({
        ...baseData,
        weatherForecast: "Sunny, 28-32C, light breeze",
      });
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });

    it("accepts data without kosher meals", async () => {
      const result = await sendPreTripInfoEmail({
        ...baseData,
        includesKosherMeals: false,
      });
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });
  });

  describe("Post-Trip Followup Email", () => {
    const baseData: PostTripFollowupEmailData = {
      customerEmail: "test@example.com",
      customerName: "David Cohen",
      tourName: "Mae Kampong Village Tour",
      referralCode: "REF-DAVID-15",
      language: "en",
    };

    it("returns false without RESEND_API_KEY (English)", async () => {
      const result = await sendPostTripFollowupEmail(baseData);
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });

    it("returns false without RESEND_API_KEY (Hebrew)", async () => {
      const result = await sendPostTripFollowupEmail({
        ...baseData,
        language: "he",
      });
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });
  });

  describe("Seasonal Promo Email", () => {
    const baseData: SeasonalPromoEmailData = {
      recipientEmail: "test@example.com",
      recipientName: "Sarah",
      seasonName: "Cool Season 2026",
      seasonNameHe: "עונת הקור 2026",
      discountCode: "COOL20",
      discountPercent: 20,
      validUntil: new Date("2026-03-31").toISOString(),
      tourHighlights: [
        {
          name: "Doi Inthanon Summit",
          nameHe: "פסגת דוי אינתנון",
          description: "Thailand's highest peak with stunning views.",
          descriptionHe: "הפסגה הגבוהה בתאילנד עם נופים מרהיבים.",
          slug: "doi-inthanon-roof-of-thailand",
        },
      ],
      language: "en",
    };

    it("returns false without RESEND_API_KEY (English)", async () => {
      const result = await sendSeasonalPromoEmail(baseData);
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });

    it("returns false without RESEND_API_KEY (Hebrew)", async () => {
      const result = await sendSeasonalPromoEmail({
        ...baseData,
        language: "he",
      });
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });

    it("accepts data with blog highlights and new tours", async () => {
      const result = await sendSeasonalPromoEmail({
        ...baseData,
        newTourAnnouncements: [
          {
            name: "Night Safari Adventure",
            description: "Explore the jungle under the stars.",
            slug: "night-safari",
          },
        ],
        blogHighlights: [
          {
            title: "Best Time to Visit Chiang Mai",
            excerpt: "A guide to the seasons of Northern Thailand.",
            slug: "best-time-chiang-mai",
          },
        ],
      });
      if (!process.env.RESEND_API_KEY) {
        expect(result).toBe(false);
      } else {
        expect(typeof result).toBe("boolean");
      }
    });
  });

  describe("EMAIL_SENDERS constant", () => {
    it("exports correct sender addresses", async () => {
      const { EMAIL_SENDERS } = await import("@shared/const");
      expect(EMAIL_SENDERS.bookings).toBe("bookings@wiro4x4indochina.com");
      expect(EMAIL_SENDERS.updates).toBe("updates@wiro4x4indochina.com");
      expect(EMAIL_SENDERS.support).toBe("support@wiro4x4indochina.com");
    });
  });
});
