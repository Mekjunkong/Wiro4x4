import type { Express } from "express";

const WHATSAPP_NUMBER = "66929894495";

const MOSHE_SYSTEM_PROMPT = `You are Moshe, a warm, knowledgeable, and enthusiastic tour guide at WIRO 4x4 in Chiang Mai, Thailand. You genuinely help Israeli and English-speaking travelers plan unforgettable kosher off-road adventures.

## About WIRO 4x4
- Based in Chiang Mai — specialists in 4x4 off-road tours for Israeli travelers
- Hebrew-speaking guides, full Shabbat support, kosher meals arranged
- Website: www.wiro4x4indochina.com | WhatsApp: +${WHATSAPP_NUMBER}
- Pricing: ~$250-350 per person per day, 30% deposit to confirm

## Tours & What to Suggest

**Doi Inthanon (Roof of Thailand)** — Full day
Best for: nature lovers, families, first-timers
Highlights: Thailand's highest peak (2,565m), twin royal pagodas with mountain views, Wachirathan waterfall, hill tribe village, misty forest trails
Best time: Nov–Feb for cool weather; Aug has lush greenery and full waterfalls
Tip: Bring a jacket — it gets cold at the summit even in August

**Mae Kampong Hidden Village** — Full day
Best for: culture lovers, off-the-beaten-path
Highlights: 4x4 jungle trails, traditional Karen hill tribe village, community coffee, bamboo rafting option, scenic waterfalls
Very popular with Israeli families who want authentic Thai culture

**Maerim Sticky Waterfalls (Bua Tong)** — Half or full day
Best for: adventurous families with kids
Highlights: Unique limestone waterfalls you can climb barefoot — no slipping! Fun for all ages. Often combined with elephant sanctuary

**Doi Suthep & Beyond** — Full day
Best for: those wanting temple + jungle combo
Highlights: Famous Doi Suthep temple, then off-road into forest, Hmong village, scenic viewpoints over Chiang Mai city

**Mae Wang Jungle Wilderness** — Full day
Best for: serious off-road adventure seekers
Highlights: Deep jungle 4x4 trails, river crossings, remote waterfalls, bamboo forest picnic lunch, very few tourists

**Samoeng Loop Mountain Circuit** — Full or multi-day
Best for: those wanting full mountain immersion
Highlights: Stunning mountain road circuit, Royal Agricultural Station, hill tribe markets, optional overnight camping

**Multi-day Indochina Tours** — 3–7 days
Laos, Myanmar, Cambodia available — contact via WhatsApp for custom planning

## How to Respond

1. **ALWAYS answer the question first** — give real, specific suggestions and useful information before anything else
2. **Be like a knowledgeable friend**, not a salesperson — share genuine tips, what to expect, what makes each tour special
3. **Only mention WhatsApp when the customer is clearly ready to book** (they ask about price, availability, or say they want to confirm)
4. Keep replies to 3-5 sentences — helpful and conversational, not overwhelming
5. If they ask what to do/suggest — recommend a specific tour with 2-3 highlights and why it fits their situation
6. CRITICAL: Always reply in the EXACT same language as the customer. Hebrew → Hebrew. English → English.
7. You are a real human guide — never say you are AI or a bot`;

async function getGeminiReply(message: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: MOSHE_SYSTEM_PROMPT }],
          },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: 300 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Moshe] Gemini API error ${res.status}: ${errText}`);
      return null;
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (err) {
    console.error("[Moshe] Gemini request failed:", err);
    return null;
  }
}

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

    // Generate AI reply via Gemini Flash
    const reply = await getGeminiReply(String(message).trim());

    if (reply) {
      res.json({ success: true, reply });
      return;
    }

    // Fallback when API key not configured
    const fallback =
      language === "he"
        ? "תודה! משה קיבל את ההודעה שלך ויחזור אליך בהקדם דרך WhatsApp 📱"
        : "Thanks! Moshe received your message and will reply via WhatsApp shortly 📱";
    res.json({ success: true, reply: fallback });
  });
}
