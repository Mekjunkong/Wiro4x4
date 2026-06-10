/**
 * Post-tour WhatsApp review workflow backed by DB tables.
 *
 * Funnel states:
 * scheduled -> sent -> opened -> clicked -> reviewed
 */

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { postTourReviewRequests } from "../drizzle/schema";
import {
  buildGuestReference,
  buildPostTourReviewDedupeKey,
  createPostTourReviewEvent,
  getBookingById,
  getDb,
  getSetting,
  getWeeklyPostTourReviewMetrics,
  upsertSetting,
} from "./db";
import {
  createPostTourReviewRequest,
  getDuePostTourReviewRequests,
  getPostTourReviewRequestByBookingId,
  getRecentPostTourReviewRequests,
  markPostTourReviewClicked,
  markPostTourReviewOpenedByMessageId,
  markPostTourReviewRequestFailed,
  markPostTourReviewRequestSent,
  markPostTourReviewReviewed,
} from "./db/postTourReviewRequests";
import { createWhatsAppMessage } from "./db/whatsapp";
import { notifyLowRatingReviewEscalation } from "./eliNotify";
import { isWhatsAppConfigured, sendWhatsAppMessage } from "./whatsappService";

const HEBREW_REGEX = /[\u0590-\u05FF]/;

const REVIEW_DELAY_SETTING_KEY = "post_tour_review_delay_minutes";
const MIN_DELAY_MINUTES = 30;
const MAX_DELAY_MINUTES = 60;
const DEFAULT_DELAY_MINUTES = 45;

type ReviewLanguage = "en" | "he";

export type PostTourReviewEntry = {
  id: number;
  bookingId: number;
  customerName: string | null;
  contactWhatsApp: string;
  contactEmail: string | null;
  language: ReviewLanguage;
  scheduledAt: string;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  reviewedAt: string | null;
  rating: number | null;
  comments: string | null;
  escalatedAt: string | null;
  opsFollowUpUrl: string | null;
  followUpPath: string | null;
  whatsappMessageId: string | null;
  reviewToken: string;
  source: "whatsapp" | "fallback_log";
  createdAt: string;
  updatedAt: string;
};

function toEntry(
  row: typeof postTourReviewRequests.$inferSelect
): PostTourReviewEntry {
  return {
    id: row.id,
    bookingId: row.bookingId,
    customerName: row.customerName,
    contactWhatsApp: row.phoneNumber,
    contactEmail: null,
    language: row.language,
    scheduledAt: row.scheduledAt.toISOString(),
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
    openedAt: row.openedAt ? row.openedAt.toISOString() : null,
    clickedAt: row.clickedAt ? row.clickedAt.toISOString() : null,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    rating: row.rating ?? null,
    comments: row.comments ?? null,
    escalatedAt: row.escalatedAt ? row.escalatedAt.toISOString() : null,
    opsFollowUpUrl: row.opsFollowUpUrl ?? null,
    followUpPath: row.opsFollowUpUrl ?? null,
    whatsappMessageId: row.whatsappMessageId ?? null,
    reviewToken: String(row.id),
    source: row.sentAt ? "whatsapp" : "fallback_log",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function clampDelayMinutes(delay: number): number {
  return Math.max(MIN_DELAY_MINUTES, Math.min(MAX_DELAY_MINUTES, delay));
}

function normalizeWhatsApp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length > 0 ? digits : null;
}

function detectLanguage(text: string | null | undefined): ReviewLanguage {
  return text && HEBREW_REGEX.test(text) ? "he" : "en";
}

function buildReviewMessage(entry: PostTourReviewEntry): string {
  const reviewUrl = `https://www.wiro4x4indochina.com/reviews?reviewRequestId=${entry.id}&bookingId=${entry.bookingId}&src=whatsapp_post_tour`;

  const hebrew = [
    `שלום ${entry.customerName ?? "חברים"}, תודה שטיילתם איתנו ב-WIRO 4x4!`,
    `נשמח לדירוג קצר (דקה): ${reviewUrl}`,
    `אם משהו היה פחות ממושלם, השיבו כאן ונחזור אליכם אישית.`,
  ].join("\n");

  const english = [
    `Hi ${entry.customerName ?? "there"}, thanks for touring with WIRO 4x4!`,
    `We'd love your quick 1-minute review: ${reviewUrl}`,
    `If anything was less than perfect, reply here and we'll follow up personally.`,
  ].join("\n");

  return entry.language === "he"
    ? `${hebrew}\n\nEnglish:\n${english}`
    : english;
}

function parseReviewReply(text: string): {
  rating: number | null;
  comments: string | null;
} {
  const trimmed = text.trim();
  if (!trimmed) return { rating: null, comments: null };

  const stars = (trimmed.match(/⭐/g) ?? []).length;
  if (stars >= 1 && stars <= 5) {
    const comments = trimmed.replace(/⭐+/g, "").trim();
    return { rating: stars, comments: comments || null };
  }

  const ratingMatch = trimmed.match(/\b([1-5])(?:\s*\/\s*5)?\b/);
  if (!ratingMatch) return { rating: null, comments: null };

  const rating = Number(ratingMatch[1]);
  const comments = trimmed
    .replace(ratingMatch[0], "")
    .replace(/^[-:,.\s]+/, "")
    .trim();

  return { rating, comments: comments || null };
}

export async function getConfiguredPostTourReviewDelayMinutes(): Promise<number> {
  const raw = await getSetting(REVIEW_DELAY_SETTING_KEY);
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) return DEFAULT_DELAY_MINUTES;
  return clampDelayMinutes(Math.round(value));
}

