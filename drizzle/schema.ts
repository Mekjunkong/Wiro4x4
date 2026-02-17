import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Booking System Tables

export const bookings = mysqlTable(
  "bookings",
  {
    id: int("id").autoincrement().primaryKey(),
    // Customer Information
    contactName: varchar("contactName", { length: 255 }).notNull(),
    contactEmail: varchar("contactEmail", { length: 320 }),
    contactPhone: varchar("contactPhone", { length: 50 }).notNull(),
    contactWhatsApp: varchar("contactWhatsApp", { length: 50 }),
    agentName: varchar("agentName", { length: 200 }),

    // Trip Details
    arrivalDate: timestamp("arrivalDate").notNull(),
    departureDate: timestamp("departureDate").notNull(),
    numberOfAdults: int("numberOfAdults").notNull().default(1),
    hasChildren: int("hasChildren").notNull().default(0), // boolean as int
    numberOfChildren: int("numberOfChildren"),
    childrenAges: text("childrenAges"), // JSON string

    // Services
    includesHotels: int("includesHotels").notNull().default(0),
    hotelPreferences: text("hotelPreferences"),
    includesGuide: int("includesGuide").notNull().default(0),
    includesTrip: int("includesTrip").notNull().default(0),
    includesAttractions: int("includesAttractions").notNull().default(0),
    selectedAttractions: text("selectedAttractions"), // JSON array
    includesFood: int("includesFood").notNull().default(0),
    foodPreferences: text("foodPreferences"),
    needsShabbatHotel: int("needsShabbatHotel").notNull().default(0),
    shabbatHotel: varchar("shabbatHotel", { length: 255 }),
    selfDriving4x4: int("selfDriving4x4").notNull().default(0),

    // Logistics
    pickupPoint: varchar("pickupPoint", { length: 255 }).notNull(),
    customPickupLocation: text("customPickupLocation"),
    dropoffPoint: varchar("dropoffPoint", { length: 255 }).notNull(),
    customDropoffLocation: text("customDropoffLocation"),
    suggestedDestinations: text("suggestedDestinations"), // JSON array

    // Additional Info
    specialRequests: text("specialRequests"),
    dietaryRestrictions: text("dietaryRestrictions"),
    budget: varchar("budget", { length: 100 }),

    // Booking Status
    status: mysqlEnum("status", [
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
    ])
      .default("pending")
      .notNull(),
    totalPrice: int("totalPrice"), // in THB
    depositPaid: int("depositPaid").default(0),
    balancePaid: int("balancePaid").default(0),

    // Assignment
    assignedAgentId: int("assignedAgentId"),

    // Automated email tracking
    reminderSentAt: timestamp("reminderSentAt"),
    feedbackSentAt: timestamp("feedbackSentAt"),

    // Metadata
    source: varchar("source", { length: 100 }).default("website"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("idx_bookings_assignedAgentId").on(table.assignedAgentId),
    index("idx_bookings_status_createdAt").on(table.status, table.createdAt),
  ]
);

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  specialties: text("specialties"), // JSON array: ["kosher tours", "adventure", "cultural"]
  languages: text("languages"), // JSON array: ["Hebrew", "English", "Thai"]
  status: mysqlEnum("status", ["active", "inactive", "on_leave"])
    .default("active")
    .notNull(),
  rating: int("rating").default(5), // 1-5 stars
  totalBookings: int("totalBookings").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leads = mysqlTable(
  "leads",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    source: varchar("source", { length: 100 }).default("website"), // website, whatsapp, referral, etc.
    interestedTours: text("interestedTours"), // JSON array
    message: text("message"),
    status: mysqlEnum("status", [
      "new",
      "contacted",
      "quoted",
      "converted",
      "lost",
    ])
      .default("new")
      .notNull(),
    convertedToBookingId: int("convertedToBookingId"),
    notes: text("notes"),
    score: int("score").default(0), // Lead score 0-100
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("idx_leads_convertedToBookingId").on(table.convertedToBookingId),
  ]
);

