import { describe, expect, it } from "vitest";
import { testResendConnection } from "./resendEmailService";

describe("Resend Email Service", () => {
  it("returns a result from testResendConnection", async () => {
    const result = await testResendConnection();

    // Log the result for debugging
    console.log("[Resend Test]", result);

    // Without RESEND_API_KEY, the function returns gracefully
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");

    if (process.env.RESEND_API_KEY) {
      // With API key, it should succeed
      expect(result.success).toBe(true);
      expect(result.message).toContain("Email sent successfully");
    } else {
      // Without API key, it returns not-configured message
      expect(result.success).toBe(false);
      expect(result.message).toContain("not configured");
    }
  }, 30000);
});
