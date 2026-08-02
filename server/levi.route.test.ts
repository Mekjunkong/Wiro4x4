import { createServer } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./_core/app";
import { resetRateLimitStore } from "./rateLimit";

const servers: ReturnType<typeof createServer>[] = [];

beforeEach(() => {
  resetRateLimitStore();
  for (const key of [
    "LEVI_CHAT_URL",
    "LEVI_API_KEY",
    "LEVI_WEBHOOK_URL",
    "LEVI_WEBHOOK_SECRET",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID",
    "OWNER_EMAIL",
    "RESEND_API_KEY",
  ]) {
    vi.stubEnv(key, "");
  }
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(
    servers.splice(0).map(
      server =>
        new Promise<void>((resolve, reject) => {
          server.close(error => (error ? reject(error) : resolve()));
        })
    )
  );
});

async function appOrigin() {
  const server = createServer(createApp());
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected an ephemeral TCP address");
  }
  return `http://127.0.0.1:${address.port}`;
}

describe("Levi customer route", () => {
  it("rejects malformed runtime input instead of trusting TypeScript casts", async () => {
    const origin = await appOrigin();
    const response = await fetch(`${origin}/api/levi/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "hello",
        messages: "not-an-array",
        visitorId: "contains spaces",
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid chat request",
    });
  });

  it("uses an honest fallback and returns structured booking progress", async () => {
    const origin = await appOrigin();
    const response = await fetch(`${origin}/api/levi/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Tell me about your tours",
        language: "en",
      }),
    });
    const body = (await response.json()) as Record<string, any>;

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.provider).toBe("fallback");
    expect(body.reply).toContain("couldn't answer automatically");
    expect(body.reply).not.toContain("received your message");
    expect(body.bookingState).toMatchObject({
      intent: "general",
      completionPercent: 0,
      qualified: false,
    });
  });

  it("does not expose Moshe, Eli, or generic chat providers", async () => {
    const origin = await appOrigin();
    const [genericChat, eliChat, mosheChat] = await Promise.all([
      fetch(`${origin}/api/chat`, { method: "POST" }),
      fetch(`${origin}/api/eli/chat`, { method: "POST" }),
      fetch(`${origin}/api/moshe/message`, { method: "POST" }),
    ]);

    expect(genericChat.status).toBe(404);
    expect(eliChat.status).toBe(404);
    expect(mosheChat.status).toBe(404);
  });
});
