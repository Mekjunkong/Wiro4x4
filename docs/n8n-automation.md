# WIRO 4x4 n8n automation

This is the first production integration layer for running WIRO operations from n8n.

## What Wiro Sends

When `N8N_WEBHOOK_URL` is configured, the backend posts a JSON envelope to n8n:

```json
{
  "source": "wiro4x4",
  "schemaVersion": 1,
  "event": "lead.created",
  "eventId": "lead.created:uuid",
  "occurredAt": "2026-06-02T00:00:00.000Z",
  "payload": {}
}
```

The request also includes:

- `X-Wiro-Event`
- `X-Wiro-Event-Id`
- `X-Wiro-Automation-Secret` when `N8N_WEBHOOK_SECRET` is set

## Events

| Event                            | When it fires                                      | Use in n8n                                              |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| `lead.created`                   | Website lead is saved and scored                   | Notify ops, add spreadsheet row, wait for SLA follow-up |
| `estimate.requested`             | Visitor requests an emailed estimate               | Quote follow-up, route/price interest reporting         |
| `booking.created`                | Customer booking is created                        | Booking checklist, prep email, calendar task            |
| `booking.status_changed`         | Admin changes booking status                       | Internal ops alerts, finance/update checks              |
| `booking.completed`              | Booking status becomes completed                   | Review request, upsell, photo album follow-up           |
| `review.submitted`               | Visitor submits a public or post-tour review       | Approval queue, low-rating escalation                   |
| `review.status_updated`          | Admin approves/rejects/responds to a review        | Testimonial publishing and reputation reporting         |
| `newsletter.subscribed`          | Visitor joins newsletter                           | CRM tagging and welcome sequence                        |
| `newsletter.sent`                | Admin or n8n sends newsletter campaign             | Marketing reporting                                     |
| `abandoned.recovery_sent`        | A recovery message is sent to one abandoned lead   | Lead recovery reporting                                 |
| `abandoned.batch_recovery_sent`  | Batch recovery process runs                        | Daily recovery reporting                                |
| `post_tour_review.scheduled`     | Review request is scheduled                        | Reputation dashboard and reminder queue                 |
| `post_tour_review.processed`     | Due review requests are processed                  | Daily ops digest                                        |
| `post_tour_review.event_tracked` | Review opened/clicked/reviewed is recorded         | Low-rating escalation, testimonial workflow             |
| `whatsapp.status_updated`        | WhatsApp sent/delivered/read/failed status arrives | Delivery monitoring                                     |
| `whatsapp.message_received`      | Customer sends WhatsApp text                       | Intent triage and CRM activity                          |

## Setup

1. Validate the workflow export files:

```bash
npm run n8n:validate
```

2. Check local live-readiness without printing secrets:

```bash
npm run n8n:doctor
```

3. Generate matching Wiro and n8n env values:

```bash
N8N_HOSTNAME=n8n.your-domain.com \
N8N_PUBLIC_URL=https://n8n.your-domain.com \
WIRO_SITE_URL=https://www.wiro4x4indochina.com \
npm run n8n:secrets
```

The command prints matching `N8N_WEBHOOK_SECRET`, `N8N_API_SECRET`, `WIRO_N8N_SHARED_SECRET`, and `WIRO_N8N_API_SECRET` values. It does not write files.

4. Import `workflows/n8n/wiro-automation-router.json` into n8n.
5. Import `workflows/n8n/wiro-daily-operations-snapshot.json` into n8n if you want the 7am ops digest source.
6. Import `workflows/n8n/wiro-scheduled-actions.json` into n8n if you want daily due-review and abandoned-lead recovery automation.
7. Import `workflows/n8n/wiro-lead-sla-monitor.json` into n8n if you want 10-minute lead SLA alerts.
8. Import `workflows/n8n/wiro-booking-reminder-sender.json` into n8n if you want hourly customer pre-tour reminders.
9. Import `workflows/n8n/wiro-booking-prep-monitor.json` into n8n if you want hourly pre-tour prep alerts.
10. Import `workflows/n8n/wiro-quote-followup-monitor.json` into n8n if you want contacted/quoted lead follow-up alerts.
11. Import `workflows/n8n/wiro-whatsapp-failure-monitor.json` into n8n if you want WhatsApp delivery failure alerts.
12. Activate the workflows.
13. Copy the production webhook URL from the n8n Webhook node.
14. Set Wiro environment variables:

