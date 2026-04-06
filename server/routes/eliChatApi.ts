/**
 * Eli Chat API — Phase 2
 * Full Eli persona with real DB data: tours, availability, leads context
 * Powers the chat widget on wiro4x4indochina.com
 */

import type { Express } from "express";
import OpenAI from "openai";
import { checkRateLimit } from "../rateLimit";
import { notifyChatMessage } from "../eliNotify";

type ChatLanguage = "en" | "he" | "th";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface EliChatRequest {
  message: string;
  language: ChatLanguage;
  history: ChatMessage[];
  sessionId?: string;
}

// ── Eli System Prompt ──────────────────────────────────────────────────────
function buildEliPrompt(
  language: ChatLanguage,
  tours: TourSummary[],
  availability: AvailSummary
): string {
  const tourList =
    tours.length > 0
      ? tours
          .map(
            t =>
              `- **${t.name}**: ${t.duration ?? "Full day"} · ฿${t.basePrice?.toLocaleString() ?? "ask"}/person${t.description ? ` — ${t.description.slice(0, 80)}` : ""}`
          )
          .join("\n")
      : `- Doi Inthanon (Roof of Thailand): ฿3,500/pp — Full day
- Doi Suthep & Pui National Park: ฿2,000/pp — Half/full day  
- Mae Kampong Village: ฿2,500/pp — Half/full day
- Maerim Sticky Waterfalls: ฿3,000/pp — Full day
- Mae Wang Jungle Wilderness: ฿3,500/pp — Full day
- Samoeng Loop Circuit: ฿3,200/pp — Full day
- 2-Day Adventure Package: ฿7,500/pp
- 3-Day Explorer Package: ฿12,000/pp
- 5-Day Ultimate Package: ฿22,000/pp`;

  const availNote = availability.nextAvailable
    ? `\nNext available date: ${availability.nextAvailable}`
    : "";

  const langInstructions: Record<ChatLanguage, string> = {
    en: "Respond in English. Be direct and warm — no filler phrases.",
    he: "ענה בעברית טבעית. תקשורת ישירה וחמה. אל תשתמש בתרגום מכאני.",
    th: "ตอบเป็นภาษาไทยครับ ใช้ภาษาที่เป็นธรรมชาติ สุภาพ กระชับ",
  };

  return `You are Eli, the AI assistant for WIRO 4x4 — a kosher off-road adventure company in Chiang Mai, Thailand.

## Who You Are
- Name: Eli (not "Wiro" — you are the AI, Wiro is the human guide)
- Personality: Direct, knowledgeable, genuinely helpful. No corporate speak. No "Great question!" filler.
- You know Northern Thailand deeply and love helping travelers plan real adventures.
- You speak naturally in the customer's language.

## WIRO 4x4 — Current Tours
${tourList}${availNote}

## Kosher & Jewish Travelers
- All tours can include kosher meals (advance notice needed)
- Hebrew-speaking guide (Wiro) available
- Shabbat-friendly scheduling possible
- Coordination with Chabad Chiang Mai available
- This is a specialty — we're experienced with Israeli/Jewish travelers

## Contact
- WhatsApp: +66 92-989-4495
- Website: wiro4x4indochina.com
- Email: wiro.adventures@gmail.com

## How to Respond
- Give real, useful answers first — then offer to connect them with Mek (owner) for booking
- If asked for specific group pricing / exact dates / custom routes → say you'll connect them to WhatsApp for a personal quote
- Suggest the best tour for their situation (family? adventure? short time?)
- Be concise: bullet points work great
- For booking/payment: "Message us on WhatsApp +66 92-989-4495 for an instant quote"

## Language
${langInstructions[language]}`;
}

// ── Types ────────────────────────────────────────────────────────────────
interface TourSummary {
  name: string;
  duration?: string | null;
  basePrice?: number | null;
  description?: string | null;
}

