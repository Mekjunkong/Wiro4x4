import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import { getSetting, getAllSettings, upsertSetting } from "../db";
import { settingsUpdateSchema } from "../../shared/schemas";

export const settingsRouter = router({
  getAll: secureProtectedProcedure.query(async () => {
    const rows = await getAllSettings();
    const map: Record<string, unknown> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }),

  get: secureProtectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return getSetting(input.key);
    }),

  update: secureProtectedProcedure
    .input(settingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      checkAdminRateLimit(ctx);
      await upsertSetting(input.key, input.value);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update_setting",
        resourceType: "settings",
        newValue: JSON.stringify({ key: input.key, value: input.value }),
      });
      return { success: true };
    }),
});
