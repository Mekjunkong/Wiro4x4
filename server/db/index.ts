/**
 * Database module barrel export.
 *
 * All existing imports like `import { ... } from "../db"` or `import { ... } from "./db"`
 * continue to work because this index.ts re-exports every function from every domain module.
 */

// Connection
export { getDb } from "./connection";

// Users
export {
  getUserById,
  getUserByEmail,
  createUser,
  updateUserPassword,
  updateLastSignedIn,
  getAllAdminUsers,
  updateUserRole,
  removeAdminAccess,
} from "./users";

// Bookings
export {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAllBookingsPaginated,
  bulkDeleteBookings,
  getBookingsNeedingReminder,
  getBookingsNeedingFeedback,
  markReminderSent,
  markFeedbackSent,
  getBookingsByAgentId,
  getAgentBookingsInDateRange,
  getPendingBookingCount,
  getUpcomingTourCount,
  getEligiblePostTourBookings,
  getEligiblePostTourCount,
  markPostTourEmailSent,
  getAlbumByBookingId,
} from "./bookings";

// Agents
export {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getAgentPerformanceStats,
} from "./agents";

// Leads
export {
  createLead,
  getAllLeads,
  updateLead,
  deleteLead,
  getAllLeadsPaginated,
  bulkDeleteLeads,
  updateLeadScore,
  getLeadsByScore,
  getAllLeadsPaginatedByScore,
  getStaleNewLeads,
  getColdContactedLeads,
  getNewLeadCount,
  getAbandonedLeads,
  markRecoveryEmailSent,
} from "./leads";

// Financial Records
export {
  createFinancialRecord,
  getFinancialRecordsByBookingId,
  getAllFinancialRecords,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialStats,
  getFinancialStatsByTour,
  getFinancialStatsByAgent,
  getAllFinancialRecordsPaginated,
  generateDefaultFinancialRecords,
} from "./financial";

// Gallery Photos
export {
  createGalleryPhoto,
  getAllPublishedPhotos,
  getPublishedPhotosPaginated,
  getFeaturedPhotos,
  getAllGalleryPhotos,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  getAllGalleryPhotosPaginated,
} from "./gallery";

// Reviews
export {
  createReview,
  getApprovedReviews,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewStats,
  getAllReviewsPaginated,
  bulkApproveReviews,
  bulkDeleteReviews,
  getPendingReviewCount,
} from "./reviews";

// Payments
export {
  createPayment,
  getPaymentsByBookingId,
  getAllPayments,
  getPaymentStats,
  getPaymentById,
  getPaymentBySessionId,
  getAllPendingPayments,
  updatePayment,
  getBookingTotalPaid,
} from "./payments";

// Tours
export {
  createTour,
  getAllActiveTours,
  getAllTours,
  getTourById,
  getTourBySlug,
  updateTour,
  deleteTour,
  getAllToursPaginated,
} from "./tours";

// Tour Packages
export {
  createTourPackage,
  getPublishedTourPackages,
  getAllTourPackages,
  getTourPackageBySlug,
  updateTourPackage,
  deleteTourPackage,
} from "./packages";

// Blog Posts
export {
  createBlogPost,
  getAllPublishedBlogPosts,
  getAllBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  getPublishedBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
  getAllBlogPostsPaginated,
} from "./blog";

// Subscribers
export {
  createSubscriber,
  getSubscriberByEmail,
  getAllActiveSubscribers,
  getAllSubscribers,
  deactivateSubscriber,
} from "./subscribers";

// Chat
export {
  createChatSession,
  getChatSessionByVisitorId,
  getChatMessagesBySessionId,
  addChatMessage,
  updateChatSessionMode,
  updateChatSessionSummary,
  updateChatSessionBookingContext,
  closeChatSession,
  getAllChatSessionsPaginated,
} from "./chat";

// Customers (CRM)
export {
  createCustomer,
  getAllCustomers,
  getAllCustomersPaginated,
  getCustomerById,
  getCustomerByEmail,
  getCustomerByPhone,
  updateCustomer,
  deleteCustomer,
  getCustomersByStage,
  createCustomerActivity,
  getActivitiesByCustomerId,
  completeActivity,
  getPendingFollowUps,
  getCustomerPipelineStats,
  getCustomerTimeline,
  findOrCreateCustomer,
  getOverdueTasks,
} from "./customers";

// Audit & Scheduled Emails
export {
  logAdminAction,
  createScheduledEmail,
  hasScheduledEmailBeenSent,
} from "./audit";

// Settings
export {
  getSetting,
  getAllSettings,
  upsertSetting,
  deleteSetting,
} from "./settings";

// Stats (public)
export { getPublicStats, getRecentBookings } from "./stats";

// Booking Drafts
export {
  createBookingDraft,
  getBookingDraftByToken,
  listActiveBookingDrafts,
  updateBookingDraftStatus,
} from "./bookingDrafts";

// Accounting (Invoices, Journal Entries, Tax Filings)
export {
  createInvoice,
  getAllInvoicesPaginated,
  getInvoiceById,
  updateInvoiceStatus,
  getNextInvoiceSequence,
  createAccountingEntry,
  getAccountingEntriesPaginated,
  getTrialBalance,
  createTaxFiling,
  getAllTaxFilingsPaginated,
  updateTaxFilingStatus,
  getUpcomingFilings,
} from "./accounting";

// Inventory
export {
  createInventoryItem,
  getAllInventoryPaginated,
  getInventoryById,
  updateInventoryItem,
  deleteInventoryItem,
  getInventorySummary,
  getInventoryNeedingMaintenance,
} from "./inventory";

// Tour Availability
export {
  getTourAvailabilityByRange,
  upsertTourAvailability,
  bulkUpdateTourAvailability,
} from "./availability";

// Trip Photo Albums & Photos
export {
  createTripPhotoAlbum,
  getTripPhotoAlbumsByBookingId,
  getTripPhotoAlbumByToken,
  getTripPhotoAlbumById,
  getAllTripPhotoAlbums,
  updateTripPhotoAlbum,
  incrementAlbumViewCount,
  deleteTripPhotoAlbum,
  createTripPhoto,
  getTripPhotosByAlbumId,
  deleteTripPhoto,
  getTripPhotoById,
  getAlbumPhotoCount,
} from "./tripPhotos";

// WhatsApp Messages
export {
  createWhatsAppMessage,
  getAllWhatsAppMessagesPaginated,
  getWhatsAppMessageStats,
  updateWhatsAppMessageStatus,
} from "./whatsapp";

// Analytics
export {
  getAnalyticsOverview,
  getRevenueByMonth,
  getBookingsByMonth,
  getLeadFunnel,
  getTopTours,
  getRecentActivity,
} from "./analytics";

// Pagination helper (for advanced use)
export { paginatedQuery } from "./pagination";
