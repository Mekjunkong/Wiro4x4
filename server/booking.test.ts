import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, createPublicContext, itWithDb } from "./test-helpers";

describe("booking.create", () => {
  itWithDb("creates a booking with valid data", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const bookingData = {
      contactName: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "+1234567890",
      arrivalDate: "2026-03-01",
      departureDate: "2026-03-05",
      numberOfAdults: 2,
      numberOfChildren: 1,
      includesHotels: true,
      includesGuide: true,
      includesTrip: true,
      includesFood: true,
      needsShabbatHotel: false,
      pickupPoint: "airport",
      dropoffPoint: "hotel",
      destinations: "Chiang Mai, Pai",
      specialRequests: "Vegetarian kosher meals",
    };

    const result = await caller.booking.create(bookingData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.message).toBe("Booking created successfully");
  }, 10000); // Increase timeout to 10s for email operations

  itWithDb("creates a booking with minimal required data", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const bookingData = {
      contactName: "Jane Smith",
      contactEmail: "jane@example.com",
      contactPhone: "+9876543210",
      arrivalDate: "2026-04-01",
      departureDate: "2026-04-03",
      numberOfAdults: 1,
      pickupPoint: "airport",
      dropoffPoint: "airport",
    };

    const result = await caller.booking.create(bookingData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.message).toBe("Booking created successfully");
  });
});

describe("booking.list", () => {
  it("returns a list of bookings", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.booking.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
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

describe("lead.list", () => {
  it("returns a list of leads", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("financial.listAll", () => {
  it("returns a list of financial records", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financial.listAll();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
