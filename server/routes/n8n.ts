import type { Express, Request } from "express";
import { createHash, timingSafeEqual } from "crypto";
import { z } from "zod";
import {
  getBookingById,
  getBookingsNeedingFeedback,
  getBookingsNeedingReminder,
  getAbandonedLeads,
  getAllActiveSubscribers,
  getColdContactedLeads,
  getLeadById,
  getLeadSlaBreaches,
  getNewLeadCount,
  getPendingBookingCount,
  getRecentFailedWhatsAppMessages,
  getStaleNewLeads,
  getUpcomingTourCount,
  getWeeklyPostTourReviewMetrics,
  hasRecentAuditLog,
  logAdminAction,
  markReminderSent,
  markRecoveryEmailSent,
  updateBooking,
  updateLead,
} from "../db";
import { sendAbandonedBookingEmail } from "../abandonedBookingService";
import { sendBookingReminder } from "../customerEmailService";
import { sendNewsletterEmail } from "../newsletterEmailService";
import { sendWhatsAppMessage } from "../whatsappService";
import { notifyOwner } from "../_core/notification";
import {
  processDuePostTourReviewRequests,
  schedulePostTourReviewForBooking,
} from "../postTourReviewService";

const n8nActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("system.ping"),
    client: z.string().trim().max(120).optional(),
  }),
  z.object({
    action: z.literal("lead.update"),
    leadId: z.number().int().positive(),
    status: z
      .enum(["new", "contacted", "quoted", "converted", "lost"])
      .optional(),
    notes: z.string().max(2000).optional(),
    convertedToBookingId: z.number().int().positive().optional(),
  }),
  z.object({
    action: z.literal("booking.update"),
    bookingId: z.number().int().positive(),
    status: z
      .enum(["pending", "confirmed", "in_progress", "completed", "cancelled"])
      .optional(),
    notes: z.string().max(2000).optional(),
    assignedAgentId: z.number().int().positive().optional(),
    totalPrice: z.number().int().min(0).optional(),
    depositPaid: z.number().int().min(0).optional(),
    balancePaid: z.number().int().min(0).optional(),
  }),
  z.object({
    action: z.literal("booking.send_reminder"),
    bookingId: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("booking.send_due_reminders"),
    limit: z.number().int().min(1).max(10).default(10),
  }),
  z.object({
    action: z.literal("post_tour_review.schedule"),
    bookingId: z.number().int().positive(),
    delayMinutes: z.number().int().min(30).max(60).optional(),
  }),
  z.object({
    action: z.literal("post_tour_review.process_due"),
  }),
  z.object({
    action: z.literal("abandoned.send_recovery"),
    leadId: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("abandoned.send_batch_recovery"),
    limit: z.number().int().min(1).max(10).default(10),
  }),
  z.object({
    action: z.literal("newsletter.send"),
    blogPostId: z.number().int().positive(),
    subject: z.string().max(200).optional(),
  }),
  z.object({
    action: z.literal("ops.notify"),
    title: z.string().trim().min(1).max(160),
    content: z.string().trim().min(1).max(4000),
    priority: z.enum(["info", "warning", "urgent"]).default("info"),
    resourceType: z
      .enum(["lead", "booking", "review", "newsletter", "system"])
      .optional(),
    resourceId: z.number().int().positive().optional(),
    dedupeKey: z.string().trim().min(1).max(200).optional(),
    cooldownMinutes: z
      .number()
      .int()
      .min(1)
      .max(24 * 60)
      .optional(),
  }),
]);

export type N8nAction = z.infer<typeof n8nActionSchema>;
type N8nActionResult = {
  action: string;
  changed: boolean;
  [key: string]: unknown;
};

