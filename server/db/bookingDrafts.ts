import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { bookingDrafts, InsertBookingDraft } from "../../drizzle/schema";

export async function createBookingDraft(data: InsertBookingDraft) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(bookingDrafts).values(data);
  return result.insertId;
}

export async function getBookingDraftByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const [draft] = await db
    .select()
    .from(bookingDrafts)
    .where(eq(bookingDrafts.resumeToken, token))
    .limit(1);
  return draft ?? null;
}

export async function listActiveBookingDrafts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookingDrafts)
    .where(eq(bookingDrafts.status, "active"))
    .orderBy(desc(bookingDrafts.createdAt));
}

export async function updateBookingDraftStatus(
  id: number,
  status: "active" | "converted" | "expired",
  convertedToBookingId?: number
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(bookingDrafts)
    .set({ status, ...(convertedToBookingId ? { convertedToBookingId } : {}) })
    .where(eq(bookingDrafts.id, id));
}
