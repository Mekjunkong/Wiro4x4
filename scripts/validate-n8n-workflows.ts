import { readFileSync } from "fs";
import { workflowPathByKey } from "./n8n-workflow-manifest";

const routerPath = workflowPathByKey.router;
const dailyPath = workflowPathByKey.daily;
const scheduledActionsPath = workflowPathByKey.scheduledActions;
const leadSlaPath = workflowPathByKey.leadSla;
const bookingReminderSenderPath = workflowPathByKey.bookingReminderSender;
const bookingPrepPath = workflowPathByKey.bookingPrep;
const quoteFollowupPath = workflowPathByKey.quoteFollowup;
const whatsappFailurePath = workflowPathByKey.whatsappFailure;

const expectedEvents = [
  "lead.created",
  "estimate.requested",
  "booking.created",
  "booking.status_changed",
  "booking.completed",
  "review.submitted",
  "review.status_updated",
  "newsletter.subscribed",
  "newsletter.sent",
  "abandoned.recovery_sent",
  "abandoned.batch_recovery_sent",
  "post_tour_review.scheduled",
  "post_tour_review.processed",
  "post_tour_review.event_tracked",
  "whatsapp.status_updated",
  "whatsapp.message_received",
];

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const router = readJson(routerPath);
const daily = readJson(dailyPath);
const scheduledActions = readJson(scheduledActionsPath);
const leadSla = readJson(leadSlaPath);
const bookingReminderSender = readJson(bookingReminderSenderPath);
const bookingPrep = readJson(bookingPrepPath);
const quoteFollowup = readJson(quoteFollowupPath);
const whatsappFailure = readJson(whatsappFailurePath);
const switchNode = router.nodes.find(
  (node: { id?: string }) => node.id === "route-event"
);
const guardNode = router.nodes.find(
  (node: { id?: string }) => node.id === "verify-shared-secret"
);
const unauthorizedNode = router.nodes.find(
  (node: { id?: string }) => node.id === "respond-unauthorized"
);
assert(guardNode, "Router workflow is missing shared-secret guard node");
assert(
  unauthorizedNode,
  "Router workflow is missing unauthorized response node"
);
assert(switchNode, "Router workflow is missing route-event switch node");
assert(
  JSON.stringify(router.connections["Wiro Event Webhook"]?.main?.[0]?.[0]) ===
    JSON.stringify({
      node: "Verify Shared Secret",
      type: "main",
      index: 0,
    }),
  "Router workflow must verify the shared secret before normalizing events"
);
assert(
  router.connections["Verify Shared Secret"]?.main?.[0]?.[0]?.node ===
    "Normalize Wiro Event",
  "Router workflow guard true path must continue to event normalization"
);
assert(
  router.connections["Verify Shared Secret"]?.main?.[1]?.[0]?.node ===
    "Respond Unauthorized",
  "Router workflow guard false path must return unauthorized"
);

const routedEvents = switchNode.parameters.rules.values.map(
  (rule: { outputKey: string }) => rule.outputKey
);
assert(
  JSON.stringify(routedEvents) === JSON.stringify(expectedEvents),
  `Router events do not match emitted events.\nExpected: ${expectedEvents.join(", ")}\nActual: ${routedEvents.join(", ")}`
);
assert(
  router.connections["Route by Event Name"].main.length ===
    expectedEvents.length + 1,
  "Router workflow must have one output per event plus fallback output"
);
assert(
  daily.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.scheduleTrigger"
  ),
  "Daily workflow is missing schedule trigger"
);
assert(
  daily.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.httpRequest"
  ),
  "Daily workflow is missing Wiro snapshot HTTP request"
);
const dailyBodies = daily.nodes
  .map(
    (node: { parameters?: { jsonBody?: string } }) => node.parameters?.jsonBody
  )
  .filter(Boolean)
  .join("\n");
assert(
  dailyBodies.includes("ops.notify"),
  "Daily workflow does not send the owner digest through ops.notify"
);
assert(
  JSON.stringify(daily).includes("coldLeadFollowupsDue"),
  "Daily workflow does not include cold lead follow-up count"
);
assert(
  scheduledActions.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.scheduleTrigger"
  ),
  "Scheduled actions workflow is missing schedule trigger"
);

const scheduledActionBodies = scheduledActions.nodes
  .map(
    (node: { parameters?: { jsonBody?: string } }) => node.parameters?.jsonBody
  )
  .filter(Boolean)
  .join("\n");
assert(
  scheduledActionBodies.includes("post_tour_review.process_due"),
  "Scheduled actions workflow does not process due post-tour review requests"
);
assert(
  scheduledActionBodies.includes("abandoned.send_batch_recovery"),
  "Scheduled actions workflow does not send abandoned recovery batch"
);
assert(
  leadSla.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.scheduleTrigger"
  ),
  "Lead SLA workflow is missing schedule trigger"
);
assert(
  leadSla.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.code"
  ),
  "Lead SLA workflow is missing code node that filters empty SLA queues"
);
const leadSlaBodies = leadSla.nodes
  .map((node: { parameters?: { jsCode?: string; jsonBody?: string } }) =>
    [node.parameters?.jsCode, node.parameters?.jsonBody]
      .filter(Boolean)
      .join("\n")
  )
  .join("\n");
