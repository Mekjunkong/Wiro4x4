import { notifyOwner } from "./_core/notification";

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
  if (data.includesHotels) services.push("Hotels");
  if (data.includesGuide) services.push("Hebrew-speaking Guide");
  if (data.includesTrip) services.push("4x4 Trip");
  if (data.includesFood) services.push("Kosher Meals");
  if (data.needsShabbatHotel) services.push("Shabbat Hotel");
  return services.length > 0 ? services.join(", ") : "None selected";
}

/**
 * Send notification to owner when a new booking is received
 */
export async function sendNewBookingNotification(data: BookingEmailData): Promise<boolean> {
  const title = `🎉 New Booking: ${data.contactName}`;
  
  const content = `
**New Tour Booking Received!**

**Customer Details:**
- Name: ${data.contactName}
- Email: ${data.contactEmail}
- Phone: ${data.contactPhone}

**Trip Details:**
- Arrival: ${formatDate(data.arrivalDate)}
- Departure: ${formatDate(data.departureDate)}
- Adults: ${data.numberOfAdults}
- Children: ${data.numberOfChildren || 0}

**Services Requested:**
${formatServices(data)}

**Logistics:**
- Pickup: ${data.pickupPoint}
- Dropoff: ${data.dropoffPoint}
${data.suggestedDestinations ? `- Destinations: ${data.suggestedDestinations}` : ''}

${data.specialRequests ? `**Special Requests:**\n${data.specialRequests}` : ''}

---
Please respond to this inquiry within 24 hours.
  `.trim();

  try {
    const result = await notifyOwner({ title, content });
    if (result) {
      console.log(`[Email] New booking notification sent for ${data.contactName}`);
    }
    return result;
  } catch (error) {
    console.error("[Email] Failed to send new booking notification:", error);
    return false;
  }
}

/**
 * Send notification when booking status changes
 */
export async function sendBookingStatusNotification(
  bookingId: number,
  customerName: string,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  const title = `📋 Booking #${bookingId} Status Updated`;
  
  const content = `
**Booking Status Change**

- Booking ID: #${bookingId}
- Customer: ${customerName}
- Previous Status: ${oldStatus}
- New Status: ${newStatus}

${newStatus === 'confirmed' ? '✅ This booking has been confirmed!' : ''}
${newStatus === 'cancelled' ? '❌ This booking has been cancelled.' : ''}
${newStatus === 'completed' ? '🎉 This booking has been completed!' : ''}
  `.trim();

  try {
    const result = await notifyOwner({ title, content });
    return result;
  } catch (error) {
    console.error("[Email] Failed to send status notification:", error);
    return false;
  }
}

/**
 * Send daily summary of bookings
 */
export async function sendDailySummaryNotification(
  totalBookings: number,
  pendingBookings: number,
  confirmedBookings: number,
  upcomingArrivals: Array<{ name: string; date: Date }>
): Promise<boolean> {
  const title = `📊 Daily Booking Summary - ${new Date().toLocaleDateString()}`;
  
  const arrivalsText = upcomingArrivals.length > 0
    ? upcomingArrivals.map(a => `- ${a.name} (${formatDate(a.date)})`).join('\n')
    : 'No arrivals in the next 7 days';

  const content = `
**Daily Booking Summary**

**Overview:**
- Total Bookings: ${totalBookings}
- Pending: ${pendingBookings}
- Confirmed: ${confirmedBookings}

**Upcoming Arrivals (Next 7 Days):**
${arrivalsText}

---
Have a great day!
  `.trim();

  try {
    const result = await notifyOwner({ title, content });
    return result;
  } catch (error) {
    console.error("[Email] Failed to send daily summary:", error);
    return false;
  }
}
