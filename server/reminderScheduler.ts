/**
 * Automated Booking Reminders Scheduler
 *
 * Runs every hour to:
 * 1. Send pre-tour reminders (24-48h before arrivalDate) to confirmed bookings
 * 2. Send post-tour feedback requests (~1 day after departureDate)
 *
 * Uses reminderSentAt and feedbackSentAt columns on bookings to prevent duplicates.
 */

import {
  getBookingsNeedingReminder,
  getBookingsNeedingFeedback,
  markReminderSent,
  markFeedbackSent,
} from "./db";
import {
  sendBookingReminder,
  sendPostTourFeedback,
} from "./customerEmailService";
import { captureException } from "./sentry";

const ONE_HOUR = 60 * 60 * 1000;

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
          customerEmail: booking.contactEmail,
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
          customerEmail: booking.contactEmail,
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

let _schedulerTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the reminder scheduler. Runs processReminders() every hour.
 * Safe to call multiple times — only one scheduler will run.
 */
export function startReminderScheduler(): void {
  if (_schedulerTimer) return;

  console.log("[Reminder Scheduler] Starting (runs every hour)");

  // Run once on startup (after a short delay to let DB connect)
  setTimeout(() => {
    processReminders().catch(err => {
      console.error("[Reminder Scheduler] Initial run failed:", err);
      captureException(err);
    });
  }, 10_000);

  // Then run every hour
  _schedulerTimer = setInterval(() => {
    processReminders().catch(err => {
      console.error("[Reminder Scheduler] Scheduled run failed:", err);
      captureException(err);
    });
  }, ONE_HOUR);
}
