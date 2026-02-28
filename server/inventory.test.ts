import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, itWithDb } from "./test-helpers";

describe("inventory.create", () => {
  itWithDb("creates a vehicle inventory item", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.inventory.create({
      name: "Toyota Hilux 4x4 #1",
      category: "vehicle",
      description: "Main tour vehicle",
      purchaseCost: 850000,
      usefulLifeMonths: 60,
      condition: "good",
      quantity: 1,
      location: "Chiang Mai garage",
    });
    expect(result.success).toBe(true);
  });
});

describe("inventory.summary", () => {
  it("returns inventory summary by category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.inventory.summary();
    expect(Array.isArray(result)).toBe(true);
  });
});
