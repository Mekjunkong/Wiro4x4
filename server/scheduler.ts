/**
 * Simple setInterval-based scheduler for automated jobs.
 * Manus platform doesn't support cron, so we use intervals.
 */

import { runBookingReminders } from "./jobs/bookingReminders";
import { runPostTourFeedback } from "./jobs/postTourFeedback";
import { runDailySummary } from "./jobs/dailySummary";
import { runLeadAlerts } from "./jobs/leadAlerts";
import { recalculateAllLeadScores } from "./leadScoring";

const ONE_HOUR = 60 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;

  console.log("[Scheduler] Starting automated job scheduler...");

  // Booking reminders: check every hour for bookings arriving in 48h
  setInterval(async () => {
    try {
      await runBookingReminders();
    } catch (err) {
      console.error("[Scheduler] Booking reminders failed:", err);
    }
  }, ONE_HOUR);

  // Post-tour feedback: check every hour for completed tours
  setInterval(async () => {
    try {
      await runPostTourFeedback();
    } catch (err) {
      console.error("[Scheduler] Post-tour feedback failed:", err);
    }
  }, ONE_HOUR);

  // Daily summary: check every 15 min, send once per day at ~8 AM ICT (UTC+7)
  setInterval(async () => {
    try {
      await runDailySummary();
    } catch (err) {
      console.error("[Scheduler] Daily summary failed:", err);
    }
  }, FIFTEEN_MINUTES);

  // Lead alerts: check every hour for cold leads
  setInterval(async () => {
    try {
      await runLeadAlerts();
    } catch (err) {
      console.error("[Scheduler] Lead alerts failed:", err);
    }
  }, ONE_HOUR);

  // Lead scoring recalculation: daily
  setInterval(async () => {
    try {
      await recalculateAllLeadScores();
    } catch (err) {
      console.error("[Scheduler] Lead scoring failed:", err);
    }
  }, 24 * ONE_HOUR);

  // Run initial checks after a short delay to let DB connect
  setTimeout(async () => {
    console.log("[Scheduler] Running initial job checks...");
    try {
      await runBookingReminders();
      await runPostTourFeedback();
      await runDailySummary();
      await runLeadAlerts();
      await recalculateAllLeadScores();
    } catch (err) {
      console.error("[Scheduler] Initial run failed:", err);
    }
  }, 10_000);
}
