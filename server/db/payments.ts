import { eq, and, sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { payments, InsertPayment } from "../../drizzle/schema";

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(payments).values(payment);
}

export async function getPaymentsByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(payments)
    .where(eq(payments.bookingId, bookingId))
    .orderBy(desc(payments.createdAt));
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).orderBy(desc(payments.createdAt));
}

export async function getPaymentStats() {
  const db = await getDb();
  if (!db) return { totalPayments: 0, totalAmount: 0, completedAmount: 0 };
  const all = await db.select().from(payments);
  const completed = all.filter(p => p.status === "completed");
  return {
    totalPayments: all.length,
    totalAmount: all.reduce((sum, p) => sum + p.amount, 0),
    completedAmount: completed.reduce((sum, p) => sum + p.amount, 0),
  };
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.stripeSessionId, sessionId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPendingPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(payments)
    .where(eq(payments.status, "pending"))
    .orderBy(payments.createdAt);
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(payments).set(data).where(eq(payments.id, id));
}

export async function getBookingTotalPaid(bookingId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(
      and(eq(payments.bookingId, bookingId), eq(payments.status, "completed"))
    );
  return Number(result[0]?.total ?? 0);
}
