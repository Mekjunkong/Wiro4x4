import { Resend } from "resend";
import { captureException } from "../sentry";
import {
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_WHATSAPP_URL,
  COMPANY_FACEBOOK_URL,
  COMPANY_INSTAGRAM_URL,
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

export interface PostTripFollowupEmailData {
  customerEmail: string;
  customerName: string;
  tourName: string;
  referralCode: string; // unique per customer, e.g., "REF-JOHND-15"
  language: "en" | "he";
}

function getEnglishHtml(data: PostTripFollowupEmailData): string {
  const reviewUrl = `${SITE_URL}/reviews`;
  const galleryUrl = `${SITE_URL}/gallery`;

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
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank You for Your Adventure!</p>
    </div>

    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
      <p style="font-size: 16px; color: #333;">Hi ${data.customerName},</p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Thank you for joining us on the <strong>${data.tourName}</strong>! We hope you had an unforgettable experience exploring the beauty of Northern Thailand.
      </p>

      <!-- Review Request -->
      <div style="background: #FFF8E1; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center; border: 2px solid ${GOLD};">
        <h2 style="margin: 0 0 8px 0; color: ${FOREST_GREEN}; font-size: 20px;">Share Your Experience</h2>
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">Your review helps other travelers discover our tours and helps us improve!</p>
        <a href="${reviewUrl}" style="display: inline-block; background: ${GOLD}; color: #1C1C1C; padding: 14px 28px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 16px;">
          Leave a Review
        </a>
      </div>

      <!-- Photo Sharing -->
      <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid ${FOREST_GREEN};">
        <h3 style="margin: 0 0 8px 0; color: ${FOREST_GREEN}; font-size: 16px;">Got Great Photos?</h3>
        <p style="margin: 0 0 12px 0; color: #333; font-size: 14px;">
          We'd love to see your best shots! Share them with us on WhatsApp or tag us on social media, and we may feature them in our
          <a href="${galleryUrl}" style="color: ${FOREST_GREEN};">gallery</a>.
        </p>
        <a href="${COMPANY_WHATSAPP_URL}" style="display: inline-block; background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          Share Photos on WhatsApp
        </a>
      </div>

      <!-- Referral Discount -->
      <div style="background: linear-gradient(135deg, ${FOREST_GREEN} 0%, #4a7c2c 100%); padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center; color: white;">
        <h2 style="margin: 0 0 8px 0; font-size: 20px;">Refer a Friend, Get Rewarded!</h2>
        <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">Share your unique referral code with friends and they'll receive:</p>
        <p style="margin: 0 0 4px 0; font-size: 36px; font-weight: bold; color: ${GOLD};">15% OFF</p>
        <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">their first booking with us</p>
        <div style="background: rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 8px; display: inline-block;">
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">Your Referral Code</p>
          <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.referralCode}</p>
        </div>
      </div>

      <!-- Social Media -->
      <div style="text-align: center; margin: 24px 0; padding: 20px 0; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0;">Stay connected with us:</p>
        <div>
          <a href="${COMPANY_FACEBOOK_URL}" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #1877F2; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">Facebook</a>
          <a href="${COMPANY_INSTAGRAM_URL}" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #E1306C; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">Instagram</a>
          <a href="${COMPANY_WHATSAPP_URL}" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #25D366; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">WhatsApp</a>
        </div>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        We hope to welcome you back for another adventure soon!
      </p>

      <p style="font-size: 16px; color: #333; margin-top: 24px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em style="color: #666;">Kosher Off-Road Adventures in Chiang Mai</em>
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

function getHebrewHtml(data: PostTripFollowupEmailData): string {
  const reviewUrl = `${SITE_URL}/reviews`;
  const galleryUrl = `${SITE_URL}/gallery`;

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
      <p style="margin: 10px 0 0 0; opacity: 0.9;">תודה על ההרפתקה!</p>
    </div>

    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; direction: rtl; text-align: right;">
      <p style="font-size: 16px; color: #333;">שלום ${data.customerName},</p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        תודה שהצטרפתם אלינו ל<strong>${data.tourName}</strong>! אנחנו מקווים שנהניתם מחוויה בלתי נשכחת בצפון תאילנד.
      </p>

      <!-- Review Request -->
      <div style="background: #FFF8E1; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center; border: 2px solid ${GOLD};">
        <h2 style="margin: 0 0 8px 0; color: ${FOREST_GREEN}; font-size: 20px;">שתפו את החוויה שלכם</h2>
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">הביקורת שלכם עוזרת למטיילים אחרים לגלות את הטיולים שלנו ולנו להשתפר!</p>
        <a href="${reviewUrl}" style="display: inline-block; background: ${GOLD}; color: #1C1C1C; padding: 14px 28px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 16px;">
          כתבו ביקורת
        </a>
      </div>

      <!-- Photo Sharing -->
      <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 24px 0; border-right: 4px solid ${FOREST_GREEN};">
        <h3 style="margin: 0 0 8px 0; color: ${FOREST_GREEN}; font-size: 16px;">יש לכם תמונות מדהימות?</h3>
        <p style="margin: 0 0 12px 0; color: #333; font-size: 14px;">
          נשמח לראות את הצילומים הכי טובים שלכם! שלחו לנו בוואטסאפ או תייגו אותנו ברשתות החברתיות, ואולי נציג אותן ב<a href="${galleryUrl}" style="color: ${FOREST_GREEN};">גלריה</a> שלנו.
        </p>
        <a href="${COMPANY_WHATSAPP_URL}" style="display: inline-block; background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          שיתוף תמונות בוואטסאפ
        </a>
      </div>

      <!-- Referral Discount -->
      <div style="background: linear-gradient(135deg, ${FOREST_GREEN} 0%, #4a7c2c 100%); padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center; color: white;">
        <h2 style="margin: 0 0 8px 0; font-size: 20px;">הפנו חבר, קבלו הטבה!</h2>
        <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">שתפו את קוד ההפניה שלכם עם חברים והם יקבלו:</p>
        <p style="margin: 0 0 4px 0; font-size: 36px; font-weight: bold; color: ${GOLD};">15% הנחה</p>
        <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">על ההזמנה הראשונה שלהם</p>
        <div style="background: rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 8px; display: inline-block;">
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">קוד ההפניה שלכם</p>
          <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.referralCode}</p>
        </div>
      </div>

      <!-- Social Media -->
      <div style="text-align: center; margin: 24px 0; padding: 20px 0; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0;">הישארו מחוברים אלינו:</p>
        <div>
          <a href="${COMPANY_FACEBOOK_URL}" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #1877F2; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">פייסבוק</a>
          <a href="${COMPANY_INSTAGRAM_URL}" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #E1306C; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">אינסטגרם</a>
          <a href="${COMPANY_WHATSAPP_URL}" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: #25D366; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">וואטסאפ</a>
        </div>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        מקווים לארח אתכם שוב בהרפתקה נוספת בקרוב!
      </p>

      <p style="font-size: 16px; color: #333; margin-top: 24px;">
        <strong>צוות WIRO 4x4</strong><br>
        <em style="color: #666;">הרפתקאות שטח כשרות בצ'יאנג מאי</em>
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
 * Send post-trip follow-up email (bilingual)
 * Trigger: 2 days after trip completion
 */
export async function sendPostTripFollowupEmail(
  data: PostTripFollowupEmailData
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[PostTripFollowup] Resend API key not configured, skipping email"
      );
      return false;
    }

    const isHebrew = data.language === "he";
    const html = isHebrew ? getHebrewHtml(data) : getEnglishHtml(data);
    const subject = isHebrew
      ? `איך הייתה ההרפתקה שלכם? - ${data.tourName}`
      : `How was your adventure? - ${data.tourName}`;

    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${EMAIL_SENDERS.support}>`,
      to: data.customerEmail,
      subject,
      html,
    });

    if (error) {
      console.error("[PostTripFollowup] Failed to send followup email:", error);
      captureException(error);
      return false;
    }

    console.log(
      `[PostTripFollowup] Follow-up email sent to ${data.customerEmail}`
    );
    return true;
  } catch (error) {
    console.error("[PostTripFollowup] Error sending followup email:", error);
    captureException(error);
    return false;
  }
}
