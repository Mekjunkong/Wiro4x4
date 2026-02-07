import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Booking System Database Helpers

import { bookings, agents, leads, financialRecords, galleryPhotos, reviews, payments, InsertBooking, InsertAgent, InsertLead, InsertFinancialRecord, InsertGalleryPhoto, InsertReview, InsertPayment } from "../drizzle/schema";
import { desc } from "drizzle-orm";

// Bookings
export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBooking(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(bookings).set(data).where(eq(bookings.id, id));
}

export async function deleteBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(bookings).where(eq(bookings.id, id));
}

// Agents
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
  
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAgent(id: number, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(agents).set(data).where(eq(agents.id, id));
}

// Leads
export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(leads).values(lead);
}

export async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(leads).set(data).where(eq(leads.id, id));
}

// Financial Records
export async function createFinancialRecord(record: InsertFinancialRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(financialRecords).values(record);
}

export async function getFinancialRecordsByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(financialRecords).where(eq(financialRecords.bookingId, bookingId));
}

export async function getAllFinancialRecords() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(financialRecords).orderBy(desc(financialRecords.createdAt));
}

// ─── Gallery Photos ────────────────────────────────────────

export async function createGalleryPhoto(photo: InsertGalleryPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(galleryPhotos).values(photo);
}

export async function getAllPublishedPhotos() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(galleryPhotos)
    .where(eq(galleryPhotos.isPublished, 1))
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt));
}

export async function getAllGalleryPhotos() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(galleryPhotos)
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt));
}

export async function updateGalleryPhoto(id: number, data: Partial<InsertGalleryPhoto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(galleryPhotos).set(data).where(eq(galleryPhotos.id, id));
}

export async function deleteGalleryPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
}

// ─── Reviews ───────────────────────────────────────────────

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(reviews).values(review);
}

export async function getApprovedReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews)
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
  const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
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
  const avgRating = all.length > 0
    ? all.reduce((sum, r) => sum + r.rating, 0) / all.length
    : 0;
  return {
    totalReviews: all.length,
    averageRating: Math.round(avgRating * 10) / 10,
    approvedCount: approved.length,
  };
}

// ─── Payments ──────────────────────────────────────────────

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(payments).values(payment);
}

export async function getPaymentsByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments)
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
