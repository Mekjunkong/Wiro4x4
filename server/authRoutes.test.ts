import type { Express, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "./auth";
import * as db from "./db";
import { registerAuthRoutes } from "./routes/authRoutes";

function createAppMock() {
  const routes = new Map<
    string,
    (req: Request, res: Response) => Promise<void>
  >();

  const app = {
    post: vi.fn(
      (
        path: string,
        handler: (req: Request, res: Response) => Promise<void>
      ) => {
        routes.set(path, handler);
      }
    ),
  } as unknown as Express;

  return { app, routes };
}

function createResponseMock(): any {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn().mockReturnThis();
  const cookie = vi.fn().mockReturnThis();
  const clearCookie = vi.fn().mockReturnThis();

  return {
    res: {
      status,
      json,
      cookie,
      clearCookie,
    },
    status,
    json,
    cookie,
    clearCookie,
  };
}

function createRequestMock(body: unknown = {}) {
  return {
    body,
    protocol: "https",
    headers: {},
  } as Request;
}

describe("registerAuthRoutes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sets the session cookie without exposing the token on register", async () => {
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(null as never);
    vi.spyOn(auth, "hashPassword").mockResolvedValue("hashed-password");
    vi.spyOn(db, "createUser").mockResolvedValue(42 as never);
    vi.spyOn(auth, "createSession").mockResolvedValue("session-token");

    const { app, routes } = createAppMock();
    registerAuthRoutes(app);

    const handler = routes.get("/api/auth/register");
    expect(handler).toBeDefined();

    const req = createRequestMock({
      email: "new@example.com",
      password: "password123",
      name: "New User",
    });
    const res = createResponseMock();

    await handler!(req, res.res);

    expect(auth.createSession).toHaveBeenCalledWith(
      42,
      "new@example.com",
      "user"
    );
    expect(res.cookie).toHaveBeenCalledWith(
      expect.any(String),
      "session-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: 42,
        email: "new@example.com",
        name: "New User",
        role: "user",
      },
    });
    expect(res.json.mock.calls[0]?.[0]).not.toHaveProperty("token");
  });

  it("sets the session cookie without exposing the token on login", async () => {
    vi.spyOn(db, "getUserByEmail").mockResolvedValue({
      id: 7,
      email: "user@example.com",
      passwordHash: "hashed-password",
      name: "Existing User",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as never);
    vi.spyOn(auth, "verifyPassword").mockResolvedValue(true);
    vi.spyOn(db, "updateLastSignedIn").mockResolvedValue(undefined as never);
    vi.spyOn(auth, "createSession").mockResolvedValue("session-token");

    const { app, routes } = createAppMock();
    registerAuthRoutes(app);

    const handler = routes.get("/api/auth/login");
    expect(handler).toBeDefined();

    const req = createRequestMock({
      email: "user@example.com",
      password: "password123",
    });
    const res = createResponseMock();

    await handler!(req, res.res);

    expect(auth.createSession).toHaveBeenCalledWith(
      7,
      "user@example.com",
      "admin"
    );
    expect(res.cookie).toHaveBeenCalledWith(
      expect.any(String),
      "session-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
      })
    );
    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: 7,
        email: "user@example.com",
        name: "Existing User",
        role: "admin",
      },
    });
    expect(res.json.mock.calls[0]?.[0]).not.toHaveProperty("token");
  });
});
