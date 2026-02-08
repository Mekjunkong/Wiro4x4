import { describe, expect, it } from "vitest";
import {
  bookingInputSchema,
  agentInputSchema,
  leadInputSchema,
  financialRecordInputSchema,
  tourInputSchema,
  reviewInputSchema,
} from "../shared/schemas";

describe("bookingInputSchema", () => {
  it("validates a complete booking", () => {
    const result = bookingInputSchema.safeParse({
      contactName: "John Doe",
      contactEmail: "john@example.com",
      contactPhone: "+66812345678",
      arrivalDate: "2026-03-01",
      departureDate: "2026-03-05",
      numberOfAdults: 2,
      pickupPoint: "airport",
      dropoffPoint: "hotel",
    });
    expect(result.success).toBe(true);
  });

  it("rejects booking with missing required fields", () => {
    const result = bookingInputSchema.safeParse({
      contactName: "",
      contactEmail: "invalid",
      contactPhone: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = bookingInputSchema.safeParse({
      contactName: "John",
      contactEmail: "not-an-email",
      contactPhone: "+66812345678",
      arrivalDate: "2026-03-01",
      departureDate: "2026-03-05",
      pickupPoint: "airport",
      dropoffPoint: "hotel",
    });
    expect(result.success).toBe(false);
  });
});

describe("agentInputSchema", () => {
  it("validates a complete agent", () => {
    const result = agentInputSchema.safeParse({
      name: "Sarah Cohen",
      email: "sarah@wiro4x4.com",
      phone: "+66812345678",
      status: "active",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid agent status", () => {
    const result = agentInputSchema.safeParse({
      name: "Sarah",
      email: "sarah@wiro4x4.com",
      phone: "+66812345678",
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });
});

describe("leadInputSchema", () => {
  it("validates a lead with minimal data", () => {
    const result = leadInputSchema.safeParse({
      name: "Lead User",
      email: "lead@example.com",
    });
    expect(result.success).toBe(true);
  });
});

describe("financialRecordInputSchema", () => {
  it("validates financial record types", () => {
    for (const type of ["revenue", "cost", "refund"] as const) {
      const result = financialRecordInputSchema.safeParse({
        bookingId: 1,
        type,
        category: "test",
        amount: 1000,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid financial type", () => {
    const result = financialRecordInputSchema.safeParse({
      bookingId: 1,
      type: "donation",
      category: "test",
      amount: 1000,
    });
    expect(result.success).toBe(false);
  });
});

describe("tourInputSchema", () => {
  it("validates a complete tour", () => {
    const result = tourInputSchema.safeParse({
      name: "Waterfall Adventure",
      nameHe: "הרפתקאות מפלים",
      description: "Explore hidden waterfalls",
      descriptionHe: "חקרו מפלים נסתרים",
      duration: "Full Day (8 hours)",
      difficulty: "moderate",
      price: 3500,
      imageUrl: "/images/waterfall.webp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = tourInputSchema.safeParse({
      name: "Tour",
      nameHe: "סיור",
      description: "Desc",
      descriptionHe: "תיאור",
      duration: "1 day",
      price: -100,
      imageUrl: "/img.jpg",
    });
    expect(result.success).toBe(false);
  });
});

describe("reviewInputSchema", () => {
  it("validates a review", () => {
    const result = reviewInputSchema.safeParse({
      name: "Happy Customer",
      email: "happy@example.com",
      rating: 5,
      text: "Amazing tour experience!",
      tourType: "waterfall",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating out of range", () => {
    const result1 = reviewInputSchema.safeParse({
      name: "User",
      email: "user@example.com",
      rating: 0,
      text: "Bad",
    });
    const result2 = reviewInputSchema.safeParse({
      name: "User",
      email: "user@example.com",
      rating: 6,
      text: "Great",
    });
    expect(result1.success).toBe(false);
    expect(result2.success).toBe(false);
  });
});
