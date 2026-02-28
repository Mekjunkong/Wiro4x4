import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
  invoices,
  accountingEntries,
  taxFilings,
  InsertInvoice,
  InsertAccountingEntry,
  InsertTaxFiling,
} from "../../drizzle/schema";

// ─── Invoices ────────────────────────────────────────────────

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(invoices).values(data);
}

export async function getAllInvoicesPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(invoices)
    .orderBy(desc(invoices.issuedAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateInvoiceStatus(
  id: number,
  status: "unpaid" | "paid" | "partial" | "cancelled",
  paymentDate?: Date,
  paymentMethod?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (paymentDate) updateData.paymentDate = paymentDate;
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  return await db.update(invoices).set(updateData).where(eq(invoices.id, id));
}

export async function getNextInvoiceSequence(
  prefix: string,
  yearMonth: string
) {
  const db = await getDb();
  if (!db) return 1;
  const pattern = `${prefix}-${yearMonth}-%`;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${pattern}`);
  return Number(result[0]?.count ?? 0) + 1;
}

// ─── Accounting Entries ──────────────────────────────────────

export async function createAccountingEntry(data: InsertAccountingEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(accountingEntries).values(data);
}

export async function getAccountingEntriesPaginated(
  page = 1,
  pageSize = 20,
  filters?: { accountCode?: string; startDate?: string; endDate?: string }
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (filters?.accountCode) {
    conditions.push(eq(accountingEntries.accountCode, filters.accountCode));
  }
  if (filters?.startDate) {
    conditions.push(gte(accountingEntries.date, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    conditions.push(lte(accountingEntries.date, new Date(filters.endDate)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const itemsQuery = db
    .select()
    .from(accountingEntries)
    .orderBy(desc(accountingEntries.date))
    .limit(pageSize)
    .offset(offset);

  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(accountingEntries);

  const items = whereClause
    ? await itemsQuery.where(whereClause)
    : await itemsQuery;

  const countResult = whereClause
    ? await countQuery.where(whereClause)
    : await countQuery;

  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function getTrialBalance() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      accountCode: accountingEntries.accountCode,
      totalDebit: sql<number>`SUM(${accountingEntries.debit})`,
      totalCredit: sql<number>`SUM(${accountingEntries.credit})`,
    })
    .from(accountingEntries)
    .groupBy(accountingEntries.accountCode);
  return result;
}

// ─── Tax Filings ─────────────────────────────────────────────

export async function createTaxFiling(data: InsertTaxFiling) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(taxFilings).values(data);
}

export async function getAllTaxFilingsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(taxFilings)
    .orderBy(desc(taxFilings.dueDate))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(taxFilings);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

export async function updateTaxFilingStatus(
  id: number,
  status: "pending" | "prepared" | "filed" | "late",
  filedAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (filedAt) updateData.filedAt = filedAt;
  return await db
    .update(taxFilings)
    .set(updateData)
    .where(eq(taxFilings.id, id));
}

export async function getUpcomingFilings() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(taxFilings)
    .where(
      and(eq(taxFilings.status, "pending"), gte(taxFilings.dueDate, new Date()))
    )
    .orderBy(taxFilings.dueDate);
}
