const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SENDGRID_API_KEY not set - emails will be logged to console only');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@wiro4x4tour.com';
const COMPANY_NAME = 'Wiro 4x4 Tour';

/**
 * Base email sending function
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content
 * @param {string} params.text - Plain text content (fallback)
 */
async function sendEmail({ to, subject, html, text }) {
  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: COMPANY_NAME
    },
    subject,
    text: text || stripHtml(html),
    html
  };

  try {
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send(msg);
      console.log(`✅ Email sent to ${to}: ${subject}`);
      return { success: true, message: 'Email sent successfully' };
    } else {
      // Development mode - log email instead of sending
      console.log('\n📧 === EMAIL (DEV MODE - NOT SENT) ===');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`\n${text || stripHtml(html)}`);
      console.log('=================================\n');
      return { success: true, message: 'Email logged (dev mode)' };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, '')
    .replace(/<[^>]+>/gm, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Format currency for Thai Baht
 */
function formatCurrency(amount) {
  return `฿${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Format date for emails
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ============= EMAIL TEMPLATES =============

/**
 * Send inquiry received confirmation to customer
 */
async function sendInquiryReceivedEmail(lead) {
  const subject = `Thank you for your inquiry - ${COMPANY_NAME}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2c3e50; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🚙 ${COMPANY_NAME}</h1>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #2c3e50;">Hello ${lead.customerName}!</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Thank you for your inquiry about our 4x4 tour experiences in Thailand.
          We've received your request and our team will be in touch shortly.
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Your Inquiry Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #7f8c8d;"><strong>Travel Dates:</strong></td>
              <td style="padding: 8px 0; color: #2c3e50;">${formatDate(lead.preferredStartDate)} - ${formatDate(lead.preferredEndDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7f8c8d;"><strong>Travelers:</strong></td>
              <td style="padding: 8px 0; color: #2c3e50;">${lead.numberOfAdults} Adult(s)${lead.numberOfChildren > 0 ? `, ${lead.numberOfChildren} Child(ren)` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7f8c8d;"><strong>Duration:</strong></td>
              <td style="padding: 8px 0; color: #2c3e50;">${lead.duration} Day(s)</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          We'll review your requirements and send you a personalized quote within 24 hours.
        </p>

        <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">
          If you have any questions, feel free to reply to this email or contact us directly.
        </p>
      </div>

      <div style="background: #34495e; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 5px 0;">${COMPANY_NAME}</p>
        <p style="margin: 5px 0;">Unforgettable 4x4 Adventures in Thailand</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: lead.customerEmail,
    subject,
    html
  });
}

/**
 * Send quote to customer
 */
async function sendQuoteEmail(lead, quote) {
  const subject = `Your Custom Tour Quote - ${COMPANY_NAME}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #27ae60; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🚙 ${COMPANY_NAME}</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Your Personalized Tour Quote</p>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #2c3e50;">Hello ${lead.customerName}!</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          We're excited to share your customized tour package. Here's what we've prepared for you:
        </p>

        <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
          <h3 style="color: #27ae60; margin-top: 0;">${quote.packageName}</h3>
          <p style="color: #7f8c8d; margin: 5px 0;">
            ${quote.duration}-day adventure • ${quote.totalPeople} traveler(s) • ${quote.season} season
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Price Breakdown:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d; border-bottom: 1px solid #eee;">Accommodation (${quote.hotelLevel})</td>
              <td style="padding: 10px 0; color: #2c3e50; text-align: right; border-bottom: 1px solid #eee;">${formatCurrency(quote.costs.accommodation)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d; border-bottom: 1px solid #eee;">Meals & Dining</td>
              <td style="padding: 10px 0; color: #2c3e50; text-align: right; border-bottom: 1px solid #eee;">${formatCurrency(quote.costs.meals)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d; border-bottom: 1px solid #eee;">Professional Guide</td>
              <td style="padding: 10px 0; color: #2c3e50; text-align: right; border-bottom: 1px solid #eee;">${formatCurrency(quote.costs.guide)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d; border-bottom: 1px solid #eee;">4x4 Transport</td>
              <td style="padding: 10px 0; color: #2c3e50; text-align: right; border-bottom: 1px solid #eee;">${formatCurrency(quote.costs.transport)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d; border-bottom: 2px solid #27ae60;">Attractions & Activities</td>
              <td style="padding: 10px 0; color: #2c3e50; text-align: right; border-bottom: 2px solid #27ae60;">${formatCurrency(quote.costs.attractions)}</td>
            </tr>
            <tr>
              <td style="padding: 15px 0; color: #27ae60; font-size: 18px; font-weight: bold;">Total Price</td>
              <td style="padding: 15px 0; color: #27ae60; font-size: 24px; font-weight: bold; text-align: right;">${formatCurrency(quote.quotedPrice)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-weight: 500;">
            ⏰ This quote is valid until ${formatDate(quote.validUntil)}
          </p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Ready to book this amazing adventure? Reply to this email or contact us to confirm your booking!
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${FROM_EMAIL}?subject=Booking%20Confirmation%20-%20${quote.packageName}"
             style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Confirm Your Booking
          </a>
        </div>
      </div>

      <div style="background: #34495e; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 5px 0;">${COMPANY_NAME}</p>
        <p style="margin: 5px 0;">Creating Memories, One Adventure at a Time</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: lead.customerEmail,
    subject,
    html
  });
}

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmationEmail(booking) {
  const subject = `Booking Confirmed! Get Ready for Your Adventure - ${COMPANY_NAME}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3498db; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🎉 Booking Confirmed!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">${COMPANY_NAME}</p>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #2c3e50;">Hello ${booking.contactName}!</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Your booking has been confirmed! We're thrilled to have you join us for an unforgettable 4x4 adventure in Thailand.
        </p>

        <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 2px solid #3498db;">
          <h3 style="color: #3498db; margin-top: 0;">📅 Your Tour Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d;"><strong>Booking ID:</strong></td>
              <td style="padding: 10px 0; color: #2c3e50;">${booking._id}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d;"><strong>Start Date:</strong></td>
              <td style="padding: 10px 0; color: #2c3e50;">${formatDate(booking.pickupDate)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d;"><strong>End Date:</strong></td>
              <td style="padding: 10px 0; color: #2c3e50;">${formatDate(booking.endDate)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d;"><strong>Travelers:</strong></td>
              <td style="padding: 10px 0; color: #2c3e50;">${booking.numberOfAdults} Adult(s)${booking.hasChildren ? `, ${booking.numberOfChildren} Child(ren)` : ''}</td>
            </tr>
            ${booking.packageName ? `
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d;"><strong>Package:</strong></td>
              <td style="padding: 10px 0; color: #2c3e50;">${booking.packageName}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #155724;">What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #155724;">
            <li style="margin: 5px 0;">You'll receive a detailed itinerary within 48 hours</li>
            <li style="margin: 5px 0;">We'll contact you 7 days before departure with final details</li>
            <li style="margin: 5px 0;">Our team is available 24/7 for any questions</li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Have questions? Need to make changes? Just reply to this email and we'll help you out!
        </p>
      </div>

      <div style="background: #34495e; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 5px 0;">${COMPANY_NAME}</p>
        <p style="margin: 5px 0;">Your Adventure Awaits!</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: booking.contactEmail,
    subject,
    html
  });
}

/**
 * Send tour reminder email (7 days before)
 */
async function sendTourReminderEmail(booking) {
  const subject = `Your Tour Starts Soon! Final Details - ${COMPANY_NAME}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #e67e22; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">⏰ Your Tour is Coming Up!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">${COMPANY_NAME}</p>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #2c3e50;">Hello ${booking.contactName}!</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          We're excited to see you soon! Your 4x4 adventure starts in just 7 days.
        </p>

        <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e67e22;">
          <h3 style="color: #e67e22; margin-top: 0;">📍 Pickup Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d;"><strong>Date & Time:</strong></td>
              <td style="padding: 10px 0; color: #2c3e50;">${formatDate(booking.pickupDate)} at 8:00 AM</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7f8c8d;"><strong>Location:</strong></td>
              <td style="padding: 10px 0; color: #2c3e50;">${booking.pickupPoint === 'airport' ? 'Airport Arrivals' : booking.pickupHotelName || 'Your Hotel'}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #856404;">🎒 What to Bring:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li>Comfortable clothing and sturdy shoes</li>
            <li>Sunscreen and hat</li>
            <li>Camera for amazing photos</li>
            <li>Water bottle (we'll refill it)</li>
            <li>Light jacket for air-conditioned vehicle</li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Our guide will contact you 24 hours before pickup to confirm all details.
        </p>
      </div>

      <div style="background: #34495e; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 5px 0;">${COMPANY_NAME}</p>
        <p style="margin: 5px 0;">See you soon!</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: booking.contactEmail,
    subject,
    html
  });
}

/**
 * Send feedback request email (after tour completion)
 */
async function sendFeedbackRequestEmail(booking) {
  const subject = `How was your adventure? We'd love your feedback! - ${COMPANY_NAME}`;

  const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/feedback/${booking._id}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #9b59b6; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">⭐ Share Your Experience</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">${COMPANY_NAME}</p>
      </div>

      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #2c3e50;">Hello ${booking.contactName}!</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          We hope you had an amazing time on your 4x4 adventure with us!
          Your feedback helps us continue to provide unforgettable experiences.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${feedbackUrl}"
             style="background: #9b59b6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
            Share Your Feedback
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #7f8c8d; text-align: center;">
          It only takes 2 minutes, and it means the world to us! 🙏
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <p style="color: #9b59b6; font-weight: bold; margin: 0 0 10px 0;">Did you have a great time?</p>
          <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
            Share your experience with your friends and family!<br>
            We'd love to host them on their next adventure.
          </p>
        </div>
      </div>

      <div style="background: #34495e; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 5px 0;">${COMPANY_NAME}</p>
        <p style="margin: 5px 0;">Thank you for choosing us!</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: booking.contactEmail,
    subject,
    html
  });
}

module.exports = {
  sendEmail,
  sendInquiryReceivedEmail,
  sendQuoteEmail,
  sendBookingConfirmationEmail,
  sendTourReminderEmail,
  sendFeedbackRequestEmail,
  formatCurrency,
  formatDate
};
