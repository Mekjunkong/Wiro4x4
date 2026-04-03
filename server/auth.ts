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
    .setExpirationTime("7d")
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
