/**
 * Availability Helper
 *
 * Checks real tour availability from the database for a given date.
 * Used by chatApi to inject live availability into the Claude system prompt.
 */

import { getDb } from "./db/connection";
import { tourAvailability } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface AvailabilityResult {
  date: string;
  tourId: number;
  tourName: string;
  available: number; // slots remaining
  isBlocked: boolean;
  status: "confirmed" | "unknown";
}

/**
 * Check availability for a specific date (YYYY-MM-DD).
 * Returns list of tours with their availability.
 */
export async function checkAvailability(
  dateStr: string
): Promise<AvailabilityResult[]> {
  const db = await getDb();
  if (!db) return [];

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return [];

  try {
    const { getAllActiveTours } = await import("./db/index.js");
    const tours = await getAllActiveTours();

    const results: AvailabilityResult[] = [];

    for (const tour of tours) {
      const tourId = tour.id as number;
      const records = await db
        .select()
        .from(tourAvailability)
        .where(
          and(
            eq(tourAvailability.tourId, tourId),
            eq(tourAvailability.date, dateStr)
          )
        )
        .limit(1);

      const record = records[0];
      if (!record) {
        // No record means unknown. It must never be presented to a customer as
        // confirmed availability.
        results.push({
          date: dateStr,
          tourId,
          tourName: (tour.name as string) ?? "Unknown Tour",
          available: 0,
          isBlocked: false,
          status: "unknown",
        });
      } else if (record.isBlocked) {
        results.push({
          date: dateStr,
          tourId,
          tourName: (tour.name as string) ?? "Unknown Tour",
          available: 0,
          isBlocked: true,
          status: "confirmed",
        });
      } else {
        results.push({
          date: dateStr,
          tourId,
          tourName: (tour.name as string) ?? "Unknown Tour",
          available: record.maxSlots - record.bookedSlots,
          isBlocked: false,
          status: "confirmed",
        });
      }
    }

    return results;
  } catch (err) {
    console.error("[AvailabilityHelper] checkAvailability error:", err);
    return [];
  }
}

/**
 * Extract a date string from user message.
 * Matches patterns like: "10 April", "April 10", "2026-04-15", "15/04/2026"
 */
export function extractDateFromMessage(message: string): string | null {
  // YYYY-MM-DD
  const isoMatch = message.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = message.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Month name patterns — e.g. "10 April", "April 10", "April 10th"
  const thaiMonths: Record<string, number> = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };

  const monthNameMatch = message.match(
    /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i
  );
  if (monthNameMatch) {
    const day = parseInt(monthNameMatch[1]);
    const monthNum = thaiMonths[monthNameMatch[2].toLowerCase()];
    const year = inferUpcomingYear(monthNum, day);
    return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const nameDateMatch = message.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i
  );
  if (nameDateMatch) {
    const monthNum = thaiMonths[nameDateMatch[1].toLowerCase()];
    const day = parseInt(nameDateMatch[2]);
    const year = inferUpcomingYear(monthNum, day);
    return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return null;
}

function inferUpcomingYear(month: number, day: number, now = new Date()) {
  const thisYear = now.getFullYear();
  const candidate = new Date(thisYear, month - 1, day);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  return candidate < startOfToday ? thisYear + 1 : thisYear;
}
