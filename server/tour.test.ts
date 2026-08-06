import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createPublicContext } from "./test-helpers";

describe("tour.getBySlug (public)", () => {
  it("returns null for a missing tour so query clients receive valid data", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tour.getBySlug({
      slug: "non-existent-tour",
    });

    expect(result).toBeNull();
  });
});
