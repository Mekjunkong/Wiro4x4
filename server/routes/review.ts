import { z } from "zod";
import {
  router,
  TRPCError,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  checkRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createReview,
  getApprovedReviews,
  getAllReviews,
  getAllReviewsPaginated,
  updateReview,
  deleteReview,
  getReviewStats,
  bulkApproveReviews,
  bulkDeleteReviews,
} from "../db";
import { paginationInput } from "../../shared/schemas";

export const reviewRouter = router({
  create: securePublicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        rating: z.number().min(1).max(5),
        text: z.string().min(1, "Review text is required"),
        tourType: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string) ||
        (ctx.req.headers["x-real-ip"] as string) ||
        "unknown";
      const { allowed } = checkRateLimit(`review:${ip}`, 5, 60_000);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many review submissions. Please try again in a minute.",
        });
      }
      await createReview({
        ...input,
        isApproved: 0,
        isPublished: 0,
      });
      return { success: true, message: "Review submitted for approval" };
    }),

  listPublic: securePublicProcedure.query(async () => {
    return await getApprovedReviews();
  }),

  listAll: secureProtectedProcedure.query(async () => {
    const all = await getAllReviews();
    return all.map(r => ({
      ...r,
      status:
        r.isApproved === 1
          ? ("approved" as const)
          : r.isPublished === 0 && r.isApproved === 0
            ? ("pending" as const)
            : ("rejected" as const),
    }));
  }),

  listAllPaginated: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllReviewsPaginated(page, pageSize);
      return {
        items: items.map(r => ({
          ...r,
          status:
            r.isApproved === 1
              ? ("approved" as const)
              : r.isPublished === 0 && r.isApproved === 0
                ? ("pending" as const)
                : ("rejected" as const),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  stats: secureProtectedProcedure.query(async () => {
    return await getReviewStats();
  }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["pending", "approved", "rejected"]).optional(),
          adminResponse: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData: Record<string, unknown> = {};
      if (input.data.adminResponse !== undefined)
        updateData.adminResponse = input.data.adminResponse;
      if (input.data.status === "approved") {
        updateData.isApproved = 1;
        updateData.isPublished = 1;
      } else if (input.data.status === "rejected") {
        updateData.isApproved = 0;
        updateData.isPublished = 0;
      } else if (input.data.status === "pending") {
        updateData.isApproved = 0;
        updateData.isPublished = 0;
      }
      await updateReview(input.id, updateData as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "review",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteReview(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "review",
        resourceId: input.id,
      });
      return { success: true };
    }),

  bulkApprove: secureProtectedProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await bulkApproveReviews(input.ids);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "review",
        newValue: JSON.stringify({ ids: input.ids, action: "bulk_approve" }),
      });
      return { success: true, approved: input.ids.length };
    }),

  bulkDelete: secureProtectedProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await bulkDeleteReviews(input.ids);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "review",
        newValue: JSON.stringify({ ids: input.ids }),
      });
      return { success: true, deleted: input.ids.length };
    }),
});
