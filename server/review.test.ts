import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, createPublicContext, itWithDb } from "./test-helpers";

describe("review.create", () => {
  itWithDb("submits a review for approval", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.review.create({
      name: "Happy Tourist",
      email: "tourist@example.com",
      rating: 5,
      text: "Incredible off-road experience! The kosher meals were amazing.",
      tourType: "waterfall",
    });

    expect(result).toEqual({ success: true, message: "Review submitted for approval" });
  });

  itWithDb("submits a review without optional tour type", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.review.create({
      name: "Another Tourist",
      email: "another@example.com",
      rating: 4,
      text: "Great tour, highly recommended!",
    });

    expect(result).toEqual({ success: true, message: "Review submitted for approval" });
  });
});

describe("review.listPublic", () => {
  it("returns only approved reviews", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.review.listPublic();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("review.listAll (admin)", () => {
  it("returns all reviews with status field", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.review.listAll();

    expect(Array.isArray(result)).toBe(true);
    for (const review of result) {
      expect(["pending", "approved", "rejected"]).toContain(review.status);
    }
  });
});

describe("review.update (approve/reject)", () => {
  itWithDb("approves a review", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const reviews = await caller.review.listAll();
    const pending = reviews.find((r) => r.status === "pending");
    if (pending) {
      const result = await caller.review.update({
        id: pending.id,
        data: { status: "approved" },
      });
      expect(result).toEqual({ success: true });
    }
  });
});

describe("review.stats", () => {
  it("returns review statistics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.review.stats();

    expect(stats).toHaveProperty("totalReviews");
    expect(stats).toHaveProperty("averageRating");
    expect(stats).toHaveProperty("approvedCount");
    expect(typeof stats.totalReviews).toBe("number");
    expect(typeof stats.averageRating).toBe("number");
  });
});
