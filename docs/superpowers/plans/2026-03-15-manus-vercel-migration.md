# Manus to Vercel Migration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all Manus platform dependencies with self-hosted services (JWT auth, PlanetScale, Cloudflare R2, OpenAI) and deploy to Vercel.

**Architecture:** Minimal surgery — replace only Manus-specific modules while keeping the Express + tRPC + React + Drizzle architecture intact. Each backend service module is rewritten independently behind unchanged interfaces.

**Tech Stack:** Express 4, tRPC 11, React 19, Drizzle ORM, jose (JWT), bcrypt, @aws-sdk/client-s3, OpenAI SDK, Resend, Vitest

**Spec:** `docs/superpowers/specs/2026-03-15-manus-vercel-migration-design.md`

---

## File Structure

### New Files

| File                                  | Responsibility                                                           |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `server/auth.ts`                      | Password hashing, JWT creation/verification utilities                    |
| `server/auth.test.ts`                 | Unit tests for auth utilities (10 tests)                                 |
| `server/routes/authRoutes.ts`         | Express routes: register, login, logout, forgot-password, reset-password |
| `server/storage.test.ts`              | Unit tests for R2 storage (8 tests)                                      |
| `client/src/pages/Login.tsx`          | Login form page (email + password)                                       |
| `client/src/pages/Register.tsx`       | Registration form page                                                   |
| `client/src/pages/ForgotPassword.tsx` | Forgot password form page                                                |
| `scripts/create-admin.ts`             | CLI script to seed admin user                                            |
| `.env.example`                        | All required environment variables                                       |

### Modified Files

| File                                | Changes                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| `server/_core/env.ts`               | Replace Manus vars with new vars + validation                                     |
| `drizzle/schema.ts`                 | Users table: remove openId, add email/passwordHash; add passwordResetTokens table |
| `server/db/users.ts`                | Replace getUserByOpenId → getUserByEmail, getUserById; update upsertUser          |
| `server/_core/context.ts`           | Replace Manus SDK auth with JWT verification                                      |
| `server/_core/index.ts`             | Replace registerOAuthRoutes with registerAuthRoutes                               |
| `server/storage.ts`                 | Full rewrite: Manus proxy → direct R2 via @aws-sdk/client-s3                      |
| `server/_core/llm.ts`               | Full rewrite: Manus forge proxy → direct OpenAI SDK                               |
| `server/_core/notification.ts`      | Full rewrite: Manus notification → Resend email                                   |
| `server/routes/auth.ts`             | No changes needed — existing tRPC me/logout procedures stay as-is                 |
| `client/src/const.ts`               | Remove getLoginUrl(), Manus OAuth URLs                                            |
| `client/src/_core/hooks/useAuth.ts` | Update redirect to /login page                                                    |
| `client/src/App.tsx`                | Add /login, /register routes                                                      |
| `shared/const.ts`                   | No changes needed (COOKIE_NAME stays)                                             |
| `vercel.json`                       | Full rewrite for Vercel deployment                                                |
| `package.json`                      | Update build script for esbuild single-bundle                                     |

### Deleted Files

| File                              | Reason                                  |
| --------------------------------- | --------------------------------------- |
| `server/_core/oauth.ts`           | Replaced by server/routes/authRoutes.ts |
| `server/_core/sdk.ts`             | Manus SDK no longer needed              |
| `server/_core/imageGeneration.ts` | Feature removed (unused)                |

---

## Chunk 1: Foundation — Environment, Schema, Auth Module

### Task 1: Update Environment Configuration

**Files:**

- Modify: `server/_core/env.ts`
- Create: `.env.example`

- [ ] **Step 1: Rewrite `server/_core/env.ts`**

Replace the entire file with new environment variable mapping and validation:

