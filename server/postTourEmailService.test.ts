import { describe, it, expect } from "vitest";
import { generatePostTourEmailHtml } from "./postTourEmailService";
import type { Booking } from "../drizzle/schema";

describe("postTourEmailService", () => {
  const mockBooking: Booking = {
    id: 42,
    contactName: "John Smith",
    contactEmail: "john@example.com",
    contactPhone: "+1234567890",
    contactWhatsApp: null,
    agentName: null,
    arrivalDate: new Date("2026-03-15"),
    departureDate: new Date("2026-03-17"),
    numberOfAdults: 2,
    hasChildren: 0,
    numberOfChildren: null,
    childrenAges: null,
    includesHotels: 0,
    hotelPreferences: null,
    includesGuide: 1,
    includesTrip: 1,
    includesAttractions: 0,
    selectedAttractions: null,
    includesFood: 1,
    foodPreferences: null,
    needsShabbatHotel: 0,
    shabbatHotel: null,
    selfDriving4x4: 0,
    pickupPoint: "Hotel Lobby",
    customPickupLocation: null,
    dropoffPoint: "Hotel Lobby",
    customDropoffLocation: null,
    suggestedDestinations: null,
    specialRequests: null,
    dietaryRestrictions: null,
    budget: null,
    status: "completed",
    totalPrice: 5000,
    depositPaid: 1500,
    balancePaid: 3500,
    assignedAgentId: null,
    reminderSentAt: null,
    feedbackSentAt: null,
    postTourEmailSentAt: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    source: "website",
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("generates HTML with customer name and review link", () => {
    const html = generatePostTourEmailHtml({
      booking: mockBooking,
      albumToken: null,
    });

    expect(html).toContain("John Smith");
    expect(html).toContain("/reviews");
    expect(html).toContain("How Was Your Adventure?");
    expect(html).toContain("Leave a Review");
    // Hebrew section
    expect(html).toContain("איך היה הטיול");
    expect(html).toContain("השאירו חוות דעת");
    // Google review link
    expect(html).toContain("Review on Google");
    // WhatsApp link
    expect(html).toContain("wa.me/");
    // Book next trip
    expect(html).toContain("/packages");
  });

  it("includes album section when albumToken is provided", () => {
    const html = generatePostTourEmailHtml({
      booking: mockBooking,
      albumToken: "abc123token",
    });

    expect(html).toContain("/album/abc123token");
    expect(html).toContain("Your Adventure Photos Are Ready!");
    expect(html).toContain("תמונות ההרפתקה שלכם מוכנות!");
    expect(html).toContain("View Your Photos");
  });

  it("excludes album section when no albumToken", () => {
    const html = generatePostTourEmailHtml({
      booking: mockBooking,
      albumToken: null,
    });

    expect(html).not.toContain("/album/");
    expect(html).not.toContain("Your Adventure Photos Are Ready!");
  });

  it("formats the departure date correctly", () => {
    const html = generatePostTourEmailHtml({
      booking: mockBooking,
      albumToken: null,
    });

    // Should contain a formatted date string for March 17, 2026
    expect(html).toContain("March");
    expect(html).toContain("2026");
  });

  it("includes unsubscribe note in footer", () => {
    const html = generatePostTourEmailHtml({
      booking: mockBooking,
      albumToken: null,
    });

    expect(html).toContain("automated email");
    expect(html).toContain("booked a tour with WIRO 4x4");
  });
});
