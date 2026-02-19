import { eq, sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { financialRecords, InsertFinancialRecord } from "../../drizzle/schema";
import { getBookingById } from "./bookings";

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
