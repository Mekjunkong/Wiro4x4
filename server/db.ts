import { eq, and, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

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
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Booking System Database Helpers

import {
  bookings,
  agents,
  leads,
  financialRecords,
  galleryPhotos,
  reviews,
  payments,
  tours,
  blogPosts,
  auditLogs,
  InsertBooking,
  InsertAgent,
  InsertLead,
  InsertFinancialRecord,
  InsertGalleryPhoto,
  InsertReview,
  InsertPayment,
  InsertTour,
  InsertBlogPost,
  InsertAuditLog,
} from "../drizzle/schema";
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

  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
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

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAgent(id: number, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(agents).set(data).where(eq(agents.id, id));
}

export async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(agents).where(eq(agents.id, id));
}

export async function getBookingsByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.assignedAgentId, agentId))
    .orderBy(desc(bookings.createdAt));
}

export async function getAgentPerformanceStats() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      status: agents.status,
      rating: agents.rating,
      totalBookings: sql<number>`COUNT(${bookings.id})`,
      completedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`,
      activeBookings: sql<number>`SUM(CASE WHEN ${bookings.status} IN ('confirmed', 'in_progress') THEN 1 ELSE 0 END)`,
    })
    .from(agents)
    .leftJoin(bookings, eq(bookings.assignedAgentId, agents.id))
    .groupBy(agents.id, agents.name, agents.status, agents.rating);

  return result.map(r => ({
    ...r,
    rating: r.rating ?? 5,
    totalBookings: Number(r.totalBookings),
    completedBookings: Number(r.completedBookings ?? 0),
    activeBookings: Number(r.activeBookings ?? 0),
  }));
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

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(leads).where(eq(leads.id, id));
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

  return await db
    .select()
    .from(financialRecords)
    .where(eq(financialRecords.bookingId, bookingId));
}

export async function getAllFinancialRecords() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(financialRecords)
    .orderBy(desc(financialRecords.createdAt));
}

export async function updateFinancialRecord(
  id: number,
  data: Partial<InsertFinancialRecord>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(financialRecords)
    .set(data)
    .where(eq(financialRecords.id, id));
}

export async function deleteFinancialRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(financialRecords).where(eq(financialRecords.id, id));
}

export async function getFinancialStats() {
  const db = await getDb();
  if (!db)
    return { totalRevenue: 0, totalCosts: 0, totalRefunds: 0, netProfit: 0 };
  const all = await db.select().from(financialRecords);
  const revenue = all
    .filter(r => r.type === "revenue")
    .reduce((sum, r) => sum + r.amount, 0);
  const costs = all
    .filter(r => r.type === "cost")
    .reduce((sum, r) => sum + r.amount, 0);
  const refunds = all
    .filter(r => r.type === "refund")
    .reduce((sum, r) => sum + r.amount, 0);
  return {
    totalRevenue: revenue,
    totalCosts: costs,
    totalRefunds: refunds,
    netProfit: revenue - costs - refunds,
  };
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
  return await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.isPublished, 1))
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt));
}

export async function getAllGalleryPhotos() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(galleryPhotos)
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt));
}

export async function updateGalleryPhoto(
  id: number,
  data: Partial<InsertGalleryPhoto>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(galleryPhotos)
    .set(data)
    .where(eq(galleryPhotos.id, id));
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

// ─── Payments ──────────────────────────────────────────────

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

// ─── Tours ──────────────────────────────────────────────────

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

// ─── Paginated List Functions ─────────────────────────────

export async function getAllBookingsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
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

export async function getAllFinancialRecordsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(financialRecords)
    .orderBy(desc(financialRecords.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(financialRecords);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function getAllGalleryPhotosPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(galleryPhotos)
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(galleryPhotos);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function getAllLeadsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
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

// ─── Blog Posts ────────────────────────────────────────────

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(blogPosts).values(post);
}

export async function getAllPublishedBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, 1))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));
}

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBlogPost(
  id: number,
  data: Partial<InsertBlogPost>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function getAllBlogPostsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

// ─── Bulk Operations ─────────────────────────────────────

export async function bulkDeleteBookings(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(bookings).where(inArray(bookings.id, ids));
}

export async function bulkDeleteLeads(ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(leads).where(inArray(leads.id, ids));
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

// ─── Subscribers ─────────────────────────────────────────

import { subscribers, InsertSubscriber } from "../drizzle/schema";

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

// ─── Audit Logging ────────────────────────────────────────

export async function logAdminAction(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditLogs).values(log);
  } catch (err) {
    console.error("[Audit] Failed to log action:", err);
  }
}
