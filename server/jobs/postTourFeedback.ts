/**
 * Automated post-tour feedback job.
 * Sends feedback request 24h after tour departure.
 */

import { getDb, hasScheduledEmailBeenSent, createScheduledEmail } from "../db";
import { bookings } from "../../drizzle/schema";
import { and, eq, lte, sql } from "drizzle-orm";
import { sendPostTourFeedback } from "../customerEmailService";

export async function runPostTourFeedback() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Find completed bookings or bookings where departure was more than 24h ago
  const completedBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        sql`${bookings.status} IN ('completed', 'confirmed', 'in_progress')`,
        lte(bookings.departureDate, yesterday)
      )
    );

  for (const booking of completedBookings) {
    // Skip if feedback already sent
    const alreadySent = await hasScheduledEmailBeenSent("feedback", booking.id);
    if (alreadySent) continue;

    const success = await sendPostTourFeedback({
      customerName: booking.contactName,
      customerEmail: booking.contactEmail,
      tourDate: booking.departureDate?.toISOString() ?? "",
      tourType: "Custom Tour",
      groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
      pickupLocation: booking.pickupPoint,
      bookingId: `WIRO-${booking.id}`,
    });

    await createScheduledEmail({
      type: "feedback",
      targetId: booking.id,
      targetEmail: booking.contactEmail,
      status: success ? "sent" : "failed",
    });

    if (success) {
      console.log(
        `[PostTourFeedback] Feedback request sent for booking #${booking.id} (${booking.contactName})`
      );
    }
  }
}
