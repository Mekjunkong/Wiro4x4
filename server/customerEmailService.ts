import { Resend } from "resend";
import { createEvents, EventAttributes } from "ics";
import { captureException } from "./sentry";
import {
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  COMPANY_SENDER_EMAIL,
  COMPANY_WHATSAPP,
  COMPANY_WEBSITE,
} from "@shared/const";
import { escapeHtml } from "@shared/escapeHtml";

// Lazily initialize Resend so tests don't crash when RESEND_API_KEY is unset
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const SENDER_EMAIL = COMPANY_SENDER_EMAIL;

interface BookingDetails {
  customerName: string;
  customerEmail: string;
  tourDate: string;
  tourType: string;
  groupSize: number;
  pickupLocation?: string;
  pickupTime?: string;
  specialRequests?: string;
  bookingId: string;
}

/**
 * Generate ICS calendar file for the tour booking
 */
function generateCalendarEvent(booking: BookingDetails): string | null {
  try {
    const tourDate = new Date(booking.tourDate);

    // Default pickup time is 8:00 AM if not specified
    const pickupTime = booking.pickupTime || "08:00";
    const [hours, minutes] = pickupTime.split(":").map(Number);

    // Set start time
    const startDate = new Date(tourDate);
    startDate.setHours(hours, minutes, 0, 0);

    // Set end time (8 hours later for full day tour)
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 8);

    const locationText = booking.pickupLocation
      ? `${booking.pickupLocation}, Chiang Mai, Thailand`
      : "Chiang Mai, Thailand";

    const descriptionLines = [
      `Your ${booking.tourType} adventure with WIRO 4x4!`,
      ``,
      `--- Booking Details ---`,
      `Booking ID: ${booking.bookingId}`,
      `Group Size: ${booking.groupSize} people`,
      `Pickup Location: ${booking.pickupLocation || "To be confirmed"}`,
      `Pickup Time: ${pickupTime}`,
      ``,
      `--- Meeting Point ---`,
      `Your hotel lobby (pickup included) or Chiang Mai Old City area.`,
      `Google Maps: https://maps.google.com/?q=Chiang+Mai+Thailand`,
      ``,
      ...(booking.specialRequests
        ? [`Special Requests: ${booking.specialRequests}`, ``]
        : []),
      `--- What to Bring ---`,
      `- Comfortable clothing and closed-toe shoes`,
      `- Sunscreen and insect repellent`,
      `- Hat and sunglasses`,
      `- Camera`,
      `- Water bottle (we'll provide refills)`,
      `- Light rain jacket (seasonal)`,
      ``,
      `--- Contact / Emergency ---`,
      `Phone: ${COMPANY_PHONE}`,
      `WhatsApp: https://wa.me/${COMPANY_WHATSAPP}`,
      `Email: ${COMPANY_EMAIL}`,
      `Website: ${COMPANY_WEBSITE}`,
      ``,
      `Questions? WhatsApp us anytime: +66929894495`,
      ``,
      `We look forward to your adventure with us!`,
    ];

    const event: EventAttributes = {
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ],
      title: `${booking.tourType} - WIRO 4x4`,
      description: descriptionLines.join("\n"),
      location: locationText,
      geo: { lat: 18.7883, lon: 98.9853 }, // Chiang Mai coordinates
      url: COMPANY_WEBSITE,
      status: "CONFIRMED",
      busyStatus: "BUSY",
      calName: "WIRO 4x4 Tours",
      categories: ["Travel", "Tour", "Adventure"],
      organizer: { name: COMPANY_NAME, email: "wiro.adventures@gmail.com" },
      attendees: [
        {
          name: booking.customerName,
          email: booking.customerEmail,
          rsvp: true,
        },
      ],
      alarms: [
        {
          action: "display",
          description: `Reminder: Your ${booking.tourType} with WIRO 4x4 is tomorrow! Don't forget to pack: comfortable clothes, sunscreen, insect repellent, camera, water bottle.`,
          trigger: { days: 1, before: true },
        },
        {
          action: "display",
          description: `Your ${booking.tourType} with WIRO 4x4 starts in 2 hours! Pickup at: ${booking.pickupLocation || "your hotel lobby"}. WhatsApp: +66929894495`,
          trigger: { hours: 2, before: true },
        },
      ],
    };

    const { error, value } = createEvents([event]);

    if (error) {
      console.error("[Calendar] Error generating ICS file:", error);
      return null;
    }

    return value || null;
  } catch (error) {
    console.error("[Calendar] Error generating calendar event:", error);
    return null;
  }
}

