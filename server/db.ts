import { eq } from "drizzle-orm";
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

import { bookings, agents, leads, financialRecords, InsertBooking, InsertAgent, InsertLead, InsertFinancialRecord } from "../drizzle/schema";
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
