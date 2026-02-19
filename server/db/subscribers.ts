import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { subscribers, InsertSubscriber } from "../../drizzle/schema";

export async function createSubscriber(sub: InsertSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(subscribers).values(sub);
}

export async function getSubscriberByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllActiveSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.isActive, 1))
    .orderBy(desc(subscribers.subscribedAt));
}

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.subscribedAt));
}

export async function deactivateSubscriber(email: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(subscribers)
    .set({ isActive: 0 })
    .where(eq(subscribers.email, email));
}
