import { Resend } from 'resend';

// Lazily initialize Resend so tests don't crash when RESEND_API_KEY is unset
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Email recipients for booking notifications
// NOTE: Until a custom domain is verified at resend.com/domains, 
// emails can only be sent to the account owner's email (wiro.adventures@gmail.com)
// After domain verification, add pasuthunjunkong@gmail.com back to this list
const NOTIFICATION_RECIPIENTS = [
  'wiro.adventures@gmail.com'
  // 'pasuthunjunkong@gmail.com' // Add after domain verification
];

// Sender email - using Resend's default for unverified domains
// After verifying a domain (e.g., wiro4x4.com), change to: 'WIRO 4x4 Bookings <bookings@wiro4x4.com>'
const SENDER_EMAIL = 'WIRO 4x4 Bookings <onboarding@resend.dev>';

export interface BookingEmailData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  arrivalDate: Date;
  departureDate: Date;
  numberOfAdults: number;
  numberOfChildren?: number;
  includesHotels: boolean;
  includesGuide: boolean;
  includesTrip: boolean;
  includesFood: boolean;
  needsShabbatHotel: boolean;
  pickupPoint: string;
  dropoffPoint: string;
  suggestedDestinations?: string;
  specialRequests?: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatServices(data: BookingEmailData): string {
  const services: string[] = [];
  if (data.includesHotels) services.push("🏨 Hotels");
  if (data.includesGuide) services.push("🗣️ Hebrew-speaking Guide");
  if (data.includesTrip) services.push("🚙 4x4 Trip");
  if (data.includesFood) services.push("🍽️ Kosher Meals");
  if (data.needsShabbatHotel) services.push("✡️ Shabbat Hotel");
  return services.length > 0 ? services.join("<br>") : "None selected";
}

/**
 * Send email notification when a new booking is received
 */
export async function sendNewBookingEmail(data: BookingEmailData): Promise<boolean> {
  const subject = `🎉 New Booking Request: ${data.contactName}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🚙 WIRO 4x4</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">New Booking Request Received!</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <h2 style="color: #1a4d2e; margin-top: 0;">📋 Customer Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Name:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.contactName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.contactEmail}" style="color: #1a4d2e;">${data.contactEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Phone:</td>
            <td style="padding: 8px 0;"><a href="tel:${data.contactPhone}" style="color: #1a4d2e;">${data.contactPhone}</a></td>
          </tr>
        </table>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <h2 style="color: #1a4d2e;">📅 Trip Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Arrival:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formatDate(data.arrivalDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Departure:</td>
            <td style="padding: 8px 0; font-weight: bold;">${formatDate(data.departureDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Group Size:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.numberOfAdults} Adults${data.numberOfChildren ? `, ${data.numberOfChildren} Children` : ''}</td>
          </tr>
        </table>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <h2 style="color: #1a4d2e;">✨ Services Requested</h2>
        <p style="line-height: 1.8;">${formatServices(data)}</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <h2 style="color: #1a4d2e;">📍 Logistics</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Pickup:</td>
            <td style="padding: 8px 0;">${data.pickupPoint}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Dropoff:</td>
            <td style="padding: 8px 0;">${data.dropoffPoint}</td>
          </tr>
          ${data.suggestedDestinations ? `
          <tr>
            <td style="padding: 8px 0; color: #666;">Destinations:</td>
            <td style="padding: 8px 0;">${data.suggestedDestinations}</td>
          </tr>
          ` : ''}
        </table>
        
        ${data.specialRequests ? `
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <h2 style="color: #1a4d2e;">💬 Special Requests</h2>
        <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #d4af37;">${data.specialRequests}</p>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          💡 <strong>Note:</strong> Please also forward this to pasuthunjunkong@gmail.com until domain verification is complete.
        </p>
      </div>
      
      <div style="background: #1a4d2e; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">⏰ Please respond to this inquiry within 24 hours</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">WIRO 4x4 - Kosher Off-Road Adventures in Chiang Mai</p>
      </div>
    </div>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      console.warn("[Resend] API key not configured, skipping email");
      return false;
    }

    const { data: result, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: NOTIFICATION_RECIPIENTS,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("[Resend] Failed to send new booking email:", error);
      return false;
    }

    console.log(`[Resend] New booking email sent successfully. ID: ${result?.id}`);
    return true;
  } catch (error) {
    console.error("[Resend] Error sending new booking email:", error);
    return false;
  }
}

/**
 * Send email notification when booking status changes
 */
export async function sendBookingStatusEmail(
  bookingId: number,
  customerName: string,
  customerEmail: string,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  const statusEmoji: Record<string, string> = {
    pending: '⏳',
    confirmed: '✅',
    cancelled: '❌',
    completed: '🎉',
    in_progress: '🚙'
  };

  const subject = `${statusEmoji[newStatus] || '📋'} Booking #${bookingId} Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🚙 WIRO 4x4</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Booking Status Update</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0;">
        <h2 style="color: #1a4d2e; margin-top: 0;">Booking #${bookingId}</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #666;">Customer:</td>
            <td style="padding: 12px 0; font-weight: bold;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #666;">Email:</td>
            <td style="padding: 12px 0;"><a href="mailto:${customerEmail}" style="color: #1a4d2e;">${customerEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #666;">Previous Status:</td>
            <td style="padding: 12px 0;">${statusEmoji[oldStatus] || ''} ${oldStatus}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #666;">New Status:</td>
            <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">${statusEmoji[newStatus] || ''} ${newStatus.toUpperCase()}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #1a4d2e; color: white; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="margin: 0; font-size: 12px; opacity: 0.8;">WIRO 4x4 - Kosher Off-Road Adventures in Chiang Mai</p>
      </div>
    </div>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      console.warn("[Resend] API key not configured, skipping email");
      return false;
    }

    const { data: result, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: NOTIFICATION_RECIPIENTS,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("[Resend] Failed to send status email:", error);
      return false;
    }

    console.log(`[Resend] Status email sent successfully. ID: ${result?.id}`);
    return true;
  } catch (error) {
    console.error("[Resend] Error sending status email:", error);
    return false;
  }
}

/**
 * Test the Resend API connection
 */
export async function testResendConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, message: "Resend API key not configured" };
    }

    // Try to send a test email to verify the API key works
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: NOTIFICATION_RECIPIENTS[0], // Send test to first recipient only
      subject: '🔧 WIRO 4x4 Email Test',
      html: '<p>This is a test email to verify the Resend integration is working correctly.</p>',
    });

    if (error) {
      return { success: false, message: `Resend API error: ${error.message}` };
    }

    return { success: true, message: `Email sent successfully. ID: ${data?.id}` };
  } catch (error) {
    return { success: false, message: `Connection error: ${error}` };
  }
}
