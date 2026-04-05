/**
 * WhatsApp Business Cloud API integration.
 *
 * Lazy init pattern: gracefully does nothing when WHATSAPP_API_TOKEN
 * or WHATSAPP_PHONE_NUMBER_ID env vars are not set.
 *
 * Uses native fetch (no external packages).
 */

import { createWhatsAppMessage } from "./db";

// ---------------------------------------------------------------------------
// Configuration (lazy)
// ---------------------------------------------------------------------------

function getConfig() {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "";
  return { token, phoneNumberId, verifyToken };
}

export function isWhatsAppConfigured(): boolean {
  const { token, phoneNumberId } = getConfig();
  return !!(token && phoneNumberId);
}

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------

const HEBREW_REGEX = /[\u0590-\u05FF]/;

function detectLanguage(text: string): "he" | "en" {
  return HEBREW_REGEX.test(text) ? "he" : "en";
}

// ---------------------------------------------------------------------------
// Send message via WhatsApp Cloud API
// ---------------------------------------------------------------------------

const WHATSAPP_API_BASE = "https://graph.facebook.com/v19.0";

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<string | null> {
  const { token, phoneNumberId } = getConfig();
  if (!token || !phoneNumberId) {
    console.warn("[WhatsApp] API not configured — skipping sendMessage");
    return null;
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[WhatsApp] Send failed:", response.status, errBody);
      return null;
    }

    const data = (await response.json()) as {
      messages?: { id: string }[];
    };
    return data.messages?.[0]?.id ?? null;
  } catch (err) {
    console.error("[WhatsApp] Send error:", err);
    return null;
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  params: string[]
): Promise<string | null> {
  const { token, phoneNumberId } = getConfig();
  if (!token || !phoneNumberId) {
    console.warn("[WhatsApp] API not configured — skipping sendTemplate");
    return null;
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components:
              params.length > 0
                ? [
                    {
                      type: "body",
                      parameters: params.map(p => ({
                        type: "text",
                        text: p,
                      })),
                    },
                  ]
                : undefined,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(
        "[WhatsApp] Template send failed:",
        response.status,
        errBody
      );
      return null;
    }

    const data = (await response.json()) as {
      messages?: { id: string }[];
    };
    return data.messages?.[0]?.id ?? null;
  } catch (err) {
    console.error("[WhatsApp] Template send error:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Auto-reply keyword matching (bilingual EN/HE)
// ---------------------------------------------------------------------------

const SITE_URL = "https://www.wiro4x4indochina.com";

interface AutoReplyRule {
  keywords: string[];
  replyEn: string;
  replyHe: string;
}

const AUTO_REPLY_RULES: AutoReplyRule[] = [
  {
    keywords: [
      "price",
      "pricing",
      "cost",
      "how much",
      "מחיר",
      "עלות",
      "כמה עולה",
    ],
    replyEn: `Our tour prices start from 3,500 THB per person. Check our full pricing and trip cost estimator here:\n${SITE_URL}/pricing\n${SITE_URL}/estimate`,
    replyHe: `מחירי הטיולים שלנו מתחילים מ-3,500 בט לאדם. בדקו את המחירון המלא ומחשבון העלויות כאן:\n${SITE_URL}/pricing\n${SITE_URL}/estimate`,
  },
  {
    keywords: [
      "book",
      "booking",
      "reserve",
      "reservation",
      "הזמנה",
      "להזמין",
      "הזמן",
    ],
    replyEn: `Ready to book your adventure? Fill out our booking form here:\n${SITE_URL}/booking\n\nOr tell us your preferred dates and group size and we'll prepare a custom quote!`,
    replyHe: `מוכנים להזמין את ההרפתקה שלכם? מלאו את טופס ההזמנה כאן:\n${SITE_URL}/booking\n\nאו ספרו לנו על התאריכים המועדפים וגודל הקבוצה ונכין לכם הצעת מחיר מותאמת!`,
  },
  {
    keywords: ["kosher", "כשר", "כשרות", "kosher food", "kosher meal"],
    replyEn: `All our tours offer kosher meal options! We work with certified kosher restaurants and can arrange Shabbat-friendly accommodations.\n\nLearn more: ${SITE_URL}/kosher-tours`,
    replyHe: `כל הטיולים שלנו מציעים אפשרויות אוכל כשר! אנחנו עובדים עם מסעדות כשרות מוסמכות ויכולים לארגן לינה ידידותית לשבת.\n\nמידע נוסף: ${SITE_URL}/kosher-tours`,
  },
  {
    keywords: [
      "tour",
      "tours",
      "trip",
      "trips",
      "excursion",
      "טיול",
      "טיולים",
      "סיור",
    ],
    replyEn: `We offer 6 amazing off-road tours in Chiang Mai:\n\n• Doi Inthanon — Roof of Thailand\n• Mae Kampong — Hidden Village\n• Sticky Waterfalls — Maerim\n• Doi Suthep & Pui — Beyond the Temple\n• Mae Wang — Jungle Wilderness\n• Samoeng Loop — Mountain Circuit\n\nExplore all tours: ${SITE_URL}/#tours`,
    replyHe: `אנחנו מציעים 6 טיולי שטח מדהימים בצ'יאנג מאי:\n\n• דוי אינתנון — גג תאילנד\n• מאי קמפונג — כפר נסתר\n• מפלי סטיקי — מאירים\n• דוי סותפ ופוי — מעבר למקדש\n• מאי וואנג — ג'ונגל פראי\n• לולאת סמואנג — מסלול הרים\n\nגלו את כל הטיולים: ${SITE_URL}/#tours`,
  },
  {
    keywords: [
      "help",
      "menu",
      "options",
      "info",
      "information",
      "עזרה",
      "תפריט",
      "מידע",
    ],
    replyEn: `Welcome to WIRO 4x4! How can we help?\n\nReply with:\n• "tours" — See our tour options\n• "price" — Get pricing info\n• "book" — Start booking\n• "kosher" — Kosher tour info\n\nOr visit our website: ${SITE_URL}`,
    replyHe: `ברוכים הבאים ל-WIRO 4x4! איך נוכל לעזור?\n\nהשיבו עם:\n• "טיולים" — ראו את אפשרויות הטיול\n• "מחיר" — מידע על מחירים\n• "הזמנה" — התחילו להזמין\n• "כשר" — מידע על כשרות\n\nאו בקרו באתר שלנו: ${SITE_URL}`,
  },
];

const DEFAULT_REPLY_EN = `Thanks for reaching out to WIRO 4x4! 🚗\n\nA team member will reply shortly. Meanwhile, check out our website for tour info and booking:\n${SITE_URL}\n\nReply "help" to see available options.`;
const DEFAULT_REPLY_HE = `תודה שפניתם ל-WIRO 4x4! 🚗\n\nאחד מאנשי הצוות שלנו יענה בקרוב. בינתיים, בקרו באתר שלנו למידע על טיולים והזמנות:\n${SITE_URL}\n\nהשיבו "עזרה" לראות אפשרויות זמינות.`;

function getAutoReply(messageText: string): {
  reply: string;
  isAutoReply: boolean;
} {
  const normalizedText = messageText.toLowerCase().trim();
  const lang = detectLanguage(messageText);

  for (const rule of AUTO_REPLY_RULES) {
    for (const keyword of rule.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        return {
          reply: lang === "he" ? rule.replyHe : rule.replyEn,
          isAutoReply: true,
        };
      }
    }
  }

  return {
    reply: lang === "he" ? DEFAULT_REPLY_HE : DEFAULT_REPLY_EN,
    isAutoReply: true,
  };
}

// ---------------------------------------------------------------------------
// Incoming message handler
// ---------------------------------------------------------------------------

export interface IncomingWhatsAppMessage {
  from: string;
  name?: string;
  text: string;
  messageId?: string;
}

export async function handleIncomingMessage(
  message: IncomingWhatsAppMessage
): Promise<void> {
  const { from, name, text, messageId } = message;

  // 1. Log incoming message
  try {
    await createWhatsAppMessage({
      direction: "incoming",
      phoneNumber: from,
      customerName: name ?? null,
      messageText: text,
      messageType: "text",
      isAutoReply: 0,
      status: "delivered",
      whatsappMessageId: messageId ?? null,
    });
  } catch (err) {
    console.error("[WhatsApp] Failed to log incoming message:", err);
  }

  // 2. Check auto-reply setting (defaults to enabled)
  const { getSetting } = await import("./db");
  const autoReplyEnabled = await getSetting("whatsapp_auto_reply_enabled");
  if (
    autoReplyEnabled === false ||
    autoReplyEnabled === "false" ||
    autoReplyEnabled === 0
  ) {
    return;
  }

  // 3. Generate and send auto-reply (keyword-based fallback)
  const { reply, isAutoReply } = getAutoReply(text);
  const sentMessageId = await sendWhatsAppMessage(from, reply);

  // 4. Log outgoing auto-reply
  try {
    await createWhatsAppMessage({
      direction: "outgoing",
      phoneNumber: from,
      customerName: name ?? null,
      messageText: reply,
      messageType: "auto-reply",
      isAutoReply: isAutoReply ? 1 : 0,
      status: sentMessageId ? "sent" : "failed",
      whatsappMessageId: sentMessageId ?? null,
    });
  } catch (err) {
    console.error("[WhatsApp] Failed to log outgoing auto-reply:", err);
  }

  // 5. Draft a smarter reply via LLM and notify Eli (non-blocking)
  draftAndNotifyEli(from, name, text).catch(err => {
    console.error("[WhatsApp] Eli draft/notify failed:", err);
  });
}

// ── Language detection ───────────────────────────────────────────────────────

type WsLang = "he" | "en" | "th";

function detectWsLanguage(text: string): WsLang {
  if (HEBREW_REGEX.test(text)) return "he";
  if (/[\u0E00-\u0E7F]/.test(text)) return "th";
  return "en";
}

// ── LLM Draft + Eli Notify ───────────────────────────────────────────────────

async function draftAndNotifyEli(
  phoneNumber: string,
  name: string | undefined,
  message: string
): Promise<void> {
  const lang = detectWsLanguage(message);

  const SYSTEM_PROMPT = `You are a helpful assistant for WIRO 4x4, a kosher off-road tour company in Chiang Mai, Thailand.

Tour prices:
- Doi Inthanon: ฿3,500/person
- Doi Suthep: ฿2,000/person
- Mae Wang: ฿3,500/person
- Multi-day packages from ฿7,500

Reply in the SAME LANGUAGE as the customer. Keep the reply short (1-2 sentences), warm, and helpful. If the customer wants to book or asks about specific pricing/availability, politely invite them to WhatsApp: +66 92-989-4495.`;

  let draft =
    "Hi! Thanks for reaching out. A team member will get back to you soon.";

  try {
    const { invokeLLM } = await import("./_core/llm");
    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      maxTokens: 200,
    });
    const raw = result.choices[0]?.message?.content;
    const text =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? ((
              raw.find(p => p.type === "text") as
                | { type: "text"; text: string }
                | undefined
            )?.text ?? "")
          : "";
    if (text.trim().length > 0) {
      draft = text.trim();
    }
  } catch (err) {
    console.warn("[WhatsApp] LLM draft failed, using fallback:", err);
  }

  try {
    const { notifyWhatsAppMessage } = await import("./eliNotify");
    await notifyWhatsAppMessage({
      phoneNumber,
      name,
      language: lang,
      message,
      draftReply: draft,
    });
  } catch (err) {
    console.error("[WhatsApp] notifyWhatsAppMessage failed:", err);
  }
}

// ---------------------------------------------------------------------------
// Manual send (for admin UI)
// ---------------------------------------------------------------------------

export async function sendManualMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId: string | null }> {
  const sentMessageId = await sendWhatsAppMessage(to, text);

  try {
    await createWhatsAppMessage({
      direction: "outgoing",
      phoneNumber: to,
      customerName: null,
      messageText: text,
      messageType: "text",
      isAutoReply: 0,
      status: sentMessageId ? "sent" : "failed",
      whatsappMessageId: sentMessageId ?? null,
    });
  } catch (err) {
    console.error("[WhatsApp] Failed to log manual message:", err);
  }

  return { success: !!sentMessageId, messageId: sentMessageId };
}

// ---------------------------------------------------------------------------
// Webhook verification token
// ---------------------------------------------------------------------------

export function getVerifyToken(): string {
  return getConfig().verifyToken;
}
