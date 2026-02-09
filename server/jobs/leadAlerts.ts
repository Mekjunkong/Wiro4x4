/**
 * Lead alert job.
 * Alerts when leads go cold:
 * - 24h for new leads (no contact yet)
 * - 5 days for contacted/quoted leads (no follow-up)
 */

import { getDb, hasScheduledEmailBeenSent, createScheduledEmail } from "../db";
import { leads } from "../../drizzle/schema";
import { and, eq, lte, sql } from "drizzle-orm";

// Import notifyOwner dynamically to handle Manus platform availability
async function sendAlert(title: string, content: string): Promise<boolean> {
  try {
    const { notifyOwner } = await import("../_core/notification");
    return await notifyOwner({ title, content });
  } catch {
    console.warn("[LeadAlerts] notifyOwner not available, skipping alert");
    return false;
  }
}

export async function runLeadAlerts() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  // Cold NEW leads: no update in 24h
  const coldNewLeads = await db
    .select()
    .from(leads)
    .where(
      and(eq(leads.status, "new"), lte(leads.updatedAt, twentyFourHoursAgo))
    );

  // Cold CONTACTED/QUOTED leads: no update in 5 days
  const coldFollowUpLeads = await db
    .select()
    .from(leads)
    .where(
      and(
        sql`${leads.status} IN ('contacted', 'quoted')`,
        lte(leads.updatedAt, fiveDaysAgo)
      )
    );

  const allColdLeads = [...coldNewLeads, ...coldFollowUpLeads];

  for (const lead of allColdLeads) {
    // Use a daily dedup key: leadId * 1000 + dayOfYear
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const dedupeId = lead.id * 1000 + (dayOfYear % 1000);

    const alreadySent = await hasScheduledEmailBeenSent("lead_alert", dedupeId);
    if (alreadySent) continue;

    const hoursAgo = Math.round(
      (now.getTime() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60)
    );
    const daysAgo = Math.round(hoursAgo / 24);
    const timeLabel = daysAgo > 1 ? `${daysAgo} days` : `${hoursAgo} hours`;

    const title = `⚠️ Cold Lead: ${lead.name}`;
    const content = `
**Lead Going Cold — Action Needed**

- **Name:** ${lead.name}
- **Email:** ${lead.email}
- **Phone:** ${lead.phone || "Not provided"}
- **Source:** ${lead.source || "website"}
- **Status:** ${lead.status}
- **Last updated:** ${timeLabel} ago
- **Interested in:** ${lead.interestedTours || "Not specified"}

${lead.message ? `**Original message:** ${lead.message}` : ""}

---
Respond to this lead before they lose interest.
    `.trim();

    const success = await sendAlert(title, content);

    await createScheduledEmail({
      type: "lead_alert",
      targetId: dedupeId,
      targetEmail: lead.email,
      status: success ? "sent" : "failed",
    });

    if (success) {
      console.log(
        `[LeadAlerts] Cold lead alert sent for ${lead.name} (${lead.status}, ${timeLabel} since update)`
      );
    }
  }
}
