import { z } from "zod";
import {
  router,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  getTourAvailabilityByRange,
  upsertTourAvailability,
  bulkUpdateTourAvailability,
  getTourById,
} from "../db";

export const availabilityRouter = router({
  /**
   * Public: Get availability for a tour for a given month.
   * Returns array of { date, available, isBlocked, notes }.
   * Dates without records are considered fully available (default 10 slots).
   */
  getByTour: securePublicProcedure
    .input(
      z.object({
        tourId: z.number(),
        year: z.number().min(2024).max(2030),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ input }) => {
      const { tourId, year, month } = input;

      // Build date range for the month
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const records = await getTourAvailabilityByRange(
        tourId,
        startDate,
        endDate
      );

      // Build a map of date -> record
      const recordMap = new Map(records.map(r => [r.date, r]));

      // Get the tour's max group size for default slots
      const tour = await getTourById(tourId);
      const defaultSlots = tour?.groupMaxSize ?? 10;

      // Generate entries for every day of the month
      const result: {
        date: string;
        available: number;
        isBlocked: boolean;
        notes: string | null;
        maxSlots: number;
        bookedSlots: number;
      }[] = [];

      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const record = recordMap.get(dateStr);

        if (record) {
          result.push({
            date: dateStr,
            available: record.isBlocked
              ? 0
              : record.maxSlots - record.bookedSlots,
            isBlocked: record.isBlocked === 1,
            notes: record.notes,
            maxSlots: record.maxSlots,
            bookedSlots: record.bookedSlots,
          });
        } else {
          result.push({
            date: dateStr,
            available: defaultSlots,
            isBlocked: false,
            notes: null,
            maxSlots: defaultSlots,
            bookedSlots: 0,
          });
        }
      }

      return result;
    }),

  /**
   * Admin: Update availability for a specific tour+date.
   */
  update: secureProtectedProcedure
    .input(
      z.object({
        tourId: z.number(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        maxSlots: z.number().min(0).max(100).optional(),
        isBlocked: z.boolean().optional(),
        notes: z.string().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const { tourId, date, maxSlots, isBlocked, notes } = input;
      await upsertTourAvailability(tourId, date, {
        maxSlots,
        isBlocked: isBlocked !== undefined ? (isBlocked ? 1 : 0) : undefined,
        notes,
      });
      void logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tourAvailability",
        resourceId: tourId,
        newValue: JSON.stringify({ tourId, date, maxSlots, isBlocked, notes }),
      });
      return { success: true };
    }),

  /**
   * Admin: Bulk update a range of dates (block/unblock).
   */
  bulkUpdate: secureProtectedProcedure
    .input(
      z.object({
        tourId: z.number(),
        dates: z
          .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
          .min(1)
          .max(90),
        maxSlots: z.number().min(0).max(100).optional(),
        isBlocked: z.boolean().optional(),
        notes: z.string().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const { tourId, dates, maxSlots, isBlocked, notes } = input;
      await bulkUpdateTourAvailability(tourId, dates, {
        maxSlots,
        isBlocked: isBlocked !== undefined ? (isBlocked ? 1 : 0) : undefined,
        notes,
      });
      void logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tourAvailability",
        resourceId: tourId,
        newValue: JSON.stringify({
          tourId,
          dateCount: dates.length,
          isBlocked,
          notes,
        }),
      });
      return { success: true };
    }),
});
