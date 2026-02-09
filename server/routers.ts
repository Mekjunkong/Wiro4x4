import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  createLead,
  getAllLeads,
  updateLead,
  createFinancialRecord,
  getFinancialRecordsByBookingId,
  getAllFinancialRecords,
  createGalleryPhoto,
  getAllPublishedPhotos,
  getAllGalleryPhotos,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  createReview,
  getApprovedReviews,
  getAllReviews,
  updateReview,
  deleteReview,
  getReviewStats,
  createPayment,
  getPaymentsByBookingId,
  getAllPayments,
  getPaymentStats,
  deleteAgent,
  getBookingsByAgentId,
  getAgentPerformanceStats,
  deleteLead,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialStats,
  createTour,
  getAllActiveTours,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour,
  getAllBookingsPaginated,
  getAllReviewsPaginated,
  getAllFinancialRecordsPaginated,
  getAllGalleryPhotosPaginated,
  getAllLeadsPaginated,
  getAllToursPaginated,
  createBlogPost,
  getAllPublishedBlogPosts,
  getAllBlogPosts,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
  getAllBlogPostsPaginated,
  getDb,
  logAdminAction,
  bulkDeleteBookings,
  bulkDeleteLeads,
  bulkApproveReviews,
  bulkDeleteReviews,
  createSubscriber,
  getSubscriberByEmail,
} from "./db";
import { sql } from "drizzle-orm";
import { storagePut } from "./storage";
import {
  sendNewBookingNotification,
  sendBookingStatusNotification,
} from "./emailService";
import { sendNewBookingEmail } from "./resendEmailService";
import {
  sendCustomerConfirmation,
  sendBookingReminder,
  sendPostTourFeedback,
} from "./customerEmailService";
import { checkRateLimit } from "./rateLimit";

function checkAdminRateLimit(ctx: any) {
  const userId = ctx.user?.id ?? "unknown";
  const { allowed } = checkRateLimit(`admin:${userId}`, 100, 5 * 60_000);
  if (!allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many admin operations. Please try again later.",
    });
  }
}

