import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createManagerContext,
  createAgentContext,
  createPublicContext,
} from "./test-helpers";

describe("Admin Roles", () => {
  describe("admin.listUsers", () => {
    it("returns user list for owner/admin", async () => {
      const caller = appRouter.createCaller(createAuthContext().ctx);
      const result = await caller.admin.listUsers();
      expect(Array.isArray(result)).toBe(true);
    });

    it("denies manager access to admin.listUsers", async () => {
      const caller = appRouter.createCaller(createManagerContext().ctx);
      await expect(caller.admin.listUsers()).rejects.toThrow(
        "Owner access required"
      );
    });

    it("denies agent access to admin.listUsers", async () => {
      const caller = appRouter.createCaller(createAgentContext().ctx);
      await expect(caller.admin.listUsers()).rejects.toThrow(
        "Owner access required"
      );
    });

    it("denies public access to admin.listUsers", async () => {
      const caller = appRouter.createCaller(createPublicContext().ctx);
      await expect(caller.admin.listUsers()).rejects.toThrow();
    });
  });
});
