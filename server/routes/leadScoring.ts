import { z } from "zod";
import {
  router,
  secureProtectedProcedure,
  checkAdminRateLimit,
} from "./_helpers";
import {
  getLeadsByScore,
  getAllLeadsPaginatedByScore,
  updateLeadScore,
  getAllLeads,
} from "../db";
import { paginationInput } from "../../shared/schemas";
import {
  calculateLeadScore,
  recalculateAllLeadScores,
  type LeadData,
} from "../leadScoring";

export const leadScoringRouter = router({
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
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      // Get all leads to find the target and compute email duplicates
      const allLeads = await getAllLeads();
      const lead = allLeads.find(l => l.id === input.id);
      if (!lead) {
        return { success: false, message: "Lead not found", score: 0 };
      }

      const allEmails = allLeads
        .map(l => l.email)
        .filter((email): email is string => email !== null);
      const result = calculateLeadScore(lead as LeadData, allEmails);
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
      z.object({
        minScore: z.number().min(0).max(100).optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const leads = await getLeadsByScore(input.minScore);
      return leads.slice(0, input.limit);
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