/**
 * Send booking confirmation email to customer with calendar attachment
 */
export async function sendCustomerConfirmation(
  booking: BookingDetails
): Promise<boolean> {
  try {
    // Generate calendar file
    const icsContent = generateCalendarEvent(booking);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
    .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623; }
    .detail-row { margin: 10px 0; }
    .detail-label { font-weight: bold; color: #2d5016; }
    .calendar-button { display: inline-block; background: #f5a623; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
    .calendar-button:hover { background: #e6951a; }
    .info-box { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a7c2c; }
    .contact-info { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚙 Booking Confirmed!</h1>
      <p>Your adventure with WIRO 4x4 is confirmed</p>
    </div>
    
    <div class="content">
      <p>Dear ${escapeHtml(booking.customerName)},</p>

      <p>Thank you for booking with <strong>WIRO 4x4 - Kosher Off-Road Adventures</strong>! We're excited to take you on an unforgettable journey through Northern Thailand.</p>

      <div class="booking-details">
        <h2 style="margin-top: 0; color: #2d5016;">📋 Your Booking Details</h2>
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span> ${booking.bookingId}
        </div>
        <div class="detail-row">
          <span class="detail-label">Tour Type:</span> ${escapeHtml(booking.tourType)}
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span> ${new Date(booking.tourDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
        <div class="detail-row">
          <span class="detail-label">Group Size:</span> ${booking.groupSize} people
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Location:</span> ${escapeHtml(booking.pickupLocation) || "To be confirmed"}
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Time:</span> ${booking.pickupTime || "08:00 AM"}
        </div>
        ${
          booking.specialRequests
            ? `
        <div class="detail-row">
          <span class="detail-label">Special Requests:</span> ${escapeHtml(booking.specialRequests)}
        </div>
        `
            : ""
        }
      </div>
      
      ${
        icsContent
          ? `
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; margin-bottom: 15px;"><strong>📅 Add this tour to your calendar:</strong></p>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Click the button below or use the attached calendar file</p>
        <a href="data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}" download="wiro-4x4-tour.ics" class="calendar-button">
          📅 Add to Calendar
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">Works with Google Calendar, Apple Calendar, Outlook, and more</p>
      </div>
      `
          : ""
      }
      
      <div class="info-box" style="background: #e3f2fd; border-left-color: #1976d2;">
        <h3 style="margin-top: 0; color: #1976d2;">📍 Meeting Point & Location</h3>
        <p><strong>Location:</strong> Chiang Mai, Thailand</p>
        <p><strong>Pickup:</strong> Your hotel lobby (pickup included) or Chiang Mai Old City area</p>
        <p style="margin-top: 10px;">
          <a href="https://maps.google.com/?q=Chiang+Mai+Thailand" style="color: #1976d2; text-decoration: underline;">View Chiang Mai on Google Maps</a>
        </p>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #2d5016;">🎒 What to Bring Checklist</h3>
        <ul>
          <li>Comfortable clothing and closed-toe shoes</li>
          <li>Sunscreen (SPF 30+) and insect repellent</li>
          <li>Hat and sunglasses</li>
          <li>Camera for amazing photos</li>
          <li>Water bottle (we'll provide refills)</li>
          <li>Light rain jacket (just in case)</li>
          <li>Any personal medications</li>
          <li>Sense of adventure!</li>
        </ul>
      </div>

      <div class="contact-info">
        <h3 style="margin-top: 0; color: #f5a623;">📞 Contact & Emergency Info</h3>
        <p><strong>Phone:</strong> <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a></p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/${COMPANY_WHATSAPP}" style="color: #25d366; font-weight: bold;">${COMPANY_PHONE}</a> (fastest way to reach us)</p>
        <p><strong>Email:</strong> <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a></p>
        <p><strong>Website:</strong> <a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a></p>
        <p style="margin-top: 15px; font-size: 14px; background: #fff8e1; padding: 10px; border-radius: 6px;">
          <strong>Need help before or during your tour?</strong><br>
          WhatsApp us anytime at <a href="https://wa.me/${COMPANY_WHATSAPP}" style="color: #25d366; font-weight: bold;">${COMPANY_PHONE}</a> — we respond quickly!
        </p>
      </div>

      <p>We'll send you a reminder 48 hours before your tour with final details.</p>
      
      <p>Looking forward to your adventure!</p>
      
      <p style="margin-top: 30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>WIRO 4x4 - Kosher Off-Road Adventures</strong></p>
      <p>Chiang Mai, Thailand</p>
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated confirmation email. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailData: any = {
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: [booking.customerEmail],
      subject: `✅ Booking Confirmed - ${booking.tourType} on ${new Date(booking.tourDate).toLocaleDateString()}`,
      html: emailHtml,
    };

    // Attach ICS file if generated successfully
    if (icsContent) {
      emailData.attachments = [
        {
          filename: "wiro-4x4-tour.ics",
          content: Buffer.from(icsContent).toString("base64"),
        },
      ];
    }

    const resend = getResend();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping email"
      );
      return false;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("[Customer Email] Error sending confirmation:", error);
      captureException(error);
      return false;
    }

    console.log(
      `[Customer Email] Confirmation sent to ${booking.customerEmail}. ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error("[Customer Email] Error in sendCustomerConfirmation:", error);
    captureException(error);
    return false;
  }
}

/**
 * Send booking reminder email (24h before tour)
 */
export async function sendBookingReminder(
  booking: BookingDetails
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping reminder"
      );
      return false;
    }

    const tourDate = new Date(booking.tourDate);
    const formattedDate = tourDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
    .info-box { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Tour is Tomorrow!</h1>
      <p>Get ready for an amazing adventure</p>
    </div>
    <div class="content">
      <p>Dear ${escapeHtml(booking.customerName)},</p>
      <p>This is a friendly reminder that your <strong>${escapeHtml(booking.tourType)}</strong> with WIRO 4x4 is <strong>tomorrow, ${formattedDate}</strong>!</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">Quick Details</h3>
        <p><strong>Pickup Time:</strong> ${booking.pickupTime || "08:00 AM"}</p>
        <p><strong>Pickup Location:</strong> ${escapeHtml(booking.pickupLocation) || "To be confirmed"}</p>
        <p><strong>Group Size:</strong> ${booking.groupSize} people</p>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
      </div>
      <h3>Don't Forget to Bring:</h3>
      <ul>
        <li>Comfortable clothing and closed-toe shoes</li>
        <li>Sunscreen (SPF 30+) and insect repellent</li>
        <li>Hat and sunglasses</li>
        <li>Camera</li>
        <li>Water bottle</li>
        <li>Light rain jacket</li>
      </ul>
      <p><strong>Meeting Point:</strong> Your hotel lobby (pickup included) or Chiang Mai Old City area.
        <a href="https://maps.google.com/?q=Chiang+Mai+Thailand" style="color: #1976d2;">View on Google Maps</a>
      </p>
      <p>Questions? Contact us:</p>
      <p>Phone: <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a> | WhatsApp: <a href="https://wa.me/${COMPANY_WHATSAPP}" style="color: #25d366; font-weight: bold;">${COMPANY_PHONE}</a> (fastest response)</p>
      <p>See you tomorrow!</p>
      <p><strong>The WIRO 4x4 Team</strong></p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
    </div>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: [booking.customerEmail],
      subject: `Reminder: Your ${booking.tourType} is tomorrow! - WIRO 4x4`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Customer Email] Error sending reminder:", error);
      captureException(error);
      return false;
    }

    console.log(`[Customer Email] Reminder sent to ${booking.customerEmail}`);
    return true;
  } catch (error) {
    console.error("[Customer Email] Error in sendBookingReminder:", error);
    captureException(error);
    return false;
  }
}

/**
 * Send post-tour feedback request email (1 day after tour)
 */
/**
 * Send payment confirmation email to customer
 */
export async function sendPaymentConfirmationEmail({
  customerName,
  customerEmail,
  amount,
  type,
  bookingId,
}: {
  customerName: string;
  customerEmail: string;
  amount: number;
  type: string;
  bookingId: number;
}): Promise<boolean> {
  try {
    const typeLabels: Record<string, string> = {
      deposit: "Deposit",
      balance: "Balance",
      full: "Full Payment",
      refund: "Refund",
    };
    const typeLabel = typeLabels[type] || type;
    const formattedAmount = amount.toLocaleString("en-US");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: #ffffff; padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
    .payment-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a7c2c; }
    .detail-row { margin: 10px 0; }
    .detail-label { font-weight: bold; color: #2d5016; }
    .amount { font-size: 32px; font-weight: bold; color: #2d5016; text-align: center; margin: 20px 0; }
    .info-box { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a7c2c; }
    .contact-info { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmed</h1>
      <p>Thank you for your payment</p>
    </div>

    <div class="content">
      <p>Dear ${escapeHtml(customerName)},</p>

      <p>We have successfully received your payment. Here are the details:</p>

      <div class="payment-details">
        <div class="amount">${formattedAmount} THB</div>
        <div class="detail-row">
          <span class="detail-label">Payment Type:</span> ${typeLabel}
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking Reference:</span> #${bookingId}
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span> Completed
        </div>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #2d5016;">What Happens Next?</h3>
        <ul style="padding-left: 20px;">
          <li>Your booking is being processed by our team</li>
          <li>You will receive a confirmation with full tour details</li>
          <li>A reminder will be sent 48 hours before your tour</li>
        </ul>
      </div>

      <div class="contact-info">
        <h3 style="margin-top: 0; color: #f5a623;">Need Help?</h3>
        <p><strong>Phone:</strong> <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a></p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/${COMPANY_WHATSAPP}">${COMPANY_WHATSAPP}</a></p>
        <p><strong>Website:</strong> <a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a></p>
      </div>

      <p>Thank you for choosing WIRO 4x4!</p>

      <p style="margin-top: 30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>
    </div>

    <div class="footer">
      <p><strong>${COMPANY_NAME}</strong></p>
      <p>Chiang Mai, Thailand</p>
      <p>${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated payment confirmation. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const resend = getResend();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping payment confirmation"
      );
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: [customerEmail],
      subject: `Payment Confirmed - ${typeLabel} of ${formattedAmount} THB - Booking #${bookingId}`,
      html: emailHtml,
    });

    if (error) {
      console.error(
        "[Customer Email] Error sending payment confirmation:",
        error
      );
      captureException(error);
      return false;
    }

    console.log(
      `[Customer Email] Payment confirmation sent to ${customerEmail}. ID: ${data?.id}`
    );
    return true;
  } catch (error) {
    console.error(
      "[Customer Email] Error in sendPaymentConfirmationEmail:",
      error
    );
    captureException(error);
    return false;
  }
}

/**
 * Send post-tour feedback request email (1 day after tour)
 */
export async function sendPostTourFeedback(
  booking: BookingDetails
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping feedback request"
      );
      return false;
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
    .cta-button { display: inline-block; background: #f5a623; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>How Was Your Adventure?</h1>
      <p>We'd love to hear from you!</p>
    </div>
    <div class="content">
      <p>Dear ${escapeHtml(booking.customerName)},</p>
      <p>Thank you for choosing <strong>WIRO 4x4</strong> for your ${escapeHtml(booking.tourType)} adventure! We hope you had an amazing time exploring Northern Thailand.</p>
      <p>Your feedback helps us improve and helps other travelers discover our tours. Would you take a moment to share your experience?</p>
      <div style="text-align: center;">
        <a href="${COMPANY_WEBSITE}/reviews" class="cta-button">Leave a Review</a>
      </div>
      <p>Thank you for being part of the WIRO 4x4 family. We hope to see you again!</p>
      <p><strong>The WIRO 4x4 Team</strong></p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
    </div>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: [booking.customerEmail],
      subject: `How was your ${booking.tourType}? Share your experience! - WIRO 4x4`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Customer Email] Error sending feedback request:", error);
      captureException(error);
      return false;
    }

    console.log(
      `[Customer Email] Feedback request sent to ${booking.customerEmail}`
    );
    return true;
  } catch (error) {
    console.error("[Customer Email] Error in sendPostTourFeedback:", error);
    captureException(error);
    return false;
  }
}

