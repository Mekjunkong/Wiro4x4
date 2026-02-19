import { z } from "zod";
import {
  router,
  TRPCError,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  checkRateLimit,
  logAdminAction,
  captureException,
} from "./_helpers";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAllBookingsPaginated,
  bulkDeleteBookings,
  getAllAgents,
  getAgentPerformanceStats,
  getAgentBookingsInDateRange,
  generateDefaultFinancialRecords,
  findOrCreateCustomer,
  updateCustomer,
  getCustomerById,
} from "../db";
import { sendNewBookingNotification } from "../emailService";
import { sendNewBookingEmail } from "../resendEmailService";
import {
  sendCustomerConfirmation,
  sendBookingReminder,
} from "../customerEmailService";
import { bookingInputSchema, paginationInput } from "../../shared/schemas";

export const bookingRouter = router({
  create: securePublicProcedure
    .input(bookingInputSchema)
    .mutation(async ({ input, ctx }) => {
      // Rate limit: 10 booking submissions per minute per IP
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string) ||
        (ctx.req.headers["x-real-ip"] as string) ||
        "unknown";
      const { allowed } = checkRateLimit(`booking:${ip}`, 10, 60_000);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many booking requests. Please try again in a minute.",
        });
      }

      const bookingData = {
        ...input,
        hasChildren: input.hasChildren ? 1 : 0,
        includesHotels: input.includesHotels ? 1 : 0,
        includesGuide: input.includesGuide ? 1 : 0,
        includesTrip: input.includesTrip ? 1 : 0,
        includesAttractions: input.includesAttractions ? 1 : 0,
        includesFood: input.includesFood ? 1 : 0,
        needsShabbatHotel: input.needsShabbatHotel ? 1 : 0,
      };
      const result = await createBooking(bookingData);
      const bookingId = result[0]?.insertId ?? 0;

      // Auto-create or link customer (non-blocking)
      findOrCreateCustomer({
        name: input.contactName,
        email: input.contactEmail || undefined,
        phone: input.contactPhone,
        source: "booking",
      })
        .then(async customerId => {
          if (customerId) {
            const customer = await getCustomerById(customerId);
            if (customer && customer.stage === "prospect") {
              await updateCustomer(customerId, { stage: "active" });
            }
          }
        })
        .catch(console.error);

      // Send notification to owner about new booking (Manus notification)
      await sendNewBookingNotification({
        contactName: input.contactName,
        contactEmail: input.contactEmail || "",
        contactPhone: input.contactPhone,
        arrivalDate: input.arrivalDate,
        departureDate: input.departureDate,
        numberOfAdults: input.numberOfAdults,
        numberOfChildren: input.numberOfChildren,
        includesHotels: input.includesHotels,
        includesGuide: input.includesGuide,
        includesTrip: input.includesTrip,
        includesFood: input.includesFood,
        needsShabbatHotel: input.needsShabbatHotel,
        pickupPoint: input.pickupPoint,
        dropoffPoint: input.dropoffPoint,
        suggestedDestinations: input.suggestedDestinations,
        specialRequests: input.specialRequests,
      }).catch(err => {
        console.error("[Booking] Failed to send Manus notification:", err);
        captureException(err);
      });

      // Send email notification via Resend to wiro.adventures@gmail.com and pasuthunjunkong@gmail.com
      await sendNewBookingEmail({
        contactName: input.contactName,
        contactEmail: input.contactEmail || "",
        contactPhone: input.contactPhone,
        arrivalDate: input.arrivalDate,
        departureDate: input.departureDate,
        numberOfAdults: input.numberOfAdults,
        numberOfChildren: input.numberOfChildren,
        includesHotels: input.includesHotels,
        includesGuide: input.includesGuide,
        includesTrip: input.includesTrip,
        includesFood: input.includesFood,
        needsShabbatHotel: input.needsShabbatHotel,
        pickupPoint: input.pickupPoint,
        dropoffPoint: input.dropoffPoint,
        suggestedDestinations: input.suggestedDestinations,
        specialRequests: input.specialRequests,
      }).catch(err => {
        console.error("[Booking] Failed to send Resend email:", err);
        captureException(err);
      });

      // Send confirmation email to customer with calendar attachment
      const tourType = input.includesTrip ? "Custom Tour" : "Tour Package";
      const pickupLocation =
        input.pickupPoint === "custom"
          ? input.customPickupLocation
          : input.pickupPoint;
      const totalGuests = input.numberOfAdults + (input.numberOfChildren || 0);

      // Send customer confirmation email asynchronously (non-blocking, skip if no email)
      if (input.contactEmail)
        sendCustomerConfirmation({
          customerName: input.contactName,
          customerEmail: input.contactEmail,
          tourDate: input.arrivalDate.toISOString(),
          tourType: tourType,
          groupSize: totalGuests,
          pickupLocation: pickupLocation,
          pickupTime: "08:00",
          specialRequests: input.specialRequests,
          bookingId: `WIRO-${bookingId}`,
        }).catch(err => {
          console.error("[Booking] Failed to send customer confirmation:", err);
          captureException(err);
        });

      return {
        success: true,
        message: "Booking created successfully",
        bookingId,
      };
    }),

  list: secureProtectedProcedure.query(async () => {
    return await getAllBookings();
  }),

  listPaginated: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllBookingsPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  getById: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getBookingById(input.id);
    }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          status: z
            .enum([
              "pending",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
            ])
            .optional(),
          totalPrice: z.number().optional(),
          depositPaid: z.number().optional(),
          balancePaid: z.number().optional(),
          assignedAgentId: z.number().optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateBooking(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "booking",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });

      // Auto-generate financial records when status changes to "confirmed"
      if (input.data.status === "confirmed") {
        generateDefaultFinancialRecords(input.id).catch(err =>
          console.error(
            "[Booking] Failed to auto-generate financial records:",
            err
          )
        );
      }

      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteBooking(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "booking",
        resourceId: input.id,
      });
      return { success: true };
    }),

  bulkDelete: secureProtectedProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await bulkDeleteBookings(input.ids);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "booking",
        newValue: JSON.stringify({ ids: input.ids }),
      });
      return { success: true, deleted: input.ids.length };
    }),

  sendReminder: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const booking = await getBookingById(input.id);
      if (!booking)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });

      await sendBookingReminder({
        customerName: booking.contactName,
        customerEmail: booking.contactEmail ?? "",
        tourDate: booking.arrivalDate?.toISOString() ?? "",
        tourType: "Custom Tour",
        groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
        pickupLocation: booking.pickupPoint,
        pickupTime: "08:00",
        specialRequests: booking.specialRequests ?? undefined,
        bookingId: `WIRO-${booking.id}`,
      });
      return { success: true };
    }),

  suggestAgent: secureProtectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ input }) => {
      const booking = await getBookingById(input.bookingId);
      if (!booking)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      const allAgents = await getAllAgents();
      const activeAgents = allAgents.filter(a => a.status === "active");
      const agentStats = await getAgentPerformanceStats();
      const suggestions = [];
      for (const agent of activeAgents) {
        let score = 0;
        const overlapping =
          booking.arrivalDate && booking.departureDate
            ? await getAgentBookingsInDateRange(
                agent.id,
                booking.arrivalDate,
                booking.departureDate
              )
            : [];
        if (overlapping.length === 0) score += 40;
        else score += Math.max(0, 40 - overlapping.length * 20);
        if (agent.specialties) {
          try {
            const specs = JSON.parse(agent.specialties) as string[];
            let matchCount = 0;
            if (
              booking.includesFood &&
              specs.some(s => s.toLowerCase().includes("kosher"))
            )
              matchCount++;
            if (
              booking.includesGuide &&
              specs.some(s => s.toLowerCase().includes("guide"))
            )
              matchCount++;
            if (
              booking.includesTrip &&
              specs.some(
                s =>
                  s.toLowerCase().includes("adventure") ||
                  s.toLowerCase().includes("4x4")
              )
            )
              matchCount++;
            score += Math.min(25, matchCount * 10);
          } catch {
            /* not valid JSON */
          }
        }
        score += ((agent.rating ?? 5) / 5) * 20;
        const stats = agentStats.find(s => s.id === agent.id);
        const activeBookings = stats?.activeBookings ?? 0;
        score += Math.max(0, 15 - activeBookings * 5);
        suggestions.push({
          agentId: agent.id,
          agentName: agent.name,
          score: Math.round(score),
          available: overlapping.length === 0,
          activeBookings,
          rating: agent.rating ?? 5,
        });
      }
      suggestions.sort((a, b) => b.score - a.score);
      return suggestions;
    }),

  updateDate: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        arrivalDate: z
          .string()
          .or(z.date())
          .transform(v => new Date(v)),
        departureDate: z
          .string()
          .or(z.date())
          .transform(v => new Date(v)),
      })
    )
    .mutation(async ({ ctx, input }) => {
      checkAdminRateLimit(ctx);
      await updateBooking(input.id, {
        arrivalDate: input.arrivalDate,
        departureDate: input.departureDate,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "reschedule",
        resourceType: "booking",
        resourceId: input.id,
        newValue: JSON.stringify({
          arrivalDate: input.arrivalDate,
          departureDate: input.departureDate,
        }),
      });
      return { success: true };
    }),
});
