import { sql } from "drizzle-orm";
import {
  router,
  TRPCError,
  securePublicProcedure,
  captureException,
} from "./_helpers";
import { getDb } from "../db";

export const healthRouter = router({
  readiness: securePublicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }
    try {
      await db.select({ val: sql`1` }).from(sql`dual`);
      return { status: "ready", database: "connected" };
    } catch (err) {
      captureException(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database check failed",
      });
    }
  }),
  liveness: securePublicProcedure.query(() => {
    return { status: "alive", timestamp: new Date().toISOString() };
  }),
});
