/**
 * Eli Notification Hub
 * Sends real-time Telegram alerts to Mek for key WIRO events
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(text: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("[EliNotify] Telegram credentials are not configured");
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown" }),
    });
  } catch (e) {
    console.error("[EliNotify] Telegram failed:", e);
  }
}

// ── A: New Inquiry / Lead ─────────────────────────────────────────────────
export async function notifyNewLead(lead: {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  interestedTours?: string;
  message?: string;
}) {
  const tours = lead.interestedTours
    ? `\n🗺️ Tour: ${lead.interestedTours}`
    : "";
  const phone = lead.phone ? `\n📱 Phone: ${lead.phone}` : "";
  const msg = lead.message ? `\n💬 "${lead.message.slice(0, 100)}"` : "";
  const src = lead.source ? ` (via ${lead.source})` : "";

  await sendTelegram(
    `🔔 *New Inquiry!*${src}\n\n` +
      `👤 *${lead.name}*\n` +
      `📧 ${lead.email}${phone}${tours}${msg}\n\n` +
      `⚡ Reply now: https://wiro4x4indochina.com/admin`
  );
}

// ── B: Booking Confirmed ──────────────────────────────────────────────────
export async function notifyBookingConfirmed(booking: {
  name: string;
  tourName?: string;
  date?: string;
  pax?: number;
  totalAmount?: number;
}) {
  await sendTelegram(
    `✅ *Booking Confirmed!*\n\n` +
      `👤 ${booking.name}\n` +
      `🗺️ ${booking.tourName ?? "Tour"}\n` +
      `📅 ${booking.date ?? "TBD"}\n` +
      `👥 ${booking.pax ?? "?"} pax\n` +
      (booking.totalAmount
        ? `💰 ฿${booking.totalAmount.toLocaleString()}\n`
        : "") +
      `\n📋 View: https://wiro4x4indochina.com/admin`
  );
}

// ── C: Chat message needs attention ──────────────────────────────────────
export async function notifyChatMessage(msg: {
  userMessage: string;
  language?: string;
  sessionId?: string;
}) {
  // Only alert for messages that seem like booking intent
  const intent = msg.userMessage.toLowerCase();
  const isBooking = [
    "book",
    "price",
    "cost",
    "available",
    "reserve",
    "tour",
    "ราคา",
    "จอง",
    "ว่าง",
    "כמה",
    "להזמין",
    "זמין",
  ].some(k => intent.includes(k));

  if (!isBooking) return;

  await sendTelegram(
    `💬 *Chat — Booking Intent*\n\n` +
      `🌐 Language: ${msg.language ?? "EN"}\n` +
      `💭 "${msg.userMessage.slice(0, 120)}"\n\n` +
      `👀 Live chat: https://wiro4x4indochina.com/admin`
  );
}

// ── D: Review received ────────────────────────────────────────────────────
export async function notifyNewReview(review: {
  author: string;
  rating: number;
  text?: string;
  platform?: string;
}) {
  const stars = "⭐".repeat(Math.min(review.rating, 5));
  await sendTelegram(
    `${stars} *New Review — ${review.platform ?? "Google"}*\n\n` +
      `👤 ${review.author}\n` +
      `${review.text ? `💬 "${review.text.slice(0, 100)}"` : ""}\n\n` +
      `Reply: https://wiro4x4indochina.com/admin`
  );
}

export async function notifyLowRatingReviewEscalation(input: {
  reviewRequestId: number;
  bookingId: number;
  reviewerName: string;
  rating: number;
  text: string;
  followUpUrl: string;
}) {
  await sendTelegram(
    `🚨 *Low Rating Review Escalation*\n\n` +
      `🎫 Booking #${input.bookingId}\n` +
      `🧾 Request #${input.reviewRequestId}\n` +
      `👤 ${input.reviewerName}\n` +
      `⭐ Rating: ${input.rating}/5\n` +
      `💬 "${input.text.slice(0, 220)}"\n\n` +
      `🔗 Follow-up: ${input.followUpUrl}`
  );
}

// ── F: Pre-tour reminder due ───────────────────────────────────────────────
export async function notifyBookingReminder(wa: {
  bookingId: number;
  reminderTime: string;
}) {
  const time = new Date(wa.reminderTime).toLocaleString("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  await sendTelegram(
    `⏰ *Pre-Tour Reminder — Departure in ~24h*\n\n` +
      `🎫 Booking #${wa.bookingId}\n` +
      `🕐 Reminder time: ${time} BKK\n\n` +
      `📋 Action: Confirm vehicle, guide & guest readiness\n` +
      `🔗 https://wiro4x4indochina.com/admin`
  );
}

// ── G: Competitor report ───────────────────────────────────────────────────
export async function notifyUpsellSent(wa: {
  bookingId: number;
  customerName: string;
  customerEmail?: string;
}) {
  const emailLine = wa.customerEmail ? `\n📧 ${wa.customerEmail}` : "";
  await sendTelegram(
    `📧 *Post-Tour Upsell Sent*\n\n` +
      `🎫 Booking #${wa.bookingId}\n` +
      `👤 ${wa.customerName}${emailLine}\n\n` +
      `✅ Upsell email delivered 3 days after completion`
  );
}

// ── G: Competitor report ───────────────────────────────────────────────────
export async function notifyCompetitorReport(report: string) {
  await sendTelegram(`🏁 *Competitor Monitor*\n\n${report.slice(0, 4000)}`);
}

// ── H: WhatsApp incoming message with Eli draft ───────────────────────────
export async function notifyWhatsAppMessage(wa: {
  phoneNumber: string;
  name?: string;
  language: "he" | "en" | "th";
  message: string;
  draftReply: string;
}) {
  const langLabel: Record<string, string> = {
    he: "🇮🇱 Hebrew",
    en: "🇬🇧 English",
    th: "🇹🇭 Thai",
  };
  const displayName = wa.name
    ? `${wa.name} (+${wa.phoneNumber})`
    : `+${wa.phoneNumber}`;

  await sendTelegram(
    `📱 *WhatsApp from* ${displayName}\n` +
      `🌐 Language: ${langLabel[wa.language] ?? wa.language}\n\n` +
      `💬 "${wa.message.slice(0, 200)}"\n\n` +
      `📝 *Draft reply:*\n${wa.draftReply.slice(0, 500)}\n\n` +
      `✅ Send: https://wiro4x4indochina.com/admin/whatsapp`
  );
}

// ── E: Daily brief ────────────────────────────────────────────────────────
export async function sendDailyBrief(stats: {
  pendingLeads: number;
  bookingsThisMonth: number;
  revenue: number;
  weather?: string;
}) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Bangkok",
  });

  await sendTelegram(
    `☀️ *Good morning, Mek!*\n📅 ${today}\n\n` +
      `📋 Pending inquiries: *${stats.pendingLeads}*\n` +
      `🎫 Bookings this month: *${stats.bookingsThisMonth}*\n` +
      `💰 Revenue MTD: *฿${stats.revenue.toLocaleString()}*\n` +
      (stats.weather ? `🌤️ ${stats.weather}\n` : "") +
      `\n${stats.pendingLeads > 0 ? `⚠️ *${stats.pendingLeads} inquiry(s) waiting!*` : "✅ All caught up!"}\n\n` +
      `🖥️ Dashboard: https://monitoring-dashboard-iota.vercel.app`
  );
}
