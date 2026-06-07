import {
  router,
  TRPCError,
  securePublicProcedure,
  checkRateLimit,
} from "./_helpers";
import { estimateEmailInputSchema } from "../../shared/schemas";
import { sendEstimateEmail } from "../estimateEmailService";
import { dispatchN8nEventInBackground } from "../n8nAutomation";

export const estimateRouter = router({
  sendEmail: securePublicProcedure
    .input(estimateEmailInputSchema)
    .mutation(async ({ input, ctx }) => {
      // Rate limit: 3 requests per minute per IP
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string) ||
        (ctx.req.headers["x-real-ip"] as string) ||
        "unknown";
      const { allowed } = checkRateLimit(`estimate-email:${ip}`, 3, 60_000);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      // Send email via Resend
      await sendEstimateEmail({
        toEmail: input.email,
        estimateData: input,
      });
      dispatchN8nEventInBackground("estimate.requested", {
        estimate: input,
        request: {
          referrer:
            (ctx.req.headers.referer as string | undefined) ??
            (ctx.req.headers.referrer as string | undefined) ??
            null,
          acceptLanguage:
            (ctx.req.headers["accept-language"] as string | undefined) ?? null,
        },
      });

      return { success: true };
    }),
});
