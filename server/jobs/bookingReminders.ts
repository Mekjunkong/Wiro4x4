/**
 * Automated booking reminder job.
 * Sends pre-tour reminders 48h before arrival for confirmed bookings.
 */

import { getDb, hasScheduledEmailBeenSent, createScheduledEmail } from "../db";
import { bookings } from "../../drizzle/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { sendBookingReminder } from "../customerEmailService";

export async function runBookingReminders() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find confirmed bookings arriving within the next 48 hours
  const upcomingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        gte(bookings.arrivalDate, now),
        lte(bookings.arrivalDate, in48h)
      )
    );

  for (const booking of upcomingBookings) {
    // Skip if reminder already sent
    const alreadySent = await hasScheduledEmailBeenSent("reminder", booking.id);
    if (alreadySent) continue;

    const success = await sendBookingReminder({
      customerName: booking.contactName,
      customerEmail: booking.contactEmail,
      tourDate: booking.arrivalDate?.toISOString() ?? "",
      tourType: "Custom Tour",
      groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
      pickupLocation: booking.pickupPoint,
      pickupTime: "08:00",
      specialRequests: booking.specialRequests ?? undefined,
      bookingId: `WIRO-${booking.id}`,
    });

    await createScheduledEmail({
      type: "reminder",
      targetId: booking.id,
      targetEmail: booking.contactEmail,
      status: success ? "sent" : "failed",
    });

    if (success) {
      console.log(
        `[BookingReminders] Reminder sent for booking #${booking.id} (${booking.contactName})`
      );
    }
  }
}
