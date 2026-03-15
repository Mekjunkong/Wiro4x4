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
    email: "test@example.com",
    passwordHash: "$2b$10$fakehashfortest",
    name: "Test User",
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
    email: "owner@example.com",
    passwordHash: "$2b$10$fakehashfortest",
    name: "Test Owner",
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
    email: "manager@example.com",
    passwordHash: "$2b$10$fakehashfortest",
    name: "Test Manager",
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
    email: "agent@example.com",
    passwordHash: "$2b$10$fakehashfortest",
    name: "Test Agent",
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
