import { readFileSync } from "fs";

export const workflowPathByKey = {
  router: "workflows/n8n/wiro-automation-router.json",
  daily: "workflows/n8n/wiro-daily-operations-snapshot.json",
  scheduledActions: "workflows/n8n/wiro-scheduled-actions.json",
  leadSla: "workflows/n8n/wiro-lead-sla-monitor.json",
  bookingReminderSender: "workflows/n8n/wiro-booking-reminder-sender.json",
  bookingPrep: "workflows/n8n/wiro-booking-prep-monitor.json",
  quoteFollowup: "workflows/n8n/wiro-quote-followup-monitor.json",
  whatsappFailure: "workflows/n8n/wiro-whatsapp-failure-monitor.json",
} as const;

export const workflowPaths = Object.values(workflowPathByKey);

export type WorkflowExport = {
  name: string;
  nodes: unknown[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

export function readWorkflowExport(path: string): WorkflowExport {
  return JSON.parse(readFileSync(path, "utf8")) as WorkflowExport;
}

export function readImportableWorkflow(path: string) {
  const workflow = readWorkflowExport(path);
  return {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings ?? {},
  };
}
