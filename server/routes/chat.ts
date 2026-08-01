import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "../rateLimit";
import {
  createChatSession,
  getChatSessionByVisitorId,
  getChatMessagesBySessionId,
  addChatMessage,
  closeChatSession,
} from "../db/chat";

// Lazily initialize Anthropic client (same pattern as aiContentGenerator.ts)
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required for chat"
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

// System prompt for Wiro AI assistant
const SYSTEM_PROMPT = `You are Wiro, the friendly AI assistant for WIRO 4x4 Indochina — a kosher off-road 4x4 tour company in Chiang Mai, Thailand. You help travelers (mostly Israeli/Jewish tourists) plan their Northern Thailand adventures.

You speak in the same language the visitor uses. If they write in Hebrew, respond in Hebrew. If English, respond in English.

About WIRO 4x4:
- Tours: Doi Inthanon (flagship), Doi Suthep half-day, multi-day packages (2-5 days) to Pai, Chiang Rai, Mae Hong Son, Golden Triangle
- All tours are kosher-friendly with kosher meal options
- Shabbat hotel options available
- Self-driving 4x4 rental available ($100-150 USD)
- WhatsApp: +66816401397
- Email: wiro.adventures@gmail.com
- Booking: https://www.wiro4x4indochina.com/book

Keep responses concise (2-4 sentences). When visitors ask about booking or pricing, encourage them to use the booking form or contact via WhatsApp. Never make up specific prices.`;

export const chatRouter = Router();

// POST /api/chat/message
chatRouter.post("/message", async (req, res) => {
  try {
    const { visitorId, message, language } = req.body as {
      visitorId: string;
      message: string;
      language: "en" | "he";
    };

    // Validate input
    if (!visitorId || typeof visitorId !== "string") {
      return res.status(400).json({ error: "visitorId is required" });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }
    if (message.length > 2000) {
      return res
        .status(400)
        .json({ error: "Message too long (max 2000 characters)" });
    }

    const lang = language === "he" ? "he" : "en";

    // Rate limit: 20 messages per minute per IP
    const ip =
      (req.headers["x-forwarded-for"] as string) ||
      (req.headers["x-real-ip"] as string) ||
      req.ip ||
      "unknown";
    const { allowed } = checkRateLimit(`chat:${ip}`, 20, 60_000);
    if (!allowed) {
      return res.status(429).json({
        error: "Too many chat messages. Please try again in a minute.",
      });
    }

    // 1. Get or create chat session for visitorId
    const session = await getChatSessionByVisitorId(visitorId);
    let sessionId: number;

    if (session) {
      sessionId = session.id;
    } else {
      sessionId = await createChatSession({ visitorId, language: lang });
    }

    // 2. Load last 10 messages
    const historyMessages = await getChatMessagesBySessionId(sessionId);
    const recentHistory = historyMessages.slice(-10);

    // 3. Save visitor message
    await addChatMessage({
      sessionId,
      role: "visitor",
      content: message,
    });

    // 4. Build messages array for Claude
    const claudeMessages: Anthropic.MessageParam[] = recentHistory.map(msg => ({
      role: msg.role === "visitor" ? "user" : "assistant",
      content: msg.content,
    }));

    // Add the new user message
    claudeMessages.push({
      role: "user",
      content: message,
    });

    // 5. Call Claude API
    let reply: string;
    try {
      const client = getClient();
      const response = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: claudeMessages,
      });

      reply =
        response.content[0]?.type === "text" ? response.content[0].text : "";
    } catch (apiError) {
      console.error("[Chat] Claude API error:", apiError);
      // Fallback response if API fails
      reply =
        lang === "he"
          ? "מצטער, אני לא זמין כרגע. אנא צרו קשר דרך וואטסאפ: +66816401397"
          : "Sorry, I am unavailable right now. Please contact us via WhatsApp: +66816401397";
    }

    // 6. Save AI response
    await addChatMessage({
      sessionId,
      role: "ai",
      content: reply,
    });

    // 7. Return response
    return res.json({ reply, sessionId });
  } catch (error) {
    console.error("[Chat] Route error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/chat/close
chatRouter.post("/close", async (req, res) => {
  try {
    const { sessionId } = req.body as { sessionId: number };

    if (!sessionId || typeof sessionId !== "number") {
      return res.status(400).json({ error: "sessionId is required" });
    }

    await closeChatSession(sessionId);

    return res.json({ success: true });
  } catch (error) {
    console.error("[Chat] Close session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export function registerChatRoute(app: import("express").Express) {
  app.use("/api/chat", chatRouter);
}
