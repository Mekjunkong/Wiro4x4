import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createPublicContext } from "./test-helpers";

describe("stats router", () => {
  it("stats.public returns numeric counts", async () => {
    const caller = appRouter.createCaller(createPublicContext().ctx);
    const result = await caller.stats.public();
    expect(result).toHaveProperty("totalBookings");
    expect(result).toHaveProperty("totalReviews");
    expect(result).toHaveProperty("totalTours");
    expect(typeof result.totalBookings).toBe("number");
    expect(typeof result.totalReviews).toBe("number");
    expect(typeof result.totalTours).toBe("number");
  });

  it("stats.recentBookings returns array with correct shape", async () => {
    const caller = appRouter.createCaller(createPublicContext().ctx);
    const result = await caller.stats.recentBookings();
    expect(Array.isArray(result)).toBe(true);
    // When DB is unavailable, returns empty array
    for (const item of result) {
      expect(item).toHaveProperty("firstName");
      expect(item).toHaveProperty("tourName");
      expect(item).toHaveProperty("timeAgo");
    }
  });
});
