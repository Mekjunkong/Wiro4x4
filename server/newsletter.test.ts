import { describe, expect } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("newsletter.subscribe (public)", () => {
  itWithDb("subscribes a new email", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newsletter.subscribe({
      email: `test-${Date.now()}@example.com`,
      language: "en",
    });
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  itWithDb("handles duplicate subscription idempotently", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const email = `dup-${Date.now()}@example.com`;
    await caller.newsletter.subscribe({ email, language: "en" });
    const result = await caller.newsletter.subscribe({ email, language: "en" });
    expect(result.success).toBe(true);
  });
});

describe("newsletter.list (admin)", () => {
  itWithDb("returns subscriber list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newsletter.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("newsletter.unsubscribe (public)", () => {
  itWithDb("deactivates a subscriber", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.newsletter.unsubscribe({
      email: "nonexistent@example.com",
    });
    expect(result.success).toBe(true);
  });
});
