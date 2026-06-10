import { z } from "zod";
import {
  router,
  TRPCError,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  getConfiguredPostTourReviewDelayMinutes,
  getPostTourReviewEntry,
  getRecentPostTourReviewEntries,
  getWeeklyPostTourReviewMetric,
  processDuePostTourReviewRequests,
  recordPostTourReviewEvent,
  schedulePostTourReviewForBooking,
  updatePostTourReviewDelayMinutes,
} from "../postTourReviewService";
import { dispatchN8nEventInBackground } from "../n8nAutomation";

export const postTourReviewRouter = router({
  config: secureProtectedProcedure.query(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    const delayMinutes = await getConfiguredPostTourReviewDelayMinutes();
    return { delayMinutes, min: 30, max: 60, default: 45 };
  }),

  updateConfig: secureProtectedProcedure
    .input(
      z.object({
        delayMinutes: z.number().int().min(30).max(60),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const delayMinutes = await updatePostTourReviewDelayMinutes(
        input.delayMinutes
      );

      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "postTourReviewConfig",
        resourceId: null,
        newValue: JSON.stringify({ delayMinutes }),
      });

      return { success: true, delayMinutes };
    }),

  schedule: secureProtectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        delayMinutes: z.number().int().min(30).max(60).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const entry = await schedulePostTourReviewForBooking({
        bookingId: input.bookingId,
        delayMinutes: input.delayMinutes,
      });
      if (!entry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Booking #${input.bookingId} has no WhatsApp/phone; cannot schedule review`,
        });
      }

      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "postTourReview",
        resourceId: input.bookingId,
        newValue: JSON.stringify({
          scheduledAt: entry.scheduledAt,
          delayMinutes: input.delayMinutes ?? 45,
        }),
      });
      dispatchN8nEventInBackground("post_tour_review.scheduled", {
        bookingId: input.bookingId,
        delayMinutes: input.delayMinutes ?? 45,
        entry,
      });

      return { success: true, entry };
    }),

  processDue: secureProtectedProcedure.mutation(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    const result = await processDuePostTourReviewRequests();
    dispatchN8nEventInBackground("post_tour_review.processed", {
      result,
      processedAt: new Date().toISOString(),
    });

    await logAdminAction({
      userId: ctx.user?.id,
      action: "update",
      resourceType: "postTourReview",
      resourceId: null,
      newValue: JSON.stringify(result),
    });

    return result;
  }),

  trackEvent: secureProtectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        event: z.enum(["opened", "clicked", "reviewed"]),
        rating: z.number().min(1).max(5).optional(),
        comments: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updated = await recordPostTourReviewEvent(input);

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No post-tour review entry for booking #${input.bookingId}`,
        });
      }

      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "postTourReview",
        resourceId: input.bookingId,
        newValue: JSON.stringify({
          event: input.event,
          rating: input.rating ?? null,
          escalatedAt: updated.escalatedAt,
          followUpPath: updated.opsFollowUpUrl,
        }),
      });
      dispatchN8nEventInBackground("post_tour_review.event_tracked", {
        bookingId: input.bookingId,
        event: input.event,
        rating: input.rating ?? null,
        comments: input.comments ?? null,
        entry: updated,
      });

      return { success: true, entry: updated };
    }),

  getByBooking: secureProtectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      return await getPostTourReviewEntry(input.bookingId);
    }),

  listRecent: secureProtectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).optional() }))
    .query(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      return await getRecentPostTourReviewEntries(input.limit ?? 20);
    }),

  weeklyMetric: secureProtectedProcedure.query(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    return await getWeeklyPostTourReviewMetric();
  }),
});
