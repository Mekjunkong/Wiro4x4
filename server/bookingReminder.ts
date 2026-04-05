/**
 * Booking Reminder Scheduler
 *
 * Uses a flat JSON file (/tmp/wiro_reminders.json) to track pending
 * pre-tour reminders. scheduleBookingReminder() is called when a booking
 * is created; processReminders() is called by the scheduler /agent endpoint.
 */

import fs from "fs/promises";

const REMINDER_FILE = "/tmp/wiro_reminders.json";

interface ReminderEntry {
  bookingId: number;
  reminderTime: string; // ISO date string
  sent: boolean;
  createdAt: string;
}

async function readReminders(): Promise<ReminderEntry[]> {
  try {
    const raw = await fs.readFile(REMINDER_FILE, "utf-8");
    return JSON.parse(raw) as ReminderEntry[];
  } catch {
    return [];
  }
}

async function writeReminders(entries: ReminderEntry[]): Promise<void> {
  await fs.writeFile(REMINDER_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

/**
 * Schedule a pre-tour reminder for a booking.
 * Stores reminderTime = departureDate - 24 hours.
 */
export async function scheduleBookingReminder(
  bookingId: number,
  departureDate: Date | string
): Promise<void> {
  const departure =
    typeof departureDate === "string" ? new Date(departureDate) : departureDate;

  const reminderTime = new Date(departure.getTime() - 24 * 60 * 60 * 1000);
  const now = new Date();

  // Don't schedule reminders in the past
  if (reminderTime <= now) {
    console.log(
      `[BookingReminder] Booking #${bookingId} reminder time ${reminderTime.toISOString()} is in the past — skipping`
    );
    return;
  }

  const reminders = await readReminders();

  // Remove any existing entry for this booking (idempotent)
  const filtered = reminders.filter(r => r.bookingId !== bookingId);

  filtered.push({
    bookingId,
    reminderTime: reminderTime.toISOString(),
    sent: false,
    createdAt: now.toISOString(),
  });

  await writeReminders(filtered);
  console.log(
    `[BookingReminder] Scheduled reminder for booking #${bookingId} at ${reminderTime.toISOString()}`
  );
}

/**
 * Process all pending reminders — sends Telegram for any due entries.
 * Returns the number of reminders sent.
 */
export async function processReminders(): Promise<number> {
  const reminders = await readReminders();
  const now = new Date();
  let sentCount = 0;

  const updated: ReminderEntry[] = [];

  for (const entry of reminders) {
    if (entry.sent) {
      updated.push(entry);
      continue;
    }

    const reminderTime = new Date(entry.reminderTime);
    if (reminderTime <= now) {
      // Due — send Telegram alert
      try {
        await sendReminderTelegram(entry.bookingId, reminderTime);
        entry.sent = true;
        sentCount++;
      } catch (err) {
        console.error(
          `[BookingReminder] Failed to send reminder for booking #${entry.bookingId}:`,
          err
        );
      }
    }

    updated.push(entry);
  }

  await writeReminders(updated);
  console.log(
    `[BookingReminder] Processed reminders: ${sentCount} sent, ${updated.filter(r => !r.sent).length} pending`
  );

  return sentCount;
}

// ── Telegram notification ─────────────────────────────────────────────────

async function sendReminderTelegram(
  bookingId: number,
  reminderTime: Date
): Promise<void> {
  const { notifyBookingReminder } = await import("./eliNotify");
  await notifyBookingReminder({
    bookingId,
    reminderTime: reminderTime.toISOString(),
  });
}
