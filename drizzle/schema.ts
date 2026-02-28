import {
  index,
  int,
  json,
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
  role: mysqlEnum("role", ["user", "admin", "owner", "manager", "agent"])
    .default("user")
    .notNull(),
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

    // UTM Tracking
    utmSource: varchar("utmSource", { length: 255 }),
    utmMedium: varchar("utmMedium", { length: 255 }),
    utmCampaign: varchar("utmCampaign", { length: 255 }),

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

export const bookingDrafts = mysqlTable("bookingDrafts", {
  id: int("id").autoincrement().primaryKey(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  formData: text("formData"), // Full JSON of form state
  tourSlug: varchar("tourSlug", { length: 255 }),
  resumeToken: varchar("resumeToken", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "converted", "expired"])
    .default("active")
    .notNull(),
  convertedToBookingId: int("convertedToBookingId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookingDraft = typeof bookingDrafts.$inferSelect;
export type InsertBookingDraft = typeof bookingDrafts.$inferInsert;

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
    index("idx_leads_status_createdAt").on(table.status, table.createdAt),
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

// Tour Packages Table
export const tourPackages = mysqlTable("tourPackages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameHe: varchar("nameHe", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionHe: text("descriptionHe"),
  tourSlugs: text("tourSlugs").notNull(), // JSON array of tour slugs
  discountPercent: int("discountPercent"), // Override (null = use default tier)
  coverImage: text("coverImage"),
  isPublished: int("isPublished").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TourPackage = typeof tourPackages.$inferSelect;
export type InsertTourPackage = typeof tourPackages.$inferInsert;

// Blog Posts Table
export const blogPosts = mysqlTable(
  "blogPosts",
  {
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
  },
  table => [
    index("idx_blogPosts_isPublished_publishedAt").on(
      table.isPublished,
      table.publishedAt
    ),
  ]
);
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

// CRM Customers Table
export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    whatsapp: varchar("whatsapp", { length: 50 }),
    language: mysqlEnum("language", ["en", "he"]).default("en"),
    stage: mysqlEnum("stage", [
      "prospect",
      "active",
      "completed",
      "vip",
      "inactive",
    ])
      .default("prospect")
      .notNull(),
    source: varchar("source", { length: 100 }).default("website"),
    tags: text("tags"), // JSON array: ["VIP", "repeat", "kosher-strict"]
    totalSpent: int("totalSpent").default(0),
    totalBookings: int("totalBookings").default(0),
    lastContactAt: timestamp("lastContactAt"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("idx_customers_email").on(table.email),
    index("idx_customers_phone").on(table.phone),
    index("idx_customers_stage").on(table.stage),
  ]
);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// CRM Customer Activities Table
export const customerActivities = mysqlTable(
  "customerActivities",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull(),
    type: mysqlEnum("type", [
      "note",
      "call",
      "whatsapp",
      "email",
      "follow_up",
      "status_change",
    ]).notNull(),
    content: text("content").notNull(),
    dueDate: timestamp("dueDate"),
    isCompleted: int("isCompleted").default(0).notNull(),
    createdBy: varchar("createdBy", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("idx_customerActivities_customerId").on(table.customerId),
    index("idx_customerActivities_dueDate").on(table.dueDate),
  ]
);

export type CustomerActivity = typeof customerActivities.$inferSelect;
export type InsertCustomerActivity = typeof customerActivities.$inferInsert;

// Chat Concierge Tables
export const chatSessions = mysqlTable(
  "chatSessions",
  {
    id: int("id").autoincrement().primaryKey(),
    visitorId: varchar("visitorId", { length: 64 }).notNull(),
    language: mysqlEnum("language", ["en", "he"]).default("en").notNull(),
    mode: mysqlEnum("mode", ["ai", "human", "closed"]).default("ai").notNull(),
    summary: text("summary"),
    bookingContext: text("bookingContext"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    closedAt: timestamp("closedAt"),
  },
  table => [index("idx_chatSessions_visitorId").on(table.visitorId)]
);

export const chatMessages = mysqlTable(
  "chatMessages",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull(),
    role: mysqlEnum("role", ["visitor", "ai", "agent"]).notNull(),
    content: text("content").notNull(),
    metadata: text("metadata"), // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("idx_chatMessages_sessionId").on(table.sessionId)]
);

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Settings Table (key-value store for admin configuration)
export const settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: json("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

// Accounting & Finance Tables

export const invoices = mysqlTable(
  "invoices",
  {
    id: int("id").autoincrement().primaryKey(),
    invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
    bookingId: int("bookingId"),
    type: mysqlEnum("type", [
      "tax_invoice",
      "receipt",
      "wht_certificate",
    ]).notNull(),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerAddress: text("customerAddress"),
    customerTaxId: varchar("customerTaxId", { length: 50 }),
    currency: varchar("currency", { length: 3 }).notNull().default("THB"),
    subtotal: int("subtotal").notNull(),
    vatAmount: int("vatAmount").default(0),
    whtRate: int("whtRate").default(0),
    whtAmount: int("whtAmount").default(0),
    totalAmount: int("totalAmount").notNull(),
    fxRate: varchar("fxRate", { length: 20 }),
    thbEquivalent: int("thbEquivalent"),
    status: mysqlEnum("status", ["unpaid", "paid", "partial", "cancelled"])
      .default("unpaid")
      .notNull(),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    paymentDate: timestamp("paymentDate"),
    lineItems: text("lineItems"),
    issuedAt: timestamp("issuedAt").defaultNow().notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("idx_invoices_bookingId").on(table.bookingId),
    index("idx_invoices_status").on(table.status),
  ]
);
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export const accountingEntries = mysqlTable(
  "accountingEntries",
  {
    id: int("id").autoincrement().primaryKey(),
    date: timestamp("date").notNull(),
    accountCode: varchar("accountCode", { length: 10 }).notNull(),
    description: text("description").notNull(),
    debit: int("debit").default(0),
    credit: int("credit").default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("THB"),
    originalAmount: int("originalAmount"),
    fxRate: varchar("fxRate", { length: 20 }),
    bookingId: int("bookingId"),
    invoiceId: int("invoiceId"),
    vendorPayee: varchar("vendorPayee", { length: 255 }),
    documentRef: varchar("documentRef", { length: 100 }),
    createdBy: varchar("createdBy", { length: 100 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("idx_accountingEntries_accountCode").on(table.accountCode),
    index("idx_accountingEntries_date").on(table.date),
    index("idx_accountingEntries_bookingId").on(table.bookingId),
  ]
);
export type AccountingEntry = typeof accountingEntries.$inferSelect;
export type InsertAccountingEntry = typeof accountingEntries.$inferInsert;

export const taxFilings = mysqlTable("taxFilings", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", [
    "vat_pp30",
    "wht_pnd3",
    "wht_pnd53",
    "cit_pnd50",
    "cit_pnd51",
  ]).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  outputVat: int("outputVat"),
  inputVat: int("inputVat"),
  netVat: int("netVat"),
  whtTotal: int("whtTotal"),
  taxableIncome: int("taxableIncome"),
  taxAmount: int("taxAmount"),
  status: mysqlEnum("status", ["pending", "prepared", "filed", "late"])
    .default("pending")
    .notNull(),
  filedAt: timestamp("filedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TaxFiling = typeof taxFilings.$inferSelect;
export type InsertTaxFiling = typeof taxFilings.$inferInsert;

export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "vehicle",
    "equipment",
    "supplies",
  ]).notNull(),
  description: text("description"),
  purchaseDate: timestamp("purchaseDate"),
  purchaseCost: int("purchaseCost"),
  currentValue: int("currentValue"),
  usefulLifeMonths: int("usefulLifeMonths"),
  monthlyDepreciation: int("monthlyDepreciation"),
  condition: mysqlEnum("condition", ["new", "good", "fair", "poor", "retired"])
    .default("good")
    .notNull(),
  quantity: int("quantity").default(1),
  location: varchar("location", { length: 255 }),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  nextMaintenanceDate: timestamp("nextMaintenanceDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = typeof inventory.$inferInsert;
