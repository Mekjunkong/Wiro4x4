import { describe, it, expect } from "vitest";
import { bookingDraftInputSchema } from "../shared/schemas";

describe("BookingDraft", () => {
  it("validates draft input schema with minimal data", () => {
    const result = bookingDraftInputSchema.safeParse({
      formData: JSON.stringify({ arrivalDate: "2026-03-01" }),
    });
    expect(result.success).toBe(true);
  });

  it("validates draft input schema with full data", () => {
    const result = bookingDraftInputSchema.safeParse({
      contactName: "Test User",
      contactEmail: "test@example.com",
      contactPhone: "+66123456789",
      formData: JSON.stringify({
        arrivalDate: "2026-03-01",
        numberOfAdults: 2,
      }),
      tourSlug: "doi-inthanon-roof-of-thailand",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email in draft", () => {
    const result = bookingDraftInputSchema.safeParse({
      contactEmail: "not-email",
      formData: "{}",
    });
    expect(result.success).toBe(false);
  });

  it("allows empty string email", () => {
    const result = bookingDraftInputSchema.safeParse({
      contactEmail: "",
      formData: "{}",
    });
    expect(result.success).toBe(true);
  });

  it("requires formData field", () => {
    const result = bookingDraftInputSchema.safeParse({
      contactName: "Test",
    });
    expect(result.success).toBe(false);
  });
});