export async function updatePostTourReviewDelayMinutes(
  delayMinutes: number
): Promise<number> {
  const clamped = clampDelayMinutes(Math.round(delayMinutes));
  await upsertSetting(REVIEW_DELAY_SETTING_KEY, clamped);
  return clamped;
}

export async function schedulePostTourReviewRequest(params: {
  bookingId: number;
  customerName: string;
  contactWhatsApp?: string | null;
  contactEmail?: string | null;
  completedAt: Date | string;
  delayMinutes?: number;
}): Promise<PostTourReviewEntry> {
  const existing = await getPostTourReviewRequestByBookingId(params.bookingId);
  if (existing) return toEntry(existing);

  const phone = normalizeWhatsApp(params.contactWhatsApp);
  if (!phone) {
    throw new Error(
      `Booking #${params.bookingId} has no WhatsApp/phone; cannot schedule review`
    );
  }

  const completedAt =
    typeof params.completedAt === "string"
      ? new Date(params.completedAt)
      : params.completedAt;
  const delayMinutes =
    params.delayMinutes !== undefined
      ? clampDelayMinutes(params.delayMinutes)
      : await getConfiguredPostTourReviewDelayMinutes();
  const scheduledAt = new Date(completedAt.getTime() + delayMinutes * 60_000);

  await createPostTourReviewRequest({
    bookingId: params.bookingId,
    phoneNumber: phone,
    customerName: params.customerName,
    language: detectLanguage(params.customerName),
    scheduledAt,
    status: "scheduled",
  });

  const created = await getPostTourReviewRequestByBookingId(params.bookingId);
  if (!created) {
    throw new Error("Post-tour review request scheduling failed");
  }

  return toEntry(created);
}

export async function schedulePostTourReviewForBooking(params: {
  bookingId: number;
  completedAt?: Date;
  delayMinutes?: number;
}): Promise<PostTourReviewEntry> {
  const booking = await getBookingById(params.bookingId);
  if (!booking) {
    throw new Error(`Booking #${params.bookingId} not found`);
  }

  return await schedulePostTourReviewRequest({
    bookingId: booking.id,
    customerName: booking.contactName,
    contactWhatsApp: booking.contactWhatsApp ?? booking.contactPhone,
    contactEmail: booking.contactEmail,
    completedAt: params.completedAt ?? new Date(),
    delayMinutes: params.delayMinutes,
  });
}

