/**
 * WhatsApp webhook Express routes (NOT tRPC — WhatsApp requires plain HTTP).
 *
 * GET  /api/whatsapp/webhook  — Webhook verification (Meta challenge)
 * POST /api/whatsapp/webhook  — Receive incoming messages + status updates
 */

import type { Express } from "express";
import crypto from "crypto";
import {
  handleIncomingMessage,
  getVerifyToken,
  isWhatsAppConfigured,
} from "../whatsappService";
import { updateWhatsAppMessageStatus } from "../db";
import { checkRateLimit } from "../rateLimit";
import { recordPostTourReviewOpenedByMessageId } from "../postTourReviewService";
import { dispatchN8nEventInBackground } from "../n8nAutomation";

/**
 * Verify the X-Hub-Signature-256 header from Meta's webhook payload.
 * Returns true if valid or if APP_SECRET is not configured (graceful degradation).
 */
function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string | undefined
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    // If no app secret configured, skip verification (dev mode)
    return true;
  }
  if (!signature) {
    console.warn("[WhatsApp] Missing X-Hub-Signature-256 header");
    return false;
  }
  const expectedSig =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  // Constant-time comparison to prevent timing attacks
  if (expectedSig.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export function registerWhatsAppWebhookRoute(app: Express) {
  // -----------------------------------------------------------------------
  // GET — Webhook verification (Meta sends this when you register the webhook)
  // -----------------------------------------------------------------------
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"] as string | undefined;
    const token = req.query["hub.verify_token"] as string | undefined;
    const challenge = req.query["hub.challenge"] as string | undefined;

    if (mode === "subscribe" && token === getVerifyToken()) {
      console.log("[WhatsApp] Webhook verified successfully");
      res.status(200).send(challenge || "OK");
    } else {
      console.warn("[WhatsApp] Webhook verification failed — token mismatch");
      res.sendStatus(403);
    }
  });

  // -----------------------------------------------------------------------
  // POST — Incoming messages and status updates
  // -----------------------------------------------------------------------
  app.post("/api/whatsapp/webhook", async (req, res) => {
    // Verify HMAC signature from Meta
    const signature = req.headers["x-hub-signature-256"] as string | undefined;
    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn("[WhatsApp] Invalid webhook signature — rejecting");
      res.sendStatus(403);
      return;
    }

    // WhatsApp expects a 200 quickly, regardless of processing outcome
    res.sendStatus(200);

    try {
      const body = req.body;

      // Validate payload structure
      if (body?.object !== "whatsapp_business_account") {
        return;
      }

      const entries = body.entry;
      if (!Array.isArray(entries)) return;

      for (const entry of entries) {
        const changes = entry.changes;
        if (!Array.isArray(changes)) continue;

        for (const change of changes) {
          if (change.field !== "messages") continue;

          const value = change.value;
          if (!value) continue;

          // Handle status updates (delivery receipts)
          const statuses = value.statuses;
          if (Array.isArray(statuses)) {
            for (const status of statuses) {
              const waMessageId = status.id as string | undefined;
              const statusValue = status.status as string | undefined;
              if (
                waMessageId &&
                statusValue &&
                ["sent", "delivered", "read", "failed"].includes(statusValue)
              ) {
                try {
                  await updateWhatsAppMessageStatus(
                    waMessageId,
                    statusValue as "sent" | "delivered" | "read" | "failed"
                  );
                  if (statusValue === "read") {
                    await recordPostTourReviewOpenedByMessageId(waMessageId);
                  }
                  dispatchN8nEventInBackground("whatsapp.status_updated", {
                    messageId: waMessageId,
                    status: statusValue,
                    rawStatus: status,
                  });
                } catch (err) {
                  console.error("[WhatsApp] Status update error:", err);
                }
              }
            }
          }

          // Handle incoming messages
          const messages = value.messages;
          const contacts = value.contacts;
          if (!Array.isArray(messages)) continue;

          for (const msg of messages) {
            // Only handle text messages
            if (msg.type !== "text") continue;

            const from = msg.from as string;
            const text = msg.text?.body as string | undefined;
            const messageId = msg.id as string | undefined;

            if (!from || !text) continue;

            // Rate limit per phone number (30 auto-replies per hour)
            const { allowed } = checkRateLimit(
              `wa:${from}`,
              30,
              60 * 60 * 1000
            );
            if (!allowed) {
              console.warn(`[WhatsApp] Rate limited auto-reply for ${from}`);
              continue;
            }

            // Find contact name
            const contact = Array.isArray(contacts)
              ? contacts.find((c: { wa_id?: string }) => c.wa_id === from)
              : undefined;
            const contactName = contact?.profile?.name as string | undefined;

            await handleIncomingMessage({
              from,
              name: contactName,
              text,
              messageId,
            });
            dispatchN8nEventInBackground("whatsapp.message_received", {
              from,
              name: contactName ?? null,
              text,
              messageId: messageId ?? null,
            });
          }
        }
      }
    } catch (err) {
      console.error("[WhatsApp] Webhook processing error:", err);
    }
  });

  // Log registration
  if (isWhatsAppConfigured()) {
    console.log("[WhatsApp] Webhook routes registered (API configured)");
  } else {
    console.log(
      "[WhatsApp] Webhook routes registered (API not configured — auto-replies disabled)"
    );
  }
}
