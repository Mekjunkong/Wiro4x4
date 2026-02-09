import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createFinancialRecord,
  getFinancialRecordsByBookingId,
  getAllFinancialRecords,
  getAllFinancialRecordsPaginated,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialStats,
} from "../db";
import {
  financialRecordInputSchema,
  paginationInput,
} from "../../shared/schemas";

export const financialRouter = router({
  create: secureProtectedProcedure
    .input(financialRecordInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createFinancialRecord(input);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "financial",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  listByBooking: secureProtectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      return await getFinancialRecordsByBookingId(input.bookingId);
    }),

  listAll: secureProtectedProcedure.query(async () => {
    return await getAllFinancialRecords();
  }),

  listAllPaginated: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllFinancialRecordsPaginated(
        page,
        pageSize
      );
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          type: z.enum(["revenue", "cost", "refund"]).optional(),
          category: z.string().optional(),
          amount: z.number().optional(),
          description: z.string().optional(),
          paymentMethod: z.string().optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateFinancialRecord(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "financial",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteFinancialRecord(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "financial",
        resourceId: input.id,
      });
      return { success: true };
    }),

  stats: secureProtectedProcedure.query(async () => {
    return await getFinancialStats();
  }),
});
