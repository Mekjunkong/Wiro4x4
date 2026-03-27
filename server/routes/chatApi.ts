import type { Express } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "../rateLimit";

type ChatLanguage = "en" | "he" | "th";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  language: ChatLanguage;
  history: ChatMessage[];
}

interface ChatResponse {
  reply: string;
  language: ChatLanguage;
  escalate: boolean;
}

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

// WIRO 4x4 tour information for context
const WIRO_CONTEXT = `
You are the helpful AI assistant for WIRO 4x4, a kosher off-road tour company based in Chiang Mai, Northern Thailand.

## About WIRO 4x4:
- Specializes in authentic 4x4 off-road adventures in Northern Thailand
- Primary audience: Jewish/Israeli travelers seeking kosher-friendly tours
- All tours can be arranged with kosher meals
- Hebrew-speaking guide (Wiro) available
- Based in Chiang Mai, Thailand

## Available Tours:
1. **Doi Inthanon - Roof of Thailand** - Visit Thailand's highest peak (2,565m), royal pagodas, Karen hill tribe villages, waterfalls. Full day, ฿3,500/person.
2. **Mae Kampong Hidden Village** - Traditional Lanna village, bamboo bridges, coffee plantations, local crafts. Half day to full day, from ฿2,500/person.
3. **Maerim Sticky Waterfalls** - Unique limestone waterfalls you can climb, elephants (ethical sanctuaries), orchid farms. Full day, ฿3,000/person.
4. **Doi Suthep & Pui National Park** - Beyond the temple, through jungle trails, Hmong villages, panoramic views. Half day to full day, from ฿2,000/person.
5. **Mae Wang Jungle Wilderness** - Bamboo rafting, jungle trekking, elephant experience, waterfalls. Full day, ฿3,500/person.
6. **Samoeng Loop Mountain Circuit** - Scenic mountain roads, local markets, hot springs, authentic villages. Full day, ฿3,200/person.

## Multi-Day Packages:
- 2-Day Adventure: ฿7,500/person
- 3-Day Explorer: ฿12,000/person
- 5-Day Ultimate: ฿22,000/person
(Packages include accommodation, some meals, and multiple tours)

## Kosher Information:
- Kosher meals can be arranged for all tours (advance notice required)
- We work with local kosher suppliers and can coordinate with Chabad Chiang Mai
- Shabbat-friendly scheduling available
- Can arrange kosher accommodation recommendations

## Contact:
- WhatsApp: +66 92-989-4495
- Website: www.wiro4x4indochina.com
- Email: wiro.adventures@gmail.com

## Your Role:
1. Answer questions about tours, availability, and experiences in the user's preferred language
2. Be warm, helpful, and knowledgeable about Northern Thailand
3. When users ask about SPECIFIC PRICING beyond what's listed, or want to BOOK a tour, or need to discuss custom arrangements → politely direct them to WhatsApp for personalized assistance
4. Detect the conversation language and respond accordingly (English, Hebrew, or Thai)
5. Keep responses concise but informative (2-4 paragraphs max)
6. Use emojis sparingly for a friendly tone

## IMPORTANT ESCALATION RULES:
When the user:
- Asks for a specific quote or final price for their group
- Wants to book or reserve a tour
- Asks about availability for specific dates
- Requests custom tour arrangements
- Mentions payment or deposits

→ Provide helpful context but ALWAYS include: "For booking and personalized pricing, please contact us on WhatsApp: +66 92-989-4495" and the response should indicate escalation.
`;

const LANGUAGE_INSTRUCTIONS: Record<ChatLanguage, string> = {
  en: "Respond in English. Be friendly and professional.",
  he: "Respond in Hebrew (עברית). Use natural Hebrew, not machine-translated. Israeli travelers appreciate a warm, direct communication style.",
  th: "Respond in Thai (ภาษาไทย). Use polite Thai with appropriate particles (ครับ/ค่ะ). Be helpful and respectful.",
};

function buildSystemPrompt(language: ChatLanguage): string {
  return `${WIRO_CONTEXT}

## Language Instruction:
${LANGUAGE_INSTRUCTIONS[language]}

Remember: Be helpful but guide booking/pricing inquiries to WhatsApp for personal attention.`;
}