interface AvailSummary {
  nextAvailable?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function detectLanguage(text: string, hint?: ChatLanguage): ChatLanguage {
  if (hint && ["en", "he", "th"].includes(hint)) return hint;
  const hebrewPattern = /[\u0590-\u05FF]/;
  const thaiPattern = /[\u0E00-\u0E7F]/;
  if (hebrewPattern.test(text)) return "he";
  if (thaiPattern.test(text)) return "th";
  return "en";
}

function isBookingIntent(msg: string): boolean {
  const kw = [
    "book",
    "reserve",
    "available",
    "price",
    "cost",
    "how much",
    "quote",
    "schedule",
    "date",
    "ราคา",
    "จอง",
    "ว่าง",
    "כמה",
    "להזמין",
    "זמין",
    "מחיר",
    "תאריך",
  ];
  const lower = msg.toLowerCase();
  return kw.some(k => lower.includes(k));
}

async function fetchRealTours(): Promise<TourSummary[]> {
  try {
    const { getAllActiveTours } = await import("../db/index.js");
    const tours = await getAllActiveTours();
    return tours.slice(0, 12).map((t: Record<string, unknown>) => ({
      name: String(t.name ?? ""),
      duration: t.duration ? String(t.duration) : null,
      basePrice:
        typeof t.basePrice === "number"
          ? t.basePrice
          : typeof t.price === "number"
            ? t.price
            : null,
      description: t.description ? String(t.description).slice(0, 100) : null,
    }));
  } catch {
    return [];
  }
}

// ── Gemini direct fetch ────────────────────────────────────────────
async function callGemini(model: string, systemPrompt: string, messages: {role:string;content:string}[], maxTokens = 512): Promise<string> {
  const apiKey = process.env.Gemini_API_Key;
  if (!apiKey) throw new Error("Gemini_API_Key missing");
  const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const body = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

// ── OpenRouter Fallback ──────────────────────────────────────────────────
let _openRouterClient: OpenAI | null = null;
function getOpenRouterClient(): OpenAI {
  if (!_openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");
    _openRouterClient = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return _openRouterClient;
}

// ── Route ─────────────────────────────────────────────────────────────────

export function registerEliChatRoute(app: Express) {

  // GET /api/eli/test — Test Gemini API directly
  app.get("/api/eli/test", async (req, res) => {
    try {
      const apiKey = process.env.Gemini_API_Key;
      if (!apiKey) {
        return res.json({ error: "Gemini_API_Key not set", keys: Object.keys(process.env).filter(k => k.includes("KEY")) });
      }
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          max_tokens: 20,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      const data = await r.json();
      return res.json({ ok: r.ok, status: r.status, data });
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      return res.json({ error: err });
    }
  });
  app.post("/api/eli/chat", async (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string) || "unknown";
      const { allowed } = checkRateLimit(`eli-chat:${ip}`, 30, 60_000);
      if (!allowed) {
        return res.status(429).json({ error: "Rate limit exceeded" });
      }

      const body = req.body as EliChatRequest;
      if (!body.message || typeof body.message !== "string") {
        return res.status(400).json({ error: "Message required" });
      }
      if (body.message.length > 2000) {
        return res.status(400).json({ error: "Message too long" });
      }

      const language = detectLanguage(body.message, body.language);
      const history = Array.isArray(body.history)
        ? body.history.slice(-10)
        : [];

      // Fetch live tour data from DB
      const [tours] = await Promise.all([fetchRealTours()]);
      const availability: AvailSummary = {};

      const systemPrompt = buildEliPrompt(language, tours, availability);

      let reply = "";
      try {
        reply = await callGemini(
          "gemini-2.5-flash",
          systemPrompt,
          history.map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })).concat([{ role: "user", content: body.message }])
        );
      } catch (err2) {
        try {
          const orc = getOpenRouterClient();
          const orResponse = await orc.chat.completions.create({
            model: "google/gemma-4-31b-it",
            max_tokens: 512,
            messages: [
              { role: "system" as const, content: systemPrompt },
              ...history.map(m => ({
                role:
                  m.role === "user" ? ("user" as const) : ("assistant" as const),
                content: m.content,
              })),
              { role: "user" as const, content: body.message },
            ],
          });
          reply = orResponse.choices[0]?.message?.content ?? "";
        } catch (err3) {
          console.error("[EliChat] Both Gemini and OpenRouter failed:", err3);
          throw err3;
        }
      }

      // Alert Mek via Telegram if booking intent
      if (isBookingIntent(body.message)) {
        notifyChatMessage({
          userMessage: body.message,
          language,
          sessionId: body.sessionId,
        }).catch(() => {});
      }

      return res.json({
        reply,
        language,
        agent: "eli",
        escalate: isBookingIntent(body.message),
        sessionId: null,
      });
    } catch (err) {
      console.error("[EliChat] Error:", err);
      const fallback: Record<ChatLanguage, string> = {
        en: "I'm having a moment — please WhatsApp us at +66 92-989-4495 for immediate help!",
        he: "משהו השתבש — אנא כתבו לנו בוואטסאפ: +66 92-989-4495",
        th: "ขออภัยครับ กรุณาติดต่อ WhatsApp: +66 92-989-4495",
      };
      const lang = detectLanguage(
        (req.body as EliChatRequest)?.message ?? "",
        (req.body as EliChatRequest)?.language
      );
      return res.json({
        reply: fallback[lang],
        language: lang,
        agent: "eli",
        escalate: true,
        sessionId: null,
      });
    }
  });
}
