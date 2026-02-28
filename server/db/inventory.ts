import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "./connection";
import { inventory, InsertInventoryItem } from "../../drizzle/schema";

export async function createInventoryItem(data: InsertInventoryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(inventory).values(data);
}

export async function getAllInventoryPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(inventory)
    .orderBy(desc(inventory.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(inventory);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function getInventoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(inventory)
    .where(eq(inventory.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateInventoryItem(
  id: number,
  data: Partial<InsertInventoryItem>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(inventory).set(data).where(eq(inventory.id, id));
}

export async function deleteInventoryItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(inventory).where(eq(inventory.id, id));
}

export async function getInventorySummary() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      category: inventory.category,
      count: sql<number>`COUNT(*)`,
      totalCurrentValue: sql<number>`SUM(${inventory.currentValue})`,
      totalPurchaseCost: sql<number>`SUM(${inventory.purchaseCost})`,
    })
    .from(inventory)
    .groupBy(inventory.category);
  return result;
}
