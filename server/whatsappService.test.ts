import { describe, it, expect } from "vitest";
import {
  isWhatsAppConfigured,
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  getVerifyToken,
} from "./whatsappService";

describe("WhatsApp Service", () => {
  it("reports not configured when env vars are missing", () => {
    expect(isWhatsAppConfigured()).toBe(false);
  });

  it("returns null when sending message without API token", async () => {
    const result = await sendWhatsAppMessage("972501234567", "Hello!");
    expect(result).toBeNull();
  });

  it("returns null when sending template without API token", async () => {
    const result = await sendWhatsAppTemplate(
      "972501234567",
      "hello_world",
      []
    );
    expect(result).toBeNull();
  });

  it("returns empty verify token when env var is not set", () => {
    expect(getVerifyToken()).toBe("");
  });
});
