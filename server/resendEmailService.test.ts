import { describe, expect, it } from "vitest";
import { testResendConnection } from "./resendEmailService";

describe("Resend Email Service", () => {
  it("validates Resend API key is configured and can send emails", async () => {
    // This test validates the RESEND_API_KEY environment variable
    const result = await testResendConnection();
    
    // Log the result for debugging
    console.log("[Resend Test]", result);
    
    // The test should succeed if the API key is valid
    expect(result.success).toBe(true);
    expect(result.message).toContain("Email sent successfully");
  }, 30000); // 30 second timeout for API call
});
