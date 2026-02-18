import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);

/** Roles that have at least "owner" access (owner + admin for backward compat). */
const OWNER_ROLES = ["admin", "owner"];
/** Roles that have at least "manager" access. */
const MANAGER_ROLES = ["admin", "owner", "manager"];
/** Roles that have at least "agent" access. */
const AGENT_ROLES = ["admin", "owner", "manager", "agent"];

export const ownerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !OWNER_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Owner access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);

export const managerProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !MANAGER_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Manager access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);

export const agentProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || !AGENT_ROLES.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Agent access required",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);
