import { describe, expect, it } from "vitest";
import { createCheckoutSession, handleWebhook, getSessionStatus } from "./stripe";

describe("Stripe placeholder functions", () => {
  it("createCheckoutSession throws not-configured error", async () => {
    await expect(
      createCheckoutSession(1, 5000, "deposit"),
    ).rejects.toThrow("Stripe integration not yet configured");
  });

  it("handleWebhook throws not-configured error", async () => {
    await expect(
      handleWebhook("{}", "fake-signature"),
    ).rejects.toThrow("Stripe integration not yet configured");
  });

  it("getSessionStatus throws not-configured error", async () => {
    await expect(
      getSessionStatus("cs_test_fake"),
    ).rejects.toThrow("Stripe integration not yet configured");
  });
});
