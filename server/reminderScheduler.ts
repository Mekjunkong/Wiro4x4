/**
 * Automated Booking Reminders & Operations Scheduler
 *
 * Runs every hour to:
 * 1. Send pre-tour reminders (24-48h before arrivalDate) to confirmed bookings
 * 2. Send post-tour feedback requests (~1 day after departureDate)
 * 3. Check for stale leads (new for 48h+) and cold leads (contacted for 5d+)
 * 4. Check inventory maintenance alerts (due within 7 days)
 * 5. Check overdue CRM tasks
 * 6. Generate daily operations summary (once per day at ~7am)
 *
 * Uses reminderSentAt and feedbackSentAt columns on bookings to prevent duplicates.
 */

import {
  getBookingsNeedingReminder,
  getBookingsNeedingFeedback,
  markReminderSent,
  markFeedbackSent,
  getStaleNewLeads,
  getColdContactedLeads,
  getNewLeadCount,
  getPendingBookingCount,
  getUpcomingTourCount,
  getPendingReviewCount,
  getInventoryNeedingMaintenance,
  getOverdueTasks,
} from "./db";
import {
  sendBookingReminder,
  sendPostTourFeedback,
} from "./customerEmailService";
import {
  processDuePostTourReviewRequests,
  processPendingPostTourReviewRequests,
} from "./postTourReviewService";
import { captureException } from "./sentry";

const ONE_HOUR = 60 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

// ─── O1: Lead Follow-up Automation ──────────────────────────

/**
 * Check for leads with status 'new' that have not been updated in 48+ hours.
 * Logs a warning for each stale lead so the team can follow up.
 */
async function checkStaleLeads(): Promise<number> {
  try {
    const staleLeads = await getStaleNewLeads();
    for (const lead of staleLeads) {
      console.warn(
        `[LeadFollowup] Lead ${lead.name} (${lead.email}) has been new for 48h+`
      );
    }
    return staleLeads.length;
  } catch (err) {
    console.error("[LeadFollowup] Failed to check stale leads:", err);
    captureException(err);
    return 0;
  }
}

/**
 * Check for leads with status 'contacted' that have not been updated in 5+ days.
 * These leads are going cold and need immediate attention.
 */
async function checkColdLeads(): Promise<number> {
  try {
    const coldLeads = await getColdContactedLeads();
    for (const lead of coldLeads) {
      console.warn(
        `[LeadFollowup] Cold lead ${lead.name} (${lead.email}) — contacted but no update for 5+ days`
      );
    }
    return coldLeads.length;
  } catch (err) {
    console.error("[LeadFollowup] Failed to check cold leads:", err);
    captureException(err);
    return 0;
  }
}

// ─── O4: Inventory Maintenance Alerts ───────────────────────

/**
 * Check for inventory items with upcoming maintenance (within 7 days).
 * Logs a warning for each item so the team can schedule service.
 */
async function checkMaintenanceAlerts(): Promise<number> {
  try {
    const items = await getInventoryNeedingMaintenance(7);
    for (const item of items) {
      const dateStr = item.nextMaintenanceDate
        ? item.nextMaintenanceDate.toISOString().split("T")[0]
        : "unknown";
      console.warn(
        `[Maintenance] ${item.name} due for maintenance on ${dateStr}`
      );
    }
    return items.length;
  } catch (err) {
    console.error("[Maintenance] Failed to check maintenance alerts:", err);
    captureException(err);
    return 0;
  }
}

// ─── O7: CRM Task Reminders ────────────────────────────────

/**
 * Check for overdue or soon-due CRM tasks (dueDate <= tomorrow, not completed).
 * Logs each overdue task so the team can act on them.
 */
async function checkOverdueTasks(): Promise<number> {
  try {
    const tasks = await getOverdueTasks();
    for (const task of tasks) {
      const dueStr = task.dueDate
        ? task.dueDate.toISOString().split("T")[0]
        : "no date";
      console.warn(
        `[CRM] Overdue task: ${task.type} for customer ${task.customerId}, due ${dueStr}`
      );
    }
    return tasks.length;
  } catch (err) {
    console.error("[CRM] Failed to check overdue tasks:", err);
    captureException(err);
    return 0;
  }
}

// ─── O3: Daily Operations Summary ──────────────────────────

/** Track the last date we ran the daily summary to avoid duplicate runs. */
let _lastDailySummaryDate: string | null = null;

/**
 * Generate a daily operations summary with key metrics.
 * Only runs once per day (checks current date vs last run date).
 */
async function generateDailySummary(): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  if (_lastDailySummaryDate === today) return; // Already ran today

  // Only run around hour 7 (UTC) — check if current hour is 7
  const currentHour = new Date().getUTCHours();
  if (currentHour !== 7 && _lastDailySummaryDate !== null) return;

  try {
    const [pendingBookings, newLeads, upcomingTours, pendingReviews] =
      await Promise.all([
        getPendingBookingCount(),
        getNewLeadCount(24),
        getUpcomingTourCount(48),
        getPendingReviewCount(),
      ]);

    console.log(
      `[DailySummary] Pending bookings: ${pendingBookings}, New leads: ${newLeads}, Upcoming tours: ${upcomingTours}, Pending reviews: ${pendingReviews}`
    );

    _lastDailySummaryDate = today;
  } catch (err) {
    console.error("[DailySummary] Failed to generate summary:", err);
    captureException(err);
  }
}

