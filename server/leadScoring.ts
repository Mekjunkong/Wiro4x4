/**
 * Lead scoring algorithm.
 * Scores leads 0-100 based on source quality, contact completeness,
 * message quality, recency, engagement signals, and status.
 *
 * Tiers: Hot (75-100), Warm (50-74), Cool (25-49), Cold (0-24)
 */

import { getDb, updateLeadScore } from "./db";
import { leads } from "../drizzle/schema";

export interface LeadData {
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
  recoveryEmailSentAt?: Date | null;
}

export interface ScoreBreakdown {
  sourceQuality: { points: number; max: 20; reason: string };
  contactCompleteness: { points: number; max: 15; reason: string };
  messageQuality: { points: number; max: 20; reason: string };
  recency: { points: number; max: 20; reason: string };
  engagementSignals: { points: number; max: 15; reason: string };
  statusBonus: { points: number; max: 10; reason: string };
}

export type ScoreTier = "hot" | "warm" | "cool" | "cold";

export interface LeadScoreResult {
  score: number;
  tier: ScoreTier;
  details: ScoreBreakdown;
}

/**
 * Determine the tier label for a given score.
 */
export function getScoreTier(score: number): ScoreTier {
  if (score >= 75) return "hot";
  if (score >= 50) return "warm";
  if (score >= 25) return "cool";
  return "cold";
}

/**
 * Calculate a lead score from 0-100 with detailed breakdown.
 */
