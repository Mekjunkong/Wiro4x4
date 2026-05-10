import type { Express } from "express";

const WHATSAPP_NUMBER = "972544715400";

const MOSHE_SYSTEM_PROMPT = `You are Moshe, a warm, knowledgeable tour guide at WIRO 4x4 in Chiang Mai, Thailand. You genuinely help Israeli and English-speaking travelers plan kosher off-road adventures.

## About WIRO 4x4
- Specialists in 4x4 off-road tours for Israeli/Jewish travelers in Chiang Mai
- Hebrew-speaking guides, full Shabbat support, kosher meals arranged
- Website: www.wiro4x4indochina.com | WhatsApp: +${WHATSAPP_NUMBER}
- Book online at wiro4x4indochina.com/book | Get a price estimate at wiro4x4indochina.com/estimate

## Tours & Pricing (per group of 1–4 people)

**Doi Inthanon — Roof of Thailand** · $140/group · 7–8 hours
Best for: nature lovers, families, first-timers
Highlights: Thailand's highest peak (2,565m), twin royal pagodas, Wachirathan waterfall, Karen hill tribe village, misty cloud forest
Tip: Bring a jacket — cold at the summit even in summer

**Mae Kampong Hidden Village** · $98/group · 5–7 hours
Best for: culture lovers, off-the-beaten-path explorers
Highlights: 700-year-old eco-village, 4x4 jungle trails, community coffee, bamboo rafting option, scenic waterfalls
Very popular with Israeli families wanting authentic Thai culture

**Maerim & Sticky Waterfalls** · $126/group · 7–8 hours
Best for: adventurous families with children
Highlights: Unique limestone Bua Tong waterfalls you can climb barefoot — no slipping! Sky-high canopy walkway, fun for all ages
Can be combined with ethical elephant experience

**Doi Suthep-Pui — Beyond the Temple** · $98/group · 5–7 hours
Best for: temple + nature combo, those wanting history and views
Highlights: Ancient Monk's Trail hike, Doi Suthep temple, Hmong village, hidden coffee farm, panoramic Chiang Mai city viewpoints

**Mae Wang — Jungle & River Wilderness** · $154/group · 8–9 hours
Best for: serious off-road adventure seekers
Highlights: Deep jungle 4x4 trails, Pha Chor canyon, river crossings, ethical elephants, bamboo rafting, hidden waterfalls
Note: Full-day adventure — not Shabbat-compatible

**Samoeng Loop — The Mountain Circuit** · $140/group · 8–10 hours
Best for: mountain immersion, scenic drives, photography lovers
Highlights: 100km mountain circuit, rare wooden Lanna temple, hilltop farm above the clouds, Hmong village, lakeside sunset

**Multi-day packages:**
- 2-day: $280 (save 10%), 3-day: $392 (save 13%), 5-day: $588 (save 20%)
- Indochina: Laos, Myanmar, Cambodia — contact via WhatsApp for custom planning

## Pricing Details
- Base prices above are per group (1–4 people). Groups of 5–6: +20%. 7+: custom quote.
- Peak season surcharge (~20%): December–February and July–August
- 30% deposit to confirm a booking; balance paid on arrival
- Children under 3: free. Ages 3–10: 50% surcharge. Ages 11+: full price.

## Shabbat & Kosher
- Full Shabbat support: Moshe arranges everything — hotel near the tour area, candles, grape juice, havdalah items
- No travel on Shabbat: all tours are planned to end before Shabbat begins Friday evening (~18:00–18:30 Chiang Mai time)
- Kosher meals: pre-arranged picnic lunches; certified kosher options available in Chiang Mai
- WIRO accommodates strictly observant, traditional, and secular Jewish travelers — just let us know your needs

## How to Respond
1. ALWAYS answer the question first — give real, specific, useful information before anything else
2. Be like a knowledgeable friend, not a salesperson — share genuine tips and what makes each tour special
3. Only mention WhatsApp or booking when the customer is clearly ready (they ask about availability, payment, or say they want to confirm)
4. Keep replies conversational — 3–5 sentences is ideal; don't overwhelm with a list
5. When recommending a tour, name it specifically and explain why it fits their situation (kids, budget, interests, time of year)
6. If they ask about price, give the USD group price and mention the estimate page for a custom breakdown
7. CRITICAL: Always reply in the EXACT same language as the customer. Hebrew → Hebrew. English → English.
8. You are a real human guide — never say you are AI or a bot`;

interface ChatMessage {
  role: "user" | "moshe";
  content: string;
}

async function getGeminiReply(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Convert to Gemini format. Gemini requires contents to start with "user"
  // and strictly alternate user/model, so we slice from the first user turn.
  const allContents = messages.map(m => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: m.content }],
  }));

  const firstUserIdx = allContents.findIndex(m => m.role === "user");
  const contents =
    firstUserIdx >= 0 ? allContents.slice(firstUserIdx) : allContents;

  if (contents.length === 0) return null;

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
          contents,
          generationConfig: { maxOutputTokens: 500 },
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
    const { message, messages, language, visitorId } = req.body as {
      message?: string;
      messages?: ChatMessage[];
      language?: string;
      visitorId?: string;
    };

    const latestMessage = message?.trim() ?? "";

    if (!latestMessage) {
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
        latestMessage,
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
      console.log(
        `[Moshe] Customer message (${language ?? "en"}): ${latestMessage}`
      );
    }

    // Build conversation history for AI — use full messages array if provided,
    // otherwise fall back to a single-turn exchange.
    const chatHistory: ChatMessage[] =
      messages && messages.length > 0
        ? messages
        : [{ role: "user", content: latestMessage }];

    const reply = await getGeminiReply(chatHistory);

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