```bash
N8N_AUTOMATION_ENABLED=true
N8N_WEBHOOK_URL=https://YOUR_N8N_HOST/webhook/wiro-automation
N8N_WEBHOOK_SECRET=generate-a-long-random-secret
N8N_API_SECRET=use-the-same-value-as-n8n-webhook-secret
N8N_WEBHOOK_TIMEOUT_MS=5000
```

15. In n8n, set `WIRO_N8N_SHARED_SECRET` to the same value as `N8N_WEBHOOK_SECRET`. Set `WIRO_N8N_API_SECRET` to the same value as `N8N_API_SECRET`.
16. Run the doctor again after env configuration:

```bash
npm run n8n:doctor
```

17. Check live readiness before import:

```bash
WIRO_SITE_URL=https://www.wiro4x4indochina.com \
N8N_API_SECRET=your-secret \
N8N_IMPORT_API_BASE_URL=https://YOUR_N8N_HOST/api/v1 \
N8N_IMPORT_API_KEY=your-n8n-api-key \
npm run n8n:readiness
```

This distinguishes missing deployment, missing Wiro env, secret mismatch, and missing n8n API access.

18. Optional: create an n8n API key in n8n, then dry-run workflow import from this repo:

```bash
N8N_IMPORT_API_BASE_URL=https://YOUR_N8N_HOST/api/v1 \
N8N_IMPORT_API_KEY=your-n8n-api-key \
npm run n8n:import
```

19. Apply the import when the dry-run output is correct:

```bash
N8N_IMPORT_API_BASE_URL=https://YOUR_N8N_HOST/api/v1 \
N8N_IMPORT_API_KEY=your-n8n-api-key \
N8N_IMPORT_APPLY=true \
N8N_IMPORT_ACTIVATE=true \
npm run n8n:import
```

If your n8n instance cannot use runtime environment variables or n8n Variables,
you can substitute the Wiro URL and shared secrets into the live import payload
without changing the committed workflow JSON:

```bash
WIRO_SITE_URL=https://www.wiro4x4indochina.com \
WIRO_N8N_SHARED_SECRET=your-webhook-secret \
WIRO_N8N_API_SECRET=your-api-secret \
N8N_IMPORT_API_BASE_URL=https://YOUR_N8N_HOST/api/v1 \
N8N_IMPORT_API_KEY=your-n8n-api-key \
N8N_IMPORT_INLINE_WIRO_ENV=true \
N8N_IMPORT_APPLY=true \
N8N_IMPORT_ACTIVATE=true \
npm run n8n:import
```

20. Verify the live n8n workflow set:

```bash
N8N_IMPORT_API_BASE_URL=https://YOUR_N8N_HOST/api/v1 \
N8N_IMPORT_API_KEY=your-n8n-api-key \
npm run n8n:verify-live
```

This checks that all Wiro workflows exist in n8n, are active, and still match the repo's node/connection shape.

21. Run a live smoke test after deployment:

```bash
N8N_WEBHOOK_URL=https://YOUR_N8N_HOST/webhook/wiro-automation \
N8N_WEBHOOK_SECRET=your-secret \
WIRO_SITE_URL=https://www.wiro4x4indochina.com \
N8N_API_SECRET=your-secret \
npm run n8n:smoke
```

The smoke test sends a synthetic `lead.created` event to n8n and, when `WIRO_SITE_URL` plus `N8N_API_SECRET` are set, verifies the Wiro operations snapshot endpoint and the protected `/api/n8n/actions` endpoint with `system.ping`.