function getAutomationSecret() {
  return (
    process.env.N8N_API_SECRET?.trim() ||
    process.env.N8N_WEBHOOK_SECRET?.trim() ||
    ""
  );
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function isAuthorized(req: Request) {
  const expected = getAutomationSecret();
  if (!expected) return false;
  const provided = req.header("x-wiro-automation-secret")?.trim() ?? "";
  return provided.length > 0 && safeCompare(provided, expected);
}

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

function hashDedupeKey(key: string) {
  const value = createHash("sha256").update(key).digest().readUInt32BE(0);
  return (value % 2147483646) + 1;
}

function getOpsNotifyAuditTarget(
  input: Extract<N8nAction, { action: "ops.notify" }>
) {
  if (input.dedupeKey) {
    return {
      resourceType: "n8nNotification",
      resourceId: hashDedupeKey(input.dedupeKey),
    };
  }
  return {
    resourceType: input.resourceType ?? "system",
    resourceId: input.resourceId,
  };
}

function getAuditTarget(input: N8nAction) {
  switch (input.action) {
    case "system.ping":
      return { resourceType: "system", resourceId: undefined };
    case "lead.update":
    case "abandoned.send_recovery":
      return { resourceType: "lead", resourceId: input.leadId };
    case "booking.update":
    case "booking.send_reminder":
    case "post_tour_review.schedule":
      return {
        resourceType:
          input.action === "post_tour_review.schedule"
            ? "postTourReview"
            : "booking",
        resourceId: input.bookingId,
      };
    case "booking.send_due_reminders":
      return { resourceType: "booking", resourceId: undefined };
    case "newsletter.send":
      return { resourceType: "newsletter", resourceId: input.blogPostId };
    case "ops.notify":
      return getOpsNotifyAuditTarget(input);
    case "post_tour_review.process_due":
      return { resourceType: "postTourReview", resourceId: undefined };
    case "abandoned.send_batch_recovery":
      return { resourceType: "lead", resourceId: undefined };
    default:
      return { resourceType: "system", resourceId: undefined };
  }
}

async function logN8nAction(input: N8nAction, result: N8nActionResult) {
  const target = getAuditTarget(input);
  await logAdminAction({
    userId: null,
    action: `n8n.${input.action}`,
    resourceType: target.resourceType,
    resourceId: target.resourceId,
    newValue: JSON.stringify({
      input,
      result,
      executedAt: new Date().toISOString(),
    }),
  });
}

async function finishN8nAction<T extends N8nActionResult>(
  input: N8nAction,
  result: T
) {
  await logN8nAction(input, result);
  return result;
}

type N8nBookingRecord = NonNullable<Awaited<ReturnType<typeof getBookingById>>>;
type N8nLeadRecord = Awaited<ReturnType<typeof getAbandonedLeads>>[number];

function buildBookingReminderPayload(booking: N8nBookingRecord) {
  return {
    customerName: booking.contactName,
    customerEmail: booking.contactEmail ?? "",
    tourDate: toIso(booking.arrivalDate) ?? "",
    tourType: "Custom Tour",
    groupSize: booking.numberOfAdults + (booking.numberOfChildren ?? 0),
    pickupLocation: booking.pickupPoint,
    pickupTime: "08:00",
    specialRequests: booking.specialRequests ?? undefined,
    bookingId: `WIRO-${booking.id}`,
  };
}

function normalizeWhatsAppRecipient(value: string | null | undefined) {
  const normalized = value?.replace(/\D/g, "") ?? "";
  return normalized.length >= 8 ? normalized : null;
}

function buildWhatsAppBookingReminderText(booking: N8nBookingRecord) {
  const tourDate = toIso(booking.arrivalDate);
  const formattedDate = tourDate
    ? new Date(tourDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "tomorrow";
  const groupSize = booking.numberOfAdults + (booking.numberOfChildren ?? 0);
  const pickup = booking.pickupPoint?.trim() || "to be confirmed";

  return [
    `Hi ${booking.contactName}, this is your WIRO 4x4 tour reminder.`,
    `Tour date: ${formattedDate}`,
    `Pickup: ${pickup} around 08:00`,
    `Group size: ${groupSize}`,
    `Booking: WIRO-${booking.id}`,
    "",
    "Please bring comfortable shoes, sun protection, water, and anything you need for kosher/Shabbat planning.",
    "Questions? Reply here on WhatsApp and we will help.",
  ].join("\n");
}

async function sendBookingReminderWithFallback(booking: N8nBookingRecord) {
  if (booking.contactEmail) {
    const emailSent = await sendBookingReminder(
      buildBookingReminderPayload(booking)
    );
    if (emailSent) return { sent: true, channel: "email" as const };
  }

  const recipient = normalizeWhatsAppRecipient(
    booking.contactWhatsApp || booking.contactPhone
  );
  if (!recipient) return { sent: false, channel: null };

  const messageId = await sendWhatsAppMessage(
    recipient,
    buildWhatsAppBookingReminderText(booking)
  );
  return messageId
    ? { sent: true, channel: "whatsapp" as const, messageId }
    : { sent: false, channel: "whatsapp" as const };
}

function buildWhatsAppRecoveryText(lead: N8nLeadRecord) {
  const name = lead.name?.trim() || "there";
  return [
    `Hi ${name}, this is WIRO 4x4 in Chiang Mai.`,
    "You asked us about a private off-road trip, and we would love to help you finish the plan.",
    "",
    "Reply here with your travel dates, group size, pickup area, and kosher/Shabbat needs. We will confirm availability personally.",
    "You can also continue here:",
    "https://www.wiro4x4indochina.com/booking",
  ].join("\n");
}

async function sendRecoveryWithFallback(lead: N8nLeadRecord) {
  if (lead.email) {
    const emailSent = await sendAbandonedBookingEmail(lead);
    if (emailSent) return { sent: true, channel: "email" as const };
  }

  const recipient = normalizeWhatsAppRecipient(lead.phone);
  if (!recipient) return { sent: false, channel: null };

  const messageId = await sendWhatsAppMessage(
    recipient,
    buildWhatsAppRecoveryText(lead)
  );
  return messageId
    ? { sent: true, channel: "whatsapp" as const, messageId }
    : { sent: false, channel: "whatsapp" as const };
}

export async function getN8nLeadSnapshot(leadId: number) {
  const lead = await getLeadById(leadId);
  if (!lead) return null;

  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? null,
    source: lead.source,
    interestedTours: lead.interestedTours,
    status: lead.status,
    convertedToBookingId: lead.convertedToBookingId ?? null,
    score: lead.score ?? 0,
    recoveryEmailSentAt: toIso(lead.recoveryEmailSentAt),
    createdAt: toIso(lead.createdAt),
    updatedAt: toIso(lead.updatedAt),
  };
}

export async function getN8nBookingSnapshot(bookingId: number) {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  return {
    id: booking.id,
    contactName: booking.contactName,
    contactEmail: booking.contactEmail ?? null,
    contactPhone: booking.contactPhone,
    contactWhatsApp: booking.contactWhatsApp ?? null,
    agentName: booking.agentName ?? null,
    arrivalDate: toIso(booking.arrivalDate),
    departureDate: toIso(booking.departureDate),
    numberOfAdults: booking.numberOfAdults,
    hasChildren: Boolean(booking.hasChildren),
    numberOfChildren: booking.numberOfChildren ?? 0,
    includesHotels: Boolean(booking.includesHotels),
    includesGuide: Boolean(booking.includesGuide),
    includesTrip: Boolean(booking.includesTrip),
    includesAttractions: Boolean(booking.includesAttractions),
    includesFood: Boolean(booking.includesFood),
    needsShabbatHotel: Boolean(booking.needsShabbatHotel),
    selfDriving4x4: Boolean(booking.selfDriving4x4),
    pickupPoint: booking.pickupPoint,
    dropoffPoint: booking.dropoffPoint,
    status: booking.status,
    totalPrice: booking.totalPrice ?? null,
    depositPaid: booking.depositPaid ?? 0,
    balancePaid: booking.balancePaid ?? 0,
    assignedAgentId: booking.assignedAgentId ?? null,
    reminderSentAt: toIso(booking.reminderSentAt),
    feedbackSentAt: toIso(booking.feedbackSentAt),
    postTourEmailSentAt: toIso(booking.postTourEmailSentAt),
    source: booking.source,
    createdAt: toIso(booking.createdAt),
    updatedAt: toIso(booking.updatedAt),
  };
}

export async function executeN8nAction(input: N8nAction) {
  switch (input.action) {
    case "system.ping": {
      return {
        action: input.action,
        changed: false,
        pong: true,
        client: input.client ?? null,
        checkedAt: new Date().toISOString(),
      };
    }
    case "lead.update": {
      const data = {
        ...(input.status ? { status: input.status } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
        ...(input.convertedToBookingId
          ? { convertedToBookingId: input.convertedToBookingId }
          : {}),
      };
      if (Object.keys(data).length === 0) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "no_fields_to_update",
        });
      }
      await updateLead(input.leadId, data);
      return finishN8nAction(input, {
        action: input.action,
        changed: true,
        leadId: input.leadId,
      });
    }
    case "booking.update": {
      const data = {
        ...(input.status ? { status: input.status } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
        ...(input.assignedAgentId
          ? { assignedAgentId: input.assignedAgentId }
          : {}),
        ...(input.totalPrice != null ? { totalPrice: input.totalPrice } : {}),
        ...(input.depositPaid != null
          ? { depositPaid: input.depositPaid }
          : {}),
        ...(input.balancePaid != null
          ? { balancePaid: input.balancePaid }
          : {}),
      };
      if (Object.keys(data).length === 0) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "no_fields_to_update",
        });
      }
      await updateBooking(input.bookingId, data);
      if (input.status === "completed") {
        await schedulePostTourReviewForBooking({
          bookingId: input.bookingId,
          completedAt: new Date(),
        });
      }
      return finishN8nAction(input, {
        action: input.action,
        changed: true,
        bookingId: input.bookingId,
      });
    }
    case "booking.send_reminder": {
      const booking = await getBookingById(input.bookingId);
      if (
        !booking ||
        (!booking.contactEmail &&
          !booking.contactWhatsApp &&
          !booking.contactPhone)
      ) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "booking_not_found_or_missing_contact",
          bookingId: input.bookingId,
          sent: false,
        });
      }
      if (booking.reminderSentAt) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "reminder_already_sent",
          bookingId: booking.id,
          sent: false,
        });
      }

      const delivery = await sendBookingReminderWithFallback(booking);
      if (delivery.sent) await markReminderSent(booking.id);

      return finishN8nAction(input, {
        action: input.action,
        changed: delivery.sent,
        bookingId: booking.id,
        sent: delivery.sent,
        channel: delivery.channel,
      });
    }
    case "booking.send_due_reminders": {
      const dueBookings = await getBookingsNeedingReminder();
      const batch = dueBookings.slice(0, input.limit);
      let sent = 0;
      let failed = 0;
      let skipped = 0;
      const bookingIds: number[] = [];

      for (const booking of batch) {
        if (
          !booking.contactEmail &&
          !booking.contactWhatsApp &&
          !booking.contactPhone
        ) {
          skipped++;
          continue;
        }

        const delivery = await sendBookingReminderWithFallback(booking);
        if (delivery.sent) {
          await markReminderSent(booking.id);
          sent++;
          bookingIds.push(booking.id);
        } else {
          failed++;
        }
      }

      return finishN8nAction(input, {
        action: input.action,
        changed: sent > 0,
        attempted: batch.length,
        sent,
        failed,
        skipped,
        bookingIds,
      });
    }
    case "post_tour_review.schedule": {
      const entry = await schedulePostTourReviewForBooking({
        bookingId: input.bookingId,
        delayMinutes: input.delayMinutes,
      });
      return finishN8nAction(input, {
        action: input.action,
        changed: true,
        bookingId: input.bookingId,
        entry,
      });
    }
    case "post_tour_review.process_due": {
      const result = await processDuePostTourReviewRequests();
      return finishN8nAction(input, {
        action: input.action,
        changed: true,
        result,
      });
    }
    case "abandoned.send_recovery": {
      const leads = await getAbandonedLeads(24 * 365);
      const lead = leads.find(item => item.id === input.leadId);
      if (!lead || (!lead.email && !lead.phone)) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "lead_not_found_or_missing_contact",
          leadId: input.leadId,
        });
      }
      if (lead.recoveryEmailSentAt) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "recovery_already_sent",
          leadId: input.leadId,
        });
      }
      const delivery = await sendRecoveryWithFallback(lead);
      if (delivery.sent) await markRecoveryEmailSent(lead.id);
      return finishN8nAction(input, {
        action: input.action,
        changed: delivery.sent,
        leadId: lead.id,
        sent: delivery.sent,
        channel: delivery.channel,
      });
    }
    case "abandoned.send_batch_recovery": {
      const leads = await getAbandonedLeads(24);
      const batch = leads
        .filter(lead => !lead.recoveryEmailSentAt && (lead.email || lead.phone))
        .slice(0, input.limit);
      let sent = 0;
      let failed = 0;

      for (const lead of batch) {
        const delivery = await sendRecoveryWithFallback(lead);
        if (delivery.sent) {
          await markRecoveryEmailSent(lead.id);
          sent++;
        } else {
          failed++;
        }
      }

      return finishN8nAction(input, {
        action: input.action,
        changed: sent > 0,
        attempted: batch.length,
        sent,
        failed,
      });
    }
    case "newsletter.send": {
      const subscribers = await getAllActiveSubscribers();
      if (subscribers.length === 0) {
        return finishN8nAction(input, {
          action: input.action,
          changed: false,
          reason: "no_active_subscribers",
          sent: 0,
        });
      }
      const sent = await sendNewsletterEmail(
        input.blogPostId,
        subscribers,
        input.subject
      );
      return finishN8nAction(input, {
        action: input.action,
        changed: sent > 0,
        blogPostId: input.blogPostId,
        sent,
      });
    }
    case "ops.notify": {
      const auditTarget = getOpsNotifyAuditTarget(input);
      if (input.dedupeKey && input.cooldownMinutes) {
        const alreadyNotified = await hasRecentAuditLog({
          action: "n8n.ops.notify",
          resourceType: auditTarget.resourceType,
          resourceId: auditTarget.resourceId,
          since: new Date(Date.now() - input.cooldownMinutes * 60 * 1000),
        });
        if (alreadyNotified) {
          return {
            action: input.action,
            changed: false,
            delivered: false,
            deduped: true,
            priority: input.priority,
          };
        }
      }
      const delivered = await notifyOwner({
        title:
          input.priority === "info"
            ? input.title
            : `[${input.priority.toUpperCase()}] ${input.title}`,
        content: [
          input.content,
          input.resourceType
            ? `\nResource: ${input.resourceType}${input.resourceId ? ` #${input.resourceId}` : ""}`
            : "",
        ].join(""),
      });

      return finishN8nAction(input, {
        action: input.action,
        changed: delivered,
        delivered,
        priority: input.priority,
      });
    }
    default:
      throw new Error(
        `Unsupported n8n action: ${(input as { action: string }).action}`
      );
  }
}

