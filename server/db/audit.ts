import { eq, and } from "drizzle-orm";
import { getDb } from "./connection";
import {
  auditLogs,
  scheduledEmails,
  InsertAuditLog,
  InsertScheduledEmail,
} from "../../drizzle/schema";

// ─── Audit Logging ────────────────────────────────────────

export async function logAdminAction(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditLogs).values(log);
  } catch (err) {
    console.error("[Audit] Failed to log action:", err);
  }
}

// ─── Scheduled Emails ─────────────────────────────────────

export async function createScheduledEmail(record: InsertScheduledEmail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(scheduledEmails).values(record);
}

export async function hasScheduledEmailBeenSent(
  type: "reminder" | "feedback" | "lead_alert" | "daily_summary",
  targetId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(scheduledEmails)
    .where(
      and(
        eq(scheduledEmails.type, type),
        eq(scheduledEmails.targetId, targetId),
        eq(scheduledEmails.status, "sent")
      )
    )
    .limit(1);
  return result.length > 0;
}