The import and live-verify scripts use n8n's public API with the `X-N8N-API-KEY` header. The import script creates or updates workflows by name and only writes to n8n when `N8N_IMPORT_APPLY=true`.

## Self-host n8n

For a local or VPS n8n instance, copy the example env file and start the separate n8n compose stack:

```bash
cp .env.n8n.example .env.n8n
docker compose --env-file .env.n8n -f docker-compose.n8n.yml up -d
```

The compose file mounts `workflows/n8n/` into the n8n container at `/home/node/wiro-workflows`.

After n8n is running, open `http://localhost:5678`, create the owner account, then import:

- `/home/node/wiro-workflows/wiro-automation-router.json`
- `/home/node/wiro-workflows/wiro-daily-operations-snapshot.json`
- `/home/node/wiro-workflows/wiro-scheduled-actions.json`
- `/home/node/wiro-workflows/wiro-lead-sla-monitor.json`
- `/home/node/wiro-workflows/wiro-booking-reminder-sender.json`
- `/home/node/wiro-workflows/wiro-booking-prep-monitor.json`
- `/home/node/wiro-workflows/wiro-quote-followup-monitor.json`
- `/home/node/wiro-workflows/wiro-whatsapp-failure-monitor.json`

For production, put n8n behind HTTPS and set:

```bash
N8N_PROTOCOL=https
N8N_HOST=n8n.your-domain.com
N8N_PUBLIC_WEBHOOK_URL=https://n8n.your-domain.com/
```

## Recommended Automations

Start with these six. They cover the actual WIRO booking lifecycle.

1. Lead SLA: on `lead.created`, alert ops immediately, wait 10 minutes, then check whether the lead is contacted.
2. Quote follow-up: after a quote is sent, wait 6 hours and 24 hours, then remind ops if no booking exists.
3. Booking reminder sender: hourly, send customer pre-tour reminders for confirmed bookings arriving in 24-48 hours.
4. Booking prep: on `booking.created`, create an internal checklist for route, pickup, kosher/Shabbat needs, vehicle, and guide.
5. Review engine: on `booking.completed`, send/schedule review request and escalate low ratings before asking for public reviews.
6. Daily dashboard: at 7:00 Asia/Bangkok, send leads, bookings, due reviews, failed WhatsApp messages, and overdue follow-ups.

The repo includes starter workflows for eight of these:

- `wiro-automation-router.json`: event router for the 16 Wiro lifecycle events.
- `wiro-daily-operations-snapshot.json`: 7am operations summary source.
- `wiro-scheduled-actions.json`: 8am due review processing and abandoned-lead recovery batch.
- `wiro-lead-sla-monitor.json`: 10-minute lead SLA monitor that alerts the owner when new leads are still waiting.
- `wiro-booking-reminder-sender.json`: hourly sender for due pre-tour customer reminders.
- `wiro-booking-prep-monitor.json`: hourly pre-tour prep monitor for upcoming confirmed bookings.
- `wiro-quote-followup-monitor.json`: 2pm monitor for contacted or quoted leads with no movement for 5+ days.
- `wiro-whatsapp-failure-monitor.json`: 30-minute monitor for failed WhatsApp delivery.

## Daily Operations Snapshot

n8n can pull a secure daily snapshot from Wiro:

```bash
curl https://www.wiro4x4indochina.com/api/n8n/operations-snapshot \
  -H "X-Wiro-Automation-Secret: $N8N_API_SECRET"
```

The response includes:

- pending booking count
- new leads in the last 24 hours
- upcoming tours in the next 48 hours
- stale new leads
- leads past the 10-minute response SLA
- contacted or quoted leads needing follow-up
- booking reminders due
- feedback/review requests due
- failed WhatsApp messages in the last 24 hours
- weekly post-tour review metrics

## Wait And Check Workflows

Use lookup endpoints after n8n Wait nodes so reminders do not fire after a human has already handled the customer.

Lead check:

