import { describe, it, expect } from "vitest";
import { estimateEmailInputSchema } from "../shared/schemas";

describe("Estimate Email Route", () => {
  describe("estimateEmailInputSchema validation", () => {
    it("accepts valid estimate data", () => {
      const validData = {
        email: "customer@example.com",
        selectedTours: [
          {
            slug: "doi-inthanon-roof-of-thailand",
            nameEn: "Doi Inthanon",
            nameHe: "דוי אינתנון",
            basePrice: 5000,
          },
        ],
        adults: 2,
        children: [8, 12],
        arrivalDate: "2026-04-01",
        departureDate: "2026-04-05",
        includesHotels: true,
        includesFood: true,
        includesAttractions: true,
        attractionCount: 3,
        needsShabbatHotel: true,
        total: 45000,
        language: "en" as const,
      };

      const result = estimateEmailInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const invalidData = {
        email: "not-an-email",
        selectedTours: [],
        adults: 1,
        children: [],
        arrivalDate: "2026-04-01",
        departureDate: "2026-04-05",
        includesHotels: false,
        includesFood: false,
        includesAttractions: false,
        attractionCount: 1,
        needsShabbatHotel: false,
        total: 1000,
        language: "en" as const,
      };

      const result = estimateEmailInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("email");
      }
    });

    it("validates Hebrew language option", () => {
      const hebrewData = {
        email: "customer@example.com",
        selectedTours: [
          {
            slug: "doi-suthep-pui-beyond-temple",
            nameEn: "Doi Suthep-Pui",
            nameHe: "דוי סות'פ",
            basePrice: 4500,
          },
        ],
        adults: 4,
        children: [],
        arrivalDate: "2026-05-10",
        departureDate: "2026-05-12",
        includesHotels: true,
        includesFood: true,
        includesAttractions: false,
        attractionCount: 1,
        needsShabbatHotel: false,
        total: 28000,
        language: "he" as const,
      };

      const result = estimateEmailInputSchema.safeParse(hebrewData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid language", () => {
      const invalidLang = {
        email: "customer@example.com",
        selectedTours: [],
        adults: 1,
        children: [],
        arrivalDate: "2026-04-01",
        departureDate: "2026-04-05",
        includesHotels: false,
        includesFood: false,
        includesAttractions: false,
        attractionCount: 1,
        needsShabbatHotel: false,
        total: 1000,
        language: "fr", // Invalid - only en/he allowed
      };

      const result = estimateEmailInputSchema.safeParse(invalidLang);
      expect(result.success).toBe(false);
    });

    it("validates children ages are 0-17", () => {
      const validChildren = {
        email: "customer@example.com",
        selectedTours: [],
        adults: 2,
        children: [0, 5, 17], // All valid ages
        arrivalDate: "2026-04-01",
        departureDate: "2026-04-05",
        includesHotels: false,
        includesFood: false,
        includesAttractions: false,
        attractionCount: 1,
        needsShabbatHotel: false,
        total: 1000,
        language: "en" as const,
      };

      const result = estimateEmailInputSchema.safeParse(validChildren);
      expect(result.success).toBe(true);
    });

    it("rejects children age > 17", () => {
      const invalidAge = {
        email: "customer@example.com",
        selectedTours: [],
        adults: 2,
        children: [5, 18], // 18 is invalid
        arrivalDate: "2026-04-01",
        departureDate: "2026-04-05",
        includesHotels: false,
        includesFood: false,
        includesAttractions: false,
        attractionCount: 1,
        needsShabbatHotel: false,
        total: 1000,
        language: "en" as const,
      };

      const result = estimateEmailInputSchema.safeParse(invalidAge);
      expect(result.success).toBe(false);
    });
  });
});
