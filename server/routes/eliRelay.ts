/**
 * Eli Relay — Phase 2
 * Routes WIRO chat widget messages through Eli (OpenClaw) via Telegram Bot API
 *
 * Flow:
 * 1. Customer sends message via WIRO chat widget
 * 2. WIRO server creates a virtual Telegram session for this customer
 * 3. Message sent to Eli bot, Eli processes with full tools/memory
 * 4. Response polled and returned to customer
 *
 * Uses a dedicated WIRO chat group (-4xxxxxxxxx) or per-session DM simulation
 */

import type { Express } from "express";
import { checkRateLimit } from "../rateLimit";
import { notifyChatMessage } from "../eliNotify";

const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ??
  "8716271731:AAHDwfQR4mSiI4q4ulu7jqc1M5IzZvZhwHU";
const ELI_CHAT_ID = process.env.ELI_CHAT_ID ?? "8506295306"; // Mek's chat — Eli sees + responds

// In-memory session store (keyed by visitorId → {chatId, pendingResponses})
const sessions = new Map<string, { chatId: string; lastUpdate: number }>();
const pendingReplies = new Map<string, string[]>();

async function telegramPost(method: string, body: object): Promise<unknown> {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

async function telegramGet(
  method: string,
  params: Record<string, string | number> = {}
): Promise<unknown> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  );
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}?${qs}`
  );
  return res.json();
}

// ── Relay message to Eli ──────────────────────────────────────────────────────
async function sendToEli(
  sessionId: string,
  visitorName: string,
  message: string,
  language: string
): Promise<void> {
  const langLabel =
    language === "he"
      ? "🇮🇱 Hebrew"
      : language === "th"
        ? "🇹🇭 Thai"
        : "🇬🇧 English";
  const text = `💬 *WIRO Website Chat* [${langLabel}]\n👤 Visitor: ${visitorName}\n🆔 Session: \`${sessionId.slice(0, 8)}\`\n\n${message}`;

  await telegramPost("sendMessage", {
    chat_id: ELI_CHAT_ID,
    text,
    parse_mode: "Markdown",
  });
}

// ── Poll for Eli's response ───────────────────────────────────────────────────
// This is a simple store: when Mek (or Eli) replies to a wiro-chat message in Telegram,
// we capture it via the /eli/relay/webhook endpoint and store it for the visitor to pick up
let lastUpdateId = 0;

async function pollEliReplies(): Promise<void> {
  try {
    const data = (await telegramGet("getUpdates", {
      offset: lastUpdateId + 1,
      limit: 10,
      timeout: 0,
    })) as { ok: boolean; result: TelegramUpdate[] };

    if (!data.ok || !data.result?.length) return;

    for (const update of data.result) {
      lastUpdateId = update.update_id;
      const msg = update.message;
      if (!msg?.text) continue;

      // Look for replies that mention a session ID
      const text = msg.text;
      const sessionMatch = text.match(/\[session:([a-f0-9]+)\]/i);
      if (sessionMatch) {
        const sessionId = sessionMatch[1];
        const replies = pendingReplies.get(sessionId) ?? [];
        replies.push(text.replace(/\[session:[a-f0-9]+\]/i, "").trim());
        pendingReplies.set(sessionId, replies);
      }
    }
  } catch (e) {
    console.error("[EliRelay] Poll error:", e);
  }
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    text?: string;
    chat?: { id: number };
    from?: { id: number };
  };
}

// ── Express Routes ────────────────────────────────────────────────────────────
export function registerEliRelayRoute(app: Express) {
  // POST /api/eli/relay — Send message to Eli, wait for response
  app.post("/api/eli/relay", async (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
      const { allowed } = checkRateLimit(`eli-relay:${ip}`, 20, 60_000);
      if (!allowed) {
        return res.status(429).json({ error: "Rate limit exceeded" });
      }

      const { message, sessionId, language, visitorName } = req.body as {
        message: string;
        sessionId: string;
        language?: string;
        visitorName?: string;
      };

      if (!message || !sessionId) {
        return res
          .status(400)
          .json({ error: "message and sessionId required" });
      }

      const lang = (language as "en" | "he" | "th") ?? "en";
      const name = visitorName ?? "Anonymous";
      const shortSession = sessionId.slice(0, 8);

      // Send to Eli via Telegram
      await sendToEli(shortSession, name, message, lang);

      // Also alert if booking intent
      notifyChatMessage({
        userMessage: message,
        language: lang,
        sessionId,
      }).catch(() => {});

      // Register session
      sessions.set(shortSession, {
        chatId: ELI_CHAT_ID,
        lastUpdate: Date.now(),
      });

      return res.json({
        ok: true,
        sessionId: shortSession,
        message:
          "Message sent to Eli. Use /api/eli/relay/poll to get response.",
      });
    } catch (e) {
      console.error("[EliRelay] Send error:", e);
      return res.status(500).json({ error: "Relay failed" });
    }
  });

  // GET /api/eli/relay/poll?sessionId=xxx — Poll for Eli's response
  app.get("/api/eli/relay/poll", async (req, res) => {
    const { sessionId } = req.query as { sessionId: string };
    if (!sessionId)
      return res.status(400).json({ error: "sessionId required" });

    await pollEliReplies();

    const replies = pendingReplies.get(sessionId) ?? [];
    if (replies.length > 0) {
      pendingReplies.delete(sessionId);
      return res.json({ reply: replies[0], hasMore: replies.length > 1 });
    }

    return res.json({ reply: null, waiting: true });
  });

  // POST /api/eli/relay/webhook — Receive replies tagged with [session:xxx]
  app.post("/api/eli/relay/webhook", async (req, res) => {
    const { sessionId, reply } = req.body as {
      sessionId: string;
      reply: string;
    };
    if (sessionId && reply) {
      const existing = pendingReplies.get(sessionId) ?? [];
      existing.push(reply);
      pendingReplies.set(sessionId, existing);
    }
    return res.json({ ok: true });
  });
}