export async function processDuePostTourReviewRequests(): Promise<{
  processed: number;
  sent: number;
  pending: number;
}> {
  const due = await getDuePostTourReviewRequests(50);
  let sent = 0;

  for (const row of due) {
    const entry = toEntry(row);
    const message = buildReviewMessage(entry);
    const guestReference = buildGuestReference({
      bookingId: entry.bookingId,
      phone: entry.contactWhatsApp,
    });

    if (!isWhatsAppConfigured()) {
      await markPostTourReviewRequestFailed(entry.id);
      continue;
    }

    const messageId = await sendWhatsAppMessage(entry.contactWhatsApp, message);

    try {
      await createWhatsAppMessage({
        direction: "outgoing",
        phoneNumber: entry.contactWhatsApp,
        customerName: entry.customerName,
        messageText: message,
        messageType: "text",
        isAutoReply: 0,
        status: messageId ? "sent" : "failed",
        whatsappMessageId: messageId,
      });
    } catch (err) {
      console.error("[PostTourReview] Failed to log outgoing WhatsApp:", err);
    }

    if (messageId) {
      const reviewUrl = `https://www.wiro4x4indochina.com/reviews?reviewRequestId=${entry.id}&bookingId=${entry.bookingId}&src=whatsapp_post_tour`;
      await markPostTourReviewRequestSent(entry.id, messageId, reviewUrl);
      sent += 1;

      await createPostTourReviewEvent({
        bookingId: entry.bookingId,
        channel: "whatsapp",
        state: "request_sent",
        guestReference,
        guestPhone: entry.contactWhatsApp,
        guestName: entry.customerName,
        externalMessageId: messageId,
        dedupeKey: buildPostTourReviewDedupeKey({
          state: "request_sent",
          bookingId: entry.bookingId,
          guestReference,
          externalMessageId: messageId,
        }),
        metadata: { reviewUrl },
      });
    } else {
      await markPostTourReviewRequestFailed(entry.id);
    }
  }

  const pending = (await getDuePostTourReviewRequests(1000)).length;

  return {
    processed: due.length,
    sent,
    pending,
  };
}

export const processPendingPostTourReviewRequests =
  processDuePostTourReviewRequests;

export async function recordPostTourReviewOpenedByMessageId(
  whatsappMessageId: string
): Promise<PostTourReviewEntry | null> {
  await markPostTourReviewOpenedByMessageId(whatsappMessageId);

  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq(postTourReviewRequests.whatsappMessageId, whatsappMessageId))
    .limit(1);
  return rows[0] ? toEntry(rows[0]) : null;
}

export async function trackPostTourReviewMessageOpened(
  whatsappMessageId: string
) {
  return await recordPostTourReviewOpenedByMessageId(whatsappMessageId);
}

export async function recordPostTourReviewClickByToken(
  token: string
): Promise<PostTourReviewEntry | null> {
  const id = Number(token);
  if (!Number.isFinite(id) || id <= 0) return null;

  await markPostTourReviewClicked(id);

  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq(postTourReviewRequests.id, id))
    .limit(1);
  return rows[0] ? toEntry(rows[0]) : null;
}

export async function trackPostTourReviewLinkClick(reviewRequestId: number) {
  await markPostTourReviewClicked(reviewRequestId);
}

export async function trackPostTourReviewSubmission(input: {
  reviewRequestId?: number;
  bookingId?: number;
  rating: number;
  text: string;
  reviewerName: string;
}) {
  const result = await markPostTourReviewReviewed({
    requestId: input.reviewRequestId,
    bookingId: input.bookingId,
    rating: input.rating,
    comments: input.text,
  });

  if (!result || !result.isLowRating) return;

  await notifyLowRatingReviewEscalation({
    reviewRequestId: result.id,
    bookingId: result.bookingId,
    reviewerName: input.reviewerName,
    rating: input.rating,
    text: input.text,
    followUpUrl: result.followUpUrl,
  });
}

export async function recordPostTourReviewEvent(input: {
  bookingId: number;
  event: "opened" | "clicked" | "reviewed";
  rating?: number;
  comments?: string;
}): Promise<PostTourReviewEntry | null> {
  const existing = await getPostTourReviewRequestByBookingId(input.bookingId);
  if (!existing) return null;

  if (input.event === "opened") {
    if (!existing.whatsappMessageId) return toEntry(existing);
    return await recordPostTourReviewOpenedByMessageId(
      existing.whatsappMessageId
    );
  }

  if (input.event === "clicked") {
    await markPostTourReviewClicked(existing.id);
    const latest = await getPostTourReviewRequestByBookingId(input.bookingId);
    return latest ? toEntry(latest) : null;
  }

  await trackPostTourReviewSubmission({
    reviewRequestId: existing.id,
    bookingId: input.bookingId,
    rating: input.rating ?? 5,
    text: input.comments ?? "",
    reviewerName: existing.customerName ?? "Guest",
  });

  const latest = await getPostTourReviewRequestByBookingId(input.bookingId);
  return latest ? toEntry(latest) : null;
}

