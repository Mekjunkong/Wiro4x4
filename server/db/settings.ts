import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { settings } from "../../drizzle/schema";

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  return row?.value ?? null;
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(settings);
}

export async function upsertSetting(key: string, value: unknown) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSetting(key);
  if (existing !== null) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

export async function deleteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(settings).where(eq(settings.key, key));
}
