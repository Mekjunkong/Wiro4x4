/**
 * Shared helpers for all route files.
 *
 * Re-exports tRPC primitives wrapped with security headers, the
 * admin-rate-limit guard, and the admin-action logger.
 */

import {
  publicProcedure,
  protectedProcedure,
  ownerProcedure,
  managerProcedure,
  agentProcedure,
  router,
} from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { checkRateLimit } from "../rateLimit";
import { setSecurityHeaders } from "../securityHeaders";
import { logAdminAction } from "../db";
import { captureException } from "../sentry";

// Security headers middleware applied to all tRPC procedures.
export const securePublicProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    setSecurityHeaders(ctx.res);
    return next();
  }
);
export const secureProtectedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    setSecurityHeaders(ctx.res);
    return next();
  }
);
export const secureOwnerProcedure = ownerProcedure.use(
  async ({ ctx, next }) => {
    setSecurityHeaders(ctx.res);
    return next();
  }
);
export const secureManagerProcedure = managerProcedure.use(
  async ({ ctx, next }) => {
    setSecurityHeaders(ctx.res);
    return next();
  }
);
export const secureAgentProcedure = agentProcedure.use(
  async ({ ctx, next }) => {
    setSecurityHeaders(ctx.res);
    return next();
  }
);

export function checkAdminRateLimit(ctx: any) {
  const userId = ctx.user?.id ?? "unknown";
  const { allowed } = checkRateLimit(`admin:${userId}`, 100, 5 * 60_000);
  if (!allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many admin operations. Please try again later.",
    });
  }
}

export { router, TRPCError, checkRateLimit, logAdminAction, captureException };
