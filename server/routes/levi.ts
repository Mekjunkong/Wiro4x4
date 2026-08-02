import { createHmac, randomUUID } from "node:crypto";
import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { WIRO_WHATSAPP_NUMBER } from "../../shared/wiroTourCatalog";
import { notifyOwner } from "../_core/notification";
import {
  checkAvailability,
  extractDateFromMessage,
} from "../availabilityHelper";
import {
  buildBookingState,
  buildBookingStateSummary,
  getConversationBookingText,
  getMissingBookingFields,
  normalizeBookingLanguage,
  shouldSendOwnerAlert,
  type LeviBookingState,
} from "../leviBooking";
import {
  buildAvailabilityPrompt,
  buildLeviSystemPrompt,
  loadLeviTourCatalog,
} from "../leviKnowledge";
import { persistLeviExchange } from "../leviPersistence";
import { checkRateLimitAsync } from "../rateLimit";

export {
  buildBookingState,
  getBookingFields,
  getMissingBookingFields,
  shouldSendOwnerAlert,
} from "../leviBooking";
export { buildLeviSystemPrompt } from "../leviKnowledge";

interface ChatMessage {
  role: "user" | "levi";
  content: string;
}

type ProviderMessage = {
  role: "user" | "assistant";
  content: string;
};

const chatMessageSchema = z.object({
  role: z.enum(["user", "levi"]),
  content: z.string().trim().min(1).max(2000),
});

const leviMessageRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  messages: z.array(chatMessageSchema).max(24).optional(),
  language: z.enum(["en", "he"]).default("en"),
  visitorId: z
    .string()
    .trim()
    .min(6)
    .max(128)
    .regex(/^[A-Za-z0-9._~-]+$/)
    .optional(),
  messageId: z
    .string()
    .trim()
    .min(8)
    .max(128)
    .regex(/^[A-Za-z0-9._~-]+$/)
    .optional(),
});