export async function handlePostTourReviewReply(input: {
  from: string;
  text: string;
}): Promise<{
  handled: boolean;
  replyText?: string;
  entry?: PostTourReviewEntry;
}> {
  const phone = normalizeWhatsApp(input.from);
  if (!phone) return { handled: false };

  const parsed = parseReviewReply(input.text);
  if (parsed.rating === null) return { handled: false };

  const db = await getDb();
  if (!db) return { handled: false };

  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(
      and(
        eq(postTourReviewRequests.phoneNumber, phone),
        sql`${postTourReviewRequests.sentAt} IS NOT NULL`
      )
    )
    .orderBy(desc(postTourReviewRequests.updatedAt))
    .limit(1);

  const row = rows[0];
  if (!row) return { handled: false };

  await trackPostTourReviewSubmission({
    reviewRequestId: row.id,
    bookingId: row.bookingId,
    rating: parsed.rating,
    text: parsed.comments ?? "",
    reviewerName: row.customerName ?? "Guest",
  });

  const latest = await getPostTourReviewRequestByBookingId(row.bookingId);
  if (!latest) return { handled: true };

  const replyText =
    detectLanguage(input.text) === "he"
      ? "תודה רבה על המשוב! קיבלנו את הדירוג ונמשיך להשתפר."
      : "Thank you for the feedback. We received your rating and appreciate it.";

  return { handled: true, replyText, entry: toEntry(latest) };
}

export async function getPostTourReviewEntry(
  bookingId: number
): Promise<PostTourReviewEntry | null> {
  const row = await getPostTourReviewRequestByBookingId(bookingId);
  return row ? toEntry(row) : null;
}

export async function getRecentPostTourReviewEntries(
  limit = 20
): Promise<PostTourReviewEntry[]> {
  const rows = await getRecentPostTourReviewRequests(limit);
  return rows.map(toEntry);
}

export async function getWeeklyPostTourReviewMetric(
  referenceDate?: Date
): Promise<{
  weekStart: string;
  weekEnd: string;
  toursCompleted: number;
  requestsSent: number;
  reviewed: number;
  completionRate: number;
  lowRatingCount: number;
  lowRatingExceptions: Array<{
    bookingId: number;
    customerName: string;
    rating: number;
    comments: string | null;
    reviewedAt: string | null;
    followUpPath: string | null;
  }>;
}> {
  const stats = await getWeeklyPostTourReviewMetrics();
  const weekStart = referenceDate
    ? new Date(referenceDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
    : stats.windowStart;
  const weekEnd = referenceDate
    ? new Date(referenceDate).toISOString()
    : stats.windowEnd;

  const db = await getDb();
  let lowRatingExceptions: Array<{
    bookingId: number;
    customerName: string;
    rating: number;
    comments: string | null;
    reviewedAt: string | null;
    followUpPath: string | null;
  }> = [];

  if (db) {
    const rows = await db
      .select()
      .from(postTourReviewRequests)
      .where(
        and(
          sql`${postTourReviewRequests.reviewedAt} IS NOT NULL`,
          sql`${postTourReviewRequests.rating} <= 4`,
          gte(postTourReviewRequests.reviewedAt, new Date(stats.windowStart)),
          lte(postTourReviewRequests.reviewedAt, new Date(stats.windowEnd))
        )
      )
      .orderBy(desc(postTourReviewRequests.reviewedAt));

    lowRatingExceptions = rows.map(row => ({
      bookingId: row.bookingId,
      customerName: row.customerName ?? "Guest",
      rating: row.rating ?? 0,
      comments: row.comments ?? null,
      reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
      followUpPath: row.opsFollowUpUrl ?? null,
    }));
  }

  return {
    weekStart,
    weekEnd,
    toursCompleted: stats.completedTours,
    requestsSent: stats.volume,
    reviewed: stats.reviewed,
    completionRate: stats.completionRate,
    lowRatingCount: stats.lowRatingExceptions,
    lowRatingExceptions,
  };
}
