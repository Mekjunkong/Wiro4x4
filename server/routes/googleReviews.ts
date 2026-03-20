import {
  router,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
} from "./_helpers";
import {
  fetchGoogleReviews,
  getCacheStatus,
  clearGoogleReviewsCache,
} from "../googleReviewsService";

export const googleReviewsRouter = router({
  /** Public: return cached Google reviews (or empty array if not configured). */
  list: securePublicProcedure.query(async () => {
    return await fetchGoogleReviews();
  }),

  /** Admin: force-refresh the Google reviews cache. */
  refresh: secureProtectedProcedure.mutation(async ({ ctx }) => {
    checkAdminRateLimit(ctx);
    clearGoogleReviewsCache();
    const reviews = await fetchGoogleReviews(true);
    return { success: true, count: reviews.length };
  }),

  /** Admin: return API configuration status and cache info. */
  getStatus: secureProtectedProcedure.query(async () => {
    return getCacheStatus();
  }),
});
