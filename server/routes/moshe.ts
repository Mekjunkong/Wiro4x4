import type { Express } from "express";

const WHATSAPP_NUMBER = "66929894495";

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

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      try {
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

        const tgRes = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: "HTML",
              disable_web_page_preview: true,
            }),
          }
        );

        if (!tgRes.ok) {
          const err = await tgRes.text();
          console.error("[Moshe] Telegram API error:", err);
        }
      } catch (err) {
        console.error("[Moshe] Telegram send failed:", err);
      }
    } else {
      // Graceful fallback: log to console
      console.log(`[Moshe] Customer message (${language ?? "en"}): ${message}`);
      console.warn(
        "[Moshe] Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID to enable Telegram alerts"
      );
    }

    res.json({ success: true });
  });
}
