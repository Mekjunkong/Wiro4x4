var __require = /* @__PURE__ */ (x =>
  typeof require !== "undefined"
    ? require
    : typeof Proxy !== "undefined"
      ? new Proxy(x, {
          get: (a, b) => (typeof require !== "undefined" ? require : a)[b],
        })
      : x)(function (x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server/vercel-entry.ts
import "dotenv/config";
import helmet from "helmet";

// server/_core/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routes/authRoutes.ts
import { z } from "zod";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var COMPANY_WHATSAPP = "66929894495";
var COMPANY_WHATSAPP_URL = `https://wa.me/${COMPANY_WHATSAPP}`;
var COMPANY_PHONE = "+66 92-989-4495";
var COMPANY_SENDER_EMAIL = "bookings@wiro4x4indochina.com";
var COMPANY_NAME = "WIRO 4x4 - Kosher Off-Road Adventures";
var COMPANY_WEBSITE = "https://www.wiro4x4indochina.com";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}

// server/auth.ts
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
var SALT_ROUNDS = 10;
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function createSession(userId, email, role) {
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());
}
async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}
function generateResetToken() {
  return randomBytes(32).toString("hex");
}

// server/db/connection.ts
import { drizzle } from "drizzle-orm/mysql2";
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// server/db/users.ts
import { eq } from "drizzle-orm";
import { desc, inArray } from "drizzle-orm";

// drizzle/schema.ts
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
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 60 }).notNull(),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin", "owner", "manager", "agent"])
    .default("user")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
var passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
var bookings = mysqlTable(
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
    hasChildren: int("hasChildren").notNull().default(0),
    // boolean as int
    numberOfChildren: int("numberOfChildren"),
    childrenAges: text("childrenAges"),
    // JSON string
    // Services
    includesHotels: int("includesHotels").notNull().default(0),
    hotelPreferences: text("hotelPreferences"),
    includesGuide: int("includesGuide").notNull().default(0),
    includesTrip: int("includesTrip").notNull().default(0),
    includesAttractions: int("includesAttractions").notNull().default(0),
    selectedAttractions: text("selectedAttractions"),
    // JSON array
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
    suggestedDestinations: text("suggestedDestinations"),
    // JSON array
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
    totalPrice: int("totalPrice"),
    // in THB
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
var bookingDrafts = mysqlTable("bookingDrafts", {
  id: int("id").autoincrement().primaryKey(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  formData: text("formData"),
  // Full JSON of form state
  tourSlug: varchar("tourSlug", { length: 255 }),
  resumeToken: varchar("resumeToken", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "converted", "expired"])
    .default("active")
    .notNull(),
  convertedToBookingId: int("convertedToBookingId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  specialties: text("specialties"),
  // JSON array: ["kosher tours", "adventure", "cultural"]
  languages: text("languages"),
  // JSON array: ["Hebrew", "English", "Thai"]
  status: mysqlEnum("status", ["active", "inactive", "on_leave"])
    .default("active")
    .notNull(),
  rating: int("rating").default(5),
  // 1-5 stars
  totalBookings: int("totalBookings").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var leads = mysqlTable(
  "leads",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    source: varchar("source", { length: 100 }).default("website"),
    // website, whatsapp, referral, etc.
    interestedTours: text("interestedTours"),
    // JSON array
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
    score: int("score").default(0),
    // Lead score 0-100
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("idx_leads_convertedToBookingId").on(table.convertedToBookingId),
    index("idx_leads_status_createdAt").on(table.status, table.createdAt),
  ]
);
var financialRecords = mysqlTable(
  "financialRecords",
  {
    id: int("id").autoincrement().primaryKey(),
    bookingId: int("bookingId").notNull(),
    type: mysqlEnum("type", ["revenue", "cost", "refund"]).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    // hotel, guide, vehicle, food, attraction, etc.
    amount: int("amount").notNull(),
    // in THB
    currency: varchar("currency", { length: 10 }).default("THB").notNull(),
    description: text("description"),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    // cash, bank_transfer, card
    paymentDate: timestamp("paymentDate"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("idx_financialRecords_bookingId").on(table.bookingId)]
);
var galleryPhotos = mysqlTable("galleryPhotos", {
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
  isPublished: int("isPublished").default(1).notNull(),
  // boolean as int
  isFeatured: int("isFeatured").default(0).notNull(),
  // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  rating: int("rating").notNull(),
  // 1-5
  title: varchar("title", { length: 255 }),
  text: text("text").notNull(),
  tourType: varchar("tourType", { length: 100 }),
  travelDate: timestamp("travelDate"),
  isApproved: int("isApproved").default(0).notNull(),
  // boolean as int
  isPublished: int("isPublished").default(0).notNull(),
  // boolean as int
  adminResponse: text("adminResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var payments = mysqlTable(
  "payments",
  {
    id: int("id").autoincrement().primaryKey(),
    bookingId: int("bookingId").notNull(),
    type: mysqlEnum("type", ["deposit", "balance", "full", "refund"]).notNull(),
    amount: int("amount").notNull(),
    // in THB
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
var tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameHe: varchar("nameHe", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  descriptionHe: text("descriptionHe").notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  // e.g., "6-8 hours"
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "challenging"])
    .default("moderate")
    .notNull(),
  price: int("price").notNull(),
  // THB
  groupMinSize: int("groupMinSize").default(1),
  groupMaxSize: int("groupMaxSize").default(10),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  highlights: text("highlights"),
  // JSON array of strings
  highlightsHe: text("highlightsHe"),
  // JSON array of Hebrew strings
  includedItems: text("includedItems"),
  // JSON array: [{en: "...", he: "..."}]
  itinerary: text("itinerary"),
  // JSON array: [{title, titleHe, description, descriptionHe}]
  isKosher: int("isKosher").default(1).notNull(),
  isPrivate: int("isPrivate").default(1).notNull(),
  isShabbatOk: int("isShabbatOk").default(1).notNull(),
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var tourPackages = mysqlTable("tourPackages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameHe: varchar("nameHe", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionHe: text("descriptionHe"),
  tourSlugs: text("tourSlugs").notNull(),
  // JSON array of tour slugs
  discountPercent: int("discountPercent"),
  // Override (null = use default tier)
  coverImage: text("coverImage"),
  isPublished: int("isPublished").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
var blogPosts = mysqlTable(
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
    coverImage: varchar("coverImage", { length: 1e3 }),
    category: varchar("category", { length: 100 }),
    tags: text("tags"),
    // JSON array
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
var auditLogs = mysqlTable(
  "auditLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    action: varchar("action", { length: 50 }).notNull(),
    // create, update, delete
    resourceType: varchar("resourceType", { length: 50 }).notNull(),
    // booking, agent, lead, etc.
    resourceId: int("resourceId"),
    oldValue: text("oldValue"),
    // JSON string
    newValue: text("newValue"),
    // JSON string
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
var subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  language: varchar("language", { length: 10 }).default("en"),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  isActive: int("isActive").default(1).notNull(),
});
var scheduledEmails = mysqlTable(
  "scheduledEmails",
  {
    id: int("id").autoincrement().primaryKey(),
    type: mysqlEnum("type", [
      "reminder",
      "feedback",
      "lead_alert",
      "daily_summary",
    ]).notNull(),
    targetId: int("targetId"),
    // bookingId or leadId
    targetEmail: varchar("targetEmail", { length: 320 }),
    sentAt: timestamp("sentAt").defaultNow().notNull(),
    status: mysqlEnum("status", ["sent", "failed"]).default("sent").notNull(),
  },
  table => [
    index("idx_scheduledEmails_type_targetId").on(table.type, table.targetId),
  ]
);
var customers = mysqlTable(
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
    tags: text("tags"),
    // JSON array: ["VIP", "repeat", "kosher-strict"]
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
var customerActivities = mysqlTable(
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
var chatSessions = mysqlTable(
  "chatSessions",
  {
    id: int("id").autoincrement().primaryKey(),
    visitorId: varchar("visitorId", { length: 64 }).notNull(),
    language: mysqlEnum("language", ["en", "he"]).default("en").notNull(),
    mode: mysqlEnum("mode", ["ai", "human", "closed"]).default("ai").notNull(),
    summary: text("summary"),
    bookingContext: text("bookingContext"),
    // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    closedAt: timestamp("closedAt"),
  },
  table => [index("idx_chatSessions_visitorId").on(table.visitorId)]
);
var chatMessages = mysqlTable(
  "chatMessages",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull(),
    role: mysqlEnum("role", ["visitor", "ai", "agent"]).notNull(),
    content: text("content").notNull(),
    metadata: text("metadata"),
    // JSON string
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("idx_chatMessages_sessionId").on(table.sessionId)]
);
var settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: json("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});
var invoices = mysqlTable(
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
var accountingEntries = mysqlTable(
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
var taxFilings = mysqlTable("taxFilings", {
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
var inventory = mysqlTable("inventory", {
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

// server/db/users.ts
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createUser(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name ?? null,
    role: data.role ?? "user",
    lastSignedIn: /* @__PURE__ */ new Date(),
  });
  return result[0].insertId;
}
async function updateUserPassword(userId, passwordHash) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}
async function updateLastSignedIn(userId) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ lastSignedIn: /* @__PURE__ */ new Date() })
    .where(eq(users.id, userId));
}
async function getAllAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(users)
    .where(inArray(users.role, ["admin", "owner", "manager", "agent"]))
    .orderBy(desc(users.createdAt));
}
async function updateUserRole(userId, role) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(users).set({ role }).where(eq(users.id, userId));
}
async function removeAdminAccess(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(users)
    .set({ role: "user" })
    .where(eq(users.id, userId));
}

// server/db/bookings.ts
import { eq as eq2, and, sql, inArray as inArray2 } from "drizzle-orm";
import { desc as desc2 } from "drizzle-orm";
async function createBooking(booking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(booking);
  return result;
}
async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookings).orderBy(desc2(bookings.createdAt));
}
async function getBookingById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(bookings)
    .where(eq2(bookings.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateBooking(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(bookings).set(data).where(eq2(bookings.id, id));
}
async function deleteBooking(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(bookings).where(eq2(bookings.id, id));
}
async function getAllBookingsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(bookings)
    .orderBy(desc2(bookings.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db.select({ count: sql`count(*)` }).from(bookings);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function bulkDeleteBookings(ids) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(bookings).where(inArray2(bookings.id, ids));
}
async function getBookingsNeedingReminder() {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1e3);
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq2(bookings.status, "confirmed"),
        sql`${bookings.reminderSentAt} IS NULL`,
        sql`${bookings.arrivalDate} >= ${in24h}`,
        sql`${bookings.arrivalDate} <= ${in48h}`
      )
    );
}
async function getBookingsNeedingFeedback() {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(bookings)
    .where(
      and(
        sql`${bookings.feedbackSentAt} IS NULL`,
        sql`${bookings.departureDate} <= ${oneDayAgo}`,
        sql`${bookings.departureDate} >= ${twoDaysAgo}`,
        sql`${bookings.status} IN ('completed', 'confirmed', 'in_progress')`
      )
    );
}
async function markReminderSent(bookingId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(bookings)
    .set({ reminderSentAt: /* @__PURE__ */ new Date() })
    .where(eq2(bookings.id, bookingId));
}
async function markFeedbackSent(bookingId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(bookings)
    .set({ feedbackSentAt: /* @__PURE__ */ new Date() })
    .where(eq2(bookings.id, bookingId));
}
async function getPendingBookingCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql`count(*)` })
    .from(bookings)
    .where(eq2(bookings.status, "pending"));
  return Number(result[0]?.count ?? 0);
}
async function getUpcomingTourCount(withinHours = 48) {
  const db = await getDb();
  if (!db) return 0;
  const now = /* @__PURE__ */ new Date();
  const cutoff = new Date(now.getTime() + withinHours * 60 * 60 * 1e3);
  const result = await db
    .select({ count: sql`count(*)` })
    .from(bookings)
    .where(
      and(
        sql`${bookings.arrivalDate} >= ${now}`,
        sql`${bookings.arrivalDate} <= ${cutoff}`,
        sql`${bookings.status} IN ('confirmed', 'in_progress')`
      )
    );
  return Number(result[0]?.count ?? 0);
}
async function getBookingsByAgentId(agentId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookings)
    .where(eq2(bookings.assignedAgentId, agentId))
    .orderBy(desc2(bookings.createdAt));
}
async function getAgentBookingsInDateRange(agentId, startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq2(bookings.assignedAgentId, agentId),
        sql`${bookings.status} IN ('confirmed', 'in_progress')`,
        sql`${bookings.arrivalDate} <= ${endDate}`,
        sql`${bookings.departureDate} >= ${startDate}`
      )
    );
}

// server/db/agents.ts
import { eq as eq3, sql as sql2 } from "drizzle-orm";
import { desc as desc3 } from "drizzle-orm";
async function createAgent(agent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(agents).values(agent);
}
async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(agents).orderBy(desc3(agents.totalBookings));
}
async function getAgentById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(agents)
    .where(eq3(agents.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateAgent(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(agents).set(data).where(eq3(agents.id, id));
}
async function deleteAgent(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(agents).where(eq3(agents.id, id));
}
async function getAgentPerformanceStats() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      status: agents.status,
      rating: agents.rating,
      totalBookings: sql2`COUNT(${bookings.id})`,
      completedBookings: sql2`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`,
      activeBookings: sql2`SUM(CASE WHEN ${bookings.status} IN ('confirmed', 'in_progress') THEN 1 ELSE 0 END)`,
    })
    .from(agents)
    .leftJoin(bookings, eq3(bookings.assignedAgentId, agents.id))
    .groupBy(agents.id, agents.name, agents.status, agents.rating);
  return result.map(r => ({
    ...r,
    rating: r.rating ?? 5,
    totalBookings: Number(r.totalBookings),
    completedBookings: Number(r.completedBookings ?? 0),
    activeBookings: Number(r.activeBookings ?? 0),
  }));
}

// server/db/leads.ts
import { eq as eq4, sql as sql3, inArray as inArray3 } from "drizzle-orm";
import { desc as desc4 } from "drizzle-orm";
async function createLead(lead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(leads).values(lead);
}
async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leads).orderBy(desc4(leads.createdAt));
}
async function updateLead(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(leads).set(data).where(eq4(leads.id, id));
}
async function deleteLead(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(leads).where(eq4(leads.id, id));
}
async function getAllLeadsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(leads)
    .orderBy(desc4(leads.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db.select({ count: sql3`count(*)` }).from(leads);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function bulkDeleteLeads(ids) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(leads).where(inArray3(leads.id, ids));
}
async function getNewLeadCount(withinHours = 24) {
  const db = await getDb();
  if (!db) return 0;
  const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1e3);
  const result = await db
    .select({ count: sql3`count(*)` })
    .from(leads)
    .where(sql3`${leads.createdAt} >= ${cutoff}`);
  return Number(result[0]?.count ?? 0);
}
async function getStaleNewLeads() {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(leads)
    .where(sql3`${leads.status} = 'new' AND ${leads.updatedAt} < ${cutoff}`);
}
async function getColdContactedLeads() {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(leads)
    .where(
      sql3`${leads.status} = 'contacted' AND ${leads.updatedAt} < ${cutoff}`
    );
}
async function updateLeadScore(leadId, score) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(leads)
    .set({ score: Math.max(0, Math.min(100, Math.round(score))) })
    .where(eq4(leads.id, leadId));
}

// server/db/financial.ts
import { eq as eq5, sql as sql4 } from "drizzle-orm";
import { desc as desc5 } from "drizzle-orm";
async function createFinancialRecord(record) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(financialRecords).values(record);
}
async function getFinancialRecordsByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(financialRecords)
    .where(eq5(financialRecords.bookingId, bookingId));
}
async function getAllFinancialRecords() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(financialRecords)
    .orderBy(desc5(financialRecords.createdAt));
}
async function updateFinancialRecord(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(financialRecords)
    .set(data)
    .where(eq5(financialRecords.id, id));
}
async function deleteFinancialRecord(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(financialRecords).where(eq5(financialRecords.id, id));
}
async function getFinancialStats() {
  const db = await getDb();
  if (!db)
    return { totalRevenue: 0, totalCosts: 0, totalRefunds: 0, netProfit: 0 };
  const all = await db.select().from(financialRecords);
  const revenue = all
    .filter(r => r.type === "revenue")
    .reduce((sum2, r) => sum2 + r.amount, 0);
  const costs = all
    .filter(r => r.type === "cost")
    .reduce((sum2, r) => sum2 + r.amount, 0);
  const refunds = all
    .filter(r => r.type === "refund")
    .reduce((sum2, r) => sum2 + r.amount, 0);
  return {
    totalRevenue: revenue,
    totalCosts: costs,
    totalRefunds: refunds,
    netProfit: revenue - costs - refunds,
  };
}
async function getAllFinancialRecordsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(financialRecords)
    .orderBy(desc5(financialRecords.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql4`count(*)` })
    .from(financialRecords);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function generateDefaultFinancialRecords(bookingId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const booking = await getBookingById(bookingId);
  if (!booking) throw new Error("Booking not found");
  const existing = await getFinancialRecordsByBookingId(bookingId);
  if (existing.length > 0) return existing;
  const allRecords = await db.select().from(financialRecords);
  const costRecords = allRecords.filter(r => r.type === "cost");
  function avgCostByCategory(category) {
    const matching = costRecords.filter(r => r.category === category);
    if (matching.length === 0) return 0;
    return Math.round(
      matching.reduce((sum2, r) => sum2 + r.amount, 0) / matching.length
    );
  }
  const records = [];
  const guests = booking.numberOfAdults + (booking.numberOfChildren ?? 0);
  if (booking.totalPrice) {
    records.push({
      bookingId,
      type: "revenue",
      category: "tour_package",
      amount: booking.totalPrice,
      currency: "THB",
      description: `Tour package for ${guests} guests`,
    });
  }
  if (booking.includesGuide) {
    const avg = avgCostByCategory("guide_salary");
    records.push({
      bookingId,
      type: "cost",
      category: "guide_salary",
      amount: avg || 2e3,
      currency: "THB",
      description: "Guide salary (estimated)",
    });
  }
  if (booking.includesHotels) {
    const avg = avgCostByCategory("hotel_cost");
    records.push({
      bookingId,
      type: "cost",
      category: "hotel_cost",
      amount: avg || 3e3,
      currency: "THB",
      description: `Hotel cost for ${guests} guests (estimated)`,
    });
  }
  if (booking.includesFood) {
    const avg = avgCostByCategory("food_cost");
    records.push({
      bookingId,
      type: "cost",
      category: "food_cost",
      amount: avg || 1500,
      currency: "THB",
      description: `Kosher food for ${guests} guests (estimated)`,
    });
  }
  if (booking.includesTrip) {
    const avg = avgCostByCategory("vehicle_rental");
    records.push({
      bookingId,
      type: "cost",
      category: "vehicle_rental",
      amount: avg || 2500,
      currency: "THB",
      description: "4x4 vehicle rental (estimated)",
    });
  }
  for (const record of records) {
    await db.insert(financialRecords).values(record);
  }
  return records;
}
async function getFinancialStatsByTour() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      bookingId: financialRecords.bookingId,
      type: financialRecords.type,
      amount: financialRecords.amount,
      suggestedDestinations: bookings.suggestedDestinations,
    })
    .from(financialRecords)
    .innerJoin(bookings, eq5(financialRecords.bookingId, bookings.id));
  const tourMap = /* @__PURE__ */ new Map();
  for (const row of rows) {
    let tourNames = [];
    if (row.suggestedDestinations) {
      try {
        const parsed = JSON.parse(row.suggestedDestinations);
        tourNames = Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        tourNames = [row.suggestedDestinations];
      }
    }
    if (tourNames.length === 0) {
      tourNames = ["Unassigned"];
    }
    for (const tourName of tourNames) {
      const name = tourName.trim() || "Unassigned";
      if (!tourMap.has(name)) {
        tourMap.set(name, {
          totalRevenue: 0,
          totalCosts: 0,
          totalRefunds: 0,
          netProfit: 0,
          bookingIds: /* @__PURE__ */ new Set(),
        });
      }
      const entry = tourMap.get(name);
      entry.bookingIds.add(row.bookingId);
      if (row.type === "revenue") entry.totalRevenue += row.amount;
      else if (row.type === "cost") entry.totalCosts += row.amount;
      else if (row.type === "refund") entry.totalRefunds += row.amount;
    }
  }
  return Array.from(tourMap.entries()).map(([tourName, stats]) => ({
    tourName,
    totalRevenue: stats.totalRevenue,
    totalCosts: stats.totalCosts,
    totalRefunds: stats.totalRefunds,
    netProfit: stats.totalRevenue - stats.totalCosts - stats.totalRefunds,
    bookingCount: stats.bookingIds.size,
  }));
}
async function getFinancialStatsByAgent() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      bookingId: financialRecords.bookingId,
      type: financialRecords.type,
      amount: financialRecords.amount,
      assignedAgentId: bookings.assignedAgentId,
      agentName: agents.name,
    })
    .from(financialRecords)
    .innerJoin(bookings, eq5(financialRecords.bookingId, bookings.id))
    .leftJoin(agents, eq5(bookings.assignedAgentId, agents.id));
  const agentMap = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const agentName = row.agentName ?? "Unassigned";
    if (!agentMap.has(agentName)) {
      agentMap.set(agentName, {
        totalRevenue: 0,
        totalCosts: 0,
        totalRefunds: 0,
        netProfit: 0,
        bookingIds: /* @__PURE__ */ new Set(),
      });
    }
    const entry = agentMap.get(agentName);
    entry.bookingIds.add(row.bookingId);
    if (row.type === "revenue") entry.totalRevenue += row.amount;
    else if (row.type === "cost") entry.totalCosts += row.amount;
    else if (row.type === "refund") entry.totalRefunds += row.amount;
  }
  return Array.from(agentMap.entries()).map(([agentName, stats]) => ({
    agentName,
    totalRevenue: stats.totalRevenue,
    totalCosts: stats.totalCosts,
    totalRefunds: stats.totalRefunds,
    netProfit: stats.totalRevenue - stats.totalCosts - stats.totalRefunds,
    bookingCount: stats.bookingIds.size,
  }));
}

