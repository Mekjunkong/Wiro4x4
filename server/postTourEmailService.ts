/**
 * Post-Tour Follow-up Email Service
 *
 * Sends a "How was your trip?" email 2 days after a tour ends.
 * Includes review link, trip album link (if available), and booking next trip CTA.
 * Bilingual: English/Hebrew.
 */

import { Resend } from "resend";
import { captureException } from "./sentry";
import {
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_SENDER_EMAIL,
  COMPANY_WHATSAPP,
  COMPANY_WEBSITE,
} from "@shared/const";
import { escapeHtml } from "@shared/escapeHtml";
import type { Booking } from "../drizzle/schema";
import {
  getEligiblePostTourBookings,
  getAlbumByBookingId,
  markPostTourEmailSent,
} from "./db";

// Lazily initialize Resend so tests don't crash when RESEND_API_KEY is unset
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const SENDER_EMAIL = COMPANY_SENDER_EMAIL;

interface PostTourEmailOptions {
  booking: Booking;
  albumToken?: string | null;
}

/**
 * Generate the bilingual HTML email for post-tour follow-up.
 */
export function generatePostTourEmailHtml({
  booking,
  albumToken,
}: PostTourEmailOptions): string {
  const customerName = escapeHtml(booking.contactName);
  const tourDate = booking.departureDate
    ? new Date(booking.departureDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const tourDateHe = booking.departureDate
    ? new Date(booking.departureDate).toLocaleDateString("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const reviewUrl = `${COMPANY_WEBSITE}/reviews`;
  const albumUrl = albumToken ? `${COMPANY_WEBSITE}/album/${albumToken}` : null;
  const bookNextUrl = `${COMPANY_WEBSITE}/packages`;
  const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent("Hi WIRO 4x4! I just completed my tour and wanted to share feedback.")}`;
  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=ChIJByjTCcj1dDAR_WIRO4x4`;

  // Star rating visual (links to reviews page)
  const starRating = [1, 2, 3, 4, 5]
    .map(
      n =>
        `<a href="${reviewUrl}" style="text-decoration:none;font-size:32px;color:#f5a623;" title="${n} stars">&#9733;</a>`
    )
    .join("");

  const albumSection = albumUrl
    ? `
      <div style="background:#e3f2fd;padding:20px;border-radius:8px;margin:25px 0;border-left:4px solid #1976d2;text-align:center;">
        <h3 style="margin-top:0;color:#1976d2;">📸 Your Adventure Photos Are Ready!</h3>
        <p style="color:#333;">We've curated the best moments from your trip. View and download your personal photo album:</p>
        <a href="${albumUrl}" style="display:inline-block;background:#1976d2;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">View Your Photos</a>
      </div>
      <div dir="rtl" style="background:#e3f2fd;padding:20px;border-radius:8px;margin:25px 0;border-left:none;border-right:4px solid #1976d2;text-align:center;">
        <h3 style="margin-top:0;color:#1976d2;">📸 תמונות ההרפתקה שלכם מוכנות!</h3>
        <p style="color:#333;">אספנו את הרגעים הטובים ביותר מהטיול שלכם. צפו והורידו את אלבום התמונות האישי:</p>
        <a href="${albumUrl}" style="display:inline-block;background:#1976d2;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">צפו בתמונות</a>
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 35px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 26px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
    .content { background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
    .review-box { background: #fff8e1; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f5a623; text-align: center; }
    .cta-button { display: inline-block; background: #f5a623; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; font-size: 16px; }
    .cta-button:hover { background: #e6951a; }
    .google-button { display: inline-block; background: #4285f4; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; font-size: 14px; }
    .next-trip { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4a7c2c; text-align: center; }
    .whatsapp-link { background: #25d366; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px 0; }
    .divider { border: none; border-top: 1px solid #eee; margin: 30px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- English Section -->
    <div class="header">
      <h1>How Was Your Adventure? 🌿</h1>
      <p>We'd love to hear about your experience!</p>
    </div>

    <div class="content">
      <p>Dear ${escapeHtml(customerName)},</p>

      <p>We hope you had an incredible time on your tour with <strong>WIRO 4x4</strong>${tourDate ? ` on ${tourDate}` : ""}! The mountains, waterfalls, and hidden trails of Northern Thailand are truly special, and we're so glad we got to share them with you.</p>

      <p>Your feedback means the world to us and helps other travelers discover our tours. Would you take a moment to rate your experience?</p>

      <!-- Star Rating -->
      <div class="review-box">
        <p style="font-size:18px;font-weight:bold;color:#2d5016;margin-bottom:10px;">How would you rate your trip?</p>
        <div style="margin:15px 0;">${starRating}</div>
        <p style="font-size:14px;color:#666;margin-bottom:15px;">Tap a star or click below to leave a detailed review</p>
        <a href="${reviewUrl}" class="cta-button">Leave a Review</a>
      </div>

      <!-- Google Reviews -->
      <div style="text-align:center;margin:20px 0;">
        <p style="font-size:14px;color:#666;">Also help us on Google:</p>
        <a href="${googleReviewUrl}" class="google-button">⭐ Review on Google</a>
      </div>

      ${albumSection}

      <!-- Book Next Trip -->
      <div class="next-trip">
        <h3 style="margin-top:0;color:#2d5016;">Ready for Your Next Adventure?</h3>
        <p>Explore our multi-day packages and discover more of Northern Thailand's hidden gems.</p>
        <a href="${bookNextUrl}" style="display:inline-block;background:#2d5016;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">Explore Packages</a>
      </div>

      <!-- WhatsApp -->
      <div style="text-align:center;margin:20px 0;">
        <p style="font-size:14px;color:#666;">Prefer to share feedback directly?</p>
        <a href="${whatsappUrl}" class="whatsapp-link">💬 Chat on WhatsApp</a>
      </div>

      <p>Thank you for being part of the WIRO 4x4 family. We hope to see you again!</p>

      <p style="margin-top:30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>

      <hr class="divider">

      <!-- Hebrew Section -->
      <div dir="rtl" style="text-align:right;">
        <h2 style="color:#2d5016;">?איך היה הטיול 🌿</h2>
        <p>${escapeHtml(customerName)} היקר/ה,</p>

        <p>אנחנו מקווים שנהניתם מהטיול עם <strong>WIRO 4x4</strong>${tourDateHe ? ` ב-${tourDateHe}` : ""}! ההרים, המפלים והשבילים הנסתרים של צפון תאילנד הם באמת מיוחדים, ואנחנו שמחים שזכינו לחלוק אותם איתכם.</p>

        <p>המשוב שלכם חשוב לנו מאוד ועוזר למטיילים אחרים לגלות את הטיולים שלנו. תוכלו להקדיש רגע לדרג את החוויה?</p>

        <div style="background:#fff8e1;padding:25px;border-radius:8px;margin:25px 0;border-right:4px solid #f5a623;border-left:none;text-align:center;">
          <p style="font-size:18px;font-weight:bold;color:#2d5016;margin-bottom:10px;">איך הייתם מדרגים את הטיול?</p>
          <div style="margin:15px 0;">${starRating}</div>
          <a href="${reviewUrl}" class="cta-button">השאירו חוות דעת</a>
        </div>

        <div style="text-align:center;margin:20px 0;">
          <p style="font-size:14px;color:#666;">עזרו לנו גם בגוגל:</p>
          <a href="${googleReviewUrl}" class="google-button">⭐ חוות דעת בגוגל</a>
        </div>

        <div style="background:#e8f5e9;padding:20px;border-radius:8px;margin:25px 0;border-right:4px solid #4a7c2c;border-left:none;text-align:center;">
          <h3 style="margin-top:0;color:#2d5016;">מוכנים להרפתקה הבאה?</h3>
          <p>גלו את חבילות הטיולים שלנו וחקרו עוד מהאוצרות הנסתרים של צפון תאילנד.</p>
          <a href="${bookNextUrl}" style="display:inline-block;background:#2d5016;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">גלו חבילות</a>
        </div>

        <div style="text-align:center;margin:20px 0;">
          <a href="${whatsappUrl}" class="whatsapp-link">💬 שלחו הודעה בוואטסאפ</a>
        </div>

        <p>תודה שאתם חלק ממשפחת WIRO 4x4. נשמח לראותכם שוב!</p>

        <p style="margin-top:30px;">
          <strong>צוות WIRO 4x4</strong><br>
          <em>הרפתקאות שטח כשרות בצ'יאנג מאי</em>
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>${COMPANY_NAME}</strong></p>
      <p>Chiang Mai, Thailand</p>
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
      <p style="margin-top:10px;font-size:11px;color:#999;">
        This is an automated email sent 2 days after your tour. If you've already left a review, thank you!
        <br>You're receiving this because you booked a tour with WIRO 4x4.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send post-tour follow-up email for a single booking.
 */
export async function sendPostTourEmail(
  booking: Booking,
  albumToken?: string | null
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[PostTourEmail] Resend API key not configured, skipping email"
      );
      return false;
    }

    if (!booking.contactEmail) {
      console.warn(
        `[PostTourEmail] No email for booking #${booking.id}, skipping`
      );
      return false;
    }

    const html = generatePostTourEmailHtml({ booking, albumToken });

    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: [booking.contactEmail],
      subject: `How was your adventure? We'd love your feedback! | ?איך היה הטיול`,
      html,
    });

    if (error) {
      console.error(
        `[PostTourEmail] Error sending to ${booking.contactEmail}:`,
        error
      );
      captureException(error);
      return false;
    }

    console.log(
      `[PostTourEmail] Sent to ${booking.contactEmail} for booking #${booking.id}. ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error("[PostTourEmail] Error in sendPostTourEmail:", error);
    captureException(error);
    return false;
  }
}

/**
 * Check and send post-tour emails for all eligible bookings.
 * Called by the scheduler or manually from admin.
 * Limits to 10 per run to avoid rate limiting.
 */
export async function checkAndSendPostTourEmails(): Promise<{
  sent: number;
  failed: number;
  eligible: number;
}> {
  const results = { sent: 0, failed: 0, eligible: 0 };

  try {
    const eligibleBookings = await getEligiblePostTourBookings(10);
    results.eligible = eligibleBookings.length;

    for (const booking of eligibleBookings) {
      try {
        // Check if trip photo album exists for this booking
        const album = await getAlbumByBookingId(booking.id);
        const albumToken = album?.accessToken ?? null;

        const success = await sendPostTourEmail(booking, albumToken);

        if (success) {
          await markPostTourEmailSent(booking.id);
          results.sent++;
        } else {
          results.failed++;
        }
      } catch (err) {
        console.error(
          `[PostTourEmail] Failed for booking #${booking.id}:`,
          err
        );
        captureException(err);
        results.failed++;
      }
    }

    if (results.eligible > 0) {
      console.log(
        `[PostTourEmail] Processed ${results.eligible} bookings: ${results.sent} sent, ${results.failed} failed`
      );
    }
  } catch (err) {
    console.error("[PostTourEmail] Error in checkAndSendPostTourEmails:", err);
    captureException(err);
  }

  return results;
}
