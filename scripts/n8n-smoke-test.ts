import { dispatchN8nEvent } from "../server/n8nAutomation";

async function fetchOperationsSnapshot() {
  const siteUrl = process.env.WIRO_SITE_URL || process.env.SITE_URL;
  const secret = process.env.N8N_API_SECRET || process.env.N8N_WEBHOOK_SECRET;
  if (!siteUrl || !secret) {
    console.log(
      "[n8n-smoke] Skipping operations snapshot: set WIRO_SITE_URL or SITE_URL plus N8N_API_SECRET."
    );
    return;
  }

  const url = new URL("/api/n8n/operations-snapshot", siteUrl);
  const response = await fetch(url, {
    headers: { "X-Wiro-Automation-Secret": secret },
  });
  if (!response.ok) {
    throw new Error(
      `Operations snapshot failed: ${response.status} ${await response.text()}`
    );
  }

  const snapshot = (await response.json()) as {
    generatedAt?: string;
    counts?: Record<string, unknown>;
  };
  console.log("[n8n-smoke] Operations snapshot OK", {
    generatedAt: snapshot.generatedAt,
    counts: snapshot.counts,
  });
}

async function pingActionsEndpoint() {
  const siteUrl = process.env.WIRO_SITE_URL || process.env.SITE_URL;
  const secret = process.env.N8N_API_SECRET || process.env.N8N_WEBHOOK_SECRET;
  if (!siteUrl || !secret) {
    console.log(
      "[n8n-smoke] Skipping actions ping: set WIRO_SITE_URL or SITE_URL plus N8N_API_SECRET."
    );
    return;
  }

  const url = new URL("/api/n8n/actions", siteUrl);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Wiro-Automation-Secret": secret,
    },
    body: JSON.stringify({ action: "system.ping", client: "n8n-smoke" }),
  });
  if (!response.ok) {
    throw new Error(
      `Actions ping failed: ${response.status} ${await response.text()}`
    );
  }

  const result = (await response.json()) as {
    success?: boolean;
    pong?: boolean;
  };
  if (!result.success || !result.pong) {
    throw new Error(
      `Actions ping returned unexpected body: ${JSON.stringify(result)}`
    );
  }
  console.log("[n8n-smoke] Actions endpoint OK", result);
}

async function main() {
  const eventResult = await dispatchN8nEvent("lead.created", {
    synthetic: true,
    purpose: "n8n smoke test",
    lead: {
      id: 0,
      name: "n8n Smoke Test",
      email: "smoke-test@example.com",
      source: "smoke_test",
      status: "new",
    },
  });

  if (!eventResult.dispatched) {
    throw new Error(`n8n event dispatch failed: ${eventResult.reason}`);
  }
  console.log("[n8n-smoke] Event dispatch OK", eventResult);

  await fetchOperationsSnapshot();
  await pingActionsEndpoint();
}

main().catch(err => {
  console.error("[n8n-smoke] Failed", err);
  process.exitCode = 1;
});