// server/db/gallery.ts
import { eq as eq6, sql as sql5, and as and2 } from "drizzle-orm";
import { desc as desc6 } from "drizzle-orm";
async function createGalleryPhoto(photo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(galleryPhotos).values(photo);
}
async function getAllPublishedPhotos(limit) {
  const db = await getDb();
  if (!db) return [];
  const query = db
    .select()
    .from(galleryPhotos)
    .where(eq6(galleryPhotos.isPublished, 1))
    .orderBy(galleryPhotos.sortOrder, desc6(galleryPhotos.createdAt));
  if (limit) {
    return await query.limit(limit);
  }
  return await query;
}
async function getFeaturedPhotos(limit = 8) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(galleryPhotos)
    .where(
      and2(eq6(galleryPhotos.isPublished, 1), eq6(galleryPhotos.isFeatured, 1))
    )
    .orderBy(desc6(galleryPhotos.createdAt))
    .limit(limit);
}
async function getAllGalleryPhotos() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(galleryPhotos)
    .orderBy(galleryPhotos.sortOrder, desc6(galleryPhotos.createdAt));
}
async function updateGalleryPhoto(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(galleryPhotos)
    .set(data)
    .where(eq6(galleryPhotos.id, id));
}
async function deleteGalleryPhoto(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(galleryPhotos).where(eq6(galleryPhotos.id, id));
}
async function getPublishedPhotosPaginated(page = 1, pageSize = 20, category) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const conditions = [eq6(galleryPhotos.isPublished, 1)];
  if (category && category !== "all") {
    conditions.push(eq6(galleryPhotos.category, category));
  }
  const whereClause =
    conditions.length === 1 ? conditions[0] : and2(...conditions);
  const items = await db
    .select()
    .from(galleryPhotos)
    .where(whereClause)
    .orderBy(galleryPhotos.sortOrder, desc6(galleryPhotos.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql5`count(*)` })
    .from(galleryPhotos)
    .where(whereClause);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function getAllGalleryPhotosPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(galleryPhotos)
    .orderBy(galleryPhotos.sortOrder, desc6(galleryPhotos.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql5`count(*)` })
    .from(galleryPhotos);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

// server/db/reviews.ts
import {
  eq as eq7,
  and as and3,
  sql as sql6,
  inArray as inArray4,
} from "drizzle-orm";
import { desc as desc7 } from "drizzle-orm";
async function createReview(review) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(reviews).values(review);
}
async function getApprovedReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(reviews)
    .where(and3(eq7(reviews.isApproved, 1), eq7(reviews.isPublished, 1)))
    .orderBy(desc7(reviews.createdAt));
}
async function getAllReviews() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews).orderBy(desc7(reviews.createdAt));
}
async function updateReview(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(reviews).set(data).where(eq7(reviews.id, id));
}
async function deleteReview(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(reviews).where(eq7(reviews.id, id));
}
async function getReviewStats() {
  const db = await getDb();
  if (!db) return { totalReviews: 0, averageRating: 0, approvedCount: 0 };
  const all = await db.select().from(reviews);
  const approved = all.filter(r => r.isApproved === 1);
  const avgRating =
    all.length > 0
      ? all.reduce((sum2, r) => sum2 + r.rating, 0) / all.length
      : 0;
  return {
    totalReviews: all.length,
    averageRating: Math.round(avgRating * 10) / 10,
    approvedCount: approved.length,
  };
}
async function getAllReviewsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(reviews)
    .orderBy(desc7(reviews.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db.select({ count: sql6`count(*)` }).from(reviews);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function bulkApproveReviews(ids) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(reviews)
    .set({ isApproved: 1, isPublished: 1 })
    .where(inArray4(reviews.id, ids));
}
async function getPendingReviewCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql6`count(*)` })
    .from(reviews)
    .where(eq7(reviews.isApproved, 0));
  return Number(result[0]?.count ?? 0);
}
async function bulkDeleteReviews(ids) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(reviews).where(inArray4(reviews.id, ids));
}

// server/db/payments.ts
import { eq as eq8, and as and4, sql as sql7 } from "drizzle-orm";
import { desc as desc8 } from "drizzle-orm";
async function createPayment(payment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(payments).values(payment);
}
async function getPaymentsByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(payments)
    .where(eq8(payments.bookingId, bookingId))
    .orderBy(desc8(payments.createdAt));
}
async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(payments).orderBy(desc8(payments.createdAt));
}
async function getPaymentStats() {
  const db = await getDb();
  if (!db) return { totalPayments: 0, totalAmount: 0, completedAmount: 0 };
  const all = await db.select().from(payments);
  const completed = all.filter(p => p.status === "completed");
  return {
    totalPayments: all.length,
    totalAmount: all.reduce((sum2, p) => sum2 + p.amount, 0),
    completedAmount: completed.reduce((sum2, p) => sum2 + p.amount, 0),
  };
}
async function getPaymentById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(payments)
    .where(eq8(payments.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPaymentBySessionId(sessionId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(payments)
    .where(eq8(payments.stripeSessionId, sessionId))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllPendingPayments() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(payments)
    .where(eq8(payments.status, "pending"))
    .orderBy(payments.createdAt);
}
async function updatePayment(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(payments).set(data).where(eq8(payments.id, id));
}
async function getBookingTotalPaid(bookingId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql7`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(
      and4(
        eq8(payments.bookingId, bookingId),
        eq8(payments.status, "completed")
      )
    );
  return Number(result[0]?.total ?? 0);
}

// server/db/tours.ts
import { eq as eq9, sql as sql8 } from "drizzle-orm";
import { desc as desc9 } from "drizzle-orm";
async function createTour(tour) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tours).values(tour);
}
async function getAllActiveTours() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tours)
    .where(eq9(tours.isActive, 1))
    .orderBy(tours.sortOrder, desc9(tours.createdAt));
}
async function getAllTours() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tours)
    .orderBy(tours.sortOrder, desc9(tours.createdAt));
}
async function getTourBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(tours)
    .where(eq9(tours.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateTour(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(tours).set(data).where(eq9(tours.id, id));
}
async function deleteTour(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tours).where(eq9(tours.id, id));
}
async function getAllToursPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(tours)
    .orderBy(tours.sortOrder, desc9(tours.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db.select({ count: sql8`count(*)` }).from(tours);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

// server/db/packages.ts
import { eq as eq10, desc as desc10 } from "drizzle-orm";
async function createTourPackage(pkg) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tourPackages).values(pkg);
}
async function getPublishedTourPackages() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tourPackages)
    .where(eq10(tourPackages.isPublished, 1))
    .orderBy(desc10(tourPackages.createdAt));
}
async function getAllTourPackages() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tourPackages)
    .orderBy(desc10(tourPackages.createdAt));
}
async function getTourPackageBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(tourPackages)
    .where(eq10(tourPackages.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateTourPackage(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(tourPackages)
    .set(data)
    .where(eq10(tourPackages.id, id));
}
async function deleteTourPackage(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tourPackages).where(eq10(tourPackages.id, id));
}

// server/db/blog.ts
import { eq as eq11, sql as sql9 } from "drizzle-orm";
import { desc as desc11 } from "drizzle-orm";
async function createBlogPost(post) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(blogPosts).values(post);
}
async function getAllPublishedBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(blogPosts)
    .where(eq11(blogPosts.isPublished, 1))
    .orderBy(desc11(blogPosts.publishedAt), desc11(blogPosts.createdAt));
}
async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(blogPosts).orderBy(desc11(blogPosts.createdAt));
}
async function getBlogPostById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq11(blogPosts.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getBlogPostBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq11(blogPosts.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateBlogPost(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(blogPosts).set(data).where(eq11(blogPosts.id, id));
}
async function deleteBlogPost(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(blogPosts).where(eq11(blogPosts.id, id));
}
async function getAllBlogPostsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(blogPosts)
    .orderBy(desc11(blogPosts.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql9`count(*)` })
    .from(blogPosts);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}

// server/db/subscribers.ts
import { eq as eq12 } from "drizzle-orm";
import { desc as desc12 } from "drizzle-orm";
async function createSubscriber(sub) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(subscribers).values(sub);
}
async function getSubscriberByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(subscribers)
    .where(eq12(subscribers.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllActiveSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(subscribers)
    .where(eq12(subscribers.isActive, 1))
    .orderBy(desc12(subscribers.subscribedAt));
}
async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(subscribers)
    .orderBy(desc12(subscribers.subscribedAt));
}
async function deactivateSubscriber(email) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(subscribers)
    .set({ isActive: 0 })
    .where(eq12(subscribers.email, email));
}

// server/db/chat.ts
import { eq as eq13, and as and5, sql as sql10 } from "drizzle-orm";
import { desc as desc13 } from "drizzle-orm";

// server/db/customers.ts
import { eq as eq14 } from "drizzle-orm";
import { desc as desc14, sql as sql11 } from "drizzle-orm";
async function createCustomer(customer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return result;
}
async function getAllCustomersPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(customers)
    .orderBy(desc14(customers.updatedAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql11`count(*)` })
    .from(customers);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function getCustomerById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(customers)
    .where(eq14(customers.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getCustomerByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(customers)
    .where(eq14(customers.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getCustomerByPhone(phone) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(customers)
    .where(eq14(customers.phone, phone))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateCustomer(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(customers).set(data).where(eq14(customers.id, id));
}
async function deleteCustomer(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(customerActivities)
    .where(eq14(customerActivities.customerId, id));
  return await db.delete(customers).where(eq14(customers.id, id));
}
async function createCustomerActivity(activity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(customerActivities).values(activity);
}
async function getActivitiesByCustomerId(customerId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customerActivities)
    .where(eq14(customerActivities.customerId, customerId))
    .orderBy(desc14(customerActivities.createdAt));
}
async function completeActivity(activityId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(customerActivities)
    .set({ isCompleted: 1 })
    .where(eq14(customerActivities.id, activityId));
}
async function getOverdueTasks() {
  const db = await getDb();
  if (!db) return [];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(customerActivities)
    .where(
      sql11`${customerActivities.dueDate} IS NOT NULL AND ${customerActivities.dueDate} <= ${tomorrow} AND ${customerActivities.isCompleted} = 0`
    );
}
async function getCustomerPipelineStats() {
  const db = await getDb();
  if (!db) return { prospect: 0, active: 0, completed: 0, vip: 0, inactive: 0 };
  const all = await db.select().from(customers);
  return {
    prospect: all.filter(c => c.stage === "prospect").length,
    active: all.filter(c => c.stage === "active").length,
    completed: all.filter(c => c.stage === "completed").length,
    vip: all.filter(c => c.stage === "vip").length,
    inactive: all.filter(c => c.stage === "inactive").length,
  };
}
async function getCustomerTimeline(email, phone) {
  const db = await getDb();
  if (!db) return [];
  const timeline = [];
  const seenIds = /* @__PURE__ */ new Set();
  if (email) {
    const matchedLeads = await db
      .select()
      .from(leads)
      .where(eq14(leads.email, email));
    for (const lead of matchedLeads) {
      const key = `lead-${lead.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        timeline.push({
          date: lead.createdAt,
          type: "lead",
          title: `Lead created (${lead.source})`,
          detail: lead.message ?? "",
          source: "leads",
        });
      }
    }
  }
  if (phone) {
    const phoneLeads = await db
      .select()
      .from(leads)
      .where(eq14(leads.phone, phone));
    for (const lead of phoneLeads) {
      const key = `lead-${lead.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        timeline.push({
          date: lead.createdAt,
          type: "lead",
          title: `Lead created (${lead.source})`,
          detail: lead.message ?? "",
          source: "leads",
        });
      }
    }
  }
  if (email) {
    const matchedBookings = await db
      .select()
      .from(bookings)
      .where(eq14(bookings.contactEmail, email));
    for (const booking of matchedBookings) {
      const key = `booking-${booking.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        timeline.push({
          date: booking.createdAt,
          type: "booking",
          title: `Booking #${booking.id} \u2014 ${booking.status}`,
          detail: `${booking.numberOfAdults} adults, ${booking.arrivalDate.toLocaleDateString()} - ${booking.departureDate.toLocaleDateString()}`,
          source: "bookings",
        });
      }
    }
  }
  if (phone) {
    const phoneBookings = await db
      .select()
      .from(bookings)
      .where(eq14(bookings.contactPhone, phone));
    for (const booking of phoneBookings) {
      const key = `booking-${booking.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        timeline.push({
          date: booking.createdAt,
          type: "booking",
          title: `Booking #${booking.id} \u2014 ${booking.status}`,
          detail: `${booking.numberOfAdults} adults, ${booking.arrivalDate.toLocaleDateString()} - ${booking.departureDate.toLocaleDateString()}`,
          source: "bookings",
        });
      }
    }
  }
  if (email) {
    const matchedReviews = await db
      .select()
      .from(reviews)
      .where(eq14(reviews.email, email));
    for (const review of matchedReviews) {
      timeline.push({
        date: review.createdAt,
        type: "review",
        title: `Review \u2014 ${review.rating}/5 stars`,
        detail: review.text.substring(0, 100),
        source: "reviews",
      });
    }
  }
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
  return timeline;
}
async function findOrCreateCustomer(data) {
  const db = await getDb();
  if (!db) return null;
  if (data.email) {
    const existing = await getCustomerByEmail(data.email);
    if (existing) return existing.id;
  }
  if (data.phone) {
    const existing = await getCustomerByPhone(data.phone);
    if (existing) return existing.id;
  }
  try {
    const result = await db.insert(customers).values({
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      source: data.source ?? "website",
      stage: "prospect",
    });
    const insertId = result[0]?.insertId;
    return insertId ?? null;
  } catch {
    if (data.email) {
      const existing = await getCustomerByEmail(data.email);
      if (existing) return existing.id;
    }
    if (data.phone) {
      const existing = await getCustomerByPhone(data.phone);
      if (existing) return existing.id;
    }
    return null;
  }
}

// server/db/audit.ts
import { eq as eq15, and as and6 } from "drizzle-orm";
async function logAdminAction(log) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditLogs).values(log);
  } catch (err) {
    console.error("[Audit] Failed to log action:", err);
  }
}

// server/db/settings.ts
import { eq as eq16 } from "drizzle-orm";
async function getSetting(key) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(settings).where(eq16(settings.key, key));
  return row?.value ?? null;
}
async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(settings);
}
async function upsertSetting(key, value) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSetting(key);
  if (existing !== null) {
    await db.update(settings).set({ value }).where(eq16(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

// server/db/stats.ts
import {
  eq as eq17,
  and as and7,
  sql as sql12,
  desc as desc15,
  gte,
} from "drizzle-orm";
import { count } from "drizzle-orm";
async function getPublicStats() {
  const db = await getDb();
  if (!db) return { totalBookings: 0, totalReviews: 0, totalTours: 0 };
  const [bookingCount] = await db
    .select({ value: count() })
    .from(bookings)
    .where(sql12`${bookings.status} IN ('confirmed', 'completed')`);
  const [reviewCount] = await db
    .select({ value: count() })
    .from(reviews)
    .where(and7(eq17(reviews.isApproved, 1), gte(reviews.rating, 4)));
  const [tourCount] = await db
    .select({ value: count() })
    .from(tours)
    .where(eq17(tours.isActive, 1));
  return {
    totalBookings: bookingCount?.value ?? 0,
    totalReviews: reviewCount?.value ?? 0,
    totalTours: tourCount?.value ?? 0,
  };
}
async function getRecentBookings(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      contactName: bookings.contactName,
      tourName:
        sql12`COALESCE(${bookings.suggestedDestinations}, 'Off-Road Adventure')`.as(
          "tourName"
        ),
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(sql12`${bookings.status} IN ('confirmed', 'completed')`)
    .orderBy(desc15(bookings.createdAt))
    .limit(limit);
  return rows.map(r => ({
    firstName: r.contactName.split(" ")[0],
    tourName: r.tourName,
    createdAt: r.createdAt,
  }));
}

// server/db/bookingDrafts.ts
import { eq as eq18 } from "drizzle-orm";
import { desc as desc16 } from "drizzle-orm";
async function createBookingDraft(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(bookingDrafts).values(data);
  return result.insertId;
}
async function getBookingDraftByToken(token) {
  const db = await getDb();
  if (!db) return null;
  const [draft] = await db
    .select()
    .from(bookingDrafts)
    .where(eq18(bookingDrafts.resumeToken, token))
    .limit(1);
  return draft ?? null;
}
async function listActiveBookingDrafts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookingDrafts)
    .where(eq18(bookingDrafts.status, "active"))
    .orderBy(desc16(bookingDrafts.createdAt));
}
async function updateBookingDraftStatus(id, status, convertedToBookingId) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(bookingDrafts)
    .set({ status, ...(convertedToBookingId ? { convertedToBookingId } : {}) })
    .where(eq18(bookingDrafts.id, id));
}

// server/db/accounting.ts
import {
  eq as eq19,
  desc as desc17,
  and as and8,
  gte as gte2,
  lte,
  sql as sql13,
} from "drizzle-orm";
async function createInvoice(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(invoices).values(data);
}
async function getAllInvoicesPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(invoices)
    .orderBy(desc17(invoices.issuedAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql13`count(*)` })
    .from(invoices);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function getInvoiceById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(invoices)
    .where(eq19(invoices.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateInvoiceStatus(id, status, paymentDate, paymentMethod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status };
  if (paymentDate) updateData.paymentDate = paymentDate;
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  return await db.update(invoices).set(updateData).where(eq19(invoices.id, id));
}
async function getNextInvoiceSequence(prefix, yearMonth) {
  const db = await getDb();
  if (!db) return 1;
  const pattern = `${prefix}-${yearMonth}-%`;
  const result = await db
    .select({ count: sql13`count(*)` })
    .from(invoices)
    .where(sql13`${invoices.invoiceNumber} LIKE ${pattern}`);
  return Number(result[0]?.count ?? 0) + 1;
}
async function createAccountingEntry(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(accountingEntries).values(data);
}
async function getAccountingEntriesPaginated(page = 1, pageSize = 20, filters) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const conditions = [];
  if (filters?.accountCode) {
    conditions.push(eq19(accountingEntries.accountCode, filters.accountCode));
  }
  if (filters?.startDate) {
    conditions.push(gte2(accountingEntries.date, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    conditions.push(lte(accountingEntries.date, new Date(filters.endDate)));
  }
  const whereClause = conditions.length > 0 ? and8(...conditions) : void 0;
  const itemsQuery = db
    .select()
    .from(accountingEntries)
    .orderBy(desc17(accountingEntries.date))
    .limit(pageSize)
    .offset(offset);
  const countQuery = db
    .select({ count: sql13`count(*)` })
    .from(accountingEntries);
  const items = whereClause
    ? await itemsQuery.where(whereClause)
    : await itemsQuery;
  const countResult = whereClause
    ? await countQuery.where(whereClause)
    : await countQuery;
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function getTrialBalance() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      accountCode: accountingEntries.accountCode,
      totalDebit: sql13`SUM(${accountingEntries.debit})`,
      totalCredit: sql13`SUM(${accountingEntries.credit})`,
    })
    .from(accountingEntries)
    .groupBy(accountingEntries.accountCode);
  return result;
}
async function createTaxFiling(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(taxFilings).values(data);
}
async function getAllTaxFilingsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(taxFilings)
    .orderBy(desc17(taxFilings.dueDate))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql13`count(*)` })
    .from(taxFilings);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function updateTaxFilingStatus(id, status, filedAt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status };
  if (filedAt) updateData.filedAt = filedAt;
  return await db
    .update(taxFilings)
    .set(updateData)
    .where(eq19(taxFilings.id, id));
}
async function getUpcomingFilings() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(taxFilings)
    .where(
      and8(
        eq19(taxFilings.status, "pending"),
        gte2(taxFilings.dueDate, /* @__PURE__ */ new Date())
      )
    )
    .orderBy(taxFilings.dueDate);
}

