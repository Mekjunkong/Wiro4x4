import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, createPublicContext } from "./test-helpers";

describe("auth.me", () => {
  it("returns only safe session fields for authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toEqual({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "admin",
    });
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("updatedAt");
    expect(result).not.toHaveProperty("lastSignedIn");
  });

  it("returns null when no session exists", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeNull();
  });
});
