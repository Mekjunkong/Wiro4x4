import { z } from "zod";
import {
  router,
  TRPCError,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
  captureException,
} from "./_helpers";
import {
  getPaymentsByBookingId,
  getAllPayments,
  getPaymentStats,
  getBookingById,
  createPayment,
  createFinancialRecord,
  getBookingTotalPaid,
} from "../db";
import {
  createCheckoutSchema,
  refundSchema,
  verifySessionSchema,
  manualPaymentInputSchema,
} from "../../shared/schemas";
import {
  initiateCheckout,
  verifyAndCompleteSession,
  processRefund,
} from "../stripeService";

export const paymentRouter = router({
  listByBooking: secureProtectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      return await getPaymentsByBookingId(input.bookingId);
    }),

  listAll: secureProtectedProcedure.query(async () => {
    return await getAllPayments();
  }),

  stats: secureProtectedProcedure.query(async () => {
    return await getPaymentStats();
  }),

  isConfigured: secureProtectedProcedure.query(async () => {
    return { configured: !!process.env.STRIPE_SECRET_KEY };
  }),

  createCheckout: secureProtectedProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const booking = await getBookingById(input.bookingId);
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }
      try {
        const result = await initiateCheckout(
          input.bookingId,
          input.amount,
          input.type,
          booking.contactEmail ?? undefined
        );
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "payment",
          resourceId: input.bookingId,
          newValue: JSON.stringify({
            type: input.type,
            amount: input.amount,
            sessionId: result.sessionId,
          }),
        });
        return { url: result.url, sessionId: result.sessionId };
      } catch (err: any) {
        captureException(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Failed to create checkout session",
        });
      }
    }),

  verifySession: securePublicProcedure
    .input(verifySessionSchema)
    .query(async ({ input }) => {
      try {
        const result = await verifyAndCompleteSession(input.sessionId);
        return {
          success: result.paymentStatus === "paid",
          bookingId: result.bookingId,
          status: result.status,
          paymentStatus: result.paymentStatus,
          amountPaid: result.amountPaid,
          alreadyCompleted: result.alreadyCompleted,
        };
      } catch (err: any) {
        captureException(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Failed to verify session",
        });
      }
    }),

  createPaymentLink: secureProtectedProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const booking = await getBookingById(input.bookingId);
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }
      try {
        const result = await initiateCheckout(
          input.bookingId,
          input.amount,
          input.type,
          booking.contactEmail ?? undefined
        );
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "payment_link",
          resourceId: input.bookingId,
          newValue: JSON.stringify({
            type: input.type,
            amount: input.amount,
            url: result.url,
          }),
        });
        return { url: result.url, sessionId: result.sessionId };
      } catch (err: any) {
        captureException(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Failed to create payment link",
        });
      }
    }),

  refund: secureProtectedProcedure
    .input(refundSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      try {
        const result = await processRefund(
          input.paymentId,
          input.amount,
          input.reason
        );
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "refund",
          resourceId: input.paymentId,
          newValue: JSON.stringify({
            refundId: result.refundId,
            amount: result.amount,
            reason: input.reason,
          }),
        });
        return { success: true, ...result };
      } catch (err: any) {
        captureException(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Failed to process refund",
        });
      }
    }),

  recordManual: secureProtectedProcedure
    .input(manualPaymentInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      const booking = await getBookingById(input.bookingId);
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Determine payment type based on amount vs booking total
      const totalPrice = booking.totalPrice ?? 0;
      const alreadyPaid = await getBookingTotalPaid(input.bookingId);
      const remainingAfterPayment = totalPrice - alreadyPaid - input.amount;
      const paymentType: "deposit" | "full" =
        remainingAfterPayment > 0 ? "deposit" : "full";

      // Create payment record
      await createPayment({
        bookingId: input.bookingId,
        type: paymentType,
        amount: input.amount,
        currency: input.currency,
        status: "completed",
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        paidAt: new Date(),
      });

      // Create corresponding financial record
      await createFinancialRecord({
        bookingId: input.bookingId,
        type: "revenue",
        category: "manual_payment",
        amount: input.amount,
        currency: input.currency,
        description: `Manual ${input.paymentMethod} payment`,
        paymentMethod: input.paymentMethod,
        paymentDate: new Date(),
        notes: input.notes,
      });

      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "payment",
        resourceId: input.bookingId,
        newValue: JSON.stringify({
          type: paymentType,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          currency: input.currency,
        }),
      });

      return { success: true, paymentType };
    }),
});