/**
 * Send a bulk/custom email to a customer
 */
export async function sendBulkEmailToCustomer({
  to,
  subject,
  message,
  customerName,
}: {
  to: string;
  subject: string;
  message: string;
  customerName: string;
}): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn(
        "[Customer Email] Resend API key not configured, skipping bulk email"
      );
      return false;
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>WIRO 4x4</h1>
      <p>Kosher Off-Road Adventures</p>
    </div>
    <div class="content">
      <p>Dear ${escapeHtml(customerName)},</p>
      ${message
        .split("\n")
        .map(line => `<p>${escapeHtml(line)}</p>`)
        .join("")}
      <p style="margin-top: 30px;">
        <strong>The WIRO 4x4 Team</strong><br>
        <em>Kosher Off-Road Adventures in Chiang Mai</em>
      </p>
    </div>
    <div class="footer">
      <p>${COMPANY_NAME} | ${COMPANY_PHONE} | ${SENDER_EMAIL}</p>
    </div>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${SENDER_EMAIL}>`,
      to: [to],
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("[Customer Email] Error sending bulk email:", error);
      captureException(error);
      return false;
    }

    console.log(`[Customer Email] Bulk email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[Customer Email] Error in sendBulkEmailToCustomer:", error);
    captureException(error);
    return false;
  }
}
