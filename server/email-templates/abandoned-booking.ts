import { Resend } from "resend";
import { captureException } from "../sentry";
import {
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_WHATSAPP_URL,
  EMAIL_SENDERS,
} from "@shared/const";

// Lazily initialize Resend so tests don't crash when RESEND_API_KEY is unset
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const SITE_URL = process.env.SITE_URL || "https://www.wiro4x4indochina.com";

// ── Brand Colors ──────────────────────────────────────────────────────
const FOREST_GREEN = "#2D5016";
const GOLD = "#E8B923";

export interface AbandonedBookingEmailData {
  customerEmail: string;
  customerName: string;
  resumeToken: string;
  isFirstTimeBooker: boolean;
  language: "en" | "he";
}

function getEnglishHtml(data: AbandonedBookingEmailData): string {
  const resumeLink = `${SITE_URL}/book?token=${data.resumeToken}`;
  const discountSection = data.isFirstTimeBooker
    ? `
      <div style="background: #FFF8E1; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid ${GOLD}; text-align: center;">
        <p style="font-size: 18px; font-weight: bold; color: ${FOREST_GREEN}; margin: 0 0 8px 0;">First-time Booker Discount!</p>
        <p style="font-size: 32px; font-weight: bold; color: ${GOLD}; margin: 0 0 8px 0;">10% OFF</p>
        <p style="font-size: 14px; color: #666; margin: 0;">Use code <strong style="color: ${FOREST_GREEN}; font-size: 16px;">WIRO10</strong> at checkout</p>
      </div>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f4f4f4;">
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, ${FOREST_GREEN} 0%, #4a7c2c 100%); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">WIRO 4x4</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Adventure Awaits!</p>
    </div>

    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
      <p style="font-size: 16px; color: #333;">Hi ${data.customerName || "there"},</p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        We noticed you started planning your off-road adventure with us but didn't finish your booking.
        No worries -- your details are saved and ready for you to pick up where you left off!
      </p>

      ${discountSection}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resumeLink}" style="display: inline-block; background: ${GOLD}; color: #1C1C1C; padding: 16px 32px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 16px;">
          Complete My Booking
        </a>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0;">Prefer to chat? Reach us directly on WhatsApp:</p>
        <a href="${COMPANY_WHATSAPP_URL}" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 14px;">
          Chat on WhatsApp
        </a>
      </div>

      <p style="font-size: 14px; color: #888; line-height: 1.6; margin-top: 24px;">
        If you have any questions about our tours, pricing, or kosher meal options, we're happy to help!
      </p>
    </div>

    <div style="background: ${FOREST_GREEN}; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
      <p style="margin: 0; font-size: 14px;">${COMPANY_NAME}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">Chiang Mai, Thailand | ${COMPANY_PHONE}</p>
    </div>
  </div>
</body>
</html>`;
}

function getHebrewHtml(data: AbandonedBookingEmailData): string {
  const resumeLink = `${SITE_URL}/book?token=${data.resumeToken}`;
  const discountSection = data.isFirstTimeBooker
    ? `
      <div style="background: #FFF8E1; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid ${GOLD}; text-align: center;">
        <p style="font-size: 18px; font-weight: bold; color: ${FOREST_GREEN}; margin: 0 0 8px 0;">הנחה למזמינים חדשים!</p>
        <p style="font-size: 32px; font-weight: bold; color: ${GOLD}; margin: 0 0 8px 0;">10% הנחה</p>
        <p style="font-size: 14px; color: #666; margin: 0;">השתמשו בקוד <strong style="color: ${FOREST_GREEN}; font-size: 16px;">WIRO10</strong> בעת ההזמנה</p>
      </div>`
    : "";

  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f4f4f4;">
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, ${FOREST_GREEN} 0%, #4a7c2c 100%); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">WIRO 4x4</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">ההרפתקה שלכם מחכה!</p>
    </div>

    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; direction: rtl; text-align: right;">
      <p style="font-size: 16px; color: #333;">שלום ${data.customerName || ""},</p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        שמנו לב שהתחלתם לתכנן את טיול השטח שלכם איתנו אבל לא סיימתם את ההזמנה.
        אל דאגה -- הפרטים שלכם שמורים ומחכים שתמשיכו מאיפה שהפסקתם!
      </p>

      ${discountSection}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resumeLink}" style="display: inline-block; background: ${GOLD}; color: #1C1C1C; padding: 16px 32px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 16px;">
          להשלים את ההזמנה
        </a>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0;">מעדיפים לדבר? פנו אלינו ישירות בוואטסאפ:</p>
        <a href="${COMPANY_WHATSAPP_URL}" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 14px;">
          שיחה בוואטסאפ
        </a>
      </div>

      <p style="font-size: 14px; color: #888; line-height: 1.6; margin-top: 24px;">
        אם יש לכם שאלות לגבי הטיולים, המחירים או אפשרויות האוכל הכשר, נשמח לעזור!
      </p>
    </div>

    <div style="background: ${FOREST_GREEN}; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
      <p style="margin: 0; font-size: 14px;">${COMPANY_NAME}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">צ'יאנג מאי, תאילנד | ${COMPANY_PHONE}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send abandoned booking recovery email (bilingual)
 * Trigger: 24 hours after booking started but not completed
 */
export async function sendAbandonedBookingEmail(
  data: AbandonedBookingEmailData
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[AbandonedBooking] Resend API key not configured, skipping email"
      );
      return false;
    }

    const isHebrew = data.language === "he";
    const html = isHebrew ? getHebrewHtml(data) : getEnglishHtml(data);
    const subject = isHebrew
      ? "השלימו את ההזמנה שלכם ב-WIRO 4x4"
      : "Complete your WIRO 4x4 booking";

    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${EMAIL_SENDERS.updates}>`,
      to: data.customerEmail,
      subject,
      html,
    });

    if (error) {
      console.error("[AbandonedBooking] Failed to send recovery email:", error);
      captureException(error);
      return false;
    }

    console.log(
      `[AbandonedBooking] Recovery email sent to ${data.customerEmail}`
    );
    return true;
  } catch (error) {
    console.error("[AbandonedBooking] Error sending recovery email:", error);
    captureException(error);
    return false;
  }
}
