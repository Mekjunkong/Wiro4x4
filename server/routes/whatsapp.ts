/**
 * WhatsApp webhook Express routes (NOT tRPC — WhatsApp requires plain HTTP).
 *
 * GET  /api/whatsapp/webhook  — Webhook verification (Meta challenge)
 * POST /api/whatsapp/webhook  — Receive incoming messages + status updates
 */

import type { Express } from "express";
import {
  handleIncomingMessage,
  getVerifyToken,
  isWhatsAppConfigured,
} from "../whatsappService";
import { updateWhatsAppMessageStatus } from "../db";
import { checkRateLimit } from "../rateLimit";

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