function normalizeMessages(
  messages: ChatMessage[],
  latestMessage: string
): ProviderMessage[] {
  const normalized = messages.map(msg => ({
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

function defaultSystemPrompt() {
  const bookingState = buildBookingState("", "en");
  return buildLeviSystemPrompt({
    bookingState,
    bookingSummary: buildBookingStateSummary(bookingState, "en"),
    availabilityPrompt: buildAvailabilityPrompt(null, []),
  });
}

export function buildLeviChatRequest(
  messages: ProviderMessage[],
  systemPrompt = defaultSystemPrompt()
) {
  return {
    model: "levi",
    messages: [{ role: "system" as const, content: systemPrompt }, ...messages],
    temperature: 0.2,
    max_tokens: 450,
  };
}

function getLeviTimeoutMs() {
  const configured = Number(process.env.LEVI_CHAT_TIMEOUT_MS);
  if (!Number.isFinite(configured)) return 12_000;
  return Math.min(20_000, Math.max(3_000, configured));
}

export async function requestLeviReply(
  messages: ProviderMessage[],
  systemPrompt = defaultSystemPrompt()
): Promise<string | null> {
  const url = process.env.LEVI_CHAT_URL?.trim();
  const apiKey = process.env.LEVI_API_KEY?.trim();

  if (!url && !apiKey) return null;
  if (!url || !apiKey) {
    throw new Error(
      "LEVI_CHAT_URL and LEVI_API_KEY must be configured together"
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getLeviTimeoutMs());

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildLeviChatRequest(messages, systemPrompt)),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Levi VPS returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    return typeof content === "string" && content.trim()
      ? content.trim().slice(0, 2000)
      : null;
  } finally {
    clearTimeout(timeout);
  }
}

function buildBookingQualificationReply(
  language: string | undefined,
  missing: string[]
): string {
  const nextMissing = missing.slice(0, 2).join(", ");
  if (normalizeBookingLanguage(language) === "he") {
    return `הצ'אט האוטומטי אינו זמין כרגע. כדי שנוכל להכין הצעה מדויקת, שלחו בבקשה: ${nextMissing}. אפשר להמשיך ישירות ב-WhatsApp 📱`;
  }

  return `The automated chat is temporarily unavailable. To prepare an accurate quote, please send: ${nextMissing}. You can continue directly on WhatsApp 📱`;
}

function buildFallbackReply(
  language: string | undefined,
  bookingIntent: boolean
): string {
  if (normalizeBookingLanguage(language) === "he") {
    return bookingIntent
      ? "לא הצלחתי לענות אוטומטית כרגע. אפשר להמשיך ישירות עם צוות WIRO ב-WhatsApp כדי לבדוק מחיר וזמינות 📱"
      : "לא הצלחתי לענות אוטומטית כרגע. אפשר ליצור קשר ישירות עם צוות WIRO ב-WhatsApp 📱";
  }

  return bookingIntent
    ? "I couldn't answer automatically right now. Please continue directly with the WIRO team on WhatsApp to confirm price and availability 📱"
    : "I couldn't answer automatically right now. You can contact the WIRO team directly on WhatsApp 📱";
}

export function buildWhatsAppUrl(
  language: string | undefined,
  message: string,
  missingFields?: string[],
  bookingSummary?: string,
  referenceId?: string
) {
  const lang = normalizeBookingLanguage(language);
  const missing = missingFields ?? getMissingBookingFields(message, language);
  const referenceLine = referenceId
    ? lang === "he"
      ? `\nמספר פנייה: ${referenceId.slice(0, 12)}`
      : `\nInquiry reference: ${referenceId.slice(0, 12)}`
    : "";
  const summaryLine = bookingSummary ? `\n${bookingSummary}` : "";
  const missingLine = missing.length
    ? lang === "he"
      ? `\nפרטים חסרים: ${missing.join(", ")}`
      : `\nMissing details: ${missing.join(", ")}`
    : "";
  const text =
    lang === "he"
      ? `שלום, דיברתי עם לוי באתר WIRO 4x4. אשמח לעזרה עם הזמנה.${referenceLine}${summaryLine}\nההודעה האחרונה שלי: ${message}${missingLine}`
      : `Hi, I chatted with Levi on the WIRO 4x4 website. I would like help booking a tour.${referenceLine}${summaryLine}\nMy latest message: ${message}${missingLine}`;

  return `https://wa.me/${WIRO_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildLeviLeadAlert(args: {
  latestMessage: string;
  bookingContext: string;
  language?: string;
  visitorId?: string;
  messageId?: string;
  reply: string;
  whatsappUrl: string;
  bookingState?: LeviBookingState;
  alertKind?: "new" | "progress" | "qualified";
}) {
  const lang = args.language === "he" ? "🇮🇱 Hebrew" : "🇬🇧 English";
  const state =
    args.bookingState ?? buildBookingState(args.bookingContext, args.language);
  const title =
    args.alertKind === "qualified"
      ? "✅ Qualified WIRO Chat Lead"
      : args.alertKind === "progress"
        ? "📈 WIRO Chat Lead Update"
        : "🔥 New WIRO Chat Lead";

  return [
    title,
    "",
    `🌐 Language: ${lang}`,
    args.visitorId
      ? `🔑 Visitor: ${String(args.visitorId).slice(0, 14)}`
      : null,
    args.messageId
      ? `🧾 Inquiry: ${String(args.messageId).slice(0, 12)}`
      : null,
    `📊 Booking details: ${state.completionPercent}% complete`,
    "",
    "📝 Latest customer message:",
    args.latestMessage,
    "",
    state.missingLabels.length
      ? `📋 Still missing: ${state.missingLabels.join(", ")}`
      : "✅ Minimum booking details collected",
    "",
    "💬 Reply shown to visitor:",
    args.reply.slice(0, 700),
    "",
    "📱 Visitor's prepared WhatsApp handoff:",
    args.whatsappUrl,
    "🖥️ Admin: https://wiro4x4indochina.com/admin",
  ]
    .filter(line => line !== null)
    .join("\n");
}

export function buildLeviWebhookRequest(
  text: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000)
) {
  const body = JSON.stringify({
    event_type: "wiro.chat.message",
    text,
  });
  const timestampHeader = String(timestamp);
  const signature = createHmac("sha256", secret)
    .update(`${timestampHeader}.${body}`)
    .digest("hex");

  return {
    body,
    timestamp: timestampHeader,
    signature,
  };
}

async function sendLeviLeadAlert(
  text: string,
  requestId: string
): Promise<boolean> {
  const url = process.env.LEVI_WEBHOOK_URL?.trim();
  const secret = process.env.LEVI_WEBHOOK_SECRET?.trim();

  if (!url && !secret) return false;
  if (!url || !secret) {
    throw new Error(
      "LEVI_WEBHOOK_URL and LEVI_WEBHOOK_SECRET must be configured together"
    );
  }

  const request = buildLeviWebhookRequest(text, secret);
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4_000);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
          "X-Webhook-Timestamp": request.timestamp,
          "X-Webhook-Signature-V2": request.signature,
        },
        body: request.body,
        signal: controller.signal,
      });

      if (response.ok) return true;
      lastError = new Error(`Levi webhook returned HTTP ${response.status}`);
      if (response.status >= 400 && response.status < 500) break;
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }

    await new Promise(resolve => setTimeout(resolve, 150));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Levi webhook delivery failed");
}

async function deliverOwnerAlert(text: string, requestId: string) {
  try {
    if (await sendLeviLeadAlert(text, requestId))
      return "levi-webhook" as const;
  } catch (error) {
    console.error("[Levi] Signed owner alert failed:", error);
  }

  const sentByBackup = await notifyOwner({
    title: "WIRO Levi chat lead",
    content: text,
  });
  return sentByBackup ? ("owner-backup" as const) : ("failed" as const);
}

function previousBookingState(
  chatHistory: ChatMessage[],
  latestMessage: string,
  language: string
) {
  const previous = [...chatHistory];
  for (let index = previous.length - 1; index >= 0; index -= 1) {
    if (
      previous[index]?.role === "user" &&
      previous[index]?.content.trim() === latestMessage
    ) {
      previous.splice(index, 1);
      break;
    }
  }
  const previousContext = getConversationBookingText(previous, "");
  return previousContext ? buildBookingState(previousContext, language) : null;
}

async function resolveAvailability(bookingContext: string) {
  const date = extractDateFromMessage(bookingContext);
  if (!date) return { date: null, availability: [] };
  const availability = await Promise.race([
    checkAvailability(date),
    new Promise<Awaited<ReturnType<typeof checkAvailability>>>(resolve =>
      setTimeout(() => resolve([]), 1_200)
    ),
  ]);
  return { date, availability };
}

function clientIp(req: Parameters<RequestHandler>[0]) {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0] ||
      (req.headers["x-real-ip"] as string | undefined) ||
      req.ip ||
      "unknown";
  return raw.trim().slice(0, 80);
}

export function registerLeviRoute(app: Express) {
  const handleLeviMessage: RequestHandler = async (req, res) => {
    const startedAt = Date.now();
    const parsed = leviMessageRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid chat request" });
      return;
    }

    const {
      message: latestMessage,
      messages,
      language,
      visitorId,
    } = parsed.data;
    const messageId = parsed.data.messageId ?? randomUUID();
    const requestId = randomUUID();
    res.setHeader("Cache-Control", "no-store");

    const { allowed } = await checkRateLimitAsync(
      `levi:${clientIp(req)}`,
      20,
      60_000
    );
    if (!allowed) {
      res.status(429).json({
        error: "Too many chat messages. Please try again in a minute.",
      });
      return;
    }

    const chatHistory: ChatMessage[] =
      messages && messages.length > 0
        ? messages
        : [{ role: "user", content: latestMessage }];
    const providerMessages = normalizeMessages(chatHistory, latestMessage);
    const bookingContext = getConversationBookingText(
      chatHistory,
      latestMessage
    );
    const bookingState = buildBookingState(bookingContext, language);
    const previousState = previousBookingState(
      chatHistory,
      latestMessage,
      language
    );
    const bookingSummary = buildBookingStateSummary(bookingState, language);
    const [{ date, availability }, tours] = await Promise.all([
      resolveAvailability(bookingContext),
      loadLeviTourCatalog(),
    ]);
    const systemPrompt = buildLeviSystemPrompt({
      bookingState,
      bookingSummary,
      availabilityPrompt: buildAvailabilityPrompt(date, availability),
      tours,
    });
    const whatsappUrl = buildWhatsAppUrl(
      language,
      latestMessage,
      bookingState.missingLabels,
      bookingSummary,
      messageId
    );

    let reply: string | null = null;
    let provider: "levi-vps" | "fallback" = "fallback";

    try {
      reply = await requestLeviReply(providerMessages, systemPrompt);
      if (reply) provider = "levi-vps";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`[Levi] VPS reply request failed: ${errorMessage}`);
    }

    const finalReply =
      reply ??
      (bookingState.intent === "booking" &&
      bookingState.missingLabels.length > 0
        ? buildBookingQualificationReply(language, bookingState.missingLabels)
        : buildFallbackReply(language, bookingState.intent === "booking"));
    const latencyMs = Date.now() - startedAt;
    const alertKind = shouldSendOwnerAlert(bookingState, previousState);
    let alertChannel:
      | "not-needed"
      | "levi-webhook"
      | "owner-backup"
      | "failed" = "not-needed";

    if (alertKind) {
      const alert = buildLeviLeadAlert({
        latestMessage,
        bookingContext,
        language,
        visitorId,
        messageId,
        reply: finalReply,
        whatsappUrl,
        bookingState,
        alertKind,
      });
      alertChannel = await deliverOwnerAlert(alert, messageId);
    }

    if (visitorId) {
      try {
        await Promise.race([
          persistLeviExchange({
            visitorId,
            messageId,
            language,
            customerMessage: latestMessage,
            leviReply: finalReply,
            bookingState,
            provider,
            latencyMs,
          }),
          new Promise(resolve => setTimeout(resolve, 1_200)),
        ]);
      } catch (error) {
        console.error("[Levi] Conversation persistence failed:", error);
      }
    }

    console.info(
      "[LeviMetrics]",
      JSON.stringify({
        requestId,
        provider,
        latencyMs,
        intent: bookingState.intent,
        completionPercent: bookingState.completionPercent,
        qualified: bookingState.qualified,
        alertChannel,
      })
    );

    res.setHeader("Server-Timing", `levi;dur=${latencyMs}`);
    res.json({
      success: true,
      reply: finalReply,
      provider,
      escalate: bookingState.intent === "booking",
      whatsappUrl,
      bookingState: {
        intent: bookingState.intent,
        fields: bookingState.fields,
        missingKeys: bookingState.missingKeys,
        missingLabels: bookingState.missingLabels,
        completionPercent: bookingState.completionPercent,
        qualified: bookingState.qualified,
      },
    });
  };

  app.post("/api/levi/message", handleLeviMessage);
}