```typescript
// server/_core/env.ts
const REQUIRED_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
  "OWNER_EMAIL",
] as const;

for (const varName of REQUIRED_VARS) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

export const ENV = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  r2AccountId: process.env.R2_ACCOUNT_ID!,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID!,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  r2BucketName: process.env.R2_BUCKET_NAME!,
  r2PublicUrl: process.env.R2_PUBLIC_URL!,
  ownerEmail: process.env.OWNER_EMAIL!,
  isProduction: process.env.NODE_ENV === "production",
  // Lazy-init services (optional)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
};
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Database (PlanetScale)
DATABASE_URL=mysql://user:pass@aws.connect.psdb.cloud/wiro?ssl={"rejectUnauthorized":true}

# Authentication
JWT_SECRET=generate-with-openssl-rand-base64-32

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=wiro-storage
R2_PUBLIC_URL=https://pub-xxxxxxxxx.r2.dev

# Notifications
OWNER_EMAIL=wiro.adventures@gmail.com

# AI (OpenAI) — optional, lazy init
OPENAI_API_KEY=sk-proj-xxxxxxxxx

# Email (Resend) — optional, lazy init
RESEND_API_KEY=re_xxxxxxxxx

# Payments (Stripe) — deferred
STRIPE_SECRET_KEY=sk_live_xxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

# App Configuration
NODE_ENV=production
VITE_APP_TITLE=Wiro 4x4 - Kosher Off-Road Tours Chiang Mai
VITE_APP_LOGO=https://www.wiro4x4indochina.com/logo.png
```

- [ ] **Step 3: Install new dependencies**

Run: `pnpm add bcrypt @types/bcrypt`
(`jose`, `cookie`, `@types/cookie`, `@aws-sdk/client-s3`, `openai`, `resend` are already in package.json.)

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Errors from files importing old `ENV.forgeApiKey`, `ENV.forgeApiUrl`, `ENV.ownerOpenId`, `ENV.oAuthServerUrl`, `ENV.appId`, `ENV.cookieSecret`. These will be fixed in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add server/_core/env.ts .env.example package.json pnpm-lock.yaml
git commit -m "feat: replace Manus env vars with self-hosted service configuration"
```

---

### Task 2: Update Database Schema

**Files:**

- Modify: `drizzle/schema.ts:17-37`
- Modify: `drizzle/relations.ts` (if passwordResetTokens needs relations)

- [ ] **Step 1: Update users table in `drizzle/schema.ts`**

Replace lines 17-34 (the `users` table definition):

```typescript
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 60 }).notNull(),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin", "owner", "manager", "agent"])
    .default("user")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
```

- [ ] **Step 2: Add passwordResetTokens table**

Add after the users table definition (after `export type InsertUser`):

```typescript
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
```

Note: No FK reference — PlanetScale (Vitess) doesn't enforce FK constraints. The `userId` column functions as a logical FK.

- [ ] **Step 3: Verify schema compiles**

Run: `npx tsc --noEmit 2>&1 | grep schema`
Expected: No errors from `drizzle/schema.ts` itself.

- [ ] **Step 4: Commit**

```bash
git add drizzle/schema.ts
git commit -m "feat: update users schema for email/password auth, add passwordResetTokens"
```

---

### Task 3: Create Auth Utility Module

**Files:**

- Create: `server/auth.ts`

- [ ] **Step 1: Create `server/auth.ts`**

```typescript
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 10;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export type SessionPayload = {
  userId: number;
  email: string;
  role: string;
};

