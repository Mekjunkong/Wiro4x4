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
  customers,
  customerActivities,
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
  InsertCustomer,
  InsertCustomerActivity,
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

export async function getTourBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tours)
    .where(eq(tours.slug, slug))
    .limit(1);
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

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
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

import {
  subscribers,
  InsertSubscriber,
  scheduledEmails,
  InsertScheduledEmail,
  chatSessions,
  chatMessages,
  InsertChatSession,
  InsertChatMessage,
} from "../drizzle/schema";

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

// ─── Scheduled Emails ─────────────────────────────────────

export async function createScheduledEmail(record: InsertScheduledEmail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(scheduledEmails).values(record);
}

export async function hasScheduledEmailBeenSent(
  type: "reminder" | "feedback" | "lead_alert" | "daily_summary",
  targetId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(scheduledEmails)
    .where(
      and(
        eq(scheduledEmails.type, type),
        eq(scheduledEmails.targetId, targetId),
        eq(scheduledEmails.status, "sent")
      )
    )
    .limit(1);
  return result.length > 0;
}

// ─── Agent Availability ───────────────────────────────────

export async function getAgentBookingsInDateRange(
  agentId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.assignedAgentId, agentId),
        sql`${bookings.status} IN ('confirmed', 'in_progress')`,
        sql`${bookings.arrivalDate} <= ${endDate}`,
        sql`${bookings.departureDate} >= ${startDate}`
      )
    );
}

// ─── Financial Auto-Generation ────────────────────────────

export async function generateDefaultFinancialRecords(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error("Booking not found");

  // Check if records already exist
  const existing = await getFinancialRecordsByBookingId(bookingId);
  if (existing.length > 0) return existing;

  // Calculate average costs from historical data
  const allRecords = await db.select().from(financialRecords);
  const costRecords = allRecords.filter(r => r.type === "cost");

  function avgCostByCategory(category: string): number {
    const matching = costRecords.filter(r => r.category === category);
    if (matching.length === 0) return 0;
    return Math.round(
      matching.reduce((sum, r) => sum + r.amount, 0) / matching.length
    );
  }

  const records: InsertFinancialRecord[] = [];
  const guests = booking.numberOfAdults + (booking.numberOfChildren ?? 0);

  // Revenue record from booking price
  if (booking.totalPrice) {
    records.push({
      bookingId,
      type: "revenue",
      category: "tour_package",
      amount: booking.totalPrice,
      currency: "THB",
      description: `Tour package for ${guests} guests`,
    });
  }

  // Cost records based on selected services
  if (booking.includesGuide) {
    const avg = avgCostByCategory("guide_salary");
    records.push({
      bookingId,
      type: "cost",
      category: "guide_salary",
      amount: avg || 2000,
      currency: "THB",
      description: "Guide salary (estimated)",
    });
  }

  if (booking.includesHotels) {
    const avg = avgCostByCategory("hotel_cost");
    records.push({
      bookingId,
      type: "cost",
      category: "hotel_cost",
      amount: avg || 3000,
      currency: "THB",
      description: `Hotel cost for ${guests} guests (estimated)`,
    });
  }

  if (booking.includesFood) {
    const avg = avgCostByCategory("food_cost");
    records.push({
      bookingId,
      type: "cost",
      category: "food_cost",
      amount: avg || 1500,
      currency: "THB",
      description: `Kosher food for ${guests} guests (estimated)`,
    });
  }

  if (booking.includesTrip) {
    const avg = avgCostByCategory("vehicle_rental");
    records.push({
      bookingId,
      type: "cost",
      category: "vehicle_rental",
      amount: avg || 2500,
      currency: "THB",
      description: "4x4 vehicle rental (estimated)",
    });
  }

  // Insert all records
  for (const record of records) {
    await db.insert(financialRecords).values(record);
  }

  return records;
}

// ─── Lead Scoring ─────────────────────────────────────────

export async function updateLeadScore(leadId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(leads)
    .set({ score: Math.max(0, Math.min(100, Math.round(score))) })
    .where(eq(leads.id, leadId));
}

// ─── Reminder Scheduler Queries ──────────────────────────

/**
 * Get confirmed bookings with arrivalDate within 24-48 hours that haven't had a reminder sent.
 */
export async function getBookingsNeedingReminder() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        sql`${bookings.reminderSentAt} IS NULL`,
        sql`${bookings.arrivalDate} >= ${in24h}`,
        sql`${bookings.arrivalDate} <= ${in48h}`
      )
    );
}

/**
 * Get completed bookings where departureDate was ~1 day ago and no feedback email has been sent.
 */
export async function getBookingsNeedingFeedback() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  return await db
    .select()
    .from(bookings)
    .where(
      and(
        sql`${bookings.feedbackSentAt} IS NULL`,
        sql`${bookings.departureDate} <= ${oneDayAgo}`,
        sql`${bookings.departureDate} >= ${twoDaysAgo}`,
        sql`${bookings.status} IN ('completed', 'confirmed', 'in_progress')`
      )
    );
}

/**
 * Mark a booking as having had its reminder email sent.
 */
export async function markReminderSent(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(bookings)
    .set({ reminderSentAt: new Date() } as any)
    .where(eq(bookings.id, bookingId));
}

/**
 * Mark a booking as having had its feedback email sent.
 */
