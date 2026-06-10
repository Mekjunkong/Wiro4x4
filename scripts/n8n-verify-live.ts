import { readWorkflowExport, workflowPaths } from "./n8n-workflow-manifest";

type WorkflowListItem = {
  id: string;
  name: string;
  active?: boolean;
};

type WorkflowListResponse = {
  data?: WorkflowListItem[];
};

type WorkflowDetail = WorkflowListItem & {
  nodes?: unknown[];
  connections?: Record<string, unknown>;
};

function requiredEnv(key: string) {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function normalizeApiBaseUrl(raw: string) {
  return raw.replace(/\/+$/, "");
}

async function n8nFetch<T>(apiBaseUrl: string, apiKey: string, path: string) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      accept: "application/json",
      "X-N8N-API-KEY": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `GET ${path} failed: ${response.status} ${await response.text()}`
    );
  }

  return (await response.json()) as T;
}

async function main() {
  const apiBaseUrl = normalizeApiBaseUrl(
    requiredEnv("N8N_IMPORT_API_BASE_URL")
  );
  const apiKey = requiredEnv("N8N_IMPORT_API_KEY");
  const list = await n8nFetch<WorkflowListResponse>(
    apiBaseUrl,
    apiKey,
    "/workflows?limit=250"
  );
  const liveByName = new Map((list.data ?? []).map(item => [item.name, item]));
  const failures: string[] = [];

  for (const path of workflowPaths) {
    const local = readWorkflowExport(path);
    const live = liveByName.get(local.name);
    if (!live) {
      failures.push(`${local.name}: missing in n8n`);
      continue;
    }

    const detail = await n8nFetch<WorkflowDetail>(
      apiBaseUrl,
      apiKey,
      `/workflows/${encodeURIComponent(live.id)}`
    );

    if (detail.active !== true && live.active !== true) {
      failures.push(`${local.name}: exists but is not active`);
    }

    if (detail.nodes && detail.nodes.length !== local.nodes.length) {
      failures.push(
        `${local.name}: node count mismatch, local ${local.nodes.length}, live ${detail.nodes.length}`
      );
    }

    const liveConnectionCount = Object.keys(detail.connections ?? {}).length;
    const localConnectionCount = Object.keys(local.connections ?? {}).length;
    if (detail.connections && liveConnectionCount !== localConnectionCount) {
      failures.push(
        `${local.name}: connection count mismatch, local ${localConnectionCount}, live ${liveConnectionCount}`
      );
    }

    console.log("[n8n-verify-live] workflow OK", {
      name: local.name,
      id: live.id,
      active: detail.active ?? live.active ?? null,
    });
  }

  if (failures.length > 0) {
    console.error("[n8n-verify-live] Failed checks:", failures);
    process.exitCode = 1;
    return;
  }

  console.log("[n8n-verify-live] All Wiro workflows are present and active");
}

main().catch(err => {
  console.error("[n8n-verify-live] Failed", err);
  process.exitCode = 1;
});
