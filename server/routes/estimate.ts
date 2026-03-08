import {
  router,
  TRPCError,
  securePublicProcedure,
  checkRateLimit,
} from "./_helpers";
import { estimateEmailInputSchema } from "../../shared/schemas";
import { sendEstimateEmail } from "../estimateEmailService";

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

      return { success: true };
    }),
});
