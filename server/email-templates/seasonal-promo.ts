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

export interface SeasonalTourHighlight {
  name: string;
  nameHe?: string;
  description: string;
  descriptionHe?: string;
  imageUrl?: string;
  slug: string;
}

export interface BlogHighlight {
  title: string;
  titleHe?: string;
  excerpt: string;
  excerptHe?: string;
  slug: string;
}

export interface SeasonalPromoEmailData {
  recipientEmail: string;
  recipientName?: string;
  seasonName: string; // e.g., "Winter 2026", "Cool Season"
  seasonNameHe?: string;
  discountCode: string;
  discountPercent: number; // e.g., 20
  validUntil: string; // ISO date string
  tourHighlights: SeasonalTourHighlight[];
  newTourAnnouncements?: SeasonalTourHighlight[];
  blogHighlights?: BlogHighlight[];
  language: "en" | "he";
}

function formatDate(isoDate: string, lang: "en" | "he"): string {
  const date = new Date(isoDate);
  if (lang === "he") {
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getEnglishHtml(data: SeasonalPromoEmailData): string {
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(data.recipientEmail)}`;
  const validUntil = formatDate(data.validUntil, "en");

  const tourHighlightsHtml = data.tourHighlights
    .map(
      tour => `
      <div style="margin: 16px 0; padding: 16px; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
        ${tour.imageUrl ? `<img src="${tour.imageUrl}" alt="${tour.name}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;" />` : ""}
        <h3 style="margin: 0 0 8px 0; color: ${FOREST_GREEN}; font-size: 16px;">${tour.name}</h3>
        <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.5;">${tour.description}</p>
        <a href="${SITE_URL}/tours/${tour.slug}" style="color: ${FOREST_GREEN}; font-weight: bold; font-size: 14px; text-decoration: none;">Learn More &rarr;</a>
      </div>`
    )
    .join("");

  const newToursSection =
    data.newTourAnnouncements && data.newTourAnnouncements.length > 0
      ? `
      <div style="margin: 24px 0;">
        <h2 style="color: ${FOREST_GREEN}; font-size: 20px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid ${GOLD};">New Tours</h2>
        ${data.newTourAnnouncements
          .map(
            tour => `
          <div style="margin: 12px 0; padding: 16px; background: #E8F5E9; border-radius: 8px; border-left: 4px solid ${FOREST_GREEN};">
            <h3 style="margin: 0 0 4px 0; color: ${FOREST_GREEN}; font-size: 16px;">${tour.name}</h3>
            <p style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${tour.description}</p>
            <a href="${SITE_URL}/tours/${tour.slug}" style="color: ${FOREST_GREEN}; font-weight: bold; font-size: 13px; text-decoration: none;">Explore &rarr;</a>
          </div>`
          )
          .join("")}
      </div>`
      : "";

  const blogSection =
    data.blogHighlights && data.blogHighlights.length > 0
      ? `
      <div style="margin: 24px 0;">
        <h2 style="color: ${FOREST_GREEN}; font-size: 20px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid ${GOLD};">From Our Blog</h2>
        ${data.blogHighlights
          .map(
            post => `
          <div style="margin: 12px 0; padding: 12px 0; border-bottom: 1px solid #eee;">
            <h3 style="margin: 0 0 4px 0; font-size: 15px;"><a href="${SITE_URL}/blog/${post.slug}" style="color: ${FOREST_GREEN}; text-decoration: none;">${post.title}</a></h3>
            <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5;">${post.excerpt}</p>
          </div>`
          )
          .join("")}
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
    <div style="background: linear-gradient(135deg, ${FOREST_GREEN} 0%, #4a7c2c 100%); color: white; padding: 40px 20px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">WIRO 4x4</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${data.seasonName} Adventures</p>
    </div>

    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
      <p style="font-size: 16px; color: #333;">Hi ${data.recipientName || "there"},</p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        The ${data.seasonName.toLowerCase()} is the perfect time to explore Northern Thailand's stunning landscapes!
        Check out our top picks and take advantage of an exclusive seasonal offer.
      </p>

      <!-- Discount Banner -->
      <div style="background: linear-gradient(135deg, ${GOLD} 0%, #D4A020 100%); padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: ${FOREST_GREEN}; font-weight: bold;">LIMITED TIME OFFER</p>
        <p style="margin: 0 0 4px 0; font-size: 42px; font-weight: bold; color: ${FOREST_GREEN};">${data.discountPercent}% OFF</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: ${FOREST_GREEN};">All tours this season</p>
        <div style="background: white; padding: 10px 20px; border-radius: 6px; display: inline-block;">
          <p style="margin: 0; font-size: 12px; color: #666;">Use code</p>
          <p style="margin: 2px 0 0 0; font-size: 22px; font-weight: bold; color: ${FOREST_GREEN}; letter-spacing: 2px;">${data.discountCode}</p>
        </div>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: ${FOREST_GREEN}; opacity: 0.8;">Valid until ${validUntil}</p>
      </div>

      <!-- Tour Highlights -->
      <h2 style="color: ${FOREST_GREEN}; font-size: 20px; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid ${GOLD};">${data.seasonName} Tour Highlights</h2>
      ${tourHighlightsHtml}

      <div style="text-align: center; margin: 24px 0;">
        <a href="${SITE_URL}/tours" style="display: inline-block; background: ${FOREST_GREEN}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 16px;">
          View All Tours
        </a>
      </div>

      ${newToursSection}
      ${blogSection}

      <!-- Social Media -->
      <div style="text-align: center; margin: 24px 0; padding: 20px 0; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0;">Follow us for travel tips and updates:</p>
        <div>
          <a href="${COMPANY_FACEBOOK_URL}" style="display: inline-block; margin: 0 6px; padding: 8px 14px; background: #1877F2; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">Facebook</a>
          <a href="${COMPANY_INSTAGRAM_URL}" style="display: inline-block; margin: 0 6px; padding: 8px 14px; background: #E1306C; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">Instagram</a>
          <a href="${COMPANY_WHATSAPP_URL}" style="display: inline-block; margin: 0 6px; padding: 8px 14px; background: #25D366; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">WhatsApp</a>
        </div>
      </div>
    </div>

    <div style="background: ${FOREST_GREEN}; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
      <p style="margin: 0; font-size: 14px;">${COMPANY_NAME}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">Chiang Mai, Thailand | ${COMPANY_PHONE}</p>
      <p style="margin: 12px 0 0 0;">
        <a href="${unsubscribeUrl}" style="color: rgba(255,255,255,0.6); font-size: 12px; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function getHebrewHtml(data: SeasonalPromoEmailData): string {
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(data.recipientEmail)}`;
  const validUntil = formatDate(data.validUntil, "he");
  const seasonName = data.seasonNameHe || data.seasonName;

  const tourHighlightsHtml = data.tourHighlights
    .map(
      tour => `
      <div style="margin: 16px 0; padding: 16px; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
        ${tour.imageUrl ? `<img src="${tour.imageUrl}" alt="${tour.nameHe || tour.name}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;" />` : ""}
        <h3 style="margin: 0 0 8px 0; color: ${FOREST_GREEN}; font-size: 16px;">${tour.nameHe || tour.name}</h3>
        <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.5;">${tour.descriptionHe || tour.description}</p>
        <a href="${SITE_URL}/tours/${tour.slug}" style="color: ${FOREST_GREEN}; font-weight: bold; font-size: 14px; text-decoration: none;">למידע נוסף &larr;</a>
      </div>`
    )
    .join("");

  const newToursSection =
    data.newTourAnnouncements && data.newTourAnnouncements.length > 0
      ? `
      <div style="margin: 24px 0;">
        <h2 style="color: ${FOREST_GREEN}; font-size: 20px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid ${GOLD};">טיולים חדשים</h2>
        ${data.newTourAnnouncements
          .map(
            tour => `
          <div style="margin: 12px 0; padding: 16px; background: #E8F5E9; border-radius: 8px; border-right: 4px solid ${FOREST_GREEN};">
            <h3 style="margin: 0 0 4px 0; color: ${FOREST_GREEN}; font-size: 16px;">${tour.nameHe || tour.name}</h3>
            <p style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${tour.descriptionHe || tour.description}</p>
            <a href="${SITE_URL}/tours/${tour.slug}" style="color: ${FOREST_GREEN}; font-weight: bold; font-size: 13px; text-decoration: none;">גלו &larr;</a>
          </div>`
          )
          .join("")}
      </div>`
      : "";

  const blogSection =
    data.blogHighlights && data.blogHighlights.length > 0
      ? `
      <div style="margin: 24px 0;">
        <h2 style="color: ${FOREST_GREEN}; font-size: 20px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid ${GOLD};">מהבלוג שלנו</h2>
        ${data.blogHighlights
          .map(
            post => `
          <div style="margin: 12px 0; padding: 12px 0; border-bottom: 1px solid #eee;">
            <h3 style="margin: 0 0 4px 0; font-size: 15px;"><a href="${SITE_URL}/blog/${post.slug}" style="color: ${FOREST_GREEN}; text-decoration: none;">${post.titleHe || post.title}</a></h3>
            <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5;">${post.excerptHe || post.excerpt}</p>
          </div>`
          )
          .join("")}
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
    <div style="background: linear-gradient(135deg, ${FOREST_GREEN} 0%, #4a7c2c 100%); color: white; padding: 40px 20px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">WIRO 4x4</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">הרפתקאות ${seasonName}</p>
    </div>

    <div style="background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; direction: rtl; text-align: right;">
      <p style="font-size: 16px; color: #333;">שלום ${data.recipientName || ""},</p>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        ${seasonName} הוא הזמן המושלם לחקור את הנופים המרהיבים של צפון תאילנד!
        בדקו את הטיולים המומלצים שלנו ונצלו הצעה עונתית בלעדית.
      </p>

      <!-- Discount Banner -->
      <div style="background: linear-gradient(135deg, ${GOLD} 0%, #D4A020 100%); padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 4px 0; font-size: 14px; color: ${FOREST_GREEN}; font-weight: bold;">מבצע לזמן מוגבל</p>
        <p style="margin: 0 0 4px 0; font-size: 42px; font-weight: bold; color: ${FOREST_GREEN};">${data.discountPercent}% הנחה</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: ${FOREST_GREEN};">על כל הטיולים בעונה</p>
        <div style="background: white; padding: 10px 20px; border-radius: 6px; display: inline-block;">
          <p style="margin: 0; font-size: 12px; color: #666;">השתמשו בקוד</p>
          <p style="margin: 2px 0 0 0; font-size: 22px; font-weight: bold; color: ${FOREST_GREEN}; letter-spacing: 2px;">${data.discountCode}</p>
        </div>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: ${FOREST_GREEN}; opacity: 0.8;">בתוקף עד ${validUntil}</p>
      </div>

      <!-- Tour Highlights -->
      <h2 style="color: ${FOREST_GREEN}; font-size: 20px; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid ${GOLD};">טיולים מומלצים ל${seasonName}</h2>
      ${tourHighlightsHtml}

      <div style="text-align: center; margin: 24px 0;">
        <a href="${SITE_URL}/tours" style="display: inline-block; background: ${FOREST_GREEN}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 16px;">
          לכל הטיולים
        </a>
      </div>

      ${newToursSection}
      ${blogSection}

      <!-- Social Media -->
      <div style="text-align: center; margin: 24px 0; padding: 20px 0; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0;">עקבו אחרינו לטיפים ועדכונים:</p>
        <div>
          <a href="${COMPANY_FACEBOOK_URL}" style="display: inline-block; margin: 0 6px; padding: 8px 14px; background: #1877F2; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">פייסבוק</a>
          <a href="${COMPANY_INSTAGRAM_URL}" style="display: inline-block; margin: 0 6px; padding: 8px 14px; background: #E1306C; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">אינסטגרם</a>
          <a href="${COMPANY_WHATSAPP_URL}" style="display: inline-block; margin: 0 6px; padding: 8px 14px; background: #25D366; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">וואטסאפ</a>
        </div>
      </div>
    </div>

    <div style="background: ${FOREST_GREEN}; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
      <p style="margin: 0; font-size: 14px;">${COMPANY_NAME}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">צ'יאנג מאי, תאילנד | ${COMPANY_PHONE}</p>
      <p style="margin: 12px 0 0 0;">
        <a href="${unsubscribeUrl}" style="color: rgba(255,255,255,0.6); font-size: 12px; text-decoration: underline;">ביטול הרשמה</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send seasonal promotion email (bilingual)
 * Trigger: Manual send (newsletter campaign)
 */
export async function sendSeasonalPromoEmail(
  data: SeasonalPromoEmailData
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[SeasonalPromo] Resend API key not configured, skipping email"
      );
      return false;
    }

    const isHebrew = data.language === "he";
    const html = isHebrew ? getHebrewHtml(data) : getEnglishHtml(data);
    const seasonName = isHebrew
      ? data.seasonNameHe || data.seasonName
      : data.seasonName;
    const subject = isHebrew
      ? `${data.discountPercent}% הנחה על טיולי ${seasonName} - WIRO 4x4`
      : `${data.discountPercent}% Off ${data.seasonName} Tours - WIRO 4x4`;

    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${EMAIL_SENDERS.updates}>`,
      to: data.recipientEmail,
      subject,
      html,
    });

    if (error) {
      console.error("[SeasonalPromo] Failed to send promo email:", error);
      captureException(error);
      return false;
    }

    console.log(`[SeasonalPromo] Promo email sent to ${data.recipientEmail}`);
    return true;
  } catch (error) {
    console.error("[SeasonalPromo] Error sending promo email:", error);
    captureException(error);
    return false;
  }
}
