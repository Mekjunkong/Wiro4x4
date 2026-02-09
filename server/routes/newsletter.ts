import { z } from "zod";
import {
  router,
  TRPCError,
  securePublicProcedure,
  checkRateLimit,
} from "./_helpers";
import { createSubscriber, getSubscriberByEmail } from "../db";

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
});
