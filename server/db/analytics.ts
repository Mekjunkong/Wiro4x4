import { sql, eq, count, sum, desc, gte, and, asc } from "drizzle-orm";
import { getDb } from "./connection";
import {
  bookings,
  leads,
  financialRecords,
  reviews,
  subscribers,
} from "../../drizzle/schema";

/** Overview KPI metrics for the analytics dashboard. */
export async function getAnalyticsOverview() {
  const db = await getDb();
  if (!db)
    return {
      totalRevenue: 0,
      totalBookings: 0,
      bookingsThisMonth: 0,
      bookingsLastMonth: 0,
      totalLeads: 0,
      leadsThisMonth: 0,
      convertedLeads: 0,
      activeSubscribers: 0,
      avgRating: 0,
      totalReviews: 0,
    };

  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Total revenue
  const [revenueRow] = await db
    .select({ total: sum(financialRecords.amount) })
    .from(financialRecords)
    .where(eq(financialRecords.type, "revenue"));

  // Total bookings
  const [totalBookingsRow] = await db.select({ value: count() }).from(bookings);

  // Bookings this month
  const [bookingsThisMonthRow] = await db
    .select({ value: count() })
    .from(bookings)
    .where(gte(bookings.createdAt, firstOfThisMonth));

  // Bookings last month
  const [bookingsLastMonthRow] = await db
    .select({ value: count() })
    .from(bookings)
    .where(
      and(
        gte(bookings.createdAt, firstOfLastMonth),
        sql`${bookings.createdAt} < ${firstOfThisMonth}`
      )
    );

  // Total leads
  const [totalLeadsRow] = await db.select({ value: count() }).from(leads);

  // Leads this month
  const [leadsThisMonthRow] = await db
    .select({ value: count() })
    .from(leads)
    .where(gte(leads.createdAt, firstOfThisMonth));

  // Converted leads
  const [convertedLeadsRow] = await db
    .select({ value: count() })
    .from(leads)
    .where(eq(leads.status, "converted"));

  // Active subscribers
  const [subsRow] = await db
    .select({ value: count() })
    .from(subscribers)
    .where(eq(subscribers.isActive, 1));

  // Average rating
  const [ratingRow] = await db
    .select({
      avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as("avg"),
      total: count(),
    })
    .from(reviews)
    .where(eq(reviews.isApproved, 1));

  return {
    totalRevenue: Number(revenueRow?.total ?? 0),
    totalBookings: totalBookingsRow?.value ?? 0,
    bookingsThisMonth: bookingsThisMonthRow?.value ?? 0,
    bookingsLastMonth: bookingsLastMonthRow?.value ?? 0,
    totalLeads: totalLeadsRow?.value ?? 0,
    leadsThisMonth: leadsThisMonthRow?.value ?? 0,
    convertedLeads: convertedLeadsRow?.value ?? 0,
    activeSubscribers: subsRow?.value ?? 0,
    avgRating:
      Math.round((Number(ratingRow?.avg ?? 0) + Number.EPSILON) * 10) / 10,
    totalReviews: ratingRow?.total ?? 0,
  };
}

/** Revenue grouped by month for the last 12 months. */
export async function getRevenueByMonth() {
  const db = await getDb();
  if (!db) return [];

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      month:
        sql<string>`DATE_FORMAT(${financialRecords.createdAt}, '%Y-%m')`.as(
          "month"
        ),
      total: sum(financialRecords.amount),
    })
    .from(financialRecords)
    .where(
      and(
        eq(financialRecords.type, "revenue"),
        gte(financialRecords.createdAt, twelveMonthsAgo)
      )
    )
    .groupBy(sql`DATE_FORMAT(${financialRecords.createdAt}, '%Y-%m')`)
    .orderBy(sql`month`);

  // Fill in missing months with 0
  const result: { month: string; total: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = rows.find(r => r.month === key);
    result.push({ month: key, total: Number(found?.total ?? 0) });
  }
  return result;
}

/** Booking count grouped by month for the last 12 months. */
export async function getBookingsByMonth() {
  const db = await getDb();
  if (!db) return [];

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      month: sql<string>`DATE_FORMAT(${bookings.createdAt}, '%Y-%m')`.as(
        "month"
      ),
      total: count(),
    })
    .from(bookings)
    .where(gte(bookings.createdAt, twelveMonthsAgo))
    .groupBy(sql`DATE_FORMAT(${bookings.createdAt}, '%Y-%m')`)
    .orderBy(sql`month`);

  const result: { month: string; total: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = rows.find(r => r.month === key);
    result.push({ month: key, total: found?.total ?? 0 });
  }
  return result;
}

/** Lead funnel: count by status. */
export async function getLeadFunnel() {
  const db = await getDb();
  if (!db) return { new: 0, contacted: 0, quoted: 0, converted: 0, lost: 0 };

  const rows = await db
    .select({
      status: leads.status,
      total: count(),
    })
    .from(leads)
    .groupBy(leads.status);

  const funnel = {
    new: 0,
    contacted: 0,
    quoted: 0,
    converted: 0,
    lost: 0,
  };
  for (const row of rows) {
    if (row.status in funnel) {
      funnel[row.status as keyof typeof funnel] = row.total;
    }
  }
  return funnel;
}

const EMPTY_FUNNEL = {
  new: 0,
  contacted: 0,
  quoted: 0,
  converted: 0,
  lost: 0,
};

