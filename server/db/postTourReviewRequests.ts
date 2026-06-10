import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
  bookings,
  postTourReviewRequests,
  InsertPostTourReviewRequest,
} from "../../drizzle/schema";

export async function getPostTourReviewRequestByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq(postTourReviewRequests.bookingId, bookingId))
    .limit(1);

  return result[0] ?? null;
}

export async function createPostTourReviewRequest(
  request: InsertPostTourReviewRequest
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(postTourReviewRequests)
    .values(request)
    .$returningId();
  return result.id;
}

export async function getDuePostTourReviewRequests(limit = 25) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();

  return await db
    .select()
    .from(postTourReviewRequests)
    .where(
      and(
        eq(postTourReviewRequests.status, "scheduled"),
        lte(postTourReviewRequests.scheduledAt, now)
      )
    )
    .orderBy(postTourReviewRequests.scheduledAt)
    .limit(limit);
}

export async function getRecentPostTourReviewRequests(limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(postTourReviewRequests)
    .orderBy(desc(postTourReviewRequests.updatedAt))
    .limit(limit);
}

export async function markPostTourReviewRequestSent(
  requestId: number,
  whatsappMessageId: string,
  reviewUrl: string
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(postTourReviewRequests)
    .set({
      status: "sent",
      sentAt: new Date(),
      whatsappMessageId,
      reviewUrl,
    })
    .where(eq(postTourReviewRequests.id, requestId));
}

export async function markPostTourReviewRequestFailed(requestId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(postTourReviewRequests)
    .set({ status: "failed" })
    .where(eq(postTourReviewRequests.id, requestId));
}

export async function markPostTourReviewOpenedByMessageId(
  whatsappMessageId: string
) {
  const db = await getDb();
  if (!db) return;

  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq(postTourReviewRequests.whatsappMessageId, whatsappMessageId))
    .limit(1);

  const row = rows[0];
  if (!row) return;

  await db
    .update(postTourReviewRequests)
    .set({
      openedAt: row.openedAt ?? new Date(),
      status:
        row.status === "reviewed" || row.status === "clicked"
          ? row.status
          : "opened",
    })
    .where(eq(postTourReviewRequests.id, row.id));
}

export async function markPostTourReviewClicked(requestId: number) {
  const db = await getDb();
  if (!db) return;

  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq(postTourReviewRequests.id, requestId))
    .limit(1);

  const row = rows[0];
  if (!row) return;

  await db
    .update(postTourReviewRequests)
    .set({
      clickedAt: row.clickedAt ?? new Date(),
      status: row.status === "reviewed" ? "reviewed" : "clicked",
    })
    .where(eq(postTourReviewRequests.id, row.id));
}

export async function markPostTourReviewReviewed(input: {
  requestId?: number;
  bookingId?: number;
  rating: number;
  comments?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  let row = null as Awaited<
    ReturnType<typeof getPostTourReviewRequestByBookingId>
  >;

  if (input.requestId) {
    const rows = await db
      .select()
      .from(postTourReviewRequests)
      .where(eq(postTourReviewRequests.id, input.requestId))
      .limit(1);
    row = rows[0] ?? null;
  }

  if (!row && input.bookingId) {
    row = await getPostTourReviewRequestByBookingId(input.bookingId);
  }

  if (!row) return null;

  const isLowRating = input.rating <= 4;
  const followUpUrl = `https://www.wiro4x4indochina.com/admin?tab=reviews&reviewRequestId=${row.id}`;

  await db
    .update(postTourReviewRequests)
    .set({
      status: "reviewed",
      reviewedAt: row.reviewedAt ?? new Date(),
      rating: input.rating,
      comments: input.comments,
      opsFollowUpUrl: isLowRating ? followUpUrl : row.opsFollowUpUrl,
      escalatedAt: isLowRating
        ? (row.escalatedAt ?? new Date())
        : row.escalatedAt,
    })
    .where(eq(postTourReviewRequests.id, row.id));

  return {
    id: row.id,
    bookingId: row.bookingId,
    isLowRating,
    followUpUrl,
  };
}

export async function getWeeklyPostTourReviewMetrics() {
  const db = await getDb();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (!db) {
    return {
      windowStart: weekAgo.toISOString(),
      windowEnd: now.toISOString(),
      volume: 0,
      completedTours: 0,
      reviewed: 0,
      completionRate: 0,
      lowRatingExceptions: 0,
    };
  }

  const baseWhere = and(
    eq(bookings.status, "completed"),
    gte(bookings.departureDate, weekAgo),
    lte(bookings.departureDate, now)
  );

  const [completedRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(baseWhere);

  const joinWhere = and(
    baseWhere,
    eq(postTourReviewRequests.bookingId, bookings.id)
  );

  const [sentRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(postTourReviewRequests)
    .innerJoin(bookings, eq(postTourReviewRequests.bookingId, bookings.id))
    .where(and(joinWhere, sql`${postTourReviewRequests.sentAt} IS NOT NULL`));

  const [reviewedRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(postTourReviewRequests)
    .innerJoin(bookings, eq(postTourReviewRequests.bookingId, bookings.id))
    .where(
      and(joinWhere, sql`${postTourReviewRequests.reviewedAt} IS NOT NULL`)
    );

  const [lowRatingRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(postTourReviewRequests)
    .innerJoin(bookings, eq(postTourReviewRequests.bookingId, bookings.id))
    .where(
      and(
        joinWhere,
        sql`${postTourReviewRequests.reviewedAt} IS NOT NULL`,
        sql`${postTourReviewRequests.rating} <= 4`
      )
    );

  const completedTours = Number(completedRow?.count ?? 0);
  const reviewed = Number(reviewedRow?.count ?? 0);

  return {
    windowStart: weekAgo.toISOString(),
    windowEnd: now.toISOString(),
    volume: Number(sentRow?.count ?? 0),
    completedTours,
    reviewed,
    completionRate:
      completedTours > 0 ? Math.round((reviewed / completedTours) * 100) : 0,
    lowRatingExceptions: Number(lowRatingRow?.count ?? 0),
  };
}
