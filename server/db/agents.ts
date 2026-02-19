import { eq, sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { agents, bookings, InsertAgent } from "../../drizzle/schema";

export async function createAgent(agent: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(agents).values(agent);
}

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(agents).orderBy(desc(agents.totalBookings));
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAgent(id: number, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(agents).set(data).where(eq(agents.id, id));
}

export async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(agents).where(eq(agents.id, id));
}

export async function getAgentPerformanceStats() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      status: agents.status,
      rating: agents.rating,
      totalBookings: sql<number>`COUNT(${bookings.id})`,
      completedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`,
      activeBookings: sql<number>`SUM(CASE WHEN ${bookings.status} IN ('confirmed', 'in_progress') THEN 1 ELSE 0 END)`,
    })
    .from(agents)
    .leftJoin(bookings, eq(bookings.assignedAgentId, agents.id))
    .groupBy(agents.id, agents.name, agents.status, agents.rating);

  return result.map(r => ({
    ...r,
    rating: r.rating ?? 5,
    totalBookings: Number(r.totalBookings),
    completedBookings: Number(r.completedBookings ?? 0),
    activeBookings: Number(r.activeBookings ?? 0),
  }));
}
