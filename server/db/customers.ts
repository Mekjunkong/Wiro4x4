import { eq } from "drizzle-orm";
import { desc, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
  customers,
  customerActivities,
  leads,
  bookings,
  reviews,
  InsertCustomer,
  InsertCustomerActivity,
} from "../../drizzle/schema";

// ─── Customer CRUD ────────────────────────────────────────

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

// ─── Customer Activities ──────────────────────────────────

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
    .where(eq(customerActivities.type, "follow_up"))
    .orderBy(customerActivities.dueDate);
}

// ─── Pipeline Stats ───────────────────────────────────────

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

// ─── Customer Timeline ────────────────────────────────────

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

  const seenIds = new Set<string>();

  // Match leads by email or phone
  if (email) {
    const matchedLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email));
    for (const lead of matchedLeads) {
      const key = `lead-${lead.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        timeline.push({
          date: lead.createdAt,
          type: "lead",
          title: `Lead created (${lead.source})`,
          detail: lead.message ?? "",
          source: "leads",
        });
      }
    }
  }
  if (phone) {
    const phoneLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.phone, phone));
    for (const lead of phoneLeads) {
      const key = `lead-${lead.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        timeline.push({
          date: lead.createdAt,
          type: "lead",
          title: `Lead created (${lead.source})`,
          detail: lead.message ?? "",
          source: "leads",
        });
      }
    }
  }

  // Match bookings by email or phone
  if (email) {
    const matchedBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.contactEmail, email));
    for (const booking of matchedBookings) {
      const key = `booking-${booking.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        timeline.push({
          date: booking.createdAt,
          type: "booking",
          title: `Booking #${booking.id} — ${booking.status}`,
          detail: `${booking.numberOfAdults} adults, ${booking.arrivalDate.toLocaleDateString()} - ${booking.departureDate.toLocaleDateString()}`,
          source: "bookings",
        });
      }
    }
  }
  if (phone) {
    const phoneBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.contactPhone, phone));
    for (const booking of phoneBookings) {
      const key = `booking-${booking.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        timeline.push({
          date: booking.createdAt,
          type: "booking",
          title: `Booking #${booking.id} — ${booking.status}`,
          detail: `${booking.numberOfAdults} adults, ${booking.arrivalDate.toLocaleDateString()} - ${booking.departureDate.toLocaleDateString()}`,
          source: "bookings",
        });
      }
    }
  }

  // Match reviews by email only
  if (email) {
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

// ─── Find or Create ───────────────────────────────────────

export async function findOrCreateCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  // Check by email first
  if (data.email) {
    const existing = await getCustomerByEmail(data.email);
    if (existing) return existing.id;
  }

  // Check by phone
  if (data.phone) {
    const existing = await getCustomerByPhone(data.phone);
    if (existing) return existing.id;
  }

  // Insert new customer; re-check on failure to handle race conditions
  try {
    const result = await db.insert(customers).values({
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      source: data.source ?? "website",
      stage: "prospect",
    });
    const insertId = (result as any)[0]?.insertId;
    return insertId ?? null;
  } catch {
    // Race condition: another request created the same customer — re-lookup
    if (data.email) {
      const existing = await getCustomerByEmail(data.email);
      if (existing) return existing.id;
    }
    if (data.phone) {
      const existing = await getCustomerByPhone(data.phone);
      if (existing) return existing.id;
    }
    return null;
  }
}
