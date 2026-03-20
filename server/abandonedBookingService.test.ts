import { describe, it, expect, vi } from "vitest";

// Mock Resend before importing the service
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
    },
  })),
}));

describe("abandonedBookingService", () => {
  it("should export sendAbandonedBookingEmail function", async () => {
    const mod = await import("./abandonedBookingService");
    expect(typeof mod.sendAbandonedBookingEmail).toBe("function");
  });

  it("should return false when Resend API key is not configured", async () => {
    // Ensure no API key
    const originalKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    // Re-import to get fresh module state
    vi.resetModules();
    const { sendAbandonedBookingEmail } =
      await import("./abandonedBookingService");

    const result = await sendAbandonedBookingEmail({
      id: 1,
      name: "Test User",
      email: "test@example.com",
      phone: null,
      source: "website",
      interestedTours: null,
      message: "I want a tour",
      status: "new",
      convertedToBookingId: null,
      notes: null,
      score: 0,
      recoveryEmailSentAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result).toBe(false);

    // Restore
    if (originalKey) process.env.RESEND_API_KEY = originalKey;
  });

  it("should return false when lead has no email", async () => {
    vi.resetModules();
    const { sendAbandonedBookingEmail } =
      await import("./abandonedBookingService");

    const result = await sendAbandonedBookingEmail({
      id: 2,
      name: "No Email User",
      email: "",
      phone: null,
      source: "website",
      interestedTours: null,
      message: null,
      status: "new",
      convertedToBookingId: null,
      notes: null,
      score: 0,
      recoveryEmailSentAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result).toBe(false);
  });
});
