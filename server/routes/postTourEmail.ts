/**
 * Post-Tour Follow-up Email tRPC Routes
 *
 * Admin routes to manage and send post-tour follow-up emails.
 */

import { z } from "zod";
import {
  router,
  TRPCError,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  getEligiblePostTourBookings,
  getEligiblePostTourCount,
  getBookingById,
  getAlbumByBookingId,
  markPostTourEmailSent,
} from "../db";
import {
  sendPostTourEmail,
  generatePostTourEmailHtml,
  checkAndSendPostTourEmails,
} from "../postTourEmailService";

export const postTourEmailRouter = router({
  /**
   * Find bookings eligible for post-tour email.
   * Completed, 2+ days after departure, email not yet sent.
   */
  findEligible: secureProtectedProcedure.query(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    const bookings = await getEligiblePostTourBookings(50);
    const total = await getEligiblePostTourCount();

    // For each booking, check if album exists
    const results = await Promise.all(
      bookings.map(async booking => {
        const album = await getAlbumByBookingId(booking.id);
        return {
          id: booking.id,
          contactName: booking.contactName,
          contactEmail: booking.contactEmail,
          departureDate: booking.departureDate,
          status: booking.status,
          postTourEmailSentAt: booking.postTourEmailSentAt,
          hasAlbum: !!album,
          albumToken: album?.accessToken ?? null,
        };
      })
    );

    return { items: results, total };
  }),

  /**
   * Send post-tour email to a specific booking.
   */
  send: secureProtectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      const booking = await getBookingById(input.bookingId);
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      if (!booking.contactEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking has no contact email",
        });
      }

      if (booking.postTourEmailSentAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Post-tour email already sent for this booking",
        });
      }

      const album = await getAlbumByBookingId(booking.id);
      const success = await sendPostTourEmail(
        booking,
        album?.accessToken ?? null
      );

      if (success) {
        await markPostTourEmailSent(booking.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "postTourEmail",
          resourceId: booking.id,
          newValue: JSON.stringify({
            to: booking.contactEmail,
            hasAlbum: !!album,
          }),
        });
      }

      return { success };
    }),

  /**
   * Send post-tour emails to all eligible bookings (batch, max 10).
   */
  sendBatch: secureProtectedProcedure.mutation(async ({ ctx }) => {
    checkAdminRateLimit(ctx);

    const results = await checkAndSendPostTourEmails();

    await logAdminAction({
      userId: ctx.user?.id,
      action: "create",
      resourceType: "postTourEmail",
      resourceId: null,
      newValue: JSON.stringify(results),
    });

    return results;
  }),

  /**
   * Preview the email HTML for a booking (does not send).
   */
  preview: secureProtectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      const booking = await getBookingById(input.bookingId);
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      const album = await getAlbumByBookingId(booking.id);
      const html = generatePostTourEmailHtml({
        booking,
        albumToken: album?.accessToken ?? null,
      });

      return {
        html,
        to: booking.contactEmail,
        hasAlbum: !!album,
      };
    }),

  /**
   * Get count of eligible bookings (for badge display).
   */
  eligibleCount: secureProtectedProcedure.query(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    return await getEligiblePostTourCount();
  }),
});
