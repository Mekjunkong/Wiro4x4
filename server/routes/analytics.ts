import { router, secureProtectedProcedure } from "./_helpers";
import { getDb } from "../db";
import { bookings, bookingDrafts } from "../../drizzle/schema";
import { count, gte } from "drizzle-orm";

export const analyticsRouter = router({
  funnelData: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { steps: [], conversionRate: 0 };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [completedResult] = await db
      .select({ count: count() })
      .from(bookings)
      .where(gte(bookings.createdAt, thirtyDaysAgo));

    const [draftsResult] = await db
      .select({ count: count() })
      .from(bookingDrafts)
      .where(gte(bookingDrafts.createdAt, thirtyDaysAgo));

    const completed = completedResult?.count ?? 0;
    const abandoned = draftsResult?.count ?? 0;
    const started = completed + abandoned;

    return {
      steps: [
        {
          name: "Bookings Started",
          nameHe:
            "\u05D4\u05D6\u05DE\u05E0\u05D5\u05EA \u05D4\u05EA\u05D7\u05D9\u05DC\u05D5",
          count: started,
        },
        {
          name: "Completed",
          nameHe: "\u05D4\u05D5\u05E9\u05DC\u05DE\u05D5",
          count: completed,
        },
        {
          name: "Abandoned",
          nameHe: "\u05E0\u05E0\u05D8\u05E9\u05D5",
          count: abandoned,
        },
      ],
      conversionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
    };
  }),
});
