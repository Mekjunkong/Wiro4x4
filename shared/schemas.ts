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
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().min(1, "Phone is required"),
  contactWhatsApp: z.string().optional(),
  agentName: z.string().max(200).optional(),
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
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
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
  slug: z.string().optional(),
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
  includedItems: z.string().optional(),
  itinerary: z.string().optional(),
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

export const customerInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  language: z.enum(["en", "he"]).default("en"),
  stage: z
    .enum(["prospect", "active", "completed", "vip", "inactive"])
    .default("prospect"),
  source: z.string().max(100).default("website"),
  tags: z.string().optional(), // JSON array string
  notes: z.string().max(2000).optional(),
});

export const customerActivityInputSchema = z.object({
  customerId: z.number(),
  type: z.enum([
    "note",
    "call",
    "whatsapp",
    "email",
    "follow_up",
    "status_change",
  ]),
  content: z.string().min(1, "Content is required").max(2000),
  dueDate: z
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : undefined)),
  createdBy: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  userId: z.number(),
  role: z.enum(["user", "admin", "owner", "manager", "agent"]),
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
export type CustomerInput = z.infer<typeof customerInputSchema>;
export type CustomerActivityInput = z.infer<typeof customerActivityInputSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const settingsUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

export const bookingDraftInputSchema = z.object({
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  formData: z.string(), // JSON string
  tourSlug: z.string().optional(),
});

export type BookingDraftInput = z.infer<typeof bookingDraftInputSchema>;
