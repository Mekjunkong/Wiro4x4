import { describe, expect, it } from "vitest";
import { sendAutoResponse } from "./autoResponse";

describe("Auto-Response", () => {
  it("returns false when Resend API key is not configured", async () => {
    // Without RESEND_API_KEY in env, sendAutoResponse should gracefully return false
    const result = await sendAutoResponse({
      name: "Test Lead",
      email: "test@example.com",
      source: "website",
    });
    expect(result).toBe(false);
  });

  it("exports sendAutoResponse as a function", () => {
    expect(typeof sendAutoResponse).toBe("function");
  });
});
