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
