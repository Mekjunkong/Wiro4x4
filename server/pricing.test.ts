import { describe, it, expect } from "vitest";
import {
  getGroupMultiplier,
  isCustomQuoteRequired,
  getEffectiveGroupSize,
  calculateChildrenSurcharge,
  detectShabbatNights,
  getTripDuration,
  findPackageOption,
  roundToNearest100,
  calculateTripTotal,
  formatUSD,
  calculatePackageDiscount,
  getSeasonForDate,
  getHolidayPeakWindows,
  getSeasonPricingRows,
} from "../shared/pricing";

describe("Pricing Module", () => {
  describe("holiday peak pricing", () => {
    it("uses the inclusive 2026 Passover peak window", () => {
      expect(getSeasonForDate(new Date(2026, 3, 1)).type).toBe("passover");
      expect(getSeasonForDate(new Date(2026, 3, 9)).type).toBe("passover");
      expect(getSeasonForDate(new Date(2026, 3, 10)).type).toBe("low");
    });

    it("uses the inclusive 2026 Sukkot peak window", () => {
      expect(getSeasonForDate(new Date(2026, 8, 25)).type).toBe("sukkot");
      expect(getSeasonForDate(new Date(2026, 9, 2)).type).toBe("sukkot");
      expect(getSeasonForDate(new Date(2026, 9, 3)).type).toBe("low");
    });

    it("does not invent holiday surcharges for unsupported years", () => {
      const season = getSeasonForDate(new Date(2027, 3, 15));

      expect(season.multiplier).toBe(1);
      expect(season.note).toMatch(/WhatsApp/i);
      expect(season.noteHe).toBeTruthy();
      expect(getHolidayPeakWindows(2027)).toEqual([]);
    });

    it("builds the 2026 public table from the calculator source", () => {
      expect(getSeasonPricingRows(2026).map(row => row.type)).toEqual([
        "high",
        "passover",
        "sukkot",
        "low",
      ]);
    });
  });

  describe("getGroupMultiplier", () => {
    it("returns 1.0 for groups of 1-4", () => {
      expect(getGroupMultiplier(1)).toBe(1.0);
      expect(getGroupMultiplier(4)).toBe(1.0);
    });

    it("returns 1.2 for groups of 5-6", () => {
      expect(getGroupMultiplier(5)).toBe(1.2);
      expect(getGroupMultiplier(6)).toBe(1.2);
    });

    it("returns 1.2 as estimate for groups of 7+", () => {
      expect(getGroupMultiplier(7)).toBe(1.2);
      expect(getGroupMultiplier(10)).toBe(1.2);
    });
  });

  describe("isCustomQuoteRequired", () => {
    it("returns false for groups under 7", () => {
      expect(isCustomQuoteRequired(6)).toBe(false);
    });

    it("returns true for groups of 7+", () => {
      expect(isCustomQuoteRequired(7)).toBe(true);
      expect(isCustomQuoteRequired(10)).toBe(true);
    });
  });

  describe("getEffectiveGroupSize", () => {
    it("counts adults only when no children", () => {
      expect(getEffectiveGroupSize({ adults: 3, children: [] })).toBe(3);
    });

    it("counts children 11+ as adults", () => {
      expect(
        getEffectiveGroupSize({
          adults: 3,
          children: [{ age: 12 }, { age: 15 }],
        })
      ).toBe(5);
    });

    it("does not count children under 11", () => {
      expect(
        getEffectiveGroupSize({
          adults: 3,
          children: [{ age: 5 }, { age: 10 }],
        })
      ).toBe(3);
    });

    it("handles mixed children ages", () => {
      expect(
        getEffectiveGroupSize({
          adults: 2,
          children: [{ age: 5 }, { age: 11 }, { age: 14 }],
        })
      ).toBe(4); // 2 adults + 2 children aged 11+
    });
  });

  describe("calculateChildrenSurcharge", () => {
    it("returns 0 when no surcharge (group <= 4)", () => {
      const group = { adults: 2, children: [{ age: 7 }] };
      // multiplier = 1.0, so surcharge base = 0
      expect(calculateChildrenSurcharge(group, 7000, 1.0)).toBe(0);
    });

    it("charges 50% of surcharge for children aged 3-10", () => {
      const group = { adults: 5, children: [{ age: 7 }] };
      // tourSubtotal = 7000, multiplier = 1.2, surcharge = 1400
      // child surcharge = 1400 * 0.5 * 1 = 700, rounded to 700
      expect(calculateChildrenSurcharge(group, 7000, 1.2)).toBe(700);
    });

    it("returns 0 for children under 3", () => {
      const group = { adults: 5, children: [{ age: 2 }] };
      expect(calculateChildrenSurcharge(group, 7000, 1.2)).toBe(0);
    });
  });

  describe("detectShabbatNights", () => {
    it("detects Friday nights", () => {
      // 2026-02-13 is a Friday
      const arrival = new Date("2026-02-13");
      const departure = new Date("2026-02-15");
      expect(detectShabbatNights(arrival, departure)).toBe(1);
    });

    it("returns 0 when no Friday in range", () => {
      // 2026-02-09 is Monday, 2026-02-11 is Wednesday
      const arrival = new Date("2026-02-09");
      const departure = new Date("2026-02-11");
      expect(detectShabbatNights(arrival, departure)).toBe(0);
    });

    it("detects multiple Fridays", () => {
      // A 2-week span
      const arrival = new Date("2026-02-09");
      const departure = new Date("2026-02-23");
      expect(detectShabbatNights(arrival, departure)).toBe(2);
    });
  });

  describe("getTripDuration", () => {
    it("calculates days and nights", () => {
      const arrival = new Date("2026-03-01");
      const departure = new Date("2026-03-04");
      const { days, nights } = getTripDuration(arrival, departure);
      expect(days).toBe(3);
      expect(nights).toBe(2);
    });

    it("returns at least 1 day", () => {
      const arrival = new Date("2026-03-01");
      const departure = new Date("2026-03-01");
      const { days, nights } = getTripDuration(arrival, departure);
      expect(days).toBe(1);
      expect(nights).toBe(0);
    });
  });

  describe("findPackageOption", () => {
    it("finds a 2-day package", () => {
      const result = findPackageOption(2, 8000);
      expect(result).not.toBeNull();
      expect(result!.packagePrice).toBe(7200);
      expect(result!.savings).toBe(800);
    });

    it("finds a 3-day package", () => {
      const result = findPackageOption(3, 12500);
      expect(result).not.toBeNull();
      expect(result!.packagePrice).toBe(11500);
      expect(result!.savings).toBe(1000);
    });

    it("returns null when no package matches", () => {
      expect(findPackageOption(4, 15000)).toBeNull();
    });

    it("returns null when package is more expensive", () => {
      expect(findPackageOption(2, 6000)).toBeNull();
    });
  });

  describe("roundToNearest100", () => {
    it("rounds up from 50", () => {
      expect(roundToNearest100(3550)).toBe(3600);
    });

    it("rounds down below 50", () => {
      expect(roundToNearest100(3549)).toBe(3500);
    });

    it("keeps exact multiples of 100", () => {
      expect(roundToNearest100(3500)).toBe(3500);
    });
  });

  describe("formatUSD", () => {
    it("converts THB to USD and formats with dollar symbol", () => {
      expect(formatUSD(3500)).toBe("$98"); // 3500 * 0.028 = 98
      expect(formatUSD(17800)).toBe("$498"); // 17800 * 0.028 = 498.4 → 498
    });
  });

  describe("calculateTripTotal", () => {
    const baseTour = {
      name: "Waterfall Adventure",
      nameHe: "הרפתקת מפלים",
      basePrice: 3500,
    };

    it("calculates a simple 1-tour trip", () => {
      const result = calculateTripTotal({
        tours: [baseTour],
        group: { adults: 2, children: [] },
        arrivalDate: new Date("2026-03-01"),
        departureDate: new Date("2026-03-02"),
        services: {
          includesHotels: false,
          includesFood: false,
          includesAttractions: false,
          attractionCount: 0,
        },
        needsShabbatHotel: false,
      });

      expect(result.tourSubtotal).toBe(3500);
      expect(result.groupMultiplier).toBe(1.0);
      expect(result.total).toBe(3500);
      expect(result.depositAmount).toBe(1100); // 30% of 3500 rounded
      expect(result.isCustomQuote).toBe(false);
    });

    it("applies group multiplier for 5+ people", () => {
      const result = calculateTripTotal({
        tours: [baseTour],
        group: { adults: 5, children: [] },
        arrivalDate: new Date("2026-03-01"),
        departureDate: new Date("2026-03-02"),
        services: {
          includesHotels: false,
          includesFood: false,
          includesAttractions: false,
          attractionCount: 0,
        },
        needsShabbatHotel: false,
      });

      expect(result.groupMultiplier).toBe(1.2);
      expect(result.groupAdjustedTotal).toBe(4200); // 3500 * 1.2 = 4200
    });

    it("adds service costs", () => {
      const result = calculateTripTotal({
        tours: [baseTour],
        group: { adults: 2, children: [] },
        arrivalDate: new Date("2026-03-01"),
        departureDate: new Date("2026-03-03"), // 2 days, 1 night
        services: {
          includesHotels: true,
          includesFood: true,
          includesAttractions: false,
          attractionCount: 0,
        },
        needsShabbatHotel: false,
      });

      // Hotels: 1 night * 1800 = 1800
      // Food: 2 days * 1200 = 2400
      expect(result.servicesSubtotal).toBe(4200);
      expect(result.total).toBe(7700); // 3500 + 4200 = 7700
    });

    it("applies package discount when available", () => {
      const tour2 = { name: "Mountain", nameHe: "הרים", basePrice: 4200 };
      const result = calculateTripTotal({
        tours: [baseTour, tour2],
        group: { adults: 2, children: [] },
        arrivalDate: new Date("2026-03-01"),
        departureDate: new Date("2026-03-03"),
        services: {
          includesHotels: false,
          includesFood: false,
          includesAttractions: false,
          attractionCount: 0,
        },
        needsShabbatHotel: false,
      });

      // Individual: 3500 + 4200 = 7700
      // 2-day package: 7200 (saves 500)
      expect(result.packageOption).not.toBeNull();
      expect(result.packageOption!.savings).toBe(500);
      expect(result.total).toBe(7200);
    });

    it("flags 7+ group as custom quote", () => {
      const result = calculateTripTotal({
        tours: [baseTour],
        group: { adults: 7, children: [] },
        arrivalDate: new Date("2026-03-01"),
        departureDate: new Date("2026-03-02"),
        services: {
          includesHotels: false,
          includesFood: false,
          includesAttractions: false,
          attractionCount: 0,
        },
        needsShabbatHotel: false,
      });

      expect(result.isCustomQuote).toBe(true);
    });

    it("adds shabbat hotel cost when needed", () => {
      // 2026-02-13 is Friday
      const result = calculateTripTotal({
        tours: [baseTour],
        group: { adults: 2, children: [] },
        arrivalDate: new Date("2026-02-13"),
        departureDate: new Date("2026-02-15"),
        services: {
          includesHotels: false,
          includesFood: false,
          includesAttractions: false,
          attractionCount: 0,
        },
        needsShabbatHotel: true,
      });

      expect(result.shabbatNights).toBe(1);
      expect(result.shabbatCost).toBe(2000);
      // Feb 13-15 is High Season (+20%), so tour = 3500*1.2 = 4200, + shabbat 2000 = 6200
      expect(result.total).toBe(6200); // 4200 (high season) + 2000 shabbat
    });
  });

  describe("calculatePackageDiscount", () => {
    it("returns 10% discount for 2 tours", () => {
      const result = calculatePackageDiscount(2, 8000);
      expect(result.discountPercent).toBe(10);
      expect(result.discountedPrice).toBe(7200);
      expect(result.savings).toBe(800);
    });

    it("returns 15% discount for 3 tours", () => {
      const result = calculatePackageDiscount(3, 12000);
      expect(result.discountPercent).toBe(15);
      expect(result.discountedPrice).toBe(10200);
      expect(result.savings).toBe(1800);
    });

    it("returns 25% discount for 5 tours", () => {
      const result = calculatePackageDiscount(5, 20000);
      expect(result.discountPercent).toBe(25);
      expect(result.discountedPrice).toBe(15000);
      expect(result.savings).toBe(5000);
    });

    it("uses override percent when provided", () => {
      const result = calculatePackageDiscount(2, 8000, 30);
      expect(result.discountPercent).toBe(30);
      expect(result.discountedPrice).toBe(5600);
      expect(result.savings).toBe(2400);
    });

    it("returns no discount for 1 tour", () => {
      const result = calculatePackageDiscount(1, 4000);
      expect(result.discountPercent).toBe(0);
      expect(result.discountedPrice).toBe(4000);
      expect(result.savings).toBe(0);
    });
  });
});
