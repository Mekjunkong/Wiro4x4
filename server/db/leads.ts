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

export async function updateLeadScore(leadId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(leads)
    .set({ score: Math.max(0, Math.min(100, Math.round(score))) })
    .where(eq(leads.id, leadId));
}