// server/db/inventory.ts
import { eq as eq20, desc as desc18, sql as sql14 } from "drizzle-orm";
async function createInventoryItem(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(inventory).values(data);
}
async function getAllInventoryPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(inventory)
    .orderBy(desc18(inventory.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql14`count(*)` })
    .from(inventory);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function getInventoryById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(inventory)
    .where(eq20(inventory.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateInventoryItem(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(inventory).set(data).where(eq20(inventory.id, id));
}
async function deleteInventoryItem(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(inventory).where(eq20(inventory.id, id));
}
async function getInventoryNeedingMaintenance(withinDays = 7) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(inventory)
    .where(
      sql14`${inventory.nextMaintenanceDate} IS NOT NULL AND ${inventory.nextMaintenanceDate} <= ${cutoff} AND ${inventory.condition} != 'retired'`
    );
}
async function getInventorySummary() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      category: inventory.category,
      count: sql14`COUNT(*)`,
      totalCurrentValue: sql14`SUM(${inventory.currentValue})`,
      totalPurchaseCost: sql14`SUM(${inventory.purchaseCost})`,
    })
    .from(inventory)
    .groupBy(inventory.category);
  return result;
}

// server/db/pagination.ts
import { sql as sql15 } from "drizzle-orm";

// server/routes/authRoutes.ts
import { eq as eq21, and as and9, gt } from "drizzle-orm";
var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1e3;
var registerInput = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255).optional(),
});
var loginInput = z.object({
  email: z.string().email(),
  password: z.string(),
});
var forgotPasswordInput = z.object({
  email: z.string().email(),
});
var resetPasswordInput = z.object({
  token: z.string().length(64),
  newPassword: z.string().min(8).max(128),
});
function registerAuthRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const body = registerInput.parse(req.body);
      const existing = await getUserByEmail(body.email);
      if (existing) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }
      const passwordHash = await hashPassword(body.password);
      const userId = await createUser({
        email: body.email,
        passwordHash,
        name: body.name,
      });
      const token = await createSession(userId, body.email, "user");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: THIRTY_DAYS_MS,
      });
      res.json({
        token,
        user: {
          id: userId,
          email: body.email,
          name: body.name ?? null,
          role: "user",
        },
      });
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid input", details: error.errors });
        return;
      }
      console.error("[Auth] Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const body = loginInput.parse(req.body);
      const user = await getUserByEmail(body.email);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      const valid = await verifyPassword(body.password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      await updateLastSignedIn(user.id);
      const token = await createSession(user.id, user.email, user.role);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: THIRTY_DAYS_MS,
      });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid input" });
        return;
      }
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", async (_req, res) => {
    const cookieOptions = getSessionCookieOptions(_req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const body = forgotPasswordInput.parse(req.body);
      const user = await getUserByEmail(body.email);
      if (user) {
        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
        const dbConn = await getDb();
        if (dbConn) {
          await dbConn.insert(passwordResetTokens).values({
            userId: user.id,
            token,
            expiresAt,
          });
        }
        try {
          const { Resend: Resend6 } = await import("resend");
          const apiKey = process.env.RESEND_API_KEY;
          if (apiKey) {
            const resend = new Resend6(apiKey);
            await resend.emails.send({
              from: "support@wiro4x4indochina.com",
              to: body.email,
              subject: "Reset your WIRO 4x4 password",
              html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                <a href="https://www.wiro4x4indochina.com/reset-password?token=${token}">
                  Reset Password
                </a>
                <p>If you didn't request this, ignore this email.</p>
              `,
            });
          } else {
            console.warn(
              "[Auth] RESEND_API_KEY not set \u2014 reset email not sent"
            );
          }
        } catch (emailErr) {
          console.error("[Auth] Failed to send reset email:", emailErr);
        }
      }
      res.json({ success: true });
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid input" });
        return;
      }
      res.json({ success: true });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const body = resetPasswordInput.parse(req.body);
      const dbConn = await getDb();
      if (!dbConn) {
        res
          .status(500)
          .json({ error: "An error occurred. Please try again later." });
        return;
      }
      const tokenRows = await dbConn
        .select()
        .from(passwordResetTokens)
        .where(
          and9(
            eq21(passwordResetTokens.token, body.token),
            gt(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
          )
        )
        .limit(1);
      if (tokenRows.length === 0) {
        res.status(400).json({
          error: "Reset failed. Please request a new password reset link.",
        });
        return;
      }
      const resetRecord = tokenRows[0];
      const newHash = await hashPassword(body.newPassword);
      await updateUserPassword(resetRecord.userId, newHash);
      await dbConn
        .delete(passwordResetTokens)
        .where(eq21(passwordResetTokens.id, resetRecord.id));
      res.json({ success: true });
    } catch (error) {
      if (error.name === "ZodError") {
        res
          .status(400)
          .json({ error: "Password must be at least 8 characters" });
        return;
      }
      console.error("[Auth] Reset password error:", error);
      res
        .status(500)
        .json({ error: "An error occurred. Please try again later." });
    }
  });
}

// server/routes/rss.ts
import compression from "compression";
function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function generateRssFeed(posts, siteUrl) {
  const items = posts
    .map(
      post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${escapeXml(post.slug)}</link>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ""}</pubDate>
      <guid>${siteUrl}/blog/${escapeXml(post.slug)}</guid>
      <author>${escapeXml(post.author || "WIRO 4x4")}</author>
    </item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WIRO 4x4 \u2014 Travel Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Travel tips, kosher dining guides, and adventure stories from Northern Thailand</description>
    <language>en</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
function registerRssRoute(app2) {
  app2.use(compression());
  app2.get("/api/rss", async (_req, res) => {
    try {
      const posts = await getAllPublishedBlogPosts();
      const siteUrl =
        process.env.SITE_URL || "https://www.wiro4x4indochina.com";
      const xml = generateRssFeed(posts, siteUrl);
      res.set("Content-Type", "application/rss+xml; charset=utf-8");
      res.send(xml);
    } catch (err) {
      console.error("[RSS] Failed to generate feed:", err);
      res.status(500).send("Failed to generate RSS feed");
    }
  });
}

// server/routes/sitemap.ts
function escapeXml2(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
var STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/tours", priority: "0.9", changefreq: "weekly" },
  { path: "/packages", priority: "0.9", changefreq: "weekly" },
  {
    path: "/packages/northern-thailand-3d2n",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    path: "/packages/grand-tour-laos-14d",
    priority: "0.9",
    changefreq: "monthly",
  },
  { path: "/pricing", priority: "0.9", changefreq: "monthly" },
  { path: "/estimate", priority: "0.9", changefreq: "monthly" },
  { path: "/book", priority: "0.9", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/gallery", priority: "0.8", changefreq: "weekly" },
  { path: "/reviews", priority: "0.8", changefreq: "weekly" },
  { path: "/kosher-tours", priority: "0.9", changefreq: "monthly" },
  { path: "/hebrew-guide", priority: "0.9", changefreq: "monthly" },
  { path: "/accessible-tours", priority: "0.9", changefreq: "monthly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
];
function generateSitemap(tours2, blogs, packages, siteUrl) {
  const today = /* @__PURE__ */ new Date().toISOString().split("T")[0];
  const staticUrls = STATIC_PAGES.map(
    p => `  <url>
    <loc>${escapeXml2(siteUrl)}${escapeXml2(p.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n");
  const tourUrls = tours2
    .map(
      t2 => `  <url>
    <loc>${escapeXml2(siteUrl)}/tours/${escapeXml2(t2.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>`
    )
    .join("\n");
  const packageUrls = packages
    .map(
      p => `  <url>
    <loc>${escapeXml2(siteUrl)}/packages/${escapeXml2(p.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");
  const blogUrls = blogs
    .map(
      b => `  <url>
    <loc>${escapeXml2(siteUrl)}/blog/${escapeXml2(b.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${tourUrls}
${packageUrls}
${blogUrls}
</urlset>`;
}
function registerSitemapRoute(app2) {
  app2.get("/sitemap.xml", async (_req, res) => {
    try {
      const [tours2, blogs, packages] = await Promise.all([
        getAllActiveTours(),
        getAllPublishedBlogPosts(),
        getPublishedTourPackages(),
      ]);
      const siteUrl =
        process.env.SITE_URL || "https://www.wiro4x4indochina.com";
      const xml = generateSitemap(
        tours2.map(t2 => ({ slug: t2.slug })),
        blogs.map(b => ({ slug: b.slug })),
        packages.map(p => ({ slug: p.slug })),
        siteUrl
      );
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Failed to generate:", err);
      res.status(500).send("Failed to generate sitemap");
    }
  });
}

// server/_core/systemRouter.ts
import { z as z2 } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var resendClient = null;
async function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[Notification] RESEND_API_KEY not configured \u2014 notifications disabled"
      );
      return null;
    }
    const { Resend: Resend6 } = await import("resend");
    resendClient = new Resend6(apiKey);
  }
  return resendClient;
}
async function notifyOwner(payload) {
  const { title, content } = payload;
  if (!title?.trim() || !content?.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title and content are required.",
    });
  }
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn("[Notification] OWNER_EMAIL not configured");
    return false;
  }
  const resend = await getResendClient();
  if (!resend) return false;
  try {
    await resend.emails.send({
      from: "notifications@wiro4x4indochina.com",
      to: ownerEmail,
      subject: title.trim(),
      html: `
        <h2>${title.trim()}</h2>
        <div>${content.trim().replace(/\n/g, "<br>")}</div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Sent from Wiro 4x4 Notification System
        </p>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Notification] Email failed:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson,
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);
var OWNER_ROLES = ["admin", "owner"];
var MANAGER_ROLES = ["admin", "owner", "manager"];
var AGENT_ROLES = ["admin", "owner", "manager", "agent"];
var ownerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !OWNER_ROLES.includes(ctx.user.role)) {
      throw new TRPCError2({
        code: "FORBIDDEN",
        message: "Owner access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);
var managerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !MANAGER_ROLES.includes(ctx.user.role)) {
      throw new TRPCError2({
        code: "FORBIDDEN",
        message: "Manager access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);
var agentProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !AGENT_ROLES.includes(ctx.user.role)) {
      throw new TRPCError2({
        code: "FORBIDDEN",
        message: "Agent access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure
    .input(
      z2.object({
        timestamp: z2.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),
  notifyOwner: adminProcedure
    .input(
      z2.object({
        title: z2.string().min(1, "title is required"),
        content: z2.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      };
    }),
});

// server/routes/_helpers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/rateLimit.ts
var memoryStore = /* @__PURE__ */ new Map();
var cleanupTimer = setInterval(
  () => {
    const now = Date.now();
    memoryStore.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        memoryStore.delete(key);
      }
    });
  },
  5 * 60 * 1e3
);
if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
  cleanupTimer.unref();
}
var redisClient = null;
var redisAvailable = false;
var redisInitAttempted = false;
async function getRedis() {
  if (redisInitAttempted) return redisClient;
  redisInitAttempted = true;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const { default: Redis } = await import("ioredis");
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3e3,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    await redisClient.connect();
    redisAvailable = true;
    console.log("[RateLimit] Redis connected successfully");
    return redisClient;
  } catch (err) {
    console.warn(
      "[RateLimit] Redis unavailable, using in-memory fallback:",
      err
    );
    redisClient = null;
    redisAvailable = false;
    return null;
  }
}
getRedis().catch(() => {});
function checkRateLimitMemory(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}
async function checkRateLimitRedis(redis, key, maxRequests, windowMs) {
  const now = Date.now();
  const windowId = Math.floor(now / windowMs);
  const redisKey = `rl:${key}:${windowId}`;
  const ttlSeconds = Math.ceil(windowMs / 1e3);
  try {
    const count4 = await redis.incr(redisKey);
    if (count4 === 1) {
      await redis.expire(redisKey, ttlSeconds);
    }
    const resetAt = (windowId + 1) * windowMs;
    const allowed = count4 <= maxRequests;
    const remaining = Math.max(0, maxRequests - count4);
    return { allowed, remaining, resetAt };
  } catch (err) {
    console.warn("[RateLimit] Redis error, falling back to memory:", err);
    redisAvailable = false;
    return checkRateLimitMemory(key, maxRequests, windowMs);
  }
}
function checkRateLimit(key, maxRequests = 10, windowMs = 6e4) {
  if (!redisAvailable || !redisClient) {
    return checkRateLimitMemory(key, maxRequests, windowMs);
  }
  const memResult = checkRateLimitMemory(key, maxRequests, windowMs);
  checkRateLimitRedis(redisClient, key, maxRequests, windowMs).catch(() => {});
  return memResult;
}

// server/securityHeaders.ts
var SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "0",
  "Permissions-Policy":
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
  // Note: Strict-Transport-Security should be set at reverse proxy level
  // (nginx, Cloudflare, etc.) rather than application level.
};
function setSecurityHeaders(res) {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
}

// server/sentry.ts
var _sentryInitialized = false;
var _sentryModule = null;
function initSentry() {
  if (_sentryInitialized) return _sentryModule;
  _sentryInitialized = true;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn(
      "[Sentry] SENTRY_DSN not set \u2014 error monitoring disabled"
    );
    return null;
  }
  try {
    const Sentry = __require("@sentry/node");
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 0.1,
    });
    _sentryModule = Sentry;
    console.log("[Sentry] Initialized successfully");
    return Sentry;
  } catch (err) {
    console.warn("[Sentry] Failed to initialize:", err);
    _sentryModule = null;
    return null;
  }
}
function captureException(error) {
  const Sentry = initSentry();
  if (Sentry) {
    Sentry.captureException(error);
  }
}

// server/routes/_helpers.ts
var securePublicProcedure = publicProcedure.use(async ({ ctx, next }) => {
  setSecurityHeaders(ctx.res);
  return next();
});
var secureProtectedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  setSecurityHeaders(ctx.res);
  return next();
});
var secureOwnerProcedure = ownerProcedure.use(async ({ ctx, next }) => {
  setSecurityHeaders(ctx.res);
  return next();
});
var secureManagerProcedure = managerProcedure.use(async ({ ctx, next }) => {
  setSecurityHeaders(ctx.res);
  return next();
});
var secureAgentProcedure = agentProcedure.use(async ({ ctx, next }) => {
  setSecurityHeaders(ctx.res);
  return next();
});
function checkAdminRateLimit(ctx) {
  const userId = ctx.user?.id ?? "unknown";
  const { allowed } = checkRateLimit(`admin:${userId}`, 100, 5 * 6e4);
  if (!allowed) {
    throw new TRPCError3({
      code: "TOO_MANY_REQUESTS",
      message: "Too many admin operations. Please try again later.",
    });
  }
}

// server/routes/auth.ts
var authRouter = router({
  me: securePublicProcedure.query(opts => opts.ctx.user),
  logout: securePublicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
});

// server/routes/booking.ts
import { z as z4 } from "zod";

// server/emailService.ts
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatServices(data) {
  const services = [];
  if (data.includesHotels) services.push("Hotels");
  if (data.includesGuide) services.push("Hebrew-speaking Guide");
  if (data.includesTrip) services.push("4x4 Trip");
  if (data.includesFood) services.push("Kosher Meals");
  if (data.needsShabbatHotel) services.push("Shabbat Hotel");
  return services.length > 0 ? services.join(", ") : "None selected";
}
async function sendNewBookingNotification(data) {
  const title = `\u{1F389} New Booking: ${data.contactName}`;
  const content = `
**New Tour Booking Received!**

**Customer Details:**
- Name: ${data.contactName}
- Email: ${data.contactEmail}
- Phone: ${data.contactPhone}

**Trip Details:**
- Arrival: ${formatDate(data.arrivalDate)}
- Departure: ${formatDate(data.departureDate)}
- Adults: ${data.numberOfAdults}
- Children: ${data.numberOfChildren || 0}

**Services Requested:**
${formatServices(data)}

**Logistics:**
- Pickup: ${data.pickupPoint}
- Dropoff: ${data.dropoffPoint}
${data.suggestedDestinations ? `- Destinations: ${data.suggestedDestinations}` : ""}

${
  data.specialRequests
    ? `**Special Requests:**
${data.specialRequests}`
    : ""
}

---
Please respond to this inquiry within 24 hours.
  `.trim();
  try {
    const result = await notifyOwner({ title, content });
    if (result) {
      console.log(
        `[Email] New booking notification sent for ${data.contactName}`
      );
    }
    return result;
  } catch (error) {
    console.error("[Email] Failed to send new booking notification:", error);
    return false;
  }
}

// server/resendEmailService.ts
import { Resend } from "resend";
var _resend = null;
function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
var NOTIFICATION_RECIPIENTS = [
  "wiro.adventures@gmail.com",
  "pasuthunjunkong@gmail.com",
];
var SENDER_EMAIL = "WIRO 4x4 Bookings <bookings@wiro4x4indochina.com>";
function formatDate2(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatServices2(data) {
  const services = [];
  if (data.includesHotels) services.push("\u{1F3E8} Hotels");
  if (data.includesGuide)
    services.push("\u{1F5E3}\uFE0F Hebrew-speaking Guide");
  if (data.includesTrip) services.push("\u{1F699} 4x4 Trip");
  if (data.includesFood) services.push("\u{1F37D}\uFE0F Kosher Meals");
  if (data.needsShabbatHotel) services.push("\u2721\uFE0F Shabbat Hotel");
  return services.length > 0 ? services.join("<br>") : "None selected";
}
async function sendNewBookingEmail(data) {
  const subject = `\u{1F389} New Booking Request: ${data.contactName}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">\u{1F699} WIRO 4x4</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">New Booking Request Received!</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <h2 style="color: #1a4d2e; margin-top: 0;">\u{1F4CB} Customer Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Name:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.contactName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.contactEmail}" style="color: #1a4d2e;">${data.contactEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Phone:</td>
            <td style="padding: 8px 0;"><a href="tel:${data.contactPhone}" style="color: #1a4d2e;">${data.contactPhone}</a></td>
          </tr>
        </table>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <h2 style="color: #1a4d2e;">\u{1F4C5} Trip Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Arrival:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formatDate2(data.arrivalDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Departure:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formatDate2(data.departureDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Group Size:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.numberOfAdults} Adults${data.numberOfChildren ? `, ${data.numberOfChildren} Children` : ""}</td>
          </tr>
        </table>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <h2 style="color: #1a4d2e;">\u2728 Services Requested</h2>
        <p style="line-height: 1.8;">${formatServices2(data)}</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <h2 style="color: #1a4d2e;">\u{1F4CD} Logistics</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Pickup:</td>
            <td style="padding: 8px 0;">${data.pickupPoint}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Dropoff:</td>
            <td style="padding: 8px 0;">${data.dropoffPoint}</td>
          </tr>
          ${
            data.suggestedDestinations
              ? `
          <tr>
            <td style="padding: 8px 0; color: #666;">Destinations:</td>
            <td style="padding: 8px 0;">${data.suggestedDestinations}</td>
          </tr>
          `
              : ""
          }
        </table>
        
        ${
          data.specialRequests
            ? `
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <h2 style="color: #1a4d2e;">\u{1F4AC} Special Requests</h2>
        <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #d4af37;">${data.specialRequests}</p>
        `
            : ""
        }
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          \u{1F4A1} Sent from WIRO 4x4 Booking System
        </p>
      </div>
      
      <div style="background: #1a4d2e; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">\u23F0 Please respond to this inquiry within 24 hours</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">WIRO 4x4 - Kosher Off-Road Adventures in Chiang Mai</p>
      </div>
    </div>
  `;
  try {
    const resend = getResend();
    if (!resend) {
      console.warn("[Resend] API key not configured, skipping email");
      return false;
    }
    const { data: result, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: NOTIFICATION_RECIPIENTS,
      subject,
      html: htmlContent,
    });
    if (error) {
      console.error("[Resend] Failed to send new booking email:", error);
      captureException(error);
      return false;
    }
    console.log(
      `[Resend] New booking email sent successfully. ID: ${result?.id}`
    );
    return true;
  } catch (error) {
    console.error("[Resend] Error sending new booking email:", error);
    captureException(error);
    return false;
  }
}

// server/customerEmailService.ts
import { Resend as Resend2 } from "resend";
import { createEvents } from "ics";
var _resend2 = null;
function getResend2() {
  if (!_resend2 && process.env.RESEND_API_KEY) {
    _resend2 = new Resend2(process.env.RESEND_API_KEY);
  }
  return _resend2;
}
var SENDER_EMAIL2 = COMPANY_SENDER_EMAIL;
function generateCalendarEvent(booking) {
  try {
    const tourDate = new Date(booking.tourDate);
    const pickupTime = booking.pickupTime || "08:00";
    const [hours, minutes] = pickupTime.split(":").map(Number);
    const startDate = new Date(tourDate);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 8);
    const event = {
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ],
      title: `${booking.tourType} - WIRO 4x4`,
      description:
        `Your ${booking.tourType} adventure with WIRO 4x4!

Group Size: ${booking.groupSize} people
Pickup Location: ${booking.pickupLocation || "To be confirmed"}
Pickup Time: ${pickupTime}

Contact Information:
Phone: ${COMPANY_PHONE}
WhatsApp: ${COMPANY_WHATSAPP}
Website: ${COMPANY_WEBSITE}

Booking ID: ${booking.bookingId}

` +
        (booking.specialRequests
          ? `Special Requests: ${booking.specialRequests}

`
          : "") +
        `What to Bring:
- Comfortable clothing and closed-toe shoes
- Sunscreen and hat
- Camera
- Water bottle
- Sense of adventure!

We look forward to your adventure with us!`,
      location: booking.pickupLocation || "Chiang Mai, Thailand",
      url: COMPANY_WEBSITE,
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: { name: COMPANY_NAME, email: SENDER_EMAIL2 },
      attendees: [
        {
          name: booking.customerName,
          email: booking.customerEmail,
          rsvp: true,
        },
      ],
    };
    const { error, value } = createEvents([event]);
    if (error) {
      console.error("[Calendar] Error generating ICS file:", error);
      return null;
    }
    return value || null;
  } catch (error) {
    console.error("[Calendar] Error generating calendar event:", error);
    return null;
  }
}
async function sendCustomerConfirmation(booking) {
  try {
    const icsContent = generateCalendarEvent(booking);
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
    .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623; }
    .detail-row { margin: 10px 0; }
    .detail-label { font-weight: bold; color: #2d5016; }
    .calendar-button { display: inline-block; background: #f5a623; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
    .calendar-button:hover { background: #e6951a; }
    .info-box { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a7c2c; }
    .contact-info { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F699} Booking Confirmed!</h1>
      <p>Your adventure with WIRO 4x4 is confirmed</p>
    </div>
    
    <div class="content">
      <p>Dear ${booking.customerName},</p>
      
      <p>Thank you for booking with <strong>WIRO 4x4 - Kosher Off-Road Adventures</strong>! We're excited to take you on an unforgettable journey through Northern Thailand.</p>
      
      <div class="booking-details">
        <h2 style="margin-top: 0; color: #2d5016;">\u{1F4CB} Your Booking Details</h2>
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span> ${booking.bookingId}
        </div>
        <div class="detail-row">
          <span class="detail-label">Tour Type:</span> ${booking.tourType}
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span> ${new Date(booking.tourDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
        <div class="detail-row">
          <span class="detail-label">Group Size:</span> ${booking.groupSize} people
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Location:</span> ${booking.pickupLocation || "To be confirmed"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Time:</span> ${booking.pickupTime || "08:00 AM"}
        </div>
        ${
          booking.specialRequests
            ? `
        <div class="detail-row">
          <span class="detail-label">Special Requests:</span> ${booking.specialRequests}
        </div>
        `
            : ""
        }
      </div>
      
      ${
        icsContent
          ? `
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; margin-bottom: 15px;"><strong>\u{1F4C5} Add this tour to your calendar:</strong></p>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Click the button below or use the attached calendar file</p>
        <a href="data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}" download="wiro-4x4-tour.ics" class="calendar-button">
          \u{1F4C5} Add to Calendar
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">Works with Google Calendar, Apple Calendar, Outlook, and more</p>
      </div>
      `
          : ""
      }
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #2d5016;">\u{1F392} What to Bring</h3>
        <ul>
          <li>Comfortable clothing and closed-toe shoes</li>
          <li>Sunscreen and hat</li>
          <li>Camera for amazing photos</li>
          <li>Water bottle (we'll provide refills)</li>
          <li>Sense of adventure!</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <h3 style="margin-top: 0; color: #f5a623;">\u{1F4DE} Contact Information</h3>
        <p><strong>Phone:</strong> <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a></p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/${COMPANY_WHATSAPP}">${COMPANY_WHATSAPP}</a></p>
        <p><strong>Website:</strong> <a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a></p>
        <p style="margin-top: 15px; font-size: 14px;">Have questions? Feel free to reach out anytime!</p>
      </div>
      
      <p>We'll send you a reminder 48 hours before your tour with final details.</p>
      
      <p>Looking forward to your adventure!</p>
      
      <p style="margin-top: 30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>WIRO 4x4 - Kosher Off-Road Adventures</strong></p>
      <p>Chiang Mai, Thailand</p>
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL2}</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated confirmation email. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;
    const emailData = {
      from: `${COMPANY_NAME} <${SENDER_EMAIL2}>`,
      to: [booking.customerEmail],
      subject: `\u2705 Booking Confirmed - ${booking.tourType} on ${new Date(booking.tourDate).toLocaleDateString()}`,
      html: emailHtml,
    };
    if (icsContent) {
      emailData.attachments = [
        {
          filename: "wiro-4x4-tour.ics",
          content: Buffer.from(icsContent).toString("base64"),
        },
      ];
    }
    const resend = getResend2();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping email"
      );
      return false;
    }
    const { data, error } = await resend.emails.send(emailData);
    if (error) {
      console.error("[Customer Email] Error sending confirmation:", error);
      captureException(error);
      return false;
    }
    console.log(
      `[Customer Email] Confirmation sent to ${booking.customerEmail}. ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error("[Customer Email] Error in sendCustomerConfirmation:", error);
    captureException(error);
    return false;
  }
}
async function sendBookingReminder(booking) {
  try {
    const resend = getResend2();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping reminder"
      );
      return false;
    }
    const tourDate = new Date(booking.tourDate);
    const formattedDate = tourDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
    .info-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Tour is Tomorrow!</h1>
      <p>Get ready for an amazing adventure</p>
    </div>
    <div class="content">
      <p>Dear ${booking.customerName},</p>
      <p>This is a friendly reminder that your <strong>${booking.tourType}</strong> with WIRO 4x4 is <strong>tomorrow, ${formattedDate}</strong>!</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">Quick Details</h3>
        <p><strong>Pickup Time:</strong> ${booking.pickupTime || "08:00 AM"}</p>
        <p><strong>Pickup Location:</strong> ${booking.pickupLocation || "To be confirmed"}</p>
        <p><strong>Group Size:</strong> ${booking.groupSize} people</p>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      </div>
      <h3>Don't Forget to Bring:</h3>
      <ul>
        <li>Comfortable clothing and closed-toe shoes</li>
        <li>Sunscreen and hat</li>
        <li>Camera</li>
        <li>Water bottle</li>
      </ul>
      <p>Questions? Contact us:</p>
      <p>Phone: <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a> | WhatsApp: <a href="https://wa.me/${COMPANY_WHATSAPP}">${COMPANY_WHATSAPP}</a></p>
      <p>See you tomorrow!</p>
      <p><strong>The WIRO 4x4 Team</strong></p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL2}</p>
    </div>
  </div>
</body>
</html>`;
    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL2}>`,
      to: [booking.customerEmail],
      subject: `Reminder: Your ${booking.tourType} is tomorrow! - WIRO 4x4`,
      html: emailHtml,
    });
    if (error) {
      console.error("[Customer Email] Error sending reminder:", error);
      captureException(error);
      return false;
    }
    console.log(`[Customer Email] Reminder sent to ${booking.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Customer Email] Error in sendBookingReminder:", error);
    captureException(error);
    return false;
  }
}
async function sendPaymentConfirmationEmail({
  customerName,
  customerEmail,
  amount,
  type,
  bookingId,
}) {
  try {
    const typeLabels = {
      deposit: "Deposit",
      balance: "Balance",
      full: "Full Payment",
      refund: "Refund",
    };
    const typeLabel = typeLabels[type] || type;
    const formattedAmount = amount.toLocaleString("en-US");
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
    .payment-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a7c2c; }
    .detail-row { margin: 10px 0; }
    .detail-label { font-weight: bold; color: #2d5016; }
    .amount { font-size: 32px; font-weight: bold; color: #2d5016; text-align: center; margin: 20px 0; }
    .info-box { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a7c2c; }
    .contact-info { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmed</h1>
      <p>Thank you for your payment</p>
    </div>

    <div class="content">
      <p>Dear ${customerName},</p>

      <p>We have successfully received your payment. Here are the details:</p>

      <div class="payment-details">
        <div class="amount">${formattedAmount} THB</div>
        <div class="detail-row">
          <span class="detail-label">Payment Type:</span> ${typeLabel}
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking Reference:</span> #${bookingId}
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span> Completed
        </div>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #2d5016;">What Happens Next?</h3>
        <ul style="padding-left: 20px;">
          <li>Your booking is being processed by our team</li>
          <li>You will receive a confirmation with full tour details</li>
          <li>A reminder will be sent 48 hours before your tour</li>
        </ul>
      </div>

      <div class="contact-info">
        <h3 style="margin-top: 0; color: #f5a623;">Need Help?</h3>
        <p><strong>Phone:</strong> <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a></p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/${COMPANY_WHATSAPP}">${COMPANY_WHATSAPP}</a></p>
        <p><strong>Website:</strong> <a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a></p>
      </div>

      <p>Thank you for choosing WIRO 4x4!</p>

      <p style="margin-top: 30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>
    </div>

    <div class="footer">
      <p><strong>${COMPANY_NAME}</strong></p>
      <p>Chiang Mai, Thailand</p>
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL2}</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated payment confirmation. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;
    const resend = getResend2();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping payment confirmation"
      );
      return false;
    }
    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL2}>`,
      to: [customerEmail],
      subject: `Payment Confirmed - ${typeLabel} of ${formattedAmount} THB - Booking #${bookingId}`,
      html: emailHtml,
    });
    if (error) {
      console.error(
        "[Customer Email] Error sending payment confirmation:",
        error
      );
      captureException(error);
      return false;
    }
    console.log(
      `[Customer Email] Payment confirmation sent to ${customerEmail}. ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error(
      "[Customer Email] Error in sendPaymentConfirmationEmail:",
      error
    );
    captureException(error);
    return false;
  }
}
async function sendPostTourFeedback(booking) {
  try {
    const resend = getResend2();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping feedback request"
      );
      return false;
    }
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
    .cta-button { display: inline-block; background: #f5a623; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>How Was Your Adventure?</h1>
      <p>We'd love to hear from you!</p>
    </div>
    <div class="content">
      <p>Dear ${booking.customerName},</p>
      <p>Thank you for choosing <strong>WIRO 4x4</strong> for your ${booking.tourType} adventure! We hope you had an amazing time exploring Northern Thailand.</p>
      <p>Your feedback helps us improve and helps other travelers discover our tours. Would you take a moment to share your experience?</p>
      <div style="text-align: center;">
        <a href="${COMPANY_WEBSITE}/reviews" class="cta-button">Leave a Review</a>
      </div>
      <p>Thank you for being part of the WIRO 4x4 family. We hope to see you again!</p>
      <p><strong>The WIRO 4x4 Team</strong></p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL2}</p>
    </div>
  </div>
</body>
</html>`;
    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL2}>`,
      to: [booking.customerEmail],
      subject: `How was your ${booking.tourType}? Share your experience! - WIRO 4x4`,
      html: emailHtml,
    });
    if (error) {
      console.error("[Customer Email] Error sending feedback request:", error);
      captureException(error);
      return false;
    }
    console.log(
      `[Customer Email] Feedback request sent to ${booking.customerEmail}`
    );
    return true;
  } catch (error) {
    console.error("[Customer Email] Error in sendPostTourFeedback:", error);
    captureException(error);
    return false;
  }
}
async function sendBulkEmailToCustomer({ to, subject, message, customerName }) {
  try {
    const resend = getResend2();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping bulk email"
      );
      return false;
    }
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>WIRO 4x4</h1>
      <p>Kosher Off-Road Adventures</p>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      ${message
        .split("\n")
        .map(line => `<p>${line}</p>`)
        .join("")}
      <p style="margin-top: 30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL2}</p>
    </div>
  </div>
</body>
</html>`;
    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL2}>`,
      to: [to],
      subject,
      html: emailHtml,
    });
    if (error) {
      console.error("[Customer Email] Error sending bulk email:", error);
      captureException(error);
      return false;
    }
    console.log(`[Customer Email] Bulk email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[Customer Email] Error in sendBulkEmailToCustomer:", error);
    captureException(error);
    return false;
  }
}

