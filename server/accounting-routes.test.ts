import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, itWithDb } from "./test-helpers";

describe("accounting.createInvoice", () => {
  itWithDb("creates a tax invoice with auto-generated number", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accounting.createInvoice({
      type: "tax_invoice",
      customerName: "David Cohen",
      subtotal: 45000,
      vatAmount: 3150,
      totalAmount: 48150,
      currency: "THB",
    });
    expect(result.success).toBe(true);
    expect(result.invoiceNumber).toMatch(/^INV-\d{6}-\d{4}$/);
  });
});

describe("accounting.recordEntry", () => {
  itWithDb("creates an accounting journal entry", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accounting.recordEntry({
      date: "2026-02-28",
      accountCode: "41000",
      description: "Tour package payment - Cohen family",
      debit: 0,
      credit: 45000,
      currency: "THB",
    });
    expect(result.success).toBe(true);
  });
});

describe("accounting.trialBalance", () => {
  it("returns trial balance (may be empty without DB)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accounting.trialBalance();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("accounting.upcomingDeadlines", () => {
  it("returns upcoming filing deadlines", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.accounting.upcomingDeadlines();
    expect(Array.isArray(result)).toBe(true);
  });
});
