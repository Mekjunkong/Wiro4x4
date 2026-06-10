import { randomUUID } from "crypto";

type N8nEventName =
  | "lead.created"
  | "estimate.requested"
  | "booking.created"
  | "booking.status_changed"
  | "booking.completed"
  | "review.submitted"
  | "review.status_updated"
  | "newsletter.subscribed"
  | "newsletter.sent"
  | "abandoned.recovery_sent"
  | "abandoned.batch_recovery_sent"
  | "post_tour_review.scheduled"
  | "post_tour_review.processed"
  | "post_tour_review.event_tracked"
  | "whatsapp.status_updated"
  | "whatsapp.message_received";

type DispatchResult = {
  dispatched: boolean;
  reason: string;
  status?: number;
};

type N8nEnvelope = {
  source: "wiro4x4";
  schemaVersion: 1;
  event: N8nEventName;
  eventId: string;
  occurredAt: string;
  payload: unknown;
};

function isDisabled(value: string | undefined) {
  return value
    ? ["0", "false", "no", "off"].includes(value.toLowerCase())
    : false;
}

function getTimeoutMs() {
  const configured = Number(process.env.N8N_WEBHOOK_TIMEOUT_MS ?? 5000);
  if (!Number.isFinite(configured) || configured < 1000) return 5000;
  return Math.min(configured, 15000);
}

function buildEventId(event: N8nEventName) {
  return `${event}:${randomUUID()}`;
}

export async function dispatchN8nEvent(
  event: N8nEventName,
  payload: unknown
): Promise<DispatchResult> {
  if (isDisabled(process.env.N8N_AUTOMATION_ENABLED)) {
    return { dispatched: false, reason: "n8n_disabled" };
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return { dispatched: false, reason: "n8n_webhook_not_configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
  const envelope: N8nEnvelope = {
    source: "wiro4x4",
    schemaVersion: 1,
    event,
    eventId: buildEventId(event),
    occurredAt: new Date().toISOString(),
    payload,
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Wiro-Event": event,
      "X-Wiro-Event-Id": envelope.eventId,
    };
    const secret = process.env.N8N_WEBHOOK_SECRET?.trim();
    if (secret) headers["X-Wiro-Automation-Secret"] = secret;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("[n8n] Webhook rejected event", {
        event,
        status: response.status,
      });
      return {
        dispatched: false,
        reason: "n8n_webhook_rejected",
        status: response.status,
      };
    }

    return { dispatched: true, reason: "sent", status: response.status };
  } catch (err) {
    console.error("[n8n] Webhook dispatch failed", { event, err });
    return { dispatched: false, reason: "n8n_webhook_failed" };
  } finally {
    clearTimeout(timeout);
  }
}

export function dispatchN8nEventInBackground(
  event: N8nEventName,
  payload: unknown
) {
  dispatchN8nEvent(event, payload).catch(err => {
    console.error("[n8n] Unexpected dispatch failure", { event, err });
  });
}
