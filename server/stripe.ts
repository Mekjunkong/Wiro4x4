/**
 * Stripe Integration — Placeholder Module
 *
 * This module is a placeholder for future Stripe Checkout integration.
 * Currently, the payments table exists in the database and read-only
 * tRPC procedures are available (payment.listByBooking, payment.listAll,
 * payment.stats). Full Stripe integration will be added once credentials
 * are configured.
 *
 * Prerequisites:
 *   1. Set STRIPE_SECRET_KEY in environment variables
 *   2. Set STRIPE_WEBHOOK_SECRET for webhook verification
 *   3. Set VITE_STRIPE_PUBLISHABLE_KEY for frontend
 *
 * Integration plan:
 *   - Stripe Checkout Sessions (hosted page = zero PCI burden)
 *   - Deposit + balance model: 2 separate checkout sessions per booking
 *   - Webhook handler for payment confirmation
 */

// TODO: Install stripe package when ready: pnpm add stripe
// import Stripe from 'stripe';

// TODO: Initialize Stripe client
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });

/**
 * Create a Stripe Checkout Session for a booking deposit or balance payment.
 *
 * TODO: Implement when Stripe credentials are available
 *
 * @param bookingId - The booking to create payment for
 * @param amount - Amount in THB (smallest currency unit)
 * @param type - "deposit" | "balance" | "full"
 * @returns Checkout session URL to redirect customer to
 */
export async function createCheckoutSession(
  bookingId: number,
  amount: number,
  type: "deposit" | "balance" | "full",
): Promise<{ url: string; sessionId: string }> {
  // TODO: Replace with actual Stripe Checkout Session creation
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   line_items: [{
  //     price_data: {
  //       currency: 'thb',
  //       product_data: { name: `WIRO 4x4 Tour - ${type} payment` },
  //       unit_amount: amount * 100, // Stripe uses smallest currency unit
  //     },
  //     quantity: 1,
  //   }],
  //   mode: 'payment',
  //   success_url: `${process.env.APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
  //   cancel_url: `${process.env.APP_URL}/booking/cancel`,
  //   metadata: { bookingId: String(bookingId), type },
  // });
  // return { url: session.url!, sessionId: session.id };

  throw new Error("Stripe integration not yet configured. Set STRIPE_SECRET_KEY to enable payments.");
}

/**
 * Verify and process a Stripe webhook event.
 *
 * TODO: Implement when Stripe credentials are available
 *
 * @param payload - Raw request body
 * @param signature - Stripe-Signature header value
 * @returns Processed event type and metadata
 */
export async function handleWebhook(
  payload: string,
  signature: string,
): Promise<{ type: string; bookingId?: number; amount?: number }> {
  // TODO: Replace with actual webhook verification
  // const event = stripe.webhooks.constructEvent(
  //   payload,
  //   signature,
  //   process.env.STRIPE_WEBHOOK_SECRET!,
  // );
  //
  // switch (event.type) {
  //   case 'checkout.session.completed': {
  //     const session = event.data.object;
  //     const bookingId = Number(session.metadata?.bookingId);
  //     const amount = session.amount_total ? session.amount_total / 100 : 0;
  //     // Update payment record in database
  //     // await updatePaymentBySessionId(session.id, { status: 'completed', paidAt: new Date() });
  //     return { type: 'payment_completed', bookingId, amount };
  //   }
  //   case 'checkout.session.expired':
  //     return { type: 'payment_expired' };
  //   default:
  //     return { type: event.type };
  // }

  throw new Error("Stripe webhook handler not yet configured. Set STRIPE_WEBHOOK_SECRET to enable.");
}

/**
 * Get the status of a Stripe Checkout Session.
 *
 * TODO: Implement when Stripe credentials are available
 *
 * @param sessionId - Stripe Checkout Session ID
 * @returns Session status and payment details
 */
export async function getSessionStatus(
  sessionId: string,
): Promise<{ status: string; amountPaid?: number }> {
  // TODO: Replace with actual session retrieval
  // const session = await stripe.checkout.sessions.retrieve(sessionId);
  // return {
  //   status: session.payment_status,
  //   amountPaid: session.amount_total ? session.amount_total / 100 : undefined,
  // };

  throw new Error("Stripe integration not yet configured. Set STRIPE_SECRET_KEY to enable payments.");
}
