import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext } from "./test-helpers";

describe("dashboard.stats", () => {
  it("returns stats with expected shape", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.stats();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("bookingsByDay");
    expect(result).toHaveProperty("revenueByDay");
    expect(result).toHaveProperty("leadConversion");
    expect(result).toHaveProperty("postTourReviews");
    expect(result).toHaveProperty("upcomingTours");
    expect(result).toHaveProperty("pendingBookings");
    expect(result).toHaveProperty("newLeads");

    expect(Array.isArray(result.bookingsByDay)).toBe(true);
    expect(Array.isArray(result.revenueByDay)).toBe(true);
    expect(Array.isArray(result.upcomingTours)).toBe(true);
    expect(typeof result.pendingBookings).toBe("number");
    expect(typeof result.newLeads).toBe("number");

    expect(result.leadConversion).toHaveProperty("total");
    expect(result.leadConversion).toHaveProperty("converted");
    expect(result.leadConversion).toHaveProperty("rate");
    expect(result.postTourReviews).toHaveProperty("volume");
    expect(result.postTourReviews).toHaveProperty("completionRate");
    expect(result.postTourReviews).toHaveProperty("lowRatingExceptions");
  });
});

describe("dashboard.badgeCounts", () => {
  it("returns badge counts for all tabs", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.badgeCounts();

    expect(result).toBeDefined();
    expect(typeof result.crm).toBe("number");
    expect(typeof result.bookings).toBe("number");
    expect(typeof result.calendar).toBe("number");
    expect(typeof result.leads).toBe("number");
    expect(typeof result.reviews).toBe("number");
    expect(typeof result.blog).toBe("number");
  });
});