function percentage(numerator: number, denominator: number) {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/**
 * Organic lead attribution grouped in SQL. Estimated lead value is deliberately
 * kept separate from collected financial revenue.
 */
export async function getAttributionAnalytics() {
  const db = await getDb();
  if (!db) {
    return {
      summary: {
        leads: 0,
        confirmed: 0,
        completed: 0,
        leadToConfirmedRate: 0,
        confirmedToCompletedRate: 0,
        estimatedConfirmedValueThb: 0,
      },
      sources: [],
      lossReasons: [],
      funnel: { ...EMPTY_FUNNEL },
    };
  }

  const sourceCode =
    sql<string>`COALESCE(NULLIF(TRIM(${leads.sourceCode}), ''), 'Unknown')`.as(
      "sourceCode"
    );
  const sourceChannel =
    sql<string>`COALESCE(NULLIF(TRIM(${leads.sourceChannel}), ''), 'Unknown')`.as(
      "sourceChannel"
    );

  const sourceQuery = db
    .select({
      sourceCode,
      sourceChannel,
      leads: count(),
      confirmed:
        sql<number>`SUM(CASE WHEN ${leads.status} = 'converted' THEN 1 ELSE 0 END)`.as(
          "confirmed"
        ),
      completed:
        sql<number>`SUM(CASE WHEN ${leads.completedAt} IS NOT NULL OR ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`.as(
          "completed"
        ),
      estimatedConfirmedValueThb:
        sql<number>`COALESCE(SUM(CASE WHEN ${leads.status} = 'converted' THEN COALESCE(${leads.estimatedValueThb}, 0) ELSE 0 END), 0)`.as(
          "estimatedConfirmedValueThb"
        ),
    })
    .from(leads)
    .leftJoin(bookings, eq(leads.convertedToBookingId, bookings.id))
    .groupBy(sourceCode, sourceChannel)
    .orderBy(desc(count()), asc(sourceCode), asc(sourceChannel))
    .limit(100);

  const lossReason =
    sql<string>`COALESCE(NULLIF(TRIM(${leads.lostReason}), ''), 'Unknown')`.as(
      "reason"
    );
  const lossQuery = db
    .select({
      reason: lossReason,
      count: count(),
    })
    .from(leads)
    .where(eq(leads.status, "lost"))
    .groupBy(lossReason)
    .orderBy(desc(count()), asc(lossReason))
    .limit(50);

  const funnelQuery = db
    .select({
      status: leads.status,
      count: count(),
    })
    .from(leads)
    .groupBy(leads.status)
    .orderBy(asc(leads.status));

  const [sourceRows, lossRows, funnelRows] = await Promise.all([
    sourceQuery,
    lossQuery,
    funnelQuery,
  ]);

  const sources = sourceRows
    .map(row => {
      const leadCount = Number(row.leads ?? 0);
      const confirmed = Number(row.confirmed ?? 0);
      const completed = Number(row.completed ?? 0);
      return {
        sourceCode: row.sourceCode || "Unknown",
        sourceChannel: row.sourceChannel || "Unknown",
        leads: leadCount,
        confirmed,
        completed,
        leadToConfirmedRate: percentage(confirmed, leadCount),
        confirmedToCompletedRate: percentage(completed, confirmed),
        estimatedConfirmedValueThb: Number(row.estimatedConfirmedValueThb ?? 0),
      };
    })
    .sort(
      (a, b) =>
        b.leads - a.leads ||
        a.sourceCode.localeCompare(b.sourceCode) ||
        a.sourceChannel.localeCompare(b.sourceChannel)
    );

  const lossReasons = lossRows
    .map(row => ({
      reason: row.reason || "Unknown",
      count: Number(row.count ?? 0),
    }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));

  const funnel = { ...EMPTY_FUNNEL };
  for (const row of funnelRows) {
    if (row.status in funnel) {
      funnel[row.status as keyof typeof funnel] = Number(row.count ?? 0);
    }
  }

  const totals = sources.reduce(
    (summary, source) => ({
      leads: summary.leads + source.leads,
      confirmed: summary.confirmed + source.confirmed,
      completed: summary.completed + source.completed,
      estimatedConfirmedValueThb:
        summary.estimatedConfirmedValueThb + source.estimatedConfirmedValueThb,
    }),
    { leads: 0, confirmed: 0, completed: 0, estimatedConfirmedValueThb: 0 }
  );

  return {
    summary: {
      ...totals,
      leadToConfirmedRate: percentage(totals.confirmed, totals.leads),
      confirmedToCompletedRate: percentage(totals.completed, totals.confirmed),
    },
    sources,
    lossReasons,
    funnel,
  };
}

/** Top tours by booking count + revenue. */
export async function getTopTours(limit = 5) {
  const db = await getDb();
  if (!db) return [];

  // Count bookings per suggestedDestinations (tour name proxy)
  const rows = await db
    .select({
      tourName:
        sql<string>`COALESCE(${bookings.suggestedDestinations}, 'General Tour')`.as(
          "tourName"
        ),
      bookingCount: count(),
      revenue: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)`.as(
        "revenue"
      ),
    })
    .from(bookings)
    .groupBy(sql`tourName`)
    .orderBy(desc(count()))
    .limit(limit);

  return rows.map(r => ({
    tourName: r.tourName,
    bookingCount: r.bookingCount,
    revenue: Number(r.revenue),
  }));
}

/** Recent activity: last N bookings + leads combined. */
export async function getRecentActivity(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const recentBookings = await db
    .select({
      id: bookings.id,
      name: bookings.contactName,
      type: sql<string>`'booking'`.as("type"),
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(limit);

  const recentLeads = await db
    .select({
      id: leads.id,
      name: leads.name,
      type: sql<string>`'lead'`.as("type"),
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit);

  const combined = [...recentBookings, ...recentLeads]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);

  return combined;
}
