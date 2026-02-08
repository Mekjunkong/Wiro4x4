import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimitStore } from "./rateLimit";

beforeEach(() => {
  resetRateLimitStore();
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const result = checkRateLimit("test-ip", 3, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests over the limit", () => {
    // Exhaust the limit
    checkRateLimit("test-ip", 3, 60_000);
    checkRateLimit("test-ip", 3, 60_000);
    checkRateLimit("test-ip", 3, 60_000);

    const result = checkRateLimit("test-ip", 3, 60_000);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different keys independently", () => {
    // Exhaust limit for ip-1
    checkRateLimit("ip-1", 1, 60_000);
    const blocked = checkRateLimit("ip-1", 1, 60_000);

    // ip-2 should still be allowed
    const allowed = checkRateLimit("ip-2", 1, 60_000);

    expect(blocked.allowed).toBe(false);
    expect(allowed.allowed).toBe(true);
  });
});
