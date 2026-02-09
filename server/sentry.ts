/**
 * Sentry Error Monitoring Module
 *
 * Provides centralized error capture for the backend.
 * Uses lazy initialization so the app starts without Sentry credentials.
 *
 * Prerequisites:
 *   1. Install: pnpm add @sentry/node
 *   2. Set SENTRY_DSN in environment variables
 *
 * Usage:
 *   import { captureException } from './sentry';
 *   captureException(error);
 */

let _sentryInitialized = false;
let _sentryModule: typeof import("@sentry/node") | null = null;

function initSentry(): typeof import("@sentry/node") | null {
  if (_sentryInitialized) return _sentryModule;
  _sentryInitialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn("[Sentry] SENTRY_DSN not set — error monitoring disabled");
    return null;
  }

  try {
    // Dynamic import handled at init time
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/node");
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 0.1,
    });
    _sentryModule = Sentry;
    console.log("[Sentry] Initialized successfully");
    return Sentry;
  } catch (err) {
    console.warn("[Sentry] Failed to initialize:", err);
    _sentryModule = null;
    return null;
  }
}

/**
 * Capture an exception in Sentry.
 * No-op if SENTRY_DSN is not configured or @sentry/node is not installed.
 */
export function captureException(error: unknown): void {
  const Sentry = initSentry();
  if (Sentry) {
    Sentry.captureException(error);
  }
}
