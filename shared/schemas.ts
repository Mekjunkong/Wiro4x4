/**
 * Shared Zod validation schemas used by both client and server.
 * These are the single source of truth for input validation.
 */
import { z } from "zod";

const noHtml = (val: string) => !/<[^>]*>/g.test(val);

export const bookingInputSchema = z.object({
  contactName: z
    .string()
    .min(1, "Name is required")
    .max(200)
    .refine(noHtml, "HTML tags are not allowed"),
  contactEmail: z.string().email("Invalid email"),
  contactPhone: z.string().min(1, "Phone is required"),
  contactWhatsApp: z.string().optional(),
  arrivalDate: z.string().transform(s => new Date(s)),
  departureDate: z.string().transform(s => new Date(s)),
  numberOfAdults: z.number().min(1).default(1),
  hasChildren: z.boolean().default(false),
  numberOfChildren: z.number().optional(),
  childrenAges: z.string().optional(),
  includesHotels: z.boolean().default(false),
  hotelPreferences: z.optional(
    z.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  includesGuide: z.boolean().default(false),
  includesTrip: z.boolean().default(false),
  includesAttractions: z.boolean().default(false),
  selectedAttractions: z.string().optional(),
  includesFood: z.boolean().default(false),
  foodPreferences: z.optional(
    z.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  needsShabbatHotel: z.boolean().default(false),
  shabbatHotel: z.string().optional(),
  pickupPoint: z.string().min(1, "Pickup point is required"),
  customPickupLocation: z.string().max(500).optional(),
  dropoffPoint: z.string().min(1, "Dropoff point is required"),
  customDropoffLocation: z.string().max(500).optional(),
  suggestedDestinations: z.string().max(500).optional(),
  specialRequests: z.optional(
    z.string().max(1000).refine(noHtml, "HTML tags are not allowed")
  ),
  dietaryRestrictions: z.optional(
    z.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  budget: z.string().optional(),
  source: z.string().default("website"),
});

export const agentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().optional(),
  specialties: z.string().optional(),
  languages: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
  notes: z.string().max(500).optional(),
});

export const leadInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  source: z.string().default("website"),
  interestedTours: z.string().optional(),
  message: z.optional(
    z.string().max(1000).refine(noHtml, "HTML tags are not allowed")
  ),
});

export const financialRecordInputSchema = z.object({
  bookingId: z.number(),
  type: z.enum(["revenue", "cost", "refund"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number(),
  currency: z.string().default("THB"),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentDate: z
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : undefined)),
  notes: z.string().optional(),
});

export const tourInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameHe: z.string().min(1, "Hebrew name is required"),
  description: z.string().min(1, "Description is required"),
  descriptionHe: z.string().min(1, "Hebrew description is required"),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.enum(["easy", "moderate", "challenging"]).default("moderate"),
  price: z.number().min(0, "Price must be positive"),
  groupMinSize: z.number().min(1).default(1),
  groupMaxSize: z.number().min(1).default(10),
  imageUrl: z.string().min(1, "Image URL is required"),
  highlights: z.string().optional(),
  highlightsHe: z.string().optional(),
  isKosher: z.boolean().default(true),
  isPrivate: z.boolean().default(true),
  isShabbatOk: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const reviewInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  rating: z.number().min(1).max(5),
  text: z
    .string()
    .min(1, "Review text is required")
    .max(2000)
    .refine(noHtml, "HTML tags are not allowed"),
  tourType: z.string().optional(),
});

export const blogPostInputSchema = z.object({
  title: z.string().min(1),
  titleHe: z.string().optional(),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  excerptHe: z.string().optional(),
  content: z.string().min(1),
  contentHe: z.string().optional(),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  isPublished: z.boolean().optional(),
  author: z.string().optional(),
});

export const createCheckoutSchema = z.object({
  bookingId: z.number(),
  amount: z.number().positive(),
  type: z.enum(["deposit", "balance", "full"]),
});

export const refundSchema = z.object({
  paymentId: z.number(),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

export const verifySessionSchema = z.object({
  sessionId: z.string(),
});

export const paginationInput = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
export type AgentInput = z.infer<typeof agentInputSchema>;
export type LeadInput = z.infer<typeof leadInputSchema>;
export type FinancialRecordInput = z.infer<typeof financialRecordInputSchema>;
export type TourInput = z.infer<typeof tourInputSchema>;
export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
export type PaginationInput = z.infer<typeof paginationInput>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type VerifySessionInput = z.infer<typeof verifySessionSchema>;
