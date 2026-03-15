import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { verifySession } from "../auth";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookies = opts.req.headers.cookie
      ? parseCookieHeader(opts.req.headers.cookie)
      : {};
    const sessionCookie = cookies[COOKIE_NAME];

    if (sessionCookie) {
      const payload = await verifySession(sessionCookie);
      if (payload) {
        const dbUser = await db.getUserById(payload.userId);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    console.error("[Context] Auth error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
