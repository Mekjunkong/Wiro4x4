import "dotenv/config";
import {
  getAlbumByBookingId,
  getBookingById,
  getEligiblePostTourBookings,
} from "../server/db";
import { sendCustomerConfirmation } from "../server/customerEmailService";
import { sendPostTourEmail } from "../server/postTourEmailService";
import { markPostTourEmailSent } from "../server/db";

type Mode = "confirmation" | "itinerary" | "both";

interface CliOptions {
  bookingIds: number[];
  mode: Mode;
  followupLimit: number;
  dryRun: boolean;
}

function printUsage(): void {
  const usage = `
Usage:
  npx tsx scripts/run-booking-email-pack.ts --mode=confirmation --ids=12,34 [--dry-run]
  npx tsx scripts/run-booking-email-pack.ts --mode=itinerary [--limit=10] [--dry-run]
  npx tsx scripts/run-booking-email-pack.ts --mode=both --ids=12,34 [--dry-run]

Modes:
  confirmation  Send booking confirmation emails for specific booking IDs.
  itinerary     Send itinerary follow-up emails for:
                - explicit --ids, or
                - default eligible queue (2+ days after completion, status=completed, max --limit)
  both          Run confirmation first, then itinerary using the same --ids list.
`;
  console.log(usage.trim());
}

function parseArgs(args: string[]): CliOptions {
  const modeArg = getArgValue(args, "mode") as Mode | undefined;
  const idsArg = getArgValue(args, "ids");
  const limitArg = getArgValue(args, "limit");
  const dryRun = hasFlag(args, "dry-run");

  const mode: Mode = modeArg || "both";
  if (mode !== "confirmation" && mode !== "itinerary" && mode !== "both") {
    throw new Error(`Invalid mode: ${modeArg}`);
  }

  const bookingIds = idsArg
    ? idsArg
        .split(",")
        .map(part => Number(part.trim()))
        .filter(id => Number.isFinite(id) && id > 0)
    : [];

  const followupLimit = limitArg ? Number(limitArg) : 10;
  if (!Number.isFinite(followupLimit) || followupLimit <= 0) {
    throw new Error(`Invalid --limit value: ${limitArg}`);
  }

  return {
    bookingIds,
    mode,
    followupLimit,
    dryRun,
  };
}

function getArgValue(args: string[], key: string): string | undefined {
  const prefix = `--${key}=`;
  const valueFlag = args.find(arg => arg.startsWith(prefix));
  if (valueFlag) return valueFlag.slice(prefix.length);

  const keyIndex = args.indexOf(`--${key}`);
  if (keyIndex >= 0 && args[keyIndex + 1]) {
    return args[keyIndex + 1];
  }
  return undefined;
}

function hasFlag(args: string[], key: string): boolean {
  return args.includes(`--${key}`);
}

function deriveTourType(booking: { includesTrip: number }): string {
  return booking.includesTrip ? "Custom Tour" : "Tour Package";
}

async function sendConfirmation(
  bookingId: number,
  dryRun: boolean
): Promise<boolean> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    console.warn(`[Pack][Confirmation] Booking #${bookingId} not found`);
    return false;
  }

  if (!booking.contactEmail) {
    console.warn(
      `[Pack][Confirmation] Booking #${bookingId} has no contact email`
    );
    return false;
  }

  const totalGuests = booking.numberOfAdults + (booking.numberOfChildren ?? 0);
  const pickupLocation =
    booking.pickupPoint === "custom"
      ? (booking.customPickupLocation ?? booking.pickupPoint)
      : booking.pickupPoint;

  if (dryRun) {
    console.log(
      `[Pack][Confirmation][Dry Run] Would send confirmation for booking #${bookingId} (${booking.contactEmail})`
    );
    return true;
  }

  const ok = await sendCustomerConfirmation({
    customerName: booking.contactName,
    customerEmail: booking.contactEmail,
    tourDate: booking.arrivalDate.toISOString(),
    tourType: deriveTourType(booking),
    groupSize: totalGuests,
    pickupLocation,
    pickupTime: "08:00",
    specialRequests: booking.specialRequests ?? undefined,
    bookingId: `WIRO-${booking.id}`,
  });

  console.log(
    `[Pack][Confirmation] Booking #${bookingId} -> ${ok ? "sent" : "failed"}`
  );
  return ok;
}

