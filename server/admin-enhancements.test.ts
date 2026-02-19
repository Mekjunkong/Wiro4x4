import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("booking.updateDate", () => {
  it("rejects unauthenticated requests", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.booking.updateDate({
        id: 1,
        arrivalDate: "2026-04-01",
        departureDate: "2026-04-05",
      })
    ).rejects.toThrow();
  });

  itWithDb(
    "reschedules a booking with valid dates",
    async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First create a booking to reschedule
      const publicCtx = createPublicContext();
      const publicCaller = appRouter.createCaller(publicCtx.ctx);
      const booking = await publicCaller.booking.create({
        contactName: "Reschedule Test",
        contactEmail: "reschedule@test.com",
        contactPhone: "+1234567890",
        arrivalDate: "2026-05-01",
        departureDate: "2026-05-05",
        numberOfAdults: 2,
        pickupPoint: "airport",
        dropoffPoint: "hotel",
      });

      const result = await caller.booking.updateDate({
        id: booking.bookingId,
        arrivalDate: "2026-06-01",
        departureDate: "2026-06-05",
      });

      expect(result).toEqual({ success: true });
    },
    10000
  );
});

describe("booking.bulkEmail", () => {
  it("rejects unauthenticated requests", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.booking.bulkEmail({
        bookingIds: [1],
        subject: "Test",
        message: "Hello",
      })
    ).rejects.toThrow();
  });

  itWithDb("sends bulk emails and returns sent/failed counts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Use non-existent booking IDs - should get 0 sent
    const result = await caller.booking.bulkEmail({
      bookingIds: [99999],
      subject: "Test Subject",
      message: "Test Message",
    });

    expect(result).toBeDefined();
    expect(typeof result.sent).toBe("number");
    expect(typeof result.failed).toBe("number");
  });
});

describe("agent.updateAvailability", () => {
  it("rejects unauthenticated requests", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.agent.updateAvailability({ id: 1, status: "on_leave" })
    ).rejects.toThrow();
  });

  itWithDb("updates agent availability status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an agent first
    await caller.agent.create({
      name: "Availability Test Agent",
      email: "avail@test.com",
      phone: "+1234567890",
      languages: "English",
    });

    const agents = await caller.agent.list();
    const testAgent = agents.find(a => a.email === "avail@test.com");

    if (testAgent) {
      const result = await caller.agent.updateAvailability({
        id: testAgent.id,
        status: "on_leave",
      });

      expect(result).toEqual({ success: true });
    }
  });
});

describe("financial.create (admin)", () => {
  itWithDb("creates a financial record", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financial.create({
      bookingId: 0,
      type: "revenue",
      category: "Test Revenue",
      amount: 5000,
      currency: "THB",
      description: "Test financial record",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated requests", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.create({
        bookingId: 0,
        type: "revenue",
        category: "Test",
        amount: 100,
      })
    ).rejects.toThrow();
  });
});
