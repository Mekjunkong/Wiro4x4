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
  getLeadById,
  updateLead,
  deleteLead,
  getAllLeadsPaginated,
  getAllLeadsPaginatedByScore,
  bulkDeleteLeads,
  updateLeadScore,
  findOrCreateCustomer,
} from "../db";
import {
  adminLeadInputSchema,
  adminLeadUpdateSchema,
  leadInputSchema,
  paginationInput,
} from "../../shared/schemas";
import {
  getWhatsAppSource,
  parseAttributionCapsule,
} from "../../shared/whatsappAttribution";
import { sendAutoResponse } from "../autoResponse";
import { notifyNewLead } from "../eliNotify";
import { calculateLeadScore, type LeadData } from "../leadScoring";
import { dispatchN8nEventInBackground } from "../n8nAutomation";

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
        const allEmails = allLeads
          .map(l => l.email)
          .filter((email): email is string => email !== null);
        const result = calculateLeadScore(newLead as LeadData, allEmails);
        updateLeadScore(
          newLead.id,
          result.score,
          JSON.stringify(result.details)
        ).catch(err =>
          console.error("[Lead] Failed to update lead score:", err)
        );
        dispatchN8nEventInBackground("lead.created", {
          lead: newLead,
          score: result.score,
          scoreDetails: result.details,
          source: input.source ?? "website",
          request: {
            referrer:
              (ctx.req.headers.referer as string | undefined) ??
              (ctx.req.headers.referrer as string | undefined) ??
              null,
            acceptLanguage:
              (ctx.req.headers["accept-language"] as string | undefined) ??
              null,
          },
        });
      }

      // Notify Eli → Telegram (async, non-blocking)
      notifyNewLead({
        name: input.name,
        email: input.email,
        phone: input.phone ?? undefined,
        source: input.source ?? undefined,
        interestedTours: input.interestedTours ?? undefined,
        message: input.message ?? undefined,
      }).catch(err => console.error("[Lead] Eli notify failed:", err));

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

  createFromWhatsApp: secureProtectedProcedure
    .input(adminLeadInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      const parsedCapsule = input.attributionCapsule
        ? parseAttributionCapsule(input.attributionCapsule)
        : null;
      if (input.attributionCapsule && !parsedCapsule) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid attribution capsule",
        });
      }

      const registeredSource = getWhatsAppSource(
        parsedCapsule?.sourceCode ?? input.sourceCode ?? ""
      );
      if (input.sourceCode && !registeredSource) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown WhatsApp source code",
        });
      }

      const lead = {
        name: input.name,
        email: input.email || null,
        phone: input.phone,
        source: "whatsapp",
        interestedTours: input.interestedTours,
        message: input.message,
        status: input.status,
        sourceCode: registeredSource?.code ?? null,
        sourceChannel:
          parsedCapsule?.channel ?? registeredSource?.channelFallback ?? null,
        landingPage: parsedCapsule?.landingPath ?? null,
        language: registeredSource?.language ?? input.language ?? null,
        utmSource: parsedCapsule?.utmSource ?? null,
        utmMedium: parsedCapsule?.utmMedium ?? null,
        utmCampaign: parsedCapsule?.utmCampaign ?? null,
        travelDate: input.travelDate,
        groupSize: input.groupSize,
        estimatedValueThb: input.estimatedValueThb,
        lostReason: input.lostReason,
      };

      await createLead(lead);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "lead",
        newValue: JSON.stringify(lead),
      });
      return { success: true };
    }),

  list: secureProtectedProcedure.query(async () => {
    return await getAllLeads();
  }),

  listPaginated: secureProtectedProcedure
    .input(
      paginationInput.extend({
        sortBy: z.enum(["score", "date"]).default("score"),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, sortBy } = input;
      const { items, total } =
        sortBy === "score"
          ? await getAllLeadsPaginatedByScore(page, pageSize)
          : await getAllLeadsPaginated(page, pageSize);
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
        data: adminLeadUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const existingLead = await getLeadById(input.id);
      if (!existingLead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      }

      const { attributionCapsule, sourceCode, completed, ...outcomeFields } =
        input.data;
      const updates = { ...outcomeFields };

      if (attributionCapsule !== undefined) {
        const parsed = parseAttributionCapsule(attributionCapsule);
        if (!parsed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid attribution capsule",
          });
        }
        const source = getWhatsAppSource(parsed.sourceCode);
        Object.assign(updates, {
          sourceCode: parsed.sourceCode,
          sourceChannel: parsed.channel,
          landingPage: parsed.landingPath,
          language: source?.language ?? null,
          utmSource: parsed.utmSource,
          utmMedium: parsed.utmMedium,
          utmCampaign: parsed.utmCampaign,
        });
      } else if (sourceCode !== undefined) {
        const source = sourceCode ? getWhatsAppSource(sourceCode) : undefined;
        if (sourceCode && !source) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unknown WhatsApp source code",
          });
        }
        Object.assign(updates, {
          sourceCode,
          sourceChannel: source?.channelFallback ?? null,
          landingPage: null,
          language: source?.language ?? null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
        });
      }

      const effectiveStatus = input.data.status ?? existingLead.status;
      if (
        existingLead.completedAt &&
        effectiveStatus !== "converted" &&
        completed !== false
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Set completed to false in the same update before moving a completed lead away from converted",
        });
      }

      if (completed !== undefined) {
        if (completed && effectiveStatus !== "converted") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only converted leads can be marked completed",
          });
        }
        Object.assign(updates, { completedAt: completed ? new Date() : null });
      }

      const effectiveLostReason =
        input.data.lostReason !== undefined
          ? input.data.lostReason
          : existingLead.lostReason;
      if (effectiveStatus === "lost" && !effectiveLostReason?.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Lost reason is required when status is lost",
        });
      }

      await updateLead(input.id, updates);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "lead",
        resourceId: input.id,
        newValue: JSON.stringify(updates),
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