async function sendItineraryFollowupById(
  bookingId: number,
  dryRun: boolean
): Promise<boolean> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    console.warn(`[Pack][Follow-up] Booking #${bookingId} not found`);
    return false;
  }

  if (!booking.contactEmail) {
    console.warn(
      `[Pack][Follow-up] Booking #${bookingId} has no contact email`
    );
    return false;
  }

  const dueDate = booking.departureDate;
  const now = new Date();
  if (
    booking.status !== "completed" ||
    dueDate.getTime() > now.getTime() ||
    dueDate.getTime() > now.getTime() - 2 * 24 * 60 * 60 * 1000
  ) {
    console.log(
      `[Pack][Follow-up] Booking #${bookingId} skipped (not eligible by completed + 2d window)`
    );
    return false;
  }

  if (booking.postTourEmailSentAt && !dryRun) {
    console.log(
      `[Pack][Follow-up] Booking #${bookingId} skipped (already sent)`
    );
    return false;
  }

  if (dryRun) {
    console.log(
      `[Pack][Follow-up][Dry Run] Would send itinerary follow-up for booking #${bookingId} (${booking.contactEmail})`
    );
    return true;
  }

  const album = await getAlbumByBookingId(booking.id);
  const success = await sendPostTourEmail(booking, album?.accessToken ?? null);

  if (success) {
    await markPostTourEmailSent(booking.id);
  }

  console.log(
    `[Pack][Follow-up] Booking #${bookingId} -> ${success ? "sent" : "failed"}`
  );
  return success;
}

async function sendItineraryFollowupBatch(
  limit: number,
  dryRun: boolean
): Promise<void> {
  if (limit <= 0) {
    console.log(`[Pack][Follow-up] Limit is <= 0; skipping batch run`);
    return;
  }

  if (dryRun) {
    const eligible = await getEligiblePostTourBookings(limit);
    for (const booking of eligible) {
      console.log(
        `[Pack][Follow-up][Dry Run] Would send itinerary follow-up for booking #${booking.id} (${booking.contactEmail})`
      );
    }
    console.log(
      `[Pack][Follow-up][Dry Run] ${eligible.length} eligible booking(s) found (limit ${limit})`
    );
    return;
  }

  const eligible = await getEligiblePostTourBookings(limit);
  let sent = 0;
  let failed = 0;

  for (const booking of eligible) {
    const wasSent = await sendItineraryFollowupById(booking.id, false);
    if (wasSent) sent++;
    else failed++;
  }

  console.log(
    `[Pack][Follow-up] Processed ${eligible.length} eligible booking(s): sent=${sent}, failed=${failed}`
  );
}

async function run() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printUsage();
    return;
  }

  const args = parseArgs(process.argv.slice(2));

  const { bookingIds, mode, followupLimit, dryRun } = args;
  const confirmationResult = { attempted: 0, sent: 0, failed: 0 };
  const followupResult = { attempted: 0, sent: 0, failed: 0 };

  if (mode === "confirmation" || mode === "both") {
    if (!bookingIds.length) {
      throw new Error(
        `Mode '${mode}' requires --ids. Provide comma-separated booking IDs`
      );
    }
    for (const id of bookingIds) {
      confirmationResult.attempted++;
      const ok = await sendConfirmation(id, dryRun);
      if (ok) confirmationResult.sent++;
      else confirmationResult.failed++;
    }
  }

  if (mode === "itinerary" || mode === "both") {
    if (bookingIds.length > 0) {
      for (const id of bookingIds) {
        followupResult.attempted++;
        const ok = await sendItineraryFollowupById(id, dryRun);
        if (ok) followupResult.sent++;
        else followupResult.failed++;
      }
    } else {
      await sendItineraryFollowupBatch(followupLimit, dryRun);
    }
  }

  const payload = {
    mode,
    bookingIds: bookingIds.length,
    confirmationResult,
    followupResult,
    dryRun,
  };

  console.log(`[Pack] Done: ${JSON.stringify(payload)}`);
}

run().catch(error => {
  console.error("[Pack] Failed:", error);
  process.exit(1);
});