export const financialRecords = mysqlTable(
  "financialRecords",
  {
    id: int("id").autoincrement().primaryKey(),
    bookingId: int("bookingId").notNull(),
    type: mysqlEnum("type", ["revenue", "cost", "refund"]).notNull(),
    category: varchar("category", { length: 100 }).notNull(), // hotel, guide, vehicle, food, attraction, etc.
    amount: int("amount").notNull(), // in THB
    currency: varchar("currency", { length: 10 }).default("THB").notNull(),
    description: text("description"),
    paymentMethod: varchar("paymentMethod", { length: 50 }), // cash, bank_transfer, card
    paymentDate: timestamp("paymentDate"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("idx_financialRecords_bookingId").on(table.bookingId)]
);

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;

// Gallery Photos Table
export const galleryPhotos = mysqlTable("galleryPhotos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  s3Url: varchar("s3Url", { length: 1024 }).notNull(),
  category: mysqlEnum("category", [
    "tours",
    "vehicles",
    "destinations",
    "activities",
    "food",
    "accommodation",
    "other",
  ])
    .default("other")
    .notNull(),
  sortOrder: int("sortOrder").default(0),
  isPublished: int("isPublished").default(1).notNull(), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Customer Reviews Table
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  text: text("text").notNull(),
  tourType: varchar("tourType", { length: 100 }),
  travelDate: timestamp("travelDate"),
  isApproved: int("isApproved").default(0).notNull(), // boolean as int
  isPublished: int("isPublished").default(0).notNull(), // boolean as int
  adminResponse: text("adminResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Payments Table (schema only — Stripe integration deferred)
export const payments = mysqlTable(
  "payments",
  {
    id: int("id").autoincrement().primaryKey(),
    bookingId: int("bookingId").notNull(),
    type: mysqlEnum("type", ["deposit", "balance", "full", "refund"]).notNull(),
    amount: int("amount").notNull(), // in THB
    currency: varchar("currency", { length: 10 }).default("THB").notNull(),
    status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"])
      .default("pending")
      .notNull(),
    stripeSessionId: varchar("stripeSessionId", { length: 255 }),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    notes: text("notes"),
    paidAt: timestamp("paidAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("idx_payments_bookingId").on(table.bookingId)]
);

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertGalleryPhoto = typeof galleryPhotos.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Tours Table
export const tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameHe: varchar("nameHe", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  descriptionHe: text("descriptionHe").notNull(),
  duration: varchar("duration", { length: 100 }).notNull(), // e.g., "6-8 hours"
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "challenging"])
    .default("moderate")
    .notNull(),
  price: int("price").notNull(), // THB
  groupMinSize: int("groupMinSize").default(1),
  groupMaxSize: int("groupMaxSize").default(10),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  highlights: text("highlights"), // JSON array of strings
  highlightsHe: text("highlightsHe"), // JSON array of Hebrew strings
  includedItems: text("includedItems"), // JSON array: [{en: "...", he: "..."}]
  itinerary: text("itinerary"), // JSON array: [{title, titleHe, description, descriptionHe}]
  isKosher: int("isKosher").default(1).notNull(),
  isPrivate: int("isPrivate").default(1).notNull(),
  isShabbatOk: int("isShabbatOk").default(1).notNull(),
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;

// Blog Posts Table
export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  titleHe: varchar("titleHe", { length: 500 }).default(""),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  excerptHe: text("excerptHe"),
  content: text("content").notNull(),
  contentHe: text("contentHe"),
  coverImage: varchar("coverImage", { length: 1000 }),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array
  isPublished: int("isPublished").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
  author: varchar("author", { length: 255 }).default("WIRO 4x4"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Audit Logs Table
export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    action: varchar("action", { length: 50 }).notNull(), // create, update, delete
    resourceType: varchar("resourceType", { length: 50 }).notNull(), // booking, agent, lead, etc.
    resourceId: int("resourceId"),
    oldValue: text("oldValue"), // JSON string
    newValue: text("newValue"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("idx_auditLogs_userId").on(table.userId),
    index("idx_auditLogs_resourceType_resourceId").on(
      table.resourceType,
      table.resourceId
    ),
  ]
);
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Newsletter Subscribers Table
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  language: varchar("language", { length: 10 }).default("en"),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  isActive: int("isActive").default(1).notNull(),
});
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

// Scheduled Emails Table (tracks automated emails to prevent duplicates)
export const scheduledEmails = mysqlTable(
  "scheduledEmails",
  {
    id: int("id").autoincrement().primaryKey(),
    type: mysqlEnum("type", [
      "reminder",
      "feedback",
      "lead_alert",
      "daily_summary",
    ]).notNull(),
    targetId: int("targetId"), // bookingId or leadId
    targetEmail: varchar("targetEmail", { length: 320 }),
    sentAt: timestamp("sentAt").defaultNow().notNull(),
    status: mysqlEnum("status", ["sent", "failed"]).default("sent").notNull(),
  },
  table => [
    index("idx_scheduledEmails_type_targetId").on(table.type, table.targetId),
  ]
);
export type ScheduledEmail = typeof scheduledEmails.$inferSelect;
export type InsertScheduledEmail = typeof scheduledEmails.$inferInsert;
