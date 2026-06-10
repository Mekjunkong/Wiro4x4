import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyOwner } from "./notification";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("notifyOwner", () => {
  it("falls back to Telegram when email is not configured", async () => {
    delete process.env.OWNER_EMAIL;
    delete process.env.RESEND_API_KEY;
    process.env.TELEGRAM_BOT_TOKEN = "telegram-token";
    process.env.TELEGRAM_CHAT_ID = "12345";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const delivered = await notifyOwner({
      title: "Lead still waiting",
      content: "Lead #12 is still new after 10 minutes.",
    });

    expect(delivered).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.telegram.org/bottelegram-token/sendMessage",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "12345",
          text: "WIRO 4x4: Lead still waiting\n\nLead #12 is still new after 10 minutes.",
        }),
      })
    );
  });

  it("returns false when no owner notification channel is configured", async () => {
    delete process.env.OWNER_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;

    const delivered = await notifyOwner({
      title: "Lead still waiting",
      content: "Lead #12 is still new after 10 minutes.",
    });

    expect(delivered).toBe(false);
  });
});
