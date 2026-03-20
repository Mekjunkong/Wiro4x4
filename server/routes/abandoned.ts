import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import { getAbandonedLeads, markRecoveryEmailSent } from "../db";
import { sendAbandonedBookingEmail } from "../abandonedBookingService";

export const abandonedRouter = router({
  /**
   * List abandoned leads: status='new', created >24h ago, recovery email not yet sent.
   * Optionally include already-emailed leads with `includeEmailed`.
   */
  list: secureProtectedProcedure
    .input(
      z
        .object({
          includeEmailed: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const leads = await getAbandonedLeads(24);
      if (input?.includeEmailed) {
        return leads;
      }
      // Filter out leads that already received a recovery email
      return leads.filter(l => !l.recoveryEmailSentAt);
    }),

  /**
   * Count of abandoned leads that haven't received a recovery email yet.
   */
  count: secureProtectedProcedure.query(async () => {
    const leads = await getAbandonedLeads(24);
    const unsent = leads.filter(l => !l.recoveryEmailSentAt);
    return { total: leads.length, unsent: unsent.length };
  }),

  /**
   * Send a recovery email to a single lead (admin-triggered).
   */
  sendRecoveryEmail: secureProtectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      const leads = await getAbandonedLeads(24);
      const lead = leads.find(l => l.id === input.leadId);

      if (!lead) {
        // Also check all leads (might be older than 24h)
        const allLeads = await getAbandonedLeads(24 * 365); // 1 year
        const foundLead = allLeads.find(l => l.id === input.leadId);
        if (!foundLead) {
          return { success: false, message: "Lead not found or not abandoned" };
        }
        // Send to the found lead
        const sent = await sendAbandonedBookingEmail(foundLead);
        if (sent) {
          await markRecoveryEmailSent(foundLead.id);
          await logAdminAction({
            userId: ctx.user?.id,
            action: "update",
            resourceType: "lead",
            resourceId: foundLead.id,
            newValue: JSON.stringify({ recoveryEmailSent: true }),
          });
        }
        return {
          success: sent,
          message: sent
            ? "Recovery email sent successfully"
            : "Failed to send recovery email",
        };
      }

      if (lead.recoveryEmailSentAt) {
        return {
          success: false,
          message: "Recovery email already sent to this lead",
        };
      }

      const sent = await sendAbandonedBookingEmail(lead);
      if (sent) {
        await markRecoveryEmailSent(lead.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "lead",
          resourceId: lead.id,
          newValue: JSON.stringify({ recoveryEmailSent: true }),
        });
      }

      return {
        success: sent,
        message: sent
          ? "Recovery email sent successfully"
          : "Failed to send recovery email",
      };
    }),

  /**
   * Send recovery emails to all unsent abandoned leads (max 10 per batch).
   */
  sendBatchRecovery: secureProtectedProcedure.mutation(async ({ ctx }) => {
    checkAdminRateLimit(ctx);

    const leads = await getAbandonedLeads(24);
    const unsent = leads.filter(l => !l.recoveryEmailSentAt && l.email);

    const batch = unsent.slice(0, 10); // Max 10 per batch
    let sentCount = 0;
    let failedCount = 0;

    for (const lead of batch) {
      const sent = await sendAbandonedBookingEmail(lead);
      if (sent) {
        await markRecoveryEmailSent(lead.id);
        sentCount++;
      } else {
        failedCount++;
      }
    }

    if (sentCount > 0) {
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "lead",
        newValue: JSON.stringify({
          batchRecoveryEmails: { sent: sentCount, failed: failedCount },
        }),
      });
    }

    return {
      success: true,
      sent: sentCount,
      failed: failedCount,
      remaining: Math.max(0, unsent.length - batch.length),
    };
  }),
});
