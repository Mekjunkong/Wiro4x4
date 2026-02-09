/**
 * Payment Service Layer
 *
 * Orchestrates Stripe operations with DB persistence and email notifications.
 * Uses functions from stripe.ts (Stripe API) and db.ts (database helpers).
 */

import {
  createCheckoutSession,
  getSessionStatus,
  createRefund,
} from "./stripe";
import {
  getBookingById,
  getPaymentsByBookingId,
  getPaymentById,
  createPayment,
  getPaymentBySessionId,
  updatePayment,
  updateBooking,
} from "./db";
import { sendPaymentConfirmationEmail } from "./customerEmailService";

/**
 * Initiate a Stripe Checkout session for a booking payment.
 *
 * Validates the booking exists and prevents duplicate pending payments
 * of the same type before creating a checkout session and DB record.
 */
export async function initiateCheckout(
  bookingId: number,
  amount: number,
  type: "deposit" | "balance" | "full",
  customerEmail?: string
): Promise<{ url: string; sessionId: string }> {
  // Validate booking exists
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error(`Booking #${bookingId} not found`);
  }

  // Prevent duplicate pending payments of the same type
  const existingPayments = await getPaymentsByBookingId(bookingId);
  const hasPendingDuplicate = existingPayments.some(
    p => p.type === type && p.status === "pending"
  );
  if (hasPendingDuplicate) {
    throw new Error(
      `A pending ${type} payment already exists for booking #${bookingId}`
    );
  }

  // Create Stripe checkout session
  const { url, sessionId } = await createCheckoutSession(
    bookingId,
    amount,
    type,
    customerEmail
  );

  // Create pending payment record in DB
  await createPayment({
    bookingId,
    type,
    amount,
    stripeSessionId: sessionId,
    status: "pending",
    paymentMethod: "card",
  });

  return { url, sessionId };
}

/**
 * Verify a Stripe Checkout session and mark payment as completed.
 *
 * Idempotent — if the payment is already completed, returns the existing
 * record without updating or sending duplicate emails.
 */
export async function verifyAndCompleteSession(sessionId: string): Promise<{
  status: string;
  paymentStatus: string;
  amountPaid?: number;
  bookingId?: number;
  alreadyCompleted: boolean;
}> {
  // Check if we already processed this session
  const existingPayment = await getPaymentBySessionId(sessionId);
  if (existingPayment && existingPayment.status === "completed") {
    return {
      status: "complete",
      paymentStatus: "paid",
      amountPaid: existingPayment.amount,
      bookingId: existingPayment.bookingId,
      alreadyCompleted: true,
    };
  }

  // Get session status from Stripe
  const session = await getSessionStatus(sessionId);

  if (session.paymentStatus === "paid" && existingPayment) {
    // Update payment record to completed
    await updatePayment(existingPayment.id, {
      status: "completed",
      paidAt: new Date(),
    });

    // Update booking paid flags
    if (existingPayment.type === "deposit") {
      await updateBooking(existingPayment.bookingId, {
        depositPaid: 1,
      });
    } else if (
      existingPayment.type === "balance" ||
      existingPayment.type === "full"
    ) {
      await updateBooking(existingPayment.bookingId, {
        balancePaid: 1,
      });
    }

    // Send payment confirmation email
    const booking = await getBookingById(existingPayment.bookingId);
    if (booking) {
      await sendPaymentConfirmationEmail({
        customerName: booking.contactName,
        customerEmail: booking.contactEmail,
        amount: existingPayment.amount,
        type: existingPayment.type,
        bookingId: existingPayment.bookingId,
      }).catch(err => {
        console.error(
          "[StripeService] Failed to send confirmation email:",
          err
        );
      });
    }
  }

  return {
    status: session.status,
    paymentStatus: session.paymentStatus,
    amountPaid: session.amountPaid,
    bookingId: session.bookingId,
    alreadyCompleted: false,
  };
}

/**
 * Process a refund for a completed payment.
 *
 * Creates the refund via Stripe, records it in the DB as a new payment
 * record of type "refund", and updates the original payment status.
 */
export async function processRefund(
  paymentId: number,
  amount?: number,
  reason?: string
): Promise<{ refundId: string; status: string; amount: number }> {
  // Find the original payment
  const originalPayment = await getPaymentById(paymentId);

  if (!originalPayment) {
    throw new Error(`Payment #${paymentId} not found`);
  }

  if (originalPayment.status !== "completed") {
    throw new Error(
      `Payment #${paymentId} is not completed (status: ${originalPayment.status})`
    );
  }

  if (!originalPayment.stripePaymentIntentId) {
    throw new Error(
      `Payment #${paymentId} has no Stripe PaymentIntent ID for refund`
    );
  }

  const refundAmount = amount || originalPayment.amount;

  // Process refund via Stripe
  const refundResult = await createRefund(
    originalPayment.stripePaymentIntentId,
    amount
  );

  // Create refund record in DB
  await createPayment({
    bookingId: originalPayment.bookingId,
    type: "refund",
    amount: refundAmount,
    status: "completed",
    stripePaymentIntentId: refundResult.refundId,
    paymentMethod: "card",
    notes: reason || undefined,
    paidAt: new Date(),
  });

  // Update original payment status to refunded
  await updatePayment(paymentId, {
    status: "refunded",
  });

  return refundResult;
}
