import { and, desc, eq } from "drizzle-orm";
import {
  postTourReviewEvents,
  InsertPostTourReviewEvent,
} from "../../drizzle/schema";
import { getDb } from "./connection";

export type PostTourReviewState =
  | "request_sent"
  | "response_received"
  | "follow_up_sent";

function isDuplicateKeyError(error: unknown): boolean {
  const e = error as { code?: unknown; errno?: unknown; message?: unknown };
  return (
    e?.code === "ER_DUP_ENTRY" ||
    e?.errno === 1062 ||
    (typeof e?.message === "string" && e.message.includes("Duplicate entry"))
  );
}

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const normalized = phone.replace(/[^0-9+]/g, "").trim();
  return normalized.length > 0 ? normalized : null;
}

export function buildPostTourReviewDedupeKey(input: {
  state: PostTourReviewState;
  bookingId?: number | null;
  guestReference: string;
  externalMessageId?: string | null;
}): string {
  const { state, bookingId, guestReference, externalMessageId } = input;
  if (externalMessageId) return `${state}:wa:${externalMessageId}`;
  if (state === "request_sent" && bookingId)
    return `${state}:booking:${bookingId}`;
  return `${state}:guest:${guestReference}`;
}

export function buildGuestReference(input: {
  bookingId?: number | null;
  phone?: string | null;
}): string {
  if (input.bookingId) return `booking:${input.bookingId}`;
  const phone = normalizePhone(input.phone);
  return phone ? `phone:${phone}` : "unknown";
}

export async function createPostTourReviewEvent(
  event: InsertPostTourReviewEvent
): Promise<{ created: boolean; id: number | null }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const [result] = await db
      .insert(postTourReviewEvents)
      .values(event)
      .$returningId();
    return { created: true, id: result?.id ?? null };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { created: false, id: null };
    }
    throw error;
  }
}

export async function getLatestPostTourRequestEventByPhone(phone: string) {
  const db = await getDb();
  if (!db) return null;

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  const rows = await db
    .select()
    .from(postTourReviewEvents)
    .where(
      and(
        eq(postTourReviewEvents.channel, "whatsapp"),
        eq(postTourReviewEvents.state, "request_sent"),
        eq(postTourReviewEvents.guestPhone, normalizedPhone)
      )
    )
    .orderBy(desc(postTourReviewEvents.createdAt))
    .limit(1);

  return rows[0] ?? null;
}
