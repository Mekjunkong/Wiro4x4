import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createManagerContext,
  createAgentContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("CRM Router", () => {
  describe("crm.listCustomers", () => {
    it("returns paginated customer list for admin", async () => {
      const caller = appRouter.createCaller(createAuthContext().ctx);
      const result = await caller.crm.listCustomers({
        page: 1,
        pageSize: 20,
      });
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("totalPages");
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe("crm.addActivity", () => {
    itWithDb("creates an activity for a customer", async () => {
      const caller = appRouter.createCaller(createAuthContext().ctx);
      const result = await caller.crm.addActivity({
        customerId: 1,
        type: "note",
        content: "Test note for customer",
      });
      expect(result).toHaveProperty("success", true);
    });
  });

  describe("crm.getPipelineStats", () => {
    it("returns stage counts", async () => {
      const caller = appRouter.createCaller(createAuthContext().ctx);
      const result = await caller.crm.getPipelineStats();
      expect(result).toHaveProperty("prospect");
      expect(result).toHaveProperty("active");
      expect(result).toHaveProperty("completed");
      expect(result).toHaveProperty("vip");
      expect(result).toHaveProperty("inactive");
    });
  });

  describe("role-based access", () => {
    it("denies public access to crm.listCustomers", async () => {
      const caller = appRouter.createCaller(createPublicContext().ctx);
      await expect(
        caller.crm.listCustomers({ page: 1, pageSize: 20 })
      ).rejects.toThrow();
    });

    it("allows manager access to crm.listCustomers", async () => {
      const caller = appRouter.createCaller(createManagerContext().ctx);
      const result = await caller.crm.listCustomers({
        page: 1,
        pageSize: 20,
      });
      expect(result).toHaveProperty("items");
    });
  });
});
