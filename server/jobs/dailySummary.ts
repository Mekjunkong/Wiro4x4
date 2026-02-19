/**
 * Daily summary notification job.
 * Sends a morning summary at approximately 8 AM ICT (UTC+7).
 */

import {
  getDb,
  hasScheduledEmailBeenSent,
  createScheduledEmail,
  getAllBookings,
} from "../db";

import { sendDailySummaryNotification } from "../emailService";

// Track the last date we sent a summary to avoid duplicates
let lastSummaryDate = "";

export async function runDailySummary() {
  const db = await getDb();
  if (!db) return;

  // Check if it's approximately 8 AM ICT (UTC+7 → 1 AM UTC)
  const now = new Date();
  const ictHour = (now.getUTCHours() + 7) % 24;

  // Only send between 7:45 AM and 8:15 AM ICT
  if (ictHour !== 8) return;

  // Only send once per day
  const today = now.toISOString().split("T")[0];
  if (lastSummaryDate === today) return;

  // Use targetId = day-of-year to deduplicate in DB
  const dayOfYear =
    Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    ) +
    now.getFullYear() * 1000;

  const alreadySent = await hasScheduledEmailBeenSent(
    "daily_summary",
    dayOfYear
  );
  if (alreadySent) {
    lastSummaryDate = today;
    return;
  }

  // Gather data
  const allBookings = await getAllBookings();
  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(
    b => b.status === "pending"
  ).length;
  const confirmedBookings = allBookings.filter(
    b => b.status === "confirmed"
  ).length;

  // Upcoming arrivals in next 7 days
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingArrivals = allBookings
    .filter(
      b =>
        b.arrivalDate &&
        b.arrivalDate >= now &&
        b.arrivalDate <= in7Days &&
        (b.status === "confirmed" || b.status === "in_progress")
    )
    .map(b => ({ name: b.contactName, date: b.arrivalDate! }));

  const success = await sendDailySummaryNotification(
    totalBookings,
    pendingBookings,
    confirmedBookings,
    upcomingArrivals
  );

  await createScheduledEmail({
    type: "daily_summary",
    targetId: dayOfYear,
    targetEmail: "owner",
    status: success ? "sent" : "failed",
  });

  if (success) {
    lastSummaryDate = today;
    console.log(`[DailySummary] Morning summary sent for ${today}`);
  }
}