export function registerN8nRoutes(app: Express) {
  app.get("/api/n8n/leads/:id", async (req, res) => {
    if (!getAutomationSecret()) {
      res.status(503).json({ error: "n8n_api_secret_not_configured" });
      return;
    }
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const parsed = z.coerce.number().int().positive().safeParse(req.params.id);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_lead_id" });
      return;
    }

    try {
      const lead = await getN8nLeadSnapshot(parsed.data);
      if (!lead) {
        res.status(404).json({ error: "lead_not_found" });
        return;
      }
      res.json({ lead });
    } catch (err) {
      console.error("[n8n] Failed to fetch lead snapshot", err);
      res.status(500).json({ error: "lead_snapshot_failed" });
    }
  });

  app.get("/api/n8n/bookings/:id", async (req, res) => {
    if (!getAutomationSecret()) {
      res.status(503).json({ error: "n8n_api_secret_not_configured" });
      return;
    }
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const parsed = z.coerce.number().int().positive().safeParse(req.params.id);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_booking_id" });
      return;
    }

    try {
      const booking = await getN8nBookingSnapshot(parsed.data);
      if (!booking) {
        res.status(404).json({ error: "booking_not_found" });
        return;
      }
      res.json({ booking });
    } catch (err) {
      console.error("[n8n] Failed to fetch booking snapshot", err);
      res.status(500).json({ error: "booking_snapshot_failed" });
    }
  });

  app.get("/api/n8n/operations-snapshot", async (req, res) => {
    if (!getAutomationSecret()) {
      res.status(503).json({ error: "n8n_api_secret_not_configured" });
      return;
    }
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      const [
        pendingBookings,
        newLeads24h,
        upcomingTours48h,
        staleLeads,
        leadSlaDue,
        coldLeadFollowupsDue,
        bookingsNeedingReminder,
        bookingsNeedingFeedback,
        failedWhatsAppMessages,
        postTourReviews,
      ] = await Promise.all([
        getPendingBookingCount(),
        getNewLeadCount(24),
        getUpcomingTourCount(48),
        getStaleNewLeads(),
        getLeadSlaBreaches(10),
        getColdContactedLeads(),
        getBookingsNeedingReminder(),
        getBookingsNeedingFeedback(),
        getRecentFailedWhatsAppMessages(24),
        getWeeklyPostTourReviewMetrics(),
      ]);

      res.json({
        generatedAt: new Date().toISOString(),
        timezone: "Asia/Bangkok",
        counts: {
          pendingBookings,
          newLeads24h,
          upcomingTours48h,
          staleLeads: staleLeads.length,
          leadSlaDue: leadSlaDue.length,
          coldLeadFollowupsDue: coldLeadFollowupsDue.length,
          bookingRemindersDue: bookingsNeedingReminder.length,
          feedbackRequestsDue: bookingsNeedingFeedback.length,
          failedWhatsAppMessages: failedWhatsAppMessages.length,
        },
        queues: {
          leadSlaDue: leadSlaDue.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? null,
            source: lead.source,
            status: lead.status,
            score: lead.score ?? 0,
            createdAt: toIso(lead.createdAt),
            updatedAt: toIso(lead.updatedAt),
          })),
          coldLeadFollowupsDue: coldLeadFollowupsDue.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? null,
            source: lead.source,
            status: lead.status,
            score: lead.score ?? 0,
            createdAt: toIso(lead.createdAt),
            updatedAt: toIso(lead.updatedAt),
          })),
          staleLeads: staleLeads.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? null,
            source: lead.source,
            status: lead.status,
            createdAt: toIso(lead.createdAt),
            updatedAt: toIso(lead.updatedAt),
          })),
          bookingRemindersDue: bookingsNeedingReminder.map(booking => ({
            id: booking.id,
            contactName: booking.contactName,
            contactEmail: booking.contactEmail ?? null,
            contactPhone: booking.contactPhone,
            arrivalDate: toIso(booking.arrivalDate),
            departureDate: toIso(booking.departureDate),
            status: booking.status,
          })),
          feedbackRequestsDue: bookingsNeedingFeedback.map(booking => ({
            id: booking.id,
            contactName: booking.contactName,
            contactEmail: booking.contactEmail ?? null,
            contactPhone: booking.contactPhone,
            arrivalDate: toIso(booking.arrivalDate),
            departureDate: toIso(booking.departureDate),
            status: booking.status,
          })),
          failedWhatsAppMessages: failedWhatsAppMessages.map(message => ({
            id: message.id,
            whatsappMessageId: message.whatsappMessageId ?? null,
            phoneNumber: message.phoneNumber,
            direction: message.direction,
            status: message.status,
            isAutoReply: Boolean(message.isAutoReply),
            createdAt: toIso(message.createdAt),
          })),
        },
        postTourReviews,
      });
    } catch (err) {
      console.error("[n8n] Failed to build operations snapshot", err);
      res.status(500).json({ error: "operations_snapshot_failed" });
    }
  });

  app.post("/api/n8n/actions", async (req, res) => {
    if (!getAutomationSecret()) {
      res.status(503).json({ error: "n8n_api_secret_not_configured" });
      return;
    }
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const parsed = n8nActionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "invalid_n8n_action",
        issues: parsed.error.issues,
      });
      return;
    }

    try {
      const result = await executeN8nAction(parsed.data);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error("[n8n] Failed to execute action", {
        action: parsed.data.action,
        err,
      });
      res.status(500).json({ error: "n8n_action_failed" });
    }
  });
}