// shared/schemas.ts
import { z as z3 } from "zod";
var noHtml = val => !/<[^>]*>/g.test(val);
var bookingInputSchema = z3.object({
  contactName: z3
    .string()
    .min(1, "Name is required")
    .max(200)
    .refine(noHtml, "HTML tags are not allowed"),
  contactEmail: z3
    .string()
    .email("Invalid email")
    .optional()
    .or(z3.literal("")),
  contactPhone: z3.string().min(1, "Phone is required"),
  contactWhatsApp: z3.string().optional(),
  agentName: z3.string().max(200).optional(),
  arrivalDate: z3.string().transform(s => new Date(s)),
  departureDate: z3.string().transform(s => new Date(s)),
  numberOfAdults: z3.number().min(1).default(1),
  hasChildren: z3.boolean().default(false),
  numberOfChildren: z3.number().optional(),
  childrenAges: z3.string().optional(),
  includesHotels: z3.boolean().default(false),
  hotelPreferences: z3.optional(
    z3.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  includesGuide: z3.boolean().default(false),
  includesTrip: z3.boolean().default(false),
  includesAttractions: z3.boolean().default(false),
  selectedAttractions: z3.string().optional(),
  includesFood: z3.boolean().default(false),
  foodPreferences: z3.optional(
    z3.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  needsShabbatHotel: z3.boolean().default(false),
  shabbatHotel: z3.string().optional(),
  pickupPoint: z3.string().min(1, "Pickup point is required"),
  customPickupLocation: z3.string().max(500).optional(),
  dropoffPoint: z3.string().min(1, "Dropoff point is required"),
  customDropoffLocation: z3.string().max(500).optional(),
  suggestedDestinations: z3.string().max(500).optional(),
  specialRequests: z3.optional(
    z3.string().max(1e3).refine(noHtml, "HTML tags are not allowed")
  ),
  dietaryRestrictions: z3.optional(
    z3.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  budget: z3.string().optional(),
  source: z3.string().default("website"),
  utmSource: z3.string().optional(),
  utmMedium: z3.string().optional(),
  utmCampaign: z3.string().optional(),
});
var agentInputSchema = z3.object({
  name: z3.string().min(1, "Name is required"),
  email: z3.string().email("Invalid email"),
  phone: z3.string().min(1, "Phone is required"),
  whatsapp: z3.string().optional(),
  specialties: z3.string().optional(),
  languages: z3.string().optional(),
  status: z3.enum(["active", "inactive", "on_leave"]).default("active"),
  notes: z3.string().max(500).optional(),
});
var leadInputSchema = z3.object({
  name: z3.string().min(1, "Name is required"),
  email: z3.string().email("Invalid email"),
  phone: z3.string().optional(),
  source: z3.string().default("website"),
  interestedTours: z3.string().optional(),
  message: z3.optional(
    z3.string().max(1e3).refine(noHtml, "HTML tags are not allowed")
  ),
});
var financialRecordInputSchema = z3.object({
  bookingId: z3.number(),
  type: z3.enum(["revenue", "cost", "refund"]),
  category: z3.string().min(1, "Category is required"),
  amount: z3.number(),
  currency: z3.string().default("THB"),
  description: z3.string().optional(),
  paymentMethod: z3.string().optional(),
  paymentDate: z3
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : void 0)),
  notes: z3.string().optional(),
});
var tourInputSchema = z3.object({
  name: z3.string().min(1, "Name is required"),
  nameHe: z3.string().min(1, "Hebrew name is required"),
  slug: z3.string().optional(),
  description: z3.string().min(1, "Description is required"),
  descriptionHe: z3.string().min(1, "Hebrew description is required"),
  duration: z3.string().min(1, "Duration is required"),
  difficulty: z3.enum(["easy", "moderate", "challenging"]).default("moderate"),
  price: z3.number().min(0, "Price must be positive"),
  groupMinSize: z3.number().min(1).default(1),
  groupMaxSize: z3.number().min(1).default(10),
  imageUrl: z3.string().min(1, "Image URL is required"),
  highlights: z3.string().optional(),
  highlightsHe: z3.string().optional(),
  includedItems: z3.string().optional(),
  itinerary: z3.string().optional(),
  isKosher: z3.boolean().default(true),
  isPrivate: z3.boolean().default(true),
  isShabbatOk: z3.boolean().default(true),
  isActive: z3.boolean().default(true),
  sortOrder: z3.number().default(0),
});
var reviewInputSchema = z3.object({
  name: z3.string().min(1, "Name is required"),
  email: z3.string().email("Invalid email"),
  rating: z3.number().min(1).max(5),
  text: z3
    .string()
    .min(1, "Review text is required")
    .max(2e3)
    .refine(noHtml, "HTML tags are not allowed"),
  tourType: z3.string().optional(),
});
var blogPostInputSchema = z3.object({
  title: z3.string().min(1),
  titleHe: z3.string().optional(),
  slug: z3.string().min(1),
  excerpt: z3.string().optional(),
  excerptHe: z3.string().optional(),
  content: z3.string().min(1),
  contentHe: z3.string().optional(),
  coverImage: z3.string().optional(),
  category: z3.string().optional(),
  tags: z3.string().optional(),
  isPublished: z3.boolean().optional(),
  author: z3.string().optional(),
});
var tourPackageInputSchema = z3.object({
  name: z3.string().min(1, "Name is required").max(255),
  nameHe: z3.string().min(1, "Hebrew name is required").max(255),
  slug: z3.string().optional(),
  description: z3.string().optional(),
  descriptionHe: z3.string().optional(),
  tourSlugs: z3
    .array(z3.string().min(1))
    .min(2, "At least 2 tours required")
    .max(5, "Maximum 5 tours"),
  discountPercent: z3.number().min(0).max(50).nullable().optional(),
  coverImage: z3.string().optional(),
  isPublished: z3.boolean().optional(),
});
var createCheckoutSchema = z3.object({
  bookingId: z3.number(),
  amount: z3.number().positive(),
  type: z3.enum(["deposit", "balance", "full"]),
});
var refundSchema = z3.object({
  paymentId: z3.number(),
  amount: z3.number().positive().optional(),
  reason: z3.string().optional(),
});
var verifySessionSchema = z3.object({
  sessionId: z3.string(),
});
var paginationInput = z3.object({
  page: z3.number().min(1).default(1),
  pageSize: z3.number().min(1).max(100).default(20),
});
var customerInputSchema = z3.object({
  name: z3.string().min(1, "Name is required").max(255),
  email: z3.string().email("Invalid email").optional().or(z3.literal("")),
  phone: z3.string().max(50).optional(),
  whatsapp: z3.string().max(50).optional(),
  language: z3.enum(["en", "he"]).default("en"),
  stage: z3
    .enum(["prospect", "active", "completed", "vip", "inactive"])
    .default("prospect"),
  source: z3.string().max(100).default("website"),
  tags: z3.string().optional(),
  // JSON array string
  notes: z3.string().max(2e3).optional(),
});
var customerActivityInputSchema = z3.object({
  customerId: z3.number(),
  type: z3.enum([
    "note",
    "call",
    "whatsapp",
    "email",
    "follow_up",
    "status_change",
  ]),
  content: z3.string().min(1, "Content is required").max(2e3),
  dueDate: z3
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : void 0)),
  createdBy: z3.string().optional(),
});
var updateUserRoleSchema = z3.object({
  userId: z3.number(),
  role: z3.enum(["user", "admin", "owner", "manager", "agent"]),
});
var settingsUpdateSchema = z3.object({
  key: z3.string().min(1).max(100),
  value: z3.unknown(),
});
var bookingDraftInputSchema = z3.object({
  contactName: z3.string().optional(),
  contactEmail: z3.string().email().optional().or(z3.literal("")),
  contactPhone: z3.string().optional(),
  formData: z3.string(),
  // JSON string
  tourSlug: z3.string().optional(),
});
var invoiceInputSchema = z3.object({
  bookingId: z3.number().optional(),
  type: z3.enum(["tax_invoice", "receipt", "wht_certificate"]),
  customerName: z3.string().min(1, "Customer name is required").max(255),
  customerAddress: z3.string().max(1e3).optional(),
  customerTaxId: z3.string().max(50).optional(),
  currency: z3.enum(["THB", "ILS", "USD"]).default("THB"),
  subtotal: z3.number().min(0),
  vatAmount: z3.number().default(0),
  whtRate: z3.number().min(0).max(500).default(0),
  whtAmount: z3.number().default(0),
  totalAmount: z3.number().min(0),
  fxRate: z3.string().optional(),
  thbEquivalent: z3.number().optional(),
  paymentMethod: z3.string().max(50).optional(),
  lineItems: z3.string().optional(),
  notes: z3.string().max(2e3).optional(),
});
var accountingEntryInputSchema = z3.object({
  date: z3.string().transform(s => new Date(s)),
  accountCode: z3.string().min(5).max(10),
  description: z3.string().min(1, "Description is required").max(500),
  debit: z3.number().min(0).default(0),
  credit: z3.number().min(0).default(0),
  currency: z3.enum(["THB", "ILS", "USD"]).default("THB"),
  originalAmount: z3.number().optional(),
  fxRate: z3.string().optional(),
  bookingId: z3.number().optional(),
  invoiceId: z3.number().optional(),
  vendorPayee: z3.string().max(255).optional(),
  documentRef: z3.string().max(100).optional(),
});
var taxFilingInputSchema = z3.object({
  type: z3.enum([
    "vat_pp30",
    "wht_pnd3",
    "wht_pnd53",
    "cit_pnd50",
    "cit_pnd51",
  ]),
  period: z3.string().min(4).max(20),
  dueDate: z3.string().transform(s => new Date(s)),
  outputVat: z3.number().optional(),
  inputVat: z3.number().optional(),
  netVat: z3.number().optional(),
  whtTotal: z3.number().optional(),
  taxableIncome: z3.number().optional(),
  taxAmount: z3.number().optional(),
  notes: z3.string().max(2e3).optional(),
});
var inventoryInputSchema = z3.object({
  name: z3.string().min(1, "Name is required").max(255),
  category: z3.enum(["vehicle", "equipment", "supplies"]),
  description: z3.string().max(1e3).optional(),
  purchaseDate: z3
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : void 0)),
  purchaseCost: z3.number().min(0).optional(),
  currentValue: z3.number().min(0).optional(),
  usefulLifeMonths: z3.number().min(1).optional(),
  condition: z3
    .enum(["new", "good", "fair", "poor", "retired"])
    .default("good"),
  quantity: z3.number().min(0).default(1),
  location: z3.string().max(255).optional(),
  notes: z3.string().max(2e3).optional(),
});
var manualPaymentInputSchema = z3.object({
  bookingId: z3.number(),
  amount: z3.number().positive(),
  currency: z3.string().default("THB"),
  paymentMethod: z3.enum([
    "bank_transfer",
    "promptpay",
    "cash",
    "bit",
    "wire",
    "other",
  ]),
  notes: z3.string().optional(),
});
var estimateEmailInputSchema = z3.object({
  email: z3.string().email("Valid email required"),
  selectedTours: z3.array(
    z3.object({
      slug: z3.string(),
      nameEn: z3.string(),
      nameHe: z3.string(),
      basePrice: z3.number(),
    })
  ),
  adults: z3.number().min(1),
  children: z3.array(z3.number().min(0).max(17)),
  arrivalDate: z3.string(),
  departureDate: z3.string(),
  includesHotels: z3.boolean(),
  includesFood: z3.boolean(),
  includesAttractions: z3.boolean(),
  attractionCount: z3.number().min(1),
  needsShabbatHotel: z3.boolean(),
  total: z3.number(),
  language: z3.enum(["en", "he"]),
});

