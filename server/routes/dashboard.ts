import { sql, eq, and, gte, lte, count, sum } from "drizzle-orm";
import { router, secureProtectedProcedure } from "./_helpers";
import { getDb } from "../db";
import {
  bookings,
  leads,
  financialRecords,
  reviews,
  blogPosts,
  customers,
} from "../../drizzle/schema";

export const dashboardRouter = router({
  stats: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        bookingsByDay: [],
        revenueByDay: [],
        leadConversion: { total: 0, converted: 0, rate: 0 },
        upcomingTours: [],
        pendingBookings: 0,
        newLeads: 0,
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Bookings last 30 days - grouped by date
    const bookingsByDay = await db
      .select({
        date: sql<string>`DATE(${bookings.createdAt})`.as("date"),
        count: count().as("count"),
      })
      .from(bookings)
      .where(gte(bookings.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${bookings.createdAt})`)
      .orderBy(sql`DATE(${bookings.createdAt})`);

    // Revenue last 30 days - grouped by date
    const revenueByDay = await db
      .select({
        date: sql<string>`DATE(${financialRecords.createdAt})`.as("date"),
        total: sum(financialRecords.amount).as("total"),
      })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.type, "revenue"),
          gte(financialRecords.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${financialRecords.createdAt})`)
      .orderBy(sql`DATE(${financialRecords.createdAt})`);

    // Lead conversion rate
    const [leadStats] = await db
      .select({
        total: count().as("total"),
        converted:
          sql<number>`SUM(CASE WHEN ${leads.status} = 'converted' THEN 1 ELSE 0 END)`.as(
            "converted"
          ),
      })
      .from(leads);

    // Upcoming tours (next 7 days)
    const upcomingTours = await db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.arrivalDate, sql`CURDATE()`),
          lte(bookings.arrivalDate, sevenDaysFromNow),
          sql`${bookings.status} IN ('confirmed', 'in_progress')`
        )
      )
      .orderBy(bookings.arrivalDate)
      .limit(10);

    // Pending bookings
    const [pendingCount] = await db
      .select({ count: count().as("count") })
      .from(bookings)
      .where(eq(bookings.status, "pending"));

    // New leads (unconverted)
    const [newLeadsCount] = await db
      .select({ count: count().as("count") })
      .from(leads)
      .where(eq(leads.status, "new"));

    return {
      bookingsByDay: bookingsByDay.map(r => ({
        date: r.date,
        count: Number(r.count),
      })),
      revenueByDay: revenueByDay.map(r => ({
        date: r.date,
        total: Number(r.total) || 0,
      })),
      leadConversion: {
        total: Number(leadStats?.total) || 0,
        converted: Number(leadStats?.converted) || 0,
        rate:
          leadStats?.total && Number(leadStats.total) > 0
            ? Math.round(
                (Number(leadStats.converted) / Number(leadStats.total)) * 100
              )
            : 0,
      },
      upcomingTours,
      pendingBookings: Number(pendingCount?.count) || 0,
      newLeads: Number(newLeadsCount?.count) || 0,
    };
  }),

  badgeCounts: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        crm: 0,
        bookings: 0,
        calendar: 0,
        leads: 0,
        reviews: 0,
        blog: 0,
      };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const [pendingBookings] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, "pending"));

    const [newLeads] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.status, "new"));

    const [pendingReviews] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.isApproved, 0));

    const [draftPosts] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, 0));

    const [newCustomers] = await db
      .select({ count: count() })
      .from(customers)
      .where(gte(customers.createdAt, weekAgo));

    const [todayTours] = await db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          gte(bookings.arrivalDate, sql`CURDATE()`),
          lte(bookings.arrivalDate, tomorrow),
          sql`${bookings.status} IN ('confirmed', 'in_progress')`
        )
      );

    return {
      crm: Number(newCustomers?.count) || 0,
      bookings: Number(pendingBookings?.count) || 0,
      calendar: Number(todayTours?.count) || 0,
      leads: Number(newLeads?.count) || 0,
      reviews: Number(pendingReviews?.count) || 0,
      blog: Number(draftPosts?.count) || 0,
    };
  }),
});
