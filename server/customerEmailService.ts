import { Resend } from 'resend';
import { createEvents, EventAttributes } from 'ics';

// Lazily initialize Resend so tests don't crash when RESEND_API_KEY is unset
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const SENDER_EMAIL = 'wiro.adventures@gmail.com';
const COMPANY_NAME = 'WIRO 4x4 - Kosher Off-Road Adventures';
const COMPANY_PHONE = '+66 81 961 1398';
const COMPANY_WHATSAPP = '+66 81 961 1398';
const COMPANY_WEBSITE = 'https://wiro4x4.manus.space';

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
    const pickupTime = booking.pickupTime || '08:00';
    const [hours, minutes] = pickupTime.split(':').map(Number);
    
    // Set start time
    const startDate = new Date(tourDate);
    startDate.setHours(hours, minutes, 0, 0);
    
    // Set end time (8 hours later for full day tour)
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 8);
    
    const event: EventAttributes = {
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes()
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes()
      ],
      title: `${booking.tourType} - WIRO 4x4`,
      description: `Your ${booking.tourType} adventure with WIRO 4x4!\n\n` +
        `Group Size: ${booking.groupSize} people\n` +
        `Pickup Location: ${booking.pickupLocation || 'To be confirmed'}\n` +
        `Pickup Time: ${pickupTime}\n\n` +
        `Contact Information:\n` +
        `Phone: ${COMPANY_PHONE}\n` +
        `WhatsApp: ${COMPANY_WHATSAPP}\n` +
        `Website: ${COMPANY_WEBSITE}\n\n` +
        `Booking ID: ${booking.bookingId}\n\n` +
        (booking.specialRequests ? `Special Requests: ${booking.specialRequests}\n\n` : '') +
        `What to Bring:\n` +
        `- Comfortable clothing and closed-toe shoes\n` +
        `- Sunscreen and hat\n` +
        `- Camera\n` +
        `- Water bottle\n` +
        `- Sense of adventure!\n\n` +
        `We look forward to your adventure with us!`,
      location: booking.pickupLocation || 'Chiang Mai, Thailand',
      url: COMPANY_WEBSITE,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: COMPANY_NAME, email: SENDER_EMAIL },
      attendees: [
        { name: booking.customerName, email: booking.customerEmail, rsvp: true }
      ]
    };
    
    const { error, value } = createEvents([event]);
    
    if (error) {
      console.error('[Calendar] Error generating ICS file:', error);
      return null;
    }
    
    return value || null;
  } catch (error) {
    console.error('[Calendar] Error generating calendar event:', error);
    return null;
  }
}

/**
 * Send booking confirmation email to customer with calendar attachment
 */
export async function sendCustomerConfirmation(booking: BookingDetails): Promise<boolean> {
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
      <p>Dear ${booking.customerName},</p>
      
      <p>Thank you for booking with <strong>WIRO 4x4 - Kosher Off-Road Adventures</strong>! We're excited to take you on an unforgettable journey through Northern Thailand.</p>
      
      <div class="booking-details">
        <h2 style="margin-top: 0; color: #2d5016;">📋 Your Booking Details</h2>
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span> ${booking.bookingId}
        </div>
        <div class="detail-row">
          <span class="detail-label">Tour Type:</span> ${booking.tourType}
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span> ${new Date(booking.tourDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div class="detail-row">
          <span class="detail-label">Group Size:</span> ${booking.groupSize} people
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Location:</span> ${booking.pickupLocation || 'To be confirmed'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Time:</span> ${booking.pickupTime || '08:00 AM'}
        </div>
        ${booking.specialRequests ? `
        <div class="detail-row">
          <span class="detail-label">Special Requests:</span> ${booking.specialRequests}
        </div>
        ` : ''}
      </div>
      
      ${icsContent ? `
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; margin-bottom: 15px;"><strong>📅 Add this tour to your calendar:</strong></p>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Click the button below or use the attached calendar file</p>
        <a href="data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}" download="wiro-4x4-tour.ics" class="calendar-button">
          📅 Add to Calendar
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">Works with Google Calendar, Apple Calendar, Outlook, and more</p>
      </div>
      ` : ''}
      
      <div class="info-box">
        <h3 style="margin-top: 0; color: #2d5016;">🎒 What to Bring</h3>
        <ul>
          <li>Comfortable clothing and closed-toe shoes</li>
          <li>Sunscreen and hat</li>
          <li>Camera for amazing photos</li>
          <li>Water bottle (we'll provide refills)</li>
          <li>Sense of adventure!</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <h3 style="margin-top: 0; color: #f5a623;">📞 Contact Information</h3>
        <p><strong>Phone:</strong> <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a></p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/${COMPANY_WHATSAPP.replace(/[^0-9]/g, '')}">${COMPANY_WHATSAPP}</a></p>
        <p><strong>Website:</strong> <a href="${COMPANY_WEBSITE}">${COMPANY_WEBSITE}</a></p>
        <p style="margin-top: 15px; font-size: 14px;">Have questions? Feel free to reach out anytime!</p>
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
          filename: 'wiro-4x4-tour.ics',
          content: Buffer.from(icsContent).toString('base64'),
        }
      ];
    }
    
    const resend = getResend();
    if (!resend) {
      console.warn('[Customer Email] Resend API key not configured, skipping email');
      return false;
    }

    const { data, error } = await resend.emails.send(emailData);
    
    if (error) {
      console.error('[Customer Email] Error sending confirmation:', error);
      return false;
    }
    
    console.log(`[Customer Email] Confirmation sent to ${booking.customerEmail}. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error('[Customer Email] Error in sendCustomerConfirmation:', error);
    return false;
  }
}
