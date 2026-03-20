import { eq, and, sql, inArray, lte } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { bookings, tripPhotoAlbums, InsertBooking } from "../../drizzle/schema";

// ─── CRUD ─────────────────────────────────────────────────

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBooking(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(bookings).set(data).where(eq(bookings.id, id));
}

export async function deleteBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(bookings).where(eq(bookings.id, id));
}

// ─── Paginated ────────────────────────────────────────────

export async function getAllBookingsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

// ─── Bulk Operations ──────────────────────────────────────

export async function bulkDeleteBookings(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(bookings).where(inArray(bookings.id, ids));
}

// ─── Reminder / Feedback ──────────────────────────────────

export async function getBookingsNeedingReminder() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        sql`${bookings.reminderSentAt} IS NULL`,
        sql`${bookings.arrivalDate} >= ${in24h}`,
        sql`${bookings.arrivalDate} <= ${in48h}`
      )
    );
}

export async function getBookingsNeedingFeedback() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  return await db
    .select()
    .from(bookings)
    .where(
      and(
        sql`${bookings.feedbackSentAt} IS NULL`,
        sql`${bookings.departureDate} <= ${oneDayAgo}`,
        sql`${bookings.departureDate} >= ${twoDaysAgo}`,
        sql`${bookings.status} IN ('completed', 'confirmed', 'in_progress')`
      )
    );
}

export async function markReminderSent(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(bookings)
    .set({ reminderSentAt: new Date() } as any)
    .where(eq(bookings.id, bookingId));
}

export async function markFeedbackSent(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(bookings)
    .set({ feedbackSentAt: new Date() } as any)
    .where(eq(bookings.id, bookingId));
}

// ─── Summary / Count Queries ─────────────────────────────

export async function getPendingBookingCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(eq(bookings.status, "pending"));
  return Number(result[0]?.count ?? 0);
}

export async function getUpcomingTourCount(withinHours = 48): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinHours * 60 * 60 * 1000);
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(
        sql`${bookings.arrivalDate} >= ${now}`,
        sql`${bookings.arrivalDate} <= ${cutoff}`,
        sql`${bookings.status} IN ('confirmed', 'in_progress')`
      )
    );
  return Number(result[0]?.count ?? 0);
}

// ─── Agent-related booking queries ────────────────────────

export async function getBookingsByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.assignedAgentId, agentId))
    .orderBy(desc(bookings.createdAt));
}

export async function getAgentBookingsInDateRange(
  agentId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.assignedAgentId, agentId),
        sql`${bookings.status} IN ('confirmed', 'in_progress')`,
        sql`${bookings.arrivalDate} <= ${endDate}`,
        sql`${bookings.departureDate} >= ${startDate}`
      )
    );
}

// ─── Post-Tour Follow-up Emails ──────────────────────────

/**
 * Find bookings eligible for post-tour follow-up email:
 * - status = 'completed'
 * - departureDate was 2+ days ago
 * - postTourEmailSentAt IS NULL
 * - contactEmail is not null/empty
 */
export async function getEligiblePostTourBookings(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "completed"),
        lte(bookings.departureDate, twoDaysAgo),
        sql`${bookings.postTourEmailSentAt} IS NULL`,
        sql`${bookings.contactEmail} IS NOT NULL`,
        sql`${bookings.contactEmail} != ''`
      )
    )
    .orderBy(desc(bookings.departureDate))
    .limit(limit);
}

/**
 * Count bookings eligible for post-tour follow-up email.
 */
export async function getEligiblePostTourCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "completed"),
        lte(bookings.departureDate, twoDaysAgo),
        sql`${bookings.postTourEmailSentAt} IS NULL`,
        sql`${bookings.contactEmail} IS NOT NULL`,
        sql`${bookings.contactEmail} != ''`
      )
    );
  return Number(result[0]?.count ?? 0);
}

/**
 * Mark a booking's post-tour email as sent.
 */
export async function markPostTourEmailSent(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(bookings)
    .set({ postTourEmailSentAt: new Date() } as any)
    .where(eq(bookings.id, bookingId));
}

/**
 * Get trip photo album for a booking (first active album).
 */
export async function getAlbumByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tripPhotoAlbums)
    .where(
      and(
        eq(tripPhotoAlbums.bookingId, bookingId),
        eq(tripPhotoAlbums.isActive, 1)
      )
    )
    .limit(1);
  return results[0] ?? null;
}
