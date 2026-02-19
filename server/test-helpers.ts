/**
 * Shared test helpers for Vitest test files.
 */
import { it } from "vitest";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

/** Whether a database connection is available for integration tests. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

/**
 * Like `it()`, but automatically skips when no DATABASE_URL is set.
 * Use for tests that write to the database (create, update, delete).
 */
export const itWithDb = hasDatabase ? it : it.skip;

/** Create a mock authenticated admin context for tRPC callers. */
export function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      setHeader: () => {},
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

/** Create a mock unauthenticated (public) context for tRPC callers. */
export function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      setHeader: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

/** Create a mock owner context for tRPC callers. */
export function createOwnerContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-owner",
    email: "owner@example.com",
    name: "Test Owner",
    loginMethod: "manus",
    role: "admin", // admin = owner equivalent
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      setHeader: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

/** Create a mock manager context for tRPC callers. */
export function createManagerContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "test-manager",
    email: "manager@example.com",
    name: "Test Manager",
    loginMethod: "manus",
    role: "manager",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      setHeader: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

/** Create a mock agent context for tRPC callers. */
export function createAgentContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "test-agent",
    email: "agent@example.com",
    name: "Test Agent",
    loginMethod: "manus",
    role: "agent",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      setHeader: () => {},
    } as unknown as TrpcContext["res"],
  };
  return { ctx };
}
