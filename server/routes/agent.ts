import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getBookingsByAgentId,
  getAgentPerformanceStats,
} from "../db";
import { agentInputSchema } from "../../shared/schemas";

export const agentRouter = router({
  create: secureProtectedProcedure
    .input(agentInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createAgent(input);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "agent",
        newValue: JSON.stringify(input),
      });
      return { success: true, message: "Agent created successfully" };
    }),

  list: secureProtectedProcedure.query(async () => {
    return await getAllAgents();
  }),

  getById: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getAgentById(input.id);
    }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: agentInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateAgent(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "agent",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteAgent(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "agent",
        resourceId: input.id,
      });
      return { success: true };
    }),

  bookings: secureProtectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      return await getBookingsByAgentId(input.agentId);
    }),

  stats: secureProtectedProcedure.query(async () => {
    return await getAgentPerformanceStats();
  }),
});
