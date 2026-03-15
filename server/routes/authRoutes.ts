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