assert(
  leadSlaBodies.includes("leadSlaDue"),
  "Lead SLA workflow does not read leadSlaDue from the operations snapshot"
);
assert(
  leadSlaBodies.includes("ops.notify"),
  "Lead SLA workflow does not notify the owner through ops.notify"
);
assert(
  leadSlaBodies.includes("dedupeKey") &&
    leadSlaBodies.includes("cooldownMinutes"),
  "Lead SLA workflow must use ops.notify dedupe cooldown"
);
assert(
  bookingReminderSender.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.scheduleTrigger"
  ),
  "Booking reminder sender workflow is missing schedule trigger"
);
const bookingReminderSenderBodies = bookingReminderSender.nodes
  .map((node: { parameters?: { jsCode?: string; jsonBody?: string } }) =>
    [node.parameters?.jsCode, node.parameters?.jsonBody]
      .filter(Boolean)
      .join("\n")
  )
  .join("\n");
assert(
  bookingReminderSenderBodies.includes("booking.send_due_reminders"),
  "Booking reminder sender workflow does not call booking.send_due_reminders"
);
assert(
  bookingReminderSenderBodies.includes("ops.notify"),
  "Booking reminder sender workflow does not notify the owner after sending"
);
assert(
  bookingReminderSenderBodies.includes("dedupeKey") &&
    bookingReminderSenderBodies.includes("cooldownMinutes"),
  "Booking reminder sender workflow must use ops.notify dedupe cooldown"
);
assert(
  bookingPrep.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.scheduleTrigger"
  ),
  "Booking prep workflow is missing schedule trigger"
);
assert(
  bookingPrep.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.code"
  ),
  "Booking prep workflow is missing code node that filters empty prep queues"
);
const bookingPrepBodies = bookingPrep.nodes
  .map((node: { parameters?: { jsCode?: string; jsonBody?: string } }) =>
    [node.parameters?.jsCode, node.parameters?.jsonBody]
      .filter(Boolean)
      .join("\n")
  )
  .join("\n");
assert(
  bookingPrepBodies.includes("bookingRemindersDue"),
  "Booking prep workflow does not read bookingRemindersDue from the operations snapshot"
);
assert(
  bookingPrepBodies.includes("ops.notify"),
  "Booking prep workflow does not notify the owner through ops.notify"
);
assert(
  bookingPrepBodies.includes("dedupeKey") &&
    bookingPrepBodies.includes("cooldownMinutes"),
  "Booking prep workflow must use ops.notify dedupe cooldown"
);
assert(
  quoteFollowup.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.scheduleTrigger"
  ),
  "Quote follow-up workflow is missing schedule trigger"
);
assert(
  quoteFollowup.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.code"
  ),
  "Quote follow-up workflow is missing code node that filters empty follow-up queues"
);
const quoteFollowupBodies = quoteFollowup.nodes
  .map((node: { parameters?: { jsCode?: string; jsonBody?: string } }) =>
    [node.parameters?.jsCode, node.parameters?.jsonBody]
      .filter(Boolean)
      .join("\n")
  )
  .join("\n");
assert(
  quoteFollowupBodies.includes("coldLeadFollowupsDue"),
  "Quote follow-up workflow does not read coldLeadFollowupsDue from the operations snapshot"
);
assert(
  quoteFollowupBodies.includes("ops.notify"),
  "Quote follow-up workflow does not notify the owner through ops.notify"
);
assert(
  quoteFollowupBodies.includes("dedupeKey") &&
    quoteFollowupBodies.includes("cooldownMinutes"),
  "Quote follow-up workflow must use ops.notify dedupe cooldown"
);
assert(
  whatsappFailure.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.scheduleTrigger"
  ),
  "WhatsApp failure workflow is missing schedule trigger"
);
assert(
  whatsappFailure.nodes.some(
    (node: { type?: string }) => node.type === "n8n-nodes-base.code"
  ),
  "WhatsApp failure workflow is missing code node that filters empty failure queues"
);
const whatsappFailureBodies = whatsappFailure.nodes
  .map((node: { parameters?: { jsCode?: string; jsonBody?: string } }) =>
    [node.parameters?.jsCode, node.parameters?.jsonBody]
      .filter(Boolean)
      .join("\n")
  )
  .join("\n");
assert(
  whatsappFailureBodies.includes("failedWhatsAppMessages"),
  "WhatsApp failure workflow does not read failedWhatsAppMessages from the operations snapshot"
);
assert(
  whatsappFailureBodies.includes("ops.notify"),
  "WhatsApp failure workflow does not notify the owner through ops.notify"
);
assert(
  whatsappFailureBodies.includes("dedupeKey") &&
    whatsappFailureBodies.includes("cooldownMinutes"),
  "WhatsApp failure workflow must use ops.notify dedupe cooldown"
);

console.log("n8n workflow validation OK", {
  routerEvents: routedEvents.length,
  dailyWorkflow: daily.name,
  scheduledActionsWorkflow: scheduledActions.name,
  leadSlaWorkflow: leadSla.name,
  bookingReminderSenderWorkflow: bookingReminderSender.name,
  bookingPrepWorkflow: bookingPrep.name,
  quoteFollowupWorkflow: quoteFollowup.name,
  whatsappFailureWorkflow: whatsappFailure.name,
});
