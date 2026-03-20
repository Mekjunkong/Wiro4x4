import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchGoogleReviews,
  isGoogleReviewsConfigured,
  getCacheStatus,
  clearGoogleReviewsCache,
} from "./googleReviewsService";

describe("googleReviewsService", () => {
  beforeEach(() => {
    clearGoogleReviewsCache();
    vi.unstubAllEnvs();
  });

  it("returns empty array when API key is not configured", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");
    vi.stubEnv("GOOGLE_PLACE_ID", "");
    const reviews = await fetchGoogleReviews();
    expect(reviews).toEqual([]);
  });

  it("reports not configured when env vars are missing", () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");
    vi.stubEnv("GOOGLE_PLACE_ID", "");
    expect(isGoogleReviewsConfigured()).toBe(false);
  });

  it("reports configured when both env vars are set", () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
    vi.stubEnv("GOOGLE_PLACE_ID", "test-place-id");
    expect(isGoogleReviewsConfigured()).toBe(true);
  });

  it("returns cache status with no cache", () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");
    vi.stubEnv("GOOGLE_PLACE_ID", "");
    const status = getCacheStatus();
    expect(status.cacheAge).toBeNull();
    expect(status.reviewCount).toBe(0);
  });

  it("clears cache without error", () => {
    expect(() => clearGoogleReviewsCache()).not.toThrow();
  });
});
