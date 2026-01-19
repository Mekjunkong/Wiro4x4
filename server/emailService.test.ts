import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { sendNewBookingNotification, sendBookingStatusNotification, sendDailySummaryNotification } from "./emailService";
import { notifyOwner } from "./_core/notification";

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendNewBookingNotification", () => {
    it("sends notification with correct booking details", async () => {
      const bookingData = {
        contactName: "John Doe",
        contactEmail: "john@example.com",
        contactPhone: "+1234567890",
        arrivalDate: new Date("2025-02-01"),
        departureDate: new Date("2025-02-05"),
        numberOfAdults: 2,
        numberOfChildren: 1,
        includesHotels: true,
        includesGuide: true,
        includesTrip: true,
        includesFood: true,
        needsShabbatHotel: false,
        pickupPoint: "Chiang Mai Airport",
        dropoffPoint: "Hotel",
        suggestedDestinations: "Pai, Doi Inthanon",
        specialRequests: "Vegetarian meals",
      };

      const result = await sendNewBookingNotification(bookingData);

      expect(result).toBe(true);
      expect(notifyOwner).toHaveBeenCalledTimes(1);
      
      const call = vi.mocked(notifyOwner).mock.calls[0][0];
      expect(call.title).toContain("New Booking");
      expect(call.title).toContain("John Doe");
      expect(call.content).toContain("John Doe");
      expect(call.content).toContain("john@example.com");
      expect(call.content).toContain("+1234567890");
      expect(call.content).toContain("Adults: 2");
      expect(call.content).toContain("Hotels");
      expect(call.content).toContain("Hebrew-speaking Guide");
      expect(call.content).toContain("Kosher Meals");
    });

    it("handles notification failure gracefully", async () => {
      vi.mocked(notifyOwner).mockResolvedValueOnce(false);

      const bookingData = {
        contactName: "Jane Doe",
        contactEmail: "jane@example.com",
        contactPhone: "+0987654321",
        arrivalDate: new Date("2025-03-01"),
        departureDate: new Date("2025-03-03"),
        numberOfAdults: 1,
        includesHotels: false,
        includesGuide: false,
        includesTrip: false,
        includesFood: false,
        needsShabbatHotel: false,
        pickupPoint: "Hotel",
        dropoffPoint: "Airport",
      };

      const result = await sendNewBookingNotification(bookingData);

      expect(result).toBe(false);
    });
  });

  describe("sendBookingStatusNotification", () => {
    it("sends status change notification", async () => {
      const result = await sendBookingStatusNotification(
        123,
        "John Doe",
        "pending",
        "confirmed"
      );

      expect(result).toBe(true);
      expect(notifyOwner).toHaveBeenCalledTimes(1);
      
      const call = vi.mocked(notifyOwner).mock.calls[0][0];
      expect(call.title).toContain("#123");
      expect(call.title).toContain("Status Updated");
      expect(call.content).toContain("John Doe");
      expect(call.content).toContain("pending");
      expect(call.content).toContain("confirmed");
    });

    it("includes confirmation message for confirmed status", async () => {
      await sendBookingStatusNotification(1, "Test", "pending", "confirmed");
      
      const call = vi.mocked(notifyOwner).mock.calls[0][0];
      expect(call.content).toContain("confirmed");
    });
  });

  describe("sendDailySummaryNotification", () => {
    it("sends daily summary with correct stats", async () => {
      const upcomingArrivals = [
        { name: "John Doe", date: new Date("2025-02-01") },
        { name: "Jane Smith", date: new Date("2025-02-03") },
      ];

      const result = await sendDailySummaryNotification(
        10,
        3,
        5,
        upcomingArrivals
      );

      expect(result).toBe(true);
      expect(notifyOwner).toHaveBeenCalledTimes(1);
      
      const call = vi.mocked(notifyOwner).mock.calls[0][0];
      expect(call.title).toContain("Daily Booking Summary");
      expect(call.content).toContain("Total Bookings: 10");
      expect(call.content).toContain("Pending: 3");
      expect(call.content).toContain("Confirmed: 5");
      expect(call.content).toContain("John Doe");
      expect(call.content).toContain("Jane Smith");
    });

    it("handles empty upcoming arrivals", async () => {
      const result = await sendDailySummaryNotification(5, 2, 3, []);

      expect(result).toBe(true);
      
      const call = vi.mocked(notifyOwner).mock.calls[0][0];
      expect(call.content).toContain("No arrivals in the next 7 days");
    });
  });
});
