import type { Express } from "express";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { checkRateLimit } from "../rateLimit";

const WHATSAPP_NUMBER = "66929894495";

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

type ProviderName = "anthropic" | "openai" | "gemini";
type ProviderMessage = {
  role: "user" | "assistant";
  content: string;
};

let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  anthropicClient ??= new Anthropic({ apiKey });
  return anthropicClient;
}

function getOpenAiClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  openaiClient ??= new OpenAI({ apiKey });
  return openaiClient;
}

function normalizeMessages(
  messages: ChatMessage[],
  latestMessage: string
): ProviderMessage[] {
  const normalized = messages
    .filter(
      msg => typeof msg.content === "string" && msg.content.trim().length > 0
    )
    .map(msg => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content.trim().slice(0, 2000),
    }));

  const firstUserIdx = normalized.findIndex(msg => msg.role === "user");
  const conversation = firstUserIdx >= 0 ? normalized.slice(firstUserIdx) : [];

  if (
    conversation.length === 0 ||
    conversation[conversation.length - 1]?.role !== "user" ||
    conversation[conversation.length - 1]?.content !== latestMessage
  ) {
    conversation.push({ role: "user", content: latestMessage });
  }

  return conversation.slice(-12);
}

function getPreferredProviders(): ProviderName[] {
  const preferred = process.env.MOSHE_AI_PROVIDER?.toLowerCase();
  const defaults: ProviderName[] = ["openai", "anthropic", "gemini"];

  if (
    preferred === "anthropic" ||
    preferred === "openai" ||
    preferred === "gemini"
  ) {
    return [preferred, ...defaults.filter(provider => provider !== preferred)];
  }

  return defaults;
}

async function getAnthropicReply(
  messages: ProviderMessage[]
): Promise<string | null> {
  const client = getAnthropicClient();
  if (!client) return null;

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_CHAT_MODEL ?? "claude-sonnet-4-5-20250929",
    max_tokens: 500,
    system: MOSHE_SYSTEM_PROMPT,
    messages,
  });

  return response.content[0]?.type === "text"
    ? response.content[0].text.trim()
    : null;
}

async function getOpenAiReply(
  messages: ProviderMessage[]
): Promise<string | null> {
  const client = getOpenAiClient();
  if (!client) return null;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini",
    max_tokens: 500,
    messages: [
      { role: "system", content: MOSHE_SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? null;
}

async function getGeminiReply(
  messages: ProviderMessage[]
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

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

function logProviderError(provider: ProviderName, err: unknown) {
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? ` status=${String(err.status)}`
      : "";
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? ` code=${String(err.code)}`
      : "";
  const message = err instanceof Error ? err.message : String(err);

  console.error(
    `[Moshe] ${provider} request failed${status}${code}: ${message}`
  );
}

async function getAiReply(messages: ProviderMessage[]): Promise<{
  provider: ProviderName | "fallback";
  reply: string | null;
}> {
  for (const provider of getPreferredProviders()) {
    try {
      const reply =
        provider === "anthropic"
          ? await getAnthropicReply(messages)
          : provider === "openai"
            ? await getOpenAiReply(messages)
            : await getGeminiReply(messages);

      if (reply) return { provider, reply };
    } catch (err) {
      logProviderError(provider, err);
    }
  }

  return { provider: "fallback", reply: null };
}

function shouldEscalate(message: string): boolean {
  const lower = message.toLowerCase();
  return [
    "book",
    "booking",
    "reserve",
    "available",
    "availability",
    "price",
    "cost",
    "quote",
    "deposit",
    "payment",
    "whatsapp",
    "להזמין",
    "הזמנה",
    "פנוי",
    "זמין",
    "מחיר",
    "עלות",
    "תשלום",
  ].some(keyword => lower.includes(keyword));
}

function buildWhatsAppUrl(language: string | undefined, message: string) {
  const text =
    language === "he"
      ? `שלום, דיברתי עם משה באתר WIRO 4x4. אשמח לעזרה עם: ${message}`
      : `Hi, I chatted with Moshe on the WIRO 4x4 website. I would like help with: ${message}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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

    if (latestMessage.length > 2000) {
      res.status(400).json({ error: "Message is too long" });
      return;
    }

    const ip =
      (req.headers["x-forwarded-for"] as string) ||
      (req.headers["x-real-ip"] as string) ||
      req.ip ||
      "unknown";
    const { allowed } = checkRateLimit(`moshe:${ip}`, 20, 60_000);
    if (!allowed) {
      res.status(429).json({
        error: "Too many chat messages. Please try again in a minute.",
      });
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
    const providerMessages = normalizeMessages(chatHistory, latestMessage);

    const { provider, reply } = await getAiReply(providerMessages);
    const escalate = shouldEscalate(latestMessage);
    const whatsappUrl = buildWhatsAppUrl(language, latestMessage);

    if (reply) {
      res.json({ success: true, reply, provider, escalate, whatsappUrl });
      return;
    }

    // Fallback when API key not configured
    const fallback =
      language === "he"
        ? "תודה! משה קיבל את ההודעה שלך ויחזור אליך בהקדם דרך WhatsApp 📱"
        : "Thanks! Moshe received your message and will reply via WhatsApp shortly 📱";
    res.json({
      success: true,
      reply: fallback,
      provider,
      escalate: true,
      whatsappUrl,
    });
  });
}
