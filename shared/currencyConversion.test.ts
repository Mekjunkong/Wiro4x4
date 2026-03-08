import { describe, it, expect } from "vitest";
import {
  EXCHANGE_RATES,
  formatCurrency,
  formatMultiCurrency,
} from "./currencyConversion";

describe("currencyConversion", () => {
  describe("EXCHANGE_RATES", () => {
    it("should have exchange rates for USD, EUR, and ILS", () => {
      expect(EXCHANGE_RATES).toHaveProperty("USD");
      expect(EXCHANGE_RATES).toHaveProperty("EUR");
      expect(EXCHANGE_RATES).toHaveProperty("ILS");
      expect(typeof EXCHANGE_RATES.USD).toBe("number");
      expect(typeof EXCHANGE_RATES.EUR).toBe("number");
      expect(typeof EXCHANGE_RATES.ILS).toBe("number");
    });
  });

  describe("formatCurrency", () => {
    it("should format THB to USD correctly", () => {
      const result = formatCurrency(1000, "USD");
      expect(result).toBe("$28");
    });

    it("should format THB to EUR correctly", () => {
      const result = formatCurrency(1000, "EUR");
      expect(result).toBe("€26");
    });

    it("should format THB to ILS correctly", () => {
      const result = formatCurrency(1000, "ILS");
      expect(result).toBe("₪100");
    });
  });

  describe("formatMultiCurrency", () => {
    it("should return formatted string with all three currencies", () => {
      const result = formatMultiCurrency(1000);
      expect(result).toContain("USD");
      expect(result).toContain("EUR");
      expect(result).toContain("ILS");
      expect(result).toContain("$");
      expect(result).toContain("€");
      expect(result).toContain("₪");
      expect(result).toContain("|");
    });
  });
});
