import { afterEach, describe, expect, it, vi } from "vitest";
import {
  executeN8nAction,
  getN8nBookingSnapshot,
  getN8nLeadSnapshot,
} from "./n8n";
import {
  getAbandonedLeads,
  getAllActiveSubscribers,
  getBookingById,
  getBookingsNeedingReminder,
  getLeadById,
  hasRecentAuditLog,
  markReminderSent,
  markRecoveryEmailSent,
  logAdminAction,
  updateBooking,
  updateLead,
} from "../db";
import { sendAbandonedBookingEmail } from "../abandonedBookingService";
import { sendBookingReminder } from "../customerEmailService";
import { sendNewsletterEmail } from "../newsletterEmailService";
import { sendWhatsAppMessage } from "../whatsappService";
import {
  processDuePostTourReviewRequests,
  schedulePostTourReviewForBooking,
} from "../postTourReviewService";
import { notifyOwner } from "../_core/notification";

vi.mock("../db", () => ({
  getBookingById: vi.fn(),
  getBookingsNeedingFeedback: vi.fn(),
  getBookingsNeedingReminder: vi.fn(),
  getColdContactedLeads: vi.fn(),
  getAbandonedLeads: vi.fn(),
  getAllActiveSubscribers: vi.fn(),
  getLeadById: vi.fn(),
  getLeadSlaBreaches: vi.fn(),
  getNewLeadCount: vi.fn(),
  getPendingBookingCount: vi.fn(),
  getRecentFailedWhatsAppMessages: vi.fn(),
  getStaleNewLeads: vi.fn(),
  getUpcomingTourCount: vi.fn(),
  getWeeklyPostTourReviewMetrics: vi.fn(),
  hasRecentAuditLog: vi.fn(),
  logAdminAction: vi.fn(),
  markReminderSent: vi.fn(),
  markRecoveryEmailSent: vi.fn(),
  updateBooking: vi.fn(),
  updateLead: vi.fn(),
}));

vi.mock("../abandonedBookingService", () => ({
  sendAbandonedBookingEmail: vi.fn(),
}));

vi.mock("../customerEmailService", () => ({
  sendBookingReminder: vi.fn(),
}));

vi.mock("../newsletterEmailService", () => ({
  sendNewsletterEmail: vi.fn(),
}));

vi.mock("../whatsappService", () => ({
  sendWhatsAppMessage: vi.fn(),
}));

vi.mock("../postTourReviewService", () => ({
  processDuePostTourReviewRequests: vi.fn(),
  schedulePostTourReviewForBooking: vi.fn(),
}));

vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("executeN8nAction", () => {
  it("returns a no-op system ping without side effects", async () => {
    const result = await executeN8nAction({
      action: "system.ping",
      client: "test-suite",
    });

    expect(result).toMatchObject({
      action: "system.ping",
      changed: false,
      pong: true,
      client: "test-suite",
    });
    expect(logAdminAction).not.toHaveBeenCalled();
    expect(notifyOwner).not.toHaveBeenCalled();
  });

  it("updates a lead with bounded n8n fields", async () => {
    vi.mocked(updateLead).mockResolvedValue({} as never);

    const result = await executeN8nAction({
      action: "lead.update",
      leadId: 12,
      status: "contacted",
      notes: "n8n sent first follow-up reminder",
    });

    expect(updateLead).toHaveBeenCalledWith(12, {
      status: "contacted",
      notes: "n8n sent first follow-up reminder",
    });
    expect(result).toEqual({
      action: "lead.update",
      changed: true,
      leadId: 12,
    });
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        action: "n8n.lead.update",
        resourceType: "lead",
        resourceId: 12,
      })
    );
  });

  it("updates a booking and schedules review when marked completed", async () => {
    vi.mocked(updateBooking).mockResolvedValue({} as never);
    vi.mocked(schedulePostTourReviewForBooking).mockResolvedValue({
      id: 1,
      bookingId: 44,
      customerName: "Dana",
      contactWhatsApp: "+66999999999",
      contactEmail: null,
      language: "en",
      status: "scheduled",
      scheduledAt: new Date("2026-06-02T00:00:00.000Z"),
      sentAt: null,
      openedAt: null,
      clickedAt: null,
      reviewedAt: null,
      lowRatingAt: null,
      escalatedAt: null,
      whatsappMessageId: null,
      reviewUrl: null,
      opsFollowUpUrl: null,
      rating: null,
      reviewText: null,
    });

    const result = await executeN8nAction({
      action: "booking.update",
      bookingId: 44,
      status: "completed",
      notes: "Tour completed from n8n ops checklist",
    });

    expect(updateBooking).toHaveBeenCalledWith(44, {
      status: "completed",
      notes: "Tour completed from n8n ops checklist",
    });
    expect(schedulePostTourReviewForBooking).toHaveBeenCalledWith({
      bookingId: 44,
      completedAt: expect.any(Date),
    });
    expect(result).toEqual({
      action: "booking.update",
      changed: true,
      bookingId: 44,
    });
  });

  it("sends a single booking reminder and marks it sent", async () => {
    vi.mocked(getBookingById).mockResolvedValue({
      id: 44,
      contactName: "Dana",
      contactEmail: "dana@example.com",
      contactPhone: "+66999999999",
      contactWhatsApp: null,
      agentName: "Nok",
      arrivalDate: new Date("2026-06-10T02:00:00.000Z"),
      departureDate: new Date("2026-06-12T08:00:00.000Z"),
      numberOfAdults: 2,
      hasChildren: 0,
      numberOfChildren: 1,
      childrenAges: null,
      includesHotels: 1,
      hotelPreferences: null,
      includesGuide: 1,
      includesTrip: 1,
      includesAttractions: 0,
      selectedAttractions: null,
      includesFood: 1,
      foodPreferences: null,
      needsShabbatHotel: 1,
      shabbatHotel: null,
      selfDriving4x4: 0,
      pickupPoint: "hotel",
      customPickupLocation: null,
      dropoffPoint: "airport",
      customDropoffLocation: null,
      suggestedDestinations: null,
      specialRequests: "Vegetarian meals",
      dietaryRestrictions: null,
      budget: null,
      status: "confirmed",
      totalPrice: 45000,
      depositPaid: 10000,
      balancePaid: 0,
      assignedAgentId: 7,
      reminderSentAt: null,
      feedbackSentAt: null,
      postTourEmailSentAt: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      source: "website",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(sendBookingReminder).mockResolvedValue(true);
    vi.mocked(markReminderSent).mockResolvedValue({} as never);

    const result = await executeN8nAction({
      action: "booking.send_reminder",
      bookingId: 44,
    });

    expect(sendBookingReminder).toHaveBeenCalledWith({
      customerName: "Dana",
      customerEmail: "dana@example.com",
      tourDate: "2026-06-10T02:00:00.000Z",
      tourType: "Custom Tour",
      groupSize: 3,
      pickupLocation: "hotel",
      pickupTime: "08:00",
      specialRequests: "Vegetarian meals",
      bookingId: "WIRO-44",
    });
    expect(markReminderSent).toHaveBeenCalledWith(44);
    expect(result).toEqual({
      action: "booking.send_reminder",
      changed: true,
      bookingId: 44,
      sent: true,
      channel: "email",
    });
  });

  it("falls back to WhatsApp for a booking reminder when email does not send", async () => {
    vi.mocked(getBookingById).mockResolvedValue({
      id: 45,
      contactName: "Noa",
      contactEmail: "noa@example.com",
      contactPhone: "+66888887777",
      contactWhatsApp: null,
      agentName: null,
      arrivalDate: new Date("2026-06-10T02:00:00.000Z"),
      departureDate: new Date("2026-06-10T08:00:00.000Z"),
      numberOfAdults: 2,
      hasChildren: 0,
      numberOfChildren: null,
      childrenAges: null,
      includesHotels: 1,
      hotelPreferences: null,
      includesGuide: 1,
      includesTrip: 1,
      includesAttractions: 0,
      selectedAttractions: null,
      includesFood: 1,
      foodPreferences: null,
      needsShabbatHotel: 0,
      shabbatHotel: null,
      pickupPoint: "hotel",
      specialRequests: null,
      dietaryRestrictions: null,
      budget: null,
      status: "confirmed",
      totalPrice: 45000,
      depositPaid: 10000,
      balancePaid: 0,
      assignedAgentId: 7,
      reminderSentAt: null,
      feedbackSentAt: null,
      postTourEmailSentAt: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      source: "website",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(sendBookingReminder).mockResolvedValue(false);
    vi.mocked(sendWhatsAppMessage).mockResolvedValue("wamid.test");
    vi.mocked(markReminderSent).mockResolvedValue({} as never);

    const result = await executeN8nAction({
      action: "booking.send_reminder",
      bookingId: 45,
    });

    expect(sendBookingReminder).toHaveBeenCalledTimes(1);
    expect(sendWhatsAppMessage).toHaveBeenCalledWith(
      "66888887777",
      expect.stringContaining("WIRO 4x4 tour reminder")
    );
    expect(markReminderSent).toHaveBeenCalledWith(45);
    expect(result).toEqual({
      action: "booking.send_reminder",
      changed: true,
      bookingId: 45,
      sent: true,
      channel: "whatsapp",
    });
  });

  it("sends due booking reminders in a capped batch", async () => {
    vi.mocked(getBookingsNeedingReminder).mockResolvedValue([
      {
        id: 51,
        contactName: "Ari",
        contactEmail: "ari@example.com",
        contactPhone: "+66888888888",
        contactWhatsApp: null,
        agentName: null,
        arrivalDate: new Date("2026-06-11T02:00:00.000Z"),
        departureDate: new Date("2026-06-12T08:00:00.000Z"),
        numberOfAdults: 2,
        hasChildren: 0,
        numberOfChildren: null,
        childrenAges: null,
        includesHotels: 1,
        hotelPreferences: null,
        includesGuide: 1,
        includesTrip: 1,
        includesAttractions: 0,
        selectedAttractions: null,
        includesFood: 1,
        foodPreferences: null,
        needsShabbatHotel: 0,
        shabbatHotel: null,
        selfDriving4x4: 0,
        pickupPoint: "hotel",
        customPickupLocation: null,
        dropoffPoint: "airport",
        customDropoffLocation: null,
        suggestedDestinations: null,
        specialRequests: null,
        dietaryRestrictions: null,
        budget: null,
        status: "confirmed",
        totalPrice: null,
        depositPaid: 0,
        balancePaid: 0,
        assignedAgentId: null,
        reminderSentAt: null,
        feedbackSentAt: null,
        postTourEmailSentAt: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        source: "website",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 52,
        contactName: "No Email",
        contactEmail: null,
        contactPhone: "+66777777777",
        contactWhatsApp: null,
        agentName: null,
        arrivalDate: new Date("2026-06-11T03:00:00.000Z"),
        departureDate: new Date("2026-06-12T09:00:00.000Z"),
        numberOfAdults: 1,
        hasChildren: 0,
        numberOfChildren: null,
        childrenAges: null,
        includesHotels: 0,
        hotelPreferences: null,
        includesGuide: 1,
        includesTrip: 1,
        includesAttractions: 0,
        selectedAttractions: null,
        includesFood: 1,
        foodPreferences: null,
        needsShabbatHotel: 0,
        shabbatHotel: null,
        selfDriving4x4: 0,
        pickupPoint: "hotel",
        customPickupLocation: null,
        dropoffPoint: "airport",
        customDropoffLocation: null,
        suggestedDestinations: null,
        specialRequests: null,
        dietaryRestrictions: null,
        budget: null,
        status: "confirmed",
        totalPrice: null,
        depositPaid: 0,
        balancePaid: 0,
        assignedAgentId: null,
        reminderSentAt: null,
        feedbackSentAt: null,
        postTourEmailSentAt: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        source: "website",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    vi.mocked(sendBookingReminder).mockResolvedValue(true);
    vi.mocked(sendWhatsAppMessage).mockResolvedValue("wamid.batch");
    vi.mocked(markReminderSent).mockResolvedValue({} as never);

    const result = await executeN8nAction({
      action: "booking.send_due_reminders",
      limit: 2,
    });

    expect(sendBookingReminder).toHaveBeenCalledTimes(1);
    expect(sendWhatsAppMessage).toHaveBeenCalledWith(
      "66777777777",
      expect.stringContaining("WIRO 4x4 tour reminder")
    );
    expect(markReminderSent).toHaveBeenCalledWith(51);
    expect(markReminderSent).toHaveBeenCalledWith(52);
    expect(result).toEqual({
      action: "booking.send_due_reminders",
      changed: true,
      attempted: 2,
      sent: 2,
      failed: 0,
      skipped: 0,
      bookingIds: [51, 52],
    });
  });

  it("schedules a post-tour review request", async () => {
    const entry = {
      id: 2,
      bookingId: 88,
      customerName: "Ari",
      contactWhatsApp: "+66888888888",
      contactEmail: "ari@example.com",
      language: "en",
      status: "scheduled",
      scheduledAt: new Date("2026-06-02T00:30:00.000Z"),
      sentAt: null,
      openedAt: null,
      clickedAt: null,
      reviewedAt: null,
      lowRatingAt: null,
      escalatedAt: null,
      whatsappMessageId: null,
      reviewUrl: null,
      opsFollowUpUrl: null,
      rating: null,
      reviewText: null,
    };
    vi.mocked(schedulePostTourReviewForBooking).mockResolvedValue(entry);

    const result = await executeN8nAction({
      action: "post_tour_review.schedule",
      bookingId: 88,
      delayMinutes: 45,
    });

    expect(schedulePostTourReviewForBooking).toHaveBeenCalledWith({
      bookingId: 88,
      delayMinutes: 45,
    });
    expect(result).toEqual({
      action: "post_tour_review.schedule",
      changed: true,
      bookingId: 88,
      entry,
    });
  });

  it("processes due post-tour review requests", async () => {
    vi.mocked(processDuePostTourReviewRequests).mockResolvedValue({
      processed: 3,
      sent: 2,
      pending: 1,
    });

    const result = await executeN8nAction({
      action: "post_tour_review.process_due",
    });

    expect(processDuePostTourReviewRequests).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      action: "post_tour_review.process_due",
      changed: true,
      result: { processed: 3, sent: 2, pending: 1 },
    });
  });

  it("sends a single abandoned recovery email", async () => {
    vi.mocked(getAbandonedLeads).mockResolvedValue([
      {
        id: 5,
        name: "Noam",
        email: "noam@example.com",
        phone: null,
        source: "website",
        interestedTours: null,
        message: null,
        status: "new",
        convertedToBookingId: null,
        notes: null,
        score: 0,
        scoreDetails: null,
        lastScoredAt: null,
        recoveryEmailSentAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    vi.mocked(sendAbandonedBookingEmail).mockResolvedValue(true);
    vi.mocked(markRecoveryEmailSent).mockResolvedValue({} as never);

    const result = await executeN8nAction({
      action: "abandoned.send_recovery",
      leadId: 5,
    });

    expect(sendAbandonedBookingEmail).toHaveBeenCalledTimes(1);
    expect(markRecoveryEmailSent).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      action: "abandoned.send_recovery",
      changed: true,
      leadId: 5,
      sent: true,
      channel: "email",
    });
  });

  it("falls back to WhatsApp for abandoned recovery when email does not send", async () => {
    vi.mocked(getAbandonedLeads).mockResolvedValue([
      {
        id: 6,
        name: "Maya",
        email: "maya@example.com",
        phone: "+66999990000",
        source: "website",
        interestedTours: null,
        message: "Need a kosher family route",
        status: "new",
        convertedToBookingId: null,
        notes: null,
        score: 0,
        scoreDetails: null,
        lastScoredAt: null,
        recoveryEmailSentAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    vi.mocked(sendAbandonedBookingEmail).mockResolvedValue(false);
    vi.mocked(sendWhatsAppMessage).mockResolvedValue("wamid.recovery");
    vi.mocked(markRecoveryEmailSent).mockResolvedValue({} as never);

    const result = await executeN8nAction({
      action: "abandoned.send_recovery",
      leadId: 6,
    });

    expect(sendAbandonedBookingEmail).toHaveBeenCalledTimes(1);
    expect(sendWhatsAppMessage).toHaveBeenCalledWith(
      "66999990000",
      expect.stringContaining("finish the plan")
    );
    expect(markRecoveryEmailSent).toHaveBeenCalledWith(6);
    expect(result).toEqual({
      action: "abandoned.send_recovery",
      changed: true,
      leadId: 6,
      sent: true,
      channel: "whatsapp",
    });
  });

  it("sends a newsletter to active subscribers", async () => {
    vi.mocked(getAllActiveSubscribers).mockResolvedValue([
      {
        id: 1,
        email: "guest@example.com",
        name: "Guest",
        language: "en",
        isActive: 1,
        subscribedAt: new Date(),
      },
    ]);
    vi.mocked(sendNewsletterEmail).mockResolvedValue(1);

    const result = await executeN8nAction({
      action: "newsletter.send",
      blogPostId: 77,
      subject: "New Chiang Mai route",
    });

    expect(sendNewsletterEmail).toHaveBeenCalledWith(
      77,
      expect.any(Array),
      "New Chiang Mai route"
    );
    expect(result).toEqual({
      action: "newsletter.send",
      changed: true,
      blogPostId: 77,
      sent: 1,
    });
  });

  it("sends an owner notification from n8n", async () => {
    vi.mocked(hasRecentAuditLog).mockResolvedValue(false);
    vi.mocked(notifyOwner).mockResolvedValue(true);

    const result = await executeN8nAction({
      action: "ops.notify",
      title: "Lead still waiting",
      content: "Lead #12 is still new after 10 minutes.",
      priority: "urgent",
      resourceType: "lead",
      resourceId: 12,
      dedupeKey: "lead-sla:12",
      cooldownMinutes: 60,
    });

    expect(hasRecentAuditLog).toHaveBeenCalledWith({
      action: "n8n.ops.notify",
      resourceType: "n8nNotification",
      resourceId: expect.any(Number),
      since: expect.any(Date),
    });
    expect(notifyOwner).toHaveBeenCalledWith({
      title: "[URGENT] Lead still waiting",
      content: "Lead #12 is still new after 10 minutes.\nResource: lead #12",
    });
    expect(result).toEqual({
      action: "ops.notify",
      changed: true,
      delivered: true,
      priority: "urgent",
    });
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        action: "n8n.ops.notify",
        resourceType: "n8nNotification",
        resourceId: expect.any(Number),
      })
    );
  });

  it("dedupes owner notifications inside the n8n cooldown window", async () => {
    vi.mocked(hasRecentAuditLog).mockResolvedValue(true);

    const result = await executeN8nAction({
      action: "ops.notify",
      title: "Lead still waiting",
      content: "Lead #12 is still new after 10 minutes.",
      priority: "urgent",
      resourceType: "lead",
      resourceId: 12,
      dedupeKey: "lead-sla:12",
      cooldownMinutes: 60,
    });

    expect(notifyOwner).not.toHaveBeenCalled();
    expect(logAdminAction).not.toHaveBeenCalled();
    expect(result).toEqual({
      action: "ops.notify",
      changed: false,
      delivered: false,
      deduped: true,
      priority: "urgent",
    });
  });
});

describe("n8n lookup snapshots", () => {
  it("returns a sanitized lead snapshot for wait/check workflows", async () => {
    vi.mocked(getLeadById).mockResolvedValue({
      id: 12,
      name: "Maya",
      email: "maya@example.com",
      phone: "+66912345678",
      source: "website",
      interestedTours: '["chiang-mai"]',
      message: "Can we go tomorrow?",
      status: "new",
      convertedToBookingId: null,
      notes: "Internal note should stay out",
      score: 72,
      scoreDetails: "{}",
      lastScoredAt: null,
      recoveryEmailSentAt: null,
      createdAt: new Date("2026-06-01T01:00:00.000Z"),
      updatedAt: new Date("2026-06-01T01:05:00.000Z"),
    });

    const result = await getN8nLeadSnapshot(12);

    expect(getLeadById).toHaveBeenCalledWith(12);
    expect(result).toEqual({
      id: 12,
      name: "Maya",
      email: "maya@example.com",
      phone: "+66912345678",
      source: "website",
      interestedTours: '["chiang-mai"]',
      status: "new",
      convertedToBookingId: null,
      score: 72,
      recoveryEmailSentAt: null,
      createdAt: "2026-06-01T01:00:00.000Z",
      updatedAt: "2026-06-01T01:05:00.000Z",
    });
  });

  it("returns a compact booking snapshot for n8n status checks", async () => {
    vi.mocked(getBookingById).mockResolvedValue({
      id: 44,
      contactName: "Dana",
      contactEmail: "dana@example.com",
      contactPhone: "+66999999999",
      contactWhatsApp: null,
      agentName: "Nok",
      arrivalDate: new Date("2026-06-10T02:00:00.000Z"),
      departureDate: new Date("2026-06-12T08:00:00.000Z"),
      numberOfAdults: 2,
      hasChildren: 0,
      numberOfChildren: null,
      childrenAges: null,
      includesHotels: 1,
      hotelPreferences: null,
      includesGuide: 1,
      includesTrip: 1,
      includesAttractions: 0,
      selectedAttractions: null,
      includesFood: 1,
      foodPreferences: null,
      needsShabbatHotel: 1,
      shabbatHotel: null,
      selfDriving4x4: 0,
      pickupPoint: "hotel",
      customPickupLocation: null,
      dropoffPoint: "airport",
      customDropoffLocation: null,
      suggestedDestinations: null,
      specialRequests: "Quiet room",
      dietaryRestrictions: "Kosher",
      budget: null,
      status: "confirmed",
      totalPrice: 45000,
      depositPaid: 10000,
      balancePaid: 0,
      assignedAgentId: 7,
      reminderSentAt: null,
      feedbackSentAt: null,
      postTourEmailSentAt: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      source: "website",
      notes: "Internal note should stay out",
      createdAt: new Date("2026-06-01T02:00:00.000Z"),
      updatedAt: new Date("2026-06-01T02:10:00.000Z"),
    });

    const result = await getN8nBookingSnapshot(44);

    expect(getBookingById).toHaveBeenCalledWith(44);
    expect(result).toMatchObject({
      id: 44,
      contactName: "Dana",
      contactEmail: "dana@example.com",
      contactPhone: "+66999999999",
      status: "confirmed",
      totalPrice: 45000,
      depositPaid: 10000,
      balancePaid: 0,
      assignedAgentId: 7,
      arrivalDate: "2026-06-10T02:00:00.000Z",
      departureDate: "2026-06-12T08:00:00.000Z",
      hasChildren: false,
      includesHotels: true,
      needsShabbatHotel: true,
      selfDriving4x4: false,
    });
    expect(result).not.toHaveProperty("notes");
    expect(result).not.toHaveProperty("specialRequests");
  });
});
