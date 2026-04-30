import Anthropic from "@anthropic-ai/sdk";
import type { Express } from "express";

const WHATSAPP_NUMBER = "66929894495";

let anthropicClient: Anthropic | null = null;

function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

const MOSHE_SYSTEM_PROMPT = `You are Moshe, a warm and knowledgeable tour guide at WIRO 4x4 in Chiang Mai, Thailand. You help Israeli and English-speaking travelers plan kosher off-road adventures.

About WIRO 4x4:
- Based in Chiang Mai, Thailand — specializes in 4x4 off-road tours for Israeli travelers
- Hebrew-speaking guides, full Shabbat support, kosher meals available
- Tours: Doi Inthanon (Roof of Thailand), Mae Kampong Hidden Village, Maerim Sticky Waterfalls, Doi Suthep & beyond, Mae Wang Jungle Wilderness, Samoeng Loop Mountain Circuit
- Also offers multi-day Indochina tours (Laos, Myanmar, Cambodia)
- Pricing starts around $250-350 per person per day, deposit 30%
- WhatsApp for bookings: +${WHATSAPP_NUMBER}
- Website: www.wiro4x4indochina.com

Rules:
- CRITICAL: Always respond in the EXACT same language as the customer's message. Hebrew message → Hebrew reply. English message → English reply. Never mix.
- Be warm, friendly, and concise (2-4 sentences max)
- For detailed pricing or booking, invite them to WhatsApp: +${WHATSAPP_NUMBER}
- You are a real human guide — never reveal you are an AI`;

export function registerMosheRoute(app: Express) {
  app.post("/api/moshe/message", async (req, res) => {
    const { message, language, visitorId } = req.body as {
      message?: string;
      language?: string;
      visitorId?: string;
    };

    if (!message?.trim()) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Send Telegram notification (fire-and-forget)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const lang = language === "he" ? "🇮🇱 Hebrew" : "🇬🇧 English";
      const text = [
        `💬 <b>New Customer Message — WIRO 4x4</b>`,
        ``,
        `🌐 Language: ${lang}`,
        visitorId ? `🔑 Visitor: ${String(visitorId).slice(0, 14)}` : null,
        ``,
        `📝 <b>Message:</b>`,
        String(message).trim(),
        ``,
        `📱 <a href="https://wa.me/${WHATSAPP_NUMBER}">Reply via WhatsApp</a>`,
      ]
        .filter(l => l !== null)
        .join("\n");

      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }).catch(err => console.error("[Moshe] Telegram send failed:", err));
    } else {
      console.log(`[Moshe] Customer message (${language ?? "en"}): ${message}`);
    }

    // Generate AI reply
    const anthropic = getAnthropic();
    if (anthropic) {
      try {
        const aiResponse = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          system: MOSHE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: String(message).trim() }],
        });

        const reply =
          aiResponse.content[0]?.type === "text"
            ? aiResponse.content[0].text
            : null;

        if (reply) {
          res.json({ success: true, reply });
          return;
        }
      } catch (err) {
        console.error("[Moshe] AI response failed:", err);
      }
    }

    // Fallback when no AI key configured
    const fallback =
      language === "he"
        ? "תודה! משה קיבל את ההודעה שלך ויחזור אליך בהקדם דרך WhatsApp 📱"
        : "Thanks! Moshe received your message and will reply via WhatsApp shortly 📱";
    res.json({ success: true, reply: fallback });
  });
}
