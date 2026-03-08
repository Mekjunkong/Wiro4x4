import { Resend } from "resend";
import { COMPANY_SENDER_EMAIL } from "@shared/const";
import { captureException } from "./sentry";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface EstimateEmailData {
  toEmail: string;
  estimateData: {
    selectedTours: Array<{ nameEn: string; nameHe: string; basePrice: number }>;
    adults: number;
    children: number[];
    arrivalDate: string;
    departureDate: string;
    includesHotels: boolean;
    includesFood: boolean;
    includesAttractions: boolean;
    attractionCount: number;
    needsShabbatHotel: boolean;
    total: number;
    language: "en" | "he";
  };
}

export async function sendEstimateEmail({
  toEmail,
  estimateData,
}: EstimateEmailData) {
  const client = getResendClient();

  if (!client) {
    console.warn(
      "[Estimate Email] Resend API key not configured - skipping estimate email"
    );
    return;
  }

  const {
    selectedTours,
    adults,
    children,
    arrivalDate,
    departureDate,
    total,
    language,
  } = estimateData;
  const isHebrew = language === "he";

  // Build tour list
  const tourList = selectedTours
    .map(
      t =>
        `  - ${isHebrew ? t.nameHe : t.nameEn} (฿${t.basePrice.toLocaleString()})`
    )
    .join("\n");

  // Build services list
  const services: string[] = [];
  if (estimateData.includesHotels)
    services.push(isHebrew ? "מלונות" : "Hotels");
  if (estimateData.includesFood)
    services.push(isHebrew ? "ארוחות כשרות" : "Kosher Meals");
  if (estimateData.includesAttractions)
    services.push(
      isHebrew
        ? `${estimateData.attractionCount} אטרקציות`
        : `${estimateData.attractionCount} Attractions`
    );
  if (estimateData.needsShabbatHotel)
    services.push(isHebrew ? "מלון שבת" : "Shabbat Hotel");

  const subject = isHebrew
    ? `הערכת מחיר לטיול - WIRO 4x4`
    : `Your Trip Estimate - WIRO 4x4`;

  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
          .section { margin: 20px 0; }
          .section h2 { color: #2d5016; font-size: 18px; border-bottom: 2px solid #f5a623; padding-bottom: 5px; }
          .tour-list { background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-line; }
          .info-row { margin: 10px 0; }
          .info-label { font-weight: bold; color: #2d5016; }
          .total { background: #fff3cd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #f5a623; }
          .total-amount { font-size: 36px; font-weight: bold; color: #2d5016; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
          .cta { background: #4a7c2c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .note { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #555; border-left: 4px solid #4a7c2c; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isHebrew ? "🚙 הערכת מחיר לטיול שלך" : "🚙 Your Trip Estimate"}</h1>
            <p>${isHebrew ? "WIRO 4x4 - הרפתקאות אופ-רוד כשרות" : "WIRO 4x4 - Kosher Off-Road Adventures"}</p>
          </div>

          <div class="content">
            <div class="section">
              <h2>${isHebrew ? "טיולים נבחרים" : "Selected Tours"}</h2>
              <div class="tour-list">${tourList}</div>
            </div>

            <div class="section">
              <h2>${isHebrew ? "פרטי קבוצה" : "Group Details"}</h2>
              <div class="info-row">
                <span class="info-label">${isHebrew ? "מבוגרים" : "Adults"}:</span> ${adults}
              </div>
              <div class="info-row">
                <span class="info-label">${isHebrew ? "ילדים" : "Children"}:</span> ${children.length} ${children.length > 0 ? `(${isHebrew ? "גילאים" : "ages"}: ${children.join(", ")})` : ""}
              </div>
            </div>

            <div class="section">
              <h2>${isHebrew ? "תאריכים" : "Dates"}</h2>
              <div class="info-row">
                <span class="info-label">${isHebrew ? "הגעה" : "Arrival"}:</span> ${arrivalDate}
              </div>
              <div class="info-row">
                <span class="info-label">${isHebrew ? "יציאה" : "Departure"}:</span> ${departureDate}
              </div>
            </div>

            ${
              services.length > 0
                ? `
              <div class="section">
                <h2>${isHebrew ? "שירותים נוספים" : "Additional Services"}</h2>
                <ul>
                  ${services.map(s => `<li>${s}</li>`).join("")}
                </ul>
              </div>
            `
                : ""
            }

            <div class="total">
              <div>${isHebrew ? "סה״כ משוער" : "Estimated Total"}</div>
              <div class="total-amount">฿${total.toLocaleString()}</div>
            </div>

            <div style="text-align: center;">
              <a href="https://wa.me/66929894495?text=${encodeURIComponent(
                isHebrew
                  ? `שלום! קיבלתי את הערכת המחיר ל-${total.toLocaleString()} באט. אשמח לפרטים נוספים.`
                  : `Hello! I received the estimate for ฿${total.toLocaleString()}. I'd like more details.`
              )}" class="cta">
                ${isHebrew ? "📱 צור קשר בוואטסאפ" : "📱 Contact Us on WhatsApp"}
              </a>
            </div>

            <div class="note">
              ${
                isHebrew
                  ? "💡 ההערכה תקפה ל-7 ימים. מחירים עשויים להשתנות בהתאם לעונה ולזמינות. צרו איתנו קשר לקבלת הצעת מחיר מדויקת."
                  : "💡 This estimate is valid for 7 days. Prices may vary based on season and availability. Contact us for a detailed quote."
              }
            </div>
          </div>

          <div class="footer">
            <p><strong>WIRO 4x4 - Kosher Off-Road Adventures</strong></p>
            <p>${isHebrew ? "📞 טלפון/וואטסאפ" : "📞 Phone/WhatsApp"}: +66 92-989-4495</p>
            <p>${isHebrew ? "📧 אימייל" : "📧 Email"}: ${COMPANY_SENDER_EMAIL}</p>
            <p style="margin-top: 15px; font-size: 12px;">
              ${
                isHebrew
                  ? "צ'יאנג מאי, תאילנד | www.wiro4x4indochina.com"
                  : "Chiang Mai, Thailand | www.wiro4x4indochina.com"
              }
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await client.emails.send({
      from: `WIRO 4x4 <${COMPANY_SENDER_EMAIL}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    console.log(`[Estimate Email] Sent estimate to ${toEmail} (${language})`);
  } catch (error) {
    console.error("[Estimate Email] Failed to send:", error);
    captureException(error);
    throw error;
  }
}
