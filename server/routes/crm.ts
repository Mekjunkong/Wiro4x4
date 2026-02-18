import { z } from "zod";
import {
  router,
  secureManagerProcedure,
  secureOwnerProcedure,
  secureAgentProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createCustomer,
  getAllCustomersPaginated,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  createCustomerActivity,
  getActivitiesByCustomerId,
  completeActivity,
  getCustomerPipelineStats,
  getCustomerTimeline,
} from "../db";
import {
  customerInputSchema,
  customerActivityInputSchema,
  paginationInput,
} from "../../shared/schemas";

export const crmRouter = router({
  listCustomers: secureManagerProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllCustomersPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  getCustomer: secureManagerProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const customer = await getCustomerById(input.id);
      if (!customer) return null;
      const activities = await getActivitiesByCustomerId(input.id);
      const timeline = await getCustomerTimeline(
        customer.email ?? undefined,
        customer.phone ?? undefined
      );
      return { customer, activities, timeline };
    }),

  createCustomer: secureManagerProcedure
    .input(customerInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createCustomer(input);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "customer",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),

  updateCustomer: secureManagerProcedure
    .input(z.object({ id: z.number(), data: customerInputSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateCustomer(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "customer",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  deleteCustomer: secureOwnerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteCustomer(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "customer",
        resourceId: input.id,
      });
      return { success: true };
    }),

  addActivity: secureAgentProcedure
    .input(customerActivityInputSchema)
    .mutation(async ({ input, ctx }) => {
      await createCustomerActivity({
        ...input,
        createdBy: ctx.user?.name ?? ctx.user?.email ?? "unknown",
      });
      await updateCustomer(input.customerId, { lastContactAt: new Date() });
      return { success: true };
    }),

  completeActivity: secureAgentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await completeActivity(input.id);
      return { success: true };
    }),

  getPipelineStats: secureManagerProcedure.query(async () => {
    return await getCustomerPipelineStats();
  }),

  movePipeline: secureManagerProcedure
    .input(
      z.object({
        customerId: z.number(),
        stage: z.enum(["prospect", "active", "completed", "vip", "inactive"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateCustomer(input.customerId, { stage: input.stage });
      await createCustomerActivity({
        customerId: input.customerId,
        type: "status_change",
        content: `Stage changed to ${input.stage}`,
        createdBy: ctx.user?.name ?? "unknown",
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "customer",
        resourceId: input.customerId,
        newValue: JSON.stringify({ stage: input.stage }),
      });
      return { success: true };
    }),
});
