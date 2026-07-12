import { sql } from "drizzle-orm";
import { getDb } from "./connection";
import { bookings, leads, reviews, tours } from "../../drizzle/schema";

/**
 * Escape special SQL LIKE characters to prevent injection via wildcards.
 */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

export interface GlobalSearchResult {
  bookings: Array<{
    id: number;
    contactName: string;
    contactEmail: string | null;
    status: string;
    createdAt: Date;
  }>;
  leads: Array<{
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    score: number | null;
    createdAt: Date;
  }>;
  reviews: Array<{
    id: number;
    name: string;
    rating: number;
    text: string;
    isApproved: number;
    createdAt: Date;
  }>;
  tours: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    isActive: number;
  }>;
}

/**
 * Run a global search across bookings, leads, reviews, and tours in parallel.
 * Returns max 5 results per category.
 */
export async function globalSearch(query: string): Promise<GlobalSearchResult> {
  const db = await getDb();
  if (!db) {
    return { bookings: [], leads: [], reviews: [], tours: [] };
  }

  const pattern = `%${escapeLike(query)}%`;

  const [bookingResults, leadResults, reviewResults, tourResults] =
    await Promise.all([
      db
        .select({
          id: bookings.id,
          contactName: bookings.contactName,
          contactEmail: bookings.contactEmail,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .where(
          sql`(${bookings.contactName} LIKE ${pattern} OR ${bookings.contactEmail} LIKE ${pattern})`
        )
        .limit(5),

      db
        .select({
          id: leads.id,
          name: leads.name,
          email: leads.email,
          phone: leads.phone,
          status: leads.status,
          score: leads.score,
          createdAt: leads.createdAt,
        })
        .from(leads)
        .where(
          sql`(${leads.name} LIKE ${pattern} OR ${leads.email} LIKE ${pattern} OR ${leads.phone} LIKE ${pattern})`
        )
        .limit(5),

      db
        .select({
          id: reviews.id,
          name: reviews.name,
          rating: reviews.rating,
          text: reviews.text,
          isApproved: reviews.isApproved,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(
          sql`(${reviews.name} LIKE ${pattern} OR ${reviews.text} LIKE ${pattern})`
        )
        .limit(5),

      db
        .select({
          id: tours.id,
          name: tours.name,
          slug: tours.slug,
          price: tours.price,
          isActive: tours.isActive,
        })
        .from(tours)
        .where(
          sql`(${tours.name} LIKE ${pattern} OR ${tours.slug} LIKE ${pattern})`
        )
        .limit(5),
    ]);

  return {
    bookings: bookingResults,
    leads: leadResults,
    reviews: reviewResults,
    tours: tourResults,
  };
}
