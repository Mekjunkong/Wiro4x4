import { Resend } from "resend";
import { captureException } from "./sentry";

// Lazily initialize Resend so tests don't crash when RESEND_API_KEY is unset
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const SITE_URL = process.env.SITE_URL || "https://www.wiro4x4indochina.com";

export async function sendBookingRecoveryEmail(
  email: string,
  name: string,
  resumeToken: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[AbandonedBooking] Resend API key not configured, skipping email"
    );
    return false;
  }

  const resumeLink = `${SITE_URL}/book?token=${resumeToken}`;

  try {
    const { error } = await resend.emails.send({
      from: "WIRO 4x4 <updates@wiro4x4indochina.com>",
      to: email,
      subject: "Complete your WIRO 4x4 booking",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi ${name || "there"},</p>
          <p>You started booking a tour with us but didn't finish. Your details are saved!</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="${resumeLink}" style="background:#D4AF37;color:#1C1C1C;padding:12px 24px;text-decoration:none;border-radius:99px;font-weight:bold;display:inline-block;">
              Continue Booking
            </a>
          </p>
          <p>Or reply to this email if you have any questions.</p>
          <p>— WIRO 4x4 Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("[AbandonedBooking] Failed to send recovery email:", error);
      captureException(error);
      return false;
    }

    console.log("[AbandonedBooking] Recovery email sent to", email);
    return true;
  } catch (error) {
    console.error("[AbandonedBooking] Error sending recovery email:", error);
    captureException(error);
    return false;
  }
}