// ─── Core Reminder Processing ──────────────────────────────

async function processReminders(): Promise<void> {
  let remindersSent = 0;
  let feedbackSent = 0;
  let checked = 0;

  try {
    // Pre-tour reminders
    const needReminder = await getBookingsNeedingReminder();
    checked += needReminder.length;

    for (const booking of needReminder) {
      try {
        const success = await sendBookingReminder({
          customerName: booking.contactName,
          customerEmail: booking.contactEmail ?? "",
          tourDate: booking.arrivalDate?.toISOString() ?? "",
          tourType: "Custom Tour",
          groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
          pickupLocation: booking.pickupPoint,
          pickupTime: "08:00",
          specialRequests: booking.specialRequests ?? undefined,
          bookingId: `WIRO-${booking.id}`,
        });

        if (success) {
          await markReminderSent(booking.id);
          remindersSent++;
        }
      } catch (err) {
        console.error(
          `[Reminder Scheduler] Failed to send reminder for booking #${booking.id}:`,
          err
        );
        captureException(err);
      }
    }

    // Post-tour feedback requests
    const needFeedback = await getBookingsNeedingFeedback();
    checked += needFeedback.length;

    for (const booking of needFeedback) {
      try {
        const success = await sendPostTourFeedback({
          customerName: booking.contactName,
          customerEmail: booking.contactEmail ?? "",
          tourDate: booking.departureDate?.toISOString() ?? "",
          tourType: "Custom Tour",
          groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
          pickupLocation: booking.pickupPoint,
          pickupTime: "08:00",
          specialRequests: booking.specialRequests ?? undefined,
          bookingId: `WIRO-${booking.id}`,
        });

        if (success) {
          await markFeedbackSent(booking.id);
          feedbackSent++;
        }
      } catch (err) {
        console.error(
          `[Reminder Scheduler] Failed to send feedback request for booking #${booking.id}:`,
          err
        );
        captureException(err);
      }
    }
  } catch (err) {
    console.error("[Reminder Scheduler] Error during processing:", err);
    captureException(err);
  }

  console.log(
    `[Reminder Scheduler] Checked ${checked} bookings, sent ${remindersSent} reminders, ${feedbackSent} feedback requests`
  );
}

// ─── Hourly Tick ────────────────────────────────────────────

/**
 * Main hourly tick: runs all scheduled checks.
 */
async function hourlyTick(): Promise<void> {
  // Booking reminders & feedback (existing)
  await processReminders();

  // Post-tour WhatsApp review requests (configured delay, default 45m)
  try {
    const result = await processDuePostTourReviewRequests();
    if (result.sent > 0) {
      console.log(
        `[PostTourReview] Processed ${result.processed}, sent ${result.sent}, pending ${result.pending}`
      );
    }
  } catch (err) {
    console.error(
      "[PostTourReview] Failed to process due review requests:",
      err
    );
    captureException(err);
  }

  // O1: Lead follow-up checks
  const staleCount = await checkStaleLeads();
  const coldCount = await checkColdLeads();
  if (staleCount > 0 || coldCount > 0) {
    console.log(
      `[LeadFollowup] ${staleCount} stale leads, ${coldCount} cold leads found`
    );
  }

  // O4: Inventory maintenance alerts (daily-ish, but safe to run hourly)
  await checkMaintenanceAlerts();

  // O7: CRM task reminders
  await checkOverdueTasks();

  // O3: Daily summary (runs once per day at ~7 UTC)
  await generateDailySummary();
}

// ─── Scheduler Lifecycle ────────────────────────────────────

let _schedulerTimer: ReturnType<typeof setInterval> | null = null;
let _reviewSchedulerTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the reminder scheduler. Runs hourlyTick() every hour.
 * Safe to call multiple times — only one scheduler will run.
 */
export function startReminderScheduler(): void {
  if (_schedulerTimer) return;

  console.log("[Reminder Scheduler] Starting (runs every hour)");

  // Run once on startup (after a short delay to let DB connect)
  setTimeout(() => {
    hourlyTick().catch(err => {
      console.error("[Reminder Scheduler] Initial run failed:", err);
      captureException(err);
    });
  }, 10_000);

  // Then run every hour
  _schedulerTimer = setInterval(() => {
    hourlyTick().catch(err => {
      console.error("[Reminder Scheduler] Scheduled run failed:", err);
      captureException(err);
    });
  }, ONE_HOUR);

  if (_reviewSchedulerTimer) return;
  console.log(
    "[Reminder Scheduler] Starting post-tour WhatsApp review loop (every 15 minutes)"
  );
  _reviewSchedulerTimer = setInterval(() => {
    processPendingPostTourReviewRequests().catch((err: unknown) => {
      console.error("[PostTourReview] Scheduled run failed:", err);
      captureException(err);
    });
  }, FIFTEEN_MINUTES);

  setTimeout(() => {
    processPendingPostTourReviewRequests().catch((err: unknown) => {
      console.error("[PostTourReview] Initial run failed:", err);
      captureException(err);
    });
  }, 15_000);
}

// Export individual check functions for testing
export {
  checkStaleLeads,
  checkColdLeads,
  checkMaintenanceAlerts,
  checkOverdueTasks,
  generateDailySummary,
};
