import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, createPublicContext, itWithDb } from "./test-helpers";

describe("lead.create", () => {
  itWithDb("creates a lead from public form", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.create({
      name: "David Levi",
      email: "david@example.com",
      phone: "+972501234567",
      source: "website",
      interestedTours: "Waterfall Adventure, Mountain Explorer",
      message: "Interested in a 3-day tour for 4 people",
    });

    expect(result).toEqual({ success: true, message: "Lead captured successfully" });
  });

  itWithDb("creates a lead with minimal data", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.create({
      name: "Minimal Lead",
      email: "minimal@example.com",
    });

    expect(result).toEqual({ success: true, message: "Lead captured successfully" });
  });
});

describe("lead.list", () => {
  it("returns leads for authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects unauthenticated access", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.lead.list()).rejects.toThrow();
  });
});

describe("lead.update (status transitions)", () => {
  itWithDb("updates lead status to contacted", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leads = await caller.lead.list();
    if (leads.length > 0) {
      const result = await caller.lead.update({
        id: leads[0].id,
        data: { status: "contacted" },
      });
      expect(result).toEqual({ success: true });
    }
  });

  itWithDb("updates lead status to converted", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leads = await caller.lead.list();
    if (leads.length > 0) {
      const result = await caller.lead.update({
        id: leads[0].id,
        data: { status: "converted", convertedToBookingId: 1 },
      });
      expect(result).toEqual({ success: true });
    }
  });
});
