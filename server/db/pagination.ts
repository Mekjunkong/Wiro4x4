import { sql } from "drizzle-orm";
import { getDb } from "./connection";
import type { MySqlTable, MySqlColumn } from "drizzle-orm/mysql-core";

/**
 * Shared pagination helper used by all paginated list functions.
 * Avoids duplicating offset/limit/count logic across 7+ functions.
 */
export async function paginatedQuery<T extends MySqlTable>(
  table: T,
  orderBy: MySqlColumn | MySqlColumn[],
  page = 1,
  pageSize = 20
): Promise<{ items: T["$inferSelect"][]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const offset = (page - 1) * pageSize;

  // Build order-by array
  const orderByArr = Array.isArray(orderBy) ? orderBy : [orderBy];

  const items = await (db
    .select()
    .from(table)
    .orderBy(...orderByArr)
    .limit(pageSize)
    .offset(offset) as any);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(table);
  const total = Number(countResult[0]?.count ?? 0);

  return { items, total };
}
