import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("settings.getAll", () => {
  it("returns settings as an object", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.getAll();

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
  });
});

describe("settings.get", () => {
  it("returns null for non-existent key", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.get({ key: "non_existent_key_xyz" });

    expect(result).toBeNull();
  });
});

describe("settings.update", () => {
  itWithDb("creates and retrieves a setting", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.settings.update({
      key: "test_key_vitest",
      value: { foo: "bar" },
    });

    const result = await caller.settings.get({ key: "test_key_vitest" });

    expect(result).toEqual({ foo: "bar" });
  });

  it("rejects unauthenticated requests", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.settings.update({ key: "test", value: "test" })
    ).rejects.toThrow();
  });
});
