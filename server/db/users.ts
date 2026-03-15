import { eq } from "drizzle-orm";
import { desc, inArray } from "drizzle-orm";
import { getDb } from "./connection";
import { users } from "../../drizzle/schema";

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name?: string | null;
  role?: "user" | "admin" | "owner" | "manager" | "agent";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name ?? null,
    role: data.role ?? "user",
    lastSignedIn: new Date(),
  });
  return result[0].insertId;
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function updateLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

export async function getAllAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(users)
    .where(inArray(users.role, ["admin", "owner", "manager", "agent"]))
    .orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(users)
    .set({ role: role as any })
    .where(eq(users.id, userId));
}

export async function removeAdminAccess(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(users)
    .set({ role: "user" })
    .where(eq(users.id, userId));
}
