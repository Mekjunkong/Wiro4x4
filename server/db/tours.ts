import { eq, sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { tours, InsertTour } from "../../drizzle/schema";

export async function createTour(tour: InsertTour) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tours).values(tour);
}

export async function getAllActiveTours() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tours)
    .where(eq(tours.isActive, 1))
    .orderBy(tours.sortOrder, desc(tours.createdAt));
}

export async function getAllTours() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tours)
    .orderBy(tours.sortOrder, desc(tours.createdAt));
}

export async function getTourById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tours).where(eq(tours.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTourBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tours)
    .where(eq(tours.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTour(id: number, data: Partial<InsertTour>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(tours).set(data).where(eq(tours.id, id));
}

export async function deleteTour(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tours).where(eq(tours.id, id));
}

export async function getAllToursPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(tours)
    .orderBy(tours.sortOrder, desc(tours.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tours);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
