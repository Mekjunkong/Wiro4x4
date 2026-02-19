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
  upsertUser,
  getUserByOpenId,
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
} from "./leads";

// Financial Records
export {
  createFinancialRecord,
  getFinancialRecordsByBookingId,
  getAllFinancialRecords,
  updateFinancialRecord,
  deleteFinancialRecord,
  getFinancialStats,
  getAllFinancialRecordsPaginated,
  generateDefaultFinancialRecords,
} from "./financial";

// Gallery Photos
export {
  createGalleryPhoto,
  getAllPublishedPhotos,
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

// Blog Posts
export {
  createBlogPost,
  getAllPublishedBlogPosts,
  getAllBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
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
} from "./customers";

// Audit & Scheduled Emails
export {
  logAdminAction,
  createScheduledEmail,
  hasScheduledEmailBeenSent,
} from "./audit";

// Pagination helper (for advanced use)
export { paginatedQuery } from "./pagination";
