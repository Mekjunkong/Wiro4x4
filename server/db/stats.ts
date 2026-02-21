import { eq, and, sql, desc, gte } from "drizzle-orm";
import { count } from "drizzle-orm";
import { getDb } from "./connection";
import { bookings, reviews, tours } from "../../drizzle/schema";

export async function getPublicStats() {
  const db = await getDb();
  if (!db) return { totalBookings: 0, totalReviews: 0, totalTours: 0 };

  const [bookingCount] = await db
    .select({ value: count() })
    .from(bookings)
    .where(sql`${bookings.status} IN ('confirmed', 'completed')`);

  const [reviewCount] = await db
    .select({ value: count() })
    .from(reviews)
    .where(and(eq(reviews.isApproved, 1), gte(reviews.rating, 4)));

  const [tourCount] = await db
    .select({ value: count() })
    .from(tours)
    .where(eq(tours.isActive, 1));

  return {
    totalBookings: bookingCount?.value ?? 0,
    totalReviews: reviewCount?.value ?? 0,
    totalTours: tourCount?.value ?? 0,
  };
}

export async function getRecentBookings(limit = 5) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      contactName: bookings.contactName,
      tourName:
        sql<string>`COALESCE(${bookings.suggestedDestinations}, 'Off-Road Adventure')`.as(
          "tourName"
        ),
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(sql`${bookings.status} IN ('confirmed', 'completed')`)
    .orderBy(desc(bookings.createdAt))
    .limit(limit);

  return rows.map(r => ({
    firstName: r.contactName.split(" ")[0],
    tourName: r.tourName,
    createdAt: r.createdAt,
  }));
}
