import { z } from "zod";
import {
  router,
  TRPCError,
  securePublicProcedure,
  secureProtectedProcedure,
  checkRateLimit,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  createSubscriber,
  getSubscriberByEmail,
  getAllSubscribers,
  getAllActiveSubscribers,
  deactivateSubscriber,
} from "../db";
import { sendNewsletterEmail } from "../newsletterEmailService";

export const newsletterRouter = router({
  subscribe: securePublicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        language: z.string().default("en"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string) ||
        (ctx.req.headers["x-real-ip"] as string) ||
        "unknown";
      const { allowed } = checkRateLimit(`newsletter:${ip}`, 5, 60_000);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      const existing = await getSubscriberByEmail(input.email);
      if (existing) {
        return { success: true, message: "Already subscribed" };
      }

      await createSubscriber(input);
      return { success: true, message: "Successfully subscribed!" };
    }),

  unsubscribe: securePublicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      await deactivateSubscriber(input.email);
      return { success: true, message: "Unsubscribed successfully" };
    }),

  list: secureProtectedProcedure.query(async () => {
    return await getAllSubscribers();
  }),

  send: secureProtectedProcedure
    .input(
      z.object({
        blogPostId: z.number(),
        subject: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const subscribers = await getAllActiveSubscribers();
      if (subscribers.length === 0) {
        return { success: true, sent: 0, message: "No active subscribers" };
      }
      const sent = await sendNewsletterEmail(
        input.blogPostId,
        subscribers,
        input.subject
      );
      await logAdminAction({
        userId: ctx.user?.id,
        action: "send_newsletter",
        resourceType: "newsletter",
        newValue: JSON.stringify({
          blogPostId: input.blogPostId,
          recipientCount: sent,
        }),
      });
      return { success: true, sent, message: `Sent to ${sent} subscribers` };
    }),
});
