import { z } from "zod";
import crypto from "crypto";
import {
  router,
  TRPCError,
  securePublicProcedure,
  secureProtectedProcedure,
  checkRateLimit,
  checkAdminRateLimit,
} from "./_helpers";
import {
  createBookingDraft,
  getBookingDraftByToken,
  listActiveBookingDrafts,
  updateBookingDraftStatus,
} from "../db";
import { bookingDraftInputSchema } from "../../shared/schemas";

export const bookingDraftRouter = router({
  save: securePublicProcedure
    .input(bookingDraftInputSchema)
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string) ||
        (ctx.req.headers["x-real-ip"] as string) ||
        "unknown";
      const { allowed } = checkRateLimit(`bookingDraft:${ip}`, 10, 60_000);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Too many draft save requests. Please try again in a minute.",
        });
      }

      const resumeToken = crypto.randomBytes(32).toString("hex");
      const id = await createBookingDraft({
        ...input,
        resumeToken,
      });

      return { id, resumeToken };
    }),

  getByToken: securePublicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const draft = await getBookingDraftByToken(input.token);
      if (!draft || draft.status !== "active") return null;
      return draft;
    }),

  listActive: secureProtectedProcedure.query(async () => {
    return await listActiveBookingDrafts();
  }),

  updateStatus: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["active", "converted", "expired"]),
        convertedToBookingId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateBookingDraftStatus(
        input.id,
        input.status,
        input.convertedToBookingId
      );
      return { success: true };
    }),
});
