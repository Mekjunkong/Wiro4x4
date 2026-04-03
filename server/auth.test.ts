import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  generateResetToken,
} from "./auth";

describe("auth module", () => {
  // Set JWT_SECRET for tests
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-chars-long";

  describe("password hashing", () => {
    it("produces different hashes for same password (different salts)", async () => {
      const hash1 = await hashPassword("testpassword");
      const hash2 = await hashPassword("testpassword");
      expect(hash1).not.toBe(hash2);
    });

    it("verifies correct password", async () => {
      const hash = await hashPassword("correctpassword");
      const result = await verifyPassword("correctpassword", hash);
      expect(result).toBe(true);
    });

    it("rejects incorrect password", async () => {
      const hash = await hashPassword("correctpassword");
      const result = await verifyPassword("wrongpassword", hash);
      expect(result).toBe(false);
    });
  });

  describe("JWT sessions", () => {
    it("creates token with userId, email, role claims", async () => {
      const token = await createSession(42, "admin@test.com", "admin");
      const payload = await verifySession(token);
      expect(payload).toEqual(
        expect.objectContaining({
          userId: 42,
          email: "admin@test.com",
          role: "admin",
        })
      );
    });

    it("verifies valid token successfully", async () => {
      const token = await createSession(1, "user@test.com", "user");
      const payload = await verifySession(token);
      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe(1);
    });

    it("returns null for invalid signature", async () => {
      const payload = await verifySession("invalid.jwt.token");
      expect(payload).toBeNull();
    });

    it("returns null for expired token", async () => {
      // Create a token that expired in the past by manipulating the JWT manually
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const expiredToken = await new SignJWT({
        userId: 1,
        email: "x@x.com",
        role: "user",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // 1 hour ago
        .sign(secret);
      const payload = await verifySession(expiredToken);
      expect(payload).toBeNull();
    });

    it("sets expiration to 7 days", async () => {
      const token = await createSession(1, "user@test.com", "user");
      await verifySession(token);
      // The exp claim should be ~7 days from now
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const sevenDaysSeconds = 7 * 24 * 60 * 60;
      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBeGreaterThan(now + sevenDaysSeconds - 60);
      expect(decoded.exp).toBeLessThan(now + sevenDaysSeconds + 60);
    });
  });

  describe("reset tokens", () => {
    it("generates 64-char hex string", () => {
      const token = generateResetToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("generates unique tokens each call", () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();
      expect(token1).not.toBe(token2);
    });
  });
});
