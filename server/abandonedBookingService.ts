import {
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_WHATSAPP,
  COMPANY_WEBSITE,
  EMAIL_SENDERS,
} from "@shared/const";
import { escapeHtml } from "@shared/escapeHtml";
import { captureException } from "./sentry";
import type { Lead } from "../drizzle/schema";

// Lazily initialize Resend so tests don't crash when RESEND_API_KEY is unset
let _resend: any = null;
function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[AbandonedBooking] No RESEND_API_KEY — emails will not be sent"
      );
      return null;
    }
    const { Resend } = require("resend");
    _resend = new Resend(apiKey);
  }
  return _resend;
}

const SENDER = `${COMPANY_NAME} <${EMAIL_SENDERS.updates}>`;

/**
 * Build a bilingual (EN/HE) recovery email for an abandoned lead.
 */
function buildRecoveryEmailHtml(lead: Lead): string {
  const name = escapeHtml(lead.name) || "Traveler";
  const inquiryNote =
    lead.message || lead.notes
      ? `<p style="background: #fff8e1; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #f5a623; font-style: italic; margin: 20px 0;">"${escapeHtml(lead.message || lead.notes)}"</p>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🚙 WIRO 4x4</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Still planning your Chiang Mai adventure?</p>
    </div>

    <!-- English Content -->
    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
      <p style="font-size: 16px;">Dear ${name},</p>

      <p>We noticed you recently inquired about a tour with us but haven't booked yet. We'd love to help you plan the perfect Chiang Mai adventure!</p>

      ${inquiryNote}

      <h3 style="color: #1a4d2e; margin-top: 25px;">Why travelers choose WIRO 4x4:</h3>

      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr>
          <td style="padding: 12px; vertical-align: top; width: 40px;">🍽️</td>
          <td style="padding: 12px;">
            <strong>Certified Kosher Meals</strong><br>
            <span style="color: #666;">Enjoy authentic kosher dining throughout your journey — carefully prepared and certified.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; vertical-align: top; width: 40px;">🗣️</td>
          <td style="padding: 12px;">
            <strong>Hebrew-Speaking Guide</strong><br>
            <span style="color: #666;">Your personal guide speaks fluent Hebrew and knows every hidden gem in Northern Thailand.</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; vertical-align: top; width: 40px;">🎯</td>
          <td style="padding: 12px;">
            <strong>Custom Itineraries</strong><br>
            <span style="color: #666;">Every trip is tailored to your group — from family-friendly to extreme off-road adventures.</span>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${COMPANY_WEBSITE}/booking" style="display: inline-block; background: #f5a623; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Book Your Adventure
        </a>
      </div>

      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d6a4f; text-align: center;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #1a4d2e;">Have questions? Chat with us instantly!</p>
        <a href="https://wa.me/${COMPANY_WHATSAPP}" style="display: inline-block; background: #25d366; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          💬 WhatsApp Us
        </a>
      </div>

      <!-- Hebrew Section -->
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

      <div dir="rtl" style="text-align: right;">
        <p style="font-size: 16px;">שלום ${name},</p>

        <p>שמנו לב שהתעניינת לאחרונה בטיול איתנו אך עדיין לא הזמנת. נשמח לעזור לך לתכנן את ההרפתקה המושלמת בצ'יאנג מאי!</p>

        <h3 style="color: #1a4d2e;">למה מטיילים בוחרים ב-WIRO 4x4:</h3>

        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 12px;">
              <strong>ארוחות כשרות מוסמכות</strong> — הנאה מאוכל כשר לאורך כל המסע 🍽️
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <strong>מדריך דובר עברית</strong> — המדריך האישי שלך דובר עברית שוטפת 🗣️
            </td>
          </tr>
          <tr>
            <td style="padding: 12px;">
              <strong>מסלולים מותאמים אישית</strong> — כל טיול מותאם לקבוצה שלך 🎯
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${COMPANY_WEBSITE}/booking" style="display: inline-block; background: #f5a623; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
            הזמינו עכשיו
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>${COMPANY_NAME}</strong><br>
        Chiang Mai, Thailand<br>
        ${COMPANY_PHONE}
      </p>
      <p style="margin: 15px 0 0 0; font-size: 11px; color: #999;">
        You received this email because you inquired about a tour on our website.
        If you no longer wish to receive these emails, simply ignore this message — we won't send another.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send a recovery email to an abandoned lead.
 * Returns true if sent successfully.
 */
export async function sendAbandonedBookingEmail(lead: Lead): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn("[AbandonedBooking] Resend not configured, skipping email");
      return false;
    }

    if (!lead.email) {
      console.warn(
        `[AbandonedBooking] Lead #${lead.id} has no email, skipping`
      );
      return false;
    }

    const html = buildRecoveryEmailHtml(lead);

    const { data, error } = await resend.emails.send({
      from: SENDER,
      to: [lead.email],
      subject:
        "Still planning your Chiang Mai adventure? 🚙 | עדיין מתכננים הרפתקה בצ'יאנג מאי?",
      html,
    });

    if (error) {
      console.error(
        `[AbandonedBooking] Failed to send to ${lead.email}:`,
        error
      );
      captureException(error);
      return false;
    }

    console.log(
      `[AbandonedBooking] Recovery email sent to ${lead.email}. ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error("[AbandonedBooking] Error sending recovery email:", error);
    captureException(error);
    return false;
  }
}
