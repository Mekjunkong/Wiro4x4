import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createInventoryItem,
  getAllInventoryPaginated,
  getInventoryById,
  updateInventoryItem,
  deleteInventoryItem,
  getInventorySummary,
} from "../db";
import { inventoryInputSchema, paginationInput } from "../../shared/schemas";
import { calculateDepreciation } from "../../shared/accounting";

export const inventoryRouter = router({
  create: secureProtectedProcedure
    .input(inventoryInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      // Auto-calculate depreciation if purchase cost and useful life provided
      let monthlyDepreciation: number | undefined;
      let currentValue: number | undefined;
      if (input.purchaseCost && input.usefulLifeMonths) {
        const dep = calculateDepreciation(
          input.purchaseCost,
          input.usefulLifeMonths
        );
        monthlyDepreciation = dep.monthlyAmount;
        currentValue = input.currentValue ?? dep.currentValue;
      }

      await createInventoryItem({
        ...input,
        monthlyDepreciation,
        currentValue,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "inventory",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  list: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllInventoryPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  get: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getInventoryById(input.id);
    }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: inventoryInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateInventoryItem(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "inventory",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteInventoryItem(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "inventory",
        resourceId: input.id,
      });
      return { success: true };
    }),

  summary: secureProtectedProcedure.query(async () => {
    return await getInventorySummary();
  }),
});
