import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
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
} from "./db";
import { sendNewBookingNotification, sendBookingStatusNotification } from "./emailService";
import { sendNewBookingEmail } from "./resendEmailService";
import { sendCustomerConfirmation } from "./customerEmailService";

// Validation schemas
const bookingInputSchema = z.object({
  contactName: z.string().min(1, "Name is required"),
  contactEmail: z.string().email("Invalid email"),
  contactPhone: z.string().min(1, "Phone is required"),
  contactWhatsApp: z.string().optional(),
  arrivalDate: z.string().transform((s) => new Date(s)),
  departureDate: z.string().transform((s) => new Date(s)),
  numberOfAdults: z.number().min(1).default(1),
  hasChildren: z.boolean().default(false),
  numberOfChildren: z.number().optional(),
  childrenAges: z.string().optional(),
  includesHotels: z.boolean().default(false),
  hotelPreferences: z.string().optional(),
  includesGuide: z.boolean().default(false),
  includesTrip: z.boolean().default(false),
  includesAttractions: z.boolean().default(false),
  selectedAttractions: z.string().optional(),
  includesFood: z.boolean().default(false),
  foodPreferences: z.string().optional(),
  needsShabbatHotel: z.boolean().default(false),
  shabbatHotel: z.string().optional(),
  pickupPoint: z.string().min(1, "Pickup point is required"),
  customPickupLocation: z.string().optional(),
  dropoffPoint: z.string().min(1, "Dropoff point is required"),
  customDropoffLocation: z.string().optional(),
  suggestedDestinations: z.string().optional(),
  specialRequests: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  budget: z.string().optional(),
  source: z.string().default("website"),
});

const agentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().optional(),
  specialties: z.string().optional(),
  languages: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
  notes: z.string().optional(),
});

const leadInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  source: z.string().default("website"),
  interestedTours: z.string().optional(),
  message: z.string().optional(),
});

const financialRecordInputSchema = z.object({
  bookingId: z.number(),
  type: z.enum(["revenue", "cost", "refund"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number(),
  currency: z.string().default("THB"),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentDate: z.string().optional().transform((s) => s ? new Date(s) : undefined),
  notes: z.string().optional(),
});

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
      .mutation(async ({ input }) => {
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
        }).catch(err => console.error('[Booking] Failed to send Manus notification:', err));
        
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
        }).catch(err => console.error('[Booking] Failed to send Resend email:', err));
        
        // Send confirmation email to customer with calendar attachment
        const tourType = input.includesTrip ? 'Custom Tour' : 'Tour Package';
        const pickupLocation = input.pickupPoint === 'custom' ? input.customPickupLocation : input.pickupPoint;
        const totalGuests = input.numberOfAdults + (input.numberOfChildren || 0);
        
        await sendCustomerConfirmation({
          customerName: input.contactName,
          customerEmail: input.contactEmail,
          tourDate: input.arrivalDate.toISOString(),
          tourType: tourType,
          groupSize: totalGuests,
          pickupLocation: pickupLocation,
          pickupTime: '08:00',
          specialRequests: input.specialRequests,
          bookingId: `WIRO-${Date.now()}`,
        }).catch(err => console.error('[Booking] Failed to send customer confirmation:', err));
        
        return { success: true, message: "Booking created successfully" };
      }),

    list: protectedProcedure.query(async () => {
      return await getAllBookings();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getBookingById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]).optional(),
          totalPrice: z.number().optional(),
          depositPaid: z.number().optional(),
          balancePaid: z.number().optional(),
          assignedAgentId: z.number().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await updateBooking(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBooking(input.id);
        return { success: true };
      }),
  }),

  // Agent procedures
  agent: router({
    create: protectedProcedure
      .input(agentInputSchema)
      .mutation(async ({ input }) => {
        await createAgent(input);
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
      .input(z.object({
        id: z.number(),
        data: agentInputSchema.partial(),
      }))
      .mutation(async ({ input }) => {
        await updateAgent(input.id, input.data);
        return { success: true };
      }),
  }),

  // Lead procedures
  lead: router({
    create: publicProcedure
      .input(leadInputSchema)
      .mutation(async ({ input }) => {
        await createLead(input);
        return { success: true, message: "Lead captured successfully" };
      }),

    list: protectedProcedure.query(async () => {
      return await getAllLeads();
    }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["new", "contacted", "quoted", "converted", "lost"]).optional(),
          convertedToBookingId: z.number().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await updateLead(input.id, input.data);
        return { success: true };
      }),
  }),

  // Financial procedures
  financial: router({
    create: protectedProcedure
      .input(financialRecordInputSchema)
      .mutation(async ({ input }) => {
        await createFinancialRecord(input);
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
  }),
});

export type AppRouter = typeof appRouter;
