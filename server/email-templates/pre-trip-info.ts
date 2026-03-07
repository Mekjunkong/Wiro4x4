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

// ── Brand Colors ──────────────────────────────────────────────────────
const FOREST_GREEN = "#2D5016";
const GOLD = "#E8B923";

export interface PreTripInfoEmailData {
  customerEmail: string;
  customerName: string;
  tourName: string;
  tripDate: string; // ISO date string
  meetingPoint: string;
  meetingPointMapUrl: string;
  pickupTime: string;
  weatherForecast?: string;
  includesKosherMeals: boolean;
  emergencyPhone: string;
  language: "en" | "he";
}

function formatTripDate(isoDate: string, lang: "en" | "he"): string {
  const date = new Date(isoDate);
  if (lang === "he") {
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getEnglishHtml(data: PreTripInfoEmailData): string {
  const formattedDate = formatTripDate(data.tripDate, "en");
  const weatherSection = data.weatherForecast
    ? `
      <div style="background: #E3F2FD; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #1976D2;">
        <h3 style="margin: 0 0 8px 0; color: #1565C0; font-size: 16px;">Weather Forecast</h3>
        <p style="margin: 0; color: #333; font-size: 14px;">${data.weatherForecast}</p>
      </div>`
    : "";

  const kosherSection = data.includesKosherMeals
    ? `
      <div style="background: #F3E5F5; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #7B1FA2;">
        <h3 style="margin: 0 0 8px 0; color: #6A1B9A; font-size: 16px;">Kosher Meals Confirmed</h3>
        <p style="margin: 0; color: #333; font-size: 14px;">Your kosher meal arrangements have been confirmed for this trip. If you have any specific dietary requirements beyond kosher, please let us know.</p>
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
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Trip is Coming Up!</p>
    </div>

    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
      <p style="font-size: 16px; color: #333;">Hi ${data.customerName},</p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Your <strong>${data.tourName}</strong> adventure is just 3 days away! Here's everything you need to know to be prepared.
      </p>

      <!-- Trip Details -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${GOLD};">
        <h2 style="margin: 0 0 12px 0; color: ${FOREST_GREEN}; font-size: 18px;">Trip Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 120px;">Date:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Pickup Time:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.pickupTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Meeting Point:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.meetingPoint}</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 16px;">
          <a href="${data.meetingPointMapUrl}" style="display: inline-block; background: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
            Open in Google Maps
          </a>
        </div>
      </div>

      ${weatherSection}
      ${kosherSection}

      <!-- What to Bring Checklist -->
      <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${FOREST_GREEN};">
        <h3 style="margin: 0 0 12px 0; color: ${FOREST_GREEN}; font-size: 16px;">What to Bring</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; Comfortable clothing and closed-toe shoes</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; Sunscreen (SPF 50+) and hat</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; Insect repellent</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; Camera or charged phone</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; Water bottle (we provide refills)</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; Light rain jacket (just in case)</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; Small backpack or daypack</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; Any personal medications</td></tr>
        </table>
      </div>

      <!-- Emergency Contacts -->
      <div style="background: #FFF3E0; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E65100;">
        <h3 style="margin: 0 0 8px 0; color: #E65100; font-size: 16px;">Emergency Contacts</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>WIRO 4x4:</strong> <a href="tel:${data.emergencyPhone}" style="color: ${FOREST_GREEN};">${data.emergencyPhone}</a></p>
        <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>WhatsApp:</strong> <a href="${COMPANY_WHATSAPP_URL}" style="color: ${FOREST_GREEN};">${COMPANY_PHONE}</a></p>
        <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>Thai Emergency:</strong> 1669 (Ambulance) / 191 (Police)</p>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        If you have any last-minute questions, don't hesitate to reach out. We look forward to an amazing adventure with you!
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

function getHebrewHtml(data: PreTripInfoEmailData): string {
  const formattedDate = formatTripDate(data.tripDate, "he");
  const weatherSection = data.weatherForecast
    ? `
      <div style="background: #E3F2FD; padding: 16px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #1976D2;">
        <h3 style="margin: 0 0 8px 0; color: #1565C0; font-size: 16px;">תחזית מזג האוויר</h3>
        <p style="margin: 0; color: #333; font-size: 14px;">${data.weatherForecast}</p>
      </div>`
    : "";

  const kosherSection = data.includesKosherMeals
    ? `
      <div style="background: #F3E5F5; padding: 16px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #7B1FA2;">
        <h3 style="margin: 0 0 8px 0; color: #6A1B9A; font-size: 16px;">ארוחות כשרות מאושרות</h3>
        <p style="margin: 0; color: #333; font-size: 14px;">הסידורים לארוחות כשרות בטיול שלכם אושרו. אם יש לכם דרישות תזונה ספציפיות מעבר לכשרות, אנא יידעו אותנו.</p>
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
      <p style="margin: 10px 0 0 0; opacity: 0.9;">הטיול שלכם מתקרב!</p>
    </div>

    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; direction: rtl; text-align: right;">
      <p style="font-size: 16px; color: #333;">שלום ${data.customerName},</p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        ההרפתקה שלכם ב<strong>${data.tourName}</strong> בעוד 3 ימים בלבד! הנה כל מה שצריך לדעת כדי להיות מוכנים.
      </p>

      <!-- Trip Details -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid ${GOLD};">
        <h2 style="margin: 0 0 12px 0; color: ${FOREST_GREEN}; font-size: 18px;">פרטי הטיול</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 120px;">תאריך:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">שעת איסוף:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.pickupTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">נקודת מפגש:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.meetingPoint}</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 16px;">
          <a href="${data.meetingPointMapUrl}" style="display: inline-block; background: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
            פתיחה ב-Google Maps
          </a>
        </div>
      </div>

      ${weatherSection}
      ${kosherSection}

      <!-- What to Bring Checklist -->
      <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid ${FOREST_GREEN};">
        <h3 style="margin: 0 0 12px 0; color: ${FOREST_GREEN}; font-size: 16px;">מה להביא</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; בגדים נוחים ונעליים סגורות</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; קרם הגנה (SPF 50+) וכובע</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; דוחה יתושים</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; מצלמה או טלפון טעון</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; בקבוק מים (אנחנו מספקים מילוי)</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; מעיל גשם קל (ליתר ביטחון)</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; תיק גב קטן</td></tr>
          <tr><td style="padding: 4px 0; font-size: 14px; color: #333;">&#9745; תרופות אישיות</td></tr>
        </table>
      </div>

      <!-- Emergency Contacts -->
      <div style="background: #FFF3E0; padding: 16px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #E65100;">
        <h3 style="margin: 0 0 8px 0; color: #E65100; font-size: 16px;">מספרי חירום</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>WIRO 4x4:</strong> <a href="tel:${data.emergencyPhone}" style="color: ${FOREST_GREEN};">${data.emergencyPhone}</a></p>
        <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>וואטסאפ:</strong> <a href="${COMPANY_WHATSAPP_URL}" style="color: ${FOREST_GREEN};">${COMPANY_PHONE}</a></p>
        <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>חירום תאילנד:</strong> 1669 (אמבולנס) / 191 (משטרה)</p>
      </div>

      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        אם יש לכם שאלות של הרגע האחרון, אל תהססו לפנות אלינו. מחכים להרפתקה מדהימה ביחד!
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
 * Send pre-trip information email (bilingual)
 * Trigger: 3 days before trip date
 */
export async function sendPreTripInfoEmail(
  data: PreTripInfoEmailData
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[PreTripInfo] Resend API key not configured, skipping email"
      );
      return false;
    }

    const isHebrew = data.language === "he";
    const html = isHebrew ? getHebrewHtml(data) : getEnglishHtml(data);
    const subject = isHebrew
      ? `מידע חשוב לקראת הטיול: ${data.tourName}`
      : `Important info for your trip: ${data.tourName}`;

    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${EMAIL_SENDERS.bookings}>`,
      to: data.customerEmail,
      subject,
      html,
    });

    if (error) {
      console.error("[PreTripInfo] Failed to send pre-trip email:", error);
      captureException(error);
      return false;
    }

    console.log(
      `[PreTripInfo] Pre-trip info email sent to ${data.customerEmail}`
    );
    return true;
  } catch (error) {
    console.error("[PreTripInfo] Error sending pre-trip email:", error);
    captureException(error);
    return false;
  }
}
