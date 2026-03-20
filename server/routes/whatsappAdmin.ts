/**
 * WhatsApp admin tRPC routes.
 *
 * Protected procedures for managing WhatsApp messages,
 * auto-reply settings, and sending manual messages.
 */

import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  getAllWhatsAppMessagesPaginated,
  getWhatsAppMessageStats,
} from "../db";
import { sendManualMessage, isWhatsAppConfigured } from "../whatsappService";
import { getSetting, upsertSetting } from "../db";

export const whatsappAdminRouter = router({
  /** List WhatsApp messages with pagination and optional phone filter */
  listMessages: secureProtectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        phoneFilter: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, phoneFilter } = input;
      const result = await getAllWhatsAppMessagesPaginated(
        page,
        pageSize,
        phoneFilter
      );
      return {
        ...result,
        page,
        pageSize,
        totalPages: Math.ceil(result.total / pageSize),
      };
    }),

  /** Send a manual WhatsApp message to a phone number */
  sendMessage: secureProtectedProcedure
    .input(
      z.object({
        to: z.string().min(1),
        text: z.string().min(1).max(4096),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      if (!isWhatsAppConfigured()) {
        return {
          success: false,
          messageId: null as string | null,
          error:
            "WhatsApp API not configured. Set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.",
        };
      }

      const result = await sendManualMessage(input.to, input.text);

      await logAdminAction({
        userId: ctx.user?.id ?? 0,
        action: "create",
        resourceType: "whatsappMessage",
        newValue: JSON.stringify({
          to: input.to,
          textLength: input.text.length,
          success: result.success,
        }),
      });

      return { ...result, error: null as string | null };
    }),

  /** Get WhatsApp messaging stats */
  getStats: secureProtectedProcedure.query(async () => {
    const stats = await getWhatsAppMessageStats();
    const configured = isWhatsAppConfigured();
    const autoReplyEnabled = await getSetting("whatsapp_auto_reply_enabled");

    return {
      ...stats,
      isConfigured: configured,
      autoReplyEnabled: autoReplyEnabled !== false,
    };
  }),

  /** Update auto-reply settings */
  updateAutoReply: secureProtectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      await upsertSetting("whatsapp_auto_reply_enabled", input.enabled);

      await logAdminAction({
        userId: ctx.user?.id ?? 0,
        action: "update",
        resourceType: "whatsappSettings",
        newValue: JSON.stringify({ autoReplyEnabled: input.enabled }),
      });

      return { success: true, autoReplyEnabled: input.enabled };
    }),
});
