import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, itWithDb } from "./test-helpers";

describe("financial.create", () => {
  itWithDb("creates a revenue record", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financial.create({
      bookingId: 1,
      type: "revenue",
      category: "tour_payment",
      amount: 15000,
      currency: "THB",
      description: "Full payment for waterfall tour",
      paymentMethod: "bank_transfer",
    });

    expect(result).toEqual({ success: true });
  });

  itWithDb("creates a cost record", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financial.create({
      bookingId: 1,
      type: "cost",
      category: "fuel",
      amount: 2000,
      description: "Fuel for 4x4 vehicles",
    });

    expect(result).toEqual({ success: true });
  });

  itWithDb("creates a refund record", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financial.create({
      bookingId: 1,
      type: "refund",
      category: "cancellation",
      amount: 5000,
      description: "Partial refund for cancelled tour",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("financial.stats", () => {
  it("returns financial statistics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.financial.stats();

    expect(stats).toBeDefined();
    expect(typeof stats.totalRevenue).toBe("number");
    expect(typeof stats.totalCosts).toBe("number");
    expect(typeof stats.totalRefunds).toBe("number");
    expect(typeof stats.netProfit).toBe("number");
  });
});
