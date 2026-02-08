/**
 * Stripe Integration Module
 *
 * Implements Stripe Checkout Sessions for the deposit + balance payment model.
 * Uses lazy initialization so the app starts without Stripe credentials.
 *
 * Prerequisites:
 *   1. Install: pnpm add stripe
 *   2. Set STRIPE_SECRET_KEY in environment variables
 *   3. Set STRIPE_WEBHOOK_SECRET for webhook verification
 *   4. Set VITE_STRIPE_PUBLISHABLE_KEY for frontend (optional)
 *
 * Payment flow:
 *   1. Admin triggers checkout from booking detail -> createCheckoutSession()
 *   2. Customer is redirected to Stripe hosted checkout page
 *   3. On success, Stripe sends webhook -> handleWebhook()
 *   4. Webhook handler creates/updates payment record in DB
 *   5. Admin can verify via getSessionStatus()
 */

import type Stripe from "stripe";

// ---------------------------------------------------------------------------
// Lazy Stripe client
// ---------------------------------------------------------------------------

let _stripe: Stripe | null = null;
let _stripeInitAttempted = false;

function getStripeClient(): Stripe | null {
  if (_stripeInitAttempted) return _stripe;
  _stripeInitAttempted = true;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn("[Stripe] STRIPE_SECRET_KEY not set — payment features disabled");
    return null;
  }

  try {
    // Dynamic require so the app works if the stripe package is not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const StripeConstructor = require("stripe").default ?? require("stripe");
    _stripe = new StripeConstructor(secretKey, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
    console.log("[Stripe] Client initialized successfully");
    return _stripe;
  } catch (err) {
    console.warn("[Stripe] Failed to initialize client:", err);
    _stripe = null;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || "https://wiro4x4.manus.space";

function ensureStripe(): Stripe {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error(
      "Stripe integration not yet configured. Set STRIPE_SECRET_KEY to enable payments."
    );
  }
  return stripe;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Checkout Session for a booking deposit or balance payment.
 *
 * @param bookingId - The booking to create payment for
 * @param amount - Amount in THB (whole units, e.g. 5000 = 5,000 THB)
 * @param type - "deposit" | "balance" | "full"
 * @param customerEmail - Optional email for Stripe receipt
 * @returns Checkout session URL to redirect customer to, plus session ID
 */
export async function createCheckoutSession(
  bookingId: number,
  amount: number,
  type: "deposit" | "balance" | "full",
  customerEmail?: string,
): Promise<{ url: string; sessionId: string }> {
  const stripe = ensureStripe();

  const typeLabels: Record<string, string> = {
    deposit: "Deposit",
    balance: "Balance",
    full: "Full Payment",
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "thb",
          product_data: {
            name: `WIRO 4x4 Tour - ${typeLabels[type]}`,
            description: `Booking #${bookingId} — ${typeLabels[type]} payment`,
          },
          // Stripe expects the smallest currency unit.
          // For THB the smallest unit is satang (1 THB = 100 satang).
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/booking/cancel`,
    customer_email: customerEmail || undefined,
    metadata: {
      bookingId: String(bookingId),
      type,
      amount: String(amount),
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return { url: session.url, sessionId: session.id };
}

/**
 * Verify and process a Stripe webhook event.
 *
 * Call this from an Express route that receives the raw body and
 * the `stripe-signature` header.
 *
 * @param payload - Raw request body (Buffer or string)
 * @param signature - Stripe-Signature header value
 * @returns Processed event type and metadata
 */
export async function handleWebhook(
  payload: string | Buffer,
  signature: string,
): Promise<{
  type: string;
  bookingId?: number;
  amount?: number;
  sessionId?: string;
  paymentType?: string;
}> {
  const stripe = ensureStripe();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error(
      "Stripe webhook handler not yet configured. Set STRIPE_WEBHOOK_SECRET to enable."
    );
  }

  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId
        ? Number(session.metadata.bookingId)
        : undefined;
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      const paymentType = session.metadata?.type;

      return {
        type: "payment_completed",
        bookingId,
        amount,
        sessionId: session.id,
        paymentType,
      };
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        type: "payment_expired",
        bookingId: session.metadata?.bookingId
          ? Number(session.metadata.bookingId)
          : undefined,
        sessionId: session.id,
      };
    }

    default:
      return { type: event.type };
  }
}

/**
 * Get the status of a Stripe Checkout Session.
 *
 * @param sessionId - Stripe Checkout Session ID
 * @returns Session status and payment details
 */
export async function getSessionStatus(
  sessionId: string,
): Promise<{
  status: string;
  paymentStatus: string;
  amountPaid?: number;
  customerEmail?: string;
  bookingId?: number;
}> {
  const stripe = ensureStripe();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return {
    status: session.status ?? "unknown",
    paymentStatus: session.payment_status,
    amountPaid: session.amount_total ? session.amount_total / 100 : undefined,
    customerEmail: session.customer_email ?? undefined,
    bookingId: session.metadata?.bookingId
      ? Number(session.metadata.bookingId)
      : undefined,
  };
}

/**
 * Create a refund for a completed payment.
 *
 * @param paymentIntentId - Stripe PaymentIntent ID from the original charge
 * @param amount - Optional partial refund amount in THB. If omitted, full refund.
 * @returns Refund details
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
): Promise<{ refundId: string; status: string; amount: number }> {
  const stripe = ensureStripe();

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? amount * 100 : undefined, // full refund if no amount
  });

  return {
    refundId: refund.id,
    status: refund.status ?? "unknown",
    amount: refund.amount / 100,
  };
}
