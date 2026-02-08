import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, createPublicContext, itWithDb } from "./test-helpers";

describe("agent.create", () => {
  itWithDb("creates an agent with valid data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agent.create({
      name: "Sarah Cohen",
      email: "sarah@wiro4x4.com",
      phone: "+66812345678",
      specialties: "Mountain tours, Cultural journeys",
      languages: "Hebrew, English, Thai",
      status: "active",
    });

    expect(result).toEqual({ success: true, message: "Agent created successfully" });
  });

  it("rejects agent creation without authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.agent.create({
        name: "Unauthorized Agent",
        email: "unauth@example.com",
        phone: "+66800000000",
      }),
    ).rejects.toThrow();
  });
});

describe("agent.list", () => {
  it("returns a list of agents", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agent.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("agent.update", () => {
  itWithDb("updates an agent's status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const agents = await caller.agent.list();
    if (agents.length > 0) {
      const result = await caller.agent.update({
        id: agents[0].id,
        data: { status: "on_leave" },
      });
      expect(result).toEqual({ success: true });
    }
  });
});

describe("agent.delete", () => {
  itWithDb("deletes an agent", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.agent.create({
      name: "To Delete",
      email: "delete@wiro4x4.com",
      phone: "+66899999999",
    });

    const agents = await caller.agent.list();
    const toDelete = agents.find((a) => a.email === "delete@wiro4x4.com");
    if (toDelete) {
      const result = await caller.agent.delete({ id: toDelete.id });
      expect(result).toEqual({ success: true });
    }
  });
});
