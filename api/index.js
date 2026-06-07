var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __esm = (fn, res) =>
  function __init() {
    return (fn && (res = (0, fn[__getOwnPropNames(fn)[0]])((fn = 0))), res);
  };
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db/connection.ts
import { drizzle } from "drizzle-orm/mysql2";
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
var _db;
var init_connection = __esm({
  "server/db/connection.ts"() {
    "use strict";
    _db = null;
  },
});

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
var users,
  passwordResetTokens,
  bookings,
  bookingDrafts,
  agents,
  leads,
  financialRecords,
  galleryPhotos,
  reviews,
  payments,
  tours,
  tourPackages,
  blogPosts,
  auditLogs,
  subscribers,
  scheduledEmails,
  postTourReviewRequests,
  customers,
  customerActivities,
  chatSessions,
  chatMessages,
  settings,
  invoices,
  accountingEntries,
  taxFilings,
  inventory,
  tourAvailability,
  tripPhotoAlbums,
  tripPhotos,
  whatsappMessages,
  postTourReviewEvents;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
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
    passwordResetTokens = mysqlTable("passwordResetTokens", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      token: varchar("token", { length: 64 }).notNull().unique(),
      expiresAt: timestamp("expiresAt").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
    });
    bookings = mysqlTable(
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
        postTourEmailSentAt: timestamp("postTourEmailSentAt"),
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
        index("idx_bookings_status_createdAt").on(
          table.status,
          table.createdAt
        ),
      ]
    );
    bookingDrafts = mysqlTable("bookingDrafts", {
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
    agents = mysqlTable("agents", {
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
    leads = mysqlTable(
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
        scoreDetails: text("score_details"),
        // JSON string with scoring breakdown
        lastScoredAt: timestamp("last_scored_at"),
        // when score was last computed
        recoveryEmailSentAt: timestamp("recovery_email_sent_at"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      table => [
        index("idx_leads_convertedToBookingId").on(table.convertedToBookingId),
        index("idx_leads_status_createdAt").on(table.status, table.createdAt),
      ]
    );
    financialRecords = mysqlTable(
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
    galleryPhotos = mysqlTable("galleryPhotos", {
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
      // User-submitted photo fields
      uploadedBy: varchar("uploaded_by", { length: 255 }),
      uploadedByEmail: varchar("uploaded_by_email", { length: 255 }),
      isUserSubmitted: int("is_user_submitted").default(0),
      tourDate: varchar("tour_date", { length: 50 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    });
    reviews = mysqlTable("reviews", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId"),
      reviewRequestId: int("reviewRequestId"),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 320 }),
      rating: int("rating").notNull(),
      // 1-5
      title: varchar("title", { length: 255 }),
      text: text("text").notNull(),
      source: varchar("source", { length: 50 }).default("website"),
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
    payments = mysqlTable(
      "payments",
      {
        id: int("id").autoincrement().primaryKey(),
        bookingId: int("bookingId").notNull(),
        type: mysqlEnum("type", [
          "deposit",
          "balance",
          "full",
          "refund",
        ]).notNull(),
        amount: int("amount").notNull(),
        // in THB
        currency: varchar("currency", { length: 10 }).default("THB").notNull(),
        status: mysqlEnum("status", [
          "pending",
          "completed",
          "failed",
          "refunded",
        ])
          .default("pending")
          .notNull(),
        stripeSessionId: varchar("stripeSessionId", { length: 255 }),
        stripePaymentIntentId: varchar("stripePaymentIntentId", {
          length: 255,
        }),
        paymentMethod: varchar("paymentMethod", { length: 50 }),
        notes: text("notes"),
        paidAt: timestamp("paidAt"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      table => [index("idx_payments_bookingId").on(table.bookingId)]
    );
    tours = mysqlTable("tours", {
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
    tourPackages = mysqlTable("tourPackages", {
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
    blogPosts = mysqlTable(
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
    auditLogs = mysqlTable(
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
    subscribers = mysqlTable("subscribers", {
      id: int("id").autoincrement().primaryKey(),
      email: varchar("email", { length: 320 }).notNull().unique(),
      name: varchar("name", { length: 255 }),
      language: varchar("language", { length: 10 }).default("en"),
      subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
      isActive: int("isActive").default(1).notNull(),
    });
    scheduledEmails = mysqlTable(
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
        status: mysqlEnum("status", ["sent", "failed"])
          .default("sent")
          .notNull(),
      },
      table => [
        index("idx_scheduledEmails_type_targetId").on(
          table.type,
          table.targetId
        ),
      ]
    );
    postTourReviewRequests = mysqlTable(
      "postTourReviewRequests",
      {
        id: int("id").autoincrement().primaryKey(),
        bookingId: int("bookingId").notNull(),
        phoneNumber: varchar("phoneNumber", { length: 50 }).notNull(),
        customerName: varchar("customerName", { length: 255 }),
        language: mysqlEnum("language", ["en", "he"]).default("en").notNull(),
        status: mysqlEnum("status", [
          "scheduled",
          "sent",
          "opened",
          "clicked",
          "reviewed",
          "failed",
        ])
          .default("scheduled")
          .notNull(),
        scheduledAt: timestamp("scheduledAt").notNull(),
        sentAt: timestamp("sentAt"),
        openedAt: timestamp("openedAt"),
        clickedAt: timestamp("clickedAt"),
        reviewedAt: timestamp("reviewedAt"),
        rating: int("rating"),
        comments: text("comments"),
        whatsappMessageId: varchar("whatsappMessageId", { length: 255 }),
        reviewUrl: varchar("reviewUrl", { length: 1024 }),
        opsFollowUpUrl: varchar("opsFollowUpUrl", { length: 1024 }),
        escalatedAt: timestamp("escalatedAt"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      table => [
        index("idx_postTourReview_bookingId").on(table.bookingId),
        index("idx_postTourReview_status_scheduledAt").on(
          table.status,
          table.scheduledAt
        ),
        index("idx_postTourReview_whatsappMessageId").on(
          table.whatsappMessageId
        ),
      ]
    );
    customers = mysqlTable(
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
    customerActivities = mysqlTable(
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
    chatSessions = mysqlTable(
      "chatSessions",
      {
        id: int("id").autoincrement().primaryKey(),
        visitorId: varchar("visitorId", { length: 64 }).notNull(),
        language: mysqlEnum("language", ["en", "he"]).default("en").notNull(),
        mode: mysqlEnum("mode", ["ai", "human", "closed"])
          .default("ai")
          .notNull(),
        summary: text("summary"),
        bookingContext: text("bookingContext"),
        // JSON string
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        closedAt: timestamp("closedAt"),
      },
      table => [index("idx_chatSessions_visitorId").on(table.visitorId)]
    );
    chatMessages = mysqlTable(
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
    settings = mysqlTable("settings", {
      id: int("id").primaryKey().autoincrement(),
      key: varchar("key", { length: 100 }).notNull().unique(),
      value: json("value").notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
    });
    invoices = mysqlTable(
      "invoices",
      {
        id: int("id").autoincrement().primaryKey(),
        invoiceNumber: varchar("invoiceNumber", { length: 50 })
          .notNull()
          .unique(),
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
    accountingEntries = mysqlTable(
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
    taxFilings = mysqlTable("taxFilings", {
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
    inventory = mysqlTable("inventory", {
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
      condition: mysqlEnum("condition", [
        "new",
        "good",
        "fair",
        "poor",
        "retired",
      ])
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
    tourAvailability = mysqlTable(
      "tourAvailability",
      {
        id: int("id").autoincrement().primaryKey(),
        tourId: int("tourId").notNull(),
        date: varchar("date", { length: 10 }).notNull(),
        // YYYY-MM-DD
        maxSlots: int("maxSlots").default(10).notNull(),
        bookedSlots: int("bookedSlots").default(0).notNull(),
        isBlocked: int("isBlocked").default(0).notNull(),
        // boolean as int
        notes: text("notes"),
        // e.g., "Shabbat", "Holiday"
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      table => [
        index("idx_tourAvailability_tourId_date").on(table.tourId, table.date),
      ]
    );
    tripPhotoAlbums = mysqlTable(
      "tripPhotoAlbums",
      {
        id: int("id").autoincrement().primaryKey(),
        bookingId: int("bookingId").notNull(),
        accessToken: varchar("accessToken", { length: 64 }).notNull().unique(),
        title: varchar("title", { length: 255 }).notNull(),
        message: text("message"),
        // personal message from guide
        isActive: int("isActive").default(1).notNull(),
        expiresAt: timestamp("expiresAt"),
        // optional expiry
        viewCount: int("viewCount").default(0).notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      table => [
        index("idx_tripPhotoAlbums_bookingId").on(table.bookingId),
        index("idx_tripPhotoAlbums_accessToken").on(table.accessToken),
      ]
    );
    tripPhotos = mysqlTable(
      "tripPhotos",
      {
        id: int("id").autoincrement().primaryKey(),
        albumId: int("albumId").notNull(),
        s3Key: varchar("s3Key", { length: 512 }).notNull(),
        s3Url: varchar("s3Url", { length: 1024 }).notNull(),
        caption: varchar("caption", { length: 500 }),
        sortOrder: int("sortOrder").default(0).notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
      },
      table => [index("idx_tripPhotos_albumId").on(table.albumId)]
    );
    whatsappMessages = mysqlTable(
      "whatsappMessages",
      {
        id: int("id").autoincrement().primaryKey(),
        direction: mysqlEnum("direction", ["incoming", "outgoing"]).notNull(),
        phoneNumber: varchar("phoneNumber", { length: 50 }).notNull(),
        customerName: varchar("customerName", { length: 255 }),
        messageText: text("messageText").notNull(),
        messageType: mysqlEnum("messageType", [
          "text",
          "template",
          "auto-reply",
        ]).notNull(),
        isAutoReply: int("isAutoReply").default(0).notNull(),
        status: mysqlEnum("status", ["sent", "delivered", "read", "failed"])
          .default("sent")
          .notNull(),
        whatsappMessageId: varchar("whatsappMessageId", { length: 255 }),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
      },
      table => [
        index("idx_whatsappMessages_phoneNumber").on(table.phoneNumber),
        index("idx_whatsappMessages_direction_createdAt").on(
          table.direction,
          table.createdAt
        ),
      ]
    );
    postTourReviewEvents = mysqlTable(
      "postTourReviewEvents",
      {
        id: int("id").autoincrement().primaryKey(),
        bookingId: int("bookingId"),
        channel: mysqlEnum("channel", ["whatsapp"])
          .notNull()
          .default("whatsapp"),
        state: mysqlEnum("state", [
          "request_sent",
          "response_received",
          "follow_up_sent",
        ]).notNull(),
        guestReference: varchar("guestReference", { length: 255 }).notNull(),
        guestPhone: varchar("guestPhone", { length: 50 }),
        guestName: varchar("guestName", { length: 255 }),
        externalMessageId: varchar("externalMessageId", { length: 255 }),
        dedupeKey: varchar("dedupeKey", { length: 255 }).notNull().unique(),
        metadata: json("metadata"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
      },
      table => [
        index("idx_postTourReviewEvents_bookingId_state").on(
          table.bookingId,
          table.state
        ),
        index("idx_postTourReviewEvents_guestReference").on(
          table.guestReference
        ),
        index("idx_postTourReviewEvents_externalMessageId").on(
          table.externalMessageId
        ),
      ]
    );
  },
});

// server/db/users.ts
import { eq } from "drizzle-orm";
import { desc, inArray } from "drizzle-orm";
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
var init_users = __esm({
  "server/db/users.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/bookings.ts
import { eq as eq2, and, sql, inArray as inArray2, lte } from "drizzle-orm";
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
async function getEligiblePostTourBookings(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(bookings)
    .where(
      and(
        eq2(bookings.status, "completed"),
        lte(bookings.departureDate, twoDaysAgo),
        sql`${bookings.postTourEmailSentAt} IS NULL`,
        sql`${bookings.contactEmail} IS NOT NULL`,
        sql`${bookings.contactEmail} != ''`
      )
    )
    .orderBy(desc2(bookings.departureDate))
    .limit(limit);
}
async function getEligiblePostTourCount() {
  const db = await getDb();
  if (!db) return 0;
  const now = /* @__PURE__ */ new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1e3);
  const result = await db
    .select({ count: sql`count(*)` })
    .from(bookings)
    .where(
      and(
        eq2(bookings.status, "completed"),
        lte(bookings.departureDate, twoDaysAgo),
        sql`${bookings.postTourEmailSentAt} IS NULL`,
        sql`${bookings.contactEmail} IS NOT NULL`,
        sql`${bookings.contactEmail} != ''`
      )
    );
  return Number(result[0]?.count ?? 0);
}
async function markPostTourEmailSent(bookingId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(bookings)
    .set({ postTourEmailSentAt: /* @__PURE__ */ new Date() })
    .where(eq2(bookings.id, bookingId));
}
async function getAlbumByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tripPhotoAlbums)
    .where(
      and(
        eq2(tripPhotoAlbums.bookingId, bookingId),
        eq2(tripPhotoAlbums.isActive, 1)
      )
    )
    .limit(1);
  return results[0] ?? null;
}
var init_bookings = __esm({
  "server/db/bookings.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

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
var init_agents = __esm({
  "server/db/agents.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

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
async function getLeadById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(leads)
    .where(eq4(leads.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
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
async function getLeadSlaBreaches(slaMinutes = 10) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - slaMinutes * 60 * 1e3);
  return await db
    .select()
    .from(leads)
    .where(sql3`${leads.status} = 'new' AND ${leads.createdAt} < ${cutoff}`)
    .orderBy(desc4(leads.createdAt));
}
async function getColdContactedLeads() {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(leads)
    .where(
      sql3`${leads.status} IN ('contacted', 'quoted') AND ${leads.updatedAt} < ${cutoff}`
    )
    .orderBy(desc4(leads.updatedAt));
}
async function getAbandonedLeads(hoursAgo = 24) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1e3);
  return await db
    .select()
    .from(leads)
    .where(sql3`${leads.status} = 'new' AND ${leads.createdAt} < ${cutoff}`)
    .orderBy(desc4(leads.createdAt));
}
async function markRecoveryEmailSent(leadId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(leads)
    .set({ recoveryEmailSentAt: /* @__PURE__ */ new Date() })
    .where(eq4(leads.id, leadId));
}
async function updateLeadScore(leadId, score, scoreDetails) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(leads)
    .set({
      score: Math.max(0, Math.min(100, Math.round(score))),
      ...(scoreDetails !== void 0 ? { scoreDetails } : {}),
      lastScoredAt: /* @__PURE__ */ new Date(),
    })
    .where(eq4(leads.id, leadId));
}
async function getLeadsByScore(minScore) {
  const db = await getDb();
  if (!db) return [];
  if (minScore !== void 0 && minScore > 0) {
    return await db
      .select()
      .from(leads)
      .where(sql3`${leads.score} >= ${minScore}`)
      .orderBy(desc4(leads.score));
  }
  return await db.select().from(leads).orderBy(desc4(leads.score));
}
async function getAllLeadsPaginatedByScore(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(leads)
    .orderBy(desc4(leads.score), desc4(leads.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db.select({ count: sql3`count(*)` }).from(leads);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
var init_leads = __esm({
  "server/db/leads.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

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
    .reduce((sum3, r) => sum3 + r.amount, 0);
  const costs = all
    .filter(r => r.type === "cost")
    .reduce((sum3, r) => sum3 + r.amount, 0);
  const refunds = all
    .filter(r => r.type === "refund")
    .reduce((sum3, r) => sum3 + r.amount, 0);
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
      matching.reduce((sum3, r) => sum3 + r.amount, 0) / matching.length
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
var init_financial = __esm({
  "server/db/financial.ts"() {
    "use strict";
    init_connection();
    init_schema();
    init_bookings();
  },
});

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
var init_gallery = __esm({
  "server/db/gallery.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

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
async function getReviewById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(reviews)
    .where(eq7(reviews.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
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
      ? all.reduce((sum3, r) => sum3 + r.rating, 0) / all.length
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
var init_reviews = __esm({
  "server/db/reviews.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

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
    totalAmount: all.reduce((sum3, p) => sum3 + p.amount, 0),
    completedAmount: completed.reduce((sum3, p) => sum3 + p.amount, 0),
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
var init_payments = __esm({
  "server/db/payments.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

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
async function getTourById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(tours)
    .where(eq9(tours.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
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
var init_tours = __esm({
  "server/db/tours.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

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
var init_packages = __esm({
  "server/db/packages.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/blog.ts
import { eq as eq11, sql as sql9, and as and5, lte as lte2 } from "drizzle-orm";
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
    .where(
      and5(
        eq11(blogPosts.isPublished, 1),
        lte2(blogPosts.publishedAt, sql9`NOW()`)
      )
    )
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
async function getPublishedBlogPostBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db
    .select()
    .from(blogPosts)
    .where(
      and5(
        eq11(blogPosts.slug, slug),
        eq11(blogPosts.isPublished, 1),
        lte2(blogPosts.publishedAt, sql9`NOW()`)
      )
    )
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
var init_blog = __esm({
  "server/db/blog.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

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
var init_subscribers = __esm({
  "server/db/subscribers.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/chat.ts
import { eq as eq13, and as and6, sql as sql10 } from "drizzle-orm";
import { desc as desc13 } from "drizzle-orm";
async function createChatSession(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(chatSessions)
    .values({ visitorId: data.visitorId, language: data.language })
    .$returningId();
  return result.id;
}
async function getChatSessionByVisitorId(visitorId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(chatSessions)
    .where(
      and6(
        eq13(chatSessions.visitorId, visitorId),
        sql10`${chatSessions.mode} != 'closed'`
      )
    )
    .orderBy(desc13(chatSessions.createdAt), desc13(chatSessions.id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getChatMessagesBySessionId(sessionId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(chatMessages)
    .where(eq13(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}
async function addChatMessage(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(chatMessages)
    .values({
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      metadata: data.metadata ?? null,
    })
    .$returningId();
  return result.id;
}
async function updateChatSessionMode(id, mode) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ mode })
    .where(eq13(chatSessions.id, id));
}
async function updateChatSessionSummary(id, summary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ summary })
    .where(eq13(chatSessions.id, id));
}
async function updateChatSessionBookingContext(id, bookingContext) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ bookingContext })
    .where(eq13(chatSessions.id, id));
}
async function closeChatSession(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(chatSessions)
    .set({ mode: "closed", closedAt: /* @__PURE__ */ new Date() })
    .where(eq13(chatSessions.id, id));
}
async function getAllChatSessionsPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(chatSessions)
    .orderBy(desc13(chatSessions.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql10`count(*)` })
    .from(chatSessions);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
var init_chat = __esm({
  "server/db/chat.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/customers.ts
import { eq as eq14 } from "drizzle-orm";
import { desc as desc14, sql as sql11 } from "drizzle-orm";
async function createCustomer(customer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return result;
}
async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc14(customers.updatedAt));
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
async function getCustomersByStage(stage) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customers)
    .where(eq14(customers.stage, stage))
    .orderBy(desc14(customers.updatedAt));
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
async function getPendingFollowUps() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customerActivities)
    .where(eq14(customerActivities.type, "follow_up"))
    .orderBy(customerActivities.dueDate);
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
var init_customers = __esm({
  "server/db/customers.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/audit.ts
import { eq as eq15, and as and7, gte, sql as sql12 } from "drizzle-orm";
async function logAdminAction(log) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditLogs).values(log);
  } catch (err) {
    console.error("[Audit] Failed to log action:", err);
  }
}
async function hasRecentAuditLog(input) {
  const db = await getDb();
  if (!db) return false;
  const resourceCondition =
    input.resourceId == null
      ? sql12`${auditLogs.resourceId} IS NULL`
      : eq15(auditLogs.resourceId, input.resourceId);
  const result = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .where(
      and7(
        eq15(auditLogs.action, input.action),
        eq15(auditLogs.resourceType, input.resourceType),
        resourceCondition,
        gte(auditLogs.createdAt, input.since)
      )
    )
    .limit(1);
  return result.length > 0;
}
async function createScheduledEmail(record) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(scheduledEmails).values(record);
}
async function hasScheduledEmailBeenSent(type, targetId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(scheduledEmails)
    .where(
      and7(
        eq15(scheduledEmails.type, type),
        eq15(scheduledEmails.targetId, targetId),
        eq15(scheduledEmails.status, "sent")
      )
    )
    .limit(1);
  return result.length > 0;
}
var init_audit = __esm({
  "server/db/audit.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/postTourReviewRequests.ts
import {
  and as and8,
  desc as desc15,
  eq as eq16,
  gte as gte2,
  lte as lte3,
  sql as sql13,
} from "drizzle-orm";
async function getPostTourReviewRequestByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq16(postTourReviewRequests.bookingId, bookingId))
    .limit(1);
  return result[0] ?? null;
}
async function createPostTourReviewRequest(request) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(postTourReviewRequests)
    .values(request)
    .$returningId();
  return result.id;
}
async function getDuePostTourReviewRequests(limit = 25) {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  return await db
    .select()
    .from(postTourReviewRequests)
    .where(
      and8(
        eq16(postTourReviewRequests.status, "scheduled"),
        lte3(postTourReviewRequests.scheduledAt, now)
      )
    )
    .orderBy(postTourReviewRequests.scheduledAt)
    .limit(limit);
}
async function getRecentPostTourReviewRequests(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(postTourReviewRequests)
    .orderBy(desc15(postTourReviewRequests.updatedAt))
    .limit(limit);
}
async function markPostTourReviewRequestSent(
  requestId,
  whatsappMessageId,
  reviewUrl
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(postTourReviewRequests)
    .set({
      status: "sent",
      sentAt: /* @__PURE__ */ new Date(),
      whatsappMessageId,
      reviewUrl,
    })
    .where(eq16(postTourReviewRequests.id, requestId));
}
async function markPostTourReviewRequestFailed(requestId) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(postTourReviewRequests)
    .set({ status: "failed" })
    .where(eq16(postTourReviewRequests.id, requestId));
}
async function markPostTourReviewOpenedByMessageId(whatsappMessageId) {
  const db = await getDb();
  if (!db) return;
  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq16(postTourReviewRequests.whatsappMessageId, whatsappMessageId))
    .limit(1);
  const row = rows[0];
  if (!row) return;
  await db
    .update(postTourReviewRequests)
    .set({
      openedAt: row.openedAt ?? /* @__PURE__ */ new Date(),
      status:
        row.status === "reviewed" || row.status === "clicked"
          ? row.status
          : "opened",
    })
    .where(eq16(postTourReviewRequests.id, row.id));
}
async function markPostTourReviewClicked(requestId) {
  const db = await getDb();
  if (!db) return;
  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq16(postTourReviewRequests.id, requestId))
    .limit(1);
  const row = rows[0];
  if (!row) return;
  await db
    .update(postTourReviewRequests)
    .set({
      clickedAt: row.clickedAt ?? /* @__PURE__ */ new Date(),
      status: row.status === "reviewed" ? "reviewed" : "clicked",
    })
    .where(eq16(postTourReviewRequests.id, row.id));
}
async function markPostTourReviewReviewed(input) {
  const db = await getDb();
  if (!db) return null;
  let row = null;
  if (input.requestId) {
    const rows = await db
      .select()
      .from(postTourReviewRequests)
      .where(eq16(postTourReviewRequests.id, input.requestId))
      .limit(1);
    row = rows[0] ?? null;
  }
  if (!row && input.bookingId) {
    row = await getPostTourReviewRequestByBookingId(input.bookingId);
  }
  if (!row) return null;
  const isLowRating = input.rating <= 4;
  const followUpUrl = `https://www.wiro4x4indochina.com/admin?tab=reviews&reviewRequestId=${row.id}`;
  await db
    .update(postTourReviewRequests)
    .set({
      status: "reviewed",
      reviewedAt: row.reviewedAt ?? /* @__PURE__ */ new Date(),
      rating: input.rating,
      comments: input.comments,
      opsFollowUpUrl: isLowRating ? followUpUrl : row.opsFollowUpUrl,
      escalatedAt: isLowRating
        ? (row.escalatedAt ?? /* @__PURE__ */ new Date())
        : row.escalatedAt,
    })
    .where(eq16(postTourReviewRequests.id, row.id));
  return {
    id: row.id,
    bookingId: row.bookingId,
    isLowRating,
    followUpUrl,
  };
}
async function getWeeklyPostTourReviewMetrics() {
  const db = await getDb();
  const now = /* @__PURE__ */ new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  if (!db) {
    return {
      windowStart: weekAgo.toISOString(),
      windowEnd: now.toISOString(),
      volume: 0,
      completedTours: 0,
      reviewed: 0,
      completionRate: 0,
      lowRatingExceptions: 0,
    };
  }
  const baseWhere = and8(
    eq16(bookings.status, "completed"),
    gte2(bookings.departureDate, weekAgo),
    lte3(bookings.departureDate, now)
  );
  const [completedRow] = await db
    .select({ count: sql13`count(*)` })
    .from(bookings)
    .where(baseWhere);
  const joinWhere = and8(
    baseWhere,
    eq16(postTourReviewRequests.bookingId, bookings.id)
  );
  const [sentRow] = await db
    .select({ count: sql13`count(*)` })
    .from(postTourReviewRequests)
    .innerJoin(bookings, eq16(postTourReviewRequests.bookingId, bookings.id))
    .where(
      and8(joinWhere, sql13`${postTourReviewRequests.sentAt} IS NOT NULL`)
    );
  const [reviewedRow] = await db
    .select({ count: sql13`count(*)` })
    .from(postTourReviewRequests)
    .innerJoin(bookings, eq16(postTourReviewRequests.bookingId, bookings.id))
    .where(
      and8(joinWhere, sql13`${postTourReviewRequests.reviewedAt} IS NOT NULL`)
    );
  const [lowRatingRow] = await db
    .select({ count: sql13`count(*)` })
    .from(postTourReviewRequests)
    .innerJoin(bookings, eq16(postTourReviewRequests.bookingId, bookings.id))
    .where(
      and8(
        joinWhere,
        sql13`${postTourReviewRequests.reviewedAt} IS NOT NULL`,
        sql13`${postTourReviewRequests.rating} <= 4`
      )
    );
  const completedTours = Number(completedRow?.count ?? 0);
  const reviewed = Number(reviewedRow?.count ?? 0);
  return {
    windowStart: weekAgo.toISOString(),
    windowEnd: now.toISOString(),
    volume: Number(sentRow?.count ?? 0),
    completedTours,
    reviewed,
    completionRate:
      completedTours > 0 ? Math.round((reviewed / completedTours) * 100) : 0,
    lowRatingExceptions: Number(lowRatingRow?.count ?? 0),
  };
}
var init_postTourReviewRequests = __esm({
  "server/db/postTourReviewRequests.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/settings.ts
import { eq as eq17 } from "drizzle-orm";
async function getSetting(key) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(settings).where(eq17(settings.key, key));
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
    await db.update(settings).set({ value }).where(eq17(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}
async function deleteSetting(key) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(settings).where(eq17(settings.key, key));
}
var init_settings = __esm({
  "server/db/settings.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/stats.ts
import {
  eq as eq18,
  and as and9,
  sql as sql14,
  desc as desc16,
  gte as gte3,
} from "drizzle-orm";
import { count } from "drizzle-orm";
async function getPublicStats() {
  const db = await getDb();
  if (!db) return { totalBookings: 0, totalReviews: 0, totalTours: 0 };
  const [bookingCount] = await db
    .select({ value: count() })
    .from(bookings)
    .where(sql14`${bookings.status} IN ('confirmed', 'completed')`);
  const [reviewCount] = await db
    .select({ value: count() })
    .from(reviews)
    .where(and9(eq18(reviews.isApproved, 1), gte3(reviews.rating, 4)));
  const [tourCount] = await db
    .select({ value: count() })
    .from(tours)
    .where(eq18(tours.isActive, 1));
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
        sql14`COALESCE(${bookings.suggestedDestinations}, 'Off-Road Adventure')`.as(
          "tourName"
        ),
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(sql14`${bookings.status} IN ('confirmed', 'completed')`)
    .orderBy(desc16(bookings.createdAt))
    .limit(limit);
  return rows.map(r => ({
    firstName: r.contactName.split(" ")[0],
    tourName: r.tourName,
    createdAt: r.createdAt,
  }));
}
var init_stats = __esm({
  "server/db/stats.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/bookingDrafts.ts
import { eq as eq19 } from "drizzle-orm";
import { desc as desc17 } from "drizzle-orm";
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
    .where(eq19(bookingDrafts.resumeToken, token))
    .limit(1);
  return draft ?? null;
}
async function listActiveBookingDrafts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(bookingDrafts)
    .where(eq19(bookingDrafts.status, "active"))
    .orderBy(desc17(bookingDrafts.createdAt));
}
async function updateBookingDraftStatus(id, status, convertedToBookingId) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(bookingDrafts)
    .set({ status, ...(convertedToBookingId ? { convertedToBookingId } : {}) })
    .where(eq19(bookingDrafts.id, id));
}
var init_bookingDrafts = __esm({
  "server/db/bookingDrafts.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/accounting.ts
import {
  eq as eq20,
  desc as desc18,
  and as and10,
  gte as gte4,
  lte as lte4,
  sql as sql15,
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
    .orderBy(desc18(invoices.issuedAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql15`count(*)` })
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
    .where(eq20(invoices.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateInvoiceStatus(id, status, paymentDate, paymentMethod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status };
  if (paymentDate) updateData.paymentDate = paymentDate;
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  return await db.update(invoices).set(updateData).where(eq20(invoices.id, id));
}
async function getNextInvoiceSequence(prefix, yearMonth) {
  const db = await getDb();
  if (!db) return 1;
  const pattern = `${prefix}-${yearMonth}-%`;
  const result = await db
    .select({ count: sql15`count(*)` })
    .from(invoices)
    .where(sql15`${invoices.invoiceNumber} LIKE ${pattern}`);
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
    conditions.push(eq20(accountingEntries.accountCode, filters.accountCode));
  }
  if (filters?.startDate) {
    conditions.push(gte4(accountingEntries.date, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    conditions.push(lte4(accountingEntries.date, new Date(filters.endDate)));
  }
  const whereClause = conditions.length > 0 ? and10(...conditions) : void 0;
  const itemsQuery = db
    .select()
    .from(accountingEntries)
    .orderBy(desc18(accountingEntries.date))
    .limit(pageSize)
    .offset(offset);
  const countQuery = db
    .select({ count: sql15`count(*)` })
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
      totalDebit: sql15`SUM(${accountingEntries.debit})`,
      totalCredit: sql15`SUM(${accountingEntries.credit})`,
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
    .orderBy(desc18(taxFilings.dueDate))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql15`count(*)` })
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
    .where(eq20(taxFilings.id, id));
}
async function getUpcomingFilings() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(taxFilings)
    .where(
      and10(
        eq20(taxFilings.status, "pending"),
        gte4(taxFilings.dueDate, /* @__PURE__ */ new Date())
      )
    )
    .orderBy(taxFilings.dueDate);
}
var init_accounting = __esm({
  "server/db/accounting.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/inventory.ts
import { eq as eq21, desc as desc19, sql as sql16 } from "drizzle-orm";
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
    .orderBy(desc19(inventory.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql16`count(*)` })
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
    .where(eq21(inventory.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateInventoryItem(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(inventory).set(data).where(eq21(inventory.id, id));
}
async function deleteInventoryItem(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(inventory).where(eq21(inventory.id, id));
}
async function getInventoryNeedingMaintenance(withinDays = 7) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1e3);
  return await db
    .select()
    .from(inventory)
    .where(
      sql16`${inventory.nextMaintenanceDate} IS NOT NULL AND ${inventory.nextMaintenanceDate} <= ${cutoff} AND ${inventory.condition} != 'retired'`
    );
}
async function getInventorySummary() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      category: inventory.category,
      count: sql16`COUNT(*)`,
      totalCurrentValue: sql16`SUM(${inventory.currentValue})`,
      totalPurchaseCost: sql16`SUM(${inventory.purchaseCost})`,
    })
    .from(inventory)
    .groupBy(inventory.category);
  return result;
}
var init_inventory = __esm({
  "server/db/inventory.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/availability.ts
import {
  eq as eq22,
  and as and11,
  gte as gte5,
  lte as lte5,
} from "drizzle-orm";
async function getTourAvailabilityByRange(tourId, startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tourAvailability)
    .where(
      and11(
        eq22(tourAvailability.tourId, tourId),
        gte5(tourAvailability.date, startDate),
        lte5(tourAvailability.date, endDate)
      )
    )
    .orderBy(tourAvailability.date);
}
async function upsertTourAvailability(tourId, date, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(tourAvailability)
    .where(
      and11(
        eq22(tourAvailability.tourId, tourId),
        eq22(tourAvailability.date, date)
      )
    )
    .limit(1);
  if (existing.length > 0) {
    return await db
      .update(tourAvailability)
      .set(data)
      .where(eq22(tourAvailability.id, existing[0].id));
  } else {
    return await db.insert(tourAvailability).values({
      tourId,
      date,
      maxSlots: data.maxSlots ?? 10,
      bookedSlots: data.bookedSlots ?? 0,
      isBlocked: data.isBlocked ?? 0,
      notes: data.notes ?? null,
    });
  }
}
async function bulkUpdateTourAvailability(tourId, dates, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = [];
  for (const date of dates) {
    const result = await upsertTourAvailability(tourId, date, data);
    results.push(result);
  }
  return results;
}
var init_availability = __esm({
  "server/db/availability.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/tripPhotos.ts
import { eq as eq23, sql as sql17, desc as desc20 } from "drizzle-orm";
async function createTripPhotoAlbum(album) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tripPhotoAlbums).values(album);
}
async function getTripPhotoAlbumsByBookingId(bookingId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tripPhotoAlbums)
    .where(eq23(tripPhotoAlbums.bookingId, bookingId))
    .orderBy(desc20(tripPhotoAlbums.createdAt));
}
async function getTripPhotoAlbumByToken(token) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tripPhotoAlbums)
    .where(eq23(tripPhotoAlbums.accessToken, token))
    .limit(1);
  return results[0] ?? null;
}
async function getTripPhotoAlbumById(id) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tripPhotoAlbums)
    .where(eq23(tripPhotoAlbums.id, id))
    .limit(1);
  return results[0] ?? null;
}
async function getAllTripPhotoAlbums() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      album: tripPhotoAlbums,
      bookingContactName: bookings.contactName,
      bookingContactEmail: bookings.contactEmail,
    })
    .from(tripPhotoAlbums)
    .leftJoin(bookings, eq23(tripPhotoAlbums.bookingId, bookings.id))
    .orderBy(desc20(tripPhotoAlbums.createdAt));
}
async function updateTripPhotoAlbum(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(tripPhotoAlbums)
    .set(data)
    .where(eq23(tripPhotoAlbums.id, id));
}
async function incrementAlbumViewCount(id) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(tripPhotoAlbums)
    .set({ viewCount: sql17`${tripPhotoAlbums.viewCount} + 1` })
    .where(eq23(tripPhotoAlbums.id, id));
}
async function deleteTripPhotoAlbum(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tripPhotos).where(eq23(tripPhotos.albumId, id));
  return await db.delete(tripPhotoAlbums).where(eq23(tripPhotoAlbums.id, id));
}
async function createTripPhoto(photo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tripPhotos).values(photo);
}
async function getTripPhotosByAlbumId(albumId) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tripPhotos)
    .where(eq23(tripPhotos.albumId, albumId))
    .orderBy(tripPhotos.sortOrder, desc20(tripPhotos.createdAt));
}
async function deleteTripPhoto(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tripPhotos).where(eq23(tripPhotos.id, id));
}
async function getTripPhotoById(id) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tripPhotos)
    .where(eq23(tripPhotos.id, id))
    .limit(1);
  return results[0] ?? null;
}
async function getAlbumPhotoCount(albumId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql17`count(*)` })
    .from(tripPhotos)
    .where(eq23(tripPhotos.albumId, albumId));
  return result[0]?.count ?? 0;
}
var init_tripPhotos = __esm({
  "server/db/tripPhotos.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/whatsapp.ts
import {
  eq as eq24,
  desc as desc21,
  sql as sql18,
  and as and12,
  gte as gte6,
} from "drizzle-orm";
async function createWhatsAppMessage(msg) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(whatsappMessages).values(msg).$returningId();
  return result.id;
}
async function getAllWhatsAppMessagesPaginated(
  page = 1,
  pageSize = 20,
  phoneFilter
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const conditions = phoneFilter
    ? eq24(whatsappMessages.phoneNumber, phoneFilter)
    : void 0;
  const items = await db
    .select()
    .from(whatsappMessages)
    .where(conditions)
    .orderBy(desc21(whatsappMessages.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countQuery = phoneFilter
    ? db
        .select({ count: sql18`count(*)` })
        .from(whatsappMessages)
        .where(eq24(whatsappMessages.phoneNumber, phoneFilter))
    : db.select({ count: sql18`count(*)` }).from(whatsappMessages);
  const countResult = await countQuery;
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
async function getWhatsAppMessageStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalMessages: 0,
      incomingMessages: 0,
      outgoingMessages: 0,
      autoReplies: 0,
      uniqueContacts: 0,
      messagesToday: 0,
      autoRepliesToday: 0,
    };
  }
  const todayStart = /* @__PURE__ */ new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [totalResult] = await db
    .select({ count: sql18`count(*)` })
    .from(whatsappMessages);
  const [incomingResult] = await db
    .select({ count: sql18`count(*)` })
    .from(whatsappMessages)
    .where(eq24(whatsappMessages.direction, "incoming"));
  const [outgoingResult] = await db
    .select({ count: sql18`count(*)` })
    .from(whatsappMessages)
    .where(eq24(whatsappMessages.direction, "outgoing"));
  const [autoReplyResult] = await db
    .select({ count: sql18`count(*)` })
    .from(whatsappMessages)
    .where(eq24(whatsappMessages.isAutoReply, 1));
  const [uniqueContactsResult] = await db
    .select({
      count: sql18`count(distinct ${whatsappMessages.phoneNumber})`,
    })
    .from(whatsappMessages);
  const [todayResult] = await db
    .select({ count: sql18`count(*)` })
    .from(whatsappMessages)
    .where(gte6(whatsappMessages.createdAt, todayStart));
  const [autoReplyTodayResult] = await db
    .select({ count: sql18`count(*)` })
    .from(whatsappMessages)
    .where(
      and12(
        eq24(whatsappMessages.isAutoReply, 1),
        gte6(whatsappMessages.createdAt, todayStart)
      )
    );
  return {
    totalMessages: Number(totalResult?.count ?? 0),
    incomingMessages: Number(incomingResult?.count ?? 0),
    outgoingMessages: Number(outgoingResult?.count ?? 0),
    autoReplies: Number(autoReplyResult?.count ?? 0),
    uniqueContacts: Number(uniqueContactsResult?.count ?? 0),
    messagesToday: Number(todayResult?.count ?? 0),
    autoRepliesToday: Number(autoReplyTodayResult?.count ?? 0),
  };
}
async function getRecentFailedWhatsAppMessages(withinHours = 24) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1e3);
  return await db
    .select()
    .from(whatsappMessages)
    .where(
      and12(
        eq24(whatsappMessages.status, "failed"),
        gte6(whatsappMessages.createdAt, cutoff)
      )
    )
    .orderBy(desc21(whatsappMessages.createdAt))
    .limit(20);
}
async function updateWhatsAppMessageStatus(whatsappMessageId, status) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(whatsappMessages)
    .set({ status })
    .where(eq24(whatsappMessages.whatsappMessageId, whatsappMessageId));
}
var init_whatsapp = __esm({
  "server/db/whatsapp.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/postTourReviewEvents.ts
import { and as and13, desc as desc22, eq as eq25 } from "drizzle-orm";
function isDuplicateKeyError(error) {
  const e = error;
  return (
    e?.code === "ER_DUP_ENTRY" ||
    e?.errno === 1062 ||
    (typeof e?.message === "string" && e.message.includes("Duplicate entry"))
  );
}
function normalizePhone(phone) {
  if (!phone) return null;
  const normalized = phone.replace(/[^0-9+]/g, "").trim();
  return normalized.length > 0 ? normalized : null;
}
function buildPostTourReviewDedupeKey(input) {
  const { state, bookingId, guestReference, externalMessageId } = input;
  if (externalMessageId) return `${state}:wa:${externalMessageId}`;
  if (state === "request_sent" && bookingId)
    return `${state}:booking:${bookingId}`;
  return `${state}:guest:${guestReference}`;
}
function buildGuestReference(input) {
  if (input.bookingId) return `booking:${input.bookingId}`;
  const phone = normalizePhone(input.phone);
  return phone ? `phone:${phone}` : "unknown";
}
async function createPostTourReviewEvent(event) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const [result] = await db
      .insert(postTourReviewEvents)
      .values(event)
      .$returningId();
    return { created: true, id: result?.id ?? null };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { created: false, id: null };
    }
    throw error;
  }
}
async function getLatestPostTourRequestEventByPhone(phone) {
  const db = await getDb();
  if (!db) return null;
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;
  const rows = await db
    .select()
    .from(postTourReviewEvents)
    .where(
      and13(
        eq25(postTourReviewEvents.channel, "whatsapp"),
        eq25(postTourReviewEvents.state, "request_sent"),
        eq25(postTourReviewEvents.guestPhone, normalizedPhone)
      )
    )
    .orderBy(desc22(postTourReviewEvents.createdAt))
    .limit(1);
  return rows[0] ?? null;
}
var init_postTourReviewEvents = __esm({
  "server/db/postTourReviewEvents.ts"() {
    "use strict";
    init_schema();
    init_connection();
  },
});

// server/db/analytics.ts
import {
  sql as sql19,
  eq as eq26,
  count as count2,
  sum,
  desc as desc23,
  gte as gte7,
  and as and14,
} from "drizzle-orm";
async function getAnalyticsOverview() {
  const db = await getDb();
  if (!db)
    return {
      totalRevenue: 0,
      totalBookings: 0,
      bookingsThisMonth: 0,
      bookingsLastMonth: 0,
      totalLeads: 0,
      leadsThisMonth: 0,
      convertedLeads: 0,
      activeSubscribers: 0,
      avgRating: 0,
      totalReviews: 0,
    };
  const now = /* @__PURE__ */ new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [revenueRow] = await db
    .select({ total: sum(financialRecords.amount) })
    .from(financialRecords)
    .where(eq26(financialRecords.type, "revenue"));
  const [totalBookingsRow] = await db
    .select({ value: count2() })
    .from(bookings);
  const [bookingsThisMonthRow] = await db
    .select({ value: count2() })
    .from(bookings)
    .where(gte7(bookings.createdAt, firstOfThisMonth));
  const [bookingsLastMonthRow] = await db
    .select({ value: count2() })
    .from(bookings)
    .where(
      and14(
        gte7(bookings.createdAt, firstOfLastMonth),
        sql19`${bookings.createdAt} < ${firstOfThisMonth}`
      )
    );
  const [totalLeadsRow] = await db.select({ value: count2() }).from(leads);
  const [leadsThisMonthRow] = await db
    .select({ value: count2() })
    .from(leads)
    .where(gte7(leads.createdAt, firstOfThisMonth));
  const [convertedLeadsRow] = await db
    .select({ value: count2() })
    .from(leads)
    .where(eq26(leads.status, "converted"));
  const [subsRow] = await db
    .select({ value: count2() })
    .from(subscribers)
    .where(eq26(subscribers.isActive, 1));
  const [ratingRow] = await db
    .select({
      avg: sql19`COALESCE(AVG(${reviews.rating}), 0)`.as("avg"),
      total: count2(),
    })
    .from(reviews)
    .where(eq26(reviews.isApproved, 1));
  return {
    totalRevenue: Number(revenueRow?.total ?? 0),
    totalBookings: totalBookingsRow?.value ?? 0,
    bookingsThisMonth: bookingsThisMonthRow?.value ?? 0,
    bookingsLastMonth: bookingsLastMonthRow?.value ?? 0,
    totalLeads: totalLeadsRow?.value ?? 0,
    leadsThisMonth: leadsThisMonthRow?.value ?? 0,
    convertedLeads: convertedLeadsRow?.value ?? 0,
    activeSubscribers: subsRow?.value ?? 0,
    avgRating:
      Math.round((Number(ratingRow?.avg ?? 0) + Number.EPSILON) * 10) / 10,
    totalReviews: ratingRow?.total ?? 0,
  };
}
async function getRevenueByMonth() {
  const db = await getDb();
  if (!db) return [];
  const twelveMonthsAgo = /* @__PURE__ */ new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);
  const rows = await db
    .select({
      month: sql19`DATE_FORMAT(${financialRecords.createdAt}, '%Y-%m')`.as(
        "month"
      ),
      total: sum(financialRecords.amount),
    })
    .from(financialRecords)
    .where(
      and14(
        eq26(financialRecords.type, "revenue"),
        gte7(financialRecords.createdAt, twelveMonthsAgo)
      )
    )
    .groupBy(sql19`DATE_FORMAT(${financialRecords.createdAt}, '%Y-%m')`)
    .orderBy(sql19`month`);
  const result = [];
  const now = /* @__PURE__ */ new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = rows.find(r => r.month === key);
    result.push({ month: key, total: Number(found?.total ?? 0) });
  }
  return result;
}
async function getBookingsByMonth() {
  const db = await getDb();
  if (!db) return [];
  const twelveMonthsAgo = /* @__PURE__ */ new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);
  const rows = await db
    .select({
      month: sql19`DATE_FORMAT(${bookings.createdAt}, '%Y-%m')`.as("month"),
      total: count2(),
    })
    .from(bookings)
    .where(gte7(bookings.createdAt, twelveMonthsAgo))
    .groupBy(sql19`DATE_FORMAT(${bookings.createdAt}, '%Y-%m')`)
    .orderBy(sql19`month`);
  const result = [];
  const now = /* @__PURE__ */ new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = rows.find(r => r.month === key);
    result.push({ month: key, total: found?.total ?? 0 });
  }
  return result;
}
async function getLeadFunnel() {
  const db = await getDb();
  if (!db) return { new: 0, contacted: 0, quoted: 0, converted: 0, lost: 0 };
  const rows = await db
    .select({
      status: leads.status,
      total: count2(),
    })
    .from(leads)
    .groupBy(leads.status);
  const funnel = {
    new: 0,
    contacted: 0,
    quoted: 0,
    converted: 0,
    lost: 0,
  };
  for (const row of rows) {
    if (row.status in funnel) {
      funnel[row.status] = row.total;
    }
  }
  return funnel;
}
async function getTopTours(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      tourName:
        sql19`COALESCE(${bookings.suggestedDestinations}, 'General Tour')`.as(
          "tourName"
        ),
      bookingCount: count2(),
      revenue: sql19`COALESCE(SUM(${bookings.totalPrice}), 0)`.as("revenue"),
    })
    .from(bookings)
    .groupBy(sql19`tourName`)
    .orderBy(desc23(count2()))
    .limit(limit);
  return rows.map(r => ({
    tourName: r.tourName,
    bookingCount: r.bookingCount,
    revenue: Number(r.revenue),
  }));
}
async function getRecentActivity(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const recentBookings = await db
    .select({
      id: bookings.id,
      name: bookings.contactName,
      type: sql19`'booking'`.as("type"),
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .orderBy(desc23(bookings.createdAt))
    .limit(limit);
  const recentLeads = await db
    .select({
      id: leads.id,
      name: leads.name,
      type: sql19`'lead'`.as("type"),
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .orderBy(desc23(leads.createdAt))
    .limit(limit);
  const combined = [...recentBookings, ...recentLeads]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
  return combined;
}
var init_analytics = __esm({
  "server/db/analytics.ts"() {
    "use strict";
    init_connection();
    init_schema();
  },
});

// server/db/pagination.ts
import { sql as sql20 } from "drizzle-orm";
async function paginatedQuery(table, orderBy, page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const orderByArr = Array.isArray(orderBy) ? orderBy : [orderBy];
  const items = await db
    .select()
    .from(table)
    .orderBy(...orderByArr)
    .limit(pageSize)
    .offset(offset);
  const countResult = await db.select({ count: sql20`count(*)` }).from(table);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
var init_pagination = __esm({
  "server/db/pagination.ts"() {
    "use strict";
    init_connection();
  },
});

// server/db/index.ts
var db_exports = {};
__export(db_exports, {
  addChatMessage: () => addChatMessage,
  buildGuestReference: () => buildGuestReference,
  buildPostTourReviewDedupeKey: () => buildPostTourReviewDedupeKey,
  bulkApproveReviews: () => bulkApproveReviews,
  bulkDeleteBookings: () => bulkDeleteBookings,
  bulkDeleteLeads: () => bulkDeleteLeads,
  bulkDeleteReviews: () => bulkDeleteReviews,
  bulkUpdateTourAvailability: () => bulkUpdateTourAvailability,
  closeChatSession: () => closeChatSession,
  completeActivity: () => completeActivity,
  createAccountingEntry: () => createAccountingEntry,
  createAgent: () => createAgent,
  createBlogPost: () => createBlogPost,
  createBooking: () => createBooking,
  createBookingDraft: () => createBookingDraft,
  createChatSession: () => createChatSession,
  createCustomer: () => createCustomer,
  createCustomerActivity: () => createCustomerActivity,
  createFinancialRecord: () => createFinancialRecord,
  createGalleryPhoto: () => createGalleryPhoto,
  createInventoryItem: () => createInventoryItem,
  createInvoice: () => createInvoice,
  createLead: () => createLead,
  createPayment: () => createPayment,
  createPostTourReviewEvent: () => createPostTourReviewEvent,
  createPostTourReviewRequest: () => createPostTourReviewRequest,
  createReview: () => createReview,
  createScheduledEmail: () => createScheduledEmail,
  createSubscriber: () => createSubscriber,
  createTaxFiling: () => createTaxFiling,
  createTour: () => createTour,
  createTourPackage: () => createTourPackage,
  createTripPhoto: () => createTripPhoto,
  createTripPhotoAlbum: () => createTripPhotoAlbum,
  createUser: () => createUser,
  createWhatsAppMessage: () => createWhatsAppMessage,
  deactivateSubscriber: () => deactivateSubscriber,
  deleteAgent: () => deleteAgent,
  deleteBlogPost: () => deleteBlogPost,
  deleteBooking: () => deleteBooking,
  deleteCustomer: () => deleteCustomer,
  deleteFinancialRecord: () => deleteFinancialRecord,
  deleteGalleryPhoto: () => deleteGalleryPhoto,
  deleteInventoryItem: () => deleteInventoryItem,
  deleteLead: () => deleteLead,
  deleteReview: () => deleteReview,
  deleteSetting: () => deleteSetting,
  deleteTour: () => deleteTour,
  deleteTourPackage: () => deleteTourPackage,
  deleteTripPhoto: () => deleteTripPhoto,
  deleteTripPhotoAlbum: () => deleteTripPhotoAlbum,
  findOrCreateCustomer: () => findOrCreateCustomer,
  generateDefaultFinancialRecords: () => generateDefaultFinancialRecords,
  getAbandonedLeads: () => getAbandonedLeads,
  getAccountingEntriesPaginated: () => getAccountingEntriesPaginated,
  getActivitiesByCustomerId: () => getActivitiesByCustomerId,
  getAgentBookingsInDateRange: () => getAgentBookingsInDateRange,
  getAgentById: () => getAgentById,
  getAgentPerformanceStats: () => getAgentPerformanceStats,
  getAlbumByBookingId: () => getAlbumByBookingId,
  getAlbumPhotoCount: () => getAlbumPhotoCount,
  getAllActiveSubscribers: () => getAllActiveSubscribers,
  getAllActiveTours: () => getAllActiveTours,
  getAllAdminUsers: () => getAllAdminUsers,
  getAllAgents: () => getAllAgents,
  getAllBlogPosts: () => getAllBlogPosts,
  getAllBlogPostsPaginated: () => getAllBlogPostsPaginated,
  getAllBookings: () => getAllBookings,
  getAllBookingsPaginated: () => getAllBookingsPaginated,
  getAllChatSessionsPaginated: () => getAllChatSessionsPaginated,
  getAllCustomers: () => getAllCustomers,
  getAllCustomersPaginated: () => getAllCustomersPaginated,
  getAllFinancialRecords: () => getAllFinancialRecords,
  getAllFinancialRecordsPaginated: () => getAllFinancialRecordsPaginated,
  getAllGalleryPhotos: () => getAllGalleryPhotos,
  getAllGalleryPhotosPaginated: () => getAllGalleryPhotosPaginated,
  getAllInventoryPaginated: () => getAllInventoryPaginated,
  getAllInvoicesPaginated: () => getAllInvoicesPaginated,
  getAllLeads: () => getAllLeads,
  getAllLeadsPaginated: () => getAllLeadsPaginated,
  getAllLeadsPaginatedByScore: () => getAllLeadsPaginatedByScore,
  getAllPayments: () => getAllPayments,
  getAllPendingPayments: () => getAllPendingPayments,
  getAllPublishedBlogPosts: () => getAllPublishedBlogPosts,
  getAllPublishedPhotos: () => getAllPublishedPhotos,
  getAllReviews: () => getAllReviews,
  getAllReviewsPaginated: () => getAllReviewsPaginated,
  getAllSettings: () => getAllSettings,
  getAllSubscribers: () => getAllSubscribers,
  getAllTaxFilingsPaginated: () => getAllTaxFilingsPaginated,
  getAllTourPackages: () => getAllTourPackages,
  getAllTours: () => getAllTours,
  getAllToursPaginated: () => getAllToursPaginated,
  getAllTripPhotoAlbums: () => getAllTripPhotoAlbums,
  getAllWhatsAppMessagesPaginated: () => getAllWhatsAppMessagesPaginated,
  getAnalyticsOverview: () => getAnalyticsOverview,
  getApprovedReviews: () => getApprovedReviews,
  getBlogPostById: () => getBlogPostById,
  getBlogPostBySlug: () => getBlogPostBySlug,
  getBookingById: () => getBookingById,
  getBookingDraftByToken: () => getBookingDraftByToken,
  getBookingTotalPaid: () => getBookingTotalPaid,
  getBookingsByAgentId: () => getBookingsByAgentId,
  getBookingsByMonth: () => getBookingsByMonth,
  getBookingsNeedingFeedback: () => getBookingsNeedingFeedback,
  getBookingsNeedingReminder: () => getBookingsNeedingReminder,
  getChatMessagesBySessionId: () => getChatMessagesBySessionId,
  getChatSessionByVisitorId: () => getChatSessionByVisitorId,
  getColdContactedLeads: () => getColdContactedLeads,
  getCustomerByEmail: () => getCustomerByEmail,
  getCustomerById: () => getCustomerById,
  getCustomerByPhone: () => getCustomerByPhone,
  getCustomerPipelineStats: () => getCustomerPipelineStats,
  getCustomerTimeline: () => getCustomerTimeline,
  getCustomersByStage: () => getCustomersByStage,
  getDb: () => getDb,
  getDuePostTourReviewRequests: () => getDuePostTourReviewRequests,
  getEligiblePostTourBookings: () => getEligiblePostTourBookings,
  getEligiblePostTourCount: () => getEligiblePostTourCount,
  getFeaturedPhotos: () => getFeaturedPhotos,
  getFinancialRecordsByBookingId: () => getFinancialRecordsByBookingId,
  getFinancialStats: () => getFinancialStats,
  getFinancialStatsByAgent: () => getFinancialStatsByAgent,
  getFinancialStatsByTour: () => getFinancialStatsByTour,
  getInventoryById: () => getInventoryById,
  getInventoryNeedingMaintenance: () => getInventoryNeedingMaintenance,
  getInventorySummary: () => getInventorySummary,
  getInvoiceById: () => getInvoiceById,
  getLatestPostTourRequestEventByPhone: () =>
    getLatestPostTourRequestEventByPhone,
  getLeadById: () => getLeadById,
  getLeadFunnel: () => getLeadFunnel,
  getLeadSlaBreaches: () => getLeadSlaBreaches,
  getLeadsByScore: () => getLeadsByScore,
  getNewLeadCount: () => getNewLeadCount,
  getNextInvoiceSequence: () => getNextInvoiceSequence,
  getOverdueTasks: () => getOverdueTasks,
  getPaymentById: () => getPaymentById,
  getPaymentBySessionId: () => getPaymentBySessionId,
  getPaymentStats: () => getPaymentStats,
  getPaymentsByBookingId: () => getPaymentsByBookingId,
  getPendingBookingCount: () => getPendingBookingCount,
  getPendingFollowUps: () => getPendingFollowUps,
  getPendingReviewCount: () => getPendingReviewCount,
  getPostTourReviewRequestByBookingId: () =>
    getPostTourReviewRequestByBookingId,
  getPublicStats: () => getPublicStats,
  getPublishedBlogPostBySlug: () => getPublishedBlogPostBySlug,
  getPublishedPhotosPaginated: () => getPublishedPhotosPaginated,
  getPublishedTourPackages: () => getPublishedTourPackages,
  getRecentActivity: () => getRecentActivity,
  getRecentBookings: () => getRecentBookings,
  getRecentFailedWhatsAppMessages: () => getRecentFailedWhatsAppMessages,
  getRevenueByMonth: () => getRevenueByMonth,
  getReviewById: () => getReviewById,
  getReviewStats: () => getReviewStats,
  getSetting: () => getSetting,
  getStaleNewLeads: () => getStaleNewLeads,
  getSubscriberByEmail: () => getSubscriberByEmail,
  getTopTours: () => getTopTours,
  getTourAvailabilityByRange: () => getTourAvailabilityByRange,
  getTourById: () => getTourById,
  getTourBySlug: () => getTourBySlug,
  getTourPackageBySlug: () => getTourPackageBySlug,
  getTrialBalance: () => getTrialBalance,
  getTripPhotoAlbumById: () => getTripPhotoAlbumById,
  getTripPhotoAlbumByToken: () => getTripPhotoAlbumByToken,
  getTripPhotoAlbumsByBookingId: () => getTripPhotoAlbumsByBookingId,
  getTripPhotoById: () => getTripPhotoById,
  getTripPhotosByAlbumId: () => getTripPhotosByAlbumId,
  getUpcomingFilings: () => getUpcomingFilings,
  getUpcomingTourCount: () => getUpcomingTourCount,
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById,
  getWeeklyPostTourReviewMetrics: () => getWeeklyPostTourReviewMetrics,
  getWhatsAppMessageStats: () => getWhatsAppMessageStats,
  hasRecentAuditLog: () => hasRecentAuditLog,
  hasScheduledEmailBeenSent: () => hasScheduledEmailBeenSent,
  incrementAlbumViewCount: () => incrementAlbumViewCount,
  listActiveBookingDrafts: () => listActiveBookingDrafts,
  logAdminAction: () => logAdminAction,
  markFeedbackSent: () => markFeedbackSent,
  markPostTourEmailSent: () => markPostTourEmailSent,
  markPostTourReviewClicked: () => markPostTourReviewClicked,
  markPostTourReviewOpenedByMessageId: () =>
    markPostTourReviewOpenedByMessageId,
  markPostTourReviewRequestFailed: () => markPostTourReviewRequestFailed,
  markPostTourReviewRequestSent: () => markPostTourReviewRequestSent,
  markPostTourReviewReviewed: () => markPostTourReviewReviewed,
  markRecoveryEmailSent: () => markRecoveryEmailSent,
  markReminderSent: () => markReminderSent,
  paginatedQuery: () => paginatedQuery,
  removeAdminAccess: () => removeAdminAccess,
  updateAgent: () => updateAgent,
  updateBlogPost: () => updateBlogPost,
  updateBooking: () => updateBooking,
  updateBookingDraftStatus: () => updateBookingDraftStatus,
  updateChatSessionBookingContext: () => updateChatSessionBookingContext,
  updateChatSessionMode: () => updateChatSessionMode,
  updateChatSessionSummary: () => updateChatSessionSummary,
  updateCustomer: () => updateCustomer,
  updateFinancialRecord: () => updateFinancialRecord,
  updateGalleryPhoto: () => updateGalleryPhoto,
  updateInventoryItem: () => updateInventoryItem,
  updateInvoiceStatus: () => updateInvoiceStatus,
  updateLastSignedIn: () => updateLastSignedIn,
  updateLead: () => updateLead,
  updateLeadScore: () => updateLeadScore,
  updatePayment: () => updatePayment,
  updateReview: () => updateReview,
  updateTaxFilingStatus: () => updateTaxFilingStatus,
  updateTour: () => updateTour,
  updateTourPackage: () => updateTourPackage,
  updateTripPhotoAlbum: () => updateTripPhotoAlbum,
  updateUserPassword: () => updateUserPassword,
  updateUserRole: () => updateUserRole,
  updateWhatsAppMessageStatus: () => updateWhatsAppMessageStatus,
  upsertSetting: () => upsertSetting,
  upsertTourAvailability: () => upsertTourAvailability,
});
var init_db = __esm({
  "server/db/index.ts"() {
    "use strict";
    init_connection();
    init_users();
    init_bookings();
    init_agents();
    init_leads();
    init_financial();
    init_gallery();
    init_reviews();
    init_payments();
    init_tours();
    init_packages();
    init_blog();
    init_subscribers();
    init_chat();
    init_customers();
    init_audit();
    init_postTourReviewRequests();
    init_settings();
    init_stats();
    init_bookingDrafts();
    init_accounting();
    init_inventory();
    init_availability();
    init_tripPhotos();
    init_whatsapp();
    init_postTourReviewEvents();
    init_analytics();
    init_pagination();
  },
});

// server/eliNotify.ts
var eliNotify_exports = {};
__export(eliNotify_exports, {
  notifyBookingConfirmed: () => notifyBookingConfirmed,
  notifyBookingReminder: () => notifyBookingReminder,
  notifyChatMessage: () => notifyChatMessage,
  notifyCompetitorReport: () => notifyCompetitorReport,
  notifyLowRatingReviewEscalation: () => notifyLowRatingReviewEscalation,
  notifyNewLead: () => notifyNewLead,
  notifyNewReview: () => notifyNewReview,
  notifyUpsellSent: () => notifyUpsellSent,
  notifyWhatsAppMessage: () => notifyWhatsAppMessage,
  sendDailyBrief: () => sendDailyBrief,
});
async function sendTelegram(text2) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text2,
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {
    console.error("[EliNotify] Telegram failed:", e);
  }
}
async function notifyNewLead(lead) {
  const tours2 = lead.interestedTours
    ? `
\u{1F5FA}\uFE0F Tour: ${lead.interestedTours}`
    : "";
  const phone = lead.phone
    ? `
\u{1F4F1} Phone: ${lead.phone}`
    : "";
  const msg = lead.message
    ? `
\u{1F4AC} "${lead.message.slice(0, 100)}"`
    : "";
  const src = lead.source ? ` (via ${lead.source})` : "";
  await sendTelegram(
    `\u{1F514} *New Inquiry!*${src}

\u{1F464} *${lead.name}*
\u{1F4E7} ${lead.email}${phone}${tours2}${msg}

\u26A1 Reply now: https://wiro4x4indochina.com/admin`
  );
}
async function notifyBookingConfirmed(booking) {
  await sendTelegram(
    `\u2705 *Booking Confirmed!*

\u{1F464} ${booking.name}
\u{1F5FA}\uFE0F ${booking.tourName ?? "Tour"}
\u{1F4C5} ${booking.date ?? "TBD"}
\u{1F465} ${booking.pax ?? "?"} pax
` +
      (booking.totalAmount
        ? `\u{1F4B0} \u0E3F${booking.totalAmount.toLocaleString()}
`
        : "") +
      `
\u{1F4CB} View: https://wiro4x4indochina.com/admin`
  );
}
async function notifyChatMessage(msg) {
  const intent = msg.userMessage.toLowerCase();
  const isBooking = [
    "book",
    "price",
    "cost",
    "available",
    "reserve",
    "tour",
    "\u0E23\u0E32\u0E04\u0E32",
    "\u0E08\u0E2D\u0E07",
    "\u0E27\u0E48\u0E32\u0E07",
    "\u05DB\u05DE\u05D4",
    "\u05DC\u05D4\u05D6\u05DE\u05D9\u05DF",
    "\u05D6\u05DE\u05D9\u05DF",
  ].some(k => intent.includes(k));
  if (!isBooking) return;
  await sendTelegram(
    `\u{1F4AC} *Chat \u2014 Booking Intent*

\u{1F310} Language: ${msg.language ?? "EN"}
\u{1F4AD} "${msg.userMessage.slice(0, 120)}"

\u{1F440} Live chat: https://wiro4x4indochina.com/admin`
  );
}
async function notifyNewReview(review) {
  const stars = "\u2B50".repeat(Math.min(review.rating, 5));
  await sendTelegram(
    `${stars} *New Review \u2014 ${review.platform ?? "Google"}*

\u{1F464} ${review.author}
${review.text ? `\u{1F4AC} "${review.text.slice(0, 100)}"` : ""}

Reply: https://wiro4x4indochina.com/admin`
  );
}
async function notifyLowRatingReviewEscalation(input) {
  await sendTelegram(
    `\u{1F6A8} *Low Rating Review Escalation*

\u{1F3AB} Booking #${input.bookingId}
\u{1F9FE} Request #${input.reviewRequestId}
\u{1F464} ${input.reviewerName}
\u2B50 Rating: ${input.rating}/5
\u{1F4AC} "${input.text.slice(0, 220)}"

\u{1F517} Follow-up: ${input.followUpUrl}`
  );
}
async function notifyBookingReminder(wa) {
  const time = new Date(wa.reminderTime).toLocaleString("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  await sendTelegram(
    `\u23F0 *Pre-Tour Reminder \u2014 Departure in ~24h*

\u{1F3AB} Booking #${wa.bookingId}
\u{1F550} Reminder time: ${time} BKK

\u{1F4CB} Action: Confirm vehicle, guide & guest readiness
\u{1F517} https://wiro4x4indochina.com/admin`
  );
}
async function notifyUpsellSent(wa) {
  const emailLine = wa.customerEmail
    ? `
\u{1F4E7} ${wa.customerEmail}`
    : "";
  await sendTelegram(
    `\u{1F4E7} *Post-Tour Upsell Sent*

\u{1F3AB} Booking #${wa.bookingId}
\u{1F464} ${wa.customerName}${emailLine}

\u2705 Upsell email delivered 3 days after completion`
  );
}
async function notifyCompetitorReport(report) {
  await sendTelegram(`\u{1F3C1} *Competitor Monitor*

${report.slice(0, 4e3)}`);
}
async function notifyWhatsAppMessage(wa) {
  const langLabel = {
    he: "\u{1F1EE}\u{1F1F1} Hebrew",
    en: "\u{1F1EC}\u{1F1E7} English",
    th: "\u{1F1F9}\u{1F1ED} Thai",
  };
  const displayName = wa.name
    ? `${wa.name} (+${wa.phoneNumber})`
    : `+${wa.phoneNumber}`;
  await sendTelegram(
    `\u{1F4F1} *WhatsApp from* ${displayName}
\u{1F310} Language: ${langLabel[wa.language] ?? wa.language}

\u{1F4AC} "${wa.message.slice(0, 200)}"

\u{1F4DD} *Draft reply:*
${wa.draftReply.slice(0, 500)}

\u2705 Send: https://wiro4x4indochina.com/admin/whatsapp`
  );
}
async function sendDailyBrief(stats) {
  const today = /* @__PURE__ */ new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Bangkok",
  });
  await sendTelegram(
    `\u2600\uFE0F *Good morning, Mek!*
\u{1F4C5} ${today}

\u{1F4CB} Pending inquiries: *${stats.pendingLeads}*
\u{1F3AB} Bookings this month: *${stats.bookingsThisMonth}*
\u{1F4B0} Revenue MTD: *\u0E3F${stats.revenue.toLocaleString()}*
` +
      (stats.weather
        ? `\u{1F324}\uFE0F ${stats.weather}
`
        : "") +
      `
${stats.pendingLeads > 0 ? `\u26A0\uFE0F *${stats.pendingLeads} inquiry(s) waiting!*` : "\u2705 All caught up!"}

\u{1F5A5}\uFE0F Dashboard: https://monitoring-dashboard-iota.vercel.app`
  );
}
var BOT_TOKEN, CHAT_ID;
var init_eliNotify = __esm({
  "server/eliNotify.ts"() {
    "use strict";
    BOT_TOKEN =
      process.env.TELEGRAM_BOT_TOKEN ??
      "8716271731:AAHDwfQR4mSiI4q4ulu7jqc1M5IzZvZhwHU";
    CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "8506295306";
  },
});

// server/postTourReviewService.ts
var postTourReviewService_exports = {};
__export(postTourReviewService_exports, {
  getConfiguredPostTourReviewDelayMinutes: () =>
    getConfiguredPostTourReviewDelayMinutes,
  getPostTourReviewEntry: () => getPostTourReviewEntry,
  getRecentPostTourReviewEntries: () => getRecentPostTourReviewEntries,
  getWeeklyPostTourReviewMetric: () => getWeeklyPostTourReviewMetric,
  handlePostTourReviewReply: () => handlePostTourReviewReply,
  processDuePostTourReviewRequests: () => processDuePostTourReviewRequests,
  processPendingPostTourReviewRequests: () =>
    processPendingPostTourReviewRequests,
  recordPostTourReviewClickByToken: () => recordPostTourReviewClickByToken,
  recordPostTourReviewEvent: () => recordPostTourReviewEvent,
  recordPostTourReviewOpenedByMessageId: () =>
    recordPostTourReviewOpenedByMessageId,
  schedulePostTourReviewForBooking: () => schedulePostTourReviewForBooking,
  schedulePostTourReviewRequest: () => schedulePostTourReviewRequest,
  trackPostTourReviewLinkClick: () => trackPostTourReviewLinkClick,
  trackPostTourReviewMessageOpened: () => trackPostTourReviewMessageOpened,
  trackPostTourReviewSubmission: () => trackPostTourReviewSubmission,
  updatePostTourReviewDelayMinutes: () => updatePostTourReviewDelayMinutes,
});
import {
  and as and16,
  desc as desc24,
  eq as eq28,
  gte as gte8,
  lte as lte6,
  sql as sql21,
} from "drizzle-orm";
function toEntry(row) {
  return {
    id: row.id,
    bookingId: row.bookingId,
    customerName: row.customerName,
    contactWhatsApp: row.phoneNumber,
    contactEmail: null,
    language: row.language,
    scheduledAt: row.scheduledAt.toISOString(),
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
    openedAt: row.openedAt ? row.openedAt.toISOString() : null,
    clickedAt: row.clickedAt ? row.clickedAt.toISOString() : null,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    rating: row.rating ?? null,
    comments: row.comments ?? null,
    escalatedAt: row.escalatedAt ? row.escalatedAt.toISOString() : null,
    opsFollowUpUrl: row.opsFollowUpUrl ?? null,
    followUpPath: row.opsFollowUpUrl ?? null,
    whatsappMessageId: row.whatsappMessageId ?? null,
    reviewToken: String(row.id),
    source: row.sentAt ? "whatsapp" : "fallback_log",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
function clampDelayMinutes(delay) {
  return Math.max(MIN_DELAY_MINUTES, Math.min(MAX_DELAY_MINUTES, delay));
}
function normalizeWhatsApp(raw) {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length > 0 ? digits : null;
}
function detectLanguage(text2) {
  return text2 && HEBREW_REGEX.test(text2) ? "he" : "en";
}
function buildReviewMessage(entry) {
  const reviewUrl = `https://www.wiro4x4indochina.com/reviews?reviewRequestId=${entry.id}&bookingId=${entry.bookingId}&src=whatsapp_post_tour`;
  const hebrew = [
    `\u05E9\u05DC\u05D5\u05DD ${entry.customerName ?? "\u05D7\u05D1\u05E8\u05D9\u05DD"}, \u05EA\u05D5\u05D3\u05D4 \u05E9\u05D8\u05D9\u05D9\u05DC\u05EA\u05DD \u05D0\u05D9\u05EA\u05E0\u05D5 \u05D1-WIRO 4x4!`,
    `\u05E0\u05E9\u05DE\u05D7 \u05DC\u05D3\u05D9\u05E8\u05D5\u05D2 \u05E7\u05E6\u05E8 (\u05D3\u05E7\u05D4): ${reviewUrl}`,
    `\u05D0\u05DD \u05DE\u05E9\u05D4\u05D5 \u05D4\u05D9\u05D4 \u05E4\u05D7\u05D5\u05EA \u05DE\u05DE\u05D5\u05E9\u05DC\u05DD, \u05D4\u05E9\u05D9\u05D1\u05D5 \u05DB\u05D0\u05DF \u05D5\u05E0\u05D7\u05D6\u05D5\u05E8 \u05D0\u05DC\u05D9\u05DB\u05DD \u05D0\u05D9\u05E9\u05D9\u05EA.`,
  ].join("\n");
  const english = [
    `Hi ${entry.customerName ?? "there"}, thanks for touring with WIRO 4x4!`,
    `We'd love your quick 1-minute review: ${reviewUrl}`,
    `If anything was less than perfect, reply here and we'll follow up personally.`,
  ].join("\n");
  return entry.language === "he"
    ? `${hebrew}

English:
${english}`
    : english;
}
function parseReviewReply(text2) {
  const trimmed = text2.trim();
  if (!trimmed) return { rating: null, comments: null };
  const stars = (trimmed.match(/⭐/g) ?? []).length;
  if (stars >= 1 && stars <= 5) {
    const comments2 = trimmed.replace(/⭐+/g, "").trim();
    return { rating: stars, comments: comments2 || null };
  }
  const ratingMatch = trimmed.match(/\b([1-5])(?:\s*\/\s*5)?\b/);
  if (!ratingMatch) return { rating: null, comments: null };
  const rating = Number(ratingMatch[1]);
  const comments = trimmed
    .replace(ratingMatch[0], "")
    .replace(/^[-:,.\s]+/, "")
    .trim();
  return { rating, comments: comments || null };
}
async function getConfiguredPostTourReviewDelayMinutes() {
  const raw = await getSetting(REVIEW_DELAY_SETTING_KEY);
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) return DEFAULT_DELAY_MINUTES;
  return clampDelayMinutes(Math.round(value));
}
async function updatePostTourReviewDelayMinutes(delayMinutes) {
  const clamped = clampDelayMinutes(Math.round(delayMinutes));
  await upsertSetting(REVIEW_DELAY_SETTING_KEY, clamped);
  return clamped;
}
async function schedulePostTourReviewRequest(params) {
  const existing = await getPostTourReviewRequestByBookingId(params.bookingId);
  if (existing) return toEntry(existing);
  const phone = normalizeWhatsApp(params.contactWhatsApp);
  if (!phone) {
    throw new Error(
      `Booking #${params.bookingId} has no WhatsApp/phone; cannot schedule review`
    );
  }
  const completedAt =
    typeof params.completedAt === "string"
      ? new Date(params.completedAt)
      : params.completedAt;
  const delayMinutes =
    params.delayMinutes !== void 0
      ? clampDelayMinutes(params.delayMinutes)
      : await getConfiguredPostTourReviewDelayMinutes();
  const scheduledAt = new Date(completedAt.getTime() + delayMinutes * 6e4);
  await createPostTourReviewRequest({
    bookingId: params.bookingId,
    phoneNumber: phone,
    customerName: params.customerName,
    language: detectLanguage(params.customerName),
    scheduledAt,
    status: "scheduled",
  });
  const created = await getPostTourReviewRequestByBookingId(params.bookingId);
  if (!created) {
    throw new Error("Post-tour review request scheduling failed");
  }
  return toEntry(created);
}
async function schedulePostTourReviewForBooking(params) {
  const booking = await getBookingById(params.bookingId);
  if (!booking) {
    throw new Error(`Booking #${params.bookingId} not found`);
  }
  return await schedulePostTourReviewRequest({
    bookingId: booking.id,
    customerName: booking.contactName,
    contactWhatsApp: booking.contactWhatsApp ?? booking.contactPhone,
    contactEmail: booking.contactEmail,
    completedAt: params.completedAt ?? /* @__PURE__ */ new Date(),
    delayMinutes: params.delayMinutes,
  });
}
async function processDuePostTourReviewRequests() {
  const due = await getDuePostTourReviewRequests(50);
  let sent = 0;
  for (const row of due) {
    const entry = toEntry(row);
    const message = buildReviewMessage(entry);
    const guestReference = buildGuestReference({
      bookingId: entry.bookingId,
      phone: entry.contactWhatsApp,
    });
    if (!isWhatsAppConfigured()) {
      await markPostTourReviewRequestFailed(entry.id);
      continue;
    }
    const messageId = await sendWhatsAppMessage(entry.contactWhatsApp, message);
    try {
      await createWhatsAppMessage({
        direction: "outgoing",
        phoneNumber: entry.contactWhatsApp,
        customerName: entry.customerName,
        messageText: message,
        messageType: "text",
        isAutoReply: 0,
        status: messageId ? "sent" : "failed",
        whatsappMessageId: messageId,
      });
    } catch (err) {
      console.error("[PostTourReview] Failed to log outgoing WhatsApp:", err);
    }
    if (messageId) {
      const reviewUrl = `https://www.wiro4x4indochina.com/reviews?reviewRequestId=${entry.id}&bookingId=${entry.bookingId}&src=whatsapp_post_tour`;
      await markPostTourReviewRequestSent(entry.id, messageId, reviewUrl);
      sent += 1;
      await createPostTourReviewEvent({
        bookingId: entry.bookingId,
        channel: "whatsapp",
        state: "request_sent",
        guestReference,
        guestPhone: entry.contactWhatsApp,
        guestName: entry.customerName,
        externalMessageId: messageId,
        dedupeKey: buildPostTourReviewDedupeKey({
          state: "request_sent",
          bookingId: entry.bookingId,
          guestReference,
          externalMessageId: messageId,
        }),
        metadata: { reviewUrl },
      });
    } else {
      await markPostTourReviewRequestFailed(entry.id);
    }
  }
  const pending = (await getDuePostTourReviewRequests(1e3)).length;
  return {
    processed: due.length,
    sent,
    pending,
  };
}
async function recordPostTourReviewOpenedByMessageId(whatsappMessageId) {
  await markPostTourReviewOpenedByMessageId(whatsappMessageId);
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq28(postTourReviewRequests.whatsappMessageId, whatsappMessageId))
    .limit(1);
  return rows[0] ? toEntry(rows[0]) : null;
}
async function trackPostTourReviewMessageOpened(whatsappMessageId) {
  return await recordPostTourReviewOpenedByMessageId(whatsappMessageId);
}
async function recordPostTourReviewClickByToken(token) {
  const id = Number(token);
  if (!Number.isFinite(id) || id <= 0) return null;
  await markPostTourReviewClicked(id);
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(eq28(postTourReviewRequests.id, id))
    .limit(1);
  return rows[0] ? toEntry(rows[0]) : null;
}
async function trackPostTourReviewLinkClick(reviewRequestId) {
  await markPostTourReviewClicked(reviewRequestId);
}
async function trackPostTourReviewSubmission(input) {
  const result = await markPostTourReviewReviewed({
    requestId: input.reviewRequestId,
    bookingId: input.bookingId,
    rating: input.rating,
    comments: input.text,
  });
  if (!result || !result.isLowRating) return;
  await notifyLowRatingReviewEscalation({
    reviewRequestId: result.id,
    bookingId: result.bookingId,
    reviewerName: input.reviewerName,
    rating: input.rating,
    text: input.text,
    followUpUrl: result.followUpUrl,
  });
}
async function recordPostTourReviewEvent(input) {
  const existing = await getPostTourReviewRequestByBookingId(input.bookingId);
  if (!existing) return null;
  if (input.event === "opened") {
    if (!existing.whatsappMessageId) return toEntry(existing);
    return await recordPostTourReviewOpenedByMessageId(
      existing.whatsappMessageId
    );
  }
  if (input.event === "clicked") {
    await markPostTourReviewClicked(existing.id);
    const latest2 = await getPostTourReviewRequestByBookingId(input.bookingId);
    return latest2 ? toEntry(latest2) : null;
  }
  await trackPostTourReviewSubmission({
    reviewRequestId: existing.id,
    bookingId: input.bookingId,
    rating: input.rating ?? 5,
    text: input.comments ?? "",
    reviewerName: existing.customerName ?? "Guest",
  });
  const latest = await getPostTourReviewRequestByBookingId(input.bookingId);
  return latest ? toEntry(latest) : null;
}
async function handlePostTourReviewReply(input) {
  const phone = normalizeWhatsApp(input.from);
  if (!phone) return { handled: false };
  const parsed = parseReviewReply(input.text);
  if (parsed.rating === null) return { handled: false };
  const db = await getDb();
  if (!db) return { handled: false };
  const rows = await db
    .select()
    .from(postTourReviewRequests)
    .where(
      and16(
        eq28(postTourReviewRequests.phoneNumber, phone),
        sql21`${postTourReviewRequests.sentAt} IS NOT NULL`
      )
    )
    .orderBy(desc24(postTourReviewRequests.updatedAt))
    .limit(1);
  const row = rows[0];
  if (!row) return { handled: false };
  await trackPostTourReviewSubmission({
    reviewRequestId: row.id,
    bookingId: row.bookingId,
    rating: parsed.rating,
    text: parsed.comments ?? "",
    reviewerName: row.customerName ?? "Guest",
  });
  const latest = await getPostTourReviewRequestByBookingId(row.bookingId);
  if (!latest) return { handled: true };
  const replyText =
    detectLanguage(input.text) === "he"
      ? "\u05EA\u05D5\u05D3\u05D4 \u05E8\u05D1\u05D4 \u05E2\u05DC \u05D4\u05DE\u05E9\u05D5\u05D1! \u05E7\u05D9\u05D1\u05DC\u05E0\u05D5 \u05D0\u05EA \u05D4\u05D3\u05D9\u05E8\u05D5\u05D2 \u05D5\u05E0\u05DE\u05E9\u05D9\u05DA \u05DC\u05D4\u05E9\u05EA\u05E4\u05E8."
      : "Thank you for the feedback. We received your rating and appreciate it.";
  return { handled: true, replyText, entry: toEntry(latest) };
}
async function getPostTourReviewEntry(bookingId) {
  const row = await getPostTourReviewRequestByBookingId(bookingId);
  return row ? toEntry(row) : null;
}
async function getRecentPostTourReviewEntries(limit = 20) {
  const rows = await getRecentPostTourReviewRequests(limit);
  return rows.map(toEntry);
}
async function getWeeklyPostTourReviewMetric(referenceDate) {
  const stats = await getWeeklyPostTourReviewMetrics();
  const weekStart = referenceDate
    ? new Date(referenceDate.getTime() - 6 * 24 * 60 * 60 * 1e3).toISOString()
    : stats.windowStart;
  const weekEnd = referenceDate
    ? new Date(referenceDate).toISOString()
    : stats.windowEnd;
  const db = await getDb();
  let lowRatingExceptions = [];
  if (db) {
    const rows = await db
      .select()
      .from(postTourReviewRequests)
      .where(
        and16(
          sql21`${postTourReviewRequests.reviewedAt} IS NOT NULL`,
          sql21`${postTourReviewRequests.rating} <= 4`,
          gte8(postTourReviewRequests.reviewedAt, new Date(stats.windowStart)),
          lte6(postTourReviewRequests.reviewedAt, new Date(stats.windowEnd))
        )
      )
      .orderBy(desc24(postTourReviewRequests.reviewedAt));
    lowRatingExceptions = rows.map(row => ({
      bookingId: row.bookingId,
      customerName: row.customerName ?? "Guest",
      rating: row.rating ?? 0,
      comments: row.comments ?? null,
      reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
      followUpPath: row.opsFollowUpUrl ?? null,
    }));
  }
  return {
    weekStart,
    weekEnd,
    toursCompleted: stats.completedTours,
    requestsSent: stats.volume,
    reviewed: stats.reviewed,
    completionRate: stats.completionRate,
    lowRatingCount: stats.lowRatingExceptions,
    lowRatingExceptions,
  };
}
var HEBREW_REGEX,
  REVIEW_DELAY_SETTING_KEY,
  MIN_DELAY_MINUTES,
  MAX_DELAY_MINUTES,
  DEFAULT_DELAY_MINUTES,
  processPendingPostTourReviewRequests;
var init_postTourReviewService = __esm({
  "server/postTourReviewService.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_postTourReviewRequests();
    init_whatsapp();
    init_eliNotify();
    init_whatsappService();
    HEBREW_REGEX = /[\u0590-\u05FF]/;
    REVIEW_DELAY_SETTING_KEY = "post_tour_review_delay_minutes";
    MIN_DELAY_MINUTES = 30;
    MAX_DELAY_MINUTES = 60;
    DEFAULT_DELAY_MINUTES = 45;
    processPendingPostTourReviewRequests = processDuePostTourReviewRequests;
  },
});

// server/_core/llm.ts
var llm_exports = {};
__export(llm_exports, {
  invokeLLM: () => invokeLLM,
});
import OpenAI from "openai";
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
var ensureArray, normalizeContentPart, normalizeMessage, openaiClient;
var init_llm = __esm({
  "server/_core/llm.ts"() {
    "use strict";
    ensureArray = value => (Array.isArray(value) ? value : [value]);
    normalizeContentPart = part => {
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
    normalizeMessage = message => {
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
      const contentParts = ensureArray(message.content).map(
        normalizeContentPart
      );
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
    openaiClient = null;
  },
});

// server/whatsappService.ts
function getConfig() {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "";
  return { token, phoneNumberId, verifyToken };
}
function isWhatsAppConfigured() {
  const { token, phoneNumberId } = getConfig();
  return !!(token && phoneNumberId);
}
function detectLanguage2(text2) {
  return HEBREW_REGEX2.test(text2) ? "he" : "en";
}
async function sendWhatsAppMessage(to, text2) {
  const { token, phoneNumberId } = getConfig();
  if (!token || !phoneNumberId) {
    console.warn("[WhatsApp] API not configured \u2014 skipping sendMessage");
    return null;
  }
  try {
    const response = await fetch(
      `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text2 },
        }),
      }
    );
    if (!response.ok) {
      const errBody = await response.text();
      console.error("[WhatsApp] Send failed:", response.status, errBody);
      return null;
    }
    const data = await response.json();
    return data.messages?.[0]?.id ?? null;
  } catch (err) {
    console.error("[WhatsApp] Send error:", err);
    return null;
  }
}
function getAutoReply(messageText) {
  const normalizedText = messageText.toLowerCase().trim();
  const lang = detectLanguage2(messageText);
  for (const rule of AUTO_REPLY_RULES) {
    for (const keyword of rule.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        return {
          reply: lang === "he" ? rule.replyHe : rule.replyEn,
          isAutoReply: true,
        };
      }
    }
  }
  return {
    reply: lang === "he" ? DEFAULT_REPLY_HE : DEFAULT_REPLY_EN,
    isAutoReply: true,
  };
}
async function handleIncomingMessage(message) {
  const { from, name, text: text2, messageId } = message;
  let matchedPostTourBookingId = null;
  let guestReference = buildGuestReference({ phone: from });
  try {
    const latestRequest = await getLatestPostTourRequestEventByPhone(from);
    if (latestRequest?.bookingId) {
      matchedPostTourBookingId = latestRequest.bookingId;
      guestReference = buildGuestReference({
        bookingId: latestRequest.bookingId,
        phone: from,
      });
    }
    await createPostTourReviewEvent({
      bookingId: matchedPostTourBookingId,
      channel: "whatsapp",
      state: "response_received",
      guestReference,
      guestPhone: from,
      guestName: name ?? null,
      externalMessageId: messageId ?? null,
      dedupeKey: buildPostTourReviewDedupeKey({
        state: "response_received",
        bookingId: matchedPostTourBookingId,
        guestReference,
        externalMessageId: messageId ?? null,
      }),
      metadata: {
        inboundTextPreview: text2.slice(0, 240),
      },
    });
  } catch (err) {
    console.error("[WhatsApp] Failed to track post-tour response event:", err);
  }
  try {
    await createWhatsAppMessage({
      direction: "incoming",
      phoneNumber: from,
      customerName: name ?? null,
      messageText: text2,
      messageType: "text",
      isAutoReply: 0,
      status: "delivered",
      whatsappMessageId: messageId ?? null,
    });
  } catch (err) {
    console.error("[WhatsApp] Failed to log incoming message:", err);
  }
  try {
    const { handlePostTourReviewReply: handlePostTourReviewReply2 } =
      await Promise.resolve().then(
        () => (init_postTourReviewService(), postTourReviewService_exports)
      );
    const reviewReply = await handlePostTourReviewReply2({ from, text: text2 });
    if (reviewReply.handled) {
      if (reviewReply.replyText) {
        const sentMessageId2 = await sendWhatsAppMessage(
          from,
          reviewReply.replyText
        );
        try {
          await createWhatsAppMessage({
            direction: "outgoing",
            phoneNumber: from,
            customerName: name ?? null,
            messageText: reviewReply.replyText,
            messageType: "text",
            isAutoReply: 0,
            status: sentMessageId2 ? "sent" : "failed",
            whatsappMessageId: sentMessageId2 ?? null,
          });
        } catch (err) {
          console.error(
            "[WhatsApp] Failed to log post-tour review reply:",
            err
          );
        }
      }
      return;
    }
  } catch (err) {
    console.error("[WhatsApp] Post-tour review processing failed:", err);
  }
  const { getSetting: getSetting2 } = await Promise.resolve().then(
    () => (init_db(), db_exports)
  );
  const autoReplyEnabled = await getSetting2("whatsapp_auto_reply_enabled");
  if (
    autoReplyEnabled === false ||
    autoReplyEnabled === "false" ||
    autoReplyEnabled === 0
  ) {
    return;
  }
  const { reply, isAutoReply } = getAutoReply(text2);
  const sentMessageId = await sendWhatsAppMessage(from, reply);
  try {
    await createWhatsAppMessage({
      direction: "outgoing",
      phoneNumber: from,
      customerName: name ?? null,
      messageText: reply,
      messageType: "auto-reply",
      isAutoReply: isAutoReply ? 1 : 0,
      status: sentMessageId ? "sent" : "failed",
      whatsappMessageId: sentMessageId ?? null,
    });
  } catch (err) {
    console.error("[WhatsApp] Failed to log outgoing auto-reply:", err);
  }
  if (sentMessageId) {
    try {
      await createPostTourReviewEvent({
        bookingId: matchedPostTourBookingId,
        channel: "whatsapp",
        state: "follow_up_sent",
        guestReference,
        guestPhone: from,
        guestName: name ?? null,
        externalMessageId: sentMessageId,
        dedupeKey: buildPostTourReviewDedupeKey({
          state: "follow_up_sent",
          bookingId: matchedPostTourBookingId,
          guestReference,
          externalMessageId: sentMessageId,
        }),
        metadata: {
          autoReply: true,
          replyLength: reply.length,
        },
      });
    } catch (err) {
      console.error(
        "[WhatsApp] Failed to track post-tour follow-up event:",
        err
      );
    }
  }
  draftAndNotifyEli(from, name, text2).catch(err => {
    console.error("[WhatsApp] Eli draft/notify failed:", err);
  });
}
function detectWsLanguage(text2) {
  if (HEBREW_REGEX2.test(text2)) return "he";
  if (/[\u0E00-\u0E7F]/.test(text2)) return "th";
  return "en";
}
async function draftAndNotifyEli(phoneNumber, name, message) {
  const lang = detectWsLanguage(message);
  const SYSTEM_PROMPT2 = `You are a helpful assistant for WIRO 4x4, a kosher off-road tour company in Chiang Mai, Thailand.

Tour prices:
- Doi Inthanon: \u0E3F3,500/person
- Doi Suthep: \u0E3F2,000/person
- Mae Wang: \u0E3F3,500/person
- Multi-day packages from \u0E3F7,500

Reply in the SAME LANGUAGE as the customer. Keep the reply short (1-2 sentences), warm, and helpful. If the customer wants to book or asks about specific pricing/availability, politely invite them to WhatsApp: +66 92-989-4495.`;
  let draft =
    "Hi! Thanks for reaching out. A team member will get back to you soon.";
  try {
    const { invokeLLM: invokeLLM2 } = await Promise.resolve().then(
      () => (init_llm(), llm_exports)
    );
    const result = await invokeLLM2({
      messages: [
        { role: "system", content: SYSTEM_PROMPT2 },
        { role: "user", content: message },
      ],
      maxTokens: 200,
    });
    const raw = result.choices[0]?.message?.content;
    const text2 =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? (raw.find(p => p.type === "text")?.text ?? "")
          : "";
    if (text2.trim().length > 0) {
      draft = text2.trim();
    }
  } catch (err) {
    console.warn("[WhatsApp] LLM draft failed, using fallback:", err);
  }
  try {
    const { notifyWhatsAppMessage: notifyWhatsAppMessage2 } =
      await Promise.resolve().then(() => (init_eliNotify(), eliNotify_exports));
    await notifyWhatsAppMessage2({
      phoneNumber,
      name,
      language: lang,
      message,
      draftReply: draft,
    });
  } catch (err) {
    console.error("[WhatsApp] notifyWhatsAppMessage failed:", err);
  }
}
async function sendManualMessage(to, text2) {
  const sentMessageId = await sendWhatsAppMessage(to, text2);
  try {
    await createWhatsAppMessage({
      direction: "outgoing",
      phoneNumber: to,
      customerName: null,
      messageText: text2,
      messageType: "text",
      isAutoReply: 0,
      status: sentMessageId ? "sent" : "failed",
      whatsappMessageId: sentMessageId ?? null,
    });
  } catch (err) {
    console.error("[WhatsApp] Failed to log manual message:", err);
  }
  return { success: !!sentMessageId, messageId: sentMessageId };
}
function getVerifyToken() {
  return getConfig().verifyToken;
}
var HEBREW_REGEX2,
  WHATSAPP_API_BASE,
  SITE_URL,
  AUTO_REPLY_RULES,
  DEFAULT_REPLY_EN,
  DEFAULT_REPLY_HE;
var init_whatsappService = __esm({
  "server/whatsappService.ts"() {
    "use strict";
    init_db();
    HEBREW_REGEX2 = /[\u0590-\u05FF]/;
    WHATSAPP_API_BASE = "https://graph.facebook.com/v19.0";
    SITE_URL = "https://www.wiro4x4indochina.com";
    AUTO_REPLY_RULES = [
      {
        keywords: [
          "price",
          "pricing",
          "cost",
          "how much",
          "\u05DE\u05D7\u05D9\u05E8",
          "\u05E2\u05DC\u05D5\u05EA",
          "\u05DB\u05DE\u05D4 \u05E2\u05D5\u05DC\u05D4",
        ],
        replyEn: `Our tour prices start from 3,500 THB per person. Check our full pricing and trip cost estimator here:
${SITE_URL}/pricing
${SITE_URL}/estimate`,
        replyHe: `\u05DE\u05D7\u05D9\u05E8\u05D9 \u05D4\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05E9\u05DC\u05E0\u05D5 \u05DE\u05EA\u05D7\u05D9\u05DC\u05D9\u05DD \u05DE-3,500 \u05D1\u05D8 \u05DC\u05D0\u05D3\u05DD. \u05D1\u05D3\u05E7\u05D5 \u05D0\u05EA \u05D4\u05DE\u05D7\u05D9\u05E8\u05D5\u05DF \u05D4\u05DE\u05DC\u05D0 \u05D5\u05DE\u05D7\u05E9\u05D1\u05D5\u05DF \u05D4\u05E2\u05DC\u05D5\u05D9\u05D5\u05EA \u05DB\u05D0\u05DF:
${SITE_URL}/pricing
${SITE_URL}/estimate`,
      },
      {
        keywords: [
          "book",
          "booking",
          "reserve",
          "reservation",
          "\u05D4\u05D6\u05DE\u05E0\u05D4",
          "\u05DC\u05D4\u05D6\u05DE\u05D9\u05DF",
          "\u05D4\u05D6\u05DE\u05DF",
        ],
        replyEn: `Ready to book your adventure? Fill out our booking form here:
${SITE_URL}/booking

Or tell us your preferred dates and group size and we'll prepare a custom quote!`,
        replyHe: `\u05DE\u05D5\u05DB\u05E0\u05D9\u05DD \u05DC\u05D4\u05D6\u05DE\u05D9\u05DF \u05D0\u05EA \u05D4\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05E9\u05DC\u05DB\u05DD? \u05DE\u05DC\u05D0\u05D5 \u05D0\u05EA \u05D8\u05D5\u05E4\u05E1 \u05D4\u05D4\u05D6\u05DE\u05E0\u05D4 \u05DB\u05D0\u05DF:
${SITE_URL}/booking

\u05D0\u05D5 \u05E1\u05E4\u05E8\u05D5 \u05DC\u05E0\u05D5 \u05E2\u05DC \u05D4\u05EA\u05D0\u05E8\u05D9\u05DB\u05D9\u05DD \u05D4\u05DE\u05D5\u05E2\u05D3\u05E4\u05D9\u05DD \u05D5\u05D2\u05D5\u05D3\u05DC \u05D4\u05E7\u05D1\u05D5\u05E6\u05D4 \u05D5\u05E0\u05DB\u05D9\u05DF \u05DC\u05DB\u05DD \u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 \u05DE\u05D5\u05EA\u05D0\u05DE\u05EA!`,
      },
      {
        keywords: [
          "kosher",
          "\u05DB\u05E9\u05E8",
          "\u05DB\u05E9\u05E8\u05D5\u05EA",
          "kosher food",
          "kosher meal",
        ],
        replyEn: `All our tours offer kosher meal options! We work with certified kosher restaurants and can arrange Shabbat-friendly accommodations.

Learn more: ${SITE_URL}/kosher-tours`,
        replyHe: `\u05DB\u05DC \u05D4\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05E9\u05DC\u05E0\u05D5 \u05DE\u05E6\u05D9\u05E2\u05D9\u05DD \u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D0\u05D5\u05DB\u05DC \u05DB\u05E9\u05E8! \u05D0\u05E0\u05D7\u05E0\u05D5 \u05E2\u05D5\u05D1\u05D3\u05D9\u05DD \u05E2\u05DD \u05DE\u05E1\u05E2\u05D3\u05D5\u05EA \u05DB\u05E9\u05E8\u05D5\u05EA \u05DE\u05D5\u05E1\u05DE\u05DB\u05D5\u05EA \u05D5\u05D9\u05DB\u05D5\u05DC\u05D9\u05DD \u05DC\u05D0\u05E8\u05D2\u05DF \u05DC\u05D9\u05E0\u05D4 \u05D9\u05D3\u05D9\u05D3\u05D5\u05EA\u05D9\u05EA \u05DC\u05E9\u05D1\u05EA.

\u05DE\u05D9\u05D3\u05E2 \u05E0\u05D5\u05E1\u05E3: ${SITE_URL}/kosher-tours`,
      },
      {
        keywords: [
          "tour",
          "tours",
          "trip",
          "trips",
          "excursion",
          "\u05D8\u05D9\u05D5\u05DC",
          "\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD",
          "\u05E1\u05D9\u05D5\u05E8",
        ],
        replyEn: `We offer 6 amazing off-road tours in Chiang Mai:

\u2022 Doi Inthanon \u2014 Roof of Thailand
\u2022 Mae Kampong \u2014 Hidden Village
\u2022 Sticky Waterfalls \u2014 Maerim
\u2022 Doi Suthep & Pui \u2014 Beyond the Temple
\u2022 Mae Wang \u2014 Jungle Wilderness
\u2022 Samoeng Loop \u2014 Mountain Circuit

Explore all tours: ${SITE_URL}/#tours`,
        replyHe: `\u05D0\u05E0\u05D7\u05E0\u05D5 \u05DE\u05E6\u05D9\u05E2\u05D9\u05DD 6 \u05D8\u05D9\u05D5\u05DC\u05D9 \u05E9\u05D8\u05D7 \u05DE\u05D3\u05D4\u05D9\u05DE\u05D9\u05DD \u05D1\u05E6'\u05D9\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9:

\u2022 \u05D3\u05D5\u05D9 \u05D0\u05D9\u05E0\u05EA\u05E0\u05D5\u05DF \u2014 \u05D2\u05D2 \u05EA\u05D0\u05D9\u05DC\u05E0\u05D3
\u2022 \u05DE\u05D0\u05D9 \u05E7\u05DE\u05E4\u05D5\u05E0\u05D2 \u2014 \u05DB\u05E4\u05E8 \u05E0\u05E1\u05EA\u05E8
\u2022 \u05DE\u05E4\u05DC\u05D9 \u05E1\u05D8\u05D9\u05E7\u05D9 \u2014 \u05DE\u05D0\u05D9\u05E8\u05D9\u05DD
\u2022 \u05D3\u05D5\u05D9 \u05E1\u05D5\u05EA\u05E4 \u05D5\u05E4\u05D5\u05D9 \u2014 \u05DE\u05E2\u05D1\u05E8 \u05DC\u05DE\u05E7\u05D3\u05E9
\u2022 \u05DE\u05D0\u05D9 \u05D5\u05D5\u05D0\u05E0\u05D2 \u2014 \u05D2'\u05D5\u05E0\u05D2\u05DC \u05E4\u05E8\u05D0\u05D9
\u2022 \u05DC\u05D5\u05DC\u05D0\u05EA \u05E1\u05DE\u05D5\u05D0\u05E0\u05D2 \u2014 \u05DE\u05E1\u05DC\u05D5\u05DC \u05D4\u05E8\u05D9\u05DD

\u05D2\u05DC\u05D5 \u05D0\u05EA \u05DB\u05DC \u05D4\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD: ${SITE_URL}/#tours`,
      },
      {
        keywords: [
          "help",
          "menu",
          "options",
          "info",
          "information",
          "\u05E2\u05D6\u05E8\u05D4",
          "\u05EA\u05E4\u05E8\u05D9\u05D8",
          "\u05DE\u05D9\u05D3\u05E2",
        ],
        replyEn: `Welcome to WIRO 4x4! How can we help?

Reply with:
\u2022 "tours" \u2014 See our tour options
\u2022 "price" \u2014 Get pricing info
\u2022 "book" \u2014 Start booking
\u2022 "kosher" \u2014 Kosher tour info

Or visit our website: ${SITE_URL}`,
        replyHe: `\u05D1\u05E8\u05D5\u05DB\u05D9\u05DD \u05D4\u05D1\u05D0\u05D9\u05DD \u05DC-WIRO 4x4! \u05D0\u05D9\u05DA \u05E0\u05D5\u05DB\u05DC \u05DC\u05E2\u05D6\u05D5\u05E8?

\u05D4\u05E9\u05D9\u05D1\u05D5 \u05E2\u05DD:
\u2022 "\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD" \u2014 \u05E8\u05D0\u05D5 \u05D0\u05EA \u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05D8\u05D9\u05D5\u05DC
\u2022 "\u05DE\u05D7\u05D9\u05E8" \u2014 \u05DE\u05D9\u05D3\u05E2 \u05E2\u05DC \u05DE\u05D7\u05D9\u05E8\u05D9\u05DD
\u2022 "\u05D4\u05D6\u05DE\u05E0\u05D4" \u2014 \u05D4\u05EA\u05D7\u05D9\u05DC\u05D5 \u05DC\u05D4\u05D6\u05DE\u05D9\u05DF
\u2022 "\u05DB\u05E9\u05E8" \u2014 \u05DE\u05D9\u05D3\u05E2 \u05E2\u05DC \u05DB\u05E9\u05E8\u05D5\u05EA

\u05D0\u05D5 \u05D1\u05E7\u05E8\u05D5 \u05D1\u05D0\u05EA\u05E8 \u05E9\u05DC\u05E0\u05D5: ${SITE_URL}`,
      },
    ];
    DEFAULT_REPLY_EN = `Thanks for reaching out to WIRO 4x4! \u{1F697}

A team member will reply shortly. Meanwhile, check out our website for tour info and booking:
${SITE_URL}

Reply "help" to see available options.`;
    DEFAULT_REPLY_HE = `\u05EA\u05D5\u05D3\u05D4 \u05E9\u05E4\u05E0\u05D9\u05EA\u05DD \u05DC-WIRO 4x4! \u{1F697}

\u05D0\u05D7\u05D3 \u05DE\u05D0\u05E0\u05E9\u05D9 \u05D4\u05E6\u05D5\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5 \u05D9\u05E2\u05E0\u05D4 \u05D1\u05E7\u05E8\u05D5\u05D1. \u05D1\u05D9\u05E0\u05EA\u05D9\u05D9\u05DD, \u05D1\u05E7\u05E8\u05D5 \u05D1\u05D0\u05EA\u05E8 \u05E9\u05DC\u05E0\u05D5 \u05DC\u05DE\u05D9\u05D3\u05E2 \u05E2\u05DC \u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05D5\u05D4\u05D6\u05DE\u05E0\u05D5\u05EA:
${SITE_URL}

\u05D4\u05E9\u05D9\u05D1\u05D5 "\u05E2\u05D6\u05E8\u05D4" \u05DC\u05E8\u05D0\u05D5\u05EA \u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D6\u05DE\u05D9\u05E0\u05D5\u05EA.`;
  },
});

// server/bookingReminder.ts
var bookingReminder_exports = {};
__export(bookingReminder_exports, {
  processReminders: () => processReminders,
  scheduleBookingReminder: () => scheduleBookingReminder,
});
import fs from "fs/promises";
async function readReminders() {
  try {
    const raw = await fs.readFile(REMINDER_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
async function writeReminders(entries) {
  await fs.writeFile(REMINDER_FILE, JSON.stringify(entries, null, 2), "utf-8");
}
async function scheduleBookingReminder(bookingId, departureDate) {
  const departure =
    typeof departureDate === "string" ? new Date(departureDate) : departureDate;
  const reminderTime = new Date(departure.getTime() - 24 * 60 * 60 * 1e3);
  const now = /* @__PURE__ */ new Date();
  if (reminderTime <= now) {
    console.log(
      `[BookingReminder] Booking #${bookingId} reminder time ${reminderTime.toISOString()} is in the past \u2014 skipping`
    );
    return;
  }
  const reminders = await readReminders();
  const filtered = reminders.filter(r => r.bookingId !== bookingId);
  filtered.push({
    bookingId,
    reminderTime: reminderTime.toISOString(),
    sent: false,
    createdAt: now.toISOString(),
  });
  await writeReminders(filtered);
  console.log(
    `[BookingReminder] Scheduled reminder for booking #${bookingId} at ${reminderTime.toISOString()}`
  );
}
async function processReminders() {
  const reminders = await readReminders();
  const now = /* @__PURE__ */ new Date();
  let sentCount = 0;
  const updated = [];
  for (const entry of reminders) {
    if (entry.sent) {
      updated.push(entry);
      continue;
    }
    const reminderTime = new Date(entry.reminderTime);
    if (reminderTime <= now) {
      try {
        await sendReminderTelegram(entry.bookingId, reminderTime);
        entry.sent = true;
        sentCount++;
      } catch (err) {
        console.error(
          `[BookingReminder] Failed to send reminder for booking #${entry.bookingId}:`,
          err
        );
      }
    }
    updated.push(entry);
  }
  await writeReminders(updated);
  console.log(
    `[BookingReminder] Processed reminders: ${sentCount} sent, ${updated.filter(r => !r.sent).length} pending`
  );
  return sentCount;
}
async function sendReminderTelegram(bookingId, reminderTime) {
  const { notifyBookingReminder: notifyBookingReminder2 } =
    await Promise.resolve().then(() => (init_eliNotify(), eliNotify_exports));
  await notifyBookingReminder2({
    bookingId,
    reminderTime: reminderTime.toISOString(),
  });
}
var REMINDER_FILE;
var init_bookingReminder = __esm({
  "server/bookingReminder.ts"() {
    "use strict";
    REMINDER_FILE = "/tmp/wiro_reminders.json";
  },
});

// server/upsellService.ts
var upsellService_exports = {};
__export(upsellService_exports, {
  processUpsells: () => processUpsells,
  scheduleUpsell: () => scheduleUpsell,
});
import fs2 from "fs/promises";
async function readUpsells() {
  try {
    const raw = await fs2.readFile(UPSELL_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
async function writeUpsells(entries) {
  await fs2.writeFile(UPSELL_FILE, JSON.stringify(entries, null, 2), "utf-8");
}
async function scheduleUpsell(params) {
  const completed =
    typeof params.completedAt === "string"
      ? new Date(params.completedAt)
      : params.completedAt;
  const sendTime = new Date(completed.getTime() + 3 * 24 * 60 * 60 * 1e3);
  const now = /* @__PURE__ */ new Date();
  const upsells = await readUpsells();
  const filtered = upsells.filter(u => u.bookingId !== params.bookingId);
  filtered.push({
    bookingId: params.bookingId,
    customerName: params.customerName,
    customerEmail: params.customerEmail ?? null,
    sendTime: sendTime.toISOString(),
    sent: false,
    createdAt: now.toISOString(),
  });
  await writeUpsells(filtered);
  console.log(
    `[Upsell] Scheduled upsell for booking #${params.bookingId} at ${sendTime.toISOString()}`
  );
}
async function processUpsells() {
  const upsells = await readUpsells();
  const now = /* @__PURE__ */ new Date();
  let sentCount = 0;
  const updated = [];
  for (const entry of upsells) {
    if (entry.sent) {
      updated.push(entry);
      continue;
    }
    const sendTime = new Date(entry.sendTime);
    if (sendTime <= now) {
      try {
        await sendUpsellEmail(entry);
        await sendUpsellTelegram(entry);
        entry.sent = true;
        sentCount++;
      } catch (err) {
        console.error(
          `[Upsell] Failed to send upsell for booking #${entry.bookingId}:`,
          err
        );
      }
    }
    updated.push(entry);
  }
  await writeUpsells(updated);
  console.log(
    `[Upsell] Processed upsells: ${sentCount} sent, ${updated.filter(u => !u.sent).length} pending`
  );
  return sentCount;
}
async function sendUpsellEmail(entry) {
  if (!entry.customerEmail) {
    console.log(
      `[Upsell] No email for booking #${entry.bookingId} \u2014 skipping email`
    );
    return;
  }
  const { Resend: Resend8 } = await import("resend");
  const resend = new Resend8(process.env.RESEND_API_KEY);
  const html = buildUpsellHtml(entry.customerName);
  await resend.emails.send({
    from: "WIRO 4x4 <wiro.adventures@gmail.com>",
    to: entry.customerEmail,
    subject:
      "How was your WIRO 4x4 adventure? \u{1F3CE}\uFE0F We'd love to hear from you!",
    html,
  });
  console.log(`[Upsell] Email sent to ${entry.customerEmail}`);
}
function buildUpsellHtml(customerName) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>WIRO 4x4 \u2014 We'd love to have you back!</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color:#e67e22;">Hey ${customerName}! \u{1F3CE}\uFE0F</h2>
  <p>Hope you had an amazing time on your WIRO 4x4 adventure in Chiang Mai!</p>
  <p>We'd love to have you back for another tour. Here are some popular options:</p>
  <ul>
    <li><strong>Doi Inthanon</strong> \u2014 Thailand's highest peak, waterfalls & hill tribes \u2014 from \u0E3F3,500</li>
    <li><strong>Mae Wang Jungle</strong> \u2014 bamboo rafting, elephants & waterfalls \u2014 from \u0E3F3,500</li>
    <li><strong>Multi-Day Adventure</strong> \u2014 explore more of Northern Thailand \u2014 from \u0E3F7,500</li>
  </ul>
  <p>Reply to this email or message us on WhatsApp for the best availability!</p>
  <p style="margin-top:24px;">Safe travels,<br/><strong>Wiro & the WIRO 4x4 Team</strong></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="font-size:12px;color:#999;">
    WIRO 4x4 \u2014 Kosher Off-Road Adventures \xB7 Chiang Mai, Thailand<br/>
    <a href="https://wiro4x4indochina.com">wiro4x4indochina.com</a>
  </p>
</body>
</html>`;
}
async function sendUpsellTelegram(entry) {
  try {
    const { notifyUpsellSent: notifyUpsellSent2 } =
      await Promise.resolve().then(() => (init_eliNotify(), eliNotify_exports));
    await notifyUpsellSent2({
      bookingId: entry.bookingId,
      customerName: entry.customerName,
      customerEmail: entry.customerEmail ?? void 0,
    });
  } catch (err) {
    console.error("[Upsell] Telegram notify failed:", err);
  }
}
var UPSELL_FILE;
var init_upsellService = __esm({
  "server/upsellService.ts"() {
    "use strict";
    UPSELL_FILE = "/tmp/wiro_upsells.json";
  },
});

// server/competitorMonitor.ts
var competitorMonitor_exports = {};
__export(competitorMonitor_exports, {
  checkCompetitors: () => checkCompetitors,
});
async function fetchViatorPrices() {
  try {
    const response = await fetch(VIATOR_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!response.ok) {
      console.warn(
        `[CompetitorMonitor] Viator fetch failed: ${response.status}`
      );
      return [];
    }
    const html = await response.text();
    const pricePattern =
      /\$[\d,]+(?:\.\d{2})?|฿[\d,]+(?:\.\d{2})?|€[\d,]+(?:\.\d{2})?/g;
    const tourNamePattern =
      /class="(?:card|tour|title)"[^>]*>([^<]+)<\/(?:div|h|span)/gi;
    const prices = html.match(pricePattern) || [];
    const tourNames = html.match(tourNamePattern) || [];
    const result = [];
    for (let i = 0; i < Math.min(tourNames.length, prices.length); i++) {
      const name = tourNames[i]
        ?.replace(/class="[^"]*">/i, "")
        .replace(/<\/[^>]+>/, "")
        .trim();
      const priceStr = prices[i];
      if (!name || !priceStr) continue;
      let price = 0;
      let currency = "USD";
      if (priceStr.startsWith("$")) {
        currency = "USD";
        price = parseFloat(priceStr.replace(/[$,]/g, ""));
      } else if (priceStr.startsWith("\u0E3F")) {
        currency = "THB";
        price = parseFloat(priceStr.replace(/[฿,]/g, ""));
      } else if (priceStr.startsWith("\u20AC")) {
        currency = "EUR";
        price = parseFloat(priceStr.replace(/[€,]/g, ""));
      }
      if (price > 0 && name.length < 100) {
        result.push({ tourName: name, price, currency });
      }
    }
    console.log(
      `[CompetitorMonitor] Fetched ${result.length} competitor tours`
    );
    return result;
  } catch (err) {
    console.error("[CompetitorMonitor] Fetch error:", err);
    return [];
  }
}
function buildReport(viatorTours, wiroPrices) {
  const findings = [];
  if (viatorTours.length === 0) {
    findings.push("\u26A0\uFE0F  Could not fetch Viator pricing data");
  } else {
    const avgViatorPrice =
      viatorTours.reduce((sum3, t2) => sum3 + (t2.price ?? 0), 0) /
      viatorTours.length;
    const avgWiroPrice =
      Object.values(wiroPrices).reduce((a, b) => a + b, 0) /
      Object.keys(wiroPrices).length;
    findings.push(`Average Viator price: $${avgViatorPrice.toFixed(0)}`);
    findings.push(`Average WIRO price: \u0E3F${avgWiroPrice.toFixed(0)}`);
    const viatorInTHB = avgViatorPrice * 33;
    const diff = ((avgWiroPrice - viatorInTHB) / viatorInTHB) * 100;
    if (diff > 10) {
      findings.push(
        `\u{1F4C8} WIRO prices are ${diff.toFixed(0)}% higher than Viator`
      );
    } else if (diff < -10) {
      findings.push(
        `\u{1F4C9} WIRO prices are ${Math.abs(diff).toFixed(0)}% lower than Viator`
      );
    } else {
      findings.push("\u2705 WIRO prices are competitive");
    }
  }
  return {
    timestamp: /* @__PURE__ */ new Date().toISOString(),
    viatorTours,
    wiroPrices,
    findings,
  };
}
async function checkCompetitors() {
  const viatorTours = await fetchViatorPrices();
  const wiroPrices = {
    "Doi Inthanon": 3500,
    "Doi Suthep": 2e3,
    "Mae Wang": 3500,
    "Mae Kampong": 2500,
    "Sticky Waterfalls": 3e3,
    "Samoeng Loop": 3200,
  };
  const report = buildReport(viatorTours, wiroPrices);
  try {
    const { notifyCompetitorReport: notifyCompetitorReport2 } =
      await Promise.resolve().then(() => (init_eliNotify(), eliNotify_exports));
    const reportText =
      report.findings.join("\n") +
      `

\u{1F4CA} Data: ${viatorTours.length} Viator tours analyzed`;
    await notifyCompetitorReport2(reportText);
  } catch (err) {
    console.error("[CompetitorMonitor] Failed to notify Eli:", err);
  }
  return report;
}
var VIATOR_URL;
var init_competitorMonitor = __esm({
  "server/competitorMonitor.ts"() {
    "use strict";
    VIATOR_URL = "https://www.viator.com/Chiang-Mai/d343-ttd";
  },
});

// server/vercel-entry.ts
import "dotenv/config";
import helmet from "helmet";

// server/_core/app.ts
import express from "express";
import cors from "cors";
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
var COMPANY_EMAIL = "wiro.adventures@gmail.com";
var COMPANY_SENDER_EMAIL = "bookings@wiro4x4indochina.com";
var COMPANY_NAME = "WIRO 4x4 - Kosher Off-Road Adventures";
var COMPANY_WEBSITE = "https://www.wiro4x4indochina.com";
var EMAIL_SENDERS = {
  bookings: "bookings@wiro4x4indochina.com",
  updates: "updates@wiro4x4indochina.com",
  support: "support@wiro4x4indochina.com",
};

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
    .setExpirationTime("7d")
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

// server/routes/authRoutes.ts
init_db();
init_connection();
init_schema();
import { eq as eq27, and as and15, gt } from "drizzle-orm";
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
          const { Resend: Resend8 } = await import("resend");
          const apiKey = process.env.RESEND_API_KEY;
          if (apiKey) {
            const resend = new Resend8(apiKey);
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
          and15(
            eq27(passwordResetTokens.token, body.token),
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
        .where(eq27(passwordResetTokens.id, resetRecord.id));
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
init_db();
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
init_db();
function escapeXml2(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
var STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily", lastmod: "2026-05-18" },
  {
    path: "/tours",
    priority: "0.9",
    changefreq: "weekly",
    lastmod: "2026-05-18",
  },
  {
    path: "/packages",
    priority: "0.9",
    changefreq: "weekly",
    lastmod: "2026-05-18",
  },
  {
    path: "/packages/northern-thailand-3d2n",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/packages/grand-tour-laos-14d",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/pricing",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/estimate",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/book",
    priority: "0.4",
    changefreq: "yearly",
    lastmod: "2026-05-18",
  },
  {
    path: "/blog",
    priority: "0.8",
    changefreq: "weekly",
    lastmod: "2026-05-18",
  },
  {
    path: "/gallery",
    priority: "0.8",
    changefreq: "weekly",
    lastmod: "2026-05-18",
  },
  {
    path: "/reviews",
    priority: "0.8",
    changefreq: "weekly",
    lastmod: "2026-05-18",
  },
  {
    path: "/kosher-tours",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/hebrew-guide",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/accessible-tours",
    priority: "0.9",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/faq",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/contact",
    priority: "0.8",
    changefreq: "monthly",
    lastmod: "2026-05-18",
  },
  {
    path: "/terms",
    priority: "0.3",
    changefreq: "yearly",
    lastmod: "2025-06-01",
  },
  {
    path: "/privacy",
    priority: "0.3",
    changefreq: "yearly",
    lastmod: "2025-06-01",
  },
];
function formatDate(date) {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}
function buildHreflangLinks(siteUrl, path2) {
  const escaped = escapeXml2(siteUrl);
  const escapedPath = escapeXml2(path2);
  const links = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${escaped}${escapedPath}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escaped}${escapedPath}"/>`,
  ];
  if (path2 === "/hebrew-guide") {
    links.unshift(
      `    <xhtml:link rel="alternate" hreflang="he" href="${escaped}${escapedPath}"/>`
    );
  }
  return links.join("\n");
}
function buildUrlEntry(siteUrl, path2, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${escapeXml2(siteUrl)}${escapeXml2(path2)}</loc>
${
  lastmod
    ? `    <lastmod>${lastmod}</lastmod>
`
    : ""
}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${buildHreflangLinks(siteUrl, path2)}
  </url>`;
}
function uniqueByPath(entries) {
  const seen = /* @__PURE__ */ new Set();
  return entries.filter(entry => {
    if (seen.has(entry.path)) return false;
    seen.add(entry.path);
    return true;
  });
}
function generateSitemap(tours2, blogs, packages, siteUrl) {
  const cleanSiteUrl = siteUrl.replace(/\/+$/, "");
  const entries = uniqueByPath([
    ...STATIC_PAGES,
    ...tours2
      .map(t2 => ({
        path: `/tours/${t2.slug}`,
        lastmod: formatDate(t2.updatedAt),
        changefreq: "weekly",
        priority: "0.85",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    ...packages
      .map(p => ({
        path: `/packages/${p.slug}`,
        lastmod: formatDate(p.updatedAt),
        changefreq: "monthly",
        priority: "0.8",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
    ...blogs
      .map(b => ({
        path: `/blog/${b.slug}`,
        lastmod: formatDate(b.publishedAt),
        changefreq: "monthly",
        priority: "0.6",
      }))
      .sort((a, b) => a.path.localeCompare(b.path)),
  ]);
  const urls = entries
    .map(p =>
      buildUrlEntry(cleanSiteUrl, p.path, p.lastmod, p.changefreq, p.priority)
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
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
        tours2.map(t2 => ({
          slug: t2.slug,
          updatedAt: t2.updatedAt,
        })),
        blogs.map(b => ({
          slug: b.slug,
          publishedAt: b.publishedAt,
        })),
        packages.map(p => ({
          slug: p.slug,
          updatedAt: p.updatedAt,
        })),
        siteUrl
      );
      res.set("Content-Type", "application/xml; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Failed to generate:", err);
      res.status(500).send("Failed to generate sitemap");
    }
  });
}

// server/routes/whatsapp.ts
init_whatsappService();
init_db();
import crypto from "crypto";

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
    const count5 = await redis.incr(redisKey);
    if (count5 === 1) {
      await redis.expire(redisKey, ttlSeconds);
    }
    const resetAt = (windowId + 1) * windowMs;
    const allowed = count5 <= maxRequests;
    const remaining = Math.max(0, maxRequests - count5);
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

// server/routes/whatsapp.ts
init_postTourReviewService();

// server/n8nAutomation.ts
import { randomUUID } from "crypto";
function isDisabled(value) {
  return value
    ? ["0", "false", "no", "off"].includes(value.toLowerCase())
    : false;
}
function getTimeoutMs() {
  const configured = Number(process.env.N8N_WEBHOOK_TIMEOUT_MS ?? 5e3);
  if (!Number.isFinite(configured) || configured < 1e3) return 5e3;
  return Math.min(configured, 15e3);
}
function buildEventId(event) {
  return `${event}:${randomUUID()}`;
}
async function dispatchN8nEvent(event, payload) {
  if (isDisabled(process.env.N8N_AUTOMATION_ENABLED)) {
    return { dispatched: false, reason: "n8n_disabled" };
  }
  const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return { dispatched: false, reason: "n8n_webhook_not_configured" };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
  const envelope = {
    source: "wiro4x4",
    schemaVersion: 1,
    event,
    eventId: buildEventId(event),
    occurredAt: /* @__PURE__ */ new Date().toISOString(),
    payload,
  };
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Wiro-Event": event,
      "X-Wiro-Event-Id": envelope.eventId,
    };
    const secret = process.env.N8N_WEBHOOK_SECRET?.trim();
    if (secret) headers["X-Wiro-Automation-Secret"] = secret;
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error("[n8n] Webhook rejected event", {
        event,
        status: response.status,
      });
      return {
        dispatched: false,
        reason: "n8n_webhook_rejected",
        status: response.status,
      };
    }
    return { dispatched: true, reason: "sent", status: response.status };
  } catch (err) {
    console.error("[n8n] Webhook dispatch failed", { event, err });
    return { dispatched: false, reason: "n8n_webhook_failed" };
  } finally {
    clearTimeout(timeout);
  }
}
function dispatchN8nEventInBackground(event, payload) {
  dispatchN8nEvent(event, payload).catch(err => {
    console.error("[n8n] Unexpected dispatch failure", { event, err });
  });
}

// server/routes/whatsapp.ts
function verifyWebhookSignature(rawBody, signature) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    return true;
  }
  if (!signature) {
    console.warn("[WhatsApp] Missing X-Hub-Signature-256 header");
    return false;
  }
  const expectedSig =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  if (expectedSig.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
function registerWhatsAppWebhookRoute(app2) {
  app2.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === getVerifyToken()) {
      console.log("[WhatsApp] Webhook verified successfully");
      res.status(200).send(challenge || "OK");
    } else {
      console.warn(
        "[WhatsApp] Webhook verification failed \u2014 token mismatch"
      );
      res.sendStatus(403);
    }
  });
  app2.post("/api/whatsapp/webhook", async (req, res) => {
    const signature = req.headers["x-hub-signature-256"];
    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn("[WhatsApp] Invalid webhook signature \u2014 rejecting");
      res.sendStatus(403);
      return;
    }
    res.sendStatus(200);
    try {
      const body = req.body;
      if (body?.object !== "whatsapp_business_account") {
        return;
      }
      const entries = body.entry;
      if (!Array.isArray(entries)) return;
      for (const entry of entries) {
        const changes = entry.changes;
        if (!Array.isArray(changes)) continue;
        for (const change of changes) {
          if (change.field !== "messages") continue;
          const value = change.value;
          if (!value) continue;
          const statuses = value.statuses;
          if (Array.isArray(statuses)) {
            for (const status of statuses) {
              const waMessageId = status.id;
              const statusValue = status.status;
              if (
                waMessageId &&
                statusValue &&
                ["sent", "delivered", "read", "failed"].includes(statusValue)
              ) {
                try {
                  await updateWhatsAppMessageStatus(waMessageId, statusValue);
                  if (statusValue === "read") {
                    await recordPostTourReviewOpenedByMessageId(waMessageId);
                  }
                  dispatchN8nEventInBackground("whatsapp.status_updated", {
                    messageId: waMessageId,
                    status: statusValue,
                    rawStatus: status,
                  });
                } catch (err) {
                  console.error("[WhatsApp] Status update error:", err);
                }
              }
            }
          }
          const messages = value.messages;
          const contacts = value.contacts;
          if (!Array.isArray(messages)) continue;
          for (const msg of messages) {
            if (msg.type !== "text") continue;
            const from = msg.from;
            const text2 = msg.text?.body;
            const messageId = msg.id;
            if (!from || !text2) continue;
            const { allowed } = checkRateLimit(`wa:${from}`, 30, 60 * 60 * 1e3);
            if (!allowed) {
              console.warn(`[WhatsApp] Rate limited auto-reply for ${from}`);
              continue;
            }
            const contact = Array.isArray(contacts)
              ? contacts.find(c => c.wa_id === from)
              : void 0;
            const contactName = contact?.profile?.name;
            await handleIncomingMessage({
              from,
              name: contactName,
              text: text2,
              messageId,
            });
            dispatchN8nEventInBackground("whatsapp.message_received", {
              from,
              name: contactName ?? null,
              text: text2,
              messageId: messageId ?? null,
            });
          }
        }
      }
    } catch (err) {
      console.error("[WhatsApp] Webhook processing error:", err);
    }
  });
  if (isWhatsAppConfigured()) {
    console.log("[WhatsApp] Webhook routes registered (API configured)");
  } else {
    console.log(
      "[WhatsApp] Webhook routes registered (API not configured \u2014 auto-replies disabled)"
    );
  }
}

// server/routes/postTourReviewClick.ts
init_postTourReviewService();
var DEFAULT_REDIRECT = "https://wiro4x4indochina.com/reviews";
function registerPostTourReviewClickRoute(app2) {
  app2.get("/api/post-tour-review/click/:token", async (req, res) => {
    const token = String(req.params.token ?? "").trim();
    if (!token) {
      res.redirect(302, DEFAULT_REDIRECT);
      return;
    }
    try {
      const entry = await recordPostTourReviewClickByToken(token);
      if (!entry) {
        res.redirect(302, DEFAULT_REDIRECT);
        return;
      }
      const redirectUrl = `${DEFAULT_REDIRECT}?bookingId=${entry.bookingId}&source=whatsapp`;
      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[PostTourReview] Click tracking error:", error);
      res.redirect(302, DEFAULT_REDIRECT);
    }
  });
}

// server/routes/agentApi.ts
init_db();
init_analytics();
init_schema();
import { Router } from "express";
import {
  eq as eq29,
  desc as desc25,
  and as and17,
  gte as gte9,
} from "drizzle-orm";
var agentApi = Router();
agentApi.use((req, res, next) => {
  const key = req.headers["x-agent-key"];
  if (!process.env.WIRO_AGENT_KEY) {
    res.status(503).json({ error: "Agent API not configured" });
    return;
  }
  if (key !== process.env.WIRO_AGENT_KEY) {
    res.status(401).json({ error: "Invalid agent API key" });
    return;
  }
  next();
});
agentApi.get("/analytics/summary", async (_req, res) => {
  try {
    const overview = await getAnalyticsOverview();
    const topTours = await getTopTours();
    const funnel = await getLeadFunnel();
    res.json({ overview, topTours, funnel });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
agentApi.get("/analytics/top-pages", async (_req, res) => {
  try {
    const topTours = await getTopTours();
    res.json({ topTours });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch top pages" });
  }
});
agentApi.get("/bookings/pending", async (_req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      res.json({ count: 0, pending: [] });
      return;
    }
    const pending = await db
      .select()
      .from(bookings)
      .where(eq29(bookings.status, "pending"))
      .orderBy(desc25(bookings.createdAt))
      .limit(20);
    res.json({ count: pending.length, pending });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});
agentApi.get("/bookings/pipeline", async (_req, res) => {
  try {
    const funnel = await getLeadFunnel();
    res.json(funnel);
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch pipeline" });
  }
});
agentApi.get("/finance/summary", async (_req, res) => {
  try {
    const revenue = await getRevenueByMonth();
    res.json({ revenue });
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Failed to fetch finance data", detail: msg });
  }
});
agentApi.get("/activity/recent", async (_req, res) => {
  try {
    const activity = await getRecentActivity();
    res.json({ activity });
  } catch (_e) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});
agentApi.get("/whatsapp/recent", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      res.json({ count: 0, messages: [] });
      return;
    }
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1e3);
    const messages = await db
      .select()
      .from(whatsappMessages)
      .where(
        and17(
          eq29(whatsappMessages.direction, "incoming"),
          gte9(whatsappMessages.createdAt, since)
        )
      )
      .orderBy(desc25(whatsappMessages.createdAt))
      .limit(20);
    res.json({ count: messages.length, messages });
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Failed to fetch WhatsApp messages", detail: msg });
  }
});
agentApi.post("/eli/dispatch", async (req, res) => {
  try {
    const { task, agentId } = req.body;
    console.log(`[EliDispatch] ${agentId}: ${task}`);
    res.json({ received: true, agentId, task });
  } catch (_e) {
    res.status(500).json({ error: "Dispatch failed" });
  }
});
agentApi.get("/chat/context", async (_req, res) => {
  try {
    const { getAllActiveTours: getAllActiveTours2 } =
      await Promise.resolve().then(() => (init_db(), db_exports));
    const tours2 = await getAllActiveTours2();
    const tourList = tours2.slice(0, 10).map(t2 => ({
      name: t2.name,
      price: t2.price,
      duration: t2.duration,
      description:
        typeof t2.description === "string" ? t2.description.slice(0, 100) : "",
    }));
    res.json({
      tours: tourList,
      updatedAt: /* @__PURE__ */ new Date().toISOString(),
    });
  } catch (_e) {
    res.json({
      tours: [],
      updatedAt: /* @__PURE__ */ new Date().toISOString(),
    });
  }
});
agentApi.get("/reminders/process", async (_req, res) => {
  try {
    const { processReminders: processReminders3 } =
      await Promise.resolve().then(
        () => (init_bookingReminder(), bookingReminder_exports)
      );
    const sent = await processReminders3();
    res.json({ success: true, remindersSent: sent });
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : "Unknown error";
    res.status(500).json({ error: "Failed to process reminders", detail: msg });
  }
});
agentApi.get("/upsells/process", async (_req, res) => {
  try {
    const { processUpsells: processUpsells2 } = await Promise.resolve().then(
      () => (init_upsellService(), upsellService_exports)
    );
    const sent = await processUpsells2();
    res.json({ success: true, upsellsSent: sent });
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : "Unknown error";
    res.status(500).json({ error: "Failed to process upsells", detail: msg });
  }
});
agentApi.get("/post-tour-reviews/process", async (_req, res) => {
  try {
    const {
      processDuePostTourReviewRequests: processDuePostTourReviewRequests2,
    } = await Promise.resolve().then(
      () => (init_postTourReviewService(), postTourReviewService_exports)
    );
    const result = await processDuePostTourReviewRequests2();
    res.json({ success: true, ...result });
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Failed to process post-tour reviews", detail: msg });
  }
});
agentApi.get("/post-tour-reviews/weekly-metric", async (_req, res) => {
  try {
    const { getWeeklyPostTourReviewMetric: getWeeklyPostTourReviewMetric2 } =
      await Promise.resolve().then(
        () => (init_postTourReviewService(), postTourReviewService_exports)
      );
    const metric = await getWeeklyPostTourReviewMetric2();
    res.json(metric);
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Failed to fetch weekly metric", detail: msg });
  }
});
agentApi.get("/competitor/check", async (_req, res) => {
  try {
    const { checkCompetitors: checkCompetitors2 } =
      await Promise.resolve().then(
        () => (init_competitorMonitor(), competitorMonitor_exports)
      );
    const report = await checkCompetitors2();
    res.json({ ok: true, report });
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : "Unknown error";
    res.status(500).json({ error: "Competitor check failed", detail: msg });
  }
});
function registerAgentApiRoutes(app2) {
  app2.use("/api/agent", agentApi);
}

// server/routes/chatApi.ts
import Anthropic from "@anthropic-ai/sdk";
init_eliNotify();

// server/availabilityHelper.ts
init_connection();
init_schema();
import { eq as eq30, and as and18 } from "drizzle-orm";
async function checkAvailability(dateStr) {
  const db = await getDb();
  if (!db) return [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return [];
  try {
    const { getAllActiveTours: getAllActiveTours2 } =
      await Promise.resolve().then(() => (init_db(), db_exports));
    const tours2 = await getAllActiveTours2();
    const results = [];
    for (const tour of tours2) {
      const tourId = tour.id;
      const records = await db
        .select()
        .from(tourAvailability)
        .where(
          and18(
            eq30(tourAvailability.tourId, tourId),
            eq30(tourAvailability.date, dateStr)
          )
        )
        .limit(1);
      const record = records[0];
      if (!record) {
        results.push({
          date: dateStr,
          tourId,
          tourName: tour.name ?? "Unknown Tour",
          available: 10,
          isBlocked: false,
        });
      } else if (record.isBlocked) {
        results.push({
          date: dateStr,
          tourId,
          tourName: tour.name ?? "Unknown Tour",
          available: 0,
          isBlocked: true,
        });
      } else {
        results.push({
          date: dateStr,
          tourId,
          tourName: tour.name ?? "Unknown Tour",
          available: record.maxSlots - record.bookedSlots,
          isBlocked: false,
        });
      }
    }
    return results;
  } catch (err) {
    console.error("[AvailabilityHelper] checkAvailability error:", err);
    return [];
  }
}
function extractDateFromMessage(message) {
  const isoMatch = message.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];
  const dmyMatch = message.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const thaiMonths = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };
  const monthNameMatch = message.match(
    /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i
  );
  if (monthNameMatch) {
    const day = parseInt(monthNameMatch[1]);
    const monthNum = thaiMonths[monthNameMatch[2].toLowerCase()];
    const year = /* @__PURE__ */ new Date().getFullYear();
    return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  const nameDateMatch = message.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i
  );
  if (nameDateMatch) {
    const monthNum = thaiMonths[nameDateMatch[1].toLowerCase()];
    const day = parseInt(nameDateMatch[2]);
    const year = /* @__PURE__ */ new Date().getFullYear();
    return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return null;
}

// server/routes/chatApi.ts
var _client = null;
function getClient() {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required for chat"
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}
var WIRO_CONTEXT = `
You are Eli, the AI assistant and business partner for WIRO 4x4.

## Who You Are:
- Name: Eli
- Role: Personal AI assistant for WIRO 4x4 customers
- Personality: Warm, knowledgeable, direct, helpful \u2014 not a corporate chatbot
- You know Northern Thailand deeply and genuinely love helping travelers plan adventures
- You speak naturally in the customer's language \u2014 no stiff formal language

You are the helpful AI assistant for WIRO 4x4, a kosher off-road tour company based in Chiang Mai, Northern Thailand.

## About WIRO 4x4:
- Specializes in authentic 4x4 off-road adventures in Northern Thailand
- Primary audience: Jewish/Israeli travelers seeking kosher-friendly tours
- All tours can be arranged with kosher meals
- Hebrew-speaking guide (Wiro) available
- Based in Chiang Mai, Thailand

## Available Tours:
1. **Doi Inthanon - Roof of Thailand** - Visit Thailand's highest peak (2,565m), royal pagodas, Karen hill tribe villages, waterfalls. Full day, \u0E3F3,500/person.
2. **Mae Kampong Hidden Village** - Traditional Lanna village, bamboo bridges, coffee plantations, local crafts. Half day to full day, from \u0E3F2,500/person.
3. **Maerim Sticky Waterfalls** - Unique limestone waterfalls you can climb, elephants (ethical sanctuaries), orchid farms. Full day, \u0E3F3,000/person.
4. **Doi Suthep & Pui National Park** - Beyond the temple, through jungle trails, Hmong villages, panoramic views. Half day to full day, from \u0E3F2,000/person.
5. **Mae Wang Jungle Wilderness** - Bamboo rafting, jungle trekking, elephant experience, waterfalls. Full day, \u0E3F3,500/person.
6. **Samoeng Loop Mountain Circuit** - Scenic mountain roads, local markets, hot springs, authentic villages. Full day, \u0E3F3,200/person.

## Multi-Day Packages:
- 2-Day Adventure: \u0E3F7,500/person
- 3-Day Explorer: \u0E3F12,000/person
- 5-Day Ultimate: \u0E3F22,000/person
(Packages include accommodation, some meals, and multiple tours)

## Kosher Information:
- Kosher meals can be arranged for all tours (advance notice required)
- We work with local kosher suppliers and can coordinate with Chabad Chiang Mai
- Shabbat-friendly scheduling available
- Can arrange kosher accommodation recommendations

## Contact:
- WhatsApp: +66 92-989-4495
- Website: www.wiro4x4indochina.com
- Email: wiro.adventures@gmail.com

## Your Role:
1. Answer questions about tours, availability, and experiences in the user's preferred language
2. Be genuinely helpful \u2014 skip the filler phrases like "Great question!" or "I'd be happy to help" \u2014 just help
3. Have opinions: suggest the best tour for their group, be honest about difficulty levels, recommend best seasons
4. When users ask about SPECIFIC PRICING beyond what's listed, or want to BOOK a tour, or need to discuss custom arrangements \u2192 connect them to WhatsApp personally
5. Detect the conversation language and respond accordingly (English, Hebrew, or Thai)
6. Keep responses concise but informative \u2014 bullet points first, details if asked
7. Use emojis naturally, not excessively

## IMPORTANT ESCALATION RULES:
When the user:
- Asks for a specific quote or final price for their group
- Wants to book or reserve a tour
- Asks about availability for specific dates
- Requests custom tour arrangements
- Mentions payment or deposits

\u2192 Provide helpful context but ALWAYS include: "For booking and personalized pricing, please contact us on WhatsApp: +66 92-989-4495" and the response should indicate escalation.
`;
var LANGUAGE_INSTRUCTIONS = {
  en: "Respond in English. Be friendly and professional.",
  he: "Respond in Hebrew (\u05E2\u05D1\u05E8\u05D9\u05EA). Use natural Hebrew, not machine-translated. Israeli travelers appreciate a warm, direct communication style.",
  th: "Respond in Thai (\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22). Use polite Thai with appropriate particles (\u0E04\u0E23\u0E31\u0E1A/\u0E04\u0E48\u0E30). Be helpful and respectful.",
};
function buildSystemPrompt(language, availabilityInfo) {
  const avail = availabilityInfo
    ? `

## Live Availability:
${availabilityInfo}`
    : "";
  return `${WIRO_CONTEXT}${avail}

## Language Instruction:
${LANGUAGE_INSTRUCTIONS[language]}

Remember: Be helpful but guide booking/pricing inquiries to WhatsApp for personal attention.`;
}
function shouldEscalate(content, userMessage) {
  const escalationKeywords = [
    // Booking intent
    "book",
    "reserve",
    "reservation",
    "\u05DC\u05D4\u05D6\u05DE\u05D9\u05DF",
    "\u05D4\u05D6\u05DE\u05E0\u05D4",
    "\u0E08\u0E2D\u0E07",
    "\u0E2A\u0E33\u0E23\u0E2D\u0E07",
    // Pricing/payment
    "how much",
    "price for",
    "cost for",
    "quote",
    "deposit",
    "payment",
    "\u05DB\u05DE\u05D4 \u05E2\u05D5\u05DC\u05D4",
    "\u05DE\u05D7\u05D9\u05E8",
    "\u05EA\u05E9\u05DC\u05D5\u05DD",
    "\u0E23\u0E32\u0E04\u0E32",
    "\u0E08\u0E48\u0E32\u0E22",
    // Availability
    "available on",
    "availability",
    "next week",
    "this month",
    "\u05E4\u05E0\u05D5\u05D9",
    "\u05EA\u05D0\u05E8\u05D9\u05DA",
    "\u0E27\u0E48\u0E32\u0E07",
    "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48",
    // Custom requests
    "customize",
    "custom tour",
    "special request",
    "\u05D1\u05D4\u05EA\u05D0\u05DE\u05D4",
    "\u0E1E\u0E34\u0E40\u0E28\u0E29",
  ];
  const combined = (content + " " + userMessage).toLowerCase();
  return escalationKeywords.some(keyword =>
    combined.includes(keyword.toLowerCase())
  );
}
function detectLanguage3(message, declaredLanguage) {
  if (/[\u0590-\u05FF]/.test(message)) return "he";
  if (/[\u0E00-\u0E7F]/.test(message)) return "th";
  return declaredLanguage;
}
function isValidLanguage(lang) {
  return lang === "en" || lang === "he" || lang === "th";
}
function isValidHistory(history) {
  if (!Array.isArray(history)) return false;
  return history.every(
    msg =>
      typeof msg === "object" &&
      msg !== null &&
      (msg.role === "user" || msg.role === "assistant") &&
      typeof msg.content === "string"
  );
}
function registerChatApiRoute(app2) {
  app2.post("/api/chat", async (req, res) => {
    try {
      const body = req.body;
      if (!body.message || typeof body.message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      if (body.message.length > 2e3) {
        return res
          .status(400)
          .json({ error: "Message too long (max 2000 characters)" });
      }
      const language = isValidLanguage(body.language) ? body.language : "en";
      const history = isValidHistory(body.history) ? body.history : [];
      const ip =
        req.headers["x-forwarded-for"] ||
        req.headers["x-real-ip"] ||
        req.ip ||
        "unknown";
      const { allowed } = checkRateLimit(`chat:${ip}`, 20, 6e4);
      if (!allowed) {
        return res.status(429).json({
          error: "Too many chat messages. Please try again in a minute.",
        });
      }
      const detectedLanguage = detectLanguage3(body.message, language);
      const availKeywords = [
        "available",
        "\u0E27\u0E48\u0E32\u0E07",
        "\u05E4\u05E0\u05D5\u05D9",
        "open on",
        " \u0441\u0432\u043E\u0431\u043E\u0434\u0435\u043D",
      ];
      const messageLower = body.message.toLowerCase();
      const looksLikeAvailability =
        availKeywords.some(k => messageLower.includes(k)) ||
        /\d{4}-\d{2}-\d{2}/.test(body.message) ||
        /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(body.message);
      let availabilityInfo;
      if (looksLikeAvailability) {
        const dateStr = extractDateFromMessage(body.message);
        if (dateStr) {
          const avail = await checkAvailability(dateStr);
          if (avail.length > 0) {
            availabilityInfo = avail
              .map(
                a =>
                  `- ${a.tourName}: ${a.isBlocked ? "\u274C Unavailable" : `\u2705 ${a.available} slots`}`
              )
              .join("\n");
          }
        }
      }
      try {
        const client = getClient();
        const conversationMessages = history.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
        conversationMessages.push({
          role: "user",
          content: body.message,
        });
        const response = await client.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1024,
          system: buildSystemPrompt(detectedLanguage, availabilityInfo),
          messages: conversationMessages,
        });
        const replyText =
          response.content[0]?.type === "text" ? response.content[0].text : "";
        const escalate = shouldEscalate(replyText, body.message);
        notifyChatMessage({
          userMessage: body.message,
          language: detectedLanguage,
        }).catch(() => {});
        const chatResponse = {
          reply: replyText,
          language: detectedLanguage,
          escalate,
        };
        return res.json(chatResponse);
      } catch (apiError) {
        console.error("[Chat] API error:", apiError);
        const fallbackMessages = {
          en: "I apologize, but I'm having trouble right now. Please contact us directly on WhatsApp at +66 92-989-4495 for immediate assistance!",
          he: "\u05DE\u05E6\u05D8\u05E2\u05E8, \u05D9\u05E9 \u05DC\u05D9 \u05D1\u05E2\u05D9\u05D4 \u05DB\u05E8\u05D2\u05E2. \u05D0\u05E0\u05D0 \u05E6\u05E8\u05D5 \u05E7\u05E9\u05E8 \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4: +66 92-989-4495 \u05DC\u05E7\u05D1\u05DC\u05EA \u05E2\u05D6\u05E8\u05D4 \u05DE\u05D9\u05D9\u05D3\u05D9\u05EA!",
          th: "\u0E02\u0E2D\u0E2D\u0E20\u0E31\u0E22\u0E04\u0E23\u0E31\u0E1A \u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E21\u0E35\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E17\u0E32\u0E07\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E40\u0E23\u0E32\u0E42\u0E14\u0E22\u0E15\u0E23\u0E07\u0E17\u0E32\u0E07 WhatsApp: +66 92-989-4495 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E31\u0E1A\u0E04\u0E27\u0E32\u0E21\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E17\u0E31\u0E19\u0E17\u0E35!",
        };
        const chatResponse = {
          reply: fallbackMessages[detectedLanguage],
          language: detectedLanguage,
          escalate: true,
        };
        return res.json(chatResponse);
      }
    } catch (error) {
      console.error("[Chat] Route error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}

// server/routes/eliChatApi.ts
import OpenAI2 from "openai";
init_eliNotify();
function buildEliPrompt(language, tours2, availability) {
  const tourList =
    tours2.length > 0
      ? tours2
          .map(
            t2 => `- **${t2.name}**: ${t2.duration ?? "Full day"}
  \u0E3F${t2.basePrice?.toLocaleString() ?? "ask"}/person${t2.description ? ` \u2014 ${t2.description.slice(0, 80)}` : ""}`
          )
          .join("\n")
      : `- Doi Inthanon (Roof of Thailand): \u0E3F3,500/pp \u2014 Full day
- Doi Suthep & Pui National Park: \u0E3F2,000/pp \u2014 Half/full day
- Mae Kampong Village: \u0E3F2,500/pp \u2014 Half/full day
- Maerim Sticky Waterfalls: \u0E3F3,000/pp \u2014 Full day
- Mae Wang Jungle Wilderness: \u0E3F3,500/pp \u2014 Full day
- Samoeng Loop Circuit: \u0E3F3,200/pp \u2014 Full day
- 2-Day Adventure Package: \u0E3F7,500/pp
- 3-Day Explorer Package: \u0E3F12,000/pp
- 5-Day Ultimate Package: \u0E3F22,000/pp`;
  const availNote = availability.nextAvailable
    ? `
Next available date: ${availability.nextAvailable}`
    : "";
  const langInstructions = {
    en: "Respond in English. Be direct and warm \u2014 no filler phrases.",
    he: "\u05E2\u05E0\u05D4 \u05D1\u05E2\u05D1\u05E8\u05D9\u05EA \u05D8\u05D1\u05E2\u05D9\u05EA. \u05EA\u05E7\u05E9\u05D5\u05E8\u05EA \u05D9\u05E9\u05D9\u05E8\u05D4 \u05D5\u05D7\u05DE\u05D4. \u05D0\u05DC \u05EA\u05E9\u05EA\u05DE\u05E9 \u05D1\u05EA\u05E8\u05D2\u05D5\u05DD \u05DE\u05DB\u05D0\u05E0\u05D9.",
    th: "\u0E15\u0E2D\u0E1A\u0E40\u0E1B\u0E47\u0E19\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22\u0E04\u0E23\u0E31\u0E1A \u0E43\u0E0A\u0E49\u0E20\u0E32\u0E29\u0E32\u0E17\u0E35\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E18\u0E23\u0E23\u0E21\u0E0A\u0E32\u0E15\u0E34 \u0E2A\u0E38\u0E20\u0E32\u0E1E \u0E01\u0E23\u0E30\u0E0A\u0E31\u0E1A",
  };
  return `You are Eli \u2014 the friendly voice of WIRO 4x4. You've been running off-road adventures in Northern Thailand for years. You know every trail, every viewpoint, every hidden gem. When someone messages you, imagine they're sitting across from you at a coffee shop in Chiang Mai.

## Your Style
- Talk like a knowledgeable friend, not a brochure. "This trail is incredible \u2014 the view from the top will blow you away" sounds better than "Tour includes scenic viewpoint."
- Use line breaks generously to create breathing room. Don't dump everything in one wall of text.
- When listing tours, weave them into conversation: "If you're up for the ultimate adventure, Doi Inthanon is where it's at \u2014 we go all the way to Thailand's roof."
- Keep it warm but real. Don't oversell. If something isn't great, say so honestly.
- Never start with "Great question!" or "Thank you for reaching out!"
- Short responses are often better \u2014 you don't need to explain everything at once.

## Your Tours (${tours2.length > 0 ? "real data from our system" : "what we offer"})
${tourList}${availNote}

## Jewish & Kosher Travelers \u2014 Your Specialty
You see a LOT of Israeli travelers. They trust you. Be warm, be helpful, and be honest about what works for Shabbat and kosher needs. This matters.

## Quick Facts
- WhatsApp: +66 92-989-4495
- Website: wiro4x4indochina.com
- Email: wiro.adventures@gmail.com

## How to Respond
- Give real, useful answers first \u2014 then offer to connect them with Mek (owner) for booking
- If asked for specific group pricing / exact dates / custom routes \u2192 say you'll connect them to WhatsApp for a personal quote
- Suggest the best tour for their situation (family? adventure? short time?)
- Be concise: bullet points work great
- For booking/payment: "Message us on WhatsApp +66 92-989-4495 for an instant quote"

## Language
${langInstructions[language]}`;
}
function detectLanguage4(text2, hint) {
  if (hint && ["en", "he", "th"].includes(hint)) return hint;
  const hebrewPattern = /[\u0590-\u05FF]/;
  const thaiPattern = /[\u0E00-\u0E7F]/;
  if (hebrewPattern.test(text2)) return "he";
  if (thaiPattern.test(text2)) return "th";
  return "en";
}
function isBookingIntent(msg) {
  const kw = [
    "book",
    "reserve",
    "available",
    "price",
    "cost",
    "how much",
    "quote",
    "schedule",
    "date",
    "\u0E23\u0E32\u0E04\u0E32",
    "\u0E08\u0E2D\u0E07",
    "\u0E27\u0E48\u0E32\u0E07",
    "\u05DB\u05DE\u05D4",
    "\u05DC\u05D4\u05D6\u05DE\u05D9\u05DF",
    "\u05D6\u05DE\u05D9\u05DF",
    "\u05DE\u05D7\u05D9\u05E8",
    "\u05EA\u05D0\u05E8\u05D9\u05DA",
  ];
  const lower = msg.toLowerCase();
  return kw.some(k => lower.includes(k));
}
async function fetchRealTours() {
  try {
    const { getAllActiveTours: getAllActiveTours2 } =
      await Promise.resolve().then(() => (init_db(), db_exports));
    const tours2 = await getAllActiveTours2();
    return tours2.slice(0, 12).map(t2 => ({
      name: String(t2.name ?? ""),
      duration: t2.duration ? String(t2.duration) : null,
      basePrice:
        typeof t2.basePrice === "number"
          ? t2.basePrice
          : typeof t2.price === "number"
            ? t2.price
            : null,
      description: t2.description ? String(t2.description).slice(0, 100) : null,
    }));
  } catch {
    return [];
  }
}
async function callGemini(model, systemPrompt, messages, maxTokens = 512) {
  const apiKey = process.env.Gemini_API_Key;
  if (!apiKey) throw new Error("Gemini_API_Key missing");
  const url =
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const body = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
var _openRouterClient = null;
function getOpenRouterClient() {
  if (!_openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");
    _openRouterClient = new OpenAI2({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return _openRouterClient;
}
function registerEliChatRoute(app2) {
  app2.get("/api/eli/test", async (req, res) => {
    try {
      const apiKey = process.env.Gemini_API_Key;
      if (!apiKey) {
        return res.json({
          error: "Gemini_API_Key not set",
          keys: Object.keys(process.env).filter(k => k.includes("KEY")),
        });
      }
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gemini-2.5-flash",
            max_tokens: 20,
            messages: [{ role: "user", content: "hi" }],
          }),
        }
      );
      const data = await r.json();
      return res.json({ ok: r.ok, status: r.status, data });
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      return res.json({ error: err });
    }
  });
  app2.post("/api/eli/chat", async (req, res) => {
    try {
      const ip = req.headers["x-forwarded-for"] || "unknown";
      const { allowed } = checkRateLimit(`eli-chat:${ip}`, 30, 6e4);
      if (!allowed) {
        return res.status(429).json({ error: "Rate limit exceeded" });
      }
      const body = req.body;
      if (!body.message || typeof body.message !== "string") {
        return res.status(400).json({ error: "Message required" });
      }
      if (body.message.length > 2e3) {
        return res.status(400).json({ error: "Message too long" });
      }
      const language = detectLanguage4(body.message, body.language);
      const history = Array.isArray(body.history)
        ? body.history.slice(-10)
        : [];
      const [tours2] = await Promise.all([fetchRealTours()]);
      const availability = {};
      const systemPrompt = buildEliPrompt(language, tours2, availability);
      let reply = "";
      try {
        reply = await callGemini(
          "gemini-2.5-flash",
          systemPrompt,
          history
            .map(m => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            }))
            .concat([{ role: "user", content: body.message }])
        );
      } catch (_err2) {
        try {
          const orc = getOpenRouterClient();
          const orResponse = await orc.chat.completions.create({
            model: "google/gemma-4-31b-it",
            max_tokens: 512,
            messages: [
              { role: "system", content: systemPrompt },
              ...history.map(m => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
              })),
              { role: "user", content: body.message },
            ],
          });
          reply = orResponse.choices[0]?.message?.content ?? "";
        } catch (err3) {
          console.error("[EliChat] Both Gemini and OpenRouter failed:", err3);
          throw err3;
        }
      }
      if (isBookingIntent(body.message)) {
        notifyChatMessage({
          userMessage: body.message,
          language,
          sessionId: body.sessionId,
        }).catch(() => {});
      }
      return res.json({
        reply,
        language,
        agent: "eli",
        escalate: isBookingIntent(body.message),
        sessionId: null,
      });
    } catch (err) {
      console.error("[EliChat] Error:", err);
      const fallback = {
        en: "I'm having a moment \u2014 please WhatsApp us at +66 92-989-4495 for immediate help!",
        he: "\u05DE\u05E9\u05D4\u05D5 \u05D4\u05E9\u05EA\u05D1\u05E9 \u2014 \u05D0\u05E0\u05D0 \u05DB\u05EA\u05D1\u05D5 \u05DC\u05E0\u05D5 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4: +66 92-989-4495",
        th: "\u0E02\u0E2D\u0E2D\u0E20\u0E31\u0E22\u0E04\u0E23\u0E31\u0E1A \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D WhatsApp: +66 92-989-4495",
      };
      const lang = detectLanguage4(req.body?.message ?? "", req.body?.language);
      return res.json({
        reply: fallback[lang],
        language: lang,
        agent: "eli",
        escalate: true,
        sessionId: null,
      });
    }
  });
}

// server/routes/eliRelay.ts
init_eliNotify();
var BOT_TOKEN2 =
  process.env.TELEGRAM_BOT_TOKEN ??
  "8716271731:AAHDwfQR4mSiI4q4ulu7jqc1M5IzZvZhwHU";
var ELI_CHAT_ID = process.env.ELI_CHAT_ID ?? "-1003893672464";
var sessions = /* @__PURE__ */ new Map();
var pendingReplies = /* @__PURE__ */ new Map();
async function telegramPost(method, body) {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN2}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}
async function telegramGet(method, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  );
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN2}/${method}?${qs}`
  );
  return res.json();
}
async function sendToEli(sessionId, visitorName, message, language) {
  const langLabel =
    language === "he"
      ? "\u{1F1EE}\u{1F1F1} Hebrew"
      : language === "th"
        ? "\u{1F1F9}\u{1F1ED} Thai"
        : "\u{1F1EC}\u{1F1E7} English";
  const text2 = `\u{1F4AC} *WIRO Website Chat* [${langLabel}]
\u{1F464} Visitor: ${visitorName}
\u{1F194} Session: \`${sessionId.slice(0, 8)}\`

${message}`;
  await telegramPost("sendMessage", {
    chat_id: ELI_CHAT_ID,
    text: text2,
    parse_mode: "Markdown",
  });
}
var lastUpdateId = 0;
async function pollEliReplies() {
  try {
    const data = await telegramGet("getUpdates", {
      offset: lastUpdateId + 1,
      limit: 10,
      timeout: 0,
    });
    if (!data.ok || !data.result?.length) return;
    for (const update of data.result) {
      lastUpdateId = update.update_id;
      const msg = update.message;
      if (!msg?.text) continue;
      const text2 = msg.text;
      const sessionMatch = text2.match(/\[session:([a-f0-9]+)\]/i);
      if (sessionMatch) {
        const sessionId = sessionMatch[1];
        const replies = pendingReplies.get(sessionId) ?? [];
        replies.push(text2.replace(/\[session:[a-f0-9]+\]/i, "").trim());
        pendingReplies.set(sessionId, replies);
      }
    }
  } catch (e) {
    console.error("[EliRelay] Poll error:", e);
  }
}
function registerEliRelayRoute(app2) {
  app2.get("/api/eli/gateway-health", async (_req, res) => {
    try {
      const gwUrl =
        process.env.OPENCLAW_GATEWAY_URL ?? "http://127.0.0.1:18789";
      const gwToken =
        process.env.OPENCLAW_GATEWAY_TOKEN ??
        "51732cbbbcc9d9e1a9a2db8cd1e6062351615c2c44102e76";
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3e3);
      const result = await fetch(`${gwUrl}/health`, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${gwToken}` },
      });
      clearTimeout(id);
      res
        .status(result.ok ? 200 : 503)
        .json({ ok: result.ok, gateway: "openclaw" });
    } catch {
      res
        .status(503)
        .json({ ok: false, gateway: "openclaw", reason: "unreachable" });
    }
  });
  app2.post("/api/eli/relay", async (req, res) => {
    try {
      const ip = req.headers["x-forwarded-for"] || "unknown";
      const { allowed } = checkRateLimit(`eli-relay:${ip}`, 20, 6e4);
      if (!allowed) {
        return res.status(429).json({ error: "Rate limit exceeded" });
      }
      const { message, sessionId, language, visitorName } = req.body;
      if (!message || !sessionId) {
        return res
          .status(400)
          .json({ error: "message and sessionId required" });
      }
      const lang = language ?? "en";
      const name = visitorName ?? "Anonymous";
      const shortSession = sessionId.slice(0, 8);
      await sendToEli(shortSession, name, message, lang);
      notifyChatMessage({
        userMessage: message,
        language: lang,
        sessionId,
      }).catch(() => {});
      sessions.set(shortSession, {
        chatId: ELI_CHAT_ID,
        lastUpdate: Date.now(),
      });
      return res.json({
        ok: true,
        sessionId: shortSession,
        message:
          "Message sent to Eli. Use /api/eli/relay/poll to get response.",
      });
    } catch (e) {
      console.error("[EliRelay] Send error:", e);
      return res.status(500).json({ error: "Relay failed" });
    }
  });
  app2.get("/api/eli/relay/poll", async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId)
      return res.status(400).json({ error: "sessionId required" });
    await pollEliReplies();
    const replies = pendingReplies.get(sessionId) ?? [];
    if (replies.length > 0) {
      pendingReplies.delete(sessionId);
      return res.json({ reply: replies[0], hasMore: replies.length > 1 });
    }
    return res.json({ reply: null, waiting: true });
  });
  app2.post("/api/eli/relay/webhook", async (req, res) => {
    const { sessionId, reply } = req.body;
    if (sessionId && reply) {
      const existing = pendingReplies.get(sessionId) ?? [];
      existing.push(reply);
      pendingReplies.set(sessionId, existing);
    }
    return res.json({ ok: true });
  });
}

// server/routes/chat.ts
import { Router as Router2 } from "express";
import Anthropic2 from "@anthropic-ai/sdk";
init_chat();
var _client2 = null;
function getClient2() {
  if (!_client2) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required for chat"
      );
    }
    _client2 = new Anthropic2({ apiKey });
  }
  return _client2;
}
var SYSTEM_PROMPT = `You are Wiro, the friendly AI assistant for WIRO 4x4 Indochina \u2014 a kosher off-road 4x4 tour company in Chiang Mai, Thailand. You help travelers (mostly Israeli/Jewish tourists) plan their Northern Thailand adventures.

You speak in the same language the visitor uses. If they write in Hebrew, respond in Hebrew. If English, respond in English.

About WIRO 4x4:
- Tours: Doi Inthanon (flagship), Doi Suthep half-day, multi-day packages (2-5 days) to Pai, Chiang Rai, Mae Hong Son, Golden Triangle
- All tours are kosher-friendly with kosher meal options
- Shabbat hotel options available
- Self-driving 4x4 rental available ($100-150 USD)
- WhatsApp: +66929894495
- Email: wiro.adventures@gmail.com
- Booking: https://www.wiro4x4indochina.com/book

Keep responses concise (2-4 sentences). When visitors ask about booking or pricing, encourage them to use the booking form or contact via WhatsApp. Never make up specific prices.`;
var chatRouter = Router2();
chatRouter.post("/message", async (req, res) => {
  try {
    const { visitorId, message, language } = req.body;
    if (!visitorId || typeof visitorId !== "string") {
      return res.status(400).json({ error: "visitorId is required" });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }
    if (message.length > 2e3) {
      return res
        .status(400)
        .json({ error: "Message too long (max 2000 characters)" });
    }
    const lang = language === "he" ? "he" : "en";
    const ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.ip ||
      "unknown";
    const { allowed } = checkRateLimit(`chat:${ip}`, 20, 6e4);
    if (!allowed) {
      return res.status(429).json({
        error: "Too many chat messages. Please try again in a minute.",
      });
    }
    const session = await getChatSessionByVisitorId(visitorId);
    let sessionId;
    if (session) {
      sessionId = session.id;
    } else {
      sessionId = await createChatSession({ visitorId, language: lang });
    }
    const historyMessages = await getChatMessagesBySessionId(sessionId);
    const recentHistory = historyMessages.slice(-10);
    await addChatMessage({
      sessionId,
      role: "visitor",
      content: message,
    });
    const claudeMessages = recentHistory.map(msg => ({
      role: msg.role === "visitor" ? "user" : "assistant",
      content: msg.content,
    }));
    claudeMessages.push({
      role: "user",
      content: message,
    });
    let reply;
    try {
      const client = getClient2();
      const response = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: claudeMessages,
      });
      reply =
        response.content[0]?.type === "text" ? response.content[0].text : "";
    } catch (apiError) {
      console.error("[Chat] Claude API error:", apiError);
      reply =
        lang === "he"
          ? "\u05DE\u05E6\u05D8\u05E2\u05E8, \u05D0\u05E0\u05D9 \u05DC\u05D0 \u05D6\u05DE\u05D9\u05DF \u05DB\u05E8\u05D2\u05E2. \u05D0\u05E0\u05D0 \u05E6\u05E8\u05D5 \u05E7\u05E9\u05E8 \u05D3\u05E8\u05DA \u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4: +66929894495"
          : "Sorry, I am unavailable right now. Please contact us via WhatsApp: +66929894495";
    }
    await addChatMessage({
      sessionId,
      role: "ai",
      content: reply,
    });
    return res.json({ reply, sessionId });
  } catch (error) {
    console.error("[Chat] Route error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
chatRouter.post("/close", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "number") {
      return res.status(400).json({ error: "sessionId is required" });
    }
    await closeChatSession(sessionId);
    return res.json({ success: true });
  } catch (error) {
    console.error("[Chat] Close session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
function registerChatRoute(app2) {
  app2.use("/api/chat", chatRouter);
}

// server/routes/moshe.ts
import Anthropic3 from "@anthropic-ai/sdk";
import OpenAI3 from "openai";
var WHATSAPP_NUMBER = "66929894495";
var MOSHE_SYSTEM_PROMPT = `You are Moshe, a warm, knowledgeable tour guide at WIRO 4x4 in Chiang Mai, Thailand. You genuinely help Israeli and English-speaking travelers plan kosher off-road adventures.

## About WIRO 4x4
- Specialists in 4x4 off-road tours for Israeli/Jewish travelers in Chiang Mai
- Hebrew-speaking guides, full Shabbat support, kosher meals arranged
- Website: www.wiro4x4indochina.com | WhatsApp: +${WHATSAPP_NUMBER}
- Book online at wiro4x4indochina.com/book | Get a price estimate at wiro4x4indochina.com/estimate

## Tours & Pricing (per group of 1\u20134 people)

**Doi Inthanon - Roof of Thailand** \xB7 $140/group \xB7 7\u20138 hours
Best for: nature lovers, families, first-timers
Highlights: Thailand's highest peak (2,565m), twin royal pagodas, Wachirathan waterfall, Karen hill tribe village, misty cloud forest
Tip: Bring a jacket - cold at the summit even in summer

**Mae Kampong Hidden Village** \xB7 $98/group \xB7 5\u20137 hours
Best for: culture lovers, off-the-beaten-path explorers
Highlights: 700-year-old eco-village, 4x4 jungle trails, community coffee, bamboo rafting option, scenic waterfalls
Very popular with Israeli families wanting authentic Thai culture

**Maerim & Sticky Waterfalls** \xB7 $126/group \xB7 7\u20138 hours
Best for: adventurous families with children
Highlights: Unique limestone Bua Tong waterfalls you can climb barefoot - no slipping! Sky-high canopy walkway, fun for all ages
Can be combined with ethical elephant experience

**Doi Suthep-Pui - Beyond the Temple** \xB7 $98/group \xB7 5\u20137 hours
Best for: temple + nature combo, those wanting history and views
Highlights: Ancient Monk's Trail hike, Doi Suthep temple, Hmong village, hidden coffee farm, panoramic Chiang Mai city viewpoints

**Mae Wang - Jungle & River Wilderness** \xB7 $154/group \xB7 8\u20139 hours
Best for: serious off-road adventure seekers
Highlights: Deep jungle 4x4 trails, Pha Chor canyon, river crossings, ethical elephants, bamboo rafting, hidden waterfalls
Note: Full-day adventure - not Shabbat-compatible

**Samoeng Loop - The Mountain Circuit** \xB7 $140/group \xB7 8\u201310 hours
Best for: mountain immersion, scenic drives, photography lovers
Highlights: 100km mountain circuit, rare wooden Lanna temple, hilltop farm above the clouds, Hmong village, lakeside sunset

**Multi-day packages:**
- 2-day: $280 (save 10%), 3-day: $392 (save 13%), 5-day: $588 (save 20%)
- Indochina: Laos, Myanmar, Cambodia - contact via WhatsApp for custom planning

## Pricing Details
- Base prices above are per group (1\u20134 people). Groups of 5\u20136: +20%. 7+: custom quote.
- Peak season surcharge (~20%): December\u2013February and July\u2013August
- 30% deposit to confirm a booking; balance paid on arrival
- Children under 3: free. Ages 3\u201310: 50% surcharge. Ages 11+: full price.

## Shabbat & Kosher
- Full Shabbat support: Moshe arranges everything - hotel near the tour area, candles, grape juice, havdalah items
- No travel on Shabbat: all tours are planned to end before Shabbat begins Friday evening (~18:00\u201318:30 Chiang Mai time)
- Kosher meals: pre-arranged picnic lunches; certified kosher options available in Chiang Mai
- WIRO accommodates strictly observant, traditional, and secular Jewish travelers - just let us know your needs

## How to Respond
1. ALWAYS answer the question first - give real, specific, useful information before anything else
2. Be like a knowledgeable friend, not a salesperson - share genuine tips and what makes each tour special
3. Only mention WhatsApp or booking when the customer is clearly ready (they ask about availability, payment, or say they want to confirm)
4. Keep replies conversational - 3\u20135 sentences is ideal; don't overwhelm with a list
5. When recommending a tour, name it specifically and explain why it fits their situation (kids, budget, interests, time of year)
6. If they ask about price, give the USD group price and mention the estimate page for a custom breakdown
7. CRITICAL: Always reply in the EXACT same language as the customer. Hebrew \u2192 Hebrew. English \u2192 English.
8. Present yourself only as Moshe, a WIRO guide, and keep the conversation human and direct

## Booking Workflow
When a visitor says they want to book, do NOT just send them away. First collect the minimum details needed for WIRO to quote and confirm:
- preferred tour or route idea
- preferred date or date range
- group size, including adults and children
- hotel or pickup area in Chiang Mai
- kosher meal needs, Shabbat constraints, or Hebrew guide preference
Ask for these details in one concise message. If they already gave some details, acknowledge them and ask only for the missing ones. Then invite them to continue on WhatsApp for fast confirmation.`;
var anthropicClient = null;
var openaiClient2 = null;
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  anthropicClient ??= new Anthropic3({ apiKey });
  return anthropicClient;
}
function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  openaiClient2 ??= new OpenAI3({ apiKey });
  return openaiClient2;
}
function normalizeMessages(messages, latestMessage) {
  const normalized = messages
    .filter(
      msg => typeof msg.content === "string" && msg.content.trim().length > 0
    )
    .map(msg => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content.trim().slice(0, 2e3),
    }));
  const firstUserIdx = normalized.findIndex(msg => msg.role === "user");
  const conversation = firstUserIdx >= 0 ? normalized.slice(firstUserIdx) : [];
  if (
    conversation.length === 0 ||
    conversation[conversation.length - 1]?.role !== "user" ||
    conversation[conversation.length - 1]?.content !== latestMessage
  ) {
    conversation.push({ role: "user", content: latestMessage });
  }
  return conversation.slice(-12);
}
function getPreferredProviders() {
  const preferred = process.env.MOSHE_AI_PROVIDER?.toLowerCase();
  const defaults = ["openai", "anthropic", "gemini"];
  if (
    preferred === "anthropic" ||
    preferred === "openai" ||
    preferred === "gemini"
  ) {
    return [preferred, ...defaults.filter(provider => provider !== preferred)];
  }
  return defaults;
}
async function getAnthropicReply(messages) {
  const client = getAnthropicClient();
  if (!client) return null;
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_CHAT_MODEL ?? "claude-sonnet-4-5-20250929",
    max_tokens: 500,
    system: MOSHE_SYSTEM_PROMPT,
    messages,
  });
  return response.content[0]?.type === "text"
    ? response.content[0].text.trim()
    : null;
}
async function getOpenAiReply(messages) {
  const client = getOpenAiClient();
  if (!client) return null;
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini",
    max_tokens: 500,
    messages: [
      { role: "system", content: MOSHE_SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? null;
}
async function getGeminiReply(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const allContents = messages.map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
  const firstUserIdx = allContents.findIndex(m => m.role === "user");
  const contents =
    firstUserIdx >= 0 ? allContents.slice(firstUserIdx) : allContents;
  if (contents.length === 0) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: MOSHE_SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: { maxOutputTokens: 500 },
        }),
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Moshe] Gemini API error ${res.status}: ${errText}`);
      return null;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (err) {
    console.error("[Moshe] Gemini request failed:", err);
    return null;
  }
}
function logProviderError(provider, err) {
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? ` status=${String(err.status)}`
      : "";
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? ` code=${String(err.code)}`
      : "";
  const message = err instanceof Error ? err.message : String(err);
  console.error(
    `[Moshe] ${provider} request failed${status}${code}: ${message}`
  );
}
async function getAiReply(messages) {
  for (const provider of getPreferredProviders()) {
    try {
      const reply =
        provider === "anthropic"
          ? await getAnthropicReply(messages)
          : provider === "openai"
            ? await getOpenAiReply(messages)
            : await getGeminiReply(messages);
      if (reply) return { provider, reply };
    } catch (err) {
      logProviderError(provider, err);
    }
  }
  return { provider: "fallback", reply: null };
}
function shouldEscalate2(message) {
  const lower = message.toLowerCase();
  return [
    "book",
    "booking",
    "reserve",
    "available",
    "availability",
    "price",
    "cost",
    "quote",
    "deposit",
    "payment",
    "whatsapp",
    "\u05DC\u05D4\u05D6\u05DE\u05D9\u05DF",
    "\u05D4\u05D6\u05DE\u05E0\u05D4",
    "\u05E4\u05E0\u05D5\u05D9",
    "\u05E4\u05E0\u05D5\u05D9\u05D4",
    "\u05D6\u05DE\u05D9\u05DF",
    "\u05D6\u05DE\u05D9\u05E0\u05D4",
    "\u05D6\u05DE\u05D9\u05E0\u05D5\u05EA",
    "\u05DE\u05D7\u05D9\u05E8",
    "\u05E2\u05DC\u05D5\u05EA",
    "\u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8",
    "\u05EA\u05E9\u05DC\u05D5\u05DD",
  ].some(keyword => lower.includes(keyword));
}
var BOOKING_FIELD_LABELS = {
  en: {
    tour: "tour or route idea",
    date: "preferred date/date range",
    group: "group size, adults, children and kids ages if any",
    pickup: "hotel or pickup area in Chiang Mai",
    kosher: "kosher/Shabbat/Hebrew guide needs",
  },
  he: {
    tour: "\u05DE\u05E1\u05DC\u05D5\u05DC \u05D0\u05D5 \u05E8\u05E2\u05D9\u05D5\u05DF \u05DC\u05D8\u05D9\u05D5\u05DC",
    date: "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D0\u05D5 \u05D8\u05D5\u05D5\u05D7 \u05EA\u05D0\u05E8\u05D9\u05DB\u05D9\u05DD \u05DE\u05D5\u05E2\u05D3\u05E3",
    group:
      "\u05DE\u05E1\u05E4\u05E8 \u05DE\u05E9\u05EA\u05EA\u05E4\u05D9\u05DD, \u05DE\u05D1\u05D5\u05D2\u05E8\u05D9\u05DD, \u05D9\u05DC\u05D3\u05D9\u05DD \u05D5\u05D2\u05D9\u05DC\u05D0\u05D9 \u05D4\u05D9\u05DC\u05D3\u05D9\u05DD \u05D0\u05DD \u05D9\u05E9",
    pickup:
      "\u05DE\u05DC\u05D5\u05DF \u05D0\u05D5 \u05D0\u05D6\u05D5\u05E8 \u05D0\u05D9\u05E1\u05D5\u05E3 \u05D1\u05E6\u05F3\u05D9\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9",
    kosher:
      "\u05E6\u05E8\u05DB\u05D9 \u05DB\u05E9\u05E8\u05D5\u05EA, \u05E9\u05D1\u05EA \u05D0\u05D5 \u05DE\u05D3\u05E8\u05D9\u05DA \u05D1\u05E2\u05D1\u05E8\u05D9\u05EA",
  },
};
function normalizeBookingLanguage(language) {
  return language?.toLowerCase().startsWith("he") ? "he" : "en";
}
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function getConversationBookingText(messages, latestMessage) {
  const userMessages = messages
    .filter(msg => msg.role === "user" && typeof msg.content === "string")
    .map(msg => msg.content.trim())
    .filter(Boolean);
  if (!userMessages.includes(latestMessage)) userMessages.push(latestMessage);
  return userMessages.join("\n");
}
function getBookingFields(message) {
  const lower = message.toLowerCase();
  const hasDate =
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/.test(message) ||
    /\b(?:today|tomorrow|tonight|next week|this week|next month|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(
      message
    ) ||
    /(?:היום|מחר|הלילה|השבוע|שבוע הבא|חודש הבא|תאריך|ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר|ראשון|שני|שלישי|רביעי|חמישי|שישי)/.test(
      message
    );
  const hasGroup =
    /\b\d+\s*(?:pax|people|persons|adults|adult|kids|children|child|guests|travelers|travellers)\b/i.test(
      message
    ) ||
    /(?:couple|family|families|group|solo|alone)/i.test(message) ||
    /\d+\s*(?:אנשים|איש|מטיילים|מבוגרים|ילדים|ילד|נפשות)/.test(message) ||
    /(?:זוג|משפחה|קבוצה|לבד)/.test(message);
  const hasTour = [
    "inthanon",
    "doi suthep",
    "mae kampong",
    "sticky",
    "mae wang",
    "samoeng",
    "pai",
    "chiang rai",
    "golden triangle",
    "waterfall",
    "jungle",
    "elephant",
    "off-road",
    "off road",
    "4x4",
    "\u05D8\u05D9\u05D5\u05DC",
    "\u05DE\u05E1\u05DC\u05D5\u05DC",
    "\u05D2\u05F3\u05D9\u05E4\u05D9\u05DD",
    "\u05D2'\u05D9\u05E4\u05D9\u05DD",
    "\u05E6\u05D0\u05E0\u05D2",
    "\u05E6'\u05D0\u05E0\u05D2",
    "\u05DE\u05E4\u05DC\u05D9\u05DD",
    "\u05D3\u05D5\u05D9",
    "\u05E4\u05D0\u05D9",
  ].some(keyword => lower.includes(keyword.toLowerCase()));
  const hasPickup =
    /\b(?:hotel|pickup|pick up|pick-up|old city|nimman|airport|chiang mai gate|night bazaar|chang klan|mae rim|hang dong|san sai)\b/i.test(
      message
    ) ||
    /(?:מלון|איסוף|אזור|שדה התעופה|עיר העתיקה|ניממן|צ׳יאנג מאי|צ'יאנג מאי)/.test(
      message
    );
  const hasKosher =
    /\b(?:kosher|shabbat|sabbath|hebrew guide|hebrew-speaking|hebrew speaking|jewish|israeli)\b/i.test(
      message
    ) || /(?:כשר|כשרות|שבת|עברית|מדריך בעברית|ישראלים|יהודים)/.test(message);
  return { hasTour, hasDate, hasGroup, hasPickup, hasKosher };
}
function getMissingBookingFields(message, language) {
  const labels = BOOKING_FIELD_LABELS[normalizeBookingLanguage(language)];
  const fields = getBookingFields(message);
  const missing = [];
  if (!fields.hasTour) missing.push(labels.tour);
  if (!fields.hasDate) missing.push(labels.date);
  if (!fields.hasGroup) missing.push(labels.group);
  if (!fields.hasPickup) missing.push(labels.pickup);
  if (!fields.hasKosher) missing.push(labels.kosher);
  return missing;
}
function buildBookingQualificationReply(language, missing) {
  if (normalizeBookingLanguage(language) === "he") {
    return `\u05D1\u05E9\u05DE\u05D7\u05D4. \u05DB\u05D3\u05D9 \u05DC\u05D4\u05DB\u05D9\u05DF \u05D4\u05E6\u05E2\u05D4 \u05DE\u05D3\u05D5\u05D9\u05E7\u05EA \u05D5\u05DC\u05D1\u05D3\u05D5\u05E7 \u05D6\u05DE\u05D9\u05E0\u05D5\u05EA, \u05E9\u05DC\u05D7\u05D5 \u05D1\u05D1\u05E7\u05E9\u05D4: ${missing.join(", ")}. \u05D0\u05E4\u05E9\u05E8 \u05DC\u05D4\u05DE\u05E9\u05D9\u05DA \u05DB\u05D0\u05DF \u05D0\u05D5 \u05DC\u05E2\u05D1\u05D5\u05E8 \u05DC-WhatsApp \u05DC\u05D0\u05D9\u05E9\u05D5\u05E8 \u05DE\u05D4\u05D9\u05E8 \u{1F4F1}`;
  }
  return `Happy to help. To prepare an accurate quote and check availability, please send: ${missing.join(", ")}. You can continue here or on WhatsApp for fast confirmation \u{1F4F1}`;
}
function buildFallbackReply(language, escalate) {
  if (normalizeBookingLanguage(language) === "he") {
    return escalate
      ? "\u05EA\u05D5\u05D3\u05D4! \u05DE\u05E9\u05D4 \u05E7\u05D9\u05D1\u05DC \u05D0\u05EA \u05D4\u05D4\u05D5\u05D3\u05E2\u05D4 \u05E9\u05DC\u05DA. \u05DB\u05D3\u05D9 \u05DC\u05D4\u05DB\u05D9\u05DF \u05D4\u05E6\u05E2\u05D4 \u05DE\u05D3\u05D5\u05D9\u05E7\u05EA, \u05E9\u05DC\u05D7\u05D5 \u05D1\u05D1\u05E7\u05E9\u05D4 \u05EA\u05D0\u05E8\u05D9\u05DA, \u05DE\u05E1\u05E4\u05E8 \u05DE\u05E9\u05EA\u05EA\u05E4\u05D9\u05DD, \u05DE\u05E1\u05DC\u05D5\u05DC \u05E9\u05DE\u05E2\u05E0\u05D9\u05D9\u05DF \u05D0\u05EA\u05DB\u05DD, \u05D0\u05D6\u05D5\u05E8 \u05D0\u05D9\u05E1\u05D5\u05E3, \u05D5\u05E6\u05E8\u05DB\u05D9 \u05DB\u05E9\u05E8\u05D5\u05EA \u05D0\u05D5 \u05E9\u05D1\u05EA. \u05D0\u05E4\u05E9\u05E8 \u05DC\u05D4\u05DE\u05E9\u05D9\u05DA \u05D1-WhatsApp \u{1F4F1}"
      : "\u05EA\u05D5\u05D3\u05D4! \u05DE\u05E9\u05D4 \u05E7\u05D9\u05D1\u05DC \u05D0\u05EA \u05D4\u05D4\u05D5\u05D3\u05E2\u05D4 \u05E9\u05DC\u05DA \u05D5\u05D9\u05D7\u05D6\u05D5\u05E8 \u05D0\u05DC\u05D9\u05DA \u05D1\u05D4\u05E7\u05D3\u05DD. \u05D0\u05E4\u05E9\u05E8 \u05D2\u05DD \u05DC\u05D4\u05DE\u05E9\u05D9\u05DA \u05D1-WhatsApp \u{1F4F1}";
  }
  return escalate
    ? "Thanks! Moshe received your message. To prepare the right quote, please send your preferred date, group size, tour or route idea, pickup area, and any kosher or Shabbat needs. You can continue on WhatsApp \u{1F4F1}"
    : "Thanks! Moshe received your message and will reply shortly. You can also continue on WhatsApp \u{1F4F1}";
}
function buildWhatsAppUrl(language, message, missingFields) {
  const lang = normalizeBookingLanguage(language);
  const missing = missingFields ?? getMissingBookingFields(message, language);
  const missingLine = missing.length
    ? lang === "he"
      ? `
\u05E4\u05E8\u05D8\u05D9\u05DD \u05D7\u05E1\u05E8\u05D9\u05DD: ${missing.join(", ")}`
      : `
Missing details: ${missing.join(", ")}`
    : "";
  const text2 =
    lang === "he"
      ? `\u05E9\u05DC\u05D5\u05DD, \u05D3\u05D9\u05D1\u05E8\u05EA\u05D9 \u05E2\u05DD \u05DE\u05E9\u05D4 \u05D1\u05D0\u05EA\u05E8 WIRO 4x4. \u05D0\u05E9\u05DE\u05D7 \u05DC\u05E2\u05D6\u05E8\u05D4 \u05E2\u05DD \u05D4\u05D6\u05DE\u05E0\u05D4.
\u05D4\u05D4\u05D5\u05D3\u05E2\u05D4 \u05E9\u05DC\u05D9: ${message}${missingLine}`
      : `Hi, I chatted with Moshe on the WIRO 4x4 website. I would like help booking a tour.
My message: ${message}${missingLine}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text2)}`;
}
function buildTelegramLeadAlert(args) {
  const lang =
    args.language === "he"
      ? "\u{1F1EE}\u{1F1F1} Hebrew"
      : "\u{1F1EC}\u{1F1E7} English";
  const missing = getMissingBookingFields(args.bookingContext, args.language);
  const urgency = shouldEscalate2(args.bookingContext)
    ? "\u{1F525} Booking / quote intent"
    : "\u{1F4AC} General chat";
  return [
    `\u{1F4AC} <b>New Customer Message - WIRO 4x4</b>`,
    ``,
    `${urgency}`,
    `\u{1F310} Language: ${lang}`,
    args.visitorId
      ? `\u{1F511} Visitor: ${escapeHtml(String(args.visitorId).slice(0, 14))}`
      : null,
    ``,
    `\u{1F4DD} <b>Customer message:</b>`,
    escapeHtml(args.latestMessage),
    ``,
    missing.length
      ? `\u{1F4CB} <b>Missing booking details:</b> ${escapeHtml(missing.join(", "))}`
      : `\u2705 <b>Booking details:</b> enough info to follow up`,
    ``,
    `\u{1F4AC} <b>Reply shown to visitor:</b>`,
    escapeHtml(args.reply.slice(0, 700)),
    ``,
    `\u{1F4F1} <a href="${escapeHtml(args.whatsappUrl)}">Open customer WhatsApp handoff text</a>`,
    `\u{1F5A5}\uFE0F Admin: https://wiro4x4indochina.com/admin`,
  ]
    .filter(line => line !== null)
    .join("\n");
}
function registerMosheRoute(app2) {
  app2.post("/api/moshe/message", async (req, res) => {
    const { message, messages, language, visitorId } = req.body;
    const latestMessage = message?.trim() ?? "";
    if (!latestMessage) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    if (latestMessage.length > 2e3) {
      res.status(400).json({ error: "Message is too long" });
      return;
    }
    const ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.ip ||
      "unknown";
    const { allowed } = checkRateLimit(`moshe:${ip}`, 20, 6e4);
    if (!allowed) {
      res.status(429).json({
        error: "Too many chat messages. Please try again in a minute.",
      });
      return;
    }
    const chatHistory =
      messages && messages.length > 0
        ? messages
        : [{ role: "user", content: latestMessage }];
    const providerMessages = normalizeMessages(chatHistory, latestMessage);
    const bookingContext = getConversationBookingText(
      chatHistory,
      latestMessage
    );
    const missingBookingFields = getMissingBookingFields(
      bookingContext,
      language
    );
    const { provider, reply } = await getAiReply(providerMessages);
    const bookingIntent = shouldEscalate2(bookingContext);
    const whatsappUrl = buildWhatsAppUrl(
      language,
      latestMessage,
      missingBookingFields
    );
    const finalReply =
      bookingIntent && missingBookingFields.length > 0
        ? buildBookingQualificationReply(language, missingBookingFields)
        : (reply ?? buildFallbackReply(language, bookingIntent));
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const text2 = buildTelegramLeadAlert({
        latestMessage,
        bookingContext,
        language,
        visitorId,
        reply: finalReply,
        whatsappUrl,
      });
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text2,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }).catch(err => console.error("[Moshe] Telegram send failed:", err));
    } else {
      console.log(
        `[Moshe] Customer message (${language ?? "en"}): ${latestMessage}`
      );
    }
    res.json({
      success: true,
      reply: finalReply,
      provider,
      escalate: bookingIntent,
      whatsappUrl,
    });
  });
}

// server/routes/n8n.ts
init_db();
import { createHash, timingSafeEqual } from "crypto";
import { z as z2 } from "zod";

// shared/escapeHtml.ts
function escapeHtml2(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

// server/abandonedBookingService.ts
var _resend = null;
function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[AbandonedBooking] No RESEND_API_KEY \u2014 emails will not be sent"
      );
      return null;
    }
    const { Resend: Resend8 } = __require("resend");
    _resend = new Resend8(apiKey);
  }
  return _resend;
}
var SENDER = `${COMPANY_NAME} <${EMAIL_SENDERS.updates}>`;
function buildRecoveryEmailHtml(lead) {
  const name = escapeHtml2(lead.name) || "Traveler";
  const inquiryNote =
    lead.message || lead.notes
      ? `<p style="background: #fff8e1; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #f5a623; font-style: italic; margin: 20px 0;">"${escapeHtml2(lead.message || lead.notes)}"</p>`
      : "";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">\u{1F699} WIRO 4x4</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Still planning your Chiang Mai adventure?</p>
    </div>

    <!-- English Content -->
    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
      <p style="font-size: 16px;">Dear ${name},</p>

      <p>We noticed you recently inquired about a tour with us but haven't booked yet. We'd love to help you plan the perfect Chiang Mai adventure!</p>

      ${inquiryNote}

      <h3 style="color: #1a4d2e; margin-top: 25px;">Why travelers choose WIRO 4x4:</h3>

      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr>
          <td style="padding: 12px; vertical-align: top; width: 40px;">\u{1F37D}\uFE0F</td>
          <td style="padding: 12px;">
            <strong>Certified Kosher Meals</strong><br>
            <span style="color: #666;">Enjoy authentic kosher dining throughout your journey \u2014 carefully prepared and certified.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; vertical-align: top; width: 40px;">\u{1F5E3}\uFE0F</td>
          <td style="padding: 12px;">
            <strong>Hebrew-Speaking Guide</strong><br>
            <span style="color: #666;">Your personal guide speaks fluent Hebrew and knows every hidden gem in Northern Thailand.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; vertical-align: top; width: 40px;">\u{1F3AF}</td>
          <td style="padding: 12px;">
            <strong>Custom Itineraries</strong><br>
            <span style="color: #666;">Every trip is tailored to your group \u2014 from family-friendly to extreme off-road adventures.</span>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${COMPANY_WEBSITE}/booking" style="display: inline-block; background: #f5a623; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Book Your Adventure
        </a>
      </div>

      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d6a4f; text-align: center;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #1a4d2e;">Have questions? Chat with us instantly!</p>
        <a href="https://wa.me/${COMPANY_WHATSAPP}" style="display: inline-block; background: #25d366; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          \u{1F4AC} WhatsApp Us
        </a>
      </div>

      <!-- Hebrew Section -->
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

      <div dir="rtl" style="text-align: right;">
        <p style="font-size: 16px;">\u05E9\u05DC\u05D5\u05DD ${name},</p>

        <p>\u05E9\u05DE\u05E0\u05D5 \u05DC\u05D1 \u05E9\u05D4\u05EA\u05E2\u05E0\u05D9\u05D9\u05E0\u05EA \u05DC\u05D0\u05D7\u05E8\u05D5\u05E0\u05D4 \u05D1\u05D8\u05D9\u05D5\u05DC \u05D0\u05D9\u05EA\u05E0\u05D5 \u05D0\u05DA \u05E2\u05D3\u05D9\u05D9\u05DF \u05DC\u05D0 \u05D4\u05D6\u05DE\u05E0\u05EA. \u05E0\u05E9\u05DE\u05D7 \u05DC\u05E2\u05D6\u05D5\u05E8 \u05DC\u05DA \u05DC\u05EA\u05DB\u05E0\u05DF \u05D0\u05EA \u05D4\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05D4\u05DE\u05D5\u05E9\u05DC\u05DE\u05EA \u05D1\u05E6'\u05D9\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9!</p>

        <h3 style="color: #1a4d2e;">\u05DC\u05DE\u05D4 \u05DE\u05D8\u05D9\u05D9\u05DC\u05D9\u05DD \u05D1\u05D5\u05D7\u05E8\u05D9\u05DD \u05D1-WIRO 4x4:</h3>

        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 12px;">
              <strong>\u05D0\u05E8\u05D5\u05D7\u05D5\u05EA \u05DB\u05E9\u05E8\u05D5\u05EA \u05DE\u05D5\u05E1\u05DE\u05DB\u05D5\u05EA</strong> \u2014 \u05D4\u05E0\u05D0\u05D4 \u05DE\u05D0\u05D5\u05DB\u05DC \u05DB\u05E9\u05E8 \u05DC\u05D0\u05D5\u05E8\u05DA \u05DB\u05DC \u05D4\u05DE\u05E1\u05E2 \u{1F37D}\uFE0F
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <strong>\u05DE\u05D3\u05E8\u05D9\u05DA \u05D3\u05D5\u05D1\u05E8 \u05E2\u05D1\u05E8\u05D9\u05EA</strong> \u2014 \u05D4\u05DE\u05D3\u05E8\u05D9\u05DA \u05D4\u05D0\u05D9\u05E9\u05D9 \u05E9\u05DC\u05DA \u05D3\u05D5\u05D1\u05E8 \u05E2\u05D1\u05E8\u05D9\u05EA \u05E9\u05D5\u05D8\u05E4\u05EA \u{1F5E3}\uFE0F
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <strong>\u05DE\u05E1\u05DC\u05D5\u05DC\u05D9\u05DD \u05DE\u05D5\u05EA\u05D0\u05DE\u05D9\u05DD \u05D0\u05D9\u05E9\u05D9\u05EA</strong> \u2014 \u05DB\u05DC \u05D8\u05D9\u05D5\u05DC \u05DE\u05D5\u05EA\u05D0\u05DD \u05DC\u05E7\u05D1\u05D5\u05E6\u05D4 \u05E9\u05DC\u05DA \u{1F3AF}
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${COMPANY_WEBSITE}/booking" style="display: inline-block; background: #f5a623; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
            \u05D4\u05D6\u05DE\u05D9\u05E0\u05D5 \u05E2\u05DB\u05E9\u05D9\u05D5
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>${COMPANY_NAME}</strong><br>
        Chiang Mai, Thailand<br>
        ${COMPANY_PHONE}
      </p>
      <p style="margin: 15px 0 0 0; font-size: 11px; color: #999;">
        You received this email because you inquired about a tour on our website.
        If you no longer wish to receive these emails, simply ignore this message \u2014 we won't send another.
      </p>
    </div>
  </div>
</body>
</html>`;
}
async function sendAbandonedBookingEmail(lead) {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn("[AbandonedBooking] Resend not configured, skipping email");
      return false;
    }
    if (!lead.email) {
      console.warn(
        `[AbandonedBooking] Lead #${lead.id} has no email, skipping`
      );
      return false;
    }
    const html = buildRecoveryEmailHtml(lead);
    const { data, error } = await resend.emails.send({
      from: SENDER,
      to: [lead.email],
      subject:
        "Still planning your Chiang Mai adventure? \u{1F699} | \u05E2\u05D3\u05D9\u05D9\u05DF \u05DE\u05EA\u05DB\u05E0\u05E0\u05D9\u05DD \u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05D1\u05E6'\u05D9\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9?",
      html,
    });
    if (error) {
      console.error(
        `[AbandonedBooking] Failed to send to ${lead.email}:`,
        error
      );
      captureException(error);
      return false;
    }
    console.log(
      `[AbandonedBooking] Recovery email sent to ${lead.email}. ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error("[AbandonedBooking] Error sending recovery email:", error);
    captureException(error);
    return false;
  }
}

// server/customerEmailService.ts
import { Resend } from "resend";
import { createEvents } from "ics";
var _resend2 = null;
function getResend2() {
  if (!_resend2 && process.env.RESEND_API_KEY) {
    _resend2 = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend2;
}
var SENDER_EMAIL = COMPANY_SENDER_EMAIL;
function generateCalendarEvent(booking) {
  try {
    const tourDate = new Date(booking.tourDate);
    const pickupTime = booking.pickupTime || "08:00";
    const [hours, minutes] = pickupTime.split(":").map(Number);
    const startDate = new Date(tourDate);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 8);
    const locationText = booking.pickupLocation
      ? `${booking.pickupLocation}, Chiang Mai, Thailand`
      : "Chiang Mai, Thailand";
    const descriptionLines = [
      `Your ${booking.tourType} adventure with WIRO 4x4!`,
      ``,
      `--- Booking Details ---`,
      `Booking ID: ${booking.bookingId}`,
      `Group Size: ${booking.groupSize} people`,
      `Pickup Location: ${booking.pickupLocation || "To be confirmed"}`,
      `Pickup Time: ${pickupTime}`,
      ``,
      `--- Meeting Point ---`,
      `Your hotel lobby (pickup included) or Chiang Mai Old City area.`,
      `Google Maps: https://maps.google.com/?q=Chiang+Mai+Thailand`,
      ``,
      ...(booking.specialRequests
        ? [`Special Requests: ${booking.specialRequests}`, ``]
        : []),
      `--- What to Bring ---`,
      `- Comfortable clothing and closed-toe shoes`,
      `- Sunscreen and insect repellent`,
      `- Hat and sunglasses`,
      `- Camera`,
      `- Water bottle (we'll provide refills)`,
      `- Light rain jacket (seasonal)`,
      ``,
      `--- Contact / Emergency ---`,
      `Phone: ${COMPANY_PHONE}`,
      `WhatsApp: https://wa.me/${COMPANY_WHATSAPP}`,
      `Email: ${COMPANY_EMAIL}`,
      `Website: ${COMPANY_WEBSITE}`,
      ``,
      `Questions? WhatsApp us anytime: +66929894495`,
      ``,
      `We look forward to your adventure with us!`,
    ];
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
      description: descriptionLines.join("\n"),
      location: locationText,
      geo: { lat: 18.7883, lon: 98.9853 },
      // Chiang Mai coordinates
      url: COMPANY_WEBSITE,
      status: "CONFIRMED",
      busyStatus: "BUSY",
      calName: "WIRO 4x4 Tours",
      categories: ["Travel", "Tour", "Adventure"],
      organizer: { name: COMPANY_NAME, email: "wiro.adventures@gmail.com" },
      attendees: [
        {
          name: booking.customerName,
          email: booking.customerEmail,
          rsvp: true,
        },
      ],
      alarms: [
        {
          action: "display",
          description: `Reminder: Your ${booking.tourType} with WIRO 4x4 is tomorrow! Don't forget to pack: comfortable clothes, sunscreen, insect repellent, camera, water bottle.`,
          trigger: { days: 1, before: true },
        },
        {
          action: "display",
          description: `Your ${booking.tourType} with WIRO 4x4 starts in 2 hours! Pickup at: ${booking.pickupLocation || "your hotel lobby"}. WhatsApp: +66929894495`,
          trigger: { hours: 2, before: true },
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
      <p>Dear ${escapeHtml2(booking.customerName)},</p>

      <p>Thank you for booking with <strong>WIRO 4x4 - Kosher Off-Road Adventures</strong>! We're excited to take you on an unforgettable journey through Northern Thailand.</p>

      <div class="booking-details">
        <h2 style="margin-top: 0; color: #2d5016;">\u{1F4CB} Your Booking Details</h2>
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span> ${booking.bookingId}
        </div>
        <div class="detail-row">
          <span class="detail-label">Tour Type:</span> ${escapeHtml2(booking.tourType)}
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span> ${new Date(booking.tourDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
        <div class="detail-row">
          <span class="detail-label">Group Size:</span> ${booking.groupSize} people
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Location:</span> ${escapeHtml2(booking.pickupLocation) || "To be confirmed"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Time:</span> ${booking.pickupTime || "08:00 AM"}
        </div>
        ${
          booking.specialRequests
            ? `
        <div class="detail-row">
          <span class="detail-label">Special Requests:</span> ${escapeHtml2(booking.specialRequests)}
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

      <div class="info-box" style="background: #e3f2fd; border-left-color: #1976d2;">
        <h3 style="margin-top: 0; color: #1976d2;">\u{1F4CD} Meeting Point & Location</h3>
        <p><strong>Location:</strong> Chiang Mai, Thailand</p>
        <p><strong>Pickup:</strong> Your hotel lobby (pickup included) or Chiang Mai Old City area</p>
        <p style="margin-top: 10px;">
          <a href="https://maps.google.com/?q=Chiang+Mai+Thailand" style="color: #1976d2; text-decoration: underline;">View Chiang Mai on Google Maps</a>
        </p>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #2d5016;">\u{1F392} What to Bring Checklist</h3>
        <ul>
          <li>Comfortable clothing and closed-toe shoes</li>
          <li>Sunscreen (SPF 30+) and insect repellent</li>
          <li>Hat and sunglasses</li>
          <li>Camera for amazing photos</li>
          <li>Water bottle (we'll provide refills)</li>
          <li>Light rain jacket (just in case)</li>
          <li>Any personal medications</li>
          <li>Sense of adventure!</li>
        </ul>
      </div>

      <div class="contact-info">
        <h3 style="margin-top: 0; color: #f5a623;">\u{1F4DE} Contact & Emergency Info</h3>
        <p><strong>Phone:</strong> <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a></p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/${COMPANY_WHATSAPP}" style="color: #25d366; font-weight: bold;">${COMPANY_PHONE}</a> (fastest way to reach us)</p>
        <p><strong>Email:</strong> <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a></p>
        <p><strong>Website:</strong> <a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a></p>
        <p style="margin-top: 15px; font-size: 14px; background: #fff8e1; padding: 10px; border-radius: 6px;">
          <strong>Need help before or during your tour?</strong><br>
          WhatsApp us anytime at <a href="https://wa.me/${COMPANY_WHATSAPP}" style="color: #25d366; font-weight: bold;">${COMPANY_PHONE}</a> \u2014 we respond quickly!
        </p>
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
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated confirmation email. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;
    const emailData = {
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
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
      <p>Dear ${escapeHtml2(booking.customerName)},</p>
      <p>This is a friendly reminder that your <strong>${escapeHtml2(booking.tourType)}</strong> with WIRO 4x4 is <strong>tomorrow, ${formattedDate}</strong>!</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">Quick Details</h3>
        <p><strong>Pickup Time:</strong> ${booking.pickupTime || "08:00 AM"}</p>
        <p><strong>Pickup Location:</strong> ${escapeHtml2(booking.pickupLocation) || "To be confirmed"}</p>
        <p><strong>Group Size:</strong> ${booking.groupSize} people</p>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      </div>
      <h3>Don't Forget to Bring:</h3>
      <ul>
        <li>Comfortable clothing and closed-toe shoes</li>
        <li>Sunscreen (SPF 30+) and insect repellent</li>
        <li>Hat and sunglasses</li>
        <li>Camera</li>
        <li>Water bottle</li>
        <li>Light rain jacket</li>
      </ul>
      <p><strong>Meeting Point:</strong> Your hotel lobby (pickup included) or Chiang Mai Old City area.
        <a href="https://maps.google.com/?q=Chiang+Mai+Thailand" style="color: #1976d2;">View on Google Maps</a>
      </p>
      <p>Questions? Contact us:</p>
      <p>Phone: <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a> | WhatsApp: <a href="https://wa.me/${COMPANY_WHATSAPP}" style="color: #25d366; font-weight: bold;">${COMPANY_PHONE}</a> (fastest response)</p>
      <p>See you tomorrow!</p>
      <p><strong>The WIRO 4x4 Team</strong></p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
    </div>
  </div>
</body>
</html>`;
    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
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
      <p>Dear ${escapeHtml2(customerName)},</p>

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
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
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
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
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
      <p>Dear ${escapeHtml2(booking.customerName)},</p>
      <p>Thank you for choosing <strong>WIRO 4x4</strong> for your ${escapeHtml2(booking.tourType)} adventure! We hope you had an amazing time exploring Northern Thailand.</p>
      <p>Your feedback helps us improve and helps other travelers discover our tours. Would you take a moment to share your experience?</p>
      <div style="text-align: center;">
        <a href="${COMPANY_WEBSITE}/reviews" class="cta-button">Leave a Review</a>
      </div>
      <p>Thank you for being part of the WIRO 4x4 family. We hope to see you again!</p>
      <p><strong>The WIRO 4x4 Team</strong></p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
    </div>
  </div>
</body>
</html>`;
    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
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
      <p>Dear ${escapeHtml2(customerName)},</p>
      ${message
        .split("\n")
        .map(line => `<p>${escapeHtml2(line)}</p>`)
        .join("")}
      <p style="margin-top: 30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
    </div>
  </div>
</body>
</html>`;
    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
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

// server/newsletterEmailService.ts
init_db();
var _resend3 = null;
function getResend3() {
  if (!_resend3) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[Newsletter] No RESEND_API_KEY \u2014 emails will not be sent"
      );
      return null;
    }
    const { Resend: Resend8 } = __require("resend");
    _resend3 = new Resend8(apiKey);
  }
  return _resend3;
}
async function sendNewsletterEmail(blogPostId, subscribers2, subject) {
  const resend = getResend3();
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
    const { Resend: Resend8 } = await import("resend");
    resendClient = new Resend8(apiKey);
  }
  return resendClient;
}
function escapeHtml3(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
async function sendEmailNotification(title, content) {
  const ownerEmail = process.env.OWNER_EMAIL;
  const hasEmailConfig = Boolean(ownerEmail && process.env.RESEND_API_KEY);
  if (!hasEmailConfig) return false;
  const resend = await getResendClient();
  if (!resend) return false;
  await resend.emails.send({
    from: "notifications@wiro4x4indochina.com",
    to: ownerEmail,
    subject: title,
    html: `
      <h2>${escapeHtml3(title)}</h2>
      <div>${escapeHtml3(content).replace(/\n/g, "<br>")}</div>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Sent from Wiro 4x4 Notification System
      </p>
    `,
  });
  return true;
}
async function sendTelegramNotification(title, content) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: [`WIRO 4x4: ${title}`, "", content].join("\n").slice(0, 4096),
      }),
    }
  );
  if (!response.ok) {
    console.error("[Notification] Telegram failed:", await response.text());
    return false;
  }
  return true;
}
async function notifyOwner(payload) {
  const { title, content } = payload;
  if (!title?.trim() || !content?.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title and content are required.",
    });
  }
  try {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (await sendEmailNotification(cleanTitle, cleanContent)) {
      return true;
    }
    if (await sendTelegramNotification(cleanTitle, cleanContent)) {
      return true;
    }
    console.warn(
      "[Notification] No owner notification channel configured. Set OWNER_EMAIL plus RESEND_API_KEY, or TELEGRAM_BOT_TOKEN plus TELEGRAM_CHAT_ID."
    );
    return false;
  } catch (error) {
    console.error("[Notification] Delivery failed:", error);
    return false;
  }
}

// server/routes/n8n.ts
init_postTourReviewService();
var n8nActionSchema = z2.discriminatedUnion("action", [
  z2.object({
    action: z2.literal("system.ping"),
    client: z2.string().trim().max(120).optional(),
  }),
  z2.object({
    action: z2.literal("lead.update"),
    leadId: z2.number().int().positive(),
    status: z2
      .enum(["new", "contacted", "quoted", "converted", "lost"])
      .optional(),
    notes: z2.string().max(2e3).optional(),
    convertedToBookingId: z2.number().int().positive().optional(),
  }),
  z2.object({
    action: z2.literal("booking.update"),
    bookingId: z2.number().int().positive(),
    status: z2
      .enum(["pending", "confirmed", "in_progress", "completed", "cancelled"])
      .optional(),
    notes: z2.string().max(2e3).optional(),
    assignedAgentId: z2.number().int().positive().optional(),
    totalPrice: z2.number().int().min(0).optional(),
    depositPaid: z2.number().int().min(0).optional(),
    balancePaid: z2.number().int().min(0).optional(),
  }),
  z2.object({
    action: z2.literal("booking.send_reminder"),
    bookingId: z2.number().int().positive(),
  }),
  z2.object({
    action: z2.literal("booking.send_due_reminders"),
    limit: z2.number().int().min(1).max(10).default(10),
  }),
  z2.object({
    action: z2.literal("post_tour_review.schedule"),
    bookingId: z2.number().int().positive(),
    delayMinutes: z2.number().int().min(30).max(60).optional(),
  }),
  z2.object({
    action: z2.literal("post_tour_review.process_due"),
  }),
  z2.object({
    action: z2.literal("abandoned.send_recovery"),
    leadId: z2.number().int().positive(),
  }),
  z2.object({
    action: z2.literal("abandoned.send_batch_recovery"),
    limit: z2.number().int().min(1).max(10).default(10),
  }),
  z2.object({
    action: z2.literal("newsletter.send"),
    blogPostId: z2.number().int().positive(),
    subject: z2.string().max(200).optional(),
  }),
  z2.object({
    action: z2.literal("ops.notify"),
    title: z2.string().trim().min(1).max(160),
    content: z2.string().trim().min(1).max(4e3),
    priority: z2.enum(["info", "warning", "urgent"]).default("info"),
    resourceType: z2
      .enum(["lead", "booking", "review", "newsletter", "system"])
      .optional(),
    resourceId: z2.number().int().positive().optional(),
    dedupeKey: z2.string().trim().min(1).max(200).optional(),
    cooldownMinutes: z2
      .number()
      .int()
      .min(1)
      .max(24 * 60)
      .optional(),
  }),
]);
function getAutomationSecret() {
  return (
    process.env.N8N_API_SECRET?.trim() ||
    process.env.N8N_WEBHOOK_SECRET?.trim() ||
    ""
  );
}
function safeCompare(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
function isAuthorized(req) {
  const expected = getAutomationSecret();
  if (!expected) return false;
  const provided = req.header("x-wiro-automation-secret")?.trim() ?? "";
  return provided.length > 0 && safeCompare(provided, expected);
}
function toIso(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}
function hashDedupeKey(key) {
  const value = createHash("sha256").update(key).digest().readUInt32BE(0);
  return (value % 2147483646) + 1;
}
function getOpsNotifyAuditTarget(input) {
  if (input.dedupeKey) {
    return {
      resourceType: "n8nNotification",
      resourceId: hashDedupeKey(input.dedupeKey),
    };
  }
  return {
    resourceType: input.resourceType ?? "system",
    resourceId: input.resourceId,
  };
}
function getAuditTarget(input) {
  switch (input.action) {
    case "system.ping":
      return { resourceType: "system", resourceId: void 0 };
    case "lead.update":
    case "abandoned.send_recovery":
      return { resourceType: "lead", resourceId: input.leadId };
    case "booking.update":
    case "booking.send_reminder":
    case "post_tour_review.schedule":
      return {
        resourceType:
          input.action === "post_tour_review.schedule"
            ? "postTourReview"
            : "booking",
        resourceId: input.bookingId,
      };
    case "booking.send_due_reminders":
      return { resourceType: "booking", resourceId: void 0 };
    case "newsletter.send":
      return { resourceType: "newsletter", resourceId: input.blogPostId };
    case "ops.notify":
      return getOpsNotifyAuditTarget(input);
    case "post_tour_review.process_due":
      return { resourceType: "postTourReview", resourceId: void 0 };
    case "abandoned.send_batch_recovery":
      return { resourceType: "lead", resourceId: void 0 };
  }
}
async function logN8nAction(input, result) {
  const target = getAuditTarget(input);
  await logAdminAction({
    userId: null,
    action: `n8n.${input.action}`,
    resourceType: target.resourceType,
    resourceId: target.resourceId,
    newValue: JSON.stringify({
      input,
      result,
      executedAt: /* @__PURE__ */ new Date().toISOString(),
    }),
  });
}
async function finishN8nAction(input, result) {
  await logN8nAction(input, result);
  return result;
}
function buildBookingReminderPayload(booking) {
  return {
    customerName: booking.contactName,
    customerEmail: booking.contactEmail ?? "",
    tourDate: toIso(booking.arrivalDate) ?? "",
    tourType: "Custom Tour",
    groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
    pickupLocation: booking.pickupPoint,
    pickupTime: "08:00",
    specialRequests: booking.specialRequests ?? void 0,
    bookingId: `WIRO-${booking.id}`,
  };
}
async function getN8nLeadSnapshot(leadId) {
  const lead = await getLeadById(leadId);
  if (!lead) return null;
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? null,
    source: lead.source,
    interestedTours: lead.interestedTours,
    status: lead.status,
    convertedToBookingId: lead.convertedToBookingId ?? null,
    score: lead.score ?? 0,
    recoveryEmailSentAt: toIso(lead.recoveryEmailSentAt),
    createdAt: toIso(lead.createdAt),
    updatedAt: toIso(lead.updatedAt),
  };
}
async function getN8nBookingSnapshot(bookingId) {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;
  return {
    id: booking.id,
    contactName: booking.contactName,
    contactEmail: booking.contactEmail ?? null,
    contactPhone: booking.contactPhone,
    contactWhatsApp: booking.contactWhatsApp ?? null,
    agentName: booking.agentName ?? null,
    arrivalDate: toIso(booking.arrivalDate),
    departureDate: toIso(booking.departureDate),
    numberOfAdults: booking.numberOfAdults,
    hasChildren: Boolean(booking.hasChildren),
    numberOfChildren: booking.numberOfChildren ?? 0,
    includesHotels: Boolean(booking.includesHotels),
    includesGuide: Boolean(booking.includesGuide),
    includesTrip: Boolean(booking.includesTrip),
    includesAttractions: Boolean(booking.includesAttractions),
    includesFood: Boolean(booking.includesFood),
    needsShabbatHotel: Boolean(booking.needsShabbatHotel),
    selfDriving4x4: Boolean(booking.selfDriving4x4),
    pickupPoint: booking.pickupPoint,
    dropoffPoint: booking.dropoffPoint,
    status: booking.status,
    totalPrice: booking.totalPrice ?? null,
    depositPaid: booking.depositPaid ?? 0,
    balancePaid: booking.balancePaid ?? 0,
    assignedAgentId: booking.assignedAgentId ?? null,
    reminderSentAt: toIso(booking.reminderSentAt),
    feedbackSentAt: toIso(booking.feedbackSentAt),
    postTourEmailSentAt: toIso(booking.postTourEmailSentAt),
    source: booking.source,
    createdAt: toIso(booking.createdAt),
    updatedAt: toIso(booking.updatedAt),
  };
}
async function executeN8nAction(input) {
  switch (input.action) {
    case "system.ping": {
      return {
        action: input.action,
        changed: false,
        pong: true,
        client: input.client ?? null,
        checkedAt: /* @__PURE__ */ new Date().toISOString(),
      };
    }
    case "lead.update": {
      const data = {
        ...(input.status ? { status: input.status } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
        ...(input.convertedToBookingId
          ? { convertedToBookingId: input.convertedToBookingId }
          : {}),
      };
      if (Object.keys(data).length === 0) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "no_fields_to_update",
        });
      }
      await updateLead(input.leadId, data);
      return finishN8nAction(input, {
        action: input.action,
        changed: true,
        leadId: input.leadId,
      });
    }
    case "booking.update": {
      const data = {
        ...(input.status ? { status: input.status } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
        ...(input.assignedAgentId
          ? { assignedAgentId: input.assignedAgentId }
          : {}),
        ...(input.totalPrice != null ? { totalPrice: input.totalPrice } : {}),
        ...(input.depositPaid != null
          ? { depositPaid: input.depositPaid }
          : {}),
        ...(input.balancePaid != null
          ? { balancePaid: input.balancePaid }
          : {}),
      };
      if (Object.keys(data).length === 0) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "no_fields_to_update",
        });
      }
      await updateBooking(input.bookingId, data);
      if (input.status === "completed") {
        await schedulePostTourReviewForBooking({
          bookingId: input.bookingId,
          completedAt: /* @__PURE__ */ new Date(),
        });
      }
      return finishN8nAction(input, {
        action: input.action,
        changed: true,
        bookingId: input.bookingId,
      });
    }
    case "booking.send_reminder": {
      const booking = await getBookingById(input.bookingId);
      if (!booking || !booking.contactEmail) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "booking_not_found_or_missing_email",
          bookingId: input.bookingId,
          sent: false,
        });
      }
      if (booking.reminderSentAt) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "reminder_already_sent",
          bookingId: booking.id,
          sent: false,
        });
      }
      const sent = await sendBookingReminder(
        buildBookingReminderPayload(booking)
      );
      if (sent) await markReminderSent(booking.id);
      return finishN8nAction(input, {
        action: input.action,
        changed: sent,
        bookingId: booking.id,
        sent,
      });
    }
    case "booking.send_due_reminders": {
      const dueBookings = await getBookingsNeedingReminder();
      const batch = dueBookings.slice(0, input.limit);
      let sent = 0;
      let failed = 0;
      let skipped = 0;
      const bookingIds = [];
      for (const booking of batch) {
        if (!booking.contactEmail) {
          skipped++;
          continue;
        }
        const ok = await sendBookingReminder(
          buildBookingReminderPayload(booking)
        );
        if (ok) {
          await markReminderSent(booking.id);
          sent++;
          bookingIds.push(booking.id);
        } else {
          failed++;
        }
      }
      return finishN8nAction(input, {
        action: input.action,
        changed: sent > 0,
        attempted: batch.length,
        sent,
        failed,
        skipped,
        bookingIds,
      });
    }
    case "post_tour_review.schedule": {
      const entry = await schedulePostTourReviewForBooking({
        bookingId: input.bookingId,
        delayMinutes: input.delayMinutes,
      });
      return finishN8nAction(input, {
        action: input.action,
        changed: true,
        bookingId: input.bookingId,
        entry,
      });
    }
    case "post_tour_review.process_due": {
      const result = await processDuePostTourReviewRequests();
      return finishN8nAction(input, {
        action: input.action,
        changed: true,
        result,
      });
    }
    case "abandoned.send_recovery": {
      const leads2 = await getAbandonedLeads(24 * 365);
      const lead = leads2.find(item => item.id === input.leadId);
      if (!lead || !lead.email) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "lead_not_found_or_missing_email",
          leadId: input.leadId,
        });
      }
      if (lead.recoveryEmailSentAt) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "recovery_already_sent",
          leadId: input.leadId,
        });
      }
      const sent = await sendAbandonedBookingEmail(lead);
      if (sent) await markRecoveryEmailSent(lead.id);
      return finishN8nAction(input, {
        action: input.action,
        changed: sent,
        leadId: lead.id,
        sent,
      });
    }
    case "abandoned.send_batch_recovery": {
      const leads2 = await getAbandonedLeads(24);
      const batch = leads2
        .filter(lead => !lead.recoveryEmailSentAt && lead.email)
        .slice(0, input.limit);
      let sent = 0;
      let failed = 0;
      for (const lead of batch) {
        const ok = await sendAbandonedBookingEmail(lead);
        if (ok) {
          await markRecoveryEmailSent(lead.id);
          sent++;
        } else {
          failed++;
        }
      }
      return finishN8nAction(input, {
        action: input.action,
        changed: sent > 0,
        attempted: batch.length,
        sent,
        failed,
      });
    }
    case "newsletter.send": {
      const subscribers2 = await getAllActiveSubscribers();
      if (subscribers2.length === 0) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "no_active_subscribers",
          sent: 0,
        });
      }
      const sent = await sendNewsletterEmail(
        input.blogPostId,
        subscribers2,
        input.subject
      );
      return finishN8nAction(input, {
        action: input.action,
        changed: sent > 0,
        blogPostId: input.blogPostId,
        sent,
      });
    }
    case "ops.notify": {
      const auditTarget = getOpsNotifyAuditTarget(input);
      if (input.dedupeKey && input.cooldownMinutes) {
        const alreadyNotified = await hasRecentAuditLog({
          action: "n8n.ops.notify",
          resourceType: auditTarget.resourceType,
          resourceId: auditTarget.resourceId,
          since: new Date(Date.now() - input.cooldownMinutes * 60 * 1e3),
        });
        if (alreadyNotified) {
          return {
            action: input.action,
            changed: false,
            delivered: false,
            deduped: true,
            priority: input.priority,
          };
        }
      }
      const delivered = await notifyOwner({
        title:
          input.priority === "info"
            ? input.title
            : `[${input.priority.toUpperCase()}] ${input.title}`,
        content: [
          input.content,
          input.resourceType
            ? `
Resource: ${input.resourceType}${input.resourceId ? ` #${input.resourceId}` : ""}`
            : "",
        ].join(""),
      });
      return finishN8nAction(input, {
        action: input.action,
        changed: delivered,
        delivered,
        priority: input.priority,
      });
    }
  }
}
function registerN8nRoutes(app2) {
  app2.get("/api/n8n/leads/:id", async (req, res) => {
    if (!getAutomationSecret()) {
      res.status(503).json({ error: "n8n_api_secret_not_configured" });
      return;
    }
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const parsed = z2.coerce.number().int().positive().safeParse(req.params.id);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_lead_id" });
      return;
    }
    try {
      const lead = await getN8nLeadSnapshot(parsed.data);
      if (!lead) {
        res.status(404).json({ error: "lead_not_found" });
        return;
      }
      res.json({ lead });
    } catch (err) {
      console.error("[n8n] Failed to fetch lead snapshot", err);
      res.status(500).json({ error: "lead_snapshot_failed" });
    }
  });
  app2.get("/api/n8n/bookings/:id", async (req, res) => {
    if (!getAutomationSecret()) {
      res.status(503).json({ error: "n8n_api_secret_not_configured" });
      return;
    }
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const parsed = z2.coerce.number().int().positive().safeParse(req.params.id);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_booking_id" });
      return;
    }
    try {
      const booking = await getN8nBookingSnapshot(parsed.data);
      if (!booking) {
        res.status(404).json({ error: "booking_not_found" });
        return;
      }
      res.json({ booking });
    } catch (err) {
      console.error("[n8n] Failed to fetch booking snapshot", err);
      res.status(500).json({ error: "booking_snapshot_failed" });
    }
  });
  app2.get("/api/n8n/operations-snapshot", async (req, res) => {
    if (!getAutomationSecret()) {
      res.status(503).json({ error: "n8n_api_secret_not_configured" });
      return;
    }
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      const [
        pendingBookings,
        newLeads24h,
        upcomingTours48h,
        staleLeads,
        leadSlaDue,
        coldLeadFollowupsDue,
        bookingsNeedingReminder,
        bookingsNeedingFeedback,
        failedWhatsAppMessages,
        postTourReviews,
      ] = await Promise.all([
        getPendingBookingCount(),
        getNewLeadCount(24),
        getUpcomingTourCount(48),
        getStaleNewLeads(),
        getLeadSlaBreaches(10),
        getColdContactedLeads(),
        getBookingsNeedingReminder(),
        getBookingsNeedingFeedback(),
        getRecentFailedWhatsAppMessages(24),
        getWeeklyPostTourReviewMetrics(),
      ]);
      res.json({
        generatedAt: /* @__PURE__ */ new Date().toISOString(),
        timezone: "Asia/Bangkok",
        counts: {
          pendingBookings,
          newLeads24h,
          upcomingTours48h,
          staleLeads: staleLeads.length,
          leadSlaDue: leadSlaDue.length,
          coldLeadFollowupsDue: coldLeadFollowupsDue.length,
          bookingRemindersDue: bookingsNeedingReminder.length,
          feedbackRequestsDue: bookingsNeedingFeedback.length,
          failedWhatsAppMessages: failedWhatsAppMessages.length,
        },
        queues: {
          leadSlaDue: leadSlaDue.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? null,
            source: lead.source,
            status: lead.status,
            score: lead.score ?? 0,
            createdAt: toIso(lead.createdAt),
            updatedAt: toIso(lead.updatedAt),
          })),
          coldLeadFollowupsDue: coldLeadFollowupsDue.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? null,
            source: lead.source,
            status: lead.status,
            score: lead.score ?? 0,
            createdAt: toIso(lead.createdAt),
            updatedAt: toIso(lead.updatedAt),
          })),
          staleLeads: staleLeads.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? null,
            source: lead.source,
            status: lead.status,
            createdAt: toIso(lead.createdAt),
            updatedAt: toIso(lead.updatedAt),
          })),
          bookingRemindersDue: bookingsNeedingReminder.map(booking => ({
            id: booking.id,
            contactName: booking.contactName,
            contactEmail: booking.contactEmail ?? null,
            contactPhone: booking.contactPhone,
            arrivalDate: toIso(booking.arrivalDate),
            departureDate: toIso(booking.departureDate),
            status: booking.status,
          })),
          feedbackRequestsDue: bookingsNeedingFeedback.map(booking => ({
            id: booking.id,
            contactName: booking.contactName,
            contactEmail: booking.contactEmail ?? null,
            contactPhone: booking.contactPhone,
            arrivalDate: toIso(booking.arrivalDate),
            departureDate: toIso(booking.departureDate),
            status: booking.status,
          })),
          failedWhatsAppMessages: failedWhatsAppMessages.map(message => ({
            id: message.id,
            whatsappMessageId: message.whatsappMessageId ?? null,
            phoneNumber: message.phoneNumber,
            direction: message.direction,
            status: message.status,
            isAutoReply: Boolean(message.isAutoReply),
            createdAt: toIso(message.createdAt),
          })),
        },
        postTourReviews,
      });
    } catch (err) {
      console.error("[n8n] Failed to build operations snapshot", err);
      res.status(500).json({ error: "operations_snapshot_failed" });
    }
  });
  app2.post("/api/n8n/actions", async (req, res) => {
    if (!getAutomationSecret()) {
      res.status(503).json({ error: "n8n_api_secret_not_configured" });
      return;
    }
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const parsed = n8nActionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "invalid_n8n_action",
        issues: parsed.error.issues,
      });
      return;
    }
    try {
      const result = await executeN8nAction(parsed.data);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error("[n8n] Failed to execute action", {
        action: parsed.data.action,
        err,
      });
      res.status(500).json({ error: "n8n_action_failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z as z3 } from "zod";

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
      z3.object({
        timestamp: z3.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),
  notifyOwner: adminProcedure
    .input(
      z3.object({
        title: z3.string().min(1, "title is required"),
        content: z3.string().min(1, "content is required"),
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

// server/routes/_helpers.ts
init_db();
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
import { z as z5 } from "zod";
init_db();

// server/emailService.ts
function formatDate2(date) {
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
- Arrival: ${formatDate2(data.arrivalDate)}
- Departure: ${formatDate2(data.departureDate)}
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
import { Resend as Resend2 } from "resend";
var _resend4 = null;
function getResend4() {
  if (!_resend4 && process.env.RESEND_API_KEY) {
    _resend4 = new Resend2(process.env.RESEND_API_KEY);
  }
  return _resend4;
}
var NOTIFICATION_RECIPIENTS = [
  "wiro.adventures@gmail.com",
  "pasuthunjunkong@gmail.com",
];
var SENDER_EMAIL2 = "WIRO 4x4 Bookings <bookings@wiro4x4indochina.com>";
function formatDate3(date) {
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
            <td style="padding: 8px 0; font-weight: bold;">${escapeHtml2(data.contactName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.contactEmail}" style="color: #1a4d2e;">${escapeHtml2(data.contactEmail)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Phone:</td>
            <td style="padding: 8px 0;"><a href="tel:${data.contactPhone}" style="color: #1a4d2e;">${escapeHtml2(data.contactPhone)}</a></td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

        <h2 style="color: #1a4d2e;">\u{1F4C5} Trip Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Arrival:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formatDate3(data.arrivalDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Departure:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formatDate3(data.departureDate)}</td>
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
    const resend = getResend4();
    if (!resend) {
      console.warn("[Resend] API key not configured, skipping email");
      return false;
    }
    const { data: result, error } = await resend.emails.send({
      from: SENDER_EMAIL2,
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

// shared/schemas.ts
import { z as z4 } from "zod";
var noHtml = val => !/<[^>]*>/g.test(val);
var bookingInputSchema = z4.object({
  contactName: z4
    .string()
    .min(1, "Name is required")
    .max(200)
    .refine(noHtml, "HTML tags are not allowed"),
  contactEmail: z4
    .string()
    .email("Invalid email")
    .optional()
    .or(z4.literal("")),
  contactPhone: z4.string().min(1, "Phone is required"),
  contactWhatsApp: z4.string().optional(),
  agentName: z4.string().max(200).optional(),
  arrivalDate: z4.string().transform(s => new Date(s)),
  departureDate: z4.string().transform(s => new Date(s)),
  numberOfAdults: z4.number().min(1).default(1),
  hasChildren: z4.boolean().default(false),
  numberOfChildren: z4.number().optional(),
  childrenAges: z4.string().optional(),
  includesHotels: z4.boolean().default(false),
  hotelPreferences: z4.optional(
    z4.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  includesGuide: z4.boolean().default(false),
  includesTrip: z4.boolean().default(false),
  includesAttractions: z4.boolean().default(false),
  selectedAttractions: z4.string().optional(),
  includesFood: z4.boolean().default(false),
  foodPreferences: z4.optional(
    z4.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  needsShabbatHotel: z4.boolean().default(false),
  shabbatHotel: z4.string().optional(),
  pickupPoint: z4.string().min(1, "Pickup point is required"),
  customPickupLocation: z4.string().max(500).optional(),
  dropoffPoint: z4.string().min(1, "Dropoff point is required"),
  customDropoffLocation: z4.string().max(500).optional(),
  suggestedDestinations: z4.string().max(500).optional(),
  specialRequests: z4.optional(
    z4.string().max(1e3).refine(noHtml, "HTML tags are not allowed")
  ),
  dietaryRestrictions: z4.optional(
    z4.string().max(500).refine(noHtml, "HTML tags are not allowed")
  ),
  budget: z4.string().optional(),
  source: z4.string().default("website"),
  utmSource: z4.string().optional(),
  utmMedium: z4.string().optional(),
  utmCampaign: z4.string().optional(),
});
var agentInputSchema = z4.object({
  name: z4.string().min(1, "Name is required"),
  email: z4.string().email("Invalid email"),
  phone: z4.string().min(1, "Phone is required"),
  whatsapp: z4.string().optional(),
  specialties: z4.string().optional(),
  languages: z4.string().optional(),
  status: z4.enum(["active", "inactive", "on_leave"]).default("active"),
  notes: z4.string().max(500).optional(),
});
var leadInputSchema = z4.object({
  name: z4.string().min(1, "Name is required"),
  email: z4.string().email("Invalid email"),
  phone: z4.string().optional(),
  source: z4.string().default("website"),
  interestedTours: z4.string().optional(),
  message: z4.optional(
    z4.string().max(1e3).refine(noHtml, "HTML tags are not allowed")
  ),
});
var financialRecordInputSchema = z4.object({
  bookingId: z4.number(),
  type: z4.enum(["revenue", "cost", "refund"]),
  category: z4.string().min(1, "Category is required"),
  amount: z4.number(),
  currency: z4.string().default("THB"),
  description: z4.string().optional(),
  paymentMethod: z4.string().optional(),
  paymentDate: z4
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : void 0)),
  notes: z4.string().optional(),
});
var tourInputSchema = z4.object({
  name: z4.string().min(1, "Name is required"),
  nameHe: z4.string().min(1, "Hebrew name is required"),
  slug: z4.string().optional(),
  description: z4.string().min(1, "Description is required"),
  descriptionHe: z4.string().min(1, "Hebrew description is required"),
  duration: z4.string().min(1, "Duration is required"),
  difficulty: z4.enum(["easy", "moderate", "challenging"]).default("moderate"),
  price: z4.number().min(0, "Price must be positive"),
  groupMinSize: z4.number().min(1).default(1),
  groupMaxSize: z4.number().min(1).default(10),
  imageUrl: z4.string().min(1, "Image URL is required"),
  highlights: z4.string().optional(),
  highlightsHe: z4.string().optional(),
  includedItems: z4.string().optional(),
  itinerary: z4.string().optional(),
  isKosher: z4.boolean().default(true),
  isPrivate: z4.boolean().default(true),
  isShabbatOk: z4.boolean().default(true),
  isActive: z4.boolean().default(true),
  sortOrder: z4.number().default(0),
});
var reviewInputSchema = z4.object({
  bookingId: z4.number().optional(),
  reviewRequestId: z4.number().optional(),
  name: z4.string().min(1, "Name is required"),
  email: z4.string().email("Invalid email"),
  rating: z4.number().min(1).max(5),
  text: z4
    .string()
    .min(1, "Review text is required")
    .max(2e3)
    .refine(noHtml, "HTML tags are not allowed"),
  tourType: z4.string().optional(),
  source: z4.string().max(50).optional(),
});
var blogPostInputSchema = z4.object({
  title: z4.string().min(1),
  titleHe: z4.string().optional(),
  slug: z4.string().min(1),
  excerpt: z4.string().optional(),
  excerptHe: z4.string().optional(),
  content: z4.string().min(1),
  contentHe: z4.string().optional(),
  coverImage: z4.string().optional(),
  category: z4.string().optional(),
  tags: z4.string().optional(),
  isPublished: z4.boolean().optional(),
  scheduledAt: z4.string().optional(),
  // ISO datetime string for scheduled publishing
  author: z4.string().optional(),
});
var tourPackageInputSchema = z4.object({
  name: z4.string().min(1, "Name is required").max(255),
  nameHe: z4.string().min(1, "Hebrew name is required").max(255),
  slug: z4.string().optional(),
  description: z4.string().optional(),
  descriptionHe: z4.string().optional(),
  tourSlugs: z4
    .array(z4.string().min(1))
    .min(2, "At least 2 tours required")
    .max(5, "Maximum 5 tours"),
  discountPercent: z4.number().min(0).max(50).nullable().optional(),
  coverImage: z4.string().optional(),
  isPublished: z4.boolean().optional(),
});
var createCheckoutSchema = z4.object({
  bookingId: z4.number(),
  amount: z4.number().positive(),
  type: z4.enum(["deposit", "balance", "full"]),
});
var refundSchema = z4.object({
  paymentId: z4.number(),
  amount: z4.number().positive().optional(),
  reason: z4.string().optional(),
});
var verifySessionSchema = z4.object({
  sessionId: z4.string(),
});
var paginationInput = z4.object({
  page: z4.number().min(1).default(1),
  pageSize: z4.number().min(1).max(100).default(20),
});
var customerInputSchema = z4.object({
  name: z4.string().min(1, "Name is required").max(255),
  email: z4.string().email("Invalid email").optional().or(z4.literal("")),
  phone: z4.string().max(50).optional(),
  whatsapp: z4.string().max(50).optional(),
  language: z4.enum(["en", "he"]).default("en"),
  stage: z4
    .enum(["prospect", "active", "completed", "vip", "inactive"])
    .default("prospect"),
  source: z4.string().max(100).default("website"),
  tags: z4.string().optional(),
  // JSON array string
  notes: z4.string().max(2e3).optional(),
});
var customerActivityInputSchema = z4.object({
  customerId: z4.number(),
  type: z4.enum([
    "note",
    "call",
    "whatsapp",
    "email",
    "follow_up",
    "status_change",
  ]),
  content: z4.string().min(1, "Content is required").max(2e3),
  dueDate: z4
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : void 0)),
  createdBy: z4.string().optional(),
});
var updateUserRoleSchema = z4.object({
  userId: z4.number(),
  role: z4.enum(["user", "admin", "owner", "manager", "agent"]),
});
var settingsUpdateSchema = z4.object({
  key: z4.string().min(1).max(100),
  value: z4.unknown(),
});
var bookingDraftInputSchema = z4.object({
  contactName: z4.string().optional(),
  contactEmail: z4.string().email().optional().or(z4.literal("")),
  contactPhone: z4.string().optional(),
  formData: z4.string(),
  // JSON string
  tourSlug: z4.string().optional(),
});
var invoiceInputSchema = z4.object({
  bookingId: z4.number().optional(),
  type: z4.enum(["tax_invoice", "receipt", "wht_certificate"]),
  customerName: z4.string().min(1, "Customer name is required").max(255),
  customerAddress: z4.string().max(1e3).optional(),
  customerTaxId: z4.string().max(50).optional(),
  currency: z4.enum(["THB", "ILS", "USD"]).default("THB"),
  subtotal: z4.number().min(0),
  vatAmount: z4.number().default(0),
  whtRate: z4.number().min(0).max(500).default(0),
  whtAmount: z4.number().default(0),
  totalAmount: z4.number().min(0),
  fxRate: z4.string().optional(),
  thbEquivalent: z4.number().optional(),
  paymentMethod: z4.string().max(50).optional(),
  lineItems: z4.string().optional(),
  notes: z4.string().max(2e3).optional(),
});
var accountingEntryInputSchema = z4.object({
  date: z4.string().transform(s => new Date(s)),
  accountCode: z4.string().min(5).max(10),
  description: z4.string().min(1, "Description is required").max(500),
  debit: z4.number().min(0).default(0),
  credit: z4.number().min(0).default(0),
  currency: z4.enum(["THB", "ILS", "USD"]).default("THB"),
  originalAmount: z4.number().optional(),
  fxRate: z4.string().optional(),
  bookingId: z4.number().optional(),
  invoiceId: z4.number().optional(),
  vendorPayee: z4.string().max(255).optional(),
  documentRef: z4.string().max(100).optional(),
});
var taxFilingInputSchema = z4.object({
  type: z4.enum([
    "vat_pp30",
    "wht_pnd3",
    "wht_pnd53",
    "cit_pnd50",
    "cit_pnd51",
  ]),
  period: z4.string().min(4).max(20),
  dueDate: z4.string().transform(s => new Date(s)),
  outputVat: z4.number().optional(),
  inputVat: z4.number().optional(),
  netVat: z4.number().optional(),
  whtTotal: z4.number().optional(),
  taxableIncome: z4.number().optional(),
  taxAmount: z4.number().optional(),
  notes: z4.string().max(2e3).optional(),
});
var inventoryInputSchema = z4.object({
  name: z4.string().min(1, "Name is required").max(255),
  category: z4.enum(["vehicle", "equipment", "supplies"]),
  description: z4.string().max(1e3).optional(),
  purchaseDate: z4
    .string()
    .optional()
    .transform(s => (s ? new Date(s) : void 0)),
  purchaseCost: z4.number().min(0).optional(),
  currentValue: z4.number().min(0).optional(),
  usefulLifeMonths: z4.number().min(1).optional(),
  condition: z4
    .enum(["new", "good", "fair", "poor", "retired"])
    .default("good"),
  quantity: z4.number().min(0).default(1),
  location: z4.string().max(255).optional(),
  notes: z4.string().max(2e3).optional(),
});
var manualPaymentInputSchema = z4.object({
  bookingId: z4.number(),
  amount: z4.number().positive(),
  currency: z4.string().default("THB"),
  paymentMethod: z4.enum([
    "bank_transfer",
    "promptpay",
    "cash",
    "bit",
    "wire",
    "other",
  ]),
  notes: z4.string().optional(),
});
var estimateEmailInputSchema = z4.object({
  email: z4.string().email("Valid email required"),
  selectedTours: z4.array(
    z4.object({
      slug: z4.string(),
      nameEn: z4.string(),
      nameHe: z4.string(),
      basePrice: z4.number(),
    })
  ),
  adults: z4.number().min(1),
  children: z4.array(z4.number().min(0).max(17)),
  arrivalDate: z4.string(),
  departureDate: z4.string(),
  includesHotels: z4.boolean(),
  includesFood: z4.boolean(),
  includesAttractions: z4.boolean(),
  attractionCount: z4.number().min(1),
  needsShabbatHotel: z4.boolean(),
  total: z4.number(),
  language: z4.enum(["en", "he"]),
});
var userPhotoSubmissionSchema = z4.object({
  name: z4
    .string()
    .min(1, "Name is required")
    .max(255)
    .refine(noHtml, "HTML tags are not allowed"),
  email: z4.string().email("Invalid email"),
  title: z4
    .string()
    .min(1, "Caption is required")
    .max(255)
    .refine(noHtml, "HTML tags are not allowed"),
  category: z4
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
  tourDate: z4.string().max(50).optional(),
});

// server/routes/booking.ts
init_eliNotify();
init_bookingReminder();
init_upsellService();
init_postTourReviewService();
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
      dispatchN8nEventInBackground("booking.created", {
        bookingId,
        booking: {
          ...input,
          arrivalDate: input.arrivalDate.toISOString(),
          departureDate: input.departureDate.toISOString(),
        },
        request: {
          referrer: ctx.req.headers.referer ?? ctx.req.headers.referrer ?? null,
          acceptLanguage: ctx.req.headers["accept-language"] ?? null,
        },
      });
      findOrCreateCustomer({
        name: input.contactName,
        email: input.contactEmail || void 0,
        phone: input.contactPhone,
        source: input.source,
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
      notifyBookingConfirmed({
        name: input.contactName,
        date: input.arrivalDate.toISOString().split("T")[0],
        pax: totalGuests,
      }).catch(err => {
        console.error("[Booking] Failed to notify Eli:", err);
      });
      if (input.departureDate) {
        scheduleBookingReminder(bookingId, input.departureDate).catch(err => {
          console.error("[Booking] Failed to schedule reminder:", err);
        });
      }
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
    .input(z5.object({ id: z5.number() }))
    .query(async ({ input }) => {
      return await getBookingById(input.id);
    }),
  update: secureProtectedProcedure
    .input(
      z5.object({
        id: z5.number(),
        data: z5.object({
          status: z5
            .enum([
              "pending",
              "confirmed",
              "in_progress",
              "completed",
              "cancelled",
            ])
            .optional(),
          totalPrice: z5.number().optional(),
          depositPaid: z5.number().optional(),
          balancePaid: z5.number().optional(),
          assignedAgentId: z5.number().optional(),
          notes: z5.string().optional(),
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
        dispatchN8nEventInBackground("booking.status_changed", {
          bookingId: input.id,
          oldStatus,
          newStatus: input.data.status,
          booking: oldBooking ?? null,
          updatedFields: input.data,
        });
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
        if (input.data.status === "completed") {
          dispatchN8nEventInBackground("booking.completed", {
            bookingId: input.id,
            completedAt: /* @__PURE__ */ new Date().toISOString(),
            booking: oldBooking ?? null,
          });
          scheduleUpsell({
            bookingId: input.id,
            customerName: oldBooking?.contactName ?? `Booking #${input.id}`,
            customerEmail: oldBooking?.contactEmail,
            completedAt: /* @__PURE__ */ new Date(),
          }).catch(err => {
            console.error("[Booking] Failed to schedule upsell:", err);
          });
          schedulePostTourReviewForBooking({
            bookingId: input.id,
            completedAt: /* @__PURE__ */ new Date(),
          }).catch(err => {
            console.error(
              "[Booking] Failed to schedule post-tour review request:",
              err
            );
          });
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
    .input(z5.object({ id: z5.number() }))
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
    .input(z5.object({ ids: z5.array(z5.number()).min(1) }))
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
    .input(z5.object({ id: z5.number() }))
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
    .input(z5.object({ bookingId: z5.number() }))
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
      z5.object({
        id: z5.number(),
        arrivalDate: z5
          .string()
          .or(z5.date())
          .transform(v => new Date(v)),
        departureDate: z5
          .string()
          .or(z5.date())
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
      z5.object({
        bookingIds: z5.array(z5.number()).min(1),
        subject: z5.string().min(1).max(200),
        message: z5.string().min(1).max(5e3),
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
import { z as z6 } from "zod";
init_db();
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
    .input(z6.object({ id: z6.number() }))
    .query(async ({ input }) => {
      return await getAgentById(input.id);
    }),
  update: secureProtectedProcedure
    .input(
      z6.object({
        id: z6.number(),
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
    .input(z6.object({ id: z6.number() }))
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
    .input(z6.object({ agentId: z6.number() }))
    .query(async ({ input }) => {
      return await getBookingsByAgentId(input.agentId);
    }),
  stats: secureProtectedProcedure.query(async () => {
    return await getAgentPerformanceStats();
  }),
  updateAvailability: secureProtectedProcedure
    .input(
      z6.object({
        id: z6.number(),
        status: z6.enum(["active", "inactive", "on_leave"]),
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
import { z as z7 } from "zod";
init_db();

// server/autoResponse.ts
init_llm();
init_db();
import { Resend as Resend3 } from "resend";
var SENDER_EMAIL3 = COMPANY_SENDER_EMAIL;
var _resend5 = null;
function getResend5() {
  if (!_resend5 && process.env.RESEND_API_KEY) {
    _resend5 = new Resend3(process.env.RESEND_API_KEY);
  }
  return _resend5;
}
async function sendAutoResponse(lead) {
  try {
    const resend = getResend5();
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

// server/routes/lead.ts
init_eliNotify();

// server/leadScoring.ts
init_db();
init_schema();
function getScoreTier(score) {
  if (score >= 75) return "hot";
  if (score >= 50) return "warm";
  if (score >= 25) return "cool";
  return "cold";
}
function calculateLeadScore(lead, allLeadEmails) {
  const details = {
    sourceQuality: { points: 0, max: 20, reason: "" },
    contactCompleteness: { points: 0, max: 15, reason: "" },
    messageQuality: { points: 0, max: 20, reason: "" },
    recency: { points: 0, max: 20, reason: "" },
    engagementSignals: { points: 0, max: 15, reason: "" },
    statusBonus: { points: 0, max: 10, reason: "" },
  };
  const source = (lead.source ?? "other").toLowerCase();
  const sourceMap = {
    "booking-form": 20,
    "contact-page": 15,
    whatsapp: 15,
    "quick-inquiry": 10,
    referral: 20,
    website: 10,
    instagram: 10,
    facebook: 10,
  };
  details.sourceQuality.points = sourceMap[source] ?? 5;
  details.sourceQuality.reason = `Source: ${source} (${details.sourceQuality.points}pts)`;
  let contactPts = 0;
  const contactReasons = [];
  if (lead.name && lead.name.trim().length > 0) {
    contactPts += 5;
    contactReasons.push("name (+5)");
  }
  if (lead.email && lead.email.trim().length > 0) {
    contactPts += 5;
    contactReasons.push("email (+5)");
  }
  if (lead.phone && lead.phone.trim().length > 0) {
    contactPts += 10;
    contactReasons.push("phone (+10)");
  }
  details.contactCompleteness.points = Math.min(15, contactPts);
  details.contactCompleteness.reason =
    contactReasons.length > 0 ? contactReasons.join(", ") : "No contact info";
  let messagePts = 0;
  const messageReasons = [];
  const msg = lead.message ?? "";
  if (msg.length > 100) {
    messagePts += 10;
    messageReasons.push("detailed message (+10)");
  } else if (msg.length > 0) {
    messagePts += 5;
    messageReasons.push("short message (+5)");
  }
  if (
    /\b\d{1,2}[\/-]\d{1,2}\b|\bjan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec\b|\bdate\b/i.test(
      msg
    )
  ) {
    messagePts += 5;
    messageReasons.push("mentions dates (+5)");
  }
  if (
    /\b\d+\s*(people|person|pax|adult|kid|child|group)\b/i.test(msg) ||
    /group\s*size/i.test(msg)
  ) {
    messagePts += 5;
    messageReasons.push("mentions group size (+5)");
  }
  if (/kosher|shabbat|sabbath|שבת|כשר/i.test(msg)) {
    messagePts += 5;
    messageReasons.push("mentions kosher/shabbat (+5)");
  }
  details.messageQuality.points = Math.min(20, messagePts);
  details.messageQuality.reason =
    messageReasons.length > 0 ? messageReasons.join(", ") : "No message";
  const now = /* @__PURE__ */ new Date();
  const ageMs = now.getTime() - new Date(lead.createdAt).getTime();
  const ageDays = ageMs / (1e3 * 60 * 60 * 24);
  if (ageDays < 1) {
    details.recency.points = 20;
    details.recency.reason = "Less than 1 day old (+20)";
  } else if (ageDays < 3) {
    details.recency.points = 15;
    details.recency.reason = "1-3 days old (+15)";
  } else if (ageDays < 7) {
    details.recency.points = 10;
    details.recency.reason = "3-7 days old (+10)";
  } else if (ageDays < 14) {
    details.recency.points = 5;
    details.recency.reason = "1-2 weeks old (+5)";
  } else {
    details.recency.points = 0;
    details.recency.reason = "Over 2 weeks old (+0)";
  }
  let engagementPts = 0;
  const engagementReasons = [];
  if (lead.recoveryEmailSentAt) {
    engagementPts += 5;
    engagementReasons.push("recovery email sent (+5)");
  }
  if (allLeadEmails) {
    const sameEmailCount = allLeadEmails.filter(
      e => e.toLowerCase() === lead.email.toLowerCase()
    ).length;
    if (sameEmailCount > 1) {
      engagementPts += 10;
      engagementReasons.push(`repeat inquiry x${sameEmailCount} (+10)`);
    }
  }
  if (lead.interestedTours) {
    try {
      const tours2 = JSON.parse(lead.interestedTours);
      if (Array.isArray(tours2) && tours2.length > 0) {
        engagementPts += 5;
        engagementReasons.push(`interested in ${tours2.length} tour(s) (+5)`);
      }
    } catch {
      if (lead.interestedTours.length > 0) {
        engagementPts += 3;
        engagementReasons.push("tour interest noted (+3)");
      }
    }
  }
  details.engagementSignals.points = Math.min(15, engagementPts);
  details.engagementSignals.reason =
    engagementReasons.length > 0
      ? engagementReasons.join(", ")
      : "No engagement signals";
  if (lead.status === "quoted") {
    details.statusBonus.points = 10;
    details.statusBonus.reason = "Status: quoted (+10)";
  } else if (lead.status === "contacted") {
    details.statusBonus.points = 5;
    details.statusBonus.reason = "Status: contacted (+5)";
  } else {
    details.statusBonus.points = 0;
    details.statusBonus.reason = `Status: ${lead.status} (+0)`;
  }
  const score = Math.max(
    0,
    Math.min(
      100,
      details.sourceQuality.points +
        details.contactCompleteness.points +
        details.messageQuality.points +
        details.recency.points +
        details.engagementSignals.points +
        details.statusBonus.points
    )
  );
  return {
    score,
    tier: getScoreTier(score),
    details,
  };
}
async function recalculateAllLeadScores() {
  const db = await getDb();
  if (!db) return { updated: 0, total: 0 };
  const allLeads = await db.select().from(leads);
  const activeLeads = allLeads.filter(l =>
    ["new", "contacted", "quoted"].includes(l.status)
  );
  const allEmails = allLeads.map(l => l.email);
  let updated = 0;
  for (const lead of activeLeads) {
    const result = calculateLeadScore(lead, allEmails);
    await updateLeadScore(
      lead.id,
      result.score,
      JSON.stringify(result.details)
    );
    updated++;
  }
  if (updated > 0) {
    console.log(
      `[LeadScoring] Updated scores for ${updated}/${activeLeads.length} leads`
    );
  }
  return { updated, total: activeLeads.length };
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
        const allEmails = allLeads.map(l => l.email);
        const result = calculateLeadScore(newLead, allEmails);
        updateLeadScore(
          newLead.id,
          result.score,
          JSON.stringify(result.details)
        ).catch(err =>
          console.error("[Lead] Failed to update lead score:", err)
        );
        dispatchN8nEventInBackground("lead.created", {
          lead: newLead,
          score: result.score,
          scoreDetails: result.details,
          source: input.source ?? "website",
          request: {
            referrer:
              ctx.req.headers.referer ?? ctx.req.headers.referrer ?? null,
            acceptLanguage: ctx.req.headers["accept-language"] ?? null,
          },
        });
      }
      notifyNewLead({
        name: input.name,
        email: input.email,
        phone: input.phone ?? void 0,
        source: input.source ?? void 0,
        interestedTours: input.interestedTours ?? void 0,
        message: input.message ?? void 0,
      }).catch(err => console.error("[Lead] Eli notify failed:", err));
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
    .input(
      paginationInput.extend({
        sortBy: z7.enum(["score", "date"]).default("score"),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, sortBy } = input;
      const { items, total } =
        sortBy === "score"
          ? await getAllLeadsPaginatedByScore(page, pageSize)
          : await getAllLeadsPaginated(page, pageSize);
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
          status: z7
            .enum(["new", "contacted", "quoted", "converted", "lost"])
            .optional(),
          convertedToBookingId: z7.number().optional(),
          notes: z7.string().optional(),
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
    .input(z7.object({ id: z7.number() }))
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
    .input(z7.object({ ids: z7.array(z7.number()).min(1) }))
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
import { z as z8 } from "zod";
init_db();
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
    .input(z8.object({ bookingId: z8.number() }))
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
      z8.object({
        id: z8.number(),
        data: z8.object({
          type: z8.enum(["revenue", "cost", "refund"]).optional(),
          category: z8.string().optional(),
          amount: z8.number().optional(),
          description: z8.string().optional(),
          paymentMethod: z8.string().optional(),
          notes: z8.string().optional(),
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
    .input(z8.object({ id: z8.number() }))
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
import { z as z9 } from "zod";
import { randomUUID as randomUUID2 } from "crypto";
init_db();

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
      z9
        .object({
          limit: z9.number().min(1).max(200).optional(),
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
        category: z9.string().optional(),
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
      z9.object({
        title: z9.string().min(1),
        imageUrl: z9.string().min(1),
        description: z9.string().optional(),
        category: z9
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
        sortOrder: z9.number().default(0),
        isPublished: z9.boolean().default(true),
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
      z9.object({
        id: z9.number(),
        data: z9.object({
          title: z9.string().optional(),
          imageUrl: z9.string().optional(),
          description: z9.string().optional(),
          category: z9
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
          sortOrder: z9.number().optional(),
          isPublished: z9.boolean().optional(),
          isFeatured: z9.boolean().optional(),
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
    .input(z9.object({ id: z9.number() }))
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
      z9.object({
        filename: z9.string(),
        contentType: z9.string(),
        base64Data: z9.string(),
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
      const safeFilename = `${randomUUID2()}.${ext}`;
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
  // Public: user-submitted photo upload
  submitUserPhoto: securePublicProcedure
    .input(
      z9.object({
        metadata: userPhotoSubmissionSchema,
        filename: z9.string(),
        contentType: z9.string(),
        base64Data: z9.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.req?.headers?.["x-forwarded-for"]?.toString().split(",")[0] ||
        ctx.req?.socket?.remoteAddress ||
        "unknown";
      const { allowed } = checkRateLimit(`user_photo:${ip}`, 5, 60 * 60 * 1e3);
      if (!allowed) {
        throw new TRPCError3({
          code: "TOO_MANY_REQUESTS",
          message: "Too many photo uploads. Please try again later.",
        });
      }
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
      if (!ALLOWED_TYPES.includes(input.contentType)) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Invalid file type. Allowed: JPG, PNG, WebP",
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
      const safeFilename = `${randomUUID2()}.${ext}`;
      const key = `gallery/user-submissions/${safeFilename}`;
      const buffer = Buffer.from(input.base64Data, "base64");
      let result;
      try {
        result = await storagePut(key, buffer, input.contentType);
      } catch (err) {
        captureException(err);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload photo. Please try again.",
          cause: err,
        });
      }
      await createGalleryPhoto({
        title: input.metadata.title,
        s3Key: result.key,
        s3Url: result.url,
        category: input.metadata.category,
        isPublished: 0,
        isUserSubmitted: 1,
        uploadedBy: input.metadata.name,
        uploadedByEmail: input.metadata.email,
        tourDate: input.metadata.tourDate || null,
      });
      return { success: true };
    }),
});

// server/routes/review.ts
import { z as z10 } from "zod";
init_db();
init_postTourReviewService();
var reviewRouter = router({
  create: securePublicProcedure
    .input(
      z10.object({
        bookingId: z10.number().int().positive().optional(),
        reviewRequestId: z10.number().int().positive().optional(),
        name: z10.string().min(1, "Name is required"),
        email: z10.string().email("Invalid email"),
        rating: z10.number().min(1).max(5),
        text: z10.string().min(1, "Review text is required"),
        tourType: z10.string().optional(),
        source: z10.string().max(50).optional(),
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
        source:
          input.source ??
          (input.reviewRequestId ? "whatsapp_post_tour" : "website"),
        isApproved: 0,
        isPublished: 0,
      });
      dispatchN8nEventInBackground("review.submitted", {
        review: {
          ...input,
          source:
            input.source ??
            (input.reviewRequestId ? "whatsapp_post_tour" : "website"),
          status: "pending",
        },
        request: {
          referrer: ctx.req.headers.referer ?? ctx.req.headers.referrer ?? null,
          acceptLanguage: ctx.req.headers["accept-language"] ?? null,
        },
      });
      try {
        await trackPostTourReviewSubmission({
          reviewRequestId: input.reviewRequestId,
          bookingId: input.bookingId,
          rating: input.rating,
          text: input.text,
          reviewerName: input.name,
        });
      } catch (err) {
        console.error("[Review] Failed to track post-tour submission:", err);
      }
      return { success: true, message: "Review submitted for approval" };
    }),
  markClicked: securePublicProcedure
    .input(z10.object({ reviewRequestId: z10.number().int().positive() }))
    .mutation(async ({ input }) => {
      await trackPostTourReviewLinkClick(input.reviewRequestId);
      return { success: true };
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
      z10.object({
        id: z10.number(),
        data: z10.object({
          status: z10.enum(["pending", "approved", "rejected"]).optional(),
          adminResponse: z10.string().optional(),
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
      dispatchN8nEventInBackground("review.status_updated", {
        reviewId: input.id,
        status: input.data.status ?? null,
        adminResponse: input.data.adminResponse ?? null,
        updatedBy: ctx.user?.email ?? null,
      });
      return { success: true };
    }),
  delete: secureProtectedProcedure
    .input(z10.object({ id: z10.number() }))
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
    .input(z10.object({ ids: z10.array(z10.number()).min(1) }))
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
    .input(z10.object({ ids: z10.array(z10.number()).min(1) }))
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
import { z as z11 } from "zod";
init_db();

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
init_db();
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
    .input(z11.object({ bookingId: z11.number() }))
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
import { z as z12 } from "zod";
init_db();
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
    .input(z12.object({ slug: z12.string() }))
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
      z12.object({
        id: z12.number(),
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
    .input(z12.object({ id: z12.number() }))
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
import { z as z13 } from "zod";
init_db();

// server/aiContentGenerator.ts
import Anthropic4 from "@anthropic-ai/sdk";
var _client3 = null;
function getClient3() {
  if (!_client3) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required for AI content generation"
      );
    }
    _client3 = new Anthropic4({ apiKey });
  }
  return _client3;
}
function buildSystemPrompt2(tourData) {
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
  const client = getClient3();
  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: buildSystemPrompt2(options.tourData),
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
    .input(z13.object({ slug: z13.string() }))
    .query(async ({ input }) => {
      return await getPublishedBlogPostBySlug(input.slug);
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
      const { scheduledAt, ...rest } = input;
      let publishedAt;
      if (input.isPublished) {
        publishedAt = scheduledAt
          ? new Date(scheduledAt)
          : /* @__PURE__ */ new Date();
      }
      await createBlogPost({
        ...rest,
        isPublished: input.isPublished ? 1 : 0,
        publishedAt,
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
      z13.object({
        id: z13.number(),
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
          updateData.publishedAt = input.data.scheduledAt
            ? new Date(input.data.scheduledAt)
            : /* @__PURE__ */ new Date();
        }
      } else if (input.data.scheduledAt !== void 0) {
        updateData.publishedAt = new Date(input.data.scheduledAt);
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
    .input(z13.object({ id: z13.number() }))
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
      z13.object({
        fileName: z13.string().min(1),
        fileData: z13.string().min(1),
        // base64
        contentType: z13.string().default("image/jpeg"),
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
      z13.object({
        topic: z13.string().min(1),
        tone: z13
          .enum(["informative", "adventurous", "practical"])
          .default("informative"),
        length: z13.number().min(300).max(3e3).default(1e3),
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
import { z as z14 } from "zod";
init_db();
var newsletterRouter = router({
  subscribe: securePublicProcedure
    .input(
      z14.object({
        email: z14.string().email(),
        name: z14.string().optional(),
        language: z14.string().default("en"),
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
      dispatchN8nEventInBackground("newsletter.subscribed", {
        subscriber: input,
        request: {
          referrer: ctx.req.headers.referer ?? ctx.req.headers.referrer ?? null,
          acceptLanguage: ctx.req.headers["accept-language"] ?? null,
        },
      });
      return { success: true, message: "Successfully subscribed!" };
    }),
  unsubscribe: securePublicProcedure
    .input(z14.object({ email: z14.string().email() }))
    .mutation(async ({ input }) => {
      await deactivateSubscriber(input.email);
      return { success: true, message: "Unsubscribed successfully" };
    }),
  list: secureProtectedProcedure.query(async () => {
    return await getAllSubscribers();
  }),
  send: secureProtectedProcedure
    .input(
      z14.object({
        blogPostId: z14.number(),
        subject: z14.string().optional(),
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
      dispatchN8nEventInBackground("newsletter.sent", {
        blogPostId: input.blogPostId,
        subject: input.subject ?? null,
        recipientCount: sent,
        sentBy: ctx.user?.email ?? null,
      });
      return { success: true, sent, message: `Sent to ${sent} subscribers` };
    }),
});

// server/routes/health.ts
import { sql as sql22 } from "drizzle-orm";
init_db();
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
      await db.select({ val: sql22`1` }).from(sql22`dual`);
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
import { z as z15 } from "zod";
init_db();
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
    .input(z15.object({ id: z15.number() }))
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
      z15.object({ id: z15.number(), data: customerInputSchema.partial() })
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
    .input(z15.object({ id: z15.number() }))
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
    .input(z15.object({ id: z15.number() }))
    .mutation(async ({ input }) => {
      await completeActivity(input.id);
      return { success: true };
    }),
  getPipelineStats: secureManagerProcedure.query(async () => {
    return await getCustomerPipelineStats();
  }),
  movePipeline: secureManagerProcedure
    .input(
      z15.object({
        customerId: z15.number(),
        stage: z15.enum(["prospect", "active", "completed", "vip", "inactive"]),
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
import { z as z16 } from "zod";
init_db();
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
    .input(z16.object({ userId: z16.number() }))
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
import { z as z17 } from "zod";
init_db();
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
    .input(z17.object({ key: z17.string() }))
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
  sql as sql23,
  eq as eq31,
  and as and19,
  gte as gte10,
  lte as lte7,
  count as count3,
  sum as sum2,
} from "drizzle-orm";
init_db();
init_db();
init_schema();
var dashboardRouter = router({
  stats: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        bookingsByDay: [],
        revenueByDay: [],
        leadConversion: { total: 0, converted: 0, rate: 0 },
        postTourReviews: {
          windowStart: "",
          windowEnd: "",
          volume: 0,
          completedTours: 0,
          reviewed: 0,
          completionRate: 0,
          lowRatingExceptions: 0,
        },
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
        date: sql23`DATE(${bookings.createdAt})`.as("date"),
        count: count3().as("count"),
      })
      .from(bookings)
      .where(gte10(bookings.createdAt, thirtyDaysAgo))
      .groupBy(sql23`DATE(${bookings.createdAt})`)
      .orderBy(sql23`DATE(${bookings.createdAt})`);
    const revenueByDay = await db
      .select({
        date: sql23`DATE(${financialRecords.createdAt})`.as("date"),
        total: sum2(financialRecords.amount).as("total"),
      })
      .from(financialRecords)
      .where(
        and19(
          eq31(financialRecords.type, "revenue"),
          gte10(financialRecords.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql23`DATE(${financialRecords.createdAt})`)
      .orderBy(sql23`DATE(${financialRecords.createdAt})`);
    const [leadStats] = await db
      .select({
        total: count3().as("total"),
        converted:
          sql23`SUM(CASE WHEN ${leads.status} = 'converted' THEN 1 ELSE 0 END)`.as(
            "converted"
          ),
      })
      .from(leads);
    const upcomingTours = await db
      .select()
      .from(bookings)
      .where(
        and19(
          gte10(bookings.arrivalDate, sql23`CURDATE()`),
          lte7(bookings.arrivalDate, sevenDaysFromNow),
          sql23`${bookings.status} IN ('confirmed', 'in_progress')`
        )
      )
      .orderBy(bookings.arrivalDate)
      .limit(10);
    const [pendingCount] = await db
      .select({ count: count3().as("count") })
      .from(bookings)
      .where(eq31(bookings.status, "pending"));
    const [newLeadsCount] = await db
      .select({ count: count3().as("count") })
      .from(leads)
      .where(eq31(leads.status, "new"));
    const postTourReviews = await getWeeklyPostTourReviewMetrics();
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
      postTourReviews,
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
      .select({ count: count3() })
      .from(bookings)
      .where(eq31(bookings.status, "pending"));
    const [newLeads] = await db
      .select({ count: count3() })
      .from(leads)
      .where(eq31(leads.status, "new"));
    const [pendingReviews] = await db
      .select({ count: count3() })
      .from(reviews)
      .where(eq31(reviews.isApproved, 0));
    const [draftPosts] = await db
      .select({ count: count3() })
      .from(blogPosts)
      .where(eq31(blogPosts.isPublished, 0));
    const [newCustomers] = await db
      .select({ count: count3() })
      .from(customers)
      .where(gte10(customers.createdAt, weekAgo));
    const [todayTours] = await db
      .select({ count: count3() })
      .from(bookings)
      .where(
        and19(
          gte10(bookings.arrivalDate, sql23`CURDATE()`),
          lte7(bookings.arrivalDate, tomorrow),
          sql23`${bookings.status} IN ('confirmed', 'in_progress')`
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
init_db();
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
import { z as z18 } from "zod";
import crypto2 from "crypto";
init_db();

// server/abandonedBookingEmail.ts
import { Resend as Resend4 } from "resend";
var _resend6 = null;
function getResend6() {
  if (!_resend6 && process.env.RESEND_API_KEY) {
    _resend6 = new Resend4(process.env.RESEND_API_KEY);
  }
  return _resend6;
}
var SITE_URL2 = process.env.SITE_URL || "https://www.wiro4x4indochina.com";
async function sendBookingRecoveryEmail(email, name, resumeToken) {
  const resend = getResend6();
  if (!resend) {
    console.warn(
      "[AbandonedBooking] Resend API key not configured, skipping email"
    );
    return false;
  }
  const resumeLink = `${SITE_URL2}/book?token=${resumeToken}`;
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
      const resumeToken = crypto2.randomBytes(32).toString("hex");
      const id = await createBookingDraft({
        ...input,
        resumeToken,
      });
      return { id, resumeToken };
    }),
  getByToken: securePublicProcedure
    .input(z18.object({ token: z18.string().min(1) }))
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
      z18.object({
        id: z18.number(),
        status: z18.enum(["active", "converted", "expired"]),
        convertedToBookingId: z18.number().optional(),
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
    .input(z18.object({ draftId: z18.number() }))
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
init_db();
init_schema();
init_analytics();
import { count as count4, gte as gte11 } from "drizzle-orm";
var analyticsRouter = router({
  /** Existing booking funnel (30 days). */
  funnelData: secureProtectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { steps: [], conversionRate: 0 };
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const [completedResult] = await db
      .select({ count: count4() })
      .from(bookings)
      .where(gte11(bookings.createdAt, thirtyDaysAgo));
    const [draftsResult] = await db
      .select({ count: count4() })
      .from(bookingDrafts)
      .where(gte11(bookingDrafts.createdAt, thirtyDaysAgo));
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
  /** KPI overview for the analytics dashboard. */
  overview: secureProtectedProcedure.query(async () => {
    return await getAnalyticsOverview();
  }),
  /** Revenue grouped by month (last 12 months). */
  revenueByMonth: secureProtectedProcedure.query(async () => {
    return await getRevenueByMonth();
  }),
  /** Booking count by month (last 12 months). */
  bookingsByMonth: secureProtectedProcedure.query(async () => {
    return await getBookingsByMonth();
  }),
  /** Lead funnel: count of leads in each status. */
  leadFunnel: secureProtectedProcedure.query(async () => {
    return await getLeadFunnel();
  }),
  /** Most booked tours with revenue. */
  topTours: secureProtectedProcedure.query(async () => {
    return await getTopTours();
  }),
  /** Last 10 bookings + leads combined, sorted by date. */
  recentActivity: secureProtectedProcedure.query(async () => {
    return await getRecentActivity();
  }),
});

// server/routes/package.ts
import { z as z19 } from "zod";
init_db();

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
  const originalPrice = resolvedTours.reduce((sum3, t2) => sum3 + t2.price, 0);
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
    .input(z19.object({ slug: z19.string() }))
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
      z19.object({
        id: z19.number(),
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
    .input(z19.object({ id: z19.number() }))
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
import { z as z20 } from "zod";
init_db();

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
    .input(z20.object({ id: z20.number() }))
    .query(async ({ input }) => {
      return await getInvoiceById(input.id);
    }),
  updateInvoiceStatus: secureProtectedProcedure
    .input(
      z20.object({
        id: z20.number(),
        status: z20.enum(["unpaid", "paid", "partial", "cancelled"]),
        paymentDate: z20.string().optional(),
        paymentMethod: z20.string().optional(),
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
        accountCode: z20.string().optional(),
        startDate: z20.string().optional(),
        endDate: z20.string().optional(),
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
      z20.object({
        id: z20.number(),
        status: z20.enum(["pending", "prepared", "filed", "late"]),
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
import { z as z21 } from "zod";
init_db();
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
    .input(z21.object({ id: z21.number() }))
    .query(async ({ input }) => {
      return await getInventoryById(input.id);
    }),
  update: secureProtectedProcedure
    .input(
      z21.object({
        id: z21.number(),
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
    .input(z21.object({ id: z21.number() }))
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
      dispatchN8nEventInBackground("estimate.requested", {
        estimate: input,
        request: {
          referrer: ctx.req.headers.referer ?? ctx.req.headers.referrer ?? null,
          acceptLanguage: ctx.req.headers["accept-language"] ?? null,
        },
      });
      return { success: true };
    }),
});

// server/routes/abandoned.ts
import { z as z22 } from "zod";
init_db();
var abandonedRouter = router({
  /**
   * List abandoned leads: status='new', created >24h ago, recovery email not yet sent.
   * Optionally include already-emailed leads with `includeEmailed`.
   */
  list: secureProtectedProcedure
    .input(
      z22
        .object({
          includeEmailed: z22.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const leads2 = await getAbandonedLeads(24);
      if (input?.includeEmailed) {
        return leads2;
      }
      return leads2.filter(l => !l.recoveryEmailSentAt);
    }),
  /**
   * Count of abandoned leads that haven't received a recovery email yet.
   */
  count: secureProtectedProcedure.query(async () => {
    const leads2 = await getAbandonedLeads(24);
    const unsent = leads2.filter(l => !l.recoveryEmailSentAt);
    return { total: leads2.length, unsent: unsent.length };
  }),
  /**
   * Send a recovery email to a single lead (admin-triggered).
   */
  sendRecoveryEmail: secureProtectedProcedure
    .input(z22.object({ leadId: z22.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const leads2 = await getAbandonedLeads(24);
      const lead = leads2.find(l => l.id === input.leadId);
      if (!lead) {
        const allLeads = await getAbandonedLeads(24 * 365);
        const foundLead = allLeads.find(l => l.id === input.leadId);
        if (!foundLead) {
          return { success: false, message: "Lead not found or not abandoned" };
        }
        const sent2 = await sendAbandonedBookingEmail(foundLead);
        if (sent2) {
          await markRecoveryEmailSent(foundLead.id);
          await logAdminAction({
            userId: ctx.user?.id,
            action: "update",
            resourceType: "lead",
            resourceId: foundLead.id,
            newValue: JSON.stringify({ recoveryEmailSent: true }),
          });
          dispatchN8nEventInBackground("abandoned.recovery_sent", {
            leadId: foundLead.id,
            email: foundLead.email,
            source: foundLead.source,
            sentBy: ctx.user?.email ?? null,
          });
        }
        return {
          success: sent2,
          message: sent2
            ? "Recovery email sent successfully"
            : "Failed to send recovery email",
        };
      }
      if (lead.recoveryEmailSentAt) {
        return {
          success: false,
          message: "Recovery email already sent to this lead",
        };
      }
      const sent = await sendAbandonedBookingEmail(lead);
      if (sent) {
        await markRecoveryEmailSent(lead.id);
        await logAdminAction({
          userId: ctx.user?.id,
          action: "update",
          resourceType: "lead",
          resourceId: lead.id,
          newValue: JSON.stringify({ recoveryEmailSent: true }),
        });
        dispatchN8nEventInBackground("abandoned.recovery_sent", {
          leadId: lead.id,
          email: lead.email,
          source: lead.source,
          sentBy: ctx.user?.email ?? null,
        });
      }
      return {
        success: sent,
        message: sent
          ? "Recovery email sent successfully"
          : "Failed to send recovery email",
      };
    }),
  /**
   * Send recovery emails to all unsent abandoned leads (max 10 per batch).
   */
  sendBatchRecovery: secureProtectedProcedure.mutation(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    const leads2 = await getAbandonedLeads(24);
    const unsent = leads2.filter(l => !l.recoveryEmailSentAt && l.email);
    const batch = unsent.slice(0, 10);
    let sentCount = 0;
    let failedCount = 0;
    for (const lead of batch) {
      const sent = await sendAbandonedBookingEmail(lead);
      if (sent) {
        await markRecoveryEmailSent(lead.id);
        sentCount++;
      } else {
        failedCount++;
      }
    }
    dispatchN8nEventInBackground("abandoned.batch_recovery_sent", {
      attempted: batch.length,
      sent: sentCount,
      failed: failedCount,
      remaining: Math.max(0, unsent.length - batch.length),
      sentBy: ctx.user?.email ?? null,
      leadIds: batch.map(lead => lead.id),
    });
    if (sentCount > 0) {
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "lead",
        newValue: JSON.stringify({
          batchRecoveryEmails: { sent: sentCount, failed: failedCount },
        }),
      });
    }
    return {
      success: true,
      sent: sentCount,
      failed: failedCount,
      remaining: Math.max(0, unsent.length - batch.length),
    };
  }),
});

// server/routes/availability.ts
import { z as z23 } from "zod";
init_db();
var availabilityRouter = router({
  /**
   * Public: Get availability for a tour for a given month.
   * Returns array of { date, available, isBlocked, notes }.
   * Dates without records are considered fully available (default 10 slots).
   */
  getByTour: securePublicProcedure
    .input(
      z23.object({
        tourId: z23.number(),
        year: z23.number().min(2024).max(2030),
        month: z23.number().min(1).max(12),
      })
    )
    .query(async ({ input }) => {
      const { tourId, year, month } = input;
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const records = await getTourAvailabilityByRange(
        tourId,
        startDate,
        endDate
      );
      const recordMap = new Map(records.map(r => [r.date, r]));
      const tour = await getTourById(tourId);
      const defaultSlots = tour?.groupMaxSize ?? 10;
      const result = [];
      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const record = recordMap.get(dateStr);
        if (record) {
          result.push({
            date: dateStr,
            available: record.isBlocked
              ? 0
              : record.maxSlots - record.bookedSlots,
            isBlocked: record.isBlocked === 1,
            notes: record.notes,
            maxSlots: record.maxSlots,
            bookedSlots: record.bookedSlots,
          });
        } else {
          result.push({
            date: dateStr,
            available: defaultSlots,
            isBlocked: false,
            notes: null,
            maxSlots: defaultSlots,
            bookedSlots: 0,
          });
        }
      }
      return result;
    }),
  /**
   * Admin: Update availability for a specific tour+date.
   */
  update: secureProtectedProcedure
    .input(
      z23.object({
        tourId: z23.number(),
        date: z23.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        maxSlots: z23.number().min(0).max(100).optional(),
        isBlocked: z23.boolean().optional(),
        notes: z23.string().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const { tourId, date, maxSlots, isBlocked, notes } = input;
      await upsertTourAvailability(tourId, date, {
        maxSlots,
        isBlocked: isBlocked !== void 0 ? (isBlocked ? 1 : 0) : void 0,
        notes,
      });
      void logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tourAvailability",
        resourceId: tourId,
        newValue: JSON.stringify({ tourId, date, maxSlots, isBlocked, notes }),
      });
      return { success: true };
    }),
  /**
   * Admin: Bulk update a range of dates (block/unblock).
   */
  bulkUpdate: secureProtectedProcedure
    .input(
      z23.object({
        tourId: z23.number(),
        dates: z23
          .array(z23.string().regex(/^\d{4}-\d{2}-\d{2}$/))
          .min(1)
          .max(90),
        maxSlots: z23.number().min(0).max(100).optional(),
        isBlocked: z23.boolean().optional(),
        notes: z23.string().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const { tourId, dates, maxSlots, isBlocked, notes } = input;
      await bulkUpdateTourAvailability(tourId, dates, {
        maxSlots,
        isBlocked: isBlocked !== void 0 ? (isBlocked ? 1 : 0) : void 0,
        notes,
      });
      void logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tourAvailability",
        resourceId: tourId,
        newValue: JSON.stringify({
          tourId,
          dateCount: dates.length,
          isBlocked,
          notes,
        }),
      });
      return { success: true };
    }),
});

// server/routes/tripPhotos.ts
import { z as z24 } from "zod";
import { randomUUID as randomUUID3 } from "crypto";
init_db();

// server/tripPhotoEmailService.ts
import { Resend as Resend6 } from "resend";
var _resend7 = null;
function getResend7() {
  if (!_resend7 && process.env.RESEND_API_KEY) {
    _resend7 = new Resend6(process.env.RESEND_API_KEY);
  }
  return _resend7;
}
var SENDER_EMAIL4 = "WIRO 4x4 Photos <bookings@wiro4x4indochina.com>";
async function sendTripPhotoAlbumEmail(data) {
  const subject = `\u{1F4F8} Your Adventure Photos Are Ready! - ${data.albumTitle}`;
  const previewSection = data.firstPhotoUrl
    ? `
        <div style="margin: 20px 0; text-align: center;">
          <img
            src="${data.firstPhotoUrl}"
            alt="Preview photo from your trip"
            style="max-width: 100%; max-height: 300px; border-radius: 8px; object-fit: cover;"
          />
          <p style="color: #888; font-size: 13px; margin-top: 8px;">
            ${data.photoCount} photo${data.photoCount !== 1 ? "s" : ""} from your adventure
          </p>
        </div>`
    : "";
  const personalMessageSection = data.personalMessage
    ? `
        <div style="background: #f0f7f4; border-left: 4px solid #d4af37; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
          <p style="color: #666; font-size: 13px; margin: 0 0 5px 0; font-style: italic;">A personal note from your guide:</p>
          <p style="color: #333; margin: 0; line-height: 1.6;">${escapeHtml2(data.personalMessage)}</p>
        </div>`
    : "";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">\u{1F699} WIRO 4x4</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Your Adventure Photos Are Ready!</p>
      </div>

      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <p style="font-size: 16px; color: #333; margin-top: 0;">
          Hi ${escapeHtml2(data.customerName)},
        </p>

        <p style="color: #555; line-height: 1.6;">
          Thank you for adventuring with us! We've prepared a private photo album from your trip.
          Click the button below to view and download your photos.
        </p>

        <h2 style="color: #1a4d2e; margin-bottom: 5px;">${escapeHtml2(data.albumTitle)}</h2>

        ${previewSection}
        ${personalMessageSection}

        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${data.albumUrl}"
            style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #c9a033 100%); color: #1a1a1a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; letter-spacing: 0.5px;"
          >
            \u{1F4F8} View Your Photos
          </a>
        </div>

        <div style="background: #fff8e7; border: 1px solid #f0e6c8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #8a7030; margin: 0; font-size: 14px;">
            \u23F0 <strong>Note:</strong> Your photos will be available for 90 days.
            We recommend downloading them to keep them forever!
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">

        <p style="color: #888; font-size: 13px; text-align: center;">
          Questions about your photos? Reach out via
          <a href="${COMPANY_WHATSAPP_URL}" style="color: #1a4d2e;">WhatsApp</a>
        </p>
      </div>

      <div style="background: #1a4d2e; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">\u{1F31F} Thank you for adventuring with us!</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">
          ${COMPANY_NAME}
        </p>
        <p style="margin: 8px 0 0 0;">
          <a href="${COMPANY_WEBSITE}" style="color: #d4af37; text-decoration: none; font-size: 12px;">${COMPANY_WEBSITE}</a>
        </p>
      </div>
    </div>
  `;
  try {
    const resend = getResend7();
    if (!resend) {
      console.warn(
        "[Resend] API key not configured, skipping trip photo email"
      );
      return false;
    }
    const { data: result, error } = await resend.emails.send({
      from: SENDER_EMAIL4,
      to: data.customerEmail,
      subject,
      html: htmlContent,
    });
    if (error) {
      console.error("[Resend] Failed to send trip photo email:", error);
      captureException(error);
      return false;
    }
    console.log(
      `[Resend] Trip photo email sent to ${data.customerEmail}. ID: ${result?.id}`
    );
    return true;
  } catch (error) {
    console.error("[Resend] Error sending trip photo email:", error);
    captureException(error);
    return false;
  }
}

// server/routes/tripPhotos.ts
var tripPhotosRouter = router({
  // ── Admin: Create album for a booking ────────────────────────────
  createAlbum: secureProtectedProcedure
    .input(
      z24.object({
        bookingId: z24.number(),
        title: z24.string().min(1).max(255),
        message: z24.string().max(2e3).optional(),
        expiresAt: z24.string().optional(),
        // ISO date string
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const accessToken =
        randomUUID3().replace(/-/g, "") +
        randomUUID3().replace(/-/g, "").slice(0, 32);
      await createTripPhotoAlbum({
        bookingId: input.bookingId,
        accessToken,
        title: input.title,
        message: input.message ?? null,
        isActive: 1,
        viewCount: 0,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "trip_photo_album",
        newValue: JSON.stringify({
          bookingId: input.bookingId,
          title: input.title,
        }),
      });
      return { success: true, accessToken };
    }),
  // ── Admin: Upload photo to an album ──────────────────────────────
  uploadPhoto: secureProtectedProcedure
    .input(
      z24.object({
        albumId: z24.number(),
        filename: z24.string(),
        contentType: z24.string(),
        base64Data: z24.string(),
        caption: z24.string().max(500).optional(),
        sortOrder: z24.number().default(0),
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
      if (fileSize > 15 * 1024 * 1024) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "File too large. Maximum size is 15MB.",
        });
      }
      const album = await getTripPhotoAlbumById(input.albumId);
      if (!album) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Album not found",
        });
      }
      const ext =
        input.contentType.split("/")[1] === "jpeg"
          ? "jpg"
          : input.contentType.split("/")[1];
      const safeFilename = `${randomUUID3()}.${ext}`;
      const key = `trip-photos/${album.accessToken}/${safeFilename}`;
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
      await createTripPhoto({
        albumId: input.albumId,
        s3Key: result.key,
        s3Url: result.url,
        caption: input.caption ?? null,
        sortOrder: input.sortOrder,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "trip_photo",
        newValue: JSON.stringify({
          albumId: input.albumId,
          key: result.key,
        }),
      });
      return { url: result.url, key: result.key };
    }),
  // ── Admin: Delete photo from album ───────────────────────────────
  deletePhoto: secureProtectedProcedure
    .input(z24.object({ id: z24.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteTripPhoto(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "trip_photo",
        resourceId: input.id,
      });
      return { success: true };
    }),
  // ── Admin: List all albums with booking info ─────────────────────
  listAlbums: secureProtectedProcedure.query(async () => {
    const albums = await getAllTripPhotoAlbums();
    const albumsWithCounts = await Promise.all(
      albums.map(async a => {
        const photoCount = await getAlbumPhotoCount(a.album.id);
        return {
          ...a.album,
          bookingContactName: a.bookingContactName,
          bookingContactEmail: a.bookingContactEmail,
          photoCount,
        };
      })
    );
    return albumsWithCounts;
  }),
  // ── Admin: Get album photos ──────────────────────────────────────
  getAlbumPhotos: secureProtectedProcedure
    .input(z24.object({ albumId: z24.number() }))
    .query(async ({ input }) => {
      return await getTripPhotosByAlbumId(input.albumId);
    }),
  // ── Admin: Update album ──────────────────────────────────────────
  updateAlbum: secureProtectedProcedure
    .input(
      z24.object({
        id: z24.number(),
        data: z24.object({
          title: z24.string().min(1).max(255).optional(),
          message: z24.string().max(2e3).nullable().optional(),
          isActive: z24.boolean().optional(),
          expiresAt: z24.string().nullable().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData = {};
      if (input.data.title !== void 0) updateData.title = input.data.title;
      if (input.data.message !== void 0)
        updateData.message = input.data.message;
      if (input.data.isActive !== void 0)
        updateData.isActive = input.data.isActive ? 1 : 0;
      if (input.data.expiresAt !== void 0)
        updateData.expiresAt = input.data.expiresAt
          ? new Date(input.data.expiresAt)
          : null;
      await updateTripPhotoAlbum(input.id, updateData);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "trip_photo_album",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),
  // ── Admin: Delete album ──────────────────────────────────────────
  deleteAlbum: secureProtectedProcedure
    .input(z24.object({ id: z24.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteTripPhotoAlbum(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "trip_photo_album",
        resourceId: input.id,
      });
      return { success: true };
    }),
  // ── Admin: Send album email to customer ──────────────────────────
  sendAlbumEmail: secureProtectedProcedure
    .input(z24.object({ albumId: z24.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const album = await getTripPhotoAlbumById(input.albumId);
      if (!album) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Album not found",
        });
      }
      const booking = await getBookingById(album.bookingId);
      if (!booking) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Booking not found for this album",
        });
      }
      if (!booking.contactEmail) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "No email address found for this booking",
        });
      }
      const photos = await getTripPhotosByAlbumId(album.id);
      const albumUrl = `${COMPANY_WEBSITE}/album/${album.accessToken}`;
      const success = await sendTripPhotoAlbumEmail({
        customerName: booking.contactName,
        customerEmail: booking.contactEmail,
        albumTitle: album.title,
        albumUrl,
        personalMessage: album.message,
        photoCount: photos.length,
        firstPhotoUrl: photos[0]?.s3Url ?? null,
      });
      if (!success) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email. Check email configuration.",
        });
      }
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "trip_photo_email",
        newValue: JSON.stringify({
          albumId: album.id,
          sentTo: booking.contactEmail,
        }),
      });
      return { success: true };
    }),
  // ── Public: Get album by access token ────────────────────────────
  getAlbum: securePublicProcedure
    .input(z24.object({ token: z24.string().min(1) }))
    .query(async ({ input }) => {
      const album = await getTripPhotoAlbumByToken(input.token);
      if (!album) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Album not found",
        });
      }
      if (!album.isActive) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "This album is no longer available",
        });
      }
      if (
        album.expiresAt &&
        new Date(album.expiresAt) < /* @__PURE__ */ new Date()
      ) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "This album has expired",
        });
      }
      incrementAlbumViewCount(album.id).catch(() => {});
      const photos = await getTripPhotosByAlbumId(album.id);
      const booking = await getBookingById(album.bookingId);
      return {
        title: album.title,
        message: album.message,
        createdAt: album.createdAt,
        customerName: booking?.contactName ?? "Guest",
        photos: photos.map(p => ({
          id: p.id,
          url: p.s3Url,
          caption: p.caption,
          sortOrder: p.sortOrder,
        })),
      };
    }),
});

// server/googleReviewsService.ts
var CACHE_TTL_MS = 60 * 60 * 1e3;
var cache = null;
function getConfig2() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;
  return { apiKey, placeId };
}
function isGoogleReviewsConfigured() {
  return getConfig2() !== null;
}
function getCacheStatus() {
  const configured = isGoogleReviewsConfigured();
  if (!cache) {
    return { configured, cacheAge: null, reviewCount: 0 };
  }
  return {
    configured,
    cacheAge: Date.now() - cache.fetchedAt,
    reviewCount: cache.reviews.length,
  };
}
async function fetchGoogleReviews(forceRefresh = false) {
  const config = getConfig2();
  if (!config) return [];
  if (!forceRefresh && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.reviews;
  }
  try {
    const url = `https://places.googleapis.com/v1/places/${config.placeId}?fields=reviews,displayName&languageCode=en`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": config.apiKey,
        "X-Goog-FieldMask": "reviews,displayName",
      },
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      console.error(
        `[GoogleReviews] API request failed (${response.status}): ${errText}`
      );
      return cache?.reviews ?? [];
    }
    const data = await response.json();
    const reviews2 = (data.reviews ?? []).map(r => ({
      author: r.authorAttribution?.displayName ?? "Anonymous",
      rating: r.rating ?? 5,
      text: r.text?.text ?? r.originalText?.text ?? "",
      relativeTime: r.relativePublishTimeDescription ?? "",
      profilePhoto: r.authorAttribution?.photoUri ?? null,
      googleReviewUrl: r.googleMapsUri ?? null,
    }));
    cache = { reviews: reviews2, fetchedAt: Date.now() };
    return reviews2;
  } catch (err) {
    console.error("[GoogleReviews] Failed to fetch:", err);
    return cache?.reviews ?? [];
  }
}
function clearGoogleReviewsCache() {
  cache = null;
}

// server/routes/googleReviews.ts
var googleReviewsRouter = router({
  /** Public: return cached Google reviews (or empty array if not configured). */
  list: securePublicProcedure.query(async () => {
    return await fetchGoogleReviews();
  }),
  /** Admin: force-refresh the Google reviews cache. */
  refresh: secureProtectedProcedure.mutation(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    clearGoogleReviewsCache();
    const reviews2 = await fetchGoogleReviews(true);
    return { success: true, count: reviews2.length };
  }),
  /** Admin: return API configuration status and cache info. */
  getStatus: secureProtectedProcedure.query(async () => {
    return getCacheStatus();
  }),
});

// server/routes/whatsappAdmin.ts
import { z as z25 } from "zod";
init_db();
init_whatsappService();
init_db();
var whatsappAdminRouter = router({
  /** List WhatsApp messages with pagination and optional phone filter */
  listMessages: secureProtectedProcedure
    .input(
      z25.object({
        page: z25.number().min(1).default(1),
        pageSize: z25.number().min(1).max(100).default(20),
        phoneFilter: z25.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, phoneFilter } = input;
      const result = await getAllWhatsAppMessagesPaginated(
        page,
        pageSize,
        phoneFilter
      );
      return {
        ...result,
        page,
        pageSize,
        totalPages: Math.ceil(result.total / pageSize),
      };
    }),
  /** Send a manual WhatsApp message to a phone number */
  sendMessage: secureProtectedProcedure
    .input(
      z25.object({
        to: z25.string().min(1),
        text: z25.string().min(1).max(4096),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      if (!isWhatsAppConfigured()) {
        return {
          success: false,
          messageId: null,
          error:
            "WhatsApp API not configured. Set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.",
        };
      }
      const result = await sendManualMessage(input.to, input.text);
      await logAdminAction({
        userId: ctx.user?.id ?? 0,
        action: "create",
        resourceType: "whatsappMessage",
        newValue: JSON.stringify({
          to: input.to,
          textLength: input.text.length,
          success: result.success,
        }),
      });
      return { ...result, error: null };
    }),
  /** Get WhatsApp messaging stats */
  getStats: secureProtectedProcedure.query(async () => {
    const stats = await getWhatsAppMessageStats();
    const configured = isWhatsAppConfigured();
    const autoReplyEnabled = await getSetting("whatsapp_auto_reply_enabled");
    return {
      ...stats,
      isConfigured: configured,
      autoReplyEnabled: autoReplyEnabled !== false,
    };
  }),
  /** Update auto-reply settings */
  updateAutoReply: secureProtectedProcedure
    .input(
      z25.object({
        enabled: z25.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await upsertSetting("whatsapp_auto_reply_enabled", input.enabled);
      await logAdminAction({
        userId: ctx.user?.id ?? 0,
        action: "update",
        resourceType: "whatsappSettings",
        newValue: JSON.stringify({ autoReplyEnabled: input.enabled }),
      });
      return { success: true, autoReplyEnabled: input.enabled };
    }),
});

// server/routes/leadScoring.ts
import { z as z26 } from "zod";
init_db();
var leadScoringRouter = router({
  /**
   * Recalculate scores for all active leads (new/contacted/quoted).
   */
  scoreAll: secureProtectedProcedure.mutation(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    const result = await recalculateAllLeadScores();
    return {
      success: true,
      message: `Rescored ${result.updated} of ${result.total} active leads`,
      ...result,
    };
  }),
  /**
   * Score a single lead by ID.
   */
  scoreLead: secureProtectedProcedure
    .input(z26.object({ id: z26.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const allLeads = await getAllLeads();
      const lead = allLeads.find(l => l.id === input.id);
      if (!lead) {
        return { success: false, message: "Lead not found", score: 0 };
      }
      const allEmails = allLeads.map(l => l.email);
      const result = calculateLeadScore(lead, allEmails);
      await updateLeadScore(
        lead.id,
        result.score,
        JSON.stringify(result.details)
      );
      return {
        success: true,
        message: `Lead scored: ${result.score} (${result.tier})`,
        score: result.score,
        tier: result.tier,
        details: result.details,
      };
    }),
  /**
   * Get top leads sorted by score (leaderboard).
   */
  getLeaderboard: secureProtectedProcedure
    .input(
      z26.object({
        minScore: z26.number().min(0).max(100).optional(),
        limit: z26.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const leads2 = await getLeadsByScore(input.minScore);
      return leads2.slice(0, input.limit);
    }),
  /**
   * Get leads paginated, sorted by score (highest first).
   */
  listByScore: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllLeadsPaginatedByScore(
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
});

// server/routes/postTourEmail.ts
import { z as z27 } from "zod";
init_db();

// server/postTourEmailService.ts
import { Resend as Resend7 } from "resend";
init_db();
var _resend8 = null;
function getResend8() {
  if (!_resend8 && process.env.RESEND_API_KEY) {
    _resend8 = new Resend7(process.env.RESEND_API_KEY);
  }
  return _resend8;
}
var SENDER_EMAIL5 = COMPANY_SENDER_EMAIL;
function normalizePhone2(phone) {
  if (!phone) return null;
  const normalized = phone.replace(/[^0-9+]/g, "").trim();
  return normalized.length > 0 ? normalized : null;
}
function getReferralCodeFromSource(source) {
  if (!source) return null;
  const match = source.match(/^referral:\s*([^:]+)$/i);
  return match?.[1]?.trim() || null;
}
function appendReferralQuery(baseUrl, referralCode) {
  if (!referralCode) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}ref=${encodeURIComponent(referralCode)}`;
}
function generatePostTourEmailHtml({ booking, albumToken }) {
  const customerName = escapeHtml2(booking.contactName);
  const tourDate = booking.departureDate
    ? new Date(booking.departureDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const tourDateHe = booking.departureDate
    ? new Date(booking.departureDate).toLocaleDateString("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const referralCode = getReferralCodeFromSource(booking.source);
  const reviewUrl = appendReferralQuery(
    `${COMPANY_WEBSITE}/reviews`,
    referralCode
  );
  const albumUrl = albumToken ? `${COMPANY_WEBSITE}/album/${albumToken}` : null;
  const bookNextUrl = appendReferralQuery(
    `${COMPANY_WEBSITE}/packages`,
    referralCode
  );
  const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent("Hi WIRO 4x4! I just completed my tour and wanted to share feedback.")}`;
  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=ChIJByjTCcj1dDAR_WIRO4x4`;
  const starRating = [1, 2, 3, 4, 5]
    .map(
      n =>
        `<a href="${reviewUrl}" style="text-decoration:none;font-size:32px;color:#f5a623;" title="${n} stars">&#9733;</a>`
    )
    .join("");
  const albumSection = albumUrl
    ? `
      <div style="background:#e3f2fd;padding:20px;border-radius:8px;margin:25px 0;border-left:4px solid #1976d2;text-align:center;">
        <h3 style="margin-top:0;color:#1976d2;">\u{1F4F8} Your Adventure Photos Are Ready!</h3>
        <p style="color:#333;">We've curated the best moments from your trip. View and download your personal photo album:</p>
        <a href="${albumUrl}" style="display:inline-block;background:#1976d2;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">View Your Photos</a>
      </div>
      <div dir="rtl" style="background:#e3f2fd;padding:20px;border-radius:8px;margin:25px 0;border-left:none;border-right:4px solid #1976d2;text-align:center;">
        <h3 style="margin-top:0;color:#1976d2;">\u{1F4F8} \u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D4\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05E9\u05DC\u05DB\u05DD \u05DE\u05D5\u05DB\u05E0\u05D5\u05EA!</h3>
        <p style="color:#333;">\u05D0\u05E1\u05E4\u05E0\u05D5 \u05D0\u05EA \u05D4\u05E8\u05D2\u05E2\u05D9\u05DD \u05D4\u05D8\u05D5\u05D1\u05D9\u05DD \u05D1\u05D9\u05D5\u05EA\u05E8 \u05DE\u05D4\u05D8\u05D9\u05D5\u05DC \u05E9\u05DC\u05DB\u05DD. \u05E6\u05E4\u05D5 \u05D5\u05D4\u05D5\u05E8\u05D9\u05D3\u05D5 \u05D0\u05EA \u05D0\u05DC\u05D1\u05D5\u05DD \u05D4\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D4\u05D0\u05D9\u05E9\u05D9:</p>
        <a href="${albumUrl}" style="display:inline-block;background:#1976d2;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">\u05E6\u05E4\u05D5 \u05D1\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA</a>
      </div>
    `
    : "";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 35px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 26px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
    .content { background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
    .review-box { background: #fff8e1; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f5a623; text-align: center; }
    .cta-button { display: inline-block; background: #f5a623; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; font-size: 16px; }
    .cta-button:hover { background: #e6951a; }
    .google-button { display: inline-block; background: #4285f4; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; font-size: 14px; }
    .next-trip { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4a7c2c; text-align: center; }
    .whatsapp-link { background: #25d366; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px 0; }
    .divider { border: none; border-top: 1px solid #eee; margin: 30px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- English Section -->
    <div class="header">
      <h1>How Was Your Adventure? \u{1F33F}</h1>
      <p>We'd love to hear about your experience!</p>
    </div>

    <div class="content">
      <p>Dear ${escapeHtml2(customerName)},</p>

      <p>We hope you had an incredible time on your tour with <strong>WIRO 4x4</strong>${tourDate ? ` on ${tourDate}` : ""}! The mountains, waterfalls, and hidden trails of Northern Thailand are truly special, and we're so glad we got to share them with you.</p>

      <p>Your feedback means the world to us and helps other travelers discover our tours. Would you take a moment to rate your experience?</p>

      <!-- Star Rating -->
      <div class="review-box">
        <p style="font-size:18px;font-weight:bold;color:#2d5016;margin-bottom:10px;">How would you rate your trip?</p>
        <div style="margin:15px 0;">${starRating}</div>
        <p style="font-size:14px;color:#666;margin-bottom:15px;">Tap a star or click below to leave a detailed review</p>
        <a href="${reviewUrl}" class="cta-button">Leave a Review</a>
      </div>

      <!-- Google Reviews -->
      <div style="text-align:center;margin:20px 0;">
        <p style="font-size:14px;color:#666;">Also help us on Google:</p>
        <a href="${googleReviewUrl}" class="google-button">\u2B50 Review on Google</a>
      </div>

      ${albumSection}

      <!-- Book Next Trip -->
      <div class="next-trip">
        <h3 style="margin-top:0;color:#2d5016;">Ready for Your Next Adventure?</h3>
        <p>Explore our multi-day packages and discover more of Northern Thailand's hidden gems.</p>
        <a href="${bookNextUrl}" style="display:inline-block;background:#2d5016;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">Explore Packages</a>
      </div>

      <!-- WhatsApp -->
      <div style="text-align:center;margin:20px 0;">
        <p style="font-size:14px;color:#666;">Prefer to share feedback directly?</p>
        <a href="${whatsappUrl}" class="whatsapp-link">\u{1F4AC} Chat on WhatsApp</a>
      </div>

      <p>Thank you for being part of the WIRO 4x4 family. We hope to see you again!</p>

      <p style="margin-top:30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>

      <hr class="divider">

      <!-- Hebrew Section -->
      <div dir="rtl" style="text-align:right;">
        <h2 style="color:#2d5016;">?\u05D0\u05D9\u05DA \u05D4\u05D9\u05D4 \u05D4\u05D8\u05D9\u05D5\u05DC \u{1F33F}</h2>
        <p>${escapeHtml2(customerName)} \u05D4\u05D9\u05E7\u05E8/\u05D4,</p>

        <p>\u05D0\u05E0\u05D7\u05E0\u05D5 \u05DE\u05E7\u05D5\u05D5\u05D9\u05DD \u05E9\u05E0\u05D4\u05E0\u05D9\u05EA\u05DD \u05DE\u05D4\u05D8\u05D9\u05D5\u05DC \u05E2\u05DD <strong>WIRO 4x4</strong>${tourDateHe ? ` \u05D1-${tourDateHe}` : ""}! \u05D4\u05D4\u05E8\u05D9\u05DD, \u05D4\u05DE\u05E4\u05DC\u05D9\u05DD \u05D5\u05D4\u05E9\u05D1\u05D9\u05DC\u05D9\u05DD \u05D4\u05E0\u05E1\u05EA\u05E8\u05D9\u05DD \u05E9\u05DC \u05E6\u05E4\u05D5\u05DF \u05EA\u05D0\u05D9\u05DC\u05E0\u05D3 \u05D4\u05DD \u05D1\u05D0\u05DE\u05EA \u05DE\u05D9\u05D5\u05D7\u05D3\u05D9\u05DD, \u05D5\u05D0\u05E0\u05D7\u05E0\u05D5 \u05E9\u05DE\u05D7\u05D9\u05DD \u05E9\u05D6\u05DB\u05D9\u05E0\u05D5 \u05DC\u05D7\u05DC\u05D5\u05E7 \u05D0\u05D5\u05EA\u05DD \u05D0\u05D9\u05EA\u05DB\u05DD.</p>

        <p>\u05D4\u05DE\u05E9\u05D5\u05D1 \u05E9\u05DC\u05DB\u05DD \u05D7\u05E9\u05D5\u05D1 \u05DC\u05E0\u05D5 \u05DE\u05D0\u05D5\u05D3 \u05D5\u05E2\u05D5\u05D6\u05E8 \u05DC\u05DE\u05D8\u05D9\u05D9\u05DC\u05D9\u05DD \u05D0\u05D7\u05E8\u05D9\u05DD \u05DC\u05D2\u05DC\u05D5\u05EA \u05D0\u05EA \u05D4\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05E9\u05DC\u05E0\u05D5. \u05EA\u05D5\u05DB\u05DC\u05D5 \u05DC\u05D4\u05E7\u05D3\u05D9\u05E9 \u05E8\u05D2\u05E2 \u05DC\u05D3\u05E8\u05D2 \u05D0\u05EA \u05D4\u05D7\u05D5\u05D5\u05D9\u05D4?</p>

        <div style="background:#fff8e1;padding:25px;border-radius:8px;margin:25px 0;border-right:4px solid #f5a623;border-left:none;text-align:center;">
          <p style="font-size:18px;font-weight:bold;color:#2d5016;margin-bottom:10px;">\u05D0\u05D9\u05DA \u05D4\u05D9\u05D9\u05EA\u05DD \u05DE\u05D3\u05E8\u05D2\u05D9\u05DD \u05D0\u05EA \u05D4\u05D8\u05D9\u05D5\u05DC?</p>
          <div style="margin:15px 0;">${starRating}</div>
          <a href="${reviewUrl}" class="cta-button">\u05D4\u05E9\u05D0\u05D9\u05E8\u05D5 \u05D7\u05D5\u05D5\u05EA \u05D3\u05E2\u05EA</a>
        </div>

        <div style="text-align:center;margin:20px 0;">
          <p style="font-size:14px;color:#666;">\u05E2\u05D6\u05E8\u05D5 \u05DC\u05E0\u05D5 \u05D2\u05DD \u05D1\u05D2\u05D5\u05D2\u05DC:</p>
          <a href="${googleReviewUrl}" class="google-button">\u2B50 \u05D7\u05D5\u05D5\u05EA \u05D3\u05E2\u05EA \u05D1\u05D2\u05D5\u05D2\u05DC</a>
        </div>

        <div style="background:#e8f5e9;padding:20px;border-radius:8px;margin:25px 0;border-right:4px solid #4a7c2c;border-left:none;text-align:center;">
          <h3 style="margin-top:0;color:#2d5016;">\u05DE\u05D5\u05DB\u05E0\u05D9\u05DD \u05DC\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05D4\u05D1\u05D0\u05D4?</h3>
          <p>\u05D2\u05DC\u05D5 \u05D0\u05EA \u05D7\u05D1\u05D9\u05DC\u05D5\u05EA \u05D4\u05D8\u05D9\u05D5\u05DC\u05D9\u05DD \u05E9\u05DC\u05E0\u05D5 \u05D5\u05D7\u05E7\u05E8\u05D5 \u05E2\u05D5\u05D3 \u05DE\u05D4\u05D0\u05D5\u05E6\u05E8\u05D5\u05EA \u05D4\u05E0\u05E1\u05EA\u05E8\u05D9\u05DD \u05E9\u05DC \u05E6\u05E4\u05D5\u05DF \u05EA\u05D0\u05D9\u05DC\u05E0\u05D3.</p>
          <a href="${bookNextUrl}" style="display:inline-block;background:#2d5016;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">\u05D2\u05DC\u05D5 \u05D7\u05D1\u05D9\u05DC\u05D5\u05EA</a>
        </div>

        <div style="text-align:center;margin:20px 0;">
          <a href="${whatsappUrl}" class="whatsapp-link">\u{1F4AC} \u05E9\u05DC\u05D7\u05D5 \u05D4\u05D5\u05D3\u05E2\u05D4 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4</a>
        </div>

        <p>\u05EA\u05D5\u05D3\u05D4 \u05E9\u05D0\u05EA\u05DD \u05D7\u05DC\u05E7 \u05DE\u05DE\u05E9\u05E4\u05D7\u05EA WIRO 4x4. \u05E0\u05E9\u05DE\u05D7 \u05DC\u05E8\u05D0\u05D5\u05EA\u05DB\u05DD \u05E9\u05D5\u05D1!</p>

        <p style="margin-top:30px;">
          <strong>\u05E6\u05D5\u05D5\u05EA WIRO 4x4</strong><br>
          <em>\u05D4\u05E8\u05E4\u05EA\u05E7\u05D0\u05D5\u05EA \u05E9\u05D8\u05D7 \u05DB\u05E9\u05E8\u05D5\u05EA \u05D1\u05E6'\u05D9\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9</em>
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>${COMPANY_NAME}</strong></p>
      <p>Chiang Mai, Thailand</p>
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL5}</p>
      <p style="margin-top:10px;font-size:11px;color:#999;">
        This is an automated email sent 2 days after your tour. If you've already left a review, thank you!
        <br>You're receiving this because you booked a tour with WIRO 4x4.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
async function sendPostTourEmail(booking, albumToken) {
  try {
    const resend = getResend8();
    if (!resend) {
      console.warn(
        "[PostTourEmail] Resend API key not configured, skipping email"
      );
      return false;
    }
    if (!booking.contactEmail) {
      console.warn(
        `[PostTourEmail] No email for booking #${booking.id}, skipping`
      );
      return false;
    }
    const html = generatePostTourEmailHtml({ booking, albumToken });
    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL5}>`,
      to: [booking.contactEmail],
      subject: `How was your adventure? We'd love your feedback! | ?\u05D0\u05D9\u05DA \u05D4\u05D9\u05D4 \u05D4\u05D8\u05D9\u05D5\u05DC`,
      html,
    });
    if (error) {
      console.error(
        `[PostTourEmail] Error sending to ${booking.contactEmail}:`,
        error
      );
      captureException(error);
      return false;
    }
    console.log(
      `[PostTourEmail] Sent to ${booking.contactEmail} for booking #${booking.id}. ID: ${data?.id}`
    );
    const guestPhone = normalizePhone2(
      booking.contactWhatsApp ?? booking.contactPhone
    );
    const guestReference = buildGuestReference({
      bookingId: booking.id,
      phone: guestPhone,
    });
    await createPostTourReviewEvent({
      bookingId: booking.id,
      channel: "whatsapp",
      state: "request_sent",
      guestReference,
      guestPhone,
      guestName: booking.contactName,
      externalMessageId: null,
      dedupeKey: buildPostTourReviewDedupeKey({
        state: "request_sent",
        bookingId: booking.id,
        guestReference,
      }),
      metadata: {
        trigger: "post_tour_email",
        resendEmailId: data?.id ?? null,
      },
    });
    return true;
  } catch (error) {
    console.error("[PostTourEmail] Error in sendPostTourEmail:", error);
    captureException(error);
    return false;
  }
}
async function checkAndSendPostTourEmails() {
  const results = { sent: 0, failed: 0, eligible: 0 };
  try {
    const eligibleBookings = await getEligiblePostTourBookings(10);
    results.eligible = eligibleBookings.length;
    for (const booking of eligibleBookings) {
      try {
        const album = await getAlbumByBookingId(booking.id);
        const albumToken = album?.accessToken ?? null;
        const success = await sendPostTourEmail(booking, albumToken);
        if (success) {
          await markPostTourEmailSent(booking.id);
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (err) {
        console.error(
          `[PostTourEmail] Failed for booking #${booking.id}:`,
          err
        );
        captureException(err);
        results.failed++;
      }
    }
    if (results.eligible > 0) {
      console.log(
        `[PostTourEmail] Processed ${results.eligible} bookings: ${results.sent} sent, ${results.failed} failed`
      );
    }
  } catch (err) {
    console.error("[PostTourEmail] Error in checkAndSendPostTourEmails:", err);
    captureException(err);
  }
  return results;
}

// server/routes/postTourEmail.ts
var postTourEmailRouter = router({
  /**
   * Find bookings eligible for post-tour email.
   * Completed, 2+ days after departure, email not yet sent.
   */
  findEligible: secureProtectedProcedure.query(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    const bookings2 = await getEligiblePostTourBookings(50);
    const total = await getEligiblePostTourCount();
    const results = await Promise.all(
      bookings2.map(async booking => {
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
    .input(z27.object({ bookingId: z27.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const booking = await getBookingById(input.bookingId);
      if (!booking) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }
      if (!booking.contactEmail) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Booking has no contact email",
        });
      }
      if (booking.postTourEmailSentAt) {
        throw new TRPCError3({
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
    .input(z27.object({ bookingId: z27.number() }))
    .query(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const booking = await getBookingById(input.bookingId);
      if (!booking) {
        throw new TRPCError3({
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

// server/routes/postTourReview.ts
import { z as z28 } from "zod";
init_postTourReviewService();
var postTourReviewRouter = router({
  config: secureProtectedProcedure.query(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    const delayMinutes = await getConfiguredPostTourReviewDelayMinutes();
    return { delayMinutes, min: 30, max: 60, default: 45 };
  }),
  updateConfig: secureProtectedProcedure
    .input(
      z28.object({
        delayMinutes: z28.number().int().min(30).max(60),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const delayMinutes = await updatePostTourReviewDelayMinutes(
        input.delayMinutes
      );
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "postTourReviewConfig",
        resourceId: null,
        newValue: JSON.stringify({ delayMinutes }),
      });
      return { success: true, delayMinutes };
    }),
  schedule: secureProtectedProcedure
    .input(
      z28.object({
        bookingId: z28.number(),
        delayMinutes: z28.number().int().min(30).max(60).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const entry = await schedulePostTourReviewForBooking({
        bookingId: input.bookingId,
        delayMinutes: input.delayMinutes,
      });
      if (!entry) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: `Booking #${input.bookingId} has no WhatsApp/phone; cannot schedule review`,
        });
      }
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "postTourReview",
        resourceId: input.bookingId,
        newValue: JSON.stringify({
          scheduledAt: entry.scheduledAt,
          delayMinutes: input.delayMinutes ?? 45,
        }),
      });
      dispatchN8nEventInBackground("post_tour_review.scheduled", {
        bookingId: input.bookingId,
        delayMinutes: input.delayMinutes ?? 45,
        entry,
      });
      return { success: true, entry };
    }),
  processDue: secureProtectedProcedure.mutation(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    const result = await processDuePostTourReviewRequests();
    dispatchN8nEventInBackground("post_tour_review.processed", {
      result,
      processedAt: /* @__PURE__ */ new Date().toISOString(),
    });
    await logAdminAction({
      userId: ctx.user?.id,
      action: "update",
      resourceType: "postTourReview",
      resourceId: null,
      newValue: JSON.stringify(result),
    });
    return result;
  }),
  trackEvent: secureProtectedProcedure
    .input(
      z28.object({
        bookingId: z28.number(),
        event: z28.enum(["opened", "clicked", "reviewed"]),
        rating: z28.number().min(1).max(5).optional(),
        comments: z28.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updated = await recordPostTourReviewEvent(input);
      if (!updated) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: `No post-tour review entry for booking #${input.bookingId}`,
        });
      }
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "postTourReview",
        resourceId: input.bookingId,
        newValue: JSON.stringify({
          event: input.event,
          rating: input.rating ?? null,
          escalatedAt: updated.escalatedAt,
          followUpPath: updated.opsFollowUpUrl,
        }),
      });
      dispatchN8nEventInBackground("post_tour_review.event_tracked", {
        bookingId: input.bookingId,
        event: input.event,
        rating: input.rating ?? null,
        comments: input.comments ?? null,
        entry: updated,
      });
      return { success: true, entry: updated };
    }),
  getByBooking: secureProtectedProcedure
    .input(z28.object({ bookingId: z28.number() }))
    .query(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      return await getPostTourReviewEntry(input.bookingId);
    }),
  listRecent: secureProtectedProcedure
    .input(z28.object({ limit: z28.number().int().min(1).max(100).optional() }))
    .query(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      return await getRecentPostTourReviewEntries(input.limit ?? 20);
    }),
  weeklyMetric: secureProtectedProcedure.query(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    return await getWeeklyPostTourReviewMetric();
  }),
});

// server/routes/search.ts
import { z as z29 } from "zod";

// server/db/search.ts
init_connection();
init_schema();
import { sql as sql24 } from "drizzle-orm";
function escapeLike(str) {
  return str.replace(/[%_\\]/g, "\\$&");
}
async function globalSearch(query) {
  const db = await getDb();
  if (!db) {
    return { bookings: [], leads: [], reviews: [], tours: [] };
  }
  const pattern = `%${escapeLike(query)}%`;
  const [bookingResults, leadResults, reviewResults, tourResults] =
    await Promise.all([
      db
        .select({
          id: bookings.id,
          contactName: bookings.contactName,
          contactEmail: bookings.contactEmail,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .where(
          sql24`(${bookings.contactName} LIKE ${pattern} OR ${bookings.contactEmail} LIKE ${pattern})`
        )
        .limit(5),
      db
        .select({
          id: leads.id,
          name: leads.name,
          email: leads.email,
          phone: leads.phone,
          status: leads.status,
          score: leads.score,
          createdAt: leads.createdAt,
        })
        .from(leads)
        .where(
          sql24`(${leads.name} LIKE ${pattern} OR ${leads.email} LIKE ${pattern} OR ${leads.phone} LIKE ${pattern})`
        )
        .limit(5),
      db
        .select({
          id: reviews.id,
          name: reviews.name,
          rating: reviews.rating,
          text: reviews.text,
          isApproved: reviews.isApproved,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(
          sql24`(${reviews.name} LIKE ${pattern} OR ${reviews.text} LIKE ${pattern})`
        )
        .limit(5),
      db
        .select({
          id: tours.id,
          name: tours.name,
          slug: tours.slug,
          price: tours.price,
          isActive: tours.isActive,
        })
        .from(tours)
        .where(
          sql24`(${tours.name} LIKE ${pattern} OR ${tours.slug} LIKE ${pattern})`
        )
        .limit(5),
    ]);
  return {
    bookings: bookingResults,
    leads: leadResults,
    reviews: reviewResults,
    tours: tourResults,
  };
}

// server/routes/search.ts
var searchRouter = router({
  global: secureProtectedProcedure
    .input(
      z29.object({
        query: z29.string().min(2).max(200),
      })
    )
    .query(async ({ input }) => {
      return await globalSearch(input.query);
    }),
});

// server/stripeSessionChecker.ts
init_db();
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
init_db();
init_postTourReviewService();
var ONE_HOUR = 60 * 60 * 1e3;
var FIFTEEN_MINUTES = 15 * 60 * 1e3;
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
async function processReminders2() {
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
  await processReminders2();
  try {
    const result = await processDuePostTourReviewRequests();
    if (result.sent > 0) {
      console.log(
        `[PostTourReview] Processed ${result.processed}, sent ${result.sent}, pending ${result.pending}`
      );
    }
  } catch (err) {
    console.error(
      "[PostTourReview] Failed to process due review requests:",
      err
    );
    captureException(err);
  }
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
var _reviewSchedulerTimer = null;
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
  if (_reviewSchedulerTimer) return;
  console.log(
    "[Reminder Scheduler] Starting post-tour WhatsApp review loop (every 15 minutes)"
  );
  _reviewSchedulerTimer = setInterval(() => {
    processPendingPostTourReviewRequests().catch(err => {
      console.error("[PostTourReview] Scheduled run failed:", err);
      captureException(err);
    });
  }, FIFTEEN_MINUTES);
  setTimeout(() => {
    processPendingPostTourReviewRequests().catch(err => {
      console.error("[PostTourReview] Initial run failed:", err);
      captureException(err);
    });
  }, 15e3);
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
  abandoned: abandonedRouter,
  availability: availabilityRouter,
  tripPhotos: tripPhotosRouter,
  googleReviews: googleReviewsRouter,
  whatsapp: whatsappAdminRouter,
  leadScoring: leadScoringRouter,
  postTourEmail: postTourEmailRouter,
  postTourReview: postTourReviewRouter,
  search: searchRouter,
});

// server/_core/context.ts
import { parse as parseCookieHeader } from "cookie";
init_db();
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
  app2.use(
    cors({
      origin: [
        "https://wiro4x4indochina.com",
        "https://www.wiro4x4indochina.com",
        ...(process.env.NODE_ENV === "development"
          ? ["http://localhost:3000", "http://localhost:5173"]
          : []),
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerAuthRoutes(app2);
  registerRssRoute(app2);
  registerSitemapRoute(app2);
  registerWhatsAppWebhookRoute(app2);
  registerPostTourReviewClickRoute(app2);
  registerAgentApiRoutes(app2);
  registerChatApiRoute(app2);
  registerEliChatRoute(app2);
  registerEliRelayRoute(app2);
  registerN8nRoutes(app2);
  registerChatRoute(app2);
  registerMosheRoute(app2);
  app2.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app2;
}

// server/seoMiddleware.ts
init_tours();
init_blog();
init_packages();
import fs3 from "node:fs";
import path from "node:path";
var SITE_URL3 = "https://www.wiro4x4indochina.com";
var DEFAULT_OG_IMAGE = `${SITE_URL3}/images/optimized/single_cascade_waterfall-lg.jpg`;
var BRAND_LOGO = `${SITE_URL3}/images/icon-512.png`;
var BRAND_SUFFIX = " | WIRO 4x4 Kosher Adventures";
var BUSINESS_NAME = "WIRO 4x4 - Kosher Off-Road Adventures";
var BUSINESS_PHONE = "+66929894495";
var BUSINESS_EMAIL = "wiro.adventures@gmail.com";
var BUSINESS_WHATSAPP = "https://wa.me/66929894495";
var BUSINESS_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Wiro%204x4%20Indochina%20Adventure%20Tours%20Chiang%20Mai";
var BUSINESS_IMAGES = [
  `${SITE_URL3}/images/optimized/banner-lg.webp`,
  `${SITE_URL3}/images/optimized/wiro_with_vehicle-lg.jpg`,
  `${SITE_URL3}/images/optimized/wiro_with_colleague-sm.jpg`,
];
function pageJsonLd(meta) {
  const url = `${SITE_URL3}${meta.path}`;
  return {
    "@context": "https://schema.org",
    "@type": meta.pageType || "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: meta.name,
    description: meta.description,
    isPartOf: { "@id": `${SITE_URL3}/#website` },
    about: { "@id": `${SITE_URL3}/#organization` },
    inLanguage: meta.inLanguage || "en",
  };
}
function serviceJsonLd(meta) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL3}${meta.path}#service`,
    name: meta.name,
    description: meta.description,
    serviceType: "Private 4x4 tour operator",
    areaServed: { "@type": "City", name: "Chiang Mai" },
    audience: {
      "@type": "Audience",
      audienceType: meta.audienceType,
    },
    provider: { "@id": `${SITE_URL3}/#organization` },
    url: `${SITE_URL3}${meta.path}`,
    inLanguage: meta.inLanguage || ["en", "he"],
  };
}
function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    "@id": `${SITE_URL3}/#organization`,
    name: BUSINESS_NAME,
    alternateName: ["WIRO 4x4", "Wiro 4x4 Indochina Adventure Tours"],
    description:
      "Private kosher-friendly 4x4 tour operator in Chiang Mai and Northern Thailand with Hebrew and English support, kosher-aware meal planning, and WhatsApp-first reservations.",
    url: SITE_URL3,
    logo: BRAND_LOGO,
    image: BUSINESS_IMAGES,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "183/15 Chang Klan Rd",
      addressLocality: "Mueang Chiang Mai District",
      addressRegion: "Chiang Mai",
      postalCode: "50100",
      addressCountry: "TH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 18.7883,
      longitude: 98.9853,
    },
    hasMap: BUSINESS_MAP_URL,
    areaServed: [
      "Chiang Mai",
      "Northern Thailand",
      "Chiang Rai",
      "Mae Hong Son",
      "Indochina",
    ],
    availableLanguage: ["English", "Hebrew", "Thai"],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "08:00:00",
      closes: "18:00:00",
    },
    priceRange: "$$-$$$",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS_PHONE,
      contactType: "reservations",
      availableLanguage: ["English", "Hebrew", "Thai"],
      url: BUSINESS_WHATSAPP,
    },
    sameAs: [BUSINESS_WHATSAPP],
    potentialAction: [
      {
        "@type": "ReserveAction",
        target: `${SITE_URL3}/book`,
        name: "Book a private 4x4 tour",
      },
      {
        "@type": "CommunicateAction",
        target: BUSINESS_WHATSAPP,
        name: "Ask WIRO 4x4 on WhatsApp",
      },
    ],
  };
}
var STATIC_ROUTES = {
  "/": {
    title: "WIRO 4x4 - Kosher Off-Road Adventures in Chiang Mai, Thailand",
    description:
      "Explore Chiang Mai with Hebrew-speaking guides, kosher meals, and custom 4x4 off-road tours. Shabbat-friendly adventures for Israeli travelers in Northern Thailand.",
    canonicalPath: "/",
  },
  "/tours": {
    title: "4x4 Off-Road Tours in Chiang Mai",
    description:
      "6 private off-road day trips in Chiang Mai and Northern Thailand. Kosher meals, Hebrew-speaking guides, and Shabbat-friendly scheduling for Israeli travelers.",
    canonicalPath: "/tours",
  },
  "/pricing": {
    title: "4x4 Tour Pricing \u2014 Chiang Mai, Thailand",
    description:
      "Transparent group pricing for WIRO 4x4 tours in Chiang Mai. Private tours from $98/group, multi-day packages, kosher meal add-ons, and peak season rates.",
    canonicalPath: "/pricing",
  },
  "/estimate": {
    title: "4x4 Tour Price Estimator \u2014 Chiang Mai",
    description:
      "Get an instant price estimate for your Chiang Mai 4x4 tour. Select tours, group size, children ages, and add-ons to see your exact total.",
    canonicalPath: "/estimate",
  },
  "/blog": {
    title: "Chiang Mai Travel Blog & Kosher Travel Tips",
    description:
      "Guides, insider tips, and stories for Israeli travelers in Northern Thailand. Kosher dining, Shabbat travel, off-road adventures, and Chiang Mai destination guides.",
    canonicalPath: "/blog",
    jsonLd: pageJsonLd({
      name: "Chiang Mai Travel Blog & Kosher Travel Tips",
      description:
        "Guides, insider tips, and stories for Israeli travelers in Northern Thailand. Kosher dining, Shabbat travel, off-road adventures, and Chiang Mai destination guides.",
      path: "/blog",
      pageType: "CollectionPage",
      inLanguage: ["en", "he"],
    }),
  },
  "/gallery": {
    title: "Chiang Mai Off-Road Tour Photos \u2014 WIRO 4x4",
    description:
      "Photos from WIRO 4x4 adventures: waterfalls, jungle trails, mountain views, hill tribe villages, and happy travelers in Northern Thailand.",
    canonicalPath: "/gallery",
  },
  "/reviews": {
    title: "Customer Reviews \u2014 Chiang Mai 4x4 Tours",
    description:
      "Verified reviews from Israeli travelers and international visitors. See what guests say about kosher off-road tours with WIRO 4x4 in Chiang Mai.",
    canonicalPath: "/reviews",
  },
  "/book": {
    title: "Book a Chiang Mai 4x4 Tour",
    description:
      "Reserve your WIRO 4x4 off-road adventure in Chiang Mai. Easy online booking with WhatsApp confirmation.",
    canonicalPath: "/book",
  },
  "/kosher-tours": {
    title: "Kosher Tours Chiang Mai \u2014 Private 4x4 for Jewish Travelers",
    description:
      "Kosher tours in Chiang Mai with private 4x4 routes, kosher meal planning, Shabbat-aware scheduling, and Hebrew/English support for Jewish travelers.",
    canonicalPath: "/kosher-tours",
    jsonLd: serviceJsonLd({
      name: "Kosher Tours Chiang Mai",
      description:
        "Private kosher-friendly 4x4 tours in Chiang Mai with kosher meal planning, Shabbat-aware scheduling, and Hebrew/English support.",
      path: "/kosher-tours",
      audienceType:
        "Jewish travelers, kosher travelers, Israeli travelers, observant families",
    }),
  },
  "/hebrew-guide": {
    title:
      "\u05DE\u05D3\u05E8\u05D9\u05DA \u05D3\u05D5\u05D1\u05E8 \u05E2\u05D1\u05E8\u05D9\u05EA \u05D1\u05E6\u05F3\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9 \u2014 Hebrew Guide Chiang Mai",
    description:
      "\u05DE\u05D3\u05E8\u05D9\u05DA \u05D3\u05D5\u05D1\u05E8 \u05E2\u05D1\u05E8\u05D9\u05EA \u05D1\u05E6\u05F3\u05D0\u05E0\u05D2 \u05DE\u05D0\u05D9 \u05DC\u05D8\u05D9\u05D5\u05DC \u05D2\u05F3\u05D9\u05E4\u05D9\u05DD \u05E4\u05E8\u05D8\u05D9 \u05D1\u05E6\u05E4\u05D5\u05DF \u05EA\u05D0\u05D9\u05DC\u05E0\u05D3. Hebrew-speaking Chiang Mai guide for Israeli families, couples, and groups.",
    canonicalPath: "/hebrew-guide",
    lang: "he",
    dir: "rtl",
    alternateLanguages: {
      he: `${SITE_URL3}/hebrew-guide`,
      "x-default": `${SITE_URL3}/hebrew-guide`,
    },
    jsonLd: serviceJsonLd({
      name: "Hebrew-Speaking Guide in Chiang Mai",
      description:
        "Private 4x4 tours in Chiang Mai and Northern Thailand with Hebrew-speaking guide support for Israeli travelers.",
      path: "/hebrew-guide",
      audienceType: "Israeli travelers, Hebrew-speaking travelers, families",
      inLanguage: ["he", "en"],
    }),
  },
  "/accessible-tours": {
    title: "Family-Friendly & Accessible Tours Chiang Mai",
    description:
      "Family-friendly and accessible 4x4 tours in Chiang Mai. Safe adventures for children, seniors, and travelers with mobility needs.",
    canonicalPath: "/accessible-tours",
    jsonLd: serviceJsonLd({
      name: "Family-Friendly & Accessible 4x4 Tours Chiang Mai",
      description:
        "Private 4x4 tours in Chiang Mai adapted for children, seniors, and travelers with mobility needs.",
      path: "/accessible-tours",
      audienceType:
        "Families, seniors, wheelchair users, travelers with mobility needs",
    }),
  },
  "/faq": {
    title: "FAQ \u2014 Kosher Tours & Off-Road Adventures Chiang Mai",
    description:
      "Frequently asked questions about WIRO 4x4 tours, kosher meals, booking, cancellation, Shabbat support, and traveling in Northern Thailand.",
    canonicalPath: "/faq",
  },
  "/contact": {
    title: "Contact WIRO 4x4 \u2014 Chiang Mai Tour Guide",
    description:
      "Get in touch with WIRO 4x4. WhatsApp, email, or booking form. We respond within 24 hours.",
    canonicalPath: "/contact",
    jsonLd: localBusinessJsonLd(),
  },
  "/packages": {
    title: "Multi-Day Tour Packages \u2014 Northern Thailand",
    description:
      "Multi-day tour packages in Northern Thailand and Indochina. 2\u20135 day all-inclusive 4x4 adventures with kosher meals and accommodation.",
    canonicalPath: "/packages",
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "Terms and conditions for WIRO 4x4 tour bookings and services.",
    canonicalPath: "/terms",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "How WIRO 4x4 collects, uses, and protects your personal data.",
    canonicalPath: "/privacy",
  },
};
var PACKAGE_META = {
  "northern-thailand-3d2n": {
    name: "3 Days / 2 Nights \u2014 Northern Thailand Mountain Loop",
    description:
      "A private 3-day 4x4 adventure through Chiang Dao, Doi Ang Khang, Mae Salong, and Chiang Rai with kosher support and Hebrew-speaking guide service.",
    coverImage: "/images/optimized/nong_khiaw_river.jpg",
    price: 12900,
  },
  "grand-tour-laos-14d": {
    name: "14-Day Grand Tour: Thailand to Laos by 4x4",
    description:
      "A private 14-day overland 4x4 expedition from Chiang Mai through Northern Thailand and Laos with kosher support and Hebrew-speaking guide service.",
    coverImage: "/images/optimized/vang_vieng_mountains.jpg",
    price: 59900,
  },
};
function escapeHtml4(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function absoluteUrl(url) {
  if (/^https?:\/\//.test(url)) return url;
  return `${SITE_URL3}${url.startsWith("/") ? "" : "/"}${url}`;
}
function defaultAlternateLanguages(meta, canonicalUrl) {
  if (meta.alternateLanguages) return meta.alternateLanguages;
  if (meta.lang === "he") {
    return {
      he: canonicalUrl,
      "x-default": canonicalUrl,
    };
  }
  return {
    en: canonicalUrl,
    "x-default": canonicalUrl,
  };
}
function buildAlternateTags(meta, canonicalUrl) {
  return Object.entries(defaultAlternateLanguages(meta, canonicalUrl))
    .filter(entry => Boolean(entry[1]))
    .map(
      ([hreflang, href]) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${escapeHtml4(
          href
        )}" />`
    )
    .join("\n");
}
function injectMeta(html, meta) {
  const fullTitle =
    meta.appendBrandSuffix === false || meta.title.includes("WIRO 4x4")
      ? meta.title
      : meta.title + BRAND_SUFFIX;
  const safeTitle = escapeHtml4(fullTitle);
  const safeDesc = escapeHtml4(meta.description);
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const canonicalUrl = `${SITE_URL3}${meta.canonicalPath}`;
  const ogType = meta.ogType || "website";
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escapeHtml4(ogImage)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeHtml4(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escapeHtml4(ogImage)}" />`
  );
  const alternateTags = buildAlternateTags(meta, canonicalUrl);
  html = html.replace(
    /\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]*"\s*\/?>/g,
    ""
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeHtml4(canonicalUrl)}" />
${alternateTags}`
  );
  if (meta.lang) {
    html = html.replace(
      /(<html\b[^>]*)\blang="[^"]*"/,
      `$1 lang="${meta.lang}"`
    );
  }
  if (meta.dir) {
    if (/<html\b[^>]*\sdir="[^"]*"/.test(html)) {
      html = html.replace(
        /(<html\b[^>]*)\bdir="[^"]*"/,
        `$1 dir="${meta.dir}"`
      );
    } else {
      html = html.replace(/<html\b([^>]*)>/, `<html$1 dir="${meta.dir}">`);
    }
  }
  if (meta.jsonLd) {
    const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`;
    html = html.replace(
      "</head>",
      `${jsonLdScript}
</head>`
    );
  }
  const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  if (
    googleSiteVerification &&
    !html.includes('name="google-site-verification"')
  ) {
    html = html.replace(
      "</head>",
      `<meta name="google-site-verification" content="${escapeHtml4(
        googleSiteVerification
      )}" />
</head>`
    );
  }
  return html;
}
async function getDynamicMeta(urlPath) {
  const tourMatch = urlPath.match(/^\/tours\/([a-z0-9-]+)$/);
  if (tourMatch) {
    const tour = await getTourBySlug(tourMatch[1]);
    if (tour) {
      return {
        title: `${tour.name} \u2014 Chiang Mai 4x4 Tour`,
        description:
          tour.description?.slice(0, 155) ||
          `${tour.name} \u2014 private off-road 4x4 tour in Chiang Mai with WIRO 4x4.`,
        ogImage: tour.imageUrl || void 0,
        canonicalPath: `/tours/${tour.slug}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: tour.name,
          description: tour.description,
          provider: {
            "@type": "TravelAgency",
            name: "WIRO 4x4",
            url: SITE_URL3,
          },
          offers: {
            "@type": "Offer",
            price: String(tour.price),
            priceCurrency: "THB",
            availability: "https://schema.org/InStock",
          },
        },
      };
    }
  }
  const packageMatch = urlPath.match(/^\/packages\/([a-z0-9-]+)$/);
  if (packageMatch) {
    const slug = packageMatch[1];
    const dbPkg = await getTourPackageBySlug(slug);
    const pkg = dbPkg?.isPublished === 1 ? dbPkg : void 0;
    const fallback = PACKAGE_META[slug];
    const name = pkg?.name || fallback?.name;
    const description = pkg?.description || fallback?.description;
    const coverImage = pkg?.coverImage || fallback?.coverImage;
    const price = fallback?.price;
    if (name && (pkg || fallback)) {
      return {
        title: `${name} \u2014 Private 4x4 Package`,
        description:
          description?.slice(0, 155) ||
          `${name} \u2014 private multi-day 4x4 tour package with WIRO 4x4.`,
        ogImage: coverImage ? absoluteUrl(coverImage) : void 0,
        canonicalPath: `/packages/${slug}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name,
          description,
          image: coverImage ? absoluteUrl(coverImage) : DEFAULT_OG_IMAGE,
          provider: {
            "@type": "TravelAgency",
            name: "WIRO 4x4",
            url: SITE_URL3,
          },
          offers: price
            ? {
                "@type": "Offer",
                price: String(price),
                priceCurrency: "THB",
                availability: "https://schema.org/InStock",
              }
            : void 0,
        },
      };
    }
  }
  const blogMatch = urlPath.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const post = await getPublishedBlogPostBySlug(blogMatch[1]);
    if (post) {
      const publishedIso = post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : void 0;
      return {
        title: post.title,
        description:
          post.excerpt?.slice(0, 155) ||
          post.content?.slice(0, 155) ||
          `${post.title} \u2014 WIRO 4x4 blog.`,
        ogImage: post.coverImage || void 0,
        ogType: "article",
        canonicalPath: `/blog/${post.slug}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.content?.slice(0, 200),
          image: post.coverImage || DEFAULT_OG_IMAGE,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL3}/blog/${post.slug}`,
          },
          author: {
            "@type": "Person",
            name: "Wiro",
            worksFor: { "@type": "Organization", name: "WIRO 4x4" },
          },
          publisher: {
            "@type": "Organization",
            name: "WIRO 4x4",
            logo: {
              "@type": "ImageObject",
              url: BRAND_LOGO,
            },
          },
          datePublished: publishedIso,
          dateModified: publishedIso,
          url: `${SITE_URL3}/blog/${post.slug}`,
        },
      };
    }
  }
  return null;
}
var cachedHtml = null;
function getIndexHtml() {
  if (cachedHtml) return cachedHtml;
  const candidatePaths =
    process.env.NODE_ENV === "production"
      ? [
          // Vercel serverless bundle: copied by build:frontend for API rewrites.
          path.resolve(import.meta.dirname, "public", "index.html"),
          // Local production fallbacks when running from repository/build output.
          path.resolve(
            import.meta.dirname,
            "..",
            "dist",
            "public",
            "index.html"
          ),
          path.resolve(import.meta.dirname, "dist", "public", "index.html"),
        ]
      : [
          path.resolve(
            import.meta.dirname,
            "..",
            "dist",
            "public",
            "index.html"
          ),
        ];
  for (const distPath of candidatePaths) {
    try {
      cachedHtml = fs3.readFileSync(distPath, "utf-8");
      return cachedHtml;
    } catch {}
  }
  return null;
}
function seoMiddleware() {
  return async (req, res, next) => {
    const urlPath = req.path;
    if (
      req.method !== "GET" ||
      urlPath.startsWith("/api/") ||
      urlPath.startsWith("/assets/") ||
      urlPath.startsWith("/images/") ||
      urlPath.match(/\.\w{2,5}$/)
    ) {
      next();
      return;
    }
    const html = getIndexHtml();
    if (!html) {
      next();
      return;
    }
    let meta = STATIC_ROUTES[urlPath] || null;
    if (!meta) {
      try {
        meta = await getDynamicMeta(urlPath);
      } catch {}
    }
    if (!meta) {
      next();
      return;
    }
    const injectedHtml = injectMeta(html, meta);
    res
      .status(200)
      .set("Content-Type", "text/html; charset=utf-8")
      .send(injectedHtml);
  };
}

// server/vercel-entry.ts
var app = createApp();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://plausible.io"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://plausible.io", "https://wa.me"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    // Allow embedded images from S3/CDN
  })
);
app.use(seoMiddleware());
var vercel_entry_default = app;
export { vercel_entry_default as default };
