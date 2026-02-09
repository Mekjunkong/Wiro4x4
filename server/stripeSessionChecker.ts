/**
 * Background Stripe Session Checker
 *
 * Periodically checks pending payments and verifies them with Stripe.
 * Catches sessions that completed but the redirect/webhook was missed.
 */

import { getAllPendingPayments } from "./db";
import { verifyAndCompleteSession } from "./stripeService";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

let _intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Start the background session checker.
 *
 * @param intervalMs How often to check (default: 5 minutes)
 */
export function startSessionChecker(intervalMs = 300_000): void {
  // No-op if Stripe is not configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log(
      "[SessionChecker] STRIPE_SECRET_KEY not set — checker disabled"
    );
    return;
  }

  // Prevent duplicate intervals
  if (_intervalId) {
    return;
  }

  console.log(
    `[SessionChecker] Starting background checker (interval: ${intervalMs / 1000}s)`
  );

  _intervalId = setInterval(async () => {
    try {
      const pendingPayments = await getAllPendingPayments();

      // Skip payments created less than 5 minutes ago to allow redirect time
      const now = Date.now();
      const eligiblePayments = pendingPayments.filter(p => {
        if (!p.createdAt) return false;
        const createdTime = new Date(p.createdAt).getTime();
        return now - createdTime > FIVE_MINUTES_MS;
      });

      if (eligiblePayments.length === 0) {
        return;
      }

      console.log(
        `[SessionChecker] Checking ${eligiblePayments.length} pending payment(s)...`
      );

      let completed = 0;
      for (const payment of eligiblePayments) {
        if (!payment.stripeSessionId) continue;
        try {
          const result = await verifyAndCompleteSession(
            payment.stripeSessionId
          );
          if (result.paymentStatus === "paid" && !result.alreadyCompleted) {
            completed++;
          }
        } catch (err) {
          console.error(
            `[SessionChecker] Error checking payment #${payment.id}:`,
            err
          );
        }
      }

      console.log(
        `[SessionChecker] Checked ${eligiblePayments.length} pending payments, ${completed} completed`
      );
    } catch (err) {
      console.error("[SessionChecker] Error in session checker loop:", err);
    }
  }, intervalMs);
}

/**
 * Stop the background session checker.
 */
export function stopSessionChecker(): void {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
    console.log("[SessionChecker] Stopped background checker");
  }
}
