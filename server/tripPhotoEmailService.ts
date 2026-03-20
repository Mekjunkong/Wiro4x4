import { Resend } from "resend";
import { captureException } from "./sentry";
import {
  COMPANY_WHATSAPP_URL,
  COMPANY_WEBSITE,
  COMPANY_NAME,
} from "../shared/const";
import { escapeHtml } from "../shared/escapeHtml";

// Lazily initialize Resend so tests don't crash when RESEND_API_KEY is unset
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const SENDER_EMAIL = "WIRO 4x4 Photos <bookings@wiro4x4indochina.com>";

export interface TripPhotoEmailData {
  customerName: string;
  customerEmail: string;
  albumTitle: string;
  albumUrl: string;
  personalMessage?: string | null;
  photoCount: number;
  firstPhotoUrl?: string | null;
}

/**
 * Send email to customer with their private trip photo album link
 */
export async function sendTripPhotoAlbumEmail(
  data: TripPhotoEmailData
): Promise<boolean> {
  const subject = `📸 Your Adventure Photos Are Ready! - ${data.albumTitle}`;

  const previewSection = data.firstPhotoUrl
    ? `
        <div style="margin: 20px 0; text-align: center;">
          <img
            src="${data.firstPhotoUrl}"
            alt="Preview photo from your trip"
            style="max-width: 100%; max-height: 300px; border-radius: 8px; object-fit: cover;"
          />
          <p style="color: #888; font-size: 13px; margin-top: 8px;">
            ${data.photoCount} photo${data.photoCount !== 1 ? "s" : ""} from your adventure
          </p>
        </div>`
    : "";

  const personalMessageSection = data.personalMessage
    ? `
        <div style="background: #f0f7f4; border-left: 4px solid #d4af37; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
          <p style="color: #666; font-size: 13px; margin: 0 0 5px 0; font-style: italic;">A personal note from your guide:</p>
          <p style="color: #333; margin: 0; line-height: 1.6;">${escapeHtml(data.personalMessage)}</p>
        </div>`
    : "";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🚙 WIRO 4x4</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Your Adventure Photos Are Ready!</p>
      </div>

      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <p style="font-size: 16px; color: #333; margin-top: 0;">
          Hi ${escapeHtml(data.customerName)},
        </p>

        <p style="color: #555; line-height: 1.6;">
          Thank you for adventuring with us! We've prepared a private photo album from your trip.
          Click the button below to view and download your photos.
        </p>

        <h2 style="color: #1a4d2e; margin-bottom: 5px;">${escapeHtml(data.albumTitle)}</h2>

        ${previewSection}
        ${personalMessageSection}

        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${data.albumUrl}"
            style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #c9a033 100%); color: #1a1a1a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; letter-spacing: 0.5px;"
          >
            📸 View Your Photos
          </a>
        </div>

        <div style="background: #fff8e7; border: 1px solid #f0e6c8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #8a7030; margin: 0; font-size: 14px;">
            ⏰ <strong>Note:</strong> Your photos will be available for 90 days.
            We recommend downloading them to keep them forever!
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">

        <p style="color: #888; font-size: 13px; text-align: center;">
          Questions about your photos? Reach out via
          <a href="${COMPANY_WHATSAPP_URL}" style="color: #1a4d2e;">WhatsApp</a>
        </p>
      </div>

      <div style="background: #1a4d2e; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">🌟 Thank you for adventuring with us!</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">
          ${COMPANY_NAME}
        </p>
        <p style="margin: 8px 0 0 0;">
          <a href="${COMPANY_WEBSITE}" style="color: #d4af37; text-decoration: none; font-size: 12px;">${COMPANY_WEBSITE}</a>
        </p>
      </div>
    </div>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[Resend] API key not configured, skipping trip photo email"
      );
      return false;
    }

    const { data: result, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: data.customerEmail,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("[Resend] Failed to send trip photo email:", error);
      captureException(error);
      return false;
    }

    console.log(
      `[Resend] Trip photo email sent to ${data.customerEmail}. ID: ${result?.id}`
    );
    return true;
  } catch (error) {
    console.error("[Resend] Error sending trip photo email:", error);
    captureException(error);
    return false;
  }
}