export function calculateLeadScore(
  lead: LeadData,
  allLeadEmails?: string[]
): LeadScoreResult {
  const details: ScoreBreakdown = {
    sourceQuality: { points: 0, max: 20, reason: "" },
    contactCompleteness: { points: 0, max: 15, reason: "" },
    messageQuality: { points: 0, max: 20, reason: "" },
    recency: { points: 0, max: 20, reason: "" },
    engagementSignals: { points: 0, max: 15, reason: "" },
    statusBonus: { points: 0, max: 10, reason: "" },
  };

  // ── Source Quality (max 20 pts) ──────────────────────
  const source = (lead.source ?? "other").toLowerCase();
  const sourceMap: Record<string, number> = {
    "booking-form": 20,
    "contact-page": 15,
    whatsapp: 15,
    "quick-inquiry": 10,
    referral: 20,
    website: 10,
    instagram: 10,
    facebook: 10,
  };
  details.sourceQuality.points = sourceMap[source] ?? 5;
  details.sourceQuality.reason = `Source: ${source} (${details.sourceQuality.points}pts)`;

  // ── Contact Completeness (max 15 pts) ────────────────
  let contactPts = 0;
  const contactReasons: string[] = [];
  if (lead.name && lead.name.trim().length > 0) {
    contactPts += 5;
    contactReasons.push("name (+5)");
  }
  if (lead.email && lead.email.trim().length > 0) {
    contactPts += 5;
    contactReasons.push("email (+5)");
  }
  if (lead.phone && lead.phone.trim().length > 0) {
    contactPts += 10;
    contactReasons.push("phone (+10)");
  }
  details.contactCompleteness.points = Math.min(15, contactPts);
  details.contactCompleteness.reason =
    contactReasons.length > 0 ? contactReasons.join(", ") : "No contact info";

  // ── Message Quality (max 20 pts) ─────────────────────
  let messagePts = 0;
  const messageReasons: string[] = [];
  const msg = lead.message ?? "";

  if (msg.length > 100) {
    messagePts += 10;
    messageReasons.push("detailed message (+10)");
  } else if (msg.length > 0) {
    messagePts += 5;
    messageReasons.push("short message (+5)");
  }

  if (
    /\b\d{1,2}[\/-]\d{1,2}\b|\bjan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec\b|\bdate\b/i.test(
      msg
    )
  ) {
    messagePts += 5;
    messageReasons.push("mentions dates (+5)");
  }
  if (
    /\b\d+\s*(people|person|pax|adult|kid|child|group)\b/i.test(msg) ||
    /group\s*size/i.test(msg)
  ) {
    messagePts += 5;
    messageReasons.push("mentions group size (+5)");
  }
  if (/kosher|shabbat|sabbath|שבת|כשר/i.test(msg)) {
    messagePts += 5;
    messageReasons.push("mentions kosher/shabbat (+5)");
  }

  details.messageQuality.points = Math.min(20, messagePts);
  details.messageQuality.reason =
    messageReasons.length > 0 ? messageReasons.join(", ") : "No message";

  // ── Recency (max 20 pts) ─────────────────────────────
  const now = new Date();
  const ageMs = now.getTime() - new Date(lead.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays < 1) {
    details.recency.points = 20;
    details.recency.reason = "Less than 1 day old (+20)";
  } else if (ageDays < 3) {
    details.recency.points = 15;
    details.recency.reason = "1-3 days old (+15)";
  } else if (ageDays < 7) {
    details.recency.points = 10;
    details.recency.reason = "3-7 days old (+10)";
  } else if (ageDays < 14) {
    details.recency.points = 5;
    details.recency.reason = "1-2 weeks old (+5)";
  } else {
    details.recency.points = 0;
    details.recency.reason = "Over 2 weeks old (+0)";
  }

  // ── Engagement Signals (max 15 pts) ──────────────────
  let engagementPts = 0;
  const engagementReasons: string[] = [];

  // Recovery email interaction (proxy for engagement)
  if (lead.recoveryEmailSentAt) {
    engagementPts += 5;
    engagementReasons.push("recovery email sent (+5)");
  }

  // Multiple leads from same email (repeat interest)
  if (allLeadEmails) {
    const sameEmailCount = allLeadEmails.filter(
      e => e.toLowerCase() === lead.email.toLowerCase()
    ).length;
    if (sameEmailCount > 1) {
      engagementPts += 10;
      engagementReasons.push(`repeat inquiry x${sameEmailCount} (+10)`);
    }
  }

  // Interested in specific tours
  if (lead.interestedTours) {
    try {
      const tours = JSON.parse(lead.interestedTours);
      if (Array.isArray(tours) && tours.length > 0) {
        engagementPts += 5;
        engagementReasons.push(`interested in ${tours.length} tour(s) (+5)`);
      }
    } catch {
      if (lead.interestedTours.length > 0) {
        engagementPts += 3;
        engagementReasons.push("tour interest noted (+3)");
      }
    }
  }

  details.engagementSignals.points = Math.min(15, engagementPts);
  details.engagementSignals.reason =
    engagementReasons.length > 0
      ? engagementReasons.join(", ")
      : "No engagement signals";

  // ── Status Bonus (max 10 pts) ────────────────────────
  if (lead.status === "quoted") {
    details.statusBonus.points = 10;
    details.statusBonus.reason = "Status: quoted (+10)";
  } else if (lead.status === "contacted") {
    details.statusBonus.points = 5;
    details.statusBonus.reason = "Status: contacted (+5)";
  } else {
    details.statusBonus.points = 0;
    details.statusBonus.reason = `Status: ${lead.status} (+0)`;
  }

  // ── Total ────────────────────────────────────────────
  const score = Math.max(
    0,
    Math.min(
      100,
      details.sourceQuality.points +
        details.contactCompleteness.points +
        details.messageQuality.points +
        details.recency.points +
        details.engagementSignals.points +
        details.statusBonus.points
    )
  );

  return {
    score,
    tier: getScoreTier(score),
    details,
  };
}

/**
 * Recalculate scores for all active leads (new/contacted/quoted).
 * Returns { updated: number, total: number }.
 */
export async function recalculateAllLeadScores(): Promise<{
  updated: number;
  total: number;
}> {
  const db = await getDb();
  if (!db) return { updated: 0, total: 0 };

  const allLeads = await db.select().from(leads);
  const activeLeads = allLeads.filter(l =>
    ["new", "contacted", "quoted"].includes(l.status)
  );

  // Collect all emails for repeat-inquiry detection
  const allEmails = allLeads.map(l => l.email);

  let updated = 0;
  for (const lead of activeLeads) {
    const result = calculateLeadScore(lead as LeadData, allEmails);
    await updateLeadScore(
      lead.id,
      result.score,
      JSON.stringify(result.details)
    );
    updated++;
  }

  if (updated > 0) {
    console.log(
      `[LeadScoring] Updated scores for ${updated}/${activeLeads.length} leads`
    );
  }

  return { updated, total: activeLeads.length };
}
