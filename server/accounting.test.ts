import { describe, it, expect } from "vitest";
import {
  calculateVat,
  calculateWht,
  calculateCit,
  getWhtRate,
  generateInvoiceNumber,
  formatThbAmount,
  getFilingDeadlines,
  calculateDepreciation,
} from "../shared/accounting";

describe("Accounting Module", () => {
  describe("calculateVat", () => {
    it("calculates 7% VAT on a sale", () => {
      expect(calculateVat(100000)).toEqual({
        baseAmount: 100000,
        vatAmount: 7000,
        totalWithVat: 107000,
      });
    });

    it("extracts VAT from a VAT-inclusive price", () => {
      expect(calculateVat(107000, { inclusive: true })).toEqual({
        baseAmount: 100000,
        vatAmount: 7000,
        totalWithVat: 107000,
      });
    });

    it("handles zero amount", () => {
      expect(calculateVat(0)).toEqual({
        baseAmount: 0,
        vatAmount: 0,
        totalWithVat: 0,
      });
    });
  });

  describe("calculateWht", () => {
    it("calculates 3% WHT for service fees", () => {
      expect(calculateWht(50000, "service")).toEqual({
        grossAmount: 50000,
        whtRate: 3,
        whtAmount: 1500,
        netPayment: 48500,
        form: "pnd53",
      });
    });

    it("calculates 5% WHT for rental", () => {
      expect(calculateWht(30000, "rental")).toEqual({
        grossAmount: 30000,
        whtRate: 5,
        whtAmount: 1500,
        netPayment: 28500,
        form: "pnd53",
      });
    });

    it("calculates 1% WHT for transportation", () => {
      expect(calculateWht(20000, "transportation")).toEqual({
        grossAmount: 20000,
        whtRate: 1,
        whtAmount: 200,
        netPayment: 19800,
        form: "pnd53",
      });
    });

    it("calculates 2% WHT for advertising", () => {
      expect(calculateWht(100000, "advertising")).toEqual({
        grossAmount: 100000,
        whtRate: 2,
        whtAmount: 2000,
        netPayment: 98000,
        form: "pnd53",
      });
    });

    it("uses pnd3 form for individuals", () => {
      const result = calculateWht(50000, "service", { isIndividual: true });
      expect(result.form).toBe("pnd3");
    });
  });

  describe("calculateCit", () => {
    it("applies SME rate: 0% on first 300K", () => {
      expect(calculateCit(200000, { isSme: true })).toEqual({
        taxableIncome: 200000,
        taxAmount: 0,
        effectiveRate: 0,
        brackets: [{ range: "0 - 300,000", rate: 0, tax: 0 }],
      });
    });

    it("applies SME rate: 15% on 300K-3M bracket", () => {
      const result = calculateCit(1000000, { isSme: true });
      expect(result.taxAmount).toBe(105000);
    });

    it("applies standard 20% for non-SME", () => {
      expect(calculateCit(1000000, { isSme: false }).taxAmount).toBe(200000);
    });
  });

  describe("getWhtRate", () => {
    it("returns correct rates for each payment type", () => {
      expect(getWhtRate("service")).toBe(3);
      expect(getWhtRate("rental")).toBe(5);
      expect(getWhtRate("transportation")).toBe(1);
      expect(getWhtRate("advertising")).toBe(2);
      expect(getWhtRate("professional")).toBe(3);
    });
  });

  describe("generateInvoiceNumber", () => {
    it("generates invoice number with prefix and date", () => {
      const num = generateInvoiceNumber("INV", new Date("2026-02-28"), 1);
      expect(num).toBe("INV-202602-0001");
    });

    it("pads sequence number to 4 digits", () => {
      const num = generateInvoiceNumber("RCP", new Date("2026-12-01"), 42);
      expect(num).toBe("RCP-202612-0042");
    });
  });

  describe("formatThbAmount", () => {
    it("formats with Baht symbol and commas", () => {
      expect(formatThbAmount(1500000)).toBe("฿1,500,000");
    });

    it("handles zero", () => {
      expect(formatThbAmount(0)).toBe("฿0");
    });
  });

  describe("getFilingDeadlines", () => {
    it("returns correct deadlines for a month", () => {
      const deadlines = getFilingDeadlines(2026, 2);
      expect(deadlines).toEqual([
        {
          type: "wht_pnd3",
          dueDate: "2026-03-07",
          label: "WHT PND.3 (ภ.ง.ด.3)",
        },
        {
          type: "wht_pnd53",
          dueDate: "2026-03-07",
          label: "WHT PND.53 (ภ.ง.ด.53)",
        },
        {
          type: "vat_pp30",
          dueDate: "2026-03-15",
          label: "VAT PP.30 (ภ.พ.30)",
        },
      ]);
    });
  });

  describe("calculateDepreciation", () => {
    it("calculates straight-line monthly depreciation", () => {
      const result = calculateDepreciation(120000, 60);
      expect(result.monthlyAmount).toBe(2000);
      expect(result.annualAmount).toBe(24000);
    });

    it("calculates current value after N months", () => {
      const result = calculateDepreciation(120000, 60, { monthsElapsed: 24 });
      expect(result.currentValue).toBe(72000);
    });

    it("floors current value at zero", () => {
      const result = calculateDepreciation(120000, 60, { monthsElapsed: 100 });
      expect(result.currentValue).toBe(0);
    });
  });
});
