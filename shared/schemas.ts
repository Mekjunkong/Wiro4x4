/**
 * Shared Zod validation schemas used by both client and server.
 * These are the single source of truth for input validation.
 */
import { z } from "zod";

export const bookingInputSchema = z.object({
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

export const agentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().optional(),
  specialties: z.string().optional(),
  languages: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
  notes: z.string().optional(),
});

export const leadInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  source: z.string().default("website"),
  interestedTours: z.string().optional(),
  message: z.string().optional(),
});

export const financialRecordInputSchema = z.object({
  bookingId: z.number(),
  type: z.enum(["revenue", "cost", "refund"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number(),
  currency: z.string().default("THB"),
  description: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
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
  text: z.string().min(1, "Review text is required"),
  tourType: z.string().optional(),
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
export type PaginationInput = z.infer<typeof paginationInput>;