// Shared validation schemas (single source of truth for client + server)
import {
  bookingInputSchema,
  agentInputSchema,
  leadInputSchema,
  financialRecordInputSchema,
  tourInputSchema,
  blogPostInputSchema,
  paginationInput,
} from "../shared/schemas";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Booking procedures
  booking: router({
    create: publicProcedure
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
        await createBooking(bookingData);

        // Send notification to owner about new booking (Manus notification)
        await sendNewBookingNotification({
          contactName: input.contactName,
          contactEmail: input.contactEmail,
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
        }).catch(err =>
          console.error("[Booking] Failed to send Manus notification:", err)
        );

        // Send email notification via Resend to wiro.adventures@gmail.com and pasuthunjunkong@gmail.com
        await sendNewBookingEmail({
          contactName: input.contactName,
          contactEmail: input.contactEmail,
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
        }).catch(err =>
          console.error("[Booking] Failed to send Resend email:", err)
        );

        // Send confirmation email to customer with calendar attachment
        const tourType = input.includesTrip ? "Custom Tour" : "Tour Package";
        const pickupLocation =
          input.pickupPoint === "custom"
            ? input.customPickupLocation
            : input.pickupPoint;
        const totalGuests =
          input.numberOfAdults + (input.numberOfChildren || 0);

        // Send customer confirmation email asynchronously (non-blocking)
        sendCustomerConfirmation({
          customerName: input.contactName,
          customerEmail: input.contactEmail,
          tourDate: input.arrivalDate.toISOString(),
          tourType: tourType,
          groupSize: totalGuests,
          pickupLocation: pickupLocation,
          pickupTime: "08:00",
          specialRequests: input.specialRequests,
          bookingId: `WIRO-${Date.now()}`,
        }).catch(err =>
          console.error("[Booking] Failed to send customer confirmation:", err)
        );

        return { success: true, message: "Booking created successfully" };
      }),

    list: protectedProcedure.query(async () => {
      return await getAllBookings();
    }),

    listPaginated: protectedProcedure
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

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getBookingById(input.id);
      }),

    update: protectedProcedure
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
        return { success: true };
      }),

    delete: protectedProcedure
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

    bulkDelete: protectedProcedure
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

    sendReminder: protectedProcedure
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
          customerEmail: booking.contactEmail,
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
  }),

  // Agent procedures
  agent: router({
    create: protectedProcedure
      .input(agentInputSchema)
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await createAgent(input);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "agent",
          newValue: JSON.stringify(input),
        });
        return { success: true, message: "Agent created successfully" };
      }),

    list: protectedProcedure.query(async () => {
      return await getAllAgents();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getAgentById(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: agentInputSchema.partial(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await updateAgent(input.id, input.data);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "agent",
          resourceId: input.id,
          newValue: JSON.stringify(input.data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await deleteAgent(input.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "agent",
          resourceId: input.id,
        });
        return { success: true };
      }),

    bookings: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return await getBookingsByAgentId(input.agentId);
      }),

    stats: protectedProcedure.query(async () => {
      return await getAgentPerformanceStats();
    }),
  }),

  // Lead procedures
  lead: router({
    create: publicProcedure
      .input(leadInputSchema)
      .mutation(async ({ input, ctx }) => {
        const ip =
          (ctx.req.headers["x-forwarded-for"] as string) ||
          (ctx.req.headers["x-real-ip"] as string) ||
          "unknown";
        const { allowed } = checkRateLimit(`lead:${ip}`, 10, 60_000);
        if (!allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again in a minute.",
          });
        }
        await createLead(input);
        return { success: true, message: "Lead captured successfully" };
      }),

    list: protectedProcedure.query(async () => {
      return await getAllLeads();
    }),

    listPaginated: protectedProcedure
      .input(paginationInput)
      .query(async ({ input }) => {
        const { page, pageSize } = input;
        const { items, total } = await getAllLeadsPaginated(page, pageSize);
        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            status: z
              .enum(["new", "contacted", "quoted", "converted", "lost"])
              .optional(),
            convertedToBookingId: z.number().optional(),
            notes: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await updateLead(input.id, input.data);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "lead",
          resourceId: input.id,
          newValue: JSON.stringify(input.data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await deleteLead(input.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "lead",
          resourceId: input.id,
        });
        return { success: true };
      }),

    bulkDelete: protectedProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await bulkDeleteLeads(input.ids);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "lead",
          newValue: JSON.stringify({ ids: input.ids }),
        });
        return { success: true, deleted: input.ids.length };
      }),
  }),

  // Financial procedures
  financial: router({
    create: protectedProcedure
      .input(financialRecordInputSchema)
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await createFinancialRecord(input);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "financial",
          newValue: JSON.stringify(input),
        });
        return { success: true };
      }),

    listByBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return await getFinancialRecordsByBookingId(input.bookingId);
      }),

    listAll: protectedProcedure.query(async () => {
      return await getAllFinancialRecords();
    }),

    listAllPaginated: protectedProcedure
      .input(paginationInput)
      .query(async ({ input }) => {
        const { page, pageSize } = input;
        const { items, total } = await getAllFinancialRecordsPaginated(
          page,
          pageSize
        );
        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            type: z.enum(["revenue", "cost", "refund"]).optional(),
            category: z.string().optional(),
            amount: z.number().optional(),
            description: z.string().optional(),
            paymentMethod: z.string().optional(),
            notes: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await updateFinancialRecord(input.id, input.data);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "financial",
          resourceId: input.id,
          newValue: JSON.stringify(input.data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await deleteFinancialRecord(input.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "financial",
          resourceId: input.id,
        });
        return { success: true };
      }),

    stats: protectedProcedure.query(async () => {
      return await getFinancialStats();
    }),
  }),

  // Gallery procedures
  gallery: router({
    list: publicProcedure.query(async () => {
      const photos = await getAllPublishedPhotos();
      return photos.map(p => ({ ...p, imageUrl: p.s3Url }));
    }),

    listAll: protectedProcedure.query(async () => {
      const photos = await getAllGalleryPhotos();
      return photos.map(p => ({ ...p, imageUrl: p.s3Url }));
    }),

    listAllPaginated: protectedProcedure
      .input(paginationInput)
      .query(async ({ input }) => {
        const { page, pageSize } = input;
        const { items, total } = await getAllGalleryPhotosPaginated(
          page,
          pageSize
        );
        return {
          items: items.map(p => ({ ...p, imageUrl: p.s3Url })),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          imageUrl: z.string().min(1),
          description: z.string().optional(),
          category: z
            .enum([
              "tours",
              "vehicles",
              "destinations",
              "activities",
              "food",
              "accommodation",
              "other",
            ])
            .default("other"),
          sortOrder: z.number().default(0),
          isPublished: z.boolean().default(true),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        const url = new URL(input.imageUrl, "https://placeholder.local");
        await createGalleryPhoto({
          title: input.title,
          s3Key: url.pathname,
          s3Url: input.imageUrl,
          description: input.description,
          category: input.category,
          sortOrder: input.sortOrder,
          isPublished: input.isPublished ? 1 : 0,
        });
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "gallery",
          newValue: JSON.stringify({
            title: input.title,
            category: input.category,
          }),
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            title: z.string().optional(),
            imageUrl: z.string().optional(),
            description: z.string().optional(),
            category: z
              .enum([
                "tours",
                "vehicles",
                "destinations",
                "activities",
                "food",
                "accommodation",
                "other",
              ])
              .optional(),
            sortOrder: z.number().optional(),
            isPublished: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        const updateData: Record<string, unknown> = {};
        if (input.data.title !== undefined) updateData.title = input.data.title;
        if (input.data.imageUrl !== undefined) {
          updateData.s3Url = input.data.imageUrl;
          const url = new URL(input.data.imageUrl, "https://placeholder.local");
          updateData.s3Key = url.pathname;
        }
        if (input.data.description !== undefined)
          updateData.description = input.data.description;
        if (input.data.category !== undefined)
          updateData.category = input.data.category;
        if (input.data.sortOrder !== undefined)
          updateData.sortOrder = input.data.sortOrder;
        if (input.data.isPublished !== undefined)
          updateData.isPublished = input.data.isPublished ? 1 : 0;
        await updateGalleryPhoto(input.id, updateData as any);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "gallery",
          resourceId: input.id,
          newValue: JSON.stringify(input.data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await deleteGalleryPhoto(input.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "gallery",
          resourceId: input.id,
        });
        return { success: true };
      }),

    upload: protectedProcedure
      .input(
        z.object({
          filename: z.string(),
          contentType: z.string(),
          base64Data: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);

        // Whitelist content types (Task 1.6)
        const ALLOWED_TYPES = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ];
        if (!ALLOWED_TYPES.includes(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
          });
        }

        // Max file size: 10MB
        const fileSize = Buffer.byteLength(input.base64Data, "base64");
        if (fileSize > 10 * 1024 * 1024) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File too large. Maximum size is 10MB.",
          });
        }

        // Sanitize filename - use UUID instead of user-provided name
        const ext =
          input.contentType.split("/")[1] === "jpeg"
            ? "jpg"
            : input.contentType.split("/")[1];
        const safeFilename = `${randomUUID()}.${ext}`;
        const key = `gallery/${safeFilename}`;

        const buffer = Buffer.from(input.base64Data, "base64");
        const result = await storagePut(key, buffer, input.contentType);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "gallery_upload",
          newValue: JSON.stringify({ key: result.key }),
        });
        return { url: result.url, key: result.key };
      }),
  }),

  // Review procedures
  review: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email"),
          rating: z.number().min(1).max(5),
          text: z.string().min(1, "Review text is required"),
          tourType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ip =
          (ctx.req.headers["x-forwarded-for"] as string) ||
          (ctx.req.headers["x-real-ip"] as string) ||
          "unknown";
        const { allowed } = checkRateLimit(`review:${ip}`, 5, 60_000);
        if (!allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "Too many review submissions. Please try again in a minute.",
          });
        }
        await createReview({
          ...input,
          isApproved: 0,
          isPublished: 0,
        });
        return { success: true, message: "Review submitted for approval" };
      }),

    listPublic: publicProcedure.query(async () => {
      return await getApprovedReviews();
    }),

    listAll: protectedProcedure.query(async () => {
      const all = await getAllReviews();
      return all.map(r => ({
        ...r,
        status:
          r.isApproved === 1
            ? ("approved" as const)
            : r.isPublished === 0 && r.isApproved === 0
              ? ("pending" as const)
              : ("rejected" as const),
      }));
    }),

    listAllPaginated: protectedProcedure
      .input(paginationInput)
      .query(async ({ input }) => {
        const { page, pageSize } = input;
        const { items, total } = await getAllReviewsPaginated(page, pageSize);
        return {
          items: items.map(r => ({
            ...r,
            status:
              r.isApproved === 1
                ? ("approved" as const)
                : r.isPublished === 0 && r.isApproved === 0
                  ? ("pending" as const)
                  : ("rejected" as const),
          })),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }),

    stats: protectedProcedure.query(async () => {
      return await getReviewStats();
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            status: z.enum(["pending", "approved", "rejected"]).optional(),
            adminResponse: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        const updateData: Record<string, unknown> = {};
        if (input.data.adminResponse !== undefined)
          updateData.adminResponse = input.data.adminResponse;
        if (input.data.status === "approved") {
          updateData.isApproved = 1;
          updateData.isPublished = 1;
        } else if (input.data.status === "rejected") {
          updateData.isApproved = 0;
          updateData.isPublished = 0;
        } else if (input.data.status === "pending") {
          updateData.isApproved = 0;
          updateData.isPublished = 0;
        }
        await updateReview(input.id, updateData as any);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "review",
          resourceId: input.id,
          newValue: JSON.stringify(input.data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await deleteReview(input.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "review",
          resourceId: input.id,
        });
        return { success: true };
      }),

    bulkApprove: protectedProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await bulkApproveReviews(input.ids);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "review",
          newValue: JSON.stringify({ ids: input.ids, action: "bulk_approve" }),
        });
        return { success: true, approved: input.ids.length };
      }),

    bulkDelete: protectedProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await bulkDeleteReviews(input.ids);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "review",
          newValue: JSON.stringify({ ids: input.ids }),
        });
        return { success: true, deleted: input.ids.length };
      }),
  }),

  // Payment procedures (schema only — Stripe integration deferred)
  payment: router({
    listByBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return await getPaymentsByBookingId(input.bookingId);
      }),

    listAll: protectedProcedure.query(async () => {
      return await getAllPayments();
    }),

    stats: protectedProcedure.query(async () => {
      return await getPaymentStats();
    }),
  }),

  // Tour procedures
  tour: router({
    list: publicProcedure.query(async () => {
      return await getAllActiveTours();
    }),

    listAll: protectedProcedure.query(async () => {
      return await getAllTours();
    }),

    listAllPaginated: protectedProcedure
      .input(paginationInput)
      .query(async ({ input }) => {
        const { page, pageSize } = input;
        const { items, total } = await getAllToursPaginated(page, pageSize);
        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }),

    create: protectedProcedure
      .input(tourInputSchema)
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await createTour({
          ...input,
          isKosher: input.isKosher ? 1 : 0,
          isPrivate: input.isPrivate ? 1 : 0,
          isShabbatOk: input.isShabbatOk ? 1 : 0,
          isActive: input.isActive ? 1 : 0,
        });
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "tour",
          newValue: JSON.stringify({ name: input.name }),
        });
        return { success: true, message: "Tour created successfully" };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: tourInputSchema.partial(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        const updateData: Record<string, unknown> = {};
        const fields = [
          "name",
          "nameHe",
          "description",
          "descriptionHe",
          "duration",
          "difficulty",
          "price",
          "groupMinSize",
          "groupMaxSize",
          "imageUrl",
          "highlights",
          "highlightsHe",
          "sortOrder",
        ] as const;
        for (const field of fields) {
          if (input.data[field] !== undefined)
            updateData[field] = input.data[field];
        }
        if (input.data.isKosher !== undefined)
          updateData.isKosher = input.data.isKosher ? 1 : 0;
        if (input.data.isPrivate !== undefined)
          updateData.isPrivate = input.data.isPrivate ? 1 : 0;
        if (input.data.isShabbatOk !== undefined)
          updateData.isShabbatOk = input.data.isShabbatOk ? 1 : 0;
        if (input.data.isActive !== undefined)
          updateData.isActive = input.data.isActive ? 1 : 0;
        await updateTour(input.id, updateData as any);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "tour",
          resourceId: input.id,
          newValue: JSON.stringify(input.data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await deleteTour(input.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "tour",
          resourceId: input.id,
        });
        return { success: true };
      }),
  }),

  // Blog procedures
  blog: router({
    list: publicProcedure.query(async () => {
      return await getAllPublishedBlogPosts();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getBlogPostBySlug(input.slug);
      }),

    listAll: protectedProcedure.query(async () => {
      return await getAllBlogPosts();
    }),

    listAllPaginated: protectedProcedure
      .input(paginationInput)
      .query(async ({ input }) => {
        const { page, pageSize } = input;
        const { items, total } = await getAllBlogPostsPaginated(page, pageSize);
        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }),

    create: protectedProcedure
      .input(blogPostInputSchema)
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await createBlogPost({
          ...input,
          isPublished: input.isPublished ? 1 : 0,
          publishedAt: input.isPublished ? new Date() : undefined,
        });
        await logAdminAction({
          userId: ctx.user?.id,
          action: "create",
          resourceType: "blog",
          newValue: JSON.stringify({ title: input.title, slug: input.slug }),
        });
        return { success: true, message: "Blog post created successfully" };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: blogPostInputSchema.partial(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        const updateData: Record<string, unknown> = {};
        const fields = [
          "title",
          "titleHe",
          "slug",
          "excerpt",
          "excerptHe",
          "content",
          "contentHe",
          "coverImage",
          "category",
          "tags",
          "author",
        ] as const;
        for (const field of fields) {
          if (input.data[field] !== undefined)
            updateData[field] = input.data[field];
        }
        if (input.data.isPublished !== undefined) {
          updateData.isPublished = input.data.isPublished ? 1 : 0;
          if (input.data.isPublished) {
            updateData.publishedAt = new Date();
          }
        }
        await updateBlogPost(input.id, updateData as any);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "blog",
          resourceId: input.id,
          newValue: JSON.stringify(input.data),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        checkAdminRateLimit(ctx);
        await deleteBlogPost(input.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "delete",
          resourceType: "blog",
          resourceId: input.id,
        });
        return { success: true };
      }),
  }),

  // Newsletter procedures
  newsletter: router({
    subscribe: publicProcedure
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
  }),

  // Health check endpoints (Task 1.7)
  health: router({
    readiness: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }
      try {
        await db.select({ val: sql`1` }).from(sql`dual`);
        return { status: "ready", database: "connected" };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database check failed",
        });
      }
    }),
    liveness: publicProcedure.query(() => {
      return { status: "alive", timestamp: new Date().toISOString() };
    }),
  }),
});

export type AppRouter = typeof appRouter;
