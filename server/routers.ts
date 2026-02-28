/**
 * App Router — thin aggregator that merges all domain routers.
 *
 * Each domain lives in its own file under server/routes/.
 * Shared helpers (secure procedures, rate-limit guard, admin logger)
 * live in server/routes/_helpers.ts.
 */

import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";

// Domain routers
import { authRouter } from "./routes/auth";
import { bookingRouter } from "./routes/booking";
import { agentRouter } from "./routes/agent";
import { leadRouter } from "./routes/lead";
import { financialRouter } from "./routes/financial";
import { galleryRouter } from "./routes/gallery";
import { reviewRouter } from "./routes/review";
import { paymentRouter } from "./routes/payment";
import { tourRouter } from "./routes/tour";
import { blogRouter } from "./routes/blog";
import { newsletterRouter } from "./routes/newsletter";
import { healthRouter } from "./routes/health";
import { crmRouter } from "./routes/crm";
import { adminRouter } from "./routes/admin";
import { settingsRouter } from "./routes/settings";
import { dashboardRouter } from "./routes/dashboard";
import { statsRouter } from "./routes/stats";
import { bookingDraftRouter } from "./routes/bookingDraft";
import { analyticsRouter } from "./routes/analytics";
import { packageRouter } from "./routes/package";
import { accountingRouter } from "./routes/accounting";
import { inventoryRouter } from "./routes/inventory";

// Side-effects: start background workers
import { startSessionChecker } from "./stripeSessionChecker";
import { startReminderScheduler } from "./reminderScheduler";

startSessionChecker();
startReminderScheduler();

export const appRouter = router({
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
});

export type AppRouter = typeof appRouter;
