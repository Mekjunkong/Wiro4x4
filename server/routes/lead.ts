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
  createLead,
  getAllLeads,
  updateLead,
  deleteLead,
  getAllLeadsPaginated,
  bulkDeleteLeads,
  updateLeadScore,
  findOrCreateCustomer,
} from "../db";
import { leadInputSchema, paginationInput } from "../../shared/schemas";
import { sendAutoResponse } from "../autoResponse";
import { calculateLeadScore } from "../leadScoring";

export const leadRouter = router({
  create: securePublicProcedure
    .input(leadInputSchema)
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string) ||
        (ctx.req.headers["x-real-ip"] as string) ||
        "unknown";
      const { allowed } = checkRateLimit(`lead:${ip}`, 10, 60_000);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again in a minute.",
        });
      }
      await createLead(input);

      // Auto-create or link customer (non-blocking)
      findOrCreateCustomer({
        name: input.name,
        email: input.email,
        phone: input.phone || undefined,
        source: input.source || "website",
      }).catch(console.error);

      // Calculate and store lead score (async, non-blocking)
      const allLeads = await getAllLeads();
      const newLead = allLeads[0]; // Most recent lead
      if (newLead) {
        const score = calculateLeadScore(newLead as any);
        updateLeadScore(newLead.id, score).catch(err =>
          console.error("[Lead] Failed to update lead score:", err)
        );
      }

      // Send AI auto-response (async, non-blocking)
      sendAutoResponse({
        name: input.name,
        email: input.email,
        phone: input.phone ?? undefined,
        source: input.source ?? undefined,
        interestedTours: input.interestedTours ?? undefined,
        message: input.message ?? undefined,
      }).catch(err =>
        console.error("[Lead] Failed to send auto-response:", err)
      );

      return { success: true, message: "Lead captured successfully" };
    }),

  list: secureProtectedProcedure.query(async () => {
    return await getAllLeads();
  }),

  listPaginated: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllLeadsPaginated(page, pageSize);
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
          status: z
            .enum(["new", "contacted", "quoted", "converted", "lost"])
            .optional(),
          convertedToBookingId: z.number().optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateLead(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "lead",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteLead(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "lead",
        resourceId: input.id,
      });
      return { success: true };
    }),

  bulkDelete: secureProtectedProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await bulkDeleteLeads(input.ids);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "lead",
        newValue: JSON.stringify({ ids: input.ids }),
      });
      return { success: true, deleted: input.ids.length };
    }),
});
