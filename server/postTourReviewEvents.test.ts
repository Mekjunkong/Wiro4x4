import { describe, expect, it } from "vitest";
import {
  buildGuestReference,
  buildPostTourReviewDedupeKey,
} from "./db/postTourReviewEvents";

describe("postTourReviewEvents helpers", () => {
  it("builds booking-scoped dedupe key for request events", () => {
    const key = buildPostTourReviewDedupeKey({
      state: "request_sent",
      bookingId: 123,
      guestReference: "booking:123",
    });

    expect(key).toBe("request_sent:booking:123");
  });

  it("builds message-id dedupe key for webhook replay safety", () => {
    const key = buildPostTourReviewDedupeKey({
      state: "response_received",
      bookingId: 123,
      guestReference: "booking:123",
      externalMessageId: "wamid.ABC123",
    });

    expect(key).toBe("response_received:wa:wamid.ABC123");
  });

  it("normalizes phone fallback for guest reference", () => {
    const reference = buildGuestReference({
      phone: " +66 92-989-4495 ",
    });

    expect(reference).toBe("phone:+66929894495");
  });
});