function shouldEscalate(content: string, userMessage: string): boolean {
  const escalationKeywords = [
    // Booking intent
    "book",
    "reserve",
    "reservation",
    "להזמין",
    "הזמנה",
    "จอง",
    "สำรอง",
    // Pricing/payment
    "how much",
    "price for",
    "cost for",
    "quote",
    "deposit",
    "payment",
    "כמה עולה",
    "מחיר",
    "תשלום",
    "ราคา",
    "จ่าย",
    // Availability
    "available on",
    "availability",
    "next week",
    "this month",
    "פנוי",
    "תאריך",
    "ว่าง",
    "วันที่",
    // Custom requests
    "customize",
    "custom tour",
    "special request",
    "בהתאמה",
    "พิเศษ",
  ];

  const combined = (content + " " + userMessage).toLowerCase();
  return escalationKeywords.some(keyword =>
    combined.includes(keyword.toLowerCase())
  );
}

function detectLanguage(
  message: string,
  declaredLanguage: ChatLanguage
): ChatLanguage {
  // Check for Hebrew characters
  if (/[\u0590-\u05FF]/.test(message)) return "he";
  // Check for Thai characters
  if (/[\u0E00-\u0E7F]/.test(message)) return "th";
  // Default to declared or English
  return declaredLanguage;
}

function isValidLanguage(lang: unknown): lang is ChatLanguage {
  return lang === "en" || lang === "he" || lang === "th";
}

function isValidHistory(history: unknown): history is ChatMessage[] {
  if (!Array.isArray(history)) return false;
  return history.every(
    msg =>
      typeof msg === "object" &&
      msg !== null &&
      (msg.role === "user" || msg.role === "assistant") &&
      typeof msg.content === "string"
  );
}

export function registerChatApiRoute(app: Express) {
  app.post("/api/chat", async (req, res) => {
    try {
      const body = req.body as ChatRequest;

      // Validate input
      if (!body.message || typeof body.message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      if (body.message.length > 2000) {
        return res
          .status(400)
          .json({ error: "Message too long (max 2000 characters)" });
      }

      const language = isValidLanguage(body.language) ? body.language : "en";
      const history = isValidHistory(body.history) ? body.history : [];

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

      // Detect actual language from message content
      const detectedLanguage = detectLanguage(body.message, language);

      try {
        const client = getClient();

        // Build conversation history for context (last 10 messages)
        const conversationMessages: Anthropic.MessageParam[] = history
          .slice(-10)
          .map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

        // Add current user message
        conversationMessages.push({
          role: "user",
          content: body.message,
        });

        const response = await client.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1024,
          system: buildSystemPrompt(detectedLanguage),
          messages: conversationMessages,
        });

        const replyText =
          response.content[0]?.type === "text" ? response.content[0].text : "";

        // Determine if escalation is needed
        const escalate = shouldEscalate(replyText, body.message);

        const chatResponse: ChatResponse = {
          reply: replyText,
          language: detectedLanguage,
          escalate,
        };

        return res.json(chatResponse);
      } catch (apiError) {
        console.error("[Chat] API error:", apiError);

        // Fallback response if API fails
        const fallbackMessages: Record<ChatLanguage, string> = {
          en: "I apologize, but I'm having trouble right now. Please contact us directly on WhatsApp at +66 92-989-4495 for immediate assistance!",
          he: "מצטער, יש לי בעיה כרגע. אנא צרו קשר ישירות בוואטסאפ: +66 92-989-4495 לקבלת עזרה מיידית!",
          th: "ขออภัยครับ ตอนนี้มีปัญหาทางเทคนิค กรุณาติดต่อเราโดยตรงทาง WhatsApp: +66 92-989-4495 เพื่อรับความช่วยเหลือทันที!",
        };

        const chatResponse: ChatResponse = {
          reply: fallbackMessages[detectedLanguage],
          language: detectedLanguage,
          escalate: true,
        };

        return res.json(chatResponse);
      }
    } catch (error) {
      console.error("[Chat] Route error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
