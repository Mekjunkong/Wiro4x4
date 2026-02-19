import { eq, and, sql, inArray } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { reviews, InsertReview } from "../../drizzle/schema";

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(reviews).values(review);
}

export async function getApprovedReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.isApproved, 1), eq(reviews.isPublished, 1)))
    .orderBy(desc(reviews.createdAt));
}

export async function getAllReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function getReviewById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateReview(id: number, data: Partial<InsertReview>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(reviews).set(data).where(eq(reviews.id, id));
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(reviews).where(eq(reviews.id, id));
}

export async function getReviewStats() {
  const db = await getDb();
  if (!db) return { totalReviews: 0, averageRating: 0, approvedCount: 0 };
  const all = await db.select().from(reviews);
  const approved = all.filter(r => r.isApproved === 1);
  const avgRating =
    all.length > 0 ? all.reduce((sum, r) => sum + r.rating, 0) / all.length : 0;
  return {
    totalReviews: all.length,
    averageRating: Math.round(avgRating * 10) / 10,
    approvedCount: approved.length,
  };
}

export async function getAllReviewsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function bulkApproveReviews(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(reviews)
    .set({ isApproved: 1, isPublished: 1 })
    .where(inArray(reviews.id, ids));
}

export async function bulkDeleteReviews(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(reviews).where(inArray(reviews.id, ids));
}