export async function markFeedbackSent(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(bookings)
    .set({ feedbackSentAt: new Date() } as any)
    .where(eq(bookings.id, bookingId));
}

// ─── Chat Concierge ──────────────────────────────────────

export async function createChatSession(data: {
  visitorId: string;
  language: "en" | "he";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(chatSessions)
    .values({ visitorId: data.visitorId, language: data.language })
    .$returningId();
  return result.id;
}

export async function getChatSessionByVisitorId(visitorId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(chatSessions)
    .where(
      and(
        eq(chatSessions.visitorId, visitorId),
        sql`${chatSessions.mode} != 'closed'`
      )
    )
    .orderBy(desc(chatSessions.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getChatMessagesBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

export async function addChatMessage(data: {
  sessionId: number;
  role: "visitor" | "ai" | "agent";
  content: string;
  metadata?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(chatMessages)
    .values({
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      metadata: data.metadata ?? null,
    })
    .$returningId();
  return result.id;
}

export async function updateChatSessionMode(
  id: number,
  mode: "ai" | "human" | "closed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ mode })
    .where(eq(chatSessions.id, id));
}

export async function updateChatSessionSummary(id: number, summary: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ summary })
    .where(eq(chatSessions.id, id));
}

export async function updateChatSessionBookingContext(
  id: number,
  bookingContext: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ bookingContext })
    .where(eq(chatSessions.id, id));
}

export async function closeChatSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ mode: "closed", closedAt: new Date() })
    .where(eq(chatSessions.id, id));
}

export async function getAllChatSessionsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(chatSessions)
    .orderBy(desc(chatSessions.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatSessions);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

// ─── CRM: Customers ──────────────────────────────────────

export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return result;
}

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc(customers.updatedAt));
}

export async function getAllCustomersPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.updatedAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, phone))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCustomer(
  id: number,
  data: Partial<InsertCustomer>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(customerActivities)
    .where(eq(customerActivities.customerId, id));
  return await db.delete(customers).where(eq(customers.id, id));
}

export async function getCustomersByStage(stage: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customers)
    .where(eq(customers.stage, stage as any))
    .orderBy(desc(customers.updatedAt));
}

// ─── CRM: Customer Activities ─────────────────────────────

export async function createCustomerActivity(activity: InsertCustomerActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(customerActivities).values(activity);
}

export async function getActivitiesByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customerActivities)
    .where(eq(customerActivities.customerId, customerId))
    .orderBy(desc(customerActivities.createdAt));
}

export async function completeActivity(activityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(customerActivities)
    .set({ isCompleted: 1 })
    .where(eq(customerActivities.id, activityId));
}

export async function getPendingFollowUps() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customerActivities)
    .where(
      and(
        eq(customerActivities.type, "follow_up"),
        eq(customerActivities.isCompleted, 0)
      )
    )
    .orderBy(customerActivities.dueDate);
}

// ─── CRM: Pipeline Stats ─────────────────────────────────

export async function getCustomerPipelineStats() {
  const db = await getDb();
  if (!db) return { prospect: 0, active: 0, completed: 0, vip: 0, inactive: 0 };
  const all = await db.select().from(customers);
  return {
    prospect: all.filter(c => c.stage === "prospect").length,
    active: all.filter(c => c.stage === "active").length,
    completed: all.filter(c => c.stage === "completed").length,
    vip: all.filter(c => c.stage === "vip").length,
    inactive: all.filter(c => c.stage === "inactive").length,
  };
}

// ─── CRM: Customer Timeline (merged view) ─────────────────

export async function getCustomerTimeline(email?: string, phone?: string) {
  const db = await getDb();
  if (!db) return [];

  const timeline: Array<{
    date: Date;
    type: string;
    title: string;
    detail: string;
    source: string;
  }> = [];

  if (email) {
    const matchedLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email));
    for (const lead of matchedLeads) {
      timeline.push({
        date: lead.createdAt,
        type: "lead",
        title: `Lead created (${lead.source})`,
        detail: lead.message ?? "",
        source: "leads",
      });
    }

    const matchedBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.contactEmail, email));
    for (const booking of matchedBookings) {
      timeline.push({
        date: booking.createdAt,
        type: "booking",
        title: `Booking #${booking.id} — ${booking.status}`,
        detail: `${booking.numberOfAdults} adults, ${booking.arrivalDate.toLocaleDateString()} - ${booking.departureDate.toLocaleDateString()}`,
        source: "bookings",
      });
    }

    const matchedReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.email, email));
    for (const review of matchedReviews) {
      timeline.push({
        date: review.createdAt,
        type: "review",
        title: `Review — ${review.rating}/5 stars`,
        detail: review.text.substring(0, 100),
        source: "reviews",
      });
    }
  }

  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
  return timeline;
}

// ─── CRM: Find or Create Customer ────────────────────────

export async function findOrCreateCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  if (data.email) {
    const existing = await getCustomerByEmail(data.email);
    if (existing) return existing.id;
  }

  if (data.phone) {
    const existing = await getCustomerByPhone(data.phone);
    if (existing) return existing.id;
  }

  const result = await db.insert(customers).values({
    name: data.name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    source: data.source ?? "website",
    stage: "prospect",
  });

  const insertId = (result as any)[0]?.insertId;
  return insertId ?? null;
}

// ─── Admin: User Management ───────────────────────────────

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
