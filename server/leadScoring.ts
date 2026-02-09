/**
 * Lead scoring algorithm.
 * Scores leads 1-100 based on engagement signals, source quality, and recency.
 */

import { getDb, updateLeadScore } from "./db";
import { leads } from "../drizzle/schema";

interface LeadData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  interestedTours: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate a lead score from 0-100.
 */
export function calculateLeadScore(lead: LeadData): number {
  let score = 0;

  // Source quality (0-25 points)
  const source = (lead.source ?? "website").toLowerCase();
  if (source === "referral") score += 25;
  else if (source === "whatsapp") score += 20;
  else if (source === "instagram" || source === "facebook") score += 15;
  else if (source === "website") score += 10;
  else score += 5;

  // Engagement signals (0-35 points)
  if (lead.phone) score += 10; // Provided phone number
  if (lead.message && lead.message.length > 50)
    score += 10; // Detailed message
  else if (lead.message && lead.message.length > 0) score += 5;
  if (lead.interestedTours) {
    try {
      const tours = JSON.parse(lead.interestedTours);
      if (Array.isArray(tours) && tours.length > 0) score += 10;
    } catch {
      if (lead.interestedTours.length > 0) score += 5;
    }
  }
  if (lead.name && lead.name.length > 3) score += 5; // Full name provided

  // Status progression (0-20 points)
  if (lead.status === "quoted") score += 20;
  else if (lead.status === "contacted") score += 10;
  else if (lead.status === "new") score += 5;
  // converted/lost don't need scoring

  // Recency decay (0-20 points)
  const now = new Date();
  const ageMs = now.getTime() - new Date(lead.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays < 1) score += 20;
  else if (ageDays < 3) score += 15;
  else if (ageDays < 7) score += 10;
  else if (ageDays < 14) score += 5;
  // older than 14 days: 0 points

  return Math.max(1, Math.min(100, score));
}

/**
 * Recalculate scores for all active leads (new/contacted/quoted).
 */
export async function recalculateAllLeadScores() {
  const db = await getDb();
  if (!db) return;

  const allLeads = await db.select().from(leads);
  const activeLeads = allLeads.filter(l =>
    ["new", "contacted", "quoted"].includes(l.status)
  );

  let updated = 0;
  for (const lead of activeLeads) {
    const newScore = calculateLeadScore(lead as LeadData);
    if (newScore !== lead.score) {
      await updateLeadScore(lead.id, newScore);
      updated++;
    }
  }

  if (updated > 0) {
    console.log(`[LeadScoring] Updated scores for ${updated} leads`);
  }
}
