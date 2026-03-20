import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./connection";
import { tourAvailability } from "../../drizzle/schema";

/**
 * Get availability records for a tour within a date range (typically one month).
 */
export async function getTourAvailabilityByRange(
  tourId: number,
  startDate: string, // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tourAvailability)
    .where(
      and(
        eq(tourAvailability.tourId, tourId),
        gte(tourAvailability.date, startDate),
        lte(tourAvailability.date, endDate)
      )
    )
    .orderBy(tourAvailability.date);
}

/**
 * Upsert a single availability record for a tour+date.
 * If a record exists for the given tourId+date, update it; otherwise insert.
 */
export async function upsertTourAvailability(
  tourId: number,
  date: string,
  data: {
    maxSlots?: number;
    bookedSlots?: number;
    isBlocked?: number;
    notes?: string | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if record exists
  const existing = await db
    .select()
    .from(tourAvailability)
    .where(
      and(eq(tourAvailability.tourId, tourId), eq(tourAvailability.date, date))
    )
    .limit(1);

  if (existing.length > 0) {
    return await db
      .update(tourAvailability)
      .set(data)
      .where(eq(tourAvailability.id, existing[0].id));
  } else {
    return await db.insert(tourAvailability).values({
      tourId,
      date,
      maxSlots: data.maxSlots ?? 10,
      bookedSlots: data.bookedSlots ?? 0,
      isBlocked: data.isBlocked ?? 0,
      notes: data.notes ?? null,
    });
  }
}

/**
 * Bulk update availability for a range of dates (block/unblock).
 */
export async function bulkUpdateTourAvailability(
  tourId: number,
  dates: string[],
  data: { maxSlots?: number; isBlocked?: number; notes?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = [];
  for (const date of dates) {
    const result = await upsertTourAvailability(tourId, date, data);
    results.push(result);
  }
  return results;
}
