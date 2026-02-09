/**
 * Security Headers Middleware
 *
 * Sets standard security headers on every tRPC response.
 * Applied as Express middleware since _core/index.ts registers the tRPC handler.
 *
 * Usage: Import and call setSecurityHeaders(res) at the start of tRPC procedures,
 * or ideally add as Express middleware in _core/index.ts:
 *   app.use(expressSecurityHeaders);
 *
 * The Express middleware approach is preferred as it covers all routes including
 * static assets and OAuth callbacks, not just tRPC procedures.
 */

import type { Response } from "express";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "0",
  // Note: Strict-Transport-Security should be set at reverse proxy level
  // (nginx, Cloudflare, etc.) rather than application level.
} as const;

/**
 * Set security headers on an Express response object.
 * Can be called from tRPC middleware or procedures that have access to ctx.res.
 */
export function setSecurityHeaders(res: Response): void {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
}

/**
 * Express middleware that sets security headers on every response.
 * Add to _core/index.ts: app.use(expressSecurityHeaders);
 */
export function expressSecurityHeaders(
  _req: unknown,
  res: Response,
  next: () => void
): void {
  setSecurityHeaders(res);
  next();
}
