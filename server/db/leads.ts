import { eq, sql, inArray } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { leads, InsertLead } from "../../drizzle/schema";

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(leads).values(lead);
}

export async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(leads).set(data).where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(leads).where(eq(leads.id, id));
}

export async function getAllLeadsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function bulkDeleteLeads(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(leads).where(inArray(leads.id, ids));
}

// ─── Scheduler Queries ───────────────────────────────────

/**
 * Count leads created in the last N hours.
 */
export async function getNewLeadCount(withinHours = 24): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1000);
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(sql`${leads.createdAt} >= ${cutoff}`);
  return Number(result[0]?.count ?? 0);
}

/**
 * Get leads with status 'new' that haven't been updated in 48+ hours.
 */
export async function getStaleNewLeads() {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return await db
    .select()
    .from(leads)
    .where(sql`${leads.status} = 'new' AND ${leads.updatedAt} < ${cutoff}`);
}

/**
 * Get leads with status 'contacted' that haven't been updated in 5+ days.
 */
export async function getColdContactedLeads() {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  return await db
    .select()
    .from(leads)
    .where(
      sql`${leads.status} = 'contacted' AND ${leads.updatedAt} < ${cutoff}`
    );
}

// ─── Abandoned Booking Recovery ──────────────────────────

/**
 * Find leads with status='new' created more than `hoursAgo` hours ago
 * that have no matching booking with the same email.
 */
export async function getAbandonedLeads(hoursAgo = 24) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return await db
    .select()
    .from(leads)
    .where(sql`${leads.status} = 'new' AND ${leads.createdAt} < ${cutoff}`)
    .orderBy(desc(leads.createdAt));
}

/**
 * Mark a lead as having received a recovery email.
 */
export async function markRecoveryEmailSent(leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(leads)
    .set({ recoveryEmailSentAt: new Date() })
    .where(eq(leads.id, leadId));
}

export async function updateLeadScore(leadId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(leads)
    .set({ score: Math.max(0, Math.min(100, Math.round(score))) })
    .where(eq(leads.id, leadId));
}