// server/routes/booking.ts
var bookingRouter = router({
  create: securePublicProcedure
    .input(bookingInputSchema)
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers["x-forwarded-for"] ||
        ctx.req.headers["x-real-ip"] ||
        "unknown";
      const { allowed } = checkRateLimit(`booking:${ip}`, 10, 6e4);
      if (!allowed) {
        throw new TRPCError3({
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
      findOrCreateCustomer({
        name: input.contactName,
        email: input.contactEmail || void 0,
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
      const tourType = input.includesTrip ? "Custom Tour" : "Tour Package";
      const pickupLocation =
        input.pickupPoint === "custom"
          ? input.customPickupLocation
          : input.pickupPoint;
      const totalGuests = input.numberOfAdults + (input.numberOfChildren || 0);
      if (input.contactEmail)
        sendCustomerConfirmation({
          customerName: input.contactName,
          customerEmail: input.contactEmail,
          tourDate: input.arrivalDate.toISOString(),
          tourType,
          groupSize: totalGuests,
          pickupLocation,
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
    .input(z4.object({ id: z4.number() }))
    .query(async ({ input }) => {
      return await getBookingById(input.id);
    }),
  update: secureProtectedProcedure
    .input(
      z4.object({
        id: z4.number(),
        data: z4.object({
          status: z4
            .enum([
              "pending",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
            ])
            .optional(),
          totalPrice: z4.number().optional(),
          depositPaid: z4.number().optional(),
          balancePaid: z4.number().optional(),
          assignedAgentId: z4.number().optional(),
          notes: z4.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const oldBooking = await getBookingById(input.id);
      const oldStatus = oldBooking?.status;
      await updateBooking(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "booking",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      if (input.data.status && oldStatus && input.data.status !== oldStatus) {
        const name = oldBooking?.contactName ?? `#${input.id}`;
        if (input.data.status === "confirmed") {
          console.log(
            `[BookingStatus] Booking for ${name} confirmed (was: ${oldStatus}) \u2014 notification pending`
          );
        } else if (input.data.status === "cancelled") {
          console.log(
            `[BookingStatus] Booking for ${name} cancelled (was: ${oldStatus}) \u2014 notification pending`
          );
        } else {
          console.log(
            `[BookingStatus] Booking for ${name} status changed: ${oldStatus} -> ${input.data.status}`
          );
        }
      }
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
    .input(z4.object({ id: z4.number() }))
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
    .input(z4.object({ ids: z4.array(z4.number()).min(1) }))
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
    .input(z4.object({ id: z4.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const booking = await getBookingById(input.id);
      if (!booking)
        throw new TRPCError3({
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
        specialRequests: booking.specialRequests ?? void 0,
        bookingId: `WIRO-${booking.id}`,
      });
      return { success: true };
    }),
  suggestAgent: secureProtectedProcedure
    .input(z4.object({ bookingId: z4.number() }))
    .query(async ({ input }) => {
      const booking = await getBookingById(input.bookingId);
      if (!booking)
        throw new TRPCError3({
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
            const specs = JSON.parse(agent.specialties);
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
          } catch {}
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
      z4.object({
        id: z4.number(),
        arrivalDate: z4
          .string()
          .or(z4.date())
          .transform(v => new Date(v)),
        departureDate: z4
          .string()
          .or(z4.date())
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
  bulkEmail: secureProtectedProcedure
    .input(
      z4.object({
        bookingIds: z4.array(z4.number()).min(1),
        subject: z4.string().min(1).max(200),
        message: z4.string().min(1).max(5e3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      checkAdminRateLimit(ctx);
      let sent = 0;
      let failed = 0;
      for (const id of input.bookingIds) {
        const booking = await getBookingById(id);
        if (booking?.contactEmail) {
          try {
            await sendBulkEmailToCustomer({
              to: booking.contactEmail,
              subject: input.subject,
              message: input.message,
              customerName: booking.contactName,
            });
            sent++;
          } catch {
            failed++;
          }
        }
      }
      await logAdminAction({
        userId: ctx.user?.id,
        action: "bulk_email",
        resourceType: "booking",
        newValue: JSON.stringify({
          bookingIds: input.bookingIds,
          subject: input.subject,
          sent,
          failed,
        }),
      });
      return { sent, failed };
    }),
});

// server/routes/agent.ts
import { z as z5 } from "zod";
var agentRouter = router({
  create: secureProtectedProcedure
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
  list: secureProtectedProcedure.query(async () => {
    return await getAllAgents();
  }),
  getById: secureProtectedProcedure
    .input(z5.object({ id: z5.number() }))
    .query(async ({ input }) => {
      return await getAgentById(input.id);
    }),
  update: secureProtectedProcedure
    .input(
      z5.object({
        id: z5.number(),
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
  delete: secureProtectedProcedure
    .input(z5.object({ id: z5.number() }))
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
  bookings: secureProtectedProcedure
    .input(z5.object({ agentId: z5.number() }))
    .query(async ({ input }) => {
      return await getBookingsByAgentId(input.agentId);
    }),
  stats: secureProtectedProcedure.query(async () => {
    return await getAgentPerformanceStats();
  }),
  updateAvailability: secureProtectedProcedure
    .input(
      z5.object({
        id: z5.number(),
        status: z5.enum(["active", "inactive", "on_leave"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      checkAdminRateLimit(ctx);
      await updateAgent(input.id, { status: input.status });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update_availability",
        resourceType: "agent",
        resourceId: input.id,
        newValue: JSON.stringify({ status: input.status }),
      });
      return { success: true };
    }),
});

// server/routes/lead.ts
import { z as z6 } from "zod";

// server/_core/llm.ts
import OpenAI from "openai";
var ensureArray = value => (Array.isArray(value) ? value : [value]);
var normalizeContentPart = part => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = message => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");
    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }
  return {
    role,
    name,
    content: contentParts,
  };
};
var openaiClient = null;
function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}
async function invokeLLM(params) {
  const openai = getOpenAIClient();
  const { messages, tools, maxTokens, max_tokens } = params;
  const resolvedMaxTokens = maxTokens || max_tokens || 4096;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map(normalizeMessage),
      tools: tools?.length ? tools : void 0,
      max_tokens: resolvedMaxTokens,
    });
    return response;
  } catch (error) {
    if (error.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 2e3));
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages.map(normalizeMessage),
        tools: tools?.length ? tools : void 0,
        max_tokens: resolvedMaxTokens,
      });
      return response;
    } else if (error.status === 401) {
      throw new Error("OpenAI API key invalid or missing");
    } else if (error.status >= 500) {
      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    }
    console.error("[LLM] OpenAI error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
}

// server/autoResponse.ts
import { Resend as Resend3 } from "resend";
var SENDER_EMAIL3 = COMPANY_SENDER_EMAIL;
var _resend3 = null;
function getResend3() {
  if (!_resend3 && process.env.RESEND_API_KEY) {
    _resend3 = new Resend3(process.env.RESEND_API_KEY);
  }
  return _resend3;
}
async function sendAutoResponse(lead) {
  try {
    const resend = getResend3();
    if (!resend) {
      console.warn(
        "[AutoResponse] Resend API key not configured, skipping auto-response"
      );
      return false;
    }
    const activeTours = await getAllActiveTours();
    const tourList = activeTours
      .map(
        t2 =>
          `- ${t2.name}: ${t2.description?.substring(0, 100)}... (${t2.duration}, \u0E3F${t2.price})`
      )
      .join("\n");
    const prompt = `You are a friendly tour operator for WIRO 4x4, a kosher off-road tour company in Chiang Mai, Thailand.
Write a warm, personalized email response to a new inquiry.

Lead info:
- Name: ${lead.name}
- Source: ${lead.source || "website"}
- Interested in: ${lead.interestedTours || "Not specified"}
- Their message: ${lead.message || "No message provided"}

Available tours:
${tourList || "Various kosher off-road adventures in Northern Thailand"}

Requirements:
- Be warm and personal, use their name
- Suggest 2-3 relevant tours based on their interest
- Mention pricing overview
- Include WhatsApp number (${COMPANY_PHONE}) for quick questions
- Keep it under 300 words
- End with a clear call to action (book or WhatsApp for details)
- Do NOT use markdown formatting \u2014 this is a plain text email
- Sign off as "The WIRO 4x4 Team"`;
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You write warm, professional emails for a kosher tour operator. Be concise and helpful.",
        },
        { role: "user", content: prompt },
      ],
    });
    const responseText =
      typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "";
    if (!responseText) {
      console.error("[AutoResponse] LLM returned empty response");
      return false;
    }
    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL3}>`,
      to: [lead.email],
      subject: `Welcome to WIRO 4x4! Let's plan your Chiang Mai adventure`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
  .content { background: #fff; padding: 25px; border: 1px solid #e0e0e0; }
  .footer { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 13px; }
  .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0;">Welcome to WIRO 4x4!</h2>
      <p style="margin:5px 0 0 0;opacity:0.9;">Kosher Off-Road Adventures in Chiang Mai</p>
    </div>
    <div class="content">
      ${responseText
        .split("\n")
        .map(line => (line.trim() ? `<p>${line}</p>` : ""))
        .join("")}
      <div style="text-align:center;margin:20px 0;">
        <a href="https://wa.me/${COMPANY_WHATSAPP}" class="whatsapp-btn">Chat on WhatsApp</a>
      </div>
    </div>
    <div class="footer">
      <p><strong>${COMPANY_NAME}</strong></p>
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL3}</p>
      <p><a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a></p>
    </div>
  </div>
</body>
</html>`,
    });
    if (error) {
      console.error("[AutoResponse] Failed to send:", error);
      return false;
    }
    console.log(`[AutoResponse] Auto-response sent to ${lead.email}`);
    return true;
  } catch (error) {
    console.error("[AutoResponse] Error:", error);
    return false;
  }
}

// server/leadScoring.ts
function calculateLeadScore(lead) {
  let score = 0;
  const source = (lead.source ?? "website").toLowerCase();
  if (source === "referral") score += 25;
  else if (source === "whatsapp") score += 20;
  else if (source === "instagram" || source === "facebook") score += 15;
  else if (source === "website") score += 10;
  else score += 5;
  if (lead.phone) score += 10;
  if (lead.message && lead.message.length > 50) score += 10;
  else if (lead.message && lead.message.length > 0) score += 5;
  if (lead.interestedTours) {
    try {
      const tours2 = JSON.parse(lead.interestedTours);
      if (Array.isArray(tours2) && tours2.length > 0) score += 10;
    } catch {
      if (lead.interestedTours.length > 0) score += 5;
    }
  }
  if (lead.name && lead.name.length > 3) score += 5;
  if (lead.status === "quoted") score += 20;
  else if (lead.status === "contacted") score += 10;
  else if (lead.status === "new") score += 5;
  const now = /* @__PURE__ */ new Date();
  const ageMs = now.getTime() - new Date(lead.createdAt).getTime();
  const ageDays = ageMs / (1e3 * 60 * 60 * 24);
  if (ageDays < 1) score += 20;
  else if (ageDays < 3) score += 15;
  else if (ageDays < 7) score += 10;
  else if (ageDays < 14) score += 5;
  return Math.max(1, Math.min(100, score));
}

// server/routes/lead.ts
var leadRouter = router({
  create: securePublicProcedure
    .input(leadInputSchema)
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers["x-forwarded-for"] ||
        ctx.req.headers["x-real-ip"] ||
        "unknown";
      const { allowed } = checkRateLimit(`lead:${ip}`, 10, 6e4);
      if (!allowed) {
        throw new TRPCError3({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again in a minute.",
        });
      }
      await createLead(input);
      findOrCreateCustomer({
        name: input.name,
        email: input.email,
        phone: input.phone || void 0,
        source: input.source || "website",
      }).catch(console.error);
      const allLeads = await getAllLeads();
      const newLead = allLeads[0];
      if (newLead) {
        const score = calculateLeadScore(newLead);
        updateLeadScore(newLead.id, score).catch(err =>
          console.error("[Lead] Failed to update lead score:", err)
        );
      }
      sendAutoResponse({
        name: input.name,
        email: input.email,
        phone: input.phone ?? void 0,
        source: input.source ?? void 0,
        interestedTours: input.interestedTours ?? void 0,
        message: input.message ?? void 0,
      }).catch(err =>
        console.error("[Lead] Failed to send auto-response:", err)
      );
      return { success: true, message: "Lead captured successfully" };
    }),
  list: secureProtectedProcedure.query(async () => {
    return await getAllLeads();
  }),
  listPaginated: secureProtectedProcedure
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
  update: secureProtectedProcedure
    .input(
      z6.object({
        id: z6.number(),
        data: z6.object({
          status: z6
            .enum(["new", "contacted", "quoted", "converted", "lost"])
            .optional(),
          convertedToBookingId: z6.number().optional(),
          notes: z6.string().optional(),
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
  delete: secureProtectedProcedure
    .input(z6.object({ id: z6.number() }))
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
  bulkDelete: secureProtectedProcedure
    .input(z6.object({ ids: z6.array(z6.number()).min(1) }))
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
});

// server/routes/financial.ts
import { z as z7 } from "zod";
var financialRouter = router({
  create: secureProtectedProcedure
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
  listByBooking: secureProtectedProcedure
    .input(z7.object({ bookingId: z7.number() }))
    .query(async ({ input }) => {
      return await getFinancialRecordsByBookingId(input.bookingId);
    }),
  listAll: secureProtectedProcedure.query(async () => {
    return await getAllFinancialRecords();
  }),
  listAllPaginated: secureProtectedProcedure
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
  update: secureProtectedProcedure
    .input(
      z7.object({
        id: z7.number(),
        data: z7.object({
          type: z7.enum(["revenue", "cost", "refund"]).optional(),
          category: z7.string().optional(),
          amount: z7.number().optional(),
          description: z7.string().optional(),
          paymentMethod: z7.string().optional(),
          notes: z7.string().optional(),
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
  delete: secureProtectedProcedure
    .input(z7.object({ id: z7.number() }))
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
  stats: secureProtectedProcedure.query(async () => {
    return await getFinancialStats();
  }),
  statsByTour: secureProtectedProcedure.query(async () => {
    return await getFinancialStatsByTour();
  }),
  statsByAgent: secureProtectedProcedure.query(async () => {
    return await getFinancialStatsByAgent();
  }),
});

// server/routes/gallery.ts
import { z as z8 } from "zod";
import { randomUUID } from "crypto";

// server/storage.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// server/_core/env.ts
var REQUIRED_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
  "OWNER_EMAIL",
];
var isTestEnv =
  process.env.NODE_ENV === "test" || process.env.VITEST === "true";
if (!isTestEnv) {
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}
var ENV = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2BucketName: process.env.R2_BUCKET_NAME,
  r2PublicUrl: process.env.R2_PUBLIC_URL,
  ownerEmail: process.env.OWNER_EMAIL,
  isProduction: process.env.NODE_ENV === "production",
  // Lazy-init services (optional)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
};

// server/storage.ts
var _s3Client = null;
function getS3Client() {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ENV.r2AccessKeyId,
        secretAccessKey: ENV.r2SecretAccessKey,
      },
    });
  }
  return _s3Client;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
async function storagePut(
  relKey,
  data,
  contentType = "application/octet-stream"
) {
  const key = normalizeKey(relKey);
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
      Body: typeof data === "string" ? Buffer.from(data) : data,
      ContentType: contentType,
    })
  );
  const url = `${ENV.r2PublicUrl}/${key}`;
  return { key, url };
}

// server/routes/gallery.ts
var galleryRouter = router({
  list: securePublicProcedure
    .input(
      z8
        .object({
          limit: z8.number().min(1).max(200).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const photos = await getAllPublishedPhotos(input?.limit);
      return photos.map(p => ({ ...p, imageUrl: p.s3Url }));
    }),
  listFeatured: securePublicProcedure.query(async () => {
    const photos = await getFeaturedPhotos();
    return photos.map(p => ({ ...p, imageUrl: p.s3Url }));
  }),
  listPaginated: securePublicProcedure
    .input(
      paginationInput.extend({
        category: z8.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, category } = input;
      const { items, total } = await getPublishedPhotosPaginated(
        page,
        pageSize,
        category
      );
      return {
        items: items.map(p => ({ ...p, imageUrl: p.s3Url })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),
  listAll: secureProtectedProcedure.query(async () => {
    const photos = await getAllGalleryPhotos();
    return photos.map(p => ({ ...p, imageUrl: p.s3Url }));
  }),
  listAllPaginated: secureProtectedProcedure
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
  create: secureProtectedProcedure
    .input(
      z8.object({
        title: z8.string().min(1),
        imageUrl: z8.string().min(1),
        description: z8.string().optional(),
        category: z8
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
        sortOrder: z8.number().default(0),
        isPublished: z8.boolean().default(true),
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
  update: secureProtectedProcedure
    .input(
      z8.object({
        id: z8.number(),
        data: z8.object({
          title: z8.string().optional(),
          imageUrl: z8.string().optional(),
          description: z8.string().optional(),
          category: z8
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
          sortOrder: z8.number().optional(),
          isPublished: z8.boolean().optional(),
          isFeatured: z8.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData = {};
      if (input.data.title !== void 0) updateData.title = input.data.title;
      if (input.data.imageUrl !== void 0) {
        updateData.s3Url = input.data.imageUrl;
        const url = new URL(input.data.imageUrl, "https://placeholder.local");
        updateData.s3Key = url.pathname;
      }
      if (input.data.description !== void 0)
        updateData.description = input.data.description;
      if (input.data.category !== void 0)
        updateData.category = input.data.category;
      if (input.data.sortOrder !== void 0)
        updateData.sortOrder = input.data.sortOrder;
      if (input.data.isPublished !== void 0)
        updateData.isPublished = input.data.isPublished ? 1 : 0;
      if (input.data.isFeatured !== void 0)
        updateData.isFeatured = input.data.isFeatured ? 1 : 0;
      await updateGalleryPhoto(input.id, updateData);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "gallery",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),
  delete: secureProtectedProcedure
    .input(z8.object({ id: z8.number() }))
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
  upload: secureProtectedProcedure
    .input(
      z8.object({
        filename: z8.string(),
        contentType: z8.string(),
        base64Data: z8.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!ALLOWED_TYPES.includes(input.contentType)) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
        });
      }
      const fileSize = Buffer.byteLength(input.base64Data, "base64");
      if (fileSize > 10 * 1024 * 1024) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "File too large. Maximum size is 10MB.",
        });
      }
      const ext =
        input.contentType.split("/")[1] === "jpeg"
          ? "jpg"
          : input.contentType.split("/")[1];
      const safeFilename = `${randomUUID()}.${ext}`;
      const key = `gallery/${safeFilename}`;
      const buffer = Buffer.from(input.base64Data, "base64");
      let result;
      try {
        result = await storagePut(key, buffer, input.contentType);
      } catch (err) {
        captureException(err);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file to storage",
          cause: err,
        });
      }
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "gallery_upload",
        newValue: JSON.stringify({ key: result.key }),
      });
      return { url: result.url, key: result.key };
    }),
});

// server/routes/review.ts
import { z as z9 } from "zod";
var reviewRouter = router({
  create: securePublicProcedure
    .input(
      z9.object({
        name: z9.string().min(1, "Name is required"),
        email: z9.string().email("Invalid email"),
        rating: z9.number().min(1).max(5),
        text: z9.string().min(1, "Review text is required"),
        tourType: z9.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers["x-forwarded-for"] ||
        ctx.req.headers["x-real-ip"] ||
        "unknown";
      const { allowed } = checkRateLimit(`review:${ip}`, 5, 6e4);
      if (!allowed) {
        throw new TRPCError3({
          code: "TOO_MANY_REQUESTS",
          message: "Too many review submissions. Please try again in a minute.",
        });
      }
      await createReview({
        ...input,
        isApproved: 0,
        isPublished: 0,
      });
      return { success: true, message: "Review submitted for approval" };
    }),
  listPublic: securePublicProcedure.query(async () => {
    return await getApprovedReviews();
  }),
  listAll: secureProtectedProcedure.query(async () => {
    const all = await getAllReviews();
    return all.map(r => ({
      ...r,
      status:
        r.isApproved === 1
          ? "approved"
          : r.isPublished === 0 && r.isApproved === 0
            ? "pending"
            : "rejected",
    }));
  }),
  listAllPaginated: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllReviewsPaginated(page, pageSize);
      return {
        items: items.map(r => ({
          ...r,
          status:
            r.isApproved === 1
              ? "approved"
              : r.isPublished === 0 && r.isApproved === 0
                ? "pending"
                : "rejected",
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),
  stats: secureProtectedProcedure.query(async () => {
    return await getReviewStats();
  }),
  update: secureProtectedProcedure
    .input(
      z9.object({
        id: z9.number(),
        data: z9.object({
          status: z9.enum(["pending", "approved", "rejected"]).optional(),
          adminResponse: z9.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData = {};
      if (input.data.adminResponse !== void 0)
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
      await updateReview(input.id, updateData);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "review",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),
  delete: secureProtectedProcedure
    .input(z9.object({ id: z9.number() }))
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
  bulkApprove: secureProtectedProcedure
    .input(z9.object({ ids: z9.array(z9.number()).min(1) }))
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
  bulkDelete: secureProtectedProcedure
    .input(z9.object({ ids: z9.array(z9.number()).min(1) }))
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
});

// server/routes/payment.ts
import { z as z10 } from "zod";

// server/stripe.ts
var _stripe = null;
var _stripeInitAttempted = false;
function getStripeClient() {
  if (_stripeInitAttempted) return _stripe;
  _stripeInitAttempted = true;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn(
      "[Stripe] STRIPE_SECRET_KEY not set \u2014 payment features disabled"
    );
    return null;
  }
  try {
    const StripeConstructor =
      __require("stripe").default ?? __require("stripe");
    _stripe = new StripeConstructor(secretKey, {
      apiVersion: "2024-12-18.acacia",
    });
    console.log("[Stripe] Client initialized successfully");
    return _stripe;
  } catch (err) {
    console.warn("[Stripe] Failed to initialize client:", err);
    _stripe = null;
    return null;
  }
}
var APP_URL =
  process.env.APP_URL ||
  process.env.VITE_APP_URL ||
  "https://wiro4x4.manus.space";
function ensureStripe() {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error(
      "Stripe integration not yet configured. Set STRIPE_SECRET_KEY to enable payments."
    );
  }
  return stripe;
}
async function createCheckoutSession(bookingId, amount, type, customerEmail) {
  const stripe = ensureStripe();
  const typeLabels = {
    deposit: "Deposit",
    balance: "Balance",
    full: "Full Payment",
  };
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "thb",
          product_data: {
            name: `WIRO 4x4 Tour - ${typeLabels[type]}`,
            description: `Booking #${bookingId} \u2014 ${typeLabels[type]} payment`,
          },
          // Stripe expects the smallest currency unit.
          // For THB the smallest unit is satang (1 THB = 100 satang).
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/booking/cancel`,
    customer_email: customerEmail || void 0,
    metadata: {
      bookingId: String(bookingId),
      type,
      amount: String(amount),
    },
  });
  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }
  return { url: session.url, sessionId: session.id };
}
async function getSessionStatus(sessionId) {
  const stripe = ensureStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.status ?? "unknown",
    paymentStatus: session.payment_status,
    amountPaid: session.amount_total ? session.amount_total / 100 : void 0,
    customerEmail: session.customer_email ?? void 0,
    bookingId: session.metadata?.bookingId
      ? Number(session.metadata.bookingId)
      : void 0,
  };
}
async function createRefund(paymentIntentId, amount) {
  const stripe = ensureStripe();
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? amount * 100 : void 0,
    // full refund if no amount
  });
  return {
    refundId: refund.id,
    status: refund.status ?? "unknown",
    amount: refund.amount / 100,
  };
}

// server/stripeService.ts
async function initiateCheckout(bookingId, amount, type, customerEmail) {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error(`Booking #${bookingId} not found`);
  }
  const existingPayments = await getPaymentsByBookingId(bookingId);
  const hasPendingDuplicate = existingPayments.some(
    p => p.type === type && p.status === "pending"
  );
  if (hasPendingDuplicate) {
    throw new Error(
      `A pending ${type} payment already exists for booking #${bookingId}`
    );
  }
  const { url, sessionId } = await createCheckoutSession(
    bookingId,
    amount,
    type,
    customerEmail
  );
  await createPayment({
    bookingId,
    type,
    amount,
    stripeSessionId: sessionId,
    status: "pending",
    paymentMethod: "card",
  });
  return { url, sessionId };
}
async function verifyAndCompleteSession(sessionId) {
  const existingPayment = await getPaymentBySessionId(sessionId);
  if (existingPayment && existingPayment.status === "completed") {
    return {
      status: "complete",
      paymentStatus: "paid",
      amountPaid: existingPayment.amount,
      bookingId: existingPayment.bookingId,
      alreadyCompleted: true,
    };
  }
  const session = await getSessionStatus(sessionId);
  if (session.paymentStatus === "paid" && existingPayment) {
    await updatePayment(existingPayment.id, {
      status: "completed",
      paidAt: /* @__PURE__ */ new Date(),
    });
    if (existingPayment.type === "deposit") {
      await updateBooking(existingPayment.bookingId, {
        depositPaid: 1,
      });
    } else if (
      existingPayment.type === "balance" ||
      existingPayment.type === "full"
    ) {
      await updateBooking(existingPayment.bookingId, {
        balancePaid: 1,
      });
    }
    const booking = await getBookingById(existingPayment.bookingId);
    if (booking) {
      await sendPaymentConfirmationEmail({
        customerName: booking.contactName,
        customerEmail: booking.contactEmail ?? "",
        amount: existingPayment.amount,
        type: existingPayment.type,
        bookingId: existingPayment.bookingId,
      }).catch(err => {
        console.error(
          "[StripeService] Failed to send confirmation email:",
          err
        );
      });
    }
  }
  return {
    status: session.status,
    paymentStatus: session.paymentStatus,
    amountPaid: session.amountPaid,
    bookingId: session.bookingId,
    alreadyCompleted: false,
  };
}
async function processRefund(paymentId, amount, reason) {
  const originalPayment = await getPaymentById(paymentId);
  if (!originalPayment) {
    throw new Error(`Payment #${paymentId} not found`);
  }
  if (originalPayment.status !== "completed") {
    throw new Error(
      `Payment #${paymentId} is not completed (status: ${originalPayment.status})`
    );
  }
  if (!originalPayment.stripePaymentIntentId) {
    throw new Error(
      `Payment #${paymentId} has no Stripe PaymentIntent ID for refund`
    );
  }
  const refundAmount = amount || originalPayment.amount;
  const refundResult = await createRefund(
    originalPayment.stripePaymentIntentId,
    amount
  );
  await createPayment({
    bookingId: originalPayment.bookingId,
    type: "refund",
    amount: refundAmount,
    status: "completed",
    stripePaymentIntentId: refundResult.refundId,
    paymentMethod: "card",
    notes: reason || void 0,
    paidAt: /* @__PURE__ */ new Date(),
  });
  await updatePayment(paymentId, {
    status: "refunded",
  });
  return refundResult;
}

// server/routes/payment.ts
var paymentRouter = router({
  listByBooking: secureProtectedProcedure
    .input(z10.object({ bookingId: z10.number() }))
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
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }
      try {
        const result = await initiateCheckout(
          input.bookingId,
          input.amount,
          input.type,
          booking.contactEmail ?? void 0
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
      } catch (err) {
        captureException(err);
        throw new TRPCError3({
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
      } catch (err) {
        captureException(err);
        throw new TRPCError3({
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
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }
      try {
        const result = await initiateCheckout(
          input.bookingId,
          input.amount,
          input.type,
          booking.contactEmail ?? void 0
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
      } catch (err) {
        captureException(err);
        throw new TRPCError3({
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
      } catch (err) {
        captureException(err);
        throw new TRPCError3({
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
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }
      const totalPrice = booking.totalPrice ?? 0;
      const alreadyPaid = await getBookingTotalPaid(input.bookingId);
      const remainingAfterPayment = totalPrice - alreadyPaid - input.amount;
      const paymentType = remainingAfterPayment > 0 ? "deposit" : "full";
      await createPayment({
        bookingId: input.bookingId,
        type: paymentType,
        amount: input.amount,
        currency: input.currency,
        status: "completed",
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        paidAt: /* @__PURE__ */ new Date(),
      });
      await createFinancialRecord({
        bookingId: input.bookingId,
        type: "revenue",
        category: "manual_payment",
        amount: input.amount,
        currency: input.currency,
        description: `Manual ${input.paymentMethod} payment`,
        paymentMethod: input.paymentMethod,
        paymentDate: /* @__PURE__ */ new Date(),
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

// server/routes/tour.ts
import { z as z11 } from "zod";
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
var tourRouter = router({
  list: securePublicProcedure.query(async () => {
    return await getAllActiveTours();
  }),
  getBySlug: securePublicProcedure
    .input(z11.object({ slug: z11.string() }))
    .query(async ({ input }) => {
      return await getTourBySlug(input.slug);
    }),
  listAll: secureProtectedProcedure.query(async () => {
    return await getAllTours();
  }),
  listAllPaginated: secureProtectedProcedure
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
  create: secureProtectedProcedure
    .input(tourInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const slug = input.slug || generateSlug(input.name);
      await createTour({
        ...input,
        slug,
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
  update: secureProtectedProcedure
    .input(
      z11.object({
        id: z11.number(),
        data: tourInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData = {};
      const fields = [
        "name",
        "nameHe",
        "slug",
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
        "includedItems",
        "itinerary",
        "sortOrder",
      ];
      for (const field of fields) {
        if (input.data[field] !== void 0) updateData[field] = input.data[field];
      }
      if (input.data.isKosher !== void 0)
        updateData.isKosher = input.data.isKosher ? 1 : 0;
      if (input.data.isPrivate !== void 0)
        updateData.isPrivate = input.data.isPrivate ? 1 : 0;
      if (input.data.isShabbatOk !== void 0)
        updateData.isShabbatOk = input.data.isShabbatOk ? 1 : 0;
      if (input.data.isActive !== void 0)
        updateData.isActive = input.data.isActive ? 1 : 0;
      await updateTour(input.id, updateData);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tour",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),
  delete: secureProtectedProcedure
    .input(z11.object({ id: z11.number() }))
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
});

// server/routes/blog.ts
import { z as z12 } from "zod";

// server/aiContentGenerator.ts
import Anthropic from "@anthropic-ai/sdk";
var _client = null;
function getClient() {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required for AI content generation"
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}
function buildSystemPrompt(tourData) {
  const tourList =
    tourData.length > 0
      ? tourData
          .map(
            t2 =>
              `- ${t2.name} (${t2.nameHe}): ${t2.duration}, ${t2.price}THB \u2014 /tours/${t2.slug}`
          )
          .join("\n")
      : "No tour data available.";
  return `You are a content writer for WIRO 4x4, a kosher off-road tour company in Chiang Mai, Northern Thailand.

Brand voice: adventurous yet professional, warm and welcoming to Israeli travelers. You are experts in Northern Thailand, kosher dining, and off-road 4x4 adventures.

Available tours:
${tourList}

Writing rules:
- Write content in Markdown format (use ##, ###, -, **, etc.)
- Include internal links to tour pages using /tours/<slug> format
- Optimize for SEO: use the topic keywords naturally in headings and first paragraph
- Be specific with local knowledge (place names, Thai words, practical tips)
- Hebrew content must be natural Hebrew, NOT machine-translated

You MUST respond with a valid JSON object containing these exact fields:
- title: English title (SEO-optimized)
- titleHe: Hebrew title
- slug: URL-friendly slug (lowercase, hyphens)
- excerpt: 1-2 sentence English summary for preview cards
- excerptHe: Hebrew summary
- content: Full English article in Markdown
- contentHe: Full Hebrew article in Markdown
- category: One of: "Travel Tips", "Food & Kosher", "Culture", "Adventure", "Guides"
- tags: Comma-separated lowercase tags

Respond ONLY with the JSON object, no other text.`;
}
async function generateBlogDraft(options) {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: buildSystemPrompt(options.tourData),
    messages: [
      {
        role: "user",
        content: `Write a ${options.length}-word ${options.tone} blog article about: "${options.topic}"`,
      },
    ],
  });
  const text2 =
    response.content[0]?.type === "text" ? response.content[0].text : "";
  try {
    const parsed = JSON.parse(text2);
    return {
      title: parsed.title || options.topic,
      titleHe: parsed.titleHe || "",
      slug:
        parsed.slug || options.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: parsed.excerpt || "",
      excerptHe: parsed.excerptHe || "",
      content: parsed.content || "",
      contentHe: parsed.contentHe || "",
      category: parsed.category || "Travel Tips",
      tags: parsed.tags || "",
    };
  } catch {
    return {
      title: options.topic,
      titleHe: "",
      slug: options.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: text2.slice(0, 200),
      excerptHe: "",
      content: text2,
      contentHe: "",
      category: "Travel Tips",
      tags: "",
    };
  }
}

// server/imageOptimizer.ts
var sharpModule = null;
async function getSharp() {
  if (sharpModule) return sharpModule;
  try {
    sharpModule = (await import("sharp")).default;
    return sharpModule;
  } catch {
    console.warn(
      "[imageOptimizer] sharp not available, returning images unoptimized"
    );
    return null;
  }
}
async function optimizeUploadedImage(inputBuffer, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = "webp",
  } = options;
  const originalSize = inputBuffer.length;
  const sharp = await getSharp();
  if (!sharp) {
    return {
      buffer: inputBuffer,
      contentType: "image/jpeg",
      extension: "jpg",
      originalSize,
      optimizedSize: originalSize,
    };
  }
  try {
    let pipeline = sharp(inputBuffer).resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });
    let contentType;
    let extension;
    if (format === "webp") {
      pipeline = pipeline.webp({ quality });
      contentType = "image/webp";
      extension = "webp";
    } else {
      pipeline = pipeline.jpeg({ quality, progressive: true });
      contentType = "image/jpeg";
      extension = "jpg";
    }
    const buffer = await pipeline.toBuffer();
    return {
      buffer,
      contentType,
      extension,
      originalSize,
      optimizedSize: buffer.length,
    };
  } catch (err) {
    console.error(
      "[imageOptimizer] Failed to optimize, returning original:",
      err
    );
    return {
      buffer: inputBuffer,
      contentType: "image/jpeg",
      extension: "jpg",
      originalSize,
      optimizedSize: originalSize,
    };
  }
}

// server/routes/blog.ts
var blogRouter = router({
  list: securePublicProcedure.query(async () => {
    return await getAllPublishedBlogPosts();
  }),
  getBySlug: securePublicProcedure
    .input(z12.object({ slug: z12.string() }))
    .query(async ({ input }) => {
      return await getBlogPostBySlug(input.slug);
    }),
  listAll: secureProtectedProcedure.query(async () => {
    return await getAllBlogPosts();
  }),
  listAllPaginated: secureProtectedProcedure
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
  create: secureProtectedProcedure
    .input(blogPostInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createBlogPost({
        ...input,
        isPublished: input.isPublished ? 1 : 0,
        publishedAt: input.isPublished ? /* @__PURE__ */ new Date() : void 0,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "blog",
        newValue: JSON.stringify({ title: input.title, slug: input.slug }),
      });
      return { success: true, message: "Blog post created successfully" };
    }),
  update: secureProtectedProcedure
    .input(
      z12.object({
        id: z12.number(),
        data: blogPostInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData = {};
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
      ];
      for (const field of fields) {
        if (input.data[field] !== void 0) updateData[field] = input.data[field];
      }
      if (input.data.isPublished !== void 0) {
        updateData.isPublished = input.data.isPublished ? 1 : 0;
        if (input.data.isPublished) {
          updateData.publishedAt = /* @__PURE__ */ new Date();
        }
      }
      await updateBlogPost(input.id, updateData);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "blog",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),
  delete: secureProtectedProcedure
    .input(z12.object({ id: z12.number() }))
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
  uploadImage: secureProtectedProcedure
    .input(
      z12.object({
        fileName: z12.string().min(1),
        fileData: z12.string().min(1),
        // base64
        contentType: z12.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const rawBuffer = Buffer.from(input.fileData, "base64");
      const {
        buffer,
        contentType: optimizedType,
        extension,
      } = await optimizeUploadedImage(rawBuffer, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 80,
      });
      const baseName = input.fileName.replace(/\.[^.]+$/, "");
      const key = `blog/${Date.now()}-${baseName}.${extension}`;
      const { url } = await storagePut(key, buffer, optimizedType);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "upload_image",
        resourceType: "blog",
        newValue: JSON.stringify({ fileName: input.fileName, url }),
      });
      return { url };
    }),
  generateDraft: secureProtectedProcedure
    .input(
      z12.object({
        topic: z12.string().min(1),
        tone: z12
          .enum(["informative", "adventurous", "practical"])
          .default("informative"),
        length: z12.number().min(300).max(3e3).default(1e3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const tours2 = await getAllActiveTours();
      const tourData = tours2.map(t2 => ({
        name: t2.name,
        nameHe: t2.nameHe,
        slug: t2.slug,
        description: t2.description,
        price: t2.price,
        duration: t2.duration,
      }));
      const draft = await generateBlogDraft({ ...input, tourData });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "generate_draft",
        resourceType: "blog",
        newValue: JSON.stringify({ topic: input.topic }),
      });
      return draft;
    }),
});

// server/routes/newsletter.ts
import { z as z13 } from "zod";

// server/newsletterEmailService.ts
var _resend4 = null;
function getResend4() {
  if (!_resend4) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[Newsletter] No RESEND_API_KEY \u2014 emails will not be sent"
      );
      return null;
    }
    const { Resend: Resend6 } = __require("resend");
    _resend4 = new Resend6(apiKey);
  }
  return _resend4;
}
async function sendNewsletterEmail(blogPostId, subscribers2, subject) {
  const resend = getResend4();
  if (!resend) {
    console.warn("[Newsletter] Resend not configured, skipping email send");
    return 0;
  }
  const post = await getBlogPostById(blogPostId);
  if (!post) {
    console.error(`[Newsletter] Blog post ${blogPostId} not found`);
    return 0;
  }
  const siteUrl = process.env.SITE_URL || "https://www.wiro4x4indochina.com";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const emailSubject = subject || `New from WIRO 4x4: ${post.title}`;
  let sent = 0;
  for (const sub of subscribers2) {
    try {
      const isHe = sub.language === "he";
      const title = isHe && post.titleHe ? post.titleHe : post.title;
      const excerpt =
        isHe && post.excerptHe ? post.excerptHe : post.excerpt || "";
      const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      await resend.emails.send({
        from: "WIRO 4x4 <updates@wiro4x4indochina.com>",
        to: sub.email,
        subject: emailSubject,
        html: `
          <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
            <h1 style="color:#1c1c1c;">${title}</h1>
            ${post.coverImage ? `<img src="${post.coverImage}" alt="${title}" style="width:100%;border-radius:8px;margin:16px 0;" />` : ""}
            <p style="color:#555;font-size:16px;line-height:1.6;">${excerpt}</p>
            <a href="${postUrl}" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0;">
              ${isHe ? "\u05E7\u05E8\u05D0\u05D5 \u05E2\u05D5\u05D3" : "Read More"}
            </a>
            <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
            <p style="font-size:12px;color:#999;">
              <a href="${unsubscribeUrl}" style="color:#999;">${isHe ? "\u05D1\u05D9\u05D8\u05D5\u05DC \u05D4\u05E8\u05E9\u05DE\u05D4" : "Unsubscribe"}</a>
            </p>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error(`[Newsletter] Failed to send to ${sub.email}:`, err);
    }
  }
  return sent;
}

// server/routes/newsletter.ts
var newsletterRouter = router({
  subscribe: securePublicProcedure
    .input(
      z13.object({
        email: z13.string().email(),
        name: z13.string().optional(),
        language: z13.string().default("en"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers["x-forwarded-for"] ||
        ctx.req.headers["x-real-ip"] ||
        "unknown";
      const { allowed } = checkRateLimit(`newsletter:${ip}`, 5, 6e4);
      if (!allowed) {
        throw new TRPCError3({
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
  unsubscribe: securePublicProcedure
    .input(z13.object({ email: z13.string().email() }))
    .mutation(async ({ input }) => {
      await deactivateSubscriber(input.email);
      return { success: true, message: "Unsubscribed successfully" };
    }),
  list: secureProtectedProcedure.query(async () => {
    return await getAllSubscribers();
  }),
  send: secureProtectedProcedure
    .input(
      z13.object({
        blogPostId: z13.number(),
        subject: z13.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const subscribers2 = await getAllActiveSubscribers();
      if (subscribers2.length === 0) {
        return { success: true, sent: 0, message: "No active subscribers" };
      }
      const sent = await sendNewsletterEmail(
        input.blogPostId,
        subscribers2,
        input.subject
      );
      await logAdminAction({
        userId: ctx.user?.id,
        action: "send_newsletter",
        resourceType: "newsletter",
        newValue: JSON.stringify({
          blogPostId: input.blogPostId,
          recipientCount: sent,
        }),
      });
      return { success: true, sent, message: `Sent to ${sent} subscribers` };
    }),
});

// server/routes/health.ts
import { sql as sql16 } from "drizzle-orm";
var healthRouter = router({
  readiness: securePublicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }
    try {
      await db.select({ val: sql16`1` }).from(sql16`dual`);
      return { status: "ready", database: "connected" };
    } catch (err) {
      captureException(err);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database check failed",
      });
    }
  }),
  liveness: securePublicProcedure.query(() => {
    return {
      status: "alive",
      timestamp: /* @__PURE__ */ new Date().toISOString(),
    };
  }),
});

// server/routes/crm.ts
import { z as z14 } from "zod";
var crmRouter = router({
  listCustomers: secureManagerProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllCustomersPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),
  getCustomer: secureManagerProcedure
    .input(z14.object({ id: z14.number() }))
    .query(async ({ input }) => {
      const customer = await getCustomerById(input.id);
      if (!customer) return null;
      const activities = await getActivitiesByCustomerId(input.id);
      const timeline = await getCustomerTimeline(
        customer.email ?? void 0,
        customer.phone ?? void 0
      );
      return { customer, activities, timeline };
    }),
  createCustomer: secureManagerProcedure
    .input(customerInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createCustomer(input);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "customer",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),
  updateCustomer: secureManagerProcedure
    .input(
      z14.object({ id: z14.number(), data: customerInputSchema.partial() })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateCustomer(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "customer",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),
  deleteCustomer: secureOwnerProcedure
    .input(z14.object({ id: z14.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteCustomer(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "customer",
        resourceId: input.id,
      });
      return { success: true };
    }),
  addActivity: secureAgentProcedure
    .input(customerActivityInputSchema)
    .mutation(async ({ input, ctx }) => {
      await createCustomerActivity({
        ...input,
        createdBy: ctx.user?.name ?? ctx.user?.email ?? "unknown",
      });
      await updateCustomer(input.customerId, {
        lastContactAt: /* @__PURE__ */ new Date(),
      });
      return { success: true };
    }),
  completeActivity: secureAgentProcedure
    .input(z14.object({ id: z14.number() }))
    .mutation(async ({ input }) => {
      await completeActivity(input.id);
      return { success: true };
    }),
  getPipelineStats: secureManagerProcedure.query(async () => {
    return await getCustomerPipelineStats();
  }),
  movePipeline: secureManagerProcedure
    .input(
      z14.object({
        customerId: z14.number(),
        stage: z14.enum(["prospect", "active", "completed", "vip", "inactive"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateCustomer(input.customerId, { stage: input.stage });
      await createCustomerActivity({
        customerId: input.customerId,
        type: "status_change",
        content: `Stage changed to ${input.stage}`,
        createdBy: ctx.user?.name ?? "unknown",
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "customer",
        resourceId: input.customerId,
        newValue: JSON.stringify({ stage: input.stage }),
      });
      return { success: true };
    }),
});

// server/routes/admin.ts
import { z as z15 } from "zod";
var adminRouter = router({
  listUsers: secureOwnerProcedure.query(async () => {
    return await getAllAdminUsers();
  }),
  updateUserRole: secureOwnerProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      if (input.userId === ctx.user?.id) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Cannot change your own role",
        });
      }
      await updateUserRole(input.userId, input.role);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "user",
        resourceId: input.userId,
        newValue: JSON.stringify({ role: input.role }),
      });
      return { success: true };
    }),
  removeUser: secureOwnerProcedure
    .input(z15.object({ userId: z15.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      if (input.userId === ctx.user?.id) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Cannot remove your own admin access",
        });
      }
      await removeAdminAccess(input.userId);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "user",
        resourceId: input.userId,
      });
      return { success: true };
    }),
});

// server/routes/settings.ts
import { z as z16 } from "zod";
var settingsRouter = router({
  getAll: secureProtectedProcedure.query(async () => {
    const rows = await getAllSettings();
    const map = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }),
  get: secureProtectedProcedure
    .input(z16.object({ key: z16.string() }))
    .query(async ({ input }) => {
      return getSetting(input.key);
    }),
  update: secureProtectedProcedure
    .input(settingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      checkAdminRateLimit(ctx);
      await upsertSetting(input.key, input.value);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update_setting",
        resourceType: "settings",
        newValue: JSON.stringify({ key: input.key, value: input.value }),
      });
      return { success: true };
    }),
});

// server/routes/dashboard.ts
import {
  sql as sql17,
  eq as eq22,
  and as and10,
  gte as gte3,
  lte as lte2,
  count as count2,
  sum,
} from "drizzle-orm";
var dashboardRouter = router({
  stats: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        bookingsByDay: [],
        revenueByDay: [],
        leadConversion: { total: 0, converted: 0, rate: 0 },
        upcomingTours: [],
        pendingBookings: 0,
        newLeads: 0,
      };
    }
    const now = /* @__PURE__ */ new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3);
    const bookingsByDay = await db
      .select({
        date: sql17`DATE(${bookings.createdAt})`.as("date"),
        count: count2().as("count"),
      })
      .from(bookings)
      .where(gte3(bookings.createdAt, thirtyDaysAgo))
      .groupBy(sql17`DATE(${bookings.createdAt})`)
      .orderBy(sql17`DATE(${bookings.createdAt})`);
    const revenueByDay = await db
      .select({
        date: sql17`DATE(${financialRecords.createdAt})`.as("date"),
        total: sum(financialRecords.amount).as("total"),
      })
      .from(financialRecords)
      .where(
        and10(
          eq22(financialRecords.type, "revenue"),
          gte3(financialRecords.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql17`DATE(${financialRecords.createdAt})`)
      .orderBy(sql17`DATE(${financialRecords.createdAt})`);
    const [leadStats] = await db
      .select({
        total: count2().as("total"),
        converted:
          sql17`SUM(CASE WHEN ${leads.status} = 'converted' THEN 1 ELSE 0 END)`.as(
            "converted"
          ),
      })
      .from(leads);
    const upcomingTours = await db
      .select()
      .from(bookings)
      .where(
        and10(
          gte3(bookings.arrivalDate, sql17`CURDATE()`),
          lte2(bookings.arrivalDate, sevenDaysFromNow),
          sql17`${bookings.status} IN ('confirmed', 'in_progress')`
        )
      )
      .orderBy(bookings.arrivalDate)
      .limit(10);
    const [pendingCount] = await db
      .select({ count: count2().as("count") })
      .from(bookings)
      .where(eq22(bookings.status, "pending"));
    const [newLeadsCount] = await db
      .select({ count: count2().as("count") })
      .from(leads)
      .where(eq22(leads.status, "new"));
    return {
      bookingsByDay: bookingsByDay.map(r => ({
        date: r.date,
        count: Number(r.count),
      })),
      revenueByDay: revenueByDay.map(r => ({
        date: r.date,
        total: Number(r.total) || 0,
      })),
      leadConversion: {
        total: Number(leadStats?.total) || 0,
        converted: Number(leadStats?.converted) || 0,
        rate:
          leadStats?.total && Number(leadStats.total) > 0
            ? Math.round(
                (Number(leadStats.converted) / Number(leadStats.total)) * 100
              )
            : 0,
      },
      upcomingTours,
      pendingBookings: Number(pendingCount?.count) || 0,
      newLeads: Number(newLeadsCount?.count) || 0,
    };
  }),
  badgeCounts: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        crm: 0,
        bookings: 0,
        calendar: 0,
        leads: 0,
        reviews: 0,
        blog: 0,
      };
    }
    const now = /* @__PURE__ */ new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    const tomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1e3);
    const [pendingBookings] = await db
      .select({ count: count2() })
      .from(bookings)
      .where(eq22(bookings.status, "pending"));
    const [newLeads] = await db
      .select({ count: count2() })
      .from(leads)
      .where(eq22(leads.status, "new"));
    const [pendingReviews] = await db
      .select({ count: count2() })
      .from(reviews)
      .where(eq22(reviews.isApproved, 0));
    const [draftPosts] = await db
      .select({ count: count2() })
      .from(blogPosts)
      .where(eq22(blogPosts.isPublished, 0));
    const [newCustomers] = await db
      .select({ count: count2() })
      .from(customers)
      .where(gte3(customers.createdAt, weekAgo));
    const [todayTours] = await db
      .select({ count: count2() })
      .from(bookings)
      .where(
        and10(
          gte3(bookings.arrivalDate, sql17`CURDATE()`),
          lte2(bookings.arrivalDate, tomorrow),
          sql17`${bookings.status} IN ('confirmed', 'in_progress')`
        )
      );
    return {
      crm: Number(newCustomers?.count) || 0,
      bookings: Number(pendingBookings?.count) || 0,
      calendar: Number(todayTours?.count) || 0,
      leads: Number(newLeads?.count) || 0,
      reviews: Number(pendingReviews?.count) || 0,
      blog: Number(draftPosts?.count) || 0,
    };
  }),
});

// server/routes/stats.ts
import { formatDistanceToNow } from "date-fns";
var statsRouter = router({
  public: securePublicProcedure.query(async () => {
    return await getPublicStats();
  }),
  recentBookings: securePublicProcedure.query(async () => {
    const rows = await getRecentBookings(5);
    return rows.map(r => ({
      firstName: r.firstName,
      tourName: r.tourName,
      timeAgo: formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }),
    }));
  }),
});

// server/routes/bookingDraft.ts
import { z as z17 } from "zod";
import crypto from "crypto";

// server/abandonedBookingEmail.ts
import { Resend as Resend4 } from "resend";
var _resend5 = null;
function getResend5() {
  if (!_resend5 && process.env.RESEND_API_KEY) {
    _resend5 = new Resend4(process.env.RESEND_API_KEY);
  }
  return _resend5;
}
var SITE_URL = process.env.SITE_URL || "https://www.wiro4x4indochina.com";
async function sendBookingRecoveryEmail(email, name, resumeToken) {
  const resend = getResend5();
  if (!resend) {
    console.warn(
      "[AbandonedBooking] Resend API key not configured, skipping email"
    );
    return false;
  }
  const resumeLink = `${SITE_URL}/book?token=${resumeToken}`;
  try {
    const { error } = await resend.emails.send({
      from: "WIRO 4x4 <updates@wiro4x4indochina.com>",
      to: email,
      subject: "Complete your WIRO 4x4 booking",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi ${name || "there"},</p>
          <p>You started booking a tour with us but didn't finish. Your details are saved!</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${resumeLink}" style="background:#D4AF37;color:#1C1C1C;padding:12px 24px;text-decoration:none;border-radius:99px;font-weight:bold;display:inline-block;">
              Continue Booking
            </a>
          </p>
          <p>Or reply to this email if you have any questions.</p>
          <p>\u2014 WIRO 4x4 Team</p>
        </div>
      `,
    });
    if (error) {
      console.error("[AbandonedBooking] Failed to send recovery email:", error);
      captureException(error);
      return false;
    }
    console.log("[AbandonedBooking] Recovery email sent to", email);
    return true;
  } catch (error) {
    console.error("[AbandonedBooking] Error sending recovery email:", error);
    captureException(error);
    return false;
  }
}

// server/routes/bookingDraft.ts
var bookingDraftRouter = router({
  save: securePublicProcedure
    .input(bookingDraftInputSchema)
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers["x-forwarded-for"] ||
        ctx.req.headers["x-real-ip"] ||
        "unknown";
      const { allowed } = checkRateLimit(`bookingDraft:${ip}`, 10, 6e4);
      if (!allowed) {
        throw new TRPCError3({
          code: "TOO_MANY_REQUESTS",
          message:
            "Too many draft save requests. Please try again in a minute.",
        });
      }
      const resumeToken = crypto.randomBytes(32).toString("hex");
      const id = await createBookingDraft({
        ...input,
        resumeToken,
      });
      return { id, resumeToken };
    }),
  getByToken: securePublicProcedure
    .input(z17.object({ token: z17.string().min(1) }))
    .query(async ({ input }) => {
      const draft = await getBookingDraftByToken(input.token);
      if (!draft || draft.status !== "active") return null;
      return draft;
    }),
  listActive: secureProtectedProcedure.query(async () => {
    return await listActiveBookingDrafts();
  }),
  updateStatus: secureProtectedProcedure
    .input(
      z17.object({
        id: z17.number(),
        status: z17.enum(["active", "converted", "expired"]),
        convertedToBookingId: z17.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateBookingDraftStatus(
        input.id,
        input.status,
        input.convertedToBookingId
      );
      return { success: true };
    }),
  sendRecoveryEmail: secureProtectedProcedure
    .input(z17.object({ draftId: z17.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const drafts = await listActiveBookingDrafts();
      const draft = drafts.find(d => d.id === input.draftId);
      if (!draft?.contactEmail) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "No email for this draft",
        });
      }
      const sent = await sendBookingRecoveryEmail(
        draft.contactEmail,
        draft.contactName || "",
        draft.resumeToken
      );
      return { sent };
    }),
});

// server/routes/analytics.ts
import { count as count3, gte as gte4 } from "drizzle-orm";
var analyticsRouter = router({
  funnelData: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { steps: [], conversionRate: 0 };
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const [completedResult] = await db
      .select({ count: count3() })
      .from(bookings)
      .where(gte4(bookings.createdAt, thirtyDaysAgo));
    const [draftsResult] = await db
      .select({ count: count3() })
      .from(bookingDrafts)
      .where(gte4(bookingDrafts.createdAt, thirtyDaysAgo));
    const completed = completedResult?.count ?? 0;
    const abandoned = draftsResult?.count ?? 0;
    const started = completed + abandoned;
    return {
      steps: [
        {
          name: "Bookings Started",
          nameHe:
            "\u05D4\u05D6\u05DE\u05E0\u05D5\u05EA \u05D4\u05EA\u05D7\u05D9\u05DC\u05D5",
          count: started,
        },
        {
          name: "Completed",
          nameHe: "\u05D4\u05D5\u05E9\u05DC\u05DE\u05D5",
          count: completed,
        },
        {
          name: "Abandoned",
          nameHe: "\u05E0\u05E0\u05D8\u05E9\u05D5",
          count: abandoned,
        },
      ],
      conversionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
    };
  }),
});

// server/routes/package.ts
import { z as z18 } from "zod";

// shared/pricing.ts
var PACKAGE_DISCOUNTS = {
  2: 0.1,
  3: 0.15,
  4: 0.2,
  5: 0.25,
};
function calculatePackageDiscount(tourCount, tourTotal, overridePercent) {
  const decimalDiscount =
    overridePercent != null
      ? overridePercent / 100
      : (PACKAGE_DISCOUNTS[tourCount] ?? 0);
  const discountPercent = Math.round(decimalDiscount * 100);
  const savings = Math.round(tourTotal * decimalDiscount);
  const discountedPrice = tourTotal - savings;
  return { discountedPrice, savings, discountPercent };
}

// server/routes/package.ts
function generateSlug2(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function resolvePackage(pkg, toursMap) {
  const tourSlugs = JSON.parse(pkg.tourSlugs);
  const resolvedTours = tourSlugs
    .map(slug => toursMap.get(slug))
    .filter(t2 => t2 != null);
  const originalPrice = resolvedTours.reduce((sum2, t2) => sum2 + t2.price, 0);
  const { discountedPrice, savings, discountPercent } =
    calculatePackageDiscount(
      resolvedTours.length,
      originalPrice,
      pkg.discountPercent ?? void 0
    );
  return {
    ...pkg,
    tourSlugs,
    resolvedTours,
    originalPrice,
    discountedPrice,
    savings,
    discountPercent,
  };
}
var packageRouter = router({
  /** Public: list published packages with resolved tour data + pricing */
  list: securePublicProcedure.query(async () => {
    const [packages, tours2] = await Promise.all([
      getPublishedTourPackages(),
      getAllActiveTours(),
    ]);
    const toursMap = new Map(tours2.map(t2 => [t2.slug, t2]));
    return packages.map(pkg => resolvePackage(pkg, toursMap));
  }),
  /** Public: single package by slug */
  getBySlug: securePublicProcedure
    .input(z18.object({ slug: z18.string() }))
    .query(async ({ input }) => {
      const pkg = await getTourPackageBySlug(input.slug);
      if (!pkg) return void 0;
      const tours2 = await getAllActiveTours();
      const toursMap = new Map(tours2.map(t2 => [t2.slug, t2]));
      return resolvePackage(pkg, toursMap);
    }),
  /** Admin: list all packages including unpublished */
  listAll: secureProtectedProcedure.query(async () => {
    const [packages, tours2] = await Promise.all([
      getAllTourPackages(),
      getAllActiveTours(),
    ]);
    const toursMap = new Map(tours2.map(t2 => [t2.slug, t2]));
    return packages.map(pkg => resolvePackage(pkg, toursMap));
  }),
  /** Admin: create a package */
  create: secureProtectedProcedure
    .input(tourPackageInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const slug = input.slug || generateSlug2(input.name);
      await createTourPackage({
        name: input.name,
        nameHe: input.nameHe,
        slug,
        description: input.description ?? null,
        descriptionHe: input.descriptionHe ?? null,
        tourSlugs: JSON.stringify(input.tourSlugs),
        discountPercent: input.discountPercent ?? null,
        coverImage: input.coverImage ?? null,
        isPublished: input.isPublished ? 1 : 0,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "tourPackage",
        newValue: JSON.stringify({ name: input.name }),
      });
      return { success: true, message: "Package created successfully" };
    }),
  /** Admin: update a package */
  update: secureProtectedProcedure
    .input(
      z18.object({
        id: z18.number(),
        data: tourPackageInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData = {};
      const fields = [
        "name",
        "nameHe",
        "slug",
        "description",
        "descriptionHe",
        "coverImage",
      ];
      for (const field of fields) {
        if (input.data[field] !== void 0) updateData[field] = input.data[field];
      }
      if (input.data.tourSlugs !== void 0)
        updateData.tourSlugs = JSON.stringify(input.data.tourSlugs);
      if (input.data.discountPercent !== void 0)
        updateData.discountPercent = input.data.discountPercent;
      if (input.data.isPublished !== void 0)
        updateData.isPublished = input.data.isPublished ? 1 : 0;
      await updateTourPackage(input.id, updateData);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tourPackage",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),
  /** Admin: delete a package */
  delete: secureProtectedProcedure
    .input(z18.object({ id: z18.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteTourPackage(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "tourPackage",
        resourceId: input.id,
      });
      return { success: true };
    }),
});

// server/routes/accounting.ts
import { z as z19 } from "zod";

// shared/accounting.ts
function generateInvoiceNumber(prefix, date, sequence) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `${prefix}-${yyyy}${mm}-${seq}`;
}
function calculateDepreciation(purchaseCost, usefulLifeMonths, opts) {
  const monthlyAmount = Math.round(purchaseCost / usefulLifeMonths);
  const elapsed = opts?.monthsElapsed ?? 0;
  const depreciated = monthlyAmount * elapsed;
  const currentValue = Math.max(0, purchaseCost - depreciated);
  return {
    monthlyAmount,
    annualAmount: monthlyAmount * 12,
    currentValue,
  };
}

// server/routes/accounting.ts
var INVOICE_PREFIX = {
  tax_invoice: "INV",
  receipt: "RCP",
  wht_certificate: "WHT",
};
var accountingRouter = router({
  // ── Invoices ────────────────────────────────────────────────
  createInvoice: secureProtectedProcedure
    .input(invoiceInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const prefix = INVOICE_PREFIX[input.type];
      const now = /* @__PURE__ */ new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yearMonth = `${yyyy}${mm}`;
      const sequence = await getNextInvoiceSequence(prefix, yearMonth);
      const invoiceNumber = generateInvoiceNumber(prefix, now, sequence);
      await createInvoice({ ...input, invoiceNumber });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "invoice",
        newValue: JSON.stringify({ ...input, invoiceNumber }),
      });
      return { success: true, invoiceNumber };
    }),
  listInvoices: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllInvoicesPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),
  getInvoice: secureProtectedProcedure
    .input(z19.object({ id: z19.number() }))
    .query(async ({ input }) => {
      return await getInvoiceById(input.id);
    }),
  updateInvoiceStatus: secureProtectedProcedure
    .input(
      z19.object({
        id: z19.number(),
        status: z19.enum(["unpaid", "paid", "partial", "cancelled"]),
        paymentDate: z19.string().optional(),
        paymentMethod: z19.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const paymentDate = input.paymentDate
        ? new Date(input.paymentDate)
        : void 0;
      await updateInvoiceStatus(
        input.id,
        input.status,
        paymentDate,
        input.paymentMethod
      );
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "invoice",
        resourceId: input.id,
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),
  // ── Journal Entries ─────────────────────────────────────────
  recordEntry: secureProtectedProcedure
    .input(accountingEntryInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const createdBy = ctx.user?.email ?? "system";
      await createAccountingEntry({ ...input, createdBy });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "accounting_entry",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),
  listEntries: secureProtectedProcedure
    .input(
      paginationInput.extend({
        accountCode: z19.string().optional(),
        startDate: z19.string().optional(),
        endDate: z19.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, accountCode, startDate, endDate } = input;
      const { items, total } = await getAccountingEntriesPaginated(
        page,
        pageSize,
        { accountCode, startDate, endDate }
      );
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),
  trialBalance: secureProtectedProcedure.query(async () => {
    return await getTrialBalance();
  }),
  // ── Tax Filings ─────────────────────────────────────────────
  createFiling: secureProtectedProcedure
    .input(taxFilingInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await createTaxFiling(input);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "tax_filing",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),
  listFilings: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllTaxFilingsPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),
  markFiled: secureProtectedProcedure
    .input(
      z19.object({
        id: z19.number(),
        status: z19.enum(["pending", "prepared", "filed", "late"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const filedAt =
        input.status === "filed" ? /* @__PURE__ */ new Date() : void 0;
      await updateTaxFilingStatus(input.id, input.status, filedAt);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tax_filing",
        resourceId: input.id,
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),
  upcomingDeadlines: secureProtectedProcedure.query(async () => {
    return await getUpcomingFilings();
  }),
});

// server/routes/inventory.ts
import { z as z20 } from "zod";
var inventoryRouter = router({
  create: secureProtectedProcedure
    .input(inventoryInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      let monthlyDepreciation;
      let currentValue;
      if (input.purchaseCost && input.usefulLifeMonths) {
        const dep = calculateDepreciation(
          input.purchaseCost,
          input.usefulLifeMonths
        );
        monthlyDepreciation = dep.monthlyAmount;
        currentValue = input.currentValue ?? dep.currentValue;
      }
      await createInventoryItem({
        ...input,
        monthlyDepreciation,
        currentValue,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "inventory",
        newValue: JSON.stringify(input),
      });
      return { success: true };
    }),
  list: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllInventoryPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),
  get: secureProtectedProcedure
    .input(z20.object({ id: z20.number() }))
    .query(async ({ input }) => {
      return await getInventoryById(input.id);
    }),
  update: secureProtectedProcedure
    .input(
      z20.object({
        id: z20.number(),
        data: inventoryInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await updateInventoryItem(input.id, input.data);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "inventory",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),
  delete: secureProtectedProcedure
    .input(z20.object({ id: z20.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteInventoryItem(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "inventory",
        resourceId: input.id,
      });
      return { success: true };
    }),
  summary: secureProtectedProcedure.query(async () => {
    return await getInventorySummary();
  }),
});

// server/estimateEmailService.ts
import { Resend as Resend5 } from "resend";
var resendClient2 = null;
function getResendClient2() {
  if (!resendClient2 && process.env.RESEND_API_KEY) {
    resendClient2 = new Resend5(process.env.RESEND_API_KEY);
  }
  return resendClient2;
}
async function sendEstimateEmail({ toEmail, estimateData }) {
  const client = getResendClient2();
  if (!client) {
    console.warn(
      "[Estimate Email] Resend API key not configured - skipping estimate email"
    );
    return;
  }
  const {
    selectedTours,
    adults,
    children,
    arrivalDate,
    departureDate,
    total,
    language,
  } = estimateData;
  const isHebrew = language === "he";
  const tourList = selectedTours
    .map(
      t2 =>
        `  - ${isHebrew ? t2.nameHe : t2.nameEn} (\u0E3F${t2.basePrice.toLocaleString()})`
    )
    .join("\n");
  const services = [];
  if (estimateData.includesHotels)
    services.push(isHebrew ? "\u05DE\u05DC\u05D5\u05E0\u05D5\u05EA" : "Hotels");
  if (estimateData.includesFood)
    services.push(
      isHebrew
        ? "\u05D0\u05E8\u05D5\u05D7\u05D5\u05EA \u05DB\u05E9\u05E8\u05D5\u05EA"
        : "Kosher Meals"
    );
  if (estimateData.includesAttractions)
    services.push(
      isHebrew
        ? `${estimateData.attractionCount} \u05D0\u05D8\u05E8\u05E7\u05E6\u05D9\u05D5\u05EA`
        : `${estimateData.attractionCount} Attractions`
    );
  if (estimateData.needsShabbatHotel)
    services.push(
      isHebrew ? "\u05DE\u05DC\u05D5\u05DF \u05E9\u05D1\u05EA" : "Shabbat Hotel"
    );
  const subject = isHebrew
    ? `\u05D4\u05E2\u05E8\u05DB\u05EA \u05DE\u05D7\u05D9\u05E8 \u05DC\u05D8\u05D9\u05D5\u05DC - WIRO 4x4`
    : `Your Trip Estimate - WIRO 4x4`;
  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
          .section { margin: 20px 0; }
          .section h2 { color: #2d5016; font-size: 18px; border-bottom: 2px solid #f5a623; padding-bottom: 5px; }
          .tour-list { background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-line; }
          .info-row { margin: 10px 0; }
          .info-label { font-weight: bold; color: #2d5016; }
          .total { background: #fff3cd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #f5a623; }
          .total-amount { font-size: 36px; font-weight: bold; color: #2d5016; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
          .cta { background: #4a7c2c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .note { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #555; border-left: 4px solid #4a7c2c; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isHebrew ? "\u{1F699} \u05D4\u05E2\u05E8\u05DB\u05EA \u05DE\u05D7\u05D9\u05E8 \u05DC\u05D8\u05D9\u05D5\u05DC \u05E9\u05DC\u05DA" : "\u{1F699} Your Trip Estimate"}</h1>
            <p>${isHebrew ? "WIRO 4x4 - \u05D4\u05E8\u05E4\u05EA\u05E7\u05D0\u05D5\u05EA \u05D0\u05D5\u05E4-\u05E8\u05D5\u05D3 \u05DB\u05E9\u05E8\u05D5\u05EA" : "WIRO 4x4 - Kosher Off-Road Adventures"}</p>
          </div>

          <div class="content">
            <div class="section">
              <h2>${isHebrew ? "\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05E0\u05D1\u05D7\u05E8\u05D9\u05DD" : "Selected Tours"}</h2>
              <div class="tour-list">${tourList}</div>
            </div>

            <div class="section">
              <h2>${isHebrew ? "\u05E4\u05E8\u05D8\u05D9 \u05E7\u05D1\u05D5\u05E6\u05D4" : "Group Details"}</h2>
              <div class="info-row">
                <span class="info-label">${isHebrew ? "\u05DE\u05D1\u05D5\u05D2\u05E8\u05D9\u05DD" : "Adults"}:</span> ${adults}
              </div>
              <div class="info-row">
                <span class="info-label">${isHebrew ? "\u05D9\u05DC\u05D3\u05D9\u05DD" : "Children"}:</span> ${children.length} ${children.length > 0 ? `(${isHebrew ? "\u05D2\u05D9\u05DC\u05D0\u05D9\u05DD" : "ages"}: ${children.join(", ")})` : ""}
              </div>
            </div>

            <div class="section">
              <h2>${isHebrew ? "\u05EA\u05D0\u05E8\u05D9\u05DB\u05D9\u05DD" : "Dates"}</h2>
              <div class="info-row">
                <span class="info-label">${isHebrew ? "\u05D4\u05D2\u05E2\u05D4" : "Arrival"}:</span> ${arrivalDate}
              </div>
              <div class="info-row">
                <span class="info-label">${isHebrew ? "\u05D9\u05E6\u05D9\u05D0\u05D4" : "Departure"}:</span> ${departureDate}
              </div>
            </div>

            ${
              services.length > 0
                ? `
              <div class="section">
                <h2>${isHebrew ? "\u05E9\u05D9\u05E8\u05D5\u05EA\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD" : "Additional Services"}</h2>
                <ul>
                  ${services.map(s => `<li>${s}</li>`).join("")}
                </ul>
              </div>
            `
                : ""
            }

            <div class="total">
              <div>${isHebrew ? "\u05E1\u05D4\u05F4\u05DB \u05DE\u05E9\u05D5\u05E2\u05E8" : "Estimated Total"}</div>
              <div class="total-amount">\u0E3F${total.toLocaleString()}</div>
            </div>

            <div style="text-align: center;">
              <a href="https://wa.me/66929894495?text=${encodeURIComponent(
                isHebrew
                  ? `\u05E9\u05DC\u05D5\u05DD! \u05E7\u05D9\u05D1\u05DC\u05EA\u05D9 \u05D0\u05EA \u05D4\u05E2\u05E8\u05DB\u05EA \u05D4\u05DE\u05D7\u05D9\u05E8 \u05DC-${total.toLocaleString()} \u05D1\u05D0\u05D8. \u05D0\u05E9\u05DE\u05D7 \u05DC\u05E4\u05E8\u05D8\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD.`
                  : `Hello! I received the estimate for \u0E3F${total.toLocaleString()}. I'd like more details.`
              )}" class="cta">
                ${isHebrew ? "\u{1F4F1} \u05E6\u05D5\u05E8 \u05E7\u05E9\u05E8 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4" : "\u{1F4F1} Contact Us on WhatsApp"}
              </a>
            </div>

            <div class="note">
              ${isHebrew ? "\u{1F4A1} \u05D4\u05D4\u05E2\u05E8\u05DB\u05D4 \u05EA\u05E7\u05E4\u05D4 \u05DC-7 \u05D9\u05DE\u05D9\u05DD. \u05DE\u05D7\u05D9\u05E8\u05D9\u05DD \u05E2\u05E9\u05D5\u05D9\u05D9\u05DD \u05DC\u05D4\u05E9\u05EA\u05E0\u05D5\u05EA \u05D1\u05D4\u05EA\u05D0\u05DD \u05DC\u05E2\u05D5\u05E0\u05D4 \u05D5\u05DC\u05D6\u05DE\u05D9\u05E0\u05D5\u05EA. \u05E6\u05E8\u05D5 \u05D0\u05D9\u05EA\u05E0\u05D5 \u05E7\u05E9\u05E8 \u05DC\u05E7\u05D1\u05DC\u05EA \u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 \u05DE\u05D3\u05D5\u05D9\u05E7\u05EA." : "\u{1F4A1} This estimate is valid for 7 days. Prices may vary based on season and availability. Contact us for a detailed quote."}
            </div>
          </div>

          <div class="footer">
            <p><strong>WIRO 4x4 - Kosher Off-Road Adventures</strong></p>
            <p>${isHebrew ? "\u{1F4DE} \u05D8\u05DC\u05E4\u05D5\u05DF/\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4" : "\u{1F4DE} Phone/WhatsApp"}: +66 92-989-4495</p>
            <p>${isHebrew ? "\u{1F4E7} \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC" : "\u{1F4E7} Email"}: ${COMPANY_SENDER_EMAIL}</p>
            <p style="margin-top: 15px; font-size: 12px;">
              ${isHebrew ? "\u05E6'\u05D9\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9, \u05EA\u05D0\u05D9\u05DC\u05E0\u05D3 | www.wiro4x4indochina.com" : "Chiang Mai, Thailand | www.wiro4x4indochina.com"}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  try {
    await client.emails.send({
      from: `WIRO 4x4 <${COMPANY_SENDER_EMAIL}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    console.log(`[Estimate Email] Sent estimate to ${toEmail} (${language})`);
  } catch (error) {
    console.error("[Estimate Email] Failed to send:", error);
    captureException(error);
    throw error;
  }
}

// server/routes/estimate.ts
var estimateRouter = router({
  sendEmail: securePublicProcedure
    .input(estimateEmailInputSchema)
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req.headers["x-forwarded-for"] ||
        ctx.req.headers["x-real-ip"] ||
        "unknown";
      const { allowed } = checkRateLimit(`estimate-email:${ip}`, 3, 6e4);
      if (!allowed) {
        throw new TRPCError3({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }
      await sendEstimateEmail({
        toEmail: input.email,
        estimateData: input,
      });
      return { success: true };
    }),
});

// server/stripeSessionChecker.ts
var FIVE_MINUTES_MS = 5 * 60 * 1e3;
var _intervalId = null;
function startSessionChecker(intervalMs = 3e5) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log(
      "[SessionChecker] STRIPE_SECRET_KEY not set \u2014 checker disabled"
    );
    return;
  }
  if (_intervalId) {
    return;
  }
  console.log(
    `[SessionChecker] Starting background checker (interval: ${intervalMs / 1e3}s)`
  );
  _intervalId = setInterval(async () => {
    try {
      const pendingPayments = await getAllPendingPayments();
      const now = Date.now();
      const eligiblePayments = pendingPayments.filter(p => {
        if (!p.createdAt) return false;
        const createdTime = new Date(p.createdAt).getTime();
        return now - createdTime > FIVE_MINUTES_MS;
      });
      if (eligiblePayments.length === 0) {
        return;
      }
      console.log(
        `[SessionChecker] Checking ${eligiblePayments.length} pending payment(s)...`
      );
      let completed = 0;
      for (const payment of eligiblePayments) {
        if (!payment.stripeSessionId) continue;
        try {
          const result = await verifyAndCompleteSession(
            payment.stripeSessionId
          );
          if (result.paymentStatus === "paid" && !result.alreadyCompleted) {
            completed++;
          }
        } catch (err) {
          console.error(
            `[SessionChecker] Error checking payment #${payment.id}:`,
            err
          );
        }
      }
      console.log(
        `[SessionChecker] Checked ${eligiblePayments.length} pending payments, ${completed} completed`
      );
    } catch (err) {
      console.error("[SessionChecker] Error in session checker loop:", err);
    }
  }, intervalMs);
}

// server/reminderScheduler.ts
var ONE_HOUR = 60 * 60 * 1e3;
async function checkStaleLeads() {
  try {
    const staleLeads = await getStaleNewLeads();
    for (const lead of staleLeads) {
      console.warn(
        `[LeadFollowup] Lead ${lead.name} (${lead.email}) has been new for 48h+`
      );
    }
    return staleLeads.length;
  } catch (err) {
    console.error("[LeadFollowup] Failed to check stale leads:", err);
    captureException(err);
    return 0;
  }
}
async function checkColdLeads() {
  try {
    const coldLeads = await getColdContactedLeads();
    for (const lead of coldLeads) {
      console.warn(
        `[LeadFollowup] Cold lead ${lead.name} (${lead.email}) \u2014 contacted but no update for 5+ days`
      );
    }
    return coldLeads.length;
  } catch (err) {
    console.error("[LeadFollowup] Failed to check cold leads:", err);
    captureException(err);
    return 0;
  }
}
async function checkMaintenanceAlerts() {
  try {
    const items = await getInventoryNeedingMaintenance(7);
    for (const item of items) {
      const dateStr = item.nextMaintenanceDate
        ? item.nextMaintenanceDate.toISOString().split("T")[0]
        : "unknown";
      console.warn(
        `[Maintenance] ${item.name} due for maintenance on ${dateStr}`
      );
    }
    return items.length;
  } catch (err) {
    console.error("[Maintenance] Failed to check maintenance alerts:", err);
    captureException(err);
    return 0;
  }
}
async function checkOverdueTasks() {
  try {
    const tasks = await getOverdueTasks();
    for (const task of tasks) {
      const dueStr = task.dueDate
        ? task.dueDate.toISOString().split("T")[0]
        : "no date";
      console.warn(
        `[CRM] Overdue task: ${task.type} for customer ${task.customerId}, due ${dueStr}`
      );
    }
    return tasks.length;
  } catch (err) {
    console.error("[CRM] Failed to check overdue tasks:", err);
    captureException(err);
    return 0;
  }
}
var _lastDailySummaryDate = null;
async function generateDailySummary() {
  const today = /* @__PURE__ */ new Date().toISOString().split("T")[0];
  if (_lastDailySummaryDate === today) return;
  const currentHour = /* @__PURE__ */ new Date().getUTCHours();
  if (currentHour !== 7 && _lastDailySummaryDate !== null) return;
  try {
    const [pendingBookings, newLeads, upcomingTours, pendingReviews] =
      await Promise.all([
        getPendingBookingCount(),
        getNewLeadCount(24),
        getUpcomingTourCount(48),
        getPendingReviewCount(),
      ]);
    console.log(
      `[DailySummary] Pending bookings: ${pendingBookings}, New leads: ${newLeads}, Upcoming tours: ${upcomingTours}, Pending reviews: ${pendingReviews}`
    );
    _lastDailySummaryDate = today;
  } catch (err) {
    console.error("[DailySummary] Failed to generate summary:", err);
    captureException(err);
  }
}
async function processReminders() {
  let remindersSent = 0;
  let feedbackSent = 0;
  let checked = 0;
  try {
    const needReminder = await getBookingsNeedingReminder();
    checked += needReminder.length;
    for (const booking of needReminder) {
      try {
        const success = await sendBookingReminder({
          customerName: booking.contactName,
          customerEmail: booking.contactEmail ?? "",
          tourDate: booking.arrivalDate?.toISOString() ?? "",
          tourType: "Custom Tour",
          groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
          pickupLocation: booking.pickupPoint,
          pickupTime: "08:00",
          specialRequests: booking.specialRequests ?? void 0,
          bookingId: `WIRO-${booking.id}`,
        });
        if (success) {
          await markReminderSent(booking.id);
          remindersSent++;
        }
      } catch (err) {
        console.error(
          `[Reminder Scheduler] Failed to send reminder for booking #${booking.id}:`,
          err
        );
        captureException(err);
      }
    }
    const needFeedback = await getBookingsNeedingFeedback();
    checked += needFeedback.length;
    for (const booking of needFeedback) {
      try {
        const success = await sendPostTourFeedback({
          customerName: booking.contactName,
          customerEmail: booking.contactEmail ?? "",
          tourDate: booking.departureDate?.toISOString() ?? "",
          tourType: "Custom Tour",
          groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
          pickupLocation: booking.pickupPoint,
          pickupTime: "08:00",
          specialRequests: booking.specialRequests ?? void 0,
          bookingId: `WIRO-${booking.id}`,
        });
        if (success) {
          await markFeedbackSent(booking.id);
          feedbackSent++;
        }
      } catch (err) {
        console.error(
          `[Reminder Scheduler] Failed to send feedback request for booking #${booking.id}:`,
          err
        );
        captureException(err);
      }
    }
  } catch (err) {
    console.error("[Reminder Scheduler] Error during processing:", err);
    captureException(err);
  }
  console.log(
    `[Reminder Scheduler] Checked ${checked} bookings, sent ${remindersSent} reminders, ${feedbackSent} feedback requests`
  );
}
async function hourlyTick() {
  await processReminders();
  const staleCount = await checkStaleLeads();
  const coldCount = await checkColdLeads();
  if (staleCount > 0 || coldCount > 0) {
    console.log(
      `[LeadFollowup] ${staleCount} stale leads, ${coldCount} cold leads found`
    );
  }
  await checkMaintenanceAlerts();
  await checkOverdueTasks();
  await generateDailySummary();
}
var _schedulerTimer = null;
function startReminderScheduler() {
  if (_schedulerTimer) return;
  console.log("[Reminder Scheduler] Starting (runs every hour)");
  setTimeout(() => {
    hourlyTick().catch(err => {
      console.error("[Reminder Scheduler] Initial run failed:", err);
      captureException(err);
    });
  }, 1e4);
  _schedulerTimer = setInterval(() => {
    hourlyTick().catch(err => {
      console.error("[Reminder Scheduler] Scheduled run failed:", err);
      captureException(err);
    });
  }, ONE_HOUR);
}

// server/routers.ts
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startSessionChecker();
  startReminderScheduler();
}
var appRouter = router({
  system: systemRouter,
  auth: authRouter,
  booking: bookingRouter,
  agent: agentRouter,
  lead: leadRouter,
  financial: financialRouter,
  gallery: galleryRouter,
  review: reviewRouter,
  payment: paymentRouter,
  tour: tourRouter,
  blog: blogRouter,
  newsletter: newsletterRouter,
  health: healthRouter,
  crm: crmRouter,
  admin: adminRouter,
  settings: settingsRouter,
  dashboard: dashboardRouter,
  stats: statsRouter,
  bookingDraft: bookingDraftRouter,
  analytics: analyticsRouter,
  package: packageRouter,
  accounting: accountingRouter,
  inventory: inventoryRouter,
  estimate: estimateRouter,
});

// server/_core/context.ts
import { parse as parseCookieHeader } from "cookie";
async function createContext(opts) {
  let user = null;
  try {
    const cookies = opts.req.headers.cookie
      ? parseCookieHeader(opts.req.headers.cookie)
      : {};
    const sessionCookie = cookies[COOKIE_NAME];
    if (sessionCookie) {
      const payload = await verifySession(sessionCookie);
      if (payload) {
        const dbUser = await getUserById(payload.userId);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    console.error("[Context] Auth error:", error);
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

// server/_core/app.ts
function createApp() {
  const app2 = express();
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerAuthRoutes(app2);
  registerRssRoute(app2);
  registerSitemapRoute(app2);
  app2.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app2;
}

// server/vercel-entry.ts
var app = createApp();
app.use(
  helmet({
    contentSecurityPolicy: false,
    // Permissive — tighten after auditing inline scripts
    crossOriginEmbedderPolicy: false,
    // Allow embedded images from S3/CDN
  })
);
var vercel_entry_default = app;
export { vercel_entry_default as default };