```bash
curl https://www.wiro4x4indochina.com/api/n8n/leads/123 \
  -H "X-Wiro-Automation-Secret: $N8N_API_SECRET"
```

Booking check:

```bash
curl https://www.wiro4x4indochina.com/api/n8n/bookings/456 \
  -H "X-Wiro-Automation-Secret: $N8N_API_SECRET"
```

Recommended n8n pattern:

1. Receive `lead.created` or `booking.created`.
2. Send the first ops notification immediately.
3. Wait 10 minutes for leads, or the relevant SLA for bookings.
4. Call the matching lookup endpoint.
5. Continue only if the current Wiro status still needs action.

Example guards:

```text
lead.status === "new"
booking.status === "pending"
booking.reminderSentAt === null
```

These endpoints are read-only and return compact snapshots for automation checks. Wiro remains the source of truth for the full customer record.

## n8n Actions Back Into Wiro

n8n can perform a small set of guarded actions through:

```bash
curl https://www.wiro4x4indochina.com/api/n8n/actions \
  -H "Content-Type: application/json" \
  -H "X-Wiro-Automation-Secret: $N8N_API_SECRET" \
  -d '{"action":"lead.update","leadId":123,"status":"contacted","notes":"n8n SLA reminder sent"}'
```

Supported actions:

| Action                          | Payload                                                                                                | Use                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `system.ping`                   | optional `client`                                                                                      | Verify the protected n8n action channel without side effects               |
| `lead.update`                   | `leadId`, optional `status`, `notes`, `convertedToBookingId`                                           | Mark contacted, quoted, converted, lost                                    |
| `booking.update`                | `bookingId`, optional `status`, `notes`, `assignedAgentId`, `totalPrice`, `depositPaid`, `balancePaid` | Let an ops workflow update bounded booking fields                          |
| `booking.send_reminder`         | `bookingId`                                                                                            | Send one pre-tour customer reminder email and mark it sent after success   |
| `booking.send_due_reminders`    | optional `limit` from 1 to 10                                                                          | Send due pre-tour reminders for confirmed bookings arriving in 24-48 hours |
| `post_tour_review.schedule`     | `bookingId`, optional `delayMinutes`                                                                   | Schedule a review request from an n8n checklist                            |
| `post_tour_review.process_due`  | none                                                                                                   | Let n8n run the due review queue on schedule                               |
| `abandoned.send_recovery`       | `leadId`                                                                                               | Send one recovery message to an abandoned lead                             |
| `abandoned.send_batch_recovery` | optional `limit` from 1 to 10                                                                          | Send recovery messages to abandoned leads                                  |
| `newsletter.send`               | `blogPostId`, optional `subject`                                                                       | Send a newsletter campaign to active subscribers                           |
| `ops.notify`                    | `title`, `content`, optional `priority`, `resourceType`, `resourceId`, `dedupeKey`, `cooldownMinutes`  | Send a bounded owner notification from n8n through Wiro                    |

If n8n marks a booking as `completed`, Wiro also schedules the post-tour review request. This keeps automation from skipping the normal guest follow-up.

`ops.notify` uses Wiro's owner notification channel. Configure either `OWNER_EMAIL` plus `RESEND_API_KEY`, or `TELEGRAM_BOT_TOKEN` plus `TELEGRAM_CHAT_ID`, before relying on owner alert delivery. Booking reminders and abandoned recovery try customer email first and fall back to WhatsApp when the booking or lead has a phone number. Newsletter sends still require `RESEND_API_KEY`. For recurring workflows, send a stable `dedupeKey` and `cooldownMinutes` so unchanged queues do not alert repeatedly.

## Safety Rules

- n8n is not the source of truth. Wiro remains the source of truth.
- n8n failures must not block booking or lead capture.
- Keep public customer messaging human-approved unless the message is a confirmed template.
- Do not put API keys in workflow node names or sticky notes.
- Use `/api/n8n/actions` only for the bounded actions above. Do not add broad SQL or generic admin execution to n8n.