export async function createSession(
  userId: number,
  email: string,
  role: string
): Promise<string> {
  return new SignJWT({ userId, email, role } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit server/auth.ts 2>&1`
Expected: Clean compilation (no errors).

- [ ] **Step 3: Commit**

```bash
git add server/auth.ts
git commit -m "feat: add auth utility module (JWT, bcrypt, reset tokens)"
```

---

### Task 4: Write Auth Module Tests

**Files:**

- Create: `server/auth.test.ts`

- [ ] **Step 1: Write all auth tests**

```typescript
import { describe, it, expect, vi } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  generateResetToken,
} from "./auth";

describe("auth module", () => {
  // Set JWT_SECRET for tests
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-chars-long";

  describe("password hashing", () => {
    it("produces different hashes for same password (different salts)", async () => {
      const hash1 = await hashPassword("testpassword");
      const hash2 = await hashPassword("testpassword");
      expect(hash1).not.toBe(hash2);
    });

    it("verifies correct password", async () => {
      const hash = await hashPassword("correctpassword");
      const result = await verifyPassword("correctpassword", hash);
      expect(result).toBe(true);
    });

    it("rejects incorrect password", async () => {
      const hash = await hashPassword("correctpassword");
      const result = await verifyPassword("wrongpassword", hash);
      expect(result).toBe(false);
    });
  });

  describe("JWT sessions", () => {
    it("creates token with userId, email, role claims", async () => {
      const token = await createSession(42, "admin@test.com", "admin");
      const payload = await verifySession(token);
      expect(payload).toEqual(
        expect.objectContaining({
          userId: 42,
          email: "admin@test.com",
          role: "admin",
        })
      );
    });

    it("verifies valid token successfully", async () => {
      const token = await createSession(1, "user@test.com", "user");
      const payload = await verifySession(token);
      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe(1);
    });

    it("returns null for invalid signature", async () => {
      const payload = await verifySession("invalid.jwt.token");
      expect(payload).toBeNull();
    });

    it("returns null for expired token", async () => {
      // Create a token that expired in the past by manipulating the JWT manually
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const expiredToken = await new SignJWT({
        userId: 1,
        email: "x@x.com",
        role: "user",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // 1 hour ago
        .sign(secret);
      const payload = await verifySession(expiredToken);
      expect(payload).toBeNull();
    });

    it("sets expiration to 30 days", async () => {
      const token = await createSession(1, "user@test.com", "user");
      const payload = await verifySession(token);
      // The exp claim should be ~30 days from now
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const thirtyDaysSeconds = 30 * 24 * 60 * 60;
      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBeGreaterThan(now + thirtyDaysSeconds - 60);
      expect(decoded.exp).toBeLessThan(now + thirtyDaysSeconds + 60);
    });
  });

  describe("reset tokens", () => {
    it("generates 64-char hex string", () => {
      const token = generateResetToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it("generates unique tokens each call", () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();
      expect(token1).not.toBe(token2);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run server/auth.test.ts`
Expected: All 10 tests pass.

- [ ] **Step 3: Commit**

```bash
git add server/auth.test.ts
git commit -m "test: add auth module unit tests (10 tests)"
```

---

### Task 5: Update User DB Helpers

**Files:**

- Modify: `server/db/users.ts`

- [ ] **Step 1: Rewrite `server/db/users.ts`**

Replace the entire file:

```typescript
import { eq } from "drizzle-orm";
import { desc, inArray } from "drizzle-orm";
import { getDb } from "./connection";
import { users } from "../../drizzle/schema";

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name?: string | null;
  role?: "user" | "admin" | "owner" | "manager" | "agent";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name ?? null,
    role: data.role ?? "user",
    lastSignedIn: new Date(),
  });
  return result[0].insertId;
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function updateLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

export async function getAllAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(users)
    .where(inArray(users.role, ["admin", "owner", "manager", "agent"]))
    .orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(users)
    .set({ role: role as any })
    .where(eq(users.id, userId));
}

export async function removeAdminAccess(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(users)
    .set({ role: "user" })
    .where(eq(users.id, userId));
}
```

- [ ] **Step 2: Update `server/db/index.ts` exports**

Replace the Users export block (lines 11-18) with:

```typescript
// Users
export {
  getUserById,
  getUserByEmail,
  createUser,
  updateUserPassword,
  updateLastSignedIn,
  getAllAdminUsers,
  updateUserRole,
  removeAdminAccess,
} from "./users";
```

- [ ] **Step 3: Commit**

```bash
git add server/db/users.ts server/db/index.ts
git commit -m "feat: replace openId-based user queries with email-based auth queries"
```

---

## Chunk 2: Auth Routes, Context Middleware, Entry Point

### Task 6: Create Auth Express Routes

**Files:**

- Create: `server/routes/authRoutes.ts`

- [ ] **Step 1: Create `server/routes/authRoutes.ts`**

```typescript
import { z } from "zod";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import {
  hashPassword,
  verifyPassword,
  createSession,
  generateResetToken,
} from "../auth";
import * as db from "../db";
import { getDb } from "../db/connection";
import { passwordResetTokens } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const registerInput = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255).optional(),
});

const loginInput = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordInput = z.object({
  email: z.string().email(),
});

const resetPasswordInput = z.object({
  token: z.string().length(64),
  newPassword: z.string().min(8).max(128),
});

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const body = registerInput.parse(req.body);

      const existing = await db.getUserByEmail(body.email);
      if (existing) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }

      const passwordHash = await hashPassword(body.password);
      const userId = await db.createUser({
        email: body.email,
        passwordHash,
        name: body.name,
      });

      const token = await createSession(userId, body.email, "user");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: THIRTY_DAYS_MS,
      });

      res.json({
        token,
        user: {
          id: userId,
          email: body.email,
          name: body.name ?? null,
          role: "user",
        },
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid input", details: error.errors });
        return;
      }
      console.error("[Auth] Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const body = loginInput.parse(req.body);

      const user = await db.getUserByEmail(body.email);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const valid = await verifyPassword(body.password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      await db.updateLastSignedIn(user.id);

      const token = await createSession(user.id, user.email, user.role);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: THIRTY_DAYS_MS,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid input" });
        return;
      }
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (_req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(_req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const body = forgotPasswordInput.parse(req.body);

      // Always return success to prevent email enumeration
      const user = await db.getUserByEmail(body.email);
      if (user) {
        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        const dbConn = await getDb();
        if (dbConn) {
          await dbConn.insert(passwordResetTokens).values({
            userId: user.id,
            token,
            expiresAt,
          });
        }

        // Send reset email via Resend (lazy init — no crash if key missing)
        try {
          const { Resend } = await import("resend");
          const apiKey = process.env.RESEND_API_KEY;
          if (apiKey) {
            const resend = new Resend(apiKey);
            await resend.emails.send({
              from: "support@wiro4x4indochina.com",
              to: body.email,
              subject: "Reset your WIRO 4x4 password",
              html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                <a href="https://www.wiro4x4indochina.com/reset-password?token=${token}">
                  Reset Password
                </a>
                <p>If you didn't request this, ignore this email.</p>
              `,
            });
          } else {
            console.warn(
              "[Auth] RESEND_API_KEY not set — reset email not sent"
            );
          }
        } catch (emailErr) {
          console.error("[Auth] Failed to send reset email:", emailErr);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid input" });
        return;
      }
      // Still return success to prevent enumeration
      res.json({ success: true });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const body = resetPasswordInput.parse(req.body);

      const dbConn = await getDb();
      if (!dbConn) {
        res
          .status(500)
          .json({ error: "An error occurred. Please try again later." });
        return;
      }

      const tokenRows = await dbConn
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, body.token),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (tokenRows.length === 0) {
        res
          .status(400)
          .json({
            error: "Reset failed. Please request a new password reset link.",
          });
        return;
      }

      const resetRecord = tokenRows[0];
      const newHash = await hashPassword(body.newPassword);
      await db.updateUserPassword(resetRecord.userId, newHash);

      // Delete used token
      await dbConn
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetRecord.id));

      res.json({ success: true });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res
          .status(400)
          .json({ error: "Password must be at least 8 characters" });
        return;
      }
      console.error("[Auth] Reset password error:", error);
      res
        .status(500)
        .json({ error: "An error occurred. Please try again later." });
    }
  });
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit server/routes/authRoutes.ts 2>&1 | head -10`

- [ ] **Step 3: Commit**

```bash
git add server/routes/authRoutes.ts
git commit -m "feat: add Express auth routes (register, login, logout, forgot/reset password)"
```

---

### Task 7: Update Context Middleware

**Files:**

- Modify: `server/_core/context.ts`

- [ ] **Step 1: Rewrite `server/_core/context.ts`**

Replace the entire file:

```typescript
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit server/_core/context.ts 2>&1 | head -10`
Expected: Clean compilation.

- [ ] **Step 3: Commit**

```bash
git add server/_core/context.ts
git commit -m "feat: replace Manus SDK auth with JWT verification in context middleware"
```

---

### Task 8: Update Server Entry Point

**Files:**

- Modify: `server/_core/index.ts`

- [ ] **Step 1: Replace OAuth with auth routes**

In `server/_core/index.ts`:

- Change import: `import { registerOAuthRoutes } from "./oauth"` → `import { registerAuthRoutes } from "../routes/authRoutes"`
- Change call: `registerOAuthRoutes(app)` → `registerAuthRoutes(app)`

- [ ] **Step 2: Delete Manus-specific files**

First verify no callers remain:

```bash
grep -r "generateImage\|imageGeneration" server/ client/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v '.test.'
grep -r "from.*sdk\|from.*oauth" server/ --include="*.ts" | grep -v node_modules | grep -v _core/index | grep -v _core/context
```

Then delete:

```bash
rm server/_core/oauth.ts
rm server/_core/sdk.ts
rm -f server/_core/imageGeneration.ts
```

- [ ] **Step 3: Verify server compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: May still show errors from storage.ts and llm.ts (fixed in Chunk 3). No errors from auth-related files.

- [ ] **Step 4: Commit**

```bash
git add server/_core/index.ts
git rm server/_core/oauth.ts server/_core/sdk.ts
git rm -f server/_core/imageGeneration.ts
git commit -m "feat: replace Manus OAuth entry point with self-hosted auth routes"
```

---

## Chunk 3: Backend Service Replacements — Storage, LLM, Notifications

### Task 9: Rewrite Storage Module for R2

**Files:**

- Modify: `server/storage.ts` (full rewrite)

- [ ] **Step 1: Rewrite `server/storage.ts`**

Replace the entire file:

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ENV.r2AccessKeyId,
        secretAccessKey: ENV.r2SecretAccessKey,
      },
    });
  }
  return _s3Client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
      Body: typeof data === "string" ? Buffer.from(data) : data,
      ContentType: contentType,
    })
  );

  const url = `${ENV.r2PublicUrl}/${key}`;
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const url = `${ENV.r2PublicUrl}/${key}`;
  return { key, url };
}
```

- [ ] **Step 2: Commit**

```bash
git add server/storage.ts
git commit -m "feat: replace Manus storage proxy with Cloudflare R2 direct access"
```

---

### Task 10: Write Storage Tests

**Files:**

- Create: `server/storage.test.ts`

- [ ] **Step 1: Write storage tests**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @aws-sdk/client-s3 before importing storage
vi.mock("@aws-sdk/client-s3", () => {
  const mockSend = vi.fn().mockResolvedValue({});
  return {
    S3Client: vi.fn().mockImplementation(() => ({ send: mockSend })),
    PutObjectCommand: vi.fn().mockImplementation(params => params),
  };
});

// Set env vars before import
process.env.R2_ACCOUNT_ID = "test-account";
process.env.R2_ACCESS_KEY_ID = "test-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.R2_PUBLIC_URL = "https://pub-test.r2.dev";
process.env.JWT_SECRET = "test-secret-32-chars-minimum-length";
process.env.DATABASE_URL = "mysql://test";
process.env.OWNER_EMAIL = "test@test.com";

describe("storage module", () => {
  let storagePut: typeof import("./storage").storagePut;
  let storageGet: typeof import("./storage").storageGet;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("./storage");
    storagePut = mod.storagePut;
    storageGet = mod.storageGet;
  });

  describe("storagePut", () => {
    it("returns correct public URL format", async () => {
      const result = await storagePut(
        "photos/test.jpg",
        Buffer.from("data"),
        "image/jpeg"
      );
      expect(result.url).toBe("https://pub-test.r2.dev/photos/test.jpg");
      expect(result.key).toBe("photos/test.jpg");
    });

    it("strips leading slashes from keys", async () => {
      const result = await storagePut(
        "/leading/slash.jpg",
        Buffer.from("data")
      );
      expect(result.key).toBe("leading/slash.jpg");
      expect(result.url).toBe("https://pub-test.r2.dev/leading/slash.jpg");
    });

    it("handles string data by converting to Buffer", async () => {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      await storagePut("test.txt", "hello world", "text/plain");
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          ContentType: "text/plain",
          Key: "test.txt",
        })
      );
    });

    it("sets correct ContentType header", async () => {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      await storagePut("img.webp", Buffer.from("data"), "image/webp");
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({ ContentType: "image/webp" })
      );
    });

    it("uses default content type when not specified", async () => {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      await storagePut("file.bin", Buffer.from("data"));
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({ ContentType: "application/octet-stream" })
      );
    });
  });

  describe("storageGet", () => {
    it("returns public URL for existing key", async () => {
      const result = await storageGet("photos/beach.jpg");
      expect(result.url).toBe("https://pub-test.r2.dev/photos/beach.jpg");
      expect(result.key).toBe("photos/beach.jpg");
    });

    it("strips leading slashes", async () => {
      const result = await storageGet("///multiple/slashes.jpg");
      expect(result.key).toBe("multiple/slashes.jpg");
    });
  });

  describe("error handling", () => {
    it("propagates S3 upload errors", async () => {
      const { S3Client: MockS3 } = await import("@aws-sdk/client-s3");
      const mockInstance = new MockS3({});
      (mockInstance.send as any).mockRejectedValueOnce(
        new Error("Network timeout")
      );

      // Re-import to get fresh module with mocked client
      vi.resetModules();
      const freshMod = await import("./storage");
      // The error will propagate from send()
      await expect(
        freshMod.storagePut("fail.jpg", Buffer.from("data"))
      ).rejects.toThrow();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run server/storage.test.ts`
Expected: All 8 tests pass.

- [ ] **Step 3: Commit**

```bash
git add server/storage.test.ts
git commit -m "test: add storage module unit tests (8 tests, mocked R2)"
```

---

### Task 11: Rewrite LLM Module for OpenAI

**Files:**

- Modify: `server/_core/llm.ts` (full rewrite)

- [ ] **Step 1: Rewrite `server/_core/llm.ts`**

**Keep lines 1-171 unchanged** (all type exports: `Role`, `Message`, `TextContent`, `ImageContent`, `FileContent`, `MessageContent`, `Tool`, `ToolChoice*`, `InvokeParams`, `ToolCall`, `InvokeResult`, `JsonSchema`, `OutputSchema`, `ResponseFormat` + helper functions: `ensureArray`, `normalizeContentPart`, `normalizeMessage`).

**Delete lines 172-332** (everything from `normalizeToolChoice` through end of file — `resolveApiUrl`, `assertApiKey`, `normalizeResponseFormat`, and the old `invokeLLM` function).

**Append this at the end of the file (after line 171):**

```typescript
import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const openai = getOpenAIClient();
  const { messages, tools, maxTokens, max_tokens } = params;
  const resolvedMaxTokens = maxTokens || max_tokens || 4096;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map(normalizeMessage) as any,
      tools: tools?.length ? (tools as any) : undefined,
      max_tokens: resolvedMaxTokens,
    });

    return response as unknown as InvokeResult;
  } catch (error: any) {
    if (error.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages.map(normalizeMessage) as any,
        tools: tools?.length ? (tools as any) : undefined,
        max_tokens: resolvedMaxTokens,
      });
      return response as unknown as InvokeResult;
    } else if (error.status === 401) {
      throw new Error("OpenAI API key invalid or missing");
    } else if (error.status >= 500) {
      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    }
    console.error("[LLM] OpenAI error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
}
```

**Implementation note:** Keep ALL the existing type exports and helper functions (lines 1-171 of current file). Only replace:

- The `resolveApiUrl` function (delete)
- The `assertApiKey` function (delete)
- The `invokeLLM` function body (replace)
- Add lazy OpenAI client initialization

- [ ] **Step 2: Commit**

```bash
git add server/_core/llm.ts
git commit -m "feat: replace Manus LLM proxy with direct OpenAI GPT-4o-mini"
```

---

### Task 12: Rewrite Notification Module for Resend

**Files:**

- Modify: `server/_core/notification.ts` (full rewrite)

- [ ] **Step 1: Rewrite `server/_core/notification.ts`**

Replace the entire file:

```typescript
import { TRPCError } from "@trpc/server";

export type NotificationPayload = {
  title: string;
  content: string;
};

let resendClient: any = null;

async function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[Notification] RESEND_API_KEY not configured — notifications disabled"
      );
      return null;
    }
    const { Resend } = await import("resend");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = payload;

  if (!title?.trim() || !content?.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title and content are required.",
    });
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn("[Notification] OWNER_EMAIL not configured");
    return false;
  }

  const resend = await getResendClient();
  if (!resend) return false;

  try {
    await resend.emails.send({
      from: "notifications@wiro4x4indochina.com",
      to: ownerEmail,
      subject: title.trim(),
      html: `
        <h2>${title.trim()}</h2>
        <div>${content.trim().replace(/\n/g, "<br>")}</div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Sent from Wiro 4x4 Notification System
        </p>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Notification] Email failed:", error);
    return false;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/_core/notification.ts
git commit -m "feat: replace Manus notification service with Resend email"
```

---

### Task 13: Verify and Clean Up References

**Files:**

- Various files referencing old Manus APIs

- [ ] **Step 1: Search for remaining Manus references**

```bash
grep -rn "forgeApiUrl\|forgeApiKey\|ownerOpenId\|oAuthServerUrl\|appId\|ENV.cookieSecret" server/ shared/ --include="*.ts" | grep -v node_modules | grep -v '.test.' | grep -v _core/env.ts
```

Fix any remaining references to use the new `ENV` shape.

- [ ] **Step 2: Search for `sdk` imports**

```bash
grep -rn "from.*_core/sdk\|from.*_core/oauth\|from.*imageGeneration" server/ client/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

Expected: No results (all deleted/replaced). If any remain, update the imports.

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: Clean compilation or only frontend errors (fixed in Chunk 4).

- [ ] **Step 4: Run existing tests**

Run: `npx vitest run 2>&1 | tail -20`
Expected: Auth tests pass, storage tests pass. Some existing tests may need minor fixes for schema changes.

- [ ] **Step 5: Commit only changed files**

```bash
git add server/ shared/
git commit -m "chore: clean up remaining Manus references"
```

---

## Chunk 4: Frontend Auth Pages, Deployment Config, Final Verification

### Task 14: Create Login Page

**Files:**

- Create: `client/src/pages/Login.tsx`

- [ ] **Step 1: Create Login.tsx**

```tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      // Refresh the page to pick up the new session cookie
      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground mt-1">Welcome back to WIRO 4x4</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>
            <Link href="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/Login.tsx
git commit -m "feat: add login page"
```

---

### Task 15: Create Register Page

**Files:**

- Create: `client/src/pages/Register.tsx`

- [ ] **Step 1: Create Register.tsx**

```tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-1">Join WIRO 4x4 Adventures</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/Register.tsx
git commit -m "feat: add registration page"
```

---

### Task 16: Update Frontend Routing and Constants

**Files:**

- Modify: `client/src/const.ts`
- Modify: `client/src/_core/hooks/useAuth.ts`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Update `client/src/const.ts`**

Remove the `getLoginUrl()` function and Manus-related exports. Replace with:

```typescript
export {
  COOKIE_NAME,
  ONE_YEAR_MS,
  COMPANY_WHATSAPP as WHATSAPP_NUMBER,
  COMPANY_WHATSAPP_URL as WHATSAPP_URL,
  COMPANY_WHATSAPP_URL,
  COMPANY_WHATSAPP_DISPLAY,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_WEBSITE,
  COMPANY_FACEBOOK_URL,
  COMPANY_INSTAGRAM_URL,
} from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663190487952/IgRfDwmHFJhVXtzf.png";

export const LOGIN_URL = "/login";
```

- [ ] **Step 2: Update `client/src/_core/hooks/useAuth.ts`**

Change the import and default redirect:

- Line 1: Change `import { getLoginUrl } from "@/const"` → `import { LOGIN_URL } from "@/const"`
- Line 12: Change `redirectPath = getLoginUrl()` → `redirectPath = LOGIN_URL`
- Line 45-48: Change `localStorage.setItem("manus-runtime-user-info", ...)` → `localStorage.setItem("wiro-user-info", ...)`

- [ ] **Step 3: Add routes to `client/src/App.tsx`**

Add lazy imports at the top (near the other lazy imports):

```typescript
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
```

Add routes inside the `<Switch>`:

```tsx
<Route path="/login" component={Login} />
<Route path="/register" component={Register} />
<Route path="/forgot-password" component={ForgotPassword} />
```

- [ ] **Step 4: Create `client/src/pages/ForgotPassword.tsx`**

```tsx
import { useState } from "react";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            If an account exists for {email}, we sent a password reset link. It
            expires in 1 hour.
          </p>
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground mt-1">
            Enter your email to receive a reset link
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Clean compilation.

- [ ] **Step 6: Commit**

```bash
git add client/src/const.ts client/src/_core/hooks/useAuth.ts client/src/App.tsx client/src/pages/ForgotPassword.tsx
git commit -m "feat: update frontend for self-hosted auth (login/register/forgot-password routes)"
```

---

### Task 17: Update Vercel Config and Build Script

**Files:**

- Modify: `vercel.json`
- Modify: `package.json` (build script only)

- [ ] **Step 1: Rewrite `vercel.json`**

```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": null,
  "outputDirectory": "dist/public",
  "functions": {
    "api/index.js": {
      "runtime": "nodejs20.x",
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, must-revalidate" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Update build script in `package.json`**

Find the `"build"` script and update the esbuild command to use `--outfile=dist/index.js`:

```json
"build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js"
```

- [ ] **Step 3: Commit**

```bash
git add vercel.json package.json
git commit -m "feat: configure Vercel deployment with serverless API function"
```

---

### Task 18: Create Admin Seed Script

**Files:**

- Create: `scripts/create-admin.ts`

- [ ] **Step 1: Create `scripts/create-admin.ts`**

```typescript
import "dotenv/config";
import { hashPassword } from "../server/auth";
import { getDb } from "../server/db/connection";
import { users } from "../drizzle/schema";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-admin.ts <email> <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("Database not available. Check DATABASE_URL.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  try {
    await db.insert(users).values({
      email,
      passwordHash,
      name: "Admin",
      role: "admin",
      lastSignedIn: new Date(),
    });
    console.log(`✓ Admin user created: ${email}`);
  } catch (error: any) {
    if (error.message?.includes("Duplicate")) {
      console.error(`User with email ${email} already exists`);
    } else {
      console.error("Failed to create admin:", error);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
```

- [ ] **Step 2: Commit**

```bash
git add scripts/create-admin.ts
git commit -m "feat: add admin user seed script"
```

---

### Task 19: Update Existing Tests for Schema Changes

**Files:**

- Modify: Various `server/*.test.ts` files that reference `openId`

- [ ] **Step 1: Find tests referencing openId**

```bash
grep -rn "openId" server/*.test.ts server/**/*.test.ts 2>/dev/null
```

Update any test that creates user fixtures to use `email`/`passwordHash` instead of `openId`.

- [ ] **Step 2: Update test-helpers.ts if it references openId**

```bash
grep -n "openId" server/test-helpers.ts
```

Update `createAuthContext()` to use the new user schema shape.

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run 2>&1 | tail -30`
Expected: All non-DB-dependent tests pass (auth tests + storage tests + existing unit tests). DB-dependent tests auto-skip.

- [ ] **Step 4: Commit**

```bash
git add server/*.test.ts server/test-helpers.ts
git commit -m "test: update existing tests for new auth schema"
```

---

### Task 20: Final Verification

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: Clean compilation (0 errors).

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: All non-DB-dependent tests pass.

- [ ] **Step 3: Verify dev server starts**

Run: `pnpm dev` (manual check — verify no startup crashes)
Expected: Server starts on port 3000 (will show env var errors if `.env` not configured, which is expected locally).

- [ ] **Step 4: Final commit (only if there are unstaged changes)**

```bash
git status
# If any changes remain:
git add server/ client/ shared/ drizzle/ scripts/
git commit -m "chore: final cleanup for Manus to Vercel migration"
```

---

## Post-Implementation Notes

**After all tasks complete, the following manual steps remain (not automated):**

1. Create PlanetScale database and import data
2. Create Cloudflare R2 bucket and upload files
3. Get OpenAI API key
4. Connect GitHub repo to Vercel
5. Set all env vars in Vercel dashboard
6. Run `npx tsx scripts/create-admin.ts <email> <password>` on PlanetScale
7. Deploy and verify
8. Update DNS to point to Vercel
9. Monitor for 7 days before decommissioning Manus

**Total Tasks:** 20
**Estimated Implementation Time:** 2-3 hours (automated via subagents)
